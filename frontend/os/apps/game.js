import { sound } from '../sound.js';

const OJEK_BEST_KEY = 'rizkyos_ojek_best_v1';
const MINE_BEST_KEY = 'rizkyos_minesweeper_best_v1';

function safeStorageGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore quota or storage restriction errors
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerpColor(c1, c2, t) {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r},${g},${b})`;
}

// ============================================================================
// APP 1: OJEK RUSH 95 — SURABAYA EDITION (Pseudo-3D Retro Arcade Highway Racer)
// ============================================================================

const ROAD_ZONES = [
  { name: 'JL. RAYA ITS', targetCurve: 0.0, length: 0.55 },
  { name: 'KAMPUS SUKOLILO', targetCurve: 0.55, length: 0.65 },
  { name: 'BUNDARAN WARU', targetCurve: -0.65, length: 0.7 },
  { name: 'JL. TUNJUNGAN', targetCurve: 0.35, length: 0.65 },
  { name: 'JEMBATAN SURAMADU', targetCurve: 0.0, length: 0.8 },
  { name: 'PAKUWON BOULEVARD', targetCurve: -0.5, length: 0.65 },
];

const BILLBOARD_TEXTS = [
  { text: 'ITS SURABAYA', bg: '#003875', fg: '#ffffff' },
  { text: 'RIZKY AI 95', bg: '#008080', fg: '#fef08a' },
  { text: 'SURAMADU ->', bg: '#166534', fg: '#ffffff' },
  { text: 'BAKSO CAK MAN', bg: '#b91c1c', fg: '#fde047' },
  { text: 'KOPI SURABAYA', bg: '#78350f', fg: '#fef3c7' },
  { text: 'CUM LAUDE!', bg: '#1e1b4b', fg: '#38bdf8' },
];

export const ojekRushApp = {
  id: 'ojek-rush',
  title: 'Ojek Rush 95: Surabaya Edition',
  icon: 'game',
  width: 680,
  height: 555,
  minWidth: 420,
  minHeight: 400,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    containerEl.innerHTML = `
      <div class="ojek-app">
        <div class="ojek-hud win95-sunken">
          <div class="ojek-hud-item">
            <span class="ojek-hud-label">SPEED</span>
            <span class="ojek-hud-val" data-hud="speed">0 km/h</span>
          </div>
          <div class="ojek-hud-item">
            <span class="ojek-hud-label">DIST</span>
            <span class="ojek-hud-val" data-hud="dist">0.00 km</span>
          </div>
          <div class="ojek-hud-item">
            <span class="ojek-hud-label">SCORE</span>
            <span class="ojek-hud-val ojek-score" data-hud="score">0</span>
          </div>
          <div class="ojek-hud-item">
            <span class="ojek-hud-label">BEST</span>
            <span class="ojek-hud-val ojek-best" data-hud="best">0</span>
          </div>
          <div class="ojek-hud-item ojek-hud-lives">
            <span class="ojek-hud-label">LIVES</span>
            <span class="ojek-hud-val ojek-hearts" data-hud="lives">♥♥♥</span>
          </div>
          <div class="ojek-hud-item ojek-hud-nitro">
            <span class="ojek-hud-label">NITRO</span>
            <div class="ojek-nitro-track">
              <div class="ojek-nitro-fill" data-hud="nitro" style="width: 30%"></div>
            </div>
          </div>
        </div>

        <div class="ojek-stage win95-sunken">
          <canvas class="ojek-canvas" width="640" height="380"></canvas>

          <div class="ojek-overlay ojek-overlay-start" data-overlay="start">
            <div class="ojek-title-box">
              <div class="ojek-badge">SURABAYA ARCADE 1995</div>
              <h2 class="ojek-logo">OJEK RUSH 95</h2>
              <p class="ojek-subtitle">Surabaya Edition — Dodge Angkot, Bus Suroboyo, Bajaj &amp; Gerobak Bakso!</p>
              <div class="ojek-legend">
                <span><b>←/→</b> or <b>A/D</b> Steer</span>
                <span><b>↑/↓</b> or <b>W/S</b> Gas / Brake</span>
                <span><b>SPACE</b> Klakson &amp; Nitro</span>
                <span><b>P</b> Pause</span>
              </div>
              <div class="ojek-pickups-hint">
                Collect <b>KOPI SUSU</b> &amp; <b>5-STAR</b> pickups for Nitro Boost
              </div>
              <button type="button" class="win95-btn ojek-start-btn" data-action="start">START RIDE (ENTER)</button>
            </div>
          </div>

          <div class="ojek-overlay ojek-overlay-pause" data-overlay="pause" hidden>
            <div class="ojek-title-box">
              <h3 class="ojek-logo-sm">PAUSED — NGOPI DULU</h3>
              <p class="ojek-subtitle">Jalanan Surabaya menunggu...</p>
              <div class="ojek-btn-row">
                <button type="button" class="win95-btn" data-action="resume">Resume</button>
                <button type="button" class="win95-btn" data-action="restart">Restart</button>
              </div>
            </div>
          </div>

          <div class="ojek-overlay ojek-overlay-gameover" data-overlay="gameover" hidden>
            <div class="ojek-title-box">
              <div class="ojek-badge ojek-badge-danger">ORDER SELESAI</div>
              <h3 class="ojek-logo-sm">GAME OVER</h3>
              <p class="ojek-rank" data-go="rank"></p>
              <div class="ojek-go-stats">
                <div>Score: <strong data-go="score">0</strong></div>
                <div>Distance: <strong data-go="dist">0.00 km</strong></div>
                <div>Best: <strong data-go="best">0</strong></div>
              </div>
              <div class="ojek-new-best" data-go="newbest" hidden>NEW HIGH SCORE</div>
              <div class="ojek-btn-row">
                <button type="button" class="win95-btn ojek-start-btn" data-action="restart">PLAY AGAIN (ENTER)</button>
              </div>
            </div>
          </div>
        </div>

        <div class="ojek-controls">
          <div class="ojek-ctrl-group">
            <button type="button" class="win95-btn ojek-ctrl-btn" data-ctrl="left" aria-label="Steer Left">&lt;</button>
            <button type="button" class="win95-btn ojek-ctrl-btn" data-ctrl="right" aria-label="Steer Right">&gt;</button>
          </div>
          <div class="ojek-ctrl-group ojek-ctrl-center">
            <button type="button" class="win95-btn ojek-ctrl-btn ojek-ctrl-nitro" data-ctrl="nitro" aria-label="Klakson and Nitro">TIN-TIN / NITRO</button>
            <button type="button" class="win95-btn ojek-ctrl-btn ojek-ctrl-pause" data-action="toggle-pause" aria-label="Pause">PAUSE</button>
          </div>
          <div class="ojek-ctrl-group">
            <button type="button" class="win95-btn ojek-ctrl-btn" data-ctrl="down" aria-label="Brake">REM</button>
            <button type="button" class="win95-btn ojek-ctrl-btn" data-ctrl="up" aria-label="Accelerate">GAS</button>
          </div>
        </div>
      </div>
    `;

    const canvas = containerEl.querySelector('.ojek-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const HORIZON_Y = 148;

    const hudEls = {
      speed: containerEl.querySelector('[data-hud="speed"]'),
      dist: containerEl.querySelector('[data-hud="dist"]'),
      score: containerEl.querySelector('[data-hud="score"]'),
      best: containerEl.querySelector('[data-hud="best"]'),
      lives: containerEl.querySelector('[data-hud="lives"]'),
      nitro: containerEl.querySelector('[data-hud="nitro"]'),
    };
    const overlays = {
      start: containerEl.querySelector('[data-overlay="start"]'),
      pause: containerEl.querySelector('[data-overlay="pause"]'),
      gameover: containerEl.querySelector('[data-overlay="gameover"]'),
    };
    const goEls = {
      rank: containerEl.querySelector('[data-go="rank"]'),
      score: containerEl.querySelector('[data-go="score"]'),
      dist: containerEl.querySelector('[data-go="dist"]'),
      best: containerEl.querySelector('[data-go="best"]'),
      newbest: containerEl.querySelector('[data-go="newbest"]'),
    };

    let bestScore = parseInt(safeStorageGet(OJEK_BEST_KEY, '0'), 10) || 0;
    hudEls.best.textContent = bestScore.toLocaleString();

    const keys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    const state = {
      mode: 'start', // 'start' | 'playing' | 'paused' | 'gameover'
      speed: 70, // km/h
      maxBaseSpeed: 145,
      distance: 0, // km
      trackScroll: 0,
      score: 0,
      lives: 3,
      nitro: 40, // 0..100
      nitroActive: 0, // seconds remaining
      playerX: 0, // -1 .. +1 (road lanes)
      playerLean: 0,
      invulnTimer: 0,
      shakeTimer: 0,
      honkTimer: 0,
      honkCooldown: 0,
      roadCurve: 0,
      zoneIndex: 0,
      zoneDist: 0,
      zoneBannerTimer: 0,
      spawnTimer: 0.7,
      pickupTimer: 2.2,
      sceneryTimer: 0.12,
      entities: [], // traffic + collectibles
      props: [], // roadside palms, lamps, billboards
      particles: [],
      popups: [],
      stars: Array.from({ length: 36 }, (_, i) => ({
        x: ((i * 97 + 23) % W),
        y: ((i * 53 + 11) % (HORIZON_Y - 26)),
        phase: i * 0.7,
      })),
      clouds: [
        { x: 90, y: 34, w: 72 },
        { x: 280, y: 24, w: 96 },
        { x: 490, y: 42, w: 68 },
      ],
      time: 0,
    };

    let rafId = null;
    let lastTs = 0;
    let disposed = false;
    const activeTimeouts = new Set();

    function scheduleTimeout(fn, ms) {
      const id = setTimeout(() => {
        activeTimeouts.delete(id);
        if (!disposed) fn();
      }, ms);
      activeTimeouts.add(id);
      return id;
    }

    function setOverlay(mode) {
      overlays.start.hidden = mode !== 'start';
      overlays.pause.hidden = mode !== 'paused';
      overlays.gameover.hidden = mode !== 'gameover';
    }

    function playKlaxonSfx() {
      sound.playBeep(520, 0.08);
      scheduleTimeout(() => sound.playBeep(660, 0.11), 95);
    }

    function playPickupSfx(isStar) {
      sound.playBeep(isStar ? 780 : 620, 0.07);
      scheduleTimeout(() => sound.playBeep(isStar ? 1040 : 880, 0.09), 70);
    }

    function playNitroSfx() {
      sound.playBeep(440, 0.06);
      scheduleTimeout(() => sound.playBeep(660, 0.07), 55);
      scheduleTimeout(() => sound.playBeep(920, 0.1), 115);
    }

    function playCrashSfx() {
      sound.playError();
      scheduleTimeout(() => sound.playBeep(110, 0.18), 40);
    }

    function triggerHonkOrNitro() {
      if (state.mode !== 'playing') return;
      if (state.honkCooldown <= 0) {
        state.honkTimer = 0.85;
        state.honkCooldown = 0.45;
        playKlaxonSfx();
        // Nudge close vehicles slightly away when honking!
        for (const ent of state.entities) {
          if (ent.kind === 'traffic' && ent.z < 0.55 && ent.z > 0.1) {
            if (Math.abs(ent.lane - state.playerX) < 0.45) {
              ent.lane = clamp(ent.lane + (ent.lane >= state.playerX ? 0.18 : -0.18), -0.78, 0.78);
            }
          }
        }
      }
      if (state.nitro >= 30 && state.nitroActive <= 0) {
        state.nitroActive = 2.6;
        state.nitro = Math.max(0, state.nitro - 30);
        playNitroSfx();
        addPopup('NITRO BOOST!', W / 2, H - 115, '#38bdf8');
      }
    }

    function addPopup(text, x, y, color = '#fde047') {
      state.popups.push({ text, x, y, color, life: 1.0 });
    }

    function initScenery() {
      state.props = [];
      for (let i = 0; i < 16; i++) {
        const z = i / 16;
        spawnPropPair(z);
      }
    }

    function spawnPropPair(zStart = 1.0) {
      const idx = Math.floor(Math.random() * 10);
      if (idx === 0) {
        const bb = BILLBOARD_TEXTS[Math.floor(Math.random() * BILLBOARD_TEXTS.length)];
        const side = Math.random() < 0.5 ? -1 : 1;
        state.props.push({
          type: 'billboard',
          side,
          offset: 1.48,
          z: zStart,
          billboard: bb,
        });
      } else if (idx % 3 === 0) {
        state.props.push({ type: 'lamp', side: -1, offset: 1.24, z: zStart });
        state.props.push({ type: 'lamp', side: 1, offset: 1.24, z: zStart });
      } else {
        state.props.push({ type: 'palm', side: -1, offset: 1.38 + Math.random() * 0.4, z: zStart });
        state.props.push({ type: 'palm', side: 1, offset: 1.38 + Math.random() * 0.4, z: zStart });
      }
    }

    function resetGame() {
      state.mode = 'playing';
      state.speed = 65;
      state.distance = 0;
      state.trackScroll = 0;
      state.score = 0;
      state.lives = 3;
      state.nitro = 45;
      state.nitroActive = 0;
      state.playerX = 0;
      state.playerLean = 0;
      state.invulnTimer = 0;
      state.shakeTimer = 0;
      state.honkTimer = 0;
      state.honkCooldown = 0;
      state.roadCurve = 0;
      state.zoneIndex = 0;
      state.zoneDist = 0;
      state.zoneBannerTimer = 2.4;
      state.spawnTimer = 0.85;
      state.pickupTimer = 1.8;
      state.sceneryTimer = 0.1;
      state.entities = [];
      state.particles = [];
      state.popups = [];
      initScenery();
      setOverlay('playing');
      sound.playOpen();
      winApi.setStatus(`Riding: ${ROAD_ZONES[0].name} — Space for Klakson/Nitro`);
    }

    function togglePause() {
      if (state.mode === 'playing') {
        state.mode = 'paused';
        setOverlay('paused');
        sound.playClick();
        winApi.setStatus('Ojek Rush 95 — Paused');
      } else if (state.mode === 'paused') {
        state.mode = 'playing';
        setOverlay('playing');
        sound.playClick();
        winApi.setStatus(`Riding: ${ROAD_ZONES[state.zoneIndex].name}`);
      }
    }

    function finishGame() {
      state.mode = 'gameover';
      const finalScore = Math.floor(state.score);
      let isNewBest = false;
      if (finalScore > bestScore) {
        bestScore = finalScore;
        safeStorageSet(OJEK_BEST_KEY, bestScore);
        isNewBest = true;
      }

      let rank = 'Pemula Jl. Raya ITS [Rank D]';
      if (finalScore >= 12000) rank = 'Legenda Ojek Surabaya [Rank S]';
      else if (finalScore >= 7000) rank = 'Driver Bintang 5 ITS [Rank A]';
      else if (finalScore >= 3500) rank = 'Raja Nyalip Suramadu [Rank B]';
      else if (finalScore >= 1500) rank = 'Ojek Cepat Tunjungan [Rank C]';

      goEls.rank.textContent = rank;
      goEls.score.textContent = finalScore.toLocaleString();
      goEls.dist.textContent = `${state.distance.toFixed(2)} km`;
      goEls.best.textContent = bestScore.toLocaleString();
      goEls.newbest.hidden = !isNewBest;
      hudEls.best.textContent = bestScore.toLocaleString();
      setOverlay('gameover');
      winApi.setStatus(`Game Over — Score: ${finalScore.toLocaleString()} | Best: ${bestScore.toLocaleString()}`);
    }

    function spawnTraffic() {
      const lanes = [-0.66, 0, 0.66];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      // Prevent impossible 3-lane wall at similar depth
      const nearby = state.entities.filter((e) => e.kind === 'traffic' && e.z > 0.72);
      if (nearby.length >= 2) return;
      if (nearby.some((e) => Math.abs(e.lane - lane) < 0.25)) return;

      const roll = Math.random();
      let type = 'angkot';
      let relSpeed = 0.52;
      let hitWidth = 0.34;
      if (roll < 0.32) {
        type = 'angkot';
        relSpeed = 0.56;
        hitWidth = 0.34;
      } else if (roll < 0.56) {
        type = 'bus';
        relSpeed = 0.48;
        hitWidth = 0.42;
      } else if (roll < 0.8) {
        type = 'bajaj';
        relSpeed = 0.58;
        hitWidth = 0.3;
      } else {
        type = 'bakso';
        relSpeed = 0.72; // slower cart -> approaches faster
        hitWidth = 0.32;
      }

      state.entities.push({
        kind: 'traffic',
        type,
        lane,
        z: 1.0,
        relSpeed,
        hitWidth,
        nearMissed: false,
      });
    }

    function spawnPickup() {
      const lanes = [-0.66, 0, 0.66];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const type = Math.random() < 0.62 ? 'kopi' : 'star';
      state.entities.push({
        kind: 'pickup',
        type,
        lane,
        z: 1.0,
        relSpeed: 0.78,
        hitWidth: 0.34,
      });
    }

    function projectZ(z) {
      const p = Math.pow(clamp(1 - z, 0, 1.15), 1.85);
      const y = HORIZON_Y + p * (H - HORIZON_Y);
      const roadHalfBottom = W * 0.43;
      const roadHalfTop = 18;
      const roadHalf = lerp(roadHalfTop, roadHalfBottom, p);
      const curveShift = state.roadCurve * Math.pow(1 - p, 2) * 210;
      const cameraShift = -state.playerX * p * roadHalfBottom * 0.72;
      const centerX = W / 2 + curveShift + cameraShift;
      return { p, y, roadHalf, centerX };
    }

    function updateHud() {
      hudEls.speed.textContent = `${Math.round(state.speed)} km/h`;
      hudEls.dist.textContent = `${state.distance.toFixed(2)} km`;
      hudEls.score.textContent = Math.floor(state.score).toLocaleString();
      hudEls.lives.textContent = '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives));
      hudEls.nitro.style.width = `${Math.round(clamp(state.nitro, 0, 100))}%`;
      hudEls.nitro.classList.toggle('is-boosting', state.nitroActive > 0);
      hudEls.nitro.classList.toggle('is-ready', state.nitro >= 30 && state.nitroActive <= 0);
    }

    function update(dt) {
      state.time += dt;

      if (state.mode === 'start') {
        // Gentle attract-mode scrolling background
        state.trackScroll += dt * 4.5;
        state.roadCurve = Math.sin(state.time * 0.45) * 0.35;
        for (const c of state.clouds) {
          c.x -= dt * 8;
          if (c.x + c.w < 0) c.x = W + 20;
        }
        return;
      }

      if (state.mode !== 'playing') return;

      // Difficulty scales gently with distance
      const difficulty = clamp(1 + state.distance * 0.14, 1, 2.15);

      // Nitro timer
      if (state.nitroActive > 0) {
        state.nitroActive = Math.max(0, state.nitroActive - dt);
      }

      // Acceleration / braking
      const topSpeed = state.nitroActive > 0 ? 215 : state.maxBaseSpeed + (difficulty - 1) * 26;
      if (state.nitroActive > 0) {
        state.speed = lerp(state.speed, topSpeed, dt * 4.5);
      } else if (keys.up) {
        state.speed = Math.min(topSpeed, state.speed + 78 * dt);
      } else if (keys.down) {
        state.speed = Math.max(42, state.speed - 125 * dt);
      } else {
        // Auto-cruise around 88 km/h so mobile/casual players keep moving briskly
        const cruise = 88 + (difficulty - 1) * 14;
        state.speed += (cruise - state.speed) * Math.min(1, dt * 1.8);
      }

      // Steering + centrifugal road curve push
      const steerDir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      const steerSpeed = 1.95;
      state.playerX += steerDir * steerSpeed * dt;
      state.playerX -= state.roadCurve * (state.speed / 190) * 0.42 * dt;
      state.playerX = clamp(state.playerX, -1.08, 1.08);
      state.playerLean = lerp(state.playerLean, steerDir, dt * 10);

      // Off-road shoulder slows scooter slightly & vibrates
      if (Math.abs(state.playerX) > 0.94 && state.nitroActive <= 0) {
        state.speed = Math.max(52, state.speed - 45 * dt);
      }

      // Distance & Score
      const kmDelta = (state.speed / 3600) * dt * 8.5; // arcade pacing (~0.25 km every ~10s at 105 km/h)
      state.distance += kmDelta;
      state.trackScroll += (state.speed / 12) * dt;
      state.score += state.speed * dt * (state.nitroActive > 0 ? 1.85 : 1.0);
      state.nitro = clamp(state.nitro + dt * 2.2, 0, 100);

      // Zone / Curve progression
      const zone = ROAD_ZONES[state.zoneIndex];
      state.zoneDist += kmDelta;
      state.roadCurve = lerp(state.roadCurve, zone.targetCurve, dt * 0.9);
      if (state.zoneDist >= zone.length) {
        state.zoneDist = 0;
        state.zoneIndex = (state.zoneIndex + 1) % ROAD_ZONES.length;
        state.zoneBannerTimer = 2.6;
        winApi.setStatus(`Entering ${ROAD_ZONES[state.zoneIndex].name} — Keep dodging!`);
      }

      // Timers
      if (state.invulnTimer > 0) state.invulnTimer = Math.max(0, state.invulnTimer - dt);
      if (state.shakeTimer > 0) state.shakeTimer = Math.max(0, state.shakeTimer - dt);
      if (state.honkTimer > 0) state.honkTimer = Math.max(0, state.honkTimer - dt);
      if (state.honkCooldown > 0) state.honkCooldown = Math.max(0, state.honkCooldown - dt);
      if (state.zoneBannerTimer > 0) state.zoneBannerTimer = Math.max(0, state.zoneBannerTimer - dt);

      // Clouds
      for (const c of state.clouds) {
        c.x -= (dt * 9 + state.roadCurve * (state.speed / 45) * dt * 18);
        if (c.x + c.w < -20) c.x = W + 20;
        if (c.x > W + 40) c.x = -c.w;
      }

      // Spawn props
      state.sceneryTimer -= dt * (state.speed / 95);
      if (state.sceneryTimer <= 0) {
        spawnPropPair(1.0);
        state.sceneryTimer = 0.24;
      }

      // Spawn traffic
      state.spawnTimer -= dt * difficulty;
      if (state.spawnTimer <= 0) {
        spawnTraffic();
        state.spawnTimer = lerp(1.05, 0.52, clamp((difficulty - 1) / 1.1, 0, 1)) + Math.random() * 0.35;
      }

      // Spawn pickups
      state.pickupTimer -= dt;
      if (state.pickupTimer <= 0) {
        spawnPickup();
        state.pickupTimer = 2.6 + Math.random() * 1.6;
      }

      // Move roadside props
      const baseZStep = (state.speed / 120) * dt * 0.72;
      for (let i = state.props.length - 1; i >= 0; i--) {
        state.props[i].z -= baseZStep;
        if (state.props[i].z < -0.08) {
          state.props.splice(i, 1);
        }
      }

      // Move entities & check collisions
      for (let i = state.entities.length - 1; i >= 0; i--) {
        const ent = state.entities[i];
        ent.z -= baseZStep * ent.relSpeed;

        const proj = projectZ(ent.z);
        const inHitBand = proj.p >= 0.76 && proj.p <= 0.94;

        if (inHitBand) {
          const dx = Math.abs(ent.lane - state.playerX);
          if (ent.kind === 'pickup' && dx < ent.hitWidth) {
            const isStar = ent.type === 'star';
            state.nitro = clamp(state.nitro + (isStar ? 50 : 35), 0, 100);
            state.score += isStar ? 500 : 250;
            playPickupSfx(isStar);
            addPopup(isStar ? '5-STAR +500' : 'KOPI NITRO +250', proj.centerX + ent.lane * proj.roadHalf, proj.y - 30, '#fde047');
            state.entities.splice(i, 1);
            continue;
          } else if (ent.kind === 'traffic') {
            if (dx < ent.hitWidth * 0.78) {
              if (state.nitroActive > 0) {
                // Nitro smashes aside harmlessly with bonus!
                state.score += 180;
                playPickupSfx(false);
                addPopup('TURBO SALIP +180', proj.centerX + ent.lane * proj.roadHalf, proj.y - 40, '#38bdf8');
                state.entities.splice(i, 1);
                continue;
              } else if (state.invulnTimer <= 0) {
                state.lives -= 1;
                state.invulnTimer = 1.9;
                state.shakeTimer = 0.45;
                state.speed = Math.max(45, state.speed * 0.48);
                playCrashSfx();
                addPopup('NABRAK! -1 LIFE', W / 2, H - 120, '#f87171');
                for (let k = 0; k < 14; k++) {
                  state.particles.push({
                    x: W / 2 + (Math.random() - 0.5) * 30,
                    y: H - 60,
                    vx: (Math.random() - 0.5) * 220,
                    vy: -60 - Math.random() * 140,
                    color: k % 2 === 0 ? '#facc15' : '#ef4444',
                    life: 0.65,
                  });
                }
                state.entities.splice(i, 1);
                if (state.lives <= 0) {
                  updateHud();
                  finishGame();
                  return;
                }
                continue;
              }
            } else if (!ent.nearMissed && dx < ent.hitWidth + 0.34 && state.speed > 100) {
              ent.nearMissed = true;
              state.score += 120;
              state.nitro = clamp(state.nitro + 10, 0, 100);
              addPopup('MEPET +120', W / 2 + (ent.lane > state.playerX ? 50 : -50), H - 105, '#4ade80');
              sound.playBeep(740, 0.05);
            }
          }
        }

        if (ent.z < -0.1) {
          state.entities.splice(i, 1);
        }
      }

      // Exhaust / Nitro particles
      if (Math.random() < (state.nitroActive > 0 ? 0.9 : 0.35)) {
        state.particles.push({
          x: W / 2 + state.playerLean * 8 + (Math.random() - 0.5) * 8,
          y: H - 24,
          vx: (Math.random() - 0.5) * 28,
          vy: 30 + Math.random() * 45,
          color: state.nitroActive > 0 ? (Math.random() < 0.5 ? '#38bdf8' : '#fde047') : 'rgba(226,232,240,0.65)',
          life: 0.32,
        });
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) state.particles.splice(i, 1);
      }

      for (let i = state.popups.length - 1; i >= 0; i--) {
        const pop = state.popups[i];
        pop.y -= 42 * dt;
        pop.life -= dt;
        if (pop.life <= 0) state.popups.splice(i, 1);
      }

      updateHud();
    }

    function getTimeOfDayPalette() {
      // Cycles smoothly: Morning (0..2km) -> Warm Dusk (2..4km) -> Deep Navy Night (4..6km)
      const phase = (state.distance % 6) / 6; // 0..1
      const daySkyTop = [14, 116, 194];
      const daySkyBot = [125, 211, 252];
      const sunsetSkyTop = [30, 58, 138];
      const sunsetSkyBot = [234, 88, 12];
      const nightSkyTop = [15, 23, 42];
      const nightSkyBot = [30, 41, 59];

      let skyTop, skyBot, nightFactor = 0, sunsetFactor = 0;
      if (phase < 0.33) {
        const t = phase / 0.33;
        skyTop = lerpColor(daySkyTop, sunsetSkyTop, Math.max(0, (t - 0.6) / 0.4));
        skyBot = lerpColor(daySkyBot, sunsetSkyBot, Math.max(0, (t - 0.6) / 0.4));
        sunsetFactor = Math.max(0, (t - 0.6) / 0.4);
      } else if (phase < 0.66) {
        const t = (phase - 0.33) / 0.33;
        skyTop = lerpColor(sunsetSkyTop, nightSkyTop, Math.max(0, (t - 0.55) / 0.45));
        skyBot = lerpColor(sunsetSkyBot, nightSkyBot, Math.max(0, (t - 0.55) / 0.45));
        sunsetFactor = 1 - Math.max(0, (t - 0.55) / 0.45);
        nightFactor = Math.max(0, (t - 0.55) / 0.45);
      } else {
        const t = (phase - 0.66) / 0.34;
        skyTop = lerpColor(nightSkyTop, daySkyTop, Math.max(0, (t - 0.65) / 0.35));
        skyBot = lerpColor(nightSkyBot, daySkyBot, Math.max(0, (t - 0.65) / 0.35));
        nightFactor = 1 - Math.max(0, (t - 0.65) / 0.35);
      }
      return { skyTop, skyBot, nightFactor, sunsetFactor };
    }

    function drawSkyAndSurabayaHorizon(palette) {
      const grad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
      grad.addColorStop(0, palette.skyTop);
      grad.addColorStop(1, palette.skyBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, HORIZON_Y);

      // Stars at night
      if (palette.nightFactor > 0.15) {
        ctx.fillStyle = '#fef9c3';
        for (const s of state.stars) {
          const alpha = palette.nightFactor * (0.5 + 0.5 * Math.sin(state.time * 3 + s.phase));
          ctx.globalAlpha = alpha;
          ctx.fillRect(s.x, s.y, 2, 2);
        }
        ctx.globalAlpha = 1;
      }

      // Retro OutRun Sun
      if (palette.nightFactor < 0.85) {
        const sunX = W * 0.52 - state.roadCurve * 45;
        const sunY = HORIZON_Y - 36 + palette.sunsetFactor * 16;
        const sunR = 30;
        ctx.save();
        ctx.globalAlpha = 1 - palette.nightFactor;
        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
        sunGrad.addColorStop(0, '#fef08a');
        sunGrad.addColorStop(0.6, '#f59e0b');
        sunGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        // Retro horizontal sun stripes
        ctx.fillStyle = palette.skyBot;
        for (let sy = sunY + 4; sy < sunY + sunR; sy += 6) {
          ctx.fillRect(sunX - sunR, sy, sunR * 2, 2);
        }
        ctx.restore();
      }

      // Pixel clouds
      ctx.fillStyle = palette.nightFactor > 0.5 ? 'rgba(148,163,184,0.22)' : 'rgba(255,255,255,0.72)';
      for (const c of state.clouds) {
        ctx.fillRect(Math.round(c.x), c.y, c.w, 10);
        ctx.fillRect(Math.round(c.x + 12), c.y - 7, c.w - 24, 8);
      }

      // Distant Surabaya Skyline Silhouette (parallax)
      const px = -state.roadCurve * 35 - state.playerX * 14;
      ctx.fillStyle = palette.nightFactor > 0.45 ? '#0f172a' : '#1e293b';

      // Suramadu Bridge twin towers on the right
      const bx = 450 + px;
      ctx.fillRect(bx, HORIZON_Y - 46, 5, 46);
      ctx.fillRect(bx + 54, HORIZON_Y - 46, 5, 46);
      ctx.fillRect(bx - 22, HORIZON_Y - 12, 104, 4);
      ctx.strokeStyle = palette.nightFactor > 0.45 ? '#38bdf8' : '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 2, HORIZON_Y - 44);
      ctx.lineTo(bx - 18, HORIZON_Y - 12);
      ctx.moveTo(bx + 2, HORIZON_Y - 44);
      ctx.lineTo(bx + 26, HORIZON_Y - 12);
      ctx.moveTo(bx + 56, HORIZON_Y - 44);
      ctx.lineTo(bx + 32, HORIZON_Y - 12);
      ctx.moveTo(bx + 56, HORIZON_Y - 44);
      ctx.lineTo(bx + 78, HORIZON_Y - 12);
      ctx.stroke();

      // City buildings & ITS Campus block on left/center
      const buildings = [
        [20, 24, 32], [58, 36, 26], [90, 20, 38], [136, 44, 24],
        [168, 28, 36], [260, 34, 28], [295, 50, 22], [326, 26, 40],
        [374, 38, 26], [560, 30, 34], [600, 22, 36],
      ];
      for (const [x, h, w] of buildings) {
        ctx.fillStyle = palette.nightFactor > 0.45 ? '#0f172a' : '#1e293b';
        ctx.fillRect(x + px, HORIZON_Y - h, w, h);
        if (palette.nightFactor > 0.25) {
          ctx.fillStyle = '#fde047';
          ctx.globalAlpha = palette.nightFactor * 0.85;
          for (let wy = HORIZON_Y - h + 5; wy < HORIZON_Y - 4; wy += 7) {
            for (let wx = x + px + 4; wx < x + px + w - 5; wx += 7) {
              if ((wx + wy) % 3 !== 0) ctx.fillRect(wx, wy, 3, 3);
            }
          }
          ctx.globalAlpha = 1;
        }
      }

      // Iconic Tugu Pahlawan obelisk!
      const tx = 224 + px;
      ctx.fillStyle = palette.nightFactor > 0.45 ? '#1e293b' : '#334155';
      ctx.beginPath();
      ctx.moveTo(tx, HORIZON_Y - 62);
      ctx.lineTo(tx - 8, HORIZON_Y);
      ctx.lineTo(tx + 8, HORIZON_Y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tx - 2, HORIZON_Y - 64, 4, 4);
    }

    function drawRoad(palette) {
      const grassLight = palette.nightFactor > 0.5 ? '#14532d' : '#2e8b3c';
      const grassDark = palette.nightFactor > 0.5 ? '#052e16' : '#237030';
      const roadLight = palette.nightFactor > 0.5 ? '#334155' : '#4b5563';
      const roadDark = palette.nightFactor > 0.5 ? '#1e293b' : '#3f4754';

      const sliceH = 2;
      for (let y = HORIZON_Y; y < H; y += sliceH) {
        const p = (y - HORIZON_Y) / (H - HORIZON_Y);
        const depth = 1 / Math.max(0.035, p);
        const band = Math.floor(depth * 1.45 + state.trackScroll * 1.8) % 2 === 0;

        const roadHalf = lerp(18, W * 0.43, p);
        const curveShift = state.roadCurve * Math.pow(1 - p, 2) * 210;
        const cameraShift = -state.playerX * p * (W * 0.43) * 0.72;
        const centerX = W / 2 + curveShift + cameraShift;
        const kerbW = Math.max(2, roadHalf * 0.085);

        // Grass
        ctx.fillStyle = band ? grassLight : grassDark;
        ctx.fillRect(0, y, W, sliceH);

        // Kerbs (red/white Indonesian road shoulder)
        ctx.fillStyle = band ? '#dc2626' : '#f8fafc';
        ctx.fillRect(centerX - roadHalf - kerbW, y, roadHalf * 2 + kerbW * 2, sliceH);

        // Asphalt
        ctx.fillStyle = band ? roadLight : roadDark;
        ctx.fillRect(centerX - roadHalf, y, roadHalf * 2, sliceH);

        // Dashed 3-lane markings
        if (band) {
          const dashW = Math.max(1.5, roadHalf * 0.025);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(centerX - roadHalf * 0.34 - dashW / 2, y, dashW, sliceH);
          ctx.fillRect(centerX + roadHalf * 0.34 - dashW / 2, y, dashW, sliceH);
        }
      }
    }

    function drawProp(prop, nightFactor) {
      const { p, y, roadHalf, centerX } = projectZ(prop.z);
      if (p <= 0.02 || p > 1.1) return;
      const x = centerX + prop.side * roadHalf * prop.offset;
      const s = p;

      if (prop.type === 'palm') {
        const trunkH = 95 * s;
        const trunkW = Math.max(2, 9 * s);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);
        // Fronds
        ctx.fillStyle = nightFactor > 0.5 ? '#15803d' : '#16a34a';
        const topY = y - trunkH;
        const r = 30 * s;
        ctx.fillRect(x - r, topY - 4 * s, r * 2, 7 * s);
        ctx.fillRect(x - r * 0.75, topY - 12 * s, r * 1.5, 8 * s);
        ctx.fillRect(x - r * 0.9, topY + 2 * s, r * 0.65, 6 * s);
        ctx.fillRect(x + r * 0.25, topY + 2 * s, r * 0.65, 6 * s);
      } else if (prop.type === 'lamp') {
        const poleH = 88 * s;
        const poleW = Math.max(1.5, 4 * s);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x - poleW / 2, y - poleH, poleW, poleH);
        const armX = prop.side < 0 ? x : x - 20 * s;
        ctx.fillRect(armX, y - poleH, 20 * s, Math.max(1.5, 3 * s));
        // Glow bulb
        const bulbX = prop.side < 0 ? x + 18 * s : x - 18 * s;
        ctx.fillStyle = nightFactor > 0.3 ? '#fef08a' : '#e2e8f0';
        ctx.fillRect(bulbX - 3 * s, y - poleH + 2 * s, 6 * s, 4 * s);
      } else if (prop.type === 'billboard') {
        const bw = 96 * s;
        const bh = 38 * s;
        const postH = 54 * s;
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - bw * 0.3, y - postH, Math.max(2, 4 * s), postH);
        ctx.fillRect(x + bw * 0.26, y - postH, Math.max(2, 4 * s), postH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - bw / 2 - 2 * s, y - postH - bh - 2 * s, bw + 4 * s, bh + 4 * s);
        ctx.fillStyle = prop.billboard.bg;
        ctx.fillRect(x - bw / 2, y - postH - bh, bw, bh);
        if (s > 0.22) {
          ctx.fillStyle = prop.billboard.fg;
          ctx.font = `bold ${Math.max(7, Math.round(11 * s))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(prop.billboard.text, x, y - postH - bh * 0.4);
        }
      }
    }

    function drawEntity(ent) {
      const { p, y, roadHalf, centerX } = projectZ(ent.z);
      if (p <= 0.02 || p > 1.12) return;
      const x = centerX + ent.lane * roadHalf;
      const s = p;

      if (ent.kind === 'pickup') {
        const bob = Math.sin(state.time * 8 + ent.z * 10) * 5 * s;
        const py = y - 24 * s + bob;
        // Golden glow halo
        ctx.save();
        ctx.fillStyle = ent.type === 'star' ? 'rgba(250, 204, 21, 0.35)' : 'rgba(251, 146, 60, 0.35)';
        ctx.beginPath();
        ctx.arc(x, py, 24 * s, 0, Math.PI * 2);
        ctx.fill();

        if (ent.type === 'kopi') {
          // Iced coffee cup (Kopi Susu)
          const cw = 22 * s;
          const ch = 26 * s;
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(x - cw / 2, py - ch / 2, cw, ch);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x - cw / 2 + 2 * s, py - ch * 0.1, cw - 4 * s, ch * 0.55);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x - cw * 0.58, py - ch / 2 - 3 * s, cw * 1.16, 4 * s);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 2 * s, py - ch / 2 - 12 * s, 3 * s, 10 * s);
        } else {
          // 5-Star golden badge
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(x, py, 16 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = Math.max(1, 2 * s);
          ctx.stroke();
          if (s > 0.25) {
            ctx.fillStyle = '#713f12';
            ctx.font = `bold ${Math.max(8, Math.round(13 * s))}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('★5', x, py + 4 * s);
          }
        }
        ctx.restore();
        return;
      }

      // Shadow under traffic vehicle
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.fillRect(x - 42 * s, y - 4 * s, 84 * s, 7 * s);

      if (ent.type === 'angkot') {
        // Iconic Indonesian Blue Angkot
        const w = 78 * s;
        const h = 64 * s;
        // Wheels
        ctx.fillStyle = '#111827';
        ctx.fillRect(x - w * 0.44, y - 12 * s, 13 * s, 12 * s);
        ctx.fillRect(x + w * 0.44 - 13 * s, y - 12 * s, 13 * s, 12 * s);
        // Body
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x - w / 2, y - h, w, h - 6 * s);
        // Roof highlight
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x - w * 0.44, y - h - 5 * s, w * 0.88, 6 * s);
        // Yellow stripe
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x - w / 2, y - h * 0.42, w, 7 * s);
        // Rear glass
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - w * 0.38, y - h + 7 * s, w * 0.76, h * 0.36);
        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - w * 0.46, y - 20 * s, 10 * s, 7 * s);
        ctx.fillRect(x + w * 0.46 - 10 * s, y - 20 * s, 10 * s, 7 * s);
        // Plate
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x - 12 * s, y - 18 * s, 24 * s, 7 * s);
      } else if (ent.type === 'bus') {
        // Iconic Red & White Bus Suroboyo
        const w = 96 * s;
        const h = 104 * s;
        ctx.fillStyle = '#111827';
        ctx.fillRect(x - w * 0.45, y - 14 * s, 15 * s, 14 * s);
        ctx.fillRect(x + w * 0.45 - 15 * s, y - 14 * s, 15 * s, 14 * s);
        // Lower red body
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x - w / 2, y - h, w, h - 8 * s);
        // White middle stripe
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - w / 2, y - h * 0.56, w, h * 0.2);
        // Rear window
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - w * 0.42, y - h + 14 * s, w * 0.84, h * 0.26);
        // Destination LED
        ctx.fillStyle = '#09090b';
        ctx.fillRect(x - w * 0.34, y - h + 4 * s, w * 0.68, 8 * s);
        if (s > 0.35) {
          ctx.fillStyle = '#facc15';
          ctx.font = `bold ${Math.max(6, Math.round(8 * s))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('SUROBOYO', x, y - h + 11 * s);
        }
        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - w * 0.45, y - 24 * s, 12 * s, 8 * s);
        ctx.fillRect(x + w * 0.45 - 12 * s, y - 24 * s, 12 * s, 8 * s);
      } else if (ent.type === 'bajaj') {
        // Orange-Red Bajaj
        const w = 64 * s;
        const h = 62 * s;
        ctx.fillStyle = '#111827';
        ctx.fillRect(x - w * 0.44, y - 10 * s, 10 * s, 10 * s);
        ctx.fillRect(x + w * 0.44 - 10 * s, y - 10 * s, 10 * s, 10 * s);
        // Lower orange body
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x - w / 2, y - h * 0.58, w, h * 0.5);
        // Black canvas top
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x - w * 0.44, y - h, w * 0.88, h * 0.46);
        // Plastic rear oval window
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x - w * 0.26, y - h * 0.86, w * 0.52, h * 0.22);
        // Taillights
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x - w * 0.42, y - 18 * s, 8 * s, 6 * s);
        ctx.fillRect(x + w * 0.42 - 8 * s, y - 18 * s, 8 * s, 6 * s);
      } else {
        // Gerobak Bakso!
        const w = 70 * s;
        const h = 68 * s;
        // Umbrella above cart
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.62, y - h - 4 * s);
        ctx.lineTo(x, y - h - 24 * s);
        ctx.lineTo(x + w * 0.62, y - h - 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x - 2 * s, y - h - 6 * s, 4 * s, 16 * s);
        // Wheels
        ctx.fillStyle = '#111827';
        ctx.fillRect(x - w * 0.46, y - 14 * s, 8 * s, 14 * s);
        ctx.fillRect(x + w * 0.46 - 8 * s, y - 14 * s, 8 * s, 14 * s);
        // Wooden cart
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - w / 2, y - h * 0.52, w, h * 0.42);
        // Glass noodle/bakso display case
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x - w * 0.44, y - h * 0.94, w * 0.88, h * 0.42);
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = Math.max(1, 2 * s);
        ctx.strokeRect(x - w * 0.44, y - h * 0.94, w * 0.88, h * 0.42);
        // Red BAKSO banner
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x - w * 0.46, y - h * 0.48, w * 0.92, 13 * s);
        if (s > 0.3) {
          ctx.fillStyle = '#fef08a';
          ctx.font = `bold ${Math.max(7, Math.round(10 * s))}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('BAKSO', x, y - h * 0.34);
        }
      }
    }

    function drawPlayerScooter() {
      // Blink during invulnerability
      if (state.invulnTimer > 0 && Math.floor(state.invulnTimer * 14) % 2 === 0) {
        return;
      }

      const bounce = state.mode === 'playing' ? Math.sin(state.time * (14 + state.speed * 0.12)) * 2.2 : 0;
      const baseX = W / 2;
      const baseY = H - 30 + bounce;

      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(state.playerLean * 0.18);

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nitro blue/gold flame exhaust
      if (state.nitroActive > 0) {
        const fl = 14 + Math.random() * 14;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-10, 6);
        ctx.lineTo(-5, 6 + fl);
        ctx.lineTo(0, 6);
        ctx.moveTo(0, 6);
        ctx.lineTo(5, 6 + fl);
        ctx.lineTo(10, 6);
        ctx.fill();
      }

      // Rear tire
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, -14, 14, 26);
      // Tire tread animation
      ctx.fillStyle = '#334155';
      const treadOff = Math.floor(state.trackScroll * 12) % 6;
      ctx.fillRect(-5, -12 + treadOff, 10, 3);
      ctx.fillRect(-5, -2 + treadOff, 10, 3);

      // Scooter body / fender
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-19, -34, 38, 24);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-16, -32, 32, 12);

      // Taillight & blinkers
      ctx.fillStyle = keys.down ? '#ff1e1e' : '#dc2626';
      ctx.fillRect(-8, -26, 16, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-15, -25, 5, 4);
      ctx.fillRect(10, -25, 5, 4);

      // Surabaya License Plate ("L 95 AI")
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-10, -18, 20, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('L95AI', 0, -12);

      // Handlebars & mirrors
      ctx.fillStyle = '#475569';
      ctx.fillRect(-30, -52, 60, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-33, -60, 8, 6);
      ctx.fillRect(25, -60, 8, 6);

      // Driver torso (Iconic bright green Ojek Online jacket!)
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-18, -68, 36, 34);
      // Jacket black shoulders & neon stripe
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18, -68, 36, 9);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-14, -55, 28, 5);
      // Arms gripping handlebars
      ctx.fillStyle = '#166534';
      ctx.fillRect(-25, -60, 8, 12);
      ctx.fillRect(17, -60, 8, 12);

      // Iconic green helmet with white racing stripe
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, -79, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2.5, -93, 5, 22);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -76, 22, 4);

      ctx.restore();

      // Klakson speech bubble ("TIN-TIN!")
      if (state.honkTimer > 0) {
        const bx = baseX + 44;
        const by = baseY - 96;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx - 36, by - 14, 72, 20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 36, by - 14, 72, 20);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TIN-TIN!!', bx, by);
      }
    }

    function render() {
      ctx.save();
      if (state.shakeTimer > 0) {
        const mag = state.shakeTimer * 14;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      const palette = getTimeOfDayPalette();
      drawSkyAndSurabayaHorizon(palette);
      drawRoad(palette);

      // Combine props and traffic/pickups and sort back-to-front (largest z first)
      const drawList = [];
      for (const prop of state.props) {
        drawList.push({ z: prop.z, isProp: true, item: prop });
      }
      for (const ent of state.entities) {
        drawList.push({ z: ent.z, isProp: false, item: ent });
      }
      drawList.sort((a, b) => b.z - a.z);

      for (const entry of drawList) {
        if (entry.isProp) drawProp(entry.item, palette.nightFactor);
        else drawEntity(entry.item);
      }

      // Particles
      for (const pt of state.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = clamp(pt.life * 2, 0, 1);
        ctx.fillRect(pt.x - 2, pt.y - 2, 5, 5);
      }
      ctx.globalAlpha = 1;

      drawPlayerScooter();

      // Nitro speed lines
      if (state.nitroActive > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + state.time * 4;
          const x1 = W / 2 + Math.cos(angle) * 140;
          const y1 = H / 2 + Math.sin(angle) * 90;
          const x2 = W / 2 + Math.cos(angle) * 330;
          const y2 = H / 2 + Math.sin(angle) * 220;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Floating score/near-miss popups
      for (const pop of state.popups) {
        ctx.save();
        ctx.globalAlpha = clamp(pop.life * 1.4, 0, 1);
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(pop.text, pop.x + 1, pop.y + 1);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }

      // Zone banner
      if (state.mode === 'playing' && state.zoneBannerTimer > 0) {
        const zoneName = ROAD_ZONES[state.zoneIndex].name;
        ctx.save();
        ctx.globalAlpha = clamp(state.zoneBannerTimer, 0, 1);
        ctx.fillStyle = 'rgba(0, 0, 128, 0.85)';
        ctx.fillRect(W / 2 - 125, 14, 250, 26);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 125, 14, 250, 26);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`ROUTE: ${zoneName}`, W / 2, 31);
        ctx.restore();
      }

      ctx.restore();
    }

    function loop(ts) {
      if (disposed) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;
      update(dt);
      render();
      rafId = requestAnimationFrame(loop);
    }

    // Check if our window should handle keyboard events
    function isWindowFocused() {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return false;
      }
      if (winApi.el && winApi.el.classList.contains('active')) return true;
      if (winApi.el && winApi.el.classList.contains('is-active')) return true;
      // Fallback: if our container or canvas has focus
      return containerEl.contains(activeEl);
    }

    function onKeyDown(e) {
      if (!isWindowFocused()) return;
      const code = e.code;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(code)) {
        e.preventDefault();
      }
      if (code === 'ArrowLeft' || code === 'KeyA') keys.left = true;
      if (code === 'ArrowRight' || code === 'KeyD') keys.right = true;
      if (code === 'ArrowUp' || code === 'KeyW') keys.up = true;
      if (code === 'ArrowDown' || code === 'KeyS') keys.down = true;

      if (code === 'Space') {
        if (state.mode === 'start' || state.mode === 'gameover') resetGame();
        else triggerHonkOrNitro();
      } else if (code === 'Enter') {
        if (state.mode === 'start' || state.mode === 'gameover') resetGame();
        else if (state.mode === 'paused') togglePause();
      } else if (code === 'KeyP') {
        if (state.mode === 'playing' || state.mode === 'paused') togglePause();
      }
    }

    function onKeyUp(e) {
      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') keys.left = false;
      if (code === 'ArrowRight' || code === 'KeyD') keys.right = false;
      if (code === 'ArrowUp' || code === 'KeyW') keys.up = false;
      if (code === 'ArrowDown' || code === 'KeyS') keys.down = false;
    }

    // Button clicks (Start / Pause / Restart)
    containerEl.addEventListener('click', (e) => {
      winApi.focus();
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'start' || action === 'restart') resetGame();
      else if (action === 'resume' || action === 'toggle-pause') togglePause();
    });

    // Mobile / Touch pointer controls
    const ctrlBtns = containerEl.querySelectorAll('[data-ctrl]');
    ctrlBtns.forEach((btn) => {
      const ctrl = btn.dataset.ctrl;
      const press = (ev) => {
        ev.preventDefault();
        winApi.focus();
        btn.classList.add('is-pressed');
        if (ctrl === 'nitro') {
          if (state.mode === 'start' || state.mode === 'gameover') resetGame();
          else triggerHonkOrNitro();
        } else {
          keys[ctrl] = true;
        }
      };
      const release = () => {
        btn.classList.remove('is-pressed');
        if (ctrl !== 'nitro') keys[ctrl] = false;
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    initScenery();
    updateHud();
    winApi.setStatus('Ojek Rush 95 Ready — Press Start or Enter to ride Surabaya!');
    rafId = requestAnimationFrame(loop);

    winApi.onClose(() => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      for (const id of activeTimeouts) clearTimeout(id);
      activeTimeouts.clear();
    });
  },
};

// ============================================================================
// APP 2: MINESWEEPER 95 — Authentic Classic Win95 Minesweeper
// ============================================================================

const MINE_MODES = {
  beginner: { label: 'Beginner (9×9)', rows: 9, cols: 9, mines: 10 },
  intermediate: { label: 'Intermediate (16×16)', rows: 16, cols: 16, mines: 40 },
};

function formatLed(num) {
  const clamped = clamp(Math.floor(num), -99, 999);
  if (clamped < 0) {
    return '-' + String(Math.abs(clamped)).padStart(2, '0');
  }
  return String(clamped).padStart(3, '0');
}

export const minesweeperApp = {
  id: 'minesweeper',
  title: 'Minesweeper',
  icon: 'minesweeper',
  width: 340,
  height: 430,
  minWidth: 280,
  minHeight: 370,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    containerEl.innerHTML = `
      <div class="ms-app">
        <div class="ms-toolbar win95-toolbar">
          <div class="ms-diff-group">
            <button type="button" class="win95-btn ms-diff-btn is-active" data-mode="beginner">Beginner 9×9</button>
            <button type="button" class="win95-btn ms-diff-btn" data-mode="intermediate">Intermediate 16×16</button>
          </div>
          <button type="button" class="win95-btn ms-flag-toggle" data-action="toggle-flag" title="Toggle Flag Mode for touch devices">Flag Mode: OFF</button>
        </div>

        <div class="ms-cabinet win95-raised">
          <div class="ms-header win95-sunken">
            <div class="ms-led" data-ms="mines" aria-label="Remaining mines">010</div>
            <button type="button" class="win95-btn ms-smiley" data-action="reset" title="New Game">🙂</button>
            <div class="ms-led" data-ms="timer" aria-label="Elapsed seconds">000</div>
          </div>

          <div class="ms-board-scroll">
            <div class="ms-board win95-sunken" data-ms="board"></div>
          </div>
        </div>
      </div>
    `;

    const boardEl = containerEl.querySelector('[data-ms="board"]');
    const minesLed = containerEl.querySelector('[data-ms="mines"]');
    const timerLed = containerEl.querySelector('[data-ms="timer"]');
    const smileyBtn = containerEl.querySelector('[data-action="reset"]');
    const flagToggleBtn = containerEl.querySelector('[data-action="toggle-flag"]');
    const diffBtns = containerEl.querySelectorAll('.ms-diff-btn');

    let currentModeKey = 'beginner';
    let rows = 9;
    let cols = 9;
    let totalMines = 10;
    let cells = [];
    let firstClick = true;
    let gameOver = false;
    let won = false;
    let flagMode = false;
    let flagsPlaced = 0;
    let revealedCount = 0;
    let elapsed = 0;
    let timerId = null;
    const msTimeouts = new Set();

    function scheduleMsTimeout(fn, ms) {
      const id = setTimeout(() => {
        msTimeouts.delete(id);
        fn();
      }, ms);
      msTimeouts.add(id);
    }

    function loadBestTimes() {
      try {
        return JSON.parse(safeStorageGet(MINE_BEST_KEY, '{}')) || {};
      } catch {
        return {};
      }
    }

    function saveBestTime(modeKey, seconds) {
      const best = loadBestTimes();
      if (best[modeKey] === undefined || seconds < best[modeKey]) {
        best[modeKey] = seconds;
        safeStorageSet(MINE_BEST_KEY, JSON.stringify(best));
        return true;
      }
      return false;
    }

    function stopTimer() {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
    }

    function startTimer() {
      if (timerId !== null) return;
      timerId = setInterval(() => {
        elapsed = Math.min(999, elapsed + 1);
        timerLed.textContent = formatLed(elapsed);
      }, 1000);
    }

    function updateStatus(extra = '') {
      const best = loadBestTimes()[currentModeKey];
      const bestTxt = best !== undefined ? ` | Best: ${best}s` : '';
      const modeName = MINE_MODES[currentModeKey].label;
      winApi.setStatus(`${modeName}${bestTxt}${extra ? ' — ' + extra : ''}`);
    }

    function getNeighbors(r, c) {
      const list = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            list.push(nr * cols + nc);
          }
        }
      }
      return list;
    }

    function placeMines(safeIndex) {
      const safeRow = Math.floor(safeIndex / cols);
      const safeCol = safeIndex % cols;
      const forbidden = new Set([safeIndex]);
      // Keep 3x3 patch around first click mine-free when possible
      for (const nIdx of getNeighbors(safeRow, safeCol)) {
        forbidden.add(nIdx);
      }

      const candidates = [];
      for (let i = 0; i < rows * cols; i++) {
        if (!forbidden.has(i)) candidates.push(i);
      }

      // Fisher-Yates shuffle
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      const mineSpots = candidates.slice(0, totalMines);
      for (const idx of mineSpots) {
        cells[idx].mine = true;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (cells[idx].mine) continue;
          let count = 0;
          for (const nIdx of getNeighbors(r, c)) {
            if (cells[nIdx].mine) count++;
          }
          cells[idx].adj = count;
        }
      }
    }

    function renderCell(idx) {
      const cell = cells[idx];
      const el = cell.el;
      el.className = 'ms-cell';
      el.textContent = '';

      if (cell.revealed) {
        el.classList.add('ms-open');
        if (cell.mine) {
          el.textContent = '💣';
          if (cell.detonated) el.classList.add('ms-mine-hit');
        } else if (cell.adj > 0) {
          el.textContent = String(cell.adj);
          el.classList.add(`ms-n${cell.adj}`);
        }
      } else {
        el.classList.add('ms-closed');
        if (cell.flagged) {
          if (gameOver && !won && !cell.mine) {
            el.classList.add('ms-flag-wrong');
            el.textContent = '❌';
          } else {
            el.textContent = '🚩';
          }
        }
      }
    }

    function checkWin() {
      const safeCells = rows * cols - totalMines;
      if (revealedCount >= safeCells && !gameOver) {
        gameOver = true;
        won = true;
        stopTimer();
        smileyBtn.textContent = '😎';
        // Auto-flag remaining mines
        for (let i = 0; i < cells.length; i++) {
          if (cells[i].mine && !cells[i].flagged) {
            cells[i].flagged = true;
            flagsPlaced++;
            renderCell(i);
          }
        }
        minesLed.textContent = formatLed(0);
        const isRecord = saveBestTime(currentModeKey, elapsed);
        sound.playBeep(660, 0.08);
        scheduleMsTimeout(() => sound.playBeep(880, 0.08), 90);
        scheduleMsTimeout(() => sound.playBeep(1100, 0.14), 180);
        updateStatus(isRecord ? `YOU WIN in ${elapsed}s! NEW RECORD!` : `YOU WIN in ${elapsed}s!`);
      }
    }

    function revealCell(startIdx) {
      if (gameOver) return;
      const startCell = cells[startIdx];
      if (startCell.flagged) return;

      // Chord reveal when clicking already-revealed numbered cell
      if (startCell.revealed) {
        if (startCell.adj > 0) {
          const r = Math.floor(startIdx / cols);
          const c = startIdx % cols;
          const neighbors = getNeighbors(r, c);
          const adjFlags = neighbors.filter((n) => cells[n].flagged).length;
          if (adjFlags === startCell.adj) {
            for (const n of neighbors) {
              if (!cells[n].revealed && !cells[n].flagged) {
                revealCell(n);
                if (gameOver) return;
              }
            }
          }
        }
        return;
      }

      if (firstClick) {
        firstClick = false;
        placeMines(startIdx);
        startTimer();
      }

      if (startCell.mine) {
        startCell.revealed = true;
        startCell.detonated = true;
        gameOver = true;
        won = false;
        stopTimer();
        smileyBtn.textContent = '😵';
        sound.playError();
        // Reveal all mines & check wrong flags
        for (let i = 0; i < cells.length; i++) {
          if (cells[i].mine && !cells[i].flagged) {
            cells[i].revealed = true;
          }
          renderCell(i);
        }
        updateStatus('BOOM! Click the smiley to try again.');
        return;
      }

      // BFS flood-fill for 0-adjacent cells
      const queue = [startIdx];
      while (queue.length > 0) {
        const idx = queue.shift();
        const cell = cells[idx];
        if (cell.revealed || cell.flagged || cell.mine) continue;
        cell.revealed = true;
        revealedCount++;
        renderCell(idx);
        if (cell.adj === 0) {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          for (const nIdx of getNeighbors(r, c)) {
            if (!cells[nIdx].revealed && !cells[nIdx].flagged) {
              queue.push(nIdx);
            }
          }
        }
      }

      sound.playClick();
      checkWin();
    }

    function toggleFlag(idx) {
      if (gameOver) return;
      const cell = cells[idx];
      if (cell.revealed) return;
      cell.flagged = !cell.flagged;
      flagsPlaced += cell.flagged ? 1 : -1;
      minesLed.textContent = formatLed(totalMines - flagsPlaced);
      renderCell(idx);
      sound.playBeep(cell.flagged ? 700 : 480, 0.04);
    }

    function buildBoard(modeKey) {
      stopTimer();
      currentModeKey = modeKey;
      const cfg = MINE_MODES[modeKey];
      rows = cfg.rows;
      cols = cfg.cols;
      totalMines = cfg.mines;
      firstClick = true;
      gameOver = false;
      won = false;
      flagsPlaced = 0;
      revealedCount = 0;
      elapsed = 0;

      minesLed.textContent = formatLed(totalMines);
      timerLed.textContent = formatLed(0);
      smileyBtn.textContent = '🙂';

      diffBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === modeKey));

      boardEl.style.gridTemplateColumns = `repeat(${cols}, 24px)`;
      boardEl.innerHTML = '';
      cells = [];

      const frag = document.createDocumentFragment();
      for (let i = 0; i < rows * cols; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ms-cell ms-closed';
        btn.dataset.idx = String(i);
        btn.setAttribute('aria-label', `Cell ${i + 1}`);
        frag.appendChild(btn);
        cells.push({
          mine: false,
          adj: 0,
          revealed: false,
          flagged: false,
          detonated: false,
          el: btn,
        });
      }
      boardEl.appendChild(frag);
      updateStatus('Right-click (or Flag Mode) to mark mines');
    }

    const onBoardPointerDown = (e) => {
      if (gameOver) return;
      const cellEl = e.target.closest('.ms-cell');
      if (!cellEl) return;
      if (e.button === 0) {
        smileyBtn.textContent = '😮';
      }
    };

    const onGlobalPointerUp = () => {
      if (!gameOver) smileyBtn.textContent = '🙂';
    };

    boardEl.addEventListener('pointerdown', onBoardPointerDown);
    window.addEventListener('pointerup', onGlobalPointerUp);

    boardEl.addEventListener('click', (e) => {
      const cellEl = e.target.closest('.ms-cell');
      if (!cellEl) return;
      const idx = parseInt(cellEl.dataset.idx, 10);
      if (flagMode) toggleFlag(idx);
      else revealCell(idx);
    });

    boardEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const cellEl = e.target.closest('.ms-cell');
      if (!cellEl) return;
      const idx = parseInt(cellEl.dataset.idx, 10);
      toggleFlag(idx);
    });

    containerEl.addEventListener('click', (e) => {
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) {
        sound.playClick();
        buildBoard(modeBtn.dataset.mode);
        return;
      }
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      if (actionBtn.dataset.action === 'reset') {
        sound.playClick();
        buildBoard(currentModeKey);
      } else if (actionBtn.dataset.action === 'toggle-flag') {
        flagMode = !flagMode;
        flagToggleBtn.textContent = flagMode ? 'Flag Mode: ON' : 'Flag Mode: OFF';
        flagToggleBtn.classList.toggle('is-active', flagMode);
        sound.playClick();
      }
    });

    buildBoard('beginner');

    winApi.onClose(() => {
      stopTimer();
      for (const id of msTimeouts) clearTimeout(id);
      msTimeouts.clear();
      window.removeEventListener('pointerup', onGlobalPointerUp);
    });
  },
};
