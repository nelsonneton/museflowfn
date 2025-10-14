# Artist Muse Flow — Design Guidelines

## Design Approach

**Selected Approach:** Design System (Modern SaaS/Productivity)

**Justification:** Artist Muse Flow is a utility-focused, information-dense platform requiring efficiency and learnability across complex workflows. The application demands clear hierarchy, professional aesthetics, and consistent patterns for managing Reality Engine entities, calendars, projects, and analytics.

**Primary References:** Linear (clean typography, subtle interactions), Vercel Dashboard (data visualization), Notion (flexible layouts), and enterprise productivity tools.

**Core Principles:**
- Information clarity over decorative elements
- Dark-mode-first with exceptional contrast
- Predictable navigation and consistent patterns
- Visual hierarchy through typography and spacing, not color
- Minimal but purposeful animations

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 222 47% 11% (deep charcoal)
- Surface Elevated: 220 13% 18% (slate surface)
- Surface Interactive: 217 19% 27% (hover states)
- Border Subtle: 215 20% 65% (dividers)
- Text Primary: 210 40% 98% (headings, labels)
- Text Secondary: 215 16% 65% (descriptions, metadata)

**Brand/Accent Colors:**
- Primary Action: 262 83% 58% (vibrant purple for CTAs, active states)
- Success: 142 76% 36% (approvals, published status)
- Warning: 38 92% 50% (pending, revisions needed)
- Error: 0 84% 60% (inconsistencies, alerts)
- Info: 199 89% 48% (insights, AI suggestions)

**Light Mode (Secondary):**
- Background: 0 0% 100%
- Surface: 210 20% 98%
- Text Primary: 222 47% 11%
- Maintain same accent colors with adjusted opacity

### B. Typography

**Font Stack:**
- Primary: 'Inter' (UI, body, data tables)
- Monospace: 'JetBrains Mono' (code, IDs, timestamps)

**Scale & Hierarchy:**
- Display (Dashboard headers): text-4xl font-bold (36px)
- H1 (Page titles): text-3xl font-semibold (30px)
- H2 (Section headers): text-2xl font-semibold (24px)
- H3 (Card titles): text-lg font-medium (18px)
- Body: text-base (16px)
- Small (metadata): text-sm (14px)
- Micro (timestamps, badges): text-xs (12px)

**Weight Usage:**
- Bold (700): Page titles only
- Semibold (600): Section headers, active nav items
- Medium (500): Card titles, button labels
- Regular (400): Body text, form inputs

### C. Layout System

**Spacing Primitives:** Consistent use of Tailwind units: 2, 4, 8, 12, 16, 24, 32
- Micro spacing (badges, inline elements): p-2, gap-2
- Component internal: p-4, gap-4
- Section padding: p-8 (mobile) to p-12 (desktop)
- Page margins: px-8 md:px-16 lg:px-24
- Grid gaps: gap-4 (cards), gap-8 (major sections)

**Grid Systems:**
- Dashboard: 12-column responsive grid
- Cards: 1-column mobile, 2-3 columns tablet, 3-4 columns desktop
- Data tables: Full-width with horizontal scroll on mobile
- Sidebar navigation: Fixed 280px (desktop), overlay drawer (mobile)

**Responsive Breakpoints:**
- Mobile: < 640px (single column, stacked navigation)
- Tablet: 640px-1024px (2-column layouts, side nav appears)
- Desktop: > 1024px (multi-column, full feature set)

### D. Component Library

**Navigation:**
- Top bar: Fixed height (64px), artist switcher, notifications, profile
- Sidebar: Collapsible sections (Reality, Calendar, Projects, Analytics, Marketplace)
- Breadcrumbs: For deep navigation (Projects > Project X > Scene 3)
- Tab navigation: For entity detail views (Overview, Timeline, Analytics)

**Core UI Elements:**
- Buttons: Primary (filled purple), Secondary (outline), Ghost (text only)
- Cards: Elevated surface with subtle border, rounded-lg (8px)
- Inputs: Border focus state with ring, inline validation
- Dropdowns: shadcn/ui Select with search for long lists
- Modals: Center overlay with backdrop blur, max-width-2xl
- Toasts: Top-right stack, auto-dismiss with action buttons

**Data Display:**
- Tables: Sticky headers, sortable columns, row hover states, bulk selection
- KPI Cards: Icon + label + value + trend indicator (↑↓)
- Status Badges: Rounded-full, colored backgrounds with appropriate text contrast
- Timeline: Vertical line with event nodes, expandable details
- Graph Visualization: Force-directed layout with zoom/pan, node colors by type

**Forms:**
- Multi-step wizards: Progress indicator, back/next navigation
- Field groups: Label above input, helper text below, error states inline
- File uploads: Drag-drop zone with preview thumbnails
- Rich text: Minimal toolbar (bold, italic, lists, links)

**Specialized Components:**
- Calendar view: Week/month toggle, drag-drop slots with status colors
- Reality Graph: Canvas-based with legend, filters sidebar, context menu on nodes
- Approval workflow: Side-by-side comparison with comment thread
- Marketplace listing: Grid/list toggle, filter sidebar, image gallery

### E. Animations

**Sparingly Used:**
- Page transitions: Subtle fade (150ms)
- Dropdown/modal: Scale from trigger point (200ms)
- Hover states: Background color transition (150ms)
- Loading states: Skeleton screens, not spinners
- Graph interactions: Smooth node positioning (300ms ease-out)

**Never Animate:**
- Data table updates
- Form validation messages
- Status badge changes
- Text content

## Application-Specific Patterns

**Dashboard Layout:**
- Top: KPI cards (4-column grid showing artists count, active projects, upcoming events, consistency alerts)
- Middle: Agenda week view (7-column calendar strip with today highlighted)
- Bottom: Recent activity feed + quick actions panel

**Reality Graph:**
- Left sidebar: Entity type filters (checkboxes), time range slider, search
- Main canvas: Force-directed graph with zoom controls (bottom-right)
- Node styles: Circle (characters), square (locations), diamond (possessions), hexagon (concepts)
- Edge styles: Solid (direct relationship), dashed (timeline reference)
- Click node: Side panel with entity details and quick edit

**Calendar Planning:**
- Week view default with date headers and 3 time slots (morning/afternoon/night)
- Drag-drop slots change status color: gray (planned) → yellow (approved) → green (published)
- Slot card: Icon for content type, brief preview, status badge, action menu (duplicate, edit, delete)
- Right panel: Selected slot details with Reality entity links

**Project Workspace:**
- Left: Project details card (vision, metadata, assets)
- Center: Scene timeline with preview cards (status, notes, approval state)
- Right: Approval panel (when scene selected) with comment thread and approve/revise buttons

**ECV DNA Editor:**
- Tabbed interface: Appearance, Voice, Style, Personality, Scenarios
- Form sections with lock icons for finalized attributes
- Live preview panel showing generated image with locked attributes applied
- Version history dropdown for DNA snapshots

**Marketplace:**
- Grid layout with listing cards (image, title, price, type badge, views count)
- Filter sidebar: Type, price range, status, artist
- Detail modal: Image gallery, description, usage terms, offer form

## Accessibility & Dark Mode

- All interactive elements: min-height 44px (touch targets)
- Focus indicators: 2px ring with offset in accent color
- Color contrast: Minimum WCAG AA (4.5:1 for text)
- Dark mode form inputs: Slightly lighter background than surface for definition
- Skip navigation link for keyboard users
- ARIA labels on all icon-only buttons
- Loading states announced to screen readers