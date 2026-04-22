import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, TrendingUp, BarChart3, Layers, LucideIcon } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const HeroSection: React.FC = () => {
  const kpis: KPI[] = [
    { label: "Gross Margin", value: "24.8%", icon: TrendingUp, color: "text-green-400" },
    { label: "Active Jobs", value: "12", icon: Layers, color: "text-blue-400" },
    { label: "QC Pass Rate", value: "94.2%", icon: BarChart3, color: "text-cyan-400" },
  ];

  const productionData: number[] = [60, 85, 45, 92, 70, 38, 78];
  const flowSteps: string[] = ["Procurement", "→", "Production", "→", "QC", "→", "Dispatch"];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-[#0f1f44] via-[#1a2f5e] to-[#0f1f44]">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      {/* Glow blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Manufacturing Intelligence Platform
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Know your job costs{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              in real time.
            </span>
          </h1>

          <p className="text-lg text-blue-100/80 leading-relaxed max-w-lg">
            From material issue to final dispatch — ProdIntel connects procurement, production, quality, and finance, giving you live gross profit per job, per client.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/tenant-register"
              className="group flex items-center gap-2 px-7 py-3.5 bg-[#3b82f6] text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/30 text-base">
              Get started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 px-6 py-3.5 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/10 transition-all text-base"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3 h-3 fill-white text-white ml-0.5" />
              </div>
              See Live Demo
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-blue-200/60">
            <span>✓ No credit card required</span>
            <span>✓ Full access to all modules</span>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative hidden lg:block">
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-2xl">
            {/* Mockup header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 h-6 bg-white/10 rounded-md" />
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-white/10 rounded-xl p-3">
                  <kpi.icon className={`w-4 h-4 ${kpi.color} mb-2`} />
                  <p className="text-white font-bold text-lg">{kpi.value}</p>
                  <p className="text-blue-200/60 text-xs">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Fake bar chart */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-blue-200/60 mb-3">Production Output by Job</p>
              <div className="flex items-end gap-2 h-24">
                {productionData.map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-md" style={{ height: `${height}%`, background: index % 2 === 0 ? "#3b82f6" : "#1e3a5f" }} />
                ))}
              </div>
            </div>

            {/* Flow indicators */}
            <div className="mt-4 flex items-center gap-2 overflow-hidden">
              {flowSteps.map((step, index) => (
                <span key={index} className={`text-xs font-medium whitespace-nowrap ${step === "→" ? "text-blue-400" : "text-blue-200/80 bg-white/10 px-2 py-1 rounded-md"}`}>
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30">
            Live P&L ✓
          </div>
          <div className="absolute -bottom-4 -left-4 bg-[#1a2744] border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl">
            RRA Compliant
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
