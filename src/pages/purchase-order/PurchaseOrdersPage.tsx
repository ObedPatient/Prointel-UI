import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PurchaseOrderActionMenu from "@/components/purchase-orders/PurchaseOrderActionMenu";
import PurchaseOrderConfirmModal from "@/components/purchase-orders/PurchaseOrderConfirmModal";
import PurchaseOrderFormModal from "@/components/purchase-orders/PurchaseOrderFormModal";
import PurchaseOrderRejectModal from "@/components/purchase-orders/PurchaseOrderRejectModal";
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
  CURRENT_USER,
  STATUS_FILTER_OPTIONS,
  SUPPLIER_OPTIONS,
  calculateTotalAmount,
  formatCurrency,
  formatDate,
  generateMaterialId,
  generateNextPoNumber,
  getSupplierName,
  loadPurchaseOrders,
  savePurchaseOrders,
} from "@/lib/purchase-orders";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types/purchase-order";

const PAGE_SIZE = 8;

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

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => loadPurchaseOrders());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "All Statuses">(
    "All Statuses",
  );
  const [supplierFilter, setSupplierFilter] = useState<string>("All Suppliers");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [rejecting, setRejecting] = useState<PurchaseOrder | null>(null);
  const [approving, setApproving] = useState<PurchaseOrder | null>(null);
  const [closing, setClosing] = useState<PurchaseOrder | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    savePurchaseOrders(orders);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return orders.filter((order) => {
      const supplierName = getSupplierName(order.supplier_id).toLowerCase();
      const matchesSearch =
        needle.length === 0 ||
        order.po_number.toLowerCase().includes(needle) ||
        supplierName.includes(needle) ||
        order.delivery_address.toLowerCase().includes(needle) ||
        order.created_by.toLowerCase().includes(needle) ||
        order.lines.some(
          (line) =>
            line.raw_material_name.toLowerCase().includes(needle) ||
            line.raw_material_id.toLowerCase().includes(needle) ||
            line.description.toLowerCase().includes(needle),
        );

      const matchesStatus =
        statusFilter === "All Statuses" || order.status === statusFilter;
      const matchesSupplier =
        supplierFilter === "All Suppliers" || order.supplier_id === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [orders, search, statusFilter, supplierFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, supplierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, page]);

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (order: PurchaseOrder) => {
    setEditing(order);
    setModalOpen(true);
  };

  const handleSubmit = (payload: PurchaseOrder) => {
    const now = new Date().toISOString();
    const poNumber = editing?.po_number ?? generateNextPoNumber(orders);
    const nextOrder = {
      ...payload,
      po_number: poNumber,
      status: editing?.status ?? "Submitted",
      created_by: editing?.created_by ?? CURRENT_USER,
      submitted_at: editing?.submitted_at ?? now,
      approved_by: editing?.approved_by ?? null,
      approved_at: editing?.approved_at ?? null,
      rejection_reason: editing?.rejection_reason ?? null,
      closed_at: editing?.closed_at ?? null,
      created_at: editing?.created_at ?? now,
      total_amount: calculateTotalAmount(payload),
      lines: payload.lines.map((line, index) => ({
        ...line,
        purchase_order_id: poNumber,
        line_number: index + 1,
        raw_material_id: generateMaterialId(line.raw_material_name, index + 1),
        created_at: editing?.lines[index]?.created_at ?? now,
      })),
    };

    if (editing) {
      setOrders((current) =>
        current.map((order) => (order.po_number === editing.po_number ? nextOrder : order)),
      );
    } else {
      setOrders((current) => [nextOrder, ...current]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  const handleApprove = (order: PurchaseOrder) => {
    setApproving(order);
  };

  const confirmApprove = () => {
    if (!approving) {
      return;
    }

    const now = new Date().toISOString();

    setOrders((current) =>
      current.map((item) =>
        item.po_number === approving.po_number
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
    setApproving(null);
  };

  const handleReject = (order: PurchaseOrder) => {
    setRejecting(order);
  };

  const handleClose = (order: PurchaseOrder) => {
    setClosing(order);
  };

  const confirmClose = () => {
    if (!closing) {
      return;
    }

    const now = new Date().toISOString();

    setOrders((current) =>
      current.map((item) =>
        item.po_number === closing.po_number
          ? {
              ...item,
              status: "Closed",
              closed_at: now,
            }
          : item,
      ),
    );
    setClosing(null);
  };

  const handleView = (order: PurchaseOrder) => {
    navigate(`/purchase-orders/${encodeURIComponent(order.po_number)}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Purchase Orders</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track order headers and move purchase orders through the approval workflow.
          </p>
        </div>

        <Button type="button" onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by PO number, supplier, creator, address, or any material name.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search purchase orders..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as PurchaseOrderStatus | "All Statuses")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((status) => (
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
            {filteredOrders.length} purchase orders
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1380px]">
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">PO NUMBER</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">SUPPLIER</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">DELIVERY ADDRESS</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">REQUIRED DATE</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">STATUS</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">TOTAL AMOUNT</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">CREATED BY</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">SUBMITTED AT</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">APPROVED BY</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">APPROVED AT</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">REJECTION REASON</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">CLOSED AT</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">CREATED AT</TableHead>
                <TableHead className="px-4 text-[11px] font-semibold tracking-wide">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order, index) => (
                <TableRow
                  key={order.po_number}
                  className={index % 2 === 1 ? "bg-secondary/10" : ""}
                >
                  <TableCell className="px-4 py-3 font-medium text-foreground">{order.po_number}</TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{getSupplierName(order.supplier_id)}</TableCell>
                  <TableCell className="max-w-[260px] px-4 py-3 text-foreground">
                    <span className="line-clamp-2">{order.delivery_address}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{formatDate(order.required_delivery_date)}</TableCell>
                  <TableCell className="px-4 py-3"><StatusBadge status={order.status} /></TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{order.created_by}</TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{formatDate(order.submitted_at)}</TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{order.approved_by ?? "—"}</TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{formatDate(order.approved_at)}</TableCell>
                  <TableCell className="max-w-[240px] px-4 py-3 text-foreground">
                    <span className="line-clamp-2">{order.rejection_reason ?? "—"}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{formatDate(order.closed_at)}</TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <PurchaseOrderActionMenu
                      order={order}
                      onView={handleView}
                      onUpdate={openEditModal}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onClose={handleClose}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No purchase orders found for the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredOrders.length}
          itemLabel="purchase orders"
          onPageChange={setPage}
        />
      </Card>

      {modalOpen && (
        <PurchaseOrderFormModal
          order={editing}
          supplierOptions={SUPPLIER_OPTIONS}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}

      <PurchaseOrderRejectModal
        order={rejecting}
        onClose={() => setRejecting(null)}
        onSubmit={(reason) => {
          if (!rejecting) {
            return;
          }

          setOrders((current) =>
            current.map((item) =>
              item.po_number === rejecting.po_number
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
          setRejecting(null);
        }}
      />

      <PurchaseOrderConfirmModal
        order={approving}
        action="approve"
        open={Boolean(approving)}
        onOpenChange={(open) => {
          if (!open) {
            setApproving(null);
          }
        }}
        onConfirm={confirmApprove}
      />

      <PurchaseOrderConfirmModal
        order={closing}
        action="close"
        open={Boolean(closing)}
        onOpenChange={(open) => {
          if (!open) {
            setClosing(null);
          }
        }}
        onConfirm={confirmClose}
      />
    </div>
  );
}
