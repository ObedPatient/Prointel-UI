import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SalesOrderActionMenu from "@/components/sales-orders/SalesOrderActionMenu";
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
  SALES_ORDER_STATUS_FILTER_OPTIONS,
  closeSalesOrder,
  createSalesOrderRecord,
  formatCurrencyRwf,
  formatDate,
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

const PAGE_SIZE = 8;

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

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrderRecord[]>(() => loadSalesOrders());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesOrderStatus | "All Statuses">("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SalesOrderRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesOrderRecord | null>(null);
  const [page, setPage] = useState(1);

  const quotationOptions = useMemo(() => getSalesOrderQuotationOptions(), []);
  const customerOptions = useMemo(() => getSalesOrderCustomerOptions(), []);
  const deliveryAddressOptions = useMemo(() => getSalesOrderDeliveryAddressOptions(), []);
  const productOptions = useMemo(() => getSalesOrderProductOptions(), []);
  const billOfMaterialsOptions = useMemo(() => getSalesOrderBillOfMaterialsOptions(), []);

  useEffect(() => {
    saveSalesOrders(orders);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        needle.length === 0 ||
        order.order_number.toLowerCase().includes(needle) ||
        getCustomerName(order.customer_id).toLowerCase().includes(needle) ||
        order.customer_po_number.toLowerCase().includes(needle) ||
        getProductName(order.product_category_id).toLowerCase().includes(needle) ||
        order.created_by.toLowerCase().includes(needle);
      const matchesStatus =
        statusFilter === "All Statuses" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, page]);

  const totalOpenValue = useMemo(
    () =>
      orders
        .filter((order) => order.deleted_at == null && order.status !== "closed")
        .reduce((sum, order) => sum + order.total_order_value_rwf, 0),
    [orders],
  );
  const inProductionCount = useMemo(
    () => orders.filter((order) => order.status === "in_production").length,
    [orders],
  );
  const readyDispatchCount = useMemo(
    () => orders.filter((order) => order.status === "ready_for_dispatch").length,
    [orders],
  );

  const handleSubmit = (payload: SalesOrderFormData) => {
    if (editing) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editing.id ? updateSalesOrderRecord(order, payload) : order,
        ),
      );
    } else {
      setOrders((current) => [createSalesOrderRecord(payload, current), ...current]);
    }

    setEditing(null);
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Sales Orders</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Convert commercial commitments into production-ready customer orders with delivery and fulfillment tracking.
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
          New Sales Order
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Orders", value: orders.length.toString() },
          { label: "Open Order Value", value: formatCurrencyRwf(totalOpenValue) },
          { label: "In Production", value: inProductionCount.toString() },
          { label: "Ready for Dispatch", value: readyDispatchCount.toString() },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-1 p-4">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by order number, customer, customer PO, product, or creator and narrow by status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sales orders..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as SalesOrderStatus | "All Statuses")}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {SALES_ORDER_STATUS_FILTER_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "All Statuses" ? status : formatSalesOrderStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredOrders.length} orders
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[2400px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "ORDER NUMBER",
                "QUOTATION",
                "CUSTOMER",
                "CUSTOMER PO NUMBER",
                "DELIVERY ADDRESS",
                "PRODUCT CATEGORY",
                "BILL OF MATERIALS",
                "QTY ORDERED",
                "AGREED UNIT PRICE",
                "AGREED DELIVERY DATE",
                "STATUS",
                "TOTAL ORDER VALUE RWF",
                "QTY PRODUCED",
                "QTY DISPATCHED",
                "MATERIAL CHECKED",
                "MATERIAL INSUFFICIENT",
                "CREATED BY",
                "PRODUCTION STARTED AT",
                "READY FOR DISPATCH AT",
                "CLOSED AT",
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
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{order.order_number}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{getQuotationLabel(order.quotation_id)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{getCustomerName(order.customer_id)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{order.customer_po_number || "—"}</TableCell>
                <TableCell className="max-w-[280px] px-4 py-3 text-foreground">
                  <span className="line-clamp-2">{getDeliveryAddressLabel(order.delivery_address_id)}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{getProductName(order.product_category_id)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{getBomLabel(order.bill_of_materials_id)}</TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">{order.quantity_ordered.toLocaleString()}</TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">{formatCurrencyRwf(order.agreed_unit_price)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(order.agreed_delivery_date)}</TableCell>
                <TableCell className="px-4 py-3"><StatusBadge status={order.status} /></TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">{formatCurrencyRwf(order.total_order_value_rwf)}</TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">{order.quantity_produced.toLocaleString()}</TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">{order.quantity_dispatched.toLocaleString()}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{order.material_availability_checked ? "Yes" : "No"}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{order.material_insufficient ? "Yes" : "No"}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{order.created_by}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(order.production_started_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(order.ready_for_dispatch_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(order.closed_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(order.created_at)}</TableCell>
                <TableCell className="px-4 py-3">
                  <SalesOrderActionMenu
                    order={order}
                    onView={(selected) => navigate(`/sales-orders/${selected.order_number}`)}
                    onUpdate={(selected) => {
                      setEditing(selected);
                      setModalOpen(true);
                    }}
                    onStartProduction={(selected) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.id === selected.id ? startSalesOrderProduction(item) : item,
                        ),
                      )
                    }
                    onReadyForDispatch={(selected) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.id === selected.id ? markSalesOrderReadyForDispatch(item) : item,
                        ),
                      )
                    }
                    onDispatch={(selected) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.id === selected.id ? markSalesOrderDispatched(item) : item,
                        ),
                      )
                    }
                    onInvoice={(selected) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.id === selected.id ? markSalesOrderInvoiced(item) : item,
                        ),
                      )
                    }
                    onClose={(selected) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.id === selected.id ? closeSalesOrder(item) : item,
                        ),
                      )
                    }
                    onDelete={setDeleteTarget}
                    onRestore={(selected) =>
                      setOrders((current) =>
                        current.map((item) =>
                          item.id === selected.id ? restoreSalesOrder(item) : item,
                        ),
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}

            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={22} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No sales orders found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredOrders.length}
          itemLabel="sales orders"
          onPageChange={setPage}
        />
      </Card>

      {modalOpen && (
        <SalesOrderFormModal
          order={editing}
          existingOrders={orders}
          quotationOptions={quotationOptions}
          customerOptions={customerOptions}
          deliveryAddressOptions={deliveryAddressOptions}
          productOptions={productOptions}
          billOfMaterialsOptions={billOfMaterialsOptions}
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
            <AlertDialogTitle>Delete sales order</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete {deleteTarget?.order_number ?? "this sales order"} while preserving the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) {
                  return;
                }

                setOrders((current) =>
                  current.map((item) =>
                    item.id === deleteTarget.id ? softDeleteSalesOrder(item) : item,
                  ),
                );
                setDeleteTarget(null);
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
