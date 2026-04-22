export interface Supplier {
  company_name: string;
  tin: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  payment_terms: string;
  payment_days: number | null;
  average_lead_time_days: number | null;
  credit_limit: number | null;
  current_balance: number | null;
  performance_rating: number | null;
  on_time_delivery_rate: number | null;
  quality_rejection_rate: number | null;
  status: string;
  archived_at: string | null;
  created_at: string;
}

export interface SupplierRecord extends Supplier {
  id: string;
}
