import { motion } from "framer-motion";

const stats = [
  { value: "₹4.2Cr+", label: "Total Invested", sub: "Across all portfolios" },
  { value: "1,200+", label: "Active Investors", sub: "Growing every month" },
  { value: "₹68L+", label: "Returns Paid Out", sub: "Verified & processed" },
  { value: "15.2%", label: "Avg. Annual Return", sub: "Historical average" },
];

const StatsSection = () => (
  <section className="relative py-12 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative -mt-14 z-20"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="card-premium p-7 text-center group"
            >
              <p className="text-3xl md:text-4xl font-heading text-foreground mb-1">{s.value}</p>
              <p className="text-sm font-body font-semibold text-foreground/80 mb-0.5">{s.label}</p>
              <p className="text-xs font-body text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default StatsSection;
