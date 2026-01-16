import { Check, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    name: "Lite",
    price: 197,
    calls: 100,
    costPerCall: 1.97,
    description: "Perfect for testing and small-scale validation",
    features: [
      "100 AI research calls/month",
      "Basic analytics dashboard",
      "5 languages supported",
      "Lead database access",
    ],
    popular: false,
  },
  {
    name: "Starter",
    price: 497,
    calls: 500,
    costPerCall: 0.99,
    description: "Most popular for growing businesses",
    features: [
      "500 AI research calls/month",
      "Advanced analytics & insights",
      "15 languages supported",
      "CRM integration",
      "Call recordings & transcripts",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: 1337,
    calls: 2000,
    costPerCall: 0.67,
    description: "Best value for enterprises and agencies",
    features: [
      "2000 AI research calls/month",
      "30+ languages supported",
      "Full API access",
      "Dedicated account manager",
      "White-label options",
    ],
    popular: false,
  },
];

const PricingPreview = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section id="pricing-preview" className="py-16 md:py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Simple Pricing
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Choose Your <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No per-minute charges. Just straightforward pricing that scales with your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card rounded-2xl p-6 lg:p-8 relative transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
                plan.popular
                  ? "border-2 border-primary md:scale-105"
                  : "border border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-display text-xl font-bold mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.calls} calls • ${plan.costPerCall.toFixed(2)}/call
                </p>
              </div>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full mb-6"
                onClick={signInWithGoogle}
              >
                Get Started
              </Button>

              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* View Full Pricing Link */}
        <div className="text-center">
          <Button variant="ghost" size="lg" asChild>
            <Link to="/pricing" className="group">
              View Full Pricing & Features
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
