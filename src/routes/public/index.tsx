import type { ReactNode } from "react";
import LoginPage from "@/pages/auth/login/LoginPage";
import TenantRegisterPage from "@/pages/auth/tenant-register/TenantRegisterPage";
import LandingPage from "@/pages/marketing/landing/LandingPage";
import PlaceholderPage from "@/pages/marketing/placeholder/PlaceholderPage";

export interface PublicRoute {
  path: string;
  element: ReactNode;
  layout: "default" | "public-shell";
}

export const publicRoutes: PublicRoute[] = [
  {
    path: "/",
    element: <LandingPage />,
    layout: "default",
  },
  {
    path: "/login",
    element: <LoginPage />,
    layout: "public-shell",
  },
  {
    path: "/tenant-register",
    element: <TenantRegisterPage />,
    layout: "public-shell",
  },
  {
    path: "/about",
    element: <PlaceholderPage title="About" />,
    layout: "default",
  },
  {
    path: "/blog",
    element: <PlaceholderPage title="Blog" />,
    layout: "default",
  },
  {
    path: "/careers",
    element: <PlaceholderPage title="Careers" />,
    layout: "default",
  },
  {
    path: "/changelog",
    element: <PlaceholderPage title="Changelog" />,
    layout: "default",
  },
  {
    path: "/cookie-policy",
    element: <PlaceholderPage title="Cookie Policy" />,
    layout: "default",
  },
  {
    path: "/forgot-password",
    element: <PlaceholderPage title="Forgot Password" />,
    layout: "public-shell",
  },
  {
    path: "/gdpr",
    element: <PlaceholderPage title="GDPR" />,
    layout: "default",
  },
  {
    path: "/privacy-policy",
    element: <PlaceholderPage title="Privacy Policy" />,
    layout: "default",
  },
  {
    path: "/terms-of-service",
    element: <PlaceholderPage title="Terms of Service" />,
    layout: "default",
  },
];
