import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Phone, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const ONBOARDING_KEY = 'validatecall_onboarding_completed';
const ONBOARDING_STEP_KEY = 'validatecall_onboarding_step';

const steps = [
  {
    id: 1,
    title: 'Find Leads',
    description: 'Search for businesses on Google Maps by keyword and location. We\'ll scrape their contact information automatically.',
    icon: Search,
    action: 'Find Leads',
    path: '/leads',
    tip: 'Try searching for "restaurants in Dublin" or "plumbers in Cork"',
  },
  {
    id: 2,
    title: 'Campaigns',
    description: 'Create targeted calling campaigns for different industries. Select leads and let our voice AI pitch your product and gather feedback.',
    icon: Phone,
    action: 'Create Campaign',
    path: '/campaigns',
    tip: 'Create separate campaigns for different industries for better targeting',
  },
];

export function OnboardingWizard({ forceShow = false, onClose }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onClose?.();
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleGoToStep = (path) => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
    navigate(path);
    onClose?.();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Getting Started</span>
            <span>•</span>
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>

          <h2 className="text-2xl font-bold">Welcome to ValidateCall</h2>
          <p className="text-muted-foreground mt-1">
            Let's get you set up in 2 easy steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4 border-b border-border">
          {steps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">{index + 1}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {step.id}. {step.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {step.description}
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm">
                  <span className="font-medium text-primary">Tip:</span>{' '}
                  {step.tip}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 pt-0 gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
          >
            Skip tour
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={() => handleGoToStep('/leads')}
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check onboarding status and get current step
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [currentUserStep, setCurrentUserStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(!!completed);

    const step = localStorage.getItem(ONBOARDING_STEP_KEY);
    setCurrentUserStep(step ? parseInt(step) : 0);
  }, []);

  const completeStep = (stepNumber) => {
    const newStep = Math.max(currentUserStep, stepNumber);
    setCurrentUserStep(newStep);
    localStorage.setItem(ONBOARDING_STEP_KEY, newStep.toString());
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setHasCompletedOnboarding(false);
    setCurrentUserStep(0);
  };

  return {
    hasCompletedOnboarding,
    currentUserStep,
    completeStep,
    resetOnboarding,
    steps,
  };
}

// Sidebar step indicator component
export function SidebarStepIndicator({ stepNumber, isActive, isCompleted }) {
  if (isCompleted) {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {stepNumber}
    </span>
  );
}

export default OnboardingWizard;
