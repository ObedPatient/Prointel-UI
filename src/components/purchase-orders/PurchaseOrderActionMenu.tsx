import {
  CheckCheck,
  CircleX,
  Eye,
  Lock,
  MoreHorizontal,
  Pencil,
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
import type { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderActionMenuProps {
  order: PurchaseOrder;
  onView?: (order: PurchaseOrder) => void;
  onUpdate?: (order: PurchaseOrder) => void;
  onApprove: (order: PurchaseOrder) => void;
  onReject: (order: PurchaseOrder) => void;
  onClose: (order: PurchaseOrder) => void;
}

export default function PurchaseOrderActionMenu({
  order,
  onView,
  onUpdate,
  onApprove,
  onReject,
  onClose,
}: PurchaseOrderActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open purchase order actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem onClick={() => onView(order)}>
            <Eye className="h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onUpdate && (
          <DropdownMenuItem onClick={() => onUpdate(order)}>
            <Pencil className="h-4 w-4" />
            Update
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onApprove(order)}
          disabled={order.status === "Approved" || order.status === "Closed"}
        >
          <CheckCheck className="h-4 w-4" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onReject(order)}
          disabled={order.status === "Rejected" || order.status === "Closed"}
        >
          <CircleX className="h-4 w-4" />
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onClose(order)}
          disabled={order.status === "Closed"}
        >
          <Lock className="h-4 w-4" />
          Close
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
