import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

function Spinner({ className, size = 'default' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    }

    return (
        <Loader2
            className={cn('animate-spin text-primary', sizeClasses[size], className)}
        />
    )
}

function LoadingState({ message = 'Loading...', className }) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-muted-foreground', className)}>
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <Spinner size="lg" className="relative" />
            </div>
            <p className="mt-4 text-sm font-medium animate-pulse-soft">{message}</p>
        </div>
    )
}

function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
            {Icon && (
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            {title && (
                <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            )}
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    )
}

// Skeleton loading component
function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                'rounded-md bg-muted animate-pulse',
                className
            )}
            {...props}
        />
    )
}

export { Spinner, LoadingState, EmptyState, Skeleton }
