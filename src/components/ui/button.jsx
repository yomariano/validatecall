import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'bg-primary shadow-md hover:bg-primary/90 hover:shadow-glow',
                destructive:
                    'bg-destructive shadow-md hover:bg-destructive/90',
                outline:
                    'border border-input bg-transparent hover:bg-secondary hover:text-secondary-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost: 'hover:bg-secondary hover:text-secondary-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                success:
                    'bg-success shadow-md hover:bg-success/90 hover:shadow-glow-success',
                warning:
                    'bg-warning shadow-md hover:bg-warning/90 hover:shadow-glow-warning',
                gradient:
                    'bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end shadow-md hover:opacity-90 hover:shadow-glow',
                hero: 'bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_10px_30px_-10px_hsl(199_89%_48%_/_0.5)] hover:shadow-[0_15px_40px_-10px_hsl(199_89%_48%_/_0.7)] hover:scale-105 hover:brightness-110',
                heroOutline: 'border-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary hover:scale-105',
            },
            size: {
                default: 'h-10 px-5 py-2',
                sm: 'h-9 rounded-md px-4 text-xs',
                lg: 'h-12 rounded-xl px-8 text-base',
                xl: 'h-14 rounded-xl px-10 text-lg',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

// Variants that need white text
const whiteTextVariants = ['default', 'destructive', 'success', 'gradient']
// Variants that need dark text
const darkTextVariants = ['warning']

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, style, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'

        // Determine text color based on variant
        let textColor = undefined
        if (whiteTextVariants.includes(variant)) {
            textColor = '#ffffff'
        } else if (darkTextVariants.includes(variant)) {
            textColor = '#111827'
        }

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                style={{ color: textColor, ...style }}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
