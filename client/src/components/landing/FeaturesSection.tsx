import { motion } from "framer-motion";
import featureCollab from "@/assets/feature-collab.jpg";
import featureGrowth from "@/assets/feature-growth.jpg";

const features = [
  {
    tag: "Track",
    title: "Real-time investment tracking",
    desc: "See every rupee you've invested, the returns earned, and your current balance — updated the moment your payment is approved.",
    accent: "hsl(155 82% 18%)",
    accentBg: "hsl(155 82% 18% / 0.06)",
  },
  {
    tag: "Returns",
    title: "Transparent return calculations",
    desc: "No black boxes. Your Daily returns are calculated clearly and shown in full detail — you always know what you earned and why.",
    accent: "hsl(142 65% 36%)",
    accentBg: "hsl(142 65% 36% / 0.06)",
  },
  {
    tag: "Pay",
    title: "Invest via QR code payment",
    desc: "Enter your amount, scan the QR code, complete payment — and submit. Simple, familiar, and secure.",
    accent: "hsl(155 82% 18%)",
    accentBg: "hsl(155 82% 18% / 0.06)",
  },
  {
    tag: "Verified",
    title: "Admin-verified, every time",
    desc: "Every investment is manually reviewed and approved by our team. Your money is never accepted without human confirmation.",
    accent: "hsl(142 65% 36%)",
    accentBg: "hsl(142 65% 36% / 0.06)",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-28 bg-background">
    <div className="container">
      {/* Section header */}
      <div className="max-w-xl mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-secondary mb-4"
        >
          Platform Features
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-4xl md:text-5xl text-foreground leading-[1.1] mb-5"
        >
          Everything you need to{" "}
          <span className="italic">invest with confidence</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base font-body text-muted-foreground leading-relaxed"
        >
          Built from the ground up for transparency — from the moment you scan
          the QR to the day you see your returns.
        </motion.p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large image card — left */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 relative rounded-[2rem] overflow-hidden min-h-[520px] group"
        >
          <img
            src={featureCollab}
            alt="Investment management with Growvest"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/25 backdrop-blur-sm border border-secondary/35 text-secondary text-[10px] font-body font-bold uppercase tracking-widest mb-4">
              Admin Verified
            </span>
            <h3 className="font-heading text-2xl md:text-3xl text-background leading-tight">
              Every investment reviewed by a real person
            </h3>
            <p className="mt-2 text-background/65 font-body text-sm leading-relaxed max-w-xs">
              No bots, no automation. Your payment is confirmed by our team before it's added to your account.
            </p>
          </div>
        </motion.div>

        {/* Right column — 4 feature cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.5 }}
              className="card-premium p-7 flex flex-col gap-4"
            >
              <span
                className="inline-block text-[10px] font-body font-bold uppercase tracking-widest px-2.5 py-1 rounded-md w-fit"
                style={{ color: f.accent, background: f.accentBg }}
              >
                {f.tag}
              </span>
              <div>
                <h3 className="font-heading text-xl text-foreground leading-snug mb-2">{f.title}</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom accent row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {/* Image card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden min-h-[240px] group"
        >
          <img
            src={featureGrowth}
            alt="Portfolio growth tracking"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-sm font-body font-semibold text-background">Watch your returns grow</p>
            <p className="text-xs font-body text-background/60 mt-1">Live portfolio dashboard</p>
          </div>
        </motion.div>

        {/* QR card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="card-premium p-7 flex flex-col justify-between"
        >
          <div>
            {/* Mini QR illustration */}
            <div className="w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center mb-5 bg-accent">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="2" width="8" height="8" rx="1" />
                <rect x="2" y="14" width="8" height="8" rx="1" />
                <rect x="4" y="4" width="4" height="4" fill="currentColor" stroke="none" />
                <rect x="16" y="4" width="4" height="4" fill="currentColor" stroke="none" />
                <rect x="4" y="16" width="4" height="4" fill="currentColor" stroke="none" />
                <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">Simple QR Payment</h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Scan, pay, submit. Our QR flow makes investing as easy as a UPI transfer.
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
              <span>Supports</span>
              <span className="text-primary font-semibold">UPI · Bank Transfer</span>
            </div>
          </div>
        </motion.div>

        {/* Dark accent card - Flexible Deposit Options */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 }}
          className="rounded-[1.5rem] p-7 flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, hsl(155 82% 18%) 0%, hsl(142 65% 28%) 100%)",
          }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-5">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="font-heading text-xl text-white mb-2">Flexible Deposit Options</h3>
            <div className="space-y-3 mt-4">
              <div>
                <p className="text-sm font-heading font-semibold text-white">Saving Deposit</p>
                <p className="text-xs font-body text-white/65 leading-relaxed">Earn returns with the freedom to withdraw anytime.</p>
              </div>
              <div>
                <p className="text-sm font-heading font-semibold text-white">Fixed Deposit</p>
                <p className="text-xs font-body text-white/65 leading-relaxed">Higher returns mapped with a simple 1-year lock-in.</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-white/15">
            <div className="flex items-center gap-2 text-xs font-body text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span>Choose what works for you</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
