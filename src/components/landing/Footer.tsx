import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-xs font-black text-primary-foreground">DA</span>
              </div>
              <span className="text-lg font-extrabold text-foreground">
                Data<span className="text-gradient">Afro</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI-powered data intelligence. Upload anything, get everything.
            </p>
          </div>
          {[
            { title: "Product", links: [
              { label: "Features", to: "/#features" },
              { label: "Pricing", to: "/#pricing" },
              { label: "API Docs", to: "/api-docs" },
              { label: "Changelog", to: "/changelog" },
            ]},
            { title: "Company", links: [
              { label: "About", to: "/about" },
              { label: "Blog", to: "/blog" },
              { label: "Careers", to: "/careers" },
              { label: "Contact", to: "/contact" },
            ]},
            { title: "Legal", links: [
              { label: "Privacy", to: "/privacy" },
              { label: "Terms", to: "/terms" },
              { label: "Security", to: "/security" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-mono uppercase tracking-[0.15em] font-bold mb-4 text-muted-foreground">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 text-center text-xs font-mono text-muted-foreground border-t border-border">
          © 2026 DataAfro. Built with fire. 🔥
        </div>
      </div>
    </footer>
  );
};

export default Footer;
