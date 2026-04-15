import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="py-24 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(155 82% 18%) 0%, hsl(155 72% 26%) 60%, hsl(142 65% 32%) 100%)",
        }}
      >
        {/* Decorative */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(142 65% 42% / 0.25) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(155 82% 10% / 0.3) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 px-8 py-20 md:px-20 md:py-24 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/8 text-[11px] font-body font-semibold text-white/75 uppercase tracking-widest mb-8">
              No credit card · Free to join
            </span>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-[1.08] mb-6">
              Ready to start{" "}
              <span className="italic">investing today?</span>
            </h2>

            <p className="text-white/60 font-body text-base leading-relaxed mb-10 max-w-md mx-auto">
              Join 1,200+ investors who trust Growvest to track and grow their
              investments with total transparency and admin-verified security.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="group bg-white text-primary hover:bg-white/92 px-8 h-13 text-base font-body font-semibold rounded-xl shadow-lg"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/invest">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 border border-white/20 h-13 px-7 text-base font-body font-medium rounded-xl"
                >
                  Start Investing Now
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              {["No hidden fees", "Admin verified", "Withdraw anytime"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-xs font-body text-white/55">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
