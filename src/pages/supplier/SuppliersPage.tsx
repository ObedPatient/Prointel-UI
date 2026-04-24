import { useEffect, useMemo, useState } from "react";
import { Eye, MoreHorizontal, Pencil, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SupplierFormModal from "@/components/supplier/SupplierFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataPagination from "@/components/ui/data-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createSupplierRecord,
  loadSuppliers,
  saveSuppliers,
} from "@/lib/suppliers";
import type { Supplier, SupplierRecord } from "@/types/supplier";

const PAGE_SIZE = 8;

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
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => loadSuppliers());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveSuppliers(suppliers);
  }, [suppliers]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        needle.length === 0 ||
        supplier.company_name.toLowerCase().includes(needle) ||
        supplier.category.toLowerCase().includes(needle) ||
        supplier.tin.toLowerCase().includes(needle) ||
        supplier.primary_contact_name.toLowerCase().includes(needle) ||
        supplier.primary_contact_phone.toLowerCase().includes(needle);

      const matchesStatus =
        statusFilter === "All Statuses" || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, suppliers]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, page]);

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
          supplier.id === editing.id ? createSupplierRecord(editing.id, payload) : supplier,
        ),
      );
    } else {
      setSuppliers((current) => [
        createSupplierRecord(crypto.randomUUID(), payload),
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
            placeholder="Search company, category, TIN, or contact..."
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
        <Table className="min-w-[1280px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "COMPANY",
                "CATEGORY",
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
                "ACTIONS",
              ].map((heading) => (
                <TableHead
                  key={heading}
                  className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide"
                >
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSuppliers.map((supplier, index) => (
              <TableRow
                key={supplier.id}
                className={index % 2 === 1 ? "bg-secondary/10 hover:bg-secondary/30" : "hover:bg-secondary/30"}
              >
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {supplier.company_name}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{supplier.category || "—"}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{supplier.tin}</TableCell>
                <TableCell className="px-4 py-3">
                  <p className="text-foreground">{supplier.primary_contact_name || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {supplier.primary_contact_phone || "—"}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{supplier.payment_terms || "—"}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(supplier.payment_days)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(supplier.average_lead_time_days)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatCurrency(supplier.credit_limit)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatCurrency(supplier.current_balance)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <PerformanceRating value={supplier.performance_rating} />
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatPercent(supplier.on_time_delivery_rate)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatPercent(supplier.quality_rejection_rate)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={supplier.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatDate(supplier.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatDate(supplier.archived_at)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label="Open supplier actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(supplier)}>
                        <Pencil className="h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={16} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          itemLabel="suppliers"
          onPageChange={setPage}
        />
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
