export type ProductStatus = "Active" | "Pending" | "Deactivated";

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  description: string;
  packaging_category_name: string;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  board_grade: string;
  flute_type: string;
  printing_colors: number | null;
  status: ProductStatus;
  created_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  packaging_category_name: string;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  board_grade: string;
  flute_type: string;
  printing_colors: number | null;
}

export interface ProductOption {
  value: string;
  label: string;
}
