"use client";

import React, { useState } from "react";
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import { ForecastPoint, ForecastingModel } from "@/types/grid";
import { exportForecastToCsv } from "@/utils/exportCsv";

interface ForecastTableProps {
  points: ForecastPoint[];
  model: ForecastingModel;
  horizonHours: number;
  baselineMW: number;
  isDemo?: boolean;
}

export const ForecastTable: React.FC<ForecastTableProps> = ({
  points,
  model,
  horizonHours,
  baselineMW,
  isDemo = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.max(1, Math.ceil(points.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentPoints = points.slice(startIndex, startIndex + pageSize);

  const handleExport = () => {
    exportForecastToCsv(points, model, horizonHours, baselineMW);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Tabular Forecast Projections
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              {points.length} intervals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model: <span className="font-semibold text-slate-700">{model}</span> | Horizon:{" "}
            <span className="font-semibold text-slate-700">{horizonHours} Hours</span> (30-minute intervals)
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Displayed CSV
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Forecast Timestamp (IST)</th>
              <th className="py-3 px-4 text-right">Predicted Demand</th>
              <th className="py-3 px-4 text-right">95% Conf. Interval</th>
              <th className="py-3 px-4 text-right">Delta vs Baseline</th>
              <th className="py-3 px-4 text-right">Trajectory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
            {currentPoints.map((pt, idx) => {
              const isPositive = pt.deltaFromBaselineMW > 0;
              const isNegative = pt.deltaFromBaselineMW < 0;

              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans text-slate-700 font-medium">
                    {pt.timestamp}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700 text-sm">
                    {pt.predictedDemandMW.toLocaleString()} MW
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                    {pt.lowerConfidenceMW.toLocaleString()} – {pt.upperConfidenceMW.toLocaleString()} MW
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span
                      className={
                        isPositive
                          ? "text-rose-600"
                          : isNegative
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }
                    >
                      {isPositive ? "+" : ""}
                      {pt.deltaFromBaselineMW.toLocaleString()} MW
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-sans ${
                        isPositive
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : isNegative
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isPositive ? "▲ +" : isNegative ? "▼ " : "— "}
                      {pt.deltaPercent}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{" "}
          <span className="font-semibold text-slate-700">
            {Math.min(startIndex + pageSize, points.length)}
          </span>{" "}
          of <span className="font-semibold text-slate-700">{points.length}</span> entries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
