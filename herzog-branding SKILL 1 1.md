---
name: herzog-branding
description: Applies Herzog's official brand colors, typography, UI patterns, and layout conventions to any artifact — HTML pages, dashboards, React components, documents, or presentations. Use when building or styling anything for Herzog internal applications, including navigation layouts, color selection, component styling, data visualization, and dark/light mode theming. Covers both sidebar and top-nav layout patterns.
---

# Herzog UI Brand System

## Overview

This skill contains Herzog's complete UI brand system for internal applications. Use it when creating any visual output — HTML artifacts, React components, dashboards, presentations, documents, or mockups — that should look and feel like a Herzog product.  This is the v2 that should be WCAG 2.1 AA compliant.

**Keywords**: Herzog, branding, UI, dashboard, navigation, colors, typography, layout, sidebar, top nav, internal app, data visualization, dark mode, light mode, components

---

## Typography

**Heading Font**: Oswald (weight 400–700)
- Used for: page titles, section headings, card titles, KPI values, logo text
- Style: uppercase, letter-spacing 0.04–0.08em
- Import: `https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap`

**Body Font**: Roboto (weight 300–700)
- Used for: body text, labels, nav links, buttons, form elements, table content
- Import: `https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap`

**Monospace**: Courier New (for hex codes, technical values, code)

---

## Color Palette

### Brand Colors (Established)

| Name          | Hex       | Role                              |
|---------------|-----------|-----------------------------------|
| Herzog Gold   | `#FFD100` | Primary brand color, accents      |
| Bright Yellow | `#FFDD00` | Secondary gold accent             |
| Dark Yellow   | `#F1B80E` | Gold hover/pressed states         |
| Rich Black    | `#000000` | Structural: headings, logo blocks |
| Dark Gray     | `#58595B` | Primary body text                 |
| Mid Gray      | `#6D6E71` | Secondary text, inactive nav      |
| Smoke         | `#A7A9AC` | Tertiary text, placeholders       |
| Accent Gray   | `#D1D3D4` | Borders, dividers (legacy)        |

### Action Colors (Navy Family)

Navy is reserved for **interactive/actionable elements only**. Never use navy for structural elements like headings, borders, or backgrounds in light mode.

| Name       | Hex       | Role                                    |
|------------|-----------|----------------------------------------|
| Navy Blue  | `#1E3A5F` | Primary buttons, links, active states   |
| Navy Light | `#2E5A8F` | Hover states for navy elements          |
| Navy Dark  | `#0F1F33` | Dark mode surfaces, card backgrounds    |

### Semantic Colors

Each semantic color has a full-strength variant (for text/icons) and a light variant (for badge/alert backgrounds).

| Name          | Hex       | Light Variant | Role        |
|---------------|-----------|---------------|-------------|
| Success Green | `#1E6B38` | `#D4EDDA`     | Complete, positive |
| Error Red     | `#AB2D24` | `#F8D7DA`     | Overdue, errors    |
| Warning Amber | `#8A5700` | `#FFF3CD`     | In progress, caution |
| Info Teal     | `#086670` | `#D1ECF1`     | Scheduled, info    |

### Extended Neutrals

| Name        | Hex       | Role                        |
|-------------|-----------|----------------------------|
| White       | `#FFFFFF` | Card backgrounds, nav bg    |
| Off White   | `#FAFAFA` | Page body, subtle surfaces  |
| Light Gray  | `#F5F5F5` | Page background, table headers |
| Border Gray | `#E5E5E5` | Decorative borders, dividers |
| Input Border| `#8E8E8E` | Form input/select boundaries (3.3:1 on white) |

### Data Visualization Palette

Use in this order for chart series:

1. `#1E3A5F` — Navy Blue (Series 1)
2. `#086670` — Info Teal (Series 2)
3. `#FFD100` — Herzog Gold (Series 3)
4. `#1E6B38` — Success Green (Positive)
5. `#AB2D24` — Error Red (Negative)
6. `#6B4C9A` — Chart Purple (Series 4)
7. `#8A5700` — Warning Amber (Series 5)
8. `#4A6274` — Chart Slate (Neutral)

---

## CSS Variables

Always define the full variable set at `:root` for consistency:

```css
:root {
  /* Brand Colors */
  --herzog-gold: #FFD100;
  --bright-yellow: #FFDD00;
  --dark-yellow: #F1B80E;
  --rich-black: #000000;
  --dark-gray: #58595B;
  --mid-gray: #6D6E71;
  --smoke: #A7A9AC;
  --accent-gray: #D1D3D4;

  /* Action Colors */
  --navy-blue: #1E3A5F;
  --navy-light: #2E5A8F;
  --navy-dark: #0F1F33;

  /* Semantic Colors */
  --success-green: #1E6B38;
  --success-light: #D4EDDA;
  --error-red: #AB2D24;
  --error-light: #F8D7DA;
  --warning-amber: #8A5700;
  --warning-light: #FFF3CD;
  --info-teal: #086670;
  --info-light: #D1ECF1;

  /* Extended Neutrals */
  --white: #FFFFFF;
  --off-white: #FAFAFA;
  --light-gray: #F5F5F5;
  --border-gray: #E5E5E5;
  --input-border: #8E8E8E;

  /* Data Visualization */
  --chart-purple: #6B4C9A;
  --chart-slate: #4A6274;
}
```

---

## Color Role Guidelines: Navy vs. Black

This is a critical distinction in the Herzog system. Getting this wrong is the most common branding mistake.

**Use Navy Blue for:**
- Primary action buttons
- Hyperlinks and text links
- Active tab indicators (underlines)
- Dark mode card/surface backgrounds
- Data visualization (chart Series 1)
- Interactive hover/focus states
- User avatar backgrounds

**Use Rich Black / Dark Gray for:**
- Section headings and page titles (Oswald, uppercase)
- Body text and paragraphs
- Secondary button borders and text
- Navigation labels
- Table headers and row text
- Card titles and descriptions
- Logo block background

---

## Navigation Layouts

Herzog internal apps use two navigation patterns. Choose based on the application's structure.

### Pattern 1: Left Sidebar (Default for complex apps)

Best for apps with 5+ navigation sections, deep hierarchies, or admin panels.

- **Sidebar background**: `#000000` (Rich Black)
- **Sidebar width**: 200–220px, collapsible
- **Logo**: Oswald 700, `#FFD100` (Herzog Gold) on black
- **Nav items**: Roboto 400, `#A7A9AC` (Smoke) default
- **Active item**: `#FFD100` text with gold left-border (3–4px) or highlight background
- **Hover**: Slight background lighten or text brighten
- **Icons**: 18–20px, same color as text, left of label
- **App version**: Small text at sidebar bottom, Smoke colored

Reference: The HPAC dashboard uses this pattern effectively.

### Pattern 2: Top Nav — Full Black Header (For simpler apps or header-only layouts)

Best for apps with 3–6 top-level sections, or when vertical space matters more than sidebar navigation.

**Structure:**
```
┌────────────────────────────────────────────────────────────────┐
│  LOGO  |  Nav Links                Search | Notif | DM | User │
│                    (full black bar)                            │
╞════════════════════════════════════════════════════════════════╡  ← 3px gold border
│ Breadcrumbs                                                    │
├────────────────────────────────────────────────────────────────┤
│ Page Content                                                   │
```

- **Header**: Full-width `#000000` (Rich Black) background, 56px height, `3px solid #FFD100` bottom border
- **Logo area** (left):
  - "HERZOG" in Oswald 700, `#FFD100`
  - Optional thin divider (`#58595B`, 1px) + app name in Roboto 400, `#A7A9AC`, uppercase, small
- **Nav links** (center-left, on black):
  - Inactive links: `#A7A9AC` (Smoke), Roboto 500
  - Active link: `#FFFFFF` (White), Roboto 600
  - Active indicator: 3px `#FFD100` underline at bottom of header bar
  - Hover: text brightens to `#FFFFFF`, background `rgba(255,255,255,0.08)`
- **Dropdowns**: `var(--card-bg)` background, `#E5E5E5` border, `0 8px 24px rgba(0,0,0,0.1)` shadow, 6px radius. In dark mode: `var(--card-border)` border, deeper shadow
- **Right section** (on black): Icons in `#A7A9AC` (Smoke), hover brightens to white with `rgba(255,255,255,0.1)` background. Notification bell red badge dot bordered against black. Divider in `#58595B`. User avatar (navy circle) with white name, Smoke role text
- **Focus indicators**: Gold (`#FFD100`) for all header elements (14.4:1 on black)
- **Breadcrumbs bar**: White/card background, bottom border, links in `#1E3A5F` (Navy), current page in `#58595B`
- **Mobile (< 900px)**: Nav collapses to hamburger (Smoke icon on black). Dropdown menu uses black background with Smoke text, gold left-border on active, matching the header's visual weight

**Why this works**: The full black header creates a unified brand bar that visually matches the sidebar pattern's structural weight. The gold bottom border ties the header together and provides a clean separation from the content area. All nav elements on black maintain strong contrast ratios (Smoke on Black 4.4:1 AA, White on Black 21:1 AAA, Gold on Black 14.4:1 AAA).

---

## Component Styles

### Buttons

| Type      | Background  | Text Color  | Border              | Hover             |
|-----------|------------|-------------|---------------------|-------------------|
| Primary   | `#1E3A5F`  | `#FFFFFF`   | none                | `#2E5A8F`         |
| Secondary | `#FFFFFF`  | `#58595B`   | `1px solid #E5E5E5` | bg `#F5F5F5`      |
| Accent    | `#FFD100`  | `#000000`   | none                | `#F1B80E`         |

- Padding: `0.5rem 1rem`
- Font: Roboto 600, 0.82rem
- Border-radius: 5px
- Include icon (18px) left of label when applicable

### Cards

- Background: `#FFFFFF`
- Border: `1px solid #E5E5E5`
- Border-radius: 8px
- Padding: 1.1–1.25rem
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.06)`
- Title: Oswald, uppercase, `#000000`
- Optional gold left-border (`4px solid #FFD100`) for KPI/stat cards

### Status Badges

- Font: Roboto 600–700, 0.7rem, uppercase, letter-spacing 0.03em
- Padding: `0.15rem 0.6rem`
- Border-radius: 3px
- Use semantic light background + full-strength text color:
  - Active/Complete: `#D4EDDA` bg, `#1E6B38` text
  - In Progress/Pending: `#FFF3CD` bg, `#8A5700` text
  - Overdue/Error: `#F8D7DA` bg, `#AB2D24` text
  - Scheduled/Info: `#D1ECF1` bg, `#086670` text

### Tables

- Header row: `#FAFAFA` background, Roboto 600, 0.72rem, uppercase, `#6D6E71` text
- Body rows: Roboto 400, 0.82rem, `#58595B` text
- Row hover: `#FAFAFA` background
- Borders: `1px solid #E5E5E5` between rows
- Primary column (e.g., name/route): Roboto 600, `#000000`

### Form Elements (Selects, Inputs)

- Border: `1px solid #8E8E8E` (meets WCAG 1.4.11 non-text contrast, 3.3:1 on white)
- Border-radius: 5px
- Font: Roboto 400, 0.82rem
- Background: `#FFFFFF`
- Focus: `border-color: #1E3A5F; outline: 2px solid #1E3A5F; outline-offset: 1px`

### Focus Indicators (WCAG 2.4.7)

All interactive elements (links, buttons, inputs, selects, cards with actions) must show a visible focus indicator when navigated via keyboard.

- **Light backgrounds**: `outline: 2px solid #1E3A5F; outline-offset: 2px` (11.5:1 on white)
- **Dark backgrounds**: `outline: 2px solid #FFD100; outline-offset: 2px` (14.4:1 on black)
- **Never** apply `outline: none` without a visible replacement
- Focus indicators must be visible over all adjacent colors — the navy/gold pairing ensures this
- Skip-navigation link: Include a visually-hidden "Skip to main content" link as the first focusable element; it becomes visible on focus

```css
*:focus-visible {
  outline: 2px solid var(--navy-blue);
  outline-offset: 2px;
}
/* Dark mode override */
[data-theme="dark"] *:focus-visible {
  outline-color: var(--herzog-gold);
}
```

---

## Page Layout Conventions

### Page Header

- Title: Oswald, 1.6rem, `#000000`, uppercase
- Action buttons aligned right on the same row
- Optional filter dropdowns (e.g., "All Cycles") before action buttons

### KPI Row

- Grid: 4 columns on desktop, 2 on mobile (<900px)
- Gap: 1rem
- Each card: gold left-border, label (uppercase, small, gray), large Oswald value, optional change indicator

### Chart Section

- Grid: 2 columns on desktop, 1 on mobile
- Card with title (Oswald, uppercase) + chart content
- Bar charts use navy as default fill; use the data viz palette order for multi-series

### Data Table Section

- Full-width card with header row (title + "View All" button)
- Alternating content via hover, not striped rows

---

## Dark Mode

For dark-themed interfaces or sections:

- Page background: `#000000`
- Card backgrounds: `#0F1F33` (Navy Dark)
- Card borders: `1px solid #6E7073` (3.3:1 on Navy Dark)
- Primary text: `#FAFAFA`
- Secondary text: `#A7A9AC`
- Buttons (primary): `#2E5A8F` (Navy Light)
- Buttons (secondary): transparent, `1px solid #A7A9AC`, white text
- Logo area: Navy Dark background with Gold text

---

## Accessibility Notes

### Verified Contrast Ratios

All text combinations meet WCAG 2.1 AA (4.5:1 for normal text). Non-text UI boundaries meet 1.4.11 (3:1). Ratios computed per WCAG relative luminance formula.

| Combination               | Ratio  | Grade | WCAG Criterion |
|---------------------------|--------|-------|----------------|
| Black on White            | 21.0:1 | AAA   | 1.4.3 Text     |
| Gold on Black             | 14.4:1 | AAA   | 1.4.3 Text     |
| Navy on White             | 11.5:1 | AAA   | 1.4.3 Text     |
| White on Navy Dark        | 16.6:1 | AAA   | 1.4.3 Text     |
| Gold on Navy              | 7.9:1  | AAA   | 1.4.3 Text     |
| Dark Gray on White        | 7.0:1  | AAA   | 1.4.3 Text     |
| Dark Gray on Light Gray   | 6.4:1  | AA    | 1.4.3 Text     |
| Mid Gray on White         | 5.1:1  | AA    | 1.4.3 Text     |
| Mid Gray on Off-White     | 4.9:1  | AA    | 1.4.3 Text     |
| Mid Gray on Light Gray    | 4.7:1  | AA    | 1.4.3 Text     |
| Warning Amber on Warn BG  | 5.5:1  | AA    | 1.4.3 Text     |
| Info Teal on Info BG      | 5.4:1  | AA    | 1.4.3 Text     |
| Success Green on Succ BG  | 5.3:1  | AA    | 1.4.3 Text     |
| Error Red on Error BG     | 5.0:1  | AA    | 1.4.3 Text     |
| Input Border on White     | 3.3:1  | —     | 1.4.11 Non-text|
| Dark Card Border on Navy  | 3.3:1  | —     | 1.4.11 Non-text|

**Note:** Decorative borders (`#E5E5E5`) used for card edges, table rows, and dividers do not need to meet 1.4.11 when the component is identifiable without the border (e.g., cards distinguished by shadow, padding, or background). Interactive component boundaries (form inputs, selects) use `#8E8E8E` to meet the 3:1 requirement.

---

## Responsive & Text Accessibility

### Text Resizing (WCAG 1.4.4)

- All text must remain readable and functional when scaled to 200%
- Use `rem` or `em` units for font sizes — never fixed `px` for body text
- Containers must expand to accommodate enlarged text without clipping or overlap

### Reflow (WCAG 1.4.10)

- Content must reflow without horizontal scrolling at 320px viewport width
- Breakpoints: 320px, 768px, 900px, 1200px minimum
- KPI grids: 4 columns (desktop) → 2 columns (<900px) → 1 column (<480px)
- Tables: use horizontal scroll wrapper on narrow viewports rather than breaking layout

### Text Spacing (WCAG 1.4.12)

Layouts must not clip or overlap when users apply custom text spacing:

- Line height up to 1.5× font size
- Paragraph spacing up to 2× font size
- Letter spacing up to 0.12× font size
- Word spacing up to 0.16× font size

Avoid fixed-height containers for text content. Use `min-height` instead of `height` where a minimum is needed.

### Content on Hover or Focus (WCAG 1.4.13)

Any content that appears on hover or focus (tooltips, dropdowns, popovers) must be:

- **Dismissible**: User can close it without moving focus (e.g., Escape key)
- **Hoverable**: User can move pointer over the new content without it disappearing
- **Persistent**: Content remains visible until the user dismisses it, moves focus, or the trigger is no longer valid

### Reduced Motion (WCAG 2.3.3)

- Wrap all transitions and animations in `@media (prefers-reduced-motion: no-preference) { ... }`
- Hover/focus transitions (e.g., background-color, box-shadow) must respect this media query
- Essential animations (loading spinners) may continue but should be simplified to opacity-only or reduced duration

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Context Notes

- Herzog is a North American rail and heavy/highway infrastructure contractor headquartered in St. Joseph, MO
- Internal apps serve seven divisions: HCC, HRSI, HSI, HTI, HTSI, Herzog Energy, and Green Group
- Field environments often have limited connectivity — keep interfaces performant and functional offline where possible
- Herzog interfaces regularly with Class 1 railroads: BNSF, UP, CSX, NS, CN, KCS
- Existing proprietary platforms include RailSentry, PTC Hosting, Switchboard, GIS Software, Video Track Chart, and CMMS
- The company maintains a build-it-ourselves culture; internal tools should feel professional and purpose-built, not generic
