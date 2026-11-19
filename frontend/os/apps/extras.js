import { PROFILE, GUESTBOOK_SEED, WALLPAPERS } from '../data.js';
import { getIconSVG } from '../icons.js';
import { sound } from '../sound.js';

const GB_ENTRIES_KEY = 'rizkyos_guestbook_entries_v1';
const GB_HITS_KEY = 'rizkyos_guestbook_hits_v1';
const GB_SESSION_HIT_KEY = 'rizkyos_guestbook_hit_counted';

const MOOD_OPTIONS = [
  { id: 'friendly', badge: ':-)', label: 'Friendly' },
  { id: 'excited', badge: ':-D', label: 'Happy' },
  { id: 'cool', badge: '8-)', label: 'Cool' },
  { id: 'retro', badge: ';-)', label: 'Retro 95' },
  { id: 'focused', badge: 'B-)', label: 'Builder' },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
    // Ignore storage quota / private mode restrictions
  }
}

function getAndIncrementHitCounter() {
  let count = parseInt(safeStorageGet(GB_HITS_KEY, '1995'), 10);
  if (!Number.isFinite(count) || count < 1995) count = 1995;
  try {
    if (!sessionStorage.getItem(GB_SESSION_HIT_KEY)) {
      count += 1;
      safeStorageSet(GB_HITS_KEY, count);
      sessionStorage.setItem(GB_SESSION_HIT_KEY, '1');
    }
  } catch {
    // Ignore sessionStorage restrictions
  }
  return String(count).padStart(6, '0');
}

function loadLocalGuestbook() {
  try {
    const raw = safeStorageGet(GB_ENTRIES_KEY, '[]');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalGuestbook(entries) {
  safeStorageSet(GB_ENTRIES_KEY, JSON.stringify(entries.slice(0, 50)));
}

function formatTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ============================================================================
// APP 1: RIZKYBOOK 95 — RETRO 90s GUESTBOOK
// ============================================================================

export const guestbookApp = {
  id: 'guestbook',
  title: 'RizkyBook 95 — Guestbook',
  icon: 'guestbook',
  width: 580,
  height: 540,
  minWidth: 360,
  minHeight: 380,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    const hitDigits = getAndIncrementHitCounter();
    let selectedMood = MOOD_OPTIONS[0].badge;

    containerEl.innerHTML = `
      <div class="gb-app win95-scrollbar">
        <div class="gb-header win95-raised">
          <div class="gb-header-left">
            <div class="gb-header-icon">${getIconSVG('guestbook', 32)}</div>
            <div class="gb-header-text">
              <h2 class="gb-title">RizkyBook 95</h2>
              <p class="gb-subtitle">Public Visitor Guestbook — ${escapeHtml(PROFILE?.fullName || 'Rizky Alviando')}</p>
            </div>
          </div>
          <div class="gb-counter-wrap">
            <span class="gb-counter-label">VISITORS</span>
            <div class="gb-counter-led" aria-label="Visitor hit counter">${escapeHtml(hitDigits)}</div>
          </div>
        </div>

        <div class="gb-badges" aria-label="Retro web badges">
          <span class="gb-badge gb-badge-teal">RIZKYOS 95</span>
          <span class="gb-badge gb-badge-navy">ITS SURABAYA</span>
          <span class="gb-badge gb-badge-slate">GROQ AI INSIDE</span>
          <span class="gb-badge gb-badge-maroon">HTML5 · NO FRAMES</span>
        </div>

        <fieldset class="win95-groupbox gb-form-box">
          <legend>Sign the Guestbook</legend>
          <form class="gb-form" data-gb="form" novalidate>
            <div class="gb-form-grid">
              <label class="gb-field-group">
                <span class="gb-label">Name *</span>
                <input
                  type="text"
                  name="name"
                  class="win95-field gb-input"
                  maxlength="40"
                  placeholder="Nama atau handle kamu"
                  required
                />
              </label>
              <label class="gb-field-group">
                <span class="gb-label">Origin / Company</span>
                <input
                  type="text"
                  name="from"
                  class="win95-field gb-input"
                  maxlength="50"
                  placeholder="Surabaya / Recruiter / ITS"
                />
              </label>
            </div>

            <div class="gb-mood-row">
              <span class="gb-label">Mood:</span>
              <div class="gb-mood-list" data-gb="moods">
                ${MOOD_OPTIONS.map(
                  (m, i) => `
                  <button
                    type="button"
                    class="win95-btn gb-mood-btn${i === 0 ? ' is-active' : ''}"
                    data-mood="${escapeHtml(m.badge)}"
                    title="${escapeHtml(m.label)}"
                  ><span class="gb-mood-code">${escapeHtml(m.badge)}</span> ${escapeHtml(m.label)}</button>`
                ).join('')}
              </div>
            </div>

            <label class="gb-field-group">
              <div class="gb-label-row">
                <span class="gb-label">Message *</span>
                <span class="gb-char-count" data-gb="chars">0 / 280</span>
              </div>
              <textarea
                name="message"
                class="win95-field gb-textarea"
                rows="3"
                maxlength="280"
                placeholder="Tinggalkan pesan, kesan, atau feedback untuk Rizky..."
                required
              ></textarea>
            </label>

            <div class="gb-form-footer">
              <span class="gb-feedback" data-gb="feedback" aria-live="polite"></span>
              <div class="gb-form-actions">
                <button type="button" class="win95-btn" data-gb="clear">Clear</button>
                <button type="submit" class="win95-btn primary gb-submit-btn">Post Entry</button>
              </div>
            </div>
          </form>
        </fieldset>

        <div class="gb-entries-header">
          <strong>Recent Signatures</strong>
          <span class="gb-entries-count" data-gb="count">0 entries</span>
        </div>

        <div class="gb-entries" data-gb="entries"></div>
      </div>
    `;

    const formEl = containerEl.querySelector('[data-gb="form"]');
    const nameInput = formEl.elements.name;
    const fromInput = formEl.elements.from;
    const msgInput = formEl.elements.message;
    const charsEl = containerEl.querySelector('[data-gb="chars"]');
    const feedbackEl = containerEl.querySelector('[data-gb="feedback"]');
    const entriesEl = containerEl.querySelector('[data-gb="entries"]');
    const countEl = containerEl.querySelector('[data-gb="count"]');
    const moodBtns = containerEl.querySelectorAll('.gb-mood-btn');

    function renderEntries() {
      const localEntries = loadLocalGuestbook();
      const seedEntries = Array.isArray(GUESTBOOK_SEED) ? GUESTBOOK_SEED : [];
      const allEntries = [
        ...localEntries.map((e) => ({ ...e, _local: true })),
        ...seedEntries.map((e) => ({ ...e, _local: false })),
      ];

      countEl.textContent = `${allEntries.length} ${allEntries.length === 1 ? 'entry' : 'entries'}`;
      winApi.setStatus(`RizkyBook 95 — ${allEntries.length} signatures | Visitor #${hitDigits}`);

      if (allEntries.length === 0) {
        entriesEl.innerHTML = '<div class="gb-empty win95-sunken">Belum ada pesan. Jadilah yang pertama menandatangani guestbook ini!</div>';
        return;
      }

      entriesEl.innerHTML = allEntries
        .map((entry) => {
          const mood = escapeHtml(entry.mood || ':-)');
          const name = escapeHtml(entry.name || 'Anonymous');
          const from = escapeHtml(entry.from || 'Internet Visitor');
          const date = escapeHtml(entry.date || '');
          const message = escapeHtml(entry.message || '');
          const idAttr = escapeHtml(entry.id || '');
          const deleteBtn = entry._local
            ? `<button type="button" class="win95-btn gb-del-btn" data-delete-id="${idAttr}" title="Remove your local entry">Remove</button>`
            : '';

          return `
            <article class="gb-card win95-raised">
              <div class="gb-card-head">
                <div class="gb-card-author">
                  <span class="gb-card-mood" aria-hidden="true">${mood}</span>
                  <strong class="gb-card-name">${name}</strong>
                  <span class="gb-card-from">${from}</span>
                </div>
                <div class="gb-card-meta">
                  <span class="gb-card-date">${date}</span>
                  ${deleteBtn}
                </div>
              </div>
              <p class="gb-card-msg">${message}</p>
            </article>
          `;
        })
        .join('');
    }

    function setFeedback(text, isError = false) {
      feedbackEl.textContent = text;
      feedbackEl.classList.toggle('is-error', isError);
    }

    msgInput.addEventListener('input', () => {
      charsEl.textContent = `${msgInput.value.length} / 280`;
    });

    containerEl.addEventListener('click', (e) => {
      const moodBtn = e.target.closest('.gb-mood-btn');
      if (moodBtn) {
        selectedMood = moodBtn.dataset.mood || MOOD_OPTIONS[0].badge;
        moodBtns.forEach((b) => b.classList.toggle('is-active', b === moodBtn));
        sound.playClick();
        return;
      }

      const clearBtn = e.target.closest('[data-gb="clear"]');
      if (clearBtn) {
        formEl.reset();
        charsEl.textContent = '0 / 280';
        setFeedback('');
        sound.playClick();
        return;
      }

      const delBtn = e.target.closest('[data-delete-id]');
      if (delBtn) {
        const targetId = delBtn.dataset.deleteId;
        const next = loadLocalGuestbook().filter((item) => String(item.id) !== targetId);
        saveLocalGuestbook(next);
        sound.playClick();
        setFeedback('Entry removed.');
        renderEntries();
      }
    });

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const from = fromInput.value.trim() || 'Internet Visitor';
      const message = msgInput.value.trim();

      if (!name) {
        setFeedback('Nama wajib diisi.', true);
        sound.playError();
        nameInput.focus();
        return;
      }
      if (!message) {
        setFeedback('Pesan tidak boleh kosong.', true);
        sound.playError();
        msgInput.focus();
        return;
      }

      const newEntry = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.slice(0, 40),
        from: from.slice(0, 50),
        mood: selectedMood,
        date: formatTodayDate(),
        message: message.slice(0, 280),
      };

      const existing = loadLocalGuestbook();
      saveLocalGuestbook([newEntry, ...existing]);

      formEl.reset();
      charsEl.textContent = '0 / 280';
      setFeedback('Terima kasih! Pesan kamu sudah tersimpan.');
      sound.playMessage();
      renderEntries();
    });

    renderEntries();
  },
};

// ============================================================================
// APP 2: DISPLAY PROPERTIES — AUTHENTIC WIN95 TABBED DIALOG + MINI-CRT PREVIEW
// ============================================================================

export const displayApp = {
  id: 'display',
  title: 'Display Properties',
  icon: 'display',
  width: 470,
  height: 495,
  minWidth: 380,
  minHeight: 430,
  singleton: true,
  resizable: false,

  onOpen(containerEl, winApi) {
    const wallpapers = Array.isArray(WALLPAPERS) && WALLPAPERS.length > 0
      ? WALLPAPERS
      : [{ id: 'teal', name: 'Classic Teal (#008080)', previewColor: '#008080', cssClass: 'wp-teal' }];

    let activeTab = 'background';
    let appliedWp = typeof winApi.os.getWallpaper === 'function' ? winApi.os.getWallpaper() : wallpapers[0].id;
    let draftWp = appliedWp;
    let appliedCrt = typeof winApi.os.isCRTEnabled === 'function' ? winApi.os.isCRTEnabled() : false;
    let draftCrt = appliedCrt;
    let appliedSoundOn = !sound.isMuted();
    let draftSoundOn = appliedSoundOn;

    containerEl.innerHTML = `
      <div class="disp-app">
        <div class="win95-tabs disp-tabs" role="tablist">
          <button type="button" class="win95-tab disp-tab is-active" role="tab" data-tab="background">Background</button>
          <button type="button" class="win95-tab disp-tab" role="tab" data-tab="effects">Effects &amp; Audio</button>
          <button type="button" class="win95-tab disp-tab" role="tab" data-tab="system">System</button>
        </div>

        <div class="win95-tabpanel disp-body">
          <div class="disp-preview-stage">
            <div class="disp-monitor">
              <div class="disp-monitor-bezel">
                <div class="disp-monitor-screen" data-disp="screen">
                  <div class="disp-mini-win">
                    <div class="disp-mini-titlebar"></div>
                    <div class="disp-mini-body">
                      <div class="disp-mini-line"></div>
                      <div class="disp-mini-line short"></div>
                    </div>
                  </div>
                  <div class="disp-mini-taskbar">
                    <span class="disp-mini-start"></span>
                  </div>
                  <div class="disp-mini-scanlines" data-disp="scanlines" hidden></div>
                </div>
              </div>
              <div class="disp-monitor-chin">
                <span class="disp-monitor-brand">RIZKYTRON 95</span>
                <span class="disp-monitor-led" title="Power ON"></span>
              </div>
              <div class="disp-monitor-neck"></div>
              <div class="disp-monitor-base"></div>
            </div>
          </div>

          <section class="disp-panel" data-panel="background">
            <fieldset class="win95-groupbox">
              <legend>Wallpaper</legend>
              <div class="disp-wp-list win95-field win95-scrollbar" data-disp="wp-list" role="listbox" aria-label="Select wallpaper">
                ${wallpapers
                  .map(
                    (wp) => `
                  <button
                    type="button"
                    class="disp-wp-item${wp.id === draftWp ? ' is-selected' : ''}"
                    role="option"
                    aria-selected="${wp.id === draftWp ? 'true' : 'false'}"
                    data-wp-id="${escapeHtml(wp.id)}"
                  >
                    <span class="disp-wp-swatch" style="background:${escapeHtml(wp.previewColor || '#008080')}"></span>
                    <span class="disp-wp-name">${escapeHtml(wp.name || wp.id)}</span>
                  </button>`
                  )
                  .join('')}
              </div>
              <p class="disp-hint">Select a wallpaper to preview it on the monitor above, then click Apply or OK.</p>
            </fieldset>
          </section>

          <section class="disp-panel" data-panel="effects" hidden>
            <fieldset class="win95-groupbox disp-group">
              <legend>CRT &amp; Audio</legend>
              <label class="disp-check-row">
                <input type="checkbox" data-disp="crt-check" ${draftCrt ? 'checked' : ''} />
                <span>Enable CRT Scanlines &amp; Monitor Vignette</span>
              </label>
              <label class="disp-check-row">
                <input type="checkbox" data-disp="sound-check" ${draftSoundOn ? 'checked' : ''} />
                <span>Enable Windows 95 System Sound Effects</span>
              </label>
              <div class="disp-action-row">
                <button type="button" class="win95-btn" data-disp-action="test-sound">Test Startup Chime</button>
              </div>
            </fieldset>

            <fieldset class="win95-groupbox disp-group">
              <legend>System Diagnostics</legend>
              <div class="disp-action-row">
                <button type="button" class="win95-btn" data-disp-action="matrix">Toggle Matrix Rain</button>
                <button type="button" class="win95-btn" data-disp-action="bsod">Test BSOD Screen</button>
              </div>
            </fieldset>
          </section>

          <section class="disp-panel" data-panel="system" hidden>
            <fieldset class="win95-groupbox disp-group">
              <legend>RizkyOS 95 Information</legend>
              <div class="disp-sys-row">
                <div class="disp-sys-icon">${getIconSVG('computer', 32)}</div>
                <div class="disp-sys-info">
                  <div><strong>Microsoft(R) RizkyOS 95</strong></div>
                  <div>Version 4.00.950 · InspiredOS Architecture</div>
                  <div>Registered to: ${escapeHtml(PROFILE?.fullName || 'Rizky Alviando')}</div>
                  <div>Co-Processor: Groq LLM + ITS Math FPU</div>
                </div>
              </div>
            </fieldset>

            <fieldset class="win95-groupbox disp-group">
              <legend>Power &amp; Maintenance</legend>
              <div class="disp-action-row">
                <button type="button" class="win95-btn" data-disp-action="reboot">Reboot OS (BIOS POST)</button>
                <button type="button" class="win95-btn" data-disp-action="reset-data">Reset Local Data</button>
              </div>
            </fieldset>
          </section>
        </div>

        <div class="disp-footer">
          <button type="button" class="win95-btn primary disp-dialog-btn" data-disp-action="ok">OK</button>
          <button type="button" class="win95-btn disp-dialog-btn" data-disp-action="cancel">Cancel</button>
          <button type="button" class="win95-btn disp-dialog-btn" data-disp-action="apply" disabled>Apply</button>
        </div>
      </div>
    `;

    const tabBtns = containerEl.querySelectorAll('.disp-tab');
    const panels = containerEl.querySelectorAll('.disp-panel');
    const screenEl = containerEl.querySelector('[data-disp="screen"]');
    const scanlinesEl = containerEl.querySelector('[data-disp="scanlines"]');
    const wpItems = containerEl.querySelectorAll('.disp-wp-item');
    const crtCheck = containerEl.querySelector('[data-disp="crt-check"]');
    const soundCheck = containerEl.querySelector('[data-disp="sound-check"]');
    const applyBtn = containerEl.querySelector('[data-disp-action="apply"]');

    function isDirty() {
      return draftWp !== appliedWp || draftCrt !== appliedCrt || draftSoundOn !== appliedSoundOn;
    }

    function syncPreview() {
      const wp = wallpapers.find((w) => w.id === draftWp) || wallpapers[0];
      screenEl.className = `disp-monitor-screen ${wp.cssClass || ''}`.trim();
      screenEl.style.backgroundColor = wp.previewColor || '#008080';
      scanlinesEl.hidden = !draftCrt;

      wpItems.forEach((btn) => {
        const selected = btn.dataset.wpId === draftWp;
        btn.classList.toggle('is-selected', selected);
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      });

      crtCheck.checked = draftCrt;
      soundCheck.checked = draftSoundOn;
      applyBtn.disabled = !isDirty();
      winApi.setStatus(`Preview: ${wp.name || wp.id} | CRT: ${draftCrt ? 'ON' : 'OFF'} | Audio: ${draftSoundOn ? 'ON' : 'MUTED'}`);
    }

    function applySettings() {
      if (draftWp !== appliedWp && typeof winApi.os.setWallpaper === 'function') {
        winApi.os.setWallpaper(draftWp);
        appliedWp = draftWp;
      }
      if (draftCrt !== appliedCrt && typeof winApi.os.toggleCRT === 'function') {
        const liveCrt = typeof winApi.os.isCRTEnabled === 'function' ? winApi.os.isCRTEnabled() : appliedCrt;
        if (liveCrt !== draftCrt) {
          winApi.os.toggleCRT();
        }
        appliedCrt = draftCrt;
      }
      if (draftSoundOn !== appliedSoundOn) {
        if (sound.isMuted() === draftSoundOn) {
          sound.toggleMute();
        }
        appliedSoundOn = draftSoundOn;
      }
      syncPreview();
    }

    function switchTab(tabKey) {
      activeTab = tabKey;
      tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tabKey));
      panels.forEach((p) => {
        p.hidden = p.dataset.panel !== tabKey;
      });
    }

    const onExternalSoundChange = () => {
      appliedSoundOn = !sound.isMuted();
      draftSoundOn = appliedSoundOn;
      syncPreview();
    };
    const onExternalCrtChange = () => {
      appliedCrt = typeof winApi.os.isCRTEnabled === 'function' ? winApi.os.isCRTEnabled() : appliedCrt;
      draftCrt = appliedCrt;
      syncPreview();
    };
    const onExternalWallpaperChange = () => {
      appliedWp = typeof winApi.os.getWallpaper === 'function' ? winApi.os.getWallpaper() : appliedWp;
      draftWp = appliedWp;
      syncPreview();
    };
    window.addEventListener('rizkyos:soundchange', onExternalSoundChange);
    window.addEventListener('rizkyos:crtchange', onExternalCrtChange);
    window.addEventListener('rizkyos:wallpaperchange', onExternalWallpaperChange);

    crtCheck.addEventListener('change', () => {
      draftCrt = crtCheck.checked;
      sound.playClick();
      syncPreview();
    });

    soundCheck.addEventListener('change', () => {
      draftSoundOn = soundCheck.checked;
      sound.playClick();
      syncPreview();
    });

    containerEl.addEventListener('click', async (e) => {
      const tabBtn = e.target.closest('.disp-tab');
      if (tabBtn) {
        sound.playClick();
        switchTab(tabBtn.dataset.tab);
        return;
      }

      const wpBtn = e.target.closest('.disp-wp-item');
      if (wpBtn) {
        draftWp = wpBtn.dataset.wpId;
        sound.playClick();
        syncPreview();
        return;
      }

      const actionBtn = e.target.closest('[data-disp-action]');
      if (!actionBtn) return;
      const action = actionBtn.dataset.dispAction;

      if (action === 'apply') {
        sound.playClick();
        applySettings();
      } else if (action === 'ok') {
        sound.playClick();
        applySettings();
        winApi.close();
      } else if (action === 'cancel') {
        sound.playClick();
        winApi.close();
      } else if (action === 'test-sound') {
        if (sound.isMuted()) {
          winApi.setStatus('System audio is currently muted — enable Audio & Apply first.');
        } else {
          sound.playStartup();
          winApi.setStatus('Playing Windows 95 startup chime...');
        }
      } else if (action === 'matrix') {
        sound.playClick();
        winApi.os.triggerMatrixEasterEgg();
      } else if (action === 'bsod') {
        sound.playError();
        winApi.os.triggerBSOD();
      } else if (action === 'reboot') {
        sound.playClick();
        winApi.close();
        winApi.os.rebootOS();
      } else if (action === 'reset-data') {
        sound.playClick();
        const choice = await winApi.os.showDialog({
          title: 'Reset Local Data',
          message: 'Clear saved guestbook entries, game high scores, and display preferences stored in this browser?',
          icon: 'warning',
          buttons: ['Reset', 'Cancel'],
        });
        if (choice === 'Reset') {
          try {
            localStorage.removeItem(GB_ENTRIES_KEY);
            localStorage.removeItem('rizkyos_ojek_best_v1');
            localStorage.removeItem('rizkyos_minesweeper_best_v1');
          } catch {
            // Ignore
          }
          winApi.setStatus('Local browser data cleared.');
        }
      }
    });

    switchTab(activeTab);
    syncPreview();

    winApi.onClose(() => {
      window.removeEventListener('rizkyos:soundchange', onExternalSoundChange);
      window.removeEventListener('rizkyos:crtchange', onExternalCrtChange);
      window.removeEventListener('rizkyos:wallpaperchange', onExternalWallpaperChange);
    });
  },
};

// ============================================================================
// APP 3: 3D ROOM — OPEN WORLD (Embeds existing Three.js open-world.html)
// ============================================================================

export const room3dApp = {
  id: 'room3d',
  title: '3D Room — Open World',
  icon: 'room3d',
  width: 840,
  height: 560,
  minWidth: 420,
  minHeight: 340,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    containerEl.innerHTML = `
      <div class="room3d-app">
        <div class="room3d-toolbar win95-toolbar">
          <div class="room3d-toolbar-actions">
            <button type="button" class="win95-btn room3d-btn" data-room3d="reload">
              ${getIconSVG('room3d', 14)}
              <span>Reload 3D Scene</span>
            </button>
            <button type="button" class="win95-btn room3d-btn" data-room3d="fullscreen">
              ${getIconSVG('link', 14)}
              <span>Open Fullscreen Tab</span>
            </button>
          </div>
          <span class="room3d-hint">Drag to orbit · Scroll to zoom · Click room objects</span>
        </div>

        <div class="room3d-stage win95-sunken">
          <div class="room3d-loading" data-room3d="loading">
            <div class="room3d-loading-box win95-raised">
              <div class="room3d-loading-icon">${getIconSVG('room3d', 32)}</div>
              <div class="room3d-loading-text">
                <strong>Loading 3D Isometric Room...</strong>
                <span>Initializing Three.js scene (open-world.html)</span>
              </div>
            </div>
          </div>
          <iframe
            class="room3d-frame"
            data-room3d="frame"
            src="open-world.html"
            title="Rizky Alviando 3D Isometric Room"
            loading="eager"
          ></iframe>
        </div>
      </div>
    `;

    const frameEl = containerEl.querySelector('[data-room3d="frame"]');
    const loadingEl = containerEl.querySelector('[data-room3d="loading"]');
    let fallbackTimer = null;

    function hideLoading() {
      loadingEl.hidden = true;
      winApi.setStatus('3D Isometric Room active — open-world.html');
    }

    function showLoading() {
      loadingEl.hidden = false;
      winApi.setStatus('Loading 3D Isometric Room (open-world.html)...');
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = setTimeout(hideLoading, 8000);
    }

    const onFrameLoad = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      hideLoading();
    };

    frameEl.addEventListener('load', onFrameLoad);
    showLoading();

    containerEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-room3d]');
      if (!btn) return;
      const act = btn.dataset.room3d;
      if (act === 'reload') {
        sound.playClick();
        showLoading();
        frameEl.src = `open-world.html?reload=${Date.now()}`;
      } else if (act === 'fullscreen') {
        sound.playClick();
        window.open('open-world.html', '_blank', 'noopener,noreferrer');
      }
    });

    winApi.onClose(() => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      frameEl.removeEventListener('load', onFrameLoad);
      frameEl.src = 'about:blank';
    });
  },
};
