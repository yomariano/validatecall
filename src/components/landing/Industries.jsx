import { Building2, ShoppingCart, Briefcase, GraduationCap, Heart, Home, Car, Plane, Utensils, Laptop, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const industries = [
  { icon: Building2, name: "Real Estate", slug: "real-estate" },
  { icon: ShoppingCart, name: "E-Commerce", slug: "ecommerce" },
  { icon: Briefcase, name: "B2B Services", slug: "consulting-firms" },
  { icon: GraduationCap, name: "Education", slug: "tutoring-services" },
  { icon: Heart, name: "Healthcare", slug: "medical-practices" },
  { icon: Home, name: "Home Services", slug: "plumbers" },
  { icon: Car, name: "Automotive", slug: "auto-repair" },
  { icon: Plane, name: "Travel", slug: "travel-agencies" },
  { icon: Utensils, name: "Restaurant", slug: "restaurants" },
  { icon: Laptop, name: "Technology", slug: "it-services" },
];

const Industries = () => {
  return (
    <section id="industries" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Research Leads From{" "}
            <span className="text-gradient">Every Industry</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're validating a startup idea or conducting market research, we have verified leads in your target industry ready to provide insights.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {industries.map((industry, index) => (
            <a
              key={index}
              href={`/industries/${industry.slug}`}
              className="group glass-card p-6 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:border-primary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <industry.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {industry.name}
              </span>
            </a>
          ))}
        </div>

        {/* More Industries Banner */}
        <a
          href="/industries"
          className="glass-card rounded-2xl p-8 md:p-12 text-center block hover:border-primary/50 transition-all duration-300 group"
        >
          <p className="text-2xl md:text-3xl font-display font-semibold mb-2">
            <span className="text-gradient">+90 More Industries</span>
          </p>
          <p className="text-muted-foreground mb-4">
            From finance to fitness, legal to logistics—validate your ideas in any market.
          </p>
          <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
            View All Industries <ArrowRight className="h-4 w-4" />
          </span>
        </a>
      </div>
    </section>
  );
};

export default Industries;
