import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/* Realistic UI preview cards shown in the section */
const previewCards = [
  { label: "Total Invested", value: "₹1,24,000", change: "+₹8,000 this month", positive: true },
  { label: "Total Earnings", value: "₹18,600", change: "+15% return rate", positive: true },
  { label: "Current Balance", value: "₹1,42,600", change: "Verified today", positive: null },
];

const miniStats = [
  { label: "Pending", value: "₹5,000", badge: "Awaiting" },
  { label: "Withdrawn", value: "₹12,000", badge: "Processed" },
];

const DashboardPreviewSection = () => (
  <section className="py-28 bg-card overflow-hidden">
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-secondary mb-4"
          >
            Your Dashboard
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl text-foreground leading-[1.1] mb-6"
          >
            Every rupee,{" "}
            <span className="italic">perfectly tracked</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base font-body text-muted-foreground leading-relaxed mb-8 max-w-md"
          >
            Your personal investment dashboard gives you a real-time view of your
            portfolio — total invested, returns earned, and balance available to
            withdraw, all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
          >
            <Link to="/register">
              <Button className="group rounded-xl font-body font-medium px-7 h-12 shadow-elevated hover:shadow-hover transition-shadow">
                Open Your Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right — UI preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Mock dashboard card */}
          <div className="rounded-[2rem] border border-border bg-background shadow-hover p-6 relative overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-body text-muted-foreground">Welcome back</p>
                <p className="text-base font-heading font-bold text-foreground">Arjun Mehta</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs font-body font-bold text-primary">A</span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {previewCards.map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-2">
                    {c.label}
                  </p>
                  <p className="text-lg font-heading font-bold text-foreground">{c.value}</p>
                  <p
                    className={`text-[10px] font-body mt-1 ${
                      c.positive === true
                        ? "text-secondary"
                        : c.positive === false
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {c.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini stats row */}
            <div className="flex gap-3 mb-5">
              {miniStats.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-2xl bg-accent border border-border px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] font-body text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-heading font-bold text-foreground">{s.value}</p>
                  </div>
                  <span className="text-[9px] font-body font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Transaction rows */}
            <div className="space-y-2">
              {[
                { label: "Investment Added", amount: "+₹5,000", date: "Apr 10", status: "Approved" },
                { label: "Investment Added", amount: "+₹3,000", date: "Apr 05", status: "Pending" },
                { label: "Withdrawal", amount: "-₹2,000", date: "Mar 28", status: "Processed" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 border border-border"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                        t.amount.startsWith("+") ? "bg-secondary/12" : "bg-destructive/10"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold ${
                          t.amount.startsWith("+") ? "text-secondary" : "text-destructive"
                        }`}
                      >
                        {t.amount.startsWith("+") ? "↑" : "↓"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-body font-medium text-foreground">{t.label}</p>
                      <p className="text-[10px] font-body text-muted-foreground">{t.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-body font-semibold ${
                        t.amount.startsWith("+") ? "text-secondary" : "text-destructive"
                      }`}
                    >
                      {t.amount}
                    </p>
                    <span
                      className={`text-[9px] font-body px-1.5 py-0.5 rounded-full ${
                        t.status === "Approved" || t.status === "Processed"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating accent */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-4 -left-6 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-elevated"
          >
            <p className="text-xs font-body opacity-70">Return Rate</p>
            <p className="text-xl font-heading font-bold">15.2% <span className="text-sm font-body opacity-70">/ yr</span></p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default DashboardPreviewSection;
