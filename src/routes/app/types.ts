import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";

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
