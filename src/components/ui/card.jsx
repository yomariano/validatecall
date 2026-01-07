import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'rounded-xl border border-border bg-card text-card-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20',
            className
        )}
        {...props}
    />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
    />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-xl font-semibold leading-none tracking-tight text-foreground',
            className
        )}
        {...props}
    />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
    />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
    />
))
CardFooter.displayName = 'CardFooter'

// Stat Card Component with Glow Effect
const StatCard = React.forwardRef(
    ({ className, variant = 'default', value, label, icon: Icon, ...props }, ref) => {
        const variantClasses = {
            default: 'border-border hover:border-primary/40 hover:shadow-glow',
            success: 'border-success/30 hover:border-success/60 hover:shadow-glow-success',
            warning: 'border-warning/30 hover:border-warning/60 hover:shadow-glow-warning',
            danger: 'border-destructive/30 hover:border-destructive/60',
            info: 'border-info/30 hover:border-info/60 hover:shadow-glow-info',
        }

        const valueClasses = {
            default: 'text-primary',
            success: 'text-success',
            warning: 'text-warning',
            danger: 'text-destructive',
            info: 'text-info',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'group relative overflow-hidden rounded-xl border-2 bg-card p-6 text-center shadow-lg transition-all duration-300',
                    variantClasses[variant],
                    className
                )}
                {...props}
            >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                    {Icon && (
                        <div className={cn('mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary', valueClasses[variant])}>
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                    <span className={cn('block text-4xl font-bold tracking-tight', valueClasses[variant])}>
                        {value}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground font-medium">
                        {label}
                    </span>
                </div>
            </div>
        )
    }
)
StatCard.displayName = 'StatCard'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatCard }
