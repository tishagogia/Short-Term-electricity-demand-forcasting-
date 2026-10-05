"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
} from "recharts";
import { CombinedChartPoint } from "@/types/grid";

interface ForecastChartProps {
  data: CombinedChartPoint[];
  t0Timestamp?: string;
  horizonHours: number;
  model: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const point: CombinedChartPoint = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs backdrop-blur-xs min-w-[210px]">
      <div className="font-semibold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-800 flex items-center justify-between">
        <span>{point.timestamp}</span>
        {point.isForecast ? (
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/40">
            Forecast
          </span>
        ) : (
          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
            Observed
          </span>
        )}
      </div>

      {point.actualDemandMW !== null && (
        <div className="flex items-center justify-between py-1 text-slate-200">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            Observed Demand:
          </span>
          <span className="font-mono font-bold text-white">
            {point.actualDemandMW.toLocaleString()} MW
          </span>
        </div>
      )}

      {point.predictedDemandMW !== null && (
        <div className="flex items-center justify-between py-1 text-blue-200">
          <span className="flex items-center gap-1.5 text-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Predicted Demand:
          </span>
          <span className="font-mono font-bold text-blue-300">
            {point.predictedDemandMW.toLocaleString()} MW
          </span>
        </div>
      )}

      {point.lowerConfidenceMW !== null && point.upperConfidenceMW !== null && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Confidence Band (95%):</span>
          <span className="font-mono text-slate-300">
            {point.lowerConfidenceMW.toLocaleString()} - {point.upperConfidenceMW.toLocaleString()} MW
          </span>
        </div>
      )}
    </div>
  );
};

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  horizonHours,
  model,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        No forecast data points to render.
      </div>
    );
  }

  // Find the boundary index where forecast begins
  const boundaryIndex = data.findIndex((d) => d.isForecast);
  const boundaryPoint = boundaryIndex > 0 ? data[boundaryIndex - 1] : null;
  const boundaryLabel = boundaryPoint?.displayTime || "T₀ (Now)";

  // Compute min and max values for clean Y-axis scaling
  const allValues = data
    .flatMap((d) => [
      d.actualDemandMW,
      d.predictedDemandMW,
      d.lowerConfidenceMW,
      d.upperConfidenceMW,
    ])
    .filter((v): v is number => v !== null && typeof v === "number");

  const minVal = Math.min(...allValues, 160000);
  const maxVal = Math.max(...allValues, 230000);
  const yDomainMin = Math.floor((minVal - 6000) / 10000) * 10000;
  const yDomainMax = Math.ceil((maxVal + 6000) / 10000) * 10000;

  return (
    <div className="w-full h-[380px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
        >
          <defs>
            <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

          <XAxis
            dataKey="displayTime"
            stroke="#64748B"
            tick={{ fontSize: 11 }}
            tickMargin={10}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[yDomainMin, yDomainMax]}
            stroke="#64748B"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k MW`}
            width={70}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Vertical reference line at T0 forecast boundary */}
          {boundaryPoint && (
            <ReferenceLine
              x={boundaryPoint.displayTime}
              stroke="#D97706"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: "Forecast Boundary (T₀)",
                position: "insideTopLeft",
                fill: "#B45309",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="upperConfidenceMW"
            stroke="transparent"
            fill="url(#confidenceBand)"
            connectNulls={false}
          />

          {/* Historical actual demand line (Strictly ends at T0, null afterwards) */}
          <Line
            type="monotone"
            dataKey="actualDemandMW"
            name="Observed Actual"
            stroke="#334155"
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: "#334155" }}
            activeDot={{ r: 5, stroke: "#334155", strokeWidth: 2 }}
            connectNulls={false}
          />

          {/* Model predicted demand line (Dashed / Vibrant Blue) */}
          <Line
            type="monotone"
            dataKey="predictedDemandMW"
            name={`${model} Forecast`}
            stroke="#2563EB"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#2563EB" }}
            activeDot={{ r: 6, stroke: "#1D4ED8", strokeWidth: 2 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
