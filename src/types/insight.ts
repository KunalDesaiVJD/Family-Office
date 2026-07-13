// Dashboard intelligence types: module readiness + AI daily brief.

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

export type InsightTone = "positive" | "warning" | "info" | "negative";

export interface AiHighlight {
  id: string;
  tone: InsightTone;
  text: string;
}

export interface AiDailySummary {
  date: string;
  headline: string;
  highlights: AiHighlight[];
  exceptionsSummary: string;
  confidence: "high" | "medium" | "low";
}
