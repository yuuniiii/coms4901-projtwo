'use client';

import { cn } from "@/lib/utils";
import { Pin, PinOff } from 'lucide-react';

interface DashboardCardProps {
  id: string;
  title: string;
  isPinned: boolean;
  onPinToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 1 | 2 | 3;
}

export function DashboardCard({ 
  id, 
  title, 
  isPinned, 
  onPinToggle, 
  children, 
  className,
  variant = 1 
}: DashboardCardProps) {
  const gradientClass = variant === 1 ? 'card-gradient-1 border-accent-1/20' : 
                        variant === 2 ? 'card-gradient-2 border-accent-2/20' : 
                        'card-gradient-3 border-accent-3/20';

  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all duration-300 relative group h-full flex flex-col",
      gradientClass,
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{title}</h3>
        <button 
          onClick={() => onPinToggle(id)}
          className="text-white/20 hover:text-white transition-colors"
          title={isPinned ? "Unpin" : "Pin"}
        >
          {isPinned ? <PinOff size={14} className="fill-current" /> : <Pin size={14} />}
        </button>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
