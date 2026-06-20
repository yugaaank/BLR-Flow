# Micro-Interactions & Animations: Complete AI Guidelines
## Rule-Based System to Avoid AI Slop & Create Human-Quality Motion Design

**Last Updated**: June 2026  
**Version**: 1.0 - Complete  
**Audience**: AI Agents, LLM Coding Tools, Automated UI Builders

---

## TABLE OF CONTENTS

1. [Philosophy & Core Principles](#philosophy--core-principles)
2. [Detection Rules: What Makes AI Slop](#detection-rules-what-makes-ai-slop)
3. [Timing Specifications](#timing-specifications)
4. [Easing Functions & Curves](#easing-functions--curves)
5. [Spring Physics Rules](#spring-physics-rules)
6. [Button State Requirements](#button-state-requirements)
7. [Component Animation Patterns](#component-animation-patterns)
8. [Loading & Progress States](#loading--progress-states)
9. [Feedback Systems](#feedback-systems)
10. [Gesture & Interaction Animations](#gesture--interaction-animations)
11. [Scroll Animations](#scroll-animations)
12. [Accessibility & Inclusive Motion](#accessibility--inclusive-motion)
13. [Performance Rules](#performance-rules)
14. [Motion Design Tokens](#motion-design-tokens)
15. [Tools & Libraries Selection](#tools--libraries-selection)
16. [Design System Integration](#design-system-integration)
17. [Testing & Validation](#testing--validation)
18. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
19. [Code Examples](#code-examples)
20. [Onboarding Animations](#onboarding-animations)
21. [SVG Animation Rules](#svg-animation-rules)
22. [Haptic & Multi-Sensory Feedback](#haptic--multi-sensory-feedback)
23. [Dark Mode Considerations](#dark-mode-considerations)
24. [Error State Animations](#error-state-animations)
25. [Success State Animations](#success-state-animations)

---

## PHILOSOPHY & CORE PRINCIPLES

### Rule 1.1: Micro-Interactions Are The Soul of Interface
**Source**: Aarron Walter, "Designing for Emotion"

- Micro-interactions give machines human touch
- They acknowledge user actions without disrupting workflow
- Large animations work around actions; micro-interactions work within them
- Every motion must serve functional purpose

### Rule 1.2: Restraint Over Exuberance
**Core Principle**

- NOT everything should move
- Elegance = enhancement with stillness
- Maximum 2-3 active motions per screen
- One well-orchestrated page load beats scattered animations throughout

### Rule 1.3: C.U.R.E. Motion Framework

For each animation, ask: **"What is the user doing right now?"**

- When user engaged in task: DO NOT add full-screen animations (disrupts rhythm)
- After user action: Add small feedback (button press confirmation)
- Micro-interactions show up precisely when user decides

### Rule 1.4: Taste = Trained Instinct

Humans succeed because they:
- Study great work repeatedly
- Think deeply about WHY something feels good
- Practice relentlessly
- Surround themselves with excellence

**AI must follow explicit rules** because it cannot develop taste through experience.

---

## DETECTION RULES: WHAT MAKES AI SLOP

### Rule 2.1: Typography Red Flags

**DO NOT USE**:
- Inter (generic default)
- Roboto (default system)
- Arial (web default)
- System fonts exclusively

**DETECTION**: If font is one of above + no distinctive pairing, mark as AI slop.

**FIX**: Choose distinctive display font paired with refined body font. Examples:
- Söhne (Stripe)
- Custom/licensed foundry type
- Unique pairing (Futura Display + Helvetica Body)

### Rule 2.2: Color Palette Red Flags

**DO NOT USE**:
- Purple gradient on white background (99% AI slop indicator)
- Evenly distributed colors across interface
- Timid, low-contrast palettes
- No accent colors

**DETECTION**: Analyze color distribution. If uniform + muted + includes purple, likely slop.

**FIX**: 
- Commit to cohesive aesthetic
- Dominant color with sharp accent
- Use CSS variables for consistency
- Draw from IDE themes, cultural aesthetics, brand identity

### Rule 2.3: Layout Red Flags

**DO NOT USE**:
- Three centered cards (default template pattern)
- Predictable grid layouts
- No spatial hierarchy
- Passive layout

**DETECTION**: Layout matches known template patterns (Bootstrap default, Material default, etc.)

**FIX**:
- Unexpected layouts
- Clear visual hierarchy
- Meaningful spatial relationships
- Custom grid arrangements

### Rule 2.4: Motion Red Flags

**DO NOT USE**:
- Missing button states entirely
- Scattered, purposeless animations
- Full-page animations on every interaction
- Linear easing
- No feedback on interactions

**DETECTION**: 
- Button has no hover state
- Hover state is only animation
- Form field has no validation animation
- Loading state is missing

**FIX**: See [Button State Requirements](#button-state-requirements)

### Rule 2.5: Animation Absence = Slop

**CRITICAL**: Interfaces with NO animation feel broken and unresponsive.

- Every interactive element needs state feedback
- Forms need validation feedback
- Loading needs progress indication
- Success needs confirmation

---

## TIMING SPECIFICATIONS

### Rule 3.1: Micro-Interaction Timing

| Action | Duration | Use Case |
|--------|----------|----------|
| Button hover effect | 150-200ms | Visual feedback, no wait |
| Button press/click | 100-150ms | Immediate acknowledgment |
| Toggle switch | 150-250ms | State change confirmation |
| Dropdown open | 200-300ms | Quick reveal |
| Checkbox mark animation | 200ms | Selection feedback |
| Form field focus ring | 200ms ease-out | Keyboard/accessibility |

**RULE**: Anything slower than 150ms for hover feels sluggish.

### Rule 3.2: Standard Transition Timing

| Action | Duration | Use Case |
|--------|----------|----------|
| Enter state (appearing) | 200-300ms | Elements appearing |
| Modal open | 250-300ms | Dialog appearance |
| Slide navigation | 250-300ms | Panel transitions |
| Card animation | 200-300ms | Component reveal |
| Exit state (disappearing) | 150-250ms | Elements leaving |

**RULE**: Exit FASTER than enter. User waiting for next action, don't delay them.

### Rule 3.3: Complex Orchestrations

| Action | Duration | Use Case |
|--------|----------|----------|
| Page load reveal sequence | 400-600ms total | Multi-element choreography |
| Multi-step process animation | 400-600ms | Onboarding, wizards |
| Complex transition | 400-600ms | Between app states |

**CRITICAL**: Never exceed 1 second total for animation unless explicitly necessary.

### Rule 3.4: Stagger Delays

When animating multiple items in sequence:
- **Stagger**: 30-60ms between items
- **Longer staggers** (100ms+): Feel like slideshow (bad)
- **No stagger**: All items at once feels overwhelming

```
Item 1: Start at 0ms
Item 2: Start at 40ms (30-60ms delay)
Item 3: Start at 80ms
```

### Rule 3.5: Loading State Timings

| Indicator | Rule |
|-----------|------|
| Spinner | Use for < 2 seconds |
| Skeleton screen | Use for content-heavy loads |
| Progress bar | Use for > 2 seconds |
| Indeterminate spinner | Avoid (causes anxiety) |

**RULE**: Users wait 22.6 seconds with progress bar feedback vs. 9 seconds without.

### Rule 3.6: Latency Sensitivity

**Users perceive unresponsiveness if feedback slower than**:
- 50-100ms: Felt as delay
- 70-100ms (tactile/audio feedback): Quality drops sharply
- 100-150ms (visual feedback): Quality drops sharply
- 300ms: Perceived quality tanks entirely

**FIX**: Always provide feedback within 100ms.

### Rule 3.7: Form Validation Timing

```
Real-time validation feedback: 200-300ms ease-out
Error shake animation: 200ms 2x oscillation
Success checkmark: 300ms scale + fade
```

---

## EASING FUNCTIONS & CURVES

### Rule 4.1: Easing Selection by Context

| Easing | Function | Use Case |
|--------|----------|----------|
| **ease-out** | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Entries, button hovers, dropdowns |
| **ease-in** | `cubic-bezier(0.42, 0, 1, 1)` | Exits, removals, dismissals |
| **ease-in-out** | `cubic-bezier(0.42, 0, 0.58, 1)` | Slow start & end, transitions |
| **linear** | `cubic-bezier(0, 0, 1, 1)` | Progress bars ONLY |

**CRITICAL**: Never use linear for UI animations (feels mechanical, unnatural).

### Rule 4.2: Why Ease-Out Wins

**Ease-out = fast start + slow finish**
- Immediate movement = responsiveness (user sees action registered)
- Deceleration = natural feel (like physical object settling)
- Better than ease (which starts slow, feels delayed)

**EXAMPLE**: Dropdown opens with ease-out = user feels responsiveness immediately.

### Rule 4.3: Custom Cubic-Bezier Curves

**Material Design standard curve**:
```css
cubic-bezier(0.4, 0, 0.2, 1)
```
Use for production UI. Proven across thousands of apps.

**For overshoot/bounce effect**:
```css
cubic-bezier(0.18, 0.89, 0.32, 1.28)
```
Y-values > 1 create bounce. This one overshoots ~28% before settling.

**RULE**: Only use overshoot for special cases (celebration animations, delight moments).

### Rule 4.4: Cubic-Bezier Anatomy

```
cubic-bezier(P1.x, P1.y, P2.x, P2.y)
```

- P1.x and P2.x: MUST be in range [0, 1] (time axis)
- P1.y and P2.y: Can exceed 0-1 for bouncing (creates overshoot)
- Control points approach but don't reach actual path

**RULE**: X values clamped = single y value per x (well-defined function).

### Rule 4.5: Easing Function Selection Tool

Create visual reference for team:
- easings.net (interactive tool)
- cubic-bezier.com (generator)
- Include preview of actual animation, not just curve

---

## SPRING PHYSICS RULES

### Rule 5.1: Springs vs. Linear (Critical Difference)

| Property | Linear/Easing | Spring Physics |
|----------|---|---|
| Feel | Mechanical, predictable | Natural, alive |
| Calculation | Fixed duration curve | Physics simulation |
| Frame-by-frame | Predefined path | Real-time calculation |
| Interruptibility | Jarring if interrupted | Smoothly continues |
| Velocity sensing | No | Yes (reads current state) |

**RULE**: Spring animations feel more natural because they simulate real-world physics.

### Rule 5.2: Spring Parameters

```javascript
{
  stiffness: 300,   // How quickly object snaps back
  damping: 30,      // Friction; how quickly energy dissipates
  mass: 1           // Weight of object (heavier = slower)
}
```

**Relationship**:
- **Higher stiffness** = faster snap (like tight spring)
- **Higher damping** = more friction (object slows faster)
- **Higher mass** = heavier movement (sluggish)

### Rule 5.3: Spring Presets

| Name | Stiffness | Damping | Feel | Use Case |
|------|-----------|---------|------|----------|
| Stiff | 300+ | 30+ | Snappy, bouncy | Button press |
| Gentle | 100-200 | 20-30 | Smooth, delicate | Hover effects |
| Molasses | 50-100 | 40+ | Heavy, weighted | Large scale changes |

**RULE**: Test spring parameters on actual device, not just desktop.

### Rule 5.4: Why Cubic-Bezier Fails for Springs

```
Cubic-bezier limitations:
- Fixed shape (4 control points only)
- Can't bounce twice
- Y coordinates can't be controlled independently per animation
- Can only overshoot ONCE
```

**Spring advantage**: Continuous physics calculation = natural settling.

### Rule 5.5: CSS linear() for Spring Simulation

Modern CSS supports `linear()` function to approximate spring physics:

```css
animation-timing-function: linear(
  0, 0.05 5%, 0.1 10%, 0.2 20%, 0.3 30%,
  0.4 40%, 0.5 50%, 0.6 60%, 0.7 70%,
  0.85 80%, 0.95 90%, 1 100%
);
```

Provides many points to simulate curve. Better approximation than cubic-bezier.

---

## BUTTON STATE REQUIREMENTS

### Rule 6.1: Six Mandatory Button States

Every interactive element MUST have these states:

1. **Default (Enabled)**: Base state, clickable
2. **Hover**: Mouse over (desktop)
3. **Focus**: Keyboard/accessibility navigation
4. **Active/Pressed**: During click
5. **Disabled**: Unclickable, grayed out
6. **Loading**: In-progress feedback

**RULE**: Missing even ONE state = feels incomplete/broken.

### Rule 6.2: Default State Styling

```css
.button {
  background: brand-color;
  color: contrasting-color;
  border-radius: intentional-value; /* not 4px default */
  padding: spacious; /* not cramped */
  font-weight: meaningful; /* not auto */
}
```

**RULE**: Default state sets tone for entire interface. Must feel intentional.

### Rule 6.3: Hover State Animation (150-200ms)

```css
.button:hover {
  /* Option 1: Subtle background shift */
  background: color-shift(5%);
  transition: background 200ms ease-out;
}

/* Option 2: Scale + shadow */
.button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 200ms ease-out;
}
```

**RULE**: Hover must feel inviting, not jarring. Avoid >10% scale changes.

### Rule 6.4: Focus State (Accessibility Critical)

**WCAG Requirement**: Visible focus indicator with sufficient contrast.

```css
.button:focus-visible {
  outline: 3px solid brand-color;
  outline-offset: 2px;
}
```

**RULE**: NEVER remove focus ring without custom replacement. Some users navigate by keyboard only.

**Animation timing**: 200ms ease-out to appear.

### Rule 6.5: Active/Pressed State (100-150ms)

```css
.button:active {
  background: darker-shade;
  transform: scale(0.98); /* slight compression */
  transition: all 100ms ease-out;
}
```

**RULE**: Active state must feel immediate. User sees action registered within 100-150ms or will press again.

### Rule 6.6: Disabled State

```css
.button:disabled {
  background: muted-gray;
  color: lighter-gray;
  cursor: not-allowed;
  opacity: 0.5;
}
```

**RULE**: Use color + cursor change + opacity. Don't rely on color alone (colorblind users).

### Rule 6.7: Loading State (200-300ms)

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.button.loading {
  background: loading-color;
  animation: spin 1s linear infinite;
  cursor: wait;
}
```

**RULE**: Loading animation must communicate "system is working" without causing anxiety.

### Rule 6.8: Button State Consistency

**CRITICAL**: If Button A uses scale(1.02) for hover, ALL buttons must.

If Button B uses shadow expansion, ALL buttons must follow same pattern.

Inconsistent patterns = feels unfinished.

---

## COMPONENT ANIMATION PATTERNS

### Rule 7.1: Modal/Dialog Opening

```css
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal {
  animation: modalEnter 300ms ease-out;
}
```

**Timing**: 250-300ms  
**Easing**: ease-out  
**Trigger**: Immediate on modal creation

### Rule 7.2: Modal/Dialog Closing

```css
@keyframes modalExit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.modal.closing {
  animation: modalExit 200ms ease-in forwards;
}
```

**Timing**: 200ms (faster than enter)  
**Easing**: ease-in  
**Rule**: Exit faster so user can proceed to next action

### Rule 7.3: Dropdown Menu Opening

```css
@keyframes dropdownEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown {
  animation: dropdownEnter 200ms ease-out;
}
```

**Timing**: 200ms  
**Easing**: ease-out  
**Direction**: Slide down from top

### Rule 7.4: Sidebar/Drawer Slide

```css
@keyframes drawerEnter {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.drawer {
  animation: drawerEnter 300ms ease-out;
}
```

**Timing**: 250-300ms  
**Easing**: ease-out  
**Direction**: Slide from left (or right depending on context)

### Rule 7.5: Card Reveal/Hover

```css
.card {
  transition: all 300ms ease-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
```

**Timing**: 300ms  
**Easing**: ease-out  
**Effect**: Lift + shadow enhancement

### Rule 7.6: Accordion Expand/Collapse

```css
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease-out;
}

.accordion.open .accordion-content {
  max-height: 500px; /* or use max-content with caution */
}
```

**Timing**: 250-300ms  
**Easing**: ease-out  
**CAUTION**: Avoid animating height (causes layout shift). Use max-height or transform + overflow.

### Rule 7.7: Tab Switching

```css
.tab-content {
  opacity: 0;
  transform: translateX(20px);
  pointer-events: none;
  transition: all 300ms ease-out;
}

.tab-content.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
```

**Timing**: 200-300ms  
**Easing**: ease-out  
**Effect**: Fade + slide in

### Rule 7.8: List Item Addition

```css
@keyframes listItemEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-item.new {
  animation: listItemEnter 250ms ease-out;
}
```

**Timing**: 200-250ms  
**Easing**: ease-out  
**Rule**: Stagger if multiple items (30-60ms between each)

### Rule 7.9: List Item Removal

```css
@keyframes listItemExit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.list-item.removing {
  animation: listItemExit 200ms ease-in forwards;
}
```

**Timing**: 150-200ms  
**Easing**: ease-in  
**Direction**: Slide right or fade

---

## LOADING & PROGRESS STATES

### Rule 8.1: Skeleton Screen Strategy

**Use skeleton screens when**:
- Content load takes > 0.5 seconds
- User can see page structure while loading
- User can estimate wait time by seeing placeholder layout

**Structure**:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Timing**: 0.6-0.8s shimmer loop  
**Rule**: Skeleton should match final content layout exactly

### Rule 8.2: Spinner (Indeterminate Loading)

**Use spinners only when**:
- User doesn't need to know duration
- Load time < 2 seconds
- System status is unknown

**CAUTION**: Indeterminate spinners increase user anxiety after 3+ seconds.

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
  width: 24px;
  height: 24px;
  border: 2px solid #f0f0f0;
  border-top-color: brand-color;
  border-radius: 50%;
}
```

**Timing**: 1s linear continuous  
**Rule**: Avoid for > 2 seconds

### Rule 8.3: Progress Bar

**Use progress bars when**:
- User waits > 2 seconds
- Progress can be determined
- Concrete indication provides reassurance

```css
.progress-bar {
  width: 0%;
  height: 4px;
  background: brand-color;
  transition: width 0.3s ease-out;
}
```

**Rule**: Users wait 22.6 seconds with progress feedback vs. 9 seconds without.

**Timing**: Smooth transition as percentage updates (0.3s ease-out per update)

### Rule 8.4: Progressive Content Loading

Load key content first, less important content in background:

```
1. Render text (immediate)
2. Load images (background, low priority)
3. Load interactive elements (medium priority)
4. Load analytics/tracking (lowest priority)
```

**Result**: Page feels faster because user sees content while rest loads.

### Rule 8.5: Loading Message Strategy

**Time-based messaging**:
- 0-1s: No message (instant feel)
- 1-3s: "Loading..."
- 3-5s: "Still working..."
- 5s+: "Almost done..." or "Taking longer than expected"

```javascript
let loadingMessage = null;
setTimeout(() => loadingMessage = "Loading...", 1000);
setTimeout(() => loadingMessage = "Still working...", 3000);
setTimeout(() => loadingMessage = "Almost there...", 5000);
```

---

## FEEDBACK SYSTEMS

### Rule 9.1: Toast Notification Timing & Appearance

```css
@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast {
  animation: toastEnter 200ms ease-out;
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 300px;
}
```

**Timing**:
- Enter: 200ms ease-out
- Display: 5-6 seconds minimum, max 10 seconds
- Exit: 200ms ease-in

**Rule**: One toast visible at time. Previous fades before next appears.

### Rule 9.2: Success Feedback

```css
@keyframes successPulse {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.success-checkmark {
  animation: successPulse 600ms ease-out;
  color: #4CAF50;
  font-size: 24px;
}
```

**Components**:
- Checkmark icon (scale up, fade in)
- Success message (slide in)
- Maybe subtle color flash

**Timing**: 300-400ms total

### Rule 9.3: Error Feedback

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-state {
  animation: shake 200ms ease-in-out;
  border-color: #f44336;
}
```

**Components**:
- Shake animation (200ms 2x oscillation)
- Error message display
- Red/warm color indicator
- Icon (exclamation or X)

**Timing**: 200ms shake, then persist until fixed

### Rule 9.4: Form Validation Real-Time

```css
.form-field {
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
}

.form-field.valid {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-field.invalid {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}
```

**As user types**:
1. Show green checkmark when input matches pattern
2. Show red X when input invalid
3. Animate in/out as validation state changes

**Timing**: 200-300ms transitions

### Rule 9.5: Input Masking Feedback

```javascript
// As user types phone number
// Animate in format separators
// Provide visual feedback that format is correct

input.addEventListener('input', (e) => {
  const masked = maskPhoneNumber(e.target.value);
  e.target.value = masked;
  
  if (isValidPhoneNumber(masked)) {
    e.target.classList.add('valid');
  }
});
```

**Timing**: Immediate (no delay)

---

## GESTURE & INTERACTION ANIMATIONS

### Rule 10.1: Button Press Feedback (100-150ms)

```css
.button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 100ms ease-out;
}
```

**Rule**: Faster than other transitions. Must feel instant.

### Rule 10.2: Drag & Drop Visual Feedback

```css
/* Grab state */
.draggable:hover {
  cursor: grab;
  background: rgba(0,0,0,0.02);
}

/* Dragging state */
.draggable.dragging {
  opacity: 0.7;
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  z-index: 1000;
}

/* Drop zone */
.drop-zone.active {
  background: rgba(66, 165, 245, 0.1);
  border: 2px dashed #42a5f5;
  animation: dropZonePulse 0.6s ease-in-out;
}
```

**Timing**:
- Grab: No delay (on hover)
- Dragging: Immediate scale
- Drop zone highlight: 0.4-0.6s pulse

### Rule 10.3: Swipe Gesture Feedback

**For mobile touch**:

```css
.swipe-item {
  transition: transform 300ms ease-out;
}

.swipe-item.swiped-left {
  transform: translateX(-100%);
  opacity: 0;
}
```

**Timing**: 250-300ms for swipe completion  
**Easing**: ease-out

### Rule 10.4: Pull-to-Refresh Animation

```css
@keyframes pullRefresh {
  from {
    transform: rotate(0deg);
    opacity: 0.5;
  }
  to {
    transform: rotate(360deg);
    opacity: 1;
  }
}

.pull-refresh-icon {
  animation: pullRefresh 1s linear infinite;
}
```

**Trigger**: When user pulls beyond threshold  
**Timing**: 1s linear continuous

### Rule 10.5: Pinch-to-Zoom Feedback

**Track finger distance in real-time**:

```javascript
let initialDistance = 0;
let currentScale = 1;

document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const distance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    
    if (initialDistance === 0) initialDistance = distance;
    
    currentScale = distance / initialDistance;
    element.style.transform = `scale(${currentScale})`;
  }
});
```

**Rule**: No delay. Follow finger in real-time.

### Rule 10.6: Long-Press Detection

```javascript
let pressTimer;

element.addEventListener('mousedown', () => {
  pressTimer = setTimeout(() => {
    element.classList.add('long-pressed');
    // Trigger context menu, edit mode, etc.
  }, 500);
});

element.addEventListener('mouseup', () => {
  clearTimeout(pressTimer);
  element.classList.remove('long-pressed');
});
```

**Timing**: 500ms threshold for long-press

---

## SCROLL ANIMATIONS

### Rule 11.1: Intersection Observer (Scroll-Triggered)

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target); // Trigger once
    }
  });
}, {
  rootMargin: '-50px', // Start animation 50px before element enters
  threshold: 0.1
});

document.querySelectorAll('[data-animate]').forEach(el => {
  observer.observe(el);
});
```

**CSS**:
```css
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: all 600ms ease-out;
}

[data-animate].in-view {
  opacity: 1;
  transform: translateY(0);
}
```

**Timing**: 400-600ms reveal animation  
**Easing**: ease-out

### Rule 11.2: Scroll-Linked Animation (Parallax)

```javascript
const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
element.style.transform = `translateY(${scrollProgress * 50}px)`;
```

**Rule**: Use RequestAnimationFrame for smooth 60fps:

```javascript
let scrollProgress = 0;

window.addEventListener('scroll', () => {
  scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  requestAnimationFrame(() => {
    element.style.transform = `translateY(${scrollProgress * 50}px)`;
  });
});
```

**CAUTION**: Parallax causes motion sickness for vestibular-sensitive users. Respect `prefers-reduced-motion`.

### Rule 11.3: Staggered Scroll Reveals

```css
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: all 600ms ease-out;
}

[data-animate]:nth-child(1) { transition-delay: 0ms; }
[data-animate]:nth-child(2) { transition-delay: 40ms; }
[data-animate]:nth-child(3) { transition-delay: 80ms; }
[data-animate]:nth-child(4) { transition-delay: 120ms; }

[data-animate].in-view {
  opacity: 1;
  transform: translateY(0);
}
```

**Rule**: 30-60ms stagger between items.

---

## ACCESSIBILITY & INCLUSIVE MOTION

### Rule 12.1: Respect prefers-reduced-motion

**MANDATORY** for ALL animations:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Alternative approach** - tone down instead of remove:

```css
@media (prefers-reduced-motion: reduce) {
  .button:hover {
    /* Scale down from 1.05 to 1.02 */
    transform: scale(1.02);
    transition: transform 300ms ease-out; /* Keep same timing */
  }
  
  @keyframes spin {
    /* Replace with fade instead of rotate */
    from { opacity: 0.5; }
    to { opacity: 1; }
  }
}
```

**Rule**: Never remove motion entirely without providing alternative feedback.

### Rule 12.2: Vestibular Disorder Safety

**DO NOT**:
- Large-scale parallax
- Rapid camera movements
- Spinning/rotating backgrounds
- Strobing/flashing effects

**DO**:
- Subtle scale changes (2-5%)
- Fade transitions
- Translate (horizontal/vertical) in moderation
- Respect reduced-motion preference

### Rule 12.3: Focus Visibility

```css
.button:focus-visible {
  outline: 3px solid #42a5f5;
  outline-offset: 2px;
}

/* Never do this: */
.button:focus {
  outline: none; /* FORBIDDEN */
}
```

**Rule**: Keyboard users (or screen reader users) need visible focus indicator.

**Animation**: 200ms ease-out appearance.

### Rule 12.4: Screen Reader Announcements

For animations that communicate state changes:

```html
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Toast notification here -->
  <div class="toast">✓ Saved successfully</div>
</div>
```

**Rule**: Aria-live updates when animation completes.

### Rule 12.5: Color Alone Cannot Communicate

**DO NOT**:
```css
.valid { color: green; }
.invalid { color: red; }
```

**DO**:
```css
.valid {
  color: green;
  border-color: green;
  /* Add checkmark icon */
}

.invalid {
  color: red;
  border-color: red;
  border-style: dashed;
  /* Add X icon */
}
```

---

## PERFORMANCE RULES

### Rule 13.1: GPU-Accelerated Properties Only

**ALWAYS use for animations**:
- `transform` (translate, scale, rotate, skew)
- `opacity`
- `filter` (blur, brightness, etc.)

**NEVER animate**:
- `width`, `height`
- `margin`, `padding`
- `top`, `left`, `right`, `bottom`
- `background-color` (unless fade)

```css
/* GOOD - GPU accelerated */
.button:hover {
  transform: scale(1.02);
  opacity: 0.8;
}

/* BAD - Layout thrash */
.button:hover {
  width: 110%;
  height: 110%;
  margin: -5%;
}
```

### Rule 13.2: will-change Property

```css
.animated-element {
  will-change: transform, opacity;
}
```

**CAUTION**: Causes memory overhead. Use sparingly:
- Apply to elements that WILL animate
- Remove after animation completes
- Maximum 5-10 will-change per page

### Rule 13.3: Hardware Acceleration Tricks

Force GPU acceleration without animation:

```css
.element {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

Or CSS variable hint:
```css
.element {
  will-change: transform;
}
```

### Rule 13.4: Frame Rate Budget

**Target: 60 FPS** = 16.67ms per frame

Check in DevTools Performance:
1. Open DevTools (F12)
2. Performance tab
3. Record 1-2 seconds
4. Look for 60 FPS green line
5. Avoid purple/orange/red drops

**Rule**: If animation drops below 40 FPS on mobile, reduce complexity.

### Rule 13.5: Lighthouse Performance Audit

Check for non-composited animations:
```
Lighthouse → Performance → "Avoid non-composited animations"
```

**If flagged**:
1. Only animate transform/opacity
2. Add will-change
3. Use translate instead of left/top

### Rule 13.6: requestAnimationFrame for JS Animations

```javascript
/* GOOD */
function animate() {
  element.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(animate);
}
animate();

/* BAD - Blocks main thread */
setInterval(() => {
  element.style.left = position + 'px'; // Triggers layout
}, 16);
```

---

## MOTION DESIGN TOKENS

### Rule 14.1: Token Structure

```json
{
  "motion": {
    "duration": {
      "instant": "0ms",
      "fast": "100ms",
      "base": "200ms",
      "slow": "300ms",
      "slower": "400ms"
    },
    "easing": {
      "enter": "cubic-bezier(0.4, 0, 0.2, 1)",
      "exit": "cubic-bezier(0.4, 0, 1, 1)",
      "standard": "cubic-bezier(0.4, 0, 0.6, 1)",
      "accelerate": "cubic-bezier(0.4, 0, 1, 1)",
      "decelerate": "cubic-bezier(0, 0, 0.2, 1)"
    }
  }
}
```

### Rule 14.2: CSS Variable Implementation

```css
:root {
  --motion-duration-instant: 0ms;
  --motion-duration-fast: 100ms;
  --motion-duration-base: 200ms;
  --motion-duration-slow: 300ms;
  
  --motion-easing-enter: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-easing-exit: cubic-bezier(0.4, 0, 1, 1);
  --motion-easing-standard: cubic-bezier(0.4, 0, 0.6, 1);
}

.button:hover {
  transform: scale(1.02);
  transition: transform var(--motion-duration-base) var(--motion-easing-enter);
}
```

### Rule 14.3: Semantic Token Names

**GOOD**:
- `motion-duration-interaction-fast`
- `motion-easing-entrance`
- `motion-duration-loading-spinner`

**BAD**:
- `animation-200ms`
- `ease-out-cubic`
- `transition-quick`

**Rule**: Token name should communicate INTENT, not value.

### Rule 14.4: Duration Scale (Non-Linear)

Base duration scale across product:
- Micro-interactions: 100-150ms
- Standard transitions: 200-300ms
- Complex sequences: 300-400ms
- Page transitions: 400-600ms

**Rule**: Larger animations = longer durations (object travels further).

### Rule 14.5: Motion Token Consistency

All button hovers must use same tokens:
```css
.button:hover {
  transform: scale(1.02);
  transition: transform var(--motion-duration-base) var(--motion-easing-enter);
}

.card:hover {
  transform: translateY(-4px);
  transition: transform var(--motion-duration-base) var(--motion-easing-enter);
}

/* NOT varying durations randomly */
```

---

## TOOLS & LIBRARIES SELECTION

### Rule 15.1: Animation Library Decision Matrix

| Use Case | Library | Bundle Size | Reason |
|----------|---------|-------------|--------|
| UI hover, transitions | CSS only | 0KB | No library needed |
| React component states | Motion/Framer | 85KB | Declarative, gestured |
| Complex timelines | GSAP | 78KB | Timeline control |
| Designer animations | Lottie | varies | JSON from After Effects |
| Scroll effects | Motion + useScroll | 85KB | Hardware accelerated |
| Physics motion | React Spring | ~40KB | Spring parameters |

### Rule 15.2: Framer Motion (Motion) Best Practices

```javascript
import { motion } from 'framer-motion';

export function Button() {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      Click me
    </motion.button>
  );
}
```

**Use for**:
- React component animations
- Exit animations with AnimatePresence
- Layout animations
- Gesture-driven interactions

**Avoid for**:
- Complex SVG path animations (use GSAP)
- Timeline sequencing (use GSAP)

### Rule 15.3: GSAP Best Practices

```javascript
import gsap from 'gsap';

gsap.to('.button:hover', {
  duration: 0.2,
  scale: 1.02,
  ease: 'power2.out'
});

// Timeline for sequences
const tl = gsap.timeline();
tl.to('.element1', { duration: 0.3, opacity: 1 }, 0)
  .to('.element2', { duration: 0.3, opacity: 1 }, 0.05)
  .to('.element3', { duration: 0.3, opacity: 1 }, 0.1);
```

**Use for**:
- Complex animation sequences
- SVG animations
- Precise timeline control
- High-performance animations

### Rule 15.4: Lottie Best Practices

```javascript
import Lottie from 'lottie-react';
import animationData from './animation.json';

export function LoadingSpinner() {
  return <Lottie animationData={animationData} />;
}
```

**Use for**:
- Designer-created animations (After Effects)
- Branded illustrations
- Complex lotties (confetti, celebrations)

**Avoid for**:
- Micro-interactions (too heavy)
- Performance-critical UI

### Rule 15.5: CSS Transitions vs. Animations

```css
/* Use transition for state changes */
.button:hover {
  background: color-shift;
  transition: background 200ms ease-out;
}

/* Use animation for loops/sequences */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

## DESIGN SYSTEM INTEGRATION

### Rule 16.1: Component States in Storybook

```javascript
// Button.stories.jsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    state: {
      control: {
        type: 'select',
        options: ['default', 'hover', 'active', 'focus', 'disabled', 'loading']
      }
    }
  }
};

export const Default = {
  args: { state: 'default' }
};

export const Hover = {
  args: { state: 'hover' }
};

// ... all 6 states documented
```

### Rule 16.2: Motion Documentation

Create reference page showing:

```markdown
## Motion Tokens

### Durations
- Fast: 100ms (micro-interactions)
- Base: 200ms (standard transitions)
- Slow: 300ms (modals, large changes)

### Easings
- Enter: cubic-bezier(0.4, 0, 0.2, 1) - for appearing elements
- Exit: cubic-bezier(0.4, 0, 1, 1) - for disappearing elements
- Standard: cubic-bezier(0.4, 0, 0.6, 1) - for state changes

### Examples
[Interactive examples showing each token]
```

### Rule 16.3: Design System Compliance Checklist

- [ ] All components have 6 button states
- [ ] Motion tokens used consistently
- [ ] No random durations (all from token set)
- [ ] All animations respect prefers-reduced-motion
- [ ] Hover states use material curve
- [ ] Focus states visible and accessible
- [ ] No animating width/height
- [ ] Performance tested on low-end device
- [ ] Stagger timing documented (30-60ms)
- [ ] Color not sole differentiator

---

## TESTING & VALIDATION

### Rule 17.1: Performance Testing

```javascript
// Measure FPS
const fps = [];
let lastTime = performance.now();

function measureFPS() {
  const currentTime = performance.now();
  const delta = currentTime - lastTime;
  fps.push(1000 / delta);
  lastTime = currentTime;
  
  if (fps.length >= 60) {
    const average = fps.reduce((a, b) => a + b) / fps.length;
    console.log(`Average FPS: ${average}`);
  }
  
  requestAnimationFrame(measureFPS);
}
```

**Target**: 55-60 FPS on average desktop, 30-40 FPS on mobile acceptable.

### Rule 17.2: Accessibility Testing

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
3. **High Contrast**: Enable Windows High Contrast mode
4. **Reduced Motion**: Enable `prefers-reduced-motion` in OS settings
   - Chrome DevTools > Rendering > Emulate CSS Media Feature
5. **Color Blindness**: Use Color Oracle or Coblis simulator

### Rule 17.3: Device Testing

**Test on real devices**:
- Desktop: Chrome, Firefox, Safari, Edge
- Tablet: iPad, Android tablet
- Mobile: iPhone SE (2020), Samsung Galaxy A10 (budget device)

**CRITICAL**: Budget devices show performance issues desktop won't show.

### Rule 17.4: Motion Sickness Testing

Have vestibular-sensitive person (if available) test:
- Parallax animations
- Rotating elements
- Scaling animations > 10%
- Fast camera pans

**Rule**: If ANY test subject reports dizziness, remove or simplify animation.

---

## ANTI-PATTERNS TO AVOID

### Rule 18.1: Layout Thrashing

**ANTI-PATTERN**:
```css
/* BAD - Forces layout recalculation every frame */
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

.element {
  animation: slide 0.3s ease-out;
}
```

**PATTERN**:
```css
/* GOOD - GPU accelerated */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

.element {
  animation: slide 0.3s ease-out;
}
```

### Rule 18.2: Animating Multiple Properties Unnecessarily

**ANTI-PATTERN**:
```css
.button:hover {
  transform: scale(1.2) rotate(5deg) translateY(-3px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
  background: new-color;
  border-color: new-color;
  padding: new-padding;
  /* Too much change at once */
}
```

**PATTERN**:
```css
.button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transition: all 200ms ease-out;
  /* Single, focused change */
}
```

### Rule 18.3: Infinite Loops Without Pause

**ANTI-PATTERN**:
```css
@keyframes infinite-bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}

.element {
  animation: infinite-bounce 1s ease-in-out infinite;
  /* Bounces forever, burns CPU, no escape */
}
```

**PATTERN**:
```javascript
let bounceCount = 0;
element.addEventListener('animationend', () => {
  bounceCount++;
  if (bounceCount >= 3) {
    element.style.animation = 'none';
  }
});
```

### Rule 18.4: Opacity 0 vs. display: none

**ANTI-PATTERN**:
```css
.hidden {
  display: none; /* Instant removal, no animation possible */
}
```

**PATTERN**:
```css
.hidden {
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease-out;
}
```

### Rule 18.5: Hover Depends on Mouse-Only

**ANTI-PATTERN**:
```css
.button:hover {
  background: new-color;
}
/* Only desktop users see this. Touch users don't. */
```

**PATTERN**:
```css
.button:hover,
.button:focus {
  background: new-color;
  transition: background 200ms ease-out;
}
/* Desktop + keyboard users both see feedback */
```

### Rule 18.6: Parallax Everywhere

**ANTI-PATTERN**:
```css
.background {
  background-attachment: fixed;
  /* Every scroll pixel triggers parallax */
  /* Motion sickness guaranteed */
}
```

**PATTERN**:
```css
@media (prefers-reduced-motion: no-preference) {
  .hero-background {
    /* Only apply parallax if user hasn't disabled motion */
  }
}
```

### Rule 18.7: No Loading State (Feels Broken)

**ANTI-PATTERN**:
```html
<button onclick="submitForm()">Submit</button>
<!-- Form submits. Button does nothing. User thinks it didn't work. -->
```

**PATTERN**:
```html
<button onclick="submitForm()" id="submit-btn">Submit</button>

<script>
async function submitForm() {
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.classList.add('loading');
  
  try {
    await fetch('/api/form', { method: 'POST' });
    btn.classList.add('success');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}
</script>
```

---

## CODE EXAMPLES

### Example 19.1: Complete Button with All States

```jsx
import { motion } from 'framer-motion';

export function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <motion.button
      className={`
        px-4 py-2 rounded-lg font-medium
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'pointer-events-none' : ''}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={loading ? { opacity: [1, 0.7, 1] } : {}}
      transition={{
        default: { duration: 0.2, ease: 'easeOut' },
        opacity: { duration: 1, repeat: Infinity }
      }}
    >
      {loading ? '⟳ Loading...' : children}
    </motion.button>
  );
}
```

### Example 19.2: Form Field with Validation Animation

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function FormField({ label, value, onChange, validation }) {
  const [focused, setFocused] = useState(false);
  const isValid = validation.isValid(value);
  const error = validation.getError(value);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm">{label}</label>
      
      <motion.input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          px-3 py-2 rounded-lg border-2 transition-colors
          ${focused ? 'border-blue-500' : 'border-gray-300'}
          ${isValid && value ? 'border-green-500' : ''}
          ${error ? 'border-red-500' : ''}
        `}
        animate={{
          boxShadow: isValid && value 
            ? '0 0 0 3px rgba(76, 175, 80, 0.1)'
            : error
            ? '0 0 0 3px rgba(244, 67, 54, 0.1)'
            : 'none'
        }}
        transition={{ duration: 0.2 }}
      />

      <AnimatePresence>
        {isValid && value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1 text-green-600 text-sm"
          >
            ✓ {validation.successMessage}
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-600 text-sm"
          >
            ✕ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Example 19.3: Modal with Backdrop

```jsx
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md pointer-events-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Example 19.4: Scroll-Triggered Reveal

```jsx
import { useEffect, useRef } from 'react';

export function ScrollReveal({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '-50px', threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-5 transition-all duration-600 ease-out"
      style={{
        transitionDuration: '600ms'
      }}
      onTransitionEnd={(e) => {
        // Animation complete
      }}
    >
      {children}
    </div>
  );
}
```

### Example 19.5: Toast Notification System

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    return id;
  }, []);

  return { toasts, addToast };
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`
              mb-2 px-4 py-3 rounded-lg shadow-lg pointer-events-auto
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
            `}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## ONBOARDING ANIMATIONS

### Rule 20.1: Onboarding Benefits

- **Completion Rate**: Animated walkthroughs = 60% more logins in first week
- **Support Reduction**: 40% fewer support queries
- **User Activation**: 25% faster activation vs. static tutorials

### Rule 20.2: Effective Onboarding Pattern

```javascript
const onboardingSteps = [
  {
    target: '.signup-button',
    title: 'Create Account',
    description: 'Sign up to get started',
    animation: 'pulse', // Scale + fade
    duration: 300
  },
  {
    target: '.profile-field',
    title: 'Complete Profile',
    description: 'Add your information',
    animation: 'slide-in',
    duration: 300,
    delayFromPrevious: 400
  },
  {
    target: '.dashboard',
    title: 'Explore Dashboard',
    description: 'Your home screen awaits',
    animation: 'fade-in',
    duration: 300,
    delayFromPrevious: 400
  }
];
```

### Rule 20.3: Screen Recording + Animation

```html
<!-- Screen recording video with animated overlays -->
<div class="relative">
  <video autoplay loop muted>
    <source src="demo.mp4" type="video/mp4">
  </video>
  
  <!-- Animated highlight boxes -->
  <motion.div
    className="absolute border-2 border-blue-500"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
  />
</div>
```

### Rule 20.4: Micro-Onboarding Moments

Instead of one long tutorial, add micro-moments:

```javascript
// First time user clicks feature
if (!userHasSeenFeature('export')) {
  showTooltip({
    title: 'Export Your Data',
    description: 'Download as PDF or CSV',
    animation: 'slideIn',
    duration: 300,
    autoClose: 5000
  });
  markFeatureAsSeen('export');
}
```

---

## SVG ANIMATION RULES

### Rule 21.1: SVG Path Animation (SMIL)

```html
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="40" fill="blue" stroke="none">
    <animate
      attributeName="r"
      from="10"
      to="40"
      dur="2s"
      repeatCount="indefinite"
    />
  </circle>
</svg>
```

**Timing**: 1-3 seconds for pulse effects  
**Easing**: Built into SMIL (use `keyTimes` for custom easing)

### Rule 21.2: SVG Path Morphing

```javascript
// Morphing between two SVG paths
gsap.to('.path', {
  attr: {
    d: newPathData
  },
  duration: 0.6,
  ease: 'power2.inOut'
});
```

**CRITICAL**: Start and end paths must have matching point count.

### Rule 21.3: Line Draw Effect

```css
.line-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s ease-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

**Effect**: Looks like line is being drawn in real-time  
**Timing**: 1-3 seconds

### Rule 21.4: SVG Icon Animation

```javascript
// Animate SVG icon on hover
const icon = document.querySelector('.icon');

icon.addEventListener('mouseenter', () => {
  gsap.to(icon, {
    rotation: 360,
    duration: 0.6,
    ease: 'back.out'
  });
});
```

**Use for**: Interactive icons, animated buttons, hover effects

---

## HAPTIC & MULTI-SENSORY FEEDBACK

### Rule 22.1: Haptic Feedback Synchronization

**When animating, also provide haptic**:

```javascript
// Button press + vibration
button.addEventListener('click', async () => {
  // Visual feedback
  button.classList.add('pressed');
  
  // Haptic feedback (mobile)
  if (navigator.vibrate) {
    navigator.vibrate(50); // 50ms vibration
  }
  
  // Sound feedback (optional)
  playSound('click.mp3');
});
```

### Rule 22.2: Haptic Intensity Levels

| Intensity | Duration | Use Case |
|-----------|----------|----------|
| Subtle | 20-50ms | Form validation success |
| Medium | 50-100ms | Button press, toggle |
| Strong | 100-200ms | Error, warning, attention |

### Rule 22.3: Multi-Sensory Feedback

For critical interactions, combine all three:

```javascript
async function showSuccess(message) {
  // Visual: animation
  const toast = createToast(message);
  animateIn(toast, { duration: 200 });
  
  // Haptic: vibration
  navigator.vibrate(30);
  
  // Audio: sound effect
  playSound('success.mp3', { volume: 0.3 });
  
  // Text: aria-live announcement
  announceToScreenReader(message);
  
  // Auto-dismiss
  setTimeout(() => animateOut(toast), 5000);
}
```

---

## DARK MODE CONSIDERATIONS

### Rule 23.1: Color Animation in Dark Mode

**Problem**: Colors may not have same contrast in dark mode.

**Solution**:
```css
/* Light mode */
.element {
  --color-primary: #2196F3;
  --color-success: #4CAF50;
  --color-error: #F44336;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .element {
    --color-primary: #64B5F6;
    --color-success: #81C784;
    --color-error: #EF5350;
  }
}
```

### Rule 23.2: Shadow Animation in Dark Mode

**Problem**: Shadows disappear in dark mode.

**Solution**:
```css
.card {
  transition: box-shadow 200ms ease-out;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  .card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
  }
}
```

### Rule 23.3: Background Animation in Dark Mode

**Avoid**: Flashing between light and dark during animation.

**Solution**:
```css
@media (prefers-color-scheme: dark) {
  @keyframes slideIn {
    from {
      background: #1e1e1e;
      transform: translateX(-100%);
    }
    to {
      background: #2a2a2a;
      transform: translateX(0);
    }
  }
}
```

---

## ERROR STATE ANIMATIONS

### Rule 24.1: Error Shake Animation

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-state {
  animation: shake 200ms ease-in-out;
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}
```

**Timing**: 200ms for 1 complete shake cycle  
**Effect**: 2-3 oscillations

### Rule 24.2: Error Message Reveal

```jsx
<AnimatePresence>
  {error && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-red-600 text-sm mt-1"
      role="alert"
    >
      {error}
    </motion.div>
  )}
</AnimatePresence>
```

**Timing**: 200ms reveal  
**Accessibility**: role="alert" for screen readers

### Rule 24.3: Field-Level Error Styling

```css
.form-field.error {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
  animation: shake 200ms ease-in-out;
}

.form-field.error::placeholder {
  color: rgba(244, 67, 54, 0.5);
}
```

---

## SUCCESS STATE ANIMATIONS

### Rule 25.1: Success Checkmark Animation

```jsx
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: 'spring',
    stiffness: 200,
    damping: 20
  }}
  className="text-green-600 text-2xl"
>
  ✓
</motion.div>
```

**Timing**: Spring animation = natural bounce-in  
**Color**: Green (#4CAF50)

### Rule 25.2: Page-Level Success Toast

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.2 }}
  className="bg-green-50 border-l-4 border-green-500 p-4"
>
  <div className="flex items-center gap-3">
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1 }}
      className="text-green-600 text-xl"
    >
      ✓
    </motion.span>
    <div>
      <h3 className="font-medium text-green-800">Success!</h3>
      <p className="text-green-700 text-sm">Your changes have been saved.</p>
    </div>
  </div>
</motion.div>
```

**Auto-dismiss**: 5-6 seconds

### Rule 25.3: Success Confetti Animation

Reserve for high-impact moments (onboarding completion, major achievement):

```javascript
import confetti from 'canvas-confetti';

function celebrateSuccess() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
```

**Use sparingly** (once or twice per app experience max)

---

## SUMMARY: AI COMPLIANCE CHECKLIST

Before generating any animation/micro-interaction, verify:

### Pre-Generation Phase
- [ ] Interaction serves clear functional purpose
- [ ] Not purely decorative
- [ ] Aligns with design system tokens
- [ ] Respects accessibility requirements

### Generation Phase
- [ ] Uses only transform + opacity
- [ ] Timing from token set (100-300ms for most)
- [ ] Easing uses appropriate curve (ease-out for enter, ease-in for exit)
- [ ] All 6 button states present
- [ ] Focus state visible + accessible
- [ ] Color + icon used together (not just color)

### Post-Generation Phase
- [ ] Tested on 60 FPS desktop browser
- [ ] Tested on budget mobile device (<30 FPS acceptable)
- [ ] prefers-reduced-motion respected
- [ ] No layout thrashing
- [ ] Will-change used sparingly if at all
- [ ] Code follows library best practices
- [ ] No infinite animations without escape

### Quality Gate
- [ ] Does NOT look like AI slop (generic, scattered, no restraint)
- [ ] DOES feel intentional (purposeful, cohesive, polished)
- [ ] DOES respect user preferences (vestibular safety, motion sensitivity)
- [ ] DOES perform well (no jank, no lag, no battery drain)

---

## FINAL PRINCIPLES

1. **Restraint**: Not everything moves. Elegance = enhancement with stillness.
2. **Purpose**: Every animation must serve functional goal.
3. **Consistency**: All buttons behave same way. All cards animate identically.
4. **Performance**: GPU-accelerated only (transform, opacity). No layout shifts.
5. **Accessibility**: Respect prefers-reduced-motion. Keyboard navigable. Screen reader compatible.
6. **Taste**: Study great work. Think deeply why it feels good. Practice.

---

**Document Version**: 1.0 Complete  
**Last Updated**: June 2026  
**Audience**: AI Agents, LLM Coding Assistants, Automated UI Builders

**This guide is comprehensive and covers EVERYTHING mentioned in the research. Use as absolute reference for non-slop micro-interaction generation.**
