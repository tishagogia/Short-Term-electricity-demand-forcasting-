"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Play,
  Download,
  Clock,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  Info,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChartCard } from "@/components/common/ChartCard";
import { KpiCard } from "@/components/common/KpiCard";
import { DemoBanner } from "@/components/common/DemoBanner";
import { ForecastChart } from "@/components/forecast/ForecastChart";
import { ForecastTable } from "@/components/forecast/ForecastTable";
import { gridApiService } from "@/services/gridApi";
import {
  ForecastHorizonHours,
  ForecastResponse,
  ForecastingModel,
} from "@/types/grid";
import { exportForecastToCsv } from "@/utils/exportCsv";

export default function DemandForecastPage() {
  const [model, setModel] = useState<ForecastingModel>("XGBoost");
  const [horizonHours, setHorizonHours] = useState<ForecastHorizonHours>(12);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial load
  useEffect(() => {
    handleRunForecast("XGBoost", 12);
  }, []);

  const handleRunForecast = async (
    targetModel: ForecastingModel = model,
    targetHorizon: ForecastHorizonHours = horizonHours
  ) => {
    setIsGenerating(true);
    try {
      const result = await gridApiService.generateForecast(targetModel, targetHorizon);
      setForecastData(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvExport = () => {
    if (!forecastData) return;
    exportForecastToCsv(
      forecastData.forecastPoints,
      forecastData.model,
      forecastData.horizonHours,
      forecastData.baselineDemandMW
    );
  };

  return (
    <AppLayout
      title="Demand Forecast"
      subtitle="Interactive short-term electricity load projections"
      latestObservationTimestamp="26 Sep 2026, 13:00 IST"
    >
      {/* Demonstration Banner */}
      <DemoBanner />

      {/* Control Panel Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Horizon & Model Selectors */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Horizon Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Forecast Horizon
              </label>
              <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                {([2, 4, 6, 8, 12] as ForecastHorizonHours[]).map((hrs) => (
                  <button
                    key={hrs}
                    onClick={() => setHorizonHours(hrs)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      horizonHours === hrs
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {hrs} Hours
                  </button>
                ))}
              </div>
            </div>

            {/* Model Architecture Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Model Architecture
              </label>
              <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                {(["XGBoost", "LSTM", "Transformer"] as ForecastingModel[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      model === m
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 lg:pt-0">
            <button
              onClick={() => handleRunForecast(model, horizonHours)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Forecast...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>

            <button
              onClick={handleCsvExport}
              disabled={!forecastData || isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Demo model disclaimer note */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Demonstration mode: The selected model ({model}) produces synthetic load trajectories reflecting characteristic model behaviors. Future backend integration will connect trained weights.
          </span>
        </div>
      </div>

      {/* Summary KPI Cards for Active Forecast */}
      {forecastData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Baseline (T₀) Demand"
            value={forecastData.baselineDemandMW.toLocaleString()}
            unit="MW"
            subtitle="Observed at 13:00 IST"
            highlight="none"
          />

          <KpiCard
            title="Expected Peak Demand"
            value={forecastData.peakPredictedMW.toLocaleString()}
            unit="MW"
            subtitle={forecastData.peakPredictedTimestamp.split(", ")[1] || "19:30 IST"}
            highlight="amber"
            trend={{
              direction: "up",
              label: "Peak Load",
              sublabel: `${model} forecast`,
            }}
          />

          <KpiCard
            title="Expected Minimum Demand"
            value={forecastData.minPredictedMW.toLocaleString()}
            unit="MW"
            subtitle={forecastData.minPredictedTimestamp.split(", ")[1] || "14:00 IST"}
            highlight="none"
          />

          <KpiCard
            title="Net Forecasted Delta"
            value={`${forecastData.netChangeMW > 0 ? "+" : ""}${forecastData.netChangeMW.toLocaleString()}`}
            unit="MW"
            subtitle={`${forecastData.netChangePercent > 0 ? "+" : ""}${forecastData.netChangePercent}% over ${forecastData.horizonHours}h`}
            highlight={forecastData.netChangeMW > 0 ? "amber" : "emerald"}
            trend={{
              direction: forecastData.netChangeMW > 0 ? "up" : "down",
              label: forecastData.netChangeMW > 0 ? "Escalating" : "Troughing",
            }}
          />
        </div>
      )}

      {/* Interactive Demand Line Chart Card */}
      <ChartCard
        title={`Electricity Demand Projection — ${model} (${horizonHours}-Hour Horizon)`}
        subtitle="Historical observed actuals (solid dark) vs projected forecast trajectory (dashed blue with 95% confidence band)"
        isLoading={isGenerating}
        legend={
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-3 h-1 bg-slate-700 rounded-full inline-block" />
              <span>Historical Actual</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700 font-medium">
              <span className="w-3 h-1 bg-blue-600 rounded-full inline-block" />
              <span>{model} Prediction</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-500 font-medium">
              <span className="w-3 h-2 bg-blue-200/50 rounded inline-block border border-blue-300" />
              <span>95% Confidence Band</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-3 h-1 border-t-2 border-dashed border-amber-600 inline-block" />
              <span>T₀ Forecast Boundary</span>
            </div>
          </div>
        }
      >
        {forecastData && (
          <ForecastChart
            data={forecastData.combinedChartData}
            horizonHours={horizonHours}
            model={model}
          />
        )}
      </ChartCard>

      {/* Forecast Results Table with CSV Export */}
      {forecastData && (
        <ForecastTable
          points={forecastData.forecastPoints}
          model={forecastData.model}
          horizonHours={forecastData.horizonHours}
          baselineMW={forecastData.baselineDemandMW}
          isDemo={forecastData.isDemo}
        />
      )}
    </AppLayout>
  );
}
