import { isLightTheme, renderMicroGlyph, renderTileArt, resolveTileStyle } from "./tile-art.js";

function renderFoundationCard(f, stats) {
  const variantClass = f.variant ? ` ${f.variant}` : "";

  if (f.type === "focus") {
    return `
      <article class="dna-card${variantClass}">
        <div>
          <div class="dna-kicker"><span>${f.kickerLeft}</span><span>${f.kickerRight}</span></div>
          <div class="focus-list">
            ${f.items
              .map(
                (it) => `
                <div class="focus-row">
                  <div class="spec-label">${it.label}</div>
                  <div class="focus-val">${it.value}</div>
                </div>`
              )
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

export function initUI(data) {
  const { profile, projects, journey, certifications } = data;
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
          <div class="helix-pair reveal" data-era-indices="${eraIndices.join(",")}">
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

  // Copy Email Toast (only used for explicit copy action)
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
