import { Building2, FileSearch, FileText, ShoppingCart, Users } from "lucide-react";
import CustomersPage from "@/pages/customer/CustomersPage";
import PurchaseOrdersPage from "@/pages/purchase-order/PurchaseOrdersPage";
import RequestForQuotationsPage from "@/pages/request-for-quotation/RequestForQuotationsPage";
import SalesOrdersPage from "@/pages/sales-order/SalesOrdersPage";
import SuppliersPage from "@/pages/supplier/SuppliersPage";
import type { RouteSection } from "../types";

export const sourcingRoutes: RouteSection = {
  label: "SOURCING",
  routes: [
    {
      title: "Customers",
      path: "/customers",
      icon: Building2,
      element: <CustomersPage />,
    },
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
    {
      title: "RFQs",
      path: "/request-for-quotations",
      icon: FileSearch,
      element: <RequestForQuotationsPage />,
    },
    {
      title: "Sales Orders",
      path: "/sales-orders",
      icon: ShoppingCart,
      element: <SalesOrdersPage />,
    },
  ],
};
