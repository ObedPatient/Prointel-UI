import { CheckCheck, Eye, GitBranchPlus, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BillOfMaterials } from "@/types/bill-of-materials";

interface BillOfMaterialsActionMenuProps {
  bom: BillOfMaterials;
  onView: (bom: BillOfMaterials) => void;
  onUpdate: (bom: BillOfMaterials) => void;
  onApprove: (bom: BillOfMaterials) => void;
  onSupersede: (bom: BillOfMaterials) => void;
}

export default function BillOfMaterialsActionMenu({
  bom,
  onView,
  onUpdate,
  onApprove,
  onSupersede,
}: BillOfMaterialsActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open BOM actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(bom)}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdate(bom)}>
          <Pencil className="h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onApprove(bom)}
          disabled={bom.status === "Approved" || bom.status === "Superseded"}
        >
          <CheckCheck className="h-4 w-4" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSupersede(bom)}
          disabled={bom.status === "Superseded"}
        >
          <GitBranchPlus className="h-4 w-4" />
          Supersede
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
