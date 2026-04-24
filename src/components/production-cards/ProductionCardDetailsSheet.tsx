import { CalendarDays, Factory, FileText, Pencil, Trash2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProductionCard, ProductionCardStatus } from "@/types/production-card";

interface ProductionCardDetailsSheetProps {
  card: ProductionCard | null;
  open: boolean;
  onClose: () => void;
  onEdit: (card: ProductionCard) => void;
  onDelete: (card: ProductionCard) => void;
}

const STATUS_TONES: Record<ProductionCardStatus, string> = {
  Draft: "border-slate-300 bg-slate-100 text-slate-700",
  "In Production": "border-blue-200 bg-blue-100 text-blue-700",
  "QC Review": "border-violet-200 bg-violet-100 text-violet-700",
  "Materials Confirmed": "border-amber-200 bg-amber-100 text-amber-700",
  Completed: "border-green-200 bg-green-100 text-green-700",
  Cancelled: "border-red-200 bg-red-100 text-red-700",
};

function formatDate(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA");
}

function formatCurrency(value: number): string {
  return `RWF ${value.toLocaleString()}`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-card/60 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Factory;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductionCardDetailsSheet({
  card,
  open,
  onClose,
  onEdit,
  onDelete,
}: ProductionCardDetailsSheetProps) {
  const ordered = card?.target_quantity ?? 0;
  const netGood = card?.actual_output_quantity ?? 0;
  const progress = ordered > 0 ? Math.min(100, Math.round((netGood / ordered) * 100)) : 0;
  const totalCost =
    (card?.total_material_cost ?? 0) +
    (card?.total_machine_cost ?? 0) +
    (card?.total_wastage_cost ?? 0) +
    (card?.total_rework_cost ?? 0);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        {card && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SheetTitle>{card.job_number}</SheetTitle>
                  <SheetDescription>
                    Review and manage this production card without leaving the list.
                  </SheetDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[card.status]}`}
                >
                  {card.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                <Button type="button" variant="outline" className="gap-2" onClick={() => onEdit(card)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  onClick={() => onDelete(card)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="space-y-6 px-6 py-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <StatCard icon={Factory} label="Target Quantity" value={ordered.toLocaleString()} />
                  <StatCard icon={Wallet} label="Total Cost" value={formatCurrency(totalCost)} />
                  <StatCard icon={FileText} label="Net Good Output" value={netGood.toLocaleString()} />
                  <StatCard icon={CalendarDays} label="Completion Progress" value={`${progress}%`} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Card Details</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem label="Customer" value={card.customer_id || "-"} />
                    <DetailItem
                      label="Sales Order"
                      value={card.customer_order_id || "Ad-hoc / no sales order"}
                    />
                    <DetailItem
                      label="Product Category"
                      value={card.product_category_id || "-"}
                    />
                    <DetailItem
                      label="Bill of Materials"
                      value={card.bill_of_materials_id || "-"}
                    />
                    <DetailItem label="Start Date" value={formatDate(card.start_date)} />
                    <DetailItem
                      label="Target Completion"
                      value={formatDate(card.target_completion_date)}
                    />
                    <DetailItem
                      label="Selling Price"
                      value={formatCurrency(card.agreed_selling_price)}
                    />
                    <DetailItem label="Created At" value={formatDate(card.created_at)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Production Metrics</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem
                      label="Material Cost"
                      value={formatCurrency(card.total_material_cost)}
                    />
                    <DetailItem
                      label="Machine Cost"
                      value={formatCurrency(card.total_machine_cost)}
                    />
                    <DetailItem
                      label="Wastage Cost"
                      value={formatCurrency(card.total_wastage_cost)}
                    />
                    <DetailItem
                      label="Rework Cost"
                      value={formatCurrency(card.total_rework_cost)}
                    />
                    <DetailItem
                      label="Actual Output"
                      value={netGood.toLocaleString()}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Output Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
