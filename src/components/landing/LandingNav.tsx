import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Cog, Menu, X } from "lucide-react";

interface NavLinkItem {
  label: string;
  href: string;
}

const navLinks: NavLinkItem[] = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) {
      return;
    }

    const elementId = location.hash.slice(1);

    const scrollToTarget = () => {
      const target = document.getElementById(elementId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToTarget);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  const handleSectionNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    setOpen(false);

    if (location.pathname === "/") {
      const target = document.getElementById(href.slice(1));
      if (target) {
        window.history.replaceState(null, "", href);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    navigate(`/${href}`);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
            <Cog className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1a2744] tracking-tight">ProdIntel</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => handleSectionNavigation(event, link.href)}
              className="text-sm font-medium text-slate-600 hover:text-[#3b82f6] transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-[#1a2744] border-2 border-[#1a2744] rounded-lg hover:bg-[#1a2744] hover:text-white transition-all"
          >
            Log in
          </Link>
          <Link to="/tenant-register"
            className="px-4 py-2 text-sm font-semibold bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-200">
            Register a tenant
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => handleSectionNavigation(event, link.href)}
              className="block text-sm font-medium text-slate-600 hover:text-[#3b82f6]">{link.label}</a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="w-full py-2 text-center text-sm font-semibold border-2 border-[#1a2744] rounded-lg"
            >
              Log in
            </Link>
            <Link to="/tenant-register" onClick={() => setOpen(false)}
              className="w-full py-2 text-sm font-semibold bg-[#3b82f6] text-white rounded-lg text-center">Register a tenant</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
