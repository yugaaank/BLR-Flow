
# AI Website Design Rulebook

## Objective

Generate websites that are:

* Useful
* Clear
* Fast
* Accessible
* Consistent
* Memorable

Do not optimize for looking impressive.

Optimize for reducing user effort and increasing user confidence.

---

# Core Principle

Before creating any UI, answer:

1. Who is the user?
2. What is their goal?
3. What is their biggest frustration?
4. What action should they take?
5. What information do they need first?

Design exists to help users complete tasks.

---

# Absolute Rules

## Rule 1: Content Before Design

Never start with colors, gradients, cards, animations, or components.

Order:

Content
→ Structure
→ Navigation
→ Layout
→ Visual Design
→ Animation

Bad:

Design first.

Good:

Problem first.

---

## Rule 2: Every Screen Must Answer

Within 5 seconds users must understand:

* What is this?
* Why should I care?
* What do I do next?

If not, redesign.

---

## Rule 3: One Primary Action

Each screen should have:

* One primary CTA
* One primary purpose

Avoid competing actions.

Bad:

* Sign Up
* Contact
* Learn More
* Watch Demo
* Subscribe
* Download

Good:

* Start Free Trial

---

## Rule 4: Reduce Cognitive Load

Remove:

* Unnecessary text
* Decorative elements
* Duplicate actions
* Unclear labels
* Excessive options

Users should never think:

* Where do I click?
* What does this mean?
* What happens next?

---

# Information Architecture

## Build Structure Before UI

Create:

* User goals
* Content hierarchy
* Navigation hierarchy
* User flows

Then design.

---

## Content Hierarchy

Always define:

Level 1:
Most important information

Level 2:
Supporting information

Level 3:
Additional details

Everything cannot be equally important.

---

## Navigation Rules

Users must always know:

* Where am I?
* Where can I go?
* How do I return?

Avoid deep navigation trees.

Prefer shallow hierarchies.

---

# Visual Hierarchy

## Visual Weight Order

Control attention using:

1. Position
2. Size
3. Contrast
4. Color
5. Motion

Important content should receive more visual weight.

---

## Typography Rules

Typography is more important than colors.

Requirements:

* Maximum 2 font families
* Minimum 16px body text
* Clear scale system
* Consistent spacing
* Consistent weights

Example:

Display: 64px
H1: 48px
H2: 36px
H3: 28px
Body: 16px
Caption: 14px

---

## Spacing System

Use a spacing scale.

Example:

4
8
12
16
24
32
48
64
96

Never use random values.

Bad:

13px
17px
29px

Good:

16px
24px
32px

---

## Color Rules

Use colors with purpose.

Recommended:

* Primary
* Secondary
* Success
* Warning
* Error
* Neutral

Avoid:

* Rainbow palettes
* Excessive gradients
* Decorative colors

Color should communicate meaning.

---

# Anti AI Slop Rules

Never generate:

* Generic startup copy
* Empty marketing language
* Fake testimonials
* Fake statistics
* Stock illustration overload
* Massive hero sections with no information
* Random glassmorphism
* Overused gradients
* Dribbble style layouts without usability

Avoid phrases like:

"Transforming the future"

"Empowering innovation"

"Revolutionizing the industry"

"Next generation platform"

Use specific language.

---

# Real Content First

Prefer:

* Real screenshots
* Real examples
* Real data
* Real workflows
* Real customer stories

Over:

* Placeholder content
* Lorem ipsum
* Generic illustrations

---

# Component Design

Every component must define:

Default
Hover
Focus
Active
Loading
Disabled
Success
Error

Never design only the happy path.

---

# State Design

Every screen must handle:

* Loading
* Empty
* Error
* Success
* Offline
* Partial data

Bad products ignore state design.

Good products design all states.

---

# Forms

Requirements:

* Labels above inputs
* Clear validation
* Helpful error messages
* Minimal required fields

Bad:

"Invalid input"

Good:

"Password must contain at least 8 characters"

---

# UX Writing

Text must be:

* Clear
* Specific
* Actionable

Bad:

Continue

Good:

Create Account

Bad:

Submit

Good:

Send Application

Specific beats clever.

---

# Accessibility Requirements

Mandatory:

* Keyboard navigation
* Visible focus states
* Semantic HTML
* Alt text
* Proper labels
* Sufficient contrast

Accessibility is not optional.

---

# Interaction Design

Every interaction must provide feedback.

Examples:

* Hover feedback
* Loading feedback
* Success feedback
* Error feedback

Users should never wonder whether an action worked.

---

# Motion Design

Animation must communicate.

Allowed:

* State transitions
* Loading indicators
* Navigation transitions
* Feedback animations

Avoid:

* Decorative motion
* Scroll hijacking
* Long animations
* Animation without purpose

Function before spectacle.

---

# Mobile First

Design mobile before desktop.

Verify:

* Touch targets
* Thumb reachability
* Form usability
* Navigation usability
* Responsive hierarchy

Do not simply shrink desktop layouts.

---

# Responsive Design

Adapt:

* Content priority
* Navigation
* Layout
* Density

Not just width.

---

# Performance Rules

Target:

* Fast first render
* Minimal blocking scripts
* Optimized images
* Lazy loading
* Skeleton states

Users experience performance as UX.

---

# User Psychology

Apply:

## Fitts's Law

Important actions should be larger and easier to reach.

## Hick's Law

Reduce choices.

## Jakob's Law

Follow familiar patterns.

## Miller's Law

Chunk information.

## Peak End Rule

Optimize memorable moments.

## Serial Position Effect

Place important content first or last.

---

# Mental Models

Match user expectations.

Examples:

* Shopping cart
* Trash bin
* Folder

Do not invent new interactions without strong justification.

---

# Discoverability

Users should find features naturally.

Avoid hidden functionality.

Prefer:

* Clear navigation
* Search
* Labels
* Tooltips

---

# Scannability

Assume users scan.

Use:

* Headings
* Lists
* Sections
* Visual grouping

Avoid large walls of text.

---

# Enterprise UX Rules

For productivity software:

Prioritize:

* Efficiency
* Density
* Search
* Keyboard shortcuts
* Bulk actions

Do not sacrifice productivity for aesthetics.

---

# Dashboard Rules

Show:

1. Most important data first
2. Actions near data
3. Filtering
4. Sorting
5. Search

Users come for information, not decoration.

---

# Trust Design

Increase trust using:

* Real content
* Consistency
* Transparency
* Predictable behavior
* Professional copy

Avoid:

* Fake urgency
* Fake testimonials
* Hidden pricing
* Dark patterns

---

# Design Systems

Create:

## Tokens

Spacing
Typography
Radius
Color
Shadow

## Components

Buttons
Inputs
Cards
Tables
Modals

Maintain consistency everywhere.

---

# Empty States

Never leave blank screens.

Provide:

* Explanation
* Next action
* Helpful guidance

Bad:

No content.

Good:

Create your first project.

---

# Error Recovery

When users fail:

* Explain the problem
* Explain why
* Explain how to fix it

Never blame users.

---

# User Testing Requirement

Before considering design complete:

Observe at least 5 users.

Watch:

* Confusion
* Hesitation
* Misclicks
* Navigation failures

User behavior overrides designer assumptions.

---

# Quality Checklist

Before outputting a design verify:

[ ] Purpose clear within 5 seconds

[ ] One primary CTA

[ ] Information hierarchy obvious

[ ] Navigation intuitive

[ ] Typography consistent

[ ] Spacing system consistent

[ ] Accessible

[ ] Mobile friendly

[ ] Loading states exist

[ ] Empty states exist

[ ] Error states exist

[ ] Real content used

[ ] No AI marketing jargon

[ ] No unnecessary animations

[ ] Fast performance

[ ] Trust signals present

[ ] User effort minimized

[ ] User confidence increased

---

# Final Evaluation Question

For every design decision ask:

"Does this reduce user effort or increase user confidence?"

If the answer is no, remove it.
