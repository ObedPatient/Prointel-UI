import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import {
  WAREHOUSE_LOCATION_OPTIONS,
  generateNextGrnNumber,
  listGoodReceiptPurchaseOrderLineOptions,
  listGoodReceiptPurchaseOrderOptions,
} from "@/lib/good-receipt-notes";
import type { PurchaseOrder } from "@/types/purchase-order";
import type {
  GoodReceiptNote,
  GoodReceiptNoteFormData,
  GoodReceiptNoteLineFormData,
} from "@/types/good-receipt-note";

interface GoodReceiptNoteFormModalProps {
  note?: GoodReceiptNote | null;
  existingNotes: GoodReceiptNote[];
  purchaseOrders: PurchaseOrder[];
  onSubmit: (payload: GoodReceiptNoteFormData) => void;
  onClose: () => void;
}

interface GoodReceiptNoteLineFormState {
  id: string;
  po_line_id: string;
  raw_material_id: string;
  quantity_received: string;
  batch_lot_number: string;
  expiry_date: string;
  warehouse_location_id: string;
}

interface GoodReceiptNoteFormState {
  purchase_order_id: string;
  warehouse_location_id: string;
  receipt_date: string;
  notes: string;
  lines: GoodReceiptNoteLineFormState[];
}

function toInputValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

function createLineState(
  line?: GoodReceiptNote["lines"][number],
  fallbackWarehouseLocationId = "",
): GoodReceiptNoteLineFormState {
  return {
    id: line?.id ?? crypto.randomUUID(),
    po_line_id: line?.po_line_id ?? "",
    raw_material_id: line?.raw_material_id ?? "",
    quantity_received: line ? toInputValue(line.quantity_received) : "",
    batch_lot_number: line?.batch_lot_number ?? "",
    expiry_date: line?.expiry_date ?? "",
    warehouse_location_id: line?.warehouse_location_id ?? fallbackWarehouseLocationId,
  };
}

function createInitialState(note?: GoodReceiptNote | null): GoodReceiptNoteFormState {
  return {
    purchase_order_id: note?.purchase_order_id ?? "",
    warehouse_location_id: note?.warehouse_location_id ?? "",
    receipt_date: note?.receipt_date ?? new Date().toISOString().slice(0, 10),
    notes: note?.notes ?? "",
    lines: note?.lines.length
      ? note.lines.map((line) => createLineState(line, note.warehouse_location_id))
      : [createLineState(undefined, note?.warehouse_location_id ?? "")],
  };
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function GoodReceiptNoteFormModal({
  note = null,
  existingNotes,
  purchaseOrders,
  onSubmit,
  onClose,
}: GoodReceiptNoteFormModalProps) {
  const [form, setForm] = useState<GoodReceiptNoteFormState>(() => createInitialState(note));

  const previewGrnNumber = useMemo(
    () => note?.grn_number ?? generateNextGrnNumber(existingNotes),
    [existingNotes, note?.grn_number],
  );

  const purchaseOrderOptions = useMemo(
    () => listGoodReceiptPurchaseOrderOptions(purchaseOrders),
    [purchaseOrders],
  );

  const selectedPurchaseOrder = useMemo(
    () => purchaseOrders.find((order) => order.po_number === form.purchase_order_id) ?? null,
    [form.purchase_order_id, purchaseOrders],
  );

  const selectedSupplierName = selectedPurchaseOrder
    ? purchaseOrderOptions.find((option) => option.value === selectedPurchaseOrder.po_number)?.supplierName ?? "—"
    : "—";
  const selectedSupplierId = selectedPurchaseOrder?.supplier_id ?? "";

  const purchaseOrderLineOptions = useMemo(
    () => listGoodReceiptPurchaseOrderLineOptions(form.purchase_order_id, purchaseOrders),
    [form.purchase_order_id, purchaseOrders],
  );

  const handleFieldChange =
    (field: Exclude<keyof GoodReceiptNoteFormState, "lines">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      setForm((current) => ({ ...current, [field]: nextValue }));
    };

  const handlePurchaseOrderChange = (value: string) => {
    setForm((current) => ({
      ...current,
      purchase_order_id: value,
      lines: current.lines.map((line) => ({
        ...line,
        po_line_id: "",
        raw_material_id: "",
      })),
    }));
  };

  const handleLineChange =
    (
      lineId: string,
      field: keyof Omit<GoodReceiptNoteLineFormState, "id" | "po_line_id" | "raw_material_id">,
    ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setForm((current) => ({
        ...current,
        lines: current.lines.map((line) =>
          line.id === lineId ? { ...line, [field]: nextValue } : line,
        ),
      }));
    };

  const handleWarehouseLocationChange = (value: string) => {
    setForm((current) => ({
      ...current,
      warehouse_location_id: value,
      lines: current.lines.map((line) => ({
        ...line,
        warehouse_location_id: line.warehouse_location_id || value,
      })),
    }));
  };

  const handleLineWarehouseChange = (lineId: string, value: string) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId ? { ...line, warehouse_location_id: value } : line,
      ),
    }));
  };

  const handlePoLineChange = (lineId: string, value: string) => {
    const option = purchaseOrderLineOptions.find((item) => item.value === value);

    setForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              po_line_id: value,
              raw_material_id: option?.rawMaterialId ?? "",
              warehouse_location_id: line.warehouse_location_id || current.warehouse_location_id,
            }
          : line,
      ),
    }));
  };

  const addLine = () => {
    setForm((current) => ({
      ...current,
      lines: [...current.lines, createLineState(undefined, current.warehouse_location_id)],
    }));
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

    const lines: GoodReceiptNoteLineFormData[] = form.lines.map((line) => ({
      po_line_id: line.po_line_id,
      raw_material_id: line.raw_material_id,
      quantity_received: parseNumber(line.quantity_received),
      batch_lot_number: line.batch_lot_number.trim(),
      expiry_date: line.expiry_date || null,
      warehouse_location_id: line.warehouse_location_id || form.warehouse_location_id,
    }));

    onSubmit({
      purchase_order_id: form.purchase_order_id,
      supplier_id: selectedSupplierId,
      warehouse_location_id: form.warehouse_location_id,
      receipt_date: form.receipt_date,
      notes: form.notes.trim(),
      lines,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{note ? "Update Goods Receipt Note" : "Create Goods Receipt Note"}</DialogTitle>
          <DialogDescription>
            Capture the GRN header and manage multiple goods receipt lines in one flow.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">GRN Number</p>
              <p className="mt-1 text-base font-semibold text-foreground">{previewGrnNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note
                  ? "This GRN number is preserved while editing."
                  : "This GRN number will be assigned automatically when the receipt is created."}
              </p>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Receipt Header</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the purchase order, receipt metadata, and warehouse destination.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Purchase Order *</label>
                  <Select value={form.purchase_order_id} onValueChange={handlePurchaseOrderChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select purchase order" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseOrderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Supplier</label>
                  <div className="mt-1 rounded-md border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground">
                    <p>{selectedSupplierName}</p>
                    <p className="text-xs text-muted-foreground">{selectedSupplierId || "Select a purchase order first"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Warehouse Location *</label>
                  <Select value={form.warehouse_location_id} onValueChange={handleWarehouseLocationChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select warehouse location" />
                    </SelectTrigger>
                    <SelectContent>
                      {WAREHOUSE_LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Receipt Date *</label>
                  <Input
                    required
                    type="date"
                    value={form.receipt_date}
                    onChange={handleFieldChange("receipt_date")}
                    className="mt-1"
                  />
                </div>

                <div className="xl:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <Textarea
                    value={form.notes}
                    onChange={handleFieldChange("notes")}
                    placeholder="Receiving notes, discrepancies, or inspections..."
                    className="mt-1 min-h-[88px]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Goods Receipt Lines</h2>
                  <p className="text-sm text-muted-foreground">
                    Add one or more receipt lines against the selected purchase order.
                  </p>
                </div>

                <Button type="button" variant="outline" onClick={addLine} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Line
                </Button>
              </div>

              <div className="space-y-4">
                {form.lines.map((line, index) => {
                  const selectedLineOption = purchaseOrderLineOptions.find((option) => option.value === line.po_line_id);

                  return (
                    <div key={line.id} className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Line {index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedLineOption
                              ? `${selectedLineOption.rawMaterialName} · Ordered ${selectedLineOption.quantityOrdered} ${selectedLineOption.unitOfMeasure}`
                              : "Select a PO line to continue"}
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

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">PO Line *</label>
                          <Select
                            value={line.po_line_id}
                            onValueChange={(value) => handlePoLineChange(line.id, value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select PO line" />
                            </SelectTrigger>
                            <SelectContent>
                              {purchaseOrderLineOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Raw Material ID</label>
                          <div className="mt-1 rounded-md border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground">
                            {line.raw_material_id || "Select a PO line first"}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Quantity Received *</label>
                          <Input
                            required
                            min="0"
                            step="0.01"
                            type="number"
                            value={line.quantity_received}
                            onChange={handleLineChange(line.id, "quantity_received")}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Batch / Lot Number</label>
                          <Input
                            value={line.batch_lot_number}
                            onChange={handleLineChange(line.id, "batch_lot_number")}
                            placeholder="LOT-APR-26-001"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Expiry Date</label>
                          <Input
                            type="date"
                            value={line.expiry_date}
                            onChange={handleLineChange(line.id, "expiry_date")}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Warehouse Location *</label>
                          <Select
                            value={line.warehouse_location_id}
                            onValueChange={(value) => handleLineWarehouseChange(line.id, value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              {WAREHOUSE_LOCATION_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <DialogFooter className="border-t border-border px-0 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{note ? "Save Changes" : "Create GRN"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
