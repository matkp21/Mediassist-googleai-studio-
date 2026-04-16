import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // md:text-sm was there, but text-base for mobile and text-sm for md seems better for Apple-like feel
          // Let's use text-sm consistently for inputs, and text-base for larger text areas or displays.
          // Or use text-sm for mobile and md:text-base for desktop.
          // Apple typically uses slightly larger default text on mobile.
          // Sticking to text-sm for consistency in forms.
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
