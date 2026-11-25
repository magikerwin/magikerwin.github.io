import { isLightTheme, renderTileArt, resolveTileStyle } from "./tile-art.js";

/**
 * UNIFIED VERTICAL FLOW ENGINE:
 *   ◎ 3D Exhibition Ring  --(smooth scroll)-->  🧬 VERTICAL 3D DNA Double Helix
 *   --(exact 0px C1 strand handoff)-->  Continuous Vertical Career × Foundations DNA Spine
 *
 * Automatically scales to any number of projects (even or odd) in SITE_DATA.projects.
 */
export function initRing3D(tiles) {
  const runway = document.getElementById("hero-runway");
  const heroEl = document.getElementById("top");
  const stage = document.getElementById("stage-3d");
  const origin = document.getElementById("sculpture-origin");
  const dnaWorld = document.getElementById("dna-world");
  const unifiedSvg = document.getElementById("unified-dna-svg");
  const spineAnchor = document.getElementById("helix-spine-anchor");
  const heroIntro = document.getElementById("hero-intro");
  const heroBottom = document.getElementById("hero-bottom");
  const tagEl = document.getElementById("ring-tag");
  const titleEl = document.getElementById("ring-title");
  const linkEl = document.getElementById("ring-link");
  const dnaWrap = document.getElementById("helix");
  const ttEl = document.getElementById("dna-tooltip");
  const ttSwatch = document.getElementById("dna-tt-swatch");
  const ttText = document.getElementById("dna-tt-text");

  if (!stage || !origin || !tiles?.length) return;

  const N = tiles.length;
  const PAIRS = Math.max(2, Math.ceil(N / 2));
  const STEP = 360 / N;
  const DEG = Math.PI / 180;
  const TILT_X = -16;
  const TILT_Z = -2.5;
  const cosX = Math.cos(TILT_X * DEG);
  const sinX = Math.sin(TILT_X * DEG);
  const cosZ = Math.cos(TILT_Z * DEG);
  const sinZ = Math.sin(TILT_Z * DEG);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tileStyles = tiles.map((t) => resolveTileStyle(t));
  const tileIsLight = tiles.map((t) => isLightTheme(t));

  origin.innerHTML = tiles
    .map((t, i) => {
      const { bg, fg } = tileStyles[i];
      const artHtml = renderTileArt(t);
      return `
        <div class="ring-tile" data-idx="${i}" role="button" tabindex="0" aria-label="${t.title}">
          <div class="tile-face front" style="background:${bg}; color:${fg};">${artHtml}</div>
          <div class="tile-face back" style="background:${bg}; color:${fg};">${artHtml}</div>
        </div>`;
    })
    .join("");

  const tileEls = Array.from(origin.querySelectorAll(".ring-tile"));

  let radius = 330;
  let persp = 1150;
  let angle = -12;
  let targetAngle = null;
  let vel = 0;
  let dragging = false;
  let hoveredTile = -1;
  let stageHovered = false;
  let lastX = 0;
  let moved = false;
  let activeShown = -1;
  let morph = 0;
  let activeEraSet = new Set();
  let pulseClock = 0;

  function measure() {
    const tileW = origin.getBoundingClientRect().width || (window.innerWidth <= 680 ? 106 : 146);
    const gap = window.innerWidth <= 680 ? 8 : 14;
    persp = window.innerWidth <= 680 ? 950 : 1150;
    radius = Math.round((tileW + gap) / (2 * Math.sin(Math.PI / Math.max(N, 5))));
  }
  measure();
  window.addEventListener("resize", measure);

  function normDeg(deg) { return ((deg + 180) % 360 + 360) % 360 - 180; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smoothstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / Math.max(e1 - e0, 1)));
    return t * t * (3 - 2 * t);
  }
  function shortestDelta(fromDeg, toDeg) { return ((toDeg - fromDeg + 540) % 360) - 180; }
  function snapToIndex(idx) { targetAngle = angle + shortestDelta(angle, -idx * STEP); vel = 0; }

  function updateCaption(idx) {
    if (idx === activeShown || !tiles[idx]) return;
    activeShown = idx;
    const t = tiles[idx];
    const num = String(idx + 1).padStart(2, "0");
    if (tagEl) tagEl.textContent = `${num}/${N} · ${t.stack || t.category || ""}`;
    if (titleEl) titleEl.textContent = t.title;
    if (linkEl) {
      linkEl.href = t.url;
      linkEl.textContent = `${t.kind || "Open"} ↗`;
    }
  }

  function getScrollProgress() {
    if (reducedMotion || !runway) return 0;
    const maxScroll = Math.max(runway.offsetHeight - window.innerHeight, 1);
    return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  }

  function smoothVerticalCurve(pts) {
    if (pts.length < 2) return "";
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const my = (p0.y + p1.y) / 2;
      d += ` C${p0.x.toFixed(1)},${my.toFixed(1)} ${p1.x.toFixed(1)},${my.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    return d;
  }

  // Hover/Click tooltips on the color-coded project beads on the unified DNA spine
  if (unifiedSvg && ttEl) {
    unifiedSvg.addEventListener("mousemove", (e) => {
      const bead = e.target.closest(".dna-bead");
      if (!bead) { ttEl.classList.remove("show"); return; }
      const idx = Number(bead.dataset.proj);
      const p = tiles[idx];
      if (!p) return;
      ttSwatch.style.background = tileStyles[idx].bg;
      ttText.textContent = `${String(idx + 1).padStart(2, "0")} · ${p.label || p.title} — ${p.stack || p.category} ↗`;
      ttEl.style.left = `${e.clientX}px`;
      ttEl.style.top = `${e.clientY - 12}px`;
      ttEl.classList.add("show");
    });
    unifiedSvg.addEventListener("mouseleave", () => ttEl.classList.remove("show"));
    unifiedSvg.addEventListener("click", (e) => {
      const bead = e.target.closest(".dna-bead");
      if (!bead) return;
      const p = tiles[Number(bead.dataset.proj)];
      if (p?.url) window.open(p.url, "_blank", "noopener,noreferrer");
    });
  }

  document.querySelectorAll(".helix-pair[data-era-indices]").forEach((row) => {
    const idxs = row.dataset.eraIndices.split(",").filter(Boolean).map(Number).filter((i) => i >= 0 && i < N);
    row.addEventListener("mouseenter", () => { activeEraSet = new Set(idxs); });
    row.addEventListener("mouseleave", () => { activeEraSet = new Set(); });
  });

  function tick() {
    const worldRect = dnaWorld.getBoundingClientRect();
    // Pause 3D + SVG work automatically when scrolled past #dna-world (saves mobile battery)
    if (worldRect.bottom < -40) {
      requestAnimationFrame(tick);
      return;
    }

    if (!dragging) {
      if (targetAngle !== null) {
        const diff = targetAngle - angle;
        if (Math.abs(diff) < 0.08) { angle = targetAngle; targetAngle = null; }
        else angle += diff * 0.14;
      } else if (Math.abs(vel) > 0.06) {
        angle += vel;
        vel *= 0.94;
      } else if (!stageHovered && !reducedMotion) {
        angle -= 0.1;
      }
    }
    if (!reducedMotion) pulseClock = (pulseClock + 0.0038) % 1;

    const scrollP = getScrollProgress();
    morph += (scrollP - morph) * 0.14;
    if (Math.abs(scrollP - morph) < 0.0015) morph = scrollP;
    const e = easeInOut(morph);

    if (heroIntro) {
      const introOp = Math.max(1 - e * 2.0, 0);
      heroIntro.style.opacity = introOp.toFixed(2);
      heroIntro.style.transform = `translate3d(0, ${(-e * 30).toFixed(1)}px, 0)`;
      heroIntro.style.pointerEvents = introOp < 0.15 ? "none" : "auto";
    }

    if (heroBottom) {
      const bottomOp = Math.max(1 - e * 2.0, 0);
      heroBottom.style.opacity = bottomOp.toFixed(2);
      heroBottom.style.transform = `translate3d(0, ${(e * 20).toFixed(1)}px, 0)`;
      heroBottom.style.pointerEvents = bottomOp < 0.15 ? "none" : "auto";
    }

    const heroRect = heroEl.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const helixRect = dnaWrap.getBoundingClientRect();
    const anchorRect = spineAnchor.getBoundingClientRect();

    const ww = worldRect.width || window.innerWidth;
    const wh = worldRect.height || 1800;
    const hw = heroRect.width || window.innerWidth;
    const hh = heroRect.height || window.innerHeight;

    const stageCx = stageRect.left - worldRect.left + stageRect.width / 2;
    const stageCy = stageRect.top - worldRect.top + stageRect.height / 2;
    const heroTopWorld = heroRect.top - worldRect.top;

    const tileW = origin.getBoundingClientRect().width || (window.innerWidth <= 680 ? 106 : 146);
    const isPhone = window.innerWidth <= 680;
    const isMid = window.innerWidth <= 960;
    const compactDy = Math.min((stageRect.height - 56) / (PAIRS - 1), isPhone ? 48 : 62);
    const expandedDy = Math.min((hh - 210) / (PAIRS - 1), isPhone ? 68 : 76);
    const dnaDy = lerp(compactDy, expandedDy, e);
    const dnaR = Math.min(hw * (isPhone ? 0.24 : 0.13), isPhone ? 80 : 110);
    const dnaScale = lerp(
      Math.min(0.48, (compactDy * 0.94) / tileW),
      Math.min(0.56, (expandedDy * 0.88) / tileW),
      e
    );
    const dnaYShift = e * ((heroTopWorld + hh * (isPhone ? 0.40 : 0.41)) - stageCy);

    const strandA = [];
    const strandB = [];
    let frontMostIdx = 0;
    let maxZ = -99999;
    let bottomPhiRad = 0;

    for (let i = 0; i < N; i++) {
      const el = tileEls[i];

      // POSE 0: Tilted Double-Sided 3D Exhibition Ring
      const thetaDeg = i * STEP + angle;
      const theta = thetaDeg * DEG;
      const x0 = radius * Math.sin(theta);
      const z0 = radius * Math.cos(theta);
      const x1 = x0 * cosZ;
      const y1 = x0 * sinZ;
      const xRing = x1;
      const yRing = y1 * cosX - z0 * sinX;
      const zRing = y1 * sinX + z0 * cosX - radius * 0.5;
      const ryRing = normDeg(thetaDeg);

      // POSE 1: VERTICAL (Top -> Bottom) 3D DNA Double Helix
      const pair = Math.floor(i / 2);
      const isA = i % 2 === 0;
      const phiDeg = pair * 46 + angle * 1.1;
      const phi = phiDeg * DEG;
      if (pair === PAIRS - 1) bottomPhiRad = phi;

      const xDna = (isA ? 1 : -1) * dnaR * Math.sin(phi);
      const yDna = (pair - (PAIRS - 1) / 2) * dnaDy + dnaYShift;
      const zDna = (isA ? 1 : -1) * dnaR * Math.cos(phi) - 35;

      const ryDna = (isA ? 1 : -1) * Math.cos(phi) * 14;
      const rxDna = -(isA ? 1 : -1) * Math.sin(phi) * 6;

      const x = lerp(xRing, xDna, e);
      const y = lerp(yRing, yDna, e);
      const z = lerp(zRing, zDna, e);
      const rx = lerp(TILT_X, rxDna, e);
      const rz = lerp(TILT_Z, 0, e);
      const ry = lerp(ryRing, ryDna, e);
      const sc = lerp(1, dnaScale, e);

      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;

      if (z > maxZ) { maxZ = z; frontMostIdx = i; }

      const pf = persp / Math.max(persp - z, 120);
      const pt = { x: stageCx + x * pf, y: stageCy + y * pf, z };
      if (isA) strandA.push(pt);
      else strandB.push(pt);
    }

    // ONE SINGLE CONTINUOUS SVG: HERO 3D DNA -> TWISTING HELICAL FUNNEL -> CAREER SPINE
    if (unifiedSvg && strandA.length && strandB.length) {
      unifiedSvg.setAttribute("viewBox", `0 0 ${Math.round(ww)} ${Math.round(wh)}`);

      const spineCx = anchorRect.width > 0 ? (anchorRect.left - worldRect.left + anchorRect.width / 2) : ww / 2;
      const lowerAmp = isPhone ? 10 : (isMid ? 24 : 32);
      const helixTopY = helixRect.top - worldRect.top;
      const helixBotY = helixRect.bottom - worldRect.top - 16;

      const heroOp = e <= 0.08 ? 0 : Math.min((e - 0.08) / 0.42, 1);
      const funnelOp = heroOp * Math.min(Math.max((e - 0.06) / 0.34, 0), 1);

      let heroRungs = "";
      let heroStrandSvg = "";
      if (heroOp > 0.01) {
        const rungPairs = Math.min(strandA.length, strandB.length);
        for (let p = 0; p < rungPairs; p++) {
          const a = strandA[p];
          const b = strandB[p];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          heroRungs += `
            <line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"
              stroke="#14151A" stroke-opacity="${(0.22 * heroOp).toFixed(2)}" stroke-width="2" stroke-linecap="round"/>
            <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="3" fill="#E8431F" fill-opacity="${(0.8 * heroOp).toFixed(2)}"/>
          `;
        }
        heroStrandSvg = `
          <path d="${smoothVerticalCurve(strandB)}" fill="none" stroke="#E8431F" stroke-opacity="${(0.84 * heroOp).toFixed(2)}" stroke-width="2.4" stroke-linecap="round"/>
          <path d="${smoothVerticalCurve(strandA)}" fill="none" stroke="#14151A" stroke-opacity="${(0.88 * heroOp).toFixed(2)}" stroke-width="2.4" stroke-linecap="round"/>
        `;
      }

      const lastA = strandA[strandA.length - 1];
      const lastB = strandB[strandB.length - 1];
      const yStart = (lastA.y + lastB.y) / 2;
      const ySettle = Math.max(yStart + (isPhone ? 68 : 88), helixTopY + (isPhone ? 14 : 32));

      const offAX = lastA.x - (stageCx + Math.sin(bottomPhiRad) * dnaR);
      const offBX = lastB.x - (stageCx - Math.sin(bottomPhiRad) * dnaR);
      const offAY = lastA.y - yStart;
      const offBY = lastB.y - yStart;

      const freqHero = (46 * DEG) / Math.max(dnaDy, 48);
      const freqLower = (Math.PI * 2) / 250;

      const flowPtsA = [];
      const flowPtsB = [];
      let flowRungs = "";
      let phi = bottomPhiRad;
      const stepY = 8;
      let rungAccum = 0;

      for (let y = yStart; y <= helixBotY; y += stepY) {
        const u = smoothstep(yStart, ySettle, y);
        const botClose = 1 - smoothstep(helixBotY - 56, helixBotY, y);
        const cx = lerp(stageCx, spineCx, u);
        const amp = lerp(dnaR, lowerAmp, u) * botClose;
        const s = Math.sin(phi);
        const ax = cx + s * amp + offAX * (1 - u);
        const bx = cx - s * amp + offBX * (1 - u);
        const ay = y + offAY * (1 - u);
        const by = y + offBY * (1 - u);

        flowPtsA.push({ x: ax, y: ay, u, s });
        flowPtsB.push({ x: bx, y: by, u, s });

        rungAccum += stepY;
        const rungGap = lerp(26, 22, u);
        if (rungAccum >= rungGap && y > yStart + 14 && y < helixBotY - 38) {
          rungAccum = 0;
          const spread = Math.abs(s) * botClose;
          if (spread > 0.16) {
            const vis = y < helixTopY ? funnelOp : 1;
            if (vis > 0.04) {
              const rop = ((0.09 + spread * 0.24) * vis).toFixed(2);
              flowRungs += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="#14151A" stroke-opacity="${rop}" stroke-width="1.2"/>`;
            }
          }
        }

        phi += lerp(freqHero, freqLower, u) * stepY;
      }

      if (flowPtsA.length > 0) {
        flowPtsA.push({ x: spineCx, y: helixBotY, u: 1, s: 0 });
        flowPtsB.push({ x: spineCx, y: helixBotY, u: 1, s: 0 });
      }

      let splitIdx = flowPtsA.findIndex((p) => p.y >= helixTopY);
      if (splitIdx < 1) splitIdx = 1;

      function polyPath(arr, from, to) {
        if (to <= from) return "";
        let d = `M${arr[from].x.toFixed(1)},${arr[from].y.toFixed(1)}`;
        for (let k = from + 1; k <= to && k < arr.length; k++) {
          d += ` L${arr[k].x.toFixed(1)},${arr[k].y.toFixed(1)}`;
        }
        return d;
      }

      const funnelPathA = funnelOp > 0.02 ? `<path d="${polyPath(flowPtsA, 0, splitIdx)}" fill="none" stroke="#14151A" stroke-opacity="${(0.88 * funnelOp).toFixed(2)}" stroke-width="2.1" stroke-linecap="round"/>` : "";
      const funnelPathB = funnelOp > 0.02 ? `<path d="${polyPath(flowPtsB, 0, splitIdx)}" fill="none" stroke="#E8431F" stroke-opacity="${(0.84 * funnelOp).toFixed(2)}" stroke-width="2.1" stroke-linecap="round"/>` : "";
      const spinePathA = `<path d="${polyPath(flowPtsA, splitIdx, flowPtsA.length - 1)}" fill="none" stroke="#14151A" stroke-opacity="0.88" stroke-width="2" stroke-linecap="round"/>`;
      const spinePathB = `<path d="${polyPath(flowPtsB, splitIdx, flowPtsB.length - 1)}" fill="none" stroke="#E8431F" stroke-opacity="0.84" stroke-width="2" stroke-linecap="round"/>`;
      const termDot = flowPtsA.length > 2
        ? `<circle cx="${spineCx.toFixed(1)}" cy="${helixBotY.toFixed(1)}" r="4.4" fill="#E8431F" stroke="#F4F0E6" stroke-width="2"/>`
        : "";

      let pulses = "";
      if (!reducedMotion && funnelOp > 0.2 && flowPtsA.length > 10) {
        const pIdxA = Math.floor(pulseClock * (flowPtsA.length - 1));
        const pIdxB = Math.floor(((pulseClock + 0.5) % 1) * (flowPtsB.length - 1));
        const pA = flowPtsA[pIdxA];
        const pB = flowPtsB[pIdxB];
        pulses = `
          <circle cx="${pA.x.toFixed(1)}" cy="${pA.y.toFixed(1)}" r="4.2" fill="#14151A" fill-opacity="${(0.22 * funnelOp).toFixed(2)}"/>
          <circle cx="${pA.x.toFixed(1)}" cy="${pA.y.toFixed(1)}" r="2.2" fill="#14151A" fill-opacity="${(0.92 * funnelOp).toFixed(2)}"/>
          <circle cx="${pB.x.toFixed(1)}" cy="${pB.y.toFixed(1)}" r="4.2" fill="#E8431F" fill-opacity="${(0.26 * funnelOp).toFixed(2)}"/>
          <circle cx="${pB.x.toFixed(1)}" cy="${pB.y.toFixed(1)}" r="2.2" fill="#E8431F" fill-opacity="${(0.96 * funnelOp).toFixed(2)}"/>
        `;
      }

      let beads = "";
      const spineLen = flowPtsA.length - 1 - splitIdx;
      if (spineLen > 12) {
        const padTop = Math.floor(spineLen * (isPhone ? 0.05 : 0.1));
        const padBot = Math.floor(spineLen * 0.07);
        const usable = Math.max(spineLen - padTop - padBot, 10);
        for (let i = 0; i < N; i++) {
          const k = Math.min(flowPtsA.length - 2, splitIdx + padTop + Math.round((i / Math.max(N - 1, 1)) * usable));
          const pt = i % 2 === 0 ? flowPtsA[k] : flowPtsB[k];
          const { bg } = tileStyles[i];
          const isLight = tileIsLight[i];
          const isPulse = activeEraSet.has(i);
          const r = isPhone ? 4.2 : (isPulse ? 7.4 : 5.8);
          const beadStroke = isLight ? "rgba(20,21,26,0.45)" : "#F4F0E6";
          const beadSw = isLight ? "1.4" : "1.9";
          beads += `<circle class="dna-bead ${isPulse ? "pulse" : ""}" data-proj="${i}" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${r}" fill="${bg}" stroke="${beadStroke}" stroke-width="${beadSw}"/>`;
        }
      }

      unifiedSvg.innerHTML = `
        ${heroRungs}
        ${flowRungs}
        ${funnelPathB}
        ${funnelPathA}
        ${spinePathB}
        ${spinePathA}
        ${heroStrandSvg}
        ${pulses}
        ${beads}
        ${termDot}
      `;
    }

    const norm = ((-angle % 360) + 360) % 360;
    const ringFrontIdx = Math.round(norm / STEP) % N;
    updateCaption(hoveredTile >= 0 ? hoveredTile : (e > 0.5 ? frontMostIdx : ringFrontIdx));

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  stage.addEventListener("mouseenter", () => { stageHovered = true; });
  stage.addEventListener("mouseleave", () => { stageHovered = false; hoveredTile = -1; });

  const startDrag = (x) => { dragging = true; moved = false; targetAngle = null; lastX = x; vel = 0; };
  const moveDrag = (x) => {
    if (!dragging) return;
    const dx = x - lastX;
    if (Math.abs(dx) > 4) moved = true;
    vel = dx * 0.34;
    angle += vel;
    lastX = x;
  };
  const endDrag = () => { dragging = false; };

  stage.addEventListener("mousedown", (e) => { if (!e.target.closest("a, button")) startDrag(e.clientX); });
  window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
  window.addEventListener("mouseup", endDrag);
  stage.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchmove", (e) => moveDrag(e.touches[0].clientX), { passive: true });
  window.addEventListener("touchend", endDrag);

  stage.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 3) {
      e.preventDefault();
      targetAngle = null;
      angle -= e.deltaX * 0.22;
    }
  }, { passive: false });

  tileEls.forEach((el) => {
    const idx = Number(el.dataset.idx);
    el.addEventListener("mouseenter", () => { hoveredTile = idx; });
    el.addEventListener("mouseleave", () => { hoveredTile = -1; });
    el.addEventListener("click", () => {
      if (moved) return;
      const t = tiles[idx];
      const norm = ((-angle % 360) + 360) % 360;
      const frontIdx = Math.round(norm / STEP) % N;
      if (morph > 0.5 || idx === frontIdx) window.open(t.url, "_blank", "noopener,noreferrer");
      else snapToIndex(idx);
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    });
  });

  stage.addEventListener("keydown", (e) => {
    const norm = ((-angle % 360) + 360) % 360;
    const frontIdx = Math.round(norm / STEP) % N;
    if (e.key === "ArrowLeft") { e.preventDefault(); snapToIndex((frontIdx - 1 + N) % N); }
    else if (e.key === "ArrowRight") { e.preventDefault(); snapToIndex((frontIdx + 1) % N); }
  });
}
