import React from "react";

interface Module {
  label: string;
  color: string;
  items: string[];
}

const modules: Module[] = [
  { label: "Procurement", color: "bg-blue-600", items: ["Suppliers", "Purchase Orders", "GRN"] },
  { label: "Inventory", color: "bg-indigo-600", items: ["Stock Cards", "Material Issuance", "Wastage Log"] },
  { label: "Production", color: "bg-purple-600", items: ["Production Cards", "Machine Logs", "QC Checks"] },
  { label: "Dispatch", color: "bg-cyan-600", items: ["Finished Goods", "Delivery Notes", "Client Orders"] },
  { label: "Finance", color: "bg-emerald-600", items: ["Job Costing", "Reconciliation", "Reports"] },
];

const IntegrationMapSection: React.FC = () => {
  return (
    <section id="about" className="scroll-mt-24 py-24 bg-[#0f1f44] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Platform Architecture</p>
          <h2 className="text-4xl font-bold text-white mb-4">One connected intelligence layer</h2>
          <p className="text-blue-200/70 text-lg max-w-2xl mx-auto">
            Every module feeds real data into a single source of truth — so your numbers are always live, always accurate.
          </p>
        </div>

        {/* Flow map */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          {modules.map((mod, index) => (
            <div key={index} className="flex lg:flex-col items-center gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-44 hover:bg-white/10 transition-all">
                <div className={`w-8 h-8 rounded-lg ${mod.color} mb-3 flex items-center justify-center`}>
                  <span className="text-white font-bold text-xs">{index + 1}</span>
                </div>
                <p className="text-white font-semibold text-sm mb-3">{mod.label}</p>
                <ul className="space-y-1">
                  {mod.items.map((item) => (
                    <li key={item} className="text-blue-200/60 text-xs flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {index < modules.length - 1 && (
                <div className="text-blue-400 font-bold text-lg hidden lg:block">→</div>
              )}
              {index < modules.length - 1 && (
                <div className="text-blue-400 font-bold text-lg lg:hidden">↓</div>
              )}
            </div>
          ))}
        </div>

        {/* Central label */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-400/30 rounded-full px-6 py-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-blue-200 text-sm font-medium">All modules feed into live gross profit per job, per client</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationMapSection;
