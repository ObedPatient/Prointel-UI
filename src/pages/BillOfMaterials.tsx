import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BillOfMaterialsActionMenu from "@/components/bill-of-materials/BillOfMaterialsActionMenu";
import BillOfMaterialsFormModal from "@/components/bill-of-materials/BillOfMaterialsFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataPagination from "@/components/ui/data-pagination";
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
  BOM_STATUS_FILTER_OPTIONS,
  CURRENT_BOM_USER,
  PRODUCT_CATEGORY_OPTIONS,
  formatDate,
  loadBillOfMaterials,
  saveBillOfMaterials,
} from "@/lib/bill-of-materials";
import type { BillOfMaterials, BillOfMaterialsStatus } from "@/types/bill-of-materials";

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: BillOfMaterialsStatus }) {
  const tones: Record<BillOfMaterialsStatus, string> = {
    Draft: "border-slate-300 bg-slate-100 text-slate-700",
    Approved: "border-green-200 bg-green-100 text-green-700",
    Superseded: "border-amber-200 bg-amber-100 text-amber-700",
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status]}`}
    >
      {status}
    </Badge>
  );
}

export default function BillOfMaterialsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<BillOfMaterials[]>(() => loadBillOfMaterials());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillOfMaterialsStatus | "All Statuses">(
    "All Statuses",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BillOfMaterials | null>(null);
  const [approving, setApproving] = useState<BillOfMaterials | null>(null);
  const [superseding, setSuperseding] = useState<BillOfMaterials | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveBillOfMaterials(records);
  }, [records]);

  const filteredRecords = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        needle.length === 0 ||
        record.bom_code.toLowerCase().includes(needle) ||
        record.name.toLowerCase().includes(needle) ||
        record.description.toLowerCase().includes(needle) ||
        record.product_category_id.toLowerCase().includes(needle) ||
        record.created_by.toLowerCase().includes(needle) ||
        record.lines.some((line) => line.raw_material_id.toLowerCase().includes(needle));

      const matchesStatus =
        statusFilter === "All Statuses" || record.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All Categories" || record.product_category_id === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [records, search, statusFilter, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRecords, page]);

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = (payload: BillOfMaterials) => {
    if (editing) {
      setRecords((current) =>
        current.map((record) => (record.id === editing.id ? payload : record)),
      );
    } else {
      setRecords((current) => [payload, ...current]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  const confirmApprove = () => {
    if (!approving) {
      return;
    }

    const now = new Date().toISOString();

    setRecords((current) =>
      current.map((record) =>
        record.id === approving.id
          ? {
              ...record,
              status: "Approved",
              approved_by: CURRENT_BOM_USER,
              approved_at: now,
            }
          : record,
      ),
    );
    setApproving(null);
  };

  const confirmSupersede = () => {
    if (!superseding) {
      return;
    }

    const now = new Date().toISOString();

    setRecords((current) =>
      current.map((record) =>
        record.id === superseding.id
          ? {
              ...record,
              status: "Superseded",
              superseded_at: now,
            }
          : record,
      ),
    );
    setSuperseding(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Bill of Materials</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define BOM headers and manage many BOM lines for each product category.
          </p>
        </div>

        <Button type="button" onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Create BOM
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by BOM code, name, product category, creator, or any raw material reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search BOMs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as BillOfMaterialsStatus | "All Statuses")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {BOM_STATUS_FILTER_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredRecords.length} BOMs
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[1320px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "BOM CODE",
                "NAME",
                "PRODUCT CATEGORY",
                "VERSION",
                "STATUS",
                "CREATED BY",
                "APPROVED BY",
                "APPROVED AT",
                "SUPERSEDED AT",
                "CREATED AT",
                "LINES",
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
            {paginatedRecords.map((record, index) => (
              <TableRow
                key={record.id}
                className={index % 2 === 1 ? "bg-secondary/10" : ""}
              >
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {record.bom_code}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <p className="font-medium text-foreground">{record.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {record.description || "No description"}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {record.product_category_id}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">v{record.version}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={record.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{record.created_by}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{record.approved_by ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(record.approved_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(record.superseded_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(record.created_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{record.lines.length}</TableCell>
                <TableCell className="px-4 py-3">
                  <BillOfMaterialsActionMenu
                    bom={record}
                    onView={(bom) => navigate(`/bill-of-materials/${bom.id}`)}
                    onUpdate={(bom) => {
                      setEditing(bom);
                      setModalOpen(true);
                    }}
                    onApprove={setApproving}
                    onSupersede={setSuperseding}
                  />
                </TableCell>
              </TableRow>
            ))}

            {paginatedRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No BOM records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredRecords.length}
          itemLabel="BOMs"
          onPageChange={setPage}
        />
      </Card>

      {modalOpen && (
        <BillOfMaterialsFormModal
          bom={editing}
          existingRecords={records}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={approving != null} onOpenChange={(open) => !open && setApproving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              {approving
                ? `This will mark ${approving.bom_code} as approved and stamp the approval audit fields.`
                : "This action will approve the selected BOM."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={superseding != null} onOpenChange={(open) => !open && setSuperseding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supersede BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              {superseding
                ? `This will mark ${superseding.bom_code} as superseded. It will remain viewable for history.`
                : "This action will supersede the selected BOM."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSupersede}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Supersede
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
