import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * SprouX Calendar
 *
 * Figma: [SprouX - DS] Foundation & Component (node 288:119954)
 *
 * Date picker calendar built on react-day-picker v9.
 * Properties:
 *   Type:  Basic (1 month) | Range (2 months side-by-side)
 *   Style: 1 Month | 2 Month | Year and Month | Only Month | Only Year
 *   Size:  Small (default) | Large | Custom days
 *
 * Grid layout (Figma Size=Small — default):
 * - Day cell: 32×32, r=4, pad=8 internal  |  Weekday cell: 32×32
 * - Grid width: 7×32 = 224px  |  Row gap: 1px vertical, 0px horizontal
 * - Header-to-grid gap: 16px  |  Multi-month gap: 16px
 * - Container: no padding (Date Picker wraps with Popover p-0)
 *
 * Grid layout (Figma Size=Large):
 * - Day cell: 48×48  |  Weekday cell: 48×32  |  Grid width: 7×48 = 336px
 *
 * Sub-components (Figma instances):
 * - Date Picker / Header (264:29273): nav buttons (Icon Button Outline Small 32×32 r=8) + title (14px/600)
 * - .Date Picker / Weekday Name (22:7455): 32×32 in grid (Small), text 12px/400 muted-foreground
 * - Date Picker / Day (781:40922):
 *   Position: Default | Single(r=4 all) | Start(r-left=4 r-right=0) | End(r-left=0 r-right=4) | Middle(r=0)
 *   State:    Default(bg-card) | Hover(bg-accent) | Selected(bg-primary text-primary-foreground)
 *             | Disabled(opacity-50) | Focus(ring-3 ring-ring) | Selected Disable(bg-primary opacity-50)
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn("p-sm", className)}
      classNames={{
        /* ── Layout (Figma Size=Small: 7×32=224px grid) ── */
        months: "relative flex flex-col sm:flex-row gap-md",
        month: "flex flex-col gap-md",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        week: "flex w-full mt-[1px]",

        /* ── Header (Figma: Date Picker / Header) ── */
        month_caption: "flex justify-center items-center h-2xl",
        caption_label: "typo-paragraph-sm font-semibold",
        nav: "absolute top-0 inset-x-0 flex items-center justify-between z-10 h-2xl",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-2xl rounded-lg p-[7px]"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-2xl rounded-lg p-[7px]"
        ),

        /* ── Weekday Name (Figma: 32×32, 12px/400) ── */
        weekday:
          "text-muted-foreground w-[32px] h-[32px] font-normal text-[12px] leading-[16px] flex items-center justify-center",

        /* ── Day cell wrapper (32×32 grid cell, Figma Size=Small)
              rdp v9 applies state classes (selected, disabled, range_middle…)
              to this <td>. The <button> inside carries bg/text styling. ── */
        day: cn(
          "relative p-0 text-center typo-paragraph-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-sm [&:has(>.day-range-start)]:rounded-l-sm first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm"
            : "[&:has([aria-selected])]:rounded-sm"
        ),

        /* ── Day button (Figma: 32×32 r=4)
              Default: bg-card, Hover: bg-accent
              Selected styling managed by state classNames below ── */
        day_button:
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm size-[32px] typo-paragraph-sm font-normal bg-card text-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none",

        /* ── Day states (applied to <td>, target button via [&>button]) ── */

        /* Selected (Single/Default): bg-primary, all corners rounded */
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground rounded-sm",

        /* Range Start: bg-primary (from selected), left corners only */
        range_start:
          "day-range-start [&>button]:rounded-l-sm [&>button]:rounded-r-none",

        /* Range End: bg-primary (from selected), right corners only */
        range_end:
          "day-range-end [&>button]:rounded-r-sm [&>button]:rounded-l-none",

        /* Range Middle: bg-accent (overrides selected via aria-selected higher specificity), no rounding */
        range_middle:
          "[&>button]:aria-selected:bg-accent [&>button]:aria-selected:text-foreground [&>button]:aria-selected:rounded-none [&>button]:aria-selected:hover:bg-accent/80",

        /* Today indicator: inset ring avoids clipping at 32px cells */
        today: "relative z-10 ring-inset ring-1 ring-primary/40 rounded-sm",

        outside:
          "day-outside text-muted-foreground/40 [&>button]:text-muted-foreground/40 [&>button]:aria-selected:text-primary-foreground/70",
        disabled:
          "[&>button]:bg-card [&>button]:text-muted-foreground [&>button]:opacity-50 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon aria-hidden="true" className="size-[18px]" />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
