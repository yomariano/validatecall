import { useState } from 'react';
import Sidebar from './Sidebar';
import { OnboardingWizard } from './OnboardingWizard';
import { Menu } from 'lucide-react';

function Layout({ children }) {
  const [showWizard, setShowWizard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-16 px-4 bg-card border-b border-border md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-lg font-bold text-foreground">ValidateCall</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <Sidebar
        onShowWizard={() => setShowWizard(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-16 md:pt-0 p-4 md:p-8 animate-fade-in min-w-0 overflow-x-hidden">
        <div className="max-w-full overflow-hidden">
          {children}
        </div>
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
