import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCheck, GitBranchPlus, Layers3, Package2, Pencil } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BillOfMaterialsFormModal from "@/components/bill-of-materials/BillOfMaterialsFormModal";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CURRENT_BOM_USER,
  RAW_MATERIAL_OPTIONS,
  formatDate,
  loadBillOfMaterials,
  saveBillOfMaterials,
} from "@/lib/bill-of-materials";
import type {
  BillOfMaterialLine,
  BillOfMaterials,
  BillOfMaterialsStatus,
} from "@/types/bill-of-material";

const LINE_ITEMS_PAGE_SIZE = 5;

function StatusBadge({ status }: { status: BillOfMaterialsStatus }) {
  const tones: Record<BillOfMaterialsStatus, string> = {
    Draft: "border-slate-300 bg-slate-100 text-slate-700",
    Approved: "border-green-200 bg-green-100 text-green-700",
    Superseded: "border-amber-200 bg-amber-100 text-amber-700",
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getRawMaterialName(id: string): string {
  return RAW_MATERIAL_OPTIONS.find((option) => option.id === id)?.name ?? id;
}

export default function BillOfMaterialDetails() {
  const { bomId = "" } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState<BillOfMaterials[]>(() => loadBillOfMaterials());
  const [editing, setEditing] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmSupersedeOpen, setConfirmSupersedeOpen] = useState(false);
  const [lineItemsPage, setLineItemsPage] = useState(1);

  useEffect(() => {
    saveBillOfMaterials(records);
  }, [records]);

  const bom = useMemo(
    () => records.find((item) => item.id === bomId),
    [bomId, records],
  );

  const totalLinePages = useMemo(
    () => Math.max(1, Math.ceil((bom?.lines.length ?? 0) / LINE_ITEMS_PAGE_SIZE)),
    [bom?.lines.length],
  );

  const paginatedLineItems = useMemo(() => {
    if (!bom) {
      return [];
    }

    const startIndex = (lineItemsPage - 1) * LINE_ITEMS_PAGE_SIZE;
    return bom.lines.slice(startIndex, startIndex + LINE_ITEMS_PAGE_SIZE);
  }, [bom, lineItemsPage]);

  useEffect(() => {
    setLineItemsPage(1);
  }, [bomId]);

  useEffect(() => {
    setLineItemsPage((current) => Math.min(current, totalLinePages));
  }, [totalLinePages]);

  const handleSubmit = (payload: BillOfMaterials) => {
    if (!bom) {
      return;
    }

    setRecords((current) =>
      current.map((item) => (item.id === bom.id ? payload : item)),
    );
    setEditing(false);
  };

  const confirmApprove = () => {
    if (!bom) {
      return;
    }

    const now = new Date().toISOString();
    setRecords((current) =>
      current.map((item) =>
        item.id === bom.id
          ? {
              ...item,
              status: "Approved",
              approved_by: CURRENT_BOM_USER,
              approved_at: now,
            }
          : item,
      ),
    );
    setConfirmApproveOpen(false);
  };

  const confirmSupersede = () => {
    if (!bom) {
      return;
    }

    const now = new Date().toISOString();
    setRecords((current) =>
      current.map((item) =>
        item.id === bom.id
          ? {
              ...item,
              status: "Superseded",
              superseded_at: now,
            }
          : item,
      ),
    );
    setConfirmSupersedeOpen(false);
  };

  if (!bom) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/bill-of-materials">
            <ArrowLeft className="h-4 w-4" />
            Back to Bill of Materials
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>BOM not found</CardTitle>
            <CardDescription>
              The requested BOM could not be loaded from local storage.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button asChild type="button" variant="ghost" className="mb-2 w-fit gap-2 px-0">
            <Link to="/bill-of-materials">
              <ArrowLeft className="h-4 w-4" />
              Back to Bill of Materials
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{bom.bom_code}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review the BOM header and every BOM line for this product category.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={bom.status} />
          <Button type="button" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Update
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setConfirmApproveOpen(true)}
            disabled={bom.status === "Approved" || bom.status === "Superseded"}
          >
            <CheckCheck className="h-4 w-4" />
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setConfirmSupersedeOpen(true)}
            disabled={bom.status === "Superseded"}
          >
            <GitBranchPlus className="h-4 w-4" />
            Supersede
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <StatCard icon={Package2} label="Product Category" value={bom.product_category_id} />
        <StatCard icon={Layers3} label="Version" value={`v${bom.version}`} />
        <StatCard icon={Layers3} label="Line Count" value={String(bom.lines.length)} />
        <StatCard icon={Layers3} label="Created By" value={bom.created_by} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">BOM Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="mt-1 text-foreground">{bom.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Product Category</p>
              <p className="mt-1 text-foreground">{bom.product_category_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-foreground">{bom.description || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Created & Approved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created By</p>
              <p className="mt-1 text-foreground">{bom.created_by}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created At</p>
              <p className="mt-1 text-foreground">{formatDate(bom.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Approved By</p>
              <p className="mt-1 text-foreground">{bom.approved_by ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Approved At</p>
              <p className="mt-1 text-foreground">{formatDate(bom.approved_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <p className="mt-1 text-foreground">{bom.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Superseded At</p>
              <p className="mt-1 text-foreground">{formatDate(bom.superseded_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">BOM Lines</CardTitle>
          <CardDescription>
            Every raw material and allowance attached to this BOM is listed below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">LINE</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">RAW MATERIAL</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">QTY / UNIT</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">UOM</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">WASTAGE %</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">OPTIONAL</TableHead>
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide">NOTES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLineItems.map((line: BillOfMaterialLine, index) => (
                  <TableRow key={line.id} className={index % 2 === 1 ? "bg-secondary/10" : ""}>
                    <TableCell className="px-4 py-3 text-foreground">{line.line_number}</TableCell>
                    <TableCell className="px-4 py-3 font-medium text-foreground">
                      <div>
                        <p>{getRawMaterialName(line.raw_material_id)}</p>
                        <p className="text-xs text-muted-foreground">{line.raw_material_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.quantity_per_unit}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.unit_of_measure}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.expected_wastage_percentage}%</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{line.is_optional ? "Yes" : "No"}</TableCell>
                    <TableCell className="max-w-[320px] px-4 py-3 text-foreground">
                      <span className="line-clamp-2">{line.notes || "—"}</span>
                    </TableCell>
                  </TableRow>
                ))}

                {bom.lines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No BOM lines found for this record.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataPagination
            page={lineItemsPage}
            pageSize={LINE_ITEMS_PAGE_SIZE}
            totalItems={bom.lines.length}
            itemLabel="BOM lines"
            onPageChange={setLineItemsPage}
          />
        </CardContent>
      </Card>

      {editing && (
        <BillOfMaterialsFormModal
          bom={bom}
          existingRecords={records}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      <AlertDialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {bom.bom_code} as approved and stamp the approval audit fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmSupersedeOpen} onOpenChange={setConfirmSupersedeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supersede BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {bom.bom_code} as superseded. You will still be able to view it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSupersede}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Supersede
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
