"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Calendar,
  Download,
  Activity,
  Zap,
  TrendingDown,
  Percent,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { DemoBanner } from "@/components/common/DemoBanner";
import { gridApiService } from "@/services/gridApi";
import {
  HistoricalDemandSummary,
  HistoricalFilterOptions,
} from "@/types/grid";
import { exportHistoricalToCsv } from "@/utils/exportCsv";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function HistoricalDemandPage() {
  const [filterPeriod, setFilterPeriod] =
    useState<HistoricalFilterOptions["period"]>("24h");
  const [summaryData, setSummaryData] = useState<HistoricalDemandSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadHistorical(filterPeriod);
  }, [filterPeriod]);

  const loadHistorical = async (period: HistoricalFilterOptions["period"]) => {
    setIsLoading(true);
    setTablePage(1);
    try {
      const res = await gridApiService.getHistoricalDemand({
        period,
        resolution: "1hour",
      });
      setSummaryData(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!summaryData) return;
    exportHistoricalToCsv(summaryData.observations, summaryData.periodLabel);
  };

  const observations = summaryData?.observations || [];
  const totalPages = Math.max(1, Math.ceil(observations.length / pageSize));
  const pagedRecords = observations.slice(
    (tablePage - 1) * pageSize,
    tablePage * pageSize
  );

  // Chart data formatting
  const chartData = observations.map((o) => ({
    displayTime:
      filterPeriod === "7d" || filterPeriod === "30d"
        ? o.timestamp.split(", ")[0]
        : o.timestamp.split(", ")[1]?.replace(" IST", "") || o.timestamp,
    fullTimestamp: o.timestamp,
    demandMW: o.demandMW,
    frequencyHz: o.frequencyHz,
  }));

  const periodButtons: { id: HistoricalFilterOptions["period"]; label: string }[] = [
    { id: "24h", label: "Past 24 Hours" },
    { id: "7d", label: "Past 7 Days" },
    { id: "30d", label: "Past 30 Days" },
    { id: "summer_peak", label: "Summer High Load (48h)" },
    { id: "monsoon_normal", label: "Monsoon Baseload (48h)" },
  ];

  return (
    <AppLayout
      title="Historical Demand Telemetry"
      subtitle="Past electricity load observations, period statistics & grid load factors"
      latestObservationTimestamp="26 Sep 2026, 13:00 IST"
    >
      <DemoBanner />

      {/* Period Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Historical Demonstration Period Filter
          </label>
          <div className="flex flex-wrap gap-1.5">
            {periodButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterPeriod(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterPeriod === btn.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!summaryData || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Historical CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards for Selected Period */}
      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Average Demand"
            value={summaryData.averageDemandMW.toLocaleString()}
            unit="MW"
            subtitle={summaryData.periodLabel}
            icon={Activity}
            highlight="blue"
          />

          <KpiCard
            title="Peak Observed Demand"
            value={summaryData.peakDemandMW.toLocaleString()}
            unit="MW"
            subtitle={summaryData.peakTimestamp.split(", ")[1] || "Peak Hour"}
            icon={Zap}
            highlight="amber"
            trend={{
              direction: "up",
              label: "Max Load",
              sublabel: summaryData.peakTimestamp.split(", ")[0],
            }}
          />

          <KpiCard
            title="Minimum Observed Demand"
            value={summaryData.minDemandMW.toLocaleString()}
            unit="MW"
            subtitle={summaryData.minTimestamp.split(", ")[1] || "Off-Peak Hour"}
            icon={TrendingDown}
            highlight="emerald"
            trend={{
              direction: "down",
              label: "Min Load",
              sublabel: summaryData.minTimestamp.split(", ")[0],
            }}
          />

          <KpiCard
            title="System Load Factor"
            value={`${summaryData.loadFactorPercent}%`}
            subtitle="Avg Demand ÷ Peak Demand"
            icon={Percent}
            highlight="none"
            badgeText="Grid Efficiency"
          />
        </div>
      )}

      {/* Interactive Historical Line Chart */}
      <ChartCard
        title={`Observed Demand Profile — ${summaryData?.periodLabel || "Selected Window"}`}
        subtitle="Chronological demand readings in Megawatts (MW) with standard 50.0 Hz nominal frequency telemetry"
        isLoading={isLoading}
        legend={
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <span className="w-3 h-1 bg-slate-800 rounded-full inline-block" />
            <span className="font-medium">Demand (MW)</span>
          </div>
        }
      >
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="displayTime"
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k MW`}
                domain={["auto", "auto"]}
                width={70}
              />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toLocaleString()} MW`, "Observed Load"]}
                labelFormatter={(label: any, payload: any) =>
                  payload[0]?.payload?.fullTimestamp || label
                }
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="demandMW"
                stroke="#1E293B"
                strokeWidth={2.2}
                dot={chartData.length < 35 ? { r: 3, fill: "#1E293B" } : false}
                activeDot={{ r: 5, stroke: "#0F172A", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Historical Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Sample Historical Observation Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing telemetry intervals for {summaryData?.periodLabel} (Demonstration series)
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium self-start sm:self-auto">
            Total records: {observations.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Observation Timestamp (IST)</th>
                <th className="py-3 px-4 text-right">Recorded Demand (MW)</th>
                <th className="py-3 px-4 text-right">Grid Frequency (Hz)</th>
                <th className="py-3 px-4 text-right">Demand Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {pagedRecords.map((rec, idx) => {
                const isPeak = rec.demandMW > (summaryData?.averageDemandMW || 190000) * 1.08;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-sans text-slate-700 font-medium">
                      {rec.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      {rec.demandMW.toLocaleString()} MW
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {rec.frequencyHz?.toFixed(3) || "50.000"} Hz
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {isPeak ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Peak Interval
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Normal Base
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(tablePage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(tablePage * pageSize, observations.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-700">{observations.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTablePage((p) => Math.max(p - 1, 1))}
              disabled={tablePage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {tablePage} of {totalPages}
            </span>
            <button
              onClick={() => setTablePage((p) => Math.min(p + 1, totalPages))}
              disabled={tablePage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
