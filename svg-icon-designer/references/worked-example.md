# svg-icon-designer — worked example (reference implementation)

> Reference dla skilla `svg-icon-designer` (§5). Pełny przebieg: metaphor brief → construction → weryfikacja.

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

