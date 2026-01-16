import { Check, X, Minus, Trophy, Phone, Database, Bot, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const competitors = [
  {
    name: "ValidateCall",
    isUs: true,
    pricing: "$197-$1,337/mo",
    pricingNote: "All-inclusive",
    database: "50M+",
    databaseNote: "Verified B2B leads",
    aiCalling: true,
    aiCallingNote: "AI makes calls for you",
    creditSystem: false,
    creditNote: "No credits needed",
    manualCalling: false,
    manualNote: "Fully automated",
    sentimentAnalysis: true,
    transcripts: true,
    researchFocus: true,
    researchNote: "Built for validation",
  },
  {
    name: "Apollo.io",
    isUs: false,
    pricing: "$49-$149/user/mo",
    pricingNote: "+ credit overages",
    database: "275M",
    databaseNote: "Contacts",
    aiCalling: false,
    aiCallingNote: "Manual dialer only",
    creditSystem: true,
    creditNote: "$0.20/credit overage",
    manualCalling: true,
    manualNote: "You make calls",
    sentimentAnalysis: false,
    transcripts: false,
    researchFocus: false,
    researchNote: "Sales focused",
  },
  {
    name: "ZoomInfo",
    isUs: false,
    pricing: "$15,000+/year",
    pricingNote: "Enterprise only",
    database: "320M+",
    databaseNote: "Contacts",
    aiCalling: false,
    aiCallingNote: "No calling feature",
    creditSystem: true,
    creditNote: "Usage limits apply",
    manualCalling: true,
    manualNote: "You make calls",
    sentimentAnalysis: false,
    transcripts: false,
    researchFocus: false,
    researchNote: "Sales intelligence",
  },
  {
    name: "Lusha",
    isUs: false,
    pricing: "$29-$79/mo",
    pricingNote: "Per user + credits",
    database: "280M",
    databaseNote: "Contacts",
    aiCalling: false,
    aiCallingNote: "No calling feature",
    creditSystem: true,
    creditNote: "5 credits/phone",
    manualCalling: true,
    manualNote: "You make calls",
    sentimentAnalysis: false,
    transcripts: false,
    researchFocus: false,
    researchNote: "LinkedIn focused",
  },
  {
    name: "Seamless.AI",
    isUs: false,
    pricing: "$147+/user/mo",
    pricingNote: "Annual contract",
    database: "1.3B",
    databaseNote: "~70% accurate",
    aiCalling: false,
    aiCallingNote: "No calling feature",
    creditSystem: true,
    creditNote: "Credits don't rollover",
    manualCalling: true,
    manualNote: "You make calls",
    sentimentAnalysis: false,
    transcripts: false,
    researchFocus: false,
    researchNote: "Sales prospecting",
  },
];

const FeatureCell = ({ value, note, isPositive }) => {
  if (value === true) {
    return (
      <div className="flex flex-col items-center">
        <Check className="h-5 w-5 text-success" />
        {note && <span className="text-xs text-muted-foreground mt-1">{note}</span>}
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex flex-col items-center">
        <X className="h-5 w-5 text-destructive/60" />
        {note && <span className="text-xs text-muted-foreground mt-1">{note}</span>}
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex flex-col items-center">
        <Minus className="h-5 w-5 text-warning" />
        {note && <span className="text-xs text-muted-foreground mt-1">{note}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center text-center">
      <span className={`text-sm font-medium ${isPositive ? "text-success" : ""}`}>{value}</span>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  );
};

const CompetitorComparison = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section id="comparison" className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Trophy className="h-4 w-4" />
            Why Choose Us
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            More Than Just a <span className="text-gradient">Lead Database</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Other platforms give you contacts. ValidateCall gives you insights.
            Our AI actually makes the research calls for you.
          </p>
        </div>

        {/* Key Differentiator Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 md:mb-16">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Lead Database Included</h3>
            <p className="text-sm text-muted-foreground">
              Access 50M+ verified B2B contacts. No extra credits or fees.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Makes The Calls</h3>
            <p className="text-sm text-muted-foreground">
              Our AI voice agents conduct research calls 24/7. You get the insights.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Actionable Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get transcripts, sentiment analysis, and validated market data.
            </p>
          </div>
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="glass-card rounded-2xl p-6 min-w-[900px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Feature</th>
                  {competitors.map((comp, idx) => (
                    <th
                      key={idx}
                      className={`py-4 px-4 text-center ${
                        comp.isUs ? "bg-primary/10 rounded-t-xl" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {comp.isUs && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            Best Value
                          </span>
                        )}
                        <span className={`font-bold ${comp.isUs ? "text-primary" : ""}`}>
                          {comp.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-sm font-medium">Monthly Pricing</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell value={comp.pricing} note={comp.pricingNote} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-sm font-medium">Lead Database</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell value={comp.database} note={comp.databaseNote} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50 bg-success/5">
                  <td className="py-4 px-4 text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    AI Makes Calls For You
                  </td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell value={comp.aiCalling} note={comp.aiCallingNote} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-sm font-medium">Credit System</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell
                        value={comp.creditSystem ? "Yes" : "No credits"}
                        note={comp.creditNote}
                        isPositive={!comp.creditSystem}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-sm font-medium">Manual Calling Required</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell value={!comp.manualCalling} note={comp.manualNote} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-sm font-medium">Sentiment Analysis</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell value={comp.sentimentAnalysis} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-sm font-medium">Call Transcripts</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5" : ""}`}
                    >
                      <FeatureCell value={comp.transcripts} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium">Market Research Focus</td>
                  {competitors.map((comp, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-center ${comp.isUs ? "bg-primary/5 rounded-b-xl" : ""}`}
                    >
                      <FeatureCell value={comp.researchFocus} note={comp.researchNote} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Cards - Mobile */}
        <div className="lg:hidden space-y-6">
          {/* ValidateCall Card (Featured) */}
          <div className="glass-card rounded-2xl p-6 border-2 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                  Best Value
                </span>
                <h3 className="font-bold text-xl mt-2 text-primary">ValidateCall</h3>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">$197-$1,337/mo</div>
                <div className="text-xs text-muted-foreground">All-inclusive</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>AI makes calls for you</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>50M+ lead database</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>No credit system</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Sentiment analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Full transcripts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Research focused</span>
              </div>
            </div>
            <Button variant="hero" className="w-full mt-4" onClick={signInWithGoogle}>
              Start Free Trial
            </Button>
          </div>

          {/* Other Competitors */}
          {competitors.filter(c => !c.isUs).map((comp, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{comp.name}</h3>
                <div className="text-right">
                  <div className="font-medium text-sm">{comp.pricing}</div>
                  <div className="text-xs text-muted-foreground">{comp.pricingNote}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-destructive/60" />
                  <span className="text-xs">No AI calling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-xs">{comp.database} contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-destructive/60" />
                  <span className="text-xs">Credit-based</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-destructive/60" />
                  <span className="text-xs">Manual calls only</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="mt-12 glass-card rounded-2xl p-6 md:p-8 text-center">
          <h3 className="font-display text-xl md:text-2xl font-bold mb-3">
            Stop Buying Lists. Start Getting <span className="text-gradient">Insights.</span>
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Other platforms sell you contact data and leave you to make hundreds of calls yourself.
            ValidateCall's AI does the calling, analyzes the conversations, and delivers actionable market research.
          </p>
          <Button variant="hero" size="lg" onClick={signInWithGoogle}>
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CompetitorComparison;
