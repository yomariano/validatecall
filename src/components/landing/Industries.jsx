import { Building2, ShoppingCart, Briefcase, GraduationCap, Heart, Home, Car, Plane, Utensils, Laptop } from "lucide-react";

const industries = [
  { icon: Building2, name: "Real Estate" },
  { icon: ShoppingCart, name: "E-Commerce" },
  { icon: Briefcase, name: "B2B Services" },
  { icon: GraduationCap, name: "Education" },
  { icon: Heart, name: "Healthcare" },
  { icon: Home, name: "Home Services" },
  { icon: Car, name: "Automotive" },
  { icon: Plane, name: "Travel" },
  { icon: Utensils, name: "Restaurant" },
  { icon: Laptop, name: "Technology" },
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
            <div
              key={index}
              className="group glass-card p-6 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:border-primary/50 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <industry.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {industry.name}
              </span>
            </div>
          ))}
        </div>

        {/* More Industries Banner */}
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
          <p className="text-2xl md:text-3xl font-display font-semibold mb-2">
            <span className="text-gradient">+90 More Industries</span>
          </p>
          <p className="text-muted-foreground">
            From finance to fitness, legal to logistics—validate your ideas in any market.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Industries;
