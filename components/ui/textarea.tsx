import * as React from "react"
import { Funnel_Display } from "next/font/google"

import { cn } from "@/lib/utils"

const funnelDisplay = Funnel_Display({
  weight: "300",
})

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Font
        funnelDisplay.className,

        // Layout
        "flex field-sizing-content min-h-20 w-full max-w-xl px-3 py-2 resize-none",

        // Typography
        "text-base md:text-sm text-white placeholder:text-yellow-200/40",

        // Border and background
        "rounded-3xl border border-amber-300/50 bg-black/20 backdrop-blur-lg",
        "dark:bg-input/30",

        // Focus styles
        "outline-none focus-visible:border-amber-300 focus-visible:ring-amber-300/50 focus-visible:ring-[1px]",

        // Error states
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

        // Transitions and disabled state
        "shadow-xs transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }
