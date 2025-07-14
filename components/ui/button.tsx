import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Funnel_Display } from "next/font/google";


import { cn } from "@/lib/utils"

const funnelDisplay = Funnel_Display({
  weight: "300"
})

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-600 text-white shadow-sm hover:bg-yellow-700 focus-visible:ring-yellow-500",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
        outline:
          "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-yellow-500",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500",
        glass:
          "bg-black/10 backdrop-blur-md border border-white/20 text-white shadow-inner hover:bg-yellow-700/25 hover:shadow-lg focus-visible:ring-white",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
        link:
          "text-yellow-600 underline-offset-4 hover:underline focus-visible:ring-yellow-500",
      },
      size: {
        default: "h-9 rounded-lg px-4 py-2",
        sm: "h-8 rounded-md px-3 py-1.5",
        lg: "h-10 rounded-md px-6 py-2.5",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(funnelDisplay.className, buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
