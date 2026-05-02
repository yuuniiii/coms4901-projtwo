import { createClient } from './supabaseServer';

export type DashboardData = {
  avgApprovalRate: number;
  activityStream: { time: string; user: string; voteValue: number }[];
  lastGenerationDate: string | null;
  votesPerCaption: number;
  reportedCaptionsCount: number;
  topHumorFlavors: { name: string; performance: number }[];
  performanceDistribution: { bucket: string; count: number }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  // 1. Speeding users (<= 1s between any two votes in past week)
  const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const { data: recentVotes, error: recentVotesError } = await supabase
  .from("caption_votes")
  .select("profile_id, modified_datetime_utc")
  .gt("modified_datetime_utc", oneWeekAgo.toISOString())
  .order("modified_datetime_utc", { ascending: true });

if (recentVotesError) {
  console.error("Speeding users query failed:", recentVotesError);
}

const speedingUserIds = new Set<string>();
const lastVoteTimeByUser = new Map<string, number>();

recentVotes?.forEach((vote) => {
  if (!vote.profile_id || !vote.modified_datetime_utc) return;

  const userId = vote.profile_id;
  const voteTime = new Date(vote.modified_datetime_utc).getTime();
  const lastTime = lastVoteTimeByUser.get(userId);

  if (lastTime !== undefined && voteTime - lastTime <= 1000) {
    speedingUserIds.add(userId);
  }

  lastVoteTimeByUser.set(userId, voteTime);
});

  // 2. Average caption approval rate (total upvotes / total votes)
  // Assuming vote_value > 0 is an upvote. 
  const { data: voteCounts } = await supabase
    .from('caption_votes')
    .select('vote_value');
  
  const totalVotes = voteCounts?.length || 0;
  const totalUpvotes = voteCounts?.filter(v => v.vote_value > 0).length || 0;
  const avgApprovalRate = totalVotes > 0 ? (totalUpvotes / totalVotes) * 100 : 0;

  // 3. Activity stream (last 10 individual votes)
const { data: latestVotes, error: latestVotesError } = await supabase
  .from("caption_votes")
  .select("created_datetime_utc, vote_value, profile_id")
  .order("created_datetime_utc", { ascending: false })
  .limit(10);

if (latestVotesError) {
  console.error("Activity stream query failed:", latestVotesError);
}

const activityStream = (latestVotes || []).map((v) => ({
  time: v.created_datetime_utc,
  user: v.profile_id ? String(v.profile_id).slice(0, 8) : "Unknown",
  voteValue: v.vote_value,
}));

  // 4. Most recent day of caption generation
  const { data: lastCaption } = await supabase
    .from('captions')
    .select('created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })
    .limit(1)
    .single();
  
  const lastGenerationDate = lastCaption?.created_datetime_utc || null;

  // 5. Votes per caption
  const { count: captionCount } = await supabase
    .from('captions')
    .select('*', { count: 'exact', head: true });
  
  const votesPerCaption = captionCount && captionCount > 0 ? totalVotes / captionCount : 0;

  // 6. Number of reported captions
  const { count: reportedCount } = await supabase
    .from('reported_captions')
    .select('*', { count: 'exact', head: true });
  
  const reportedCaptionsCount = reportedCount || 0;

  // --- QUERIES 7 & 8: REFACTORED TO AVOID NESTED TRUNCATION ---

  // Reusable pagination helper that fetches all rows in batches of 1000
  const fetchAll = async (table: string, columns: string) => {
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    const all: any[] = [];
    const batchSize = 1000;
    const pages = Math.ceil((count || 0) / batchSize);
    
    // Process in batches of 10 parallel requests to be efficient but not "excessive"
    const concurrency = 10;
    for (let i = 0; i < pages; i += concurrency) {
      const pagePromises = [];
      for (let j = i; j < i + concurrency && j < pages; j++) {
        pagePromises.push(
          supabase
            .from(table)
            .select(columns)
            .range(j * batchSize, (j + 1) * batchSize - 1)
        );
      }
      const results = await Promise.all(pagePromises);
      for (const res of results) {
        if (res.error) throw res.error;
        if (res.data) all.push(...res.data);
      }
    }
    return all;
  };

  // Fetch all necessary data for both queries independently
  // This avoids the 1000-row limit on nested relations
  const [allFlavors, allCaptions, allVotes] = await Promise.all([
    fetchAll('humor_flavors', 'id, slug'),
    fetchAll('captions', 'id, humor_flavor_id'),
    fetchAll('caption_votes', 'caption_id, vote_value')
  ]);

  // Map for quick caption -> flavor lookup
  const captionToFlavorMap = new Map<string, string>();
  allCaptions.forEach(c => captionToFlavorMap.set(c.id, c.humor_flavor_id));

  // Accumulators for performance metrics
  // captionId -> { total: number, upvotes: number }
  const captionStats = new Map<string, { total: number, upvotes: number }>();
  // flavorId -> { total: number, upvotes: number }
  const flavorStats = new Map<string, { total: number, upvotes: number }>();

  allVotes.forEach(v => {
    // Update individual caption stats (for Query 8)
    const cStat = captionStats.get(v.caption_id) || { total: 0, upvotes: 0 };
    cStat.total++;
    if (v.vote_value > 0) cStat.upvotes++;
    captionStats.set(v.caption_id, cStat);

    // Update flavor-wide stats (for Query 7)
    const flavorId = captionToFlavorMap.get(v.caption_id);
    if (flavorId) {
      const fStat = flavorStats.get(flavorId) || { total: 0, upvotes: 0 };
      fStat.total++;
      if (v.vote_value > 0) fStat.upvotes++;
      flavorStats.set(flavorId, fStat);
    }
  });

  // Query 7: Top 5 humor flavors by performance
  const humorPerformances = allFlavors
    .map(f => {
      const stats = flavorStats.get(f.id);
      // Threshold: only include flavors with more than 10 total votes
      if (!stats || stats.total <= 10) return null; 
      return {
        name: f.slug,
        performance: (stats.upvotes / stats.total) * 100
      };
    })
    .filter((f): f is { name: string; performance: number } => f !== null)
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 10);

  // Query 8: Caption performance distribution
  const distribution = [
    { bucket: '0–20%', count: 0 },
    { bucket: '20–40%', count: 0 },
    { bucket: '40–60%', count: 0 },
    { bucket: '60–80%', count: 0 },
    { bucket: '80–100%', count: 0 },
  ];

  captionStats.forEach(stats => {
    if (stats.total === 0) return;
    const rate = (stats.upvotes / stats.total) * 100;

    if (rate <= 20) distribution[0].count++;
    else if (rate <= 40) distribution[1].count++;
    else if (rate <= 60) distribution[2].count++;
    else if (rate <= 80) distribution[3].count++;
    else distribution[4].count++;
  });

  return {
    avgApprovalRate,
    activityStream,
    lastGenerationDate,
    votesPerCaption,
    reportedCaptionsCount,
    topHumorFlavors: humorPerformances,
    performanceDistribution: distribution
  };
}
