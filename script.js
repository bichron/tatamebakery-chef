/* =====================================================
   LANDINGPAGE TATAME - SCRIPT.JS
   Clean Architecture Refactor - Based on dev01.02
===================================================== */

/* =====================================================
   1. CONFIGURATION
===================================================== */
const Config = {
  SESSION_TIMEOUT: 20 * 60 * 1000,
  QR_EXPIRE_TIME: 10 * 60 * 1000,
  UNLOCK_CODE: "093777",
  MAX_WRONG_ATTEMPTS: 3,
  QR_API_ENDPOINT: "/api/qr/create",
  WHEEL_STEP: 164
};

/* =====================================================
   2. GLOBAL STATE
===================================================== */
const State = {
  activePopup: null,
  sessionTimer: null,
  wrongAttempts: 0,
  qrCache: new Map(),
  wheel: {
    currentIndex: 0,
    isDragging: false,
    startX: 0,
    translate: 0
  }
};

/* =====================================================
   3. UTILITIES
===================================================== */
const Utils = {
  qs: (sel) => document.querySelector(sel),
  qsa: (sel) => document.querySelectorAll(sel),

  saveLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getLocal(key) {
    return JSON.parse(localStorage.getItem(key));
  },

  now() {
    return Date.now();
  }
};

/* =====================================================
   4. THEME SYSTEM
===================================================== */
const ThemeSystem = (() => {

  function init() {
    const saved = Utils.getLocal("theme") || "dark";
    apply(saved);
    const toggle = Utils.qs("#themeToggle");
    if (toggle) toggle.addEventListener("click", toggleTheme);
  }

  function toggleTheme() {
    const current = document.body.classList.contains("light") ? "light" : "dark";
    const next = current === "dark" ? "light" : "dark";
    apply(next);
  }

  function apply(mode) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(mode);
    Utils.saveLocal("theme", mode);
  }

  return { init };

})();

/* =====================================================
   5. 3D CARD SYSTEM
===================================================== */
const CardSystem = (() => {

  function init() {
    scaleCard();
    window.addEventListener("resize", scaleCard);
    window.addEventListener("deviceorientation", handleTilt);
  }

  function scaleCard() {
    const card = Utils.qs(".phone-card");
    if (!card) return;
    const scale = Math.min(window.innerWidth / 420, 1);
    card.style.transform = `scale(${scale})`;
  }

  function handleTilt(e) {
    const card = Utils.qs(".phone-card");
    if (!card) return;
    const x = e.gamma / 20;
    const y = e.beta / 20;
    card.style.transform += ` rotateY(${x}deg) rotateX(${y}deg)`;
  }

  return { init };

})();

/* =====================================================
   6. POPUP MANAGER
===================================================== */
const PopupManager = (() => {

  function open(id) {
    closeAll();
    const el = Utils.qs(`#${id}`);
    if (!el) return;
    el.classList.add("active");
    State.activePopup = id;
  }

  function close(id) {
    const el = Utils.qs(`#${id}`);
    if (!el) return;
    el.classList.remove("active");
    State.activePopup = null;
  }

  function closeAll() {
    Utils.qsa(".popup").forEach(p => p.classList.remove("active"));
  }

  return { open, close };

})();

/* =====================================================
   7. QR SERVICE
===================================================== */
const QRService = (() => {

  async function createDynamicQR(data) {
    const cached = getCached();
    if (cached) return cached;

    try {
      const res = await fetch(Config.QR_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const json = await res.json();
      save(json);
      return json;

    } catch {
      return { token: "STATIC-FALLBACK" };
    }
  }

  function save(data) {
    Utils.saveLocal("qr_token", {
      value: data,
      created: Utils.now()
    });
  }

  function getCached() {
    const stored = Utils.getLocal("qr_token");
    if (!stored) return null;

    const age = Utils.now() - stored.created;
    if (age > Config.QR_EXPIRE_TIME) return null;

    return stored.value;
  }

  return { createDynamicQR };

})();

/* =====================================================
   8. QR WHEEL SYSTEM
===================================================== */
const WheelSystem = (() => {

  let container;

  function init() {
    container = Utils.qs(".wheel-container");
    if (!container) return;

    container.addEventListener("touchstart", start);
    container.addEventListener("touchmove", move);
    container.addEventListener("touchend", end);
  }

  function update() {
    const offset = -State.wheel.currentIndex * Config.WHEEL_STEP;
    container.style.transform = `translateX(${offset}px)`;
  }

  function start(e) {
    State.wheel.isDragging = true;
    State.wheel.startX = e.touches[0].clientX;
  }

  function move(e) {
    if (!State.wheel.isDragging) return;
    const delta = e.touches[0].clientX - State.wheel.startX;
    State.wheel.translate = delta;
  }

  function end() {
    if (State.wheel.translate < -50) State.wheel.currentIndex++;
    if (State.wheel.translate > 50) State.wheel.currentIndex--;
    State.wheel.isDragging = false;
    State.wheel.translate = 0;
    update();
  }

  return { init };

})();

/* =====================================================
   9. SESSION SYSTEM
===================================================== */
const SessionSystem = (() => {

  function init() {
    reset();
    ["click", "touchstart"].forEach(evt =>
      document.addEventListener(evt, reset)
    );
  }

  function reset() {
    clearTimeout(State.sessionTimer);
    State.sessionTimer = setTimeout(expire, Config.SESSION_TIMEOUT);
  }

  function expire() {
    PopupManager.open("unlockPopup");
  }

  return { init };

})();

/* =====================================================
   10. UNLOCK SYSTEM
===================================================== */
const UnlockSystem = (() => {

  function init() {
    const input = Utils.qs("#unlockInput");
    if (!input) return;
    input.addEventListener("input", validate);
  }

  function validate(e) {
    const val = e.target.value;

    if (val === "9") window.close();

    if (val === Config.UNLOCK_CODE) {
      PopupManager.close("unlockPopup");
      State.wrongAttempts = 0;
    }

    if (val.length >= Config.UNLOCK_CODE.length && val !== Config.UNLOCK_CODE) {
      State.wrongAttempts++;
      if (State.wrongAttempts >= Config.MAX_WRONG_ATTEMPTS) {
        window.close();
      }
    }
  }

  return { init };

})();

/* =====================================================
   11. NFC SYSTEM
===================================================== */
const NFCSystem = (() => {

  function init() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("nfc") === "true") {
      document.body.classList.add("nfc-animate");
    }
  }

  return { init };

})();

/* =====================================================
   12. VCF GENERATOR
===================================================== */
const VCFSystem = (() => {

  function init() {
    const btn = Utils.qs("#downloadVCF");
    if (!btn) return;
    btn.addEventListener("click", generate);
  }

  function generate() {
    const vcf = `
BEGIN:VCARD
VERSION:3.0
FN:Tatame Bakery
TEL:+84000000000
END:VCARD
    `.trim();

    const blob = new Blob([vcf], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tatame.vcf";
    link.click();
  }

  return { init };

})();

/* =====================================================
   13. APP BOOTSTRAP
===================================================== */
const App = (() => {

  function init() {
    ThemeSystem.init();
    CardSystem.init();
    WheelSystem.init();
    SessionSystem.init();
    UnlockSystem.init();
    NFCSystem.init();
    VCFSystem.init();
  }

  return { init };

})();

document.addEventListener("DOMContentLoaded", App.init);