"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Gauge,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { DemoBanner } from "@/components/common/DemoBanner";
import { gridApiService } from "@/services/gridApi";
import { GridOverviewData } from "@/types/grid";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function OverviewPage() {
  const [data, setData] = useState<GridOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      setIsLoading(true);
      try {
        const res = await gridApiService.getOverview();
        setData(res.data);
      } finally {
        setIsLoading(false);
      }
    }
    loadOverview();
  }, []);

  const latest = data?.latestObservation;
  const horizon = data?.forecastHorizonSummary;

  // Prepare chart series for 24h recent trend
  const historyChartData = (data?.recentHistory || []).map((pt) => ({
    time: pt.timestamp.split(", ")[1]?.replace(" IST", "") || pt.timestamp,
    fullTime: pt.timestamp,
    demandMW: pt.demandMW,
  }));

  const isTrendIncreasing = horizon?.trend === "increasing";

  return (
    <AppLayout
      title="National Grid Overview"
      subtitle="Operational summary & short-term demand trajectory"
      latestObservationTimestamp={latest?.timestamp || "26 Sep 2026, 13:00 IST"}
    >
      {/* Demonstration Banner */}
      <DemoBanner />

      {/* Primary Operator KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Latest Observed Demand"
          value={latest ? latest.demandMW.toLocaleString() : "185,420"}
          unit="MW"
          subtitle={latest?.timestamp || "13:00 IST"}
          icon={Activity}
          highlight="blue"
          trend={{
            direction: (latest?.rateOfChangeMWPerHour || 0) >= 0 ? "up" : "down",
            label: `${(latest?.rateOfChangeMWPerHour || 0) >= 0 ? "+" : ""}${latest?.rateOfChangeMWPerHour?.toLocaleString()} MW/h`,
            sublabel: "past 60 min",
          }}
        />

        <KpiCard
          title="Expected Peak Demand"
          value={horizon ? horizon.peakDemandMW.toLocaleString() : "224,800"}
          unit="MW"
          subtitle={`Horizon: ${horizon?.horizonHours || 12}h ahead`}
          icon={Zap}
          highlight="amber"
          trend={{
            direction: "up",
            label: "Anticipated Peak",
            sublabel: horizon?.peakTimestamp.split(", ")[1] || "19:30 IST",
          }}
        />

        <KpiCard
          title="Peak Window Timestamp"
          value={horizon?.peakTimestamp.split(", ")[1]?.replace(" IST", "") || "19:30"}
          unit="IST"
          subtitle={horizon?.peakTimestamp.split(", ")[0] || "26 Sep 2026"}
          icon={Clock}
          highlight="none"
          badgeText="Critical Ramp"
        />

        <KpiCard
          title="Demand Trajectory"
          value={
            horizon
              ? `${horizon.trendPercent > 0 ? "+" : ""}${horizon.trendPercent}%`
              : "+14.2%"
          }
          subtitle={`Net: ${(horizon?.trendDeltaMW ?? 0) > 0 ? "+" : ""}${(horizon?.trendDeltaMW ?? 0).toLocaleString()} MW`}
          icon={isTrendIncreasing ? TrendingUp : TrendingDown}
          highlight={isTrendIncreasing ? "amber" : "emerald"}
          trend={{
            direction: isTrendIncreasing ? "up" : "down",
            label: isTrendIncreasing ? "Demand Escalating" : "Demand Subsidary",
            sublabel: "over 12h horizon",
          }}
        />
      </div>

      {/* Grid Frequency & Operating Status Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Grid Frequency</div>
            <div className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
              <span>{latest?.frequencyHz?.toFixed(3) || "50.012"} Hz</span>
              <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                IEGC Band Compliant
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Operating Spinning Reserve</div>
            <div className="text-base font-bold text-slate-900 font-mono">
              {latest?.operatingReserveMW?.toLocaleString() || "14,850"} MW
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/forecast"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Open Primary Forecast
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent 12h Trend Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Recent Observed Demand Trend"
            subtitle="Recent telemetry preceding current observation time (Hourly resolution)"
            isLoading={isLoading}
            legend={
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                <span>Observed Demand (MW)</span>
              </div>
            }
          >
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historyChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#334155" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#334155" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="time"
                    stroke="#94A3B8"
                    tick={{ fontSize: 11 }}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k MW`}
                    domain={["auto", "auto"]}
                    width={65}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} MW`, "Observed Demand"]}
                    labelFormatter={(label: any, payload: any) => payload[0]?.payload?.fullTime || label}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="demandMW"
                    stroke="#334155"
                    strokeWidth={2.5}
                    fill="url(#historyFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Upcoming Demand Horizon Quick Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                12-Hour Forecast Outlook
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                XGBoost Baseline
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Trajectory State</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-xs ${
                    isTrendIncreasing
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {isTrendIncreasing ? "Demand Increasing (Ramp-up)" : "Demand Decreasing (Drop-off)"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Projected Peak</span>
                <div className="text-right">
                  <div className="font-bold font-mono text-slate-900 text-sm">
                    {horizon?.peakDemandMW.toLocaleString()} MW
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {horizon?.peakTimestamp}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Forecasted Delta</span>
                <div className="text-right">
                  <div
                    className={`font-bold font-mono text-sm ${
                      isTrendIncreasing ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {(horizon?.trendDeltaMW ?? 0) > 0 ? "+" : ""}
                    {(horizon?.trendDeltaMW ?? 0).toLocaleString()} MW
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ({(horizon?.trendPercent ?? 0) > 0 ? "+" : ""}
                    {horizon?.trendPercent ?? 0}% vs current)
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Upcoming evening lighting transition and commercial shutdown shifts demand towards
              the day&apos;s peak. Dispatch controllers should verify reserve margin availability.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/forecast"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Analyze Deep Forecast Models
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
