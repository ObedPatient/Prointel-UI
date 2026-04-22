import React from "react";
import { DollarSign, Package, Shield, Lock, Wrench, TrendingUp, LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  color: string;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: DollarSign,
    color: "bg-blue-100 text-blue-600",
    title: "Job Costing Live",
    desc: "See gross profit per production card as it runs — materials, machine time, wastage, rework. No more spreadsheets.",
  },
  {
    icon: Package,
    color: "bg-emerald-100 text-emerald-600",
    title: "Raw Material to Finished Goods",
    desc: "Track every sheet of board, every litre of ink. GRN → Stock card → Production issuance → Finished goods dispatch.",
  },
  {
    icon: Shield,
    color: "bg-amber-100 text-amber-600",
    title: "Quality at Every Stage",
    desc: "Mandatory QC checkpoints at pre-press, printing, cutting, finishing. Catch defects before they become costly waste.",
  },
  {
    icon: Lock,
    color: "bg-purple-100 text-purple-600",
    title: "Multi-tenant & Secure",
    desc: "Complete data isolation. Your production data never mixes with other tenants. RRA-ready audit trails built in.",
  },
  {
    icon: Wrench,
    color: "bg-rose-100 text-rose-600",
    title: "Equipment & Maintenance",
    desc: "Machine register, hourly cost rates, preventive maintenance alerts. Know your true machine cost per job.",
  },
  {
    icon: TrendingUp,
    color: "bg-cyan-100 text-cyan-600",
    title: "Client P&L Visibility",
    desc: "Which clients are most profitable? Which jobs ate margin? ProdIntel shows you instantly.",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-24 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-bold text-[#1a2744] mb-4">Everything you need to run a smarter factory</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            One platform that replaces disconnected spreadsheets, WhatsApp chains, and guesswork.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index}
              className="group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-blue-100">
              <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1a2744] mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
