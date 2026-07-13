import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { aiDailySummary } from "@/data/mockDashboard";
import type { InsightTone } from "@/types/insight";
import { formatDate } from "@/lib/format";

const toneDot: Record<InsightTone, string> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-brand-blue",
  negative: "bg-red-500",
};

/** Executive AI daily brief with headline, highlights and exception summary. */
export function AiDailyBrief() {
  const s = aiDailySummary;

  return (
    <div className="flex h-full flex-col rounded-xl2 border border-line bg-white shadow-card">
      <div className="flex items-start justify-between gap-4 rounded-t-xl2 bg-gradient-to-r from-brand-navy to-brand-royal px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Icon name="sparkle" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold">AI Daily Brief</p>
            <p className="text-xs text-white/70">{formatDate(s.date)}</p>
          </div>
        </div>
        <Badge tone="success" dot className="bg-white/15 text-white ring-white/20">
          {s.confidence} confidence
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-sm font-medium text-ink">{s.headline}</p>
        <ul className="space-y-2.5">
          {s.highlights.map((h) => (
            <li key={h.id} className="flex gap-3">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneDot[h.tone]}`}
              />
              <span className="text-sm leading-relaxed text-muted">
                {h.text}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-xs text-muted">{s.exceptionsSummary}</p>
          <Button variant="ghost" size="sm" href="/ai-desk">
            Open AI Desk
          </Button>
        </div>
      </div>
    </div>
  );
}
