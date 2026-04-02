import { getDashboardData } from '@/lib/dashboard';
import { DashboardGrid } from '@/components/DashboardGrid';
import { Zap } from 'lucide-react';

export default async function AdminDashboard() {
  const data = await getDashboardData();

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

      <DashboardGrid data={data} />
    </div>
  );
}
