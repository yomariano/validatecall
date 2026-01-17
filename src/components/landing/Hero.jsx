import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Bot, Globe, Mail, PhoneCall, Search, Wand2, Zap } from "lucide-react";
import { useMemo, useState } from "react";

const Hero = () => {
  const { signInWithGoogle } = useAuth();
  const [industry, setIndustry] = useState("Dentist");
  const [location, setLocation] = useState("Austin, TX");
  const [previewTab, setPreviewTab] = useState("call");

  const preview = useMemo(() => {
    const normalizedIndustry = (industry || "").trim();
    const normalizedLocation = (location || "").trim();

    const safeIndustry = normalizedIndustry || "your niche";
    const safeLocation = normalizedLocation || "your area";

    const templates = {
      Dentist: {
        subject: `Quick question about new patients in ${safeLocation}`,
        email: `Hi {{firstName}} —\n\nDo you take new patients at {{businessName}}?\n\nWe help dental offices in ${safeLocation} get more booked appointments (without hiring).\n\nWorth sending a few details?`,
        call: `Hi {{firstName}} — quick one. Is {{businessName}} currently taking new patients?`,
      },
      Realtor: {
        subject: `More listings in ${safeLocation} (without more time)`,
        email: `Hi {{firstName}} —\n\nIf you’re open to it, I can share a simple way agents in ${safeLocation} are getting more seller conversations each week.\n\nWant me to send it?`,
        call: `Hi {{firstName}} — are you the best person to talk to about getting more seller leads for {{businessName}}?`,
      },
      Gym: {
        subject: `New members for {{businessName}} in ${safeLocation}`,
        email: `Hi {{firstName}} —\n\nDo you have room for a few more memberships this month?\n\nWe help gyms in ${safeLocation} turn local interest into booked tours.\n\nWant me to send the details?`,
        call: `Hi {{firstName}} — quick question: are you looking to add new members at {{businessName}} this month?`,
      },
      Restaurant: {
        subject: `Filling more tables in ${safeLocation}`,
        email: `Hi {{firstName}} —\n\nWe help restaurants in ${safeLocation} drive more reservations on slow nights with simple campaigns.\n\nWant a quick idea tailored to {{businessName}}?`,
        call: `Hi {{firstName}} — is this a good time? I had a quick idea to help {{businessName}} fill more tables on slower nights.`,
      },
      Plumber: {
        subject: `More booked jobs in ${safeLocation}`,
        email: `Hi {{firstName}} —\n\nDo you have capacity for a few more jobs this week?\n\nWe help home service businesses in ${safeLocation} get more booked calls without spending all day following up.\n\nInterested?`,
        call: `Hi {{firstName}} — are you currently taking new jobs at {{businessName}}?`,
      },
    };

    return (
      templates[normalizedIndustry] || {
        subject: `Quick question about ${safeIndustry} in ${safeLocation}`,
        email: `Hi {{firstName}} —\n\nDo you work with ${safeIndustry} clients in ${safeLocation}?\n\nWe help businesses like yours find leads and follow up with AI emails + calls.\n\nWorth a quick chat?`,
        call: `Hi {{firstName}} — quick question: are you the right person to talk to about new leads for {{businessName}}?`,
      }
    );
  }, [industry, location]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-pulse-slow" />

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
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Lead Finder + AI Cold Email + AI Calls
              </div>

              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Find <span className="text-gradient">leads</span> and reach out on autopilot.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Search any industry and location (dentists, gyms, real estate, restaurants, plumbers). Build lead lists, generate emails and call pitches with AI, then launch cold email + AI voice calls to get replies and booked appointments—24/7.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 mb-10 animate-fade-up" style={{ animationDelay: "0.25s" }}>
                {[
                  { icon: Search, text: "Search 100+ industries" },
                  { icon: Wand2, text: "AI-written scripts & emails" },
                  { icon: PhoneCall, text: "Email + calling campaigns" },
                ].map((item) => (
                  <div key={item.text} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/60 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <Button variant="hero" size="xl" onClick={signInWithGoogle}>
                  Get leads now
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "0.35s" }}>
                Build a list, generate a pitch, launch a campaign—without hiring.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                {[
                  { value: "100+", label: "Industries" },
                  { value: "50M+", label: "Leads" },
                  { value: "Email + Calls", label: "Outreach" },
                  { value: "Minutes", label: "Time to launch" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="font-display text-2xl md:text-3xl font-bold text-gradient mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="glass-card rounded-3xl p-6 md:p-8 border border-border/50">
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Preview your campaign
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pick an industry and location to see an example email + call opener.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <Bot className="h-4 w-4 text-primary" />
                    AI-generated
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Industry</div>
                    <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Dentist" />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Dentist", "Realtor", "Gym", "Restaurant", "Plumber"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setIndustry(chip)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                            industry === chip
                              ? "border-primary/60 bg-primary/10 text-primary"
                              : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Location</div>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Austin, TX" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("email")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                      previewTab === "email"
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Cold email
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("call")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                      previewTab === "call"
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <PhoneCall className="h-4 w-4" />
                    Cold call
                  </button>
                </div>

                <div className="rounded-2xl bg-background/40 border border-border/60 p-4 md:p-5">
                  {previewTab === "email" ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Subject</div>
                        <div className="text-sm font-medium text-foreground">{preview.subject}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Email</div>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                          {preview.email}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Call opener</div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {preview.call}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Includes transcripts, recordings, and follow-ups.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                  <div className="text-xs text-muted-foreground text-center sm:text-left">
                    Tip: scripts personalize with {"{{firstName}}"}, {"{{businessName}}"}, and more.
                  </div>
                  <Button variant="outline" onClick={signInWithGoogle}>
                    Build this campaign
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
