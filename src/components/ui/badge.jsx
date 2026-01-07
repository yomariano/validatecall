import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 uppercase tracking-wide',
    {
        variants: {
            variant: {
                default:
                    'border border-transparent bg-primary/20 text-primary',
                secondary:
                    'border border-transparent bg-secondary text-secondary-foreground',
                destructive:
                    'border border-transparent bg-destructive/20 text-destructive',
                outline: 'border border-border text-foreground',
                success:
                    'border border-transparent bg-success/20 text-success',
                warning:
                    'border border-transparent bg-warning/20 text-warning',
                info:
                    'border border-transparent bg-info/20 text-info',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
