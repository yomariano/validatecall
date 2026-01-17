import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const benefits = [
  "14-day free trial",
  "No credit card required",
  "100 free AI calls",
  "Cancel anytime",
];

const CTA = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section id="pricing" className="py-16 md:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-primary/30 to-transparent blur-3xl -z-10" />

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Ready to get <span className="text-gradient">more customers?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find leads in any industry, generate scripts with AI, and launch cold email + AI calling campaigns—without hiring an SDR team.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                {benefit}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={signInWithGoogle}>
              Get started free
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
