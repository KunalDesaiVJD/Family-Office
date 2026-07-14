"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  EmptyState,
  type BadgeTone,
} from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import {
  formatINR,
  formatCompactINR,
  formatNumber,
  formatDate,
  formatDateTime,
} from "@/lib/format";

/* ---------------------------------------------------------------------------
 * A generic, reusable master-data management screen: enterprise header,
 * search + filters, an Add placeholder, a clickable table, status badges,
 * an empty state and a detail drawer. Driven entirely by a serializable spec
 * so it can be configured from server components (no functions cross the
 * server/client boundary).
 * ------------------------------------------------------------------------- */

export type MasterCellType =
  | "text"
  | "strong"
  | "muted"
  | "mono"
  | "currency"
  | "compactCurrency"
  | "number"
  | "date"
  | "datetime"
  | "badge";

export interface MasterBadgeSpec {
  tone: BadgeTone;
  label: string;
  dot?: boolean;
}

export interface MasterColumn {
  key: string;
  header: string;
  type?: MasterCellType;
  align?: "left" | "right" | "center";
  badgeMap?: Record<string, MasterBadgeSpec>;
}

export interface MasterFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface MasterDetailField {
  key: string;
  label: string;
  type?: MasterCellType;
  badgeMap?: Record<string, MasterBadgeSpec>;
}

export type MasterRow = Record<string, unknown>;

export interface MasterDataManagerProps {
  eyebrow: string;
  title: string;
  description: string;
  rows: MasterRow[];
  columns: MasterColumn[];
  searchKeys: string[];
  detailFields: MasterDetailField[];
  filters?: MasterFilter[];
  idKey?: string;
  titleKey: string;
  subtitleKey?: string;
  addLabel: string;
  /** Singular noun, e.g. "family member". */
  entityLabel: string;
  searchPlaceholder?: string;
}

const alignClass: Record<"left" | "right" | "center", string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function renderValue(
  value: unknown,
  type: MasterCellType = "text",
  badgeMap?: Record<string, MasterBadgeSpec>,
): ReactNode {
  if (type === "badge") {
    const key = String(value ?? "");
    const spec = badgeMap?.[key] ?? { tone: "neutral" as BadgeTone, label: key };
    return (
      <Badge tone={spec.tone} dot={spec.dot ?? true}>
        {spec.label}
      </Badge>
    );
  }
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted">—</span>;
  }
  switch (type) {
    case "currency":
      return <span className="tabular-nums text-ink">{formatINR(Number(value))}</span>;
    case "compactCurrency":
      return (
        <span className="tabular-nums text-ink">
          {formatCompactINR(Number(value))}
        </span>
      );
    case "number":
      return <span className="tabular-nums text-ink">{formatNumber(Number(value))}</span>;
    case "date":
      return <span className="tabular-nums text-muted">{formatDate(String(value))}</span>;
    case "datetime":
      return (
        <span className="tabular-nums text-muted">{formatDateTime(String(value))}</span>
      );
    case "mono":
      return <span className="tabular-nums text-muted">{String(value)}</span>;
    case "muted":
      return <span className="text-muted">{String(value)}</span>;
    case "strong":
      return <span className="font-medium text-ink">{String(value)}</span>;
    default:
      return <span className="text-ink">{String(value)}</span>;
  }
}

export function MasterDataManager({
  eyebrow,
  title,
  description,
  rows,
  columns,
  searchKeys,
  detailFields,
  filters = [],
  idKey = "id",
  titleKey,
  subtitleKey,
  addLabel,
  entityLabel,
  searchPlaceholder,
}: MasterDataManagerProps) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<MasterRow | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q) {
        const haystack = searchKeys
          .map((k) => String(row[k] ?? ""))
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      for (const f of filters) {
        const val = filterValues[f.key];
        if (val && String(row[f.key] ?? "") !== val) return false;
      }
      return true;
    });
  }, [rows, query, filterValues, filters, searchKeys]);

  const closeDrawer = () => {
    setSelected(null);
    setCreating(false);
  };

  const drawerOpen = selected !== null || creating;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon name="download" size={16} />}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="plus" size={16} />}
              onClick={() => {
                setSelected(null);
                setCreating(true);
              }}
            >
              {addLabel}
            </Button>
          </>
        }
      />

      <Card padded={false}>
        {/* Toolbar: search + filters + count */}
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder ?? `Search ${entityLabel}s…`}
              className="h-9 w-full rounded-lg border border-line bg-slate-50 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-brand-blue/40 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <select
                key={f.key}
                value={filterValues[f.key] ?? ""}
                onChange={(e) =>
                  setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand-blue/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20"
                aria-label={`Filter by ${f.label}`}
              >
                <option value="">All {f.label}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ))}
          </div>

          <span className="text-xs text-muted lg:ml-auto">
            {filtered.length} of {rows.length}
          </span>
        </div>

        {/* Table or empty state */}
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Icon name="search" size={22} />}
              title={`No ${entityLabel}s match your filters`}
              description="Try adjusting the search term or clearing the active filters to see more records."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setFilterValues({});
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
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
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={String(row[idKey] ?? i)}
                    onClick={() => {
                      setCreating(false);
                      setSelected(row);
                    }}
                    className="cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${alignClass[col.align ?? "left"]}`}
                      >
                        {renderValue(row[col.key], col.type, col.badgeMap)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right text-muted">
                      <Icon name="chevronRight" size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-soft">
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-blue">
                  {creating ? `New ${entityLabel}` : entityLabel}
                </p>
                <h2 className="mt-1 truncate text-lg font-semibold text-ink">
                  {creating
                    ? `Add ${entityLabel}`
                    : String(selected?.[titleKey] ?? "")}
                </h2>
                {!creating && subtitleKey && (
                  <p className="text-sm text-muted">
                    {String(selected?.[subtitleKey] ?? "")}
                  </p>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink"
                aria-label="Close"
              >
                <Icon name="plus" size={18} className="rotate-45" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {creating ? (
                <div className="space-y-4">
                  <div className="rounded-xl2 border border-dashed border-line bg-slate-50/60 p-6 text-center">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-blue shadow-card">
                      <Icon name="plus" size={20} />
                    </span>
                    <p className="mt-3 text-sm font-medium text-ink">
                      Create a new {entityLabel}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Record creation is a placeholder in this prototype. The
                      master-data form and persistence layer are not yet connected —
                      records are mock data only.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={closeDrawer}>
                      Cancel
                    </Button>
                    <Button variant="secondary" size="sm" disabled>
                      Save (disabled)
                    </Button>
                  </div>
                </div>
              ) : (
                <dl className="divide-y divide-line">
                  {detailFields.map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-3 gap-3 py-3 first:pt-0"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                        {field.label}
                      </dt>
                      <dd className="col-span-2 text-sm">
                        {renderValue(
                          selected?.[field.key],
                          field.type,
                          field.badgeMap,
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {!creating && (
              <footer className="border-t border-line px-6 py-4">
                <p className="text-xs text-muted">
                  Editing and audit history are placeholders in this prototype.
                </p>
              </footer>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
