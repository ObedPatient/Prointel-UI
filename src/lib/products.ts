import type { Product, ProductFormData, ProductOption, ProductStatus } from "@/types/product";

const STORAGE_KEY = "prointel.products";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";
type LegacyProductStatus = ProductStatus | "Discontinued";
type ProductRecord = Omit<Product, "status" | "packaging_category_name"> & {
  status: LegacyProductStatus;
  packaging_category_name?: string;
  packaging_category_id?: string;
};

export const PRODUCT_STATUS_FILTER_OPTIONS: Array<ProductStatus | "All"> = [
  "All",
  "Active",
  "Pending",
  "Deactivated",
];

export const PRODUCT_CATEGORY_OPTIONS: ProductOption[] = [
  { value: "Dairy Packaging", label: "Dairy Packaging" },
  { value: "Tea Packaging", label: "Tea Packaging" },
  { value: "Beverage Packaging", label: "Beverage Packaging" },
  { value: "Home Care", label: "Home Care" },
  { value: "Export", label: "Export" },
  { value: "Food Service", label: "Food Service" },
];

export const FLUTE_TYPE_OPTIONS: ProductOption[] = [
  { value: "E-Flute", label: "E-Flute" },
  { value: "B-Flute", label: "B-Flute" },
  { value: "C-Flute", label: "C-Flute" },
  { value: "BC-Flute", label: "BC-Flute" },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "product-001",
    tenant_id: DEFAULT_TENANT_ID,
    name: "Milk Carton 1L Outer",
    code: "PRD-001",
    description: "Outer carton for 1 litre dairy packaging lines.",
    packaging_category_name: "Dairy Packaging",
    length_mm: 420,
    width_mm: 285,
    height_mm: 260,
    board_grade: "K150/BF120/W125",
    flute_type: "B-Flute",
    printing_colors: 4,
    status: "Active",
    created_at: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "product-002",
    tenant_id: DEFAULT_TENANT_ID,
    name: "Tea Box 250g Export",
    code: "PRD-002",
    description: "Printed export carton for premium tea packs.",
    packaging_category_name: "Tea Packaging",
    length_mm: 310,
    width_mm: 210,
    height_mm: 145,
    board_grade: "K125/BF112/W112",
    flute_type: "E-Flute",
    printing_colors: 5,
    status: "Active",
    created_at: "2026-02-03T09:10:00.000Z",
  },
  {
    id: "product-003",
    tenant_id: DEFAULT_TENANT_ID,
    name: "Skol Lager Tray",
    code: "PRD-003",
    description: "High-volume corrugated tray for bottled beverages.",
    packaging_category_name: "Beverage Packaging",
    length_mm: 395,
    width_mm: 265,
    height_mm: 120,
    board_grade: "K175/BF125/W125",
    flute_type: "C-Flute",
    printing_colors: 2,
    status: "Pending",
    created_at: "2026-02-05T07:35:00.000Z",
  },
  {
    id: "product-004",
    tenant_id: DEFAULT_TENANT_ID,
    name: "Detergent Box",
    code: "PRD-004",
    description: "Retail carton for powder detergent packs.",
    packaging_category_name: "Home Care",
    length_mm: 255,
    width_mm: 160,
    height_mm: 340,
    board_grade: "K125/BF112/W125",
    flute_type: "B-Flute",
    printing_colors: 3,
    status: "Active",
    created_at: "2026-02-10T10:45:00.000Z",
  },
  {
    id: "product-005",
    tenant_id: DEFAULT_TENANT_ID,
    name: "Legacy Export Carton",
    code: "PRD-005",
    description: "Older export carton specification retained for history.",
    packaging_category_name: "Export",
    length_mm: 500,
    width_mm: 340,
    height_mm: 280,
    board_grade: "K200/BF150/W150",
    flute_type: "BC-Flute",
    printing_colors: 1,
    status: "Deactivated",
    created_at: "2026-01-18T06:20:00.000Z",
  },
];

function normalizeProduct(product: ProductRecord): Product {
  return {
    ...product,
    tenant_id: product.tenant_id ?? DEFAULT_TENANT_ID,
    description: product.description ?? "",
    packaging_category_name:
      product.packaging_category_name ?? product.packaging_category_id ?? "",
    length_mm: product.length_mm ?? null,
    width_mm: product.width_mm ?? null,
    height_mm: product.height_mm ?? null,
    board_grade: product.board_grade ?? "",
    flute_type: product.flute_type ?? "",
    printing_colors: product.printing_colors ?? null,
    status: product.status === "Discontinued" ? "Deactivated" : product.status ?? "Active",
    created_at: product.created_at ?? new Date().toISOString(),
  };
}

export function loadProducts(): Product[] {
  if (typeof window === "undefined") {
    return INITIAL_PRODUCTS.map(normalizeProduct);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_PRODUCTS.map(normalizeProduct);
  }

  try {
    const parsed = JSON.parse(saved) as ProductRecord[];
    return parsed.length
      ? parsed.map(normalizeProduct)
      : INITIAL_PRODUCTS.map(normalizeProduct);
  } catch {
    return INITIAL_PRODUCTS.map(normalizeProduct);
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function generateNextProductCode(products: Array<Pick<Product, "code">>): string {
  const highestSequence = products.reduce((highest, product) => {
    const rawSequence = product.code.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `PRD-${String(highestSequence + 1).padStart(3, "0")}`;
}

export function createProductRecord(
  payload: ProductFormData,
  products: Array<Pick<Product, "code">> = loadProducts(),
): Product {
  return normalizeProduct({
    id: globalThis.crypto?.randomUUID?.() ?? `product-${Date.now()}`,
    tenant_id: DEFAULT_TENANT_ID,
    code: generateNextProductCode(products),
    ...payload,
    status: "Active",
    created_at: new Date().toISOString(),
  });
}

export function updateProductRecord(current: Product, payload: ProductFormData): Product {
  return normalizeProduct({
    ...current,
    ...payload,
  });
}
