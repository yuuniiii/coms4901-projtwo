import { cn } from "@/lib/utils";

interface TableProps {
  title?: string;
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
}

export function Table({ title, headers, rows }: TableProps) {
  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
      {title && (
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-[0.1em]">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/5">
              {headers.map((header, i) => (
                <th key={i} className="px-8 py-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                {row.map((cell, j) => (
                  <td key={j} className="px-8 py-5 text-sm text-white/70 group-hover:text-white transition-colors">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-8 py-12 text-center text-sm text-white/20 italic">
                  No records found in current view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
