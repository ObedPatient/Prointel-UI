export type PurchaseOrderStatus = "Draft" | "Submitted" | "Approved" | "Rejected" | "Closed";

export interface PurchaseOrderLine {
  purchase_order_id: string;
  line_number: number;
  raw_material_id: string;
  raw_material_name: string;
  description: string;
  quantity_ordered: number;
  unit_of_measure: string;
  unit_price: number;
  quantity_received: number;
  created_at: string;
}

export interface PurchaseOrder {
  po_number: string;
  supplier_id: string;
  delivery_address: string;
  required_delivery_date: string;
  status: PurchaseOrderStatus;
  total_amount: number;
  created_by: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  closed_at: string | null;
  created_at: string;
  lines: PurchaseOrderLine[];
}

export interface SupplierOption {
  id: string;
  name: string;
}
