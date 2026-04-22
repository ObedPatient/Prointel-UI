import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingFooter from "./components/landing/LandingFooter";
import LandingNav from "./components/landing/LandingNav";
import AppLayout from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PlaceholderPage from "./pages/PlaceholderPage";
import TenantRegister from "./pages/TenantRegister";
import { appRoutes } from "./routes/routes";

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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={publicShell(<Login />)} />
        <Route path="/tenant-register" element={publicShell(<TenantRegister />)} />
        <Route path="/about" element={<PlaceholderPage title="About" />} />
        <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
        <Route path="/careers" element={<PlaceholderPage title="Careers" />} />
        <Route path="/changelog" element={<PlaceholderPage title="Changelog" />} />
        <Route path="/cookie-policy" element={<PlaceholderPage title="Cookie Policy" />} />
        <Route path="/forgot-password" element={publicShell(<PlaceholderPage title="Forgot Password" />)} />
        <Route path="/gdpr" element={<PlaceholderPage title="GDPR" />} />
        <Route path="/privacy-policy" element={<PlaceholderPage title="Privacy Policy" />} />
        <Route path="/terms-of-service" element={<PlaceholderPage title="Terms of Service" />} />
        <Route element={<AppLayout />}>
          {appRoutes.map((route) => (
            <Route key={route.path} path={route.path.slice(1)} element={route.element} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
