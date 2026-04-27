import { useEffect, useState } from "react";
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
import type { RequestForQuotation } from "@/types/request-for-quotation";

interface RequestForQuotationRejectModalProps {
  quotation: RequestForQuotation | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RequestForQuotationRejectModal({
  quotation,
  onClose,
  onSubmit,
}: RequestForQuotationRejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason(quotation?.rejection_reason ?? "");
  }, [quotation]);

  if (!quotation) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject Request for Quotation</DialogTitle>
          <DialogDescription>
            Add the rejection reason for {quotation.quotation_number}. This will be stored with the
            RFQ record.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(reason.trim() || "Rejected during quotation review.");
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
              placeholder="Explain why this quotation is being rejected"
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
