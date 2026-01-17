import { CheckCircle2, Rocket, Search, Wand2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find leads",
    description: "Search by industry and location to build targeted lead lists in minutes.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Generate outreach",
    description: "Use AI to create cold email sequences and call pitches tailored to your offer.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch campaigns",
    description: "Run cold emails, AI voice calls, or both—then automatically follow up.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Track replies & bookings",
    description: "Review replies and call outcomes, read transcripts, and hand off qualified leads.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Go from niche to <span className="text-gradient">new customers</span>{" "}
            in minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            Find leads, generate scripts, and launch your first outbound campaign in under 10 minutes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex gap-6 md:gap-12 pb-12 last:pb-0"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-[27px] md:left-[35px] top-20 w-0.5 h-[calc(100%-5rem)] bg-gradient-to-b from-primary/50 to-accent/50" />
              )}

              <div className="relative flex-shrink-0">
                <div className="flex h-14 w-14 md:h-18 md:w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-display font-bold text-lg md:text-xl shadow-lg animate-glow">
                  {step.number}
                </div>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-2xl flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-xl md:text-2xl font-semibold">
                    {step.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
