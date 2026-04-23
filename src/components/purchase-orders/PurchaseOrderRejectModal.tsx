import { useEffect, useState } from "react";
import type { PurchaseOrder } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PurchaseOrderRejectModalProps {
  order: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function PurchaseOrderRejectModal({
  order,
  onClose,
  onSubmit,
}: PurchaseOrderRejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason(order?.rejection_reason ?? "");
  }, [order]);

  if (!order) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject Purchase Order</DialogTitle>
          <DialogDescription>
            Add the rejection reason for {order.po_number}. This will be saved with the purchase
            order record.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(reason.trim() || "Rejected during purchase order review.");
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground">Rejection Reason *</label>
            <Textarea
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1 min-h-[120px]"
              placeholder="Explain why this purchase order is being rejected"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Rejection</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
