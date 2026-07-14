"use client";

import { useState } from "react";
import { Card, Badge, Button, type BadgeTone } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  maskClientCode,
  formatCompactINR,
  formatDateTime,
  formatNumber,
} from "@/lib/format";
import type {
  AngelAccount,
  AngelSyncRun,
  AuthStatus,
  AccountSyncStatus,
} from "@/types/angel";

export const authBadge: Record<AuthStatus, { tone: BadgeTone; label: string }> = {
  authenticated: { tone: "success", label: "Authenticated" },
  auth_required: { tone: "warning", label: "Re-auth required" },
  expired: { tone: "danger", label: "Expired" },
  not_linked: { tone: "neutral", label: "Not linked" },
};

export const syncBadge: Record<AccountSyncStatus, { tone: BadgeTone; label: string }> = {
  synced: { tone: "success", label: "Synced" },
  syncing: { tone: "info", label: "Syncing" },
  error: { tone: "danger", label: "Failed" },
  never: { tone: "neutral", label: "Never" },
};

export function AccountsTab({
  accounts,
  syncRun,
}: {
  accounts: AngelAccount[];
  syncRun: AngelSyncRun;
}) {
  const [message, setMessage] = useState<string | null>(null);

  const syncOne = (name: string) =>
    setMessage(
      `Sync requested for ${name}. This is a placeholder — the live Angel One connector is not configured, so no data was fetched.`,
    );
  const syncAll = () =>
    setMessage(
      "Sync all requested. This is a placeholder — no live Angel One call was made.",
    );

  const runTone: BadgeTone =
    syncRun.status === "success"
      ? "success"
      : syncRun.status === "partial"
        ? "warning"
        : "danger";

  return (
    <div className="space-y-6">
      {/* Header + sync all */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Angel One Accounts</h3>
          <p className="text-sm text-muted">
            Family member → Angel client-code mapping. {accounts.length} accounts
            configured.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Icon name="sync" size={16} />}
          onClick={syncAll}
        >
          Sync all accounts
        </Button>
      </div>

      {/* Last run (partial failure) summary */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl2 border border-line bg-slate-50/60 px-4 py-3">
        <Badge tone={runTone} dot>
          {syncRun.status === "partial" ? "Partial" : syncRun.status === "success" ? "Success" : "Failed"}
        </Badge>
        <span className="text-sm text-ink">
          {syncRun.succeeded} of {syncRun.total} accounts synced
          {syncRun.failed > 0 ? `, ${syncRun.failed} failed` : ""}
        </span>
        <span className="ml-auto text-xs text-muted">
          Last run {formatDateTime(syncRun.finishedAt)}
        </span>
      </div>

      {/* Placeholder action message */}
      {message && (
        <div className="flex items-start gap-3 rounded-xl2 border border-blue-100 bg-blue-50/60 px-4 py-3">
          <span className="mt-0.5 shrink-0 text-brand-blue">
            <Icon name="sparkle" size={18} />
          </span>
          <p className="text-sm text-muted">{message}</p>
        </div>
      )}

      {/* Account cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ink">
                    {a.memberName}
                  </p>
                  <Badge tone="brand">{a.relationship}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {a.broker} ·{" "}
                  <span className="tabular-nums">{maskClientCode(a.clientCode)}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Icon name="sync" size={14} />}
                onClick={() => syncOne(a.memberName)}
              >
                Sync
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={authBadge[a.authStatus].tone} dot>
                {authBadge[a.authStatus].label}
              </Badge>
              <Badge tone={syncBadge[a.syncStatus].tone} dot>
                {syncBadge[a.syncStatus].label}
              </Badge>
              <span className="text-xs text-muted">
                {a.lastSyncedAt ? `Last synced ${formatDateTime(a.lastSyncedAt)}` : "Never synced"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3">
              <div>
                <p className="text-xs text-muted">Holdings</p>
                <p className="text-sm font-medium text-ink">
                  {formatNumber(a.summary.holdingsCount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Value</p>
                <p className="text-sm font-medium text-ink tabular-nums">
                  {formatCompactINR(a.summary.holdingsValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Available cash</p>
                <p className="text-sm font-medium text-ink tabular-nums">
                  {formatCompactINR(a.summary.availableCash)}
                </p>
              </div>
            </div>

            {a.error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
                <span className="mt-0.5 shrink-0 text-red-600">
                  <Icon name="alert" size={14} />
                </span>
                <p className="text-xs text-red-700">{a.error}</p>
              </div>
            )}
          </Card>
        ))}

        {/* Add account placeholder */}
        <button
          onClick={() =>
            setMessage(
              "Linking another Angel One account is a placeholder — account configuration will be enabled once live credentials are provisioned.",
            )
          }
          className="flex min-h-[9rem] flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-slate-50/40 p-5 text-center transition-colors hover:border-brand-blue/40 hover:bg-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-blue shadow-card">
            <Icon name="plus" size={20} />
          </span>
          <p className="mt-2 text-sm font-medium text-ink">Add Angel account</p>
          <p className="text-xs text-muted">Link another family member</p>
        </button>
      </div>
    </div>
  );
}
