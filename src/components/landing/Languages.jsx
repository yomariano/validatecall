const languages = [
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "ES", name: "Spanish", flag: "🇪🇸" },
  { code: "FR", name: "French", flag: "🇫🇷" },
  { code: "DE", name: "German", flag: "🇩🇪" },
  { code: "PT", name: "Portuguese", flag: "🇧🇷" },
  { code: "IT", name: "Italian", flag: "🇮🇹" },
  { code: "ZH", name: "Chinese", flag: "🇨🇳" },
  { code: "JA", name: "Japanese", flag: "🇯🇵" },
  { code: "KO", name: "Korean", flag: "🇰🇷" },
  { code: "AR", name: "Arabic", flag: "🇸🇦" },
  { code: "HI", name: "Hindi", flag: "🇮🇳" },
  { code: "RU", name: "Russian", flag: "🇷🇺" },
];

const Languages = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Research in{" "}
            <span className="text-gradient">Any Language</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI research agents are fluent in 30+ languages, with natural accents and cultural nuances that make every conversation feel authentic and local.
          </p>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-12">
          {languages.map((lang, index) => (
            <div
              key={index}
              className="group glass-card p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:border-primary/50"
            >
              <div className="text-3xl mb-2">{lang.flag}</div>
              <div className="text-sm font-medium text-foreground">{lang.code}</div>
              <div className="text-xs text-muted-foreground">{lang.name}</div>
            </div>
          ))}
        </div>

        {/* More Languages */}
        <div className="text-center">
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">+18 more languages</span> including Dutch, Polish, Turkish, Thai, and more
          </p>
        </div>
      </div>
    </section>
  );
};

export default Languages;
