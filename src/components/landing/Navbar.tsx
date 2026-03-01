import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-sm font-black text-primary-foreground">DA</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Data<span className="text-gradient">Afro</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <Link to="/login" className="hover:text-foreground transition-colors">Log In</Link>
          <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3 animate-slide-up">
          <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Features</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Pricing</a>
          <Link to="/login" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Log In</Link>
          <Button asChild className="w-full bg-gradient-primary text-primary-foreground">
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
