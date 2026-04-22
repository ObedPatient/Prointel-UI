import React from "react";

interface Step {
  num: string;
  title: string;
  desc: string;
  badge: string;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Onboard your tenant",
    desc: "5-minute setup. Enter your company details, VAT settings, and EBM info. Invite your team by email.",
    badge: "5 min setup",
  },
  {
    num: "02",
    title: "Configure BOMs & Machines",
    desc: "Set up your products, bill of materials, machine cost rates, and approved supplier list.",
    badge: "One-time",
  },
  {
    num: "03",
    title: "Run production, see live costs",
    desc: "Create production cards, log QC checkpoints, track material issuance and wastage — margins update live.",
    badge: "Real-time",
  },
  {
    num: "04",
    title: "Dispatch & Invoice",
    desc: "Finished goods dispatched to customers with delivery notes. EBM-ready invoices, full audit trail for RRA.",
    badge: "Compliant",
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="product" className="scroll-mt-24 py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl font-bold text-[#1a2744] mb-4">Up and running in minutes</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            No lengthy implementation. No consultants. Just a clear path from setup to insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

          {steps.map((step, index) => (
            <div key={index} className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#0f1f44] text-white font-bold text-sm flex items-center justify-center mb-5 relative z-10">
                {step.num}
              </div>
              <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-3">
                {step.badge}
              </span>
              <h3 className="text-base font-bold text-[#1a2744] mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
