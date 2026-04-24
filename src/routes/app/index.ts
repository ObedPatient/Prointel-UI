import { adminRoutes } from "./sections/admin";
import { complianceRoutes } from "./sections/compliance";
import { dispatchRoutes } from "./sections/dispatch";
import { financeRoutes } from "./sections/finance";
import { inventoryRoutes } from "./sections/inventory";
import { overviewRoutes } from "./sections/overview";
import { productionRoutes } from "./sections/production";
import { sourcingRoutes } from "./sections/sourcing";

export type { AppRoute, RouteSection } from "./types";

export const routeSections = [
  overviewRoutes,
  sourcingRoutes,
  inventoryRoutes,
  productionRoutes,
  dispatchRoutes,
  financeRoutes,
  complianceRoutes,
  adminRoutes,
];

export const appRoutes = routeSections.flatMap((section) => section.routes);
