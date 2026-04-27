import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  MapPin,
  Package,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  StockCard,
  StockCardReferenceType,
  StockCardTransactionType,
} from "@/types/stock-card";

interface StockCardDetailsSheetProps {
  card: StockCard | null;
  open: boolean;
  onClose: () => void;
}

const TRANSACTION_TONES: Record<StockCardTransactionType, string> = {
  "Opening Balance": "border-slate-300 bg-slate-100 text-slate-700",
  Receipt: "border-green-200 bg-green-100 text-green-700",
  Issue: "border-blue-200 bg-blue-100 text-blue-700",
  Transfer: "border-violet-200 bg-violet-100 text-violet-700",
  Adjustment: "border-amber-200 bg-amber-100 text-amber-700",
  Return: "border-cyan-200 bg-cyan-100 text-cyan-700",
};

const REFERENCE_TONES: Record<StockCardReferenceType, string> = {
  "Manual Entry": "border-slate-300 bg-slate-100 text-slate-700",
  "Goods Received Note": "border-emerald-200 bg-emerald-100 text-emerald-700",
  "Production Card": "border-blue-200 bg-blue-100 text-blue-700",
  "Stock Transfer": "border-violet-200 bg-violet-100 text-violet-700",
  "Stock Adjustment": "border-amber-200 bg-amber-100 text-amber-700",
  "Return Note": "border-cyan-200 bg-cyan-100 text-cyan-700",
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

function formatDateTime(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString("en-CA")} ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatQuantity(value: number): string {
  return value.toLocaleString();
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-card/60 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
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

export default function StockCardDetailsSheet({
  card,
  open,
  onClose,
}: StockCardDetailsSheetProps) {
  const netMovement = (card?.quantity_in ?? 0) - (card?.quantity_out ?? 0);
  const movementLabel =
    netMovement > 0 ? `+${formatQuantity(netMovement)}` : formatQuantity(netMovement);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        {card && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border px-6 py-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle>{card.raw_material_id}</SheetTitle>
                    <SheetDescription>
                      Review this stock card movement without leaving the inventory list.
                    </SheetDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TRANSACTION_TONES[card.transaction_type]}`}
                  >
                    {card.transaction_type}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${REFERENCE_TONES[card.reference_type]}`}
                  >
                    {card.reference_type}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
                    {card.reference_number || "No reference number"}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="space-y-6 px-6 py-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <StatCard
                    icon={Package}
                    label="Opening Balance"
                    value={formatQuantity(card.opening_balance)}
                  />
                  <StatCard
                    icon={Package}
                    label="Closing Balance"
                    value={formatQuantity(card.closing_balance)}
                  />
                  <StatCard
                    icon={netMovement >= 0 ? ArrowDown : ArrowUp}
                    label="Net Movement"
                    value={movementLabel}
                  />
                  <StatCard
                    icon={Wallet}
                    label="Stock Value"
                    value={formatCurrency(card.stock_value_rwf)}
                  />
                </div>

                {(card.waste_quantity > 0 || card.waste_reason_id) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-600" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-amber-900">Wastage recorded</p>
                        <p className="text-sm text-amber-800">
                          {formatQuantity(card.waste_quantity)}
                          {card.waste_reason_id ? ` marked against ${card.waste_reason_id}.` : "."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Transaction Details</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem label="Transaction Date" value={formatDate(card.transaction_date)} />
                    <DetailItem label="Transaction Type" value={card.transaction_type} />
                    <DetailItem label="Opening Balance" value={formatQuantity(card.opening_balance)} />
                    <DetailItem label="Quantity In" value={formatQuantity(card.quantity_in)} />
                    <DetailItem label="Quantity Out" value={formatQuantity(card.quantity_out)} />
                    <DetailItem label="Closing Balance" value={formatQuantity(card.closing_balance)} />
                    <DetailItem label="Waste Quantity" value={formatQuantity(card.waste_quantity)} />
                    <DetailItem
                      label="Weighted Average Unit Cost"
                      value={formatCurrency(card.weighted_average_unit_cost)}
                    />
                    <DetailItem label="Stock Value RWF" value={formatCurrency(card.stock_value_rwf)} />
                    <DetailItem label="Stock Card ID" value={card.id} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Reference & Traceability</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem label="Tenant ID" value={card.tenant_id} />
                    <DetailItem label="Raw Material ID" value={card.raw_material_id} />
                    <DetailItem label="Reference Type" value={card.reference_type} />
                    <DetailItem label="Reference ID" value={card.reference_id} />
                    <DetailItem label="Reference Number" value={card.reference_number} />
                    <DetailItem label="Warehouse Location" value={card.warehouse_location_id} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Audit Details</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem label="Created By" value={card.created_by} />
                    <DetailItem label="Created At" value={formatDateTime(card.created_at)} />
                    <DetailItem label="Waste Reason ID" value={card.waste_reason_id || "-"} />
                    <DetailItem label="Movement Reference" value={card.reference_number || card.reference_id} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card/60 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">Warehouse</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{card.warehouse_location_id || "-"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card/60 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">Recorded On</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDateTime(card.created_at)}</p>
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
