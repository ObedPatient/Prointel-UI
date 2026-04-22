import React, { useEffect, useRef, useState } from "react";

interface Metric {
  value: string;
  label: string;
  suffix: string;
}

const metrics: Metric[] = [
  { value: "37%", label: "Reduction in material waste", suffix: "" },
  { value: "Real-time", label: "P&L visibility per client job", suffix: "" },
  { value: "100%", label: "Audit trail for RRA compliance", suffix: "" },
  { value: "1 system", label: "From quotation to dispatch", suffix: "" },
];

const MetricsSection: React.FC = () => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) setVisible(true); 
      }, 
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#0f1f44] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-blue-300/60 text-sm font-semibold uppercase tracking-widest mb-12">
          Platform Impact
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 100}ms` }}>
              <p className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">
                {metric.value}
              </p>
              <p className="text-blue-200/70 text-sm leading-relaxed">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;