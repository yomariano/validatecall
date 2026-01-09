import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap, Users, Phone, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaywallEvents } from '@/lib/analytics';

/**
 * Soft paywall modal - shows when user is approaching limits
 * Can be dismissed with "Maybe later"
 */
function PaywallModal({
    isOpen,
    onClose,
    type = 'leads', // 'leads' or 'calls'
    used,
    limit,
    remaining
}) {
    // Track when soft paywall is shown
    useEffect(() => {
        if (isOpen) {
            const usagePercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
            PaywallEvents.softPaywallShown(type, usagePercent);
        }
    }, [isOpen, type, used, limit]);

    const handleClose = () => {
        PaywallEvents.softPaywallDismissed(type);
        onClose();
    };

    const handleUpgradeClick = () => {
        PaywallEvents.upgradeClicked('soft_paywall');
    };

    if (!isOpen) return null;

    const content = {
        leads: {
            icon: Users,
            title: 'Running Low on Leads',
            description: `You've used ${used} of your ${limit} free leads. Only ${remaining} remaining!`,
            benefits: [
                'Unlimited lead generation',
                'Access to 50M+ verified contacts',
                'Advanced filtering & export',
                'Priority support'
            ]
        },
        calls: {
            icon: Phone,
            title: 'Running Low on Calls',
            description: `You've made ${used} of your ${limit} free calls. Only ${remaining} remaining!`,
            benefits: [
                'Unlimited AI voice calls',
                'No 2-minute call limit',
                'Multiple phone numbers',
                'Call analytics & recordings'
            ]
        }
    };

    const { icon: Icon, title, description, benefits } = content[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-up">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Gradient header */}
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 px-6 py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                {/* Benefits */}
                <div className="px-6 py-6">
                    <p className="text-sm font-medium text-foreground mb-4">
                        Upgrade to unlock:
                    </p>
                    <ul className="space-y-3">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                </div>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                    <Button asChild className="w-full" variant="hero" onClick={handleUpgradeClick}>
                        <Link to="/billing">
                            <Zap className="h-4 w-4 mr-2" />
                            Upgrade Now
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={handleClose}
                    >
                        Maybe later
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PaywallModal;
