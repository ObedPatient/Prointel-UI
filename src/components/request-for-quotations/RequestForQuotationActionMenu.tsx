import { Eye, Lock, Mail, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RequestForQuotation } from "@/types/request-for-quotation";

interface RequestForQuotationActionMenuProps {
  quotation: RequestForQuotation;
  onView: (quotation: RequestForQuotation) => void;
  onUpdate: (quotation: RequestForQuotation) => void;
  onLock: (quotation: RequestForQuotation) => void;
  onSend: (quotation: RequestForQuotation) => void;
}

export default function RequestForQuotationActionMenu({
  quotation,
  onView,
  onUpdate,
  onLock,
  onSend,
}: RequestForQuotationActionMenuProps) {
  const isFinalStatus =
    quotation.status === "accepted" || quotation.status === "rejected";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open request for quotation actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(quotation)}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onUpdate(quotation)}
          disabled={quotation.status === "accepted"}
        >
          <Pencil className="h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLock(quotation)} disabled={isFinalStatus}>
          <Lock className="h-4 w-4" />
          Lock Costs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSend(quotation)} disabled={isFinalStatus}>
          <Mail className="h-4 w-4" />
          Send
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
