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

function getSiteDomain() {
  const raw = PROFILE?.website || 'https://rizkyalviando.ai.id';
  return String(raw).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function downloadTextFile(filename, content) {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // Ignore download failure
  }
}

async function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ============================================================================
// APP 1: GUEST BOOK.TXT - AUTHENTIC 1995 NOTEPAD GUESTBOOK (RIZKYBOOK 95)
// ============================================================================

export const guestbookApp = {
  id: 'guestbook',
  title: 'Guest book.txt - RizkyBook 95',
  icon: 'guestbook',
  width: 560,
  height: 510,
  minWidth: 360,
  minHeight: 360,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    const hitDigits = getAndIncrementHitCounter();
    const siteDomain = getSiteDomain();
    let openMenu = null;
    let signBarVisible = true;

    containerEl.innerHTML = `
      <div class="gb-app">
        <div class="win95-menubar gb-menubar" role="menubar">
          <div class="gb-menubar-left">
            <div class="gb-menu-group">
              <button type="button" class="win95-menubar-item gb-menu-btn" data-gb-menu="file" aria-haspopup="true"><u>F</u>ile</button>
              <div class="win95-menu-dropdown gb-menu-dd" data-gb-dd="file" hidden>
                <button type="button" class="win95-menu-item" data-gb-action="focus-sign">Sign Guestbook...</button>
                <button type="button" class="win95-menu-item" data-gb-action="export">Export Guest book.txt</button>
                <div class="win95-menu-sep"></div>
                <button type="button" class="win95-menu-item" data-gb-action="close">Exit</button>
              </div>
            </div>

            <div class="gb-menu-group">
              <button type="button" class="win95-menubar-item gb-menu-btn" data-gb-menu="edit" aria-haspopup="true"><u>E</u>dit</button>
              <div class="win95-menu-dropdown gb-menu-dd" data-gb-dd="edit" hidden>
                <button type="button" class="win95-menu-item" data-gb-action="toggle-signbar">Toggle Sign Strip</button>
                <button type="button" class="win95-menu-item" data-gb-action="copy-all">Copy All Entries</button>
                <button type="button" class="win95-menu-item" data-gb-action="clear">Clear Form</button>
              </div>
            </div>

            <div class="gb-menu-group">
              <button type="button" class="win95-menubar-item gb-menu-btn" data-gb-menu="help" aria-haspopup="true"><u>H</u>elp</button>
              <div class="win95-menu-dropdown gb-menu-dd" data-gb-dd="help" hidden>
                <button type="button" class="win95-menu-item" data-gb-action="about">About Guest book.txt...</button>
              </div>
            </div>
          </div>

          <div class="gb-menu-counter" aria-label="Visitor hit counter" title="Total visitors">
            Visitor #${escapeHtml(hitDigits)}
          </div>
        </div>

        <section class="gb-sign-bar" data-gb="sign-bar" aria-label="Sign Guestbook">
          <form class="gb-sign-form" data-gb="form" novalidate>
            <div class="gb-sign-row">
              <label class="gb-sign-field gb-sign-name">
                <span class="gb-sign-label">Name *</span>
                <input
                  type="text"
                  name="name"
                  class="win95-field gb-input"
                  maxlength="40"
                  placeholder="Nama / handle"
                  required
                />
              </label>

              <label class="gb-sign-field gb-sign-origin">
                <span class="gb-sign-label">Origin</span>
                <input
                  type="text"
                  name="from"
                  class="win95-field gb-input"
                  maxlength="50"
                  placeholder="Kota / Instansi"
                />
              </label>

              <label class="gb-sign-field gb-sign-mood">
                <span class="gb-sign-label">Mood</span>
                <select name="mood" class="win95-field gb-mood-select" aria-label="Mood">
                  ${MOOD_OPTIONS.map(
                    (m) =>
                      `<option value="${escapeHtml(m.badge)}">${escapeHtml(m.badge)} ${escapeHtml(m.label)}</option>`
                  ).join('')}
                </select>
              </label>
            </div>

            <div class="gb-sign-row-msg">
              <label class="gb-sign-field gb-sign-msg-wrap">
                <span class="gb-sign-label">Message * <span class="gb-char-count" data-gb="chars">(0/280)</span></span>
                <textarea
                  name="message"
                  class="win95-field gb-textarea"
                  rows="2"
                  maxlength="280"
                  placeholder="Tulis catatan singkat untuk Guest book.txt..."
                  required
                ></textarea>
              </label>
              <div class="gb-sign-actions">
                <button type="submit" class="win95-btn primary gb-sign-btn">Sign</button>
              </div>
            </div>

            <div class="gb-feedback" data-gb="feedback" aria-live="polite" hidden></div>
          </form>
        </section>

        <div class="gb-log win95-sunken win95-scrollbar win95-selectable" data-gb="log" tabindex="0">
          <pre class="gb-doc-header">================================================================
GUEST BOOK - ${escapeHtml(String(PROFILE?.name || 'Rizky Alviando').toUpperCase())} (${escapeHtml(siteDomain)})
Sign above to append your message to Guest book.txt
================================================================</pre>
          <div class="gb-entries" data-gb="entries"></div>
          <div class="gb-doc-footer" data-gb="footer"></div>
        </div>
      </div>
    `;

    const signBarEl = containerEl.querySelector('[data-gb="sign-bar"]');
    const formEl = containerEl.querySelector('[data-gb="form"]');
    const nameInput = formEl.elements.name;
    const fromInput = formEl.elements.from;
    const moodSelect = formEl.elements.mood;
    const msgInput = formEl.elements.message;
    const charsEl = containerEl.querySelector('[data-gb="chars"]');
    const feedbackEl = containerEl.querySelector('[data-gb="feedback"]');
    const logEl = containerEl.querySelector('[data-gb="log"]');
    const entriesEl = containerEl.querySelector('[data-gb="entries"]');
    const footerEl = containerEl.querySelector('[data-gb="footer"]');

    function closeMenus() {
      if (!openMenu) return;
      openMenu = null;
      containerEl.querySelectorAll('.gb-menu-dd').forEach((el) => {
        el.hidden = true;
      });
      containerEl.querySelectorAll('.gb-menu-btn').forEach((el) => {
        el.classList.remove('is-open');
      });
    }

    function toggleMenu(name) {
      if (openMenu === name) {
        closeMenus();
        return;
      }
      closeMenus();
      openMenu = name;
      const dd = containerEl.querySelector(`.gb-menu-dd[data-gb-dd="${name}"]`);
      const btn = containerEl.querySelector(`.gb-menu-btn[data-gb-menu="${name}"]`);
      if (dd) dd.hidden = false;
      if (btn) btn.classList.add('is-open');
    }

    function getAllEntries() {
      const localEntries = loadLocalGuestbook();
      const seedEntries = Array.isArray(GUESTBOOK_SEED) ? GUESTBOOK_SEED : [];
      return [
        ...localEntries.map((e) => ({ ...e, _local: true })),
        ...seedEntries.map((e) => ({ ...e, _local: false })),
      ];
    }

    function buildPlainTextTranscript(entries) {
      const header = [
        '================================================================',
        `GUEST BOOK - ${String(PROFILE?.name || 'Rizky Alviando').toUpperCase()} (${siteDomain})`,
        `Visitor Counter: #${hitDigits} | Total Signatures: ${entries.length}`,
        '================================================================',
        '',
      ].join('\n');

      const body = entries
        .map((e) => {
          const dt = e.date || '';
          const author = e.name || 'Anonymous';
          const origin = e.from ? ` (${e.from})` : '';
          const mood = e.mood ? `  ${e.mood}` : '';
          return `[${dt}] ${author}${origin}${mood}\n${e.message || ''}\n----------------------------------------------------------------`;
        })
        .join('\n\n');

      return `${header}${body}\n`;
    }

    function setFeedback(text, isError = false) {
      if (!text) {
        feedbackEl.textContent = '';
        feedbackEl.hidden = true;
        feedbackEl.classList.remove('is-error');
        return;
      }
      feedbackEl.textContent = text;
      feedbackEl.hidden = false;
      feedbackEl.classList.toggle('is-error', isError);
    }

    function renderEntries() {
      const allEntries = getAllEntries();
      winApi.setStatus(`Guest book.txt | ${allEntries.length} signatures | Visitor #${hitDigits}`);

      if (allEntries.length === 0) {
        entriesEl.innerHTML = '<div class="gb-empty">(Belum ada catatan. Isi form di atas untuk menandatangani Guest book.txt.)</div>';
        footerEl.textContent = `--- End of Guest book.txt (0 signatures · Visitor #${hitDigits}) ---`;
        return;
      }

      entriesEl.innerHTML = allEntries
        .map((entry, idx) => {
          const mood = escapeHtml(entry.mood || ':-)');
          const name = escapeHtml(entry.name || 'Anonymous');
          const from = entry.from ? ` (${escapeHtml(entry.from)})` : '';
          const date = escapeHtml(entry.date || '');
          const message = escapeHtml(entry.message || '');
          const idAttr = escapeHtml(entry.id || '');
          const removeLink = entry._local
            ? ` <button type="button" class="gb-remove-link" data-delete-id="${idAttr}" title="Remove your local entry">[Remove]</button>`
            : '';
          const sep = idx < allEntries.length - 1 ? '<div class="gb-entry-sep" aria-hidden="true"></div>' : '';

          return `
            <article class="gb-entry">
              <div class="gb-entry-head">
                <span class="gb-entry-date">[${date}]</span>
                <strong class="gb-entry-name">${name}</strong><span class="gb-entry-origin">${from}</span>
                <span class="gb-entry-mood">${mood}</span>${removeLink}
              </div>
              <div class="gb-entry-body">${message}</div>
            </article>
            ${sep}
          `;
        })
        .join('');

      footerEl.textContent = `--- End of Guest book.txt (${allEntries.length} signatures · Visitor #${hitDigits}) ---`;
    }

    msgInput.addEventListener('input', () => {
      charsEl.textContent = `(${msgInput.value.length}/280)`;
    });

    async function handleMenuAction(act) {
      closeMenus();
      if (act === 'focus-sign') {
        signBarVisible = true;
        signBarEl.hidden = false;
        nameInput.focus();
      } else if (act === 'export') {
        const txt = buildPlainTextTranscript(getAllEntries());
        downloadTextFile('Guest_book_RizkyOS95.txt', txt);
        winApi.setStatus('Exported Guest_book_RizkyOS95.txt');
      } else if (act === 'close') {
        winApi.close();
      } else if (act === 'toggle-signbar') {
        signBarVisible = !signBarVisible;
        signBarEl.hidden = !signBarVisible;
      } else if (act === 'copy-all') {
        const ok = await copyText(buildPlainTextTranscript(getAllEntries()));
        setFeedback(ok ? 'Semua catatan disalin ke clipboard.' : 'Gagal menyalin catatan.', !ok);
      } else if (act === 'clear') {
        formEl.reset();
        charsEl.textContent = '(0/280)';
        setFeedback('');
      } else if (act === 'about') {
        winApi.os.showDialog({
          title: 'About Guest book.txt',
          icon: 'guestbook',
          message:
            `Guest book.txt - RizkyBook 95\n` +
            `Public Visitor Log for ${PROFILE?.fullName || 'Rizky Alviando'} (${siteDomain}).\n\n` +
            `Catatan yang kamu kirim disimpan di localStorage browser ini dan dapat diekspor ke berkas teks polos (.txt).`,
          buttons: ['OK'],
        });
      }
    }

    containerEl.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.gb-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        sound.playClick();
        toggleMenu(menuBtn.dataset.gbMenu);
        return;
      }

      const menuAction = e.target.closest('[data-gb-action]');
      if (menuAction) {
        sound.playClick();
        handleMenuAction(menuAction.dataset.gbAction);
        return;
      }

      if (openMenu) closeMenus();

      const delBtn = e.target.closest('[data-delete-id]');
      if (delBtn) {
        const targetId = delBtn.dataset.deleteId;
        const next = loadLocalGuestbook().filter((item) => String(item.id) !== targetId);
        saveLocalGuestbook(next);
        sound.playClick();
        setFeedback('Catatan lokal dihapus.');
        renderEntries();
      }
    });

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const from = fromInput.value.trim() || 'Internet Visitor';
      const mood = moodSelect.value || MOOD_OPTIONS[0].badge;
      const message = msgInput.value.trim();

      if (!name) {
        setFeedback('Nama wajib diisi sebelum menandatangani Guest book.txt.', true);
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
        mood,
        date: formatTodayDate(),
        message: message.slice(0, 280),
      };

      const existing = loadLocalGuestbook();
      saveLocalGuestbook([newEntry, ...existing]);

      formEl.reset();
      charsEl.textContent = '(0/280)';
      setFeedback('Ditambahkan ke Guest book.txt.');
      sound.playMessage();
      renderEntries();
      logEl.scrollTop = 0;
    });

    const onDocClick = (e) => {
      if (openMenu && !containerEl.contains(e.target)) closeMenus();
    };
    const onDocKeydown = (e) => {
      if (e.key === 'Escape' && openMenu) closeMenus();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeydown);

    renderEntries();

    winApi.onClose(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeydown);
    });
  },
};

// ============================================================================
// APP 2: DISPLAY PROPERTIES - AUTHENTIC WIN95 CONTROL PANEL DIALOG
// ============================================================================

export const displayApp = {
  id: 'display',
  title: 'Display Properties',
  icon: 'display',
  width: 448,
  height: 468,
  minWidth: 368,
  minHeight: 410,
  singleton: true,
  resizable: false,

  onOpen(containerEl, winApi) {
    const wallpapers = Array.isArray(WALLPAPERS) && WALLPAPERS.length > 0
      ? WALLPAPERS
      : [{ id: 'teal', name: 'Windows 95 Classic Teal', previewColor: '#018281', cssClass: 'wp-teal' }];

    const siteDomain = getSiteDomain();
    let activeTab = 'background';
    let appliedWp = typeof winApi.os.getWallpaper === 'function' ? winApi.os.getWallpaper() : wallpapers[0].id;
    let draftWp = appliedWp;
    let appliedCrt = typeof winApi.os.isCRTEnabled === 'function' ? winApi.os.isCRTEnabled() : true;
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
            <fieldset class="win95-groupbox disp-group">
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
                    <span class="disp-wp-swatch" style="background:${escapeHtml(wp.previewColor || '#018281')}"></span>
                    <span class="disp-wp-name">${escapeHtml(wp.name || wp.id)}</span>
                  </button>`
                  )
                  .join('')}
              </div>
              <p class="disp-hint">Select a desktop pattern above, then click Apply or OK.</p>
            </fieldset>
          </section>

          <section class="disp-panel" data-panel="effects" hidden>
            <fieldset class="win95-groupbox disp-group">
              <legend>CRT Display &amp; Audio</legend>
              <label class="disp-check-row">
                <input type="checkbox" data-disp="crt-check" ${draftCrt ? 'checked' : ''} />
                <span>Enable CRT Scanlines &amp; Aperture Grille</span>
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
              <legend>Display Diagnostics</legend>
              <div class="disp-action-row">
                <button type="button" class="win95-btn" data-disp-action="matrix">Toggle Matrix Rain</button>
                <button type="button" class="win95-btn" data-disp-action="bsod">Test BSOD Recovery</button>
              </div>
            </fieldset>
          </section>

          <section class="disp-panel" data-panel="system" hidden>
            <fieldset class="win95-groupbox disp-group">
              <legend>System Properties</legend>
              <div class="disp-sys-row">
                <div class="disp-sys-icon">${getIconSVG('computer', 32)}</div>
                <div class="disp-sys-info">
                  <div><strong>RizkyOS 95</strong> (Version 4.00.950)</div>
                  <div>Registered to: ${escapeHtml(PROFILE?.fullName || 'Rizky Alviando')}</div>
                  <div>Domain: ${escapeHtml(siteDomain)}</div>
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
      screenEl.style.backgroundColor = wp.previewColor || '#018281';
      scanlinesEl.hidden = !draftCrt;

      wpItems.forEach((btn) => {
        const selected = btn.dataset.wpId === draftWp;
        btn.classList.toggle('is-selected', selected);
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      });

      crtCheck.checked = draftCrt;
      soundCheck.checked = draftSoundOn;
      applyBtn.disabled = !isDirty();
      winApi.setStatus(`Wallpaper: ${wp.name || wp.id} | CRT: ${draftCrt ? 'ON' : 'OFF'} | Audio: ${draftSoundOn ? 'ON' : 'MUTED'}`);
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
          winApi.setStatus('System audio is muted. Enable Audio & Apply first.');
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
// APP 3: 3D ROOM - OPEN WORLD (Embeds existing Three.js open-world.html)
// ============================================================================

export const room3dApp = {
  id: 'room3d',
  title: '3D Room - Open World',
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
      winApi.setStatus('3D Isometric Room active (open-world.html)');
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
