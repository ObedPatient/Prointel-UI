import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
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
import { generateNextProductionCardJobNumber } from "@/lib/production-cards";
import type {
  CreateProductionCardData,
  ProductionCard,
  ProductionCardLookupOption,
  SalesOrderOption,
} from "@/types/production-card";

interface FormData {
  customer_order_id: string;
  customer_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  target_quantity: string;
  start_date: string;
  target_completion_date: string;
  agreed_selling_price: string;
}

interface CreateProductionCardModalProps {
  card?: ProductionCard | null;
  existingCards?: ProductionCard[];
  salesOrderOptions: SalesOrderOption[];
  customerOptions: ProductionCardLookupOption[];
  productCategoryOptions: ProductionCardLookupOption[];
  onSubmit: (data: CreateProductionCardData) => void;
  onClose: () => void;
  isLoading: boolean;
}

const AD_HOC_ORDER_VALUE = "__ad_hoc__";

function toInputNumber(value: number): string {
  return Number.isFinite(value) && value !== 0 ? String(value) : "";
}

function createInitialState(card?: ProductionCard | null): FormData {
  return {
    customer_order_id: card?.customer_order_id ?? "",
    customer_id: card?.customer_id ?? "",
    product_category_id: card?.product_category_id ?? "",
    bill_of_materials_id: card?.bill_of_materials_id ?? "",
    target_quantity: card ? String(card.target_quantity) : "",
    start_date: card?.start_date ?? "",
    target_completion_date: card?.target_completion_date ?? "",
    agreed_selling_price: card ? toInputNumber(card.agreed_selling_price) : "",
  };
}

export default function CreateProductionCardModal({
  card = null,
  existingCards = [],
  salesOrderOptions,
  customerOptions,
  productCategoryOptions,
  onSubmit,
  onClose,
  isLoading,
}: CreateProductionCardModalProps) {
  const [form, setForm] = useState<FormData>(() => createInitialState(card));
  const [adHocApproved, setAdHocApproved] = useState<boolean>(Boolean(card));

  const selectedSalesOrder = useMemo(
    () => salesOrderOptions.find((option) => option.value === form.customer_order_id),
    [form.customer_order_id, salesOrderOptions],
  );

  const previewJobNumber = useMemo(
    () => card?.job_number ?? generateNextProductionCardJobNumber(existingCards),
    [card?.job_number, existingCards],
  );

  const isAdHoc = !form.customer_order_id;
  const canSubmit =
    form.customer_id.trim().length > 0 &&
    form.product_category_id.trim().length > 0 &&
    form.target_quantity.trim().length > 0 &&
    form.target_completion_date.trim().length > 0 &&
    (!isAdHoc || adHocApproved);

  const setField = (field: keyof FormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleInputChange =
    (
      field: keyof Pick<
        FormData,
        | "bill_of_materials_id"
        | "target_quantity"
        | "start_date"
        | "target_completion_date"
        | "agreed_selling_price"
      >,
    ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setField(field, event.target.value);
    };

  const handleSalesOrderChange = (value: string) => {
    if (value === AD_HOC_ORDER_VALUE) {
      setForm((current) => ({
        ...current,
        customer_order_id: "",
      }));
      return;
    }

    const selectedOrder = salesOrderOptions.find((option) => option.value === value);

    setForm((current) => ({
      ...current,
      customer_order_id: value,
      customer_id: selectedOrder?.customerName ?? current.customer_id,
      product_category_id:
        selectedOrder?.productCategoryName ?? current.product_category_id,
    }));
  };

  const handleCustomerChange = (value: string) => {
    setForm((current) => ({
      ...current,
      customer_id: value,
      customer_order_id:
        selectedSalesOrder?.customerName === value ? current.customer_order_id : "",
    }));
  };

  const handleProductCategoryChange = (value: string) => {
    setForm((current) => ({
      ...current,
      product_category_id: value,
      customer_order_id:
        selectedSalesOrder?.productCategoryName === value ? current.customer_order_id : "",
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit({
      customer_order_id: form.customer_order_id.trim(),
      customer_id: form.customer_id.trim(),
      product_category_id: form.product_category_id.trim(),
      bill_of_materials_id: form.bill_of_materials_id.trim(),
      target_quantity: form.target_quantity !== "" ? Number(form.target_quantity) : null,
      start_date: form.start_date,
      target_completion_date: form.target_completion_date,
      agreed_selling_price:
        form.agreed_selling_price !== "" ? Number(form.agreed_selling_price) : null,
      job_number: previewJobNumber,
      status: card?.status ?? "Draft",
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{card ? "Edit Production Card" : "New Production Card"}</DialogTitle>
          <DialogDescription>
            Capture the sales order linkage and job setup details in one flow.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section>
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">Job Number</p>
                <p className="mt-1 text-base font-semibold text-foreground">{previewJobNumber}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card
                    ? "This job number is preserved while editing."
                    : "This job number will be assigned when the card is created."}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Order Link</h2>
                <p className="text-sm text-muted-foreground">
                  Select a sales order or create an approved ad-hoc production card.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Sales Order</label>
                  <Select
                    value={form.customer_order_id || AD_HOC_ORDER_VALUE}
                    onValueChange={handleSalesOrderChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select sales order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AD_HOC_ORDER_VALUE}>Ad-hoc / no sales order</SelectItem>
                      {salesOrderOptions.map((order) => (
                        <SelectItem key={order.value} value={order.value}>
                          {order.label} · {order.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Customer *</label>
                  <Select value={form.customer_id || undefined} onValueChange={handleCustomerChange}>
                    <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Product Category *
                  </label>
                  <Select
                    value={form.product_category_id || undefined}
                    onValueChange={handleProductCategoryChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isAdHoc && (
                <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2 text-amber-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">Manager Override Required</p>
                      <p className="text-xs text-amber-800">
                        Ad-hoc production cards can be created without a sales order, but they
                        must be explicitly approved.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-amber-800">
                    <input
                      type="checkbox"
                      checked={adHocApproved}
                      onChange={(event) => setAdHocApproved(event.target.checked)}
                      className="rounded"
                    />
                    I approve this ad-hoc production card
                  </label>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Production Setup</h2>
                <p className="text-sm text-muted-foreground">
                  Define the bill of materials, quantities, and delivery timeline.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Bill of Materials ID
                  </label>
                  <Input
                    value={form.bill_of_materials_id}
                    onChange={handleInputChange("bill_of_materials_id")}
                    placeholder="BOM-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Target Quantity *
                  </label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={form.target_quantity}
                    onChange={handleInputChange("target_quantity")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={handleInputChange("start_date")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Target Completion Date *
                  </label>
                  <Input
                    required
                    type="date"
                    value={form.target_completion_date}
                    onChange={handleInputChange("target_completion_date")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Agreed Selling Price (RWF)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.agreed_selling_price}
                    onChange={handleInputChange("agreed_selling_price")}
                    placeholder="2500000"
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            <DialogFooter className="border-t border-border px-0 pt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !canSubmit}>
                {card ? "Save Changes" : "Create Card"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
