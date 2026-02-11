import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

/**
 * SprouX Button
 *
 * Figma: [SprouX - DS] Foundation & Component (node 9:1071)
 *
 * Variants: default | secondary | outline | ghost | ghost-muted | destructive | destructive-secondary
 * Sizes:    lg (40px) | default (36px) | sm (32px) | xs/mini (24px) | icon | icon-sm | icon-lg
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold font-body transition-colors focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-teal-600 active:bg-teal-600 focus-visible:ring-border",
        secondary:
          "bg-slate-200 text-slate-900 hover:bg-slate-100 active:bg-slate-100 focus-visible:ring-border",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-slate-100 active:bg-slate-100 focus-visible:ring-border",
        ghost:
          "bg-transparent text-slate-700 hover:bg-black/5 active:bg-black/5 focus-visible:ring-border",
        "ghost-muted":
          "bg-transparent text-muted-foreground hover:bg-black/5 active:bg-black/5 focus-visible:ring-border",
        destructive:
          "bg-destructive text-white hover:bg-red-700 active:bg-red-700 focus-visible:ring-red-200",
        "destructive-secondary":
          "bg-red-50 text-red-600 border border-red-500 hover:bg-red-100 active:bg-red-100 focus-visible:ring-red-200",
      },
      size: {
        lg: "h-10 px-6 gap-2 text-sm tracking-[0.07px] [&_svg:not([class*='size-'])]:size-5",
        default:
          "h-9 px-4 gap-2 text-sm tracking-[0.07px] [&_svg:not([class*='size-'])]:size-5",
        sm: "h-8 px-3 gap-1.5 text-sm tracking-[0.07px] [&_svg:not([class*='size-'])]:size-5",
        xs: "h-6 px-2 gap-1 text-xs tracking-[0.18px] [&_svg:not([class*='size-'])]:size-4",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
