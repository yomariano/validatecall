import { BarChart3, Globe, Mail, PhoneCall, Users, Wand2 } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Lead database for any industry",
    description: "Search 100+ industries and pull targeted leads by location, company size, and more.",
  },
  {
    icon: Wand2,
    title: "AI script generator",
    description: "Generate cold emails, follow-ups, and call pitches tailored to your offer and niche.",
  },
  {
    icon: Mail,
    title: "Cold email campaigns",
    description: "Launch sequences from your sender and track replies so you know what’s working.",
  },
  {
    icon: PhoneCall,
    title: "AI cold calling",
    description: "Deploy voice agents that call leads for you and deliver transcripts, outcomes, and summaries.",
  },
  {
    icon: BarChart3,
    title: "Campaign analytics",
    description: "See which industries, lists, and scripts generate the most replies and booked calls.",
  },
  {
    icon: Users,
    title: "Exports & handoffs",
    description: "Export to CSV or sync to your workflow so qualified leads get followed up fast.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Everything you need to{" "}
            <span className="text-gradient">find leads & book calls</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Build targeted lists, generate outreach with AI, and run cold email + AI calling campaigns in one place.
          </p>
        </div>

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
