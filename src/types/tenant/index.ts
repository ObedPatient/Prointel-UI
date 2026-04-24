import type { ReactNode } from "react";

export interface TenantFormValues {
  legal_name: string;
  tin: string;
  subdomain_identifier: string;
  physical_address: string;
}

export interface TenantRecord {
  tenant_id: string;
  legal_name: string;
  tin: string;
  subdomain_identifier: string;
  physical_address: string;
  created_at: string;
}

export interface AdminUserFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  mfa_enabled: boolean;
  status: string;
}

export interface AdminUserRecord {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  mfa_enabled: boolean;
  status: string;
  last_login: string | null;
  tenant_id: string;
  created_at: string;
}

export interface CompanySettingsFormValues {
  vat_rate: string;
  fiscal_year_start_month: string;
  fiscal_authority: string;
  ebm_device_serial: string;
  po_approval_alert_threshold: string;
  wastage_alert_threshold: string;
}

export interface CompanySettingsRecord {
  tenant_id: string;
  vat_rate: number | null;
  fiscal_year_start_month: number | null;
  fiscal_authority: string;
  ebm_device_serial: string;
  po_approval_alert_threshold: number | null;
  wastage_alert_threshold: number | null;
  updated_at: string;
}

export interface TenantFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}
