import {
  CheckCheck,
  Eye,
  FileText,
  Lock,
  MoreHorizontal,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SalesOrderRecord } from "@/types/sales-order";

interface SalesOrderActionMenuProps {
  order: SalesOrderRecord;
  onView: (order: SalesOrderRecord) => void;
  onUpdate: (order: SalesOrderRecord) => void;
  onStartProduction: (order: SalesOrderRecord) => void;
  onReadyForDispatch: (order: SalesOrderRecord) => void;
  onDispatch: (order: SalesOrderRecord) => void;
  onInvoice: (order: SalesOrderRecord) => void;
  onClose: (order: SalesOrderRecord) => void;
  onDelete: (order: SalesOrderRecord) => void;
  onRestore: (order: SalesOrderRecord) => void;
}

export default function SalesOrderActionMenu({
  order,
  onView,
  onUpdate,
  onStartProduction,
  onReadyForDispatch,
  onDispatch,
  onInvoice,
  onClose,
  onDelete,
  onRestore,
}: SalesOrderActionMenuProps) {
  const isDeleted = order.deleted_at != null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open sales order actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(order)}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdate(order)} disabled={isDeleted || order.status === "closed"}>
          <Pencil className="h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStartProduction(order)}
          disabled={isDeleted || order.status !== "confirmed"}
        >
          <Play className="h-4 w-4" />
          Start Production
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onReadyForDispatch(order)}
          disabled={isDeleted || order.status !== "in_production"}
        >
          <Lock className="h-4 w-4" />
          Ready Dispatch
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDispatch(order)} disabled={isDeleted || order.status !== "ready_for_dispatch"}>
          <Truck className="h-4 w-4" />
          Dispatch
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onInvoice(order)} disabled={isDeleted || order.status !== "dispatched"}>
          <FileText className="h-4 w-4" />
          Invoice
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onClose(order)}
          disabled={isDeleted || order.status !== "invoiced"}
        >
          <CheckCheck className="h-4 w-4" />
          Close
        </DropdownMenuItem>
        {isDeleted ? (
          <DropdownMenuItem onClick={() => onRestore(order)}>
            <RotateCcw className="h-4 w-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onDelete(order)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
