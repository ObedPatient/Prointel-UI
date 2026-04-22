// @ts-nocheck
import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  CircleCheck,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type {
  AdminUserFormValues,
  AdminUserRecord,
  TenantFieldProps,
  TenantFormValues,
  TenantRecord,
} from "@/types/tenant";

const TENANT_STORAGE_KEY = "registered_tenants";
const USER_STORAGE_KEY = "registered_users";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "suspended", label: "Suspended" },
] as const;

const steps = [
  {
    id: 1,
    title: "Tenant setup",
    description: "Workspace identity and company profile",
  },
  {
    id: 2,
    title: "Admin account",
    description: "Primary user credentials and security",
  },
] as const;

const tenantFields = ["legal_name", "tin", "subdomain_identifier", "physical_address"] as const;
const adminFields = [
  "first_name",
  "last_name",
  "email",
  "password",
  "confirm_password",
  "mfa_enabled",
  "status",
] as const;

const initialTenantValues: TenantFormValues = {
  legal_name: "",
  tin: "",
  subdomain_identifier: "",
  physical_address: "",
};

const initialAdminValues: AdminUserFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  mfa_enabled: false,
  status: "active",
};

type RegistrationStep = (typeof steps)[number]["id"];
type FormFieldName = (typeof tenantFields)[number] | (typeof adminFields)[number];
type FormErrors = Partial<Record<FormFieldName, string>>;

interface SuccessState {
  tenantName: string;
  subdomain: string;
  adminEmail: string;
  status: string;
  mfaEnabled: boolean;
}

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

function normalizeSubdomain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function isStrongPassword(password: string): boolean {
  return Object.values(getPasswordChecks(password)).every(Boolean);
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

function validateTenantStep(form: TenantFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!form.legal_name.trim()) {
    errors.legal_name = "Legal name is required.";
  }

  if (!form.tin.trim()) {
    errors.tin = "TIN is required.";
  }

  if (!form.subdomain_identifier.trim()) {
    errors.subdomain_identifier = "Subdomain identifier is required.";
  } else if (form.subdomain_identifier.length < 3) {
    errors.subdomain_identifier = "Use at least 3 characters.";
  }

  return errors;
}

function validateAdminStep(form: AdminUserFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!form.first_name.trim()) {
    errors.first_name = "First name is required.";
  }

  if (!form.last_name.trim()) {
    errors.last_name = "Last name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (!isStrongPassword(form.password)) {
    errors.password =
      "Use at least 8 characters with one uppercase letter, one number, and one special character.";
  }

  if (!form.confirm_password) {
    errors.confirm_password = "Please confirm the password.";
  } else if (form.confirm_password !== form.password) {
    errors.confirm_password = "Passwords do not match.";
  }

  if (!form.status) {
    errors.status = "Status is required.";
  }

  return errors;
}

function buildTenantRecord(
  form: TenantFormValues,
  tenantId: string,
  createdAt: string,
): TenantRecord {
  return {
    tenant_id: tenantId,
    legal_name: form.legal_name.trim(),
    tin: form.tin.trim(),
    subdomain_identifier: form.subdomain_identifier.trim(),
    physical_address: form.physical_address.trim(),
    created_at: createdAt,
  };
}

async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function buildAdminRecord(
  form: AdminUserFormValues,
  tenantId: string,
  createdAt: string,
): Promise<AdminUserRecord> {
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim().toLowerCase(),
    password_hash: await hashPassword(form.password),
    mfa_enabled: form.mfa_enabled,
    status: form.status,
    last_login: null,
    tenant_id: tenantId,
    created_at: createdAt,
  };
}

async function registerTenantAndAdmin(
  tenantRecord: TenantRecord,
  adminRecord: AdminUserRecord,
): Promise<void> {
  const tenants = readStoredRecords<TenantRecord>(TENANT_STORAGE_KEY);
  const users = readStoredRecords<AdminUserRecord>(USER_STORAGE_KEY);

  if (tenants.some((tenant) => tenant.subdomain_identifier === tenantRecord.subdomain_identifier)) {
    throw new Error("That subdomain is already assigned to another tenant.");
  }

  if (tenants.some((tenant) => tenant.tin === tenantRecord.tin)) {
    throw new Error("That TIN is already registered.");
  }

  if (users.some((user) => user.email === adminRecord.email)) {
    throw new Error("That admin email is already in use.");
  }

  tenants.unshift(tenantRecord);
  users.unshift(adminRecord);

  window.localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenants));
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

export default function TenantRegister() {
  const [tenantForm, setTenantForm] = useState<TenantFormValues>(initialTenantValues);
  const [adminForm, setAdminForm] = useState<AdminUserFormValues>(initialAdminValues);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordChecks = useMemo(() => getPasswordChecks(adminForm.password), [adminForm.password]);

  const updateErrors = (fields: readonly FormFieldName[], nextErrors: FormErrors) => {
    setErrors((current) => {
      const remaining = { ...current };
      fields.forEach((field) => {
        delete remaining[field];
      });

      return { ...remaining, ...nextErrors };
    });
  };

  const setTenantField = <K extends keyof TenantFormValues>(key: K, value: TenantFormValues[K]) => {
    setTenantForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const setAdminField = <K extends keyof AdminUserFormValues>(
    key: K,
    value: AdminUserFormValues[K],
  ) => {
    setAdminForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleStepClick = (event: MouseEvent<HTMLAnchorElement>, step: RegistrationStep) => {
    event.preventDefault();
    setCurrentStep(step);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setErrors({});
    setSuccess(null);
    setError(null);
    setTenantForm(initialTenantValues);
    setAdminForm(initialAdminValues);
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const tenantErrors = validateTenantStep(tenantForm);
    if (Object.keys(tenantErrors).length > 0) {
      updateErrors(tenantFields, tenantErrors);
      setCurrentStep(1);
      return;
    }

    const adminErrors = validateAdminStep(adminForm);
    if (Object.keys(adminErrors).length > 0) {
      updateErrors(adminFields, adminErrors);
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tenantId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const tenantRecord = buildTenantRecord(tenantForm, tenantId, createdAt);
      const adminRecord = await buildAdminRecord(adminForm, tenantId, createdAt);

      await registerTenantAndAdmin(tenantRecord, adminRecord);

      setSuccess({
        tenantName: tenantRecord.legal_name,
        subdomain: tenantRecord.subdomain_identifier,
        adminEmail: adminRecord.email,
        status: adminRecord.status,
        mfaEnabled: adminRecord.mfa_enabled,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't save the tenant right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <Card className="w-full border-emerald-200 bg-emerald-50/70 shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Tenant and admin created</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">{success.tenantName}</span> is ready to
              onboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Workspace
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{success.tenantName}</p>
              <p className="text-sm text-muted-foreground">app/{success.subdomain}</p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Admin account
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{success.adminEmail}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {success.status}
                </Badge>
                <Badge
                  variant={success.mfaEnabled ? "default" : "outline"}
                  className="capitalize"
                >
                  {success.mfaEnabled ? "MFA enabled" : "MFA disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={resetForm}>
              Register Another Tenant
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/company-settings">Open Company Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Register Tenant</h1>
              <p className="text-sm text-muted-foreground">
                Create the company workspace first, then onboard the primary admin account.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              Tenant + admin onboarding
            </Badge>
          </div>
        </div>

        <Separator className="my-5" />

        <Pagination className="justify-start">
          <PaginationContent className="w-full flex-wrap gap-3">
            {steps.map((step) => (
              <PaginationItem key={step.id} className="min-w-0 flex-1">
                <PaginationLink
                  href="#"
                  size="default"
                  isActive={currentStep === step.id}
                  onClick={(event) => handleStepClick(event, step.id)}
                  className={cn(
                    "h-auto w-full min-w-0 justify-start rounded-xl border px-4 py-3 text-left",
                    currentStep >= step.id && "border-primary/40",
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        currentStep >= step.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {step.id}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="overflow-hidden shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                {currentStep === 1 ? (
                  <Building2 className="h-5 w-5 text-primary" />
                ) : (
                  <UserRound className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 ? (
              <>
                <Card className="border-border/70 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm">Company Information</CardTitle>
                    <CardDescription>
                      These details create the tenant workspace. Tax rules and alert thresholds will
                      be configured later from the dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Legal Name" required error={errors.legal_name}>
                      <Input
                        required
                        autoComplete="organization"
                        value={tenantForm.legal_name}
                        onChange={(event) => setTenantField("legal_name", event.target.value)}
                        placeholder="e.g. Stepping Stone Ltd"
                        className={cn(errors.legal_name && "border-destructive")}
                      />
                    </Field>
                    <Field label="TIN" required hint="Tax Identification Number" error={errors.tin}>
                      <Input
                        required
                        value={tenantForm.tin}
                        onChange={(event) => setTenantField("tin", event.target.value)}
                        placeholder="e.g. 102345678"
                        className={cn(errors.tin && "border-destructive")}
                      />
                    </Field>
                    <Field
                      label="Subdomain Identifier"
                      required
                      hint="Used as your workspace URL slug"
                      error={errors.subdomain_identifier}
                    >
                      <div
                        className={cn(
                          "flex items-center overflow-hidden rounded-lg border border-border bg-background",
                          errors.subdomain_identifier && "border-destructive",
                        )}
                      >
                        <span className="shrink-0 border-r border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
                          https://
                        </span>
                        <input
                          required
                          value={tenantForm.subdomain_identifier}
                          onChange={(event) =>
                            setTenantField(
                              "subdomain_identifier",
                              normalizeSubdomain(event.target.value),
                            )
                          }
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

                
              </>
            ) : (
              <>
                <Card className="border-border/70 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm">Admin Information</CardTitle>
                    <CardDescription>
                      This user becomes the first administrator for the tenant workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First Name" required error={errors.first_name}>
                      <Input
                        required
                        autoComplete="given-name"
                        value={adminForm.first_name}
                        onChange={(event) => setAdminField("first_name", event.target.value)}
                        placeholder="e.g. Aline"
                        className={cn(errors.first_name && "border-destructive")}
                      />
                    </Field>
                    <Field label="Last Name" required error={errors.last_name}>
                      <Input
                        required
                        autoComplete="family-name"
                        value={adminForm.last_name}
                        onChange={(event) => setAdminField("last_name", event.target.value)}
                        placeholder="e.g. Mukamana"
                        className={cn(errors.last_name && "border-destructive")}
                      />
                    </Field>
                    <Field label="Email" required error={errors.email}>
                      <Input
                        required
                        type="email"
                        autoComplete="email"
                        value={adminForm.email}
                        onChange={(event) => setAdminField("email", event.target.value)}
                        placeholder="admin@steppingstone.rw"
                        className={cn(errors.email && "border-destructive")}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card className="border-border/70 shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <LockKeyhole className="h-4 w-4 text-primary" />
                      Security & Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Password" required error={errors.password}>
                        <Input
                          required
                          type="password"
                          autoComplete="new-password"
                          value={adminForm.password}
                          onChange={(event) => setAdminField("password", event.target.value)}
                          placeholder="Create a strong password"
                          className={cn(errors.password && "border-destructive")}
                        />
                      </Field>
                      <Field label="Confirm Password" required error={errors.confirm_password}>
                        <Input
                          required
                          type="password"
                          autoComplete="new-password"
                          value={adminForm.confirm_password}
                          onChange={(event) =>
                            setAdminField("confirm_password", event.target.value)
                          }
                          placeholder="Re-enter the password"
                          className={cn(errors.confirm_password && "border-destructive")}
                        />
                      </Field>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">Password requirements</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[
                          { label: "At least 8 characters", passed: passwordChecks.length },
                          { label: "One uppercase letter", passed: passwordChecks.uppercase },
                          { label: "One number", passed: passwordChecks.number },
                          { label: "One special character", passed: passwordChecks.special },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2 text-sm">
                            <CircleCheck
                              className={cn(
                                "h-4 w-4",
                                rule.passed ? "text-emerald-600" : "text-muted-foreground/50",
                              )}
                            />
                            <span
                              className={cn(
                                rule.passed ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="mfa-enabled">Require MFA for this admin</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable multi-factor authentication for the first login experience.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={adminForm.mfa_enabled ? "default" : "outline"}>
                          {adminForm.mfa_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          id="mfa-enabled"
                          checked={adminForm.mfa_enabled}
                          onCheckedChange={(checked) =>
                            setAdminField("mfa_enabled", Boolean(checked))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Badge variant="secondary">Page {currentStep} of {steps.length}</Badge>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Previous
                </Button>
              )}
              {currentStep === 1 ? (
                <Button type="button" onClick={handleNext}>
                  Continue to Admin
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register Tenant"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
