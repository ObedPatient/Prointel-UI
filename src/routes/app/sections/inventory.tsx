import { ClipboardList, Package } from "lucide-react";
import GoodsReceivedPage from "@/pages/good-receipt-note/GoodsReceivedPage";
import MaterialsPage from "@/pages/material/MaterialsPage";
import ProductsPage from "@/pages/product/ProductsPage";
import StockCardsPage from "@/pages/stock-card/StockCardsPage";
import type { RouteSection } from "../types";

export const inventoryRoutes: RouteSection = {
  label: "INVENTORY",
  routes: [
    {
      title: "Materials",
      path: "/materials",
      icon: Package,
      element: <MaterialsPage />,
    },
    {
      title: "Products",
      path: "/products",
      icon: ClipboardList,
      element: <ProductsPage />,
    },
    {
      title: "Stock Cards",
      path: "/stock-cards",
      icon: ClipboardList,
      element: <StockCardsPage />,
    },
    {
      title: "Goods Received",
      path: "/goods-received",
      icon: Package,
      element: <GoodsReceivedPage />,
    },
  ],
};
