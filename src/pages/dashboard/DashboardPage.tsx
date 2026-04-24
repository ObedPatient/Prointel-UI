import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  DollarSign,
  Factory,
  ShoppingCart,
} from "lucide-react";
import CostCompositionChart from "@/components/dashboard/CostCompositionChart";
import KpiCard from "@/components/dashboard/KpiCard";
import MarginByClientChart from "@/components/dashboard/MarginByClientChart";
import ProductionOutputChart from "@/components/dashboard/ProductionOutputChart";
import WastageChart from "@/components/dashboard/WastageChart";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manufacturing overview for Stepping Stone Ltd
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={<Briefcase className="h-4 w-4 text-blue-600" />}
          value="3"
          label="Active Jobs"
        />
        <KpiCard
          icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
          value="2"
          label="Pending POs"
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          value="3"
          label="Low Stock Items"
        />
        <KpiCard
          icon={<Factory className="h-4 w-4 text-teal-600" />}
          value="4,800"
          label="Today's Output"
          variant="teal"
        />
        <KpiCard
          icon={<CheckCircle className="h-4 w-4 text-teal-600" />}
          value="94.2%"
          label="QC Pass Rate"
          variant="teal"
        />
        <KpiCard
          icon={<DollarSign className="h-4 w-4 text-teal-600" />}
          value="24.8%"
          label="Avg Margin"
          variant="teal"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WastageChart />
        <ProductionOutputChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MarginByClientChart />
        <CostCompositionChart />
      </div>
    </div>
  );
}
