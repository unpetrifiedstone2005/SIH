"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Info as InfoIcon,
  FileUp,
  FileSpreadsheet,
  BarChartHorizontalBig,
  ShieldAlert,
  Gauge as GaugeIcon,
  UploadCloud,
  Mountain,
  Layers,
  Ruler,
  Activity,
  Droplets,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import CSVUpload, { ParsedCSVData } from "../CSVUpload";

const inter = Inter({ subsets: ["latin"] });

/* ----------------------------- INPUT DEFINITIONS ---------------------------- */
const inputDefs = [
  { name: "Rainfall", key: "rainfall", placeholder: "mm/day", tip: "Daily precipitation impacting slope saturation.", icon: Droplets },
  { name: "Depth to Groundwater", key: "depthToGroundwater", placeholder: "m", tip: "Vertical distance to the water table.", icon: Ruler },
  { name: "Pore Water Pressure", key: "poreWaterPressure", placeholder: "kPa", tip: "Water pressure within soil/rock pores.", icon: Activity },
  { name: "Surface Runoff", key: "surfaceRunoff", placeholder: "m³/s", tip: "Overland flow affecting erosion/loading.", icon: Droplets },
  { name: "Unit Weight", key: "unitWeight", placeholder: "kN/m³", tip: "Material density × gravity.", icon: Layers },
  { name: "Cohesion", key: "cohesion", placeholder: "kPa", tip: "Shear strength independent of normal stress.", icon: Layers },
  { name: "Internal Friction Angle", key: "internalFrictionAngle", placeholder: "°", tip: "Shear resistance due to particle friction.", icon: Mountain },
  { name: "Slope Angle", key: "slopeAngle", placeholder: "°", tip: "Inclination of slope face.", icon: Mountain },
  { name: "Slope Height", key: "slopeHeight", placeholder: "m", tip: "Vertical height of slope.", icon: Ruler },
  { name: "Pore Water Pressure Ratio", key: "pwpRatio", placeholder: "0–1", tip: "Ru ratio for saturation effects.", icon: Activity },
  { name: "Bench Height", key: "benchHeight", placeholder: "m", tip: "Vertical dimension of a bench.", icon: Ruler },
  { name: "Bench Width", key: "benchWidth", placeholder: "m", tip: "Horizontal width of a bench.", icon: Ruler },
  { name: "Inter-Ramp Angle", key: "interRampAngle", placeholder: "°", tip: "Angle between benches across ramps.", icon: Mountain },
];

/* ---------------------------------- ZOD SCHEMA ----------------------------------- */
const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);
const nonNeg = z.preprocess(emptyToUndef, z.coerce.number().min(0, "Must be ≥ 0").optional());
const angle = z.preprocess(emptyToUndef, z.coerce.number().min(0, "Must be ≥ 0").max(90, "Must be ≤ 90").optional());
const ratio01 = z.preprocess(emptyToUndef, z.coerce.number().min(0, "Min 0").max(1, "Max 1").optional());

const schema = z.object({
  rainfall: nonNeg,
  depthToGroundwater: nonNeg,
  poreWaterPressure: nonNeg,
  surfaceRunoff: nonNeg,
  unitWeight: nonNeg,
  cohesion: nonNeg,
  internalFrictionAngle: angle,
  slopeAngle: angle,
  slopeHeight: nonNeg,
  pwpRatio: ratio01,
  benchHeight: nonNeg,
  benchWidth: nonNeg,
  interRampAngle: angle,
});

type FormValues = z.infer<typeof schema>;

/* --------------------------------- STYLES --------------------------------- */
// Placeholder risk data for visual purposes only
const riskLevel = "HIGH RISK" as const;
const riskPercent = 88;
const riskStyles: Record<
  "LOW RISK" | "MODERATE RISK" | "HIGH RISK",
  { chip: string; ring: string; gaugeFrom: string; gaugeTo: string; text: string }
> = {
  "LOW RISK": { chip: "bg-emerald-600 text-white", ring: "ring-emerald-200", gaugeFrom: "#10b981", gaugeTo: "#34d399", text: "text-emerald-700" },
  "MODERATE RISK": { chip: "bg-amber-500 text-white", ring: "ring-amber-200", gaugeFrom: "#f59e0b", gaugeTo: "#fbbf24", text: "text-amber-700" },
  "HIGH RISK": { chip: "bg-red-600 text-white", ring: "ring-red-200", gaugeFrom: "#dc2626", gaugeTo: "#ef4444", text: "text-red-700" },
};
const style = riskStyles[riskLevel];

/* -------------------------------- COMPONENT -------------------------------- */
export function DashboardComponent() {
  const [showResults, setShowResults] = useState(false);
  const [csvData, setCsvData] = useState<ParsedCSVData | null>(null);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
    mode: "onBlur",
  });

  const onSubmit = handleSubmit((_values: any) => {
    // TODO: Send `_values` to the prediction API
    setShowResults(true);
  });

  // Handle CSV data from the upload component
  const handleCSVDataParsed = (data: ParsedCSVData | null) => {
    setCsvData(data);
    setBulkError(null);
    setBulkResults([]);
  };

  // Process bulk predictions
  const processBulkPredictions = async () => {
    if (!csvData || csvData.rows.length === 0) return;

    setIsProcessingBulk(true);
    setBulkError(null);
    setBulkResults([]);

    try {
      // Convert CSV rows to feature arrays
      const featureRows = csvData.rows.map((row: { [x: string]: any; }) => {
        return inputDefs.map(field => {
          const value = row[field.key];
          return typeof value === 'number' ? value : 0;
        });
      });

      // Send to bulk prediction API
      const response = await fetch('/api/predict/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows: featureRows }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bulk prediction failed');
      }

      setBulkResults(result.results || []);
      setShowResults(true);

      if (result.errors && result.errors.length > 0) {
        setBulkError(`Some predictions failed: ${result.errors.length} errors`);
      }

    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Failed to process bulk predictions');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const values = watch();

  return (
    <main className={`${inter.className} min-h-screen bg-slate-100 text-slate-800`}>
      {/* Header */}
      <header className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 opacity-80 [background:radial-gradient(1200px_400px_at_10%_-20%,#dbeafe_10%,transparent_60%),radial-gradient(1200px_400px_at_110%_-40%,#f1f5f9_10%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Rockfall Risk Prediction Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">High-fidelity interface for geotechnical analysis and safety planning.</p>
            </div>
            
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (Inputs) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl bg-white shadow-md ring-1 ring-slate-200">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Manual Analysis</h2>
                    <p className="mt-1 text-sm text-slate-500">Input parameters for a single, real-time risk assessment.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                    <ShieldAlert className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>Critical decision support</span>
                  </div>
                </div>
              </div>
              <form className="p-5" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {inputDefs.map((field) => {
                    const Icon = field.icon || InfoIcon;
                    const err = errors[field.key as keyof FormValues];
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          <Icon className="h-4 w-4 text-slate-400" aria-hidden />
                          {field.name}
                          <InfoIcon className="h-4 w-4 text-slate-400 cursor-help" aria-hidden data-tooltip={field.tip} />
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            placeholder={field.placeholder}
                            className={`w-full rounded-lg border bg-white px-3 py-2 pr-14 text-sm outline-none ring-blue-200 transition focus:ring-2 ${
                              err ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-slate-300"
                            }`}
                            {...register(field.key as keyof FormValues)}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400">
                            {field.placeholder}
                          </span>
                        </div>
                        {err && <p className="text-[11px] font-medium text-red-600">{err.message?.toString()}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <Activity className="h-4 w-4" aria-hidden />
                    Analyze Risk
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
                    onClick={() => {
                      reset();
                      setShowResults(false);
                    }}
                  >
                    <TriangleAlert className="h-4 w-4 text-slate-500" aria-hidden />
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Bulk Analysis (CSV Upload) */}
            <div className="rounded-xl bg-white shadow-md ring-1 ring-slate-200">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-lg font-semibold">Bulk Analysis</h2>
                <p className="mt-1 text-sm text-slate-500">Upload a CSV to evaluate multiple records at once.</p>
              </div>
              <div className="p-5">
                <CSVUpload
                  onDataParsed={handleCSVDataParsed}
                  expectedFields={inputDefs}
                  maxFileSize={10}
                />
                
                {/* Bulk Processing Button */}
                {csvData && csvData.rows.length > 0 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={processBulkPredictions}
                      disabled={isProcessingBulk}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingBulk ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Processing {csvData.rows.length} records...
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4" aria-hidden />
                          Process {csvData.rows.length} Records
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Bulk Error Display */}
                {bulkError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {bulkError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Results) */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-white shadow-md ring-1 ring-slate-200 p-6 min-h-[560px] flex flex-col overflow-hidden">
              {!showResults ? (
                <div className="relative flex h-full flex-1 flex-col items-center justify-center text-center">
                  <div className="pointer-events-none absolute inset-0 opacity-60 [background:conic-gradient(from_90deg_at_50%_50%,#f8fafc_0deg,#eef2ff_90deg,#f1f5f9_180deg,#f8fafc_270deg,#eef2ff_360deg)]" />
                  <div className="relative">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200">
                      <BarChartHorizontalBig className="h-10 w-10 text-slate-300" aria-hidden />
                    </div>
                  </div>
                  <h3 className="relative mt-4 text-lg font-semibold">Ready for analysis</h3>
                  <p className="relative mt-1 max-w-md text-sm text-slate-500">
                    Use Manual Analysis to run a single prediction, or upload a CSV for a bulk run.
                  </p>
                  <div className="relative mt-6 flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-16 rounded-full bg-emerald-500/80" />
                    <span className="h-2 w-16 rounded-full bg-amber-500/80" />
                    <span className="h-2 w-16 rounded-full bg-red-600/80" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bulk Results Summary */}
                  {bulkResults.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold">Bulk Analysis Results</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FileSpreadsheet className="h-4 w-4" aria-hidden />
                          <span>{bulkResults.length} predictions completed</span>
                        </div>
                      </div>
                      
                      {/* Risk Level Distribution */}
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        {['Low', 'Moderate', 'High', 'Critical'].map(level => {
                          const count = bulkResults.filter(r => r.databaseRecord.riskLevel === level).length;
                          const percentage = bulkResults.length > 0 ? (count / bulkResults.length * 100).toFixed(1) : '0';
                          return (
                            <div key={level} className="text-center">
                              <div className="text-lg font-bold text-slate-800">{count}</div>
                              <div className="text-xs text-slate-500">{level}</div>
                              <div className="text-xs text-slate-400">{percentage}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Single Prediction Display */}
                  {bulkResults.length === 0 && (
                    <>
                      {/* Top: Risk Level and Score */}
                      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${style.chip}`}>
                          <span className="h-2 w-2 rounded-full bg-white/90" />
                          {riskLevel}
                        </div>
                        {/* Radial Gauge */}
                        <div className="flex items-center gap-4">
                          <div
                            className={`relative h-28 w-28 rounded-full ring-4 ${style.ring}`}
                            aria-label="Risk probability gauge"
                            style={{ background: `conic-gradient(${style.gaugeFrom} ${riskPercent * 3.6}deg, #e2e8f0 0deg)` }}
                          >
                            <div className="absolute inset-2 rounded-full bg-white" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">{riskPercent}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Probability</p>
                            <p className="text-xs text-slate-500">Estimated likelihood of rockfall</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Bulk Results Table */}
                  {bulkResults.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 p-4">
                        <h4 className="text-base font-semibold">Detailed Results</h4>
                      </div>
                      <div className="max-h-64 overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Row</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Risk Level</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Score</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">Top Factor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkResults.slice(0, 10).map((result, index) => (
                              <tr key={index} className="border-t border-slate-100">
                                <td className="px-3 py-2 font-medium text-slate-500">{result.row}</td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    result.databaseRecord.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                                    result.databaseRecord.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                                    result.databaseRecord.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                    'bg-red-200 text-red-900'
                                  }`}>
                                    {result.databaseRecord.riskLevel}
                                  </span>
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {result.databaseRecord.riskScore.toFixed(1)}%
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {result.databaseRecord.contributingFactors[0]?.factor || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {bulkResults.length > 10 && (
                          <div className="p-3 text-xs text-slate-500 text-center border-t border-slate-100">
                            Showing first 10 of {bulkResults.length} results
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Context strip */}
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600" />
                    <span className={`text-xs font-semibold ${style.text}`}>Context</span>
                  </div>

                  {/* Input Parameters Summary */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-semibold">Parameters Used</h4>
                        <p className="mt-0.5 text-sm text-slate-500">Review the inputs that informed this assessment.</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                        <Layers className="h-4 w-4" aria-hidden />
                        <span>{inputDefs.length} inputs</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {inputDefs.map((f) => (
                        <div key={`summary-${f.key}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">{f.name}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-800">{values[f.key as keyof FormValues] ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Legend */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-slate-500" aria-hidden />
                      <p className="text-sm font-medium">Risk Legend</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-600">Moderate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        <span className="text-slate-600">High/Critical</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}