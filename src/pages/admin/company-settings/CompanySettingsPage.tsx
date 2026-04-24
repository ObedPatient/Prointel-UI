import { useMemo, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, Settings2, Siren, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CompanySettingsFormValues,
  CompanySettingsRecord,
  TenantFieldProps,
  TenantFormValues,
  TenantRecord,
} from "@/types/tenant";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const TENANT_STORAGE_KEY = "registered_tenants";
const COMPANY_SETTINGS_STORAGE_KEY = "company_settings";

const fallbackTenant: TenantRecord = {
  tenant_id: "demo-tenant",
  legal_name: "Stepping Stone Ltd",
  tin: "",
  subdomain_identifier: "stepping-stone",
  physical_address: "",
  created_at: new Date().toISOString(),
};

interface CompanyContext {
  tenant: TenantRecord;
}

type SettingsErrors = Partial<Record<keyof CompanySettingsFormValues, string>>;

function Field({ label, required = false, hint, error, children }: TenantFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function parseNumber(value: string): number | null {
  return value !== "" ? Number(value) : null;
}

function readStoredRecords<T>(key: string): T[] {
  const existing = window.localStorage.getItem(key);
  if (!existing) {
    return [];
  }

  try {
    return JSON.parse(existing) as T[];
  } catch {
    return [];
  }
}

function getCompanyContext(): CompanyContext {
  const tenants = readStoredRecords<TenantRecord>(TENANT_STORAGE_KEY);
  return { tenant: tenants[0] ?? fallbackTenant };
}

function getInitialTenantForm(tenant: TenantRecord): TenantFormValues {
  return {
    legal_name: tenant.legal_name ?? "",
    tin: tenant.tin ?? "",
    subdomain_identifier: tenant.subdomain_identifier ?? "",
    physical_address: tenant.physical_address ?? "",
  };
}

function getInitialSettingsForm(tenantId: string): CompanySettingsFormValues {
  const settings = readStoredRecords<CompanySettingsRecord>(COMPANY_SETTINGS_STORAGE_KEY);
  const existing = settings.find((item) => item.tenant_id === tenantId);

  if (existing) {
    return {
      vat_rate: existing.vat_rate?.toString() ?? "",
      fiscal_year_start_month: existing.fiscal_year_start_month?.toString() ?? "",
      fiscal_authority: existing.fiscal_authority ?? "",
      ebm_device_serial: existing.ebm_device_serial ?? "",
      po_approval_alert_threshold: existing.po_approval_alert_threshold?.toString() ?? "",
      wastage_alert_threshold: existing.wastage_alert_threshold?.toString() ?? "",
    };
  }

  const legacyTenants = readStoredRecords<any>(TENANT_STORAGE_KEY);
  const legacyTenant = legacyTenants.find((item) => item.tenant_id === tenantId);

  return {
    vat_rate: legacyTenant?.vat_rate?.toString() ?? "",
    fiscal_year_start_month: legacyTenant?.fiscal_year_start_month?.toString() ?? "",
    fiscal_authority: legacyTenant?.fiscal_authority ?? "",
    ebm_device_serial: legacyTenant?.ebm_device_serial ?? "",
    po_approval_alert_threshold: legacyTenant?.po_approval_alert_threshold?.toString() ?? "",
    wastage_alert_threshold: legacyTenant?.wastage_alert_threshold?.toString() ?? "",
  };
}

function validateSettings(form: CompanySettingsFormValues): SettingsErrors {
  const errors: SettingsErrors = {};

  if (form.vat_rate && (Number.isNaN(Number(form.vat_rate)) || Number(form.vat_rate) > 100)) {
    errors.vat_rate = "Enter a VAT rate between 0 and 100.";
  }

  if (
    form.wastage_alert_threshold &&
    (Number.isNaN(Number(form.wastage_alert_threshold)) ||
      Number(form.wastage_alert_threshold) > 100)
  ) {
    errors.wastage_alert_threshold = "Enter a percentage between 0 and 100.";
  }

  if (
    form.po_approval_alert_threshold &&
    (Number.isNaN(Number(form.po_approval_alert_threshold)) ||
      Number(form.po_approval_alert_threshold) < 0)
  ) {
    errors.po_approval_alert_threshold = "Enter a valid positive amount.";
  }

  return errors;
}

function buildTenantRecord(form: TenantFormValues, currentTenant: TenantRecord): TenantRecord {
  return {
    ...currentTenant,
    legal_name: form.legal_name.trim(),
    tin: form.tin.trim(),
    subdomain_identifier: form.subdomain_identifier.trim(),
    physical_address: form.physical_address.trim(),
  };
}

function buildSettingsRecord(
  form: CompanySettingsFormValues,
  tenantId: string,
): CompanySettingsRecord {
  return {
    tenant_id: tenantId,
    vat_rate: parseNumber(form.vat_rate),
    fiscal_year_start_month: parseNumber(form.fiscal_year_start_month),
    fiscal_authority: form.fiscal_authority.trim(),
    ebm_device_serial: form.ebm_device_serial.trim(),
    po_approval_alert_threshold: parseNumber(form.po_approval_alert_threshold),
    wastage_alert_threshold: parseNumber(form.wastage_alert_threshold),
    updated_at: new Date().toISOString(),
  };
}

function saveTenantRecord(record: TenantRecord): void {
  const tenants = readStoredRecords<TenantRecord>(TENANT_STORAGE_KEY);
  const remaining = tenants.filter((item) => item.tenant_id !== record.tenant_id);
  remaining.unshift(record);
  window.localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(remaining));
}

function saveCompanySettings(record: CompanySettingsRecord): void {
  const settings = readStoredRecords<CompanySettingsRecord>(COMPANY_SETTINGS_STORAGE_KEY);
  const remaining = settings.filter((item) => item.tenant_id !== record.tenant_id);
  remaining.unshift(record);
  window.localStorage.setItem(COMPANY_SETTINGS_STORAGE_KEY, JSON.stringify(remaining));
}

export default function CompanySettings() {
  const company = useMemo(() => getCompanyContext(), []);
  const [tenantForm, setTenantForm] = useState<TenantFormValues>(() =>
    getInitialTenantForm(company.tenant),
  );
  const [form, setForm] = useState<CompanySettingsFormValues>(() =>
    getInitialSettingsForm(company.tenant.tenant_id),
  );
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setTenantField = <K extends keyof TenantFormValues>(key: K, value: TenantFormValues[K]) => {
    setTenantForm((current) => ({ ...current, [key]: value }));
    setSaveError(null);
  };

  const setField = <K extends keyof CompanySettingsFormValues>(
    key: K,
    value: CompanySettingsFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSaveError(null);
  };

  const handleReset = () => {
    setTenantForm(getInitialTenantForm(company.tenant));
    setForm(getInitialSettingsForm(company.tenant.tenant_id));
    setErrors({});
    setSaveError(null);
  };

  const handleSave = () => {
    const nextErrors = validateSettings(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const tenantRecord = buildTenantRecord(tenantForm, company.tenant);
      const settingsRecord = buildSettingsRecord(form, tenantRecord.tenant_id);

      saveTenantRecord(tenantRecord);
      saveCompanySettings(settingsRecord);

      setTenantForm(getInitialTenantForm(tenantRecord));
      setSavedAt(settingsRecord.updated_at);
      setSaveError(null);
    } catch {
      setSaveError("We couldn't save the company settings right now. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Company Settings</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Configure company profile, fiscal controls, and alert thresholds for{" "}
              {tenantForm.legal_name || company.tenant.legal_name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {tenantForm.subdomain_identifier ? `app/${tenantForm.subdomain_identifier}` : "No subdomain"}
          </Badge>
          <Badge variant="secondary">Admin configuration</Badge>
        </div>
      </div>


      

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Company Profile
          </CardTitle>
          <CardDescription>
            Edit the tenant identity and workspace details used across the product.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Legal Name">
            <Input
              value={tenantForm.legal_name}
              onChange={(event) => setTenantField("legal_name", event.target.value)}
              placeholder="e.g. Stepping Stone Ltd"
            />
          </Field>

          <Field label="TIN" hint="Tax Identification Number">
            <Input
              value={tenantForm.tin}
              onChange={(event) => setTenantField("tin", event.target.value)}
              placeholder="e.g. 102345678"
            />
          </Field>

          <Field label="Subdomain Identifier" hint="Used as the workspace URL slug">
            <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
              <span className="shrink-0 border-r border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
                app /
              </span>
              <input
                value={tenantForm.subdomain_identifier}
                onChange={(event) => setTenantField("subdomain_identifier", event.target.value)}
                placeholder="stepping-stone"
                className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </Field>

          <Field label="Physical Address">
            <Input
              value={tenantForm.physical_address}
              onChange={(event) => setTenantField("physical_address", event.target.value)}
              placeholder="e.g. KN 82 St, Kigali"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Tax & Fiscal Settings
          </CardTitle>
          <CardDescription>
            Manage tax behavior, fiscal timing, and EBM information for the company.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="VAT Rate (%)"
            hint="Standard VAT percentage applied to invoices"
            error={errors.vat_rate}
          >
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.vat_rate}
              onChange={(event) => setField("vat_rate", event.target.value)}
              placeholder="e.g. 18"
            />
          </Field>

          <Field label="Fiscal Year Start Month">
            <Select
              value={form.fiscal_year_start_month}
              onValueChange={(value) => setField("fiscal_year_start_month", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={String(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fiscal Authority" hint="e.g. RRA">
            <Input
              value={form.fiscal_authority}
              onChange={(event) => setField("fiscal_authority", event.target.value)}
              placeholder="e.g. RRA"
            />
          </Field>

          <Field label="EBM Device Serial" hint="Electronic Billing Machine serial number">
            <Input
              value={form.ebm_device_serial}
              onChange={(event) => setField("ebm_device_serial", event.target.value)}
              placeholder="e.g. EBM-2024-XXXXX"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Siren className="h-4 w-4 text-primary" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Set the operational limits that should surface attention for procurement and wastage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="PO Approval Alert Threshold"
            hint="Alert when PO value exceeds this amount"
            error={errors.po_approval_alert_threshold}
          >
            <Input
              type="number"
              min={0}
              value={form.po_approval_alert_threshold}
              onChange={(event) => setField("po_approval_alert_threshold", event.target.value)}
              placeholder="e.g. 500000"
            />
          </Field>

          <Field
            label="Wastage Alert Threshold (%)"
            hint="Alert when wastage rate exceeds this %"
            error={errors.wastage_alert_threshold}
          >
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.wastage_alert_threshold}
              onChange={(event) => setField("wastage_alert_threshold", event.target.value)}
              placeholder="e.g. 2.5"
            />
          </Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {savedAt
              ? `Last updated ${new Date(savedAt).toLocaleString()}.`
              : "Save once these values reflect how the company should operate."}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
