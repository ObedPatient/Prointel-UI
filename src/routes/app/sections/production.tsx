import { AlertTriangle, ClipboardList, Cog, ScrollText } from "lucide-react";
import BillOfMaterialsPage from "@/pages/bill-of-material/BillOfMaterialsPage";
import ProductionCardsPage from "@/pages/production-card/ProductionCardsPage";
import QualityControlPage from "@/pages/quality-control/QualityControlPage";
import { placeholderRoute } from "@/routes/shared/placeholder-route";
import type { RouteSection } from "../types";

export const productionRoutes: RouteSection = {
  label: "PRODUCTION",
  routes: [
    {
      title: "Production Cards",
      path: "/production-cards",
      icon: Cog,
      element: <ProductionCardsPage />,
    },
    {
      title: "Bill of Materials",
      path: "/bill-of-materials",
      icon: ClipboardList,
      element: <BillOfMaterialsPage />,
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
      element: <QualityControlPage />,
    },
  ],
};
