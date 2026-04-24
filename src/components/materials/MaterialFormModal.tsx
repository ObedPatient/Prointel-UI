import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
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
  MATERIAL_CATEGORY_OPTIONS,
  UNIT_OF_MEASURE_OPTIONS,
  generateNextMaterialCode,
} from "@/lib/materials";
import type { Material, MaterialFormData } from "@/types/material";

interface MaterialFormModalProps {
  material?: Material | null;
  existingMaterials: Material[];
  onSubmit: (data: MaterialFormData) => void;
  onClose: () => void;
}

interface MaterialModalState {
  name: string;
  description: string;
  material_category: string;
  unit_of_measure: string;
  minimum_stock_level: string;
  reorder_point: string;
  reorder_quantity: string;
  weighted_average_cost: string;
  current_stock: string;
  reserved_stock: string;
}

function toInputValue(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function MaterialFormModal({
  material = null,
  existingMaterials,
  onSubmit,
  onClose,
}: MaterialFormModalProps) {
  const [form, setForm] = useState<MaterialModalState>({
    name: material?.name ?? "",
    description: material?.description ?? "",
    material_category: material?.material_category ?? "",
    unit_of_measure: material?.unit_of_measure ?? "",
    minimum_stock_level: toInputValue(material?.minimum_stock_level),
    reorder_point: toInputValue(material?.reorder_point),
    reorder_quantity: toInputValue(material?.reorder_quantity),
    weighted_average_cost: toInputValue(material?.weighted_average_cost),
    current_stock: toInputValue(material?.current_stock),
    reserved_stock: toInputValue(material?.reserved_stock),
  });

  const previewCode = useMemo(
    () => material?.material_code ?? generateNextMaterialCode(existingMaterials),
    [existingMaterials, material?.material_code],
  );

  const set = <K extends keyof MaterialModalState>(key: K, value: MaterialModalState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleInputChange =
    (
      key: keyof Pick<
        MaterialModalState,
        | "name"
        | "description"
        | "minimum_stock_level"
        | "reorder_point"
        | "reorder_quantity"
        | "weighted_average_cost"
        | "current_stock"
        | "reserved_stock"
      >,
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      set(key, event.target.value);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      material_category: form.material_category,
      unit_of_measure: form.unit_of_measure,
      minimum_stock_level: toNullableNumber(form.minimum_stock_level),
      reorder_point: toNullableNumber(form.reorder_point),
      reorder_quantity: toNullableNumber(form.reorder_quantity),
      weighted_average_cost: toNullableNumber(form.weighted_average_cost),
      current_stock: toNullableNumber(form.current_stock),
      reserved_stock: toNullableNumber(form.reserved_stock),
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{material ? "Edit Material" : "New Material"}</DialogTitle>
          <DialogDescription>
            Maintain material master data, stocking thresholds, and costing details.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">Material Code</p>
              <p className="mt-1 text-base font-semibold text-foreground">{previewCode}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {material
                  ? "This material code is preserved while editing."
                  : "This code will be assigned automatically when the material is created."}
              </p>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Material Identity</h2>
                <p className="text-sm text-muted-foreground">
                  Capture the core naming, classification, and stocking unit.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Material Name *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={handleInputChange("name")}
                    placeholder="Brown Kraft Paper Rolls"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Material Category *
                  </label>
                  <Select
                    value={form.material_category || undefined}
                    onValueChange={(value) => set("material_category", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select material category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Unit of Measure *
                  </label>
                  <Select
                    value={form.unit_of_measure || undefined}
                    onValueChange={(value) => set("unit_of_measure", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit of measure" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={handleInputChange("description")}
                    placeholder="Short material description..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Stock Control</h2>
                <p className="text-sm text-muted-foreground">
                  Define minimum thresholds, reorder parameters, and available balances.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Minimum Stock Level
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={form.minimum_stock_level}
                    onChange={handleInputChange("minimum_stock_level")}
                    placeholder="12"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Reorder Point</label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={form.reorder_point}
                    onChange={handleInputChange("reorder_point")}
                    placeholder="18"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Reorder Quantity
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={form.reorder_quantity}
                    onChange={handleInputChange("reorder_quantity")}
                    placeholder="24"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Current Stock
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={form.current_stock}
                    onChange={handleInputChange("current_stock")}
                    placeholder="28"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Reserved Stock
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={form.reserved_stock}
                    onChange={handleInputChange("reserved_stock")}
                    placeholder="6"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Weighted Average Cost
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={form.weighted_average_cost}
                    onChange={handleInputChange("weighted_average_cost")}
                    placeholder="38500"
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            <DialogFooter className="border-t border-border px-0 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{material ? "Save Changes" : "Create Material"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
