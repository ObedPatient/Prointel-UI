import { Package, Truck } from "lucide-react";
import { placeholderRoute } from "@/routes/shared/placeholder-route";
import type { RouteSection } from "../types";

export const dispatchRoutes: RouteSection = {
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
};
