import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";

interface TopbarProps {
  onMenuClick: () => void;
  tenantName?: string;
  userName?: string;
  userInitials?: string;
}

/**
 * Sticky application top bar. The menu button toggles the sidebar on mobile.
 * Search / notifications are presentational placeholders in this foundation build.
 */
export function Topbar({
  onMenuClick,
  tenantName = "V J Desai Family",
  userName = "Family Principal",
  userInitials = "FP",
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Icon name="dashboard" size={18} />
      </button>

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <Icon name="search" size={16} />
        </span>
        <input
          type="text"
          disabled
          placeholder="Search members, accounts, exceptions…"
          className="h-9 w-full rounded-lg border border-line bg-slate-50 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        {/* Tenant switcher (single tenant today; SaaS-ready) */}
        <button className="hidden items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-ink hover:bg-slate-50 md:flex">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-navy text-[10px] font-semibold text-white">
            VJ
          </span>
          <span className="max-w-[9rem] truncate">{tenantName}</span>
          <Icon name="chevronDown" size={14} className="text-muted" />
        </button>

        {/* Environment badge */}
        <span className="hidden lg:block">
          <Badge tone="info" dot>
            Mock data
          </Badge>
        </span>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink"
          aria-label="Notifications"
        >
          <Icon name="bell" size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-green ring-2 ring-white" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy to-brand-royal text-xs font-semibold text-white">
            {userInitials}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
