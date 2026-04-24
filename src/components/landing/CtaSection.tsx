import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import React from "react";

const CtaSection: React.FC = () => {
  return (
    <section className="scroll-mt-24 py-28 bg-gradient-to-br from-[#1a2f5e] to-[#0f1f44] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/15 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-6 text-center space-y-8">
        <h2 className="text-5xl font-bold text-white leading-tight">
          Ready to know your true{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            manufacturing costs?
          </span>
        </h2>
        <p className="text-lg text-blue-200/80">
          Join manufacturers who stopped guessing and started knowing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/tenant-register"
            className="group flex items-center gap-2 px-8 py-4 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/30 text-base">
            Get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <p className="text-blue-300/50 text-sm">Full access to all modules.</p>
      </div>
    </section>
  );
};

export default CtaSection;
