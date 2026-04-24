import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Factory, PackageCheck, TriangleAlert, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadProductionCards, saveProductionCards } from "@/lib/production-cards";
import type { ProductionCard, ProductionCardStatus } from "@/types/production-card";

const STATUS_TONES: Record<ProductionCardStatus, string> = {
  Draft: "border-slate-300 bg-slate-100 text-slate-700",
  "In Production": "border-blue-200 bg-blue-100 text-blue-700",
  "QC Review": "border-violet-200 bg-violet-100 text-violet-700",
  "Materials Confirmed": "border-amber-200 bg-amber-100 text-amber-700",
  Completed: "border-green-200 bg-green-100 text-green-700",
  Cancelled: "border-red-200 bg-red-100 text-red-700",
};

const STATUS_FLOW: ProductionCardStatus[] = [
  "Draft",
  "Materials Confirmed",
  "In Production",
  "QC Review",
  "Completed",
];

function formatCurrency(value: number): string {
  return `RWF ${value.toLocaleString()}`;
}

function formatDate(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA");
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Factory;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductionCardDetails() {
  const { cardId = "" } = useParams();
  const [cards, setCards] = useState<ProductionCard[]>(() => loadProductionCards());

  useEffect(() => {
    saveProductionCards(cards);
  }, [cards]);

  const card = useMemo(
    () => cards.find((item) => item.id === cardId),
    [cardId, cards],
  );

  const ordered = card?.target_quantity ?? 0;
  const netGood = card?.actual_output_quantity ?? 0;
  const totalCost =
    (card?.total_material_cost ?? 0) +
    (card?.total_machine_cost ?? 0) +
    (card?.total_wastage_cost ?? 0) +
    (card?.total_rework_cost ?? 0);
  const progress = ordered > 0 ? Math.min(100, Math.round((netGood / ordered) * 100)) : 0;
  const wastageRate = ordered > 0 ? (((ordered - netGood) / ordered) * 100).toFixed(1) : "0.0";

  const updateStatus = (status: ProductionCardStatus) => {
    if (!card) {
      return;
    }

    setCards((current) =>
      current.map((item) => (item.id === card.id ? { ...item, status } : item)),
    );
  };

  if (!card) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/production-cards">
            <ArrowLeft className="h-4 w-4" />
            Back to Production Cards
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Production card not found</CardTitle>
            <CardDescription>
              The requested production card could not be loaded from local storage.
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
            <Link to="/production-cards">
              <ArrowLeft className="h-4 w-4" />
              Back to Production Cards
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{card.job_number}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review output, cost, and order linkage for this production job.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[card.status]}`}
        >
          {card.status}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Status Flow</CardTitle>
          <CardDescription>Quickly move the card through the core production checkpoints.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((status) => (
            <Button
              key={status}
              type="button"
              variant={card.status === status ? "default" : "outline"}
              onClick={() => updateStatus(status)}
            >
              {status}
            </Button>
          ))}
          <Button
            type="button"
            variant={card.status === "Cancelled" ? "destructive" : "outline"}
            onClick={() => updateStatus("Cancelled")}
          >
            Cancelled
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Factory} label="Target Quantity" value={ordered.toLocaleString()} />
        <StatCard icon={PackageCheck} label="Net Good Output" value={netGood.toLocaleString()} />
        <StatCard icon={TriangleAlert} label="Wastage" value={`${wastageRate}%`} />
        <StatCard icon={Wallet} label="Total Cost" value={formatCurrency(totalCost)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Job Summary</CardTitle>
            <CardDescription>Production and costing details for this customer order.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Customer</p>
              <p className="mt-1 text-foreground">{card.customer_id || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sales Order</p>
              <p className="mt-1 text-foreground">{card.customer_order_id || "Ad-hoc"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Product Category</p>
              <p className="mt-1 text-foreground">{card.product_category_id || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Bill of Materials</p>
              <p className="mt-1 text-foreground">{card.bill_of_materials_id || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Start Date</p>
              <p className="mt-1 text-foreground">{formatDate(card.start_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Target Completion</p>
              <p className="mt-1 text-foreground">{formatDate(card.target_completion_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Agreed Selling Price</p>
              <p className="mt-1 text-foreground">{formatCurrency(card.agreed_selling_price)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created At</p>
              <p className="mt-1 text-foreground">{formatDate(card.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
            <CardDescription>Snapshot of the current job economics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Material Cost</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(card.total_material_cost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Machine Cost</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(card.total_machine_cost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wastage Cost</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(card.total_wastage_cost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rework Cost</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(card.total_rework_cost)}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{progress}% output completion</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
