import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "Local Services",
    avatar: "SC",
    rating: 5,
    text: "I finally have a consistent way to get new leads without spending my evenings chasing follow-ups. The AI scripts are surprisingly good and the call summaries save me a ton of time.",
    metric: "More replies, less busywork",
  },
  {
    name: "Marcus Johnson",
    role: "Owner",
    company: "Professional Services",
    avatar: "MJ",
    rating: 5,
    text: "Being able to pull a targeted list and launch email + calls in one place is the difference. It’s simple enough that I can run outreach between client work.",
    metric: "All-in-one outbound",
  },
  {
    name: "Emily Rodriguez",
    role: "Operator",
    company: "Online Business",
    avatar: "ER",
    rating: 5,
    text: "The campaign preview and script generation helped me move fast. I launched my first outreach campaign the same day and started getting conversations right away.",
    metric: "Fast time-to-launch",
  },
  {
    name: "David Park",
    role: "Entrepreneur",
    company: "Consulting",
    avatar: "DP",
    rating: 5,
    text: "I used to pay for lists and still had to do all the work. Now I can find leads and let the system do the outreach while I focus on delivering.",
    metric: "Less manual outreach",
  },
  {
    name: "Lisa Thompson",
    role: "Sales Lead",
    company: "Agency",
    avatar: "LT",
    rating: 5,
    text: "Transcripts and outcomes make it easy to see what’s working and iterate. We can test different angles without writing everything from scratch.",
    metric: "Easy iteration",
  },
  {
    name: "Alex Kumar",
    role: "Founder",
    company: "B2B Services",
    avatar: "AK",
    rating: 5,
    text: "Cold email gets attention, but the AI calls help us follow up at scale. It’s like having an SDR without the overhead.",
    metric: "Scalable follow-up",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Star className="h-4 w-4 fill-primary" />
            Trusted by founders & teams
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Built to <span className="text-gradient">book conversations</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how entrepreneurs use ValidateCall to find leads, launch outreach, and turn prospects into customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 relative group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-10 w-10 text-primary" />
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-6">
                {testimonial.metric}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                100+
              </div>
              <div className="text-sm text-muted-foreground">Industries</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                50M+
              </div>
              <div className="text-sm text-muted-foreground">Leads</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">AI Outreach</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
