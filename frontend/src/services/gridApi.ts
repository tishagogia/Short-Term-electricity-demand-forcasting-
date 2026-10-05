import {
  ForecastHorizonHours,
  ForecastResponse,
  ForecastingModel,
  GridOverviewData,
  HistoricalDemandSummary,
  HistoricalFilterOptions,
} from "@/types/grid";
import {
  generateDemoForecast,
  generateDemandInsights,
  generateGridOverview,
  generateHistoricalSummary,
} from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * GridCast Data Access Service
 * Designed for future integration with the FastAPI backend.
 * Falls back to structured demonstration data when the API server is offline or in development.
 */

export const gridApiService = {
  /**
   * Check if backend API URL is configured in the environment
   */
  isApiConfigured(): boolean {
    return Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0);
  },

  getApiBaseUrl(): string {
    return API_BASE_URL || "Unconfigured (Running Demonstration Mode)";
  },

  /**
   * Fetch overview metrics and latest grid observations
   */
  async getOverview(): Promise<{ data: GridOverviewData; isDemo: boolean }> {
    if (this.isApiConfigured()) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/overview`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          return { data: json, isDemo: false };
        }
      } catch (err) {
        console.warn("Backend API unavailable, falling back to demonstration dataset", err);
      }
    }

    // Return structured demonstration data
    return { data: generateGridOverview(), isDemo: true };
  },

  /**
   * Generate electricity demand forecast for the specified horizon and ML model
   */
  async generateForecast(
    model: ForecastingModel = "XGBoost",
    horizonHours: ForecastHorizonHours = 12
  ): Promise<ForecastResponse> {
    if (this.isApiConfigured()) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/forecast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, horizon_hours: horizonHours }),
        });
        if (res.ok) {
          const json = await res.json();
          return { ...json, isDemo: false };
        }
      } catch (err) {
        console.warn("Backend API unavailable, falling back to demonstration forecast", err);
      }
    }

    // Simulated short network latency (250ms) to ensure UI loading states render realistically
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateDemoForecast(model, horizonHours);
  },

  /**
   * Fetch historical demand series for analysis
   */
  async getHistoricalDemand(
    options: HistoricalFilterOptions = { period: "24h", resolution: "1hour" }
  ): Promise<{ data: HistoricalDemandSummary; isDemo: boolean }> {
    if (this.isApiConfigured()) {
      try {
        const query = new URLSearchParams({
          period: options.period,
          resolution: options.resolution,
        });
        const res = await fetch(`${API_BASE_URL}/api/v1/historical?${query.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          return { data: json, isDemo: false };
        }
      } catch (err) {
        console.warn("Backend API unavailable, falling back to demonstration historical data", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: generateHistoricalSummary(options), isDemo: true };
  },

  /**
   * Fetch operational demand insights and ramp rate analytics
   */
  async getInsights(): Promise<{
    data: ReturnType<typeof generateDemandInsights>;
    isDemo: boolean;
  }> {
    if (this.isApiConfigured()) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/insights`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          return { data: json, isDemo: false };
        }
      } catch (err) {
        console.warn("Backend API unavailable, falling back to demonstration insights", err);
      }
    }

    return { data: generateDemandInsights(), isDemo: true };
  },
};
