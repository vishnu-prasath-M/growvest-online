import { motion } from "framer-motion";
import testimonialMan1 from "@/assets/testimonial-man-1.png";
import testimonialWoman1 from "@/assets/testimonial-woman-1.png";
import testimonialMan2 from "@/assets/testimonial-man-2.png";

const testimonials = [
  {
    quote:
      "I've tried other contribution trackers before, but Growvest is the first one where I actually trust what I see. Every rupee is accounted for — transparently.",
    name: "Arjun Mehta",
    title: "Small Business Owner, Mumbai",
    image: testimonialMan1,
    rating: 5,
    highlight: "trust what I see",
  },
  {
    quote:
      "The withdrawal process is incredibly smooth. I submitted my request on a Friday evening and had confirmation by Saturday morning. Zero stress, zero surprises.",
    name: "Priya Nair",
    title: "Freelance Designer, Bangalore",
    image: testimonialWoman1,
    rating: 5,
    highlight: "Zero stress, zero surprises",
  },
  {
    quote:
      "Our chit fund group moved everything to Growvest six months ago. The dashboard gives everyone full visibility, and it's eliminated all our internal disputes.",
    name: "Rajan Krishnamurthy",
    title: "Group Fund Manager, Chennai",
    image: testimonialMan2,
    rating: 5,
    highlight: "full visibility",
  },
];

const StarRow = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const TestimonialsSection = () => (
  <section id="testimonials" className="py-28 bg-background overflow-hidden">
    <div className="container">
      {/* Header */}
      <div className="max-w-xl mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-secondary mb-4"
        >
          Member Stories
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-4xl md:text-5xl text-foreground leading-[1.1] mb-5"
        >
          People who{" "}
          <span className="italic">trust</span> Growvest
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base font-body text-muted-foreground leading-relaxed"
        >
          Real members, real results. Here's what our community says about
          managing their contributions with Growvest.
        </motion.p>
      </div>

      {/* Testimonial cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`card-premium p-8 flex flex-col justify-between gap-8 ${
              i === 1 ? "md:translate-y-6" : ""
            }`}
          >
            <div>
              <StarRow count={t.rating} />
              <blockquote className="mt-5 font-body text-foreground text-base leading-[1.75] font-light">
                "{t.quote}"
              </blockquote>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-accent">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-sm font-body font-semibold text-foreground">
                  {t.name}
                </p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">
                  {t.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom social proof bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
      >
        <div className="flex items-center gap-3">
          {[testimonialMan1, testimonialWoman1, testimonialMan2].map((img, i) => (
            <div
              key={i}
              className={`h-9 w-9 rounded-full overflow-hidden border-2 border-background shadow-card ${i > 0 ? "-ml-3" : ""}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover object-top" />
            </div>
          ))}
          <span className="text-sm font-body text-muted-foreground ml-2">
            <strong className="text-foreground font-semibold">1,200+</strong> members trust us
          </span>
        </div>

        <div className="hidden sm:block h-px w-12 bg-border" />

        <div className="flex items-center gap-2">
          <StarRow count={5} />
          <span className="text-sm font-body text-muted-foreground">
            Rated <strong className="text-foreground font-semibold">4.9/5</strong> by our members
          </span>
        </div>
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
