export type MaterialStatus = "Active" | "Low Stock" | "Out of Stock" | "Inactive";

export interface Material {
  id: string;
  tenant_id: string;
  material_code: string;
  name: string;
  description: string;
  material_category: string;
  unit_of_measure: string;
  minimum_stock_level: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  weighted_average_cost: number | null;
  current_stock: number | null;
  reserved_stock: number | null;
  status: MaterialStatus;
  created_at: string;
}

export interface MaterialFormData {
  name: string;
  description: string;
  material_category: string;
  unit_of_measure: string;
  minimum_stock_level: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  weighted_average_cost: number | null;
  current_stock: number | null;
  reserved_stock: number | null;
}

export interface MaterialOption {
  value: string;
  label: string;
}
