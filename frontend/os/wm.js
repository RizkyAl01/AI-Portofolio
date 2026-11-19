/**
 * RizkyOS 95 — Core Window Manager, Desktop Shell, BIOS POST & Easter Eggs
 * Inspired by InspiredOS & authentic Windows 95 (4.00.950).
 */

import { getIconSVG } from './icons.js';
import { sound } from './sound.js';

const STORAGE_WP = 'rizkyos_wallpaper';
const STORAGE_CRT = 'rizkyos_crt';
const SESSION_BOOTED = 'rizkyos_booted';
const VALID_WALLPAPERS = ['teal', 'clouds', 'matrix', 'batik', 'navy'];
const KONAMI_SEQ = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

// Crisp inline SVG glyphs for classic Win95 titlebar controls
const CTRL_GLYPHS = {
  minimize: '<svg viewBox="0 0 10 10" width="9" height="9" shape-rendering="crispEdges"><rect x="1" y="7" width="7" height="2" fill="currentColor"/></svg>',
  maximize: '<svg viewBox="0 0 10 10" width="9" height="9" shape-rendering="crispEdges"><rect x="1" y="1" width="8" height="2" fill="currentColor"/><rect x="1" y="1" width="1" height="8" fill="currentColor"/><rect x="8" y="1" width="1" height="8" fill="currentColor"/><rect x="1" y="8" width="8" height="1" fill="currentColor"/></svg>',
  restore: '<svg viewBox="0 0 10 10" width="9" height="9" shape-rendering="crispEdges"><rect x="3" y="1" width="6" height="2" fill="currentColor"/><rect x="8" y="1" width="1" height="5" fill="currentColor"/><rect x="3" y="1" width="1" height="2" fill="currentColor"/><rect x="1" y="3" width="6" height="2" fill="currentColor"/><rect x="1" y="3" width="1" height="6" fill="currentColor"/><rect x="6" y="3" width="1" height="6" fill="currentColor"/><rect x="1" y="8" width="6" height="1" fill="currentColor"/></svg>',
  close: '<svg viewBox="0 0 10 10" width="9" height="9" shape-rendering="crispEdges"><path d="M1 1h2v1h1v1h2V2h1V1h2v2H8v1H7v2h1v1h1v2H7V8H6V7H4v1H3v1H1V7h1V6h1V4H2V3H1V1z" fill="currentColor"/></svg>',
};

const DEFAULT_START_MENU = [
  {
    label: 'Programs',
    icon: 'programs',
    children: [
      { label: 'RizkyBot AI Messenger', icon: 'messenger', appId: 'messenger' },
      { label: 'Internet Explorer 4.0', icon: 'ie', appId: 'browser' },
      { label: 'My Computer', icon: 'computer', appId: 'explorer' },
      { label: 'MS-DOS Prompt', icon: 'dos', appId: 'terminal' },
      { label: 'WordPad (CV)', icon: 'wordpad', appId: 'notepad', args: { doc: 'cv' } },
      { label: '3D Room — Open World', icon: 'room3d', appId: 'room3d' },
    ],
  },
  {
    label: 'Documents',
    icon: 'documents',
    children: [
      { label: 'README.txt', icon: 'notepad', appId: 'notepad', args: { doc: 'readme' } },
      { label: 'CV Rizky Alviando', icon: 'wordpad', appId: 'notepad', args: { doc: 'cv' } },
      { label: 'Certificates Folder', icon: 'folder', appId: 'explorer', args: { path: 'C:\\Rizky\\Certificates' } },
    ],
  },
  {
    label: 'Games',
    icon: 'game',
    children: [
      { label: 'Ojek Rush 95', icon: 'game', appId: 'ojek-rush' },
      { label: 'Minesweeper 95', icon: 'minesweeper', appId: 'minesweeper' },
    ],
  },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      { label: 'Display Properties', icon: 'display', appId: 'display' },
      { label: 'Cascade Windows', icon: 'programs', action: 'cascade' },
      { label: 'Toggle CRT Scanlines', icon: 'crt', action: 'toggle-crt' },
      { label: 'Toggle Sound', icon: 'sound-on', action: 'toggle-sound' },
    ],
  },
  { label: 'RizkyBook Guestbook', icon: 'guestbook', appId: 'guestbook' },
  { divider: true },
  { label: 'Shut Down...', icon: 'shutdown', action: 'shutdown' },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMnemonicLabel(label, explicitMnemonic) {
  const raw = String(label ?? '');
  if (!raw) return '';
  let idx = -1;
  if (typeof explicitMnemonic === 'string' && explicitMnemonic.length === 1) {
    idx = raw.toLowerCase().indexOf(explicitMnemonic.toLowerCase());
  } else if (/^shut\s+down/i.test(raw)) {
    idx = raw.toLowerCase().indexOf('u');
  } else {
    idx = raw.search(/[A-Za-z0-9]/);
  }
  if (idx < 0) return escapeHtml(raw);
  return (
    escapeHtml(raw.slice(0, idx)) +
    `<u>${escapeHtml(raw[idx])}</u>` +
    escapeHtml(raw.slice(idx + 1))
  );
}

function readStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    // Ignore storage errors
  }
}

function readSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key, val) {
  try {
    sessionStorage.setItem(key, val);
  } catch {
    // Ignore
  }
}

function removeSession(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

/* ==========================================================================
   Internal Shell State
   ========================================================================== */

const state = {
  initialized: false,
  apps: new Map(),
  windows: new Map(),
  winSeq: 0,
  zCounter: 100,
  activeWinId: null,
  cascadeIndex: 0,

  wallpaper: VALID_WALLPAPERS.includes(readStorage(STORAGE_WP, 'teal'))
    ? readStorage(STORAGE_WP, 'teal')
    : 'teal',
  // Global CRT overlay ON by default (toggleable cleanly from tray / Display Properties)
  crtEnabled: readStorage(STORAGE_CRT, 'true') !== 'false',

  // DOM references
  rootEl: null,
  shellEl: null,
  desktopEl: null,
  iconsLayerEl: null,
  marqueeEl: null,
  windowsLayerEl: null,
  taskbarEl: null,
  startBtnEl: null,
  taskbarWindowsEl: null,
  startMenuEl: null,
  startListEl: null,
  contextMenuEl: null,
  clockEl: null,
  traySoundBtnEl: null,
  trayCrtBtnEl: null,
  tooltipEl: null,
  matrixCanvasEl: null,
  bsodEl: null,
  bootOverlayEl: null,

  // Config & callbacks
  desktopIcons: [],
  startMenuConfig: DEFAULT_START_MENU,
  onBootComplete: null,
  mobileStartStack: [],

  // Dynamic idle / unfocused document title easter eggs
  baseTitle: 'RizkyOS 95 — Rizky Alviando',
  idleTimer: null,
  hiddenTitleTimer: null,
  hiddenTitleIdx: 0,
  isIdleTitle: false,

  // Timers & cleanup
  clockTimer: null,
  bootTimers: [],
  bootRaf: null,
  bootActive: false,
  bootCleanup: null,
  bsodOpen: false,
  bsodGraceUntil: 0,

  // Matrix rain state
  matrixRunning: false,
  matrixRaf: null,
  matrixDrops: [],
  matrixLastTick: 0,

  // Konami code buffer
  konamiIndex: 0,
  globalListenersAttached: false,
};

/* ==========================================================================
   Helper Functions
   ========================================================================== */

function getDesktopRect() {
  if (state.desktopEl) {
    const r = state.desktopEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return r;
  }
  const taskbarH = RizkyOS.isMobile() ? 40 : 32;
  return {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: Math.max(200, window.innerHeight - taskbarH),
  };
}

function closeStartMenu() {
  if (!state.startMenuEl || !state.startBtnEl) return;
  state.startMenuEl.classList.remove('is-open');
  state.startBtnEl.classList.remove('is-open');
  state.startBtnEl.setAttribute('aria-expanded', 'false');
  state.mobileStartStack = [];
  if (state.startListEl) {
    state.startListEl.querySelectorAll('.is-sub-open').forEach((el) => el.classList.remove('is-sub-open'));
  }
}

function openStartMenu() {
  if (!state.startMenuEl || !state.startBtnEl) return;
  closeContextMenu();
  state.mobileStartStack = [];
  renderStartMenuItems(state.startMenuConfig);
  state.startMenuEl.classList.add('is-open');
  state.startBtnEl.classList.add('is-open');
  state.startBtnEl.setAttribute('aria-expanded', 'true');
  sound.playClick();
}

function toggleStartMenu() {
  if (!state.startMenuEl) return;
  if (state.startMenuEl.classList.contains('is-open')) {
    closeStartMenu();
  } else {
    openStartMenu();
  }
}

function closeContextMenu() {
  if (!state.contextMenuEl) return;
  state.contextMenuEl.classList.remove('is-open');
}

function openContextMenu(clientX, clientY) {
  if (!state.contextMenuEl) return;
  closeStartMenu();
  state.contextMenuEl.classList.add('is-open');
  const rect = state.contextMenuEl.getBoundingClientRect();
  const maxX = Math.max(4, window.innerWidth - rect.width - 6);
  const maxY = Math.max(4, window.innerHeight - (RizkyOS.isMobile() ? 44 : 38) - rect.height);
  state.contextMenuEl.style.left = `${Math.min(Math.max(4, clientX), maxX)}px`;
  state.contextMenuEl.style.top = `${Math.min(Math.max(4, clientY), maxY)}px`;
}

function clearIconSelections() {
  if (!state.iconsLayerEl) return;
  state.iconsLayerEl.querySelectorAll('.os-desktop-icon.is-selected').forEach((el) => {
    el.classList.remove('is-selected');
  });
}

function focusTopVisibleWindow() {
  let topWin = null;
  let maxZ = -1;
  for (const w of state.windows.values()) {
    if (!w.minimized && w.zIndex > maxZ) {
      maxZ = w.zIndex;
      topWin = w;
    }
  }
  if (topWin) {
    RizkyOS.focusWindow(topWin.id);
  } else {
    state.activeWinId = null;
    syncTaskbarStates();
  }
}

function syncTaskbarStates() {
  for (const w of state.windows.values()) {
    const isActive = w.id === state.activeWinId && !w.minimized;
    w.el.classList.toggle('is-active', isActive);
    w.taskBtnEl.classList.toggle('is-active', isActive);
    w.taskBtnEl.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }
}

function notifyWindowResize(win) {
  if (!win || !win.resizeCallbacks.size) return;
  const rect = win.bodyEl.getBoundingClientRect();
  for (const cb of win.resizeCallbacks) {
    try {
      cb({ width: rect.width, height: rect.height });
    } catch (err) {
      console.error(`[RizkyOS] onResize callback error in ${win.appId}:`, err);
    }
  }
}

function executeMenuAction(item) {
  if (!item) return;
  closeStartMenu();
  closeContextMenu();

  if (typeof item.action === 'function') {
    item.action(RizkyOS);
    return;
  }

  if (typeof item.action === 'string') {
    switch (item.action) {
      case 'shutdown':
        RizkyOS.showShutdownDialog();
        return;
      case 'cascade':
        RizkyOS.cascadeWindows();
        return;
      case 'close-all':
        RizkyOS.closeAllWindows();
        return;
      case 'reboot':
        RizkyOS.rebootOS();
        return;
      case 'bsod':
        RizkyOS.triggerBSOD();
        return;
      case 'matrix':
        RizkyOS.triggerMatrixEasterEgg();
        return;
      case 'toggle-crt':
        RizkyOS.toggleCRT();
        return;
      case 'toggle-sound':
        sound.toggleMute();
        return;
      case 'arrange':
        RizkyOS.arrangeIcons();
        return;
      case 'refresh':
        RizkyOS.refreshDesktop();
        return;
      case 'about':
        RizkyOS.showAboutDialog();
        return;
      default:
        break;
    }
  }

  if (item.appId) {
    RizkyOS.openApp(item.appId, item.args || {});
  }
}

/* ==========================================================================
   Start Menu Rendering (Desktop Cascading + Mobile Touch Drill-Down)
   ========================================================================== */

function normalizeStartItems(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw;
  if (raw && Array.isArray(raw.items) && raw.items.length > 0) return raw.items;
  return DEFAULT_START_MENU;
}

function createStartRowElement(item, isMobileMode) {
  if (item.divider || item.type === 'separator') {
    const sep = document.createElement('div');
    sep.className = 'os-start-sep';
    sep.setAttribute('role', 'separator');
    return sep;
  }

  const wrap = document.createElement('div');
  wrap.className = 'os-start-item-wrap';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'os-start-item';

  const iconKey = item.icon || item.iconKey || (item.children ? 'programs' : 'file');
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const labelStr = String(item.label || 'Item');
  let mnemonicChar = '';
  if (typeof item.mnemonic === 'string' && item.mnemonic.length === 1) {
    mnemonicChar = item.mnemonic.toLowerCase();
  } else if (/^shut\s+down/i.test(labelStr)) {
    mnemonicChar = 'u';
  } else {
    const m = labelStr.match(/[A-Za-z0-9]/);
    if (m) mnemonicChar = m[0].toLowerCase();
  }
  if (mnemonicChar) btn.dataset.mnemonic = mnemonicChar;

  btn.innerHTML =
    `<span class="os-start-item-icon">${getIconSVG(iconKey, 20)}</span>` +
    `<span class="os-start-item-label">${formatMnemonicLabel(labelStr, item.mnemonic)}</span>` +
    (hasChildren ? '<span class="os-start-arrow" aria-hidden="true">&#9656;</span>' : '');

  wrap.appendChild(btn);

  if (hasChildren) {
    if (isMobileMode) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick();
        state.mobileStartStack.push({ title: labelStr, items: item.children });
        renderStartMenuItems(item.children, labelStr);
      });
    } else {
      const sub = document.createElement('div');
      sub.className = 'os-submenu';
      sub.setAttribute('role', 'menu');
      for (const child of item.children) {
        sub.appendChild(createStartRowElement(child, false));
      }
      wrap.appendChild(sub);

      const adjustSubmenuBounds = () => {
        sub.classList.remove('flip-up');
        const rect = sub.getBoundingClientRect();
        const taskbarH = RizkyOS.isMobile() ? 40 : 32;
        if (rect.bottom > window.innerHeight - taskbarH - 2) {
          sub.classList.add('flip-up');
        }
      };

      wrap.addEventListener('mouseenter', () => {
        // Close sibling open submenus first
        const parent = wrap.parentElement;
        if (parent) {
          parent.querySelectorAll(':scope > .os-start-item-wrap.is-sub-open').forEach((sib) => {
            if (sib !== wrap) sib.classList.remove('is-sub-open');
          });
        }
        requestAnimationFrame(adjustSubmenuBounds);
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick();
        const willOpen = !wrap.classList.contains('is-sub-open');
        const parent = wrap.parentElement;
        if (parent) {
          parent.querySelectorAll(':scope > .os-start-item-wrap.is-sub-open').forEach((sib) => {
            sib.classList.remove('is-sub-open');
          });
        }
        if (willOpen) {
          wrap.classList.add('is-sub-open');
          requestAnimationFrame(adjustSubmenuBounds);
        }
      });
    }
  } else {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      executeMenuAction(item);
    });
  }

  return wrap;
}

function renderStartMenuItems(items, mobileTitle = null) {
  if (!state.startListEl) return;
  state.startListEl.innerHTML = '';
  const isMobileMode = RizkyOS.isMobile();

  if (isMobileMode && state.mobileStartStack.length > 0) {
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'os-start-mobile-header';
    backBtn.innerHTML = `<span>&#9666; Back</span><span>${escapeHtml(mobileTitle || '')}</span>`;
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      state.mobileStartStack.pop();
      if (state.mobileStartStack.length === 0) {
        renderStartMenuItems(state.startMenuConfig, null);
      } else {
        const prev = state.mobileStartStack[state.mobileStartStack.length - 1];
        renderStartMenuItems(prev.items, prev.title);
      }
    });
    state.startListEl.appendChild(backBtn);
  }

  for (const item of items) {
    state.startListEl.appendChild(createStartRowElement(item, isMobileMode));
  }
}

/* ==========================================================================
   Desktop Icons & Marquee Selection
   ========================================================================== */

function renderDesktopIcons() {
  if (!state.iconsLayerEl) return;
  state.iconsLayerEl.innerHTML = '';

  for (const iconDef of state.desktopIcons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'os-desktop-icon';
    btn.dataset.iconId = iconDef.id || iconDef.appId || '';
    btn.dataset.appId = iconDef.appId || '';

    const iconKey = iconDef.iconKey || iconDef.icon || 'file';
    btn.innerHTML =
      `<span class="os-desktop-icon-img">${getIconSVG(iconKey, 32)}</span>` +
      `<span class="os-desktop-icon-label">${escapeHtml(iconDef.label || iconDef.appId || 'App')}</span>`;

    // Pointer-based drag & click selection on desktop; single tap on mobile
    let downX = 0;
    let downY = 0;
    let startLeft = 0;
    let startTop = 0;
    let draggingIcon = false;
    let moved = false;

    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      closeStartMenu();
      closeContextMenu();

      if (!e.ctrlKey && !e.shiftKey && !btn.classList.contains('is-selected')) {
        clearIconSelections();
      }
      btn.classList.add('is-selected');

      // Touch or mobile opens on click instead of dragging icons
      if (RizkyOS.isMobile() || e.pointerType === 'touch') return;

      const desktopRect = getDesktopRect();
      const iconRect = btn.getBoundingClientRect();
      downX = e.clientX;
      downY = e.clientY;
      startLeft = iconRect.left - desktopRect.left;
      startTop = iconRect.top - desktopRect.top;
      draggingIcon = true;
      moved = false;

      const onMove = (ev) => {
        if (!draggingIcon) return;
        const dx = ev.clientX - downX;
        const dy = ev.clientY - downY;
        if (!moved && Math.hypot(dx, dy) < 6) return;
        moved = true;

        const dRect = getDesktopRect();
        const nx = Math.max(4, Math.min(dRect.width - btn.offsetWidth - 4, startLeft + dx));
        const ny = Math.max(4, Math.min(dRect.height - btn.offsetHeight - 4, startTop + dy));
        btn.classList.add('is-positioned');
        btn.style.left = `${Math.round(nx)}px`;
        btn.style.top = `${Math.round(ny)}px`;
      };

      const onUp = () => {
        draggingIcon = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (moved) {
        moved = false;
        return;
      }
      sound.playClick();
      if (RizkyOS.isMobile() || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) {
        if (iconDef.appId) {
          RizkyOS.openApp(iconDef.appId, iconDef.args || {});
        }
      }
    });

    btn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (RizkyOS.isMobile() || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;
      if (iconDef.appId) {
        RizkyOS.openApp(iconDef.appId, iconDef.args || {});
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (iconDef.appId) {
          RizkyOS.openApp(iconDef.appId, iconDef.args || {});
        }
      }
    });

    state.iconsLayerEl.appendChild(btn);
  }
}

function attachDesktopInteractions() {
  let marqueeActive = false;
  let startX = 0;
  let startY = 0;

  state.desktopEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target !== state.desktopEl && e.target !== state.iconsLayerEl) return;

    closeStartMenu();
    closeContextMenu();
    clearIconSelections();

    if (RizkyOS.isMobile() || e.pointerType === 'touch') return;

    const dRect = getDesktopRect();
    startX = e.clientX - dRect.left;
    startY = e.clientY - dRect.top;
    marqueeActive = true;

    state.marqueeEl.style.left = `${startX}px`;
    state.marqueeEl.style.top = `${startY}px`;
    state.marqueeEl.style.width = '0px';
    state.marqueeEl.style.height = '0px';
    state.marqueeEl.style.display = 'block';

    const onMove = (ev) => {
      if (!marqueeActive) return;
      const curX = Math.max(0, Math.min(dRect.width, ev.clientX - dRect.left));
      const curY = Math.max(0, Math.min(dRect.height, ev.clientY - dRect.top));
      const x = Math.min(startX, curX);
      const y = Math.min(startY, curY);
      const w = Math.abs(curX - startX);
      const h = Math.abs(curY - startY);

      state.marqueeEl.style.left = `${x}px`;
      state.marqueeEl.style.top = `${y}px`;
      state.marqueeEl.style.width = `${w}px`;
      state.marqueeEl.style.height = `${h}px`;

      const box = { left: dRect.left + x, top: dRect.top + y, right: dRect.left + x + w, bottom: dRect.top + y + h };
      state.iconsLayerEl.querySelectorAll('.os-desktop-icon').forEach((iconEl) => {
        const r = iconEl.getBoundingClientRect();
        const intersects = !(r.right < box.left || r.left > box.right || r.bottom < box.top || r.top > box.bottom);
        iconEl.classList.toggle('is-selected', intersects);
      });
    };

    const onUp = () => {
      marqueeActive = false;
      state.marqueeEl.style.display = 'none';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  state.desktopEl.addEventListener('contextmenu', (e) => {
    // Allow native or app context menus inside open windows
    if (e.target.closest('.os-window')) return;
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY);
  });
}

/* ==========================================================================
   Window Drag & 8-Edge Resize Handlers
   ========================================================================== */

function attachWindowDrag(win) {
  const titlebar = win.titlebarEl;

  titlebar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.os-win-ctrl')) return;
    if (RizkyOS.isMobile() || !win.resizable) return;
    RizkyOS.toggleMaximize(win.id);
  });

  titlebar.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.os-win-ctrl')) return;
    RizkyOS.focusWindow(win.id);

    if (win.maximized || RizkyOS.isMobile()) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origLeft = win.el.offsetLeft;
    const origTop = win.el.offsetTop;

    state.shellEl.classList.add('os-is-dragging');
    try {
      titlebar.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture unavailable
    }

    const onMove = (ev) => {
      const dRect = getDesktopRect();
      const winW = win.el.offsetWidth;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const minLeft = -(winW - 88);
      const maxLeft = dRect.width - 88;
      const maxTop = Math.max(0, dRect.height - 28);

      const nextLeft = Math.max(minLeft, Math.min(maxLeft, origLeft + dx));
      const nextTop = Math.max(0, Math.min(maxTop, origTop + dy));

      win.el.style.left = `${Math.round(nextLeft)}px`;
      win.el.style.top = `${Math.round(nextTop)}px`;
    };

    const onUp = (ev) => {
      state.shellEl.classList.remove('os-is-dragging');
      try {
        titlebar.releasePointerCapture(ev.pointerId);
      } catch {
        // Ignore
      }
      titlebar.removeEventListener('pointermove', onMove);
      titlebar.removeEventListener('pointerup', onUp);
      titlebar.removeEventListener('pointercancel', onUp);
    };

    titlebar.addEventListener('pointermove', onMove);
    titlebar.addEventListener('pointerup', onUp);
    titlebar.addEventListener('pointercancel', onUp);
  });
}

function attachWindowResize(win) {
  const dirs = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  for (const dir of dirs) {
    const handle = document.createElement('div');
    handle.className = `os-resize-handle os-resize-${dir}`;
    handle.dataset.dir = dir;

    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || win.maximized || RizkyOS.isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      RizkyOS.focusWindow(win.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const origLeft = win.el.offsetLeft;
      const origTop = win.el.offsetTop;
      const origW = win.el.offsetWidth;
      const origH = win.el.offsetHeight;
      const minW = win.minWidth;
      const minH = win.minHeight;
      const dRect = getDesktopRect();

      state.shellEl.classList.add('os-is-dragging');
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let nextLeft = origLeft;
        let nextTop = origTop;
        let nextW = origW;
        let nextH = origH;

        if (dir.includes('e')) {
          nextW = Math.max(minW, Math.min(dRect.width - origLeft + 120, origW + dx));
        }
        if (dir.includes('s')) {
          nextH = Math.max(minH, Math.min(dRect.height - origTop, origH + dy));
        }
        if (dir.includes('w')) {
          const proposedW = origW - dx;
          if (proposedW >= minW) {
            nextW = proposedW;
            nextLeft = origLeft + dx;
          } else {
            nextW = minW;
            nextLeft = origLeft + (origW - minW);
          }
        }
        if (dir.includes('n')) {
          const clampedTop = Math.max(0, origTop + dy);
          const proposedH = origH + (origTop - clampedTop);
          if (proposedH >= minH) {
            nextH = proposedH;
            nextTop = clampedTop;
          } else {
            nextH = minH;
            nextTop = origTop + (origH - minH);
          }
        }

        win.el.style.left = `${Math.round(nextLeft)}px`;
        win.el.style.top = `${Math.round(nextTop)}px`;
        win.el.style.width = `${Math.round(nextW)}px`;
        win.el.style.height = `${Math.round(nextH)}px`;
        notifyWindowResize(win);
      };

      const onUp = (ev) => {
        state.shellEl.classList.remove('os-is-dragging');
        try {
          handle.releasePointerCapture(ev.pointerId);
        } catch {
          // Ignore
        }
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });

    win.el.appendChild(handle);
  }
}

/* ==========================================================================
   System Tray Clock, Indicators & Classic #ffffe1 Win95 Tooltips
   ========================================================================== */

function showWin95Tooltip(targetEl) {
  if (!state.tooltipEl || !targetEl) return;
  const text = targetEl.dataset.tooltip;
  if (!text) return;
  state.tooltipEl.textContent = text;
  state.tooltipEl.classList.add('is-visible');
  const tRect = targetEl.getBoundingClientRect();
  const tipRect = state.tooltipEl.getBoundingClientRect();
  const left = Math.max(4, Math.min(window.innerWidth - tipRect.width - 4, tRect.left + (tRect.width - tipRect.width) / 2));
  const top = Math.max(4, tRect.top - tipRect.height - 6);
  state.tooltipEl.style.left = `${Math.round(left)}px`;
  state.tooltipEl.style.top = `${Math.round(top)}px`;
}

function hideWin95Tooltip() {
  if (!state.tooltipEl) return;
  state.tooltipEl.classList.remove('is-visible');
}

function updateTrayClock() {
  if (!state.clockEl) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  state.clockEl.textContent = `${hh}:${mm}`;
  let dateLabel;
  try {
    dateLabel = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    dateLabel = now.toDateString();
  }
  state.clockEl.dataset.tooltip = dateLabel;
  state.clockEl.setAttribute('aria-label', dateLabel);
}

function syncTrayButtons() {
  if (state.traySoundBtnEl) {
    const isMuted = sound.isMuted();
    const label = isMuted ? 'Sound: Muted (Click to unmute)' : 'Sound: On (Click to mute)';
    state.traySoundBtnEl.innerHTML = getIconSVG(isMuted ? 'sound-off' : 'sound-on', 15);
    state.traySoundBtnEl.dataset.tooltip = label;
    state.traySoundBtnEl.setAttribute('aria-label', label);
  }
  if (state.trayCrtBtnEl) {
    const label = state.crtEnabled
      ? 'CRT Scanlines: Enabled (Click to disable)'
      : 'CRT Scanlines: Off (Click to enable)';
    state.trayCrtBtnEl.classList.toggle('is-on', state.crtEnabled);
    state.trayCrtBtnEl.dataset.tooltip = label;
    state.trayCrtBtnEl.setAttribute('aria-label', label);
  }
}

/* ==========================================================================
   Matrix Digital Rain Canvas Easter Egg
   ========================================================================== */

function resizeMatrixCanvas() {
  if (!state.matrixCanvasEl || !state.desktopEl) return;
  const rect = getDesktopRect();
  state.matrixCanvasEl.width = Math.max(1, Math.floor(rect.width));
  state.matrixCanvasEl.height = Math.max(1, Math.floor(rect.height));
  const cols = Math.max(1, Math.floor(state.matrixCanvasEl.width / 16));
  state.matrixDrops = Array.from({ length: cols }, () => Math.floor(Math.random() * -30));
}

function stopMatrixRain() {
  state.matrixRunning = false;
  if (state.matrixRaf) {
    cancelAnimationFrame(state.matrixRaf);
    state.matrixRaf = null;
  }
  if (state.matrixCanvasEl) {
    state.matrixCanvasEl.classList.remove('is-active');
    const ctx = state.matrixCanvasEl.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, state.matrixCanvasEl.width, state.matrixCanvasEl.height);
  }
}

function startMatrixRain() {
  if (!state.matrixCanvasEl) return;
  resizeMatrixCanvas();
  state.matrixRunning = true;
  state.matrixLastTick = 0;
  state.matrixCanvasEl.classList.add('is-active');

  const ctx = state.matrixCanvasEl.getContext('2d');
  if (!ctx) return;
  const chars = '01RIZKYAIITS95アイウエオカキクケコサシスセソタチツテト∑πλΔ';

  const draw = (ts) => {
    if (!state.matrixRunning) return;
    if (ts - state.matrixLastTick >= 48) {
      state.matrixLastTick = ts;
      const w = state.matrixCanvasEl.width;
      const h = state.matrixCanvasEl.height;

      ctx.fillStyle = 'rgba(0, 12, 4, 0.14)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = '14px "Courier New", monospace';
      for (let i = 0; i < state.matrixDrops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 16;
        const y = state.matrixDrops[i] * 16;

        ctx.fillStyle = Math.random() > 0.92 ? '#c8ffdc' : '#00e65c';
        ctx.fillText(ch, x, y);

        if (y > h && Math.random() > 0.972) {
          state.matrixDrops[i] = 0;
        }
        state.matrixDrops[i] += 1;
      }
    }
    state.matrixRaf = requestAnimationFrame(draw);
  };

  state.matrixRaf = requestAnimationFrame(draw);
}

/* ==========================================================================
   BIOS POST + Win95 Splash Boot Sequence
   ========================================================================== */

function clearBootTimers() {
  for (const id of state.bootTimers) {
    clearTimeout(id);
  }
  state.bootTimers = [];
  if (state.bootRaf) {
    cancelAnimationFrame(state.bootRaf);
    state.bootRaf = null;
  }
  if (typeof state.bootCleanup === 'function') {
    state.bootCleanup();
    state.bootCleanup = null;
  }
}

function finishBootSequence(skipped = false) {
  if (!state.bootActive) return;
  state.bootActive = false;
  clearBootTimers();
  writeSession(SESSION_BOOTED, '1');

  if (state.bootOverlayEl) {
    state.bootOverlayEl.classList.add('is-fading');
    const overlay = state.bootOverlayEl;
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (state.bootOverlayEl === overlay) state.bootOverlayEl = null;
    }, skipped ? 140 : 280);
  }

  sound.playStartup();

  if (typeof state.onBootComplete === 'function') {
    try {
      state.onBootComplete(RizkyOS);
    } catch (err) {
      console.error('[RizkyOS] onBootComplete error:', err);
    }
  }
}

function runBootSequence() {
  if (!state.shellEl) return;
  clearBootTimers();

  if (state.bootOverlayEl && state.bootOverlayEl.parentNode) {
    state.bootOverlayEl.parentNode.removeChild(state.bootOverlayEl);
  }

  const overlay = document.createElement('div');
  overlay.className = 'os-boot-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-label', 'RizkyOS 95 Boot Sequence');

  overlay.innerHTML = `
    <div class="os-bios-stage">
      <div>
        <div class="os-bios-top">
          <div>
            <div class="os-bios-header-title">RizkyOS 95 Award Modular BIOS v4.51PG, An Energy Star Ally</div>
            <div>Copyright (C) 1995-2026, Rizky Alviando Engineering Inc.</div>
            <div style="margin-top:6px;">CPU : Intel Pentium(R) MMX 233MHz + Groq LPU Co-Processor</div>
            <div style="margin-top:4px;">Memory Test : <span class="os-bios-mem">00000K</span></div>
          </div>
          <div class="os-bios-epa">   ___  ___  ___
  | __|| _ \\/ _ \\
  | _| |  _/ (_) |
  |___||_|  \\___/
  ENERGY STAR ALLY</div>
        </div>
        <div class="os-bios-lines"></div>
      </div>
      <div class="os-bios-footer">
        <span>09/03/1995-i430VX-RIZKY95-AI-00</span>
        <span class="os-bios-skip-hint">Click or press ENTER / SPACE / ESC to skip boot</span>
      </div>
    </div>
    <div class="os-splash-stage">
      <div class="os-splash-card">
        <div class="os-splash-flag" aria-hidden="true">
          <div class="os-splash-flag-q1"></div>
          <div class="os-splash-flag-q2"></div>
          <div class="os-splash-flag-q3"></div>
          <div class="os-splash-flag-q4"></div>
        </div>
        <div class="os-splash-brand">RizkyOS <span>95</span></div>
        <div class="os-splash-sub">AI Engineer Edition &mdash; Starting Windows 95...</div>
        <div class="os-splash-progress" aria-hidden="true">
          <div class="os-splash-progress-fill"></div>
        </div>
      </div>
    </div>
  `;

  state.shellEl.appendChild(overlay);
  state.bootOverlayEl = overlay;
  state.bootActive = true;

  const memEl = overlay.querySelector('.os-bios-mem');
  const linesEl = overlay.querySelector('.os-bios-lines');
  const biosStage = overlay.querySelector('.os-bios-stage');
  const splashStage = overlay.querySelector('.os-splash-stage');

  // Skip listener (click, Enter, Space, Escape)
  const onSkipClick = () => finishBootSequence(true);
  const onSkipKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      finishBootSequence(true);
    }
  };
  overlay.addEventListener('click', onSkipClick);
  window.addEventListener('keydown', onSkipKey);
  state.bootCleanup = () => {
    overlay.removeEventListener('click', onSkipClick);
    window.removeEventListener('keydown', onSkipKey);
  };

  // Phase 1A: Memory test counter 00000K -> 65536K OK (~780ms)
  const memStart = performance.now();
  const memDuration = 780;
  const tickMem = (now) => {
    if (!state.bootActive) return;
    const t = Math.min(1, (now - memStart) / memDuration);
    const kb = Math.floor(t * 65536);
    if (t < 1) {
      memEl.textContent = `${String(kb).padStart(5, '0')}K`;
      state.bootRaf = requestAnimationFrame(tickMem);
    } else {
      memEl.innerHTML = '<span class="os-bios-ok">65536K OK</span>';
      sound.playBeep(1000, 0.055);
    }
  };
  state.bootRaf = requestAnimationFrame(tickMem);

  // Phase 1B: Hardware & AI Co-Processor POST detection lines
  const postLines = [
    { delay: 420,  html: 'Detecting Primary Master   ... <span class="os-bios-accent">C:\\RIZKY_AI_ENGINEER</span> [UDMA-33]' },
    { delay: 780,  html: 'Detecting Primary Slave    ... D:\\PORTFOLIO_CERTS_CDROM [14 TRACKS]' },
    { delay: 1120, html: 'GROQ_LLM_CO-PROCESSOR      ... <span class="os-bios-ok">DETECTED</span> (QWEN / LLAMA READY)' },
    { delay: 1420, html: 'ITS_MATH_FPU               ... <span class="os-bios-ok">CUM LAUDE OK</span> (IPK 3.67/4.00)' },
    { delay: 1680, html: 'KOMDIGI_AI_ECOSYSTEM_BUS   ... <span class="os-bios-ok">ONLINE</span>' },
    { delay: 1920, html: 'Booting RIZKYOS95.SYS      ... <span class="os-bios-warn">STARTING WINDOWS 95</span><span class="os-bios-cursor"></span>' },
  ];

  for (const line of postLines) {
    state.bootTimers.push(
      setTimeout(() => {
        if (!state.bootActive) return;
        const row = document.createElement('div');
        row.className = 'os-bios-line';
        row.innerHTML = line.html;
        linesEl.appendChild(row);
      }, line.delay)
    );
  }

  // Phase 2: Classic Win95 Splash (~2.25s -> ~3.2s)
  state.bootTimers.push(
    setTimeout(() => {
      if (!state.bootActive) return;
      biosStage.style.display = 'none';
      splashStage.classList.add('is-active');
    }, 2250)
  );

  // Phase 3: Reveal Desktop (~3.2s)
  state.bootTimers.push(
    setTimeout(() => {
      finishBootSequence(false);
    }, 3200)
  );
}

/* ==========================================================================
   Dynamic Idle & Unfocused Document Title Easter Eggs
   ========================================================================== */

const HIDDEN_TITLES = [
  'RizkyOS 95 — Minimized to System Tray',
  'It is now safe to return to RizkyOS 95',
  'RizkyBot AI: menunggu pesan kamu...',
];

function restoreDocumentTitle() {
  if (typeof document === 'undefined') return;
  if (state.hiddenTitleTimer) {
    clearInterval(state.hiddenTitleTimer);
    state.hiddenTitleTimer = null;
  }
  state.isIdleTitle = false;
  document.title = state.baseTitle;
}

function resetIdleTitleTimer() {
  if (typeof document === 'undefined') return;
  if (state.isIdleTitle && !document.hidden) {
    restoreDocumentTitle();
  }
  if (state.idleTimer) {
    clearTimeout(state.idleTimer);
  }
  state.idleTimer = setTimeout(() => {
    if (!document.hidden && !state.bootActive) {
      state.isIdleTitle = true;
      document.title = 'RizkyOS 95 — Screensaver Standby...';
    }
  }, 60000);
}

/* ==========================================================================
   Global Keyboard Shortcuts (Escape, Alt+Tab, Mnemonics, Konami) & Resize
   ========================================================================== */

function attachGlobalListeners() {
  if (state.globalListenersAttached) return;
  state.globalListenersAttached = true;

  // Classic #ffffe1 1px-black Win95 tooltip delegation
  document.addEventListener('pointerover', (e) => {
    const tipTarget = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
    if (tipTarget) {
      showWin95Tooltip(tipTarget);
    } else {
      hideWin95Tooltip();
    }
  });
  document.addEventListener('pointerdown', hideWin95Tooltip);
  document.addEventListener('focusin', (e) => {
    const tipTarget = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
    if (tipTarget) showWin95Tooltip(tipTarget);
  });
  document.addEventListener('focusout', hideWin95Tooltip);

  // Dynamic unfocused & idle document.title easter eggs
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      state.hiddenTitleIdx = 0;
      document.title = HIDDEN_TITLES[0];
      if (state.hiddenTitleTimer) clearInterval(state.hiddenTitleTimer);
      state.hiddenTitleTimer = setInterval(() => {
        if (!document.hidden) return;
        state.hiddenTitleIdx = (state.hiddenTitleIdx + 1) % HIDDEN_TITLES.length;
        document.title = HIDDEN_TITLES[state.hiddenTitleIdx];
      }, 4500);
    } else {
      restoreDocumentTitle();
      resetIdleTitleTimer();
    }
  });
  window.addEventListener('focus', () => {
    restoreDocumentTitle();
    resetIdleTitleTimer();
  });
  window.addEventListener('pointermove', resetIdleTitleTimer, { passive: true });
  window.addEventListener('pointerdown', resetIdleTitleTimer, { passive: true });

  // Clicking anywhere outside menus dismisses Start Menu & Context Menu
  document.addEventListener('pointerdown', (e) => {
    if (state.startMenuEl && state.startMenuEl.classList.contains('is-open')) {
      if (!e.target.closest('.os-start-menu') && !e.target.closest('.os-start-btn')) {
        closeStartMenu();
      }
    }
    if (state.contextMenuEl && state.contextMenuEl.classList.contains('is-open')) {
      if (!e.target.closest('.os-context-menu')) {
        closeContextMenu();
      }
    }
  });

  // Sync tray icons when sound changes from Display Properties or anywhere else
  window.addEventListener('rizkyos:soundchange', syncTrayButtons);

  // Global keyboard shortcuts & Konami code
  window.addEventListener('keydown', (e) => {
    resetIdleTitleTimer();

    // Recover from BSOD on any key (after grace delay)
    if (state.bsodOpen) {
      if (performance.now() >= state.bsodGraceUntil) {
        e.preventDefault();
        dismissBSOD();
      }
      return;
    }

    // Escape closes menus
    if (e.key === 'Escape') {
      closeStartMenu();
      closeContextMenu();
      hideWin95Tooltip();
    }

    // Start Menu underlined mnemonic activation (e.g. P=Programs, D=Documents, G=Games, S=Settings, U=Shut Down)
    if (
      state.startMenuEl &&
      state.startMenuEl.classList.contains('is-open') &&
      !e.ctrlKey &&
      !e.metaKey &&
      e.key.length === 1
    ) {
      const k = e.key.toLowerCase();
      const openSub = state.startListEl?.querySelector('.os-start-item-wrap.is-sub-open > .os-submenu');
      const scope = openSub || state.startListEl;
      const match = scope?.querySelector(`:scope > .os-start-item-wrap > .os-start-item[data-mnemonic="${k}"]`);
      if (match) {
        e.preventDefault();
        match.click();
        return;
      }
    }

    // Alt+Tab cycles open windows
    if (e.altKey && e.key === 'Tab') {
      const wins = Array.from(state.windows.values());
      if (wins.length > 0) {
        e.preventDefault();
        wins.sort((a, b) => b.zIndex - a.zIndex);
        const currentIdx = wins.findIndex((w) => w.id === state.activeWinId);
        const nextWin = wins[(currentIdx + 1) % wins.length];
        if (nextWin) {
          RizkyOS.focusWindow(nextWin.id);
        }
      }
      return;
    }

    // Konami Code detector (ignore while typing in inputs/textareas)
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea' && !e.target?.isContentEditable) {
      const expected = KONAMI_SEQ[state.konamiIndex];
      const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (pressed === expected) {
        state.konamiIndex += 1;
        if (state.konamiIndex === KONAMI_SEQ.length) {
          state.konamiIndex = 0;
          sound.playStartup();
          RizkyOS.triggerMatrixEasterEgg(true);
          RizkyOS.showDialog({
            title: 'Cheat Code Activated — RizkyOS 95',
            icon: 'ai',
            message:
              'KONAMI CODE UNLOCKED!\n\n' +
              'Matrix Digital Rain mode telah diaktifkan di desktop.\n' +
              'Ketik "matrix" di MS-DOS Prompt atau jalankan lagi untuk toggle.\n\n' +
              'Terima kasih sudah menjelajahi portofolio Rizky Alviando!',
            buttons: ['Keren!', 'Matikan Matrix'],
          }).then((choice) => {
            if (choice === 'Matikan Matrix') {
              RizkyOS.triggerMatrixEasterEgg(false);
            }
          });
        }
      } else {
        state.konamiIndex = pressed === KONAMI_SEQ[0] ? 1 : 0;
      }
    }
  });

  // Viewport resize clamping + Matrix resize + window onResize notifications
  window.addEventListener('resize', () => {
    if (state.matrixRunning) {
      resizeMatrixCanvas();
    }
    const dRect = getDesktopRect();
    const mobile = RizkyOS.isMobile();
    for (const w of state.windows.values()) {
      if (!mobile && !w.maximized) {
        const maxLeft = Math.max(0, dRect.width - 88);
        const maxTop = Math.max(0, dRect.height - 28);
        const curLeft = w.el.offsetLeft;
        const curTop = w.el.offsetTop;
        if (curLeft > maxLeft) w.el.style.left = `${Math.round(maxLeft)}px`;
        if (curTop > maxTop) w.el.style.top = `${Math.round(maxTop)}px`;
      }
      notifyWindowResize(w);
    }
  });
}

function dismissBSOD() {
  state.bsodOpen = false;
  if (state.bsodEl) {
    state.bsodEl.classList.remove('is-open');
  }
  sound.playOpen();
}

/* ==========================================================================
   Build Entire OS Shell DOM inside rootEl
   ========================================================================== */

function buildShellDOM(rootEl) {
  rootEl.innerHTML = '';

  const shell = document.createElement('div');
  shell.className = 'os-shell';
  if (state.crtEnabled) shell.classList.add('crt-enabled');

  // Desktop container
  const desktop = document.createElement('main');
  desktop.className = `os-desktop wp-${state.wallpaper}`;
  desktop.setAttribute('aria-label', 'RizkyOS 95 Desktop');

  const matrixCanvas = document.createElement('canvas');
  matrixCanvas.className = 'os-matrix-canvas';
  matrixCanvas.setAttribute('aria-hidden', 'true');

  const iconsLayer = document.createElement('div');
  iconsLayer.className = 'os-icons-layer';
  iconsLayer.setAttribute('role', 'region');
  iconsLayer.setAttribute('aria-label', 'Desktop Icons');

  const marquee = document.createElement('div');
  marquee.className = 'os-marquee';

  const windowsLayer = document.createElement('div');
  windowsLayer.className = 'os-windows-layer';

  desktop.appendChild(matrixCanvas);
  desktop.appendChild(iconsLayer);
  desktop.appendChild(marquee);
  desktop.appendChild(windowsLayer);

  // Start Menu
  const startMenu = document.createElement('nav');
  startMenu.className = 'os-start-menu';
  startMenu.setAttribute('aria-label', 'Start Menu');

  const banner = document.createElement('div');
  banner.className = 'os-start-banner';
  banner.innerHTML = '<div class="os-start-banner-text"><strong>RizkyOS</strong> 95</div>';

  const startList = document.createElement('div');
  startList.className = 'os-start-list';

  startMenu.appendChild(banner);
  startMenu.appendChild(startList);

  // Context Menu
  const contextMenu = document.createElement('div');
  contextMenu.className = 'os-context-menu';
  contextMenu.setAttribute('role', 'menu');

  const ctxItems = [
    { label: 'Arrange Icons', icon: 'programs', action: 'arrange' },
    { label: 'Refresh', icon: 'computer', action: 'refresh' },
    { divider: true },
    { label: 'Open RizkyBot AI', icon: 'messenger', appId: 'messenger' },
    { label: 'Open MS-DOS Prompt', icon: 'dos', appId: 'terminal' },
    { divider: true },
    { label: 'Display Properties', icon: 'display', appId: 'display' },
    { label: 'About RizkyOS 95', icon: 'info', action: 'about' },
  ];

  for (const ci of ctxItems) {
    if (ci.divider) {
      const sep = document.createElement('div');
      sep.className = 'win95-menu-sep';
      contextMenu.appendChild(sep);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'os-ctx-item';
      btn.innerHTML = `${getIconSVG(ci.icon, 16)}<span>${escapeHtml(ci.label)}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick();
        executeMenuAction(ci);
      });
      contextMenu.appendChild(btn);
    }
  }

  // Taskbar
  const taskbar = document.createElement('footer');
  taskbar.className = 'os-taskbar';
  taskbar.setAttribute('role', 'toolbar');
  taskbar.setAttribute('aria-label', 'Taskbar');

  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.className = 'os-start-btn';
  startBtn.setAttribute('aria-haspopup', 'true');
  startBtn.setAttribute('aria-expanded', 'false');
  startBtn.innerHTML = `${getIconSVG('start', 18)}<span>Start</span>`;
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });

  const sep1 = document.createElement('div');
  sep1.className = 'os-taskbar-sep';

  // Quick Launch icons (desktop)
  const quickLaunch = document.createElement('div');
  quickLaunch.className = 'os-quick-launch';
  const qlApps = [
    { appId: 'messenger', icon: 'messenger', title: 'RizkyBot AI Messenger' },
    { appId: 'browser', icon: 'ie', title: 'Internet Explorer 4.0' },
    { appId: 'terminal', icon: 'dos', title: 'MS-DOS Prompt' },
  ];
  for (const ql of qlApps) {
    const qBtn = document.createElement('button');
    qBtn.type = 'button';
    qBtn.className = 'os-ql-btn';
    qBtn.dataset.tooltip = ql.title;
    qBtn.setAttribute('aria-label', ql.title);
    qBtn.innerHTML = getIconSVG(ql.icon, 16);
    qBtn.addEventListener('click', () => {
      sound.playClick();
      RizkyOS.openApp(ql.appId);
    });
    quickLaunch.appendChild(qBtn);
  }

  const sep2 = document.createElement('div');
  sep2.className = 'os-taskbar-sep ql-sep';

  const taskbarWindows = document.createElement('div');
  taskbarWindows.className = 'os-taskbar-windows';

  // System Tray
  const tray = document.createElement('div');
  tray.className = 'os-tray';

  const aiBtn = document.createElement('button');
  aiBtn.type = 'button';
  aiBtn.className = 'os-tray-ai';
  aiBtn.dataset.tooltip = 'RizkyBot AI: Online (Click to open Messenger)';
  aiBtn.setAttribute('aria-label', 'RizkyBot AI: Online');
  aiBtn.innerHTML = '<span class="os-ai-dot" aria-hidden="true"></span><span class="os-tray-ai-text">AI Online</span>';
  aiBtn.addEventListener('click', () => {
    sound.playClick();
    RizkyOS.openApp('messenger');
  });

  const crtBtn = document.createElement('button');
  crtBtn.type = 'button';
  crtBtn.className = 'os-tray-btn';
  crtBtn.innerHTML = getIconSVG('crt', 15);
  crtBtn.addEventListener('click', () => {
    sound.playClick();
    RizkyOS.toggleCRT();
  });

  const soundBtn = document.createElement('button');
  soundBtn.type = 'button';
  soundBtn.className = 'os-tray-btn';
  soundBtn.addEventListener('click', () => {
    sound.toggleMute();
  });

  const clockEl = document.createElement('span');
  clockEl.className = 'os-tray-clock';

  tray.appendChild(aiBtn);
  tray.appendChild(crtBtn);
  tray.appendChild(soundBtn);
  tray.appendChild(clockEl);

  taskbar.appendChild(startBtn);
  taskbar.appendChild(sep1);
  taskbar.appendChild(quickLaunch);
  taskbar.appendChild(sep2);
  taskbar.appendChild(taskbarWindows);
  taskbar.appendChild(tray);

  // Classic Win95 #ffffe1 1px-black tooltip element
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'os-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');

  // BSOD Overlay
  const bsod = document.createElement('div');
  bsod.className = 'os-bsod';
  bsod.setAttribute('role', 'alertdialog');
  bsod.setAttribute('aria-label', 'Blue Screen of Death');
  bsod.innerHTML = `
    <div class="os-bsod-inner">
      <div class="os-bsod-center">
        <div class="os-bsod-badge">RizkyOS 95</div>
      </div>
      <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD RIZKY_AI(01) + 00010E36. The current coffee level will be terminated.</p>
      <p>*  Press any key or click anywhere to return to RizkyOS 95.<br>
         *  Tip: Do not train a 70B LLM on a 1995 Pentium MMX without CUDA.<br>
         *  Status: No portfolio data was harmed during this nostalgia trip.</p>
      <div class="os-bsod-prompt">Press any key or click to continue <span class="os-bios-cursor"></span></div>
    </div>
  `;
  bsod.addEventListener('click', () => {
    if (performance.now() >= state.bsodGraceUntil) {
      dismissBSOD();
    }
  });

  shell.appendChild(desktop);
  shell.appendChild(startMenu);
  shell.appendChild(contextMenu);
  shell.appendChild(taskbar);
  shell.appendChild(tooltipEl);
  shell.appendChild(bsod);

  rootEl.appendChild(shell);

  state.rootEl = rootEl;
  state.shellEl = shell;
  state.desktopEl = desktop;
  state.matrixCanvasEl = matrixCanvas;
  state.iconsLayerEl = iconsLayer;
  state.marqueeEl = marquee;
  state.windowsLayerEl = windowsLayer;
  state.startMenuEl = startMenu;
  state.startListEl = startList;
  state.contextMenuEl = contextMenu;
  state.taskbarEl = taskbar;
  state.startBtnEl = startBtn;
  state.taskbarWindowsEl = taskbarWindows;
  state.traySoundBtnEl = soundBtn;
  state.trayCrtBtnEl = crtBtn;
  state.clockEl = clockEl;
  state.tooltipEl = tooltipEl;
  state.bsodEl = bsod;
}

/* ==========================================================================
   Public RizkyOS Singleton API
   ========================================================================== */

export const RizkyOS = {
  /**
   * Initialize the entire RizkyOS 95 desktop environment inside `rootEl`.
   */
  init({ rootEl, desktopIcons = [], startMenu = null, onBootComplete = null } = {}) {
    const targetRoot = rootEl || document.getElementById('os-root');
    if (!targetRoot) {
      throw new Error('[RizkyOS] init() requires a valid rootEl or #os-root element.');
    }

    // Tear down any previous clock interval cleanly
    if (state.clockTimer) {
      clearInterval(state.clockTimer);
      state.clockTimer = null;
    }

    if (typeof document !== 'undefined' && document.title) {
      state.baseTitle = document.title;
    }

    state.desktopIcons = Array.isArray(desktopIcons) ? desktopIcons : [];
    state.startMenuConfig = normalizeStartItems(startMenu);
    state.onBootComplete = typeof onBootComplete === 'function' ? onBootComplete : null;
    state.windows.clear();
    state.activeWinId = null;
    state.cascadeIndex = 0;

    buildShellDOM(targetRoot);
    renderDesktopIcons();
    renderStartMenuItems(state.startMenuConfig);
    attachDesktopInteractions();
    attachGlobalListeners();
    syncTrayButtons();
    updateTrayClock();
    resetIdleTitleTimer();
    state.clockTimer = setInterval(updateTrayClock, 1000);

    // Mirror wallpaper class on body for theme awareness
    for (const wp of VALID_WALLPAPERS) {
      document.body.classList.remove(`wp-${wp}`);
    }
    document.body.classList.add(`wp-${state.wallpaper}`);
    document.body.classList.toggle('crt-enabled', state.crtEnabled);

    state.initialized = true;

    // Boot sequence decision: skip if ?skipboot=1 or already booted this session
    const params = new URLSearchParams(window.location.search || '');
    const shouldSkip = params.get('skipboot') === '1' || readSession(SESSION_BOOTED) === '1';

    if (shouldSkip) {
      writeSession(SESSION_BOOTED, '1');
      if (state.onBootComplete) {
        requestAnimationFrame(() => {
          try {
            state.onBootComplete(RizkyOS);
          } catch (err) {
            console.error('[RizkyOS] onBootComplete error:', err);
          }
        });
      }
    } else {
      runBootSequence();
    }

    return RizkyOS;
  },

  /**
   * Register an application definition with the Window Manager.
   */
  registerApp(def) {
    if (!def || !def.id || typeof def.onOpen !== 'function') {
      console.warn('[RizkyOS] registerApp ignored invalid definition:', def);
      return RizkyOS;
    }
    state.apps.set(def.id, {
      id: def.id,
      title: def.title || def.id,
      icon: def.icon || 'file',
      width: Number(def.width) > 0 ? Number(def.width) : 640,
      height: Number(def.height) > 0 ? Number(def.height) : 440,
      minWidth: Number(def.minWidth) > 0 ? Number(def.minWidth) : 280,
      minHeight: Number(def.minHeight) > 0 ? Number(def.minHeight) : 200,
      singleton: Boolean(def.singleton),
      resizable: def.resizable !== false,
      onOpen: def.onOpen,
    });
    return RizkyOS;
  },

  /**
   * Open an app window (or focus & update existing singleton instance).
   */
  openApp(appId, args = {}) {
    const def = state.apps.get(appId);
    if (!def) {
      sound.playError();
      this.showDialog({
        title: 'Program Not Found',
        icon: 'error',
        message: `Cannot find application "${appId}".\nPastikan modul aplikasi sudah terdaftar di RizkyOS 95.`,
        buttons: ['OK'],
      });
      return null;
    }

    closeStartMenu();
    closeContextMenu();

    // Reuse existing window if app is singleton
    if (def.singleton) {
      for (const existing of state.windows.values()) {
        if (existing.appId === appId) {
          this.focusWindow(existing.id);
          if (args && Object.keys(args).length > 0) {
            for (const cb of existing.argsCallbacks) {
              try {
                cb(args);
              } catch (err) {
                console.error(`[RizkyOS] onArgs error in ${appId}:`, err);
              }
            }
            existing.bodyEl.dispatchEvent(new CustomEvent('rizkyos:app-args', { detail: args }));
          }
          return existing.api;
        }
      }
    }

    if (!state.windowsLayerEl) return null;

    const winId = `win-${++state.winSeq}`;
    const dRect = getDesktopRect();
    const mobile = this.isMobile();

    const maxW = Math.max(def.minWidth, dRect.width - 24);
    const maxH = Math.max(def.minHeight, dRect.height - 24);
    const width = Math.min(def.width, maxW);
    const height = Math.min(def.height, maxH);

    // Smart placement: optional explicit args._pos ({ left, top }) or neat cascade
    let left;
    let top;
    if (!mobile && args && args._pos && Number.isFinite(args._pos.left) && Number.isFinite(args._pos.top)) {
      left = Math.max(4, Math.min(dRect.width - width - 4, args._pos.left));
      top = Math.max(4, Math.min(dRect.height - height - 4, args._pos.top));
    } else {
      const step = (state.cascadeIndex % 7) * 26;
      state.cascadeIndex += 1;
      const baseLeft = Math.max(18, Math.floor((dRect.width - width) / 2) - 48);
      const baseTop = Math.max(14, Math.floor((dRect.height - height) / 2) - 32);
      left = Math.max(8, Math.min(Math.max(8, dRect.width - width - 8), baseLeft + step));
      top = Math.max(8, Math.min(Math.max(8, dRect.height - height - 8), baseTop + step));
    }

    const winEl = document.createElement('section');
    winEl.className = 'os-window';
    winEl.dataset.winId = winId;
    winEl.dataset.appId = appId;
    winEl.setAttribute('role', 'dialog');
    winEl.setAttribute('aria-label', def.title);
    winEl.style.left = `${Math.round(left)}px`;
    winEl.style.top = `${Math.round(top)}px`;
    winEl.style.width = `${Math.round(width)}px`;
    winEl.style.height = `${Math.round(height)}px`;

    // Titlebar
    const titlebarEl = document.createElement('header');
    titlebarEl.className = 'os-titlebar';
    titlebarEl.innerHTML =
      `<div class="os-titlebar-left">` +
      `<span class="os-titlebar-icon">${getIconSVG(def.icon, 16)}</span>` +
      `<span class="os-titlebar-title">${escapeHtml(def.title)}</span>` +
      `</div>` +
      `<div class="os-titlebar-controls">` +
      `<button type="button" class="os-win-ctrl" data-action="minimize" title="Minimize" aria-label="Minimize">${CTRL_GLYPHS.minimize}</button>` +
      (def.resizable
        ? `<button type="button" class="os-win-ctrl" data-action="maximize" title="Maximize" aria-label="Maximize">${CTRL_GLYPHS.maximize}</button>`
        : '') +
      `<button type="button" class="os-win-ctrl" data-action="close" title="Close" aria-label="Close">${CTRL_GLYPHS.close}</button>` +
      `</div>`;

    const titleTextEl = titlebarEl.querySelector('.os-titlebar-title');
    const maxBtnEl = titlebarEl.querySelector('[data-action="maximize"]');

    // Body container
    const bodyEl = document.createElement('div');
    bodyEl.className = 'os-window-body';

    // Optional built-in statusbar (hidden until winApi.setStatus(...) is called)
    const statusBarEl = document.createElement('div');
    statusBarEl.className = 'win95-statusbar os-window-statusbar';
    const statusPaneEl = document.createElement('div');
    statusPaneEl.className = 'win95-status-pane';
    statusBarEl.appendChild(statusPaneEl);

    winEl.appendChild(titlebarEl);
    winEl.appendChild(bodyEl);
    winEl.appendChild(statusBarEl);

    // Taskbar button
    const taskBtnEl = document.createElement('button');
    taskBtnEl.type = 'button';
    taskBtnEl.className = 'os-taskbar-btn';
    taskBtnEl.innerHTML =
      `${getIconSVG(def.icon, 16)}` +
      `<span class="os-taskbar-btn-label">${escapeHtml(def.title)}</span>`;
    const taskLabelEl = taskBtnEl.querySelector('.os-taskbar-btn-label');

    const winRecord = {
      id: winId,
      appId,
      title: def.title,
      icon: def.icon,
      el: winEl,
      titlebarEl,
      titleTextEl,
      maxBtnEl,
      bodyEl,
      statusBarEl,
      statusPaneEl,
      taskBtnEl,
      taskLabelEl,
      minWidth: def.minWidth,
      minHeight: def.minHeight,
      resizable: def.resizable,
      zIndex: ++state.zCounter,
      minimized: false,
      maximized: false,
      savedRect: null,
      closeCallbacks: new Set(),
      resizeCallbacks: new Set(),
      argsCallbacks: new Set(),
      api: null,
    };

    const winApi = {
      id: winId,
      appId,
      el: winEl,
      bodyEl,
      setTitle(nextTitle) {
        const text = String(nextTitle ?? '');
        winRecord.title = text;
        winRecord.titleTextEl.textContent = text;
        winRecord.taskLabelEl.textContent = text;
        winRecord.el.setAttribute('aria-label', text);
      },
      setStatus(nextStatus) {
        if (nextStatus === null || nextStatus === undefined || nextStatus === '') {
          winRecord.statusPaneEl.textContent = '';
          winRecord.statusBarEl.classList.remove('has-status');
        } else {
          winRecord.statusPaneEl.textContent = String(nextStatus);
          winRecord.statusBarEl.classList.add('has-status');
        }
      },
      close() {
        RizkyOS.closeWindow(winId);
      },
      focus() {
        RizkyOS.focusWindow(winId);
      },
      minimize() {
        RizkyOS.minimizeWindow(winId);
      },
      toggleMaximize() {
        RizkyOS.toggleMaximize(winId);
      },
      onClose(cb) {
        if (typeof cb === 'function') {
          winRecord.closeCallbacks.add(cb);
          return () => winRecord.closeCallbacks.delete(cb);
        }
        return () => {};
      },
      onResize(cb) {
        if (typeof cb === 'function') {
          winRecord.resizeCallbacks.add(cb);
          return () => winRecord.resizeCallbacks.delete(cb);
        }
        return () => {};
      },
      onArgs(cb) {
        if (typeof cb === 'function') {
          winRecord.argsCallbacks.add(cb);
          return () => winRecord.argsCallbacks.delete(cb);
        }
        return () => {};
      },
      os: RizkyOS,
    };
    winRecord.api = winApi;

    // Window focus on pointerdown anywhere inside window
    winEl.addEventListener('pointerdown', () => {
      closeStartMenu();
      closeContextMenu();
      if (state.activeWinId !== winId) {
        this.focusWindow(winId);
      }
    });

    // Titlebar control buttons
    titlebarEl.querySelector('[data-action="minimize"]').addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      this.minimizeWindow(winId);
    });
    if (maxBtnEl) {
      maxBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick();
        this.toggleMaximize(winId);
      });
    }
    titlebarEl.querySelector('[data-action="close"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(winId);
    });

    // Taskbar button toggle focus/minimize
    taskBtnEl.addEventListener('click', () => {
      sound.playClick();
      if (state.activeWinId === winId && !winRecord.minimized) {
        this.minimizeWindow(winId);
      } else {
        this.focusWindow(winId);
      }
    });

    attachWindowDrag(winRecord);
    if (def.resizable) {
      attachWindowResize(winRecord);
    }

    state.windows.set(winId, winRecord);
    state.windowsLayerEl.appendChild(winEl);
    state.taskbarWindowsEl.appendChild(taskBtnEl);

    this.focusWindow(winId);
    sound.playOpen();

    // Mount app content safely
    try {
      def.onOpen(bodyEl, winApi, args || {});
    } catch (err) {
      console.error(`[RizkyOS] Failed to open app "${appId}":`, err);
      bodyEl.innerHTML =
        `<div style="padding:16px;display:flex;gap:12px;align-items:flex-start;">` +
        `${getIconSVG('error', 32)}` +
        `<div><strong>Application Error</strong><p style="margin:6px 0 0;">${escapeHtml(err?.message || 'Unexpected error while loading app.')}</p></div>` +
        `</div>`;
    }

    return winApi;
  },

  /**
   * Close a window by ID and invoke all registered onClose cleanup hooks.
   */
  closeWindow(winId) {
    const win = state.windows.get(winId);
    if (!win) return;

    for (const cb of win.closeCallbacks) {
      try {
        cb();
      } catch (err) {
        console.error(`[RizkyOS] onClose cleanup error in ${win.appId}:`, err);
      }
    }
    win.closeCallbacks.clear();
    win.resizeCallbacks.clear();
    win.argsCallbacks.clear();

    if (win.el.parentNode) win.el.parentNode.removeChild(win.el);
    if (win.taskBtnEl.parentNode) win.taskBtnEl.parentNode.removeChild(win.taskBtnEl);
    state.windows.delete(winId);

    sound.playClose();

    if (state.activeWinId === winId) {
      state.activeWinId = null;
      focusTopVisibleWindow();
    } else {
      syncTaskbarStates();
    }
  },

  /**
   * Bring a window to the front (restoring it if minimized).
   */
  focusWindow(winId) {
    const win = state.windows.get(winId);
    if (!win) return;

    if (win.minimized) {
      win.minimized = false;
      win.el.classList.remove('is-minimized');
    }

    win.zIndex = ++state.zCounter;
    win.el.style.zIndex = String(win.zIndex);
    state.activeWinId = winId;
    syncTaskbarStates();
  },

  /**
   * Minimize a window to the taskbar.
   */
  minimizeWindow(winId) {
    const win = state.windows.get(winId);
    if (!win) return;

    win.minimized = true;
    win.el.classList.add('is-minimized');
    if (state.activeWinId === winId) {
      state.activeWinId = null;
      focusTopVisibleWindow();
    } else {
      syncTaskbarStates();
    }
  },

  /**
   * Toggle maximize / restore on a window.
   */
  toggleMaximize(winId) {
    const win = state.windows.get(winId);
    if (!win || !win.resizable) return;

    if (!win.maximized) {
      win.savedRect = {
        left: win.el.style.left,
        top: win.el.style.top,
        width: win.el.style.width,
        height: win.el.style.height,
      };
      win.maximized = true;
      win.el.classList.add('is-maximized');
      if (win.maxBtnEl) {
        win.maxBtnEl.innerHTML = CTRL_GLYPHS.restore;
        win.maxBtnEl.title = 'Restore';
        win.maxBtnEl.setAttribute('aria-label', 'Restore');
      }
    } else {
      win.maximized = false;
      win.el.classList.remove('is-maximized');
      if (win.savedRect) {
        win.el.style.left = win.savedRect.left;
        win.el.style.top = win.savedRect.top;
        win.el.style.width = win.savedRect.width;
        win.el.style.height = win.savedRect.height;
      }
      if (win.maxBtnEl) {
        win.maxBtnEl.innerHTML = CTRL_GLYPHS.maximize;
        win.maxBtnEl.title = 'Maximize';
        win.maxBtnEl.setAttribute('aria-label', 'Maximize');
      }
    }

    this.focusWindow(winId);
    requestAnimationFrame(() => notifyWindowResize(win));
  },

  /**
   * Neatly cascade all open windows across the desktop.
   */
  cascadeWindows() {
    const dRect = getDesktopRect();
    let idx = 0;
    for (const win of state.windows.values()) {
      if (win.minimized) {
        win.minimized = false;
        win.el.classList.remove('is-minimized');
      }
      if (win.maximized) {
        this.toggleMaximize(win.id);
      }
      const x = 24 + (idx % 8) * 28;
      const y = 20 + (idx % 8) * 28;
      const w = Math.min(win.el.offsetWidth || 600, Math.max(win.minWidth, dRect.width - x - 16));
      const h = Math.min(win.el.offsetHeight || 420, Math.max(win.minHeight, dRect.height - y - 16));
      win.el.style.left = `${x}px`;
      win.el.style.top = `${y}px`;
      win.el.style.width = `${w}px`;
      win.el.style.height = `${h}px`;
      this.focusWindow(win.id);
      notifyWindowResize(win);
      idx += 1;
    }
    state.cascadeIndex = idx;
  },

  /**
   * Close all open windows cleanly.
   */
  closeAllWindows() {
    const ids = Array.from(state.windows.keys());
    for (const id of ids) {
      this.closeWindow(id);
    }
  },

  /**
   * Show an authentic modal Windows 95 dialog and return a Promise of the clicked button label.
   */
  showDialog({ title = 'RizkyOS 95', message = '', icon = 'info', buttons = ['OK'] } = {}) {
    return new Promise((resolve) => {
      const btnList = Array.isArray(buttons) && buttons.length > 0 ? buttons : ['OK'];
      if (icon === 'error' || icon === 'warning') {
        sound.playError();
      } else {
        sound.playOpen();
      }

      const backdrop = document.createElement('div');
      backdrop.className = 'os-dialog-backdrop';

      const dialog = document.createElement('div');
      dialog.className = 'os-dialog';
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', title);

      const titlebar = document.createElement('div');
      titlebar.className = 'os-dialog-titlebar';
      const titleSpan = document.createElement('span');
      titleSpan.textContent = title;
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'os-win-ctrl';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML = CTRL_GLYPHS.close;
      titlebar.appendChild(titleSpan);
      titlebar.appendChild(closeBtn);

      const content = document.createElement('div');
      content.className = 'os-dialog-content';

      const iconWrap = document.createElement('div');
      iconWrap.className = 'os-dialog-icon';
      iconWrap.innerHTML = getIconSVG(icon || 'info', 32);

      const msgEl = document.createElement('div');
      msgEl.className = 'os-dialog-message';
      msgEl.textContent = String(message ?? '');

      content.appendChild(iconWrap);
      content.appendChild(msgEl);

      const actions = document.createElement('div');
      actions.className = 'os-dialog-actions';

      let settled = false;
      const finish = (choice) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('keydown', onKeyDown, true);
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        resolve(choice);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          sound.playClick();
          finish(btnList[btnList.length - 1]);
        } else if (e.key === 'Enter') {
          const active = document.activeElement;
          if (active && actions.contains(active)) return;
          e.preventDefault();
          e.stopPropagation();
          sound.playClick();
          finish(btnList[0]);
        }
      };

      btnList.forEach((label, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = idx === 0 ? 'win95-btn primary' : 'win95-btn';
        b.textContent = String(label);
        b.addEventListener('click', () => {
          sound.playClick();
          finish(String(label));
        });
        actions.appendChild(b);
      });

      closeBtn.addEventListener('click', () => {
        sound.playClick();
        finish(btnList[btnList.length - 1]);
      });

      dialog.appendChild(titlebar);
      dialog.appendChild(content);
      dialog.appendChild(actions);
      backdrop.appendChild(dialog);

      (state.shellEl || document.body).appendChild(backdrop);
      window.addEventListener('keydown', onKeyDown, true);

      const firstBtn = actions.querySelector('button');
      if (firstBtn) firstBtn.focus();
    });
  },

  /**
   * Apply and persist a desktop wallpaper ('teal', 'clouds', 'matrix', 'batik', 'navy').
   */
  setWallpaper(id) {
    const clean = VALID_WALLPAPERS.includes(id) ? id : 'teal';
    state.wallpaper = clean;
    writeStorage(STORAGE_WP, clean);

    for (const wp of VALID_WALLPAPERS) {
      if (state.desktopEl) state.desktopEl.classList.remove(`wp-${wp}`);
      document.body.classList.remove(`wp-${wp}`);
    }
    if (state.desktopEl) state.desktopEl.classList.add(`wp-${clean}`);
    document.body.classList.add(`wp-${clean}`);

    window.dispatchEvent(new CustomEvent('rizkyos:wallpaperchange', { detail: { wallpaper: clean } }));
    return clean;
  },

  /**
   * @returns {string} current wallpaper id
   */
  getWallpaper() {
    return state.wallpaper;
  },

  /**
   * Toggle subtle CRT scanlines & vignette effect, persisted in localStorage.
   */
  toggleCRT() {
    state.crtEnabled = !state.crtEnabled;
    writeStorage(STORAGE_CRT, state.crtEnabled ? 'true' : 'false');
    if (state.shellEl) state.shellEl.classList.toggle('crt-enabled', state.crtEnabled);
    document.body.classList.toggle('crt-enabled', state.crtEnabled);
    syncTrayButtons();
    window.dispatchEvent(new CustomEvent('rizkyos:crtchange', { detail: { enabled: state.crtEnabled } }));
    return state.crtEnabled;
  },

  /**
   * @returns {boolean}
   */
  isCRTEnabled() {
    return state.crtEnabled;
  },

  /**
   * Trigger classic Windows 95 Blue Screen of Death gag (press any key or click to recover).
   */
  triggerBSOD() {
    closeStartMenu();
    closeContextMenu();
    sound.playError();
    state.bsodOpen = true;
    state.bsodGraceUntil = performance.now() + 350;
    if (state.bsodEl) {
      state.bsodEl.classList.add('is-open');
    }
  },

  /**
   * Toggle (or explicitly set) desktop Matrix Digital Rain canvas overlay.
   * @param {boolean} [forceState]
   * @returns {boolean} running state
   */
  triggerMatrixEasterEgg(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !state.matrixRunning;
    if (next) {
      if (!state.matrixRunning) startMatrixRain();
    } else {
      stopMatrixRain();
    }
    return state.matrixRunning;
  },

  /**
   * Replay the full BIOS POST & Windows 95 splash boot sequence.
   */
  rebootOS() {
    closeStartMenu();
    closeContextMenu();
    if (state.bsodOpen) dismissBSOD();
    stopMatrixRain();
    this.closeAllWindows();
    removeSession(SESSION_BOOTED);
    runBootSequence();
  },

  /**
   * @returns {boolean} true when viewport width <= 768px
   */
  isMobile() {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  },

  /**
   * Reset all dragged desktop icons back into the clean Win95 column grid.
   */
  arrangeIcons() {
    if (!state.iconsLayerEl) return;
    state.iconsLayerEl.querySelectorAll('.os-desktop-icon').forEach((iconEl) => {
      iconEl.classList.remove('is-positioned');
      iconEl.style.left = '';
      iconEl.style.top = '';
    });
  },

  /**
   * Brief classic Win95 desktop refresh blink.
   */
  refreshDesktop() {
    if (!state.iconsLayerEl) return;
    clearIconSelections();
    state.iconsLayerEl.classList.add('is-refreshing');
    setTimeout(() => {
      if (state.iconsLayerEl) state.iconsLayerEl.classList.remove('is-refreshing');
    }, 110);
  },

  /**
   * Show classic About RizkyOS 95 dialog.
   */
  showAboutDialog() {
    return this.showDialog({
      title: 'About RizkyOS 95',
      icon: 'computer',
      message:
        'RizkyOS 95 — Interactive Desktop Portfolio\n' +
        'Version 4.00.950 (AI Engineer Edition)\n\n' +
        'Built for Rizky Alviando\n' +
        'AI Engineer (DJED Komdigi) | S1 Matematika ITS (Cum Laude, IPK 3.67)\n\n' +
        'Powered by Vanilla ES Modules, FastAPI, Groq LLM & Web Audio.',
      buttons: ['OK'],
    });
  },

  /**
   * Show classic Shut Down RizkyOS 95 dialog (Restart BIOS / BSOD Gag / Cancel).
   */
  async showShutdownDialog() {
    const choice = await this.showDialog({
      title: 'Shut Down RizkyOS 95',
      icon: 'shutdown',
      message:
        'Apa yang ingin Anda lakukan dengan RizkyOS 95?\n\n' +
        '- Restart BIOS: Putar ulang urutan Award BIOS POST & Win95 Splash\n' +
        '- BSOD Gag: Picu layar biru klasik RIZKY_AI.VXD\n' +
        '- Cancel: Kembali ke desktop',
      buttons: ['Restart BIOS', 'BSOD Gag', 'Cancel'],
    });
    if (choice === 'Restart BIOS') {
      this.rebootOS();
    } else if (choice === 'BSOD Gag') {
      this.triggerBSOD();
    }
  },

  /**
   * Inspect currently open windows.
   */
  getOpenWindows() {
    return Array.from(state.windows.values()).map((w) => ({
      id: w.id,
      appId: w.appId,
      title: w.title,
      minimized: w.minimized,
      maximized: w.maximized,
      active: w.id === state.activeWinId && !w.minimized,
    }));
  },

  /**
   * Inspect registered app IDs.
   */
  getRegisteredApps() {
    return Array.from(state.apps.keys());
  },
};

if (typeof window !== 'undefined') {
  window.RizkyOS = RizkyOS;
}
