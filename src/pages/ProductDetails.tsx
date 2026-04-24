import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Box, Palette, Pencil, Ruler, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CreateProductModal from "@/components/products/CreateProductModal";
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
import { loadProducts, saveProducts, updateProductRecord } from "@/lib/products";
import type { Product, ProductFormData, ProductStatus } from "@/types/product";

const STATUS_TONES: Record<ProductStatus, string> = {
  Active: "border-green-200 bg-green-100 text-green-700",
  Pending: "border-slate-300 bg-slate-200 text-slate-700",
  Deactivated: "border-red-200 bg-red-100 text-red-700",
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Box;
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

export default function ProductDetails() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const product = useMemo(
    () => products.find((item) => item.id === productId),
    [productId, products],
  );

  const dimensions =
    product && [product.length_mm, product.width_mm, product.height_mm].every((value) => value != null)
      ? `${product.length_mm} × ${product.width_mm} × ${product.height_mm} mm`
      : "—";

  const handleSubmit = (payload: ProductFormData) => {
    if (!product) {
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? updateProductRecord(item, payload) : item,
      ),
    );
    setEditing(false);
  };

  const handleDelete = () => {
    if (!product) {
      return;
    }

    const nextProducts = products.filter((item) => item.id !== product.id);
    setProducts(nextProducts);
    saveProducts(nextProducts);
    navigate("/products");
  };

  if (!product) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Product not found</CardTitle>
            <CardDescription>
              The requested product could not be loaded from local storage.
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
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{product.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[product.status]}`}
            >
              {product.status}
            </Badge>
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              {product.code}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.packaging_category_name || "Uncategorized"}
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
        <StatCard icon={Box} label="Category" value={product.packaging_category_name || "—"} />
        <StatCard icon={Ruler} label="Dimensions" value={dimensions} />
        <StatCard icon={Palette} label="Flute Type" value={product.flute_type || "—"} />
        <StatCard
          icon={Palette}
          label="Printing Colors"
          value={product.printing_colors != null ? `${product.printing_colors}C` : "—"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Product Overview</CardTitle>
            <CardDescription>Core identity and product structure reference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Product Code</span>
              <span className="font-medium text-foreground">{product.code}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Product Category</span>
              <span className="font-medium text-foreground">
                {product.packaging_category_name || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Board Grade</span>
              <span className="font-medium text-foreground">{product.board_grade || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Flute Type</span>
              <span className="font-medium text-foreground">{product.flute_type || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground">{product.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Packaging Details</CardTitle>
            <CardDescription>Measurements and print setup for this product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Length</span>
              <span className="font-medium text-foreground">
                {product.length_mm != null ? `${product.length_mm} mm` : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Width</span>
              <span className="font-medium text-foreground">
                {product.width_mm != null ? `${product.width_mm} mm` : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Height</span>
              <span className="font-medium text-foreground">
                {product.height_mm != null ? `${product.height_mm} mm` : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Printing Colors</span>
              <span className="font-medium text-foreground">
                {product.printing_colors != null ? `${product.printing_colors}C` : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
          {product.description || "No description provided for this product yet."}
        </CardContent>
      </Card>

      {editing && (
        <CreateProductModal
          product={product}
          existingProducts={products}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
          isLoading={false}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {product.name} from local storage.
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
