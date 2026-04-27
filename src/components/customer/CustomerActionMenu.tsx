import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { CustomerRecord } from "@/types/customer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerActionMenuProps {
  customer: CustomerRecord;
  onView: (customer: CustomerRecord) => void;
  onUpdate: (customer: CustomerRecord) => void;
  onDelete: (customer: CustomerRecord) => void;
  onRestore: (customer: CustomerRecord) => void;
}

export default function CustomerActionMenu({
  customer,
  onView,
  onUpdate,
  onDelete,
  onRestore,
}: CustomerActionMenuProps) {
  const isDeleted = customer.deleted_at != null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open customer actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(customer)}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdate(customer)} disabled={isDeleted}>
          <Pencil className="h-4 w-4" />
          Update
        </DropdownMenuItem>
        {isDeleted ? (
          <DropdownMenuItem onClick={() => onRestore(customer)}>
            <RotateCcw className="h-4 w-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onDelete(customer)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
