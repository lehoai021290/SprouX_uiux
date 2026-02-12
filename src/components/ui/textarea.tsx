import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * SprouX Textarea
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Single size: min-h 76px, p-2, rounded-lg
 * States: default | focus | error (aria-invalid) | error+focus | disabled
 */
const textareaVariants = cva(
  "flex w-full min-h-[76px] bg-input border border-border rounded-lg p-2 font-body font-normal text-sm tracking-[0.07px] text-foreground placeholder:text-muted-foreground transition-colors resize focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:not-placeholder-shown:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error aria-invalid:focus-visible:not-placeholder-shown:border-destructive-border"
)

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants(), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
