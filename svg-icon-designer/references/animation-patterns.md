# svg-icon-designer — animation patterns (opcjonalne)

> Reference dla skilla `svg-icon-designer` (§11). Ładuj tylko gdy ikona ma być animowana.

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
