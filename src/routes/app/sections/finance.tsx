import { BarChart3, FileCheck, Scale } from "lucide-react";
import { placeholderRoute } from "@/routes/shared/placeholder-route";
import type { RouteSection } from "../types";

export const financeRoutes: RouteSection = {
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
};
