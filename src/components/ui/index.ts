// Barrel export for UI primitives — import once, e.g.
// import { PageHeader, MetricCard, Card, DataTable } from "@/components/ui";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";

export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { MetricCard } from "./MetricCard";
export type {
  MetricCardProps,
  MetricTone,
  DeltaDirection,
} from "./MetricCard";

export { ModuleCard } from "./ModuleCard";
export type { ModuleCardProps, ModuleStatus } from "./ModuleCard";

export { PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

export { DataTable } from "./DataTable";
export type {
  DataTableProps,
  DataTableColumn,
  ColumnAlign,
} from "./DataTable";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";
