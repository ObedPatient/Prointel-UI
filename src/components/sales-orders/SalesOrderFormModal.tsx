import { useEffect, useMemo, useState } from "react";
import type {
  SalesOrderDeliveryAddressOption,
  SalesOrderFormData,
  SalesOrderLookupOption,
  SalesOrderQuotationOption,
  SalesOrderRecord,
} from "@/types/sales-order";
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
import { generateNextSalesOrderNumber } from "@/lib/sales-orders";

interface FormState {
  quotation_id: string;
  customer_id: string;
  customer_po_number: string;
  delivery_address_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  quantity_ordered: string;
  agreed_unit_price: string;
  agreed_delivery_date: string;
  quantity_produced: string;
  quantity_dispatched: string;
  material_availability_checked: boolean;
  material_insufficient: boolean;
}

interface SalesOrderFormModalProps {
  order?: SalesOrderRecord | null;
  existingOrders?: SalesOrderRecord[];
  quotationOptions: SalesOrderQuotationOption[];
  customerOptions: SalesOrderLookupOption[];
  deliveryAddressOptions: SalesOrderDeliveryAddressOption[];
  productOptions: SalesOrderLookupOption[];
  billOfMaterialsOptions: SalesOrderLookupOption[];
  onSubmit: (payload: SalesOrderFormData) => void;
  onClose: () => void;
}

const NO_QUOTATION_VALUE = "__none__";

function toInputValue(value: number): string {
  return Number.isFinite(value) && value !== 0 ? String(value) : "";
}

function createInitialState(order?: SalesOrderRecord | null): FormState {
  return {
    quotation_id: order?.quotation_id ?? "",
    customer_id: order?.customer_id ?? "",
    customer_po_number: order?.customer_po_number ?? "",
    delivery_address_id: order?.delivery_address_id ?? "",
    product_category_id: order?.product_category_id ?? "",
    bill_of_materials_id: order?.bill_of_materials_id ?? "",
    quantity_ordered: order ? String(order.quantity_ordered) : "",
    agreed_unit_price: order ? toInputValue(order.agreed_unit_price) : "",
    agreed_delivery_date: order?.agreed_delivery_date ?? "",
    quantity_produced: order ? toInputValue(order.quantity_produced) : "",
    quantity_dispatched: order ? toInputValue(order.quantity_dispatched) : "",
    material_availability_checked: order?.material_availability_checked ?? false,
    material_insufficient: order?.material_insufficient ?? false,
  };
}

export default function SalesOrderFormModal({
  order = null,
  existingOrders = [],
  quotationOptions,
  customerOptions,
  deliveryAddressOptions,
  productOptions,
  billOfMaterialsOptions,
  onSubmit,
  onClose,
}: SalesOrderFormModalProps) {
  const [form, setForm] = useState<FormState>(() => createInitialState(order));

  useEffect(() => {
    setForm(createInitialState(order));
  }, [order]);

  const previewOrderNumber = useMemo(
    () => order?.order_number ?? generateNextSalesOrderNumber(existingOrders),
    [existingOrders, order?.order_number],
  );
  const selectedQuotation = useMemo(
    () => quotationOptions.find((option) => option.value === form.quotation_id),
    [form.quotation_id, quotationOptions],
  );
  const totalOrderValue = useMemo(() => {
    const quantity = form.quantity_ordered === "" ? 0 : Number(form.quantity_ordered);
    const unitPrice = form.agreed_unit_price === "" ? 0 : Number(form.agreed_unit_price);
    return quantity * unitPrice;
  }, [form.agreed_unit_price, form.quantity_ordered]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const findDefaultDeliveryAddressId = (customerId: string): string =>
    deliveryAddressOptions.find((option) => option.customerId === customerId)?.value ?? "";

  const handleQuotationChange = (value: string) => {
    if (value === NO_QUOTATION_VALUE) {
      setField("quotation_id", "");
      return;
    }

    const quotation = quotationOptions.find((option) => option.value === value);

    setForm((current) => ({
      ...current,
      quotation_id: value,
      customer_id: quotation?.customerId ?? current.customer_id,
      delivery_address_id:
        quotation?.deliveryAddressId ||
        findDefaultDeliveryAddressId(quotation?.customerId ?? current.customer_id),
      product_category_id: quotation?.productId ?? current.product_category_id,
      bill_of_materials_id: quotation?.billOfMaterialsId ?? current.bill_of_materials_id,
      quantity_ordered:
        quotation && quotation.quantityOrdered > 0 ? String(quotation.quantityOrdered) : current.quantity_ordered,
      agreed_unit_price:
        quotation && quotation.agreedUnitPrice > 0 ? String(quotation.agreedUnitPrice) : current.agreed_unit_price,
    }));
  };

  const handleCustomerChange = (value: string) => {
    setForm((current) => ({
      ...current,
      customer_id: value,
      delivery_address_id: findDefaultDeliveryAddressId(value),
      quotation_id: selectedQuotation?.customerId === value ? current.quotation_id : "",
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      quotation_id: form.quotation_id.trim().length > 0 ? form.quotation_id : null,
      customer_id: form.customer_id,
      customer_po_number: form.customer_po_number.trim(),
      delivery_address_id: form.delivery_address_id,
      product_category_id: form.product_category_id,
      bill_of_materials_id: form.bill_of_materials_id,
      quantity_ordered: form.quantity_ordered === "" ? null : Number(form.quantity_ordered),
      agreed_unit_price: form.agreed_unit_price === "" ? null : Number(form.agreed_unit_price),
      agreed_delivery_date: form.agreed_delivery_date,
      quantity_produced: form.quantity_produced === "" ? null : Number(form.quantity_produced),
      quantity_dispatched: form.quantity_dispatched === "" ? null : Number(form.quantity_dispatched),
      material_availability_checked: form.material_availability_checked,
      material_insufficient: form.material_insufficient,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{order ? "Update Sales Order" : "New Sales Order"}</DialogTitle>
          <DialogDescription>
            Manage commercial, fulfillment, and production-readiness details in one flow.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            <section className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">Order Number</p>
              <p className="mt-1 text-base font-semibold text-foreground">{previewOrderNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {order
                  ? "This order number is preserved while editing."
                  : "This order number will be assigned when the sales order is created."}
              </p>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Order Reference</h2>
                <p className="text-sm text-muted-foreground">
                  Link an accepted quotation where available, or enter the order directly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Quotation</label>
                  <Select
                    value={form.quotation_id || NO_QUOTATION_VALUE}
                    onValueChange={handleQuotationChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_QUOTATION_VALUE}>No linked quotation</SelectItem>
                      {quotationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                    Customer PO Number
                  </label>
                  <Input
                    value={form.customer_po_number}
                    onChange={(event) => setField("customer_po_number", event.target.value)}
                    placeholder="PO-CUST-0001"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Delivery Address
                  </label>
                  <Select
                    value={form.delivery_address_id || undefined}
                    onValueChange={(value) => setField("delivery_address_id", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select delivery address" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryAddressOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Product & Pricing</h2>
                <p className="text-sm text-muted-foreground">
                  Define the ordered product, BOM reference, volume, and agreed selling rate.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Product *</label>
                  <Select
                    value={form.product_category_id || undefined}
                    onValueChange={(value) => setField("product_category_id", value)}
                  >
                    <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Bill of Materials</label>
                  <Select
                    value={form.bill_of_materials_id || undefined}
                    onValueChange={(value) => setField("bill_of_materials_id", value)}
                  >
                    <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Quantity Ordered *</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.quantity_ordered}
                    onChange={(event) => setField("quantity_ordered", event.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Agreed Unit Price *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.agreed_unit_price}
                    onChange={(event) => setField("agreed_unit_price", event.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Agreed Delivery Date</label>
                  <Input
                    type="date"
                    value={form.agreed_delivery_date}
                    onChange={(event) => setField("agreed_delivery_date", event.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Total Order Value (RWF)</label>
                  <Input value={totalOrderValue.toLocaleString()} readOnly className="mt-1" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Execution</h2>
                <p className="text-sm text-muted-foreground">
                  Track material readiness and current production/dispatch completion.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Quantity Produced</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.quantity_produced}
                    onChange={(event) => setField("quantity_produced", event.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Quantity Dispatched</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.quantity_dispatched}
                    onChange={(event) => setField("quantity_dispatched", event.target.value)}
                    className="mt-1"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm">
                  <Checkbox
                    checked={form.material_availability_checked}
                    onCheckedChange={(checked) =>
                      setField("material_availability_checked", checked === true)
                    }
                  />
                  Material availability checked
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm">
                  <Checkbox
                    checked={form.material_insufficient}
                    onCheckedChange={(checked) => setField("material_insufficient", checked === true)}
                  />
                  Material insufficient
                </label>
              </div>
            </section>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{order ? "Save Changes" : "Create Sales Order"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
