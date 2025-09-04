"use client";
import { Inter } from "next/font/google";
import { useState } from "react";
// No need to import 'Resolver' when packages are up-to-date
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
} from "lucide-react";

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
] as const;
type Key = (typeof inputDefs)[number]["key"];

/* ---------------------------------- ZOD ----------------------------------- */
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

// Use z.infer<T> to get the TypeScript type from a schema. It's the standard.
type FormValues = z.infer<typeof schema>;

/* --------------------------------- STYLES --------------------------------- */
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // With up-to-date packages, passing the resolver directly works
    // without any extra typing. TypeScript can now infer the types correctly.
    resolver: zodResolver(schema),
    defaultValues: {},
    mode: "onBlur",
  });

  const onSubmit = handleSubmit((_values) => {
    setShowResults(true);
  });

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
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
              <GaugeIcon className="h-4 w-4 text-slate-500" aria-hidden />
              <span className="text-xs text-slate-600">Design prototype — logic not implemented</span>
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
                    const err = errors[field.key];
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
                            {...register(field.key)}
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
            {/* Bulk Analysis (placeholder UI) */}
            <div className="rounded-xl bg-white shadow-md ring-1 ring-slate-200">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-lg font-semibold">Bulk Analysis</h2>
                <p className="mt-1 text-sm text-slate-500">Upload a CSV to evaluate multiple records at once.</p>
              </div>
              <div className="p-5">
                <label
                  htmlFor="csv-upload"
                  className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:bg-slate-100 focus-within:border-blue-400 focus-within:bg-blue-50/40"
                >
                  <div className="absolute -top-3 left-4 rounded-md bg-white px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    CSV Upload
                  </div>
                  <UploadCloud className="h-9 w-9 text-slate-500 group-hover:text-slate-600" aria-hidden />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Drag & drop your CSV here, or click to browse</p>
                    <p className="text-xs text-slate-500">Max size 10MB • .csv only</p>
                  </div>
                  <input id="csv-upload" type="file" accept=".csv" className="hidden" />
                </label>
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                    <FileSpreadsheet className="h-4 w-4" aria-hidden />
                    Download CSV Template
                  </button>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FileUp className="h-4 w-4" aria-hidden />
                    <span>Bulk import for batch predictions</span>
                  </div>
                </div>
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
                          <p className="mt-0.5 text-sm font-medium text-slate-800">{values[f.key] ?? "—"}</p>
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
            <p className="mt-3 text-xs text-slate-500">
              Note: This is a design prototype. Calculations, CSV parsing, and state management are intentionally not implemented.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}