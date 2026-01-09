import { Check, Zap, TestTube, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import StripeModeSwitcher from "@/components/admin/StripeModeSwitcher";

// Stripe Payment Links - TEST MODE (for development/testing)
// Note: Switch to LIVE mode URLs when deploying to production
const STRIPE_PAYMENT_LINKS = {
  test: {
    lite: "https://buy.stripe.com/test_9B600ibzgboW0Na4I4fQI0d",
    starter: "https://buy.stripe.com/test_5kQeVc7j00KibrOa2ofQI0e",
    pro: "https://buy.stripe.com/test_7sYaEWcDk0KicvSdeAfQI0f",
  },
  live: {
    lite: "https://buy.stripe.com/6oUaEWeLs9gO8fCgqMfQI07",
    starter: "https://buy.stripe.com/28E6oG0UC78G53qb6sfQI08",
    pro: "https://buy.stripe.com/00w4gyfPw64C53q4I4fQI09",
  }
};

// Determine which mode to use
// Priority: 1. localStorage (set by admin switcher), 2. Environment variable, 3. Hostname detection
const getStripeMode = () => {
  const savedMode = localStorage.getItem("stripeMode");
  if (savedMode) return savedMode;

  const envMode = import.meta.env.VITE_STRIPE_MODE;
  if (envMode) return envMode;

  // Fallback: detect by hostname
  return window.location.hostname === 'validatecall.com' ? 'live' : 'test';
};

const CURRENT_MODE = getStripeMode();
const CURRENT_LINKS = STRIPE_PAYMENT_LINKS[CURRENT_MODE] || STRIPE_PAYMENT_LINKS.test;

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
      "Email support",
      "5 languages supported",
      "Standard AI voices",
      "Lead database access",
      "CSV export",
    ],
    cta: "Start with Lite",
    popular: false,
    stripeLink: CURRENT_LINKS.lite,
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
      "Priority email support",
      "15 languages supported",
      "Premium AI voices",
      "CRM integration (Salesforce, HubSpot)",
      "Custom research scripts",
      "Call recordings & transcripts",
      "Sentiment analysis",
    ],
    cta: "Start with Starter",
    popular: true,
    stripeLink: CURRENT_LINKS.starter,
  },
  {
    name: "Pro",
    price: 1337,
    calls: 2000,
    costPerCall: 0.67,
    description: "Best value for enterprises and agencies",
    features: [
      "2000 AI research calls/month",
      "Real-time analytics & insights",
      "24/7 phone & email support",
      "30+ languages supported",
      "Premium + custom AI voices",
      "Full CRM integration",
      "Custom research scripts",
      "API access",
      "Dedicated account manager",
      "White-label options",
      "Advanced reporting",
      "Team collaboration tools",
    ],
    cta: "Start with Pro",
    popular: false,
    stripeLink: CURRENT_LINKS.pro,
  },
];

const PricingPublic = () => {
  const handleSubscribe = (stripeLink) => {
    // Redirect to Stripe payment link
    window.location.href = stripeLink;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StripeModeSwitcher />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            {/* Stripe Mode Indicator */}
            {CURRENT_MODE === 'test' && (
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <TestTube className="h-4 w-4" />
                Test Mode - Use card 4242 4242 4242 4242
              </div>
            )}
            {CURRENT_MODE === 'live' && (
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Rocket className="h-4 w-4" />
                Live Mode - Real payments active
              </div>
            )}

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent{" "}
              <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Pay only for what you use. No hidden fees. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card rounded-2xl p-8 relative ${
                  plan.popular
                    ? "border-2 border-primary shadow-lg scale-105"
                    : "border border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.calls} calls included • ${plan.costPerCall.toFixed(2)}/call
                  </p>
                </div>

                <Button
                  variant={plan.popular ? "hero" : "default"}
                  className="w-full mb-6"
                  size="lg"
                  onClick={() => handleSubscribe(plan.stripeLink)}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="glass-card rounded-2xl p-8 text-center">
            <h3 className="font-display text-2xl font-bold mb-4">
              Need More Calls?
            </h3>
            <p className="text-muted-foreground mb-6">
              For enterprises requiring custom volumes or features, contact our sales team
              for a tailored solution.
            </p>
            <Button variant="heroOutline" size="lg">
              Contact Sales
            </Button>
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold mb-2">What happens if I exceed my plan's call limit?</h4>
                <p className="text-sm text-muted-foreground">
                  You can purchase additional call credits at your plan's per-call rate, or upgrade to a higher tier for better value.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! All plans are month-to-month with no long-term commitment. Cancel anytime from your dashboard.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do unused calls roll over?</h4>
                <p className="text-sm text-muted-foreground">
                  Unused calls expire at the end of each billing cycle. We recommend choosing a plan that matches your monthly needs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, and ACH transfers through our secure Stripe payment system.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! All plans include a 14-day free trial with 10 free research calls to test the platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I switch plans later?</h4>
                <p className="text-sm text-muted-foreground">
                  Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPublic;
