"use client";

import React, { useEffect, useState } from "react";
import {
  Compass,
  TrendingUp,
  TrendingDown,
  SunMedium,
  Moon,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Info,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { DemoBanner } from "@/components/common/DemoBanner";
import { gridApiService } from "@/services/gridApi";
import { DemandInsight, RampRatePoint } from "@/types/grid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

export default function DemandInsightsPage() {
  const [insightsData, setInsightsData] = useState<{
    insights: DemandInsight[];
    rampRatePoints: RampRatePoint[];
    peakWindow: { start: string; end: string; expectedPeakMW: number };
    troughWindow: { start: string; end: string; expectedMinMW: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      setIsLoading(true);
      try {
        const res = await gridApiService.getInsights();
        setInsightsData(res.data);
      } finally {
        setIsLoading(false);
      }
    }
    loadInsights();
  }, []);

  return (
    <AppLayout
      title="Demand Insights & Ramp Dynamics"
      subtitle="Operational demand characteristics, peak periods & gradient analytics"
      latestObservationTimestamp="26 Sep 2026, 13:00 IST"
    >
      <DemoBanner />

      {/* Top Level Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Expected Peak Demand"
          value={insightsData?.peakWindow.expectedPeakMW.toLocaleString() || "224,800"}
          unit="MW"
          subtitle="Window: 18:30 - 21:00 IST"
          icon={Zap}
          highlight="amber"
          trend={{
            direction: "up",
            label: "Anticipated High",
            sublabel: "Critical window",
          }}
        />

        <KpiCard
          title="Expected Minimum Demand"
          value={insightsData?.troughWindow.expectedMinMW.toLocaleString() || "178,500"}
          unit="MW"
          subtitle="Window: 13:30 - 15:00 IST"
          icon={TrendingDown}
          highlight="emerald"
          trend={{
            direction: "down",
            label: "Baseload Trough",
            sublabel: "Thermal backdown",
          }}
        />

        <KpiCard
          title="Net Horizon Trajectory"
          value="+14.2%"
          unit="Ramp"
          subtitle="Net +26,380 MW over 12h"
          icon={TrendingUp}
          highlight="blue"
          trend={{
            direction: "up",
            label: "Escalating Trend",
            sublabel: "System ramp active",
          }}
        />

        <KpiCard
          title="Max 1-Hour Ramp Gradient"
          value="+9,450"
          unit="MW/hr"
          subtitle="18:00 - 19:00 IST window"
          icon={Clock}
          highlight="amber"
          badgeText="157 MW/min"
        />
      </div>

      {/* High vs Low Demand Operational Windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* High Demand Period Card */}
        <div className="bg-white rounded-xl border border-amber-200/90 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
              <SunMedium className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-700">
                Peak Demand Period
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {insightsData?.peakWindow.start} – {insightsData?.peakWindow.end}
              </h3>
            </div>
            <span className="ml-auto text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
              ~{insightsData?.peakWindow.expectedPeakMW.toLocaleString()} MW
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <p>
              System load models consistently project an evening crest in this window. As daylight declines, residual demand on the conventional dispatch fleet accelerates sharply.
            </p>
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-900 font-medium">
              <span className="font-semibold text-amber-950 block mb-0.5">
                Operator Action Required:
              </span>
              Ensure inter-regional transmission lines operate within safe thermal limits. Pre-commit rapid-start hydro and open-cycle turbines ahead of the 18:00 IST inflection point.
            </div>
          </div>
        </div>

        {/* Low Demand Period Card */}
        <div className="bg-white rounded-xl border border-emerald-200/90 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 pb-3 border-b border-emerald-100">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                Baseload / Low Demand Period
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {insightsData?.troughWindow.start} – {insightsData?.troughWindow.end}
              </h3>
            </div>
            <span className="ml-auto text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
              ~{insightsData?.troughWindow.expectedMinMW.toLocaleString()} MW
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <p>
              Demand during the early afternoon remains moderate and steady. System load is well balanced against generation availability.
            </p>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-emerald-900 font-medium">
              <span className="font-semibold text-emerald-950 block mb-0.5">
                Operational Window:
              </span>
              Suitable period for scheduling pumped-storage charging and conducting routine transmission switching without impacting security margins.
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Ramp Rate Supporting Chart */}
      <ChartCard
        title="Hourly Demand Ramp Rate (MW / hour)"
        subtitle="Expected rate of change between consecutive hourly intervals. Red bars indicate rapid ramp-up; green bars indicate ramp-down."
        isLoading={isLoading}
        legend={
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="w-3 h-3 bg-rose-500 rounded-sm inline-block" />
              <span>Ramping Up (+MW/h)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" />
              <span>Ramping Down (-MW/h)</span>
            </div>
          </div>
        }
      >
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={insightsData?.rampRatePoints || []}
              margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="timeWindow"
                stroke="#64748B"
                tick={{ fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                width={55}
              />
              <Tooltip
                formatter={(val: any) => [
                  `${Number(val) > 0 ? "+" : ""}${Number(val).toLocaleString()} MW/hour`,
                  "Ramp Rate",
                ]}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
              <Bar dataKey="rampRateMWPerHour" radius={[4, 4, 0, 0]}>
                {(insightsData?.rampRatePoints || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rampRateMWPerHour >= 0 ? "#F43F5E" : "#10B981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Operational Analytical Insights List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Observed Forecast Trend Explanations
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Demonstration Insights Summary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(insightsData?.insights || []).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {item.category.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                    {item.value}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-xl text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Operational Note: </span>
                {item.operationalNote}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
