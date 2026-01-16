import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    company: "TechVentures Inc.",
    avatar: "SC",
    rating: 5,
    text: "ValidateCall transformed how we approach market research. We validated our B2B SaaS idea in just 2 weeks with real conversations from our target market. The AI agents are incredibly natural.",
    metric: "Saved 3 months of research time",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager",
    company: "InnovateCo",
    avatar: "MJ",
    rating: 5,
    text: "The multilingual capabilities are game-changing. We tested our product concept across 5 different markets simultaneously. The insights we gathered helped us pivot before wasting resources.",
    metric: "Tested 5 markets in 1 week",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Strategy",
    company: "GrowthLabs",
    avatar: "ER",
    rating: 5,
    text: "Finally, a tool that makes customer discovery scalable. The AI call summaries and sentiment analysis saved our team countless hours. We now use ValidateCall for every new initiative.",
    metric: "10x faster customer discovery",
  },
  {
    name: "David Park",
    role: "Serial Entrepreneur",
    company: "Park Ventures",
    avatar: "DP",
    rating: 5,
    text: "I've launched 4 products using ValidateCall for validation. The lead database is incredible - highly targeted contacts ready to give feedback. It's an unfair advantage for any startup.",
    metric: "4 successful product launches",
  },
  {
    name: "Lisa Thompson",
    role: "Research Director",
    company: "ConsumerInsights",
    avatar: "LT",
    rating: 5,
    text: "As a research professional, I was skeptical of AI calls. But the quality of conversations and data we get is remarkable. Our clients are amazed at how fast we deliver actionable insights.",
    metric: "300% increase in research capacity",
  },
  {
    name: "Alex Kumar",
    role: "VP of Product",
    company: "ScaleUp Tech",
    avatar: "AK",
    rating: 5,
    text: "We used ValidateCall to test pricing strategies with real customers before launch. The feedback helped us optimize our pricing tiers and increased our conversion rate significantly.",
    metric: "40% higher conversion rate",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Star className="h-4 w-4 fill-primary" />
            Trusted by 2,000+ Companies
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Loved by <span className="text-gradient">Innovators</span> Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See how leading companies use ValidateCall to validate ideas, understand markets, and make confident product decisions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 relative group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-10 w-10 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Metric Badge */}
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-6">
                {testimonial.metric}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Bar */}
        <div className="mt-12 md:mt-16 glass-card rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                4.9/5
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                2,000+
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                500K+
              </div>
              <div className="text-sm text-muted-foreground">Research Calls Made</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                98%
              </div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
