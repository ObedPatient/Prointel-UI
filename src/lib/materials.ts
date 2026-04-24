import type {
  Material,
  MaterialFormData,
  MaterialOption,
  MaterialStatus,
} from "@/types/material";

const STORAGE_KEY = "prointel.materials";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const MATERIAL_STATUS_FILTER_OPTIONS: Array<MaterialStatus | "All"> = [
  "All",
  "Active",
  "Low Stock",
  "Out of Stock",
  "Inactive",
];

export const MATERIAL_CATEGORY_OPTIONS: MaterialOption[] = [
  { value: "Paper & Board", label: "Paper & Board" },
  { value: "Adhesives", label: "Adhesives" },
  { value: "Inks & Coatings", label: "Inks & Coatings" },
  { value: "Chemicals", label: "Chemicals" },
  { value: "Packaging Consumables", label: "Packaging Consumables" },
  { value: "Spare Parts", label: "Spare Parts" },
];

export const UNIT_OF_MEASURE_OPTIONS: MaterialOption[] = [
  { value: "kg", label: "kg" },
  { value: "litres", label: "Litres" },
  { value: "rolls", label: "Rolls" },
  { value: "sheets", label: "Sheets" },
  { value: "reams", label: "Reams" },
  { value: "meters", label: "Meters" },
  { value: "pieces", label: "Pieces" },
  { value: "units", label: "Units" },
];

const INITIAL_MATERIALS: Material[] = [
  {
    id: "material-001",
    tenant_id: DEFAULT_TENANT_ID,
    material_code: "MAT-001",
    name: "Brown Kraft Paper Rolls",
    description: "Primary kraft substrate used for corrugated carton conversion.",
    material_category: "Paper & Board",
    unit_of_measure: "rolls",
    minimum_stock_level: 12,
    reorder_point: 18,
    reorder_quantity: 24,
    weighted_average_cost: 38500,
    current_stock: 28,
    reserved_stock: 6,
    status: "Active",
    created_at: "2026-04-08T07:30:00.000Z",
  },
  {
    id: "material-002",
    tenant_id: DEFAULT_TENANT_ID,
    material_code: "MAT-002",
    name: "Industrial Bonding Adhesive",
    description: "High-strength adhesive for flap sealing and board bonding.",
    material_category: "Adhesives",
    unit_of_measure: "kg",
    minimum_stock_level: 400,
    reorder_point: 550,
    reorder_quantity: 800,
    weighted_average_cost: 2450,
    current_stock: 510,
    reserved_stock: 120,
    status: "Active",
    created_at: "2026-04-09T08:15:00.000Z",
  },
  {
    id: "material-003",
    tenant_id: DEFAULT_TENANT_ID,
    material_code: "MAT-003",
    name: "Water-Based Cyan Ink",
    description: "Printing ink used across export and retail packaging runs.",
    material_category: "Inks & Coatings",
    unit_of_measure: "litres",
    minimum_stock_level: 80,
    reorder_point: 120,
    reorder_quantity: 200,
    weighted_average_cost: 13200,
    current_stock: 74,
    reserved_stock: 18,
    status: "Low Stock",
    created_at: "2026-04-10T10:05:00.000Z",
  },
  {
    id: "material-004",
    tenant_id: DEFAULT_TENANT_ID,
    material_code: "MAT-004",
    name: "Corrugation Starch",
    description: "Starch blend for board bonding during corrugation.",
    material_category: "Chemicals",
    unit_of_measure: "kg",
    minimum_stock_level: 250,
    reorder_point: 300,
    reorder_quantity: 500,
    weighted_average_cost: 980,
    current_stock: 0,
    reserved_stock: 0,
    status: "Out of Stock",
    created_at: "2026-04-14T06:50:00.000Z",
  },
  {
    id: "material-005",
    tenant_id: DEFAULT_TENANT_ID,
    material_code: "MAT-005",
    name: "Shrink Wrap Film",
    description: "Finishing consumable retained for older export packing lines.",
    material_category: "Packaging Consumables",
    unit_of_measure: "kg",
    minimum_stock_level: 60,
    reorder_point: 80,
    reorder_quantity: 120,
    weighted_average_cost: 5600,
    current_stock: 96,
    reserved_stock: 14,
    status: "Inactive",
    created_at: "2026-03-22T09:40:00.000Z",
  },
];

function normalizeNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeMaterial(material: Material): Material {
  return {
    ...material,
    tenant_id: material.tenant_id ?? DEFAULT_TENANT_ID,
    description: material.description ?? "",
    material_category: material.material_category ?? "",
    unit_of_measure: material.unit_of_measure ?? "",
    minimum_stock_level: normalizeNumber(material.minimum_stock_level),
    reorder_point: normalizeNumber(material.reorder_point),
    reorder_quantity: normalizeNumber(material.reorder_quantity),
    weighted_average_cost: normalizeNumber(material.weighted_average_cost),
    current_stock: normalizeNumber(material.current_stock),
    reserved_stock: normalizeNumber(material.reserved_stock),
    status: material.status ?? "Active",
    created_at: material.created_at ?? new Date().toISOString(),
  };
}

export function loadMaterials(): Material[] {
  if (typeof window === "undefined") {
    return INITIAL_MATERIALS.map(normalizeMaterial);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_MATERIALS.map(normalizeMaterial);
  }

  try {
    const parsed = JSON.parse(saved) as Material[];
    return parsed.length ? parsed.map(normalizeMaterial) : INITIAL_MATERIALS.map(normalizeMaterial);
  } catch {
    return INITIAL_MATERIALS.map(normalizeMaterial);
  }
}

export function saveMaterials(materials: Material[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

export function generateNextMaterialCode(
  materials: Array<Pick<Material, "material_code">>,
): string {
  const highestSequence = materials.reduce((highest, material) => {
    const rawSequence = material.material_code.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `MAT-${String(highestSequence + 1).padStart(3, "0")}`;
}

export function createMaterialRecord(
  payload: MaterialFormData,
  materials: Array<Pick<Material, "material_code">> = loadMaterials(),
): Material {
  return normalizeMaterial({
    id: globalThis.crypto?.randomUUID?.() ?? `material-${Date.now()}`,
    tenant_id: DEFAULT_TENANT_ID,
    material_code: generateNextMaterialCode(materials),
    ...payload,
    status: "Active",
    created_at: new Date().toISOString(),
  });
}

export function updateMaterialRecord(current: Material, payload: MaterialFormData): Material {
  return normalizeMaterial({
    ...current,
    ...payload,
    status: current.status,
  });
}
