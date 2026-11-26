import { isLightTheme, renderTileArt, resolveTileStyle } from "./tile-art.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function makeSvg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function smoothBezierSlice(arr, from, to, tailGuide, headGuide) {
  if (to <= from || arr.length < 2) return "";
  const last = Math.min(to, arr.length - 1);
  let d = `M${arr[from].x.toFixed(1)},${arr[from].y.toFixed(1)}`;
  for (let k = from; k < last; k++) {
    const p0 = k > 0 ? arr[k - 1] : (headGuide || arr[0]);
    const p1 = arr[k];
    const p2 = arr[k + 1];
    const p3 = k + 2 < arr.length ? arr[k + 2] : (tailGuide || p2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Builds persistent reusable SVG nodes once at init (0 DOM node allocations or innerHTML parses per frame).
 */
function createSvgScene(unifiedSvg, pairCount, tileStyles, tileIsLight) {
  if (!unifiedSvg) return null;
  unifiedSvg.textContent = "";

  const heroRungsPath = makeSvg("path", { fill: "none", stroke: "#14151A", "stroke-width": "2", "stroke-linecap": "round" });
  const funnelRungsPath = makeSvg("path", { fill: "none", stroke: "#14151A", "stroke-width": "1.2" });
  const spineRungsPath = makeSvg("path", { fill: "none", stroke: "#14151A", "stroke-opacity": "0.22", "stroke-width": "1.2" });
  const funnelPathB = makeSvg("path", { fill: "none", stroke: "#E8431F", "stroke-width": "2.1", "stroke-linecap": "round" });
  const funnelPathA = makeSvg("path", { fill: "none", stroke: "#14151A", "stroke-width": "2.1", "stroke-linecap": "round" });
  const spinePathB = makeSvg("path", { fill: "none", stroke: "#E8431F", "stroke-opacity": "0.84", "stroke-width": "2", "stroke-linecap": "round" });
  const spinePathA = makeSvg("path", { fill: "none", stroke: "#14151A", "stroke-opacity": "0.88", "stroke-width": "2", "stroke-linecap": "round" });
  const heroPathB = makeSvg("path", { fill: "none", stroke: "#E8431F", "stroke-width": "2.4", "stroke-linecap": "round" });
  const heroPathA = makeSvg("path", { fill: "none", stroke: "#14151A", "stroke-width": "2.4", "stroke-linecap": "round" });

  const heroMidGroup = makeSvg("g");
  const heroMidDots = Array.from({ length: pairCount }, () => {
    const c = makeSvg("circle", { r: "3", fill: "#E8431F" });
    heroMidGroup.appendChild(c);
    return c;
  });

  const pulsesGroup = makeSvg("g", { display: "none" });
  const pulseOuterA = makeSvg("circle", { r: "4.2", fill: "#14151A" });
  const pulseInnerA = makeSvg("circle", { r: "2.2", fill: "#14151A" });
  const pulseOuterB = makeSvg("circle", { r: "4.2", fill: "#E8431F" });
  const pulseInnerB = makeSvg("circle", { r: "2.2", fill: "#E8431F" });
  pulsesGroup.append(pulseOuterA, pulseInnerA, pulseOuterB, pulseInnerB);

  const beadsGroup = makeSvg("g", { display: "none" });
  const mobileBeads = tileStyles.map((st, i) => {
    const isLight = tileIsLight[i];
    const c = makeSvg("circle", {
      class: "dna-bead",
      "data-proj": String(i),
      r: "4.2",
      fill: st.bg,
      stroke: isLight ? "rgba(20,21,26,0.45)" : "#F4F0E6",
      "stroke-width": isLight ? "1.4" : "1.9",
    });
    beadsGroup.appendChild(c);
    return c;
  });

  const originDot = makeSvg("circle", { fill: "#E8431F", stroke: "#F4F0E6", "stroke-width": "2" });
  const termDot = makeSvg("circle", { r: "4.4", fill: "#E8431F", stroke: "#F4F0E6", "stroke-width": "2" });

  unifiedSvg.append(
    heroRungsPath, funnelRungsPath, spineRungsPath,
    funnelPathB, funnelPathA, spinePathB, spinePathA,
    heroPathB, heroPathA, heroMidGroup, pulsesGroup, beadsGroup,
    originDot, termDot
  );

  return {
    heroRungsPath, funnelRungsPath, spineRungsPath,
    funnelPathB, funnelPathA, spinePathB, spinePathA,
    heroPathB, heroPathA, heroMidGroup, heroMidDots,
    pulsesGroup, pulseOuterA, pulseInnerA, pulseOuterB, pulseInnerB,
    beadsGroup, mobileBeads, originDot, termDot,
  };
}

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
  const prevBtn = document.getElementById("ring-prev");
  const nextBtn = document.getElementById("ring-next");
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
      const pip = String(i + 1).padStart(2, "0");
      return `
        <div class="ring-tile" data-idx="${i}" role="button" tabindex="0" aria-label="${t.title}">
          <div class="tile-face front" style="background:${bg}; color:${fg};">${artHtml}<span class="focus-pip">${pip}</span></div>
          <div class="tile-face back" style="background:${bg}; color:${fg};">${artHtml}</div>
        </div>`;
    })
    .join("");

  const tileEls = Array.from(origin.querySelectorAll(".ring-tile"));
  const svgScene = createSvgScene(unifiedSvg, PAIRS, tileStyles, tileIsLight);

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
  let pulseClock = 0;
  let autoPauseUntil = 0;
  let lastNow = performance.now();
  let lastActiveTileIdx = -1;
  let lastHeroE = -1;
  let lastViewW = 0;
  let lastViewH = 0;
  let heroVisibleLast = true;
  let funnelVisibleLast = false;

  // Cached layout geometry — refreshed only on resize/ResizeObserver so tick() triggers 0 layout reflows
  const lay = {
    worldTop: 0,
    ww: window.innerWidth,
    wh: 1800,
    hw: window.innerWidth,
    hh: window.innerHeight,
    runwayH: window.innerHeight,
    maxStickyY: 0,
    maxScroll: 300,
    heroOffX: 0,
    stageOffX: window.innerWidth / 2,
    stageOffY: window.innerHeight / 2,
    stageH: 340,
    spineCx: window.innerWidth / 2,
    helixTopY: window.innerHeight,
    helixBotY: 1780,
    tileW: 146,
    isPhone: window.innerWidth <= 680,
    isMid: window.innerWidth <= 960,
  };

  function measure() {
    const sy = window.scrollY;
    const worldRect = dnaWorld.getBoundingClientRect();
    const heroRect = heroEl.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const helixRect = dnaWrap.getBoundingClientRect();
    const anchorRect = spineAnchor.getBoundingClientRect();
    const tileW = origin.getBoundingClientRect().width || (window.innerWidth <= 680 ? 106 : 146);

    const isPhone = window.innerWidth <= 680;
    const isMid = window.innerWidth <= 960;
    const gap = isPhone ? 8 : 14;
    persp = isPhone ? 950 : 1150;
    radius = Math.round((tileW + gap) / (2 * Math.sin(Math.PI / Math.max(N, 5))));

    const ww = worldRect.width || window.innerWidth;
    const wh = worldRect.height || 1800;
    const hw = heroRect.width || window.innerWidth;
    const hh = heroRect.height || window.innerHeight;
    const runwayH = runway ? runway.offsetHeight : hh;

    lay.worldTop = worldRect.top + sy;
    lay.ww = ww;
    lay.wh = wh;
    lay.hw = hw;
    lay.hh = hh;
    lay.runwayH = runwayH;
    lay.maxStickyY = Math.max(0, runwayH - hh);
    lay.maxScroll = Math.max((runwayH - hh) * 0.78, 100);
    lay.heroOffX = heroRect.left - worldRect.left;
    lay.stageOffX = stageRect.left - heroRect.left + stageRect.width / 2;
    lay.stageOffY = stageRect.top - heroRect.top + stageRect.height / 2;
    lay.stageH = stageRect.height || 300;
    lay.spineCx = anchorRect.width > 0 ? (anchorRect.left - worldRect.left + anchorRect.width / 2) : ww / 2;
    lay.helixTopY = helixRect.top - worldRect.top;
    lay.helixBotY = helixRect.bottom - worldRect.top - 16;
    lay.tileW = tileW;
    lay.isPhone = isPhone;
    lay.isMid = isMid;

    if (unifiedSvg) {
      const vw = Math.round(ww);
      const vh = Math.round(wh);
      if (vw !== lastViewW || vh !== lastViewH) {
        lastViewW = vw;
        lastViewH = vh;
        unifiedSvg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
      }
    }
  }
  measure();
  window.addEventListener("resize", measure, { passive: true });
  window.visualViewport?.addEventListener("resize", measure, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(measure);
    ro.observe(dnaWorld);
    if (heroEl) ro.observe(heroEl);
    if (dnaWrap) ro.observe(dnaWrap);
  }
  document.fonts?.ready?.then(measure);

  function normDeg(deg) { return ((deg + 180) % 360 + 360) % 360 - 180; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smootherstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / Math.max(e1 - e0, 1)));
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function shortestDelta(fromDeg, toDeg) { return ((toDeg - fromDeg + 540) % 360) - 180; }
  function snapToIndex(idx) {
    const target = ((idx % N) + N) % N;
    targetAngle = angle + shortestDelta(angle, -target * STEP);
    vel = 0;
    autoPauseUntil = performance.now() + 3600;
  }

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

  function buildHeroCurve(strand, isA, curAngle, dnaR, dnaDy, dnaYShift, e, stageCx, stageCy) {
    const sign = isA ? 1 : -1;
    const pts = [];
    const SUB = 4;
    for (let p = 0; p < strand.length - 1; p++) {
      const s0 = strand[p];
      const s1 = strand[p + 1];
      for (let k = 0; k < SUB; k++) {
        const t = k / SUB;
        const pairF = p + t;
        const pPhi = (pairF * 46 + curAngle * 1.1) * DEG;
        const xDna = sign * dnaR * Math.sin(pPhi);
        const yDna = (pairF - (PAIRS - 1) / 2) * dnaDy + dnaYShift;
        const zDna = sign * dnaR * Math.cos(pPhi) - 35;
        const x = lerp(lerp(s0.rx, s1.rx, t), xDna, e);
        const y = lerp(lerp(s0.ry, s1.ry, t), yDna, e);
        const z = lerp(lerp(s0.rz, s1.rz, t), zDna, e);
        const pf = persp / Math.max(persp - z, 120);
        pts.push({ x: stageCx + x * pf, y: stageCy + y * pf });
      }
    }
    const last = strand[strand.length - 1];
    pts.push({ x: last.x, y: last.y });
    return pts;
  }

  // Unified tooltip handler for both DNA spine micro-glyphs (desktop) and beads (mobile)
  if (ttEl) {
    const hideTooltip = () => ttEl.classList.remove("show");
    const showProjectTooltip = (idx, clientX, clientY) => {
      const p = tiles[idx];
      if (!p) return;
      ttSwatch.style.background = tileStyles[idx].bg;
      ttText.textContent = `${String(idx + 1).padStart(2, "0")} · ${p.label || p.title} — ${p.stack || p.category} ↗`;
      ttEl.style.left = `${clientX}px`;
      ttEl.style.top = `${clientY - 12}px`;
      ttEl.classList.add("show");
    };

    if (unifiedSvg) {
      unifiedSvg.addEventListener("mousemove", (e) => {
        const bead = e.target.closest(".dna-bead");
        if (!bead) { hideTooltip(); return; }
        showProjectTooltip(Number(bead.dataset.proj), e.clientX, e.clientY);
      });
      unifiedSvg.addEventListener("mouseleave", hideTooltip);
      unifiedSvg.addEventListener("click", (e) => {
        const bead = e.target.closest(".dna-bead");
        if (!bead) return;
        const p = tiles[Number(bead.dataset.proj)];
        if (p?.url) window.open(p.url, "_blank", "noopener,noreferrer");
      });
    }

    if (dnaWrap) {
      dnaWrap.addEventListener("mousemove", (e) => {
        const tok = e.target.closest(".spine-micro-tok");
        if (!tok) {
          if (!e.target.closest(".dna-bead")) hideTooltip();
          return;
        }
        showProjectTooltip(Number(tok.dataset.proj), e.clientX, e.clientY);
      });
      dnaWrap.addEventListener("mouseleave", hideTooltip);
      window.addEventListener("scroll", hideTooltip, { passive: true });
    }
  }

  function tick(now = performance.now()) {
    const dt = Math.min(Math.max((now - lastNow) / 1000, 0.001), 0.05);
    lastNow = now;

    const sy = window.scrollY;
    const worldBottom = lay.worldTop + lay.wh - sy;
    // Pause 3D + SVG work automatically when scrolled past #dna-world (saves mobile battery)
    if (worldBottom < -40) {
      requestAnimationFrame(tick);
      return;
    }

    if (!dragging) {
      if (targetAngle !== null) {
        const diff = targetAngle - angle;
        if (Math.abs(diff) < 0.08) { angle = targetAngle; targetAngle = null; }
        else angle += diff * (1 - Math.exp(-dt * 10));
      } else if (Math.abs(vel) > 0.06) {
        angle += vel * (dt * 60);
        vel *= Math.pow(0.94, dt * 60);
      } else if (!stageHovered && !reducedMotion && now > autoPauseUntil) {
        angle -= 6.0 * dt;
      }
    }
    if (!reducedMotion) pulseClock = (pulseClock + 0.228 * dt) % 1;

    const scrollP = reducedMotion || !runway ? 0 : Math.min(Math.max(sy / lay.maxScroll, 0), 1);
    const morphAlpha = 1 - Math.exp(-dt * 22);
    morph += (scrollP - morph) * morphAlpha;
    if (Math.abs(scrollP - morph) < 0.0012) morph = scrollP;
    const e = easeInOut(morph);

    if (Math.abs(e - lastHeroE) > 0.0005) {
      lastHeroE = e;
      const fadeOp = Math.max(1 - e * 2.0, 0);
      const fadeStr = fadeOp.toFixed(2);
      const fadePe = fadeOp < 0.15 ? "none" : "auto";
      if (heroIntro) {
        heroIntro.style.opacity = fadeStr;
        heroIntro.style.transform = `translate3d(0, ${(-e * 30).toFixed(1)}px, 0)`;
        heroIntro.style.pointerEvents = fadePe;
      }
      if (heroBottom) {
        heroBottom.style.opacity = fadeStr;
        heroBottom.style.transform = `translate3d(0, ${(e * 20).toFixed(1)}px, 0)`;
        heroBottom.style.pointerEvents = fadePe;
      }
    }

    const { hw, hh, tileW, isPhone, isMid, spineCx, helixTopY, helixBotY } = lay;
    const heroTopWorld = Math.max(0, Math.min(sy - lay.worldTop, lay.maxStickyY));
    const stageCx = lay.heroOffX + lay.stageOffX;
    const stageCy = heroTopWorld + lay.stageOffY;
    const heroBottomScreen = lay.worldTop + heroTopWorld + hh - sy;
    const heroOnScreen = heroBottomScreen > -60;

    const compactDy = Math.max(26, Math.min((lay.stageH - 56) / (PAIRS - 1), isPhone ? 48 : 62));
    const expandedPad = Math.min(210, hh * 0.28);
    const expandedDy = Math.max(32, Math.min((hh - expandedPad) / (PAIRS - 1), isPhone ? 68 : 76));
    const dnaDy = lerp(compactDy, expandedDy, e);
    const dnaR = Math.min(hw * (isPhone ? 0.24 : 0.13), isPhone ? 80 : 110, dnaDy * 1.55);
    const dnaScale = lerp(
      Math.min(0.48, (compactDy * 0.94) / tileW),
      Math.min(0.60, (expandedDy * 0.90) / tileW),
      e
    );
    const dnaYShift = e * ((heroTopWorld + hh * (isPhone ? 0.40 : 0.41)) - stageCy);

    const norm = ((-angle % 360) + 360) % 360;
    const ringFrontIdx = Math.round(norm / STEP) % N;
    const ringActiveIdx = hoveredTile >= 0 ? hoveredTile : ringFrontIdx;
    const spotlightStrength = Math.max(0, 1 - e * 2.2);
    const activeTargetIdx = spotlightStrength > 0.05 ? ringActiveIdx : -1;

    if (activeTargetIdx !== lastActiveTileIdx) {
      if (lastActiveTileIdx >= 0 && tileEls[lastActiveTileIdx]) {
        tileEls[lastActiveTileIdx].classList.remove("is-active");
      }
      if (activeTargetIdx >= 0 && tileEls[activeTargetIdx]) {
        tileEls[activeTargetIdx].classList.add("is-active");
      }
      lastActiveTileIdx = activeTargetIdx;
    }

    const strandA = [];
    const strandB = [];
    let frontMostIdx = 0;
    let maxZ = -99999;
    let bottomPhiRad = ((PAIRS - 1) * 46 + angle * 1.1) * DEG;

    for (let i = 0; i < N; i++) {
      const pair = Math.floor(i / 2);
      const isA = i % 2 === 0;
      const phiDeg = pair * 46 + angle * 1.1;
      const phi = phiDeg * DEG;
      if (pair === PAIRS - 1) bottomPhiRad = phi;

      // Skip full 3D tile DOM transforms once hero is scrolled completely off-screen
      if (!heroOnScreen && pair < PAIRS - 1) continue;

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

      const xDna = (isA ? 1 : -1) * dnaR * Math.sin(phi);
      const yDna = (pair - (PAIRS - 1) / 2) * dnaDy + dnaYShift;
      const zDna = (isA ? 1 : -1) * dnaR * Math.cos(phi) - 35;

      const x = lerp(xRing, xDna, e);
      const y = lerp(yRing, yDna, e);
      const z = lerp(zRing, zDna, e);

      if (heroOnScreen) {
        const ryDna = (isA ? 1 : -1) * Math.cos(phi) * 14;
        const rxDna = -(isA ? 1 : -1) * Math.sin(phi) * 6;
        const rx = lerp(TILT_X, rxDna, e);
        const rz = lerp(TILT_Z, 0, e);
        const ry = lerp(ryRing, ryDna, e);
        const sc = lerp(1, dnaScale, e);

        const isAct = i === activeTargetIdx;
        const zLift = isAct ? 36 * spotlightStrength : 0;
        const scMult = isAct ? lerp(1, 1.11, spotlightStrength) : 1;

        tileEls[i].style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(z + zLift).toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(sc * scMult).toFixed(3)})`;
      }

      if (z > maxZ) { maxZ = z; frontMostIdx = i; }

      const pf = persp / Math.max(persp - z, 120);
      const pt = { x: stageCx + x * pf, y: stageCy + y * pf, z, rx: xRing, ry: yRing, rz: zRing };
      if (isA) strandA.push(pt);
      else strandB.push(pt);
    }

    // ONE SINGLE CONTINUOUS SVG (Persistent DOM nodes — 0 innerHTML calls per frame)
    if (svgScene && strandA.length && strandB.length) {
      const lowerAmp = isPhone ? 10 : (isMid ? 24 : 32);
      const heroOp = e <= 0.28 ? 0 : Math.min((e - 0.28) / 0.52, 1);
      const funnelOp = heroOp * Math.min(Math.max((e - 0.24) / 0.44, 0), 1);

      const lastA = strandA[strandA.length - 1];
      const lastB = strandB[strandB.length - 1];
      const yStart = (lastA.y + lastB.y) / 2;
      const ySettleCx = Math.max(yStart + (isPhone ? 155 : 130), helixTopY + (isPhone ? 52 : 48));
      const ySettleAmp = Math.max(yStart + (isPhone ? 120 : 175), helixTopY + (isPhone ? 24 : 90));

      const dnaRProj = dnaR * (persp / Math.max(persp + 35, 120));
      const offAX = lastA.x - (stageCx + Math.sin(bottomPhiRad) * dnaRProj);
      const offBX = lastB.x - (stageCx - Math.sin(bottomPhiRad) * dnaRProj);
      const offAY = lastA.y - yStart;
      const offBY = lastB.y - yStart;

      const freqHero = (46 * DEG) / Math.max(dnaDy, 20);
      const freqLower = (Math.PI * 2) / 250;

      const openT = funnelOp;
      const flowPtsA = [];
      const flowPtsB = [];
      let funnelRungsD = "";
      let spineRungsD = "";
      let phi = bottomPhiRad;
      const stepY = 18;
      let rungAccum = 0;

      for (let y = yStart; y <= helixBotY; y += stepY) {
        const uCxRaw = smootherstep(yStart, ySettleCx, y);
        const uCx = isPhone ? 1 - Math.pow(1 - uCxRaw, 1.45) : uCxRaw;
        const uAmp = smootherstep(yStart, ySettleAmp, y);
        const belowTop = smootherstep(helixTopY - 30, helixTopY, y);
        const effUCx = lerp(uCx, lerp(1, uCx, openT), belowTop);
        const effUAmp = lerp(uAmp, lerp(1, uAmp, openT), belowTop);
        const topTaper = smootherstep(0, 56, Math.abs(y - helixTopY));
        const topClose = lerp(topTaper, 1, openT);
        const botClose = 1 - smootherstep(helixBotY - 56, helixBotY, y);
        const cx = lerp(stageCx, spineCx, effUCx);
        const amp = lerp(dnaRProj, lowerAmp, effUAmp) * topClose * botClose;
        const s = Math.sin(phi);
        const ax = cx + s * amp + offAX * (1 - effUAmp);
        const bx = cx - s * amp + offBX * (1 - effUAmp);
        const ay = y + offAY * (1 - effUAmp);
        const by = y + offBY * (1 - effUAmp);

        flowPtsA.push({ x: ax, y: ay });
        flowPtsB.push({ x: bx, y: by });

        rungAccum += stepY;
        const rungGap = lerp(isPhone ? 32 : 28, 24, effUAmp);
        if (rungAccum >= rungGap && y > yStart + 14 && y < helixBotY - 38) {
          rungAccum = 0;
          const spread = Math.abs(s) * topClose * botClose;
          if (spread > 0.22) {
            const seg = `M${ax.toFixed(1)},${ay.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;
            if (y < helixTopY) {
              if (funnelOp > 0.04) funnelRungsD += seg;
            } else {
              spineRungsD += seg;
            }
          }
        }

        phi += lerp(freqHero, freqLower, effUAmp) * stepY;
      }

      if (flowPtsA.length > 0) {
        flowPtsA.push({ x: spineCx, y: helixBotY });
        flowPtsB.push({ x: spineCx, y: helixBotY });
      }

      const showHeroSvg = heroOnScreen && heroOp > 0.01 && strandA.length >= 2;
      let heroPrevA = null;
      let heroPrevB = null;
      if (showHeroSvg) {
        if (!heroVisibleLast) {
          svgScene.heroRungsPath.removeAttribute("display");
          svgScene.heroPathA.removeAttribute("display");
          svgScene.heroPathB.removeAttribute("display");
          svgScene.heroMidGroup.removeAttribute("display");
          heroVisibleLast = true;
        }
        const rungPairs = Math.min(strandA.length, strandB.length);
        let heroRungsD = "";
        const midOp = (0.8 * heroOp).toFixed(2);
        for (let p = 0; p < rungPairs; p++) {
          const a = strandA[p];
          const b = strandB[p];
          heroRungsD += `M${a.x.toFixed(1)},${a.y.toFixed(1)}L${b.x.toFixed(1)},${b.y.toFixed(1)}`;
          const dot = svgScene.heroMidDots[p];
          if (dot) {
            dot.setAttribute("cx", ((a.x + b.x) * 0.5).toFixed(1));
            dot.setAttribute("cy", ((a.y + b.y) * 0.5).toFixed(1));
            dot.setAttribute("fill-opacity", midOp);
          }
        }
        svgScene.heroRungsPath.setAttribute("d", heroRungsD);
        svgScene.heroRungsPath.setAttribute("stroke-opacity", (0.22 * heroOp).toFixed(2));

        const heroCurveA = buildHeroCurve(strandA, true, angle, dnaR, dnaDy, dnaYShift, e, stageCx, stageCy);
        const heroCurveB = buildHeroCurve(strandB, false, angle, dnaR, dnaDy, dnaYShift, e, stageCx, stageCy);
        heroPrevA = heroCurveA[heroCurveA.length - 2] || null;
        heroPrevB = heroCurveB[heroCurveB.length - 2] || null;

        svgScene.heroPathB.setAttribute("d", smoothBezierSlice(heroCurveB, 0, heroCurveB.length - 1, flowPtsB[1]));
        svgScene.heroPathB.setAttribute("stroke-opacity", (0.84 * heroOp).toFixed(2));
        svgScene.heroPathA.setAttribute("d", smoothBezierSlice(heroCurveA, 0, heroCurveA.length - 1, flowPtsA[1]));
        svgScene.heroPathA.setAttribute("stroke-opacity", (0.88 * heroOp).toFixed(2));
      } else if (heroVisibleLast) {
        svgScene.heroRungsPath.setAttribute("display", "none");
        svgScene.heroPathA.setAttribute("display", "none");
        svgScene.heroPathB.setAttribute("display", "none");
        svgScene.heroMidGroup.setAttribute("display", "none");
        heroVisibleLast = false;
      }

      let splitIdx = flowPtsA.findIndex((p) => p.y >= helixTopY);
      if (splitIdx < 1) splitIdx = 1;

      const closedTip = openT <= 0.02;
      const spineSliceA = closedTip ? [{ x: spineCx, y: helixTopY }, ...flowPtsA.slice(splitIdx)] : flowPtsA;
      const spineSliceB = closedTip ? [{ x: spineCx, y: helixTopY }, ...flowPtsB.slice(splitIdx)] : flowPtsB;
      const spineStartIdx = closedTip ? 0 : splitIdx;

      if (!closedTip) {
        if (!funnelVisibleLast) {
          svgScene.funnelPathA.removeAttribute("display");
          svgScene.funnelPathB.removeAttribute("display");
          svgScene.funnelRungsPath.removeAttribute("display");
          funnelVisibleLast = true;
        }
        svgScene.funnelPathA.setAttribute("d", smoothBezierSlice(flowPtsA, 0, splitIdx, null, heroPrevA));
        svgScene.funnelPathA.setAttribute("stroke-opacity", (0.88 * funnelOp).toFixed(2));
        svgScene.funnelPathB.setAttribute("d", smoothBezierSlice(flowPtsB, 0, splitIdx, null, heroPrevB));
        svgScene.funnelPathB.setAttribute("stroke-opacity", (0.84 * funnelOp).toFixed(2));
        svgScene.funnelRungsPath.setAttribute("d", funnelRungsD);
        svgScene.funnelRungsPath.setAttribute("stroke-opacity", (0.22 * funnelOp).toFixed(2));
      } else if (funnelVisibleLast) {
        svgScene.funnelPathA.setAttribute("display", "none");
        svgScene.funnelPathB.setAttribute("display", "none");
        svgScene.funnelRungsPath.setAttribute("display", "none");
        funnelVisibleLast = false;
      }

      svgScene.spineRungsPath.setAttribute("d", spineRungsD);
      svgScene.spinePathA.setAttribute("d", smoothBezierSlice(spineSliceA, spineStartIdx, spineSliceA.length - 1));
      svgScene.spinePathB.setAttribute("d", smoothBezierSlice(spineSliceB, spineStartIdx, spineSliceB.length - 1));

      const originOp = Math.max(0, 1 - openT * 1.4);
      if (flowPtsA.length > 2 && originOp > 0.02) {
        svgScene.originDot.removeAttribute("display");
        svgScene.originDot.setAttribute("cx", spineCx.toFixed(1));
        svgScene.originDot.setAttribute("cy", helixTopY.toFixed(1));
        svgScene.originDot.setAttribute("r", lerp(4.4, 2.2, openT).toFixed(1));
        svgScene.originDot.setAttribute("fill-opacity", originOp.toFixed(2));
        svgScene.originDot.setAttribute("stroke-opacity", originOp.toFixed(2));
      } else {
        svgScene.originDot.setAttribute("display", "none");
      }

      if (flowPtsA.length > 2) {
        svgScene.termDot.removeAttribute("display");
        svgScene.termDot.setAttribute("cx", spineCx.toFixed(1));
        svgScene.termDot.setAttribute("cy", helixBotY.toFixed(1));
      } else {
        svgScene.termDot.setAttribute("display", "none");
      }

      if (!reducedMotion && funnelOp > 0.2 && flowPtsA.length > 6) {
        const pIdxA = Math.floor(pulseClock * (flowPtsA.length - 1));
        const pIdxB = Math.floor(((pulseClock + 0.5) % 1) * (flowPtsB.length - 1));
        const pA = flowPtsA[pIdxA];
        const pB = flowPtsB[pIdxB];
        svgScene.pulsesGroup.removeAttribute("display");
        svgScene.pulseOuterA.setAttribute("cx", pA.x.toFixed(1));
        svgScene.pulseOuterA.setAttribute("cy", pA.y.toFixed(1));
        svgScene.pulseOuterA.setAttribute("fill-opacity", (0.22 * funnelOp).toFixed(2));
        svgScene.pulseInnerA.setAttribute("cx", pA.x.toFixed(1));
        svgScene.pulseInnerA.setAttribute("cy", pA.y.toFixed(1));
        svgScene.pulseInnerA.setAttribute("fill-opacity", (0.92 * funnelOp).toFixed(2));
        svgScene.pulseOuterB.setAttribute("cx", pB.x.toFixed(1));
        svgScene.pulseOuterB.setAttribute("cy", pB.y.toFixed(1));
        svgScene.pulseOuterB.setAttribute("fill-opacity", (0.26 * funnelOp).toFixed(2));
        svgScene.pulseInnerB.setAttribute("cx", pB.x.toFixed(1));
        svgScene.pulseInnerB.setAttribute("cy", pB.y.toFixed(1));
        svgScene.pulseInnerB.setAttribute("fill-opacity", (0.96 * funnelOp).toFixed(2));
      } else {
        svgScene.pulsesGroup.setAttribute("display", "none");
      }

      const spineLen = flowPtsA.length - 1 - splitIdx;
      if (isPhone && spineLen > 6) {
        svgScene.beadsGroup.removeAttribute("display");
        const padTop = Math.floor(spineLen * 0.05);
        const padBot = Math.floor(spineLen * 0.07);
        const usable = Math.max(spineLen - padTop - padBot, 6);
        for (let i = 0; i < N; i++) {
          const k = Math.min(flowPtsA.length - 2, splitIdx + padTop + Math.round((i / Math.max(N - 1, 1)) * usable));
          const pt = i % 2 === 0 ? flowPtsA[k] : flowPtsB[k];
          const bead = svgScene.mobileBeads[i];
          bead.setAttribute("cx", pt.x.toFixed(1));
          bead.setAttribute("cy", pt.y.toFixed(1));
        }
      } else {
        svgScene.beadsGroup.setAttribute("display", "none");
      }
    }

    if (heroOnScreen) {
      updateCaption(hoveredTile >= 0 ? hoveredTile : (e > 0.5 ? frontMostIdx : ringFrontIdx));
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  stage.addEventListener("mouseenter", () => { stageHovered = true; });
  stage.addEventListener("mouseleave", () => { stageHovered = false; hoveredTile = -1; });

  const startDrag = (x) => { dragging = true; moved = false; targetAngle = null; lastX = x; vel = 0; };
  const moveDrag = (x) => {
    if (!dragging) return;
    const dx = x - lastX;
    if (Math.abs(dx) > 4) {
      moved = true;
      autoPauseUntil = 0;
    }
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
      autoPauseUntil = 0;
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

  if (prevBtn) {
    prevBtn.addEventListener("click", () => snapToIndex((activeShown < 0 ? 0 : activeShown) - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => snapToIndex((activeShown < 0 ? 0 : activeShown) + 1));
  }

  stage.addEventListener("keydown", (e) => {
    const norm = ((-angle % 360) + 360) % 360;
    const frontIdx = Math.round(norm / STEP) % N;
    if (e.key === "ArrowLeft") { e.preventDefault(); snapToIndex((frontIdx - 1 + N) % N); }
    else if (e.key === "ArrowRight") { e.preventDefault(); snapToIndex((frontIdx + 1) % N); }
  });
}
