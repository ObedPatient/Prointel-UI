import { useState } from "react";
import type { Supplier, SupplierRecord } from "@/types/supplier";
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

interface SupplierFormModalProps {
  supplier?: SupplierRecord | null;
  onSubmit: (supplier: Supplier) => void;
  onClose: () => void;
}

interface SupplierFormState {
  company_name: string;
  category: string;
  tin: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  payment_terms: string;
  payment_days: string;
  average_lead_time_days: string;
  credit_limit: string;
  current_balance: string;
  performance_rating: string;
  on_time_delivery_rate: string;
  quality_rejection_rate: string;
  status: string;
}

const STATUS_OPTIONS = ["Active", "Inactive", "Archived"];

function toInputValue(value: number | null): string {
  return value == null ? "" : String(value);
}

function toNullableNumber(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

function createInitialState(supplier?: SupplierRecord | null): SupplierFormState {
  return {
    company_name: supplier?.company_name ?? "",
    category: supplier?.category ?? "",
    tin: supplier?.tin ?? "",
    primary_contact_name: supplier?.primary_contact_name ?? "",
    primary_contact_phone: supplier?.primary_contact_phone ?? "",
    payment_terms: supplier?.payment_terms ?? "",
    payment_days: toInputValue(supplier?.payment_days ?? null),
    average_lead_time_days: toInputValue(supplier?.average_lead_time_days ?? null),
    credit_limit: toInputValue(supplier?.credit_limit ?? null),
    current_balance: toInputValue(supplier?.current_balance ?? null),
    performance_rating: toInputValue(supplier?.performance_rating ?? null),
    on_time_delivery_rate: toInputValue(supplier?.on_time_delivery_rate ?? null),
    quality_rejection_rate: toInputValue(supplier?.quality_rejection_rate ?? null),
    status: supplier?.status ?? "Active",
  };
}

export default function SupplierFormModal({
  supplier = null,
  onSubmit,
  onClose,
}: SupplierFormModalProps) {
  const [form, setForm] = useState<SupplierFormState>(() => createInitialState(supplier));

  const handleChange =
    (field: keyof SupplierFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextStatus = form.status;
    const createdAt = supplier?.created_at ?? new Date().toISOString();
    const archivedAt =
      nextStatus === "Archived" ? supplier?.archived_at ?? new Date().toISOString() : null;

    onSubmit({
      company_name: form.company_name.trim(),
      category: form.category.trim(),
      tin: form.tin.trim(),
      primary_contact_name: form.primary_contact_name.trim(),
      primary_contact_phone: form.primary_contact_phone.trim(),
      payment_terms: form.payment_terms.trim(),
      payment_days: toNullableNumber(form.payment_days),
      average_lead_time_days: toNullableNumber(form.average_lead_time_days),
      credit_limit: toNullableNumber(form.credit_limit),
      current_balance: toNullableNumber(form.current_balance),
      performance_rating: toNullableNumber(form.performance_rating),
      on_time_delivery_rate: toNullableNumber(form.on_time_delivery_rate),
      quality_rejection_rate: toNullableNumber(form.quality_rejection_rate),
      status: nextStatus,
      archived_at: archivedAt,
      created_at: createdAt,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          <DialogDescription>
            Update supplier details, status, and performance metrics in one place.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Company Name *</label>
              <Input
                required
                value={form.company_name}
                onChange={handleChange("company_name")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Input
                value={form.category}
                onChange={handleChange("category")}
                placeholder="Packaging Materials"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">TIN *</label>
              <Input
                required
                value={form.tin}
                onChange={handleChange("tin")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Primary Contact Name
              </label>
              <Input
                value={form.primary_contact_name}
                onChange={handleChange("primary_contact_name")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Primary Contact Phone
              </label>
              <Input
                value={form.primary_contact_phone}
                onChange={handleChange("primary_contact_phone")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Payment Terms</label>
              <Input
                value={form.payment_terms}
                onChange={handleChange("payment_terms")}
                placeholder="Net 30"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Payment Days</label>
              <Input
                type="number"
                value={form.payment_days}
                onChange={handleChange("payment_days")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Average Lead Time Days
              </label>
              <Input
                type="number"
                value={form.average_lead_time_days}
                onChange={handleChange("average_lead_time_days")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Credit Limit</label>
              <Input
                type="number"
                value={form.credit_limit}
                onChange={handleChange("credit_limit")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Balance</label>
              <Input
                type="number"
                value={form.current_balance}
                onChange={handleChange("current_balance")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Performance Rating
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.performance_rating}
                onChange={handleChange("performance_rating")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                On-Time Delivery Rate
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.on_time_delivery_rate}
                onChange={handleChange("on_time_delivery_rate")}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Quality Rejection Rate
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.quality_rejection_rate}
                onChange={handleChange("quality_rejection_rate")}
                className="mt-1"
              />
            </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{supplier ? "Save Changes" : "Add Supplier"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
