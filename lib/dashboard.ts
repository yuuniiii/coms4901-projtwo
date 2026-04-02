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

  // 7. Top 5 humor flavors with highest performance (> 10 captions rated)
  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select(`
      slug,
      captions (
        id,
        caption_votes (vote_value)
      )
    `);

  const humorPerformances = (flavors || []).map(f => {
    const captionsWithVotes = f.captions.filter((c: any) => c.caption_votes.length > 0);
    if (captionsWithVotes.length <= 10) return null;

    let flavorTotalVotes = 0;
    let flavorUpvotes = 0;
    f.captions.forEach((c: any) => {
      c.caption_votes.forEach((v: any) => {
        flavorTotalVotes++;
        if (v.vote_value > 0) flavorUpvotes++;
      });
    });

    return {
      name: f.slug,
      performance: flavorTotalVotes > 0 ? (flavorUpvotes / flavorTotalVotes) * 100 : 0
    };
  })
  .filter((f): f is { name: string; performance: number } => f !== null)
  .sort((a, b) => b.performance - a.performance)
  .slice(0, 5);

  // 8. Caption performance distribution
  const { data: captionsWithVotes } = await supabase
    .from('captions')
    .select(`
      id,
      caption_votes (vote_value)
    `);

  const distribution = [
    { bucket: '0–20%', count: 0 },
    { bucket: '20–40%', count: 0 },
    { bucket: '40–60%', count: 0 },
    { bucket: '60–80%', count: 0 },
    { bucket: '80–100%', count: 0 },
  ];

  captionsWithVotes?.forEach((c: any) => {
    if (c.caption_votes.length === 0) return;
    const upvotes = c.caption_votes.filter((v: any) => v.vote_value > 0).length;
    const rate = (upvotes / c.caption_votes.length) * 100;

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
