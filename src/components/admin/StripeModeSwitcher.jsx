import { useState, useEffect } from "react";
import { CreditCard, TestTube, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const StripeModeSwitcher = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState(() => {
    return localStorage.getItem("stripeMode") || import.meta.env.VITE_STRIPE_MODE || "test";
  });

  useEffect(() => {
    // Toggle visibility with Ctrl+Shift+S
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const switchMode = (mode) => {
    setCurrentMode(mode);
    localStorage.setItem("stripeMode", mode);
    // Reload to apply changes
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-card border-2 border-primary/30 rounded-xl p-4 shadow-2xl max-w-xs animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm">Stripe Mode</h3>
      </div>

      <div className="space-y-2">
        <Button
          variant={currentMode === "test" ? "default" : "outline"}
          className="w-full justify-start"
          size="sm"
          onClick={() => switchMode("test")}
        >
          <TestTube className="h-4 w-4 mr-2" />
          Test Mode
          {currentMode === "test" && (
            <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded">Active</span>
          )}
        </Button>

        <Button
          variant={currentMode === "live" ? "default" : "outline"}
          className="w-full justify-start"
          size="sm"
          onClick={() => switchMode("live")}
        >
          <Rocket className="h-4 w-4 mr-2" />
          Live Mode
          {currentMode === "live" && (
            <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded">Active</span>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+Shift+S</kbd> to toggle
      </p>
    </div>
  );
};

export default StripeModeSwitcher;
