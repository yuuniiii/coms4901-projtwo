'use client';

import { useState, useEffect } from 'react';
import { DashboardData } from '@/lib/dashboard';
import { DashboardCard } from './DashboardCard';
import { cn } from '@/lib/utils';

interface DashboardGridProps {
  data: DashboardData;
}

export function DashboardGrid({ data }: DashboardGridProps) {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pinned_stats');
    if (stored) {
      try {
        setPinnedIds(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse pinned_stats", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handlePinToggle = (id: string) => {
    const next = pinnedIds.includes(id)
      ? pinnedIds.filter(i => i !== id)
      : [...pinnedIds, id];
    setPinnedIds(next);
    localStorage.setItem('pinned_stats', JSON.stringify(next));
  };

  const cards = [
    {
      id: 'approval-rate',
      title: 'Avg Caption Approval Rate',
      variant: 1 as const,
      content: (
        <div className="flex flex-col gap-1">
          <p className="text-4xl font-black tracking-tighter text-accent-1">
            {data.avgApprovalRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-white/30 font-medium">Total upvotes / Total votes</p>
        </div>
      )
    },
    {
  id: 'activity-stream',
  title: 'Activity Stream',
  variant: 3 as const,
  content: (
    <div className="space-y-2">
      {data.activityStream.length === 0 ? (
        <p className="text-white/30 text-xs italic">No recent vote events</p>
      ) : (
        <ul className="space-y-2">
          {data.activityStream.map((v, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[11px] font-bold text-white/80"
                  title={v.user}
                >
                  {v.user}
                </p>
                <p className="text-[10px] text-white/35">
                  {new Date(v.time).toLocaleString([], {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider",
                  v.voteValue > 0
                    ? "bg-[#DB995A]/15 text-[#DB995A]"
                    : "bg-red-500/15 text-red-300"
                )}
              >
                {v.voteValue > 0 ? "Upvote" : "Downvote"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
},
    {
      id: 'last-gen',
      title: 'Last Generation',
      variant: 1 as const,
      content: (
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-black tracking-tighter text-white">
            {data.lastGenerationDate ? new Date(data.lastGenerationDate).toLocaleDateString() : 'Never'}
          </p>
          <p className="text-[11px] text-white/30 font-medium">Most recent caption creation</p>
        </div>
      )
    },
    {
      id: 'votes-per-caption',
      title: 'Votes per Caption',
      variant: 2 as const,
      content: (
        <div className="flex flex-col gap-1">
          <p className="text-4xl font-black tracking-tighter text-accent-2">
            {data.votesPerCaption.toFixed(2)}
          </p>
          <p className="text-[11px] text-white/30 font-medium">Average engagement per output</p>
        </div>
      )
    },
    {
      id: 'reported-count',
      title: 'Reported Captions',
      variant: 2 as const,
      content: (
        <div className="flex flex-col gap-1">
          <p className="text-4xl font-black tracking-tighter text-white">
            {data.reportedCaptionsCount}
          </p>
          <p className="text-[11px] text-white/30 font-medium">Pending/total reports</p>
        </div>
      )
    },
    {
      id: 'top-flavors',
      title: 'Top Performers (Flavors)',
      variant: 1 as const,
      content: (
        <div className="space-y-4">
          {data.topHumorFlavors.length === 0 ? (
            <p className="text-white/30 text-xs italic">No flavors with &gt; 10 ratings yet</p>
          ) : (
            <div className="space-y-3">
              {data.topHumorFlavors.map((f, i) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-white/60">{f.name}</span>
                    <span className="text-xs font-bold text-accent-1">{f.performance.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-1" 
                      style={{ width: `${f.performance}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'performance-dist',
      title: 'Performance Distribution',
      variant: 3 as const,
      content: (
        <div className="space-y-3 mt-2">
          {data.performanceDistribution.map((d, i) => {
            const max = Math.max(...data.performanceDistribution.map(x => x.count), 1);
            return (
              <div key={d.bucket} className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-12 font-mono">{d.bucket}</span>
                <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-accent-3/50" 
                    style={{ width: `${(d.count / max) * 100}%` }} 
                  />
                  {d.count > 0 && (
                    <span className="text-[8px] font-bold text-white ml-2">{d.count}</span>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-[9px] text-white/20 mt-2 italic text-center uppercase tracking-widest">Caption approval rate buckets</p>
        </div>
      )
    }
  ];

  const pinnedCards = cards.filter(c => pinnedIds.includes(c.id));
  const unpinnedCards = cards.filter(c => !pinnedIds.includes(c.id));

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-50">
        {cards.map((c) => (
          <div key={c.id} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {pinnedCards.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Pinned Stats</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pinnedCards.map(c => (
              <DashboardCard 
                key={c.id}
                id={c.id}
                title={c.title}
                isPinned={true}
                onPinToggle={handlePinToggle}
                variant={c.variant}
              >
                {c.content}
              </DashboardCard>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">All Stats</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {unpinnedCards.map(c => (
            <DashboardCard 
              key={c.id}
              id={c.id}
              title={c.title}
              isPinned={false}
              onPinToggle={handlePinToggle}
              variant={c.variant}
            >
              {c.content}
            </DashboardCard>
          ))}
        </div>
      </section>
    </div>
  );
}
