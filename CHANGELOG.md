# SprouX Design System — Changelog

All notable changes to the SprouX Design System are documented here.
Organized by development phase. Scope: Components, Foundation Tokens, Figma Plugin, Showcase Docs.

---

## [Unreleased]

### Added
- **Label**: `size` prop via CVA — Small (14/20) and Regular (16/24) per Figma spec (103:9453)

### Fixed
- **Drawer docs**: rewrite to AlertDialog pattern — static face previews, `DrawerExploreBehavior` with Show Title/Description/Footer controls, `DrawerPropsTable` (10 sub-components), `DrawerTokensTable` (11 tokens with light/dark), FigmaMapping nodeId, Accessibility keyboard table
- **Label docs**: rewrite to 11-section standard — Explore Behavior with Size/Layout controls, fix Example code/JSX mismatch, add FigmaMapping nodeId, fix spacing tokens (`gap-2` → `gap-xs`)
- **Drawer**: add `shadow` per Figma DROP_SHADOW, fix handle size 50×3px (was 100×6px)
- **NavigationMenu**: fix popover clipping in Example cards (`overflow-visible`)
- **Drawer docs**: rewrite to 11-section standard (was using `<Playground>` generic)
- **Example component**: `overflow-hidden` → `overflow-visible` to prevent popover/dropdown clipping

---

## Phase 3 — Gold Standard Quality (Feb 17 – Mar 3, 2026)

Per-component refinement to 11-section docs standard, Figma API verification, Explore Behavior with toggle buttons, plugin development, foundation sync.

### Components

- **Accordion**: 15 iterations — Explore Behavior rewrite (static variant preview → real component + toggle controls), focus ring shadow, foundation text styles, Disabled example
- **Alert**: Figma sync (5 variants), `inCard` prop, icon swap, Show Action/Secondary dependency, 5 new examples, title/subtitle auto-toggle
- **Alert Dialog**: all 8 Figma properties in Explore Behavior, icon picker, Slot swap (Text/Congratulation), static preview pattern for Radix context crash
- **Avatar**: Explore Behavior with force re-mount on value switch, border per Figma spec, Avatar Stack example
- **Badge**: rewrite per Figma spec — Label/Round/Dot tabs, new CSS tokens (`--badge-*`), State property
- **Breadcrumb**: upgrade to gold-standard docs
- **Button**: 11-section docs, IconButton component (Figma 4838:17100), icon picker for Left/Right icons
- **ButtonGroup**: new component + Figma sync, Tabs-based Explore Behavior
- **Calendar**: nav layout `around` with CSS Grid, dropdown header fix, Day 48×48 grid sizing, range middle styling
- **Card**: Figma sync — `rounded-lg` (8px), `bg-background`, CardInner, Show Title switch
- **Carousel**: new component + docs page
- **Checkbox**: 4-tab Explore Behavior (Checkbox/Group/Rich/Rich Advanced), aligner pattern for multi-line, Badge component instances
- **Chip**: new component + docs page, text color sync, selected border fix
- **Collapsible**: add info panel, Props/Design Tokens sections, FigmaMapping
- **Command**: Figma sync (66:5046), Explore Behavior section title fix
- **Context Menu**: add Props section, fix section order, Design Tokens
- **Data Table**: new docs page — single cell preview, tooltip dashed underline, actions auto-align right, empty state, row selection highlight
- **DatePicker**: Figma sync — Input-style trigger, Calendar sizing, DateRangePicker, label/time props
- **Dialog**: static preview pattern, interactive Explore Behavior, close button `rounded-md`
- **Navigation Menu**: token alignment, `viewport={false}` support, ChevronDown component

### Foundation Tokens

- Typography rename: `text-*` → `typo-*` prefix (tailwind-merge conflict fix)
- `card-subtle` tokens for nested surfaces
- `outline-bg`/`outline-hover`/`ghost-hover` dark mode rgba corrections
- `shadow-color` token with dark mode support
- Dark mode `--border` slate-800 → slate-700 for accent contrast
- `--spacing-3xs` = 4px correction
- **1,041 tokens** synced bidirectionally with Figma (0 diffs)

### Figma Plugin

- 3-tab UI redesign: Foundation / Generate UI / Export Foundation
- `roots[]` multi-frame support
- Cross-collection variable lookup (full key: `collectionName/varName`)
- `loadFontSafe()` with weight-adjacent fallbacks (SemiBold → Bold → Medium → Regular)
- Effect array builder: `blendMode` for shadows only (not blurs), build-before-create pattern
- Auto-fetch JSON from dev server
- File picker for foundation JSON

### Showcase Docs

- **11-section standard**: TOC, Header, Explore Behavior, Installation, Examples (≥3, 2-col grid), Props, Design Tokens, Best Practices (Do/Don't), Figma Mapping, Accessibility, Related Components
- **Explore Behavior**: toggle buttons (not Select dropdowns), vertical controls layout, inline tabs for multi-component
- **Example code prop = rendered JSX** enforcement (100% identical)
- **IconPicker**: searchable Lucide catalog (~1,500 icons), `text-muted-foreground`
- **InstallationSection**: hover-reveal Copy button
- Card visual consistency: `rounded-xl`, `border-border`, `bg-muted/50` headers
- All floating panels use `bg-card` token
- Upgrade all 43+ component docs to standard structure

---

## Phase 2 — Showcase & Docs Infrastructure (Feb 15 – 17, 2026)

Website redesign, interactive playgrounds, icon catalog, dark mode setup.

### Components

- 6 optional components: InputOTP, Spinner, HoverCard, AspectRatio, ContextMenu, Sidebar

### Foundation Tokens

- Dark mode: remove shadcn HSL indirection, use direct hex values
- Focus ring styles aligned with Figma specs
- Semantic tokens adopted across 14 components
- Hardcoded Tailwind values replaced across 20 components

### Showcase Docs

- Website redesign: hero page → M3-inspired → shadcnstudio.com layout
- A→Z component sorting, Foundations separated from Components
- Interactive playground added to all 43 doc pages
- Figma Component Mapping added to all 43 doc pages
- Full Lucide icon catalog (1,668 icons) with search and pagination
- Icons & Illustrations Foundation pages with Figma-exported assets
- Missing Import sections added to 12 doc pages
- URL hash persistence for active page
- Accessibility improvements across breadcrumb, table, accordion, calendar

---

## Phase 1 — Foundation & Initial Components (Feb 12 – 14, 2026)

Project setup, 38+ components, Figma token alignment.

### Components (38 initial)

**Forms**: Button, Input, Textarea, Select, Checkbox, Radio Group, Label, Toggle, Toggle Group, Switch, Slider, Form, Calendar, DatePicker, Combobox
**Data Display**: Table, Badge, Card, Avatar, Progress, Separator, Skeleton
**Overlay & Feedback**: Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Toast (Sonner), Alert
**Navigation**: Tabs, Breadcrumb, Pagination, DropdownMenu, Command
**Layout**: Accordion, Collapsible, ScrollArea

### Foundation Tokens

- Initial site setup with Tailwind v4
- Component tokens aligned with Figma design specs
- Hardcoded values replaced with foundation spacing/color tokens
- `--spacing-2xs` corrected to 6px per Figma
- Button icon size corrected to `size-md` (16px)
- Select: 6 Figma mismatches corrected

### Showcase Docs

- Initial showcase website with sidebar navigation
- DoItem/DontItem components for best practices
- Per-component documentation pages
