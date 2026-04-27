import type {
  StockCard,
  StockCardReferenceType,
  StockCardTransactionType,
} from "@/types/stock-card";

const STORAGE_KEY = "prointel.stock-cards";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const STOCK_CARD_TRANSACTION_FILTER_OPTIONS: Array<
  StockCardTransactionType | "All Transactions"
> = [
  "All Transactions",
  "Opening Balance",
  "Receipt",
  "Issue",
  "Transfer",
  "Adjustment",
  "Return",
];

export const STOCK_CARD_REFERENCE_FILTER_OPTIONS: Array<
  StockCardReferenceType | "All References"
> = [
  "All References",
  "Manual Entry",
  "Goods Received Note",
  "Production Card",
  "Stock Transfer",
  "Stock Adjustment",
  "Return Note",
];

const INITIAL_STOCK_CARDS: StockCard[] = [
  {
    id: "stock-card-001",
    tenant_id: DEFAULT_TENANT_ID,
    raw_material_id: "Kraft Liner 250gsm",
    transaction_date: "2026-04-01",
    transaction_type: "Opening Balance",
    reference_type: "Manual Entry",
    reference_id: "ME-2026-001",
    reference_number: "OPEN-APR-001",
    opening_balance: 0,
    quantity_in: 1200,
    quantity_out: 0,
    closing_balance: 1200,
    waste_quantity: 0,
    waste_reason_id: "",
    weighted_average_unit_cost: 1850,
    stock_value_rwf: 2220000,
    warehouse_location_id: "WH-RAW-01",
    created_by: "Alice Uwimana",
    created_at: "2026-04-01T07:30:00.000Z",
  },
  {
    id: "stock-card-002",
    tenant_id: DEFAULT_TENANT_ID,
    raw_material_id: "Kraft Liner 250gsm",
    transaction_date: "2026-04-03",
    transaction_type: "Receipt",
    reference_type: "Goods Received Note",
    reference_id: "grn-2026-014",
    reference_number: "GRN-2026-014",
    opening_balance: 1200,
    quantity_in: 800,
    quantity_out: 0,
    closing_balance: 2000,
    waste_quantity: 0,
    waste_reason_id: "",
    weighted_average_unit_cost: 1875,
    stock_value_rwf: 3750000,
    warehouse_location_id: "WH-RAW-01",
    created_by: "Patrick Nshimiyimana",
    created_at: "2026-04-03T10:12:00.000Z",
  },
  {
    id: "stock-card-003",
    tenant_id: DEFAULT_TENANT_ID,
    raw_material_id: "Kraft Liner 250gsm",
    transaction_date: "2026-04-07",
    transaction_type: "Issue",
    reference_type: "Production Card",
    reference_id: "production-card-002",
    reference_number: "PC-2026-0042",
    opening_balance: 2000,
    quantity_in: 0,
    quantity_out: 540,
    closing_balance: 1460,
    waste_quantity: 18,
    waste_reason_id: "WR-EDGE-TRIM",
    weighted_average_unit_cost: 1875,
    stock_value_rwf: 2737500,
    warehouse_location_id: "WH-RAW-01",
    created_by: "Jean Claude Habimana",
    created_at: "2026-04-07T06:50:00.000Z",
  },
  {
    id: "stock-card-004",
    tenant_id: DEFAULT_TENANT_ID,
    raw_material_id: "Food Grade Ink Cyan",
    transaction_date: "2026-04-10",
    transaction_type: "Transfer",
    reference_type: "Stock Transfer",
    reference_id: "sto-2026-006",
    reference_number: "STO-2026-006",
    opening_balance: 220,
    quantity_in: 0,
    quantity_out: 40,
    closing_balance: 180,
    waste_quantity: 0,
    waste_reason_id: "",
    weighted_average_unit_cost: 9200,
    stock_value_rwf: 1656000,
    warehouse_location_id: "WH-INK-02",
    created_by: "Diane Mukamana",
    created_at: "2026-04-10T13:05:00.000Z",
  },
  {
    id: "stock-card-005",
    tenant_id: DEFAULT_TENANT_ID,
    raw_material_id: "BOPP Lamination Film",
    transaction_date: "2026-04-14",
    transaction_type: "Adjustment",
    reference_type: "Stock Adjustment",
    reference_id: "adj-2026-009",
    reference_number: "ADJ-2026-009",
    opening_balance: 960,
    quantity_in: 15,
    quantity_out: 0,
    closing_balance: 975,
    waste_quantity: 0,
    waste_reason_id: "",
    weighted_average_unit_cost: 14500,
    stock_value_rwf: 14137500,
    warehouse_location_id: "WH-FILM-01",
    created_by: "Sandrine Uwera",
    created_at: "2026-04-14T15:44:00.000Z",
  },
  {
    id: "stock-card-006",
    tenant_id: DEFAULT_TENANT_ID,
    raw_material_id: "Water-Based Adhesive",
    transaction_date: "2026-04-19",
    transaction_type: "Return",
    reference_type: "Return Note",
    reference_id: "rn-2026-003",
    reference_number: "RN-2026-003",
    opening_balance: 430,
    quantity_in: 25,
    quantity_out: 0,
    closing_balance: 455,
    waste_quantity: 2,
    waste_reason_id: "WR-SPILLAGE",
    weighted_average_unit_cost: 6800,
    stock_value_rwf: 3094000,
    warehouse_location_id: "WH-CHEM-01",
    created_by: "Eric Mugisha",
    created_at: "2026-04-19T17:20:00.000Z",
  },
];

function normalizeStockCard(card: StockCard | Record<string, unknown>): StockCard {
  const source = card as Record<string, unknown>;
  const weightedAverageUnitCost =
    typeof source.weighted_average_unit_cost === "number"
      ? source.weighted_average_unit_cost
      : typeof source.unit_cost === "number"
        ? source.unit_cost
        : 0;
  const closingBalance = typeof source.closing_balance === "number" ? source.closing_balance : 0;
  const stockValueRwf =
    typeof source.stock_value_rwf === "number"
      ? source.stock_value_rwf
      : closingBalance * weightedAverageUnitCost;

  return {
    ...(card as StockCard),
    id: typeof source.id === "string" ? source.id : "",
    tenant_id: typeof source.tenant_id === "string" ? source.tenant_id : DEFAULT_TENANT_ID,
    raw_material_id: typeof source.raw_material_id === "string" ? source.raw_material_id : "",
    transaction_date: typeof source.transaction_date === "string" ? source.transaction_date : "",
    transaction_type:
      typeof source.transaction_type === "string"
        ? (source.transaction_type as StockCardTransactionType)
        : "Receipt",
    reference_type:
      typeof source.reference_type === "string"
        ? (source.reference_type as StockCardReferenceType)
        : "Manual Entry",
    reference_id: typeof source.reference_id === "string" ? source.reference_id : "",
    reference_number: typeof source.reference_number === "string" ? source.reference_number : "",
    opening_balance: typeof source.opening_balance === "number" ? source.opening_balance : 0,
    quantity_in: typeof source.quantity_in === "number" ? source.quantity_in : 0,
    quantity_out: typeof source.quantity_out === "number" ? source.quantity_out : 0,
    closing_balance: closingBalance,
    waste_quantity: typeof source.waste_quantity === "number" ? source.waste_quantity : 0,
    waste_reason_id: typeof source.waste_reason_id === "string" ? source.waste_reason_id : "",
    weighted_average_unit_cost: weightedAverageUnitCost,
    stock_value_rwf: stockValueRwf,
    warehouse_location_id:
      typeof source.warehouse_location_id === "string" ? source.warehouse_location_id : "",
    created_by: typeof source.created_by === "string" ? source.created_by : "",
    created_at: typeof source.created_at === "string" ? source.created_at : new Date().toISOString(),
  };
}

export function loadStockCards(): StockCard[] {
  if (typeof window === "undefined") {
    return INITIAL_STOCK_CARDS.map(normalizeStockCard);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_STOCK_CARDS.map(normalizeStockCard);
  }

  try {
    const parsed = JSON.parse(saved) as Array<StockCard | Record<string, unknown>>;
    return parsed.length
      ? parsed.map(normalizeStockCard)
      : INITIAL_STOCK_CARDS.map(normalizeStockCard);
  } catch {
    return INITIAL_STOCK_CARDS.map(normalizeStockCard);
  }
}

export function saveStockCards(cards: StockCard[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
