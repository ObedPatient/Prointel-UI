import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, MapPin, Pencil, Truck, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  findPurchaseOrderLineById,
  getWarehouseLocationName,
  loadGoodReceiptNotes,
  saveGoodReceiptNotesWithPurchaseOrderSync,
  updateGoodReceiptNoteRecord,
} from "@/lib/good-receipt-notes";
import { formatDate, getSupplierName, loadPurchaseOrders } from "@/lib/purchase-orders";
import type { GoodReceiptNote, GoodReceiptNoteFormData, GoodReceiptNoteStatus } from "@/types/good-receipt-note";
import type { PurchaseOrder } from "@/types/purchase-order";

const LINE_ITEMS_PAGE_SIZE = 5;

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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function GoodReceiptNoteDetailsPage() {
  const { grnId = "" } = useParams();
  const navigate = useNavigate();
  const [purchaseOrders] = useState<PurchaseOrder[]>(() => loadPurchaseOrders());
  const [notes, setNotes] = useState<GoodReceiptNote[]>(() => loadGoodReceiptNotes());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lineItemsPage, setLineItemsPage] = useState(1);

  useEffect(() => {
    saveGoodReceiptNotesWithPurchaseOrderSync(notes);
  }, [notes]);

  const note = useMemo(
    () => notes.find((item) => item.id === grnId),
    [grnId, notes],
  );

  const totalLinePages = useMemo(
    () => Math.max(1, Math.ceil((note?.lines.length ?? 0) / LINE_ITEMS_PAGE_SIZE)),
    [note?.lines.length],
  );

  useEffect(() => {
    setLineItemsPage((current) => Math.min(current, totalLinePages));
  }, [totalLinePages]);

  const paginatedLines = useMemo(() => {
    if (!note) {
      return [];
    }

    const startIndex = (lineItemsPage - 1) * LINE_ITEMS_PAGE_SIZE;
    return note.lines.slice(startIndex, startIndex + LINE_ITEMS_PAGE_SIZE);
  }, [lineItemsPage, note]);

  const handleSubmit = (payload: GoodReceiptNoteFormData) => {
    if (!note) {
      return;
    }

    setNotes((current) =>
      current.map((item) => (item.id === note.id ? updateGoodReceiptNoteRecord(item, payload) : item)),
    );
    setEditing(false);
  };

  const handleDelete = () => {
    if (!note) {
      return;
    }

    const nextNotes = notes.filter((item) => item.id !== note.id);
    setNotes(nextNotes);
    saveGoodReceiptNotesWithPurchaseOrderSync(nextNotes);
    navigate("/goods-received");
  };

  if (!note) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/goods-received">
            <ArrowLeft className="h-4 w-4" />
            Back to Goods Received
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Goods receipt note not found</CardTitle>
            <CardDescription>
              The requested goods receipt note could not be loaded from local storage.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button asChild type="button" variant="ghost" className="mb-2 w-fit gap-2 px-0">
            <Link to="/goods-received">
              <ArrowLeft className="h-4 w-4" />
              Back to Goods Received
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{note.grn_number}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review the GRN header and every goods receipt line in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={note.status} />
          <Button type="button" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Update
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Purchase Order" value={note.purchase_order_id} />
        <StatCard icon={Truck} label="Supplier" value={getSupplierName(note.supplier_id)} />
        <StatCard icon={MapPin} label="Warehouse" value={getWarehouseLocationName(note.warehouse_location_id)} />
        <StatCard icon={ClipboardList} label="Receipt Date" value={formatDate(note.receipt_date)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receipt Header</CardTitle>
            <CardDescription>Core header values recorded on this goods receipt note.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ID</span>
              <span className="font-medium text-foreground">{note.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tenant ID</span>
              <span className="font-medium text-foreground">{note.tenant_id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Supplier ID</span>
              <span className="font-medium text-foreground">{note.supplier_id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Received By</span>
              <span className="font-medium text-foreground">{note.received_by}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-medium text-foreground">{formatDate(note.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Warehouse & Notes</CardTitle>
            <CardDescription>Receiving location and any additional receiving remarks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Warehouse Location ID</span>
              <span className="font-medium text-foreground">{note.warehouse_location_id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Warehouse Name</span>
              <span className="font-medium text-foreground">
                {getWarehouseLocationName(note.warehouse_location_id)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground">{note.status}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <p className="mt-2 text-foreground">{note.notes || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Goods Receipt Note Lines</CardTitle>
          <CardDescription>
            Every receipt line posted against this GRN is listed below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table className="min-w-[1380px]">
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                {[
                  "GRN ID",
                  "PO LINE ID",
                  "RAW MATERIAL ID",
                  "QUANTITY RECEIVED",
                  "BATCH / LOT NUMBER",
                  "EXPIRY DATE",
                  "WAREHOUSE LOCATION ID",
                  "CREATED AT",
                ].map((heading) => (
                  <TableHead key={heading} className="px-4 py-3 text-[11px] font-semibold tracking-wide">
                    {heading}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLines.map((line, index) => {
                const poLine = findPurchaseOrderLineById(purchaseOrders, line.po_line_id);

                return (
                  <TableRow key={line.id} className={index % 2 === 1 ? "bg-secondary/10" : ""}>
                    <TableCell className="px-4 py-3 font-mono text-xs text-foreground">{line.grn_id}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.po_line_id}</TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-foreground">{line.raw_material_id}</p>
                      <p className="text-xs text-muted-foreground">{poLine?.line.raw_material_name ?? "—"}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.quantity_received}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.batch_lot_number || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{formatDate(line.expiry_date)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-foreground">{line.warehouse_location_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {getWarehouseLocationName(line.warehouse_location_id)}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{formatDate(line.created_at)}</TableCell>
                  </TableRow>
                );
              })}
              {paginatedLines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-14 text-center text-sm text-muted-foreground">
                    No receipt lines found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataPagination
            page={lineItemsPage}
            pageSize={LINE_ITEMS_PAGE_SIZE}
            totalItems={note.lines.length}
            itemLabel="receipt lines"
            onPageChange={setLineItemsPage}
          />
        </CardContent>
      </Card>

      {editing && (
        <GoodReceiptNoteFormModal
          note={note}
          existingNotes={notes}
          purchaseOrders={purchaseOrders}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goods receipt note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {note.grn_number} and its receipt lines.
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
