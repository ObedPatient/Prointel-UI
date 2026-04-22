import React from "react";
import { Cog } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface FooterColumn {
  title: string;
  links: Array<{
    href: string;
    label: string;
    type: "anchor" | "route";
  }>;
}

const footerCols: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features", type: "anchor" },
      { href: "/login", label: "Log in", type: "route" },
      { href: "/dashboard", label: "Demo", type: "route" },
      { href: "/changelog", label: "Changelog", type: "route" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#about", label: "About", type: "anchor" },
      { href: "#contact", label: "Contact", type: "anchor" },
      { href: "/careers", label: "Careers", type: "route" },
      { href: "/blog", label: "Blog", type: "route" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy", type: "route" },
      { href: "/terms-of-service", label: "Terms of Service", type: "route" },
      { href: "/gdpr", label: "GDPR", type: "route" },
      { href: "/cookie-policy", label: "Cookie Policy", type: "route" },
    ],
  },
];

const LandingFooter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socialLinks = [
    { href: "/about", label: "in" },
    { href: "/blog", label: "tw" },
    { href: "/changelog", label: "gh" },
  ];

  const handleAnchorNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();

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
    <footer id="contact" className="scroll-mt-24 bg-[#0a1628] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
                <Cog className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ProdIntel</span>
            </Link>
            <p className="text-blue-200/50 text-sm leading-relaxed max-w-xs">
              Manufacturing intelligence for the modern factory. Know your costs, grow your margins.
            </p>
            {/* Social placeholders */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  to={social.href}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-blue-300/60 transition-colors hover:bg-white/10"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Columns */}
          {footerCols.map((column) => (
            <div key={column.title}>
              <p className="text-white font-semibold text-sm mb-4">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.type === "anchor" ? (
                      <a
                        href={link.href}
                        onClick={(event) => handleAnchorNavigation(event, link.href)}
                        className="text-blue-200/50 text-sm hover:text-blue-300 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-blue-200/50 text-sm hover:text-blue-300 transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-blue-200/30 text-xs">© 2026 ProdIntel. All rights reserved.</p>
          <p className="text-blue-200/30 text-xs">Built for manufacturers.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
