import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stripeApi, vapiApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Check, Phone, Zap, Building2, Loader2, ExternalLink } from 'lucide-react';

export default function Pricing() {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [phoneStats, setPhoneStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load plans
            const plansData = await stripeApi.getPlans();
            setPlans(plansData || []);

            // Load user subscription if logged in
            if (user?.id) {
                const [subData, statsData] = await Promise.all([
                    stripeApi.getSubscription(user.id).catch(() => null),
                    vapiApi.getUserPhoneStats(user.id).catch(() => null),
                ]);
                setSubscription(subData);
                setPhoneStats(statsData);
            }
        } catch (error) {
            console.error('Failed to load pricing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (planId) => {
        if (!user?.id) {
            alert('Please log in to subscribe');
            return;
        }

        try {
            setRedirecting(planId);
            const { url } = await stripeApi.getPaymentLink(planId, user.id);
            window.location.href = url;
        } catch (error) {
            console.error('Failed to get payment link:', error);
            alert('Failed to start checkout. Please try again.');
            setRedirecting(null);
        }
    };

    const formatPrice = (cents) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const getPlanIcon = (planId) => {
        switch (planId) {
            case 'basic': return <Phone className="h-6 w-6" />;
            case 'pro': return <Zap className="h-6 w-6" />;
            case 'enterprise': return <Building2 className="h-6 w-6" />;
            default: return <Phone className="h-6 w-6" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen -mt-8 pt-8 px-4 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="relative z-10 space-y-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in">
                    <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary rounded-full">
                        Pricing Plans
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Scale your outbound calling with automated phone number provisioning.
                        No hidden fees, just growth.
                    </p>
                </div>

                {/* Current Subscription Status */}
                {subscription && (
                    <Card className="border-primary/20 bg-white/50 backdrop-blur-xl shadow-xl animate-scale-in">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        Current Plan: <span className="text-primary font-bold">{subscription.plan?.name || subscription.plan_id}</span>
                                        <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Your subscription renews on <span className="font-medium text-foreground">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                                    </CardDescription>
                                </div>
                                <Zap className="h-8 w-8 text-primary/40 animate-pulse-soft" />
                            </div>
                        </CardHeader>
                        {phoneStats && (
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Daily Call Capacity</span>
                                            <span className="font-bold">{phoneStats.usedToday} / {phoneStats.totalDailyCapacity} <span className="text-xs text-muted-foreground">calls</span></span>
                                        </div>
                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${(phoneStats.usedToday / phoneStats.totalDailyCapacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{phoneStats.totalNumbers}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Numbers</div>
                                        </div>
                                        <div className="text-center border-x border-border/50">
                                            <div className="text-xl font-bold text-primary">{phoneStats.remainingToday}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Remaining</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{phoneStats.activeNumbers}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {plans.map((plan, index) => {
                        const isCurrentPlan = subscription?.plan_id === plan.id;
                        const features = typeof plan.features === 'string'
                            ? JSON.parse(plan.features)
                            : plan.features || [];
                        const isPro = plan.id === 'pro';

                        return (
                            <Card
                                key={plan.id}
                                className={`group relative flex flex-col transition-all duration-500 border-white/20 bg-white/40 backdrop-blur-md shadow-2xl animate-slide-up hover:-translate-y-2 ${isPro ? 'ring-2 ring-primary shadow-glow scale-[1.02] bg-white/60' : ''} ${isCurrentPlan ? 'opacity-90' : ''}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {isPro && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <span className="bg-linear-to-r from-primary to-accent text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                {isCurrentPlan && (
                                    <div className="absolute -top-4 right-4 z-20">
                                        <Badge className="bg-success text-white border-none shadow-md">
                                            Current Plan
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="text-center pb-8 pt-10">
                                    <div className={`mx-auto mb-6 p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isPro ? 'bg-primary/10 text-primary shadow-glow' : 'bg-muted/50 text-muted-foreground'}`}>
                                        {getPlanIcon(plan.id)}
                                    </div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">{plan.name}</CardTitle>
                                    <CardDescription className="min-h-[40px] px-6">{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-grow flex flex-col items-center">
                                    <div className="mb-8 flex items-baseline gap-1">
                                        <span className="text-5xl font-black tracking-tighter">{formatPrice(plan.price_monthly)}</span>
                                        <span className="text-muted-foreground font-medium">/mo</span>
                                    </div>

                                    <div className="w-full space-y-4 px-2">
                                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Numbers</span>
                                                <span className="text-sm font-bold text-primary">{plan.phone_numbers_included} Included</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Capacity</span>
                                                <span className="text-sm font-bold text-primary">{plan.phone_numbers_included * plan.daily_calls_per_number} Calls</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5">
                                            {features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3 group/item">
                                                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-success/10 flex items-center justify-center">
                                                        <Check className="h-2.5 w-2.5 text-success" />
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground/80 leading-tight group-hover/item:text-foreground transition-colors">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-8 pb-10">
                                    <Button
                                        className={`w-full h-12 text-sm font-bold transition-all duration-300 rounded-xl ${isPro ? 'bg-primary hover:bg-accent text-white shadow-lg hover:shadow-primary/25' : 'bg-secondary hover:bg-secondary/80 text-foreground border-none'}`}
                                        disabled={isCurrentPlan || redirecting === plan.id}
                                        onClick={() => handleSelectPlan(plan.id)}
                                    >
                                        {redirecting === plan.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Initializing...
                                            </>
                                        ) : isCurrentPlan ? (
                                            'Active Subscription'
                                        ) : (
                                            <>
                                                {subscription ? (plan.price_monthly > (subscription.plan?.price_monthly || 0) ? 'Upgrade Now' : 'Change Plan') : 'Get Started Now'}
                                                <ExternalLink className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Phone Numbers Section */}
                {phoneStats && phoneStats.numbers?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Phone Numbers</CardTitle>
                            <CardDescription>
                                These numbers are automatically rotated when making outbound calls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {phoneStats.numbers.map((phone) => (
                                    <div
                                        key={phone.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-mono">{phone.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-muted-foreground">
                                                {phone.dailyCallsUsed} / {phone.dailyCallsLimit} today
                                            </div>
                                            <Progress
                                                value={(phone.dailyCallsUsed / phone.dailyCallsLimit) * 100}
                                                className="w-24"
                                            />
                                            <Badge variant={phone.available ? 'default' : 'secondary'}>
                                                {phone.available ? 'Available' : 'Limit Reached'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* How It Works Section */}
                <div className="space-y-8 py-12">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">How automated calling works</h2>
                        <p className="text-muted-foreground">Everything you need to scale your outreach without the manual work</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: "01", title: "Choose a plan", desc: "Select the plan that fits your calling volume needs." },
                            { step: "02", title: "Auto-provisioning", desc: "Phone numbers are automatically purchased and configured." },
                            { step: "03", title: "Smart rotation", desc: "Calls are rotated across numbers to avoid spam filters." },
                            { step: "04", title: "Daily reset", desc: "Usage counters reset at midnight for fresh daily capacity." }
                        ].map((item, i) => (
                            <div key={i} className="relative group p-6 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/50 transition-all duration-300">
                                <span className="absolute -top-4 -left-4 text-6xl font-black text-primary/10 select-none group-hover:text-primary/20 transition-colors">
                                    {item.step}
                                </span>
                                <div className="relative pt-4">
                                    <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
