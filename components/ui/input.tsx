import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
        "min-w-0 flex-1",

        // Border and background
        "bg-gradient-to-br from-black/20 via-black/30 to-black/40",
        "backdrop-blur-xl backdrop-saturate-150",
        "dark:from-black/30 dark:via-black/40 dark:to-black/50",

        // Placeholder + selection
        "text-white/90 placeholder:text-amber-100/40",
        "dark:text-white/95 dark:placeholder:text-amber-200/35",

        // Selection styling
        "selection:bg-amber-400/80 selection:text-black",

        // File input styles
        "file:mr-3 file:h-8 file:border-0 file:bg-gradient-to-r file:from-amber-500/20 file:to-amber-600/20",
        "file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-200",
        "file:backdrop-blur-sm file:transition-all file:duration-200",
        "file:hover:from-amber-500/30 file:hover:to-amber-600/30 file:hover:text-amber-100",

        // Focus ring & border
        "focus-visible:border-amber-400/70 focus-visible:ring-2 focus-visible:ring-amber-300/40",
        "focus-visible:shadow-xl focus-visible:shadow-amber-500/20",
        "focus-visible:bg-gradient-to-br focus-visible:from-black/30 focus-visible:via-black/40 focus-visible:to-black/50",

        // Error state
        "aria-invalid:border-red-400/60 aria-invalid:ring-2 aria-invalid:ring-red-500/30",
        "aria-invalid:shadow-lg aria-invalid:shadow-red-500/20",
        "aria-invalid:bg-gradient-to-br aria-invalid:from-red-950/20 aria-invalid:via-black/30 aria-invalid:to-red-950/20",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-40",
        "disabled:bg-gradient-to-br disabled:from-gray-900/20 disabled:via-gray-800/30 disabled:to-gray-900/20",
        "disabled:border-gray-600/30 disabled:text-gray-500/50",
        "disabled:shadow-none disabled:backdrop-blur-sm",

        // Smooth transitions for all states
        "transition-[all] duration-200 ease-out",

        className
      )}
      {...props}
    />
  )
}

export { Input }
