import { useState, useEffect } from 'react';
import { Check, Zap, TestTube, Rocket, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '../context/AuthContext';
import { stripeApi } from '../services/api';
import { PaywallEvents } from '@/lib/analytics';

// Stripe Payment Links - loaded from environment variables
// Configure these in .env with VITE_STRIPE_TEST_*_LINK and VITE_STRIPE_LIVE_*_LINK
const STRIPE_PAYMENT_LINKS = {
  test: {
    lite: import.meta.env.VITE_STRIPE_TEST_LITE_LINK || '',
    starter: import.meta.env.VITE_STRIPE_TEST_STARTER_LINK || '',
    pro: import.meta.env.VITE_STRIPE_TEST_PRO_LINK || '',
  },
  live: {
    lite: import.meta.env.VITE_STRIPE_LIVE_LITE_LINK || '',
    starter: import.meta.env.VITE_STRIPE_LIVE_STARTER_LINK || '',
    pro: import.meta.env.VITE_STRIPE_LIVE_PRO_LINK || '',
  }
};

// Determine which mode to use
const getStripeMode = () => {
  const savedMode = localStorage.getItem("stripeMode");
  if (savedMode) return savedMode;

  const envMode = import.meta.env.VITE_STRIPE_MODE;
  if (envMode) return envMode;

  // Fallback: detect by hostname
  return window.location.hostname === 'validatecall.com' ||
         window.location.hostname === 'voicefleet.ai' ? 'live' : 'test';
};

const CURRENT_MODE = getStripeMode();
const CURRENT_LINKS = STRIPE_PAYMENT_LINKS[CURRENT_MODE] || STRIPE_PAYMENT_LINKS.test;

const plans = [
  {
    id: "lite",
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
    id: "starter",
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
    id: "pro",
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

export default function Pricing() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const subData = await stripeApi.getSubscription(user.id).catch(() => null);
      setSubscription(subData);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    // Track plan selection
    PaywallEvents.planSelected(plan.id);

    // Append client_reference_id for user tracking
    const url = new URL(plan.stripeLink);
    if (user?.id) {
      url.searchParams.set('client_reference_id', user.id);
    }
    window.location.href = url.toString();
  };

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true);
      const { url } = await stripeApi.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create portal session:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      setManagingSubscription(false);
    }
  };

  // Determine current plan from subscription
  const getCurrentPlanId = () => {
    if (!subscription) return null;
    const planId = subscription.plan_id?.toLowerCase();
    if (planId?.includes('lite')) return 'lite';
    if (planId?.includes('starter')) return 'starter';
    if (planId?.includes('pro')) return 'pro';
    return planId;
  };

  const currentPlanId = getCurrentPlanId();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="text-center space-y-4">
        {/* Stripe Mode Indicator */}
        {CURRENT_MODE === 'test' && (
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
            <TestTube className="h-4 w-4" />
            Test Mode - Use card 4242 4242 4242 4242
          </div>
        )}
        {CURRENT_MODE === 'live' && (
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Rocket className="h-4 w-4" />
            Live Mode - Real payments active
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Simple, Transparent <span className="text-primary">Pricing</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Pay only for what you use. No hidden fees. Cancel anytime.
        </p>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  Current Plan: <span className="text-primary font-bold capitalize">{subscription.plan_id || 'Active'}</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                </CardTitle>
                {subscription.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={managingSubscription}
              >
                {managingSubscription ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                plan.popular
                  ? "border-2 border-primary shadow-md scale-[1.02]"
                  : "border border-border"
              } ${isCurrentPlan ? "ring-2 ring-green-500/50" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 z-10">
                  <Badge className="bg-green-500 text-white border-none">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardContent className="flex flex-col flex-grow pt-8 pb-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.calls} calls included ({`$${plan.costPerCall.toFixed(2)}/call`})
                  </p>
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full mb-6 ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                  disabled={isCurrentPlan}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isCurrentPlan ? "Current Plan" : plan.cta}
                </Button>

                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Need More Section */}
      <Card className="text-center">
        <CardContent className="py-8">
          <h3 className="text-xl font-bold mb-2">Need More Calls?</h3>
          <p className="text-muted-foreground mb-4">
            For enterprises requiring custom volumes or features, contact our sales team
            for a tailored solution.
          </p>
          <Button variant="outline">Contact Sales</Button>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold">What happens if I exceed my plan's call limit?</h4>
            <p className="text-sm text-muted-foreground">
              You can purchase additional call credits at your plan's per-call rate, or upgrade to a higher tier for better value.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! All plans are month-to-month with no long-term commitment. Cancel anytime from your dashboard.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Do unused calls roll over?</h4>
            <p className="text-sm text-muted-foreground">
              Unused calls expire at the end of each billing cycle. We recommend choosing a plan that matches your monthly needs.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, debit cards, and ACH transfers through our secure Stripe payment system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
