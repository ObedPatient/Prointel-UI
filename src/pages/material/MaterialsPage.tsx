import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MaterialFormModal from "@/components/materials/MaterialFormModal";
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
  MATERIAL_CATEGORY_OPTIONS,
  MATERIAL_STATUS_FILTER_OPTIONS,
  createMaterialRecord,
  loadMaterials,
  saveMaterials,
  updateMaterialRecord,
} from "@/lib/materials";
import type { Material, MaterialFormData, MaterialStatus } from "@/types/material";
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

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<MaterialStatus, string> = {
  Active: "bg-green-50 text-green-700 border-green-200",
  "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  Inactive: "bg-secondary text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: MaterialStatus }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLES[status] ?? "bg-secondary text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

function formatCurrency(value: number | null): string {
  return value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
      }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export default function Materials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>(() => loadMaterials());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaterialStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveMaterials(materials);
  }, [materials]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesSearch =
        needle.length === 0 ||
        material.name.toLowerCase().includes(needle) ||
        material.material_code.toLowerCase().includes(needle) ||
        material.description.toLowerCase().includes(needle) ||
        material.material_category.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "All" || material.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All Categories" || material.material_category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, materials, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedMaterials = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, page]);

  const handleSubmit = (payload: MaterialFormData) => {
    if (editing) {
      setMaterials((current) =>
        current.map((material) =>
          material.id === editing.id ? updateMaterialRecord(material, payload) : material,
        ),
      );
    } else {
      setMaterials((current) => [createMaterialRecord(payload, current), ...current]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditing(material);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setMaterials((current) => current.filter((material) => material.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Materials</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage raw material master data, stocking thresholds, and cost baselines.
          </p>
        </div>

        <Button type="button" onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Material
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by material name, code, description, or category and narrow by status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search materials..."
              value={search}
              onChange={handleSearchChange}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as MaterialStatus | "All")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_STATUS_FILTER_OPTIONS.map((status) => (
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
              {MATERIAL_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filtered.length} materials
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[1560px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "MATERIAL CODE",
                "NAME",
                "DESCRIPTION",
                "MATERIAL CATEGORY",
                "UNIT OF MEASURE",
                "MINIMUM STOCK LEVEL",
                "REORDER POINT",
                "REORDER QUANTITY",
                "WEIGHTED AVERAGE COST",
                "CURRENT STOCK",
                "RESERVED STOCK",
                "STATUS",
                "CREATED AT",
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
            {paginatedMaterials.map((material, index) => (
              <TableRow
                key={material.id}
                className={
                  index % 2 === 1
                    ? "bg-secondary/10 hover:bg-secondary/30"
                    : "hover:bg-secondary/30"
                }
              >
                <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                  {material.material_code}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {material.name}
                </TableCell>
                <TableCell className="max-w-[260px] px-4 py-3 text-foreground">
                  <span className="line-clamp-2">{material.description || "—"}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {material.material_category || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {material.unit_of_measure || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(material.minimum_stock_level)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(material.reorder_point)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(material.reorder_quantity)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatCurrency(material.weighted_average_cost)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(material.current_stock)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(material.reserved_stock)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={material.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatDate(material.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label="Open material actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/materials/${material.id}`)}>
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEdit(material)}>
                        <Pencil className="h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(material)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedMaterials.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} className="px-4 py-14 text-center text-sm text-muted-foreground">
                  No materials found. Create your first material to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          itemLabel="materials"
          onPageChange={setPage}
        />
      </Card>

      {(modalOpen || editing) && (
        <MaterialFormModal
          material={editing}
          existingMaterials={materials}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete material?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.name} from local storage.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
