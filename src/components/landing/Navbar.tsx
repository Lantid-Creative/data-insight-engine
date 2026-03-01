import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-sm font-black text-primary-foreground">DA</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Data<span className="text-gradient">Afro</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
          <ThemeToggle />
          <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-lg">
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3 overflow-hidden"
          >
            <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Features</a>
            <a href="#use-cases" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Use Cases</a>
            <a href="#pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Pricing</a>
            <a href="#faq" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>FAQ</a>
            <Link to="/login" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Log In</Link>
            <Button asChild className="w-full bg-gradient-primary text-primary-foreground">
              <Link to="/register">Get Started Free</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
