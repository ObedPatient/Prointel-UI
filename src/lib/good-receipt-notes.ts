import { CURRENT_USER, getSupplierName, loadPurchaseOrders, savePurchaseOrders } from "@/lib/purchase-orders";
import type { PurchaseOrder, PurchaseOrderLine } from "@/types/purchase-order";
import type {
  GoodReceiptNote,
  GoodReceiptNoteFormData,
  GoodReceiptNoteLine,
  GoodReceiptNoteStatus,
  WarehouseLocationOption,
} from "@/types/good-receipt-note";

const STORAGE_KEY = "prointel.good-receipt-notes";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const GOODS_RECEIPT_STATUS_FILTER_OPTIONS: Array<GoodReceiptNoteStatus | "All Statuses"> = [
  "All Statuses",
  "Draft",
  "Received",
  "Cancelled",
];

export const WAREHOUSE_LOCATION_OPTIONS: WarehouseLocationOption[] = [
  { id: "warehouse-a", name: "Warehouse A" },
  { id: "warehouse-b", name: "Warehouse B" },
  { id: "warehouse-c", name: "Warehouse C" },
  { id: "factory-stores", name: "Factory Stores" },
  { id: "quality-hold", name: "Quality Hold Area" },
];

export function getWarehouseLocationName(locationId: string): string {
  return WAREHOUSE_LOCATION_OPTIONS.find((location) => location.id === locationId)?.name ?? locationId;
}

export function getPurchaseOrderLineId(poNumber: string, lineNumber: number): string {
  return `${poNumber}::${lineNumber}`;
}

function parsePurchaseOrderLineId(poLineId: string): { purchaseOrderId: string; lineNumber: number } | null {
  const [purchaseOrderId = "", rawLineNumber = ""] = poLineId.split("::");
  const lineNumber = Number(rawLineNumber);

  if (!purchaseOrderId || !Number.isFinite(lineNumber)) {
    return null;
  }

  return { purchaseOrderId, lineNumber };
}

export function findPurchaseOrderLineById(
  orders: PurchaseOrder[],
  poLineId: string,
): { order: PurchaseOrder; line: PurchaseOrderLine } | null {
  const parsed = parsePurchaseOrderLineId(poLineId);

  if (!parsed) {
    return null;
  }

  const order = orders.find((item) => item.po_number === parsed.purchaseOrderId);

  if (!order) {
    return null;
  }

  const line = order.lines.find((item) => item.line_number === parsed.lineNumber);

  if (!line) {
    return null;
  }

  return { order, line };
}

const INITIAL_GOOD_RECEIPT_NOTES: GoodReceiptNote[] = [
  {
    id: "grn-001",
    tenant_id: DEFAULT_TENANT_ID,
    grn_number: "GRN-2026-001",
    purchase_order_id: "PO-2026-002",
    supplier_id: "supplier-002",
    warehouse_location_id: "warehouse-b",
    receipt_date: "2026-04-21",
    received_by: "Claudine Mugenzi",
    status: "Received",
    notes: "Initial partial receipt for recycled fiber pulp.",
    created_at: "2026-04-21T09:15:00.000Z",
    lines: [
      {
        id: "grn-line-001",
        tenant_id: DEFAULT_TENANT_ID,
        grn_id: "grn-001",
        po_line_id: getPurchaseOrderLineId("PO-2026-002", 1),
        raw_material_id: "RM-RECYCLED-FIBER-PULP",
        quantity_received: 20,
        batch_lot_number: "RFP-APR-21-A",
        expiry_date: null,
        warehouse_location_id: "warehouse-b",
        created_at: "2026-04-21T09:15:00.000Z",
      },
    ],
  },
  {
    id: "grn-002",
    tenant_id: DEFAULT_TENANT_ID,
    grn_number: "GRN-2026-002",
    purchase_order_id: "PO-2026-004",
    supplier_id: "supplier-003",
    warehouse_location_id: "warehouse-c",
    receipt_date: "2026-04-22",
    received_by: CURRENT_USER,
    status: "Received",
    notes: "Full receipt posted against the approved starch order.",
    created_at: "2026-04-22T15:05:00.000Z",
    lines: [
      {
        id: "grn-line-002",
        tenant_id: DEFAULT_TENANT_ID,
        grn_id: "grn-002",
        po_line_id: getPurchaseOrderLineId("PO-2026-004", 1),
        raw_material_id: "RM-FOOD-GRADE-STARCH",
        quantity_received: 40,
        batch_lot_number: "FGS-APR-22-B",
        expiry_date: "2027-04-22",
        warehouse_location_id: "warehouse-c",
        created_at: "2026-04-22T15:05:00.000Z",
      },
    ],
  },
  {
    id: "grn-003",
    tenant_id: DEFAULT_TENANT_ID,
    grn_number: "GRN-2026-003",
    purchase_order_id: "PO-2026-001",
    supplier_id: "supplier-001",
    warehouse_location_id: "factory-stores",
    receipt_date: "2026-04-23",
    received_by: CURRENT_USER,
    status: "Draft",
    notes: "Awaiting final quantity confirmation from stores team.",
    created_at: "2026-04-23T08:40:00.000Z",
    lines: [
      {
        id: "grn-line-003",
        tenant_id: DEFAULT_TENANT_ID,
        grn_id: "grn-003",
        po_line_id: getPurchaseOrderLineId("PO-2026-001", 1),
        raw_material_id: "RM-BROWN-KRAFT-PAPER-ROLLS",
        quantity_received: 10,
        batch_lot_number: "BKP-APR-23-C",
        expiry_date: null,
        warehouse_location_id: "factory-stores",
        created_at: "2026-04-23T08:40:00.000Z",
      },
    ],
  },
];

function normalizeLine(line: GoodReceiptNoteLine, note: GoodReceiptNote): GoodReceiptNoteLine {
  return {
    ...line,
    tenant_id: line.tenant_id ?? DEFAULT_TENANT_ID,
    grn_id: line.grn_id ?? note.id,
    po_line_id: line.po_line_id ?? "",
    raw_material_id: line.raw_material_id ?? "",
    quantity_received:
      typeof line.quantity_received === "number" && Number.isFinite(line.quantity_received)
        ? line.quantity_received
        : 0,
    batch_lot_number: line.batch_lot_number ?? "",
    expiry_date: line.expiry_date ?? null,
    warehouse_location_id: line.warehouse_location_id ?? note.warehouse_location_id ?? "",
    created_at: line.created_at ?? note.created_at,
  };
}

function normalizeGoodReceiptNote(note: GoodReceiptNote): GoodReceiptNote {
  return {
    ...note,
    tenant_id: note.tenant_id ?? DEFAULT_TENANT_ID,
    supplier_id: note.supplier_id ?? "",
    warehouse_location_id: note.warehouse_location_id ?? "",
    receipt_date: note.receipt_date ?? new Date().toISOString().slice(0, 10),
    received_by: note.received_by ?? CURRENT_USER,
    status: note.status ?? "Draft",
    notes: note.notes ?? "",
    created_at: note.created_at ?? new Date().toISOString(),
    lines: note.lines.map((line) => normalizeLine(line, note)),
  };
}

export function loadGoodReceiptNotes(): GoodReceiptNote[] {
  if (typeof window === "undefined") {
    return INITIAL_GOOD_RECEIPT_NOTES.map(normalizeGoodReceiptNote);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_GOOD_RECEIPT_NOTES.map(normalizeGoodReceiptNote);
  }

  try {
    const parsed = JSON.parse(saved) as GoodReceiptNote[];
    return parsed.length
      ? parsed.map(normalizeGoodReceiptNote)
      : INITIAL_GOOD_RECEIPT_NOTES.map(normalizeGoodReceiptNote);
  } catch {
    return INITIAL_GOOD_RECEIPT_NOTES.map(normalizeGoodReceiptNote);
  }
}

export function saveGoodReceiptNotes(notes: GoodReceiptNote[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function generateNextGrnNumber(
  notes: Array<Pick<GoodReceiptNote, "grn_number">>,
): string {
  const highestSequence = notes.reduce((highest, note) => {
    const rawSequence = note.grn_number.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `GRN-2026-${String(highestSequence + 1).padStart(3, "0")}`;
}

function buildLines(
  noteId: string,
  headerWarehouseLocationId: string,
  currentCreatedAt: string,
  payloadLines: GoodReceiptNoteFormData["lines"],
  existingLines: GoodReceiptNoteLine[] = [],
): GoodReceiptNoteLine[] {
  return payloadLines.map((line, index) => ({
    id: existingLines[index]?.id ?? globalThis.crypto?.randomUUID?.() ?? `grn-line-${Date.now()}-${index}`,
    tenant_id: existingLines[index]?.tenant_id ?? DEFAULT_TENANT_ID,
    grn_id: noteId,
    po_line_id: line.po_line_id,
    raw_material_id: line.raw_material_id,
    quantity_received: line.quantity_received,
    batch_lot_number: line.batch_lot_number.trim(),
    expiry_date: line.expiry_date ?? null,
    warehouse_location_id: line.warehouse_location_id || headerWarehouseLocationId,
    created_at: existingLines[index]?.created_at ?? currentCreatedAt,
  }));
}

export function createGoodReceiptNoteRecord(
  payload: GoodReceiptNoteFormData,
  existingNotes: Array<Pick<GoodReceiptNote, "grn_number">> = loadGoodReceiptNotes(),
): GoodReceiptNote {
  const id = globalThis.crypto?.randomUUID?.() ?? `grn-${Date.now()}`;
  const createdAt = new Date().toISOString();

  return normalizeGoodReceiptNote({
    id,
    tenant_id: DEFAULT_TENANT_ID,
    grn_number: generateNextGrnNumber(existingNotes),
    purchase_order_id: payload.purchase_order_id,
    supplier_id: payload.supplier_id,
    warehouse_location_id: payload.warehouse_location_id,
    receipt_date: payload.receipt_date,
    received_by: CURRENT_USER,
    status: "Received",
    notes: payload.notes.trim(),
    created_at: createdAt,
    lines: buildLines(id, payload.warehouse_location_id, createdAt, payload.lines),
  });
}

export function updateGoodReceiptNoteRecord(
  current: GoodReceiptNote,
  payload: GoodReceiptNoteFormData,
): GoodReceiptNote {
  return normalizeGoodReceiptNote({
    ...current,
    purchase_order_id: payload.purchase_order_id,
    supplier_id: payload.supplier_id,
    warehouse_location_id: payload.warehouse_location_id,
    receipt_date: payload.receipt_date,
    received_by: current.received_by,
    status: current.status,
    notes: payload.notes.trim(),
    lines: buildLines(
      current.id,
      payload.warehouse_location_id,
      current.created_at,
      payload.lines,
      current.lines,
    ),
  });
}

export function syncPurchaseOrderReceiptQuantities(
  orders: PurchaseOrder[],
  notes: GoodReceiptNote[],
): PurchaseOrder[] {
  const receivedByLine = notes.reduce((map, note) => {
    if (note.status !== "Received") {
      return map;
    }

    note.lines.forEach((line) => {
      map.set(line.po_line_id, (map.get(line.po_line_id) ?? 0) + line.quantity_received);
    });

    return map;
  }, new Map<string, number>());

  return orders.map((order) => ({
    ...order,
    lines: order.lines.map((line) => ({
      ...line,
      quantity_received: receivedByLine.get(getPurchaseOrderLineId(order.po_number, line.line_number)) ?? 0,
    })),
  }));
}

export function saveGoodReceiptNotesWithPurchaseOrderSync(notes: GoodReceiptNote[]): void {
  saveGoodReceiptNotes(notes);
  savePurchaseOrders(syncPurchaseOrderReceiptQuantities(loadPurchaseOrders(), notes));
}

export function listGoodReceiptPurchaseOrderOptions(orders: PurchaseOrder[] = loadPurchaseOrders()): Array<{
  value: string;
  label: string;
  supplierId: string;
  supplierName: string;
}> {
  return orders
    .filter((order) => order.status !== "Rejected")
    .map((order) => ({
      value: order.po_number,
      label: `${order.po_number} · ${getSupplierName(order.supplier_id)}`,
      supplierId: order.supplier_id,
      supplierName: getSupplierName(order.supplier_id),
    }));
}

export function listGoodReceiptPurchaseOrderLineOptions(
  purchaseOrderId: string,
  orders: PurchaseOrder[] = loadPurchaseOrders(),
): Array<{
  value: string;
  label: string;
  rawMaterialId: string;
  rawMaterialName: string;
  unitOfMeasure: string;
  quantityOrdered: number;
  quantityReceived: number;
}> {
  const order = orders.find((item) => item.po_number === purchaseOrderId);

  if (!order) {
    return [];
  }

  return order.lines.map((line) => ({
    value: getPurchaseOrderLineId(order.po_number, line.line_number),
    label: `Line ${line.line_number} · ${line.raw_material_name}`,
    rawMaterialId: line.raw_material_id,
    rawMaterialName: line.raw_material_name,
    unitOfMeasure: line.unit_of_measure,
    quantityOrdered: line.quantity_ordered,
    quantityReceived: line.quantity_received,
  }));
}
