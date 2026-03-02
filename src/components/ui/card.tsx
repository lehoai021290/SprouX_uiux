import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * SprouX Card
 *
 * Figma: [SprouX - DS] Foundation & Component (node 179:29234)
 *
 * Component sets:
 *   - Card (179:29234): Show Title (True/False), Spacing (16px/24px)
 *   - Card inner (2108:2660): nested card variant
 *   - Title/Card (2575:5379): Back, Badge, Description, Decoration right, Spacing
 *
 * Figma specs:
 *   Container: r=8 (rounded-lg), border=--border, bg=--background, no shadow
 *   Spacing=16px: pad=16 all sides → p-md
 *   Spacing=24px: pad=24 all sides → p-xl
 *   Title/Card: pad=[16,16,16,0] or [24,24,24,0], gap=4
 *   Title text: heading-4 (18px/600)
 *   Description: paragraph-sm (14px/400) muted-foreground
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border border-border bg-background text-card-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2xs p-md pb-0", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("typo-heading-4 text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("typo-paragraph-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-md pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-md pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
