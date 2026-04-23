import type { Supplier, SupplierRecord } from "@/types/supplier";

const STORAGE_KEY = "prointel.suppliers";

export const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: "supplier-001",
    company_name: "Kigali Packaging Works",
    category: "Packaging Materials",
    tin: "107845239",
    primary_contact_name: "Alice Uwimana",
    primary_contact_phone: "+250 788 111 222",
    payment_terms: "Net 30",
    payment_days: 30,
    average_lead_time_days: 7,
    credit_limit: 2500000,
    current_balance: 540000,
    performance_rating: 91,
    on_time_delivery_rate: 96,
    quality_rejection_rate: 2,
    status: "Active",
    archived_at: null,
    created_at: "2026-01-15T08:30:00.000Z",
  },
  {
    id: "supplier-002",
    company_name: "Great Lakes Fiber Ltd",
    category: "Paper & Fiber",
    tin: "102334875",
    primary_contact_name: "Samuel Ndayisaba",
    primary_contact_phone: "+250 789 333 444",
    payment_terms: "Net 45",
    payment_days: 45,
    average_lead_time_days: 12,
    credit_limit: 4000000,
    current_balance: 1280000,
    performance_rating: 78,
    on_time_delivery_rate: 88,
    quality_rejection_rate: 5,
    status: "Active",
    archived_at: null,
    created_at: "2025-11-04T10:15:00.000Z",
  },
  {
    id: "supplier-003",
    company_name: "Virunga Industrial Supplies",
    category: "Industrial Consumables",
    tin: "109992144",
    primary_contact_name: "Diane Mukamana",
    primary_contact_phone: "+250 787 555 999",
    payment_terms: "Cash on Delivery",
    payment_days: 0,
    average_lead_time_days: 4,
    credit_limit: 800000,
    current_balance: 0,
    performance_rating: 84,
    on_time_delivery_rate: 81,
    quality_rejection_rate: 7,
    status: "Inactive",
    archived_at: null,
    created_at: "2025-08-22T14:00:00.000Z",
  },
];

function normalizeSupplierRecord(supplier: SupplierRecord): SupplierRecord {
  return {
    ...supplier,
    category: supplier.category ?? "",
  };
}

export function loadSuppliers(): SupplierRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_SUPPLIERS;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return INITIAL_SUPPLIERS;
  }

  try {
    const parsed = JSON.parse(saved) as SupplierRecord[];
    return parsed.length ? parsed.map(normalizeSupplierRecord) : INITIAL_SUPPLIERS;
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function saveSuppliers(suppliers: SupplierRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

export function getSupplier(id: string): SupplierRecord | undefined {
  return loadSuppliers().find((supplier) => supplier.id === id);
}

export function createSupplierRecord(id: string, supplier: Supplier): SupplierRecord {
  return normalizeSupplierRecord({
    id,
    ...supplier,
  });
}
