export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-border-light">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-soft-green font-heading text-text-dark">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-5 py-4">
                {column}
              </th>
            ))}
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-t border-border-light">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-5 py-4 text-muted">
                  {index === 0 ? (
                    <span className="font-heading font-semibold text-text-dark">
                      {cell}
                    </span>
                  ) : index === row.length - 1 ? (
                    <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold text-primary">
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
              <td className="px-5 py-4">
                <button
                  type="button"
                  className="rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
