import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  FileText,
  Lock,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import SalesOrderFormModal from "@/components/sales-orders/SalesOrderFormModal";
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
import {
  closeSalesOrder,
  formatCurrencyRwf,
  formatDate,
  formatDateTime,
  formatSalesOrderStatus,
  getBomLabel,
  getCustomerName,
  getDeliveryAddressLabel,
  getProductName,
  getQuotationLabel,
  getSalesOrderBillOfMaterialsOptions,
  getSalesOrderCustomerOptions,
  getSalesOrderDeliveryAddressOptions,
  getSalesOrderProductOptions,
  getSalesOrderQuotationOptions,
  loadSalesOrders,
  markSalesOrderDispatched,
  markSalesOrderInvoiced,
  markSalesOrderReadyForDispatch,
  restoreSalesOrder,
  saveSalesOrders,
  softDeleteSalesOrder,
  startSalesOrderProduction,
  updateSalesOrderRecord,
} from "@/lib/sales-orders";
import type {
  SalesOrderFormData,
  SalesOrderRecord,
  SalesOrderStatus,
} from "@/types/sales-order";

function StatusBadge({ status }: { status: SalesOrderStatus }) {
  const tones: Record<SalesOrderStatus, string> = {
    confirmed: "border-blue-200 bg-blue-100 text-blue-700",
    in_production: "border-amber-200 bg-amber-100 text-amber-700",
    ready_for_dispatch: "border-teal-200 bg-teal-100 text-teal-700",
    dispatched: "border-cyan-200 bg-cyan-100 text-cyan-700",
    invoiced: "border-violet-200 bg-violet-100 text-violet-700",
    closed: "border-green-200 bg-green-100 text-green-700",
  };

  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status]}`}>
      {formatSalesOrderStatus(status)}
    </Badge>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export default function SalesOrderDetailsPage() {
  const { orderNumber = "" } = useParams();
  const decodedOrderNumber = decodeURIComponent(orderNumber);
  const [orders, setOrders] = useState<SalesOrderRecord[]>(() => loadSalesOrders());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const quotationOptions = useMemo(() => getSalesOrderQuotationOptions(), []);
  const customerOptions = useMemo(() => getSalesOrderCustomerOptions(), []);
  const deliveryAddressOptions = useMemo(() => getSalesOrderDeliveryAddressOptions(), []);
  const productOptions = useMemo(() => getSalesOrderProductOptions(), []);
  const billOfMaterialsOptions = useMemo(() => getSalesOrderBillOfMaterialsOptions(), []);

  useEffect(() => {
    saveSalesOrders(orders);
  }, [orders]);

  const order = useMemo(
    () => orders.find((item) => item.order_number === decodedOrderNumber),
    [decodedOrderNumber, orders],
  );

  const remainingToProduce = order ? Math.max(order.quantity_ordered - order.quantity_produced, 0) : 0;
  const remainingToDispatch = order ? Math.max(order.quantity_ordered - order.quantity_dispatched, 0) : 0;

  if (!order) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/sales-orders">
            <ArrowLeft className="h-4 w-4" />
            Back to Sales Orders
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Sales order not found</CardTitle>
            <CardDescription>
              The requested sales order could not be loaded from local storage.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  const applyOrderUpdate = (updated: SalesOrderRecord) => {
    setOrders((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button asChild type="button" variant="ghost" className="mb-2 w-fit gap-2 px-0">
            <Link to="/sales-orders">
              <ArrowLeft className="h-4 w-4" />
              Back to Sales Orders
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{order.order_number}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review the full sales-order lifecycle from commercial commitment through dispatch readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <Button type="button" variant="outline" className="gap-2" onClick={() => setEditing(true)} disabled={order.deleted_at != null || order.status === "closed"}>
            <Pencil className="h-4 w-4" />
            Update
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => applyOrderUpdate(startSalesOrderProduction(order))} disabled={order.deleted_at != null || order.status !== "confirmed"}>
            <Play className="h-4 w-4" />
            Start Production
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => applyOrderUpdate(markSalesOrderReadyForDispatch(order))} disabled={order.deleted_at != null || order.status !== "in_production"}>
            <Lock className="h-4 w-4" />
            Ready Dispatch
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => applyOrderUpdate(markSalesOrderDispatched(order))} disabled={order.deleted_at != null || order.status !== "ready_for_dispatch"}>
            <Truck className="h-4 w-4" />
            Dispatch
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => applyOrderUpdate(markSalesOrderInvoiced(order))} disabled={order.deleted_at != null || order.status !== "dispatched"}>
            <FileText className="h-4 w-4" />
            Invoice
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => applyOrderUpdate(closeSalesOrder(order))} disabled={order.deleted_at != null || order.status !== "invoiced"}>
            <CheckCheck className="h-4 w-4" />
            Close
          </Button>
          {order.deleted_at ? (
            <Button type="button" variant="outline" className="gap-2" onClick={() => applyOrderUpdate(restoreSalesOrder(order))}>
              <RotateCcw className="h-4 w-4" />
              Restore
            </Button>
          ) : (
            <Button type="button" variant="outline" className="gap-2" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Order Value", value: formatCurrencyRwf(order.total_order_value_rwf) },
          { label: "Produced", value: order.quantity_produced.toLocaleString() },
          { label: "Dispatched", value: order.quantity_dispatched.toLocaleString() },
          { label: "Remaining", value: remainingToDispatch.toLocaleString() },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-1 p-4">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Order Number" value={order.order_number} />
            <DetailItem label="Quotation ID" value={getQuotationLabel(order.quotation_id)} />
            <DetailItem label="Customer ID" value={getCustomerName(order.customer_id)} />
            <DetailItem label="Customer PO Number" value={order.customer_po_number || "—"} />
            <DetailItem label="Delivery Address ID" value={getDeliveryAddressLabel(order.delivery_address_id)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Commercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Product Category ID" value={getProductName(order.product_category_id)} />
            <DetailItem label="Bill of Materials ID" value={getBomLabel(order.bill_of_materials_id)} />
            <DetailItem label="Quantity Ordered" value={order.quantity_ordered.toLocaleString()} />
            <DetailItem label="Agreed Unit Price" value={formatCurrencyRwf(order.agreed_unit_price)} />
            <DetailItem label="Agreed Delivery Date" value={formatDate(order.agreed_delivery_date)} />
            <DetailItem label="Total Order Value RWF" value={formatCurrencyRwf(order.total_order_value_rwf)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Execution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Status" value={formatSalesOrderStatus(order.status)} />
            <DetailItem label="Quantity Produced" value={order.quantity_produced.toLocaleString()} />
            <DetailItem label="Quantity Dispatched" value={order.quantity_dispatched.toLocaleString()} />
            <DetailItem label="Material Availability Checked" value={order.material_availability_checked ? "Yes" : "No"} />
            <DetailItem label="Material Insufficient" value={order.material_insufficient ? "Yes" : "No"} />
            <DetailItem label="Created By" value={order.created_by} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timeline</CardTitle>
          <CardDescription>
            Track the operational timestamps attached to this customer order.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Production Started At" value={formatDateTime(order.production_started_at)} />
          <DetailItem label="Ready For Dispatch At" value={formatDateTime(order.ready_for_dispatch_at)} />
          <DetailItem label="Closed At" value={formatDateTime(order.closed_at)} />
          <DetailItem label="Created At" value={formatDateTime(order.created_at)} />
          <DetailItem label="Remaining To Produce" value={remainingToProduce.toLocaleString()} />
          <DetailItem label="Remaining To Dispatch" value={remainingToDispatch.toLocaleString()} />
        </CardContent>
      </Card>

      {editing && (
        <SalesOrderFormModal
          order={order}
          existingOrders={orders}
          quotationOptions={quotationOptions}
          customerOptions={customerOptions}
          deliveryAddressOptions={deliveryAddressOptions}
          productOptions={productOptions}
          billOfMaterialsOptions={billOfMaterialsOptions}
          onSubmit={(payload) => {
            applyOrderUpdate(updateSalesOrderRecord(order, payload));
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sales order</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete {order.order_number} while keeping the record for audit history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                applyOrderUpdate(softDeleteSalesOrder(order));
                setConfirmDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
