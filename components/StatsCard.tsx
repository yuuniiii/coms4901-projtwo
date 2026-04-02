import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 1 | 2 | 3;
}

export function StatsCard({ title, value, subtitle, variant = 1 }: StatsCardProps) {
  const gradientClass = variant === 1 ? 'card-gradient-1 border-accent-1/20' : 
                        variant === 2 ? 'card-gradient-2 border-accent-2/20' : 
                        'card-gradient-3 border-accent-3/20';
  
  const textAccentClass = variant === 1 ? 'text-accent-1' : 
                          variant === 2 ? 'text-accent-2' : 
                          'text-accent-3';

  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02]",
      gradientClass
    )}>
      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">{title}</h3>
      <div className="flex flex-col gap-1">
        <p className={cn("text-3xl font-black tracking-tighter", textAccentClass)}>
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] text-white/30 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
