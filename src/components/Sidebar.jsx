import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Phone,
  History,
  PhoneCall,
  Building2,
  BarChart3,
  Users,
  LogOut,
  User,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Bot,
  Settings,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useUsage } from '@/context/UsageContext';
import { useOnboarding } from './OnboardingWizard';
import { UsageDisplay } from '@/components/UsageMeter';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Find Leads', step: 1 },
  { to: '/agents', icon: Bot, label: 'Voice Agents' },
  { to: '/campaigns', icon: PhoneCall, label: 'Campaigns', step: 2 },
  { to: '/history', icon: BarChart3, label: 'Analytics' },
  { to: '/billing', icon: CreditCard, label: 'Plans & Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ onShowWizard }) {
  const { user, isLocalhost, signOut } = useAuth();
  const { isFreeTier, leadsUsed, leadsLimit, callsUsed, callsLimit, subscription } = useUsage();
  const { currentUserStep, hasCompletedOnboarding } = useOnboarding();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Get user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url;

  // Check if a step is completed based on user progress
  const isStepCompleted = (stepNumber) => currentUserStep >= stepNumber;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border bg-card flex flex-col">
      {/* Logo Header - Enterprise Style */}
      <div className="flex h-20 items-center gap-4 border-b border-border px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <PhoneCall className="h-6 w-6" style={{ color: '#ffffff' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground tracking-tight">
            ValidateCall
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            AI-Powered Validation Platform
          </span>
        </div>
      </div>

      {/* Getting Started Guide */}
      {!hasCompletedOnboarding && (
        <div className="mx-4 mt-4">
          <button
            onClick={onShowWizard}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-foreground">Getting Started</span>
              <span className="text-xs text-muted-foreground">2-step setup guide</span>
            </div>
          </button>
        </div>
      )}

      {/* Usage Display - shown for all users */}
      <div className="mx-4 mt-4">
        <UsageDisplay
          leadsUsed={leadsUsed}
          leadsLimit={leadsLimit}
          callsUsed={callsUsed}
          callsLimit={callsLimit}
          isFreeTier={isFreeTier}
          planId={subscription?.planId}
        />
      </div>

      {/* Workflow Section Label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Workflow
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Step indicator for workflow items */}
                {item.step ? (
                  <div className="relative">
                    <item.icon
                      className="h-5 w-5"
                      style={{ color: isActive ? '#ffffff' : undefined }}
                    />
                    {isStepCompleted(item.step) && !isActive && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-card rounded-full" />
                    )}
                  </div>
                ) : (
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: isActive ? '#ffffff' : undefined }}
                  />
                )}
                <span className="flex-1">{item.label}</span>
                {/* Step number badge for workflow items */}
                {item.step && !isStepCompleted(item.step) && (
                  <span
                    className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {item.step}
                  </span>
                )}
                {item.step && isStepCompleted(item.step) && !isActive && (
                  <Badge variant="success" className="text-[9px] py-0 px-1.5">
                    Done
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Workspace Section */}
      <div className="px-6 pt-8 pb-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Workspace
        </p>
      </div>
      <div className="px-4 space-y-2">
        <NavLink
          to="/billing"
          className="flex items-center gap-3 rounded-lg px-4 py-3 bg-secondary/50 border border-border hover:bg-secondary transition-colors"
        >
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">My Company</span>
            <span className="text-xs text-muted-foreground">View Plans</span>
          </div>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Upgrade
          </Badge>
        </NavLink>

        {/* Admin link - visible in localhost or for admin users */}
        {isLocalhost && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/5 border-primary/20 hover:bg-primary/10 text-foreground"
              )
            }
          >
            <Shield className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin</span>
              <span className="text-xs opacity-70">Marketing</span>
            </div>
          </NavLink>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-4 bg-card">
        {/* User Profile */}
        <div>
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate flex items-center">
                {userName}
                {isLocalhost && (
                  <Badge variant="info" className="ml-2 text-[9px] py-0">
                    Dev
                  </Badge>
                )}
              </span>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex h-2 w-2 rounded-full bg-success" />
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
