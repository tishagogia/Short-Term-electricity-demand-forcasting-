"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Compass,
  History,
  Radio,
  Zap,
  Layers,
  X,
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/",
      icon: Activity,
      description: "Grid status & horizon summary",
    },
    {
      label: "Demand Forecast",
      href: "/forecast",
      icon: Zap,
      description: "Primary horizon projections",
      isPrimary: true,
    },
    {
      label: "Demand Insights",
      href: "/insights",
      icon: Compass,
      description: "Peak windows & ramp dynamics",
    },
    {
      label: "Historical Demand",
      href: "/historical",
      icon: History,
      description: "Baseline records & load factors",
    },
  ];

  return (
    <aside className="w-72 bg-[#0B1528] text-slate-200 flex flex-col h-full border-r border-slate-800/80 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white">
            <Zap className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                GridCast
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                IN-GRID
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Electricity Demand Forecasting
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-6 flex-1 overflow-y-auto space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Operator Console
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-start gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-150 group relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/50 font-medium"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800/80 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-wide">
                    {item.label}
                  </span>
                  {item.isPrimary && !isActive && (
                    <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                      Core
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 truncate ${
                    isActive ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-3 bg-slate-900/90 rounded-xl border border-slate-800/90 space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            Mode
          </span>
          <span className="font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 text-[11px]">
            Demonstration
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Target Region</span>
          <span className="font-medium text-slate-200">India Grid (National)</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Backend Link</span>
          <span className="font-mono text-[11px] text-slate-400">FastAPI Ready</span>
        </div>
      </div>

      {/* Operator Metadata */}
      <div className="px-6 py-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Operator Terminal</span>
        <span className="font-mono text-slate-400">v1.0-demo</span>
      </div>
    </aside>
  );
};
