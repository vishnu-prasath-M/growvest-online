import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ZenvestLogo from "./ZenvestLogo";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Security", href: "#trust" },
  ];

  const handleInvestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
    } else {
      navigate("/invest");
    }
  };

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_16px_rgba(0,0,0,0.05)]"
          : "bg-background/80 backdrop-blur-lg border-b border-transparent"
      }`}
    >
      <div className="container flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center">
          <ZenvestLogo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-accent font-body"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={handleInvestClick} className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs border border-primary/20 bg-transparent shadow-sm hover:bg-primary/5 hover:text-primary rounded-xl font-body font-medium gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Invest
          </button>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="group rounded-xl font-body font-medium px-5">
                Dashboard
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="sm" className="group rounded-xl font-body font-medium px-5">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground rounded-xl hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl px-6 pb-6 pt-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground py-3 px-3 rounded-xl hover:bg-accent hover:text-foreground transition-colors font-body"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border mt-2">
            <button onClick={handleInvestClick} className="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-xl px-3 text-xs border border-primary/20 text-primary bg-transparent shadow-sm hover:bg-primary/5 hover:text-primary font-body font-medium w-full">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Invest
            </button>
            {user ? (
              <Link to="/dashboard" className="col-span-2">
                <Button className="w-full rounded-xl" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register" className="col-span-2">
                <Button className="w-full rounded-xl" size="sm">
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 mt-20">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-heading font-bold text-foreground">Login Required</h2>
              <p className="text-sm font-body text-muted-foreground mt-2">
                Please log in before making an investment.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full rounded-xl font-body"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full rounded-xl font-body"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
