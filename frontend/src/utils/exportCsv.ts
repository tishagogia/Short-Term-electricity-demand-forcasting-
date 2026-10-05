import { ForecastPoint, ForecastingModel } from "@/types/grid";

export function exportForecastToCsv(
  forecastPoints: ForecastPoint[],
  model: ForecastingModel,
  horizonHours: number,
  baselineMW: number
): void {
  if (!forecastPoints || forecastPoints.length === 0) {
    alert("No forecast data available to export.");
    return;
  }

  const headers = [
    "Timestamp (IST)",
    "Predicted Demand (MW)",
    "Lower Confidence (MW)",
    "Upper Confidence (MW)",
    "Delta vs Baseline (MW)",
    "Change (%)",
    "Model Architecture",
    "Baseline Demand (MW)",
  ];

  const rows = forecastPoints.map((p) => [
    `"${p.timestamp}"`,
    p.predictedDemandMW,
    p.lowerConfidenceMW,
    p.upperConfidenceMW,
    p.deltaFromBaselineMW,
    `${p.deltaPercent}%`,
    `"${model}"`,
    baselineMW,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `gridcast_${model.toLowerCase()}_${horizonHours}h_${dateStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportHistoricalToCsv(
  observations: { timestamp: string; demandMW: number; frequencyHz?: number }[],
  periodLabel: string
): void {
  if (!observations || observations.length === 0) {
    return;
  }

  const headers = ["Timestamp (IST)", "Observed Demand (MW)", "Grid Frequency (Hz)"];

  const rows = observations.map((o) => [
    `"${o.timestamp}"`,
    o.demandMW,
    o.frequencyHz ?? 50.0,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const slug = periodLabel.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 24);
  link.setAttribute("href", url);
  link.setAttribute("download", `gridcast_historical_${slug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
