import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
    sublabel?: string;
  };
  highlight?: "none" | "blue" | "emerald" | "amber";
  badgeText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  highlight = "none",
  badgeText,
}) => {
  let highlightBorder = "border-slate-200";
  let iconBg = "bg-slate-100 text-slate-700";

  if (highlight === "blue") {
    highlightBorder = "border-blue-200/80 ring-1 ring-blue-500/10";
    iconBg = "bg-blue-50 text-blue-600";
  } else if (highlight === "emerald") {
    highlightBorder = "border-emerald-200/80 ring-1 ring-emerald-500/10";
    iconBg = "bg-emerald-50 text-emerald-600";
  } else if (highlight === "amber") {
    highlightBorder = "border-amber-200/80 ring-1 ring-amber-500/10";
    iconBg = "bg-amber-50 text-amber-600";
  }

  return (
    <div
      className={`bg-white rounded-xl border ${highlightBorder} p-5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {badgeText && (
              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {badgeText}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-slate-500">{unit}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend && (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                trend.direction === "up"
                  ? "bg-rose-50 text-rose-700"
                  : trend.direction === "down"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {trend.label}
            </span>
            {trend.sublabel && (
              <span className="text-slate-500">{trend.sublabel}</span>
            )}
          </div>
        )}

        {subtitle && (
          <span className="text-slate-400 font-medium ml-auto">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
