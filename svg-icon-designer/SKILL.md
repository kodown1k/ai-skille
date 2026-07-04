---
name: svg-icon-designer
description: Use this skill whenever the user asks to design, generate, create, refine, or expand an SVG icon or an icon set. Triggers include any mention of "ikona", "ikonka", "icon", "iconset", "SVG icon", requests for an icon for a specific concept (e.g. "ikona dla amp simulator", "icon for backing track"), requests to extend an existing icon family, or requests to convert a concept/feature into a visual symbol. Do NOT use this skill for full illustrations, logos with text, complex scenes, or raster graphics — only for single-concept iconographic symbols rendered as line SVG.
---

# SVG Icon Designer — Łukasz Style System

## 1. PURPOSE

Generate **flat / minimal-line SVG icons** with a recognizable, unique character — readable at 16–24 px, scalable to 48 px+. Output is **always a single self-contained `.svg` file** per icon, plus optional preview HTML when generating sets.

This is a **design discipline skill**, not a code-generation skill. The agent MUST think about silhouette, balance, and metaphor before writing path data.

---

## 2. CORE STYLE RULES (NON-NEGOTIABLE)

These constants define "the Łukasz style". Do NOT deviate without explicit user override.

### 2.1. Canvas & Grid

1. **viewBox**: `0 0 24 24` — always. This is the design grid.
2. **Padding (keyline area)**: 2 px on every side. All visual mass MUST sit inside `2,2 → 22,22`. Treat `0–2` and `22–24` as no-go zones except for intentional bleeding accents.
3. **Pixel snapping**: Anchor points land on integer or `.5` coordinates. Half-pixel values are allowed ONLY to compensate for stroke-width alignment (e.g., a 1.5 px stroke on a horizontal line at `y=12` renders crisp; `y=12.5` would blur).
4. **Optical centering**: Geometric center ≠ optical center. Triangles, arrows, and asymmetric shapes are nudged 0.5–1 px toward their visual mass.

### 2.2. Stroke

1. **stroke-width**: `1.5` (default). Never use `1` (too thin at 24 px) or `2` (too heavy, loses character).
2. **stroke-linecap**: `round` — always.
3. **stroke-linejoin**: `round` — always.
4. **fill**: `none` on stroked shapes. Solid fills are allowed ONLY for character accents (see 2.5).
5. **stroke**: `currentColor` — always. Never hardcode hex. The icon inherits color from CSS context.

### 2.3. Geometry vocabulary

The style is built from a **restricted geometric alphabet**. Stick to it:

1. **Corners**: rounded with `r=2` for outer shapes (containers), `r=1` for small inner shapes. Sharp corners only when semantically required (arrowheads, certain technical icons).
2. **Angles**: prefer 0°, 45°, 90°. Free angles only when the metaphor demands it (e.g., guitar neck, sound wave).
3. **Circles**: use `<circle>` for true circles. Don't approximate with `<path>` unless part of a compound shape.
4. **Lines**: prefer straight horizontals/verticals/45° diagonals over arbitrary slopes.

### 2.4. The "Character Mark" rule (signature element)

This is what makes the style **unique** rather than generic Lucide/Feather clone.

**EVERY icon MUST contain exactly ONE of the following character marks:**

1. **Accent dot** — a small filled `<circle r="1">` placed at a semantically meaningful point (e.g., the "i" of an info icon, the tip of an arrow, the play head of a player). Filled with `currentColor`, no stroke.
2. **Cut-corner** — one corner of the main shape is replaced with a 45° chamfer (~2 px). Used sparingly, for "technical" icons (settings, code, database).
3. **Broken line** — one stroke segment has a deliberate 1 px gap, suggesting motion, signal, or connection. Used for icons related to networking, audio, transmission.

The character mark is the **signature** of the system. An icon without one is rejected and regenerated.

### 2.5. Fill accents

If solid fill is used, it MUST be:
1. Confined to a single small region (the character mark, OR a status indicator).
2. Maximum 8% of the icon's visual area.
3. `fill="currentColor"`, `stroke="none"` on that element.

---

## 3. WORKFLOW (MANDATORY ORDER)

When the user requests an icon, follow these steps **in order**. Do NOT skip step 3.1.

### 3.1. Metaphor brief (BEFORE writing any SVG)

Write a 3–5 line plan in plain text:

```
CONCEPT: <what the icon represents>
METAPHOR: <the visual idea — e.g., "guitar amp = trapezoidal speaker cabinet with single knob">
PRIMITIVES: <list of shapes — e.g., "rounded rect + circle + 2 lines">
CHARACTER MARK: <which one from 2.4, and where>
RISK: <what could make it look generic or unreadable at 16 px>
```

Only after this plan is written, proceed to SVG generation.

### 3.2. Construction

1. Open with the exact header (see section 4).
2. Build geometry in **z-order**: largest container → mid-shapes → details → character mark last.
3. Use `<g>` grouping only when it improves readability or enables shared attributes — never gratuitously.
4. Comment each path with a one-line label: `<!-- speaker cone -->`.

### 3.3. Verification (MANDATORY before showing output)

Self-check the icon against this checklist. If any item fails, FIX before delivering:

1. [ ] `viewBox="0 0 24 24"` present
2. [ ] All visual mass inside `2,2 → 22,22`
3. [ ] `stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"` on every stroked element (or set on root `<svg>`)
4. [ ] `stroke="currentColor"` everywhere — no hardcoded colors
5. [ ] `fill="none"` on stroked shapes
6. [ ] Exactly ONE character mark present (2.4)
7. [ ] At least 50% of anchor points on integer coordinates
8. [ ] Readable at 16 px (mentally simulate: would the silhouette still communicate the concept?)
9. [ ] No `<text>`, no `<image>`, no `<filter>`, no `<defs>` unless explicitly needed
10. [ ] Total path count ≤ 6 (complexity budget — more usually means the metaphor is wrong)

### 3.4. Output format

For a **single icon**: deliver one `.svg` file at the requested path (or print inline if no path given).

For a **set** (≥3 icons): deliver
1. One `.svg` per icon in a directory (e.g., `icons/`)
2. One `preview.html` that displays all icons in a grid at 16 px, 24 px, and 48 px, on both light and dark backgrounds — so the user can verify consistency at a glance.

---

## 4. CANONICAL FILE TEMPLATE

Every generated SVG MUST start from this skeleton:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.5"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- ICON: <name> -->
  <!-- character mark: <which one + position> -->

  <!-- geometry here -->

</svg>
```

The two comment lines are NOT optional — they document the design decision and make the set auditable.

---

## 5. WORKED EXAMPLE (reference implementation)

Concept: **"backing track"** icon for Guitar AI Studio.

**Brief:**
```
CONCEPT: backing track (audio loop you play guitar over)
METAPHOR: horizontal waveform inside a rounded container, with a play-position dot
PRIMITIVES: rounded rect (container) + 5 vertical lines (waveform bars) + 1 circle (playhead dot)
CHARACTER MARK: accent dot — the playhead, filled, on the centerline
RISK: waveform could look like a barcode — vary bar heights to suggest amplitude
```

**SVG:**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.5"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- ICON: backing-track -->
  <!-- character mark: accent dot (playhead) at x=14, y=12 -->

  <!-- container -->
  <rect x="3" y="6" width="18" height="12" rx="2"/>

  <!-- waveform bars -->
  <line x1="7"  y1="10" x2="7"  y2="14"/>
  <line x1="10" y1="9"  x2="10" y2="15"/>
  <line x1="17" y1="10" x2="17" y2="14"/>

  <!-- playhead (character mark) -->
  <circle cx="14" cy="12" r="1" fill="currentColor" stroke="none"/>
</svg>
```

Note: 4 path elements, 1 character mark, all anchors on integers, communicates "audio + position" at a glance.

---

## 6. ANTI-PATTERNS (REJECT IMMEDIATELY)

If the agent is tempted to do any of these, STOP and reconsider:

1. **Generic clone**: if the icon looks indistinguishable from Lucide / Feather / Heroicons → the character mark is missing or wrong. Add it.
2. **Detail soup**: 10+ paths, tiny features, dense grid → won't read at 16 px. Cut to the essential silhouette.
3. **Mixed stroke widths**: different paths with different `stroke-width` → inconsistent. Force 1.5 everywhere.
4. **Text labels inside icons**: never. If a concept can't be conveyed without text, the metaphor is wrong.
5. **Embedded raster**: `<image href="data:...">` is forbidden.
6. **Hardcoded colors**: `stroke="#000"`, `fill="red"` → breaks theming. Always `currentColor`.
7. **Non-24 grids**: `viewBox="0 0 32 32"`, `0 0 100 100`, etc. → breaks set consistency.
8. **Over-rounding**: every corner at `r=4` → loses character, becomes blobby. Use `r=2` for outer, `r=1` for inner.
9. **Skipping the brief** (step 3.1) → the most common failure mode. Without the brief, the icon becomes a literal sketch instead of a designed symbol.

---

## 7. SET CONSISTENCY RULES

When generating multiple icons (a "set"), additional constraints apply:

1. **Visual weight parity**: all icons in the set should occupy roughly the same proportion of the keyline area (e.g., all ~70% fill). An outlier icon (too small or too dense) breaks the set.
2. **Character mark variety**: across a set of 10+, use at least 2 of the 3 character mark types (2.4). All-dots feels monotonous; all-broken-lines feels nervous.
3. **Metaphor family**: related concepts share primitives. E.g., all "audio" icons share the rounded-rect container; all "code" icons share the cut-corner mark.
4. **Naming**: kebab-case, semantic: `backing-track.svg`, `amp-simulator.svg`, `record-arm.svg`. Never `icon1.svg`.

---

## 8. INTEGRATION HINTS (for the agent to remember)

1. Icons designed here are meant to be consumed as inline SVG OR via `<img src>` — both must work, hence `currentColor` and self-contained markup.
2. For Vue 3 / Quasar: the user typically wraps these in a `<q-icon>`-compatible component. Don't add `class=` or `id=` attributes — leave styling hooks empty for the consumer.
3. For React: same principle. No JSX-specific attributes (`className`, `strokeWidth` camelCase) — output pure SVG. The consumer transforms it.
4. If the user asks for "icon font" or "sprite" output, refuse and explain: this skill produces individual SVGs; sprite/font assembly is a separate build step.

---

## 9. WHEN UNSURE

If the requested concept is ambiguous (e.g., "make me an icon for 'flow'"), ASK ONE clarifying question before generating:
- "Flow as in audio signal flow, or flow as in workflow/process, or flow as in fluid/liquid?"

Never invent the metaphor silently — the metaphor is the most important design decision and the user must own it.

---

## 10. RESERVED

(formerly placeholder — kept blank to preserve section numbering across older
references that point to §11 for animation patterns. Don't renumber without
updating CLAUDE.md/spec files that link by section number.)

---

## 11. ANIMATION PATTERNS (OPTIONAL)

Animations are **OFF by default**. Only add them when the icon represents
something inherently kinetic (signal, transmission, processing, alert) AND
the consumer context can tolerate motion (login splash, header logo, status
indicator). Toolbar icons in a list of 12 → don't animate.

Three patterns proven empirically. Each has its own when-to-use. Mixing two
patterns on the same icon is allowed but rare — usually adds noise, not
information.

### 11.1. Current-flow pulse (overlay technique)

**Use for**: signal / transmission / data flow / electrical current. Visually
suggests "something is moving along this line".

**Mechanism**: layer two paths on the same geometry:
- `bolt-base` — solid stroke, always visible (static silhouette)
- `bolt-pulse` — same path, slightly **thicker stroke**, animated `stroke-dasharray` + `stroke-dashoffset` going negative; the short dash travels along the path like a moving spark

```html
<path class="bolt-base" d="M14,4 L10,11 L13,11"/>
<path class="bolt-pulse" d="M14,4 L10,11 L13,11"/>
```

```css
.bolt-pulse {
  stroke-width: 2.2;        /* base is 1.5 — overlay is visibly brighter */
  stroke-dasharray: 2 14;   /* 2px spark, 14px gap → 1 spark visible at a time */
  stroke-dashoffset: 0;
  animation: bolt-current 1.2s linear infinite;
}
@keyframes bolt-current {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -16; }  /* dash + gap = full cycle */
}
```

**Why overlay (not single-path dashed)**: in `prefers-reduced-motion: reduce`
the pulse element is `display: none` and the base remains a clean solid line.
Single-path-with-dasharray would freeze in a dashed state (broken-looking
silhouette) when animation is disabled.

**Tuning knobs**:
- `1.2s` → faster (0.8s) = nervier; slower (1.8s) = calmer
- `2 14` → bigger spark (3 20) = bolder, rarer
- Multiple paths sharing the character mark break (e.g., bolt split in half)
  → give the second path `animation-delay` ~half-cycle so the spark visually
  "jumps the gap" rather than firing in unison.

### 11.2. Layered splash animation (relaxed budget)

**Use for**: login splash, hero brand mark, full-screen loader — places where
the icon is large (≥ 48 px) and the user looks at it for >1 second. Budget
expands from 6 paths to ~9-12 and three concurrent animation layers are OK.

**Mechanism**: three concurrent animations with **deliberately different
tempos**, so the eye finds a hierarchy instead of seeing chaos:

| Layer | Tempo | Easing | Role |
|---|---|---|---|
| Outer halo / shockwave ring | slow (2.5–3.5 s) | ease-in-out | Atmospheric breathing — pulses opacity + scale, low contrast |
| Bolt / current / main motif pulse | fast (0.8–1.2 s) | linear | The "act" — main spark of energy |
| Impact / accent sparks | fast (0.7–1.0 s) | ease-in-out | Micro-flicker on tips/edges — adds liveness, never centers attention |

Multi-element layers (e.g., 2 halo rings, 2 bolt-pulse paths) should be
**offset by `animation-delay` ~50 % of cycle** so they don't fire in unison.
Unison = looks robotic; staggered = looks alive.

**Concrete example** (AppLogo 64×64):

```css
/* Layer 1: slow halo */
.halo { transform-origin: center; opacity: 0.18; }
.halo-outer { animation: halo-wave 3s ease-in-out infinite; }
.halo-inner { animation: halo-wave 3s ease-in-out infinite; animation-delay: 1.5s; }
@keyframes halo-wave {
  0%, 100% { transform: scale(0.92); opacity: 0.08; }
  50%      { transform: scale(1.12); opacity: 0.35; }
}

/* Layer 2: fast pulse (see §11.1 — same overlay technique) */
.bolt-pulse { animation: bolt-current 1s linear infinite; }
.bolt-pulse-lag { animation-delay: 0.5s; }

/* Layer 3: spark flicker on impact points */
.spark { animation: spark-flicker 0.9s ease-in-out infinite; transform-origin: center; }
.spark-bottom { animation-delay: 0.45s; }
@keyframes spark-flicker {
  0%, 100% { transform: scale(0.6); opacity: 0.4; }
  30%      { transform: scale(1.3); opacity: 1; }
  60%      { transform: scale(0.8); opacity: 0.6; }
}
```

**Splash-budget exceptions** (only when the icon is ≥ 48 px in actual render):
- viewBox stays 24×24 OR scales to 64×64. **Don't mix grids inside one set.**
- path count budget extends from 6 → 12
- multiple character marks allowed (e.g., broken-line bolt + 2 impact dots)
- still `currentColor`, still round caps/joins, still no `<defs>` / `<filter>` / `<text>` / `<image>` — these rules are non-negotiable regardless of size

### 11.3. Reduced-motion fallback (MANDATORY for any animated icon)

Every animated icon MUST include a `prefers-reduced-motion: reduce` block
that leaves the icon **fully readable in a static state**. Two patterns:

**Pattern A — hide animated overlay**: when animation lives in extra overlay
paths (§11.1, §11.2 layer 2), `display: none` the overlay; base stays solid.

```css
@media (prefers-reduced-motion: reduce) {
  .bolt-pulse { display: none; }
}
```

**Pattern B — freeze + reset transform**: when the element itself is the icon
(not an overlay), stop animation but pin it at a mid-state value so the
static frame is the most representative pose.

```css
@media (prefers-reduced-motion: reduce) {
  .halo  { animation: none; opacity: 0.2; }       /* pin opacity */
  .spark { animation: none; opacity: 0.85; transform: none; }  /* reset transform */
}
```

**Anti-pattern**: just `animation: none` without setting opacity/transform.
The element freezes at whatever frame the browser last computed → could be
opacity 0 (invisible) or scale 0.6 (visually broken). Always pin the
final state explicitly.

### 11.4. Verification checklist (in addition to §3.3)

If you added any animation, also self-check:

1. [ ] Reduced-motion block present
2. [ ] Reduced-motion block leaves icon visually readable (test by deleting all `@keyframes` blocks mentally — does the icon still communicate?)
3. [ ] `currentColor` still respected — no animation overrides stroke/fill to a hardcoded value
4. [ ] Tempos differ across layers (don't put 3 animations all at the same duration — eye can't pick a focus)
5. [ ] Multi-element layers have `animation-delay` to break unison
6. [ ] No `will-change: opacity, transform` on >4 elements (GPU layer thrash on weak hardware)
7. [ ] Animation is **enhancing** the metaphor, not decorative-only. If you could remove the animation and the icon still tells the same story → consider not adding it.
