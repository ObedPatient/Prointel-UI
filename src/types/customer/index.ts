export type CustomerStatus = "Active" | "On Hold" | "Archived";

export interface CustomerRecord {
  id: string;
  tenant_id: string;
  company_name: string;
  tin: string;
  billing_address: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  payment_terms_days: number | null;
  credit_limit: number | null;
  current_balance: number | null;
  credit_exposure: number | null;
  status: CustomerStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CustomerFormData {
  company_name: string;
  tin: string;
  billing_address: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  payment_terms_days: number | null;
  credit_limit: number | null;
  current_balance: number | null;
  credit_exposure: number | null;
  status: CustomerStatus;
}
