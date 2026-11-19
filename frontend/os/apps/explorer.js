import {
  PROFILE,
  EXPERIENCES,
  PROJECTS,
  SKILLS,
  CERTIFICATES,
  VIRTUAL_FS,
  RECYCLE_ITEMS
} from '../data.js';
import { getIconSVG } from '../icons.js';
import { sound } from '../sound.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHref(rawUrl) {
  const url = String(rawUrl ?? '').trim();
  if (!url) return '#';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  return '#';
}

function safeAssetUrl(rawPath) {
  const path = String(rawPath ?? '').trim();
  if (!path) return '';
  if (/^(javascript|data|vbscript):/i.test(path)) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return encodeURI(normalized);
}

const VALID_ICON_KEYS = new Set([
  'computer', 'ie', 'messenger', 'dos', 'notepad', 'wordpad', 'folder',
  'folder-open', 'pdf', 'game', 'minesweeper', 'guestbook', 'room3d',
  'display', 'recycle-empty', 'recycle-full', 'start', 'sound-on',
  'sound-off', 'info', 'warning', 'error', 'file', 'link', 'ai',
  'shutdown', 'programs', 'documents', 'settings'
]);

function resolveNodeIcon(node, isOpenFolder = false) {
  if (node?.type === 'folder') {
    return isOpenFolder ? 'folder-open' : 'folder';
  }
  if (node?.icon && VALID_ICON_KEYS.has(node.icon)) {
    return node.icon;
  }
  switch (node?.type) {
    case 'pdf':
      return 'pdf';
    case 'ie':
      return 'ie';
    case 'doc':
    case 'txt':
      return node.docKey === 'cv' ? 'wordpad' : 'notepad';
    case 'link':
      return 'link';
    case 'app':
      if (node.appId && VALID_ICON_KEYS.has(node.appId)) return node.appId;
      return 'programs';
    default:
      return 'file';
  }
}

function describeNodeType(node) {
  switch (node?.type) {
    case 'folder':
      return 'File Folder';
    case 'pdf':
      return 'PDF Certificate';
    case 'ie':
      return 'Internet Shortcut';
    case 'doc':
      return node.docKey === 'cv' ? 'WordPad Document' : 'Text Document';
    case 'txt':
      return 'Text Document';
    case 'app':
      return 'Application (.exe)';
    case 'link':
      return 'Web Shortcut';
    default:
      return 'File';
  }
}

function normalizeRootFs() {
  if (VIRTUAL_FS && typeof VIRTUAL_FS === 'object') {
    if (Array.isArray(VIRTUAL_FS.children)) {
      return {
        name: VIRTUAL_FS.name || 'C:\\Rizky',
        type: 'folder',
        icon: 'computer',
        children: VIRTUAL_FS.children
      };
    }
    if (Array.isArray(VIRTUAL_FS)) {
      return {
        name: 'C:\\Rizky',
        type: 'folder',
        icon: 'computer',
        children: VIRTUAL_FS
      };
    }
  }
  return { name: 'C:\\Rizky', type: 'folder', icon: 'computer', children: [] };
}

function findFsDocByKey(rootNode, docKey) {
  const queue = [...(rootNode.children || [])];
  while (queue.length) {
    const node = queue.shift();
    if (node.docKey === docKey && typeof node.content === 'string') {
      return node;
    }
    if (Array.isArray(node.children)) {
      queue.push(...node.children);
    }
  }
  return null;
}

function buildPathString(pathSegments, rootName) {
  if (!pathSegments.length) return rootName;
  return `${rootName}\\${pathSegments.join('\\')}`;
}

function findFolderByPath(rootNode, pathInput) {
  const rootName = rootNode.name || 'C:\\Rizky';
  if (!pathInput) return { node: rootNode, segments: [] };

  let cleaned = String(pathInput).trim().replace(/\//g, '\\');
  const rootPrefix = rootName.toLowerCase();
  if (cleaned.toLowerCase() === rootPrefix || cleaned === '\\') {
    return { node: rootNode, segments: [] };
  }
  if (cleaned.toLowerCase().startsWith(`${rootPrefix}\\`)) {
    cleaned = cleaned.slice(rootPrefix.length + 1);
  }
  cleaned = cleaned.replace(/^\\+|\\+$/g, '');
  if (!cleaned) return { node: rootNode, segments: [] };

  const parts = cleaned.split('\\').filter(Boolean);
  let current = rootNode;
  const matched = [];
  for (const part of parts) {
    const next = (current.children || []).find(
      (c) => c.type === 'folder' && c.name.toLowerCase() === part.toLowerCase()
    );
    if (!next) break;
    current = next;
    matched.push(next.name);
  }
  return { node: current, segments: matched };
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
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
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ============================================================================
 * 1. WINDOWS 95 EXPLORER (explorerApp)
 * ========================================================================== */

export const explorerApp = {
  id: 'explorer',
  title: 'Exploring - C:\\Rizky',
  icon: 'computer',
  width: 720,
  height: 500,
  minWidth: 420,
  minHeight: 320,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    const rootFs = normalizeRootFs();
    const rootName = rootFs.name || 'C:\\Rizky';
    const expandedKeys = new Set(['']);
    const navHistory = [];
    let navIndex = -1;
    let currentSegments = [];
    let currentFolder = rootFs;
    let selectedIndex = -1;
    let viewMode = 'icons'; // 'icons' | 'list'
    let openMenuName = null;

    containerEl.innerHTML = `
      <div class="exp-app">
        <div class="win95-menubar exp-menubar" role="menubar">
          <div class="exp-menu-group">
            <button type="button" class="win95-menubar-item exp-menu-btn" data-menu="file"><u>F</u>ile</button>
            <div class="win95-menu-dropdown exp-menu-dropdown" data-dropdown="file" hidden>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="open-selected">Open Selected</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="close">Close</button>
            </div>
          </div>
          <div class="exp-menu-group">
            <button type="button" class="win95-menubar-item exp-menu-btn" data-menu="view"><u>V</u>iew</button>
            <div class="win95-menu-dropdown exp-menu-dropdown" data-dropdown="view" hidden>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="view-icons">Large Icons</button>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="view-list">Details List</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="refresh">Refresh</button>
            </div>
          </div>
          <div class="exp-menu-group">
            <button type="button" class="win95-menubar-item exp-menu-btn" data-menu="go"><u>G</u>o</button>
            <div class="win95-menu-dropdown exp-menu-dropdown" data-dropdown="go" hidden>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="up">Up One Level</button>
              <button type="button" class="win95-menu-item exp-menu-item" data-jump="${escapeHtml(rootName)}">${escapeHtml(rootName)}</button>
              <button type="button" class="win95-menu-item exp-menu-item" data-jump="${escapeHtml(rootName)}\\Projects">Projects</button>
              <button type="button" class="win95-menu-item exp-menu-item" data-jump="${escapeHtml(rootName)}\\Certificates">Certificates</button>
            </div>
          </div>
          <div class="exp-menu-group">
            <button type="button" class="win95-menubar-item exp-menu-btn" data-menu="help"><u>H</u>elp</button>
            <div class="win95-menu-dropdown exp-menu-dropdown" data-dropdown="help" hidden>
              <button type="button" class="win95-menu-item exp-menu-item" data-action="about">About Rizky Explorer...</button>
            </div>
          </div>
        </div>

        <div class="win95-toolbar exp-toolbar">
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="back" disabled>◀ Back</button>
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="up" disabled>▲ Up</button>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <button type="button" class="win95-toolbar-btn exp-tb-btn is-active" data-action="view-icons" title="Large Icons">Icons</button>
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="view-list" title="Details List">Details</button>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="open-selected" disabled>Open</button>
        </div>

        <div class="exp-addressbar">
          <span class="exp-addr-label">Address</span>
          <div class="win95-field exp-addr-box">
            <span class="exp-addr-icon">${getIconSVG('folder-open', 16)}</span>
            <span class="exp-addr-text"></span>
          </div>
        </div>

        <div class="exp-split">
          <aside class="exp-tree win95-sunken win95-scrollbar" aria-label="Folder Tree"></aside>
          <section class="exp-files win95-sunken win95-scrollbar" aria-label="Folder Contents"></section>
        </div>
      </div>
    `;

    const rootEl = containerEl.querySelector('.exp-app');
    const treeEl = containerEl.querySelector('.exp-tree');
    const filesEl = containerEl.querySelector('.exp-files');
    const addrTextEl = containerEl.querySelector('.exp-addr-text');
    const backBtn = containerEl.querySelector('[data-action="back"]');
    const upBtn = containerEl.querySelector('[data-action="up"]');
    const openSelBtn = containerEl.querySelector('.exp-tb-btn[data-action="open-selected"]');
    const iconsBtn = containerEl.querySelector('.exp-tb-btn[data-action="view-icons"]');
    const listBtn = containerEl.querySelector('.exp-tb-btn[data-action="view-list"]');

    function closeMenus() {
      openMenuName = null;
      rootEl.querySelectorAll('.exp-menu-dropdown').forEach((d) => {
        d.hidden = true;
      });
      rootEl.querySelectorAll('.exp-menu-btn').forEach((b) => {
        b.classList.remove('is-open');
      });
    }

    function toggleMenu(menuName) {
      if (openMenuName === menuName) {
        closeMenus();
        return;
      }
      closeMenus();
      openMenuName = menuName;
      const dd = rootEl.querySelector(`.exp-menu-dropdown[data-dropdown="${menuName}"]`);
      const btn = rootEl.querySelector(`.exp-menu-btn[data-menu="${menuName}"]`);
      if (dd) dd.hidden = false;
      if (btn) btn.classList.add('is-open');
    }

    function renderTreeBranch(folderNode, segments, depth = 0) {
      const key = segments.join('\\');
      const subfolders = (folderNode.children || []).filter((c) => c.type === 'folder');
      const hasChildren = subfolders.length > 0;
      const isExpanded = expandedKeys.has(key);
      const isCurrent = key === currentSegments.join('\\');
      const iconKey = depth === 0 ? 'computer' : isCurrent || isExpanded ? 'folder-open' : 'folder';
      const label = depth === 0 ? rootName : folderNode.name;

      let html = `
        <div class="exp-tree-node" style="--depth: ${depth}">
          <div class="exp-tree-row ${isCurrent ? 'is-selected' : ''}">
            ${
              hasChildren
                ? `<button type="button" class="exp-tree-toggle" data-toggle-key="${escapeHtml(key)}" aria-label="${isExpanded ? 'Collapse' : 'Expand'}">${isExpanded ? '−' : '+'}</button>`
                : `<span class="exp-tree-spacer"></span>`
            }
            <button type="button" class="exp-tree-label" data-tree-key="${escapeHtml(key)}">
              <span class="exp-tree-ico">${getIconSVG(iconKey, 16)}</span>
              <span>${escapeHtml(label)}</span>
            </button>
          </div>
      `;

      if (hasChildren && isExpanded) {
        html += `<div class="exp-tree-children">`;
        for (const sub of subfolders) {
          html += renderTreeBranch(sub, [...segments, sub.name], depth + 1);
        }
        html += `</div>`;
      }

      html += `</div>`;
      return html;
    }

    function updateStatusForSelection() {
      const children = currentFolder.children || [];
      const pathStr = buildPathString(currentSegments, rootName);
      if (selectedIndex >= 0 && children[selectedIndex]) {
        const item = children[selectedIndex];
        const parts = [item.title || item.name, describeNodeType(item)];
        if (item.size) parts.push(item.size);
        winApi?.setStatus?.(`Selected: ${parts.join(' · ')}`);
        openSelBtn.disabled = false;
      } else {
        winApi?.setStatus?.(`${children.length} object(s) — ${pathStr}`);
        openSelBtn.disabled = true;
      }
    }

    function renderFiles() {
      const children = currentFolder.children || [];
      if (!children.length) {
        filesEl.innerHTML = `<div class="exp-empty">Folder ini kosong.</div>`;
        updateStatusForSelection();
        return;
      }

      if (viewMode === 'list') {
        filesEl.innerHTML = `
          <table class="exp-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${children
                .map((item, idx) => {
                  const iconKey = resolveNodeIcon(item, false);
                  return `
                    <tr class="exp-item-row ${idx === selectedIndex ? 'is-selected' : ''}" data-item-idx="${idx}" tabindex="0" title="${escapeHtml(item.title || item.name)}">
                      <td class="exp-cell-name">
                        <span class="exp-item-ico-sm">${getIconSVG(iconKey, 16)}</span>
                        <span>${escapeHtml(item.name)}</span>
                      </td>
                      <td>${escapeHtml(describeNodeType(item))}</td>
                      <td>${escapeHtml(item.size || (item.type === 'folder' ? '—' : '1 KB'))}</td>
                      <td>${escapeHtml(item.date || '2026')}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        `;
      } else {
        filesEl.innerHTML = `
          <div class="exp-grid">
            ${children
              .map((item, idx) => {
                const iconKey = resolveNodeIcon(item, false);
                return `
                  <button
                    type="button"
                    class="exp-grid-item ${idx === selectedIndex ? 'is-selected' : ''}"
                    data-item-idx="${idx}"
                    title="${escapeHtml(item.title || item.name)}"
                  >
                    <span class="exp-item-ico-lg">${getIconSVG(iconKey, 32)}</span>
                    <span class="exp-item-label">${escapeHtml(item.name)}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
      }
      updateStatusForSelection();
    }

    function renderAll() {
      const pathStr = buildPathString(currentSegments, rootName);
      addrTextEl.textContent = pathStr;
      winApi?.setTitle?.(`Exploring - ${pathStr}`);
      backBtn.disabled = navIndex <= 0;
      upBtn.disabled = currentSegments.length === 0;
      iconsBtn.classList.toggle('is-active', viewMode === 'icons');
      listBtn.classList.toggle('is-active', viewMode === 'list');
      treeEl.innerHTML = renderTreeBranch(rootFs, [], 0);
      renderFiles();
    }

    function expandAncestors(segments) {
      expandedKeys.add('');
      let acc = [];
      for (const seg of segments) {
        acc = [...acc, seg];
        expandedKeys.add(acc.join('\\'));
      }
    }

    function navigateToSegments(segments, pushHistory = true) {
      const pathStr = buildPathString(segments, rootName);
      const found = findFolderByPath(rootFs, pathStr);
      currentFolder = found.node;
      currentSegments = found.segments;
      selectedIndex = -1;
      expandAncestors(currentSegments);

      if (pushHistory) {
        const key = currentSegments.join('\\');
        if (navHistory[navIndex] !== key) {
          navHistory.splice(navIndex + 1);
          navHistory.push(key);
          navIndex = navHistory.length - 1;
        }
      }
      renderAll();
      winApi?.focus?.();
    }

    function navigateToPath(pathInput, pushHistory = true) {
      const found = findFolderByPath(rootFs, pathInput);
      navigateToSegments(found.segments, pushHistory);
    }

    function openNode(node) {
      if (!node) return;
      sound.playOpen();

      if (node.type === 'folder') {
        navigateToSegments([...currentSegments, node.name], true);
        return;
      }
      if (node.type === 'pdf') {
        winApi?.os?.openApp?.('pdf-viewer', {
          file: node.file,
          title: node.title || node.name,
          issuer: node.issuer,
          year: node.date,
          certId: node.certId
        });
        return;
      }
      if (node.type === 'doc' || node.type === 'txt') {
        winApi?.os?.openApp?.('notepad', {
          doc: node.docKey || (node.content ? 'custom' : 'readme'),
          title: node.name,
          content: node.content
        });
        return;
      }
      if (node.type === 'ie') {
        winApi?.os?.openApp?.('browser', { page: node.page || 'home' });
        return;
      }
      if (node.type === 'app' && node.appId) {
        winApi?.os?.openApp?.(node.appId, node.appArgs || {});
        return;
      }
      if (node.type === 'link' && node.href) {
        const safe = safeHref(node.href);
        if (safe !== '#') {
          window.open(safe, '_blank', 'noopener,noreferrer');
        }
      }
    }

    rootEl.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.exp-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        sound.playClick();
        toggleMenu(menuBtn.dataset.menu);
        return;
      }

      const jumpEl = e.target.closest('[data-jump]');
      if (jumpEl) {
        sound.playClick();
        closeMenus();
        navigateToPath(jumpEl.dataset.jump, true);
        return;
      }

      const toggleEl = e.target.closest('[data-toggle-key]');
      if (toggleEl) {
        sound.playClick();
        const key = toggleEl.dataset.toggleKey;
        if (expandedKeys.has(key)) expandedKeys.delete(key);
        else expandedKeys.add(key);
        treeEl.innerHTML = renderTreeBranch(rootFs, [], 0);
        return;
      }

      const treeLabel = e.target.closest('[data-tree-key]');
      if (treeLabel) {
        sound.playClick();
        const key = treeLabel.dataset.treeKey;
        const segs = key ? key.split('\\').filter(Boolean) : [];
        navigateToSegments(segs, true);
        return;
      }

      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        sound.playClick();
        const act = actionEl.dataset.action;
        closeMenus();
        if (act === 'back' && navIndex > 0) {
          navIndex -= 1;
          const prevKey = navHistory[navIndex];
          navigateToSegments(prevKey ? prevKey.split('\\').filter(Boolean) : [], false);
        } else if (act === 'up' && currentSegments.length > 0) {
          navigateToSegments(currentSegments.slice(0, -1), true);
        } else if (act === 'view-icons') {
          viewMode = 'icons';
          renderAll();
        } else if (act === 'view-list') {
          viewMode = 'list';
          renderAll();
        } else if (act === 'refresh') {
          renderAll();
        } else if (act === 'open-selected') {
          const item = (currentFolder.children || [])[selectedIndex];
          if (item) openNode(item);
        } else if (act === 'close') {
          winApi?.close?.();
        } else if (act === 'about') {
          winApi?.os?.showDialog?.({
            title: 'About Rizky Explorer',
            icon: 'computer',
            message:
              'Windows 95 Explorer — RizkyOS Edition\n\nTelusuri seluruh berkas portofolio, 14 sertifikat PDF, 13 studi kasus proyek, dan aplikasi di sistem berkas C:\\Rizky.',
            buttons: ['OK']
          });
        }
        return;
      }

      const itemEl = e.target.closest('[data-item-idx]');
      if (itemEl) {
        const idx = Number(itemEl.dataset.itemIdx);
        const item = (currentFolder.children || [])[idx];
        selectedIndex = idx;
        filesEl.querySelectorAll('[data-item-idx]').forEach((el) => {
          el.classList.toggle('is-selected', Number(el.dataset.itemIdx) === selectedIndex);
        });
        updateStatusForSelection();

        if (winApi?.os?.isMobile?.() && item) {
          openNode(item);
        } else {
          sound.playClick();
        }
        return;
      }

      if (filesEl.contains(e.target)) {
        selectedIndex = -1;
        filesEl.querySelectorAll('.is-selected').forEach((el) => el.classList.remove('is-selected'));
        updateStatusForSelection();
      }

      if (openMenuName) closeMenus();
    });

    filesEl.addEventListener('dblclick', (e) => {
      const itemEl = e.target.closest('[data-item-idx]');
      if (!itemEl) return;
      const idx = Number(itemEl.dataset.itemIdx);
      const item = (currentFolder.children || [])[idx];
      if (item) openNode(item);
    });

    filesEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && selectedIndex >= 0) {
        const item = (currentFolder.children || [])[selectedIndex];
        if (item) {
          e.preventDefault();
          openNode(item);
        }
      } else if (e.key === 'Backspace' && currentSegments.length > 0) {
        e.preventDefault();
        navigateToSegments(currentSegments.slice(0, -1), true);
      }
    });

    const onDocClick = (e) => {
      if (openMenuName && !rootEl.contains(e.target)) closeMenus();
    };
    const onDocKeydown = (e) => {
      if (e.key === 'Escape' && openMenuName) closeMenus();
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeydown);

    winApi?.onArgs?.((newArgs = {}) => {
      if (newArgs && newArgs.path) {
        navigateToPath(newArgs.path, true);
      }
    });

    winApi?.onClose?.(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeydown);
    });

    navigateToPath(args?.path || rootName, true);
  }
};

/* ============================================================================
 * 2. NOTEPAD / WORDPAD CV VIEWER (notepadApp)
 * ========================================================================== */

function getReadmeText() {
  const rootFs = normalizeRootFs();
  const fsReadme = findFsDocByKey(rootFs, 'readme');
  if (fsReadme && fsReadme.content) return fsReadme.content;

  const name = PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando';
  return [
    '====================================================================',
    '  RIZKYOS 95 — README.TXT',
    `  Desktop Portfolio of ${name}`,
    '====================================================================',
    '',
    `${name} — ${PROFILE?.role || 'AI Engineer & Data Specialist'}`,
    `${PROFILE?.university || 'Institut Teknologi Sepuluh Nopember (ITS)'} (${PROFILE?.gpa || 'Cum Laude'})`,
    '',
    'KONTAK:',
    `  Email    : ${PROFILE?.email || 'risky.alviando@gmail.com'}`,
    `  LinkedIn : ${PROFILE?.linkedin || ''}`,
    `  GitHub   : ${PROFILE?.github || ''}`
  ].join('\n');
}

function buildPlainCvText() {
  const rootFs = normalizeRootFs();
  const fsCv = findFsDocByKey(rootFs, 'cv');
  if (fsCv && fsCv.content) return fsCv.content;

  const name = PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando';
  const lines = [
    name.toUpperCase(),
    `${PROFILE?.role || 'AI Engineer'} | ${PROFILE?.location || 'Indonesia'}`,
    `Email: ${PROFILE?.email || ''} | Phone: ${PROFILE?.phone || ''}`,
    `LinkedIn: ${PROFILE?.linkedin || ''}`,
    `GitHub: ${PROFILE?.github || ''}`,
    '',
    'RINGKASAN PROFESIONAL',
    '--------------------------------------------------------------------',
    PROFILE?.summary || '',
    '',
    'PENDIDIKAN',
    '--------------------------------------------------------------------'
  ];

  for (const ed of PROFILE?.education || []) {
    lines.push(`${ed.institution} (${ed.period})`);
    lines.push(`  ${ed.degree} — ${ed.score}`);
    if (ed.details) lines.push(`  ${ed.details}`);
  }

  lines.push('', 'PENGALAMAN KERJA & KEPEMIMPINAN', '--------------------------------------------------------------------');
  for (const exp of EXPERIENCES || []) {
    lines.push(`${exp.role} — ${exp.org} (${exp.period})`);
    for (const h of exp.highlights || []) {
      lines.push(`  - ${h}`);
    }
    lines.push('');
  }

  lines.push('PROYEK UNGGULAN', '--------------------------------------------------------------------');
  for (const proj of PROJECTS || []) {
    lines.push(`${proj.title} (${proj.date || ''})`);
    lines.push(`  ${proj.summary || proj.subtitle || ''}`);
    if (proj.techStack?.length) lines.push(`  Stack: ${proj.techStack.join(', ')}`);
    lines.push('');
  }

  lines.push('KEAHLIAN TEKNIS', '--------------------------------------------------------------------');
  for (const grp of SKILLS || []) {
    lines.push(`${grp.category}: ${(grp.items || []).map((i) => i.name).join(', ')}`);
  }

  lines.push('', 'SERTIFIKASI', '--------------------------------------------------------------------');
  for (const cert of CERTIFICATES || []) {
    lines.push(`- ${cert.title} — ${cert.issuer} (${cert.year})`);
  }

  return lines.join('\n');
}

function renderCvPaperHtml() {
  const name = PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando';
  const email = PROFILE?.email || '';
  const phone = PROFILE?.phone || '';
  const linkedin = safeHref(PROFILE?.linkedin);
  const github = safeHref(PROFILE?.github);
  const education = Array.isArray(PROFILE?.education) ? PROFILE.education : [];
  const organizations = Array.isArray(PROFILE?.organizations) ? PROFILE.organizations : [];

  return `
    <article class="np-cv-paper win95-selectable">
      <header class="np-cv-header">
        <div>
          <h1 class="np-cv-name">${escapeHtml(name)}</h1>
          <div class="np-cv-role">${escapeHtml(PROFILE?.role || 'AI Engineer & Data Specialist')}</div>
        </div>
        <div class="np-cv-contact">
          ${PROFILE?.location ? `<div>${escapeHtml(PROFILE.location)}</div>` : ''}
          ${email ? `<div><a href="${escapeHtml(safeHref(`mailto:${email}`))}">${escapeHtml(email)}</a></div>` : ''}
          ${phone ? `<div>${escapeHtml(phone)}</div>` : ''}
          <div class="np-cv-links">
            ${linkedin !== '#' ? `<a href="${escapeHtml(linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}
            ${github !== '#' ? `<a href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
          </div>
        </div>
      </header>

      <section class="np-cv-sec">
        <h2>Ringkasan Profesional</h2>
        <p>${escapeHtml(PROFILE?.summary || '')}</p>
      </section>

      ${
        education.length
          ? `<section class="np-cv-sec">
              <h2>Pendidikan</h2>
              ${education
                .map(
                  (ed) => `
                  <div class="np-cv-entry">
                    <div class="np-cv-entry-head">
                      <strong>${escapeHtml(ed.institution)} — ${escapeHtml(ed.location || '')}</strong>
                      <span>${escapeHtml(ed.period || '')}</span>
                    </div>
                    <div class="np-cv-entry-sub">${escapeHtml(ed.degree)} · ${escapeHtml(ed.score)}</div>
                    ${ed.details ? `<p>${escapeHtml(ed.details)}</p>` : ''}
                  </div>
                `
                )
                .join('')}
            </section>`
          : ''
      }

      <section class="np-cv-sec">
        <h2>Pengalaman Kerja &amp; Proyek</h2>
        ${(EXPERIENCES || [])
          .filter((exp) => exp.type !== 'Organization')
          .map(
            (exp) => `
            <div class="np-cv-entry">
              <div class="np-cv-entry-head">
                <strong>${escapeHtml(exp.role)} — ${escapeHtml(exp.org)}</strong>
                <span>${escapeHtml(exp.period)}</span>
              </div>
              ${exp.location ? `<div class="np-cv-entry-sub">${escapeHtml(exp.location)}</div>` : ''}
              ${
                Array.isArray(exp.highlights) && exp.highlights.length
                  ? `<ul class="np-cv-list">${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
                  : exp.summary
                  ? `<p>${escapeHtml(exp.summary)}</p>`
                  : ''
              }
            </div>
          `
          )
          .join('')}
      </section>

      ${
        organizations.length
          ? `<section class="np-cv-sec">
              <h2>Pengalaman Organisasi &amp; Kepemimpinan</h2>
              ${organizations
                .map(
                  (org) => `
                  <div class="np-cv-entry">
                    <div class="np-cv-entry-head">
                      <strong>${escapeHtml(org.role)}</strong>
                      <span>${escapeHtml(org.period)}</span>
                    </div>
                    <div class="np-cv-entry-sub">${escapeHtml(org.org)}</div>
                    <p>${escapeHtml(org.summary)}</p>
                  </div>
                `
                )
                .join('')}
            </section>`
          : ''
      }

      <section class="np-cv-sec">
        <h2>Proyek Unggulan AI &amp; Data (${(PROJECTS || []).length} Proyek)</h2>
        ${(PROJECTS || [])
          .slice(0, 8)
          .map(
            (p) => `
            <div class="np-cv-entry">
              <div class="np-cv-entry-head">
                <strong>${escapeHtml(p.title)}</strong>
                <span>${escapeHtml(p.date || '')}</span>
              </div>
              <p>${escapeHtml(p.summary || p.subtitle || '')}</p>
              ${p.techStack?.length ? `<div class="np-cv-tech">Stack: ${escapeHtml(p.techStack.join(' · '))}</div>` : ''}
            </div>
          `
          )
          .join('')}
      </section>

      <section class="np-cv-sec">
        <h2>Keahlian Teknis</h2>
        <div class="np-cv-skills">
          ${(SKILLS || [])
            .map(
              (grp) => `
              <div class="np-cv-skill-row">
                <strong>${escapeHtml(grp.category)}:</strong>
                <span>${escapeHtml((grp.items || []).map((i) => i.name).join(', '))}</span>
              </div>
            `
            )
            .join('')}
        </div>
      </section>

      <section class="np-cv-sec">
        <h2>Sertifikasi (${(CERTIFICATES || []).length} Dokumen PDF)</h2>
        <ul class="np-cv-list np-cv-cert-list">
          ${(CERTIFICATES || [])
            .map(
              (c) => `
              <li>
                <button type="button" class="np-cv-cert-btn" data-cert-file="${escapeHtml(c.file)}" data-cert-title="${escapeHtml(c.title)}">
                  ${escapeHtml(c.title)}
                </button>
                <span class="np-cv-cert-meta"> — ${escapeHtml(c.issuer)} (${escapeHtml(c.year)})</span>
              </li>
            `
            )
            .join('')}
        </ul>
      </section>
    </article>
  `;
}

export const notepadApp = {
  id: 'notepad',
  title: 'README.txt — Notepad',
  icon: 'notepad',
  width: 680,
  height: 540,
  minWidth: 340,
  minHeight: 280,
  singleton: false,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    const rootFs = normalizeRootFs();
    let mode = 'readme';
    let customTitle = args?.title || 'Untitled.txt';
    let customContent = typeof args?.content === 'string' ? args.content : '';

    if (args?.doc === 'cv') {
      mode = 'cv';
    } else if (typeof args?.content === 'string' && args.content.length > 0) {
      mode = args?.doc === 'readme' ? 'readme' : 'custom';
      if (mode === 'custom' && !args?.title) customTitle = `${args?.doc || 'Document'}.txt`;
    } else if (args?.doc && args.doc !== 'readme') {
      const fsDoc = findFsDocByKey(rootFs, args.doc);
      if (fsDoc) {
        mode = 'custom';
        customTitle = fsDoc.name;
        customContent = fsDoc.content;
      }
    }

    let wordWrap = true;
    let openMenuName = null;

    containerEl.innerHTML = `
      <div class="np-app">
        <div class="win95-menubar np-menubar" role="menubar">
          <div class="np-menu-group">
            <button type="button" class="win95-menubar-item np-menu-btn" data-menu="file"><u>F</u>ile</button>
            <div class="win95-menu-dropdown np-menu-dropdown" data-dropdown="file" hidden>
              <button type="button" class="win95-menu-item np-menu-item" data-action="mode-cv">Open CV_Rizky_Alviando.doc</button>
              <button type="button" class="win95-menu-item np-menu-item" data-action="mode-readme">Open README.txt</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item np-menu-item" data-action="download">Save / Download (.txt)...</button>
              <button type="button" class="win95-menu-item np-menu-item" data-action="print">Print...</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item np-menu-item" data-action="close">Exit</button>
            </div>
          </div>
          <div class="np-menu-group">
            <button type="button" class="win95-menubar-item np-menu-btn" data-menu="edit"><u>E</u>dit</button>
            <div class="win95-menu-dropdown np-menu-dropdown" data-dropdown="edit" hidden>
              <button type="button" class="win95-menu-item np-menu-item" data-action="copy-all">Copy All Text</button>
              <button type="button" class="win95-menu-item np-menu-item" data-action="copy-contact">Copy Rizky's Contact</button>
            </div>
          </div>
          <div class="np-menu-group">
            <button type="button" class="win95-menubar-item np-menu-btn" data-menu="format">F<u>o</u>rmat</button>
            <div class="win95-menu-dropdown np-menu-dropdown" data-dropdown="format" hidden>
              <button type="button" class="win95-menu-item np-menu-item" data-action="toggle-wrap">Toggle Word Wrap</button>
            </div>
          </div>
          <div class="np-menu-group">
            <button type="button" class="win95-menubar-item np-menu-btn" data-menu="help"><u>H</u>elp</button>
            <div class="win95-menu-dropdown np-menu-dropdown" data-dropdown="help" hidden>
              <button type="button" class="win95-menu-item np-menu-item" data-action="about">About Notepad / WordPad...</button>
            </div>
          </div>
        </div>

        <div class="win95-toolbar np-toolbar"></div>
        <div class="np-body win95-sunken win95-scrollbar"></div>
      </div>
    `;

    const rootEl = containerEl.querySelector('.np-app');
    const toolbarEl = containerEl.querySelector('.np-toolbar');
    const bodyEl = containerEl.querySelector('.np-body');

    function closeMenus() {
      openMenuName = null;
      rootEl.querySelectorAll('.np-menu-dropdown').forEach((d) => {
        d.hidden = true;
      });
      rootEl.querySelectorAll('.np-menu-btn').forEach((b) => {
        b.classList.remove('is-open');
      });
    }

    function toggleMenu(menuName) {
      if (openMenuName === menuName) {
        closeMenus();
        return;
      }
      closeMenus();
      openMenuName = menuName;
      const dd = rootEl.querySelector(`.np-menu-dropdown[data-dropdown="${menuName}"]`);
      const btn = rootEl.querySelector(`.np-menu-btn[data-menu="${menuName}"]`);
      if (dd) dd.hidden = false;
      if (btn) btn.classList.add('is-open');
    }

    function getCurrentPlainText() {
      if (mode === 'cv') return buildPlainCvText();
      const ta = bodyEl.querySelector('.np-textarea');
      if (ta) return ta.value;
      return mode === 'custom' ? customContent : getReadmeText();
    }

    function updateTextStats(text) {
      const lines = text.split('\n').length;
      const chars = text.length;
      winApi?.setStatus?.(`Lines: ${lines} | Chars: ${chars} | Wrap: ${wordWrap ? 'ON' : 'OFF'}`);
    }

    function renderMode() {
      if (mode === 'cv') {
        winApi?.setTitle?.('CV_Rizky_Alviando.doc — WordPad');
        toolbarEl.innerHTML = `
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="print">
            <span>Print / Save PDF</span>
          </button>
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="copy-contact">
            <span>Copy Contact</span>
          </button>
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="download">
            <span>Export .txt</span>
          </button>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="mode-readme">
            <span class="np-tb-ico">${getIconSVG('notepad', 14)}</span>
            <span>README.txt</span>
          </button>
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="open-certs">
            <span class="np-tb-ico">${getIconSVG('pdf', 14)}</span>
            <span>Certificates</span>
          </button>
        `;
        bodyEl.classList.add('is-cv');
        bodyEl.innerHTML = renderCvPaperHtml();
        winApi?.setStatus?.('WordPad Resume View — Klik Print untuk simpan sebagai PDF');
      } else {
        const text = mode === 'custom' ? customContent : getReadmeText();
        const title = mode === 'custom' ? `${customTitle} — Notepad` : 'README.txt — Notepad';
        winApi?.setTitle?.(title);
        toolbarEl.innerHTML = `
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="copy-all">Copy All</button>
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="download">Save .txt</button>
          <button type="button" class="win95-toolbar-btn np-tb-btn ${wordWrap ? 'is-active' : ''}" data-action="toggle-wrap">Wrap: ${wordWrap ? 'ON' : 'OFF'}</button>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="mode-cv">
            <span class="np-tb-ico">${getIconSVG('wordpad', 14)}</span>
            <span>Open CV</span>
          </button>
        `;
        bodyEl.classList.remove('is-cv');
        bodyEl.innerHTML = `<textarea class="np-textarea win95-scrollbar win95-selectable ${wordWrap ? '' : 'no-wrap'}" spellcheck="false" aria-label="${escapeHtml(title)}"></textarea>`;
        const ta = bodyEl.querySelector('.np-textarea');
        ta.value = text;
        ta.addEventListener('input', () => {
          if (mode === 'custom') customContent = ta.value;
          updateTextStats(ta.value);
        });
        updateTextStats(text);
      }
    }

    async function handleAction(act) {
      if (act === 'mode-cv') {
        mode = 'cv';
        renderMode();
      } else if (act === 'mode-readme') {
        mode = 'readme';
        renderMode();
      } else if (act === 'print') {
        window.print();
      } else if (act === 'download') {
        const fname =
          mode === 'cv'
            ? 'CV_Rizky_Alviando.txt'
            : mode === 'custom'
            ? customTitle.includes('.')
              ? customTitle
              : `${customTitle}.txt`
            : 'README_RizkyOS95.txt';
        downloadTextFile(fname, getCurrentPlainText());
        winApi?.setStatus?.(`Berhasil mengunduh ${fname}`);
      } else if (act === 'copy-all') {
        const ok = await copyTextToClipboard(getCurrentPlainText());
        winApi?.setStatus?.(ok ? 'Seluruh teks disalin ke clipboard.' : 'Gagal menyalin teks.');
      } else if (act === 'copy-contact') {
        const contactStr = [
          PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando',
          `Email: ${PROFILE?.email || 'risky.alviando@gmail.com'}`,
          PROFILE?.phone ? `Phone: ${PROFILE.phone}` : '',
          PROFILE?.linkedin ? `LinkedIn: ${PROFILE.linkedin}` : '',
          PROFILE?.github ? `GitHub: ${PROFILE.github}` : ''
        ]
          .filter(Boolean)
          .join('\n');
        const ok = await copyTextToClipboard(contactStr);
        winApi?.setStatus?.(
          ok ? 'Kontak Rizky Alviando disalin ke clipboard.' : 'Gagal menyalin kontak.'
        );
      } else if (act === 'toggle-wrap') {
        wordWrap = !wordWrap;
        if (mode !== 'cv') renderMode();
      } else if (act === 'open-certs') {
        winApi?.os?.openApp?.('explorer', { path: 'C:\\Rizky\\Certificates' });
      } else if (act === 'close') {
        winApi?.close?.();
      } else if (act === 'about') {
        winApi?.os?.showDialog?.({
          title: 'About Notepad & WordPad 95',
          icon: 'notepad',
          message:
            'Notepad / WordPad — RizkyOS 95\n\nMenampilkan README.txt monospace klasik, inspeksi file teks, dan WordPad Printable CV untuk Rizky Alviando.',
          buttons: ['OK']
        });
      }
    }

    rootEl.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.np-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        sound.playClick();
        toggleMenu(menuBtn.dataset.menu);
        return;
      }

      const certBtn = e.target.closest('.np-cv-cert-btn');
      if (certBtn) {
        sound.playOpen();
        winApi?.os?.openApp?.('pdf-viewer', {
          file: certBtn.dataset.certFile,
          title: certBtn.dataset.certTitle
        });
        return;
      }

      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        sound.playClick();
        const act = actionEl.dataset.action;
        closeMenus();
        handleAction(act);
        return;
      }

      if (openMenuName) closeMenus();
    });

    const onDocClick = (e) => {
      if (openMenuName && !rootEl.contains(e.target)) closeMenus();
    };
    const onDocKeydown = (e) => {
      if (e.key === 'Escape' && openMenuName) closeMenus();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeydown);

    winApi?.onClose?.(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeydown);
    });

    renderMode();
  }
};

/* ============================================================================
 * 3. PDF VIEWER (pdfViewerApp)
 * ========================================================================== */

export const pdfViewerApp = {
  id: 'pdf-viewer',
  title: 'Acrobat Reader 95 — PDF Viewer',
  icon: 'pdf',
  width: 780,
  height: 580,
  minWidth: 380,
  minHeight: 340,
  singleton: false,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    const certs = Array.isArray(CERTIFICATES) ? CERTIFICATES : [];
    let currentCert = null;

    if (args?.certId) {
      currentCert = certs.find((c) => c.id === args.certId) || null;
    }
    if (!currentCert && args?.file) {
      currentCert =
        certs.find((c) => c.file === args.file) || {
          id: 'custom',
          title: args.title || args.file.split('/').pop() || 'Document.pdf',
          issuer: args.issuer || 'RizkyOS Document',
          year: args.year || '',
          credentialId: '',
          file: args.file
        };
    }
    if (!currentCert && certs.length) {
      currentCert = certs[0];
    }

    containerEl.innerHTML = `
      <div class="pdf-app">
        <div class="win95-toolbar pdf-toolbar">
          <label class="pdf-select-wrap">
            <span class="pdf-select-ico">${getIconSVG('pdf', 15)}</span>
            <span class="pdf-select-label">Dokumen:</span>
            <select class="win95-field pdf-cert-select" aria-label="Pilih Sertifikat PDF">
              ${certs
                .map(
                  (c, idx) =>
                    `<option value="${idx}">${escapeHtml(c.title)} (${escapeHtml(c.year || '')})</option>`
                )
                .join('')}
            </select>
          </label>
          <div class="pdf-toolbar-actions">
            <a class="win95-btn win95-btn-sm pdf-action-link pdf-verify-btn" href="#" target="_blank" rel="noopener noreferrer" hidden>Verify ↗</a>
            <a class="win95-btn win95-btn-sm pdf-action-link pdf-download-btn" href="#" download>Download PDF</a>
            <a class="win95-btn win95-btn-sm pdf-action-link pdf-newtab-btn" href="#" target="_blank" rel="noopener noreferrer">Open in New Tab ↗</a>
          </div>
        </div>

        <div class="pdf-frame-wrap win95-sunken">
          <iframe class="pdf-iframe" title="PDF Certificate Preview"></iframe>
        </div>

        <div class="pdf-mobile-note">
          <span>Catatan: Jika pratinjau PDF tidak tampil inline di browser mobile, gunakan tombol <strong>Open in New Tab</strong> atau <strong>Download PDF</strong> di atas.</span>
        </div>
      </div>
    `;

    const selectEl = containerEl.querySelector('.pdf-cert-select');
    const verifyBtn = containerEl.querySelector('.pdf-verify-btn');
    const downloadBtn = containerEl.querySelector('.pdf-download-btn');
    const newTabBtn = containerEl.querySelector('.pdf-newtab-btn');
    const iframeEl = containerEl.querySelector('.pdf-iframe');

    function loadCert(certObj) {
      if (!certObj || !certObj.file) {
        iframeEl.src = 'about:blank';
        verifyBtn.hidden = true;
        winApi?.setTitle?.('Acrobat Reader 95 — No File');
        winApi?.setStatus?.('Tidak ada dokumen PDF dipilih.');
        return;
      }

      const encodedUrl = safeAssetUrl(certObj.file);
      if (!encodedUrl) return;

      iframeEl.src = encodedUrl;
      iframeEl.title = certObj.title || 'PDF Document';
      downloadBtn.href = encodedUrl;
      downloadBtn.setAttribute('download', certObj.file.split('/').pop() || 'certificate.pdf');
      newTabBtn.href = encodedUrl;

      const safeVerify = safeHref(certObj.verifyUrl);
      if (safeVerify !== '#') {
        verifyBtn.href = safeVerify;
        verifyBtn.hidden = false;
      } else {
        verifyBtn.href = '#';
        verifyBtn.hidden = true;
      }

      const idx = certs.findIndex((c) => c.file === certObj.file);
      if (idx >= 0) selectEl.value = String(idx);

      winApi?.setTitle?.(`${certObj.title || 'PDF Document'} — Acrobat Reader 95`);
      const meta = [certObj.issuer, certObj.date || certObj.year, certObj.credentialId]
        .filter(Boolean)
        .join(' · ');
      winApi?.setStatus?.(meta || certObj.file);
    }

    selectEl.addEventListener('change', () => {
      sound.playClick();
      const idx = Number(selectEl.value);
      if (certs[idx]) loadCert(certs[idx]);
    });

    winApi?.onClose?.(() => {
      iframeEl.src = 'about:blank';
    });

    loadCert(currentCert);
  }
};

/* ============================================================================
 * 4. RECYCLE BIN (recycleBinApp)
 * ========================================================================== */

export const recycleBinApp = {
  id: 'recycle-bin',
  title: 'Recycle Bin',
  icon: 'recycle-full',
  width: 630,
  height: 430,
  minWidth: 360,
  minHeight: 280,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    const seedItems = Array.isArray(RECYCLE_ITEMS) ? RECYCLE_ITEMS : [];
    let items = seedItems.map((item) => ({ ...item }));
    let selectedIndex = -1;

    containerEl.innerHTML = `
      <div class="rb-app">
        <div class="win95-toolbar rb-toolbar">
          <button type="button" class="win95-toolbar-btn rb-btn" data-action="inspect" disabled>
            <span class="rb-tb-ico">${getIconSVG('notepad', 14)}</span>
            <span>Inspect</span>
          </button>
          <button type="button" class="win95-toolbar-btn rb-btn" data-action="restore" disabled>
            <span>Restore</span>
          </button>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <button type="button" class="win95-toolbar-btn rb-btn" data-action="empty">
            <span class="rb-tb-ico">${getIconSVG('recycle-empty', 14)}</span>
            <span>Empty Recycle Bin</span>
          </button>
          <button type="button" class="win95-toolbar-btn rb-btn" data-action="refill" hidden>
            <span>Restore All Items</span>
          </button>
        </div>

        <div class="rb-list-wrap win95-sunken win95-scrollbar"></div>
      </div>
    `;

    const rootEl = containerEl.querySelector('.rb-app');
    const listWrapEl = containerEl.querySelector('.rb-list-wrap');
    const inspectBtn = containerEl.querySelector('[data-action="inspect"]');
    const restoreBtn = containerEl.querySelector('[data-action="restore"]');
    const emptyBtn = containerEl.querySelector('[data-action="empty"]');
    const refillBtn = containerEl.querySelector('[data-action="refill"]');

    function updateButtons() {
      const hasSelection = selectedIndex >= 0 && selectedIndex < items.length;
      inspectBtn.disabled = !hasSelection;
      restoreBtn.disabled = !hasSelection;
      emptyBtn.disabled = items.length === 0;
      refillBtn.hidden = items.length > 0;
      winApi?.setStatus?.(
        items.length
          ? `${items.length} deleted item(s) — Double-click untuk melihat isi file`
          : 'Recycle Bin kosong (0 items)'
      );
    }

    function renderTable() {
      if (!items.length) {
        listWrapEl.innerHTML = `
          <div class="rb-empty">
            <div class="rb-empty-icon">${getIconSVG('recycle-empty', 48)}</div>
            <p><strong>Recycle Bin is empty.</strong></p>
            <p class="rb-empty-sub">Semua log bug produksi dan revisi skripsi final_v99 telah dibersihkan.</p>
          </div>
        `;
        updateButtons();
        return;
      }

      listWrapEl.innerHTML = `
        <table class="rb-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Original Location</th>
              <th>Date Deleted</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, idx) => `
                <tr class="rb-row ${idx === selectedIndex ? 'is-selected' : ''}" data-rb-idx="${idx}" tabindex="0">
                  <td class="rb-cell-name">
                    <span class="rb-file-ico">${getIconSVG('file', 16)}</span>
                    <span>${escapeHtml(item.name)}</span>
                  </td>
                  <td>${escapeHtml(item.originalPath || 'C:\\Rizky\\Temp')}</td>
                  <td>${escapeHtml(item.deletedDate || '2026')}</td>
                  <td>${escapeHtml(item.size || '4 KB')}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      `;
      updateButtons();
    }

    function inspectSelected() {
      const item = items[selectedIndex];
      if (!item) return;
      sound.playOpen();
      const header = [
        '[RECYCLE BIN INSPECTION]',
        `File          : ${item.name}`,
        `Original Path : ${item.originalPath || 'Unknown'}`,
        `Deleted Date  : ${item.deletedDate || 'Unknown'}`,
        `Size          : ${item.size || 'Unknown'}`,
        '----------------------------------------------------------------',
        ''
      ].join('\n');
      winApi?.os?.openApp?.('notepad', {
        title: item.name,
        content: header + (item.content || '(File kosong)')
      });
    }

    async function restoreSelected() {
      const item = items[selectedIndex];
      if (!item) return;
      sound.playClick();
      const choice = await winApi?.os?.showDialog?.({
        title: 'Restore Deleted File',
        icon: 'warning',
        message: `Yakin ingin me-restore "${item.name}" ke ${item.originalPath || 'C:\\Rizky'}?\n\nPeringatan: File ini dulunya dibuang karena alasan yang sangat jelas.`,
        buttons: ['Restore', 'Cancel']
      });
      if (choice === 'Restore') {
        items.splice(selectedIndex, 1);
        selectedIndex = -1;
        sound.playMessage();
        renderTable();
        winApi?.os?.showDialog?.({
          title: 'RizkyOS 95',
          icon: 'info',
          message: `"${item.name}" berhasil di-restore secara aman (production server tetap terlindungi).`,
          buttons: ['OK']
        });
      }
    }

    async function emptyRecycleBin() {
      if (!items.length) return;
      sound.playClick();
      const choice = await winApi?.os?.showDialog?.({
        title: 'Confirm File Delete',
        icon: 'warning',
        message: `Apakah Anda yakin ingin menghapus permanen ${items.length} file di Recycle Bin?`,
        buttons: ['Yes', 'No']
      });
      if (choice === 'Yes') {
        items = [];
        selectedIndex = -1;
        sound.playClose();
        renderTable();
      }
    }

    rootEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const act = btn.dataset.action;
        if (act === 'inspect') inspectSelected();
        else if (act === 'restore') restoreSelected();
        else if (act === 'empty') emptyRecycleBin();
        else if (act === 'refill') {
          sound.playClick();
          items = seedItems.map((item) => ({ ...item }));
          selectedIndex = -1;
          renderTable();
        }
        return;
      }

      const row = e.target.closest('[data-rb-idx]');
      if (row) {
        selectedIndex = Number(row.dataset.rbIdx);
        listWrapEl.querySelectorAll('.rb-row').forEach((r) => {
          r.classList.toggle('is-selected', Number(r.dataset.rbIdx) === selectedIndex);
        });
        updateButtons();
        if (winApi?.os?.isMobile?.()) {
          inspectSelected();
        } else {
          sound.playClick();
        }
      }
    });

    listWrapEl.addEventListener('dblclick', (e) => {
      const row = e.target.closest('[data-rb-idx]');
      if (!row) return;
      selectedIndex = Number(row.dataset.rbIdx);
      inspectSelected();
    });

    listWrapEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        inspectSelected();
      }
    });

    renderTable();
  }
};
