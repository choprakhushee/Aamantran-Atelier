// Aamantran Atelier — the gate, the corridor of doors, the live invitation, the enquiry.

(function () {
  "use strict";

  // Paste the Google Apps Script web app URL here to collect enquiries in a Google Sheet.
  // See tools/enquiry-apps-script.gs for the script and the 5-minute setup.
  const LEAD_ENDPOINT = "";
  const CONTACT_EMAIL = "aamantranatelier@gmail.com";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const NS = "http://www.w3.org/2000/svg";
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // The live motion demo is kept in a <template>; bring it into the page now so the rest of the
  // script can find it. The gallery hangs it in its painting once the wall is built.
  const liveStage = document.importNode($("#liveStage").content, true).querySelector(".stage");
  liveStage.hidden = true;
  $("#galleryWall").appendChild(liveStage);

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
  const gateBg = $("#gateBg");
  const gateDoor = $("#gateDoor");
  const gateScene = $("#gateScene");
  const timers = [];
  // Where the doors sit in the entrance painting (1672 x 941).
  const ART = { w: 1672, h: 941, x: 645, y: 151, dw: 356, dh: 596 };

  function placeGate() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.max(vw / ART.w, vh / ART.h); // object-fit: cover
    const ox = (vw - ART.w * s) / 2, oy = (vh - ART.h * s) / 2;
    const x = ox + ART.x * s, y = oy + ART.y * s, w = ART.dw * s, h = ART.dh * s;
    Object.assign(gateDoor.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
    gateScene.style.setProperty("--gx", x + w / 2 + "px");
    gateScene.style.setProperty("--gy", y + h * 0.55 + "px");
  }
  placeGate();
  window.addEventListener("resize", placeGate);

  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    timers.forEach(clearTimeout);
    body.classList.add("is-entering");                         // the doors swing open
    setTimeout(() => body.classList.add("is-walking"), 1300);  // and you walk through
    setTimeout(() => body.classList.remove("is-gate"), 2000);
    setTimeout(() => body.classList.add("is-in"), 3600);
  }
  if (reduceMotion) {
    body.classList.add("is-entering", "is-in");
    body.classList.remove("is-gate");
  } else {
    // Within one visit, coming back to the page opens the doors straight away.
    let seen = false;
    try { seen = sessionStorage.getItem("aa-gate") === "1"; sessionStorage.setItem("aa-gate", "1"); } catch (e) {}
    const ready = Promise.race([
      gateBg.decode ? gateBg.decode().catch(() => {}) : Promise.resolve(),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    ready.then(() => { timers.push(setTimeout(enter, seen ? 100 : 1300)); });
    timers.push(setTimeout(enter, 5000)); // never hold the page hostage
    gate.addEventListener("click", enter);
    ["wheel", "touchmove"].forEach((ev) => window.addEventListener(ev, () => { if (body.classList.contains("is-gate")) enter(); }, { passive: true, once: true }));
    window.addEventListener("keydown", (e) => { if (body.classList.contains("is-gate") && (e.key === "Enter" || e.key === " " || e.key === "Escape")) enter(); });
  }

  /* ---------- The corridor: four rooms, each with a door to walk through ---------- */

  // Petals drifting down, and gold dust rising in the lantern light.
  const PETALS = {
    jasmine: { n: 14, colours: ["#fbf7ee"], cls: "petal petal--jasmine", w: [8, 12] },
    garden: { n: 26, colours: ["#7a1f26", "#9e5a5c", "#c9a56b", "#e2a33a", "#7a1f26"], cls: "petal", w: [10, 17] },
    rose: { n: 18, colours: ["#7a1f26", "#9e5a5c", "#7a1f26"], cls: "petal", w: [11, 16] },
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  if (!reduceMotion) {
    $$("[data-petals]").forEach((el) => {
      const cfg = PETALS[el.dataset.petals];
      for (let k = 0; k < cfg.n; k++) {
        const p = document.createElement("i");
        p.className = cfg.cls;
        p.style.cssText = `left:${rand(-5, 100).toFixed(1)}%;--w:${rand(...cfg.w).toFixed(1)}px;--c:${cfg.colours[k % cfg.colours.length]};--d:${rand(10, 18).toFixed(1)}s;--delay:${rand(-18, 0).toFixed(1)}s;--x:${rand(-90, 120).toFixed(0)}px`;
        el.appendChild(p);
      }
    });
    $$("[data-motes]").forEach((el) => {
      for (let k = 0; k < 34; k++) {
        const m = document.createElement("i");
        m.className = "mote";
        m.style.cssText = `left:${rand(0, 100).toFixed(1)}%;--w:${rand(1.5, 4).toFixed(1)}px;--d:${rand(12, 22).toFixed(1)}s;--delay:${rand(-22, 0).toFixed(1)}s;--x:${rand(-60, 60).toFixed(0)}px`;
        el.appendChild(m);
      }
    });
  }

  // The paraat: a shallow brass platter of water with marigolds, roses and jasmine turning on it.
  const flower = (x, y, kind, r) => {
    if (kind === "marigold") {
      const ring = (n, rr, c) => Array.from({ length: n }, (_, k) => {
        const a = (k / n) * Math.PI * 2;
        return `<circle cx="${(x + Math.cos(a) * rr).toFixed(1)}" cy="${(y + Math.sin(a) * rr).toFixed(1)}" r="${(r * 0.42).toFixed(1)}" fill="${c}"/>`;
      }).join("");
      return `<g class="bob">${ring(12, r * 0.78, "#d9831e")}${ring(9, r * 0.5, "#e9a531")}<circle cx="${x}" cy="${y}" r="${r * 0.36}" fill="#f2bf4a"/></g>`;
    }
    if (kind === "rose") {
      const pet = (a, rr, c) => `<ellipse cx="${(x + Math.cos(a) * rr).toFixed(1)}" cy="${(y + Math.sin(a) * rr).toFixed(1)}" rx="${(r * 0.55).toFixed(1)}" ry="${(r * 0.4).toFixed(1)}" transform="rotate(${(a * 57.3).toFixed(0)} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)})" fill="${c}"/>`;
      return `<g class="bob">${[0, 1.26, 2.51, 3.77, 5.03].map((a) => pet(a, r * 0.55, "#7a1f26")).join("")}${[0.6, 2.7, 4.6].map((a) => pet(a, r * 0.25, "#9b2f37")).join("")}<circle cx="${x}" cy="${y}" r="${r * 0.2}" fill="#c9a56b"/></g>`;
    }
    return `<g class="bob">${[0, 1.26, 2.51, 3.77, 5.03].map((a) => `<ellipse cx="${(x + Math.cos(a) * r * 0.5).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.5).toFixed(1)}" rx="${(r * 0.5).toFixed(1)}" ry="${(r * 0.26).toFixed(1)}" transform="rotate(${(a * 57.3).toFixed(0)} ${(x + Math.cos(a) * r * 0.5).toFixed(1)} ${(y + Math.sin(a) * r * 0.5).toFixed(1)})" fill="#fbf7ee"/>`).join("")}<circle cx="${x}" cy="${y}" r="${r * 0.16}" fill="#e9c46a"/></g>`;
  };
  const kinds = ["marigold", "rose", "jasmine", "marigold", "rose", "marigold", "jasmine", "rose", "marigold", "jasmine", "marigold", "rose"];
  const flowers = kinds.map((k, i) => {
    const a = i * 2.39996, d = 40 + 150 * Math.sqrt((i + 0.5) / kinds.length); // spread evenly over the water
    return flower(Math.cos(a) * d, Math.sin(a) * d, k, k === "jasmine" ? 15 : 22);
  }).join("");
  const loose = Array.from({ length: 18 }, (_, i) => {
    const a = i * 1.7, d = 60 + (i * 37) % 150;
    return `<ellipse cx="${(Math.cos(a) * d).toFixed(0)}" cy="${(Math.sin(a) * d).toFixed(0)}" rx="7" ry="4.5" transform="rotate(${i * 40} ${(Math.cos(a) * d).toFixed(0)} ${(Math.sin(a) * d).toFixed(0)})" fill="${i % 3 ? "#7a1f26" : "#e2a33a"}" opacity=".9"/>`;
  }).join("");
  const PARAAT = `<svg viewBox="-310 -20 620 250" aria-hidden="true">
    <defs>
      <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5a26"/><stop offset=".25" stop-color="#e6c37c"/><stop offset=".5" stop-color="#c9a56b"/><stop offset=".78" stop-color="#f1d9a0"/><stop offset="1" stop-color="#6e4f1f"/></linearGradient>
      <linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b26e"/><stop offset="1" stop-color="#6e4f1f"/></linearGradient>
      <radialGradient id="water" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#4b3a24"/><stop offset=".7" stop-color="#2c2216"/><stop offset="1" stop-color="#1b140c"/></radialGradient>
      <clipPath id="pool"><ellipse cx="0" cy="96" rx="250" ry="76"/></clipPath>
    </defs>
    <path d="M-300 100 A300 92 0 0 0 300 100 L300 124 A300 92 0 0 1 -300 124Z" fill="url(#band)"/>
    <ellipse cx="0" cy="100" rx="300" ry="92" fill="url(#brass)"/>
    <ellipse cx="0" cy="100" rx="300" ry="92" fill="none" stroke="#5c421a" stroke-width="1.5"/>
    <g fill="#7a5a26">${Array.from({ length: 40 }, (_, k) => { const a = (k / 40) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 280).toFixed(1)}" cy="${(100 + Math.sin(a) * 85).toFixed(1)}" r="2.2"/>`; }).join("")}</g>
    <ellipse cx="0" cy="98" rx="262" ry="80" fill="#8a6a30"/>
    <ellipse cx="0" cy="96" rx="250" ry="76" fill="url(#water)"/>
    <g clip-path="url(#pool)">
      <ellipse cx="-60" cy="70" rx="140" ry="14" fill="rgba(255,226,160,.16)"/>
      <g transform="translate(0 96) scale(1 .3)"><g class="swirl">${loose}${flowers}</g></g>
    </g>
  </svg>`;
  $$("[data-paraat]").forEach((el) => { el.innerHTML = PARAAT; });

  // Panelled plaster: mottled ground, a cornice, gilded mouldings and a dado rail.
  function wallTile({ base, mottle, lower = true, panels = true }) {
    const frame = (x, y, w, h) => `
      <rect x="${x + 2}" y="${y + 3}" width="${w}" height="${h}" fill="none" stroke="rgba(20,8,6,.35)" stroke-width="7"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="url(#g)" stroke-width="7"/>
      <rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" fill="none" stroke="url(#g)" stroke-width="2"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="1000" viewBox="0 0 400 1000">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d9a4"/><stop offset=".45" stop-color="#c9a56b"/><stop offset="1" stop-color="#8f6c35"/></linearGradient>
        <filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".011 .018" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 ${mottle[0]} 0 0 0 0 ${mottle[1]} 0 0 0 0 ${mottle[2]} 0 0 0 1.1 -.48"/></filter>
      </defs>
      <rect width="400" height="1000" fill="${base}"/>
      <rect width="400" height="1000" filter="url(#n)"/>
      <rect width="400" height="40" fill="rgba(255,248,235,.22)"/>
      <g fill="url(#g)">${Array.from({ length: 20 }, (_, k) => `<rect x="${k * 20 + 4}" y="12" width="11" height="14"/>`).join("")}</g>
      <rect y="40" width="400" height="5" fill="url(#g)"/><rect y="49" width="400" height="2" fill="url(#g)"/>
      ${panels ? frame(42, 110, 316, lower ? 500 : 520) : ""}
      ${panels ? `<g fill="url(#g)"><path d="M200 92l12 14-12 14-12-14z"/><circle cx="200" cy="106" r="4" fill="${base}"/></g>` : ""}
      ${lower ? `<rect y="660" width="400" height="6" fill="url(#g)"/><rect y="672" width="400" height="2" fill="url(#g)"/>` : ""}
      ${lower && panels ? frame(42, 712, 316, 240) : ""}
    </svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  const WALLS = {
    blush: wallTile({ base: "#e2c6bb", mottle: [0.72, 0.52, 0.48] }),
    lacquer: wallTile({ base: "#5c1a1b", mottle: [0.22, 0.05, 0.06], lower: false }),
    green: wallTile({ base: "#1f3a2e", mottle: [0.07, 0.16, 0.12] }),
    mural: wallTile({ base: "#ece1cf", mottle: [0.82, 0.74, 0.62], lower: false, panels: false }),
  };
  // Through each doorway you glimpse the wall of the room you're about to enter.
  const glow = "radial-gradient(ellipse at 50% 35%, rgba(255, 238, 205, .38), rgba(255, 238, 205, 0) 65%)";
  const VIEWS = {
    lacquer: `${glow}, ${WALLS.lacquer} 50% 84% / auto 84% repeat-x, #561819`,
    mural: `${glow}, url("assets/motifs/bloom-stem.svg") 8% 84% / auto 24% no-repeat, url("assets/motifs/bloom-stem.svg") 92% 84% / auto 30% no-repeat, url("assets/motifs/arch-green.svg") 50% 38% / auto 50% no-repeat, ${WALLS.mural} 50% 84% / auto 84% repeat-x, #ece1cf`,
    green: `${glow}, ${WALLS.green} 50% 84% / auto 84% repeat-x, #1d3529`,
    darbar: `radial-gradient(ellipse at 50% 60%, #35594a, #1F3A2E 72%)`,
  };
  const sceneEls = $$(".scene");
  sceneEls.forEach((sc, i) => {
    const next = sceneEls[i + 1] ? (sceneEls[i + 1].className.match(/scene--(\w+)/) || [])[1] : "darbar";
    const view = $(".doorway__view", sc);
    if (!view) return;
    if (view && VIEWS[next]) view.style.background = VIEWS[next];
  });
  // The plaster itself: a small mottled tile under each wall's layout.
  function plaster(base, m) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".011 .018" numOctaves="4" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${m[0]} 0 0 0 0 ${m[1]} 0 0 0 0 ${m[2]} 0 0 0 1.1 -.48"/></filter><rect width="400" height="400" fill="${base}"/><rect width="400" height="400" filter="url(#n)"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  const PLASTER = {
    blush: plaster("#e2c6bb", [0.72, 0.52, 0.48]),
    lacquer: plaster("#5c1a1b", [0.22, 0.05, 0.06]),
    green: plaster("#1f3a2e", [0.07, 0.16, 0.12]),
    mural: plaster("#ece1cf", [0.82, 0.74, 0.62]),
  };
  const FEATURE = { blush: "#dcbcb0", lacquer: "#4a1415", green: "#172c22", mural: "#f4ece0" };

  // Lay each wall out in bays: the inscription takes the centre bay, the door sits a whole
  // number of bays away, every other bay is panelled, and the lantern hangs on the axis between.
  function layoutWalls() {
    $$(".scene").forEach((scene) => {
      const kind = (scene.className.match(/scene--(\w+)/) || [])[1];
      const wall = $(".scene__wall", scene), door = $(".doorway", scene);
      if (!wall || !door) return;
      const ins = $(".inscription", scene), lantern = $(".scene__lantern", scene);
      const vw = scene.offsetWidth;
      const wx = wall.offsetLeft, wy = wall.offsetTop, W = wall.offsetWidth, H = wall.offsetHeight;
      const yb = wy + H;                                       // where wall meets floor (scene coords)
      const dcx = door.offsetLeft + door.offsetWidth / 2;
      const dist = Math.abs(dcx - vw / 2), side = Math.sign(dcx - vw / 2);
      const narrow = vw < 760;
      const k = Math.max(1, Math.round(dist / (narrow ? 700 : 580)));
      const P = dist / k;                                      // bay pitch
      const g = Math.min(34, P * 0.07);                        // gap between panel and bay edge
      const top = 74, yd = yb - Math.max(150, (yb - top) * 0.27); // upper panels and the dado rail
      const X = (x) => (x - wx).toFixed(1), Y = (y) => (y - wy).toFixed(1);
      const doorIndex = side * k;
      const frame = (x0, y0, w, h, fill, rich) => `
        ${fill ? `<rect x="${X(x0)}" y="${Y(y0)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}"/>` : ""}
        <rect x="${X(x0 + 2)}" y="${Y(y0 + 3)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="rgba(20,8,6,.32)" stroke-width="7"/>
        <rect x="${X(x0)}" y="${Y(y0)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="url(#gilt)" stroke-width="${rich ? 9 : 6}"/>
        <rect x="${X(x0 + 15)}" y="${Y(y0 + 15)}" width="${(w - 30).toFixed(1)}" height="${(h - 30).toFixed(1)}" fill="none" stroke="url(#gilt)" stroke-width="${rich ? 2.4 : 1.6}"/>
        ${rich ? `<rect x="${X(x0 + 22)}" y="${Y(y0 + 22)}" width="${(w - 44).toFixed(1)}" height="${(h - 44).toFixed(1)}" fill="none" stroke="url(#gilt)" stroke-width="1"/>` : ""}`;
      const crest = (cx, y, big) => `<g fill="url(#gilt)"><path d="M${X(cx)} ${Y(y - (big ? 16 : 11))}l${big ? 15 : 10} ${big ? 16 : 11}-${big ? 15 : 10} ${big ? 16 : 11}-${big ? 15 : 10}-${big ? 16 : 11}z"/></g>${big ? `<path d="M${X(cx - 70)} ${Y(y)}H${X(cx - 22)}M${X(cx + 22)} ${Y(y)}H${X(cx + 70)}" stroke="url(#gilt)" stroke-width="2"/>` : ""}`;
      let out = "";
      const jMin = Math.floor((wx - vw / 2) / P) - 1, jMax = Math.ceil((wx + W - vw / 2) / P) + 1;
      for (let j = jMin; j <= jMax; j++) {
        if (j === doorIndex) continue;                         // the door's bay is left plain around its arch
        const cx = vw / 2 + j * P, x0 = cx - P / 2 + g, w = P - 2 * g;
        const feature = j === 0;
        if (kind === "mural") {
          if (feature) continue;
          const nh = (yd - top) * 0.82, nw = Math.min(w * 0.7, nh * 0.8);
          out += `<image href="assets/motifs/arch-green.svg" x="${X(cx - nw / 2)}" y="${Y(top + 20)}" width="${nw.toFixed(1)}" height="${nh.toFixed(1)}" preserveAspectRatio="none"/>`;
          continue;
        }
        out += frame(x0, top, w, yd - 26 - top, feature ? FEATURE[kind] : null, feature);
        out += crest(cx, top - 6, feature);
        if (kind !== "lacquer") out += frame(x0, yd + 24, w, yb - 24 - (yd + 24), null, false);
      }
      // the inscription's own bay
      const fx0 = vw / 2 - P / 2 + g, fw = P - 2 * g;
      if (kind === "mural") out += frame(fx0, top + 20, fw, yd - top - 10, FEATURE.mural, true) + crest(vw / 2, top + 6, true);
      // lotus plants along the garden wall's base, two to a bay, mirrored about each bay's axis
      if (kind === "mural") {
        for (let j = jMin; j <= jMax; j++) {
          const cx = vw / 2 + j * P;
          [-0.3, 0.3].forEach((o, n) => {
            const h = (yb - yd) * (n ? 1.15 : 0.95), w2 = h * 0.79;
            out += `<image href="assets/motifs/bloom-stem.svg" x="${X(cx + o * P - w2 / 2)}" y="${Y(yb - h)}" width="${w2.toFixed(1)}" height="${h.toFixed(1)}"/>`;
          });
        }
      }
      // the harlequin dado under the lacquer panels
      if (kind === "lacquer") out += `<rect x="0" y="${Y(yd)}" width="${W}" height="${(yb - yd).toFixed(1)}" fill="url(#harl)"/><rect x="0" y="${Y(yd)}" width="${W}" height="${(yb - yd).toFixed(1)}" fill="url(#dadoShade)"/>`;
      // cornice and dado rail run unbroken across the wall
      const cornice = `<rect x="0" y="${Y(0)}" width="${W}" height="40" fill="rgba(255,248,235,.18)"/><rect x="0" y="${Y(14)}" width="${W}" height="14" fill="url(#dentil)"/><rect x="0" y="${Y(40)}" width="${W}" height="5" fill="url(#gilt)"/><rect x="0" y="${Y(49)}" width="${W}" height="2" fill="url(#gilt)"/>`;
      const rail = kind === "mural" ? "" : `<rect x="0" y="${Y(yd - 4)}" width="${W}" height="7" fill="url(#gilt)"/><rect x="0" y="${Y(yd + 8)}" width="${W}" height="2" fill="url(#gilt)"/>`;
      // a crest above the door's arch, on its axis
      const doorCx = vw / 2 + doorIndex * P, doorTop = yb - door.offsetHeight * 1.08;
      const doorCrest = crest(doorCx, doorTop - 22, true);
      wall.style.backgroundImage = PLASTER[kind];
      wall.style.backgroundPosition = `${-wx}px ${-wy}px`;
      wall.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="gilt-${kind}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d9a4"/><stop offset=".45" stop-color="#c9a56b"/><stop offset="1" stop-color="#8f6c35"/></linearGradient>
          <pattern id="dentil-${kind}" width="22" height="14" patternUnits="userSpaceOnUse"><rect x="4" width="12" height="14" fill="#c9a56b"/></pattern>
          <pattern id="harl-${kind}" width="120" height="110" patternUnits="userSpaceOnUse" x="${X(vw / 2 - 60)}" y="${Y(yd)}"><image href="assets/patterns/harlequin.svg" width="120" height="110"/></pattern>
          <linearGradient id="dadoShade-${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(20,8,6,.4)"/><stop offset=".12" stop-color="rgba(20,8,6,0)"/></linearGradient>
        </defs>
        ${(out + cornice + rail + doorCrest).replace(/url\(#(gilt|dentil|harl|dadoShade)\)/g, `url(#$1-${kind})`)}
      </svg>`;
      // the words sit centred in their panel; the lantern hangs between the two bays
      const panelH = kind === "mural" ? yd - top - 10 : yd - 26 - top;
      const panelY = kind === "mural" ? top + 20 : top;
      ins.style.setProperty("--iy", panelY + panelH / 2 + "px");
      ins.style.setProperty("--iw", Math.min(fw - 60, 640) + "px");
      lantern.style.setProperty("--lx", vw / 2 + side * (k === 1 ? P / 2 : P * Math.floor(k / 2) + (k % 2 ? P / 2 : 0)) + "px");
      lantern.style.setProperty("--ly", "51px");
    });
  }
  layoutWalls();

  const corridor = $("#tour");
  const scenes = $$(".scene", corridor).map((el) => ({
    el,
    painted: el.classList.contains("scene--painted"),
    room: $(".proom", el),
    W: +el.dataset.w || 0,
    H: +el.dataset.h || 0,
    doorRect: (el.dataset.door || "").split(",").map(Number),
    keys: (el.dataset.keys || "").split(";").filter(Boolean).map((k) => k.split(",").map(Number)),
    door: $(".doorway", el) || $(".proom__door", el),
    leaves: $$(".leaf", el),
    seal: $(".scene__seal", el),
    cx: 0,
    cy: 0,
  }));
  const flash = $("#corridorFlash");
  const hint = $("#corridorHint");
  const finale = $("#darbarFinale");

  // Painted rooms: place the doorway, its view and the leaves in the painting's own pixels.
  scenes.filter((sc) => sc.painted).forEach((sc) => {
    const [x, y, w, h] = sc.doorRect;
    [$(".proom__door", sc.el), $(".proom__view", sc.el)].forEach((el) => Object.assign(el.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" }));
  });

  // The camera in a painted room: arrive, look along the wall at each inscription in turn,
  // turn to the door and walk up to it; the doors open and you step through.
  function renderPainted(sc, t, vw, vh, arrive, open, through) {
    const [dx, dy, dw, dh] = sc.doorRect;
    const s0 = Math.max(vw / sc.W, vh / sc.H);                // the painting covers the screen
    const door = [dx + dw / 2, dy + dh * 0.52];
    const pts = [...sc.keys, door];
    const a = clamp((t - 0.02) / 0.6, 0, 1) * (pts.length - 1);
    const k = Math.min(Math.floor(a), pts.length - 2), f = smooth(a - k);
    const fx = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f;
    const fy = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f;
    const zd = Math.max(1, Math.min(2.2, (0.82 * vh) / (dh * s0)));
    const near = k === pts.length - 2 ? f : 0;                // zoom in only on the way to the door
    const z = (1.1 - 0.1 * arrive) * (1 + (zd - 1) * near) * (1 + 3 * through);
    const S = s0 * z;
    let tx = vw / 2 - fx * S, ty = vh / 2 - fy * S;
    if (through < 0.001) {                                    // keep the painting filling the screen
      tx = clamp(tx, vw - sc.W * S, 0);
      ty = clamp(ty, vh - sc.H * S, 0);
    }
    sc.room.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${S.toFixed(4)})`;
    sc.el.style.transform = "";
  }

  function measureCorridor() {
    scenes.filter((sc) => !sc.painted).forEach((sc) => {
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
    // The walk finishes one screen early; the Darbar then rises over the last (green) doorway.
    const pEnd = 1 - 1.3 * vh / (r.height - vh); // then hold for the Darbar
    const cam = clamp(p / pEnd, 0, 1) * n;

    scenes.forEach((sc, i) => {
      const t = cam - i;
      const arrive = i === 0 ? 1 : smooth((t + 0.14) / 0.1); // the next room appears out of the doorway
      const turn = smooth((t - 0.2) / 0.34);    // pan along the wall until the door is in front of you
      const near = smooth((t - 0.5) / 0.14);    // walk up to it
      const open = smooth((t - 0.62) / 0.18);   // the doors swing open
      const through = smooth((t - 0.78) / 0.22); // and you step through, into the next room
      const leave = i === n - 1 ? 1 : 1 - smooth((t - 0.97) / 0.03);
      const o = Math.min(arrive, leave);

      if (sc.painted) {
        renderPainted(sc, t, vw, vh, arrive, open, through);
      } else {
      const tx = (vw / 2 - sc.cx) * turn;
      const ty = (vh / 2 - sc.cy) * 0.55 * turn;
      const s = (1.12 - 0.12 * arrive) * (1 + 0.3 * near) * (1 + 3 * through);
      // A slight swing of the head as you turn toward the door.
      const dir = sc.el.dataset.door === "left" ? -1 : 1;
      const swing = -dir * 9 * Math.sin(Math.PI * turn);
      sc.el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotateY(${swing.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      }
      sc.el.style.opacity = o.toFixed(3);
      sc.el.classList.toggle("is-live", o > 0.001);
      if (t > -0.08) sc.el.classList.add("is-info"); // the words stay on the wall once they appear
      if (sc.seal && t > -0.08 && !sc.seal.classList.contains("is-drawn")) {
        sc.seal.classList.add("is-drawn");
        setTimeout(() => sc.seal.classList.add("is-parted"), 2600);
      }

      const a = 106 * open;
      sc.leaves[0].style.transform = `rotateY(${(-a).toFixed(2)}deg)`;
      sc.leaves[1].style.transform = `rotateY(${a.toFixed(2)}deg)`;
      sc.leaves.forEach((l) => { l.style.filter = `brightness(${(1 - 0.4 * open).toFixed(3)})`; });

      // The last doorway fills the screen with green just as the Darbar (the same green) scrolls in.
      if (i === n - 1) flash.style.opacity = smooth((t - 0.84) / 0.16).toFixed(3);
    });

    hint.style.opacity = p < 0.02 ? "1" : "0";
    finale.classList.toggle("is-arrived", cam >= n - 0.01);
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

  /* ---------- The gallery wall ---------- */

  const track = $("#galleryTrack");
  const viewer = $("#viewer");
  const viewerScreen = $("#viewerScreen");
  const motionsEl = $("#motions");
  const siteLink = $("#viewerSite");
  const LIVE = { id: "palace-parlour", title: "Watch an invitation open", style: "Palace Parlour", package: "Ready design", sample: true, frame: "carved", live: true };
  let liveHome = null, current = null, lastFocus = null;

  const visibleIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const li = en.target, v = $("video", li);
      li.classList.toggle("is-visible", en.isIntersecting);
      if (!v || reduceMotion) return;
      if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.35 });

  function hang(p) {
    const li = document.createElement("li");
    li.className = "hang";
    const el = document.createElement(p.live ? "div" : "button");
    if (p.live) { el.setAttribute("role", "button"); el.tabIndex = 0; } else el.type = "button";
    el.className = `painting painting--${p.frame || "brass"}`;
    el.setAttribute("aria-label", `${p.title}: ${p.style}, ${p.package}${p.sample ? ", sample" : ""}. Open it in a phone preview.`);
    el.innerHTML = '<span class="painting__frame"><span class="painting__mat"><span class="painting__art"></span></span></span>';
    const art = $(".painting__art", el);
    if (p.live) {
      art.appendChild(liveStage);
      liveStage.hidden = false;
      liveHome = art;
    } else {
      if (p.poster) art.innerHTML = `<img src="${esc(p.poster)}" alt="" loading="lazy" decoding="async">`;
      if (p.video) {
        const v = document.createElement("video");
        Object.assign(v, { muted: true, loop: true, playsInline: true, preload: "none" });
        v.dataset.src = p.video;
        if (p.poster) v.poster = p.poster;
        art.appendChild(v);
      }
    }
    li.appendChild(el);
    li.insertAdjacentHTML("beforeend", `<p class="plaque"><b>${esc(p.title)}</b><span>${esc(p.style)} · ${esc(p.package)}${p.sample ? " · Sample" : ""}</span></p>`);
    el.addEventListener("click", (e) => { if (!e.target.closest(".stage__replay")) openViewer(p, li); });
    el.addEventListener("keydown", (e) => { if (p.live && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openViewer(p, li); } });
    li.addEventListener("mouseenter", () => { const v = $("video", li); if (v && !reduceMotion) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } });
    visibleIO.observe(li);
    return li;
  }

  function buildWall(list) {
    track.innerHTML = "";
    (list.some((p) => p.live) ? list : [LIVE, ...list]).forEach((p) => track.appendChild(hang(p)));
  }
  buildWall([LIVE]);
  fetch("assets/gallery.json", { cache: "no-cache" })
    .then((r) => r.json())
    .then((d) => { wallData = d.paintings || []; buildWall(wallData); })
    .catch((err) => console.warn("Could not load the gallery; showing the live invitation only.", err));

  function fitIframe() {
    const f = $("iframe", viewerScreen);
    if (!f) return;
    const sc = viewerScreen.clientWidth / 390;
    f.style.setProperty("--s", sc.toFixed(4));
    f.style.height = viewerScreen.clientHeight / sc + "px";
  }

  function showViewer(p) {
    viewerScreen.innerHTML = "";
    // the poster shows while a website or video loads
    viewerScreen.style.background = p.poster ? `#fff url("${p.poster}") center / cover` : "";
    motionsEl.hidden = !p.live;
    if (p.live) { viewerScreen.appendChild(liveStage); play("flip"); }
    else if (p.video) viewerScreen.innerHTML = `<video src="${esc(p.video)}" ${p.poster ? `poster="${esc(p.poster)}"` : ""} autoplay muted loop playsinline></video>`;
    else if (p.website) { viewerScreen.innerHTML = `<iframe src="${esc(p.website)}" title="${esc(p.title)} wedding website"></iframe>`; requestAnimationFrame(fitIframe); }
    else if (p.poster) viewerScreen.innerHTML = `<img src="${esc(p.poster)}" alt="${esc(p.title)} invitation">`;
    $("#viewerMeta").textContent = `${p.style} · ${p.package}${p.sample ? " · Sample" : ""}`;
    $("#viewerTitle").textContent = p.title;
    siteLink.hidden = !p.website;
    if (p.website) siteLink.href = p.website;
    viewer.hidden = false;
    viewer.classList.add("is-open");
    body.style.overflow = "hidden";
    $(".viewer__close").focus({ preventScroll: true });
  }

  function openViewer(p, li) {
    current = { p, li };
    lastFocus = document.activeElement;
    if (reduceMotion) { showViewer(p); return; }
    // The camera moves in toward the painting, then the invitation opens in a phone.
    const r = li.getBoundingClientRect(), t = track.getBoundingClientRect();
    track.style.transformOrigin = `${r.left + r.width / 2 - t.left}px ${r.top + r.height / 2 - t.top}px`;
    const k = Math.min((window.innerHeight * 0.9) / r.height, 3);
    track.style.setProperty("--zoom", `translate(${(window.innerWidth / 2 - (r.left + r.width / 2)).toFixed(0)}px, ${(window.innerHeight / 2 - (r.top + r.height / 2)).toFixed(0)}px) scale(${k.toFixed(2)})`);
    track.classList.add("is-zooming");
    setTimeout(() => showViewer(p), 650);
  }

  function closeViewer() {
    if (!current) return;
    if (current.p.live && liveHome) liveHome.appendChild(liveStage);
    viewerScreen.innerHTML = "";
    viewer.hidden = true;
    viewer.classList.remove("is-open");
    body.style.overflow = "";
    if (!reduceMotion && track.classList.contains("is-zooming")) {
      requestAnimationFrame(() => track.classList.remove("is-zooming")); // and the camera steps back
    }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    const was = current; current = null;
    return was;
  }

  let wallData = [];
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open-painting]");
    if (!b) return;
    const p = wallData.find((x) => x.id === b.dataset.openPainting);
    if (p) { current = { p, li: b }; lastFocus = b; showViewer(p); }
  });
  $$("[data-close]", viewer).forEach((b) => b.addEventListener("click", closeViewer));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && current) closeViewer(); });
  window.addEventListener("resize", fitIframe);
  $("#viewerLike").addEventListener("click", () => {
    const was = closeViewer();
    if (!was) return;
    const p = was.p;
    $("#f-design").value = `${p.title} (${p.style})`;
    const want = p.package === "Couture" ? "Couture" : "Signature";
    const radio = $(`input[name="interest"][value="${want}"]`);
    if (radio) radio.checked = true;
    $("#enquire").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion ? 0 : 900);
  });

  // Desktop: the paintings drift at slightly different depths as you scroll.
  // Phones: a swipe along the wall, the painting in front turned to face you.
  const SPEEDS = [0.05, -0.035, 0.07, -0.02];
  function renderWall() {
    const vh = window.innerHeight;
    const hangs = $$(".hang", track);
    if (window.innerWidth > 860) {
      if (reduceMotion) return;
      hangs.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        li.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * SPEEDS[i % 4]).toFixed(1) + "px");
      });
    } else {
      const t = track.getBoundingClientRect(), mid = t.left + t.width / 2;
      hangs.forEach((li) => {
        const r = li.getBoundingClientRect();
        const off = clamp((r.left + r.width / 2 - mid) / t.width, -1, 1);
        li.style.setProperty("--tilt", (reduceMotion ? 0 : -off * 28).toFixed(2) + "deg");
        li.style.setProperty("--sc", (1 - Math.abs(off) * 0.12).toFixed(3));
      });
    }
  }
  track.addEventListener("scroll", () => requestAnimationFrame(renderWall), { passive: true });

  /* ---------- Personal: their own names, if they arrive with them ---------- */
  // A link such as ?for=Riya&with=Arjun greets them by name, writes their names into the live
  // invitation and fills in the enquiry form. Handy when you send the site to a couple.
  (function personalise() {
    const q = new URLSearchParams(location.search);
    const a = (q.get("for") || "").trim().slice(0, 24), b = (q.get("with") || "").trim().slice(0, 24);
    if (!a) return;
    const nm1 = $(".nm--1", liveStage), nm2 = $(".nm--2", liveStage);
    if (nm1) nm1.textContent = a;
    if (nm2 && b) nm2.innerHTML = `<span class="amp">&amp;</span> ${esc(b)}`;
    const welcome = $("[data-greet]");
    if (welcome) welcome.textContent = b ? `${a} and ${b}, please come in` : `${a}, please come in`;
    if ($("#f-name")) $("#f-name").value = a;
    if (b && $("#f-partner")) $("#f-partner").value = b;
  })();

  /* ---------- Nav, palace plan, journey line ---------- */

  const nav = $("#nav");
  const heroBg = $(".forecourt__bg");
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

    if (y < vh * 1.2 && !reduceMotion) heroBg.style.setProperty("--hy", (y * 0.35).toFixed(1) + "px"); // the courtyard stays behind as you walk on
    renderCorridor();
    renderWall();
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layoutWalls(); measureCorridor(); onScroll(); }, 150);
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
      // Until the Google Sheet is connected, the letter goes by email instead.
      const lines = [
        ["Name", name], ["Partner", data.get("partner")], ["WhatsApp", phone], ["Email", email],
        ["Wedding month", data.get("wedding_date")], ["City or venue", data.get("city")],
        ["Looking for", data.get("interest")], ["Design they liked", data.get("design")], ["Functions", data.getAll("functions").join(", ")],
        ["Our story", data.get("note")],
      ].filter(([, v]) => v && String(v).trim()).map(([k, v]) => `${k}: ${String(v).trim()}`);
      const subject = "Enquiry: " + name + (data.get("partner") ? " & " + data.get("partner") : "");
      location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      $("#sealedName").textContent = ", " + name.split(" ")[0];
      $("#sealedNote").textContent = "Your email app has opened with your letter. Press send, and we’ll write back within a day.";
      form.hidden = true;
      $("#sealed").hidden = false;
      return;
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
      design: (data.get("design") || "").trim(),
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
