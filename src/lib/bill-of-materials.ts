import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/products";
import type {
  BillOfMaterialLine,
  BillOfMaterials,
  BillOfMaterialsStatus,
  RawMaterialOption,
} from "@/types/bill-of-materials";

export const CURRENT_BOM_USER = "Jean-Pierre Habimana";
const STORAGE_KEY = "prointel.bill-of-materials";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const BOM_STATUS_FILTER_OPTIONS: Array<BillOfMaterialsStatus | "All Statuses"> = [
  "All Statuses",
  "Draft",
  "Approved",
  "Superseded",
];

export const RAW_MATERIAL_OPTIONS: RawMaterialOption[] = [
  {
    id: "RM-BROWN-KRAFT-PAPER-ROLLS",
    name: "Brown Kraft Paper Rolls",
    default_unit_of_measure: "rolls",
  },
  {
    id: "RM-INDUSTRIAL-BONDING-ADHESIVE",
    name: "Industrial Bonding Adhesive",
    default_unit_of_measure: "kg",
  },
  {
    id: "RM-WATER-BASED-CYAN-INK",
    name: "Water-Based Cyan Ink",
    default_unit_of_measure: "litres",
  },
  {
    id: "RM-RECYCLED-FIBER-PULP",
    name: "Recycled Fiber Pulp",
    default_unit_of_measure: "kg",
  },
  {
    id: "RM-CORRUGATION-STARCH",
    name: "Corrugation Starch",
    default_unit_of_measure: "kg",
  },
  {
    id: "RM-SHRINK-WRAP-FILM",
    name: "Shrink Wrap Film",
    default_unit_of_measure: "kg",
  },
];

const INITIAL_BILL_OF_MATERIALS: BillOfMaterials[] = [
  {
    id: "bom-001",
    tenant_id: DEFAULT_TENANT_ID,
    bom_code: "BOM-2026-001",
    product_category_id: "Dairy Packaging",
    version: 3,
    name: "Milk Carton 1L Outer Carton",
    description: "Approved packaging BOM for the 1L dairy outer carton line.",
    status: "Approved",
    created_by: "Claudine Mugenzi",
    approved_by: "Jean-Pierre Habimana",
    approved_at: "2026-04-12T09:30:00.000Z",
    superseded_at: null,
    created_at: "2026-04-08T07:15:00.000Z",
    lines: [
      {
        id: "bom-line-001",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-001",
        line_number: 1,
        raw_material_id: "RM-BROWN-KRAFT-PAPER-ROLLS",
        quantity_per_unit: 0.42,
        unit_of_measure: "rolls",
        expected_wastage_percentage: 1.5,
        is_optional: false,
        notes: "Primary corrugated substrate for carton conversion.",
        created_at: "2026-04-08T07:15:00.000Z",
      },
      {
        id: "bom-line-002",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-001",
        line_number: 2,
        raw_material_id: "RM-INDUSTRIAL-BONDING-ADHESIVE",
        quantity_per_unit: 0.08,
        unit_of_measure: "kg",
        expected_wastage_percentage: 0.8,
        is_optional: false,
        notes: "Adhesive allowance for flap sealing.",
        created_at: "2026-04-08T07:15:00.000Z",
      },
      {
        id: "bom-line-003",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-001",
        line_number: 3,
        raw_material_id: "RM-WATER-BASED-CYAN-INK",
        quantity_per_unit: 0.03,
        unit_of_measure: "litres",
        expected_wastage_percentage: 2,
        is_optional: true,
        notes: "Only required on export print variants.",
        created_at: "2026-04-08T07:15:00.000Z",
      },
    ],
  },
  {
    id: "bom-002",
    tenant_id: DEFAULT_TENANT_ID,
    bom_code: "BOM-2026-002",
    product_category_id: "Tea Packaging",
    version: 2,
    name: "Tea Box 250g Export",
    description: "Approved board and print BOM for 250g export tea boxes.",
    status: "Approved",
    created_by: "Aline Mutoni",
    approved_by: "Jean-Pierre Habimana",
    approved_at: "2026-04-10T11:05:00.000Z",
    superseded_at: null,
    created_at: "2026-04-05T08:20:00.000Z",
    lines: [
      {
        id: "bom-line-004",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-002",
        line_number: 1,
        raw_material_id: "RM-RECYCLED-FIBER-PULP",
        quantity_per_unit: 0.18,
        unit_of_measure: "kg",
        expected_wastage_percentage: 1.1,
        is_optional: false,
        notes: "Base board stock for export cartons.",
        created_at: "2026-04-05T08:20:00.000Z",
      },
      {
        id: "bom-line-005",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-002",
        line_number: 2,
        raw_material_id: "RM-WATER-BASED-CYAN-INK",
        quantity_per_unit: 0.015,
        unit_of_measure: "litres",
        expected_wastage_percentage: 3,
        is_optional: false,
        notes: "Print run allowance for export graphics.",
        created_at: "2026-04-05T08:20:00.000Z",
      },
    ],
  },
  {
    id: "bom-003",
    tenant_id: DEFAULT_TENANT_ID,
    bom_code: "BOM-2026-003",
    product_category_id: "Home Care",
    version: 1,
    name: "Detergent Box Launch Spec",
    description: "Draft BOM awaiting approval for the detergent box launch batch.",
    status: "Draft",
    created_by: "Diane Uwimana",
    approved_by: null,
    approved_at: null,
    superseded_at: null,
    created_at: "2026-04-18T10:10:00.000Z",
    lines: [
      {
        id: "bom-line-006",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-003",
        line_number: 1,
        raw_material_id: "RM-BROWN-KRAFT-PAPER-ROLLS",
        quantity_per_unit: 0.31,
        unit_of_measure: "rolls",
        expected_wastage_percentage: 1.9,
        is_optional: false,
        notes: "Primary substrate for detergent folding cartons.",
        created_at: "2026-04-18T10:10:00.000Z",
      },
      {
        id: "bom-line-007",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-003",
        line_number: 2,
        raw_material_id: "RM-CORRUGATION-STARCH",
        quantity_per_unit: 0.05,
        unit_of_measure: "kg",
        expected_wastage_percentage: 1.2,
        is_optional: false,
        notes: "Starch requirement for board bonding.",
        created_at: "2026-04-18T10:10:00.000Z",
      },
    ],
  },
  {
    id: "bom-004",
    tenant_id: DEFAULT_TENANT_ID,
    bom_code: "BOM-2026-004",
    product_category_id: "Export",
    version: 1,
    name: "Legacy Export Carton",
    description: "Superseded legacy export BOM retained for traceability.",
    status: "Superseded",
    created_by: "Jean-Pierre Habimana",
    approved_by: "Jean-Pierre Habimana",
    approved_at: "2026-03-14T14:40:00.000Z",
    superseded_at: "2026-04-02T09:00:00.000Z",
    created_at: "2026-03-10T09:15:00.000Z",
    lines: [
      {
        id: "bom-line-008",
        tenant_id: DEFAULT_TENANT_ID,
        bill_of_materials_id: "bom-004",
        line_number: 1,
        raw_material_id: "RM-SHRINK-WRAP-FILM",
        quantity_per_unit: 0.12,
        unit_of_measure: "kg",
        expected_wastage_percentage: 2.4,
        is_optional: false,
        notes: "Legacy finishing material reference.",
        created_at: "2026-03-10T09:15:00.000Z",
      },
    ],
  },
];

export function normalizeBillOfMaterial(bom: BillOfMaterials): BillOfMaterials {
  return {
    ...bom,
    tenant_id: bom.tenant_id ?? DEFAULT_TENANT_ID,
    product_category_id: bom.product_category_id ?? "",
    description: bom.description ?? "",
    approved_by: bom.approved_by ?? null,
    approved_at: bom.approved_at ?? null,
    superseded_at: bom.superseded_at ?? null,
    lines: bom.lines.map((line, index) => ({
      ...line,
      tenant_id: line.tenant_id ?? DEFAULT_TENANT_ID,
      bill_of_materials_id: line.bill_of_materials_id ?? bom.id,
      line_number: line.line_number ?? index + 1,
      raw_material_id: line.raw_material_id ?? "",
      quantity_per_unit: line.quantity_per_unit ?? 0,
      unit_of_measure: line.unit_of_measure ?? "",
      expected_wastage_percentage: line.expected_wastage_percentage ?? 0,
      is_optional: line.is_optional ?? false,
      notes: line.notes ?? "",
      created_at: line.created_at ?? bom.created_at,
    })),
  };
}

export function loadBillOfMaterials(): BillOfMaterials[] {
  if (typeof window === "undefined") {
    return INITIAL_BILL_OF_MATERIALS.map(normalizeBillOfMaterial);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_BILL_OF_MATERIALS.map(normalizeBillOfMaterial);
  }

  try {
    const parsed = JSON.parse(saved) as BillOfMaterials[];
    return parsed.length
      ? parsed.map(normalizeBillOfMaterial)
      : INITIAL_BILL_OF_MATERIALS.map(normalizeBillOfMaterial);
  } catch {
    return INITIAL_BILL_OF_MATERIALS.map(normalizeBillOfMaterial);
  }
}

export function saveBillOfMaterials(records: BillOfMaterials[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function generateNextBomCode(records: Array<Pick<BillOfMaterials, "bom_code">>): string {
  const year = new Date().getFullYear();
  const highestSequence = records.reduce((highest, record) => {
    const rawSequence = record.bom_code.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `BOM-${year}-${String(highestSequence + 1).padStart(3, "0")}`;
}

export function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function getRawMaterialOption(id: string): RawMaterialOption | undefined {
  return RAW_MATERIAL_OPTIONS.find((option) => option.id === id);
}

export { PRODUCT_CATEGORY_OPTIONS };
