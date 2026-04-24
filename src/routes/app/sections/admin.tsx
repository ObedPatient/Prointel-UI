import { Building2 } from "lucide-react";
import CompanySettingsPage from "@/pages/admin/company-settings/CompanySettingsPage";
import type { RouteSection } from "../types";

export const adminRoutes: RouteSection = {
  label: "ADMIN",
  routes: [
    {
      title: "Company Settings",
      path: "/company-settings",
      icon: Building2,
      element: <CompanySettingsPage />,
    },
  ],
};
