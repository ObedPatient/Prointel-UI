export type ProductionCardStatus =
  | "Draft"
  | "In Production"
  | "QC Review"
  | "Materials Confirmed"
  | "Completed"
  | "Cancelled";

export interface ProductionCard {
  id: string;
  tenant_id: string;
  job_number: string;
  customer_id: string;
  customer_order_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  status: ProductionCardStatus;
  target_quantity: number;
  actual_output_quantity: number;
  total_material_cost: number;
  total_machine_cost: number;
  total_wastage_cost: number;
  total_rework_cost: number;
  agreed_selling_price: number;
  start_date: string;
  target_completion_date: string;
  created_at: string;
}

export interface CreateProductionCardData {
  customer_order_id: string;
  customer_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  target_quantity: number | null;
  start_date: string;
  target_completion_date: string;
  agreed_selling_price: number | null;
  job_number: string;
  status: ProductionCardStatus;
}

export interface ProductionCardLookupOption {
  value: string;
  label: string;
}

export interface SalesOrderOption {
  value: string;
  label: string;
  customerName: string;
  productCategoryName: string;
}
