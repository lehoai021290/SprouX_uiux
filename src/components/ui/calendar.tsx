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
 * Figma variants: Type=Basic (1 month) | Type=Range (2 months side-by-side).
 *
 * Sub-components (Figma instances):
 * - Date Picker / Header (264:29273): nav buttons (Icon Button Outline Small 32×32 r=8) + title (14px/600)
 * - .Date Picker / Weekday Name (22:7455): 48×32 in grid, text 12px/400 muted-foreground
 * - Date Picker / Day (781:40922): 48×48 r=4 p=8
 *   States: Default(bg-card), Hover(bg-accent), Selected(bg-primary text-primary-foreground),
 *           Disabled(bg-background text-muted-foreground), Focus(bg-primary + ring)
 *   Position: Single(r=4), Start(r-left), End(r-right), Middle(r=0, selected=bg-accent text-foreground)
 *
 * Layout: container no padding (popover provides p-sm), header-to-grid gap=16px, row gap=1px, multi-month gap=16px.
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
        /* ── Layout ── */
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

        /* ── Weekday Name (Figma: .Date Picker / Weekday Name 48×32) ── */
        weekday:
          "text-muted-foreground rounded-sm w-[48px] h-[32px] font-normal text-[12px] leading-[16px]",

        /* ── Day cell wrapper (Figma: Date Picker / Day — Position handling) ── */
        day: cn(
          "relative p-0 text-center typo-paragraph-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has(>.day-range-end)]:rounded-r-sm [&:has(>.day-range-start)]:rounded-l-sm first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm"
            : "[&:has([aria-selected])]:rounded-sm"
        ),

        /* ── Day button (Figma: Day Size=Large 48×48 r=4 p=8)
              Default: bg-card (white), Hover: bg-accent (muted) ── */
        day_button:
          "inline-flex items-center justify-center size-[48px] rounded-sm p-xs typo-paragraph-sm font-normal bg-card text-foreground transition-colors hover:bg-accent aria-selected:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",

        /* ── Day states (Figma: Date Picker / Day States) ── */
        range_start: "day-range-start rounded-l-sm",
        range_end: "day-range-end rounded-r-sm",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-sm",
        today: "ring-1 ring-primary/40 rounded-sm",
        outside:
          "day-outside text-muted-foreground/40 aria-selected:text-primary-foreground/70",
        disabled: "bg-background text-muted-foreground cursor-not-allowed",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-foreground aria-selected:rounded-none aria-selected:hover:bg-accent/80",
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
