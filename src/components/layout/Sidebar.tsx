import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { routeSections } from "@/routes/app";

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-sidebar transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center gap-2.5 px-3 py-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-white">SS</span>
          </div>
          {!collapsed && (
            <span className="truncate text-base font-semibold tracking-tight text-sidebar-foreground">
              Stepping Stone
            </span>
          )}
        </div>
      </div>

      <nav
        className="flex-1 space-y-5 overflow-y-auto px-2 pb-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "hsl(222 47% 16%) hsl(222 47% 11%)",
        }}
      >
        {routeSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-widest text-sidebar-foreground/40">
                {section.label}
              </p>
            )}
            {collapsed && <div className="my-1 border-t border-sidebar-border/40" />}
            <ul className="space-y-0.5">
              {section.routes.map((route) => (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    title={collapsed ? route.title : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                        collapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-sidebar-primary text-white"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <route.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && route.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-2 py-4">
        <div className={`flex items-center gap-2.5 px-1 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
            JH
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-sidebar-foreground">
                  Jean-Pierre Habimana
                </p>
                <p className="text-[10px] text-sidebar-foreground/50">Operations</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/50" />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggle}
          className={`mt-3 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
