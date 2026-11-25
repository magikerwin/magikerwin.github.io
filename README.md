# Kuan-Ying Huang (Kerwin) — Personal Website

Zero-build, static **GitHub Pages** portfolio featuring a **Light Studio Gallery** aesthetic:
- **Interactive 3D Exhibition Ring → Vertical 3D DNA Double Helix**: scrolling unwinds all projects into a vertical 3D double helix connected via a single continuous SVG spine straight into **Career × Foundations**.
- **Open 4-Column Swiss Poster Gallery**: 1-to-1 with the 3D Ring and DNA beads, with instant category filtering and search.
- **Compact Bento Finale**: Tabbed Verified Certifications + Vermilion Contact card.
- **Zero dependencies / zero build step**: pure HTML, CSS, and ES Modules.

---

## File Structure

```text
magikerwin-site/
├── index.html          # Page layout & semantic sections
├── css/
│   ├── tokens.css      # Colors, typography, and design tokens
│   └── styles.css      # Layout, 3D Ring/DNA stage, responsive rules
├── data/
│   └── site-data.js    # Single source of truth (profile, projects, certifications)
├── js/
│   ├── main.js         # Entry point
│   ├── ring3d.js       # 3D Ring -> Vertical 3D DNA -> Unified Career Spine engine
│   ├── tile-art.js     # Project-connected Swiss SVG icons + auto-generative fallback
│   └── ui.js           # Poster gallery, tabbed certifications, scroll reveals
└── images/
    └── head_shot.png   # Portrait image
```

---

## Adding a New Project (Zero Design Needed)

Open `data/site-data.js` and add one object to `SITE_DATA.projects`. It automatically updates the **3D Ring**, **Vertical 3D DNA**, **DNA spine beads**, and **Poster Gallery** (supports any even or odd project count):

```js
{
  category: "Experiments",
  kind: "GitHub",
  stack: "Rust · AI",
  title: "My Arbitrary New Project",
  url: "https://github.com/magikerwin/my-new-project",
}
```

### How icons are generated automatically
- **Zero config:** Omit `preset` and `theme`—`js/tile-art.js` matches topic keywords (`face`, `vehicle`, `pedestrian`, `map`, `video`, `robot`, `draw`, `llm`, `ml`, etc.) or generates a deterministic Swiss Bauhaus geometric poster + harmonious color theme from the title.
- **Explicit preset + theme:** Pass `preset` (`curve`, `matrix`, `camera`, `map`, `helmet`, `face`, `pedestrian`, `vehicle`, `robot`, `graph`, `nodes`, `blocks`, `trio`, `bars`, `type`) and `theme` (`crimson`, `cream`, `forest`, `orange`, `cobalt`, `obsidian`, `gold`, `paper`, `blush`, `slate`, `sand`, `indigo`, `stone`, `teal`).
- **Real image / screenshot:** Pass `image: "./images/my_demo.png"` to frame a real photo with a matching Swiss footer label.
- **Custom SVG:** Pass `art: "<svg ...>...</svg>"` for a bespoke one-off graphic.

---

## Local Preview & GitHub Pages Deployment

Because the site uses native ES Modules (`<script type="module">`), preview locally with any static server:

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

To deploy to **`https://magikerwin.github.io/`**, copy the contents of `magikerwin-site/` into your `magikerwin.github.io` repository root and push to `main`.
