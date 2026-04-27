import { useState } from "react";
import type { CustomerFormData, CustomerRecord } from "@/types/customer";
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

interface CustomerFormModalProps {
  customer?: CustomerRecord | null;
  onSubmit: (payload: CustomerFormData) => void;
  onClose: () => void;
}

interface CustomerFormState {
  company_name: string;
  tin: string;
  billing_address: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  payment_terms_days: string;
  credit_limit: string;
  current_balance: string;
  credit_exposure: string;
}

function toInputValue(value: number | null): string {
  return value == null ? "" : String(value);
}

function toNullableNumber(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

function createInitialState(customer?: CustomerRecord | null): CustomerFormState {
  return {
    company_name: customer?.company_name ?? "",
    tin: customer?.tin ?? "",
    billing_address: customer?.billing_address ?? "",
    primary_contact_name: customer?.primary_contact_name ?? "",
    primary_contact_phone: customer?.primary_contact_phone ?? "",
    payment_terms_days: toInputValue(customer?.payment_terms_days ?? null),
    credit_limit: toInputValue(customer?.credit_limit ?? null),
    current_balance: toInputValue(customer?.current_balance ?? null),
    credit_exposure: toInputValue(customer?.credit_exposure ?? null),
  };
}

export default function CustomerFormModal({
  customer = null,
  onSubmit,
  onClose,
}: CustomerFormModalProps) {
  const [form, setForm] = useState<CustomerFormState>(() => createInitialState(customer));

  const handleChange =
    (field: keyof CustomerFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      company_name: form.company_name.trim(),
      tin: form.tin.trim(),
      billing_address: form.billing_address.trim(),
      primary_contact_name: form.primary_contact_name.trim(),
      primary_contact_phone: form.primary_contact_phone.trim(),
      payment_terms_days: toNullableNumber(form.payment_terms_days),
      credit_limit: toNullableNumber(form.credit_limit),
      current_balance: toNullableNumber(form.current_balance),
      credit_exposure: toNullableNumber(form.credit_exposure),
      status: customer?.status ?? "Active",
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            Manage billing, contact, credit, and lifecycle details for this customer.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Company Name *</label>
                <Input
                  required
                  value={form.company_name}
                  onChange={handleChange("company_name")}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">TIN *</label>
                <Input required value={form.tin} onChange={handleChange("tin")} className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Primary Contact Name</label>
                <Input
                  value={form.primary_contact_name}
                  onChange={handleChange("primary_contact_name")}
                  placeholder="Jane Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Primary Contact Phone</label>
                <Input
                  value={form.primary_contact_phone}
                  onChange={handleChange("primary_contact_phone")}
                  placeholder="+250 788 000 000"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Billing Address</label>
                <Input
                  value={form.billing_address}
                  onChange={handleChange("billing_address")}
                  placeholder="KG 548 St, Kigali"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Payment Terms Days</label>
                <Input
                  type="number"
                  min="0"
                  value={form.payment_terms_days}
                  onChange={handleChange("payment_terms_days")}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Credit Limit</label>
                <Input
                  type="number"
                  min="0"
                  value={form.credit_limit}
                  onChange={handleChange("credit_limit")}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Current Balance</label>
                <Input
                  type="number"
                  min="0"
                  value={form.current_balance}
                  onChange={handleChange("current_balance")}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Credit Exposure</label>
                <Input
                  type="number"
                  min="0"
                  value={form.credit_exposure}
                  onChange={handleChange("credit_exposure")}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{customer ? "Save Changes" : "Add Customer"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
