import type { CustomerFormData, CustomerRecord, CustomerStatus } from "@/types/customer";

const STORAGE_KEY = "prointel.customers";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const CUSTOMER_STATUS_FILTER_OPTIONS: Array<CustomerStatus | "All Statuses"> = [
  "All Statuses",
  "Active",
  "On Hold",
  "Archived",
];

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "customer-001",
    tenant_id: DEFAULT_TENANT_ID,
    company_name: "INYANGE Industries",
    tin: "101224578",
    billing_address: "KG 548 St, Kigali Special Economic Zone, Kigali",
    primary_contact_name: "Chantal Uwamahoro",
    primary_contact_phone: "+250 788 210 301",
    payment_terms_days: 30,
    credit_limit: 4500000,
    current_balance: 1280000,
    credit_exposure: 1560000,
    status: "Active",
    archived_at: null,
    created_at: "2026-01-12T08:25:00.000Z",
    updated_at: "2026-04-16T09:10:00.000Z",
    deleted_at: null,
  },
  {
    id: "customer-002",
    tenant_id: DEFAULT_TENANT_ID,
    company_name: "Rwanda Mountain Tea",
    tin: "103887521",
    billing_address: "KN 3 Rd, Nyarugenge Commercial District, Kigali",
    primary_contact_name: "Patrick Habyarimana",
    primary_contact_phone: "+250 788 400 112",
    payment_terms_days: 45,
    credit_limit: 3200000,
    current_balance: 740000,
    credit_exposure: 980000,
    status: "Active",
    archived_at: null,
    created_at: "2025-11-05T10:30:00.000Z",
    updated_at: "2026-04-10T13:45:00.000Z",
    deleted_at: null,
  },
  {
    id: "customer-003",
    tenant_id: DEFAULT_TENANT_ID,
    company_name: "Skol Brewery Rwanda",
    tin: "102556734",
    billing_address: "KK 15 Ave, Gikondo Industrial Area, Kigali",
    primary_contact_name: "Olive Murekatete",
    primary_contact_phone: "+250 789 521 884",
    payment_terms_days: 21,
    credit_limit: 6800000,
    current_balance: 2240000,
    credit_exposure: 2750000,
    status: "Active",
    archived_at: null,
    created_at: "2025-09-21T07:40:00.000Z",
    updated_at: "2026-04-18T15:20:00.000Z",
    deleted_at: null,
  },
  {
    id: "customer-004",
    tenant_id: DEFAULT_TENANT_ID,
    company_name: "Azam Foods",
    tin: "109774422",
    billing_address: "KG 7 Ave, Remera, Kigali",
    primary_contact_name: "Aline Umulisa",
    primary_contact_phone: "+250 787 665 002",
    payment_terms_days: 14,
    credit_limit: 1800000,
    current_balance: 690000,
    credit_exposure: 910000,
    status: "On Hold",
    archived_at: null,
    created_at: "2026-02-04T11:15:00.000Z",
    updated_at: "2026-04-22T08:50:00.000Z",
    deleted_at: null,
  },
  {
    id: "customer-005",
    tenant_id: DEFAULT_TENANT_ID,
    company_name: "Bralirwa Plc",
    tin: "100445673",
    billing_address: "Gasanze Logistics Park, Gasabo, Kigali",
    primary_contact_name: "Jean Claude Ntambara",
    primary_contact_phone: "+250 788 030 949",
    payment_terms_days: 30,
    credit_limit: 5200000,
    current_balance: 0,
    credit_exposure: 640000,
    status: "Archived",
    archived_at: "2026-03-20T10:10:00.000Z",
    created_at: "2025-07-14T09:00:00.000Z",
    updated_at: "2026-03-20T10:10:00.000Z",
    deleted_at: null,
  },
];

type LegacyCustomerRecord = CustomerRecord & {
  primary_contact?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
};

function splitLegacyPrimaryContact(value: string): {
  primary_contact_name: string;
  primary_contact_phone: string;
} {
  const [name = "", phone = ""] = value.split("·").map((part) => part.trim());

  return {
    primary_contact_name: name,
    primary_contact_phone: phone,
  };
}

function normalizeCustomerRecord(customer: LegacyCustomerRecord): CustomerRecord {
  const legacyContact = typeof customer.primary_contact === "string" ? customer.primary_contact : "";
  const splitContact = splitLegacyPrimaryContact(legacyContact);

  return {
    ...customer,
    tenant_id: customer.tenant_id ?? DEFAULT_TENANT_ID,
    company_name: customer.company_name ?? "",
    tin: customer.tin ?? "",
    billing_address: customer.billing_address ?? "",
    primary_contact_name: customer.primary_contact_name ?? splitContact.primary_contact_name,
    primary_contact_phone: customer.primary_contact_phone ?? splitContact.primary_contact_phone,
    payment_terms_days: customer.payment_terms_days ?? null,
    credit_limit: customer.credit_limit ?? null,
    current_balance: customer.current_balance ?? null,
    credit_exposure: customer.credit_exposure ?? customer.current_balance ?? null,
    status: customer.status ?? "Active",
    archived_at: customer.archived_at ?? null,
    created_at: customer.created_at ?? new Date().toISOString(),
    updated_at: customer.updated_at ?? customer.created_at ?? new Date().toISOString(),
    deleted_at: customer.deleted_at ?? null,
  };
}

export function formatCurrency(value: number | null): string {
  return value == null ? "—" : `$${value.toLocaleString()}`;
}

export function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

export function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function getPrimaryContactDisplay(customer: Pick<CustomerRecord, "primary_contact_name" | "primary_contact_phone">): string {
  if (customer.primary_contact_name && customer.primary_contact_phone) {
    return `${customer.primary_contact_name} · ${customer.primary_contact_phone}`;
  }

  return customer.primary_contact_name || customer.primary_contact_phone || "—";
}

export function loadCustomers(): CustomerRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_CUSTOMERS.map(normalizeCustomerRecord);
  }

  let saved: string | null = null;

  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return INITIAL_CUSTOMERS.map(normalizeCustomerRecord);
  }

  if (!saved) {
    return INITIAL_CUSTOMERS.map(normalizeCustomerRecord);
  }

  try {
    const parsed = JSON.parse(saved) as LegacyCustomerRecord[];
    return parsed.length
      ? parsed.map(normalizeCustomerRecord)
      : INITIAL_CUSTOMERS.map(normalizeCustomerRecord);
  } catch {
    return INITIAL_CUSTOMERS.map(normalizeCustomerRecord);
  }
}

export function saveCustomers(customers: CustomerRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // Ignore storage failures so the customer pages remain usable.
  }
}

export function createCustomerRecord(payload: CustomerFormData): CustomerRecord {
  const now = new Date().toISOString();

  return normalizeCustomerRecord({
    id: globalThis.crypto?.randomUUID?.() ?? `customer-${Date.now()}`,
    tenant_id: DEFAULT_TENANT_ID,
    company_name: payload.company_name.trim(),
    tin: payload.tin.trim(),
    billing_address: payload.billing_address.trim(),
    primary_contact_name: payload.primary_contact_name.trim(),
    primary_contact_phone: payload.primary_contact_phone.trim(),
    payment_terms_days: payload.payment_terms_days,
    credit_limit: payload.credit_limit,
    current_balance: payload.current_balance,
    credit_exposure: payload.credit_exposure,
    status: payload.status,
    archived_at: payload.status === "Archived" ? now : null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
}

export function updateCustomerRecord(
  current: CustomerRecord,
  payload: CustomerFormData,
): CustomerRecord {
  const now = new Date().toISOString();
  const archivedAt =
    payload.status === "Archived" ? current.archived_at ?? now : null;

  return normalizeCustomerRecord({
    ...current,
    company_name: payload.company_name.trim(),
    tin: payload.tin.trim(),
    billing_address: payload.billing_address.trim(),
    primary_contact_name: payload.primary_contact_name.trim(),
    primary_contact_phone: payload.primary_contact_phone.trim(),
    payment_terms_days: payload.payment_terms_days,
    credit_limit: payload.credit_limit,
    current_balance: payload.current_balance,
    credit_exposure: payload.credit_exposure,
    status: payload.status,
    archived_at: archivedAt,
    updated_at: now,
  });
}

export function softDeleteCustomer(current: CustomerRecord): CustomerRecord {
  const now = new Date().toISOString();

  return normalizeCustomerRecord({
    ...current,
    status: "Archived",
    archived_at: current.archived_at ?? now,
    updated_at: now,
    deleted_at: now,
  });
}

export function restoreCustomer(current: CustomerRecord): CustomerRecord {
  return normalizeCustomerRecord({
    ...current,
    status: current.status === "Archived" ? "Active" : current.status,
    archived_at: null,
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });
}
