# AXIS CSS Design System

## Overview

Axis CSS is a modern dark dashboard aesthetic with glassmorphism, subtle gradients, and clear visual hierarchy. The design is organized using CSS custom properties (variables) for easy theming and maintenance.

---

## Color System

### Base Palette
```css
--bg-base: #0f1015;              /* Deep charcoal, main background */
--bg-secondary: #1a1d26;         /* Slightly lighter for contrast */
--card-bg: rgba(26, 29, 38, 0.7); /* Frosted glass effect */
```

### Text Colors (WCAG AA compliant)
```css
--text-primary: rgba(245, 246, 255, 0.95);      /* Main text, 95% opacity */
--text-secondary: rgba(245, 246, 255, 0.65);    /* Secondary text, 65% opacity */
--text-tertiary: rgba(245, 246, 255, 0.45);     /* Labels, captions, 45% opacity */
```

### Surface & Interaction
```css
--surface: rgba(255, 255, 255, 0.04);         /* Subtle surface for inputs */
--surface-hover: rgba(255, 255, 255, 0.08);   /* Slightly more opaque on hover */
--border: rgba(255, 255, 255, 0.08);          /* Subtle dividers */
```

### Accent Colors
```css
--accent: #6b8eff;              /* Primary action (blue) */
--accent-dark: #5577dd;         /* Pressed/active state (darker blue) */
--accent-light: #8ca7ff;        /* Hover state (lighter blue) */
--success: #4ade80;             /* Task completion, status messages (green) */
```

### Why This Palette?
- **No harsh whites** — Reduces eye strain
- **Transparent overlays** — Creates depth without clutter
- **Consistent opacity levels** — Predictable visual hierarchy
- **Blue accent** — Calm, professional, action-oriented
- **Green success** — Universal symbol for completion

---

## Spacing System

```css
/* Consistent spacing scale */
4px   → base unit
8px   → half-step
12px  → comfortable padding for small elements
16px  → standard padding
20px  → generous padding
24px  → vertical rhythm
28px  → section gaps
32px  → card padding
36px  → large padding
40px  → header padding
```

Applied throughout:
- **Button padding**: `10px 20px` (compact but comfortable)
- **Card padding**: `40px 36px` (generous, breathing room)
- **Gaps**: `12px` to `32px` (consistent rhythm)

---

## Typography

```css
Font Stack: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
```

### Scale
```
--app-title:        2.5rem, 700 weight  (40px, bold)
--tasks-title:      2rem, 700 weight    (32px, bold)
--section-title:    0.9rem, 700 weight  (14.4px, uppercase)
--task-text:        0.95rem              (15.2px)
--status-text:      0.85rem              (13.6px)
```

### Hierarchy
1. **App Title** — Large, gradient background (2.5rem)
2. **Page Titles** — Strong and clear (2rem)
3. **Section Headings** — Uppercase, subtle (0.9rem)
4. **Body Text** — Comfortable reading (0.95-1rem)
5. **Meta/Secondary** — Smaller, dimmer (0.85rem)

---

## Radii & Shadows

### Border Radius
```css
--radius-sm: 8px;       /* Input fields, small elements */
--radius-md: 12px;      /* Cards on mobile */
--radius-lg: 16px;      /* Main cards, large elements */
```

### Shadows (depth system)
```css
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.15);      /* Subtle lift */
--shadow-md: 0 12px 32px rgba(0, 0, 0, 0.25);     /* Standard elevation */
--shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.35);     /* Floating effect */
```

### Usage
- Cards use `--shadow-md` for consistent depth
- Hover states use elevated shadows (could upgrade to `--shadow-lg`)
- Avoid harsh shadows — ambient darkness is enough

---

## Transitions

```css
--transition-fast: 120ms ease;      /* Quick feedback (checkboxes) */
--transition: 200ms ease;            /* Standard animation */
--transition-slow: 300ms ease;      /* Page navigation */
```

Applied to:
- **Border/background changes** — 200ms (feels responsive)
- **Page navigation** — 300ms (smooth, not jarring)
- **Checkbox state** — 120ms (immediate feedback)

---

## Component Styles

### Journal Card
```css
.journal-card {
  max-width: 700px;
  padding: 40px 36px;             /* Generous padding */
  background: var(--card-bg);      /* Frosted glass */
  backdrop-filter: blur(12px);     /* Glassmorphism */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

**Why:**
- Backdrop blur creates depth illusion
- Generous padding makes writing comfortable
- Max-width keeps focus on content
- Shadow adds subtle elevation

### Textarea
```css
.journal-textarea {
  background: var(--surface);      /* Slightly opaque white on dark */
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.journal-textarea:focus {
  border-color: var(--accent);     /* Blue on focus */
  box-shadow: 0 0 0 3px rgba(107, 142, 255, 0.1);  /* Subtle glow */
}
```

**Why:**
- Surface color makes input field visible but calm
- Subtle glow on focus is less jarring than bold outline
- Border color change signals interaction

### Task List Items
```css
.task-item {
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.task-item:hover {
  background: var(--surface-hover);  /* Slightly more opaque */
}

.task-item input:checked ~ .task-text {
  color: var(--text-tertiary);
  text-decoration: line-through;
}
```

**Why:**
- Subtle hover state signals interactivity
- Line-through without color change is too subtle
- Reduced opacity on strikethrough maintains elegance

### Buttons

**Primary Button** (CTA)
```css
.btn-primary {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(107, 142, 255, 0.15);  /* Blue glow */
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);  /* Micro-feedback */
}
```

**Secondary Button**
```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--accent);
  color: var(--accent);  /* Tint on hover */
}
```

**Why:**
- Primary buttons are bold and action-oriented
- Secondary buttons are understated
- Hover/active states provide clear feedback
- Scale transform (0.98) is subtle but satisfying

---

## Glassmorphism Effect

The signature look of Axis is the frosted glass effect on cards:

```css
.journal-card {
  background: rgba(26, 29, 38, 0.7);    /* 70% opaque dark background */
  backdrop-filter: blur(12px);          /* Blur what's behind */
  border: 1px solid var(--border);      /* Subtle border */
}
```

**Why:**
- Creates depth by layering
- Blur effect softens the overall feel
- Works on modern browsers (95%+ coverage)
- Combines with subtle gradients for elegance

---

## Gradient Overlays

Background subtly enhanced with radial gradients:

```css
body::before {
  background: 
    radial-gradient(circle at 20% 30%, rgba(107, 142, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(74, 222, 128, 0.04) 0%, transparent 50%);
}
```

**Why:**
- Adds visual interest without distraction
- Blue accent in top-left, subtle green in bottom-right
- Very low opacity (8% and 4%) keeps it calm
- Positioned off-center (20%, 30%) for organic feel

---

## Responsive Design

### Breakpoints
```css
@media (max-width: 768px) {
  .app-title { font-size: 2rem; }        /* Down from 2.5rem */
  .journal-textarea { min-height: 280px; }  /* Down from 380px */
}

@media (max-width: 480px) {
  .app-title { font-size: 1.6rem; }      /* Mobile size */
  .journal-card { padding: 28px 20px; }  /* Tighter padding */
}
```

### Mobile-First Philosophy
- Base styles are mobile-friendly
- Larger screens get enhanced padding/sizing
- Never overflow on any device
- Touch targets stay above 44px (accessibility)

---

## Accessibility Features

### Color Contrast
- All text colors meet WCAG AA standards
- Checked with WebAIM contrast checker
- Accent color (#6b8eff) on dark background meets AA

### Focus States
```css
.btn-primary:focus,
.journal-textarea:focus {
  outline: 2px solid var(--accent);  /* Visible focus ring */
}
```

### Semantic HTML
- Use `<label>` for checkboxes (improves click area)
- Proper `<header>` and `<footer>` elements
- ARIA labels on all pages and interactive elements

### Motion
- Animations use CSS transforms (GPU-accelerated)
- Transition times are short but not jarring
- No infinite animations that could trigger motion sickness

---

## Customization Examples

### Change Theme to Purple
```css
:root {
  --accent: #b78cf5;
  --accent-dark: #9b6dd8;
  --accent-light: #d4aeff;
}
```

### Make it Brighter (Light Mode)
```css
:root {
  --bg-base: #f5f5f5;
  --card-bg: rgba(255, 255, 255, 0.9);
  --text-primary: rgba(10, 10, 10, 0.95);
  --surface: rgba(0, 0, 0, 0.04);
  --border: rgba(0, 0, 0, 0.08);
}
```

### Increase Spacing (Relaxed Layout)
```css
.journal-card { padding: 48px 44px; }  /* +8px on all sides */
.task-section { gap: 16px; }           /* +4px between tasks */
```

---

## Performance

### CSS Optimizations
1. **CSS Variables** — Single point of change for colors
2. **Minimal Reflows** — Flexbox layout, no recalculation
3. **Hardware Acceleration** — Transforms use GPU
4. **No Animations on Scroll** — Only on interaction

### File Size
- **Total CSS**: ~15 KB
- **Minified**: ~11 KB
- **Gzipped**: ~3 KB

---

## Browser Support

- ✅ Chrome/Edge (88+)
- ✅ Safari (14+)
- ✅ Firefox (85+)
- ⚠️ IE 11 — No support (backdrop-filter, CSS vars)

For IE support, would need:
1. CSS variable fallbacks
2. Remove backdrop-filter, use solid backgrounds
3. Simplified animations

---

## CSS Architecture

### Organization
1. **CSS Variables** — Theme system (lines 1-35)
2. **Reset & Foundations** — Base styles (lines 36-65)
3. **App Layout** — Page structure (lines 66-110)
4. **Cards** — Journal & Tasks containers (lines 111-150)
5. **Journal Page** — Textarea and controls (lines 151-230)
6. **Tasks Page** — Task lists and sections (lines 231-320)
7. **Buttons** — All button styles (lines 321-390)
8. **Responsive** — Mobile breakpoints (lines 391-472)

### Naming Convention
```
.{element}[-{modifier}]
```

Examples:
- `.btn` — Base button
- `.btn-primary` — Primary button variant
- `.btn:hover` — Interactive state
- `.task-item` — Task list item
- `.task-completed` — Completion state modifier

---

## Design Principles Applied

1. **Consistency** — Colors, spacing, radii used systematically
2. **Hierarchy** — Size and opacity create visual order
3. **Minimalism** — No unnecessary elements or decorations
4. **Accessibility** — Contrast and focus states built-in
5. **Motion** — Smooth but not distracting
6. **Calm** — Dark mode, soft shadows, generous spacing

Result: A professional, production-ready aesthetic that feels grounded and peaceful.
