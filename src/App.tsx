import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingFooter from "./components/landing/LandingFooter";
import LandingNav from "./components/landing/LandingNav";
import AppLayout from "./components/layout/AppLayout";
import BillOfMaterialDetailsPage from "./pages/bill-of-material/BillOfMaterialDetailsPage";
import GoodReceiptNoteDetailsPage from "./pages/good-receipt-note/GoodReceiptNoteDetailsPage";
import MaterialDetailsPage from "./pages/material/MaterialDetailsPage";
import ProductDetailsPage from "./pages/product/ProductDetailsPage";
import ProductionCardDetailsPage from "./pages/production-card/ProductionCardDetailsPage";
import PurchaseOrderDetailsPage from "./pages/purchase-order/PurchaseOrderDetailsPage";
import SupplierDetailsPage from "./pages/supplier/SupplierDetailsPage";
import { appRoutes } from "./routes/app";
import { publicRoutes } from "./routes/public";

export default function App() {
  const publicShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-slate-50 text-[#1a2744]">
      <LandingNav />
      <main className="px-6 pb-16 pt-24">{content}</main>
      <LandingFooter />
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.layout === "public-shell" ? publicShell(route.element) : route.element}
          />
        ))}

        <Route element={<AppLayout />}>
          {appRoutes.map((route) => (
            <Route key={route.path} path={route.path.slice(1)} element={route.element} />
          ))}
          <Route path="bill-of-materials/:bomId" element={<BillOfMaterialDetailsPage />} />
          <Route path="goods-received/:grnId" element={<GoodReceiptNoteDetailsPage />} />
          <Route path="materials/:materialId" element={<MaterialDetailsPage />} />
          <Route path="products/:productId" element={<ProductDetailsPage />} />
          <Route path="production-cards/:cardId" element={<ProductionCardDetailsPage />} />
          <Route path="purchase-orders/:poNumber" element={<PurchaseOrderDetailsPage />} />
          <Route path="suppliers/:supplierId" element={<SupplierDetailsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
