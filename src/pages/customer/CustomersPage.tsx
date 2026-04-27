import { useEffect, useMemo, useState } from "react";
import { Building2, Landmark, Plus, Search, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerActionMenu from "@/components/customer/CustomerActionMenu";
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
import DataPagination from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CUSTOMER_STATUS_FILTER_OPTIONS,
  createCustomerRecord,
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

const PAGE_SIZE = 8;

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

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => loadCustomers());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "All Statuses">("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        needle.length === 0 ||
        customer.company_name.toLowerCase().includes(needle) ||
        customer.tin.toLowerCase().includes(needle) ||
        customer.billing_address.toLowerCase().includes(needle) ||
        customer.primary_contact_name.toLowerCase().includes(needle) ||
        customer.primary_contact_phone.toLowerCase().includes(needle);
      const matchesStatus =
        statusFilter === "All Statuses" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredCustomers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCustomers, page]);

  const totalCreditLimit = useMemo(
    () => customers.reduce((sum, customer) => sum + (customer.credit_limit ?? 0), 0),
    [customers],
  );
  const totalBalance = useMemo(
    () => customers.reduce((sum, customer) => sum + (customer.current_balance ?? 0), 0),
    [customers],
  );
  const totalExposure = useMemo(
    () => customers.reduce((sum, customer) => sum + (customer.credit_exposure ?? 0), 0),
    [customers],
  );

  const handleSubmit = (payload: CustomerFormData) => {
    if (editing) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editing.id ? updateCustomerRecord(customer, payload) : customer,
        ),
      );
    } else {
      setCustomers((current) => [createCustomerRecord(payload), ...current]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }

    setCustomers((current) =>
      current.map((customer) =>
        customer.id === deleteTarget.id ? softDeleteCustomer(customer) : customer,
      ),
    );
    setDeleteTarget(null);
  };

  const handleRestore = (target: CustomerRecord) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === target.id ? restoreCustomer(customer) : customer,
      ),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage customer billing profiles, credit exposure, and account lifecycle in one place.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            icon: <Building2 className="h-5 w-5 text-blue-600" />,
            label: "Total Customers",
            value: customers.length.toString(),
          },
          {
            icon: <Landmark className="h-5 w-5 text-amber-600" />,
            label: "Total Credit Limit",
            value: formatCurrency(totalCreditLimit),
          },
          {
            icon: <Wallet className="h-5 w-5 text-red-500" />,
            label: "Current Balance",
            value: formatCurrency(totalBalance),
          },
          {
            icon: <Wallet className="h-5 w-5 text-teal-600" />,
            label: "Credit Exposure",
            value: formatCurrency(totalExposure),
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-2 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                {item.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by company, TIN, address, or primary contact and narrow by customer status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CustomerStatus | "All Statuses")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_STATUS_FILTER_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredCustomers.length} customers
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[1720px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "#",
                "COMPANY NAME",
                "TIN",
                "BILLING ADDRESS",
                "PRIMARY CONTACT",
                "TERMS DAYS",
                "CREDIT LIMIT",
                "CURRENT BALANCE",
                "CREDIT EXPOSURE",
                "STATUS",
                "ARCHIVED AT",
                "CREATED AT",
                "ACTIONS",
              ].map((heading) => (
                <TableHead key={heading} className="px-4 py-3 text-[11px] font-semibold tracking-wide">
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {customer.company_name}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{customer.tin}</TableCell>
                <TableCell className="max-w-[260px] px-4 py-3 text-foreground">
                  <span className="line-clamp-2">{customer.billing_address || "—"}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {getPrimaryContactDisplay(customer)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatNumber(customer.payment_terms_days)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatCurrency(customer.credit_limit)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatCurrency(customer.current_balance)}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">
                  {formatCurrency(customer.credit_exposure)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={customer.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(customer.archived_at)}</TableCell>
                <TableCell className="px-4 py-3 text-foreground">{formatDate(customer.created_at)}</TableCell>
                <TableCell className="px-4 py-3">
                  <CustomerActionMenu
                    customer={customer}
                    onView={(selected) => navigate(`/customers/${selected.id}`)}
                    onUpdate={(selected) => {
                      setEditing(selected);
                      setModalOpen(true);
                    }}
                    onDelete={setDeleteTarget}
                    onRestore={handleRestore}
                  />
                </TableCell>
              </TableRow>
            ))}

            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No customers found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredCustomers.length}
          itemLabel="customers"
          onPageChange={setPage}
        />
      </Card>

      {modalOpen && (
        <CustomerFormModal
          customer={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete {deleteTarget?.company_name ?? "this customer"} and set
              `deleted_at` while keeping the record for audit history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
