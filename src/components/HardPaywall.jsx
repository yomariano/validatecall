import { Link } from 'react-router-dom';
import { Lock, Zap, Users, Phone, TrendingUp, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Hard paywall - blocks access when limits are exhausted
 * No dismiss option - must upgrade to continue
 */
function HardPaywall({
    type = 'both', // 'leads', 'calls', or 'both'
    leadsUsed = 0,
    leadsLimit = 10,
    callsUsed = 0,
    callsLimit = 5
}) {
    const content = {
        leads: {
            icon: Users,
            title: 'Lead Limit Reached',
            description: 'You\'ve used all your free leads. Upgrade to continue generating leads and grow your business.',
        },
        calls: {
            icon: Phone,
            title: 'Call Limit Reached',
            description: 'You\'ve used all your free calls. Upgrade to continue making AI-powered market research calls.',
        },
        both: {
            icon: Lock,
            title: 'Free Trial Complete',
            description: 'You\'ve experienced the power of ValidateCall. Upgrade now to unlock unlimited access.',
        }
    };

    const { icon: Icon, title, description } = content[type];

    const plans = [
        {
            name: 'Lite',
            price: '$197',
            features: ['2 Phone Numbers', '100 Calls/Day', '10K Leads/Month'],
            popular: false
        },
        {
            name: 'Starter',
            price: '$497',
            features: ['5 Phone Numbers', '250 Calls/Day', 'Unlimited Leads'],
            popular: true
        },
        {
            name: 'Pro',
            price: '$1,337',
            features: ['10 Phone Numbers', '500 Calls/Day', 'Priority Support'],
            popular: false
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                        <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Usage summary */}
                <div className="flex justify-center gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{leadsUsed}/{leadsLimit}</div>
                        <div className="text-sm text-muted-foreground">Leads Used</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{callsUsed}/{callsLimit}</div>
                        <div className="text-sm text-muted-foreground">Calls Made</div>
                    </div>
                </div>

                {/* Plans preview */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={cn(
                                'relative p-6 rounded-xl border bg-card transition-all',
                                plan.popular
                                    ? 'border-primary shadow-lg shadow-primary/10 scale-105'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                                <div className="text-2xl font-bold text-foreground mt-1">
                                    {plan.price}
                                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button asChild size="lg" variant="hero" className="px-8">
                        <Link to="/billing">
                            <Zap className="h-5 w-5 mr-2" />
                            View All Plans
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                    </Button>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Cancel anytime. No long-term contracts.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HardPaywall;
