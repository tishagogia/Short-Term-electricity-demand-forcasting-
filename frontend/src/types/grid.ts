export type ForecastingModel = "XGBoost" | "LSTM" | "Transformer";

export type ForecastHorizonHours = 2 | 4 | 6 | 8 | 12;

export interface DemandObservation {
  timestamp: string; // ISO string or IST formatted string
  demandMW: number;
  actualDemandMW?: number;
  frequencyHz?: number;
  isPeak?: boolean;
}

export interface ForecastPoint {
  timestamp: string;
  predictedDemandMW: number;
  lowerConfidenceMW: number;
  upperConfidenceMW: number;
  deltaFromBaselineMW: number;
  deltaPercent: number;
}

export interface CombinedChartPoint {
  timestamp: string;
  displayTime: string;
  actualDemandMW: number | null;
  predictedDemandMW: number | null;
  lowerConfidenceMW: number | null;
  upperConfidenceMW: number | null;
  isForecast: boolean;
}

export interface ForecastResponse {
  model: ForecastingModel;
  horizonHours: number;
  generatedAt: string;
  baselineDemandMW: number;
  peakPredictedMW: number;
  peakPredictedTimestamp: string;
  minPredictedMW: number;
  minPredictedTimestamp: string;
  expectedTrend: "increasing" | "decreasing" | "stable";
  netChangeMW: number;
  netChangePercent: number;
  forecastPoints: ForecastPoint[];
  combinedChartData: CombinedChartPoint[];
  isDemo: boolean;
}

export interface HistoricalFilterOptions {
  period: "24h" | "7d" | "30d" | "summer_peak" | "monsoon_normal";
  resolution: "15min" | "1hour";
}

export interface HistoricalDemandSummary {
  periodLabel: string;
  startDate: string;
  endDate: string;
  averageDemandMW: number;
  peakDemandMW: number;
  peakTimestamp: string;
  minDemandMW: number;
  minTimestamp: string;
  loadFactorPercent: number;
  totalRecords: number;
  observations: DemandObservation[];
}

export interface GridOverviewData {
  latestObservation: {
    timestamp: string;
    demandMW: number;
    frequencyHz: number;
    status: "Normal" | "Elevated Stress" | "Sub-nominal";
    operatingReserveMW: number;
    rateOfChangeMWPerHour: number;
  };
  forecastHorizonSummary: {
    horizonHours: number;
    peakDemandMW: number;
    peakTimestamp: string;
    trend: "increasing" | "decreasing" | "stable";
    trendDeltaMW: number;
    trendPercent: number;
  };
  recentHistory: DemandObservation[];
  upcomingForecastSample: ForecastPoint[];
}

export interface DemandInsight {
  id: string;
  category: "peak" | "trough" | "trend" | "ramp";
  title: string;
  value: string;
  timestamp?: string;
  description: string;
  operationalNote: string;
  severity: "info" | "success" | "warning";
}

export interface RampRatePoint {
  timeWindow: string;
  rampRateMWPerHour: number;
  direction: "Ramping Up" | "Ramping Down" | "Steady";
}
