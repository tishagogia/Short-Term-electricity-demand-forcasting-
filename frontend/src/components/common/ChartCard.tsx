import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  legend?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  legend,
  className = "",
  isLoading = false,
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {legend}
          {actions}
        </div>
      </div>

      <div className="pt-4 flex-1 relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs z-10">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs font-medium text-slate-600">
              Generating demand projection...
            </span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};
