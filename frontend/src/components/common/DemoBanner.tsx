import React from "react";
import { AlertTriangle, Database, Info } from "lucide-react";

interface DemoBannerProps {
  className?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ className = "" }) => {
  return (
    <div
      className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 text-amber-900 shadow-xs flex items-start gap-3 ${className}`}
    >
      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
        <Database className="w-4 h-4" />
      </div>
      <div className="text-xs sm:text-sm leading-relaxed flex-1">
        <span className="font-semibold text-amber-950 mr-1.5">
          Demonstration Environment:
        </span>
        All observations, timestamps, and model predictions displayed across GridCast are representative demonstration datasets calibrated to Indian power system diurnal patterns. They are decoupled from the future FastAPI backend and do not reflect real-time NLDC/RLDC telemetry or live model inference.
      </div>
    </div>
  );
};
