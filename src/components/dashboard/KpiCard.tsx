import type { ReactNode } from "react";

type KpiVariant = "default" | "teal";

interface KpiCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  variant?: KpiVariant;
}

const bgMap: Record<KpiVariant, string> = {
  default: "bg-card",
  teal: "bg-teal-50",
};

const iconBgMap: Record<KpiVariant, string> = {
  default: "bg-secondary",
  teal: "bg-teal-100",
};

export default function KpiCard({
  icon,
  value,
  label,
  variant = "default",
}: KpiCardProps) {
  return (
    <div className={`${bgMap[variant]} flex min-w-0 flex-col gap-3 rounded-xl border border-border p-4`}>
      <div
        className={`${iconBgMap[variant]} flex h-8 w-8 items-center justify-center rounded-lg`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
