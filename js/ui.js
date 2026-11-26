import { isLightTheme, renderMicroGlyph, renderTileArt, resolveTileStyle } from "./tile-art.js";

const TRI_META = {
  swim: {
    label: "Swim",
    color: "#0B7A75",
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 15c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0"/><path d="M2 20c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0"/><circle cx="16.5" cy="7.5" r="2.2" fill="currentColor" stroke="none"/><path d="M6.5 12l4-3.5 3.5 2"/></svg>`,
  },
  bike: {
    label: "Bike",
    color: "#E8431F",
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4.5-7.5h4.5l3 7.5M10.5 9.5L13 17H6M14 6.5h3"/></svg>`,
  },
  run: {
    label: "Run",
    color: "#D99B00",
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="15" cy="5.5" r="2.2" fill="currentColor" stroke="none"/><path d="M13 9.5l-2.5 5 4.5 2.5-1.5 4.5M10.5 14.5L6 16.5M9 10.5l4-1 3.5 2.5"/></svg>`,
  },
  transition: {
    label: "T1 → T2",
    color: "#1943B8",
    icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h14l-3.5-3.5M20 15H6l3.5 3.5"/></svg>`,
  },
};

function renderFoundationCard(f, stats) {
  const variantClass = f.variant ? ` ${f.variant}` : "";

  if (f.type === "focus") {
    return `
      <article class="dna-card${variantClass}">
        <div>
          <div class="dna-kicker"><span>${f.kickerLeft}</span><span>${f.kickerRight}</span></div>
          <div class="focus-list">
            ${f.items
              .map((it) => {
                const legsHtml = it.triLegs?.length
                  ? `<div class="tri-legs">${it.triLegs
                      .map((leg) => {
                        const m = TRI_META[leg];
                        if (!m) return "";
                        return `<button class="tri-leg" type="button" data-tri-leg="${leg}" style="--leg-accent:${m.color};" title="Tap for ${m.label} log">${m.icon}<span>${m.label}</span></button>`;
                      })
                      .join("")}</div>`
                  : "";
                return `
                <div class="focus-row">
                  <div class="spec-label">${it.label}</div>
                  <div class="focus-val">${it.value}</div>
                  ${legsHtml}
                </div>`;
              })
              .join("")}
          </div>
        </div>
        <div class="stats-inline">
          <span><b>${stats.yearsExp}</b>AI &amp; 3D CV</span>
          <span><b>${stats.projects}</b>Works</span>
          <span><b>${stats.certs}</b>Certs</span>
        </div>
      </article>`;
  }

  if (f.type === "spec") {
    const footHtml =
      f.footLeft || f.footRight
        ? `<div class="dna-foot"><span>${f.footLeft || ""}</span><span>${f.footRight || ""}</span></div>`
        : "";
    return `
      <article class="dna-card${variantClass}">
        <div>
          <div class="dna-kicker"><span>${f.kickerLeft}</span><span>${f.kickerRight}</span></div>
          <div class="spec-grid">
            ${f.specs
              .map((s) => `<div class="spec-item"><div class="spec-label">${s.label}</div><div class="spec-val">${s.value}</div></div>`)
              .join("")}
          </div>
        </div>
        ${footHtml}
      </article>`;
  }

  if (f.type === "education") {
    return `
      <article class="dna-card${variantClass}">
        <div>
          <div class="dna-kicker"><span>${f.kickerLeft}</span><span>${f.kickerRight}</span></div>
          <div class="edu-list">
            ${f.degrees
              .map(
                (d) => `
                <div class="edu-row">
                  <div>
                    <div class="edu-deg">${d.degree}</div>
                    <div class="edu-school">${d.school}</div>
                  </div>
                  <span class="edu-yr">${d.years}</span>
                </div>`
              )
              .join("")}
          </div>
        </div>
      </article>`;
  }

  return "";
}

function parseDurationSec(timeStr) {
  if (!timeStr) return Infinity;
  const approx = timeStr.trim().startsWith("~");
  const clean = timeStr.replace(/^~/, "").trim();
  const parts = clean.split(":").map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return Infinity;
  const sec = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
  return approx ? sec + 0.5 : sec;
}

function distSortKey(dist) {
  const num = parseFloat(dist);
  return Number.isNaN(num) ? -1 : num;
}

function initTriathlonLog(races) {
  const modal = document.getElementById("tri-modal");
  const closeBtn = document.getElementById("tri-modal-close");
  const pbEl = document.getElementById("tri-pb-strip");
  const tabsEl = document.getElementById("tri-dist-tabs");
  const listEl = document.getElementById("tri-race-list");
  if (!modal || !pbEl || !tabsEl || !listEl || !races?.length) return null;

  let activeDist = "All";
  let isOpen = false;
  let closeTimer = null;

  const finished = races.filter((r) => r.status !== "upcoming");
  const upcoming = races.filter((r) => r.status === "upcoming");
  const distances = [...new Set(races.map((r) => r.distance || "Other"))].sort((a, b) => distSortKey(b) - distSortKey(a));

  // Auto-compute PB per numeric distance (sorted longest -> shortest, up to 3 PB cards)
  const pbCards = distances
    .filter((d) => distSortKey(d) > 0)
    .map((d) => {
      const timed = finished
        .filter((r) => r.distance === d && Number.isFinite(parseDurationSec(r.time)))
        .sort((a, b) => parseDurationSec(a.time) - parseDurationSec(b.time));
      return timed[0] ? { dist: d, best: timed[0] } : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  pbEl.innerHTML = [
    `<div class="tri-pb-card">
      <div class="tri-pb-lbl">Races Logged</div>
      <div class="tri-pb-val">${finished.length}</div>
      <div class="tri-pb-sub">${upcoming.length ? `+${upcoming.length} upcoming` : "Multi-distance"}</div>
    </div>`,
    ...pbCards.map(
      ({ dist, best }) => `
      <div class="tri-pb-card">
        <div class="tri-pb-lbl">Best ${dist}</div>
        <div class="tri-pb-val">${best.time}</div>
        <div class="tri-pb-sub">${best.date.slice(0, 4)} · ${best.location || best.event}</div>
      </div>`
    ),
  ].join("");

  const renderRaces = () => {
    const visible = activeDist === "All" ? races : races.filter((r) => (r.distance || "Other") === activeDist);
    listEl.innerHTML = visible
      .map((r) => {
        const isUpcoming = r.status === "upcoming";
        const timeHtml = r.time
          ? `<span class="tri-rr-time">${r.time}</span>`
          : `<span class="tri-rr-badge ${isUpcoming ? "is-upcoming" : ""}">${isUpcoming ? "UPCOMING" : "FINISHER"}</span>`;

        const links = [];
        if (r.url) links.push(`<a class="tri-rr-link" href="${r.url}" target="_blank" rel="noreferrer">Result ↗</a>`);
        if (r.portalUrl) links.push(`<a class="tri-rr-link is-sec" href="${r.portalUrl}" target="_blank" rel="noreferrer">Portal ↗</a>`);
        const linksHtml = links.length ? `<span class="tri-rr-links">${links.join("")}</span>` : "";

        const sp = r.splits;
        const splitParts = [];
        if (sp?.swim) splitParts.push(`<span><i class="tri-sp-dot" style="background:${TRI_META.swim.color}"></i>Swim ${sp.swim}</span>`);
        if (sp?.t1) splitParts.push(`<span class="tri-sp-t">T1 ${sp.t1}</span>`);
        if (sp?.bike) splitParts.push(`<span><i class="tri-sp-dot" style="background:${TRI_META.bike.color}"></i>Bike ${sp.bike}</span>`);
        if (sp?.t2) splitParts.push(`<span class="tri-sp-t">T2 ${sp.t2}</span>`);
        if (sp?.run) splitParts.push(`<span><i class="tri-sp-dot" style="background:${TRI_META.run.color}"></i>Run ${sp.run}</span>`);
        const splitsHtml = splitParts.length ? `<div class="tri-rr-splits">${splitParts.join("")}</div>` : "";

        return `
          <article class="tri-rr${isUpcoming ? " is-upcoming" : ""}">
            <div class="tri-rr-top">
              <span class="tri-rr-name">${r.event}</span>
              ${timeHtml}
            </div>
            <div class="tri-rr-meta">
              <div class="tri-rr-tags">
                ${r.distance ? `<span class="tri-dist-pill">${r.distance}</span>` : ""}
                <span>${r.date}${r.location ? ` · ${r.location}` : ""}</span>
                ${r.note ? `<span>${r.note}</span>` : ""}
              </div>
              ${linksHtml}
            </div>
            ${splitsHtml}
          </article>`;
      })
      .join("");
  };

  tabsEl.innerHTML = ["All", ...distances]
    .map((d) => {
      const cnt = d === "All" ? races.length : races.filter((r) => (r.distance || "Other") === d).length;
      return `<button class="tri-d-tab ${d === "All" ? "active" : ""}" type="button" role="tab" data-dist="${d}">${d} (${cnt})</button>`;
    })
    .join("");

  tabsEl.querySelectorAll(".tri-d-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDist = btn.dataset.dist;
      tabsEl.querySelectorAll(".tri-d-tab").forEach((b) => b.classList.toggle("active", b === btn));
      renderRaces();
    });
  });

  renderRaces();

  const openModal = () => {
    clearTimeout(closeTimer);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => modal.classList.add("show"));
    isOpen = true;
  };

  const closeModal = () => {
    clearTimeout(closeTimer);
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove("show");
    document.body.style.overflow = "";
    closeTimer = setTimeout(() => { if (!isOpen) modal.hidden = true; }, 200);
  };

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) closeModal(); });

  return { open: openModal, close: closeModal };
}

function initAvatarEasterEgg(quotes, races, showToast) {
  if (!quotes.length) return;
  const raceModal = initTriathlonLog(races);
  const avatarBtn = document.getElementById("avatar-trigger");
  const avatarBubble = document.getElementById("avatar-bubble");
  const abTag = document.getElementById("ab-tag");
  const abStep = document.getElementById("ab-step");
  const abText = document.getElementById("ab-text");

  if (avatarBtn && avatarBubble) {
    let qIdx = -1;
    let tapCount = 0;
    let isOpen = false;
    let pinned = false;
    let closeTimer = null;

    const showBubble = (stepLabel) => {
      clearTimeout(closeTimer);
      qIdx = (qIdx + 1) % quotes.length;
      const q = quotes[qIdx];
      const meta = TRI_META[q.leg] || TRI_META.transition;
      const accent = q.color || meta.color;
      avatarBtn.style.setProperty("--tri-accent", accent);
      avatarBubble.style.setProperty("--tri-accent", accent);
      abTag.innerHTML = `${meta.icon}<span>${q.tag}</span>`;
      abStep.textContent = stepLabel || `${qIdx + 1}/${quotes.length} · TAP`;
      abText.textContent = q.text;
      avatarBubble.hidden = false;
      requestAnimationFrame(() => avatarBubble.classList.add("show"));
      avatarBtn.classList.add("is-active");
      avatarBtn.setAttribute("aria-expanded", "true");
      isOpen = true;
    };

    const closeBubble = () => {
      clearTimeout(closeTimer);
      if (!isOpen) return;
      isOpen = false;
      pinned = false;
      avatarBubble.classList.remove("show");
      avatarBtn.classList.remove("is-active");
      avatarBtn.setAttribute("aria-expanded", "false");
      closeTimer = setTimeout(() => { if (!isOpen) avatarBubble.hidden = true; }, 180);
    };

    const scheduleClose = (delay) => {
      if (!pinned) closeTimer = setTimeout(closeBubble, delay);
    };

    if (window.matchMedia("(hover: hover)").matches) {
      avatarBtn.addEventListener("mouseenter", () => {
        if (!isOpen) showBubble(raceModal ? "TAP 3× FOR LOG" : "");
      });
      avatarBtn.addEventListener("mouseleave", () => scheduleClose(220));
      avatarBubble.addEventListener("mouseenter", () => clearTimeout(closeTimer));
      avatarBubble.addEventListener("mouseleave", () => scheduleClose(180));
    }

    const handleTap = (e) => {
      e.stopPropagation();
      pinned = true;
      if (!raceModal) {
        showBubble();
        return;
      }
      tapCount += 1;
      if (tapCount >= 3) {
        tapCount = 0;
        showBubble("UNLOCKED ✓");
        setTimeout(() => {
          closeBubble();
          raceModal.open();
        }, 260);
      } else {
        const left = 3 - tapCount;
        showBubble(`${tapCount}/3 · ${left} MORE TAP${left > 1 ? "S" : ""}`);
      }
    };

    avatarBtn.addEventListener("click", handleTap);
    avatarBubble.addEventListener("click", handleTap);
    document.addEventListener("click", (e) => { if (isOpen && !e.target.closest(".brand-group")) closeBubble(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) closeBubble(); });
    window.addEventListener("scroll", () => { if (isOpen && window.scrollY > 40) closeBubble(); }, { passive: true });
  }

  // Completing all 3 legs (SWIM + BIKE + RUN) in Highlights also unlocks the Race Log
  const completedLegs = new Set();
  const legBtns = Array.from(document.querySelectorAll(".tri-leg[data-tri-leg]"));
  legBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const leg = btn.dataset.triLeg;
      const q = quotes.find((item) => item.leg === leg);
      if (raceModal) {
        completedLegs.add(leg);
        btn.classList.add("is-done");
        if (completedLegs.size >= legBtns.length && legBtns.length >= 3) {
          completedLegs.clear();
          legBtns.forEach((b) => b.classList.remove("is-done"));
          showToast("Triathlon complete ✓ Opening Race Log…", 1800);
          setTimeout(() => raceModal.open(), 220);
          return;
        }
      }
      if (q) showToast(`${q.tag} · ${q.text}`, 3400);
    });
  });
}

export function initUI(data) {
  const { profile, projects, journey, certifications, triathlonLog } = data;
  let activeCat = "All";
  let showAll = false;
  let certGroup = 0;

  const totalProjects = projects.length;
  const totalCerts = certifications.reduce((s, g) => s + g.items.length, 0);
  const projectStyles = projects.map((p) => resolveTileStyle(p));

  document.getElementById("brand-name").textContent = profile.brand;
  const telemetryEl = document.getElementById("hero-telemetry");
  if (telemetryEl) telemetryEl.textContent = `TAIPEI · 25.03°N · ${profile.roleLine}`;
  document.getElementById("hero-name").textContent = profile.fullName;
  document.getElementById("hero-role").textContent = profile.specialty;
  document.getElementById("hero-bio").innerHTML = profile.bioHtml;
  document.getElementById("contact-email-text").textContent = profile.email;
  document.querySelectorAll("[data-portrait]").forEach((img) => {
    img.src = profile.portrait;
    img.alt = `${profile.fullName} (${profile.nickname})`;
  });
  document.querySelectorAll("[data-github]").forEach((a) => (a.href = profile.links.github));
  document.querySelectorAll("[data-linkedin]").forEach((a) => (a.href = profile.links.linkedin));

  const projectsHeading = document.getElementById("projects-heading");
  if (projectsHeading) projectsHeading.textContent = `All ${totalProjects} Projects`;
  const certBadge = document.getElementById("cert-count-badge");
  if (certBadge) certBadge.textContent = `${totalCerts} Credentials`;

  // 01 · Render Career × Foundations dynamically from SITE_DATA.journey
  const helixRowsEl = document.getElementById("helix-rows");
  if (helixRowsEl && journey?.length) {
    const stats = { yearsExp: profile.yearsExp, projects: totalProjects, certs: totalCerts };
    helixRowsEl.innerHTML = journey
      .map((row) => {
        const c = row.career;
        const eraIndices = projects
          .map((p, idx) => (row.categories.includes(p.category) ? idx : -1))
          .filter((idx) => idx >= 0);
        const swatchCat = row.swatchCategory || c.filterCategory;
        const swatchIndices = projects
          .map((p, idx) => (p.category === swatchCat ? idx : -1))
          .filter((idx) => idx >= 0);
        const filterCount = projects.filter((p) => p.category === c.filterCategory).length;

        const chipsHtml = swatchIndices
          .map((i) => {
            const p = projects[i];
            const st = projectStyles[i];
            const lightCls = isLightTheme(p) ? " light-chip" : "";
            return `<a class="era-glyph-chip${lightCls}" href="${p.url}" target="_blank" rel="noreferrer" title="${p.title}" style="background:${st.bg};color:${st.fg};">${renderMicroGlyph(p, 14)}<span>${p.label || p.title}</span></a>`;
          })
          .join("");

        const spineTokensHtml = eraIndices
          .map((i, k) => {
            const p = projects[i];
            const st = projectStyles[i];
            const lightCls = isLightTheme(p) ? " is-light" : "";
            const sideCls = k % 2 === 0 ? " tok-l" : " tok-r";
            return `<a class="spine-micro-tok${lightCls}${sideCls}" data-proj="${i}" href="${p.url}" target="_blank" rel="noreferrer" aria-label="${p.title}" style="background:${st.bg};color:${st.fg};">${renderMicroGlyph(p, 15)}</a>`;
          })
          .join("");

        return `
          <div class="helix-pair reveal">
            <article class="dna-card${c.variant ? ` ${c.variant}` : ""}">
              <div>
                <div class="dna-kicker">
                  <span>${c.live ? '<span class="live-dot"></span>' : ""}${c.date}</span>
                  <span>${c.location}</span>
                </div>
                <div class="dna-org">${c.org}</div>
                <div class="dna-role">${c.role}</div>
                <p class="dna-desc">${c.desc}</p>
              </div>
              <div class="dna-foot">
                <span class="era-glyph-row">${chipsHtml}</span>
                <div class="dna-actions">
                  <button class="dna-chip" type="button" data-filter-cat="${c.filterCategory}">${filterCount} ${c.chipLabel} ↓</button>
                </div>
              </div>
            </article>

            <div class="helix-center-pin">
              <span class="pair-tag">${row.pin}</span>
              <div class="spine-tok-stack">${spineTokensHtml}</div>
            </div>

            ${renderFoundationCard(row.foundation, stats)}
          </div>`;
      })
      .join("");
  }

  // Copy Email & Triathlon Toast
  const toastEl = document.getElementById("toast");
  function showToast(msg, ms = 2200) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._id);
    toastEl._id = setTimeout(() => toastEl.classList.remove("show"), ms);
  }
  document.getElementById("copy-email")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(profile.email).catch(() => {});
    showToast(`Copied ${profile.email}`);
  });

  initAvatarEasterEgg(profile.avatarQuotes || [], triathlonLog || [], showToast);

  // 02 · Open 4-Column Swiss Poster Gallery (auto-derived categories)
  const numbered = projects.map((p, i) => ({ ...p, code: String(i + 1).padStart(2, "0") }));
  const categories = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))];
  const tabsEl = document.getElementById("filter-tabs");
  const gridEl = document.getElementById("poster-grid");
  const searchEl = document.getElementById("gallery-search");
  const moreBtn = document.getElementById("gallery-more");

  tabsEl.innerHTML = categories
    .map((c) => `<button class="f-tab ${c === "All" ? "active" : ""}" data-cat="${c}" type="button">${c === "All" ? `All (${numbered.length})` : c}</button>`)
    .join("");

  function setCategory(cat) {
    activeCat = cat;
    tabsEl.querySelectorAll(".f-tab").forEach((x) => x.classList.toggle("active", x.dataset.cat === cat));
    renderGallery();
  }

  function renderGallery() {
    const q = searchEl.value.trim().toLowerCase();
    const filtered = numbered.filter(
      (p) =>
        (activeCat === "All" || p.category === activeCat) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          (p.stack || "").toLowerCase().includes(q) ||
          (p.kind || "").toLowerCase().includes(q))
    );
    const limit = activeCat === "All" && !q && !showAll && filtered.length > 8;
    const visible = limit ? filtered.slice(0, 8) : filtered;

    gridEl.innerHTML =
      visible
        .map((p) => {
          const { bg, fg } = resolveTileStyle(p);
          return `
            <a class="poster-card" href="${p.url}" target="_blank" rel="noreferrer">
              <div class="poster-art" style="background:${bg}; color:${fg};">
                ${renderTileArt(p)}
              </div>
              <div class="poster-plaque">
                <div class="poster-meta">
                  <span><span class="poster-num">${p.code}</span> · ${p.stack || p.category}</span>
                  <span>${p.kind || "Open"} ↗</span>
                </div>
                <div class="poster-title">${p.title}</div>
              </div>
            </a>`;
        })
        .join("") ||
      `<div style="grid-column:1/-1;text-align:center;padding:32px;font-family:var(--mono);font-size:12px;color:var(--muted);">No matching works found.</div>`;

    if (activeCat === "All" && !q && filtered.length > 8) {
      moreBtn.hidden = false;
      moreBtn.textContent = showAll ? "Show fewer works" : `View all ${filtered.length} works (+${filtered.length - 8})`;
    } else {
      moreBtn.hidden = true;
    }
  }
  tabsEl.querySelectorAll(".f-tab").forEach((b) => b.addEventListener("click", () => setCategory(b.dataset.cat)));
  searchEl.addEventListener("input", renderGallery);
  moreBtn.addEventListener("click", () => { showAll = !showAll; renderGallery(); });
  renderGallery();

  document.querySelectorAll("[data-filter-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setCategory(btn.dataset.filterCat);
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 03 · Tabbed Verified Certifications (tab labels read directly from SITE_DATA.certifications)
  const cTabsEl = document.getElementById("cert-tabs");
  const cGridEl = document.getElementById("cert-mini-grid");
  const certTrackColors = ["#E8431F", "#1943B8", "#0F5B42", "#7C1212"];
  const tabGroups = [
    ...certifications.map((g, idx) => ({
      label: `${g.tab} (${g.items.length})`,
      dot: certTrackColors[idx % certTrackColors.length],
      items: g.items,
    })),
    { label: `All (${totalCerts})`, dot: null, items: certifications.flatMap((g) => g.items) },
  ];
  cTabsEl.innerHTML = tabGroups
    .map(
      (t, i) =>
        `<button class="c-tab ${i === 0 ? "active" : ""}" data-i="${i}" type="button">${t.dot ? `<span class="c-tab-dot" style="background:${t.dot};"></span>` : ""}${t.label}</button>`
    )
    .join("");

  function renderCerts() {
    cGridEl.innerHTML = tabGroups[certGroup].items
      .map(
        (c) => `
          <a class="cm-item" href="${c.url}" target="_blank" rel="noreferrer">
            <div>
              <div class="cm-title">${c.title}</div>
              <div class="cm-issuer">${c.issuer}</div>
            </div>
            <span class="cm-go">↗</span>
          </a>`
      )
      .join("");
  }
  cTabsEl.querySelectorAll(".c-tab").forEach((b) => {
    b.addEventListener("click", () => {
      certGroup = Number(b.dataset.i);
      cTabsEl.querySelectorAll(".c-tab").forEach((x) => x.classList.toggle("active", x === b));
      renderCerts();
    });
  });
  renderCerts();

  // Smooth Monograph Scroll-Reveal Choreography
  const revealEls = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }
}
