import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

import { buttonVariants } from "./buttonVariants";

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

export { Button }
