import {
  PROFILE,
  PROJECTS,
  CERTIFICATES,
  VIRTUAL_FS,
  RECYCLE_ITEMS
} from '../data.js';
import { getIconSVG, ICON_KEYS } from '../icons.js';
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
  ...ICON_KEYS,
  'computer', 'ie', 'messenger', 'dos', 'notepad', 'wordpad', 'folder',
  'folder-open', 'pdf', 'game', 'minesweeper', 'chess', 'rubik', 'guestbook',
  'room3d', 'display', 'recycle-empty', 'recycle-full', 'start', 'sound-on',
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
      return 'notepad';
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
      return 'PDF Document';
    case 'ie':
      return 'Internet Shortcut';
    case 'doc':
    case 'txt':
      return 'Text Document';
    case 'app':
      return 'Application';
    case 'link':
      return 'Web Shortcut';
    default:
      return 'File';
  }
}

function parseSizeToBytes(sizeStr) {
  const raw = String(sizeStr ?? '').trim().toUpperCase();
  const match = raw.match(/([\d.]+)\s*(B|KB|MB|GB)?/);
  if (!match) return 0;
  const val = Number(match[1]) || 0;
  const unit = match[2] || 'B';
  if (unit === 'GB') return val * 1024 * 1024 * 1024;
  if (unit === 'MB') return val * 1024 * 1024;
  if (unit === 'KB') return val * 1024;
  return val;
}

function parseDateComparable(dateStr) {
  const raw = String(dateStr ?? '').trim();
  if (!raw) return '';
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const yearMatch = raw.match(/(20\d{2}|19\d{2})/);
  if (yearMatch) return `${yearMatch[1]}-00-00`;
  return raw;
}

function enrichNodeMeta(node) {
  if (!node) return null;
  let cert = null;
  if (node.type === 'pdf') {
    cert = (CERTIFICATES || []).find(
      (c) => (node.certId && c.id === node.certId) || (node.file && c.file === node.file)
    );
  }
  let proj = null;
  if (node.type === 'ie' && typeof node.page === 'string' && node.page.startsWith('project:')) {
    const slug = node.page.slice('project:'.length);
    proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
  }

  const title = node.title || cert?.title || proj?.title || node.name;
  const issuerOrCategory =
    node.issuer ||
    cert?.issuer ||
    node.category ||
    proj?.category ||
    cert?.category ||
    (node.type === 'folder' ? `${(node.children || []).length} item` : describeNodeType(node));
  const date = node.date || cert?.date || cert?.year || proj?.date || '';
  const credentialId = node.credentialId || cert?.credentialId || '';
  const verifyUrl = node.verifyUrl || cert?.verifyUrl || '';
  const size = node.size || cert?.size || (node.type === 'folder' ? '-' : '1 KB');
  const summary =
    node.summary ||
    node.description ||
    proj?.summary ||
    proj?.subtitle ||
    (cert
      ? `Diterbitkan oleh ${cert.issuer} (${cert.date || cert.year}). Kategori: ${cert.category || 'Sertifikasi'}.`
      : node.type === 'folder'
      ? getFolderDescription(node.name)
      : '');
  const techStack = Array.isArray(node.techStack)
    ? node.techStack
    : Array.isArray(proj?.techStack)
    ? proj.techStack
    : [];
  const metrics = Array.isArray(node.metrics)
    ? node.metrics
    : Array.isArray(proj?.metrics)
    ? proj.metrics
    : [];

  return {
    ...node,
    certId: node.certId || cert?.id,
    title,
    issuerOrCategory,
    date,
    credentialId,
    verifyUrl,
    size,
    summary,
    techStack,
    metrics
  };
}

function getFolderDescription(folderName) {
  const key = String(folderName ?? '').toLowerCase();
  if (key.includes('cert')) {
    return 'CV resmi, slide deck portofolio AI & ML, serta seluruh sertifikat kompetensi terverifikasi Rizky Alviando.';
  }
  if (key.includes('proj')) {
    return 'Arsip 13 studi kasus rekayasa AI, Graph-RAG, fine-tuning LLM, pipeline data, dan riset terapan.';
  }
  if (key.includes('about')) {
    return 'Biografi, kontak resmi, dokumen latar belakang pendidikan, dan tautan profil Rizky Alviando.';
  }
  if (key.includes('exp')) {
    return 'Rekam jejak karier di DJED Komdigi, Bangkit Academy, BPS Jatim, dan Departemen Matematika ITS.';
  }
  if (key.includes('skill')) {
    return 'Daftar keahlian teknis AI Engineering, Data Engineering, Matematika Terapan, dan Analitik.';
  }
  if (key.includes('game')) {
    return 'Koleksi aplikasi dan gim klasik yang terpasang di sistem operasi RizkyOS 95.';
  }
  return 'Direktori utama portofolio Rizky Alviando (AI Engineer & S1 Matematika ITS Cum Laude).';
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
 * 1. WINDOWS 95 / 98 EXPLORER (explorerApp)
 * ========================================================================== */

export const explorerApp = {
  id: 'explorer',
  title: 'Exploring - C:\\Rizky',
  icon: 'computer',
  width: 820,
  height: 540,
  minWidth: 460,
  minHeight: 340,
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
    let displayedItems = [];
    let selectedIndex = -1;
    let viewMode = 'icons'; // 'icons' | 'list'
    let userForcedViewMode = false;
    let showPreview = !winApi?.os?.isMobile?.();
    let sortCol = null; // 'name' | 'info' | 'type' | 'size' | 'date'
    let sortDir = 'asc';
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
              <button type="button" class="win95-menu-item exp-menu-item" data-action="toggle-preview">Preview Pane</button>
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
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="view-icons" title="Large Icons">Icons</button>
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="view-list" title="Details List">Details</button>
          <button type="button" class="win95-toolbar-btn exp-tb-btn" data-action="toggle-preview" title="Toggle Folder Preview Pane">Preview</button>
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
          <div class="exp-main-area win95-sunken">
            <aside class="exp-preview-pane win95-scrollbar" aria-label="Folder and File Inspector"></aside>
            <section class="exp-files win95-scrollbar" aria-label="Folder Contents"></section>
          </div>
        </div>
      </div>
    `;

    const rootEl = containerEl.querySelector('.exp-app');
    const treeEl = containerEl.querySelector('.exp-tree');
    const previewEl = containerEl.querySelector('.exp-preview-pane');
    const filesEl = containerEl.querySelector('.exp-files');
    const addrTextEl = containerEl.querySelector('.exp-addr-text');
    const backBtn = containerEl.querySelector('[data-action="back"]');
    const upBtn = containerEl.querySelector('[data-action="up"]');
    const openSelBtn = containerEl.querySelector('.exp-tb-btn[data-action="open-selected"]');
    const iconsBtn = containerEl.querySelector('.exp-tb-btn[data-action="view-icons"]');
    const listBtn = containerEl.querySelector('.exp-tb-btn[data-action="view-list"]');
    const previewBtn = containerEl.querySelector('.exp-tb-btn[data-action="toggle-preview"]');

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

    function computeSortedItems() {
      const rawChildren = (currentFolder.children || []).map(enrichNodeMeta);
      if (!sortCol) return rawChildren;

      const factor = sortDir === 'asc' ? 1 : -1;
      return [...rawChildren].sort((a, b) => {
        // Keep folders grouped ahead of files when sorting
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;

        if (sortCol === 'size') {
          return (parseSizeToBytes(a.size) - parseSizeToBytes(b.size)) * factor;
        }
        if (sortCol === 'date') {
          return parseDateComparable(a.date).localeCompare(parseDateComparable(b.date)) * factor;
        }
        if (sortCol === 'info') {
          return String(a.issuerOrCategory || '').localeCompare(String(b.issuerOrCategory || '')) * factor;
        }
        if (sortCol === 'type') {
          return describeNodeType(a).localeCompare(describeNodeType(b)) * factor;
        }
        return String(a.name || '').localeCompare(String(b.name || '')) * factor;
      });
    }

    function renderTreeBranch(folderNode, segments, depth = 0, isLast = true) {
      const key = segments.join('\\');
      const subfolders = (folderNode.children || []).filter((c) => c.type === 'folder');
      const hasChildren = subfolders.length > 0;
      const isExpanded = expandedKeys.has(key);
      const isCurrent = key === currentSegments.join('\\');
      const iconKey = depth === 0 ? 'computer' : isCurrent || isExpanded ? 'folder-open' : 'folder';
      const label = depth === 0 ? rootName : folderNode.name;

      let html = `
        <div class="exp-tree-node ${isLast ? 'is-last' : ''}" data-depth="${depth}" style="--depth: ${depth}">
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
        subfolders.forEach((sub, idx) => {
          html += renderTreeBranch(
            sub,
            [...segments, sub.name],
            depth + 1,
            idx === subfolders.length - 1
          );
        });
        html += `</div>`;
      }

      html += `</div>`;
      return html;
    }

    function renderPreviewPane() {
      previewEl.hidden = !showPreview;
      if (!showPreview) return;

      const folderLabel = currentSegments.length
        ? currentSegments[currentSegments.length - 1]
        : rootName;
      const folderIcon = currentSegments.length ? 'folder-open' : 'computer';
      const totalCount = displayedItems.length;
      const selected = selectedIndex >= 0 ? displayedItems[selectedIndex] : null;

      let detailsHtml = '';
      if (!selected) {
        detailsHtml = `
          <div class="exp-preview-empty">
            <p class="exp-preview-desc">${escapeHtml(currentFolder?.description || getFolderDescription(folderLabel))}</p>
            <div class="exp-preview-count">${totalCount} object(s) in this folder</div>
            <p class="exp-preview-tip">Klik satu kali pada file untuk memeriksa rincian dokumen, penerbit, atau ringkasan proyek. Klik dua kali untuk membuka.</p>
          </div>
        `;
      } else {
        const iconKey = resolveNodeIcon(selected, false);
        const safePdfHref = selected.type === 'pdf' ? safeAssetUrl(selected.file) : '';
        const safeVerify = safeHref(selected.verifyUrl);
        const safeLink = selected.type === 'link' ? safeHref(selected.href) : '#';

        detailsHtml = `
          <div class="exp-preview-card">
            <div class="exp-preview-file-head">
              <span class="exp-preview-file-ico">${getIconSVG(iconKey, 32)}</span>
              <div class="exp-preview-file-titles">
                <div class="exp-preview-title">${escapeHtml(selected.title)}</div>
                <div class="exp-preview-filename">${escapeHtml(selected.name)}</div>
              </div>
            </div>

            <dl class="exp-preview-meta">
              <div class="exp-preview-meta-row">
                <dt>Type</dt>
                <dd>${escapeHtml(describeNodeType(selected))}</dd>
              </div>
              ${
                selected.issuerOrCategory
                  ? `<div class="exp-preview-meta-row">
                      <dt>${selected.type === 'pdf' ? 'Issuer' : 'Category'}</dt>
                      <dd>${escapeHtml(selected.issuerOrCategory)}</dd>
                    </div>`
                  : ''
              }
              ${
                selected.date
                  ? `<div class="exp-preview-meta-row">
                      <dt>Date</dt>
                      <dd>${escapeHtml(selected.date)}</dd>
                    </div>`
                  : ''
              }
              ${
                selected.credentialId
                  ? `<div class="exp-preview-meta-row">
                      <dt>Credential</dt>
                      <dd><code>${escapeHtml(selected.credentialId)}</code></dd>
                    </div>`
                  : ''
              }
              ${
                selected.size && selected.size !== '-'
                  ? `<div class="exp-preview-meta-row">
                      <dt>Size</dt>
                      <dd>${escapeHtml(selected.size)}</dd>
                    </div>`
                  : ''
              }
            </dl>

            ${selected.summary ? `<p class="exp-preview-summary">${escapeHtml(selected.summary)}</p>` : ''}

            ${
              selected.metrics && selected.metrics.length
                ? `<div class="exp-preview-metrics">
                    ${selected.metrics
                      .slice(0, 3)
                      .map((m) => `<div><strong>${escapeHtml(m.value)}</strong> - ${escapeHtml(m.label)}</div>`)
                      .join('')}
                  </div>`
                : ''
            }

            ${
              selected.techStack && selected.techStack.length
                ? `<div class="exp-preview-stack"><strong>Stack:</strong> ${escapeHtml(selected.techStack.join(' · '))}</div>`
                : ''
            }

            <div class="exp-preview-actions">
              <button type="button" class="win95-btn primary exp-preview-btn" data-action="open-selected">Open</button>
              ${
                safePdfHref
                  ? `<a class="win95-btn exp-preview-btn" href="${escapeHtml(safePdfHref)}" download>Download PDF</a>`
                  : ''
              }
              ${
                safeVerify !== '#'
                  ? `<a class="win95-btn exp-ext-icon-btn" href="${escapeHtml(safeVerify)}" target="_blank" rel="noopener noreferrer" title="Verifikasi kredensial di tab baru" aria-label="Verifikasi kredensial di tab baru">${getIconSVG('external-link', 14)}</a>`
                  : ''
              }
              ${
                safeLink !== '#'
                  ? `<a class="win95-btn exp-ext-icon-btn" href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer" title="Buka tautan di tab baru" aria-label="Buka tautan di tab baru">${getIconSVG('external-link', 14)}</a>`
                  : ''
              }
            </div>
          </div>
        `;
      }

      previewEl.innerHTML = `
        <div class="exp-preview-head">
          <span class="exp-preview-folder-ico">${getIconSVG(folderIcon, 28)}</span>
          <div class="exp-preview-folder-name">${escapeHtml(folderLabel)}</div>
        </div>
        <div class="exp-preview-rule" aria-hidden="true"></div>
        ${detailsHtml}
      `;
    }

    function updateStatusForSelection() {
      const pathStr = buildPathString(currentSegments, rootName);
      if (selectedIndex >= 0 && displayedItems[selectedIndex]) {
        const item = displayedItems[selectedIndex];
        const parts = [item.title || item.name, item.issuerOrCategory || describeNodeType(item)];
        if (item.size && item.size !== '-') parts.push(item.size);
        winApi?.setStatus?.(`Selected: ${parts.join(' · ')}`);
        openSelBtn.disabled = false;
      } else {
        winApi?.setStatus?.(`${displayedItems.length} object(s) - ${pathStr}`);
        openSelBtn.disabled = true;
      }
      renderPreviewPane();
    }

    function renderSortHeader(colKey, label) {
      const isSorted = sortCol === colKey;
      const arrow = isSorted ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      return `<th><button type="button" class="exp-sort-btn ${isSorted ? 'is-sorted' : ''}" data-sort-col="${colKey}">${escapeHtml(label)}${arrow}</button></th>`;
    }

    function renderFiles() {
      displayedItems = computeSortedItems();
      if (!displayedItems.length) {
        filesEl.innerHTML = `<div class="exp-empty">Folder ini kosong.</div>`;
        updateStatusForSelection();
        return;
      }

      if (viewMode === 'list') {
        filesEl.innerHTML = `
          <table class="exp-list-table">
            <thead>
              <tr>
                ${renderSortHeader('name', 'Name')}
                ${renderSortHeader('info', 'Info / Issuer')}
                ${renderSortHeader('type', 'Type')}
                ${renderSortHeader('size', 'Size')}
                ${renderSortHeader('date', 'Date')}
              </tr>
            </thead>
            <tbody>
              ${displayedItems
                .map((item, idx) => {
                  const iconKey = resolveNodeIcon(item, false);
                  return `
                    <tr class="exp-item-row ${idx === selectedIndex ? 'is-selected' : ''}" data-item-idx="${idx}" tabindex="0" title="${escapeHtml(item.title || item.name)}">
                      <td class="exp-cell-name">
                        <span class="exp-item-ico-sm">${getIconSVG(iconKey, 16)}</span>
                        <span>${escapeHtml(item.name)}</span>
                      </td>
                      <td class="exp-cell-info">${escapeHtml(item.issuerOrCategory || '-')}</td>
                      <td>${escapeHtml(describeNodeType(item))}</td>
                      <td class="exp-cell-size">${escapeHtml(item.size)}</td>
                      <td class="exp-cell-date">${escapeHtml(item.date || '-')}</td>
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
            ${displayedItems
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
      previewBtn.classList.toggle('is-active', showPreview);
      treeEl.innerHTML = renderTreeBranch(rootFs, [], 0, true);
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
      sortCol = null;
      sortDir = 'asc';
      expandAncestors(currentSegments);

      // Default Certificates & Projects to Details List view for clean readability
      const leaf = (currentSegments[currentSegments.length - 1] || '').toLowerCase();
      if (!userForcedViewMode) {
        viewMode = leaf === 'certificates' || leaf === 'projects' ? 'list' : 'icons';
      }

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
          issuer: node.issuer || node.issuerOrCategory,
          year: node.date,
          certId: node.certId
        });
        return;
      }
      if (node.type === 'doc' || node.type === 'txt') {
        if (node.docKey === 'cv') {
          winApi?.os?.openApp?.('pdf-viewer', {
            certId: 'cv-rizky-alviando',
            file: PROFILE?.cvPdf || 'assets/certs/Rizky_Alviando_CV_ID.pdf',
            title: 'Curriculum Vitae (CV) - Rizky Alviando'
          });
          return;
        }
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

      const sortBtn = e.target.closest('[data-sort-col]');
      if (sortBtn) {
        sound.playClick();
        const col = sortBtn.dataset.sortCol;
        if (sortCol === col) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortCol = col;
          sortDir = 'asc';
        }
        selectedIndex = -1;
        renderFiles();
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
        treeEl.innerHTML = renderTreeBranch(rootFs, [], 0, true);
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
          userForcedViewMode = true;
          viewMode = 'icons';
          renderAll();
        } else if (act === 'view-list') {
          userForcedViewMode = true;
          viewMode = 'list';
          renderAll();
        } else if (act === 'toggle-preview') {
          showPreview = !showPreview;
          renderAll();
        } else if (act === 'refresh') {
          renderAll();
        } else if (act === 'open-selected') {
          const item = displayedItems[selectedIndex];
          if (item) openNode(item);
        } else if (act === 'close') {
          winApi?.close?.();
        } else if (act === 'about') {
          winApi?.os?.showDialog?.({
            title: 'About Rizky Explorer',
            icon: 'computer',
            message:
              'Windows Explorer - RizkyOS 95 Edition\n\nTelusuri seluruh berkas portofolio, sertifikat PDF terverifikasi, studi kasus AI, dan aplikasi di C:\\Rizky.',
            buttons: ['OK']
          });
        }
        return;
      }

      const itemEl = e.target.closest('[data-item-idx]');
      if (itemEl) {
        const idx = Number(itemEl.dataset.itemIdx);
        const item = displayedItems[idx];
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
      const item = displayedItems[idx];
      if (item) openNode(item);
    });

    filesEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && selectedIndex >= 0) {
        const item = displayedItems[selectedIndex];
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
        userForcedViewMode = false;
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
 * 2. NOTEPAD TEXT VIEWER (notepadApp)
 * ========================================================================== */

function getReadmeText() {
  const rootFs = normalizeRootFs();
  const fsReadme = findFsDocByKey(rootFs, 'readme');
  if (fsReadme && fsReadme.content) return fsReadme.content;

  const name = PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando';
  return [
    '====================================================================',
    '  RIZKYOS 95 - README.TXT',
    `  Desktop Portfolio of ${name}`,
    '====================================================================',
    '',
    `${name} - ${PROFILE?.role || 'AI Engineer & Data Specialist'}`,
    `${PROFILE?.university || 'Institut Teknologi Sepuluh Nopember (ITS)'} (${PROFILE?.gpa || 'Cum Laude'})`,
    '',
    'KONTAK:',
    `  Email    : ${PROFILE?.email || 'risky.alviando@gmail.com'}`,
    `  Website  : ${PROFILE?.website || 'https://rizkyalviando.ai.id'}`,
    `  LinkedIn : ${PROFILE?.linkedin || ''}`,
    `  GitHub   : ${PROFILE?.github || ''}`
  ].join('\n');
}

export const notepadApp = {
  id: 'notepad',
  title: 'README.txt - Notepad',
  icon: 'notepad',
  width: 660,
  height: 500,
  minWidth: 340,
  minHeight: 280,
  singleton: false,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    const rootFs = normalizeRootFs();
    let mode = 'readme';
    let customTitle = args?.title || 'Untitled.txt';
    let customContent = typeof args?.content === 'string' ? args.content : '';

    function openRealCvPdf() {
      winApi?.os?.openApp?.('pdf-viewer', {
        certId: 'cv-rizky-alviando',
        file: PROFILE?.cvPdf || 'assets/certs/Rizky_Alviando_CV_ID.pdf',
        title: 'Curriculum Vitae (CV) - Rizky Alviando'
      });
    }

    if (args?.doc === 'cv') {
      openRealCvPdf();
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
              <button type="button" class="win95-menu-item np-menu-item" data-action="mode-readme">Open README.txt</button>
              <button type="button" class="win95-menu-item np-menu-item" data-action="open-cv-pdf">Open CV (PDF)...</button>
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
              <button type="button" class="win95-menu-item np-menu-item" data-action="about">About Notepad...</button>
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
      const text = mode === 'custom' ? customContent : getReadmeText();
      const title = mode === 'custom' ? `${customTitle} - Notepad` : 'README.txt - Notepad';
      winApi?.setTitle?.(title);
      toolbarEl.innerHTML = `
        <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="copy-all">Copy All</button>
        <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="download">Save .txt</button>
        <button type="button" class="win95-toolbar-btn np-tb-btn ${wordWrap ? 'is-active' : ''}" data-action="toggle-wrap">Wrap: ${wordWrap ? 'ON' : 'OFF'}</button>
        ${
          mode === 'custom'
            ? `<span class="win95-toolbar-sep" aria-hidden="true"></span>
               <button type="button" class="win95-toolbar-btn np-tb-btn" data-action="mode-readme">
                 <span class="np-tb-ico">${getIconSVG('notepad', 14)}</span>
                 <span>README.txt</span>
               </button>`
            : ''
        }
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

    async function handleAction(act) {
      if (act === 'open-cv-pdf') {
        openRealCvPdf();
      } else if (act === 'mode-readme') {
        mode = 'readme';
        renderMode();
      } else if (act === 'print') {
        window.print();
      } else if (act === 'download') {
        const fname =
          mode === 'custom'
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
          `Website: ${PROFILE?.website || 'https://rizkyalviando.ai.id'}`,
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
        renderMode();
      } else if (act === 'close') {
        winApi?.close?.();
      } else if (act === 'about') {
        winApi?.os?.showDialog?.({
          title: 'About Notepad 95',
          icon: 'notepad',
          message:
            'Notepad - RizkyOS 95\n\nMenampilkan README.txt monospace klasik serta inspeksi file teks dan log di RizkyOS 95.',
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
 * 3. ACROBAT READER 95 - PDF VIEWER (pdfViewerApp)
 * ========================================================================== */

export const pdfViewerApp = {
  id: 'pdf-viewer',
  title: 'Acrobat Reader 95 - PDF Viewer',
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

    const primaryDocs = [];
    const certDocs = [];
    certs.forEach((c, idx) => {
      const isPrimary =
        c.id === 'cv-rizky-alviando' ||
        c.id === 'portfolio-deck' ||
        /cv|resume|portofolio|portfolio/i.test(String(c.category || ''));
      if (isPrimary) primaryDocs.push({ cert: c, idx });
      else certDocs.push({ cert: c, idx });
    });

    const renderOptions = (list) =>
      list
        .map(
          ({ cert, idx }) =>
            `<option value="${idx}">${escapeHtml(cert.title)} (${escapeHtml(cert.year || '')})</option>`
        )
        .join('');

    containerEl.innerHTML = `
      <div class="pdf-app">
        <div class="win95-toolbar pdf-toolbar">
          <label class="pdf-select-wrap">
            <span class="pdf-select-ico">${getIconSVG('pdf', 15)}</span>
            <span class="pdf-select-label">Dokumen:</span>
            <select class="win95-field pdf-cert-select" aria-label="Pilih Dokumen PDF">
              ${
                primaryDocs.length
                  ? `<optgroup label="Dokumen Utama (CV &amp; Portofolio)">${renderOptions(primaryDocs)}</optgroup>`
                  : ''
              }
              ${
                certDocs.length
                  ? `<optgroup label="Sertifikat &amp; Kredensial">${renderOptions(certDocs)}</optgroup>`
                  : ''
              }
            </select>
          </label>
          <div class="pdf-toolbar-actions">
            <a class="win95-btn win95-btn-sm pdf-icon-btn pdf-verify-btn" href="#" target="_blank" rel="noopener noreferrer" title="Verifikasi kredensial di tab baru" aria-label="Verifikasi kredensial di tab baru" hidden>${getIconSVG('external-link', 14)}</a>
            <a class="win95-btn win95-btn-sm pdf-action-link pdf-download-btn" href="#" download>Download PDF</a>
            <a class="win95-btn win95-btn-sm pdf-icon-btn pdf-newtab-btn" href="#" target="_blank" rel="noopener noreferrer" title="Buka PDF di tab baru" aria-label="Buka PDF di tab baru">${getIconSVG('external-link', 14)}</a>
          </div>
        </div>

        <div class="pdf-frame-wrap win95-sunken">
          <iframe class="pdf-iframe" title="PDF Document Preview"></iframe>
        </div>

        <div class="pdf-mobile-note">
          <span>Catatan: Jika pratinjau PDF tidak tampil pada browser mobile, gunakan ikon buka di tab baru atau tombol <strong>Download PDF</strong> di atas.</span>
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
        winApi?.setTitle?.('Acrobat Reader 95 - No File');
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

      winApi?.setTitle?.(`${certObj.title || 'PDF Document'} - Acrobat Reader 95`);
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
  width: 640,
  height: 430,
  minWidth: 360,
  minHeight: 280,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    const seedItems = Array.isArray(RECYCLE_ITEMS) ? RECYCLE_ITEMS : [];
    let items = seedItems.map((item) => ({ ...item }));
    let selectedIndex = -1;
    let sortCol = null;
    let sortDir = 'asc';

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

    function sortItems() {
      if (!sortCol) return;
      const factor = sortDir === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        if (sortCol === 'size') {
          return (parseSizeToBytes(a.size) - parseSizeToBytes(b.size)) * factor;
        }
        if (sortCol === 'date') {
          return parseDateComparable(a.deletedDate).localeCompare(parseDateComparable(b.deletedDate)) * factor;
        }
        if (sortCol === 'path') {
          return String(a.originalPath || '').localeCompare(String(b.originalPath || '')) * factor;
        }
        return String(a.name || '').localeCompare(String(b.name || '')) * factor;
      });
    }

    function updateButtons() {
      const hasSelection = selectedIndex >= 0 && selectedIndex < items.length;
      inspectBtn.disabled = !hasSelection;
      restoreBtn.disabled = !hasSelection;
      emptyBtn.disabled = items.length === 0;
      refillBtn.hidden = items.length > 0;
      winApi?.setStatus?.(
        items.length
          ? `${items.length} deleted item(s) - Double-click untuk melihat isi file`
          : 'Recycle Bin kosong (0 items)'
      );
    }

    function renderSortTh(col, label) {
      const isSorted = sortCol === col;
      const arrow = isSorted ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      return `<th><button type="button" class="exp-sort-btn ${isSorted ? 'is-sorted' : ''}" data-rb-sort="${col}">${escapeHtml(label)}${arrow}</button></th>`;
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
              ${renderSortTh('name', 'Name')}
              ${renderSortTh('path', 'Original Location')}
              ${renderSortTh('date', 'Date Deleted')}
              ${renderSortTh('size', 'Size')}
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
      const sortBtn = e.target.closest('[data-rb-sort]');
      if (sortBtn) {
        sound.playClick();
        const col = sortBtn.dataset.rbSort;
        if (sortCol === col) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortCol = col;
          sortDir = 'asc';
        }
        selectedIndex = -1;
        sortItems();
        renderTable();
        return;
      }

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
          sortItems();
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
