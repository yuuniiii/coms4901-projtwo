import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  limit: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalCount, limit, baseUrl }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / limit);
  if (totalPages <= 1) return null;

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return (
    <div className="flex items-center justify-between pt-8 border-t border-white/5">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        Page <span className="text-white/60">{currentPage}</span> of <span className="text-white/60">{totalPages}</span>
        <span className="ml-4 text-white/10">({totalCount} Total Records)</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Link
          href={hasPrev ? `${baseUrl}?page=${currentPage - 1}` : '#'}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            hasPrev 
              ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white" 
              : "opacity-20 cursor-not-allowed text-white/20"
          )}
          aria-disabled={!hasPrev}
        >
          <ChevronLeft className="w-3 h-3" />
          Previous
        </Link>
        
        <Link
          href={hasNext ? `${baseUrl}?page=${currentPage + 1}` : '#'}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            hasNext 
              ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white" 
              : "opacity-20 cursor-not-allowed text-white/20"
          )}
          aria-disabled={!hasNext}
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
