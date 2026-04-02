import { createClient } from '@/lib/supabaseServer';
import { StatsCard } from '@/components/StatsCard';
import { Table } from '@/components/Table';
import { Zap, TrendingUp, Users as UsersIcon, Image as ImageIcon } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Most active users (ranked by number of captions submitted)
  const { data: activeUsersRaw } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, captions(count)');

  const activeUsers = (activeUsersRaw || [])
    .map(u => ({
      ...u,
      caption_count: (u.captions as any)?.[0]?.count ?? 0,
    }))
    .sort((a, b) => b.caption_count - a.caption_count)
    .slice(0, 5);

  // 2 & 3. Humor flavors (ranked by average rating)
  const { data: humorData } = await supabase
    .from('humor_flavors')
    .select(`
      description,
      slug,
      captions (
        caption_votes (
          vote_value
        )
      )
    `);

  const humorStats = (humorData || []).map(hf => {
    let totalVotes = 0;
    let sumValue = 0;
    hf.captions.forEach((c: any) => {
      c.caption_votes.forEach((v: any) => {
        totalVotes++;
        sumValue += v.vote_value;
      });
    });
    return {
      slug: hf.slug,
      description: hf.description,
      avg_rating: totalVotes > 0 ? (sumValue / totalVotes).toFixed(2) : 0
    };
  }).sort((a, b) => (b.avg_rating as number) - (a.avg_rating as number));

  // 4. Most popular images (ranked by total caption ratings)
  const { data: imageData } = await supabase
    .from('images')
    .select(`
      id,
      url,
      captions (
        caption_votes (
          vote_value
        )
      )
    `);

  const imageStats = (imageData || []).map(img => {
    let totalRating = 0;
    img.captions.forEach((c: any) => {
      c.caption_votes.forEach((v: any) => {
        totalRating += v.vote_value;
      });
    });
    return {
      id: img.id,
      url: img.url,
      total_rating: totalRating
    };
  }).sort((a, b) => b.total_rating - a.total_rating).slice(0, 5);

  // 5. Most popular image + caption combinations
  const { data: captionComboData } = await supabase
    .from('captions')
    .select(`
      content,
      images (url),
      caption_votes (vote_value)
    `);

  const captionStats = (captionComboData || []).map(c => {
    const totalRating = (c.caption_votes as any[]).reduce((sum, v) => sum + v.vote_value, 0);
    return {
      content: c.content,
      image_url: (c.images as any)?.url,
      rating: totalRating
    };
  }).sort((a, b) => b.rating - a.rating).slice(0, 5);

  // 6. Sidechat popularity correlation
  const { data: sidechatPosts } = await supabase.from('sidechat_posts').select('content, like_count');
  const { data: allCaptions } = await supabase.from('captions').select('content, like_count');

  // Simple correlation calculation (Pearson)
  const calculateCorrelation = (captions: any[], sidechat: any[]) => {
    const pairs: [number, number][] = [];
    captions.forEach(c => {
      const match = sidechat.find(s => s.content === c.content);
      if (match) {
        pairs.push([c.like_count || 0, match.like_count || 0]);
      }
    });

    if (pairs.length < 2) return 0;

    const n = pairs.length;
    const sumX = pairs.reduce((s, p) => s + p[0], 0);
    const sumY = pairs.reduce((s, p) => s + p[1], 0);
    const sumXY = pairs.reduce((s, p) => s + p[0] * p[1], 0);
    const sumX2 = pairs.reduce((s, p) => s + p[0] * p[0], 0);
    const sumY2 = pairs.reduce((s, p) => s + p[1] * p[1], 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : (numerator / denominator).toFixed(4);
  };

  const correlation = calculateCorrelation(allCaptions || [], sidechatPosts || []);

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-1 mb-2">
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">System Overview</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white">
          DASH<span className="text-white/20">BOARD</span>
        </h1>
        <p className="text-white/30 text-sm max-w-2xl font-medium">
          Real-time analytics and content performance metrics across the captioning engine.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Library" 
          value={imageData?.length || 0} 
          subtitle="Processed images"
          variant={1}
        />
        <StatsCard 
          title="Generated Captions" 
          value={allCaptions?.length || 0} 
          subtitle="Total submissions"
          variant={2}
        />
        <StatsCard 
          title="Sentiment Correlation" 
          value={correlation} 
          subtitle="Internal vs Sidechat likes"
          variant={3}
        />
        <StatsCard 
          title="Alpha Flavor" 
          value={humorStats[0]?.slug || 'N/A'} 
          subtitle={`Top rated: ${humorStats[0]?.avg_rating || 0}`}
          variant={1}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Table
          title="Top Performance: Users"
          headers={['Rank', 'Architect', 'Captions']}
          rows={activeUsers.map((u, i) => [
            <span key={i} className="font-bold text-accent-1">#0{i + 1}</span>,
            <div key={i} className="flex flex-col">
              <span className="font-bold text-white">{u.first_name} {u.last_name}</span>
              <span className="text-[10px] text-white/30 lowercase">{u.email}</span>
            </div>,
            <span key={i} className="font-mono bg-white/5 px-2 py-1 rounded text-xs">{u.caption_count}</span>
          ])}
        />

        <Table
          title="Flavor Popularity"
          headers={['Flavor Identifier', 'Performance']}
          rows={humorStats.map((h, i) => [
            <div key={i} className="flex flex-col">
              <span className="font-bold text-white uppercase tracking-wider">{h.slug}</span>
              <span className="text-[10px] text-white/30">{h.description}</span>
            </div>,
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-2" 
                  style={{ width: `${Math.min((parseFloat(h.avg_rating as string) / 5) * 100, 100)}%` }} 
                />
              </div>
              <span className="text-xs font-bold text-accent-2">{h.avg_rating}</span>
            </div>
          ])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Table
          title="High Impact Visuals"
          headers={['Media', 'Engagement Metric']}
          rows={imageStats.map((img, i) => [
            <div key={i} className="flex items-center gap-4">
               <img src={img.url} alt="Image" className="w-14 h-14 object-cover rounded-xl border border-white/10" />
               <span className="text-[10px] text-white/20 font-mono truncate max-w-[150px]">{img.url}</span>
            </div>,
            <div key={i} className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-3" />
              <span className="text-xl font-black text-white">{img.total_rating}</span>
            </div>
          ])}
        />

        <Table
          title="Top Content Combos"
          headers={['Contextual Output', 'Rating']}
          rows={captionStats.map((c, i) => [
            <div key={i} className="flex items-center gap-4 min-w-[300px]">
              <img src={c.image_url} alt="Image" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
              <span className="text-xs text-white/70 leading-relaxed italic">"{c.content}"</span>
            </div>,
            <span key={i} className="font-black text-accent-1 text-lg">{c.rating}</span>
          ])}
        />
      </div>
    </div>
  );
}
