import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Pencil,
  Phone,
  Star,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SupplierFormModal from "@/components/supplier/SupplierFormModal";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSupplierRecord,
  loadSuppliers,
  saveSuppliers,
} from "@/lib/suppliers";
import type { Supplier, SupplierRecord } from "@/types/supplier";

const SUPPLIER_PROFILE_META: Record<
  string,
  {
    address: string;
  }
> = {
  "supplier-001": {
    address: "Kigali Special Economic Zone, Gasabo, Kigali",
  },
  "supplier-002": {
    address: "Masoro Industrial Park, Gasabo, Kigali",
  },
  "supplier-003": {
    address: "Gikondo Logistics Yard, Kicukiro, Kigali",
  },
};

function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

function formatCurrency(value: number | null): string {
  return value == null ? "—" : `$${value.toLocaleString()}`;
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function SupplierStateBadge({ status }: { status: string }) {
  const map: Record<string, { icon: typeof CheckCircle; cls: string; label: string }> = {
    Active: {
      icon: CheckCircle,
      cls: "bg-green-50 text-green-700 border-green-200",
      label: "Active Supplier",
    },
    Inactive: {
      icon: AlertCircle,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Inactive Supplier",
    },
    Archived: {
      icon: XCircle,
      cls: "bg-red-50 text-red-700 border-red-200",
      label: "Archived Supplier",
    },
  };
  const config = map[status] ?? {
    icon: AlertCircle,
    cls: "bg-muted text-muted-foreground border-border",
    label: status,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function ScoreMeter({ value, label }: { value: number | null; label: string }) {
  const barTone =
    value == null
      ? "bg-slate-300"
      : value >= 85
        ? "bg-green-500"
        : value >= 70
          ? "bg-amber-500"
          : "bg-red-500";
  const textTone =
    value == null
      ? "text-muted-foreground"
      : value >= 85
        ? "text-green-600"
        : value >= 70
          ? "text-amber-500"
          : "text-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-sm font-bold ${textTone}`}>{value != null ? `${value}%` : "—"}</span>
      </div>
      {value != null && (
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className={`h-full rounded-full ${barTone}`} style={{ width: `${value}%` }} />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: typeof Clock;
  label: string;
  value: string | null;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-bold text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function getProfileMeta(supplier: SupplierRecord) {
  return (
    SUPPLIER_PROFILE_META[supplier.id] ?? {
      address: "Kigali, Rwanda",
    }
  );
}

export default function SupplierDetails() {
  const { supplierId = "" } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => loadSuppliers());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    saveSuppliers(suppliers);
  }, [suppliers]);

  const supplier = useMemo(
    () => suppliers.find((item) => item.id === supplierId),
    [supplierId, suppliers],
  );

  const profileMeta = supplier ? getProfileMeta(supplier) : null;

  const radialData = supplier
    ? [{ name: "score", value: supplier.performance_rating ?? 0, fill: "#f59e0b" }]
    : [];

  const comparisonData = supplier
    ? [
        { metric: "On-Time", value: supplier.on_time_delivery_rate ?? 0, fill: "#0f766e" },
        { metric: "Score", value: supplier.performance_rating ?? 0, fill: "#2563eb" },
        { metric: "Rejection", value: supplier.quality_rejection_rate ?? 0, fill: "#dc2626" },
      ]
    : [];

  const handleSubmit = (payload: Supplier) => {
    if (!supplier) {
      return;
    }

    setSuppliers((current) =>
      current.map((item) =>
        item.id === supplier.id ? createSupplierRecord(item.id, payload) : item,
      ),
    );
    setEditing(false);
  };

  const handleDelete = () => {
    if (!supplier) {
      return;
    }

    const nextSuppliers = suppliers.filter((item) => item.id !== supplier.id);
    setSuppliers(nextSuppliers);
    saveSuppliers(nextSuppliers);
    navigate("/suppliers");
  };

  if (!supplier || !profileMeta) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/suppliers">
            <ArrowLeft className="h-4 w-4" />
            Back to Suppliers
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Supplier not found</CardTitle>
            <CardDescription>
              The requested supplier could not be loaded from local storage.
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
            <Link to="/suppliers">
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {supplier.company_name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <SupplierStateBadge status={supplier.status} />
            {supplier.category && (
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                {supplier.category}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{profileMeta.address}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Lead Time"
          value={
            supplier.average_lead_time_days != null
              ? `${supplier.average_lead_time_days} days`
              : null
          }
          iconColor="text-blue-600"
        />
        <StatCard
          icon={CreditCard}
          label="Credit Limit"
          value={formatCurrency(supplier.credit_limit)}
          iconColor="text-violet-600"
        />
        <StatCard
          icon={Star}
          label="Score"
          value={formatNumber(supplier.performance_rating)}
          iconColor="text-amber-500"
        />
        <StatCard
          icon={Phone}
          label="Contact Phone"
          value={supplier.primary_contact_phone || null}
          iconColor="text-teal-600"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Contact & Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">
                  {supplier.category || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">TIN</span>
                <span className="font-medium text-foreground">{supplier.tin}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Contact Person</span>
                <span className="font-medium text-foreground">
                  {supplier.primary_contact_name || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">
                  {supplier.primary_contact_phone || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Payment Terms</span>
                <span className="font-medium text-foreground">
                  {supplier.payment_terms || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Payment Days</span>
                <span className="font-medium text-foreground">
                  {supplier.payment_days != null ? `${supplier.payment_days} days` : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(supplier.current_balance)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Available Credit</span>
                <span className="font-medium text-foreground">
                  {supplier.credit_limit != null && supplier.current_balance != null
                    ? formatCurrency(supplier.credit_limit - supplier.current_balance)
                    : "—"}
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Performance Metrics</CardTitle>
            <CardDescription>
              Health indicators for service quality and delivery consistency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ScoreMeter value={supplier.performance_rating} label="Overall Score" />
            <ScoreMeter value={supplier.on_time_delivery_rate} label="On-Time Delivery" />
            <ScoreMeter
              value={supplier.quality_rejection_rate == null ? null : 100 - supplier.quality_rejection_rate}
              label="Quality Acceptance"
            />

            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Supplier Score</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="58%"
                      outerRadius="100%"
                      barSize={16}
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarGrid gridType="circle" radialLines={false} stroke="none" />
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={10} />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-xl font-bold"
                      >
                        {supplier.performance_rating ?? 0}%
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Metric Comparison
                </p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} barSize={30}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis
                        dataKey="metric"
                        tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Value"]}
                        contentStyle={{ borderRadius: 10, fontSize: 12 }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {comparisonData.map((item) => (
                          <Cell key={item.metric} fill={item.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-xl xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Commercial Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Current Balance
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">
                {formatCurrency(supplier.current_balance)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Credit Limit
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">
                {formatCurrency(supplier.credit_limit)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">
                {formatDate(supplier.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Status Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current Status</span>
              <span className="font-medium text-foreground">{supplier.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-medium text-foreground">{formatDate(supplier.created_at)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Archived At</span>
              <span className="font-medium text-foreground">{formatDate(supplier.archived_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {editing && (
        <SupplierFormModal
          supplier={supplier}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{supplier.company_name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
