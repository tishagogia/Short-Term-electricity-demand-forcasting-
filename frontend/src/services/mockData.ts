import {
  CombinedChartPoint,
  DemandInsight,
  DemandObservation,
  ForecastHorizonHours,
  ForecastPoint,
  ForecastResponse,
  ForecastingModel,
  GridOverviewData,
  HistoricalDemandSummary,
  HistoricalFilterOptions,
  RampRatePoint,
} from "@/types/grid";

// Base reference timestamp: 26 Sep 2026, 13:00 IST
const BASE_TIMESTAMP = new Date("2026-09-26T13:00:00+05:30");

function formatISTTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

function formatISTFull(date: Date): string {
  const d = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const t = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  return `${d}, ${t} IST`;
}

// Generate 24 hours of historical actual demand observations preceding the base time
export function generateRecentHistory(): DemandObservation[] {
  const points: DemandObservation[] = [];
  const hoursBack = 24;

  for (let i = hoursBack; i >= 0; i--) {
    const time = new Date(BASE_TIMESTAMP.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();

    // Diurnal curve equation simulation (representative of Indian grid diurnal load in MW)
    // Base load: 172,000 MW, Morning peak ~198,000 MW, Afternoon steady ~192,000 MW, Evening peak ~224,000 MW, Night trough ~168,000 MW
    let base = 185000;
    if (hour >= 2 && hour <= 5) {
      base = 168000 + Math.sin(((hour - 2) / 3) * Math.PI) * 4000;
    } else if (hour >= 6 && hour <= 10) {
      base = 182000 + ((hour - 6) / 4) * 22000;
    } else if (hour >= 11 && hour <= 16) {
      base = 201000 - Math.sin(((hour - 11) / 5) * Math.PI) * 5000;
    } else if (hour >= 17 && hour <= 21) {
      base = 208000 + Math.sin(((hour - 17) / 4) * Math.PI) * 19000;
    } else {
      base = 195000 - ((hour - 22) / 4) * 20000;
    }

    // Add mild natural fluctuation
    const noise = Math.sin(i * 1.7) * 1200 + Math.cos(i * 0.9) * 800;
    const demandMW = Math.round(base + noise);
    const frequencyHz = Number((50.0 + Math.sin(i * 0.8) * 0.04).toFixed(3));

    points.push({
      timestamp: formatISTFull(time),
      demandMW,
      actualDemandMW: demandMW,
      frequencyHz,
      isPeak: demandMW > 215000,
    });
  }

  return points;
}

// Generate forecast points according to model and horizon
export function generateDemoForecast(
  model: ForecastingModel = "XGBoost",
  horizonHours: ForecastHorizonHours = 12
): ForecastResponse {
  const history = generateRecentHistory();
  const latestObservation = history[history.length - 1];
  const baselineDemandMW = latestObservation.demandMW;

  const forecastPoints: ForecastPoint[] = [];
  const combinedChartData: CombinedChartPoint[] = [];

  // 1. Add historical points to combined chart (last 16 hours for clean visualization)
  const displayHistory = history.slice(-16);
  displayHistory.forEach((h) => {
    combinedChartData.push({
      timestamp: h.timestamp,
      displayTime: h.timestamp.split(", ")[1]?.replace(" IST", "") || h.timestamp,
      actualDemandMW: h.demandMW,
      predictedDemandMW: null, // Strictly null for past actuals!
      lowerConfidenceMW: null,
      upperConfidenceMW: null,
      isForecast: false,
    });
  });

  // T0 transition point: Bridge actual to predicted so lines meet seamlessly at the boundary
  const t0Time = new Date(BASE_TIMESTAMP.getTime());
  const t0TimeFormatted = formatISTFull(t0Time);
  const t0Display = formatISTTime(t0Time);

  // Update the last point in combined chart to act as the seam point
  if (combinedChartData.length > 0) {
    const lastPoint = combinedChartData[combinedChartData.length - 1];
    lastPoint.predictedDemandMW = baselineDemandMW;
  }

  // Model-specific behavioral curve bias
  const modelBias = {
    XGBoost: { factor: 1.0, smoothness: 0.9, confidenceWidth: 4200 },
    LSTM: { factor: 1.02, smoothness: 1.1, confidenceWidth: 5100 },
    Transformer: { factor: 0.99, smoothness: 0.85, confidenceWidth: 3800 },
  }[model];

  // 2. Generate future forecast points at 30-minute intervals
  const totalIntervals = horizonHours * 2;
  let peakVal = 0;
  let peakTime = "";
  let minVal = 999999;
  let minTime = "";

  for (let step = 1; step <= totalIntervals; step++) {
    const futureTime = new Date(BASE_TIMESTAMP.getTime() + step * 30 * 60 * 1000);
    const hour = futureTime.getHours() + futureTime.getMinutes() / 60;
    const timeFormatted = formatISTFull(futureTime);
    const displayTime = formatISTTime(futureTime);

    // Diurnal projection: Base baseline is 13:00 (afternoon).
    // As time heads into evening (18:00 - 21:00), load ramps up significantly toward evening peak.
    // Past 22:00, load drops into night base load.
    let projectedMW = baselineDemandMW;

    if (hour >= 13 && hour <= 17) {
      // Afternoon steady slight dip then pickup
      const delta = Math.sin(((hour - 13) / 4) * Math.PI) * 3500;
      projectedMW = baselineDemandMW + delta;
    } else if (hour > 17 && hour <= 21.5) {
      // Rapid evening ramp up
      const progress = (hour - 17) / 4.5;
      const eveningPeakBonus = Math.sin(progress * Math.PI) * 24000;
      projectedMW = baselineDemandMW + 8000 + eveningPeakBonus;
    } else if (hour > 21.5 && hour <= 24) {
      // Night drop
      const progress = (hour - 21.5) / 2.5;
      projectedMW = baselineDemandMW + 12000 - progress * 26000;
    } else {
      // Early morning
      projectedMW = baselineDemandMW - 14000;
    }

    // Apply model distinct characteristics
    const stepNoise = Math.sin(step * modelBias.smoothness) * 900;
    const predictedDemandMW = Math.round(projectedMW * modelBias.factor + stepNoise);

    // Uncertainty cones widen as horizon increases
    const horizonMultiplier = 1 + (step / totalIntervals) * 0.45;
    const boundDelta = Math.round(modelBias.confidenceWidth * horizonMultiplier);
    const lowerConfidenceMW = predictedDemandMW - boundDelta;
    const upperConfidenceMW = predictedDemandMW + boundDelta;

    const deltaFromBaselineMW = predictedDemandMW - baselineDemandMW;
    const deltaPercent = Number(((deltaFromBaselineMW / baselineDemandMW) * 100).toFixed(2));

    if (predictedDemandMW > peakVal) {
      peakVal = predictedDemandMW;
      peakTime = timeFormatted;
    }
    if (predictedDemandMW < minVal) {
      minVal = predictedDemandMW;
      minTime = timeFormatted;
    }

    const forecastPoint: ForecastPoint = {
      timestamp: timeFormatted,
      predictedDemandMW,
      lowerConfidenceMW,
      upperConfidenceMW,
      deltaFromBaselineMW,
      deltaPercent,
    };
    forecastPoints.push(forecastPoint);

    combinedChartData.push({
      timestamp: timeFormatted,
      displayTime,
      actualDemandMW: null, // Strictly null into the future
      predictedDemandMW,
      lowerConfidenceMW,
      upperConfidenceMW,
      isForecast: true,
    });
  }

  const lastForecast = forecastPoints[forecastPoints.length - 1];
  const netChangeMW = lastForecast.predictedDemandMW - baselineDemandMW;
  const netChangePercent = Number(((netChangeMW / baselineDemandMW) * 100).toFixed(2));
  const expectedTrend = netChangeMW > 2500 ? "increasing" : netChangeMW < -2500 ? "decreasing" : "stable";

  return {
    model,
    horizonHours,
    generatedAt: formatISTFull(new Date()),
    baselineDemandMW,
    peakPredictedMW: peakVal,
    peakPredictedTimestamp: peakTime,
    minPredictedMW: minVal,
    minPredictedTimestamp: minTime,
    expectedTrend,
    netChangeMW,
    netChangePercent,
    forecastPoints,
    combinedChartData,
    isDemo: true,
  };
}

export function generateGridOverview(): GridOverviewData {
  const history = generateRecentHistory();
  const latest = history[history.length - 1];
  const forecast = generateDemoForecast("XGBoost", 12);

  // Calculate rate of change in past hour
  const prev1h = history[history.length - 2] || latest;
  const rateOfChangeMWPerHour = latest.demandMW - prev1h.demandMW;

  return {
    latestObservation: {
      timestamp: latest.timestamp,
      demandMW: latest.demandMW,
      frequencyHz: latest.frequencyHz || 50.012,
      status: latest.demandMW > 220000 ? "Elevated Stress" : "Normal",
      operatingReserveMW: 14850,
      rateOfChangeMWPerHour,
    },
    forecastHorizonSummary: {
      horizonHours: 12,
      peakDemandMW: forecast.peakPredictedMW,
      peakTimestamp: forecast.peakPredictedTimestamp,
      trend: forecast.expectedTrend,
      trendDeltaMW: forecast.netChangeMW,
      trendPercent: forecast.netChangePercent,
    },
    recentHistory: history.slice(-12),
    upcomingForecastSample: forecast.forecastPoints.slice(0, 12),
  };
}

export function generateHistoricalSummary(
  options: HistoricalFilterOptions = { period: "24h", resolution: "1hour" }
): HistoricalDemandSummary {
  const history: DemandObservation[] = [];
  let hoursCount = 24;
  let periodLabel = "Last 24 Hours";

  if (options.period === "7d") {
    hoursCount = 7 * 24;
    periodLabel = "Last 7 Days (168 Hours)";
  } else if (options.period === "30d") {
    hoursCount = 30 * 24;
    periodLabel = "Last 30 Days (Sampled)";
  } else if (options.period === "summer_peak") {
    hoursCount = 48;
    periodLabel = "Representative High-Demand Summer Period (48 Hours)";
  } else if (options.period === "monsoon_normal") {
    hoursCount = 48;
    periodLabel = "Representative Monsoon Baseload Period (48 Hours)";
  }

  // Sample step depending on period length to keep UI lightweight
  const stepHours = hoursCount > 100 ? (options.period === "30d" ? 6 : 2) : 1;

  let peakMW = 0;
  let peakTime = "";
  let minMW = 999999;
  let minTime = "";
  let sumMW = 0;

  for (let i = hoursCount; i >= 0; i -= stepHours) {
    const time = new Date(BASE_TIMESTAMP.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();

    let base = 188000;
    if (options.period === "summer_peak") {
      base = 212000; // elevated summer air-conditioning demand
    } else if (options.period === "monsoon_normal") {
      base = 175000; // lower ambient temperatures
    }

    const diurnal =
      Math.sin(((hour - 4) / 12) * Math.PI) * 18000 +
      (hour >= 18 && hour <= 21 ? 14000 : 0) -
      (hour >= 1 && hour <= 5 ? 12000 : 0);

    const noise = Math.sin(i * 0.7) * 1800;
    const demandMW = Math.round(base + diurnal + noise);

    if (demandMW > peakMW) {
      peakMW = demandMW;
      peakTime = formatISTFull(time);
    }
    if (demandMW < minMW) {
      minMW = demandMW;
      minTime = formatISTFull(time);
    }
    sumMW += demandMW;

    history.push({
      timestamp: formatISTFull(time),
      demandMW,
      actualDemandMW: demandMW,
      frequencyHz: Number((50.0 + Math.sin(i * 0.4) * 0.035).toFixed(3)),
      isPeak: demandMW > 218000,
    });
  }

  const avgMW = Math.round(sumMW / history.length);
  const loadFactor = Number(((avgMW / peakMW) * 100).toFixed(1));

  return {
    periodLabel,
    startDate: history[0]?.timestamp || "",
    endDate: history[history.length - 1]?.timestamp || "",
    averageDemandMW: avgMW,
    peakDemandMW: peakMW,
    peakTimestamp: peakTime,
    minDemandMW: minMW,
    minTimestamp: minTime,
    loadFactorPercent: loadFactor,
    totalRecords: history.length,
    observations: history,
  };
}

export function generateDemandInsights(): {
  insights: DemandInsight[];
  rampRatePoints: RampRatePoint[];
  peakWindow: { start: string; end: string; expectedPeakMW: number };
  troughWindow: { start: string; end: string; expectedMinMW: number };
} {
  const forecast = generateDemoForecast("XGBoost", 12);

  const insights: DemandInsight[] = [
    {
      id: "insight-peak",
      category: "peak",
      title: "Anticipated Evening Peak Window",
      value: `${forecast.peakPredictedMW.toLocaleString()} MW`,
      timestamp: forecast.peakPredictedTimestamp,
      description:
        "The model forecasts maximum system demand to occur during the evening transition as commercial and residential illumination and cooling converge.",
      operationalNote:
        "Ensure adequate spinning reserves and fast-ramping gas or hydro units are scheduled ahead of 18:30 IST.",
      severity: "warning",
    },
    {
      id: "insight-trough",
      category: "trough",
      title: "Minimum Base Demand Observation",
      value: `${forecast.minPredictedMW.toLocaleString()} MW`,
      timestamp: forecast.minPredictedTimestamp,
      description:
        "Demand is projected to remain lowest in the early afternoon trough before the solar generation drop-off begins.",
      operationalNote:
        "Thermal backdown and pumped-storage pumping cycles can be accommodated during this period.",
      severity: "info",
    },
    {
      id: "insight-trend",
      category: "trend",
      title: "Net Forecast Horizon Trajectory",
      value: `${forecast.netChangeMW > 0 ? "+" : ""}${forecast.netChangeMW.toLocaleString()} MW (${forecast.netChangePercent > 0 ? "+" : ""}${forecast.netChangePercent}%)`,
      description:
        "Overall system demand shows an upward trajectory over the next 12 hours compared to the 13:00 IST baseline.",
      operationalNote:
        "Operator action: Monitor regional interchange limits and state drawal schedules against forecasted dispatch.",
      severity: "success",
    },
    {
      id: "insight-ramp",
      category: "ramp",
      title: "Steepest 1-Hour Ramp Period",
      value: "+9,450 MW / hour",
      timestamp: "17:30 - 18:30 IST",
      description:
        "The most critical gradient is observed in the late afternoon ramp as rooftop and utility solar generation declines while lighting load rises.",
      operationalNote:
        "Grid ramp-rate requirement exceeds 150 MW/min. Verify AGC (Automatic Generation Control) response readiness.",
      severity: "warning",
    },
  ];

  const rampRatePoints: RampRatePoint[] = [
    { timeWindow: "13:00 - 14:00", rampRateMWPerHour: -1200, direction: "Ramping Down" },
    { timeWindow: "14:00 - 15:00", rampRateMWPerHour: 800, direction: "Steady" },
    { timeWindow: "15:00 - 16:00", rampRateMWPerHour: 2400, direction: "Ramping Up" },
    { timeWindow: "16:00 - 17:00", rampRateMWPerHour: 4900, direction: "Ramping Up" },
    { timeWindow: "17:00 - 18:00", rampRateMWPerHour: 8200, direction: "Ramping Up" },
    { timeWindow: "18:00 - 19:00", rampRateMWPerHour: 9450, direction: "Ramping Up" },
    { timeWindow: "19:00 - 20:00", rampRateMWPerHour: 3200, direction: "Ramping Up" },
    { timeWindow: "20:00 - 21:00", rampRateMWPerHour: -1800, direction: "Ramping Down" },
    { timeWindow: "21:00 - 22:00", rampRateMWPerHour: -6200, direction: "Ramping Down" },
    { timeWindow: "22:00 - 23:00", rampRateMWPerHour: -5800, direction: "Ramping Down" },
    { timeWindow: "23:00 - 00:00", rampRateMWPerHour: -4100, direction: "Ramping Down" },
    { timeWindow: "00:00 - 01:00", rampRateMWPerHour: -2300, direction: "Ramping Down" },
  ];

  return {
    insights,
    rampRatePoints,
    peakWindow: {
      start: "18:30 IST",
      end: "21:00 IST",
      expectedPeakMW: forecast.peakPredictedMW,
    },
    troughWindow: {
      start: "13:30 IST",
      end: "15:00 IST",
      expectedMinMW: forecast.minPredictedMW,
    },
  };
}
