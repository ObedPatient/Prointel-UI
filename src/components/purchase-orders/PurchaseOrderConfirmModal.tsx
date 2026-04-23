import type { PurchaseOrder } from "@/types/purchase-order";
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

interface PurchaseOrderConfirmModalProps {
  order: PurchaseOrder | null;
  action: "approve" | "close";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ACTION_CONTENT = {
  approve: {
    title: "Approve Purchase Order?",
    description:
      "This will mark the purchase order as approved and clear any previous rejection reason.",
    confirmLabel: "Approve",
    confirmClassName: "bg-green-600 text-white hover:bg-green-700",
  },
  close: {
    title: "Close Purchase Order?",
    description:
      "This will mark the purchase order as closed. You can still view it later, but it will be treated as completed.",
    confirmLabel: "Close Order",
    confirmClassName: "bg-amber-600 text-white hover:bg-amber-700",
  },
} as const;

export default function PurchaseOrderConfirmModal({
  order,
  action,
  open,
  onOpenChange,
  onConfirm,
}: PurchaseOrderConfirmModalProps) {
  const content = ACTION_CONTENT[action];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {content.description}{" "}
            {order && (
              <>
                Purchase order <span className="font-semibold text-foreground">{order.po_number}</span>
                {" "}will be updated.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={content.confirmClassName}>
            {content.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
