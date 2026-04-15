import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Enter your investment amount",
    desc: "Log in to your account, enter the amount you want to invest, and click 'Invest Now'.",
    detail: "Minimum ₹500",
  },
  {
    num: "02",
    title: "Pay via QR code",
    desc: "A QR code appears automatically. Scan it with any UPI app or transfer to our bank account.",
    detail: "UPI · Net Banking · Bank Transfer",
  },
  {
    num: "03",
    title: "Admin verifies your payment",
    desc: "Our team manually checks and confirms your payment. You'll see a 'Waiting for Approval' status until then.",
    detail: "Verified within 24 hours",
  },
  {
    num: "04",
    title: "Track your investment & returns",
    desc: "Once approved, your investment appears in your dashboard with real-time return calculations.",
    detail: "Avg. 15.2% annual return",
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-28 bg-card">
    <div className="container">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
        <div className="lg:col-span-5">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-secondary mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl text-foreground leading-[1.1]"
          >
            From payment to{" "}
            <span className="italic">returns in 4 steps</span>
          </motion.h2>
        </div>
        <div className="lg:col-span-7 flex items-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base font-body text-muted-foreground leading-relaxed max-w-lg"
          >
            Investing on Growvest is straightforward. Enter an amount, scan a QR
            code, wait for admin approval, and start tracking your returns — all
            within 24 hours.
          </motion.p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.55 }}
            className="card-premium p-7 flex flex-col gap-5 group relative overflow-hidden"
          >
            {/* Step number watermark */}
            <span className="absolute top-4 right-5 text-6xl font-heading text-border/40 group-hover:text-primary/8 transition-colors select-none">
              {s.num}
            </span>

            {/* Step indicator */}
            <div className="relative z-10">
              <div className={`h-3 w-3 rounded-full mb-1 ${i === steps.length - 1 ? "bg-secondary" : "bg-primary"}`} />
              <span className={`text-[10px] font-body uppercase tracking-wider ${i === steps.length - 1 ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                Step {s.num}
              </span>
            </div>

            <div className="relative z-10 flex-1">
              <h3 className="font-heading text-xl text-foreground leading-snug mb-3">{s.title}</h3>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>

            <div className="relative z-10 pt-4 border-t border-border">
              <p className="text-xs font-body text-primary font-medium">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flow connector line (desktop only) */}
      <div className="hidden lg:flex items-center justify-center mt-8 gap-0">
        {steps.map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`h-2.5 w-2.5 rounded-full ${i === 0 || i === steps.length - 1 ? "bg-primary" : "bg-border"}`} />
            {i < steps.length - 1 && (
              <div className="h-px w-24 bg-gradient-to-r from-primary/40 to-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
