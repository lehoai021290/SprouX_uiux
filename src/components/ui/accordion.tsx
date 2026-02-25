import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * SprouX Accordion
 *
 * Figma: [SprouX - DS] Foundation & Component (node 66:5034)
 *
 * Vertically collapsible content sections.
 *
 * Variants (Accordion Trigger):
 *   State:    Default | Hover | Focus
 *   Type:     Open | Closed
 *   End Item: False | True
 *
 * Specs:
 *   Trigger row:  py-sm (12px), gap-xs (8px), items-center, rounded-lg
 *   Label:        text-sm (14px/20px), font-semibold (600), tracking-sm, text-foreground
 *   Icon:         size-md (16px), text-ghost-foreground (#6f6f6a), rotates on open
 *   Content:      pb-sm (12px), text-sm, font-normal, tracking-sm, text-foreground
 *   Separator:    1px border-border, hidden on last item (End Item=True)
 *   Hover:        No visual change
 *   Focus:        ring-focus (3px var(--ring)), rounded-lg
 */
function Accordion(
  props: React.ComponentProps<typeof AccordionPrimitive.Root>
) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-xs py-sm text-sm font-semibold tracking-sm text-foreground transition-all text-left rounded-lg focus-visible:ring-focus focus-visible:outline-none [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden="true" className="size-md shrink-0 text-ghost-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm tracking-sm text-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-sm pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
