import { Phone } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "All Industries", href: "/industries" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  industries: [
    { label: "Healthcare", href: "/industries/medical-practices" },
    { label: "Real Estate", href: "/industries/real-estate" },
    { label: "Home Services", href: "/industries/plumbers" },
    { label: "Restaurants", href: "/industries/restaurants" },
    { label: "View All 100+", href: "/industries" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "GDPR", href: "#" },
    { label: "Security", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border/50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Validate<span className="text-gradient">Call</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              AI-powered market research platform that helps you validate ideas and gather insights through intelligent voice conversations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Industries</h4>
            <ul className="space-y-2">
              {footerLinks.industries.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ValidateCall. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
