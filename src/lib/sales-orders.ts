import { loadBillOfMaterials } from "@/lib/bill-of-materials";
import { loadCustomers } from "@/lib/customers";
import { loadProducts } from "@/lib/products";
import { loadRequestForQuotations } from "@/lib/request-for-quotations";
import type { BillOfMaterials } from "@/types/bill-of-material";
import type { CustomerRecord } from "@/types/customer";
import type { Product } from "@/types/product";
import type { RequestForQuotation } from "@/types/request-for-quotation";
import type {
  SalesOrderDeliveryAddressOption,
  SalesOrderFormData,
  SalesOrderLookupOption,
  SalesOrderOption,
  SalesOrderQuotationOption,
  SalesOrderRecord,
  SalesOrderStatus,
} from "@/types/sales-order";

export const CURRENT_SALES_ORDER_USER = "Jean-Pierre Habimana";
const STORAGE_KEY = "prointel.sales-orders";
const DEFAULT_TENANT_ID = "tenant-stepping-stone";

export const SALES_ORDER_STATUS_FILTER_OPTIONS: Array<SalesOrderStatus | "All Statuses"> = [
  "All Statuses",
  "confirmed",
  "in_production",
  "ready_for_dispatch",
  "dispatched",
  "invoiced",
  "closed",
];

const INITIAL_SALES_ORDERS: SalesOrderRecord[] = [
  {
    id: "sales-order-001",
    tenant_id: DEFAULT_TENANT_ID,
    order_number: "SO-2026-040",
    quotation_id: "rfq-002",
    customer_id: "customer-002",
    customer_po_number: "PO-RMT-8801",
    delivery_address_id: "customer-002-billing",
    product_category_id: "product-002",
    bill_of_materials_id: "bom-002",
    quantity_ordered: 8000,
    agreed_unit_price: 210,
    agreed_delivery_date: "2026-05-08",
    status: "confirmed",
    total_order_value_rwf: 1680000,
    quantity_produced: 0,
    quantity_dispatched: 0,
    material_availability_checked: true,
    material_insufficient: false,
    created_by: "Claudine Mugenzi",
    production_started_at: null,
    ready_for_dispatch_at: null,
    closed_at: null,
    created_at: "2026-04-21T09:15:00.000Z",
    updated_at: "2026-04-21T09:15:00.000Z",
    deleted_at: null,
  },
  {
    id: "sales-order-002",
    tenant_id: DEFAULT_TENANT_ID,
    order_number: "SO-2026-041",
    quotation_id: "rfq-001",
    customer_id: "customer-001",
    customer_po_number: "PO-INY-4402",
    delivery_address_id: "customer-001-billing",
    product_category_id: "product-001",
    bill_of_materials_id: "bom-001",
    quantity_ordered: 5000,
    agreed_unit_price: 420,
    agreed_delivery_date: "2026-05-04",
    status: "in_production",
    total_order_value_rwf: 2100000,
    quantity_produced: 4973,
    quantity_dispatched: 0,
    material_availability_checked: true,
    material_insufficient: false,
    created_by: CURRENT_SALES_ORDER_USER,
    production_started_at: "2026-04-23T07:20:00.000Z",
    ready_for_dispatch_at: null,
    closed_at: null,
    created_at: "2026-04-22T14:40:00.000Z",
    updated_at: "2026-04-24T12:10:00.000Z",
    deleted_at: null,
  },
  {
    id: "sales-order-003",
    tenant_id: DEFAULT_TENANT_ID,
    order_number: "SO-2026-045",
    quotation_id: null,
    customer_id: "customer-003",
    customer_po_number: "PO-SKR-1188",
    delivery_address_id: "customer-003-billing",
    product_category_id: "product-003",
    bill_of_materials_id: "bom-003",
    quantity_ordered: 12000,
    agreed_unit_price: 296.6667,
    agreed_delivery_date: "2026-05-12",
    status: "dispatched",
    total_order_value_rwf: 3560000.4,
    quantity_produced: 11978,
    quantity_dispatched: 12000,
    material_availability_checked: true,
    material_insufficient: false,
    created_by: "Aline Mutoni",
    production_started_at: "2026-04-18T06:50:00.000Z",
    ready_for_dispatch_at: "2026-04-25T16:30:00.000Z",
    closed_at: null,
    created_at: "2026-04-17T10:00:00.000Z",
    updated_at: "2026-04-25T16:30:00.000Z",
    deleted_at: null,
  },
  {
    id: "sales-order-004",
    tenant_id: DEFAULT_TENANT_ID,
    order_number: "SO-2026-046",
    quotation_id: "rfq-004",
    customer_id: "customer-004",
    customer_po_number: "PO-AZF-2205",
    delivery_address_id: "customer-004-billing",
    product_category_id: "product-004",
    bill_of_materials_id: "bom-004",
    quantity_ordered: 3000,
    agreed_unit_price: 286.6667,
    agreed_delivery_date: "2026-04-28",
    status: "invoiced",
    total_order_value_rwf: 860000.1,
    quantity_produced: 3000,
    quantity_dispatched: 3000,
    material_availability_checked: true,
    material_insufficient: false,
    created_by: "Diane Uwimana",
    production_started_at: "2026-04-14T08:00:00.000Z",
    ready_for_dispatch_at: "2026-04-19T15:00:00.000Z",
    closed_at: "2026-04-21T11:45:00.000Z",
    created_at: "2026-04-12T12:20:00.000Z",
    updated_at: "2026-04-21T11:45:00.000Z",
    deleted_at: null,
  },
];

function buildCustomerMaps(customers: CustomerRecord[]) {
  const byId = new Map(customers.map((customer) => [customer.id, customer]));
  const byCompany = new Map(customers.map((customer) => [customer.company_name, customer]));
  return { byId, byCompany };
}

function buildProductMaps(products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const byName = new Map(products.map((product) => [product.name, product]));
  return { byId, byName };
}

function buildBomMaps(boms: BillOfMaterials[]) {
  const byId = new Map(boms.map((bom) => [bom.id, bom]));
  const byCode = new Map(boms.map((bom) => [bom.bom_code, bom]));
  return { byId, byCode };
}

function calculateTotalOrderValue(
  quantityOrdered: number,
  agreedUnitPrice: number,
): number {
  return Number((quantityOrdered * agreedUnitPrice).toFixed(2));
}

function normalizeSalesOrderStatus(status: string | null | undefined): SalesOrderStatus {
  switch (status) {
    case "confirmed":
    case "in_production":
    case "ready_for_dispatch":
    case "dispatched":
    case "invoiced":
    case "closed":
      return status;
    case "draft":
      return "confirmed";
    case "cancelled":
      return "closed";
    default:
      return "confirmed";
  }
}

function normalizeSalesOrder(order: SalesOrderRecord): SalesOrderRecord {
  const quantityOrdered = order.quantity_ordered ?? 0;
  const agreedUnitPrice = order.agreed_unit_price ?? 0;

  return {
    ...order,
    tenant_id: order.tenant_id ?? DEFAULT_TENANT_ID,
    quotation_id: order.quotation_id ?? null,
    customer_id: order.customer_id ?? "",
    customer_po_number: order.customer_po_number ?? "",
    delivery_address_id: order.delivery_address_id ?? "",
    product_category_id: order.product_category_id ?? "",
    bill_of_materials_id: order.bill_of_materials_id ?? "",
    quantity_ordered: quantityOrdered,
    agreed_unit_price: agreedUnitPrice,
    agreed_delivery_date: order.agreed_delivery_date ?? "",
    status: normalizeSalesOrderStatus(order.status),
    total_order_value_rwf:
      order.total_order_value_rwf ?? calculateTotalOrderValue(quantityOrdered, agreedUnitPrice),
    quantity_produced: order.quantity_produced ?? 0,
    quantity_dispatched: order.quantity_dispatched ?? 0,
    material_availability_checked: order.material_availability_checked ?? false,
    material_insufficient: order.material_insufficient ?? false,
    created_by: order.created_by ?? CURRENT_SALES_ORDER_USER,
    production_started_at: order.production_started_at ?? null,
    ready_for_dispatch_at: order.ready_for_dispatch_at ?? null,
    closed_at: order.closed_at ?? null,
    created_at: order.created_at ?? new Date().toISOString(),
    updated_at: order.updated_at ?? order.created_at ?? new Date().toISOString(),
    deleted_at: order.deleted_at ?? null,
  };
}

export function formatSalesOrderStatus(status: SalesOrderStatus): string {
  return status.replace(/_/g, " ");
}

export function formatCurrencyRwf(value: number): string {
  return `RWF ${value.toLocaleString(undefined, {
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

export function loadSalesOrders(): SalesOrderRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_SALES_ORDERS.map(normalizeSalesOrder);
  }

  let saved: string | null = null;

  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return INITIAL_SALES_ORDERS.map(normalizeSalesOrder);
  }

  if (!saved) {
    return INITIAL_SALES_ORDERS.map(normalizeSalesOrder);
  }

  try {
    const parsed = JSON.parse(saved) as SalesOrderRecord[];
    return parsed.length
      ? parsed.map(normalizeSalesOrder)
      : INITIAL_SALES_ORDERS.map(normalizeSalesOrder);
  } catch {
    return INITIAL_SALES_ORDERS.map(normalizeSalesOrder);
  }
}

export function saveSalesOrders(orders: SalesOrderRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage failures so the sales order pages remain usable.
  }
}

export function generateNextSalesOrderNumber(
  orders: Array<Pick<SalesOrderRecord, "order_number">>,
): string {
  const year = new Date().getFullYear();
  const highestSequence = orders.reduce((highest, order) => {
    const rawSequence = order.order_number.split("-").slice(-1)[0] ?? "0";
    const parsed = Number(rawSequence);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);

  return `SO-${year}-${String(highestSequence + 1).padStart(3, "0")}`;
}

export function getSalesOrderCustomerOptions(): SalesOrderLookupOption[] {
  return loadCustomers()
    .filter((customer) => customer.deleted_at == null)
    .map((customer) => ({
      value: customer.id,
      label: customer.company_name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getSalesOrderProductOptions(): SalesOrderLookupOption[] {
  return loadProducts()
    .map((product) => ({
      value: product.id,
      label: product.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getSalesOrderBillOfMaterialsOptions(): SalesOrderLookupOption[] {
  return loadBillOfMaterials()
    .map((bom) => ({
      value: bom.id,
      label: `${bom.bom_code} · ${bom.name}`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getSalesOrderQuotationOptions(): SalesOrderQuotationOption[] {
  const quotations = loadRequestForQuotations();
  const customers = loadCustomers();
  const products = loadProducts();
  const boms = loadBillOfMaterials();
  const { byCompany } = buildCustomerMaps(customers);
  const { byName: productsByName } = buildProductMaps(products);
  const { byCode: bomByCode } = buildBomMaps(boms);

  return quotations
    .filter((quotation) => quotation.status !== "rejected" && quotation.status !== "expired")
    .map((quotation) => {
      const customer = byCompany.get(quotation.customer_id);
      const product = productsByName.get(quotation.product_category_id);
      const bom = bomByCode.get(quotation.bill_of_materials_id);
      const deliveryAddressId = customer ? `${customer.id}-billing` : "";

      return {
        value: quotation.id,
        label: `${quotation.quotation_number} · ${quotation.customer_id}`,
        customerId: customer?.id ?? "",
        customerName: customer?.company_name ?? quotation.customer_id,
        deliveryAddressId,
        productId: product?.id ?? "",
        productName: product?.name ?? quotation.product_category_id,
        billOfMaterialsId: bom?.id ?? "",
        quantityOrdered: quotation.quantity,
        agreedUnitPrice:
          quotation.quantity > 0 ? Number((quotation.selling_price / quotation.quantity).toFixed(2)) : 0,
      };
    })
    .filter(
      (option) =>
        option.customerId.trim().length > 0 &&
        option.productId.trim().length > 0 &&
        option.billOfMaterialsId.trim().length > 0,
    )
    .sort((left, right) => right.label.localeCompare(left.label));
}

export function getSalesOrderDeliveryAddressOptions(): SalesOrderDeliveryAddressOption[] {
  return loadCustomers()
    .filter((customer) => customer.deleted_at == null && customer.billing_address.trim().length > 0)
    .map((customer) => ({
      value: `${customer.id}-billing`,
      label: `${customer.company_name} · ${customer.billing_address}`,
      customerId: customer.id,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getCustomerName(customerId: string): string {
  return loadCustomers().find((customer) => customer.id === customerId)?.company_name ?? customerId;
}

export function getProductName(productId: string): string {
  return loadProducts().find((product) => product.id === productId)?.name ?? productId;
}

export function getBomLabel(bomId: string): string {
  const bom = loadBillOfMaterials().find((item) => item.id === bomId);
  return bom ? `${bom.bom_code} · ${bom.name}` : bomId || "—";
}

export function getQuotationLabel(quotationId: string | null): string {
  if (!quotationId) {
    return "—";
  }

  const quotation = loadRequestForQuotations().find((item) => item.id === quotationId);
  return quotation ? quotation.quotation_number : quotationId;
}

export function getDeliveryAddressLabel(addressId: string): string {
  if (!addressId) {
    return "—";
  }

  return (
    getSalesOrderDeliveryAddressOptions().find((option) => option.value === addressId)?.label ??
    addressId
  );
}

export function createSalesOrderRecord(
  payload: SalesOrderFormData,
  orders: Array<Pick<SalesOrderRecord, "order_number">>,
): SalesOrderRecord {
  const now = new Date().toISOString();
  const quantityOrdered = payload.quantity_ordered ?? 0;
  const agreedUnitPrice = payload.agreed_unit_price ?? 0;

  return normalizeSalesOrder({
    id: globalThis.crypto?.randomUUID?.() ?? `sales-order-${Date.now()}`,
    tenant_id: DEFAULT_TENANT_ID,
    order_number: generateNextSalesOrderNumber(orders),
    quotation_id: payload.quotation_id ?? null,
    customer_id: payload.customer_id,
    customer_po_number: payload.customer_po_number.trim(),
    delivery_address_id: payload.delivery_address_id,
    product_category_id: payload.product_category_id,
    bill_of_materials_id: payload.bill_of_materials_id,
    quantity_ordered: quantityOrdered,
    agreed_unit_price: agreedUnitPrice,
    agreed_delivery_date: payload.agreed_delivery_date,
    status: "confirmed",
    total_order_value_rwf: calculateTotalOrderValue(quantityOrdered, agreedUnitPrice),
    quantity_produced: payload.quantity_produced ?? 0,
    quantity_dispatched: payload.quantity_dispatched ?? 0,
    material_availability_checked: payload.material_availability_checked,
    material_insufficient: payload.material_insufficient,
    created_by: CURRENT_SALES_ORDER_USER,
    production_started_at: null,
    ready_for_dispatch_at: null,
    closed_at: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
}

export function updateSalesOrderRecord(
  current: SalesOrderRecord,
  payload: SalesOrderFormData,
): SalesOrderRecord {
  const now = new Date().toISOString();
  const quantityOrdered = payload.quantity_ordered ?? 0;
  const agreedUnitPrice = payload.agreed_unit_price ?? 0;

  return normalizeSalesOrder({
    ...current,
    quotation_id: payload.quotation_id ?? null,
    customer_id: payload.customer_id,
    customer_po_number: payload.customer_po_number.trim(),
    delivery_address_id: payload.delivery_address_id,
    product_category_id: payload.product_category_id,
    bill_of_materials_id: payload.bill_of_materials_id,
    quantity_ordered: quantityOrdered,
    agreed_unit_price: agreedUnitPrice,
    agreed_delivery_date: payload.agreed_delivery_date,
    status: current.status,
    total_order_value_rwf: calculateTotalOrderValue(quantityOrdered, agreedUnitPrice),
    quantity_produced: payload.quantity_produced ?? 0,
    quantity_dispatched: payload.quantity_dispatched ?? 0,
    material_availability_checked: payload.material_availability_checked,
    material_insufficient: payload.material_insufficient,
    production_started_at: current.production_started_at,
    ready_for_dispatch_at: current.ready_for_dispatch_at,
    closed_at: current.closed_at,
    updated_at: now,
    deleted_at: current.deleted_at,
  });
}

export function startSalesOrderProduction(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    status: "in_production",
    production_started_at: order.production_started_at ?? now,
    updated_at: now,
  });
}

export function markSalesOrderReadyForDispatch(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    status: "ready_for_dispatch",
    ready_for_dispatch_at: order.ready_for_dispatch_at ?? now,
    updated_at: now,
  });
}

export function markSalesOrderDispatched(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    status: "dispatched",
    quantity_dispatched: Math.max(order.quantity_dispatched, order.quantity_ordered),
    updated_at: now,
  });
}

export function markSalesOrderInvoiced(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    status: "invoiced",
    updated_at: now,
  });
}

export function closeSalesOrder(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    status: "closed",
    closed_at: order.closed_at ?? now,
    updated_at: now,
  });
}

export function softDeleteSalesOrder(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    deleted_at: order.deleted_at ?? now,
    updated_at: now,
  });
}

export function restoreSalesOrder(order: SalesOrderRecord): SalesOrderRecord {
  const now = new Date().toISOString();
  return normalizeSalesOrder({
    ...order,
    deleted_at: null,
    updated_at: now,
  });
}

export function listSalesOrderOptions(): SalesOrderOption[] {
  return loadSalesOrders()
    .filter((order) => order.deleted_at == null)
    .map((order) => ({
      value: order.order_number,
      label: order.order_number,
      customerName: getCustomerName(order.customer_id),
      productCategoryName: getProductName(order.product_category_id),
    }))
    .sort((left, right) => right.value.localeCompare(left.value));
}
