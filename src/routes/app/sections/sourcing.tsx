import { FileText, Users } from "lucide-react";
import PurchaseOrdersPage from "@/pages/purchase-order/PurchaseOrdersPage";
import SuppliersPage from "@/pages/supplier/SuppliersPage";
import type { RouteSection } from "../types";

export const sourcingRoutes: RouteSection = {
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
      element: <PurchaseOrdersPage />,
    },
  ],
};
