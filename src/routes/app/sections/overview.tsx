import { LayoutDashboard } from "lucide-react";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import type { RouteSection } from "../types";

export const overviewRoutes: RouteSection = {
  label: "OVERVIEW",
  routes: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      element: <DashboardPage />,
    },
  ],
};
