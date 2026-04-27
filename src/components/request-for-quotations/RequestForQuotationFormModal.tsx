import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RequestForQuotation,
  RequestForQuotationFormData,
  RequestForQuotationLookupOption,
} from "@/types/request-for-quotation";

interface RequestForQuotationFormModalProps {
  open: boolean;
  quotation?: RequestForQuotation | null;
  customerOptions: RequestForQuotationLookupOption[];
  productOptions: RequestForQuotationLookupOption[];
  billOfMaterialsOptions: RequestForQuotationLookupOption[];
  onClose: () => void;
  onSubmit: (payload: RequestForQuotationFormData) => void;
}

function buildInitialForm(
  quotation: RequestForQuotation | null | undefined,
  customerOptions: RequestForQuotationLookupOption[],
  productOptions: RequestForQuotationLookupOption[],
  billOfMaterialsOptions: RequestForQuotationLookupOption[],
): RequestForQuotationFormData {
  if (quotation) {
    return {
      customer_id: quotation.customer_id,
      product_category_id: quotation.product_category_id,
      bill_of_materials_id: quotation.bill_of_materials_id,
      quantity: quotation.quantity,
      estimated_material_cost: quotation.estimated_material_cost,
      estimated_machine_cost: quotation.estimated_machine_cost,
      total_estimated_cost: quotation.total_estimated_cost,
      selling_price: quotation.selling_price,
      expiry_date: quotation.expiry_date,
    };
  }

  return {
    customer_id: customerOptions[0]?.value ?? "",
    product_category_id: productOptions[0]?.value ?? "",
    bill_of_materials_id: billOfMaterialsOptions[0]?.value ?? "",
    quantity: null,
    estimated_material_cost: null,
    estimated_machine_cost: null,
    total_estimated_cost: 0,
    selling_price: null,
    expiry_date: "",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function RequestForQuotationFormModal({
  open,
  quotation,
  customerOptions,
  productOptions,
  billOfMaterialsOptions,
  onClose,
  onSubmit,
}: RequestForQuotationFormModalProps) {
  const [form, setForm] = useState<RequestForQuotationFormData>(() =>
    buildInitialForm(quotation, customerOptions, productOptions, billOfMaterialsOptions),
  );

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(quotation, customerOptions, productOptions, billOfMaterialsOptions));
    }
  }, [billOfMaterialsOptions, customerOptions, open, productOptions, quotation]);

  const totalEstimatedCost = useMemo(
    () => (form.estimated_material_cost ?? 0) + (form.estimated_machine_cost ?? 0),
    [form.estimated_machine_cost, form.estimated_material_cost],
  );

  const setField = <K extends keyof RequestForQuotationFormData>(
    key: K,
    value: RequestForQuotationFormData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl [&>button]:hidden">
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-border bg-card px-6 pb-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="space-y-0 text-left">
                <DialogTitle className="text-base font-semibold text-foreground">
                  {quotation ? "Update Request for Quotation" : "New Request for Quotation"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  Capture the customer, product, costing, and expiry details for this quote.
                </DialogDescription>
              </DialogHeader>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close request for quotation modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit({
                ...form,
                total_estimated_cost: totalEstimatedCost,
              });
            }}
            className="space-y-4 p-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Customer">
                <Select
                  value={form.customer_id}
                  onValueChange={(value) => setField("customer_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Product">
                <Select
                  value={form.product_category_id}
                  onValueChange={(value) => setField("product_category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Bill of Materials">
                <Select
                  value={form.bill_of_materials_id}
                  onValueChange={(value) => setField("bill_of_materials_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {billOfMaterialsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Expiry Date">
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(event) => setField("expiry_date", event.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Quantity">
                <Input
                  type="number"
                  min="0"
                  value={form.quantity ?? ""}
                  onChange={(event) =>
                    setField(
                      "quantity",
                      event.target.value === "" ? null : Number(event.target.value),
                    )
                  }
                  placeholder="5000"
                />
              </Field>

              <Field label="Selling Price">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.selling_price ?? ""}
                  onChange={(event) =>
                    setField(
                      "selling_price",
                      event.target.value === "" ? null : Number(event.target.value),
                    )
                  }
                  placeholder="2100000"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Estimated Material Cost">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimated_material_cost ?? ""}
                  onChange={(event) =>
                    setField(
                      "estimated_material_cost",
                      event.target.value === "" ? null : Number(event.target.value),
                    )
                  }
                  placeholder="1180000"
                />
              </Field>

              <Field label="Estimated Machine Cost">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimated_machine_cost ?? ""}
                  onChange={(event) =>
                    setField(
                      "estimated_machine_cost",
                      event.target.value === "" ? null : Number(event.target.value),
                    )
                  }
                  placeholder="320000"
                />
              </Field>

              <Field label="Total Estimated Cost">
                <Input value={totalEstimatedCost.toLocaleString()} readOnly />
              </Field>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{quotation ? "Save Changes" : "Create RFQ"}</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
