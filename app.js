/*
  Romantic confession page animations and interactions
  Replace assets in assets/images, assets/videos, assets/audio later.
*/

// ------------------------
// Global configuration
// ------------------------
const CONFIG = {
  defaultGirlfriendName: "婷婷",
  // Fixed special date per request
  defaultSpecialDateISO: "2023-08-26",
  gallery: {
    // Replace these with your own files under assets/images and assets/videos
    images: [
      "assets/images/17.jpg",
      "assets/images/16.jpg",
      "assets/images/15.jpg",
      "assets/images/14.jpg",
      "assets/images/13.jpg",
      "assets/images/12.jpg",
      "assets/images/11.jpg",
      "assets/images/10.jpg",
      "assets/images/9.jpg",
      "assets/images/1.jpg",
      "assets/images/7.jpg",
      "assets/images/6.jpg",
      "assets/images/5.jpg",
      "assets/images/4.jpg",
      "assets/images/8.jpg",
      "assets/images/2.jpg",
      "assets/images/3.jpg"
    ],
    videos: [
      "assets/js/happy.mp4",
    ],
  },
};

// ------------------------
// Utilities
// ------------------------
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function randomBetween(min, max) { return Math.random() * (max - min) + min; }
function chance(probability01) { return Math.random() < probability01; }
function lerp(a, b, t) { return a + (b - a) * t; }

function getDevicePixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  return clamp(dpr, 1, 2);
}

function setupHiDPICanvas(canvas) {
  const dpr = getDevicePixelRatio();
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function onResize(callback) {
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(callback, 200);
  });
}

// ------------------------
// State
// ------------------------
const state = {
  girlfriendName: localStorage.getItem("gf_name") || CONFIG.defaultGirlfriendName,
  specialDateISO: localStorage.getItem("special_date") || CONFIG.defaultSpecialDateISO,
  fireworksEnabled: false,
};

// ------------------------
// DOM references
// ------------------------
const starsCanvas = document.getElementById("starsCanvas");
const sakuraCanvas = document.getElementById("sakuraCanvas");
const snowCanvas = document.getElementById("snowCanvas");
const fireworksCanvas = document.getElementById("fireworksCanvas");

const daysTogetherEl = document.getElementById("daysTogether");
const startJourneyBtn = document.getElementById("startJourney");
const goToEnvelopeBtn = document.getElementById("goToEnvelope");
const proposalSection = document.getElementById("proposalSection");
const celebrationSection = document.getElementById("celebrationSection");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const proposalHint = document.getElementById("proposalHint");
const videoWrap = document.getElementById("videoWrap");
const resultVideo = document.getElementById("resultVideo");

const masonry = document.getElementById("masonry");
const lightbox = document.getElementById("lightbox");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxVideo = document.getElementById("lightboxVideo");

const wishInput = document.getElementById("wishInput");
const lanternLayer = document.getElementById("lanternLayer");

const musicToggle = document.getElementById("musicToggle");
const bgm = document.getElementById("bgm");

const introSection = document.getElementById("introSection");
const envelopeSection = document.getElementById("envelopeSection");
const envelopeLetter = document.getElementById("envelopeLetter");
const acceptLetter = document.getElementById("acceptLetter");
const clearSignature = document.getElementById("clearSignature");
const signatureCanvas = document.getElementById("signatureCanvas");

// ------------------------
// Unified Effects System - All effects in one canvas
// ------------------------
function createUnifiedEffects(canvas) {
  console.log('Starting unified effects system');
  const ctx = setupHiDPICanvas(canvas);
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;

  // Effect arrays
  const stars = [];
  const meteors = [];
  const sakuraPetals = [];
  const snowFlakes = [];
  const fireworkRockets = [];
  const fireworkParticles = [];

  // Initialize stars
  function spawnStars() {
    stars.length = 0;
    const numStars = Math.round(width * height / 8000);
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Spawn functions
  function spawnMeteor() {
    if (meteors.length >= 3) return;
    const startX = Math.random() * width * 0.7 + width * 0.2;
    const startY = -20;
    const speed = randomBetween(6, 12);
    const angle = randomBetween(Math.PI * 0.65, Math.PI * 0.85);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    meteors.push({ x: startX, y: startY, vx, vy, life: 0, maxLife: randomBetween(60, 120) });
  }

  function spawnSakuraPetal() {
    if (sakuraPetals.length >= 50) return;
    const size = randomBetween(6, 12);
    sakuraPetals.push({
      x: Math.random() * width,
      y: -20,
      z: Math.random(),
      size,
      fallSpeed: randomBetween(0.6, 1.8),
      sway: randomBetween(25, 50),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: randomBetween(-0.02, 0.02),
    });
  }

  function spawnSnowFlake() {
    if (snowFlakes.length >= 80) return;
    const size = randomBetween(1, 3);
    snowFlakes.push({
      x: Math.random() * width,
      y: -10,
      size,
      speed: randomBetween(0.4, 1.2),
      sway: randomBetween(30, 80),
      phase: Math.random() * Math.PI * 2,
    });
  }

  function spawnFirework(x, y, colorHue) {
    const count = 50;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.05;
      const speed = randomBetween(2, 6);
      fireworkParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: randomBetween(40, 80),
        hue: colorHue + randomBetween(-10, 10),
        alpha: 1,
      });
    }
  }

  function launchFireworkRocket() {
    if (fireworkRockets.length >= 2) return;
    fireworkRockets.push({
      x: randomBetween(width * 0.2, width * 0.8),
      y: height + 10,
      vy: randomBetween(-9, -12),
      targetY: randomBetween(height * 0.25, height * 0.55),
      hue: randomBetween(0, 360),
    });
  }

  // Draw functions
  function drawStar(s) {
    ctx.globalAlpha = 0.6 + Math.sin(s.phase) * 0.4;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.phase += s.twinkleSpeed;
  }

  function drawMeteor(m) {
    const trailLength = 80;
    ctx.globalAlpha = 1;
    const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.vx * trailLength, m.y - m.vy * trailLength);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    m.x += m.vx;
    m.y += m.vy;
    m.life++;
  }

  function drawSakuraPetal(p) {
    const x = p.x + Math.sin(p.y / p.sway) * 35 * p.z;
    const y = p.y;
    p.rot += p.rotSpeed;
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.translate(x, y);
    ctx.rotate(p.rot);
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    grd.addColorStop(0, "rgba(255,182,193,0.9)");
    grd.addColorStop(0.7, "rgba(255,182,193,0.7)");
    grd.addColorStop(1, "rgba(255,182,193,0.0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.scale(1, 0.7);
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    p.y += p.fallSpeed * (1 + p.z * 0.5);
  }

  function drawSnowFlake(f) {
    f.phase += 0.01 + f.size * 0.002;
    const x = f.x + Math.sin(f.phase) * f.sway * 0.02;
    f.y += f.speed;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFireworkRocket(r) {
    ctx.globalAlpha = 1;
    r.y += r.vy;
    r.vy += 0.08;
    ctx.fillStyle = `hsl(${r.hue} 90% 70%)`;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
    ctx.fill();
    if (r.vy >= 0 || r.y <= r.targetY) {
      spawnFirework(r.x, r.y, r.hue);
      return true; // mark for removal
    }
    return false;
  }

  function drawFireworkParticle(p) {
    ctx.globalAlpha = p.alpha;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.vy += 0.03;
    p.life++;
    p.alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = `hsl(${p.hue} 100% 65%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function resize() {
    setupHiDPICanvas(canvas);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    spawnStars();
  }

  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(15,12,24,0.9)");
    gradient.addColorStop(1, "rgba(15,12,24,0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Reset alpha for each effect
    ctx.globalAlpha = 1;

    // Draw stars
    stars.forEach(drawStar);

    // Draw meteors
    if (chance(0.03)) spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      drawMeteor(m);
      if (m.life > m.maxLife || m.x < -100 || m.y > height + 100) {
        meteors.splice(i, 1);
      }
    }

    // Draw sakura petals
    if (chance(0.6)) spawnSakuraPetal();
    for (let i = sakuraPetals.length - 1; i >= 0; i--) {
      const p = sakuraPetals[i];
      drawSakuraPetal(p);
      if (p.y > height + 40) sakuraPetals.splice(i, 1);
    }

    // Draw snow flakes
    if (chance(0.7)) spawnSnowFlake();
    for (let i = snowFlakes.length - 1; i >= 0; i--) {
      const f = snowFlakes[i];
      drawSnowFlake(f);
      if (f.y > height + 10) snowFlakes.splice(i, 1);
    }

    // Draw fireworks
    if (chance(0.02)) launchFireworkRocket();
    
    // Draw firework rockets
    for (let i = fireworkRockets.length - 1; i >= 0; i--) {
      const r = fireworkRockets[i];
      if (drawFireworkRocket(r)) {
        fireworkRockets.splice(i, 1);
      }
    }

    // Draw firework particles
    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
      const p = fireworkParticles[i];
      drawFireworkParticle(p);
      if (p.life > p.maxLife) fireworkParticles.splice(i, 1);
    }

    requestAnimationFrame(animate);
  }

  // Initialize
  spawnStars();
  onResize(resize);
  animate();

  return {
    burstAt(x, y) { spawnFirework(x, y, randomBetween(0, 360)); },
  };
}

// ------------------------
// Heart cursor trail
// ------------------------
function setupHeartCursor() {
  const hearts = [];
  function createHeart(x, y) {
    const el = document.createElement("div");
    el.className = "heart";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.opacity = "1";
    document.body.appendChild(el);
    const createdAt = performance.now();
    const duration = 800 + Math.random() * 600;
    hearts.push({ el, createdAt, duration, x, y, vy: -0.05 - Math.random() * 0.1 });
  }

  window.addEventListener("pointermove", (e) => {
    if (chance(0.4)) createHeart(e.clientX, e.clientY);
  });

  function tick(now) {
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      const t = (now - h.createdAt) / h.duration;
      if (t >= 1) {
        h.el.remove();
        hearts.splice(i, 1);
        continue;
      }
      h.y += h.vy * (16 + 100 * t);
      h.el.style.transform = `translate(-50%, -50%) translateY(${h.y}px)`;
      h.el.style.opacity = String(1 - t);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ------------------------
// Letter typing
// ------------------------
async function typeLetter(text, targetEl, speed = 40) {
  targetEl.textContent = "";
  for (let i = 0; i < text.length; i++) {
    targetEl.textContent += text[i];
    await new Promise(r => setTimeout(r, speed + (text[i] === "，" || text[i] === "。" ? 200 : 0)));
  }
}

// ------------------------
// Proposal logic
// ------------------------
function setupProposalInteractions(fireworks) {
  function moveNoButton() {
    const rect = proposalSection.getBoundingClientRect();
    const maxX = rect.width - noBtn.offsetWidth;
    const maxY = 100; // keep near buttons area
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    noBtn.style.position = "relative";
    noBtn.style.left = `${x - (noBtn.offsetLeft)}px`;
    noBtn.style.top = `${y - (noBtn.offsetTop)}px`;
  }

  noBtn.addEventListener("pointerenter", moveNoButton);
  noBtn.addEventListener("pointerdown", moveNoButton);

  yesBtn.addEventListener("click", () => {
    state.fireworksEnabled = true;
    proposalHint.textContent = "爱在绽放 ✦";
    celebrationSection.classList.remove("hidden");
    for (let i = 0; i < 8; i++) {
      setTimeout(() => fireworks.burstAt(innerWidth * Math.random(), innerHeight * Math.random() * 0.6), i * 200);
    }
    try { void bgm.play(); } catch {}
  });
}

// ------------------------
// Gallery
// ------------------------
function setupGallery() {
  if (!masonry) return;
  const items = [];
  CONFIG.gallery.images.forEach((src, idx) => items.push({ type: "image", src, label: `照片 ${idx + 1}` }));
  items.forEach(({ src, label }) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    const img = document.createElement("img");
    img.alt = label; img.loading = "lazy"; img.src = src;
    img.onerror = () => {
      img.remove();
      const ph = document.createElement("div");
      ph.className = "placeholder";
      ph.textContent = "替换为你的照片";
      tile.appendChild(ph);
    };
    tile.appendChild(img);
    tile.addEventListener("click", () => openLightbox({ type: "image", src }));
    masonry.appendChild(tile);
  });
}

function openLightbox(item) {
  lightbox.classList.remove("hidden");
  lightbox.setAttribute("aria-hidden", "false");
  if (item.type === "image") {
    lightboxVideo.pause();
    lightboxVideo.style.display = "none";
    lightboxImage.style.display = "block";
    lightboxImage.src = item.src;
  } else {
    lightboxImage.style.display = "none";
    lightboxVideo.style.display = "block";
    lightboxVideo.src = item.src;
    lightboxVideo.play().catch(() => {});
  }
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxVideo.pause();
  lightboxVideo.src = "";
}

// ------------------------
// Wishes: floating lanterns
// ------------------------
function setupWishes() {
  function releaseLantern(text) {
    const lantern = document.createElement("div");
    lantern.className = "lantern";
    lantern.textContent = text;
    lantern.style.bottom = "0px";
    lantern.style.opacity = "0";
    lanternLayer.appendChild(lantern);
    const duration = 6000 + Math.random() * 3000;
    const drift = (Math.random() - 0.5) * 120;
    const start = performance.now();
    function anim(now) {
      const t = Math.min(1, (now - start) / duration);
      lantern.style.opacity = String(Math.min(1, t * 1.5));
      lantern.style.bottom = `${t * 220 + 40}px`;
      lantern.style.transform = `translateX(calc(-50% + ${Math.sin(t * Math.PI) * drift}px))`;
      if (t < 1) requestAnimationFrame(anim); else setTimeout(() => lantern.remove(), 1000);
    }
    requestAnimationFrame(anim);
  }

  wishInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = wishInput.value.trim();
      if (!text) return;
      releaseLantern(text);
      wishInput.value = "";
    }
  });
}

// ------------------------
// Music control
// ------------------------
function setupMusic() {
  let musicAttempted = false;
  
  function updateButton() {
    if (!bgm.querySelector("source") && !bgm.src) {
      musicToggle.textContent = "♫ 添加音乐后可播放";
      musicToggle.disabled = true;
      return;
    }
    musicToggle.textContent = bgm.paused ? "♫ 播放音乐" : "⏸ 暂停音乐";
  }
  
  async function tryAutoPlay() {
    if (musicAttempted) return;
    musicAttempted = true;
    try {
      await bgm.play();
      console.log("Music auto-started successfully");
    } catch (e) {
      console.log("Autoplay blocked, waiting for user interaction:", e.message);
      musicToggle.textContent = "♫ 点击播放音乐";
    }
  }
  
  musicToggle.addEventListener("click", async () => {
    if (bgm.paused) {
      try {
        await bgm.play();
        console.log("Music started successfully");
      } catch (e) {
        console.error("Failed to play music:", e);
        musicToggle.textContent = "♫ 音乐加载失败";
      }
    } else {
      bgm.pause();
    }
    updateButton();
  });
  
  bgm.addEventListener("play", updateButton);
  bgm.addEventListener("pause", updateButton);
  bgm.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    musicToggle.textContent = "♫ 音乐文件错误";
  });
  bgm.addEventListener("canplaythrough", () => {
    console.log("Music loaded successfully");
    updateButton();
    // Try autoplay when music is ready
    setTimeout(tryAutoPlay, 500);
  });
  
  // Also try autoplay on any user interaction
  document.addEventListener('click', tryAutoPlay, { once: true });
  document.addEventListener('keydown', tryAutoPlay, { once: true });
  
  updateButton();
}

// ------------------------
// Days counter
// ------------------------
function updateDaysCounter() {
  const startDate = new Date(state.specialDateISO + "T00:00:00");
  const today = new Date();
  const ms = today - startDate;
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  daysTogetherEl.textContent = String(days);
}

// ------------------------
// Typewriter effect
// ------------------------
function typewriterEffect(element, text, speed = 80) {
  return new Promise((resolve) => {
    element.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        // Remove cursor after typing is complete
        setTimeout(() => {
          element.classList.add('typing-complete');
        }, 1000);
        resolve();
      }
    }, speed);
  });
}

// ------------------------
// Intro modal
// ------------------------
function setupIntro() {
  state.girlfriendName = CONFIG.defaultGirlfriendName;
  state.specialDateISO = CONFIG.defaultSpecialDateISO;
  localStorage.setItem("gf_name", state.girlfriendName);
  localStorage.setItem("special_date", state.specialDateISO);
  
  // Start typewriter effect
  const typewriterElement = document.getElementById('typewriterText');
  if (typewriterElement) {
    const originalText = typewriterElement.textContent;
    typewriterEffect(typewriterElement, originalText, 60);
  }
  
  if (startJourneyBtn) {
    startJourneyBtn.addEventListener("click", async () => {
      try { await bgm.play(); } catch {}
      // Page1 -> Page2
      if (introSection) introSection.style.display = "none";
      const gs = document.getElementById("gallerySection");
      if (gs) gs.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

async function startLetter() {
  letterTitleEl.textContent = `${state.girlfriendName}`;
  const text = `遇见你以后，风有了温度，星星会说话。\n我把所有的喜欢都攒成今天，轻轻地告诉你：\n愿把余生的热爱，写进与你有关的每一页。`;
  await typeLetter(text, letterTextEl, 34);
}

// ------------------------
// Wiring up everything
// ------------------------
function main() {
  // Use unified effects system - all effects in one canvas
  console.log('Initializing unified effects system...');
  
  // Hide other canvases and use only starsCanvas for all effects
  sakuraCanvas.style.display = 'none';
  snowCanvas.style.display = 'none';
  fireworksCanvas.style.display = 'none';
  starsCanvas.style.display = 'block';
  
  const effects = createUnifiedEffects(starsCanvas);
  
  setupHeartCursor();
  setupProposalInteractions(effects);
  setupGallery();
  setupWishes();
  setupMusic();
  setupIntro();
  updateDaysCounter();
  setInterval(updateDaysCounter, 60_000);
  
  console.log('All effects are now running simultaneously in one canvas!');
  
  // Add some initial fireworks bursts for immediate visual impact
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        effects.burstAt(innerWidth * Math.random(), innerHeight * Math.random() * 0.6);
      }, i * 800);
    }
  }, 2000);

  // Page2 -> Page3 (open envelope section)
  if (goToEnvelopeBtn) {
    goToEnvelopeBtn.addEventListener("click", () => {
      const gs = document.getElementById("gallerySection");
      if (gs) gs.style.display = "none";
      if (envelopeSection) envelopeSection.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Envelope letter content (now using image instead of text)

  // Signature canvas
  if (signatureCanvas) {
    const ctx = signatureCanvas.getContext("2d");
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#ffd1e3";
    let drawing = false; let lastX = 0; let lastY = 0;
    const getPos = (e) => {
      const rect = signatureCanvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x, y };
    };
    const start = (e) => { drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; e.preventDefault(); };
    const move = (e) => { if (!drawing) return; const p = getPos(e); ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke(); lastX = p.x; lastY = p.y; e.preventDefault(); };
    const end = () => { drawing = false; };
    signatureCanvas.addEventListener("mousedown", start);
    signatureCanvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    signatureCanvas.addEventListener("touchstart", start, { passive: false });
    signatureCanvas.addEventListener("touchmove", move, { passive: false });
    signatureCanvas.addEventListener("touchend", end);
    clearSignature.addEventListener("click", () => ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height));
  }

  if (acceptLetter) {
    acceptLetter.addEventListener("click", () => {
      if (envelopeSection) envelopeSection.style.display = "none";
      if (proposalSection) proposalSection.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      if (videoWrap) videoWrap.style.display = "block";
      if (resultVideo) { try { resultVideo.play(); } catch {} }
    });
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.classList.contains("lightbox-backdrop")) closeLightbox(); });
}

document.addEventListener("DOMContentLoaded", main);


