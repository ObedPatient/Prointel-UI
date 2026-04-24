export type GoodReceiptNoteStatus = "Draft" | "Received" | "Cancelled";

export interface GoodReceiptNoteLine {
  id: string;
  tenant_id: string;
  grn_id: string;
  po_line_id: string;
  raw_material_id: string;
  quantity_received: number;
  batch_lot_number: string;
  expiry_date: string | null;
  warehouse_location_id: string;
  created_at: string;
}

export interface GoodReceiptNote {
  id: string;
  tenant_id: string;
  grn_number: string;
  purchase_order_id: string;
  supplier_id: string;
  warehouse_location_id: string;
  receipt_date: string;
  received_by: string;
  status: GoodReceiptNoteStatus;
  notes: string;
  created_at: string;
  lines: GoodReceiptNoteLine[];
}

export interface GoodReceiptNoteLineFormData {
  po_line_id: string;
  raw_material_id: string;
  quantity_received: number;
  batch_lot_number: string;
  expiry_date: string | null;
  warehouse_location_id: string;
}

export interface GoodReceiptNoteFormData {
  purchase_order_id: string;
  supplier_id: string;
  warehouse_location_id: string;
  receipt_date: string;
  notes: string;
  lines: GoodReceiptNoteLineFormData[];
}

export interface WarehouseLocationOption {
  id: string;
  name: string;
}
