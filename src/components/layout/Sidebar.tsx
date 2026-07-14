"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { Icon } from "@/components/icons";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  // Collapsible groups keep the panel short. Untouched groups follow the route:
  // collapsed unless one of their pages is open.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-sidebar-top via-sidebar-mid to-sidebar-bottom text-sidebar-text shadow-sidebar transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-green text-white shadow-sm">
            <Icon name="shield" size={18} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Family Wealth OS</p>
            <p className="text-[11px] text-sidebar-text/50">
              Wealth Command Centre
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => {
            const hasActiveChild = section.items.some((i) => isActive(pathname, i.href));
            const expanded = section.collapsible
              ? (toggled[section.title] ?? hasActiveChild)
              : true;
            const sectionId = `nav-${section.title.replace(/\s+/g, "-").toLowerCase()}`;

            return (
              <div key={section.title} className="mb-5">
                {section.collapsible ? (
                  <button
                    type="button"
                    onClick={() =>
                      setToggled((prev) => ({ ...prev, [section.title]: !expanded }))
                    }
                    aria-expanded={expanded}
                    aria-controls={sectionId}
                    className="flex w-full items-center justify-between rounded-lg px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text/40 transition-colors hover:text-sidebar-text/70"
                  >
                    <span className="flex items-center gap-2">
                      {section.title}
                      {!expanded && (
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-sidebar-text/60">
                          {section.items.length}
                        </span>
                      )}
                    </span>
                    <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
                      <Icon name="chevronDown" size={14} />
                    </span>
                  </button>
                ) : (
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text/40">
                    {section.title}
                  </p>
                )}

                {expanded && (
                  <ul id={sectionId} className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                              active
                                ? "bg-white/10 font-medium text-white ring-1 ring-inset ring-white/10"
                                : "text-sidebar-text/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span
                              className={
                                active
                                  ? "text-brand-green"
                                  : "text-sidebar-text/50 group-hover:text-sidebar-text"
                              }
                            >
                              <Icon name={item.icon} size={18} />
                            </span>
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Tenant footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-navy text-xs font-semibold text-white ring-1 ring-white/10">
              VJ
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">
                V J Desai Family
              </p>
              <p className="text-[11px] text-sidebar-text/50">
                Family plan · 1 tenant
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
