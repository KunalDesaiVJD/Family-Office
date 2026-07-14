// Dashboard intelligence types: module readiness.
// There is intentionally no AI type (AiDailySummary / AiInsight / AiResponse) —
// the AI Desk module is out of scope for the current version.

import type { IconName } from "@/components/icons";

export type ModuleReadinessStatus = "live" | "beta" | "planned" | "syncing";

export interface ModuleReadinessItem {
  key: string;
  title: string;
  description: string;
  status: ModuleReadinessStatus;
  href: string;
  meta: string;
  icon: IconName;
  /** Build completeness, 0–100. */
  progress: number;
}

/** Tone used by exception / highlight rows across the dashboard. */
export type InsightTone = "positive" | "warning" | "info" | "negative";
