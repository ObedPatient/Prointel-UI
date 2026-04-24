import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Eye, Search, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import DataPagination from "@/components/ui/data-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PRODUCT_STATUS_FILTER_OPTIONS,
  createProductRecord,
  loadProducts,
  saveProducts,
  updateProductRecord,
} from "@/lib/products";
import type { Product, ProductFormData, ProductStatus } from "@/types/product";

const PAGE_SIZE = 8;

interface StatusBadgeProps {
  status: ProductStatus;
}

const STATUS_STYLES: Record<ProductStatus, string> = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-secondary text-muted-foreground border-border",
  Deactivated: "bg-red-50 text-red-700 border-red-200",
};

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[status] ?? "bg-secondary text-muted-foreground border-border"}`}>
    {status}
  </span>
);

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "All">("All");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.code.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle);
      const matchStatus = statusFilter === "All" || product.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, page]);

  const handleSubmit = (data: ProductFormData) => {
    if (editing) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editing.id ? updateProductRecord(product, data) : product,
        ),
      );
      setEditing(null);
      setModalOpen(false);
    } else {
      setProducts((current) => [createProductRecord(data, current), ...current]);
      setModalOpen(false);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleNewProductClick = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteTarget(product);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Maintain packaged product specifications using shared master data inputs.
          </p>
        </div>

        <Button type="button" onClick={handleNewProductClick} className="gap-2">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by product name, code, or description and narrow by status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ProductStatus | "All")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUS_FILTER_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filtered.length} products
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {["CODE", "NAME", "CATEGORY", "DIMENSIONS (MM)", "BOARD GRADE", "FLUTE", "COLORS", "STATUS", "ACTIONS"].map((heading) => (
                <TableHead
                  key={heading}
                  className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide"
                >
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product, index) => (
              <TableRow
                key={product.id}
                className={index % 2 === 1 ? "bg-secondary/10 hover:bg-secondary/30" : "hover:bg-secondary/30"}
              >
                <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                  {product.code}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {product.description || "No description"}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {product.packaging_category_name || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {[product.length_mm, product.width_mm, product.height_mm].every((value) => value != null)
                    ? `${product.length_mm} × ${product.width_mm} × ${product.height_mm}`
                    : "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {product.board_grade || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {product.flute_type || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {product.printing_colors != null ? `${product.printing_colors}C` : "—"}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={product.status} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label="Open product actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(product)}>
                        <Pencil className="h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(product)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="px-4 py-14 text-center text-sm text-muted-foreground">
                  No products found. Create your first product to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          itemLabel="products"
          onPageChange={setPage}
        />
      </Card>

      {(modalOpen || editing) && (
        <CreateProductModal
          product={editing}
          existingProducts={products}
          onSubmit={handleSubmit}
          onClose={handleModalClose}
          isLoading={false}
        />
      )}

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.name} from local storage.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
