// Aamantran Atelier — the gate, the corridor of doors, the live invitation, the enquiry.

(function () {
  "use strict";

  // Paste the Google Apps Script web app URL here to collect enquiries in a Google Sheet.
  // See tools/enquiry-apps-script.gs for the script and the 5-minute setup.
  const LEAD_ENDPOINT = "";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- The chhatri seal (brand kit: chhatri-line-gold), drawn stroke by stroke ---------- */

  const CHHATRI = `
    <svg class="chhatri" viewBox="0 0 320 520" aria-hidden="true">
      <g transform="translate(160,515)" stroke-width="2.4">
        <image class="a" href="assets/logos/a-emblem-gold.webp" x="-30" y="-122" width="60" height="58"/>
        <path class="door door--l" d="M-48 -44V-150C-48 -200 -14.4 -205 0 -222V-44Z"/>
        <path class="door door--r" d="M48 -44V-150C48 -200 14.4 -205 0 -222V-44Z"/>
        <g class="lines">
          <rect x="-130" y="-28" width="260" height="28"/><rect x="-115" y="-44" width="230" height="16"/>
          <line x1="-100" y1="-44" x2="-100" y2="-230"/><line x1="-107" y1="-44" x2="-107" y2="-230" stroke-width=".96"/>
          <rect x="-112" y="-58" width="24" height="14"/><rect x="-112" y="-232" width="24" height="12"/>
          <line x1="-48" y1="-44" x2="-48" y2="-230"/><line x1="-55" y1="-44" x2="-55" y2="-230" stroke-width=".96"/>
          <rect x="-60" y="-58" width="24" height="14"/><rect x="-60" y="-232" width="24" height="12"/>
          <line x1="48" y1="-44" x2="48" y2="-230"/><line x1="41" y1="-44" x2="41" y2="-230" stroke-width=".96"/>
          <rect x="36" y="-58" width="24" height="14"/><rect x="36" y="-232" width="24" height="12"/>
          <line x1="100" y1="-44" x2="100" y2="-230"/><line x1="93" y1="-44" x2="93" y2="-230" stroke-width=".96"/>
          <rect x="88" y="-58" width="24" height="14"/><rect x="88" y="-232" width="24" height="12"/>
          <path d="M-100 -150C-100 -200 -81.8 -205 -74 -222C-66.2 -205 -48 -200 -48 -150" stroke-width="1.68"/>
          <path d="M-94 -150C-94 -190 -80.5 -196 -74 -210C-67.5 -196 -54 -190 -54 -150" stroke-width=".84"/>
          <path d="M-48 -150C-48 -200 -14.4 -205 0 -222C14.4 -205 48 -200 48 -150" stroke-width="1.68"/>
          <path d="M-42 -150C-42 -190 -12 -196 0 -210C12 -196 42 -190 42 -150" stroke-width=".84"/>
          <path d="M48 -150C48 -200 66.2 -205 74 -222C81.8 -205 100 -200 100 -150" stroke-width="1.68"/>
          <path d="M54 -150C54 -190 67.5 -196 74 -210C80.5 -196 94 -190 94 -150" stroke-width=".84"/>
          <path d="M-118 -232L-150 -262L150 -262L118 -232Z"/><line x1="-150" y1="-270" x2="150" y2="-270"/>
          <rect x="-92" y="-292" width="184" height="22"/>
          <path d="M-92 -292C-100 -380 -40 -420 0 -430C40 -420 100 -380 92 -292"/>
          <path d="M-50.6 -292C-44 -360 -22 -410 0 -430" stroke-width=".84"/>
          <path d="M0 -292C0 -360 0 -410 0 -430" stroke-width=".84"/>
          <path d="M50.6 -292C44 -360 22 -410 0 -430" stroke-width=".84"/>
          <path d="M-22 -428C-14 -444 14 -444 22 -428"/>
          <circle cx="0" cy="-456" r="10"/><circle cx="0" cy="-476" r="6"/><line x1="0" y1="-482" x2="0" y2="-505"/>
        </g>
      </g>
    </svg>`;
  $$("[data-chhatri]").forEach((el) => {
    el.innerHTML = CHHATRI;
    const strokes = $$(".lines > *", el);
    strokes.forEach((s, i) => {
      s.classList.add("ln");
      s.setAttribute("pathLength", "1");
      s.style.setProperty("--d", ((i / strokes.length) * 0.9).toFixed(3)); // from the plinth up to the finial
    });
  });

  // A Mughal cusped arch: lobes around a half-ellipse, meeting in a cusp at the crown.
  function lobedArch(cx, bottom, spring, hw, rise, lobes, close) {
    const pt = (k) => {
      const phi = Math.PI - (k * Math.PI) / lobes;
      return [cx + hw * Math.cos(phi), spring - rise * Math.sin(phi)];
    };
    let d = `M${cx - hw} ${bottom}L${cx - hw} ${spring}`;
    let prev = pt(0);
    for (let k = 1; k <= lobes; k++) {
      const p = pt(k);
      const r = Math.hypot(p[0] - prev[0], p[1] - prev[1]) * 0.62;
      d += `A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
      prev = p;
    }
    d += `L${cx + hw} ${bottom}`;
    return close ? d + "Z" : d;
  }

  /* ---------- The gate ---------- */

  const gate = $("#gate");
  const heroArch = $("#heroArch");
  const timers = [];
  function enter() {
    timers.forEach(clearTimeout);
    gate.classList.add("is-drawn", "is-parted");
    body.classList.add("is-drawing", "is-entering");
    // The hero's seal is engraved as the forecourt comes into view.
    setTimeout(() => heroArch.classList.add("is-drawn"), 1600);
    setTimeout(() => heroArch.classList.add("is-parted"), 4600);
    setTimeout(() => body.classList.remove("is-gate"), 1400);
    setTimeout(() => body.classList.add("is-in"), 2800);
  }
  if (reduceMotion) {
    gate.classList.add("is-drawn", "is-parted");
    heroArch.classList.add("is-drawn", "is-parted");
    body.classList.add("is-drawing", "is-entering", "is-in");
    body.classList.remove("is-gate");
  } else {
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      requestAnimationFrame(() => {
        gate.classList.add("is-drawn");
        body.classList.add("is-drawing");
        timers.push(setTimeout(() => gate.classList.add("is-parted"), 2700));
        timers.push(setTimeout(enter, 3900));
      });
    });
    gate.addEventListener("click", enter);
    window.addEventListener("keydown", (e) => { if (body.classList.contains("is-gate") && (e.key === "Enter" || e.key === " " || e.key === "Escape")) enter(); });
  }

  /* ---------- The corridor: walls of pattern, each arch closed by a pair of doors ---------- */

  const PATTERNS = { // brand-kit tiles: file, tile width, tile height
    dam: ["damask-maroon", 240, 280],
    har: ["harlequin", 240, 220],
    vin: ["vine-green", 195, 225],
    chk: ["checker-bloom", 180, 180],
    lat: ["arch-lattice", 240, 240],
  };
  const WALLS = [
    { p: "dam", door: "#1F3A2E" },
    { p: "har", door: "#5C1A1B" },
    { p: "vin", door: "#5C1A1B" },
    { p: "chk", door: "#5C1A1B" },
    { p: "lat", door: "#1F3A2E" },
  ];
  const K = 2.4;      // how much smaller each arch looks than the one in front of it
  const START = -0.9; // the walk begins just short of the first doors

  const corridor = $("#tour");
  const wallsEl = $("#walls");
  const sanctum = $("#sanctum");
  const captions = $$("#captions .caption");
  const hint = $("#corridorHint");
  let walls = [], vw = 0, builtH = 0;

  const defs = document.createElementNS(NS, "svg");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.style.position = "absolute";
  defs.innerHTML = "<defs>" + Object.entries(PATTERNS).map(([id, [file, w, h]]) =>
    `<pattern id="p-${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"><image href="assets/patterns/${file}.svg" width="${w}" height="${h}"/></pattern>`
  ).join("") + "</defs>";
  wallsEl.appendChild(defs);

  function buildWalls() {
    walls.forEach((w) => w.wrap.remove());
    vw = wallsEl.clientWidth;
    const vh = wallsEl.clientHeight;
    builtH = vh;
    const narrow = vw < 700;
    const hw = narrow ? Math.min(vw * 0.4, vh * 0.21) : Math.min(vw * 0.2, vh * 0.25);
    const rise = hw * 1.2;
    const spring = vh - hw * (narrow ? 1.7 : 1.5);
    const ox = vw / 2, oy = spring;
    const bottom = vh + 2;
    const top = spring - rise * 1.18;
    const big = `M${-vw * 3} ${-vh * 3}H${vw * 4}V${vh * 4}H${-vw * 3}Z`;
    const hole = lobedArch(ox, bottom, spring, hw, rise, 8, true);
    const frame = lobedArch(ox, bottom, spring, hw * 1.13, rise * 1.13, 8);
    sanctum.style.setProperty("--ox", ox + "px");
    sanctum.style.setProperty("--oy", oy + "px");

    // Door faces: inlaid arch, lower panels, the meeting stile and two brass rings.
    const inlay = lobedArch(ox, vh - hw * 0.95, spring + hw * 0.1, hw * 0.8, rise * 0.78, 8);
    const panel = (x) => `<rect x="${x}" y="${vh - hw * 0.8}" width="${hw * 0.62}" height="${hw * 0.55}"/>`;
    const doorFace = (fill) => `
      <path d="${hole}" fill="${fill}"/>
      <g fill="none" stroke="#C9A56B" stroke-width="1.4">
        <path d="${inlay}"/>${panel(ox - hw * 0.76)}${panel(ox + hw * 0.14)}
        <line x1="${ox}" y1="${top}" x2="${ox}" y2="${bottom}" stroke-width="2.4"/>
        <circle cx="${ox - hw * 0.1}" cy="${spring + hw * 0.55}" r="${hw * 0.045}" stroke-width="2"/>
        <circle cx="${ox + hw * 0.1}" cy="${spring + hw * 0.55}" r="${hw * 0.045}" stroke-width="2"/>
      </g>
      <path class="fog" d="${hole}" fill="#140c0a" opacity="0"/>`;

    walls = WALLS.map((w, i) => {
      const wrap = document.createElement("div");
      wrap.className = "wallwrap";
      wrap.style.setProperty("--ox", ox + "px");
      wrap.style.setProperty("--oy", oy + "px");
      wrap.style.zIndex = String(10 - i);

      const wall = document.createElementNS(NS, "svg");
      wall.setAttribute("class", "wall");
      wall.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
      wall.innerHTML = `
        <path d="${big} ${hole}" fill="url(#p-${w.p})" fill-rule="evenodd"/>
        <path d="${frame}" fill="none" stroke="#C9A56B" stroke-width="1.4"/>
        <path d="${hole}" fill="none" stroke="#C9A56B" stroke-width="3"/>
        <path class="fog" d="${big} ${hole}" fill="#140c0a" fill-rule="evenodd" opacity="0"/>`;
      wrap.appendChild(wall);

      const leaves = ["l", "r"].map((side) => {
        const d = document.createElementNS(NS, "svg");
        d.setAttribute("class", `wdoor wdoor--${side}`);
        d.setAttribute("viewBox", `${side === "l" ? ox - hw : ox} ${top} ${hw} ${bottom - top}`);
        d.setAttribute("preserveAspectRatio", "none");
        Object.assign(d.style, { left: (side === "l" ? ox - hw : ox) + "px", top: top + "px", width: hw + "px", height: bottom - top + "px" });
        d.innerHTML = doorFace(w.door);
        wrap.appendChild(d);
        return d;
      });

      wallsEl.appendChild(wrap);
      return { wrap, leaves, fogs: $$(".fog", wrap) };
    });
    renderCorridor();
  }

  function renderCorridor() {
    if (!walls.length) return;
    const r = corridor.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -vh || r.top > vh * 2) return;
    const p = clamp(-r.top / (r.height - vh), 0, 1);
    const n = WALLS.length;
    const cam = START + clamp(p / 0.92, 0, 1) * (n - START);
    const persp = Math.round(vw * 1.1);

    walls.forEach((w, i) => {
      const d = i - cam;
      const s = Math.pow(K, -d);
      const o = d > -0.3 ? 1 : clamp(1 - (-0.3 - d) / 0.55, 0, 1);
      w.wrap.style.transform = `scale(${s.toFixed(4)})`;
      w.wrap.style.opacity = o.toFixed(3);
      w.wrap.style.visibility = o === 0 ? "hidden" : "visible";
      // The doors swing open as you draw near, then you step through.
      const a = reduceMotion ? 110 : 110 * smooth((cam - (i - 0.85)) / 0.6);
      w.leaves[0].style.transform = `perspective(${persp}px) rotateY(${(-a).toFixed(2)}deg)`;
      w.leaves[1].style.transform = `perspective(${persp}px) rotateY(${a.toFixed(2)}deg)`;
      const fog = clamp(d * 0.3, 0, 0.78) + (a / 110) * 0.25 * (d > 0 ? 1 : 0);
      w.fogs.forEach((f) => f.setAttribute("opacity", fog.toFixed(3)));
    });
    sanctum.style.transform = `scale(${Math.pow(K, -(n - cam)).toFixed(4)})`;

    const active = cam > n - 0.45 ? -1 : clamp(Math.floor(cam + 0.9), 0, n - 1);
    captions.forEach((c, i) => c.classList.toggle("is-on", i === active));
    hint.style.opacity = p < 0.03 ? "1" : "0";
  }

  /* ---------- Reveal on scroll ---------- */

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- The live invitation ---------- */

  const stage = $("#stage");
  const fxFlip = $("#fxFlip");
  const fxEngrave = $("#fxEngrave");
  const fxRooms = $("#fxRooms");
  const fxBloom = $("#fxBloom");
  const rooms = $$(".rm", fxRooms);
  const COLS = 8, ROWS = 6;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("span");
      cell.className = "cell";
      // Turn from the centre outward, like a deck being fanned open.
      const dist = Math.hypot((c - (COLS - 1) / 2) / COLS, (r - (ROWS - 1) / 2) / ROWS);
      cell.style.setProperty("--i", (dist * 1.5 + Math.random() * 0.08).toFixed(3));
      fxFlip.appendChild(cell);
    }
  }

  let mode = "flip", stageTimers = [], roomTimer = null;
  const later = (fn, ms) => stageTimers.push(setTimeout(fn, ms));

  function resetStage() {
    stageTimers.forEach(clearTimeout); stageTimers = [];
    clearInterval(roomTimer);
    [fxFlip, fxEngrave, fxRooms, fxBloom].forEach((fx) => fx.classList.remove("is-on", "is-go", "is-drawn", "is-parted", "is-open"));
    rooms.forEach((r) => r.classList.remove("is-on", "is-past"));
    stage.classList.remove("is-writing");
    void stage.offsetWidth;
  }

  function play(next) {
    mode = next;
    resetStage();
    $$(".motion").forEach((b) => {
      const on = b.dataset.play === mode;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", String(on));
    });
    if (reduceMotion) {
      if (mode === "rooms") { fxRooms.classList.add("is-on"); rooms[0].classList.add("is-on"); }
      if (mode === "bloom") fxBloom.classList.add("is-on");
      return;
    }
    if (mode === "flip") {
      fxFlip.classList.add("is-on");
      requestAnimationFrame(() => requestAnimationFrame(() => fxFlip.classList.add("is-go")));
      later(() => stage.classList.add("is-writing"), 900);
      later(() => fxFlip.classList.remove("is-on"), 3000);
    } else if (mode === "engrave") {
      fxEngrave.classList.add("is-on");
      requestAnimationFrame(() => requestAnimationFrame(() => fxEngrave.classList.add("is-drawn")));
      later(() => fxEngrave.classList.add("is-parted"), 2700);
      later(() => fxEngrave.classList.add("is-open"), 3700);
      later(() => stage.classList.add("is-writing"), 4300);
      later(() => fxEngrave.classList.remove("is-on"), 5500);
    } else if (mode === "script") {
      stage.classList.add("is-writing");
    } else if (mode === "rooms") {
      fxRooms.classList.add("is-on");
      let i = 0, prev = -1;
      const show = () => {
        rooms.forEach((r, j) => {
          r.classList.toggle("is-on", j === i);
          r.classList.toggle("is-past", j === prev);
        });
        prev = i; i = (i + 1) % rooms.length;
      };
      requestAnimationFrame(show);
      roomTimer = setInterval(show, 3200);
    } else if (mode === "bloom") {
      fxBloom.classList.add("is-on");
    }
  }

  $$(".motion").forEach((b) => b.addEventListener("click", () => play(b.dataset.play)));
  $("#replay").addEventListener("click", () => play(mode));
  new IntersectionObserver(([en], obs) => {
    if (en.isIntersecting) { play("flip"); obs.disconnect(); }
  }, { threshold: 0.45 }).observe(stage);

  /* ---------- Nav, palace plan, journey line ---------- */

  const nav = $("#nav");
  const plan = $("#plan");
  const planItems = $$("li", plan);
  const toned = $$("[data-tone]");
  const planRooms = planItems.map((li) => document.getElementById(li.dataset.for));
  const steps = $("#steps");
  planItems.forEach((li, i) => {
    li.addEventListener("click", () => planRooms[i].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }));
  });

  const toneAt = (y) => {
    const s = toned.find((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    return s ? s.dataset.tone : "linen";
  };
  const isDark = (t) => t === "dark" || t === "maroon";

  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 30);
    if (y > vh && y > lastY + 4 && !nav.matches(":focus-within")) nav.classList.add("is-hidden");
    else if (y < lastY - 4 || y <= vh) nav.classList.remove("is-hidden");
    lastY = y;
    nav.classList.toggle("is-dark", isDark(toneAt(nav.offsetHeight / 2)));
    plan.classList.toggle("is-dark", isDark(toneAt(vh / 2)));

    let current = 0;
    planRooms.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= vh * 0.5) current = i; });
    planItems.forEach((li, i) => li.classList.toggle("is-on", i === current));

    const sr = steps.getBoundingClientRect();
    steps.style.setProperty("--p", clamp((vh * 0.85 - sr.top) / (sr.height + vh * 0.2), 0, 1).toFixed(3));

    renderCorridor();
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  let resizeTimer, lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Phones resize the viewport as the address bar slides; only rebuild on a real change.
      if (Math.abs(window.innerWidth - lastW) > 40 || Math.abs(wallsEl.clientHeight - builtH) > 120) {
        lastW = window.innerWidth;
        buildWalls();
      }
      onScroll();
    }, 150);
  });
  buildWalls();
  onScroll();

  /* ---------- The enquiry ---------- */

  const form = $("#leadForm");
  const errorEl = $("#formError");
  const submitBtn = $("#submitBtn");

  function fail(msg, field) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    if (field) { field.closest(".field").classList.add("is-invalid"); field.focus(); }
  }
  form.addEventListener("input", (e) => {
    const f = e.target.closest(".field");
    if (f) f.classList.remove("is-invalid");
    errorEl.hidden = true;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const data = new FormData(form);
    if (data.get("website")) return; // a bot filled the hidden field

    const name = (data.get("name") || "").trim();
    const phone = (data.get("phone") || "").trim();
    const email = (data.get("email") || "").trim();
    if (!name) return fail("May we have your name?", form.elements.name);
    if (phone.replace(/\D/g, "").length < 8) return fail("Please add a WhatsApp number we can write to.", form.elements.phone);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email doesn’t look quite right.", form.elements.email);

    if (!LEAD_ENDPOINT) {
      console.warn("Enquiry form is not connected: set LEAD_ENDPOINT in js/site.js.");
      return fail("Our writing room opens shortly — please try again soon.");
    }

    const params = new URLSearchParams({
      submitted_at: new Date().toISOString(),
      name,
      partner: (data.get("partner") || "").trim(),
      phone,
      email,
      wedding_month: data.get("wedding_date") || "",
      city: (data.get("city") || "").trim(),
      interest: data.get("interest") || "",
      functions: data.getAll("functions").join(", "),
      note: (data.get("note") || "").trim(),
      page: location.href,
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Sealing your letter…";
    try {
      // Apps Script sends no CORS headers, so the response is opaque;
      // a network error is the only failure we can see.
      await fetch(LEAD_ENDPOINT, { method: "POST", mode: "no-cors", body: params });
      $("#sealedName").textContent = ", " + name.split(" ")[0];
      form.hidden = true;
      const sealed = $("#sealed");
      sealed.hidden = false;
      sealed.focus({ preventScroll: true });
      sealed.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    } catch (err) {
      fail("Your letter didn’t send. Please check your connection and try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send to the atelier";
    }
  });
})();
