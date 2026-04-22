import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  ClipboardList,
  Cog,
  FileCheck,
  FileText,
  LayoutDashboard,
  Package,
  Scale,
  ScrollText,
  Truck,
  Users,
} from "lucide-react";
import Dashboard from "../pages/Dashboard";
import CompanySettings from "../pages/CompanySettings";
import Landing from "../pages/Landing";
import PlaceholderPage from "../pages/PlaceholderPage";
import SuppliersPage from "../pages/Suppliers";

export interface AppRoute {
  title: string;
  path: string;
  icon: LucideIcon;
  element: ReactElement;
  index?: boolean;
}

export interface RouteSection {
  label: string;
  routes: AppRoute[];
}

function placeholderRoute(title: string): ReactElement {
  return <PlaceholderPage title={title} />;
}

export const routeSections: RouteSection[] = [
  {
    label: "OVERVIEW",
    routes: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        element: <Dashboard />,
      },
    ],
  },
  {
    label: "SOURCING",
    routes: [
      {
        title: "Suppliers",
        path: "/suppliers",
        icon: Users,
        element: <SuppliersPage />,
      },
      {
        title: "Purchase Orders",
        path: "/purchase-orders",
        icon: FileText,
        element: placeholderRoute("Purchase Orders"),
      },
    ],
  },
  {
    label: "INVENTORY",
    routes: [
      {
        title: "Stock Cards",
        path: "/stock-cards",
        icon: ClipboardList,
        element: placeholderRoute("Stock Cards"),
      },
      {
        title: "Goods Received",
        path: "/goods-received",
        icon: Package,
        element: placeholderRoute("Goods Received"),
      },
    ],
  },
  {
    label: "PRODUCTION",
    routes: [
      {
        title: "Production Cards",
        path: "/production-cards",
        icon: Cog,
        element: placeholderRoute("Production Cards"),
      },
      {
        title: "Machine Logs",
        path: "/machine-logs",
        icon: ScrollText,
        element: placeholderRoute("Machine Logs"),
      },
      {
        title: "Quality Control",
        path: "/quality-control",
        icon: AlertTriangle,
        element: placeholderRoute("Quality Control"),
      },
    ],
  },
  {
    label: "DISPATCH",
    routes: [
      {
        title: "Finished Goods",
        path: "/finished-goods",
        icon: Package,
        element: placeholderRoute("Finished Goods"),
      },
      {
        title: "Delivery Notes",
        path: "/delivery-notes",
        icon: Truck,
        element: placeholderRoute("Delivery Notes"),
      },
    ],
  },
  {
    label: "FINANCE",
    routes: [
      {
        title: "Job Costing",
        path: "/job-costing",
        icon: BarChart3,
        element: placeholderRoute("Job Costing"),
      },
      {
        title: "Reconciliation",
        path: "/reconciliation",
        icon: Scale,
        element: placeholderRoute("Reconciliation"),
      },
      {
        title: "Reports",
        path: "/reports",
        icon: FileCheck,
        element: placeholderRoute("Reports"),
      },
    ],
  },
  {
    label: "EAC COMPLIANCE",
    routes: [
      {
        title: "Duty Remission",
        path: "/duty-remission",
        icon: FileText,
        element: placeholderRoute("Duty Remission"),
      },
      {
        title: "Waste & Bond",
        path: "/waste-bond",
        icon: ScrollText,
        element: placeholderRoute("Waste & Bond"),
      },
    ],
  },
  {
    label: "ADMIN",
    routes: [
      {
        title: "Company Settings",
        path: "/company-settings",
        icon: Building2,
        element: <CompanySettings />,
      },
    ],
  },
];

export const appRoutes = routeSections.flatMap((section) => section.routes);

export const publicRoutes: AppRoute[] = [
  {
    title: "Landing",
    path: "/",
    icon: LayoutDashboard,
    element: <Landing />,
    index: true,
  },
];
