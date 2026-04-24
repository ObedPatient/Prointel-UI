import { useEffect, useMemo, useState } from "react";
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoodReceiptNoteFormModal from "@/components/good-receipt-notes/GoodReceiptNoteFormModal";
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
  GOODS_RECEIPT_STATUS_FILTER_OPTIONS,
  createGoodReceiptNoteRecord,
  getWarehouseLocationName,
  loadGoodReceiptNotes,
  saveGoodReceiptNotesWithPurchaseOrderSync,
  updateGoodReceiptNoteRecord,
} from "@/lib/good-receipt-notes";
import { formatDate, getSupplierName, loadPurchaseOrders, SUPPLIER_OPTIONS } from "@/lib/purchase-orders";
import type { GoodReceiptNote, GoodReceiptNoteFormData, GoodReceiptNoteStatus } from "@/types/good-receipt-note";
import type { PurchaseOrder } from "@/types/purchase-order";

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: GoodReceiptNoteStatus }) {
  const tones: Record<GoodReceiptNoteStatus, string> = {
    Draft: "border-slate-300 bg-slate-100 text-slate-700",
    Received: "border-green-200 bg-green-100 text-green-700",
    Cancelled: "border-red-200 bg-red-100 text-red-700",
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

export default function GoodsReceivedPage() {
  const navigate = useNavigate();
  const [purchaseOrders] = useState<PurchaseOrder[]>(() => loadPurchaseOrders());
  const [notes, setNotes] = useState<GoodReceiptNote[]>(() => loadGoodReceiptNotes());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GoodReceiptNoteStatus | "All Statuses">(
    "All Statuses",
  );
  const [supplierFilter, setSupplierFilter] = useState<string>("All Suppliers");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GoodReceiptNote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoodReceiptNote | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveGoodReceiptNotesWithPurchaseOrderSync(notes);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return notes.filter((note) => {
      const supplierName = getSupplierName(note.supplier_id).toLowerCase();
      const matchesSearch =
        needle.length === 0 ||
        note.id.toLowerCase().includes(needle) ||
        note.grn_number.toLowerCase().includes(needle) ||
        note.purchase_order_id.toLowerCase().includes(needle) ||
        note.supplier_id.toLowerCase().includes(needle) ||
        supplierName.includes(needle) ||
        note.warehouse_location_id.toLowerCase().includes(needle) ||
        note.received_by.toLowerCase().includes(needle) ||
        note.notes.toLowerCase().includes(needle) ||
        note.lines.some(
          (line) =>
            line.raw_material_id.toLowerCase().includes(needle) ||
            line.batch_lot_number.toLowerCase().includes(needle) ||
            line.po_line_id.toLowerCase().includes(needle),
        );
      const matchesStatus =
        statusFilter === "All Statuses" || note.status === statusFilter;
      const matchesSupplier =
        supplierFilter === "All Suppliers" || note.supplier_id === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [notes, search, statusFilter, supplierFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, supplierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedNotes = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredNotes.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredNotes, page]);

  const handleSubmit = (payload: GoodReceiptNoteFormData) => {
    if (editing) {
      setNotes((current) =>
        current.map((note) =>
          note.id === editing.id ? updateGoodReceiptNoteRecord(note, payload) : note,
        ),
      );
    } else {
      setNotes((current) => [createGoodReceiptNoteRecord(payload, current), ...current]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Goods Received</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage goods receipt notes and their receipt lines against purchase orders.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create GRN
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by GRN number, PO, supplier, warehouse, receiver, or any receipt line reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search goods receipts..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as GoodReceiptNoteStatus | "All Statuses")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {GOODS_RECEIPT_STATUS_FILTER_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Suppliers">All Suppliers</SelectItem>
              {SUPPLIER_OPTIONS.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredNotes.length} GRNs
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[1440px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "GRN NUMBER",
                "PURCHASE ORDER ID",
                "SUPPLIER ID",
                "WAREHOUSE LOCATION ID",
                "RECEIPT DATE",
                "RECEIVED BY",
                "STATUS",
                "NOTES",
                "CREATED AT",
                "ACTIONS",
              ].map((heading) => (
                <TableHead key={heading} className="px-4 py-3 text-[11px] font-semibold tracking-wide">
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedNotes.map((note, index) => (
              <TableRow
                key={note.id}
                className={index % 2 === 1 ? "bg-secondary/10 hover:bg-secondary/30" : "hover:bg-secondary/30"}
              >
                <TableCell className="px-4 py-3 font-medium text-foreground">{note.grn_number}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{note.purchase_order_id}</TableCell>
                <TableCell className="px-4 py-3">
                  <p className="text-foreground">{note.supplier_id}</p>
                  <p className="text-[11px] text-muted-foreground">{getSupplierName(note.supplier_id)}</p>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <p className="text-foreground">{note.warehouse_location_id}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {getWarehouseLocationName(note.warehouse_location_id)}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(note.receipt_date)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{note.received_by}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={note.status} />
                </TableCell>
                <TableCell className="max-w-[260px] px-4 py-3 text-foreground">
                  <span className="line-clamp-2">{note.notes || "—"}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(note.created_at)}</TableCell>
                <TableCell className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label="Open GRN actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/goods-received/${note.id}`)}>
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(note);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(note)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedNotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="px-4 py-14 text-center text-sm text-muted-foreground">
                  No goods receipt notes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredNotes.length}
          itemLabel="goods receipt notes"
          onPageChange={setPage}
        />
      </Card>

      {(modalOpen || editing) && (
        <GoodReceiptNoteFormModal
          note={editing}
          existingNotes={notes}
          purchaseOrders={purchaseOrders}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goods receipt note?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.grn_number} and its receipt lines.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
