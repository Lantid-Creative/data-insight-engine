import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-20 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-sm font-black text-primary-foreground">DA</span>
              </div>
              <span className="text-xl font-extrabold text-foreground">
                Data<span className="text-gradient">Afro</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs mb-6">
              AI-powered data intelligence for professionals. Upload anything, get everything — in seconds.
            </p>
            <div className="flex gap-3">
              {["X", "LI", "GH"].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-xs font-mono font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {social}
                </motion.a>
              ))}
            </div>
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
              <h4 className="text-xs font-mono uppercase tracking-[0.15em] font-bold mb-5 text-foreground">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-muted-foreground border-t border-border gap-4">
          <span>© 2026 DataAfro. All rights reserved.</span>
          <span className="text-primary/60">Built with fire 🔥</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
