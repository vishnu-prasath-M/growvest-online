import { motion } from "framer-motion";

const pillars = [
  {
    num: "01",
    title: "Transparent by Design",
    desc:
      "Every transaction you make — every deposit, interest credit, and withdrawal — is logged and visible in your dashboard. We never hide anything.",
    metric: "100%",
    metricLabel: "Visibility",
  },
  {
    num: "02",
    title: "Manually Verified",
    desc:
      "Our team personally reviews and confirms every contribution and withdrawal. No automated black boxes — a real person checks your money.",
    metric: "24h",
    metricLabel: "Review Time",
  },
  {
    num: "03",
    title: "Enterprise Encryption",
    desc:
      "Your financial data is protected with 256-bit AES encryption at rest and in transit. The same standard used by major financial institutions.",
    metric: "256-bit",
    metricLabel: "Encryption",
  },
];

const badges = [
  { label: "SOC2 Infrastructure" },
  { label: "GDPR Compliant" },
  { label: "End-to-End Encrypted" },
  { label: "Manual Review Process" },
];

const TrustSection = () => (
  <section id="trust" className="py-28 bg-foreground relative overflow-hidden">
    {/* Subtle background glow */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 80% 20%, hsl(155 82% 18% / 0.18) 0%, transparent 60%)",
      }}
    />

    <div className="container relative z-10">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-end">
        <div className="lg:col-span-5">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-secondary mb-4"
          >
            Trust & Security
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl text-background leading-[1.1]"
          >
            Your trust is our{" "}
            <span className="italic text-secondary">foundation</span>
          </motion.h2>
        </div>
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="text-base font-body text-background/55 leading-relaxed max-w-lg"
          >
            Financial transparency isn't a feature — it's the reason Growvest exists.
            We built every part of this platform around the principle that you should
            always know exactly where your money is.
          </motion.p>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {pillars.map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.55 }}
            className="rounded-[1.75rem] border border-background/10 bg-background/5 backdrop-blur-sm p-8 flex flex-col gap-5 hover:bg-background/8 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-body text-background/40 font-semibold uppercase tracking-wider">
                {p.num}
              </span>
              <div className="text-right">
                <p className="text-2xl font-heading text-secondary">{p.metric}</p>
                <p className="text-[10px] font-body text-background/40 uppercase tracking-wide">{p.metricLabel}</p>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl text-background mb-3">{p.title}</h3>
              <p className="text-sm font-body text-background/55 leading-relaxed">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap items-center gap-3"
      >
        {badges.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-background/15 bg-background/6 text-xs font-body font-medium text-background/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {b.label}
          </span>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TrustSection;
