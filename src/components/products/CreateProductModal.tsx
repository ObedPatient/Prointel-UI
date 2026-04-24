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
  FLUTE_TYPE_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  generateNextProductCode,
} from "@/lib/products";
import type { Product, ProductFormData } from "@/types/product";

interface ProductModalState {
  name: string;
  description: string;
  packaging_category_name: string;
  length_mm: string;
  width_mm: string;
  height_mm: string;
  board_grade: string;
  flute_type: string;
  printing_colors: string;
}

interface CreateProductModalProps {
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
  isLoading: boolean;
  product?: Product | null;
  existingProducts: Product[];
}

export default function CreateProductModal({ 
  onSubmit, 
  onClose, 
  isLoading, 
  product = null,
  existingProducts,
}: CreateProductModalProps) {
  const [form, setForm] = useState<ProductModalState>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    packaging_category_name: product?.packaging_category_name ?? "",
    length_mm: product?.length_mm?.toString() ?? "",
    width_mm: product?.width_mm?.toString() ?? "",
    height_mm: product?.height_mm?.toString() ?? "",
    board_grade: product?.board_grade ?? "",
    flute_type: product?.flute_type ?? "",
    printing_colors: product?.printing_colors?.toString() ?? "",
  });

  const previewCode = useMemo(
    () => product?.code ?? generateNextProductCode(existingProducts),
    [existingProducts, product?.code],
  );

  const set = <K extends keyof ProductModalState>(key: K, value: ProductModalState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleInputChange =
    (key: keyof Pick<ProductModalState, "name" | "description" | "length_mm" | "width_mm" | "height_mm" | "board_grade" | "printing_colors">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      set(key, event.target.value);
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      packaging_category_name: form.packaging_category_name,
      board_grade: form.board_grade.trim(),
      flute_type: form.flute_type,
      length_mm: form.length_mm !== "" ? Number(form.length_mm) : null,
      width_mm: form.width_mm !== "" ? Number(form.width_mm) : null,
      height_mm: form.height_mm !== "" ? Number(form.height_mm) : null,
      printing_colors: form.printing_colors !== "" ? Number(form.printing_colors) : null,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            Capture packaged product details using the shared master data selections.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">Product Code</p>
                <p className="mt-1 text-base font-semibold text-foreground">{previewCode}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product
                    ? "This product code is preserved while editing."
                    : "This code will be assigned automatically when the product is created."}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Product Identity</h2>
                <p className="text-sm text-muted-foreground">
                  Define the product name, description, and category reference.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={handleInputChange("name")}
                    placeholder="Milk Carton 1L Outer"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Product Category *</label>
                  <Select
                    value={form.packaging_category_name || undefined}
                    onValueChange={(value) => set("packaging_category_name", value)}
                  >
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

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={handleInputChange("description")}
                    placeholder="Short product description..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Physical Specification</h2>
                <p className="text-sm text-muted-foreground">
                  Capture structural dimensions, board grade, flute, and print setup.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Length (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.length_mm}
                    onChange={handleInputChange("length_mm")}
                    placeholder="420"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Width (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.width_mm}
                    onChange={handleInputChange("width_mm")}
                    placeholder="285"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Height (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.height_mm}
                    onChange={handleInputChange("height_mm")}
                    placeholder="260"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Board Grade</label>
                  <Input
                    value={form.board_grade}
                    onChange={handleInputChange("board_grade")}
                    placeholder="K150/BF120/W125"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Flute Type</label>
                  <Select
                    value={form.flute_type || undefined}
                    onValueChange={(value) => set("flute_type", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select flute type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLUTE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Printing Colors</label>
                  <Input
                    type="number"
                    min={0}
                    max={8}
                    value={form.printing_colors}
                    onChange={handleInputChange("printing_colors")}
                    placeholder="4"
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            <DialogFooter className="border-t border-border px-0 pt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.name.trim() || !form.packaging_category_name}
              >
                {isLoading ? "Saving..." : product ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
