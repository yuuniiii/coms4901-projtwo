interface TableProps {
  title?: string;
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
}

export function Table({ title, headers, rows }: TableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {headers.map((header, i) => (
                <th key={i} className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-4 text-sm text-zinc-700 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8 text-center text-sm text-zinc-400 italic">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
