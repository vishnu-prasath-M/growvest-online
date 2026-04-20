import { Link } from "react-router-dom";
import ZenvestLogo from "./ZenvestLogo";

const Footer = () => (
  <footer className="bg-foreground">
    <div className="container py-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-12 border-b border-background/10">
        {/* Brand column */}
        <div className="md:col-span-5">
          <div className="flex items-center mb-5">
            <ZenvestLogo size="lg" />
          </div>
          <p className="text-sm font-body text-background/80 max-w-xs leading-relaxed mb-8">
            A transparent investment tracking platform. Enter your amount, pay via QR,
            and track your returns — all verified by our team.
          </p>

          <p className="text-xs font-body font-semibold text-background/90 uppercase tracking-wider mb-3">
            Stay Updated
          </p>
          <div className="flex gap-2 max-w-xs">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-background/10 border border-background/20 rounded-xl px-4 py-2.5 text-sm font-body text-background placeholder:text-background/60 focus:outline-none focus:border-primary/80 transition-colors"
            />
            <button className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-body font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
              Join
            </button>
          </div>
        </div>

        {/* Platform */}
        <div className="md:col-span-2">
          <h4 className="font-body font-semibold text-xs text-background/90 uppercase tracking-wider mb-5">
            Platform
          </h4>
          <ul className="space-y-3.5">
            <li>
              <Link to="/about" className="text-sm font-body text-background/70 hover:text-background transition-colors">
                About Us
              </Link>
            </li>
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Security", href: "#trust" },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm font-body text-background/70 hover:text-background transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div className="md:col-span-2">
          <h4 className="font-body font-semibold text-xs text-background/90 uppercase tracking-wider mb-5">
            Account
          </h4>
          <ul className="space-y-3.5">
            {[
              { label: "Login", to: "/login" },
              { label: "Register", to: "/register" },
              { label: "Invest", to: "/invest" },
              { label: "My Dashboard", to: "/dashboard" },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm font-body text-background/70 hover:text-background transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="md:col-span-3">
          <h4 className="font-body font-semibold text-xs text-background/90 uppercase tracking-wider mb-5">
            Legal & Support
          </h4>
          <ul className="space-y-3.5">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((l) => (
              <li key={l}>
                <a href="#" className="text-sm font-body text-background/70 hover:text-background transition-colors">{l}</a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-2 p-3 rounded-xl bg-background/10 border border-background/20">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-body text-background/80">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-body text-background/60">
          © {new Date().getFullYear()} Growvest. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Cookies"].map((l) => (
            <a key={l} href="#" className="text-xs font-body text-background/60 hover:text-background/90 transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
