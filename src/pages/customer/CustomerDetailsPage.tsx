import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CustomerFormModal from "@/components/customer/CustomerFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getPrimaryContactDisplay,
  loadCustomers,
  restoreCustomer,
  saveCustomers,
  softDeleteCustomer,
  updateCustomerRecord,
} from "@/lib/customers";
import type { CustomerFormData, CustomerRecord, CustomerStatus } from "@/types/customer";

function StatusBadge({ status }: { status: CustomerStatus }) {
  const tones: Record<CustomerStatus, string> = {
    Active: "border-green-200 bg-green-100 text-green-700",
    "On Hold": "border-amber-200 bg-amber-100 text-amber-700",
    Archived: "border-slate-300 bg-slate-100 text-slate-700",
  };

  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status]}`}>
      {status}
    </Badge>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export default function CustomerDetailsPage() {
  const { customerId = "" } = useParams();
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => loadCustomers());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  const customer = useMemo(
    () => customers.find((item) => item.id === customerId),
    [customerId, customers],
  );

  const handleSubmit = (payload: CustomerFormData) => {
    if (!customer) {
      return;
    }

    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id ? updateCustomerRecord(item, payload) : item,
      ),
    );
    setEditing(false);
  };

  const handleDelete = () => {
    if (!customer) {
      return;
    }

    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id ? softDeleteCustomer(item) : item,
      ),
    );
    setConfirmDelete(false);
  };

  const handleRestore = () => {
    if (!customer) {
      return;
    }

    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id ? restoreCustomer(item) : item,
      ),
    );
  };

  if (!customer) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Customer not found</CardTitle>
            <CardDescription>
              The requested customer could not be loaded from local storage.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button asChild type="button" variant="ghost" className="mb-2 w-fit gap-2 px-0">
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{customer.company_name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review billing, credit, and lifecycle metadata for this customer account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={customer.status} />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setEditing(true)}
            disabled={customer.deleted_at != null}
          >
            <Pencil className="h-4 w-4" />
            Update
          </Button>
          {customer.deleted_at ? (
            <Button type="button" variant="outline" className="gap-2" onClick={handleRestore}>
              <RotateCcw className="h-4 w-4" />
              Restore
            </Button>
          ) : (
            <Button type="button" variant="outline" className="gap-2" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Payment Terms", value: customer.payment_terms_days != null ? `${customer.payment_terms_days} days` : "—" },
          { label: "Credit Limit", value: formatCurrency(customer.credit_limit) },
          { label: "Current Balance", value: formatCurrency(customer.current_balance) },
          { label: "Credit Exposure", value: formatCurrency(customer.credit_exposure) },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-1 p-4">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="ID" value={customer.id} />
            <DetailItem label="Tenant ID" value={customer.tenant_id} />
            <DetailItem label="Company Name" value={customer.company_name} />
            <DetailItem label="TIN" value={customer.tin} />
            <DetailItem label="Primary Contact" value={getPrimaryContactDisplay(customer)} />
            <DetailItem label="Primary Contact Name" value={customer.primary_contact_name || "—"} />
            <DetailItem label="Primary Contact Phone" value={customer.primary_contact_phone || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Commercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Billing Address" value={customer.billing_address || "—"} />
            <DetailItem label="Payment Terms Days" value={formatNumber(customer.payment_terms_days)} />
            <DetailItem label="Credit Limit" value={formatCurrency(customer.credit_limit)} />
            <DetailItem label="Current Balance" value={formatCurrency(customer.current_balance)} />
            <DetailItem label="Credit Exposure" value={formatCurrency(customer.credit_exposure)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Status" value={customer.status} />
            <DetailItem label="Archived At" value={formatDate(customer.archived_at)} />
            <DetailItem label="Created At" value={formatDate(customer.created_at)} />
          </CardContent>
        </Card>
      </div>

      {editing && (
        <CustomerFormModal
          customer={customer}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete {customer.company_name} and preserve the record with a
              `deleted_at` timestamp for audit history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
