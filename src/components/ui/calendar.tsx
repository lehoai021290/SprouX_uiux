import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * SprouX Calendar
 *
 * Figma: [SprouX - DS] Foundation & Component
 *   - Calendar (4820:5638): card wrapper p=16 r=8
 *   - Date Picker (288:119954): Type, Style, Size
 *   - Date Picker / Header (264:29273): [IconButton 32×32] [Caption] [IconButton 32×32]
 *   - Date Picker / Day (781:40922): 32×32 (Small) | 48×48 (Large/Custom)
 *
 * navLayout="around": PreviousMonthButton + NextMonthButton as children of Month.
 * CSS Grid on month: row 1 = [prev | caption | next], row 2 = [grid col-span-full].
 *
 * Dropdown component (Dropdown.js) renders:
 *   <span.dropdown_root>
 *     <select.dropdown />           ← interactive, visually hidden (opacity-0 absolute)
 *     <span.caption_label>          ← display text + Chevron icon
 *       "March" <Chevron down />
 *     </span>
 *   </span>
 *
 * captionLayout mapping:
 *   "label"           → 1 Month / 2 Months (text title)
 *   "dropdown"        → Year and Month (both selects)
 *   "dropdown-months" → Only Month (month select + year text)
 *   "dropdown-years"  → Only Year (year select + month text)
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
      navLayout="around"
      className={cn("p-md", className)}
      classNames={{
        /* ── Layout ── */
        months: "flex flex-col sm:flex-row gap-md",

        /* ── Month: CSS Grid — row 1 = header, row 2 = grid ── */
        month: "grid grid-cols-[auto_1fr_auto] gap-y-md",
        month_grid: "col-span-full w-full border-collapse",
        weekdays: "flex",
        week: "flex w-full mt-[1px]",

        /* ── Header (Figma: 264:29273)
              NavButtons = Icon Button Outline 32×32 r=8 p=7 ── */
        month_caption:
          "col-start-2 row-start-1 flex items-center justify-center h-[32px]",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "!size-[32px] rounded-lg p-[7px] col-start-1 row-start-1 self-center"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "!size-[32px] rounded-lg p-[7px] col-start-3 row-start-1 self-center"
        ),

        /* ── Caption label: visible in "label" mode as title,
              visible in "dropdown" mode as display text inside dropdown_root.
              In dropdown_root context: styled as Select trigger (r=8 h=32 px=8 border) ── */
        caption_label:
          "typo-paragraph-sm font-semibold inline-flex items-center gap-[6px]",

        /* ── Dropdowns container ── */
        dropdowns: "flex items-center gap-xs",

        /* ── Each dropdown: root wraps <select> + <span.caption_label>
              Select is hidden (opacity-0 absolute), caption_label is the visible trigger
              styled as Figma Select & Combobox (r=8 h=32 px=8 gap=6 border) ── */
        dropdown_root:
          "relative inline-flex items-center bg-input border border-border rounded-lg h-[32px] px-xs",
        dropdown: "absolute inset-0 w-full opacity-0 cursor-pointer",
        months_dropdown: "absolute inset-0 w-full opacity-0 cursor-pointer",
        years_dropdown: "absolute inset-0 w-full opacity-0 cursor-pointer",

        /* ── Chevron icon (used in nav buttons AND dropdown indicators) ── */
        chevron: "size-[18px]",

        /* ── Weekday Name (Figma: 32×32, 12px/400) ── */
        weekday:
          "text-muted-foreground w-[32px] h-[32px] font-normal text-[12px] leading-[16px] flex items-center justify-center",

        /* ── Day cell wrapper (32×32 grid cell) ── */
        day: cn(
          "relative p-0 text-center typo-paragraph-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-sm [&:has(>.day-range-start)]:rounded-l-sm first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm"
            : "[&:has([aria-selected])]:rounded-sm"
        ),

        /* ── Day button (Figma: 32×32 r=4) ── */
        day_button:
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm size-[32px] typo-paragraph-sm font-normal bg-card text-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none",

        /* ── Day states ── */
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground rounded-sm",
        range_start:
          "day-range-start [&>button]:rounded-l-sm [&>button]:rounded-r-none",
        range_end:
          "day-range-end [&>button]:rounded-r-sm [&>button]:rounded-l-none",
        range_middle:
          "[&>button]:aria-selected:bg-accent [&>button]:aria-selected:text-foreground [&>button]:aria-selected:rounded-none [&>button]:aria-selected:hover:bg-accent/80",
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
