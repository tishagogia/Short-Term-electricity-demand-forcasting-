import React from "react";

interface StatusBadgeProps {
  status: "normal" | "elevated" | "demo" | "forecast" | "actual" | "info";
  label?: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = "md",
}) => {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  let colorClasses = "";
  let defaultLabel = "";

  switch (status) {
    case "normal":
      colorClasses = "bg-emerald-50 text-emerald-700 border border-emerald-200";
      defaultLabel = "Grid Normal (50.0 Hz nominal)";
      break;
    case "elevated":
      colorClasses = "bg-amber-50 text-amber-700 border border-amber-200";
      defaultLabel = "Elevated Demand Window";
      break;
    case "demo":
      colorClasses = "bg-amber-100/70 text-amber-800 border border-amber-300";
      defaultLabel = "Demonstration Mode";
      break;
    case "forecast":
      colorClasses = "bg-blue-50 text-blue-700 border border-blue-200";
      defaultLabel = "Forecasted";
      break;
    case "actual":
      colorClasses = "bg-slate-100 text-slate-700 border border-slate-300";
      defaultLabel = "Observed Actual";
      break;
    case "info":
      colorClasses = "bg-sky-50 text-sky-700 border border-sky-200";
      defaultLabel = "Telemetry Active";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${colorClasses} tracking-wide`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "normal"
            ? "bg-emerald-500 animate-pulse"
            : status === "elevated"
            ? "bg-amber-500"
            : status === "demo"
            ? "bg-amber-600"
            : status === "forecast"
            ? "bg-blue-600"
            : "bg-slate-500"
        }`}
      />
      {label || defaultLabel}
    </span>
  );
};
