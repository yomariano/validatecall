import { useState } from 'react';
import { ONBOARDING_KEY, ONBOARDING_STEP_KEY, steps } from '@/lib/onboarding';
// Hook to check onboarding status and get current step
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => !!localStorage.getItem(ONBOARDING_KEY));
  const [currentUserStep, setCurrentUserStep] = useState(() => Number(localStorage.getItem(ONBOARDING_STEP_KEY)) || 0);

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

