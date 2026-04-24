import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Boxes, CircleDollarSign, Layers3, Pencil, Scale, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MaterialFormModal from "@/components/materials/MaterialFormModal";
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
import { loadMaterials, saveMaterials, updateMaterialRecord } from "@/lib/materials";
import type { Material, MaterialFormData, MaterialStatus } from "@/types/material";

const STATUS_TONES: Record<MaterialStatus, string> = {
  Active: "border-green-200 bg-green-100 text-green-700",
  "Low Stock": "border-amber-200 bg-amber-100 text-amber-700",
  "Out of Stock": "border-red-200 bg-red-100 text-red-700",
  Inactive: "border-slate-300 bg-slate-200 text-slate-700",
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Boxes;
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

function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

function formatCurrency(value: number | null): string {
  return value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
      }).format(value);
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export default function MaterialDetails() {
  const { materialId = "" } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>(() => loadMaterials());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    saveMaterials(materials);
  }, [materials]);

  const material = useMemo(
    () => materials.find((item) => item.id === materialId),
    [materialId, materials],
  );

  const availableStock =
    material?.current_stock != null && material?.reserved_stock != null
      ? material.current_stock - material.reserved_stock
      : null;

  const handleSubmit = (payload: MaterialFormData) => {
    if (!material) {
      return;
    }

    setMaterials((current) =>
      current.map((item) =>
        item.id === material.id ? updateMaterialRecord(item, payload) : item,
      ),
    );
    setEditing(false);
  };

  const handleDelete = () => {
    if (!material) {
      return;
    }

    const nextMaterials = materials.filter((item) => item.id !== material.id);
    setMaterials(nextMaterials);
    saveMaterials(nextMaterials);
    navigate("/materials");
  };

  if (!material) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/materials">
            <ArrowLeft className="h-4 w-4" />
            Back to Materials
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Material not found</CardTitle>
            <CardDescription>
              The requested material could not be loaded from local storage.
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
            <Link to="/materials">
              <ArrowLeft className="h-4 w-4" />
              Back to Materials
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{material.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[material.status]}`}
            >
              {material.status}
            </Badge>
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              {material.material_code}
            </span>
            <span className="text-xs text-muted-foreground">
              {material.material_category || "Uncategorized"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Layers3} label="Category" value={material.material_category || "—"} />
        <StatCard icon={Scale} label="Unit of Measure" value={material.unit_of_measure || "—"} />
        <StatCard icon={Boxes} label="Available Stock" value={formatNumber(availableStock)} />
        <StatCard
          icon={CircleDollarSign}
          label="Weighted Average Cost"
          value={formatCurrency(material.weighted_average_cost)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Material Overview</CardTitle>
            <CardDescription>Core identifiers and classification details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ID</span>
              <span className="font-medium text-foreground">{material.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tenant ID</span>
              <span className="font-medium text-foreground">{material.tenant_id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Material Code</span>
              <span className="font-medium text-foreground">{material.material_code}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground">{material.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-medium text-foreground">{formatDateTime(material.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Stock Policy</CardTitle>
            <CardDescription>Thresholds, balances, and reorder reference values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Minimum Stock Level</span>
              <span className="font-medium text-foreground">
                {formatNumber(material.minimum_stock_level)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Reorder Point</span>
              <span className="font-medium text-foreground">{formatNumber(material.reorder_point)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Reorder Quantity</span>
              <span className="font-medium text-foreground">
                {formatNumber(material.reorder_quantity)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current Stock</span>
              <span className="font-medium text-foreground">{formatNumber(material.current_stock)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Reserved Stock</span>
              <span className="font-medium text-foreground">{formatNumber(material.reserved_stock)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
          {material.description || "No description provided for this material yet."}
        </CardContent>
      </Card>

      {editing && (
        <MaterialFormModal
          material={material}
          existingMaterials={materials}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete material?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {material.name} from local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
