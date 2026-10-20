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
    setTimeout(() => body.classList.remove("is-gate"), 1600);
    setTimeout(() => body.classList.add("is-in"), 2800);
  }
  if (reduceMotion) {
    gate.classList.add("is-drawn", "is-parted");
    heroArch.classList.add("is-drawn", "is-parted");
    body.classList.add("is-drawing", "is-entering", "is-in");
    body.classList.remove("is-gate");
  } else {
    // Within one visit, coming back to the page opens the doors straight away.
    let seen = false;
    try { seen = sessionStorage.getItem("aa-gate") === "1"; sessionStorage.setItem("aa-gate", "1"); } catch (e) {}
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (seen) { requestAnimationFrame(enter); return; }
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

  /* ---------- The corridor: four rooms, each with a door to walk through ---------- */

  const corridor = $("#tour");
  const scenes = $$(".scene", corridor).map((el) => ({
    el,
    door: $(".doorway", el),
    leaves: $$(".leaf", el),
    seal: $(".scene__seal", el),
    cx: 0,
    cy: 0,
  }));
  const flash = $("#corridorFlash");
  const hint = $("#corridorHint");

  function measureCorridor() {
    scenes.forEach((sc) => {
      sc.cx = sc.door.offsetLeft + sc.door.offsetWidth / 2;
      sc.cy = sc.door.offsetTop + sc.door.offsetHeight / 2;
      sc.el.style.transformOrigin = `${sc.cx}px ${sc.cy}px`;
    });
  }

  function renderCorridor() {
    const r = corridor.getBoundingClientRect();
    const vh = window.innerHeight, vw = window.innerWidth;
    if (r.bottom < -vh || r.top > vh * 2) return;
    const p = clamp(-r.top / (r.height - vh), 0, 1);
    const n = scenes.length;
    const cam = clamp(p / 0.97, 0, 1) * n;

    scenes.forEach((sc, i) => {
      const t = cam - i;
      const arrive = i === 0 ? 1 : smooth((t + 0.07) / 0.09); // the next room appears out of the light
      const turn = smooth((t - 0.36) / 0.24);   // turn toward the door and walk up to it
      const open = smooth((t - 0.6) / 0.2);     // the doors swing open
      const through = smooth((t - 0.8) / 0.2);  // and you step through, into the light
      const leave = i === n - 1 ? 1 : 1 - smooth((t - 0.93) / 0.07);
      const o = Math.min(arrive, leave);

      const tx = (vw / 2 - sc.cx) * turn;
      const ty = (vh / 2 - sc.cy) * turn;
      const s = (1.12 - 0.12 * arrive) * (1 + 0.42 * turn) * (1 + 5 * through);
      // A slight swing of the head as you turn toward the door.
      const dir = sc.el.dataset.door === "left" ? -1 : 1;
      const swing = -dir * 9 * Math.sin(Math.PI * turn);
      sc.el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotateY(${swing.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      sc.el.style.opacity = o.toFixed(3);
      sc.el.classList.toggle("is-live", o > 0.001);
      sc.el.classList.toggle("is-info", t > -0.08 && t < 0.4);
      if (sc.seal && t > -0.08 && !sc.seal.classList.contains("is-drawn")) {
        sc.seal.classList.add("is-drawn");
        setTimeout(() => sc.seal.classList.add("is-parted"), 2600);
      }

      const a = 106 * open;
      sc.leaves[0].style.transform = `rotateY(${(-a).toFixed(2)}deg)`;
      sc.leaves[1].style.transform = `rotateY(${a.toFixed(2)}deg)`;
      sc.leaves.forEach((l) => { l.style.filter = `brightness(${(1 - 0.4 * open).toFixed(3)})`; });

      if (i === n - 1) flash.style.opacity = smooth((t - 0.84) / 0.12).toFixed(3);
    });

    hint.style.opacity = p < 0.02 ? "1" : "0";
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
    if (y > 80 && y > lastY + 4 && !nav.matches(":focus-within")) nav.classList.add("is-hidden");
    else if (y < lastY - 4 || y <= 80) nav.classList.remove("is-hidden");
    lastY = y;
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
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { measureCorridor(); onScroll(); }, 150);
  });
  measureCorridor();
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
