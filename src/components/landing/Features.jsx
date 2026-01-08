import { Globe, Bot, Zap, Shield, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Lead Database",
    description: "Access verified leads from 100+ industries across every country. Filter by location, company size, revenue, and more to find your perfect market.",
  },
  {
    icon: Bot,
    title: "Multilingual AI Agents",
    description: "Deploy AI research agents that speak 30+ languages fluently. Natural conversations that sound human, gathering authentic market insights.",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Launch your first AI research campaign in minutes. No technical setup required—just select your target market and go.",
  },
  {
    icon: Shield,
    title: "Compliance Built-In",
    description: "GDPR, CCPA, and TCPA compliant. Automatic do-not-call list management and consent tracking for ethical research.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track response rates, sentiment analysis, and market trends in real-time. AI-powered insights to validate your ideas.",
  },
  {
    icon: Users,
    title: "CRM Integration",
    description: "Seamlessly sync with Salesforce, HubSpot, Pipedrive, and 50+ other CRMs. Keep all your market research data organized.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="text-gradient">Validate Your Ideas</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you discover insights, conduct research, and validate business concepts faster than ever before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card p-8 rounded-2xl glow-effect transition-all duration-300 hover:scale-[1.02] hover:border-primary/50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
