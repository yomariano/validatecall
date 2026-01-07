import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { OnboardingWizard } from './OnboardingWizard';

function Layout() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onShowWizard={() => setShowWizard(true)} />
      <main className="flex-1 ml-72 p-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Onboarding Wizard - shows on first visit or when triggered */}
      <OnboardingWizard
        forceShow={showWizard}
        onClose={() => setShowWizard(false)}
      />
    </div>
  );
}

export default Layout;
