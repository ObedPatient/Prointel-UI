import { loadBillOfMaterials } from "@/lib/bill-of-materials";
import { loadCustomers } from "@/lib/customers";
import { loadProducts } from "@/lib/products";
import {
  listProductionCardCustomerOptions,
  loadProductionCards,
} from "@/lib/production-cards";
import type {
  RequestForQuotation,
  RequestForQuotationFormData,
  RequestForQuotationLookupOption,
  RequestForQuotationStatus,
} from "@/types/request-for-quotation";

export const CURRENT_RFQ_USER = "Jean-Pierre Habimana";
const STORAGE_KEY = "prointel.request-for-quotations";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const RFQ_STATUS_FILTER_OPTIONS: Array<RequestForQuotationStatus | "All Statuses"> = [
  "All Statuses",
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "locked",
];

const INITIAL_REQUEST_FOR_QUOTATIONS: RequestForQuotation[] = [
  {
    id: "rfq-001",
    tenant_id: DEFAULT_TENANT_ID,
    quotation_number: "RFQ-2026-001",
    customer_id: "INYANGE Industries",
    product_category_id: "Milk Carton 1L Outer",
    bill_of_materials_id: "BOM-2026-001",
    quantity: 5000,
    estimated_material_cost: 1180000,
    estimated_machine_cost: 320000,
    total_estimated_cost: 1500000,
    selling_price: 2100000,
    cost_locked_at: "2026-04-21T09:10:00.000Z",
    status: "sent",
    expiry_date: "2026-05-05",
    created_by: "Jean-Pierre Habimana",
    sent_at: "2026-04-21T10:00:00.000Z",
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
    created_at: "2026-04-21T08:40:00.000Z",
  },
  {
    id: "rfq-002",
    tenant_id: DEFAULT_TENANT_ID,
    quotation_number: "RFQ-2026-002",
    customer_id: "Rwanda Mountain Tea",
    product_category_id: "Tea Box 250g Export",
    bill_of_materials_id: "BOM-2026-002",
    quantity: 8000,
    estimated_material_cost: 980000,
    estimated_machine_cost: 250000,
    total_estimated_cost: 1230000,
    selling_price: 1680000,
    cost_locked_at: "2026-04-18T14:15:00.000Z",
    status: "accepted",
    expiry_date: "2026-04-30",
    created_by: "Claudine Mugenzi",
    sent_at: "2026-04-18T16:00:00.000Z",
    accepted_at: "2026-04-20T11:20:00.000Z",
    rejected_at: null,
    rejection_reason: null,
    created_at: "2026-04-18T10:25:00.000Z",
  },
  {
    id: "rfq-003",
    tenant_id: DEFAULT_TENANT_ID,
    quotation_number: "RFQ-2026-003",
    customer_id: "Skol Brewery Rwanda",
    product_category_id: "Skol Lager Tray",
    bill_of_materials_id: "BOM-2026-003",
    quantity: 12000,
    estimated_material_cost: 2410000,
    estimated_machine_cost: 510000,
    total_estimated_cost: 2920000,
    selling_price: 3560000,
    cost_locked_at: null,
    status: "draft",
    expiry_date: "2026-05-10",
    created_by: "Aline Mutoni",
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
    created_at: "2026-04-24T07:55:00.000Z",
  },
  {
    id: "rfq-004",
    tenant_id: DEFAULT_TENANT_ID,
    quotation_number: "RFQ-2026-004",
    customer_id: "Azam Foods",
    product_category_id: "Detergent Box",
    bill_of_materials_id: "BOM-2026-004",
    quantity: 3000,
    estimated_material_cost: 590000,
    estimated_machine_cost: 120000,
    total_estimated_cost: 710000,
    selling_price: 860000,
    cost_locked_at: "2026-04-12T12:00:00.000Z",
    status: "rejected",
    expiry_date: "2026-04-20",
    created_by: "Diane Uwimana",
    sent_at: "2026-04-12T13:00:00.000Z",
    accepted_at: null,
    rejected_at: "2026-04-14T09:35:00.000Z",
    rejection_reason: "Customer requested a revised unit price for the launch batch.",
    created_at: "2026-04-12T09:10:00.000Z",
  },
  {
    id: "rfq-005",
    tenant_id: DEFAULT_TENANT_ID,
    quotation_number: "RFQ-2026-005",
    customer_id: "Bralirwa Plc",
    product_category_id: "Soft Drink Shrink Wrap",
    bill_of_materials_id: "BOM-2026-002",
    quantity: 6800,
    estimated_material_cost: 740000,
    estimated_machine_cost: 180000,
    total_estimated_cost: 920000,
    selling_price: 1180000,
    cost_locked_at: "2026-04-01T10:40:00.000Z",
    status: "sent",
    expiry_date: "2026-04-15",
    created_by: "Jean-Pierre Habimana",
    sent_at: "2026-04-01T11:15:00.000Z",
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
    created_at: "2026-04-01T09:20:00.000Z",
  },
];

function normalizeRequestForQuotation(
  quotation: RequestForQuotation,
): RequestForQuotation {
  const estimatedMaterialCost = quotation.estimated_material_cost ?? 0;
  const estimatedMachineCost = quotation.estimated_machine_cost ?? 0;
  const totalEstimatedCost =
    quotation.total_estimated_cost ?? estimatedMaterialCost + estimatedMachineCost;
  const normalizedStatus = deriveQuotationStatus({
    status: quotation.status,
    accepted_at: quotation.accepted_at ?? null,
    rejected_at: quotation.rejected_at ?? null,
    expiry_date: quotation.expiry_date ?? "",
  });

  return {
    ...quotation,
    tenant_id: quotation.tenant_id ?? DEFAULT_TENANT_ID,
    customer_id: quotation.customer_id ?? "",
    product_category_id: quotation.product_category_id ?? "",
    bill_of_materials_id: quotation.bill_of_materials_id ?? "",
    quantity: quotation.quantity ?? 0,
    estimated_material_cost: estimatedMaterialCost,
    estimated_machine_cost: estimatedMachineCost,
    total_estimated_cost: totalEstimatedCost,
    selling_price: quotation.selling_price ?? 0,
    cost_locked_at: quotation.cost_locked_at ?? null,
    status: normalizedStatus,
    expiry_date: quotation.expiry_date ?? "",
    created_by: quotation.created_by ?? CURRENT_RFQ_USER,
    sent_at: quotation.sent_at ?? null,
    accepted_at: quotation.accepted_at ?? null,
    rejected_at: quotation.rejected_at ?? null,
    rejection_reason: quotation.rejection_reason ?? null,
    created_at: quotation.created_at ?? new Date().toISOString(),
  };
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

export function formatDateTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export function deriveQuotationStatus(
  quotation: Pick<
    RequestForQuotation,
    "status" | "accepted_at" | "rejected_at" | "expiry_date"
  >,
): RequestForQuotationStatus {
  if (quotation.accepted_at) {
    return "accepted";
  }

  if (quotation.rejected_at) {
    return "rejected";
  }

  if (
    quotation.expiry_date &&
    new Date(quotation.expiry_date).getTime() < Date.now() &&
    quotation.status !== "accepted" &&
    quotation.status !== "rejected"
  ) {
    return "expired";
  }

  return quotation.status;
}

export function loadRequestForQuotations(): RequestForQuotation[] {
  if (typeof window === "undefined") {
    return INITIAL_REQUEST_FOR_QUOTATIONS.map(normalizeRequestForQuotation);
  }

  let saved: string | null = null;

  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return INITIAL_REQUEST_FOR_QUOTATIONS.map(normalizeRequestForQuotation);
  }

  if (!saved) {
    return INITIAL_REQUEST_FOR_QUOTATIONS.map(normalizeRequestForQuotation);
  }

  try {
    const parsed = JSON.parse(saved) as RequestForQuotation[];
    return parsed.length
      ? parsed.map(normalizeRequestForQuotation)
      : INITIAL_REQUEST_FOR_QUOTATIONS.map(normalizeRequestForQuotation);
  } catch {
    return INITIAL_REQUEST_FOR_QUOTATIONS.map(normalizeRequestForQuotation);
  }
}

export function saveRequestForQuotations(quotations: RequestForQuotation[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
  } catch {
    // Ignore storage failures so the RFQ pages remain usable.
  }
}

export function generateNextQuotationNumber(
  quotations: Array<Pick<RequestForQuotation, "quotation_number">>,
): string {
  const year = new Date().getFullYear();

  const highestSequence = quotations.reduce((highest, quotation) => {
    const rawSequence = quotation.quotation_number.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `RFQ-${year}-${String(highestSequence + 1).padStart(3, "0")}`;
}

export function getCustomerOptions(): RequestForQuotationLookupOption[] {
  const options = new Map<string, RequestForQuotationLookupOption>();

  loadCustomers()
    .filter((customer) => customer.deleted_at == null && customer.status !== "Archived")
    .forEach((customer) => {
      options.set(customer.company_name, {
        value: customer.company_name,
        label: customer.company_name,
      });
    });

  listProductionCardCustomerOptions(loadProductionCards()).forEach((option) => {
    options.set(option.value, option);
  });

  return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label));
}

export function getProductCategoryOptions(): RequestForQuotationLookupOption[] {
  return loadProducts()
    .map((product) => ({
      value: product.name,
      label: product.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getBillOfMaterialsOptions(): RequestForQuotationLookupOption[] {
  return loadBillOfMaterials()
    .map((bom) => ({
      value: bom.bom_code,
      label: `${bom.bom_code} · ${bom.name}`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getBillOfMaterialsLabel(value: string): string {
  return getBillOfMaterialsOptions().find((option) => option.value === value)?.label ?? (value || "—");
}

export function createRequestForQuotationRecord(
  payload: RequestForQuotationFormData,
  quotations: Array<Pick<RequestForQuotation, "quotation_number">>,
): RequestForQuotation {
  const now = new Date().toISOString();

  return normalizeRequestForQuotation({
    id: globalThis.crypto?.randomUUID?.() ?? `rfq-${Date.now()}`,
    tenant_id: DEFAULT_TENANT_ID,
    quotation_number: generateNextQuotationNumber(quotations),
    customer_id: payload.customer_id,
    product_category_id: payload.product_category_id,
    bill_of_materials_id: payload.bill_of_materials_id,
    quantity: payload.quantity ?? 0,
    estimated_material_cost: payload.estimated_material_cost ?? 0,
    estimated_machine_cost: payload.estimated_machine_cost ?? 0,
    total_estimated_cost:
      payload.total_estimated_cost ??
      (payload.estimated_material_cost ?? 0) + (payload.estimated_machine_cost ?? 0),
    selling_price: payload.selling_price ?? 0,
    cost_locked_at: null,
    status: "draft",
    expiry_date: payload.expiry_date,
    created_by: CURRENT_RFQ_USER,
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
    created_at: now,
  });
}

export function updateRequestForQuotationRecord(
  current: RequestForQuotation,
  payload: RequestForQuotationFormData,
): RequestForQuotation {
  const nextStatus =
    current.status === "accepted" || current.status === "rejected"
      ? current.status
      : current.cost_locked_at
        ? "locked"
        : "draft";

  return normalizeRequestForQuotation({
    ...current,
    customer_id: payload.customer_id,
    product_category_id: payload.product_category_id,
    bill_of_materials_id: payload.bill_of_materials_id,
    quantity: payload.quantity ?? 0,
    estimated_material_cost: payload.estimated_material_cost ?? 0,
    estimated_machine_cost: payload.estimated_machine_cost ?? 0,
    total_estimated_cost:
      payload.total_estimated_cost ??
      (payload.estimated_material_cost ?? 0) + (payload.estimated_machine_cost ?? 0),
    selling_price: payload.selling_price ?? 0,
    expiry_date: payload.expiry_date,
    status: nextStatus,
  });
}

export function lockQuotationCosts(quotation: RequestForQuotation): RequestForQuotation {
  return normalizeRequestForQuotation({
    ...quotation,
    cost_locked_at: new Date().toISOString(),
    status: quotation.sent_at ? "sent" : "locked",
  });
}

export function sendQuotation(quotation: RequestForQuotation): RequestForQuotation {
  return normalizeRequestForQuotation({
    ...quotation,
    cost_locked_at: quotation.cost_locked_at ?? new Date().toISOString(),
    sent_at: new Date().toISOString(),
    status: "sent",
  });
}

export function acceptQuotation(quotation: RequestForQuotation): RequestForQuotation {
  return normalizeRequestForQuotation({
    ...quotation,
    accepted_at: new Date().toISOString(),
    rejected_at: null,
    rejection_reason: null,
    status: "accepted",
  });
}

export function rejectQuotation(
  quotation: RequestForQuotation,
  reason: string,
): RequestForQuotation {
  return normalizeRequestForQuotation({
    ...quotation,
    accepted_at: null,
    rejected_at: new Date().toISOString(),
    rejection_reason: reason,
    status: "rejected",
  });
}

export function getGrossMarginValue(quotation: RequestForQuotation): number {
  return quotation.selling_price - quotation.total_estimated_cost;
}

export function getGrossMarginPercent(quotation: RequestForQuotation): number {
  if (quotation.selling_price <= 0) {
    return 0;
  }

  return Math.round((getGrossMarginValue(quotation) / quotation.selling_price) * 100);
}
