## Detailed UI Slop Tell List

### COLOR & PALETTE

**Purple-to-blue gradients**
Purple/violet gradients and cyan-on-dark are the most recognizable tells of AI-generated UIs. Applied universally: buttons, text, backgrounds, hero sections. Dead giveaway across 22% of analyzed sites.

**Indigo as "safe distinctive"**
When indigo gets banned, the model doesn't go neutral—it goes emerald green, the next safe distinctive color. Fallback when primary color is constrained.

**Cyan-on-dark backgrounds**
# Complete UI Slop Avoidance Guide

A comprehensive reference of 100+ visual and structural tells that mark an interface as AI-generated. Use this as constraints for your AI agent to avoid generating sterile, uninspired designs.

---

## TABLE OF CONTENTS

1. [Core Principles](#core-principles)
2. [Typography Slop](#typography-slop)
3. [Color & Palette Slop](#color--palette-slop)
4. [Layout & Spacing Slop](#layout--spacing-slop)
5. [Cards & Containers](#cards--containers)
6. [Buttons & CTAs](#buttons--ctas)
7. [Forms & Inputs](#forms--inputs)
8. [Interactive States](#interactive-states)
9. [Shadows & Elevation](#shadows--elevation)
10. [Icons & Imagery](#icons--imagery)
11. [Navigation & Structure](#navigation--structure)
12. [Motion & Animation](#motion--animation)
13. [Copy & Content](#copy--content)
14. [Responsive Design](#responsive-design)
15. [Accessibility Violations](#accessibility-violations)
16. [CSS & Technical Slop](#css--technical-slop)
17. [Specific Component Slop](#specific-component-slop)
18. [Framework Convergence](#framework-convergence)

---

## CORE PRINCIPLES

### The Root Issue
When prompts ask for "modern" or "clean" without operational constraints, AI reaches for high-frequency patterns from polished product screenshots. This creates statistical confidence under vague direction.

### How to Fix
- Use **negative constraints**: "No purple gradients. No Inter font. No glassmorphism."
- Define explicit **design tokens**: spacing scale, color palette, typography system, shadow recipes
- Specify **interaction states**: hover, focus, disabled, error, empty, loading (for every interactive element)
- Include **reference screens** that capture brand tone
- Use **adjectives + anti-examples**: "warm and editorial, NOT startup modern or corporate SaaS"

---

## TYPOGRAPHY SLOP

### Font Choice Issues
- ❌ Inter used for everything (especially centered hero headlines)
- ❌ Default font combos: Space Grotesk + Instrument Serif + Geist repeating everywhere
- ❌ Serif italic for one accent word in otherwise-Inter hero
- ❌ Single font family for entire page (no pairing)
- ❌ Overused fonts that no longer feel distinctive (Inter, Geist, Space Grotesk, Instrument Serif)
- ❌ No secondary font to create hierarchy

**Fix:** Choose typeface deliberately. Pair display + body font. Consider: Haas Grotesk, Untitled Sans, Söhne, Inktrap (sans); Tiempos, GT Sectra, Freight Text (serif)

### Font Size & Scaling
- ❌ Flat type hierarchy — font sizes too close (aim for 1.25+ ratio between sizes)
- ❌ Same size typography on mobile and desktop
- ❌ Oversized hero headline — full sentence at display size dominating viewport
- ❌ No system for sizing — 12px, 14px, 16px, 18px, 20px instead of scale-based

**Fix:** Define type scale (1.25 ratio, 1.5 ratio, or golden ratio). Scale responsively.

### Letter & Line Spacing
- ❌ Crushed letter spacing — pulled tighter than natural character shapes
- ❌ Wide letter spacing on body text — above 0.05em, disrupts reading
- ❌ Tight line height on multi-line text — below 1.3x font size
- ❌ Inconsistent letter-spacing — hand-coded per element

**Fix:** Body text min 1.5x-1.7x line height. Reserve tracking (letter-spacing) for short labels.

### Text Decoration & Styling
- ❌ All-caps body text — hard to read, removes word-shape recognition
- ❌ Italic serif display headline as universal AI-startup hero (unless editorial)
- ❌ Gradient text on headings/metrics — kills scannability
- ❌ No text decoration consistency — some links underlined, some not

**Fix:** All-caps only for short labels. Use solid colors for body text.

### Hierarchy Issues
- ❌ Hero eyebrow/pill chip — tiny uppercase label above huge headline (default AI SaaS)
- ❌ Repeated section kicker labels — tiny tracked labels above every section
- ❌ Icon tile stacked above heading — universal AI template shape
- ❌ Numbered section markers (01/02/03) — editorial scaffold

**Fix:** Create hierarchy through size contrast, not decoration. Drop eyebrows, fold into headlines.

---

## COLOR & PALETTE SLOP

### Chromatic Issues
- ❌ Purple-to-blue gradients on everything (buttons, text, backgrounds, orbs)
- ❌ Cyan-on-dark backgrounds — "cool" look default
- ❌ "VibeCode Purple" — universally recognizable AI color
- ❌ Indigo as fallback when other colors banned
- ❌ Emerald green as "safe distinctive" color
- ❌ Warm amber/cream wash — "tasteful AI startup" signal reached for by reflex

**Fix:** Define distinctive, intentional palette. Avoid purple/cyan/indigo defaults.

### Dark Mode Issues
- ❌ Permanent dark mode with medium-grey body text
- ❌ Dark mode with glowing accents — dark backgrounds + colored box-shadow glows
- ❌ Barely passing body-text contrast in dark themes (< WCAG AA)
- ❌ Dark mode only, no light mode — no true adaptation

**Fix:** Light mode sufficient for most UIs. If dark mode, ensure proper contrast (4.5:1).

### Palette Structure
- ❌ Gradient everything — backgrounds, text, buttons, borders
- ❌ Cream/beige palette as default tasteful background
- ❌ All saturation levels the same — no tint/shade system
- ❌ No color contrast consideration — relies on one color combo
- ❌ Opacity levels not standardized (0.3, 0.4, 0.6, 0.7 instead of 0.5, 0.7, 0.9)

**Fix:** Use color variables. Define palette, tints, shades. Test contrast ratios.

### Text Color Issues
- ❌ Gray text on colored background — washed out, unreadable
- ❌ Gradient text for meaning — decorative instead of informative
- ❌ Low contrast text — doesn't meet WCAG AA (4.5:1 body, 3:1 large)
- ❌ Color conveying meaning alone — no additional visual indicator

**Fix:** Ensure 4.5:1+ contrast. Use solid colors for text. Don't rely on color alone.

---

## LAYOUT & SPACING SLOP

### Spacing Issues
- ❌ Uniform padding everywhere — same spacing on card, button, input, section
- ❌ Monotonous spacing — same spacing value everywhere, no rhythm
- ❌ No spacing scale — 8px, 12px, 13px, 15px, 18px, 21px mixed arbitrarily
- ❌ Margin/padding on parent and child both — double spacing
- ❌ Negative margins used unnecessarily — brittle layouts
- ❌ Margin on bottom of lists — extra unwanted space
- ❌ No gap property used — margin on every child instead
- ❌ Inconsistent gutter between columns — 20px here, 24px there

**Fix:** Define spacing scale (8px, 16px, 24px, 32px, etc.). Use gap property.

### Border & Radius Issues
- ❌ Uniform border-radius everywhere — same value (usually 8-12px) on all elements
- ❌ Extreme border-radius on cards (24px+) — everything rounded into soft blobs
- ❌ Thick colored border clashing with rounded corners
- ❌ Borders different widths — 1px, 2px, 3px with no reason
- ❌ Border color doesn't match system — hardcoded gray

**Fix:** Reserve pill-shape (full border-radius) for buttons/badges. Cards 8-16px max.

### Container & Width Issues
- ❌ Line length too long — text wider than ~80 chars, eye loses place
- ❌ Content overflowing container — no wrapping, forces horizontal scroll
- ❌ Body text touching viewport edge — no container padding
- ❌ Maximum width not enforced — full-width text unwieldy
- ❌ No responsive breakpoint nuance — scales uniformly instead of deliberate adaptation

**Fix:** Max-width 65-75ch for body text. Container padding 16px+ on mobile.

### Grid & Alignment
- ❌ Identical column grids always (always 3-column feature cards)
- ❌ Card heights forced via flexbox — same height regardless of content
- ❌ Centered layouts only — no asymmetrical spacing
- ❌ Symmetrical arrangement everywhere — nothing distinctive

**Fix:** Vary column counts. Let content determine card height. Use intentional asymmetry.

### Nesting Issues
- ❌ Nested cards — cards inside cards creating excessive depth
- ❌ Multiple levels of containers (5+ nesting) with individual padding/shadow
- ❌ Card inside card inside card — visual noise

**Fix:** Flatten hierarchy. Use spacing, typography, dividers instead of nesting.

---

## CARDS & CONTAINERS

### Card Styling
- ❌ Thick colored border on one side (3-4px stripe) — most recognizable AI tell
- ❌ Colored borders on top or left edge — arbitrary styling
- ❌ Identical feature cards repeated — same-sized cards with icon + heading + text
- ❌ Cards with mixed shadow recipes — each uses different shadow
- ❌ Hairline border + diffuse wide shadow together — conflicting elevation cues

**Fix:** Use subtler accents or remove borders entirely. Pick one elevation method.

### Glass & Effects
- ❌ Glassmorphism everywhere — blur effects, glass cards as decoration
- ❌ Blur effects, glow borders used decoratively, not functionally
- ❌ Repeating-gradient stripes as surface decoration
- ❌ Backdrop filter overuse — on elements where it adds no value

**Fix:** Use glass/blur only to solve real layering problems, not for style.

---

## BUTTONS & CTAS

### Button Structure
- ❌ All buttons same size — no distinction between primary/secondary/tertiary
- ❌ Button padding inconsistent — small buttons have same padding as large
- ❌ Text button with no underline on hover — not obviously interactive
- ❌ Icon button with no label — unlabeled buttons fail accessibility
- ❌ Button rounded at different radii than rest of system

**Fix:** Define button sizes (small/medium/large). Consistent padding scale.

### Button States
- ❌ No hover state on buttons — doesn't signal interactivity
- ❌ No focus state — keyboard navigation invisible
- ❌ No disabled state styling — disabled buttons appear active
- ❌ Button hover = button focus (same styling) — violates accessibility
- ❌ Focus ring removed without alternative
- ❌ Focus ring same as hover state — confusing for keyboard users

**Fix:** Define 5 states: normal, hover, focus, active, disabled. Each distinct.

### Button Text & Styling
- ❌ Button text weight varies — sometimes 500, 600, 700
- ❌ CTA button text always generic — "Get Started," "Try it free," "Learn more"
- ❌ Gradient button on gradient background — terrible contrast
- ❌ Button text same size as body — not emphasized enough

**Fix:** Use action verbs. Consistent font weight. Adequate contrast.

---

## FORMS & INPUTS

### Input Styling
- ❌ All form inputs same width — regardless of expected content (email vs zip)
- ❌ No input state indication — users unsure if field is active/focused/disabled
- ❌ Input placeholder text styled same as actual content — confusing
- ❌ Select/dropdown without proper styling — uses browser default
- ❌ File upload with only default browser button
- ❌ Checkbox/radio button styling — oversized/undersized, inconsistent
- ❌ Toggle switch styling — no clear on/off distinction
- ❌ Range slider (input type="range") — no custom styling

**Fix:** Style all inputs to match design system. Placeholder gray, lighter than text.

### Form Labels & Structure
- ❌ Form labels missing — inputs have no associated labels
- ❌ Labels floating/above — inconsistent approach
- ❌ No input focus ring — or focus ring removed
- ❌ Help text styled same as labels — unclear distinction
- ❌ Error messages in same color as help text — can't distinguish

**Fix:** Every input needs `<label>`. Clear focus states. Distinct help/error styling.

### Advanced Inputs
- ❌ Date/time picker completely unstyled — browser default
- ❌ Color input styling doesn't match system
- ❌ Textarea with fixed height — doesn't accommodate content
- ❌ Search input without clear button
- ❌ Password input without show/hide toggle

**Fix:** Custom styling for all input types. Consistent with design system.

---

## INTERACTIVE STATES

### Missing States
- ❌ No error state design — form fields show no error color/icon/message
- ❌ No empty state — tables/lists show nothing when data missing
- ❌ No loading state — no skeleton/spinner/placeholder during data load
- ❌ No success state — no confirmation after form submission
- ❌ No warning state — no visual distinction from errors

**Fix:** Design all states: normal, hover, focus, active, disabled, error, empty, loading.

### State Styling
- ❌ Error messages in tiny red text — hard to read
- ❌ Success state uses same green as all other elements — inconsistent
- ❌ Disabled state reduces opacity only — should also change cursor
- ❌ Loading state with no visual feedback — appears stuck
- ❌ Empty state with no helpful message — users confused

**Fix:** Every state has distinct visual treatment. Clear messaging.

---

## SHADOWS & ELEVATION

### Shadow Issues
- ❌ Every element gets same shadow — card, button, badge all identical
- ❌ Dark glow behind interactive elements — box-shadow in colored auras
- ❌ No elevation hierarchy — all cards read as same visual weight
- ❌ Large colored glows and box-shadows everywhere
- ❌ Shadow-heavy output with no purpose

**Fix:** Define shadow system by elevation level. Vary shadows intentionally.

### Depth Cues
- ❌ Depth cues behave like decoration — each component uses different shadow
- ❌ No clear signal for primary vs secondary action
- ❌ Multiple overlapping shadows — too many depth layers
- ❌ Shadow colors not tied to palette

**Fix:** 2-3 shadow sizes. Consistent colors. Purpose-driven elevation.

---

## ICONS & IMAGERY

### Icon Issues
- ❌ Massive icons — containers larger than content they introduce
- ❌ All icon sets identical — Lucide or Heroicons with zero customization
- ❌ Icon sizes inconsistent — 20px in nav, 24px in hero, 16px in card
- ❌ Icon colors different from text colors — not harmonious
- ❌ Icon weight varies across set — some thin, some thick
- ❌ Icon centered in square container always — doesn't look intentional
- ❌ Icon margins inconsistent — 8px from text here, 4px there
- ❌ SVG icons with hardcoded colors — can't change via CSS
- ❌ Icon scaling — stretched/squashed on different screens
- ❌ Icon stroke weight doesn't match typography weight
- ❌ Icon tile stacked above heading — universal AI template

**Fix:** Define icon scale (16px, 24px, 32px). Consistent weight. Customized set.

### Imagery
- ❌ Stock photography everywhere — generic, no adaptation
- ❌ AI-generated illustrations — flat, over-rendered, same style as every generator
- ❌ Unoptimized images — large, uncompressed files
- ❌ Placeholder dimensions mismatched to layout
- ❌ Images don't resize properly — distorted on mobile
- ❌ No lazy loading — all images load at once
- ❌ Image aspect ratio not maintained
- ❌ Broken or placeholder images — empty src, missing src

**Fix:** Use real assets. Optimize file sizes. Maintain aspect ratios. Lazy load.

### Emoji & Decoration
- ❌ Emoji icons in nav/sidebar — used as primary navigation
- ❌ Emojis for decoration — no functional purpose
- ❌ Amateurish hand-drawn SVG — reads as amateur doodles

**Fix:** Use proper icon system. Reserve emoji for specific use cases.

---

## NAVIGATION & STRUCTURE

### Navigation Styling
- ❌ Sidebar with emoji icons — decorative, not functional
- ❌ All-caps section labels everywhere
- ❌ Navigation no distinction between active/inactive
- ❌ Menu different on mobile than desktop without reason
- ❌ Hamburger menu without clear affordance
- ❌ Breadcrumb with inconsistent spacing — `/` dividers add padding

**Fix:** Consistent nav styling. Clear active states. Mobile = desktop structure.

### Semantic HTML
- ❌ `<div>` used instead of `<button>` — needs onclick
- ❌ Multiple `<h1>` tags on one page — violates guidelines
- ❌ Lists created with `<div>` — should be `<ul>` or `<ol>`
- ❌ `<nav>` tag only in footer — main nav not marked
- ❌ `<main>` tag missing — structure unclear
- ❌ Heading hierarchy skipped — h1 → h3 with no h2

**Fix:** Use semantic HTML. Proper heading hierarchy. One `<h1>` per page.

---

## MOTION & ANIMATION

### Animation Anti-Patterns
- ❌ Static layouts with zero animation — instant transitions
- ❌ `transition: all` used everywhere — animates things that shouldn't
- ❌ Bounce or elastic easing on interface elements — feels dated
- ❌ No transition easing — changes instant or linear
- ❌ Same animation duration on all elements — mechanical
- ❌ No animation delay between staggered elements
- ❌ Animation on `opacity` and `width` together — triggers layout shift
- ❌ `will-change` applied to all elements — wastes memory
- ❌ Animation runs on page load — jarring for users
- ❌ No `prefers-reduced-motion` respect — ignores accessibility

**Fix:** Use transform/opacity only. Stagger animations. Respect motion preference.

### Transform Issues
- ❌ Image hover transform — scaling or rotating on hover
- ❌ Transform-origin not set correctly — pivot point wrong
- ❌ No easing function specified — defaults to linear

**Fix:** Use ease-out-quart/quint/expo. Set transform-origin. Smooth animations.

### Technical Animation Issues
- ❌ Layout property animation — animating width/height/padding/margin causes jank
- ❌ Scroll animation janky — no smooth scroll fallback
- ❌ CSS animation runs on :hover on touch devices — never stops

**Fix:** Use transform/opacity. Provide fallbacks. Test on touch devices.

---

## COPY & CONTENT

### Copy Issues
- ❌ Em-dash overuse — more than couple em-dashes is AI cadence
- ❌ Throat-clearing openers — "Here's the thing," "Let me be clear," "It turns out"
- ❌ Binary contrasts — "Not because X. Because Y." Telegraphed reversals
- ❌ Dramatic fragmentation — "Three words. That's it." Pattern repetition
- ❌ Aphoristic cadence — sections landing on manufactured contrast
- ❌ Theater framing copy — dismissing things as "theater"
- ❌ Generic SaaS phrases — "streamline," "empower," "supercharge," "world-class"
- ❌ Vague aspirational headlines — "Build the future," "Unlock potential"
- ❌ Generic feature copy — "Fast," "Secure," "Easy," "Scalable"
- ❌ Marketing buzzwords — "enterprise-grade," "next-generation," "cutting-edge"

**Fix:** Use specific verbs and nouns. Say what the product literally does. Real voice.

### Content Structure
- ❌ Redundant UX writing — label, sublabel, helper text all saying same thing
- ❌ Copy fits frame but misses user job — fills space, doesn't support goal
- ❌ Low information density — vague claims, no numbers/names/dates
- ❌ Cadence uniformity — all sentences same length and rhythm
- ❌ CTA text always same — "Get Started," "Try it free," "Learn more"

**Fix:** One copy per element. Specific details. Real user jobs. Action verbs.

---

## RESPONSIVE DESIGN

### Breakpoint Issues
- ❌ Only two breakpoints (mobile/desktop) — tablet ignored
- ❌ Breakpoints at weird values (650px, 750px, 900px) — no system
- ❌ Typography doesn't scale — same size on mobile and desktop
- ❌ Touch targets too small on mobile (< 44px) — WCAG violation
- ❌ No mobile-first approach — desktop styles overridden
- ❌ Container queries ignored — layout breaks at specific widths

**Fix:** Mobile-first design. Standard breakpoints (640px, 768px, 1024px, 1280px).

### Mobile Specific
- ❌ Menu different on mobile without reason — breaks consistency
- ❌ Horizontal scrolling introduced accidentally
- ❌ Images on mobile distorted — not responsive
- ❌ Full-width images — overwhelming on small screens
- ❌ Viewport meta tag missing or wrong — mobile scaling broken

**Fix:** Same structure mobile-to-desktop. Responsive images. Proper viewport tag.

---

## ACCESSIBILITY VIOLATIONS

### ARIA & Semantics
- ❌ `role="button"` on `<div>` without keyboard support
- ❌ ARIA roles misused — roles don't match element purpose
- ❌ `aria-label` missing on icon buttons — says "button" only
- ❌ Aria labels describing obvious elements — "Previous button"

**Fix:** Use semantic HTML. ARIA only when semantic elements insufficient.

### Keyboard Navigation
- ❌ Hover actions don't work on focus — CSS :hover not on :focus
- ❌ Tab order illogical or invisible
- ❌ Skip link missing — keyboard users tab through nav
- ❌ No keyboard support for interactive elements
- ❌ Focus outline removed without alternative

**Fix:** Tab order logical. All elements keyboard accessible. Visible focus states.

### Screen Reader Support
- ❌ Alt text missing or generic — "image" or "photo"
- ❌ Form labels not associated — `<label for="">` missing
- ❌ Heading structure wrong — screen readers navigate via headings
- ❌ `<button>` typed as `<a>` — semantic HTML violated
- ❌ List markup not used — content arranged visually, not semantically

**Fix:** Real alt text. Every input has label. Proper heading structure.

### Color & Contrast
- ❌ Color conveying meaning alone — no additional indicator
- ❌ Low contrast text — doesn't meet WCAG AA
- ❌ Focus state only color change — no shape/size change

**Fix:** WCAG AA minimum (4.5:1). Multiple visual cues. Distinct focus states.

---

## CSS & TECHNICAL SLOP

### CSS Structure
- ❌ No CSS variables used — hex codes hardcoded everywhere
- ❌ Inline styles scattered throughout — hard to maintain
- ❌ !important used liberally — breaks cascade
- ❌ CSS class names don't match components — `btn-primary` in `Card.tsx`
- ❌ Media queries scattered in code — not organized
- ❌ Unused CSS left in file — bloated stylesheets
- ❌ CSS imported multiple times — redundant
- ❌ No naming convention — classes like `button1`, `button2`

**Fix:** CSS variables for all values. Organized media queries. BEM or component naming.

### Design Tokens
- ❌ No design system — colors, spacing, typography all ad-hoc
- ❌ Hardcoded values instead of tokens — `24px` instead of `var(--spacing-6)`
- ❌ No z-index system — values all over (5, 10, 50, 100, 999)
- ❌ No shadow scale — each element has unique shadow
- ❌ Typography scale not enforced

**Fix:** Define design tokens. Use CSS variables. Document system.

### Responsive Issues
- ❌ No mobile-first approach — desktop styles overridden
- ❌ Breakpoints not standardized
- ❌ Layout shifts on load — images missing dimensions
- ❌ Overflow hidden clipping elements — positioned children cut off

**Fix:** Mobile-first CSS. Standard breakpoints. Explicit dimensions.

---

## SPECIFIC COMPONENT SLOP

### Table Styling
- ❌ Table without proper row hover — can't track across columns
- ❌ Alternating row colors AND borders — overcomplicated
- ❌ No header distinction — header cells same style as body

**Fix:** Either alternating rows OR borders. Clear header. Row hover.

### Pagination
- ❌ Pagination buttons all same size — current page doesn't stand out
- ❌ Pagination from inconsistent CSS — shadcn/ui vs custom

**Fix:** Current page distinct styling. Disabled states on edges.

### Alerts & Notifications
- ❌ Alert/banner colors random — not tied to system
- ❌ Notification toast from different edges — no consistency
- ❌ Error/warning/info colors all similar — hard to distinguish
- ❌ No icon in alert — only color indicates type

**Fix:** System colors (red/yellow/green/blue). Icons required. Consistent placement.

### Modals & Overlays
- ❌ Modal backdrop wrong z-index — clickable content behind
- ❌ Modal abuse — complex content crammed in modal
- ❌ No scroll handling in modal — content gets cut off
- ❌ Modal without close button — only outside click works

**Fix:** High z-index backdrop. Own page if needs scroll. Clear close affordance.

### Tooltips & Popovers
- ❌ Tooltip no delay — shows on mouse pass-through
- ❌ Tooltip positioning off-screen — clipped by parent
- ❌ Popover with no dismiss mechanism — stuck on screen
- ❌ No arrow pointing to trigger — unclear what it's for

**Fix:** 150-200ms delay. Proper positioning. Clear dismiss. Visual connection.

### Dropdowns
- ❌ Dropdown menu behind content — z-index too low
- ❌ Dropdown positioning off-screen — overlapping text
- ❌ No current selection visible — user unsure what's selected
- ❌ Multiple dropdowns conflicting — z-index issues

**Fix:** Proper z-index. Conditional rendering. Visual selection indicator.

---

## FRAMEWORK CONVERGENCE

### CSS Framework
- ❌ shadcn/ui defaults everywhere — identical styling without intervention
- ❌ Tailwind utility class patterns — same combos across sites
- ❌ Bootstrap conventions exactly — grid, buttons, forms unchanged
- ❌ Glassmorphism everywhere — 2022 trend still default

**Fix:** Customize framework output. Use design system constraints.

### Component Library
- ❌ Components from library used as-is — no customization
- ❌ Component styling inconsistent across pages — each built differently
- ❌ All pages use same template — hero-metric-features repeats

**Fix:** Define component specs. Force consistency. Create variants intentionally.

---

## ANTI-PATTERNS SUMMARY

### Things That Make UI Scream "AI Slop"

**The Convergence Problem**
When these appear together, UI reads as generated without opinion:
- Inter font + purple gradient + dark mode + glassmorphism + colored left-border cards + same shadows everywhere + all-caps labels + centered hero + badge above H1

**The Low-Effort Tells**
- No design system — every element ad-hoc
- No interaction states — critical states (error, disabled, empty, loading) absent or improvised late
- No constraint ownership — default patterns applied everywhere
- No intentional choices — same styles regardless of context (brutalist site vs B2B dashboard vs Gen Z app)

**The Structural Issues**
- No visual differentiation — everything same priority
- No semantic structure — HTML divorced from meaning
- No accessibility consideration — color alone conveys meaning
- No performance thought — all images load, will-change everywhere

---

## HOW TO USE THIS GUIDE

### For Prompts to AI Agents

Include this as part of your design system prompt:

```
# Anti-Slop Constraints

DO NOT:
- Use Inter font exclusively (pair display + body)
- Create purple-to-blue gradients
- Apply uniform shadows to all elements
- Use glassmorphism decoratively
- Add thick colored left borders to cards
- Skip interactive states (hover, focus, disabled, error, empty, loading)
- Use vague marketing copy ("streamline," "empower," "supercharge")
- Create all-caps section labels everywhere
- Center everything on the page
- Use single font for entire interface

DO:
- Define design tokens (spacing, color, typography, shadows)
- Create distinct interactive states for every element
- Use semantic HTML structure
- Implement WCAG AA contrast minimum
- Test keyboard navigation
- Maintain consistent spacing scale
- Make intentional typographic choices
- Ensure mobile-first responsiveness
- Include all necessary interaction feedback
- Write specific, action-oriented copy
```

### For Review

When reviewing AI-generated UI, check:
1. Are fonts diverse and intentional?
2. Are colors tied to a deliberate palette (not purple/cyan)?
3. Does every interactive element have 5+ distinct states?
4. Is spacing based on a system, not arbitrary?
5. Are there semantic HTML elements (nav, main, button, label)?
6. Do form fields have proper labels and focus states?
7. Is contrast WCAG AA compliant?
8. Are animations purposeful and use transform/opacity?
9. Does copy use specific verbs, not buzzwords?
10. Are breakpoints standard and mobile-first?

---

## REFERENCE SOURCES

- Adrian Krebs' AI Design Slop Analysis (16 patterns)
- Impeccable.style Slop Catalog (46 patterns)
- MindStudio Claude Design System
- Managed Code AI in UI Design
- Eric Hatheway AI Slop Detection Guide
- Gaurav Tiwari Stop Slop Skill

---

## FINAL THOUGHT

Slop isn't a design choice—it's a lack of choice. Every element here exists because an AI reached for the highest-frequency pattern. By being explicit about constraints, you force intentional decisions. That's where craft begins.
