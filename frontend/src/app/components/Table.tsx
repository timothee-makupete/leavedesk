import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: string;
  className?: string;
  hideOnMobile?: boolean;
};

function cellValue<T>(row: T, col: Column<T>) {
  return col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key];
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  empty = "No records found.",
  loading,
}: {
  columns: Column<T>[];
  data: T[];
  empty?: string;
  loading?: boolean;
}) {
  const mobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <>
      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 rounded-md border border-[#E2E8F0] bg-white p-4"
            >
              {mobileColumns.slice(0, 4).map((c) => (
                <div key={c.key} className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="rounded-md border border-[#E2E8F0] bg-white px-4 py-10 text-center text-sm text-slate-500">
            {empty}
          </div>
        ) : (
          data.map((row) => {
            const actionCol = mobileColumns.find((c) => c.key === "actions" || !c.header);
            const fieldCols = mobileColumns.filter((c) => c.key !== "actions" && c.header);

            return (
              <div
                key={row.id}
                className="rounded-md border border-[#E2E8F0] bg-white p-4"
              >
                <div className="space-y-2">
                  {fieldCols.map((c) => {
                    const value = cellValue(row, c);
                    if (value == null || value === "") return null;
                    const stack = c.className?.includes("break-words");
                    return (
                      <div
                        key={c.key}
                        className={stack ? "space-y-1 text-sm" : "flex justify-between gap-3 text-sm"}
                      >
                        <span className="text-slate-500">{c.header}</span>
                        <span
                          className={
                            stack
                              ? `text-slate-700 ${c.className || ""}`
                              : `min-w-0 text-right text-slate-700 ${c.className || ""}`
                          }
                        >
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {actionCol && cellValue(row, actionCol) ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E2E8F0] pt-3">
                    {cellValue(row, actionCol)}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-[#E2E8F0] md:block">
        <table className="min-w-[640px] w-full divide-y divide-[#E2E8F0] text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${c.className || ""}`}
                  style={{ width: c.width }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-2.5 text-slate-700 ${c.className || ""}`}
                    >
                      {cellValue(row, c)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
