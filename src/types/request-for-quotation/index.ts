export type RequestForQuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "locked";

export interface RequestForQuotation {
  id: string;
  tenant_id: string;
  quotation_number: string;
  customer_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  quantity: number;
  estimated_material_cost: number;
  estimated_machine_cost: number;
  total_estimated_cost: number;
  selling_price: number;
  cost_locked_at: string | null;
  status: RequestForQuotationStatus;
  expiry_date: string;
  created_by: string;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface RequestForQuotationFormData {
  customer_id: string;
  product_category_id: string;
  bill_of_materials_id: string;
  quantity: number | null;
  estimated_material_cost: number | null;
  estimated_machine_cost: number | null;
  total_estimated_cost: number | null;
  selling_price: number | null;
  expiry_date: string;
}

export interface RequestForQuotationLookupOption {
  value: string;
  label: string;
}
