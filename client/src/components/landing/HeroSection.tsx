import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroPerson from "@/assets/hero-person.jpg";

const HeroSection = () => (
  <section className="relative min-h-[96vh] flex items-center overflow-hidden bg-background">
    {/* Layered background */}
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, hsl(155 82% 18% / 0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 10% 80%, hsl(142 65% 42% / 0.05) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(220 30% 10%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 30% 10%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>

    <div className="container relative z-10 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/7 mb-8"
          >
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[11px] font-body font-semibold text-primary tracking-widest uppercase">
              Trusted by 1,200+ investors
            </span>
          </motion.div>

          <h1 className="font-heading text-[3.25rem] sm:text-[4rem] lg:text-[4.5rem] leading-[1.05] text-foreground mb-6">
            Grow your{" "}
            <span
              style={{
                WebkitTextFillColor: "transparent",
                WebkitBackgroundClip: "text",
                backgroundImage:
                  "linear-gradient(135deg, hsl(155 82% 18%) 0%, hsl(142 65% 38%) 100%)",
                backgroundClip: "text",
              }}
            >
              investments
            </span>{" "}
            with clarity.
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed font-body font-light mb-8 max-w-md">
            Track your investments and returns in a simple, transparent way.
            Invest via QR code, get admin-verified in 24 hours, and watch your
            money grow — all in one place.
          </p>

          {/* Trust bullets */}
          <div className="flex flex-col gap-2.5 mb-10">
            {[
              "Invest with a simple QR payment",
              "Admin-verified, no automation surprises",
              "Real-time return tracking on your dashboard",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-sm font-body text-muted-foreground">{point}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button
                size="lg"
                className="group px-7 h-12 text-base font-body font-medium rounded-xl shadow-elevated hover:shadow-hover transition-shadow"
              >
                Start Investing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base font-body font-medium rounded-xl border-border text-muted-foreground hover:text-foreground"
              >
                Login to Account
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 pt-8 border-t border-border/60 flex items-center gap-6 flex-wrap"
          >
            {[
              { value: "₹4.2Cr+", label: "Total Invested" },
              { value: "15.2%", label: "Avg. Return Rate" },
              { value: "1,200+", label: "Active Investors" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-xl font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — image with floating cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          {/* Main image */}
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] max-w-[440px] ml-auto shadow-hover">
            <img
              src={heroPerson}
              alt="Investor using Growvest"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-background/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <p className="text-white text-sm font-body font-medium">Portfolio Overview</p>
                <p className="text-white/70 text-xs font-body mt-0.5">8 investments active</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[72%] bg-secondary rounded-full" />
                  </div>
                  <span className="text-white text-xs font-body font-semibold">72%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating card — top left */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="absolute -left-12 top-16 bg-white border border-border rounded-2xl p-4 shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 6l-9.5 9.5-5-5L1 18" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">Returns</p>
                <p className="text-base font-heading font-bold text-foreground">+15.2%</p>
              </div>
            </div>
          </motion.div>

          {/* Floating card — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="absolute -right-8 bottom-24 bg-white border border-border rounded-2xl p-4 shadow-elevated"
          >
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">Last Investment</p>
            <p className="text-lg font-heading font-bold text-primary mt-0.5">₹5,000</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="text-[10px] font-body text-muted-foreground">Approved · 2h ago</span>
            </div>
          </motion.div>

          {/* Floating card — mid right */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute -right-6 top-20 bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-elevated"
          >
            <p className="text-xs font-body opacity-70">Investors</p>
            <p className="text-lg font-heading font-bold">1,200+</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
