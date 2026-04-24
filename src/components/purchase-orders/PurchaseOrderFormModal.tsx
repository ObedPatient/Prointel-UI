import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { PurchaseOrder, PurchaseOrderLine, SupplierOption } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateMaterialId } from "@/lib/purchase-orders";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

interface PurchaseOrderFormModalProps {
  order?: PurchaseOrder | null;
  supplierOptions: SupplierOption[];
  onSubmit: (order: PurchaseOrder) => void;
  onClose: () => void;
}

interface PurchaseOrderLineFormState {
  id: string;
  raw_material_name: string;
  description: string;
  quantity_ordered: string;
  unit_of_measure: string;
  unit_price: string;
  quantity_received: string;
}

interface PurchaseOrderFormState {
  supplier_id: string;
  delivery_address: string;
  required_delivery_date: string;
  lines: PurchaseOrderLineFormState[];
}

function toInputNumber(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

function createLineState(line?: PurchaseOrderLine): PurchaseOrderLineFormState {
  return {
    id: crypto.randomUUID(),
    raw_material_name: line?.raw_material_name ?? "",
    description: line?.description ?? "",
    quantity_ordered: line ? toInputNumber(line.quantity_ordered) : "",
    unit_of_measure: line?.unit_of_measure ?? "",
    unit_price: line ? toInputNumber(line.unit_price) : "",
    quantity_received: line ? toInputNumber(line.quantity_received) : "0",
  };
}

function createInitialState(order?: PurchaseOrder | null): PurchaseOrderFormState {
  return {
    supplier_id: order?.supplier_id ?? "",
    delivery_address: order?.delivery_address ?? "",
    required_delivery_date: order?.required_delivery_date
      ? order.required_delivery_date.slice(0, 10)
      : "",
    lines: order?.lines.length ? order.lines.map(createLineState) : [createLineState()],
  };
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PurchaseOrderFormModal({
  order = null,
  supplierOptions,
  onSubmit,
  onClose,
}: PurchaseOrderFormModalProps) {
  const [form, setForm] = useState<PurchaseOrderFormState>(() => createInitialState(order));

  const totalAmount = useMemo(
    () =>
      form.lines.reduce(
        (sum, line) => sum + parseNumber(line.quantity_ordered) * parseNumber(line.unit_price),
        0,
      ),
    [form.lines],
  );

  const handleFieldChange =
    (field: Exclude<keyof PurchaseOrderFormState, "lines">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSupplierChange = (value: string) => {
    setForm((current) => ({ ...current, supplier_id: value }));
  };

  const handleLineChange =
    (lineId: string, field: keyof Omit<PurchaseOrderLineFormState, "id">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      setForm((current) => ({
        ...current,
        lines: current.lines.map((line) =>
          line.id === lineId ? { ...line, [field]: nextValue } : line,
        ),
      }));
    };

  const addLine = () => {
    setForm((current) => ({ ...current, lines: [...current.lines, createLineState()] }));
  };

  const removeLine = (lineId: string) => {
    setForm((current) => ({
      ...current,
      lines:
        current.lines.length === 1
          ? current.lines
          : current.lines.filter((line) => line.id !== lineId),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const createdAt = order?.created_at ?? new Date().toISOString();
    const purchaseOrderId = order?.po_number ?? "";

    const lines: PurchaseOrderLine[] = form.lines.map((line, index) => ({
      purchase_order_id: purchaseOrderId,
      tenant_id: order?.tenant_id ?? DEFAULT_TENANT_ID,
      line_number: index + 1,
      raw_material_id: generateMaterialId(line.raw_material_name, index + 1),
      raw_material_name: line.raw_material_name.trim(),
      description: line.description.trim(),
      quantity_ordered: parseNumber(line.quantity_ordered),
      unit_of_measure: line.unit_of_measure.trim(),
      unit_price: parseNumber(line.unit_price),
      quantity_received: parseNumber(line.quantity_received),
      created_at: order?.lines[index]?.created_at ?? createdAt,
    }));

    onSubmit({
      po_number: purchaseOrderId,
      tenant_id: order?.tenant_id ?? DEFAULT_TENANT_ID,
      supplier_id: form.supplier_id,
      delivery_address: form.delivery_address.trim(),
      required_delivery_date: form.required_delivery_date,
      status: order?.status ?? "Submitted",
      total_amount: lines.reduce(
        (sum, line) => sum + line.quantity_ordered * line.unit_price,
        0,
      ),
      created_by: order?.created_by ?? "",
      submitted_at: order?.submitted_at ?? null,
      approved_by: order?.approved_by ?? null,
      approved_at: order?.approved_at ?? null,
      rejection_reason: order?.rejection_reason ?? null,
      closed_at: order?.closed_at ?? null,
      created_at: createdAt,
      lines,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{order ? "Update Purchase Order" : "Create Purchase Order"}</DialogTitle>
          <DialogDescription>
            Capture header details and as many purchase order lines as needed in one flow.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Purchase Order Details</h2>
                <p className="text-sm text-muted-foreground">
                  Fill in the delivery details before adding line items.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Supplier *</label>
                  <Select value={form.supplier_id} onValueChange={handleSupplierChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierOptions.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Required Delivery Date *
                  </label>
                  <Input
                    required
                    type="date"
                    value={form.required_delivery_date}
                    onChange={handleFieldChange("required_delivery_date")}
                    className="mt-1"
                  />
                </div>

                <div className="xl:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground">
                    Delivery Address *
                  </label>
                  <Textarea
                    required
                    value={form.delivery_address}
                    onChange={handleFieldChange("delivery_address")}
                    placeholder="Warehouse or factory delivery address"
                    className="mt-1 min-h-[88px]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Line Items</h2>
                  <p className="text-sm text-muted-foreground">
                    Add one or more materials to the same purchase order.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm">
                    Total: <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
                  </div>
                  <Button type="button" variant="outline" onClick={addLine} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Line
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {form.lines.map((line, index) => {
                  const lineTotal =
                    parseNumber(line.quantity_ordered) * parseNumber(line.unit_price);

                  return (
                    <div
                      key={line.id}
                      className="rounded-xl border border-border bg-background/60 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Line {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Subtotal {formatCurrency(lineTotal)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                          disabled={form.lines.length === 1}
                          className="gap-2 text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Material Name *
                          </label>
                          <Input
                            required
                            value={line.raw_material_name}
                            onChange={handleLineChange(line.id, "raw_material_name")}
                            placeholder="Brown Kraft Paper Rolls"
                            className="mt-1"
                          />
                        </div>

                        <div className="xl:col-span-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Description *
                          </label>
                          <Textarea
                            required
                            value={line.description}
                            onChange={handleLineChange(line.id, "description")}
                            placeholder="Describe the raw material being ordered"
                            className="mt-1 min-h-[72px]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Quantity Ordered *
                          </label>
                          <Input
                            required
                            min="0"
                            step="0.01"
                            type="number"
                            value={line.quantity_ordered}
                            onChange={handleLineChange(line.id, "quantity_ordered")}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Unit of Measure *
                          </label>
                          <Input
                            required
                            value={line.unit_of_measure}
                            onChange={handleLineChange(line.id, "unit_of_measure")}
                            placeholder="kg, rolls, bags"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Unit Price *
                          </label>
                          <Input
                            required
                            min="0"
                            step="0.01"
                            type="number"
                            value={line.unit_price}
                            onChange={handleLineChange(line.id, "unit_price")}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Quantity Received
                          </label>
                          <Input
                            min="0"
                            step="0.01"
                            type="number"
                            value={line.quantity_received}
                            onChange={handleLineChange(line.id, "quantity_received")}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {order ? "Save Purchase Order" : "Create Purchase Order"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
