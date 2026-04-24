import type {
  CreateProductionCardData,
  ProductionCard,
  ProductionCardLookupOption,
  ProductionCardStatus,
  SalesOrderOption,
} from "@/types/production-card";

const STORAGE_KEY = "prointel.production-cards";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const PRODUCTION_CARD_FILTER_OPTIONS: Array<ProductionCardStatus | "All"> = [
  "All",
  "Draft",
  "In Production",
  "QC Review",
  "Materials Confirmed",
  "Completed",
  "Cancelled",
];

const INITIAL_PRODUCTION_CARDS: ProductionCard[] = [
  {
    id: "production-card-001",
    tenant_id: DEFAULT_TENANT_ID,
    job_number: "PC-2026-0041",
    customer_id: "INYANGE Industries",
    customer_order_id: "SO-2026-041",
    product_category_id: "Milk Carton 1L Outer",
    bill_of_materials_id: "BOM-001",
    status: "Completed",
    target_quantity: 5000,
    actual_output_quantity: 4973,
    total_material_cost: 1200000,
    total_machine_cost: 300000,
    total_wastage_cost: 54000,
    total_rework_cost: 0,
    agreed_selling_price: 2100000,
    start_date: "2026-02-01",
    target_completion_date: "2026-02-10",
    created_at: "2026-02-01T07:00:00.000Z",
  },
  {
    id: "production-card-002",
    tenant_id: DEFAULT_TENANT_ID,
    job_number: "PC-2026-0042",
    customer_id: "Rwanda Mountain Tea",
    customer_order_id: "SO-2026-040",
    product_category_id: "Tea Box 250g Export",
    bill_of_materials_id: "BOM-002",
    status: "In Production",
    target_quantity: 8000,
    actual_output_quantity: 4704,
    total_material_cost: 980000,
    total_machine_cost: 210000,
    total_wastage_cost: 28000,
    total_rework_cost: 5000,
    agreed_selling_price: 1600000,
    start_date: "2026-02-03",
    target_completion_date: "2026-02-15",
    created_at: "2026-02-03T08:15:00.000Z",
  },
  {
    id: "production-card-003",
    tenant_id: DEFAULT_TENANT_ID,
    job_number: "PC-2026-0043",
    customer_id: "Skol Brewery Rwanda",
    customer_order_id: "SO-2026-045",
    product_category_id: "Skol Lager Tray",
    bill_of_materials_id: "BOM-003",
    status: "QC Review",
    target_quantity: 12000,
    actual_output_quantity: 11978,
    total_material_cost: 2400000,
    total_machine_cost: 480000,
    total_wastage_cost: 65000,
    total_rework_cost: 12000,
    agreed_selling_price: 3800000,
    start_date: "2026-02-05",
    target_completion_date: "2026-02-20",
    created_at: "2026-02-05T06:45:00.000Z",
  },
  {
    id: "production-card-004",
    tenant_id: DEFAULT_TENANT_ID,
    job_number: "PC-2026-0044",
    customer_id: "Azam Foods",
    customer_order_id: "SO-2026-046",
    product_category_id: "Detergent Box",
    bill_of_materials_id: "BOM-004",
    status: "Materials Confirmed",
    target_quantity: 3000,
    actual_output_quantity: 0,
    total_material_cost: 600000,
    total_machine_cost: 0,
    total_wastage_cost: 0,
    total_rework_cost: 0,
    agreed_selling_price: 900000,
    start_date: "2026-02-10",
    target_completion_date: "2026-02-25",
    created_at: "2026-02-10T11:30:00.000Z",
  },
  {
    id: "production-card-005",
    tenant_id: DEFAULT_TENANT_ID,
    job_number: "PC-2026-0045",
    customer_id: "Sulfo Rwanda Industries",
    customer_order_id: "",
    product_category_id: "Export Carton",
    bill_of_materials_id: "BOM-005",
    status: "Draft",
    target_quantity: 1000,
    actual_output_quantity: 0,
    total_material_cost: 0,
    total_machine_cost: 0,
    total_wastage_cost: 0,
    total_rework_cost: 0,
    agreed_selling_price: 0,
    start_date: "",
    target_completion_date: "2026-03-01",
    created_at: "2026-02-14T09:05:00.000Z",
  },
];

const BASE_SALES_ORDER_OPTIONS: SalesOrderOption[] = [
  {
    value: "SO-2026-040",
    label: "SO-2026-040",
    customerName: "Rwanda Mountain Tea",
    productCategoryName: "Tea Box 250g Export",
  },
  {
    value: "SO-2026-041",
    label: "SO-2026-041",
    customerName: "INYANGE Industries",
    productCategoryName: "Milk Carton 1L Outer",
  },
  {
    value: "SO-2026-045",
    label: "SO-2026-045",
    customerName: "Skol Brewery Rwanda",
    productCategoryName: "Skol Lager Tray",
  },
  {
    value: "SO-2026-046",
    label: "SO-2026-046",
    customerName: "Azam Foods",
    productCategoryName: "Detergent Box",
  },
  {
    value: "SO-2026-052",
    label: "SO-2026-052",
    customerName: "Bralirwa Plc",
    productCategoryName: "Soft Drink Shrink Wrap",
  },
];

const BASE_CUSTOMER_OPTIONS: ProductionCardLookupOption[] = [
  { value: "INYANGE Industries", label: "INYANGE Industries" },
  { value: "Rwanda Mountain Tea", label: "Rwanda Mountain Tea" },
  { value: "Skol Brewery Rwanda", label: "Skol Brewery Rwanda" },
  { value: "Azam Foods", label: "Azam Foods" },
  { value: "Sulfo Rwanda Industries", label: "Sulfo Rwanda Industries" },
  { value: "Bralirwa Plc", label: "Bralirwa Plc" },
];

const BASE_PRODUCT_CATEGORY_OPTIONS: ProductionCardLookupOption[] = [
  { value: "Milk Carton 1L Outer", label: "Milk Carton 1L Outer" },
  { value: "Tea Box 250g Export", label: "Tea Box 250g Export" },
  { value: "Skol Lager Tray", label: "Skol Lager Tray" },
  { value: "Detergent Box", label: "Detergent Box" },
  { value: "Export Carton", label: "Export Carton" },
  { value: "Soft Drink Shrink Wrap", label: "Soft Drink Shrink Wrap" },
];

function normalizeProductionCard(card: ProductionCard): ProductionCard {
  return {
    ...card,
    tenant_id: card.tenant_id ?? DEFAULT_TENANT_ID,
    customer_id: card.customer_id ?? "",
    customer_order_id: card.customer_order_id ?? "",
    product_category_id: card.product_category_id ?? "",
    bill_of_materials_id: card.bill_of_materials_id ?? "",
    target_quantity: card.target_quantity ?? 0,
    actual_output_quantity: card.actual_output_quantity ?? 0,
    total_material_cost: card.total_material_cost ?? 0,
    total_machine_cost: card.total_machine_cost ?? 0,
    total_wastage_cost: card.total_wastage_cost ?? 0,
    total_rework_cost: card.total_rework_cost ?? 0,
    agreed_selling_price: card.agreed_selling_price ?? 0,
    start_date: card.start_date ?? "",
    target_completion_date: card.target_completion_date ?? "",
    created_at: card.created_at ?? new Date().toISOString(),
  };
}

export function loadProductionCards(): ProductionCard[] {
  if (typeof window === "undefined") {
    return INITIAL_PRODUCTION_CARDS.map(normalizeProductionCard);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_PRODUCTION_CARDS.map(normalizeProductionCard);
  }

  try {
    const parsed = JSON.parse(saved) as ProductionCard[];
    return parsed.length
      ? parsed.map(normalizeProductionCard)
      : INITIAL_PRODUCTION_CARDS.map(normalizeProductionCard);
  } catch {
    return INITIAL_PRODUCTION_CARDS.map(normalizeProductionCard);
  }
}

export function saveProductionCards(cards: ProductionCard[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getProductionCard(cardId: string): ProductionCard | undefined {
  return loadProductionCards().find((card) => card.id === cardId);
}

export function listProductionCardSalesOrders(cards: ProductionCard[]): SalesOrderOption[] {
  const options = new Map<string, SalesOrderOption>();

  BASE_SALES_ORDER_OPTIONS.forEach((option) => {
    options.set(option.value, option);
  });

  cards.forEach((card) => {
    if (!card.customer_order_id) {
      return;
    }

    options.set(card.customer_order_id, {
      value: card.customer_order_id,
      label: card.customer_order_id,
      customerName: card.customer_id,
      productCategoryName: card.product_category_id,
    });
  });

  return Array.from(options.values()).sort((left, right) => right.value.localeCompare(left.value));
}

function mergeLookupOptions(
  baseOptions: ProductionCardLookupOption[],
  dynamicValues: string[],
): ProductionCardLookupOption[] {
  const options = new Map<string, ProductionCardLookupOption>();

  baseOptions.forEach((option) => {
    options.set(option.value, option);
  });

  dynamicValues
    .filter(Boolean)
    .forEach((value) => {
      options.set(value, {
        value,
        label: value,
      });
    });

  return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label));
}

export function listProductionCardCustomerOptions(
  cards: ProductionCard[],
): ProductionCardLookupOption[] {
  return mergeLookupOptions(BASE_CUSTOMER_OPTIONS, cards.map((card) => card.customer_id));
}

export function listProductionCardProductCategoryOptions(
  cards: ProductionCard[],
): ProductionCardLookupOption[] {
  return mergeLookupOptions(
    BASE_PRODUCT_CATEGORY_OPTIONS,
    cards.map((card) => card.product_category_id),
  );
}

export function generateNextProductionCardJobNumber(
  cards: Array<Pick<ProductionCard, "job_number">>,
): string {
  const year = new Date().getFullYear();

  const highestSequence = cards.reduce((highest, card) => {
    const rawSequence = card.job_number.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `PC-${year}-${String(highestSequence + 1).padStart(4, "0")}`;
}

export function createProductionCardRecord(
  payload: CreateProductionCardData,
): ProductionCard {
  const now = new Date().toISOString();

  return normalizeProductionCard({
    id: globalThis.crypto?.randomUUID?.() ?? `${payload.job_number}-${Date.now()}`,
    tenant_id: DEFAULT_TENANT_ID,
    job_number: payload.job_number,
    customer_id: payload.customer_id,
    customer_order_id: payload.customer_order_id,
    product_category_id: payload.product_category_id,
    bill_of_materials_id: payload.bill_of_materials_id,
    status: payload.status,
    target_quantity: payload.target_quantity ?? 0,
    actual_output_quantity: 0,
    total_material_cost: 0,
    total_machine_cost: 0,
    total_wastage_cost: 0,
    total_rework_cost: 0,
    agreed_selling_price: payload.agreed_selling_price ?? 0,
    start_date: payload.start_date,
    target_completion_date: payload.target_completion_date,
    created_at: now,
  });
}

export function updateProductionCardRecord(
  current: ProductionCard,
  payload: CreateProductionCardData,
): ProductionCard {
  return normalizeProductionCard({
    ...current,
    job_number: payload.job_number,
    customer_id: payload.customer_id,
    customer_order_id: payload.customer_order_id,
    product_category_id: payload.product_category_id,
    bill_of_materials_id: payload.bill_of_materials_id,
    status: payload.status,
    target_quantity: payload.target_quantity ?? 0,
    agreed_selling_price: payload.agreed_selling_price ?? 0,
    start_date: payload.start_date,
    target_completion_date: payload.target_completion_date,
  });
}
