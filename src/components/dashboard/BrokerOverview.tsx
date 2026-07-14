import { Badge } from "@/components/ui";
import { brokerAccounts } from "@/data/mockBrokerAccounts";
import { connectionTone, connectionLabel } from "@/lib/status";
import { formatCompactINR, maskClientCode } from "@/lib/format";

/** Compact broker account overview with connection health. */
export function BrokerOverview() {
  const accounts = [...brokerAccounts].sort(
    (a, b) => b.equityValue - a.equityValue,
  );
  const connected = accounts.filter(
    (a) => a.connectionStatus === "connected",
  ).length;
  const attention = accounts.filter(
    (a) => a.pendingAuth || a.connectionStatus === "error",
  ).length;

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-line px-6 py-3 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {connected} connected
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {attention} need attention
        </span>
        <span className="ml-auto text-muted">
          {accounts.length} accounts
        </span>
      </div>
      <ul className="divide-y divide-line">
        {accounts.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 px-6 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {a.ownerName}
              </p>
              <p className="text-xs text-muted">
                {a.broker} · {maskClientCode(a.clientCode)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink tabular-nums">
                {formatCompactINR(a.equityValue)}
              </span>
              <span className="w-28 text-right">
                <Badge tone={connectionTone[a.connectionStatus]} dot>
                  {connectionLabel[a.connectionStatus]}
                </Badge>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
