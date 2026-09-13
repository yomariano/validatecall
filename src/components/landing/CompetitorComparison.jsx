import { Database, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';

const features = [
  { icon: Database, title: "Bring your contacts", description: "Import business contacts from CSV and organize them into lists for your campaigns." },
  { icon: FileText, title: "Research with sources", description: "When web research is connected, find businesses by industry and location and review the sources behind each result." },
  { icon: Phone, title: "Manage your outreach", description: "Connect your calling and email services to prepare campaigns and review their outcomes in one workspace." },
];

export default function CompetitorComparison() {
  const { signInWithGoogle } = useAuth();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">From contacts to conversations</h2>
          <p className="text-muted-foreground">Build your own lead lists, prepare outreach, and keep track of results.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card rounded-2xl p-8">
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="hero" size="xl" onClick={signInWithGoogle}>Create your workspace</Button>
        </div>
      </div>
    </section>
  );
}
