/**
 * RizkyOS 95 — Main Bootstrap & Application Registry
 * Wires the Window Manager, portfolio data, all 12 desktop applications,
 * multi-level Start Menu, initial workspace layout, and URL hash deep-linking.
 */

import { RizkyOS } from './wm.js';
import { DESKTOP_ICONS, PROJECTS } from './data.js';

import { messengerApp } from './apps/messenger.js';
import { browserApp } from './apps/browser.js';
import {
  explorerApp,
  notepadApp,
  pdfViewerApp,
  recycleBinApp,
} from './apps/explorer.js';
import { terminalApp } from './apps/terminal.js';
import { ojekRushApp, minesweeperApp } from './apps/game.js';
import { guestbookApp, displayApp, room3dApp } from './apps/extras.js';

const ALL_APPS = [
  explorerApp,
  browserApp,
  messengerApp,
  notepadApp,
  pdfViewerApp,
  recycleBinApp,
  terminalApp,
  ojekRushApp,
  minesweeperApp,
  guestbookApp,
  displayApp,
  room3dApp,
];

const START_MENU = [
  {
    label: 'Programs',
    icon: 'programs',
    children: [
      { label: 'RizkyBot AI', icon: 'messenger', appId: 'messenger' },
      { label: 'Internet Explorer', icon: 'ie', appId: 'browser', args: { page: 'home' } },
      { label: 'My Computer', icon: 'computer', appId: 'explorer' },
      { label: 'MS-DOS Prompt', icon: 'dos', appId: 'terminal' },
      { label: 'WordPad CV', icon: 'wordpad', appId: 'notepad', args: { doc: 'cv' } },
      { label: '3D Room', icon: 'room3d', appId: 'room3d' },
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
    label: 'Documents',
    icon: 'documents',
    children: [
      { label: 'README.txt', icon: 'notepad', appId: 'notepad', args: { doc: 'readme' } },
      { label: 'CV Rizky Alviando', icon: 'wordpad', appId: 'notepad', args: { doc: 'cv' } },
      {
        label: 'Certificates Folder',
        icon: 'folder',
        appId: 'explorer',
        args: { path: 'C:\\Rizky\\Certificates' },
      },
    ],
  },
  {
    label: 'Community',
    icon: 'guestbook',
    children: [
      { label: 'RizkyBook Guestbook', icon: 'guestbook', appId: 'guestbook' },
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
  { divider: true },
  { label: 'Shut Down...', icon: 'shutdown', action: 'shutdown' },
];

/**
 * Resolve a URL hash (e.g. `#chat`, `#projects`, `#project/aegislake`, `#dos`, `#game`, `#cv`)
 * into an `{ appId, args }` launch target, or `null` when no hash route matches.
 */
function resolveHashRoute(rawHash) {
  const cleaned = String(rawHash || '')
    .replace(/^#\/?/, '')
    .trim();
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();

  // Direct app / page shortcuts
  const routeMap = {
    chat: { appId: 'messenger' },
    messenger: { appId: 'messenger' },
    ai: { appId: 'messenger' },
    bot: { appId: 'messenger' },

    home: { appId: 'browser', args: { page: 'home' } },
    portfolio: { appId: 'browser', args: { page: 'home' } },
    ie: { appId: 'browser', args: { page: 'home' } },
    browser: { appId: 'browser', args: { page: 'home' } },
    about: { appId: 'browser', args: { page: 'about' } },
    experience: { appId: 'browser', args: { page: 'experience' } },
    exp: { appId: 'browser', args: { page: 'experience' } },
    projects: { appId: 'browser', args: { page: 'projects' } },
    proyek: { appId: 'browser', args: { page: 'projects' } },
    skills: { appId: 'browser', args: { page: 'skills' } },
    keahlian: { appId: 'browser', args: { page: 'skills' } },
    contact: { appId: 'browser', args: { page: 'contact' } },
    kontak: { appId: 'browser', args: { page: 'contact' } },

    dos: { appId: 'terminal' },
    terminal: { appId: 'terminal' },
    cmd: { appId: 'terminal' },

    game: { appId: 'ojek-rush' },
    ojek: { appId: 'ojek-rush' },
    'ojek-rush': { appId: 'ojek-rush' },
    minesweeper: { appId: 'minesweeper' },
    mines: { appId: 'minesweeper' },

    cv: { appId: 'notepad', args: { doc: 'cv' } },
    resume: { appId: 'notepad', args: { doc: 'cv' } },
    readme: { appId: 'notepad', args: { doc: 'readme' } },
    notepad: { appId: 'notepad', args: { doc: 'readme' } },

    explorer: { appId: 'explorer' },
    files: { appId: 'explorer' },
    computer: { appId: 'explorer' },
    certs: { appId: 'explorer', args: { path: 'C:\\Rizky\\Certificates' } },
    certificates: { appId: 'explorer', args: { path: 'C:\\Rizky\\Certificates' } },
    pdf: { appId: 'pdf-viewer' },

    guestbook: { appId: 'guestbook' },
    rizkybook: { appId: 'guestbook' },
    display: { appId: 'display' },
    settings: { appId: 'display' },
    wallpaper: { appId: 'display' },
    '3d': { appId: 'room3d' },
    room: { appId: 'room3d' },
    room3d: { appId: 'room3d' },
    recycle: { appId: 'recycle-bin' },
    trash: { appId: 'recycle-bin' },
    'recycle-bin': { appId: 'recycle-bin' },
  };

  if (routeMap[lower]) {
    return routeMap[lower];
  }

  // Case study deep links: #project/<slug>, #projects/<slug>, #project:<slug>, or #<slug>
  if (lower.startsWith('project:') || lower.startsWith('project/') || lower.startsWith('projects/')) {
    const slug = cleaned.replace(/^projects?[:/]/i, '').trim();
    if (slug) {
      return { appId: 'browser', args: { page: `project:${slug}` } };
    }
  }

  const matchedProject = (PROJECTS || []).find(
    (p) =>
      String(p.slug || '').toLowerCase() === lower ||
      String(p.id || '').toLowerCase() === lower
  );
  if (matchedProject) {
    return { appId: 'browser', args: { page: `project:${matchedProject.slug || matchedProject.id}` } };
  }

  return null;
}

/**
 * Anchor RizkyBot Messenger cleanly on the right side of the desktop so the
 * left desktop icon columns and serene teal Win95 workspace remain 100%
 * uncovered and immediately clickable (matching InspiredOS's airy layout).
 */
function openInitialDesktopWorkspace(os) {
  const vw = window.innerWidth;
  const vh = Math.max(360, window.innerHeight - 34);

  const msnW = Math.min(messengerApp.width || 465, vw - 24);
  const msnH = Math.min(messengerApp.height || 575, vh - 36);

  // Leave generous clearance on the left for the desktop icon columns (~240px)
  const rightAnchor = vw - msnW - 28;
  const msnLeft = Math.max(12, Math.min(vw - msnW - 12, Math.max(240, rightAnchor)));
  const msnTop = Math.max(18, Math.min(44, Math.floor((vh - msnH) * 0.32)));

  os.openApp('messenger', {
    _pos: { left: msnLeft, top: msnTop },
  });
}

function bootRizkyOS() {
  for (const appDef of ALL_APPS) {
    RizkyOS.registerApp(appDef);
  }

  const rootEl = document.getElementById('os-root');

  RizkyOS.init({
    rootEl,
    desktopIcons: DESKTOP_ICONS,
    startMenu: START_MENU,
    onBootComplete(os) {
      const hashRoute = resolveHashRoute(window.location.hash);
      if (hashRoute) {
        os.openApp(hashRoute.appId, hashRoute.args || {});
        return;
      }

      if (os.isMobile()) {
        // Mobile lands cleanly on Home Portfolio IE (single auto-maximized window, zero overlap)
        os.openApp('browser', { page: 'home' });
      } else {
        openInitialDesktopWorkspace(os);
      }
    },
  });

  // Live URL hash deep-linking after boot
  window.addEventListener('hashchange', () => {
    const hashRoute = resolveHashRoute(window.location.hash);
    if (hashRoute) {
      RizkyOS.openApp(hashRoute.appId, hashRoute.args || {});
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootRizkyOS, { once: true });
} else {
  bootRizkyOS();
}
