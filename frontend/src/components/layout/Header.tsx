"use client";

import React from "react";
import { Clock, Menu, AlertCircle, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  latestObservationTimestamp?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  latestObservationTimestamp = "26 Sep 2026, 13:00 IST",
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title area & mobile trigger */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Status badges & observation timestamp */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Demonstration Data status indicator */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Demonstration Dataset</span>
          </div>

          {/* Latest telemetry timestamp */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Observation:</span>
            <span className="font-semibold font-mono text-slate-800">
              {latestObservationTimestamp}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
