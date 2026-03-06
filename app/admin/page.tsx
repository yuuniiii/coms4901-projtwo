import { createClient } from '@/lib/supabaseServer';
import { StatsCard } from '@/components/StatsCard';
import { Table } from '@/components/Table';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Most active users (ranked by number of captions submitted)
  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, captions(count)')
    .order('captions(count)', { ascending: false })
    .limit(5);

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
    // Match by content (simplification)
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
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Images" 
          value={imageData?.length || 0} 
        />
        <StatsCard 
          title="Total Captions" 
          value={allCaptions?.length || 0} 
        />
        <StatsCard 
          title="Sidechat Correlation" 
          value={correlation} 
          subtitle="Caption likes vs Sidechat likes"
        />
        <StatsCard 
          title="Top Flavor" 
          value={humorStats[0]?.slug || 'N/A'} 
          subtitle={`Avg Rating: ${humorStats[0]?.avg_rating || 0}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Table
          title="Most Active Users"
          headers={['User', 'Email', 'Captions']}
          rows={(activeUsers || []).map(u => [
            `${u.first_name} ${u.last_name}`,
            u.email,
            (u.captions as any)[0]?.count
          ])}
        />

        <Table
          title="Humor Flavor Rankings"
          headers={['Flavor', 'Slug', 'Avg Rating']}
          rows={humorStats.map(h => [
            h.description,
            h.slug,
            h.avg_rating
          ])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Table
          title="Most Popular Images"
          headers={['Image', 'URL', 'Total Rating']}
          rows={imageStats.map(img => [
            <img key={img.id} src={img.url} alt="Image" className="w-12 h-12 object-cover rounded" />,
            <span key={img.id} className="truncate max-w-xs block">{img.url}</span>,
            img.total_rating
          ])}
        />

        <Table
          title="Top Caption + Image Combos"
          headers={['Caption', 'Image', 'Rating']}
          rows={captionStats.map((c, i) => [
            <span key={i} className="whitespace-normal min-w-[200px] block">{c.content}</span>,
            <img key={i} src={c.image_url} alt="Image" className="w-12 h-12 object-cover rounded" />,
            c.rating
          ])}
        />
      </div>
    </div>
  );
}
