import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border bg-hero">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-xs font-black text-primary-foreground">DA</span>
              </div>
              <span className="text-lg font-extrabold" style={{ color: "hsl(0 0% 90%)" }}>
                Data<span className="text-gradient">Afro</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 45%)" }}>
              AI-powered data intelligence. Upload anything, get everything.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "API Docs", "Changelog"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-mono uppercase tracking-[0.15em] font-bold mb-4" style={{ color: "hsl(0 0% 50%)" }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm transition-colors hover:text-primary" style={{ color: "hsl(0 0% 40%)" }}>{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 text-center text-xs font-mono" style={{ color: "hsl(0 0% 30%)", borderTop: "1px solid hsl(0 0% 12%)" }}>
          © 2026 DataAfro. Built with fire. 🔥
        </div>
      </div>
    </footer>
  );
};

export default Footer;
