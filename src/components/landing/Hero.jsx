import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Bot, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Hero = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-pulse-slow" />

      {/* Floating Elements */}
      <div className="absolute top-32 left-10 md:left-32 animate-float">
        <div className="glass-card p-4 rounded-2xl">
          <Globe className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="absolute top-48 right-10 md:right-32 animate-float" style={{ animationDelay: "2s" }}>
        <div className="glass-card p-4 rounded-2xl">
          <Bot className="h-8 w-8 text-accent" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 md:left-48 animate-float" style={{ animationDelay: "4s" }}>
        <div className="glass-card p-4 rounded-2xl">
          <Zap className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI-Powered Market Research Calls
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Transform Your <span className="text-gradient">Market Research</span>
            <br />
            with AI Voice Agents
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Discover and validate business ideas through AI-powered phone conversations. Access millions of verified leads, deploy intelligent voice agents, and gather real market insights—24/7.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" onClick={signInWithGoogle}>
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "100+", label: "Industries" },
              { value: "50M+", label: "Verified Leads" },
              { value: "30+", label: "Languages" },
              { value: "24/7", label: "AI Availability" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
