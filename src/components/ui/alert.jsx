import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

const alertVariants = cva(
    'relative w-full rounded-xl border p-4 transition-all duration-300 animate-slide-up',
    {
        variants: {
            variant: {
                default: 'bg-card text-foreground border-border',
                destructive:
                    'border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive',
                success:
                    'border-success/50 bg-success/10 text-success [&>svg]:text-success',
                warning:
                    'border-warning/50 bg-warning/10 text-warning [&>svg]:text-warning',
                info:
                    'border-info/50 bg-info/10 text-info [&>svg]:text-info',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

const iconMap = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
}

const Alert = React.forwardRef(({ className, variant = 'default', children, onClose, ...props }, ref) => {
    const Icon = iconMap[variant]

    return (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        >
            <div className="flex gap-3">
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{children}</div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 rounded-md p-1 hover:bg-foreground/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
})
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
        {...props}
    />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-sm opacity-90 [&_p]:leading-relaxed', className)}
        {...props}
    />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
