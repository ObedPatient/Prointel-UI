import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCheck, CircleX, Lock, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PurchaseOrderConfirmModal from "@/components/purchase-orders/PurchaseOrderConfirmModal";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchaseOrderRejectModal from "@/components/purchase-orders/PurchaseOrderRejectModal";
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
  CURRENT_USER,
  SUPPLIER_OPTIONS,
  createUpdatedLines,
  formatCurrency,
  formatDate,
  getSupplierName,
  loadPurchaseOrders,
  savePurchaseOrders,
  withTotals,
} from "@/lib/purchase-orders";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types/purchase-order";

const LINE_ITEMS_PAGE_SIZE = 5;

function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const tones: Record<PurchaseOrderStatus, string> = {
    Draft: "border-slate-300 bg-slate-100 text-slate-700",
    Submitted: "border-blue-200 bg-blue-100 text-blue-700",
    Approved: "border-green-200 bg-green-100 text-green-700",
    Rejected: "border-red-200 bg-red-100 text-red-700",
    Closed: "border-amber-200 bg-amber-100 text-amber-700",
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

export default function PurchaseOrderDetails() {
  const { poNumber = "" } = useParams();
  const decodedPoNumber = decodeURIComponent(poNumber);
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => loadPurchaseOrders());
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [lineItemsPage, setLineItemsPage] = useState(1);

  useEffect(() => {
    savePurchaseOrders(orders);
  }, [orders]);

  const order = useMemo(
    () => orders.find((item) => item.po_number === decodedPoNumber),
    [decodedPoNumber, orders],
  );
  const totalLinePages = useMemo(
    () => Math.max(1, Math.ceil((order?.lines.length ?? 0) / LINE_ITEMS_PAGE_SIZE)),
    [order?.lines.length],
  );
  const paginatedLineItems = useMemo(() => {
    if (!order) {
      return [];
    }

    const startIndex = (lineItemsPage - 1) * LINE_ITEMS_PAGE_SIZE;
    return order.lines.slice(startIndex, startIndex + LINE_ITEMS_PAGE_SIZE);
  }, [lineItemsPage, order]);

  useEffect(() => {
    setLineItemsPage(1);
  }, [decodedPoNumber]);

  useEffect(() => {
    setLineItemsPage((current) => Math.min(current, totalLinePages));
  }, [totalLinePages]);

  const handleApprove = () => {
    setConfirmApproveOpen(true);
  };

  const handleReject = () => {
    setRejecting(true);
  };

  const handleClose = () => {
    setConfirmCloseOpen(true);
  };

  const confirmApprove = () => {
    if (!order) {
      return;
    }

    const now = new Date().toISOString();
    setOrders((current) =>
      current.map((item) =>
        item.po_number === order.po_number
          ? {
              ...item,
              status: "Approved",
              approved_by: CURRENT_USER,
              approved_at: now,
              rejection_reason: null,
            }
          : item,
      ),
    );
    setConfirmApproveOpen(false);
  };

  const confirmClose = () => {
    if (!order) {
      return;
    }

    const now = new Date().toISOString();
    setOrders((current) =>
      current.map((item) =>
        item.po_number === order.po_number
          ? {
              ...item,
              status: "Closed",
              closed_at: now,
            }
          : item,
      ),
    );
    setConfirmCloseOpen(false);
  };

  const handleSubmit = (payload: PurchaseOrder) => {
    if (!order) {
      return;
    }

    const now = new Date().toISOString();
    const updatedOrder = {
      ...order,
      ...payload,
      total_amount: payload.total_amount,
      lines: createUpdatedLines(order.po_number, payload.lines, now).map((line, index) => ({
        ...line,
        created_at: order.lines[index]?.created_at ?? line.created_at,
      })),
    };

    setOrders((current) =>
      withTotals(
        current.map((item) => (item.po_number === order.po_number ? updatedOrder : item)),
      ),
    );
    setEditing(false);
  };

  if (!order) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/purchase-orders">
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Purchase order not found</CardTitle>
            <CardDescription>
              The requested purchase order could not be loaded from local storage.
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
            <Link to="/purchase-orders">
              <ArrowLeft className="h-4 w-4" />
              Back to Purchase Orders
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{order.po_number}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review purchase order details and all line items in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <Button type="button" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Update
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleApprove}
            disabled={order.status === "Approved" || order.status === "Closed"}
          >
            <CheckCheck className="h-4 w-4" />
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleReject}
            disabled={order.status === "Rejected" || order.status === "Closed"}
          >
            <CircleX className="h-4 w-4" />
            Reject
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleClose}
            disabled={order.status === "Closed"}
          >
            <Lock className="h-4 w-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Supplier</p>
              <p className="mt-1 text-foreground">{getSupplierName(order.supplier_id)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Delivery Address</p>
              <p className="mt-1 text-foreground">{order.delivery_address}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Required Delivery Date</p>
              <p className="mt-1 text-foreground">{formatDate(order.required_delivery_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Amount</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Created & Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created By</p>
              <p className="mt-1 text-foreground">{order.created_by}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created At</p>
              <p className="mt-1 text-foreground">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Submitted At</p>
              <p className="mt-1 text-foreground">{formatDate(order.submitted_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Closed At</p>
              <p className="mt-1 text-foreground">{formatDate(order.closed_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Approval Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Approved By</p>
              <p className="mt-1 text-foreground">{order.approved_by ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Approved At</p>
              <p className="mt-1 text-foreground">{formatDate(order.approved_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Rejection Reason</p>
              <p className="mt-1 text-foreground">{order.rejection_reason ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Purchase Order Lines</CardTitle>
          <CardDescription>
            All materials attached to this purchase order are listed below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">LINE</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">MATERIAL NAME</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">DESCRIPTION</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">QTY ORDERED</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">UOM</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">UNIT PRICE</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">RECEIVED</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">SUBTOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLineItems.map((line, index) => (
                  <TableRow
                    key={`${line.purchase_order_id}-${line.line_number}`}
                    className={index % 2 === 1 ? "bg-secondary/10" : ""}
                  >
                    <TableCell className="px-4 py-3 text-foreground">{line.line_number}</TableCell>
                    <TableCell className="px-4 py-3 font-medium text-foreground">
                      <div>
                        <p>{line.raw_material_name}</p>
                        <p className="text-xs text-muted-foreground">{line.raw_material_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[320px] px-4 py-3 text-foreground">
                      <span className="line-clamp-2">{line.description}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.quantity_ordered}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.unit_of_measure}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{formatCurrency(line.unit_price)}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.quantity_received}</TableCell>
                    <TableCell className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(line.quantity_ordered * line.unit_price)}
                    </TableCell>
                  </TableRow>
                ))}

                {order.lines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No line items found for this purchase order.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={lineItemsPage}
            pageSize={LINE_ITEMS_PAGE_SIZE}
            totalItems={order.lines.length}
            itemLabel="line items"
            onPageChange={setLineItemsPage}
          />
        </CardContent>
      </Card>

      {editing && (
        <PurchaseOrderFormModal
          order={order}
          supplierOptions={SUPPLIER_OPTIONS}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      <PurchaseOrderRejectModal
        order={rejecting ? order : null}
        onClose={() => setRejecting(false)}
        onSubmit={(reason) => {
          setOrders((current) =>
            current.map((item) =>
              item.po_number === order.po_number
                ? {
                    ...item,
                    status: "Rejected",
                    approved_by: null,
                    approved_at: null,
                    rejection_reason: reason,
                  }
                : item,
            ),
          );
          setRejecting(false);
        }}
      />

      <PurchaseOrderConfirmModal
        order={order}
        action="approve"
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        onConfirm={confirmApprove}
      />

      <PurchaseOrderConfirmModal
        order={order}
        action="close"
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        onConfirm={confirmClose}
      />
    </div>
  );
}
