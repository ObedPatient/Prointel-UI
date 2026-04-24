import { AlertTriangle } from "lucide-react";
import type { ProductionCard, ProductionCardStatus } from "@/types/production-card";

interface StatusBadgeProps {
  status?: ProductionCardStatus;
}

interface StatProps {
  label: string;
  value?: string | number;
  valueClass?: string;
}

interface ProductionCardRowProps {
  card: ProductionCard;
  onSelect: (card: ProductionCard) => void;
  selected?: boolean;
}

const STATUS_STYLES: Record<ProductionCardStatus, string> = {
  Draft: "bg-secondary text-muted-foreground border-border",
  "In Production": "bg-blue-50 text-blue-700 border-blue-200",
  "QC Review": "bg-purple-50 text-purple-700 border-purple-200",
  "Materials Confirmed": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

function formatShortDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA");
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${(status && STATUS_STYLES[status]) ?? "bg-secondary text-muted-foreground border-border"}`}>
    {status || "—"}
  </span>
);

const Stat = ({ label, value, valueClass = "text-foreground" }: StatProps) => (
  <div className="min-w-[60px]">
    <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
    <p className={`text-sm font-semibold ${valueClass}`}>{value ?? "—"}</p>
  </div>
);

export default function ProductionCardRow({
  card,
  onSelect,
  selected = false,
}: ProductionCardRowProps) {
  const ordered = card.target_quantity ?? 0;
  const netGood = card.actual_output_quantity ?? 0;

  const wastage = ordered > 0
    ? (((ordered - netGood) / ordered) * 100).toFixed(1)
    : "0.0";

  const netCost = (card.total_material_cost ?? 0) + (card.total_machine_cost ?? 0);
  const unitCost = ordered > 0 && netCost > 0 ? Math.round(netCost / ordered) : null;

  const margin = card.agreed_selling_price && card.agreed_selling_price > 0 && netCost > 0
    ? Math.round(((card.agreed_selling_price - netCost) / card.agreed_selling_price) * 100)
    : null;

  const progress = ordered > 0 ? Math.min(100, Math.round((netGood / ordered) * 100)) : 0;
  const wastageHigh = parseFloat(wastage) > 1;

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className={`w-full overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary/30 hover:shadow-md ${
        selected ? "border-primary shadow-sm ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="px-5 pt-4 pb-3 space-y-3">
        {/* Row 1: name + status + order ref | job + due */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">{card.customer_id ?? "—"}</span>
            <StatusBadge status={card.status} />
            {card.customer_order_id && (
              <span className="text-[11px] text-blue-600 font-mono bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Order {card.customer_order_id}
              </span>
            )}
          </div>
          <div className="text-right shrink-0 text-[11px] text-muted-foreground">
            <div>Job {card.job_number}</div>
            {card.target_completion_date && (
              <div>Due {formatShortDate(card.target_completion_date)}</div>
            )}
          </div>
        </div>

        {/* Row 2: subtitle */}
        <p className="text-xs text-muted-foreground -mt-1">
          {[card.job_number, card.product_category_id].filter(Boolean).join(" · ")}
        </p>

        {/* Row 3: cost cols + quantity stats */}
        <div className="flex items-start gap-8 flex-wrap">
          {card.total_material_cost != null && <Stat label="Material Cost" value={`RWF ${card.total_material_cost.toLocaleString()}`} />}
          {card.total_machine_cost != null && <Stat label="Machine Cost" value={`RWF ${card.total_machine_cost.toLocaleString()}`} />}
          {card.total_wastage_cost != null && <Stat label="Wastage Cost" value={`RWF ${card.total_wastage_cost.toLocaleString()}`} />}
          {card.total_rework_cost != null && <Stat label="Rework Cost" value={`RWF ${card.total_rework_cost.toLocaleString()}`} />}
          <div className="flex-1" />
          <Stat label="Ordered" value={ordered > 0 ? ordered.toLocaleString() : "—"} />
          <Stat label="Net Good" value={netGood > 0 ? netGood.toLocaleString() : "—"} />
        </div>

        {/* Row 4: wastage + unit cost + margin */}
        <div className="flex items-center gap-4 text-xs">
          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${wastageHigh ? "text-amber-500" : "text-muted-foreground"}`} />
          <span>
            Wastage{" "}
            <span className={`font-semibold ${wastageHigh ? "text-red-500" : "text-green-600"}`}>{wastage}%</span>
            <span className="text-muted-foreground"> / 1% target</span>
          </span>
          {unitCost != null && (
            <span>Unit Cost <span className="font-semibold text-foreground">RWF {unitCost.toLocaleString()}</span></span>
          )}
          {margin !== null && (
            <span>Margin <span className={`font-semibold ${margin >= 20 ? "text-green-600" : "text-amber-500"}`}>{margin}%</span></span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-secondary">
        <div className="absolute left-0 top-0 h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        <span className="absolute right-2 -top-4 text-[10px] text-muted-foreground">{progress}%</span>
      </div>
    </button>
  );
}
