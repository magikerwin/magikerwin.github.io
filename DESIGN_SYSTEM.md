# Space-Age Industrial Studio — Design System & Engineering Playbook

A concise reference for maintaining and extending `magikerwin.github.io` (and spinning up matching future pages) with consistent aesthetics, zero-build simplicity, and locked 60 FPS mobile performance.

---

## 1. Visual Identity & Design Tokens

Defined in [`css/tokens.css`](./css/tokens.css). Inspired by **Braun / Dieter Rams / Apollo telemetry / Teenage Engineering**: warm lunar ceramic surfaces, hairline dividers, tactile obsidian panels, and International Signal Orange focal points.

| Token | Value | Role |
| :--- | :--- | :--- |
| `--bg` | `#f4f0e6` | Primary lunar ceramic page ground |
| `--bg-warm` | `#e8e1d3` | Secondary warm putty panels (`Highlights`, `Education`) |
| `--card` | `#fdfbf6` | Elevated archival card surface |
| `--obsidian` / `--ink` | `#14151a` | Primary text, dark hero cards, obsidian modals & tooltips |
| `--ink-soft` | `#4c4d57` | Secondary body copy & descriptions |
| `--muted` | `#7c7b82` | Mono kickers, metadata, muted labels |
| `--accent` / `--vermilion` | `#e8431f` / `#dc3b19` | Primary focal ring, DNA strand B, CTA panel, active tab |
| `--cobalt` | `#1e4dd8` | Cloud & Vision track accent |
| `--hairline` / `--hairline-hi` | `rgba(20,21,26,0.11)` / `0.24` | Structural borders & dashed dividers |

**Discipline / Track Accents:** Swim `#0b7a75` · Bike `#e8431f` · Run `#d99b00` · Cloud `#1943b8` · Algorithms `#0f5b42`

### Typography & Surfaces
- **Display & Body (`--sans`):** System geometric sans; tight display tracking (`-0.04em` on `h1`, `-0.025em` on org/modal headings).
- **Telemetry & Controls (`--mono`):** Uppercase `9–10.5px` mono with `0.08–0.12em` letter spacing for kickers, pills, counters, and split times.
- **Card Craft:** `18–22px` border radius, `1px` hairline border, subtle top specular highlight (`inset 0 1px 0 #fff` on light cards, `inset 0 1px 0 rgba(255,255,255,0.14)` on obsidian surfaces).

---

## 2. Core UX & Visual Design Rules

1. **Clean Museum Pedestal for 3D Sculptures:** Keep floating 3D objects unobstructed. Never project thin 2D wireframe loops behind 3D cards (causes depth-layer clashes). Connect hero sculptures to lower sections via a minimal **centered vertical telemetry plumb line + descending pulse** strictly *below* the caption plaque.
2. **One Icon Set per Viewport (Zero Duplication):**
   - **Desktop (`> 680px`):** Circular vector micro-glyphs weave along the center DNA spine (hover reveals `#dna-tooltip`). Journey card footers stay clean with just the filter chip.
   - **Mobile (`<= 680px`):** Hide unlabeled spine circles (no hover on touch) and render readable, tappable labeled glyph chips inside Journey cards.
3. **100% Opaque 3D Faces & Z-Fighting Prevention:** Never apply `opacity < 1` on overlapping 3D tiles (prevents vector bleed-through). Separate front and back `preserve-3d` faces with `translateZ(1px)` each.
4. **Restrained Personal Hooks (~5–10% visual weight):** Engineering owns the primary hierarchy. Personal hooks (e.g., `Triathlete` + `SWIM · BIKE · RUN` chips, 3-tap Avatar unlockable Race Log) stay compact, hidden-until-discovered, and auto-dismiss on scroll, `Escape`, or outside tap.

---

## 3. Single-Source-of-Truth Architecture

The site is intentionally **zero-build** (native ES modules + CSS custom properties) so GitHub Pages deploys directly without bundler overhead:

```text
index.html          # Semantic layout shell & modal/tooltip containers
css/tokens.css      # Color & font design tokens
css/styles.css      # Layout, 3D stage, DNA spine, poster gallery, modal
data/site-data.js   # Single source of truth for ALL content
js/tile-art.js      # Full poster SVG presets + 24×24 micro-glyph vectors
js/ring3d.js        # 60 FPS 3D Ring -> Vertical DNA + vertical telemetry axis
js/ui.js            # Dynamic section renderers, filters, avatar & race log
js/main.js          # Entry point & scroll reveal observer
```

### Adding Content (`data/site-data.js` Only)
- **New Project:** Append one object to `SITE_DATA.projects` (`category`, `kind`, `stack`, `title`, `url`, optional `label`/`badge`/`preset`/`theme`). Automatically updates the 3D Ring, DNA micro-glyphs, gallery count, and filter tabs.
- **New Triathlon Race:** Append one object to `SITE_DATA.triathlonLog`:
  ```js
  {
    event: "2027 IRONMAN Penghu",
    distance: "226K",             // Auto-creates filter tabs & PB grouping
    date: "2027/04/11",
    location: "Penghu",
    time: "14:55:00",             // Optional; PBs auto-calculated from HH:MM:SS
    splits: { swim: "1:20:00", t1: "08:00", bike: "7:10:00", t2: "05:00", run: "6:12:00" },
    note: "Finisher",             // Optional
    url: "https://...",           // Personal result link (Result ↗)
    portalUrl: "https://...",     // Official portal link (Portal ↗)
  }
  ```

---

## 4. 60 FPS Mobile Performance Checklist

Every new animated component or page must satisfy these rules:

- **Zero `innerHTML` in `requestAnimationFrame`:** Allocate persistent SVG nodes once (`createSvgScene`) and mutate `d`, `cx`, `cy`, `stroke-opacity`, and `display` in-place. Batch repeated strokes/rungs into 1–3 `<path>` elements.
- **Zero Layout Thrashing in `tick()`:** Cache all dimensions (`getBoundingClientRect`, `offsetHeight`) in `measure()` via `ResizeObserver`, `resize`, `visualViewport.resize`, and `document.fonts.ready`. Never interleave style writes and layout reads per frame.
- **Delta-Time Normalized Motion:** Scale damping (`1 - Math.exp(-dt * 22)`), auto-orbit, and pulse speed by clamped `dt` (`<= 0.05s`) so 60Hz and 120Hz screens feel equally crisp.
- **Pause Off-Screen Work:** Skip 3D tile transforms once the hero scrolls above the viewport; pause the loop once scrolled past `#dna-world`.
- **GPU Compositor Hygiene:**
  - Avoid `backdrop-filter: blur(...)` on large cards placed over an animating `<svg>` or 3D scene.
  - Avoid `filter:` on `preserve-3d` faces.
  - Animate only `transform` and `opacity` in scroll-driven `@keyframes` (`animation-timeline: view()`), never `box-shadow`.
  - Use independent CSS `scale` on `:hover` when `transform` is driven by scroll-driven animations.
  - Use modifier classes (`.tok-l` / `.tok-r`) rather than inline CSS custom properties when responsive breakpoints need to reset offsets.

---

## 5. Verification & Release Workflow

1. **Multi-Viewport QA (Headless Chromium / Playwright):**
   - Test **Desktop (`1440×900`)**, **Tall (`980×1950`)**, **Mobile portrait (`390×844`)**, and **Mobile landscape (`915×412`)**.
   - Verify `0` page errors, `0` console errors, `0` mobile bounding-box overlaps, and `0` SVG DOM mutations/frame during scroll.
   - Visually inspect rendered screenshots (including zoomed close-ups for any SVG curves).
2. **Pull Request & Deploy:**
   - Work on a feature branch → open PR against `master` → merge via squash after review → verify GitHub Actions `pages-build-deployment` completes with `success`.
   - Note: GitHub Pages serves static `.js`/`.css` assets with `Cache-Control: max-age=600` (10 min); use an Incognito tab to inspect fresh deployments immediately on mobile.
