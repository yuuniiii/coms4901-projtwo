interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 flex flex-col gap-2">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-zinc-900">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
    </div>
  );
}
