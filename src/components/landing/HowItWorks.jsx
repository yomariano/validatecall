import { Search, Settings, Rocket, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Select Your Target Market",
    description: "Filter our database of 50M+ verified contacts by industry, location, company size, and dozens of other criteria to find your ideal research participants.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure Your Research Agent",
    description: "Customize your AI agent's voice, language, research questions, and conversation flow. Train it with your specific validation criteria.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch Research Campaign",
    description: "Set your calling schedule, sample size, and goals. Your AI agents start conducting personalized research interviews immediately.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Analyze & Validate",
    description: "Review real-time insights, listen to call recordings, and get AI-generated reports on market viability, pain points, and opportunities.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Go From Idea to{" "}
            <span className="text-gradient">Market Insights</span>{" "}
            in Minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            Our streamlined process gets you from signup to your first AI-powered market research campaign in under 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex gap-6 md:gap-12 pb-12 last:pb-0"
            >
              {/* Line Connector */}
              {index < steps.length - 1 && (
                <div className="absolute left-[27px] md:left-[35px] top-20 w-0.5 h-[calc(100%-5rem)] bg-gradient-to-b from-primary/50 to-accent/50" />
              )}

              {/* Number Circle */}
              <div className="relative flex-shrink-0">
                <div className="flex h-14 w-14 md:h-18 md:w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-display font-bold text-lg md:text-xl shadow-lg animate-glow">
                  {step.number}
                </div>
              </div>

              {/* Content */}
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
