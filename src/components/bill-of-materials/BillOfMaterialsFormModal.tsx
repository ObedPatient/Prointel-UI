import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  PRODUCT_CATEGORY_OPTIONS,
  RAW_MATERIAL_OPTIONS,
  generateNextBomCode,
  getRawMaterialOption,
} from "@/lib/bill-of-materials";
import type { BillOfMaterialLine, BillOfMaterials } from "@/types/bill-of-materials";

interface BillOfMaterialsFormModalProps {
  bom?: BillOfMaterials | null;
  existingRecords: BillOfMaterials[];
  onSubmit: (bom: BillOfMaterials) => void;
  onClose: () => void;
}

interface BomLineFormState {
  id: string;
  raw_material_id: string;
  quantity_per_unit: string;
  unit_of_measure: string;
  expected_wastage_percentage: string;
  is_optional: boolean;
  notes: string;
}

interface BomFormState {
  product_category_id: string;
  version: string;
  name: string;
  description: string;
  lines: BomLineFormState[];
}

function toInputNumber(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

function createLineState(line?: BillOfMaterialLine): BomLineFormState {
  return {
    id: line?.id ?? crypto.randomUUID(),
    raw_material_id: line?.raw_material_id ?? "",
    quantity_per_unit: line ? toInputNumber(line.quantity_per_unit) : "",
    unit_of_measure: line?.unit_of_measure ?? "",
    expected_wastage_percentage: line
      ? toInputNumber(line.expected_wastage_percentage)
      : "",
    is_optional: line?.is_optional ?? false,
    notes: line?.notes ?? "",
  };
}

function createInitialState(bom?: BillOfMaterials | null): BomFormState {
  return {
    product_category_id: bom?.product_category_id ?? "",
    version: bom ? String(bom.version) : "1",
    name: bom?.name ?? "",
    description: bom?.description ?? "",
    lines: bom?.lines.length ? bom.lines.map(createLineState) : [createLineState()],
  };
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function BillOfMaterialsFormModal({
  bom = null,
  existingRecords,
  onSubmit,
  onClose,
}: BillOfMaterialsFormModalProps) {
  const [form, setForm] = useState<BomFormState>(() => createInitialState(bom));

  const previewCode = useMemo(
    () => bom?.bom_code ?? generateNextBomCode(existingRecords),
    [bom?.bom_code, existingRecords],
  );

  const totalLines = form.lines.length;

  const handleFieldChange =
    (field: Exclude<keyof BomFormState, "lines">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleCategoryChange = (value: string) => {
    setForm((current) => ({ ...current, product_category_id: value }));
  };

  const handleLineChange =
    (lineId: string, field: keyof Omit<BomLineFormState, "id" | "is_optional">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      setForm((current) => ({
        ...current,
        lines: current.lines.map((line) =>
          line.id === lineId ? { ...line, [field]: nextValue } : line,
        ),
      }));
    };

  const handleRawMaterialChange = (lineId: string, value: string) => {
    const rawMaterial = getRawMaterialOption(value);

    setForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              raw_material_id: value,
              unit_of_measure: rawMaterial?.default_unit_of_measure ?? line.unit_of_measure,
            }
          : line,
      ),
    }));
  };

  const handleOptionalChange = (lineId: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId ? { ...line, is_optional: checked } : line,
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

    const createdAt = bom?.created_at ?? new Date().toISOString();
    const recordId = bom?.id ?? crypto.randomUUID();
    const lines: BillOfMaterialLine[] = form.lines.map((line, index) => ({
      id: line.id,
      tenant_id: bom?.tenant_id ?? "tenant-stepping-stone",
      bill_of_materials_id: recordId,
      line_number: index + 1,
      raw_material_id: line.raw_material_id,
      quantity_per_unit: parseNumber(line.quantity_per_unit),
      unit_of_measure: line.unit_of_measure.trim(),
      expected_wastage_percentage: parseNumber(line.expected_wastage_percentage),
      is_optional: line.is_optional,
      notes: line.notes.trim(),
      created_at: bom?.lines[index]?.created_at ?? createdAt,
    }));

    onSubmit({
      id: recordId,
      tenant_id: bom?.tenant_id ?? "tenant-stepping-stone",
      bom_code: previewCode,
      product_category_id: form.product_category_id,
      version: parseNumber(form.version) || 1,
      name: form.name.trim(),
      description: form.description.trim(),
      status: bom?.status ?? "Draft",
      created_by: bom?.created_by ?? "Jean-Pierre Habimana",
      approved_by: bom?.approved_by ?? null,
      approved_at: bom?.approved_at ?? null,
      superseded_at: bom?.superseded_at ?? null,
      created_at: createdAt,
      lines,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{bom ? "Update BOM" : "Create BOM"}</DialogTitle>
          <DialogDescription>
            Define the BOM header and include as many BOM lines as needed in one flow.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">BOM Code</p>
                <p className="mt-1 text-base font-semibold text-foreground">{previewCode}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {bom
                    ? "This BOM code is preserved while editing."
                    : "This code will be assigned automatically when the BOM is created."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Product Category *</label>
                  <Select value={form.product_category_id} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Version *</label>
                  <Input
                    required
                    min="1"
                    step="1"
                    type="number"
                    value={form.version}
                    onChange={handleFieldChange("version")}
                    className="mt-1"
                  />
                </div>

                <div className="xl:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground">BOM Name *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={handleFieldChange("name")}
                    placeholder="Milk Carton 1L Outer Carton"
                    className="mt-1"
                  />
                </div>

                <div className="xl:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={handleFieldChange("description")}
                    placeholder="Describe what this bill of materials covers"
                    className="mt-1 min-h-[90px]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">BOM Lines</h2>
                  <p className="text-sm text-muted-foreground">
                    Add all raw materials, wastage expectations, and optional lines for this BOM.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm">
                    Lines: <span className="font-semibold text-foreground">{totalLines}</span>
                  </div>
                  <Button type="button" variant="outline" onClick={addLine} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Line
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {form.lines.map((line, index) => (
                  <div key={line.id} className="rounded-xl border border-border bg-background/60 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Line {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          Configure quantity, wastage, and usage notes.
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
                        <label className="text-xs font-medium text-muted-foreground">Raw Material *</label>
                        <Select
                          value={line.raw_material_id}
                          onValueChange={(value) => handleRawMaterialChange(line.id, value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select raw material" />
                          </SelectTrigger>
                          <SelectContent>
                            {RAW_MATERIAL_OPTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Quantity per Unit *
                        </label>
                        <Input
                          required
                          min="0"
                          step="0.001"
                          type="number"
                          value={line.quantity_per_unit}
                          onChange={handleLineChange(line.id, "quantity_per_unit")}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Unit of Measure *</label>
                        <Input
                          required
                          value={line.unit_of_measure}
                          onChange={handleLineChange(line.id, "unit_of_measure")}
                          placeholder="kg, litres, rolls"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Expected Wastage % *
                        </label>
                        <Input
                          required
                          min="0"
                          step="0.1"
                          type="number"
                          value={line.expected_wastage_percentage}
                          onChange={handleLineChange(line.id, "expected_wastage_percentage")}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <Checkbox
                          checked={line.is_optional}
                          onCheckedChange={(checked) =>
                            handleOptionalChange(line.id, checked === true)
                          }
                          id={`optional-${line.id}`}
                        />
                        <label
                          htmlFor={`optional-${line.id}`}
                          className="text-sm font-medium text-foreground"
                        >
                          Optional line
                        </label>
                      </div>

                      <div className="md:col-span-2 xl:col-span-3">
                        <label className="text-xs font-medium text-muted-foreground">Notes</label>
                        <Textarea
                          value={line.notes}
                          onChange={handleLineChange(line.id, "notes")}
                          placeholder="Capture line-level process notes or exceptions"
                          className="mt-1 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <DialogFooter className="border-t border-border px-0 pt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.product_category_id ||
                  !form.name.trim() ||
                  form.lines.some(
                    (line) =>
                      !line.raw_material_id ||
                      !line.quantity_per_unit.trim() ||
                      !line.unit_of_measure.trim() ||
                      !line.expected_wastage_percentage.trim(),
                  )
                }
              >
                {bom ? "Save BOM" : "Create BOM"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
