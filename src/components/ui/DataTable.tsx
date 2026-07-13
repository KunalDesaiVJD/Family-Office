import type { ReactNode } from "react";

export type ColumnAlign = "left" | "right" | "center";

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  align?: ColumnAlign;
  /** Custom cell renderer. Receives the cell value and the full row. */
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: readonly T[];
  emptyMessage?: string;
  /** Field used for row identity (defaults to `id`, falls back to index). */
  rowKey?: string;
}

const alignClass: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * Clean executive table. Pass typed row objects and describe columns.
 * For separately-declared columns, annotate with the row type, e.g.
 *   const columns: DataTableColumn<BrokerAccount>[] = [...]
 */
export function DataTable<T extends object = Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "No records to display.",
  rowKey = "id",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted ${
                  alignClass[col.align ?? "left"]
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const record = row as Record<string, unknown>;
              return (
                <tr
                  key={String(record[rowKey] ?? i)}
                  className="border-b border-line/70 transition-colors last:border-0 hover:bg-slate-50/70"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-ink ${
                        alignClass[col.align ?? "left"]
                      } ${col.className ?? ""}`}
                    >
                      {col.render
                        ? col.render(record[col.key], row)
                        : (record[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
