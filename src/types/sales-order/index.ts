import type { SalesOrderOption as ProductionCardSalesOrderOption } from "@/types/production-card";

export type SalesOrderStatus =
  | "confirmed"
  | "in_production"
  | "ready_for_dispatch"
  | "dispatched"
  | "invoiced"
  | "closed";

export interface SalesOrderRecord {
  id: string;
  tenant_id: string;
  order_number: string;
  quotation_id: string | null;
  customer_id: string;
  customer_po_number: string;
  delivery_address_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  quantity_ordered: number;
  agreed_unit_price: number;
  agreed_delivery_date: string;
  status: SalesOrderStatus;
  total_order_value_rwf: number;
  quantity_produced: number;
  quantity_dispatched: number;
  material_availability_checked: boolean;
  material_insufficient: boolean;
  created_by: string;
  production_started_at: string | null;
  ready_for_dispatch_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SalesOrderFormData {
  quotation_id: string | null;
  customer_id: string;
  customer_po_number: string;
  delivery_address_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  quantity_ordered: number | null;
  agreed_unit_price: number | null;
  agreed_delivery_date: string;
  quantity_produced: number | null;
  quantity_dispatched: number | null;
  material_availability_checked: boolean;
  material_insufficient: boolean;
}

export interface SalesOrderLookupOption {
  value: string;
  label: string;
}

export interface SalesOrderQuotationOption extends SalesOrderLookupOption {
  customerId: string;
  customerName: string;
  deliveryAddressId: string;
  productId: string;
  productName: string;
  billOfMaterialsId: string;
  quantityOrdered: number;
  agreedUnitPrice: number;
}

export interface SalesOrderDeliveryAddressOption extends SalesOrderLookupOption {
  customerId: string;
}

export type SalesOrderOption = ProductionCardSalesOrderOption;
