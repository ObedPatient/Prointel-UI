import { FileText, ScrollText } from "lucide-react";
import { placeholderRoute } from "@/routes/shared/placeholder-route";
import type { RouteSection } from "../types";

export const complianceRoutes: RouteSection = {
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
};
