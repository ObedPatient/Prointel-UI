// @ts-nocheck
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import SupplierFormModal from "@/components/supplier/SupplierFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Supplier, SupplierRecord } from "@/types/supplier";

const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: "supplier-001",
    company_name: "Kigali Packaging Works",
    tin: "107845239",
    primary_contact_name: "Alice Uwimana",
    primary_contact_phone: "+250 788 111 222",
    payment_terms: "Net 30",
    payment_days: 30,
    average_lead_time_days: 7,
    credit_limit: 2500000,
    current_balance: 540000,
    performance_rating: 91,
    on_time_delivery_rate: 96,
    quality_rejection_rate: 2,
    status: "Active",
    archived_at: null,
    created_at: "2026-01-15T08:30:00.000Z",
  },
  {
    id: "supplier-002",
    company_name: "Great Lakes Fiber Ltd",
    tin: "102334875",
    primary_contact_name: "Samuel Ndayisaba",
    primary_contact_phone: "+250 789 333 444",
    payment_terms: "Net 45",
    payment_days: 45,
    average_lead_time_days: 12,
    credit_limit: 4000000,
    current_balance: 1280000,
    performance_rating: 78,
    on_time_delivery_rate: 88,
    quality_rejection_rate: 5,
    status: "Active",
    archived_at: null,
    created_at: "2025-11-04T10:15:00.000Z",
  },
  {
    id: "supplier-003",
    company_name: "Virunga Industrial Supplies",
    tin: "109992144",
    primary_contact_name: "Diane Mukamana",
    primary_contact_phone: "+250 787 555 999",
    payment_terms: "Cash on Delivery",
    payment_days: 0,
    average_lead_time_days: 4,
    credit_limit: 800000,
    current_balance: 0,
    performance_rating: 84,
    on_time_delivery_rate: 81,
    quality_rejection_rate: 7,
    status: "Inactive",
    archived_at: null,
    created_at: "2025-08-22T14:00:00.000Z",
  },
];

function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

function formatPercent(value: number | null): string {
  return value == null ? "—" : `${value}%`;
}

function formatCurrency(value: number | null): string {
  return value == null ? "—" : `$${value.toLocaleString()}`;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function PerformanceRating({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const color =
    value >= 85 ? "text-green-600" : value >= 70 ? "text-amber-500" : "text-red-500";

  return <span className={`font-semibold ${color}`}>{value}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    Active: "border-green-200 bg-green-100 text-green-700",
    Inactive: "border-slate-300 bg-slate-200 text-slate-700",
    Archived: "border-amber-200 bg-amber-100 text-amber-700",
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        tones[status] ?? "bg-secondary text-foreground"
      }`}
    >
      {status}
    </Badge>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        needle.length === 0 ||
        supplier.company_name.toLowerCase().includes(needle) ||
        supplier.tin.toLowerCase().includes(needle) ||
        supplier.primary_contact_name.toLowerCase().includes(needle) ||
        supplier.primary_contact_phone.toLowerCase().includes(needle);

      const matchesStatus =
        statusFilter === "All Statuses" || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, suppliers]);

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (supplier: SupplierRecord) => {
    setEditing(supplier);
    setModalOpen(true);
  };

  const handleSubmit = (payload: Supplier) => {
    if (editing) {
      setSuppliers((current) =>
        current.map((supplier) =>
          supplier.id === editing.id ? { ...supplier, ...payload } : supplier,
        ),
      );
    } else {
      setSuppliers((current) => [
        {
          id: crypto.randomUUID(),
          ...payload,
        },
        ...current,
      ]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Supplier Directory</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage suppliers with a typed TypeScript data model.
          </p>
        </div>

        <Button type="button" onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Search and narrow the supplier list before editing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search company, TIN, or contact..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-72 pl-9"
          />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filtered.length} suppliers
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {[
                  "COMPANY",
                  "TIN",
                  "PRIMARY CONTACT",
                  "TERMS",
                  "PAYMENT DAYS",
                  "LEAD TIME",
                  "CREDIT LIMIT",
                  "BALANCE",
                  "PERFORMANCE",
                  "ON-TIME",
                  "REJECTION",
                  "STATUS",
                  "CREATED",
                  "ARCHIVED",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier, index) => (
                <tr
                  key={supplier.id}
                  className={`cursor-pointer border-b border-border transition-colors hover:bg-secondary/30 ${
                    index % 2 === 1 ? "bg-secondary/10" : ""
                  }`}
                  onClick={() => openEditModal(supplier)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {supplier.company_name}
                  </td>
                  <td className="px-4 py-3 text-foreground">{supplier.tin}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{supplier.primary_contact_name || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {supplier.primary_contact_phone || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{supplier.payment_terms || "—"}</td>
                  <td className="px-4 py-3 text-foreground">
                    {formatNumber(supplier.payment_days)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatNumber(supplier.average_lead_time_days)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatCurrency(supplier.credit_limit)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatCurrency(supplier.current_balance)}
                  </td>
                  <td className="px-4 py-3">
                    <PerformanceRating value={supplier.performance_rating} />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatPercent(supplier.on_time_delivery_rate)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatPercent(supplier.quality_rejection_rate)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={supplier.status} />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatDate(supplier.created_at)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatDate(supplier.archived_at)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modalOpen && (
        <SupplierFormModal
          supplier={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
