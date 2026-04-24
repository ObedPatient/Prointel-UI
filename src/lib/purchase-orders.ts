import type { PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatus, SupplierOption } from "@/types/purchase-order";

export const CURRENT_USER = "Jean-Pierre Habimana";
const STORAGE_KEY = "prointel.purchase-orders";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const SUPPLIER_OPTIONS: SupplierOption[] = [
  { id: "supplier-001", name: "Kigali Packaging Works" },
  { id: "supplier-002", name: "Great Lakes Fiber Ltd" },
  { id: "supplier-003", name: "Virunga Industrial Supplies" },
  { id: "supplier-004", name: "Lakeview Chemicals Co." },
];

export const STATUS_FILTER_OPTIONS: Array<PurchaseOrderStatus | "All Statuses"> = [
  "All Statuses",
  "Draft",
  "Submitted",
  "Approved",
  "Rejected",
  "Closed",
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    po_number: "PO-2026-001",
    tenant_id: DEFAULT_TENANT_ID,
    supplier_id: "supplier-001",
    delivery_address: "Stepping Stone Main Factory, Kigali Special Economic Zone",
    required_delivery_date: "2026-05-06",
    status: "Submitted",
    total_amount: 2825,
    created_by: "Jean-Pierre Habimana",
    submitted_at: "2026-04-18T08:15:00.000Z",
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    closed_at: null,
    created_at: "2026-04-18T07:45:00.000Z",
    lines: [
      {
        purchase_order_id: "PO-2026-001",
        tenant_id: DEFAULT_TENANT_ID,
        line_number: 1,
        raw_material_id: "RM-BROWN-KRAFT-PAPER-ROLLS",
        raw_material_name: "Brown Kraft Paper Rolls",
        description: "Brown kraft paper rolls for carton production",
        quantity_ordered: 25,
        unit_of_measure: "rolls",
        unit_price: 85,
        quantity_received: 0,
        created_at: "2026-04-18T07:45:00.000Z",
      },
      {
        purchase_order_id: "PO-2026-001",
        tenant_id: DEFAULT_TENANT_ID,
        line_number: 2,
        raw_material_id: "RM-INDUSTRIAL-BONDING-ADHESIVE",
        raw_material_name: "Industrial Bonding Adhesive",
        description: "Industrial bonding adhesive drums",
        quantity_ordered: 5,
        unit_of_measure: "drums",
        unit_price: 140,
        quantity_received: 0,
        created_at: "2026-04-18T07:45:00.000Z",
      },
    ],
  },
  {
    po_number: "PO-2026-002",
    tenant_id: DEFAULT_TENANT_ID,
    supplier_id: "supplier-002",
    delivery_address: "Warehouse B, Masoro Industrial Park",
    required_delivery_date: "2026-05-10",
    status: "Approved",
    total_amount: 4800,
    created_by: "Claudine Mugenzi",
    submitted_at: "2026-04-19T09:20:00.000Z",
    approved_by: "Eric Ndayambaje",
    approved_at: "2026-04-20T13:10:00.000Z",
    rejection_reason: null,
    closed_at: null,
    created_at: "2026-04-19T08:55:00.000Z",
    lines: [
      {
        purchase_order_id: "PO-2026-002",
        tenant_id: DEFAULT_TENANT_ID,
        line_number: 1,
        raw_material_id: "RM-RECYCLED-FIBER-PULP",
        raw_material_name: "Recycled Fiber Pulp",
        description: "Recycled fiber pulp bales",
        quantity_ordered: 60,
        unit_of_measure: "bales",
        unit_price: 80,
        quantity_received: 20,
        created_at: "2026-04-19T08:55:00.000Z",
      },
    ],
  },
  {
    po_number: "PO-2026-003",
    tenant_id: DEFAULT_TENANT_ID,
    supplier_id: "supplier-004",
    delivery_address: "Stepping Stone Main Factory, Kigali Special Economic Zone",
    required_delivery_date: "2026-05-02",
    status: "Rejected",
    total_amount: 1350,
    created_by: "Aline Mutoni",
    submitted_at: "2026-04-16T10:05:00.000Z",
    approved_by: null,
    approved_at: null,
    rejection_reason: "Requested unit price exceeded the approved quarterly contract rate.",
    closed_at: null,
    created_at: "2026-04-16T09:40:00.000Z",
    lines: [
      {
        purchase_order_id: "PO-2026-003",
        tenant_id: DEFAULT_TENANT_ID,
        line_number: 1,
        raw_material_id: "RM-INK-STABILIZER-CONCENTRATE",
        raw_material_name: "Ink Stabilizer Concentrate",
        description: "Ink stabilizer concentrate",
        quantity_ordered: 18,
        unit_of_measure: "canisters",
        unit_price: 75,
        quantity_received: 0,
        created_at: "2026-04-16T09:40:00.000Z",
      },
    ],
  },
  {
    po_number: "PO-2026-004",
    tenant_id: DEFAULT_TENANT_ID,
    supplier_id: "supplier-003",
    delivery_address: "Warehouse C, Gikondo Logistics Yard",
    required_delivery_date: "2026-04-28",
    status: "Closed",
    total_amount: 2320,
    created_by: "Jean-Pierre Habimana",
    submitted_at: "2026-04-10T06:45:00.000Z",
    approved_by: "Eric Ndayambaje",
    approved_at: "2026-04-10T11:20:00.000Z",
    rejection_reason: null,
    closed_at: "2026-04-22T15:30:00.000Z",
    created_at: "2026-04-10T06:15:00.000Z",
    lines: [
      {
        purchase_order_id: "PO-2026-004",
        tenant_id: DEFAULT_TENANT_ID,
        line_number: 1,
        raw_material_id: "RM-FOOD-GRADE-STARCH",
        raw_material_name: "Food-Grade Starch",
        description: "Food-grade starch sacks",
        quantity_ordered: 40,
        unit_of_measure: "bags",
        unit_price: 58,
        quantity_received: 40,
        created_at: "2026-04-10T06:15:00.000Z",
      },
    ],
  },
];

function fallbackMaterialName(value: string | undefined): string {
  if (!value) {
    return "Material";
  }

  return value
    .replace(/^RM-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizePurchaseOrders(orders: PurchaseOrder[]): PurchaseOrder[] {
  return orders.map((order) => ({
    ...order,
    tenant_id: order.tenant_id ?? DEFAULT_TENANT_ID,
    total_amount: calculateTotalAmount({
      lines: order.lines.map((line) => ({
        ...line,
        tenant_id: line.tenant_id ?? DEFAULT_TENANT_ID,
        raw_material_name: line.raw_material_name || fallbackMaterialName(line.raw_material_id),
      })),
    }),
    lines: order.lines.map((line) => ({
      ...line,
      tenant_id: line.tenant_id ?? DEFAULT_TENANT_ID,
      raw_material_name: line.raw_material_name || fallbackMaterialName(line.raw_material_id),
    })),
  }));
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function getSupplierName(supplierId: string): string {
  return SUPPLIER_OPTIONS.find((supplier) => supplier.id === supplierId)?.name ?? supplierId;
}

export function calculateTotalAmount(order: Pick<PurchaseOrder, "lines">): number {
  return order.lines.reduce(
    (sum, line) => sum + line.quantity_ordered * line.unit_price,
    0,
  );
}

export function generateNextPoNumber(orders: PurchaseOrder[]): string {
  const highestSequence = orders.reduce((highest, order) => {
    const [, rawSequence = "0"] = order.po_number.split("-").slice(-1);
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `PO-2026-${String(highestSequence + 1).padStart(3, "0")}`;
}

export function generateMaterialId(rawMaterialName: string, lineNumber: number): string {
  const normalized = rawMaterialName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  return `RM-${normalized || `LINE-${lineNumber}`}`;
}

export function loadPurchaseOrders(): PurchaseOrder[] {
  if (typeof window === "undefined") {
    return normalizePurchaseOrders(INITIAL_PURCHASE_ORDERS);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return normalizePurchaseOrders(INITIAL_PURCHASE_ORDERS);
  }

  try {
    const parsed = JSON.parse(saved) as PurchaseOrder[];
    return parsed.length
      ? normalizePurchaseOrders(parsed)
      : normalizePurchaseOrders(INITIAL_PURCHASE_ORDERS);
  } catch {
    return normalizePurchaseOrders(INITIAL_PURCHASE_ORDERS);
  }
}

export function savePurchaseOrders(orders: PurchaseOrder[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getPurchaseOrder(poNumber: string): PurchaseOrder | undefined {
  return loadPurchaseOrders().find((order) => order.po_number === poNumber);
}

export function withTotals(orders: PurchaseOrder[]): PurchaseOrder[] {
  return orders.map((order) => ({
    ...order,
    total_amount: calculateTotalAmount(order),
  }));
}

export function createUpdatedLines(poNumber: string, lines: PurchaseOrderLine[], now: string): PurchaseOrderLine[] {
  return lines.map((line, index) => ({
    ...line,
    purchase_order_id: poNumber,
    tenant_id: line.tenant_id ?? DEFAULT_TENANT_ID,
    line_number: index + 1,
    raw_material_id: generateMaterialId(line.raw_material_name, index + 1),
    created_at: line.created_at || now,
  }));
}
