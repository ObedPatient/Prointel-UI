export type StockCardTransactionType =
  | "Opening Balance"
  | "Receipt"
  | "Issue"
  | "Transfer"
  | "Adjustment"
  | "Return";

export type StockCardReferenceType =
  | "Manual Entry"
  | "Goods Received Note"
  | "Production Card"
  | "Stock Transfer"
  | "Stock Adjustment"
  | "Return Note";

export interface StockCard {
  id: string;
  tenant_id: string;
  raw_material_id: string;
  transaction_date: string;
  transaction_type: StockCardTransactionType;
  reference_type: StockCardReferenceType;
  reference_id: string;
  reference_number: string;
  opening_balance: number;
  quantity_in: number;
  quantity_out: number;
  closing_balance: number;
  waste_quantity: number;
  waste_reason_id: string;
  weighted_average_unit_cost: number;
  stock_value_rwf: number;
  warehouse_location_id: string;
  created_by: string;
  created_at: string;
}
