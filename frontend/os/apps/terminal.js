import {
  PROFILE,
  EXPERIENCES,
  PROJECTS,
  SKILLS,
  CERTIFICATES,
  VIRTUAL_FS,
} from '../data.js';
import { sound } from '../sound.js';

const APP_ALIASES = {
  messenger: 'messenger',
  chat: 'messenger',
  ai: 'messenger',
  rizkybot: 'messenger',
  browser: 'browser',
  ie: 'browser',
  web: 'browser',
  portfolio: 'browser',
  explorer: 'explorer',
  computer: 'explorer',
  files: 'explorer',
  'ojek-rush': 'ojek-rush',
  ojek: 'ojek-rush',
  game: 'ojek-rush',
  race: 'ojek-rush',
  minesweeper: 'minesweeper',
  mine: 'minesweeper',
  mines: 'minesweeper',
  chess: 'chess',
  catur: 'chess',
  rubik: 'rubik',
  rubiks: 'rubik',
  cube: 'rubik',
  guestbook: 'guestbook',
  book: 'guestbook',
  display: 'display',
  settings: 'display',
  wallpaper: 'display',
  room3d: 'room3d',
  '3d': 'room3d',
  room: 'room3d',
  notepad: 'notepad',
  cv: 'pdf-viewer',
  readme: 'notepad',
  'recycle-bin': 'recycle-bin',
  trash: 'recycle-bin',
  terminal: 'terminal',
  dos: 'terminal',
  cmd: 'terminal',
};

const VALID_THEMES = ['white', 'green', 'amber', 'cyan'];

const ALL_COMMANDS = [
  'help',
  'whoami',
  'about',
  'neofetch',
  'dir',
  'ls',
  'tree',
  'cd',
  'pwd',
  'type',
  'cat',
  'skills',
  'projects',
  'read',
  'exp',
  'certs',
  'contact',
  'open',
  'ask',
  'color',
  'matrix',
  'bsod',
  'ver',
  'date',
  'echo',
  'cls',
  'clear',
  'exit',
];

function padRight(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function padLeft(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s : ' '.repeat(len - s.length) + s;
}

function makeSessionId() {
  const key = 'rizkyos_dos_session_id';
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `dos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `dos_${Date.now()}`;
  }
}

function resolveFsRoot() {
  if (VIRTUAL_FS && Array.isArray(VIRTUAL_FS.children)) {
    return VIRTUAL_FS;
  }
  if (Array.isArray(VIRTUAL_FS)) {
    return { name: 'C:\\Rizky', type: 'folder', children: VIRTUAL_FS };
  }
  return { name: 'C:\\Rizky', type: 'folder', children: [] };
}

function formatSkillTier(level) {
  const str = String(level || '').trim();
  if (!str) return '[TERAPAN ]';
  return `[${padRight(str.toUpperCase(), 8)}]`;
}

export const terminalApp = {
  id: 'terminal',
  title: 'MS-DOS Prompt',
  icon: 'dos',
  width: 680,
  height: 470,
  minWidth: 400,
  minHeight: 300,
  singleton: false,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    containerEl.innerHTML = `
      <div class="term-app term-theme-white">
        <div class="term-toolbar win95-toolbar">
          <div class="term-toolbar-group">
            <span class="term-toolbar-label">Color:</span>
            <button type="button" class="win95-btn term-theme-btn is-active" data-theme="white">Classic</button>
            <button type="button" class="win95-btn term-theme-btn" data-theme="green">Green</button>
            <button type="button" class="win95-btn term-theme-btn" data-theme="amber">Amber</button>
            <button type="button" class="win95-btn term-theme-btn" data-theme="cyan">Cyan</button>
          </div>
          <div class="term-toolbar-group">
            <button type="button" class="win95-btn" data-quick="help">Help</button>
            <button type="button" class="win95-btn" data-quick="neofetch">Neofetch</button>
            <button type="button" class="win95-btn" data-quick="cls">CLS</button>
          </div>
        </div>

        <div class="term-screen win95-sunken win95-scrollbar" data-term="screen" tabindex="0">
          <div class="term-output" data-term="output"></div>
          <form class="term-prompt-row" data-term="form" autocomplete="off">
            <span class="term-prompt-label" data-term="prompt">C:\\RIZKY&gt;</span>
            <input
              type="text"
              class="term-input"
              data-term="input"
              spellcheck="false"
              autocapitalize="off"
              autocomplete="off"
              aria-label="MS-DOS Command Input"
            />
          </form>
        </div>
      </div>
    `;

    const appEl = containerEl.querySelector('.term-app');
    const screenEl = containerEl.querySelector('[data-term="screen"]');
    const outputEl = containerEl.querySelector('[data-term="output"]');
    const formEl = containerEl.querySelector('[data-term="form"]');
    const promptEl = containerEl.querySelector('[data-term="prompt"]');
    const inputEl = containerEl.querySelector('[data-term="input"]');
    const themeBtns = containerEl.querySelectorAll('.term-theme-btn');

    const rootNode = resolveFsRoot();
    let cwdStack = [rootNode];
    let currentTheme = 'white';
    let history = [];
    let historyIdx = -1;
    let draftLine = '';
    let isBusy = false;
    let activeAbort = null;
    let activeSpinner = null;
    let disposed = false;
    const sessionId = makeSessionId();

    function getCwdNode() {
      return cwdStack[cwdStack.length - 1];
    }

    function getCwdPath() {
      const parts = cwdStack.map((n, i) => (i === 0 ? 'C:\\RIZKY' : String(n.name || '').toUpperCase()));
      return parts.join('\\');
    }

    function updatePrompt() {
      const pathStr = getCwdPath();
      promptEl.textContent = `${pathStr}>`;
      winApi.setTitle(`MS-DOS Prompt - ${pathStr}`);
      winApi.setStatus(`Ready | ${pathStr} | Theme: ${currentTheme.toUpperCase()} | Type 'help'`);
    }

    function scrollToBottom() {
      screenEl.scrollTop = screenEl.scrollHeight;
    }

    function appendLine(text = '', cls = '') {
      const line = document.createElement('div');
      line.className = `term-line${cls ? ' ' + cls : ''}`;
      line.textContent = text;
      outputEl.appendChild(line);
      scrollToBottom();
      return line;
    }

    function appendPre(text, cls = '') {
      const pre = document.createElement('pre');
      pre.className = `term-pre${cls ? ' ' + cls : ''}`;
      pre.textContent = text;
      outputEl.appendChild(pre);
      scrollToBottom();
      return pre;
    }

    function appendBanner() {
      appendLine('Microsoft(R) RizkyOS 95 [Version 4.00.950]', 'term-bright');
      appendLine('   (C)Copyright Rizky Alviando Corp 1995-2026.', 'term-dim');
      appendLine('');
      appendLine("Type 'help' for commands, 'neofetch' for specs, or 'ask <question>' to chat with Rizky AI.");
      appendLine('');
    }

    function setTheme(themeName) {
      let t = String(themeName || '').toLowerCase();
      if (t === 'classic' || t === 'default' || t === 'gray') t = 'white';
      if (!VALID_THEMES.includes(t)) {
        appendLine(`Invalid color '${themeName}'. Usage: color <white|green|amber|cyan>`, 'term-error');
        sound.playError();
        return false;
      }
      for (const th of VALID_THEMES) {
        appEl.classList.remove(`term-theme-${th}`);
      }
      appEl.classList.add(`term-theme-${t}`);
      currentTheme = t;
      themeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.theme === t));
      updatePrompt();
      sound.playBeep(720, 0.05);
      return true;
    }

    function resolvePathNodes(pathArg) {
      if (!pathArg || pathArg === '.') return [...cwdStack];
      const cleaned = pathArg.replace(/\//g, '\\').trim();
      let stack;
      let rest = cleaned;

      if (/^c:\\rizky/i.test(cleaned)) {
        stack = [rootNode];
        rest = cleaned.replace(/^c:\\rizky\\?/i, '');
      } else if (cleaned.startsWith('\\')) {
        stack = [rootNode];
        rest = cleaned.slice(1);
      } else {
        stack = [...cwdStack];
      }

      if (!rest) return stack;
      const segments = rest.split('\\').filter(Boolean);
      for (const seg of segments) {
        if (seg === '.') continue;
        if (seg === '..') {
          if (stack.length > 1) stack.pop();
          continue;
        }
        const cur = stack[stack.length - 1];
        const children = Array.isArray(cur.children) ? cur.children : [];
        const match = children.find((c) => String(c.name || '').toLowerCase() === seg.toLowerCase());
        if (!match) return null;
        stack.push(match);
      }
      return stack;
    }

    function cmdHelp() {
      const rows = [
        ['help', 'Display this command reference'],
        ['whoami / about', 'Show Rizky Alviando profile summary'],
        ['neofetch', 'Show retro ASCII logo & system specs'],
        ['dir / ls [dir]', 'List files & folders in virtual filesystem'],
        ['tree', 'Show directory tree of current folder'],
        ['cd <dir>', 'Change directory (cd Projects, cd .., cd \\)'],
        ['type / cat <file>', 'Display contents or metadata of a file'],
        ['skills', 'List technical skills & proficiency levels'],
        ['projects', 'List portfolio case studies & slugs'],
        ['read <slug>', 'Open a project case study in Internet Explorer'],
        ['exp', 'Display work & organization experience'],
        ['certs', 'Display verified PDF certificates'],
        ['contact', 'Display email, phone, LinkedIn, GitHub & portfolio'],
        ['open <app>', 'Launch app (messenger, browser, chess, rubik, ojek-rush...)'],
        ['ask <question>', 'Live query to RizkyBot AI (POST /api/web-chat)'],
        ['color <theme>', 'Switch color theme: white|green|amber|cyan'],
        ['matrix', 'Toggle Matrix digital rain Easter egg'],
        ['bsod', 'Trigger classic Windows 95 BSOD gag'],
        ['ver / date', 'Show OS version or current date/time'],
        ['cls / clear', 'Clear terminal screen'],
        ['exit', 'Close MS-DOS Prompt window'],
      ];
      appendLine('RIZKYOS 95 - MS-DOS COMMAND REFERENCE', 'term-bright');
      appendLine('='.repeat(62), 'term-dim');
      const lines = rows.map(([cmd, desc]) => `  ${padRight(cmd, 20)} ${desc}`);
      appendPre(lines.join('\n'));
    }

    function cmdWhoami() {
      const fullName = PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando';
      const role = PROFILE?.role || 'AI Engineer';
      const uni = PROFILE?.university || 'Institut Teknologi Sepuluh Nopember (ITS)';
      const degree = PROFILE?.degree || 'S1 Matematika';
      const gpa = PROFILE?.gpa ? ` (${PROFILE.gpa})` : '';
      const loc = PROFILE?.location || 'Surabaya, Indonesia';
      const summary = PROFILE?.summary || PROFILE?.tagline || '';

      appendPre([
        '+------------------------------------------------------------+',
        `|  ${padRight(fullName.toUpperCase() + ' - ' + role, 56)}  |`,
        '+------------------------------------------------------------+',
        `  Education : ${degree}`,
        `              ${uni}${gpa}`,
        `  Location  : ${loc}`,
        `  Handle    : ${PROFILE?.handle || '@rizkyalviando'}`,
        '+------------------------------------------------------------+',
      ].join('\n'), 'term-bright');

      if (summary) {
        appendLine('');
        appendLine(summary);
      }
      if (Array.isArray(PROFILE?.stats) && PROFILE.stats.length > 0) {
        appendLine('');
        const statsLine = PROFILE.stats.map((s) => `[${s.label}: ${s.value}]`).join('  ');
        appendLine(statsLine, 'term-accent');
      }
    }

    function cmdNeofetch() {
      const fullName = PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando';
      const role = PROFILE?.role || 'AI Engineer & Data Scientist';
      const shortDegree = String(PROFILE?.degree || 'S1 Matematika').split('(')[0].trim();
      const rawUni = String(PROFILE?.university || 'ITS Surabaya');
      const shortUni = rawUni.includes('(ITS)') ? 'ITS Surabaya' : rawUni;
      const eduLine = `${shortDegree}, ${shortUni}`;
      const gpaLine = PROFILE?.gpa || '3.67 / 4.00 (Cum Laude)';
      const loc = PROFILE?.location || 'Surabaya, Indonesia';
      const certCount = Array.isArray(CERTIFICATES) ? CERTIFICATES.length : 0;
      const projCount = Array.isArray(PROJECTS) ? PROJECTS.length : 0;
      const themeLabel = currentTheme === 'white' ? 'CLASSIC (WHITE)' : currentTheme.toUpperCase();

      const art = [
        '   ██████╗  ██████╗ ███████╗',
        '   ██╔══██╗██╔═══██╗██╔════╝',
        '   ██████╔╝██║   ██║███████╗',
        '   ██╔══██╗██║   ██║╚════██║',
        '   ██║  ██║╚██████╔╝███████║',
        '   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
        '       R I Z K Y O S  9 5   ',
      ];
      const specs = [
        `${PROFILE?.handle || 'rizky'}@rizkyos95`,
        '------------------------------------',
        `OS        : RizkyOS 95 [Version 4.00.950]`,
        `Host      : ${fullName}`,
        `Role      : ${role}`,
        `Education : ${eduLine}`,
        `GPA       : ${gpaLine}`,
        `Location  : ${loc}`,
        `AI Engine : Groq LLM (Qwen / Llama 3.3)`,
        `Portfolio : ${projCount} Case Studies | ${certCount} PDF Certs`,
        `Theme     : ${themeLabel}`,
      ];

      const wrap = document.createElement('div');
      wrap.className = 'term-neofetch';

      const artPre = document.createElement('pre');
      artPre.className = 'term-neofetch-art';
      artPre.textContent = art.join('\n');

      const infoPre = document.createElement('pre');
      infoPre.className = 'term-neofetch-info';
      infoPre.textContent = specs.join('\n');

      const swatches = document.createElement('div');
      swatches.className = 'term-swatches';
      for (const hex of ['#008080', '#000080', '#22c55e', '#facc15', '#38bdf8', '#ef4444', '#c0c0c0', '#ffffff']) {
        const box = document.createElement('span');
        box.className = 'term-swatch';
        box.style.backgroundColor = hex;
        swatches.appendChild(box);
      }

      const rightCol = document.createElement('div');
      rightCol.className = 'term-neofetch-right';
      rightCol.appendChild(infoPre);
      rightCol.appendChild(swatches);

      wrap.appendChild(artPre);
      wrap.appendChild(rightCol);
      outputEl.appendChild(wrap);
      scrollToBottom();
    }

    function cmdDir(arg) {
      const targetStack = arg ? resolvePathNodes(arg) : cwdStack;
      if (!targetStack) {
        appendLine(`File Not Found: '${arg}'`, 'term-error');
        sound.playError();
        return;
      }
      const node = targetStack[targetStack.length - 1];
      if (node.type !== 'folder') {
        appendLine(`  ${padRight(node.name, 30)} ${padLeft(node.size || '1 KB', 10)}  ${node.date || '1995-08-24'}`);
        return;
      }

      const dirPath = targetStack.map((n, i) => (i === 0 ? 'C:\\RIZKY' : String(n.name || '').toUpperCase())).join('\\');
      const children = Array.isArray(node.children) ? node.children : [];

      const lines = [
        ' Volume in drive C is RIZKYOS95',
        ' Volume Serial Number is 1995-AI95',
        ` Directory of ${dirPath}`,
        '',
      ];

      let dirCount = 0;
      let fileCount = 0;

      if (targetStack.length > 1) {
        lines.push(`08-24-1995  09:00a    <DIR>          ..`);
        dirCount++;
      }

      for (const item of children) {
        const dt = padRight(item.date || '08-24-1995', 12);
        if (item.type === 'folder') {
          dirCount++;
          lines.push(`${dt}  <DIR>          ${item.name}`);
        } else {
          fileCount++;
          const sizeStr = padLeft(item.size || '4 KB', 10);
          lines.push(`${dt}  ${sizeStr}     ${item.name}`);
        }
      }

      lines.push('');
      lines.push(`        ${fileCount} file(s)    ${dirCount} dir(s)    65,536 KB free`);
      appendPre(lines.join('\n'));
    }

    function cmdTree() {
      const startNode = getCwdNode();
      const lines = [getCwdPath()];
      function walk(node, prefix) {
        const children = Array.isArray(node.children) ? node.children : [];
        children.forEach((child, idx) => {
          const isLast = idx === children.length - 1;
          const branch = isLast ? '\\---' : '+---';
          lines.push(`${prefix}${branch}${child.name}${child.type === 'folder' ? '\\' : ''}`);
          if (child.type === 'folder' && Array.isArray(child.children) && child.children.length > 0) {
            walk(child, prefix + (isLast ? '    ' : '|   '));
          }
        });
      }
      walk(startNode, '');
      appendPre(lines.join('\n'));
    }

    function cmdCd(arg) {
      if (!arg) {
        appendLine(getCwdPath());
        return;
      }
      const nextStack = resolvePathNodes(arg);
      if (!nextStack) {
        appendLine(`Invalid directory: ${arg}`, 'term-error');
        sound.playError();
        return;
      }
      const target = nextStack[nextStack.length - 1];
      if (target.type !== 'folder') {
        appendLine(`'${target.name}' is a file, not a directory. Use 'type ${target.name}'.`, 'term-error');
        sound.playError();
        return;
      }
      cwdStack = nextStack;
      updatePrompt();
    }

    function cmdType(arg) {
      if (!arg) {
        appendLine('Syntax: type <filename>', 'term-error');
        return;
      }
      const targetStack = resolvePathNodes(arg);
      if (!targetStack) {
        appendLine(`File not found: ${arg}`, 'term-error');
        sound.playError();
        return;
      }
      const node = targetStack[targetStack.length - 1];
      if (node.type === 'folder') {
        appendLine(`Access denied: '${node.name}' is a directory. Use 'dir ${node.name}'.`, 'term-error');
        return;
      }

      if (node.content) {
        appendPre(String(node.content));
        return;
      }

      if (node.type === 'doc') {
        if (node.docKey === 'cv') {
          appendLine(`=== ${PROFILE?.fullName || 'Rizky Alviando'} - CURRICULUM VITAE ===`, 'term-bright');
          cmdWhoami();
          appendLine('');
          appendLine("Tip: run 'open cv' to view or download the official PDF CV in Acrobat Reader 95.", 'term-dim');
          return;
        }
        appendLine(`=== ${node.name} ===`, 'term-bright');
        const paras = Array.isArray(PROFILE?.bioParagraphs) ? PROFILE.bioParagraphs : [PROFILE?.summary || ''];
        for (const p of paras) {
          if (p) {
            appendLine(p);
            appendLine('');
          }
        }
        return;
      }

      if (node.type === 'ie' && node.page) {
        const slug = String(node.page).replace(/^project:/, '');
        const proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
        if (proj) {
          appendLine(`=== ${proj.title} ===`, 'term-bright');
          if (proj.subtitle) appendLine(proj.subtitle, 'term-accent');
          appendLine(`Category : ${proj.category || 'Project'} | Date: ${proj.date || '-'}`);
          appendLine(`Stack    : ${(proj.techStack || []).join(', ')}`);
          appendLine('');
          appendLine(proj.summary || '');
          appendLine('');
          appendLine(`Tip: run 'read ${proj.slug}' to open this full Medium-style article in IE.`, 'term-dim');
          return;
        }
        const baseSite = String(PROFILE?.website || 'https://rizkyalviando.ai.id').replace(/\/+$/, '');
        appendLine(`Internet Shortcut -> ${baseSite}/${node.page}`);
        appendLine("Run 'open browser' to open in Internet Explorer.", 'term-dim');
        return;
      }

      if (node.type === 'pdf') {
        const cert = (CERTIFICATES || []).find((c) => c.file === node.file);
        appendLine(`[PDF CERTIFICATE] ${cert ? cert.title : node.name}`, 'term-bright');
        if (cert) {
          appendLine(`  Issuer   : ${cert.issuer}`);
          appendLine(`  Year     : ${cert.year}`);
          appendLine(`  Category : ${cert.category}`);
          appendLine(`  Path     : ${cert.file}`);
        } else {
          appendLine(`  Path     : ${node.file || node.name}`);
        }
        if (node.file) {
          winApi.os.openApp('pdf-viewer', { title: cert ? cert.title : node.name, file: node.file });
          appendLine('  -> Opened in PDF Viewer.', 'term-accent');
        }
        return;
      }

      if (node.type === 'app' && node.appId) {
        appendLine(`Executable: ${node.name} -> launching '${node.appId}'...`, 'term-accent');
        winApi.os.openApp(node.appId, node.appArgs || {});
        return;
      }

      if (node.type === 'link' && node.href) {
        appendLine(`URL Shortcut: ${node.name} -> ${node.href}`);
        return;
      }

      appendLine(`[${node.type || 'FILE'}] ${node.name} (${node.size || '1 KB'})`);
    }

    function cmdSkills() {
      appendLine('TECHNICAL SKILLS MATRIX', 'term-bright');
      appendLine('='.repeat(68), 'term-dim');
      const lines = [];
      for (const group of SKILLS || []) {
        lines.push(`\n[${String(group.category || 'Skills').toUpperCase()}]`);
        for (const item of group.items || []) {
          const name = typeof item === 'string' ? item : item.name;
          const level = typeof item === 'string' ? '' : item.level;
          const detail = typeof item === 'string' ? '' : item.detail;
          lines.push(`  ${formatSkillTier(level)} ${name}`);
          if (detail) lines.push(`             ${detail}`);
        }
      }
      appendPre(lines.join('\n').trim());
    }

    function cmdProjects() {
      appendLine('FEATURED PROJECTS & CASE STUDIES', 'term-bright');
      appendLine('='.repeat(68), 'term-dim');
      const lines = [];
      (PROJECTS || []).forEach((p, idx) => {
        lines.push(`${idx + 1}. ${p.title}  [${p.category || 'AI'}]`);
        lines.push(`   Slug  : ${p.slug}`);
        lines.push(`   Stack : ${(p.techStack || []).slice(0, 6).join(', ')}`);
        lines.push(`   Info  : ${p.summary || p.subtitle || ''}`);
        lines.push('');
      });
      lines.push("Tip: Run 'read <slug>' to launch a full case study in Internet Explorer!");
      appendPre(lines.join('\n'));
    }

    function cmdRead(slugArg) {
      if (!slugArg) {
        appendLine("Syntax: read <slug>  (Run 'projects' to list slugs)", 'term-error');
        return;
      }
      const query = slugArg.toLowerCase();
      const proj = (PROJECTS || []).find(
        (p) => String(p.slug || '').toLowerCase() === query || String(p.id || '').toLowerCase() === query
      );
      if (!proj) {
        appendLine(`Project '${slugArg}' not found. Run 'projects' to view available slugs.`, 'term-error');
        sound.playError();
        return;
      }
      winApi.os.openApp('browser', { page: `project:${proj.slug}` });
      appendLine(`Opening "${proj.title}" in Internet Explorer...`, 'term-accent');
    }

    function cmdExp() {
      appendLine('WORK & ORGANIZATION EXPERIENCE', 'term-bright');
      appendLine('='.repeat(68), 'term-dim');
      const lines = [];
      for (const e of EXPERIENCES || []) {
        lines.push(`* ${e.role} @ ${e.org}`);
        lines.push(`  ${e.period || ''} | ${e.location || ''} ${e.type ? `[${e.type}]` : ''}`);
        if (e.summary) lines.push(`  ${e.summary}`);
        if (Array.isArray(e.highlights)) {
          for (const h of e.highlights.slice(0, 3)) {
            lines.push(`    - ${h}`);
          }
        }
        lines.push('');
      }
      appendPre(lines.join('\n').trim());
    }

    function cmdCerts() {
      appendLine(`VERIFIED CERTIFICATES (${(CERTIFICATES || []).length} PDFs)`, 'term-bright');
      appendLine('='.repeat(68), 'term-dim');
      const lines = (CERTIFICATES || []).map((c, i) => {
        const num = padLeft(i + 1, 2);
        return `${num}. [${c.year || '----'}] ${padRight(c.issuer || 'Verified', 22)} ${c.title}`;
      });
      lines.push('');
      lines.push("Tip: Run 'cd Certificates' then 'dir' & 'type <filename>' to view any PDF!");
      appendPre(lines.join('\n'));
    }

    function cmdContact() {
      const rows = [
        'CONTACT & SOCIAL LINKS',
        '============================================================',
        `  Name      : ${PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando'}`,
        `  Location  : ${PROFILE?.location || 'Jakarta & Surabaya, Indonesia'}`,
        `  Email     : ${PROFILE?.email || '-'}`,
      ];
      if (PROFILE?.phone) rows.push(`  Phone     : ${PROFILE.phone}`);
      if (PROFILE?.website) rows.push(`  Website   : ${PROFILE.website}`);
      if (PROFILE?.linkedin) rows.push(`  LinkedIn  : ${PROFILE.linkedin}`);
      if (PROFILE?.github) rows.push(`  GitHub    : ${PROFILE.github}`);
      if (PROFILE?.canvaPortfolio) rows.push(`  Portfolio : ${PROFILE.canvaPortfolio}`);
      if (PROFILE?.instagram) rows.push(`  Instagram : ${PROFILE.instagram}`);
      rows.push(
        '============================================================',
        "Tip: Run 'open messenger' to talk live with RizkyBot AI,",
        "     or 'open guestbook' to sign RizkyBook 95!"
      );
      appendPre(rows.join('\n'));
    }

    function cmdOpen(targetArg) {
      if (!targetArg) {
        appendLine('Usage: open <app>', 'term-error');
        appendLine('Apps : messenger, browser, explorer, ojek-rush, minesweeper, chess, rubik, guestbook, display, room3d, notepad, recycle-bin');
        return;
      }
      const key = targetArg.toLowerCase();
      const appId = APP_ALIASES[key];
      if (!appId) {
        appendLine(`Unknown app '${targetArg}'. Try: messenger, browser, explorer, ojek-rush, minesweeper, chess, rubik, guestbook, display, room3d, notepad.`, 'term-error');
        sound.playError();
        return;
      }
      const openArgs =
        key === 'cv'
          ? { file: PROFILE?.cvPdf || 'assets/certs/Rizky_Alviando_CV_ID.pdf', title: 'CV Resmi - Rizky Alviando, S.Mat. (PDF)' }
          : key === 'readme'
          ? { doc: 'readme' }
          : {};
      winApi.os.openApp(appId, openArgs);
      appendLine(`Launching ${appId}.exe...`, 'term-accent');
    }

    async function cmdAsk(question) {
      if (!question) {
        appendLine('Usage: ask <your question about Rizky Alviando>', 'term-error');
        appendLine('Example: ask Apa proyek AI terbaik Rizky?');
        return;
      }

      isBusy = true;
      inputEl.disabled = true;
      const spinnerFrames = ['|', '/', '-', '\\'];
      let frame = 0;
      const statusLine = appendLine('[|] [CONNECTING TO RIZKY_AI...]', 'term-accent');
      winApi.setStatus('Querying /api/web-chat (Groq LLM)... Press Ctrl+C to cancel');

      activeSpinner = setInterval(() => {
        frame = (frame + 1) % spinnerFrames.length;
        statusLine.textContent = `[${spinnerFrames[frame]}] [CONNECTING TO RIZKY_AI...]`;
      }, 110);

      activeAbort = new AbortController();

      try {
        const resp = await fetch('/api/web-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sessionId,
            session_id: sessionId,
            username: 'DOS_USER',
            text: question,
          }),
          signal: activeAbort.signal,
        });

        clearInterval(activeSpinner);
        activeSpinner = null;

        if (!resp.ok) {
          let errMsg = `HTTP ${resp.status}`;
          if (resp.status === 429) errMsg = '429 Too Many Requests: tunggu sebentar sebelum bertanya lagi.';
          else if (resp.status === 503) errMsg = '503 Service Unavailable: rate limiter sementara tidak tersedia.';
          else if (resp.status === 422) errMsg = '422 Unprocessable Entity: pertanyaan tidak boleh kosong.';
          statusLine.textContent = `[ERROR] ${errMsg}`;
          statusLine.className = 'term-line term-error';
          sound.playError();
          return;
        }

        const data = await resp.json();
        const reply = data?.reply || 'Tidak ada respons dari Rizky AI.';
        statusLine.textContent = '[OK] RIZKY_AI RESPONSE:';
        statusLine.className = 'term-line term-bright';
        appendPre(reply, 'term-ai-reply');
        appendLine('');
        sound.playMessage();
      } catch (err) {
        if (activeSpinner) {
          clearInterval(activeSpinner);
          activeSpinner = null;
        }
        if (disposed) return;
        if (err && err.name === 'AbortError') {
          statusLine.textContent = '^C [REQUEST CANCELLED]';
          statusLine.className = 'term-line term-dim';
        } else {
          statusLine.textContent = `[NET ERROR] Gagal terhubung ke /api/web-chat (${err?.message || 'offline'}).`;
          statusLine.className = 'term-line term-error';
          sound.playError();
        }
      } finally {
        activeAbort = null;
        isBusy = false;
        if (!disposed) {
          inputEl.disabled = false;
          updatePrompt();
          inputEl.focus();
        }
      }
    }

    async function executeCommand(rawInput) {
      const trimmed = rawInput.trim();
      appendLine(`${getCwdPath()}>${rawInput}`, 'term-echo');
      if (!trimmed) return;

      // Save to history (avoid immediate duplicates)
      if (history[history.length - 1] !== trimmed) {
        history.push(trimmed);
      }
      historyIdx = history.length;
      draftLine = '';

      const spaceIdx = trimmed.indexOf(' ');
      const cmd = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
      const rest = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim();

      switch (cmd) {
        case 'help':
        case '?':
          cmdHelp();
          break;
        case 'whoami':
        case 'about':
          cmdWhoami();
          break;
        case 'neofetch':
          cmdNeofetch();
          break;
        case 'dir':
        case 'ls':
          cmdDir(rest);
          break;
        case 'tree':
          cmdTree();
          break;
        case 'cd':
          cmdCd(rest);
          break;
        case 'pwd':
          appendLine(getCwdPath());
          break;
        case 'type':
        case 'cat':
          cmdType(rest);
          break;
        case 'skills':
          cmdSkills();
          break;
        case 'projects':
          cmdProjects();
          break;
        case 'read':
          cmdRead(rest);
          break;
        case 'exp':
        case 'experience':
          cmdExp();
          break;
        case 'certs':
        case 'certificates':
          cmdCerts();
          break;
        case 'contact':
          cmdContact();
          break;
        case 'open':
        case 'start':
          cmdOpen(rest);
          break;
        case 'ask':
          await cmdAsk(rest);
          break;
        case 'color':
          if (!rest) {
            appendLine(`Current color theme: ${currentTheme === 'white' ? 'classic (white)' : currentTheme}. Options: white | green | amber | cyan`);
          } else if (setTheme(rest)) {
            appendLine(`Terminal color set to ${currentTheme === 'white' ? 'classic (white)' : currentTheme}.`, 'term-accent');
          }
          break;
        case 'matrix':
          winApi.os.triggerMatrixEasterEgg();
          appendLine('[MATRIX DIGITAL RAIN TOGGLED] Wake up, Neo...', 'term-accent');
          break;
        case 'bsod':
          appendLine('Fatal exception 0E has occurred at 0028:C0011E36 in VXD RIZKY_AI(01)...', 'term-error');
          winApi.os.triggerBSOD();
          break;
        case 'ver':
          appendLine('RizkyOS 95 [Version 4.00.950] - Surabaya AI Engineer Edition', 'term-bright');
          break;
        case 'date':
        case 'time': {
          const now = new Date();
          appendLine(`Current system date/time: ${now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}`);
          break;
        }
        case 'echo':
          appendLine(rest);
          break;
        case 'cls':
        case 'clear':
          outputEl.innerHTML = '';
          break;
        case 'exit':
        case 'quit':
          winApi.close();
          return;
        default:
          appendLine(`Bad command or file name: '${cmd}'. Type 'help' for a list of commands.`, 'term-error');
          sound.playError();
          break;
      }

      scrollToBottom();
    }

    function handleAutocomplete() {
      const val = inputEl.value;
      const parts = val.split(/\s+/);

      // Autocomplete command name
      if (parts.length <= 1) {
        const prefix = parts[0].toLowerCase();
        if (!prefix) return;
        const matches = ALL_COMMANDS.filter((c) => c.startsWith(prefix));
        if (matches.length === 1) {
          inputEl.value = matches[0] + ' ';
        } else if (matches.length > 1) {
          appendLine(`${getCwdPath()}>${val}`, 'term-echo');
          appendLine(matches.join('   '), 'term-dim');
        }
        return;
      }

      const cmd = parts[0].toLowerCase();
      const argPrefix = parts.slice(1).join(' ').toLowerCase();
      let pool = [];

      if (cmd === 'open' || cmd === 'start') {
        pool = ['messenger', 'browser', 'explorer', 'ojek-rush', 'minesweeper', 'chess', 'rubik', 'guestbook', 'display', 'room3d', 'notepad', 'recycle-bin'];
      } else if (cmd === 'color') {
        pool = VALID_THEMES;
      } else if (cmd === 'read') {
        pool = (PROJECTS || []).map((p) => p.slug);
      } else if (['cd', 'dir', 'ls', 'type', 'cat'].includes(cmd)) {
        const children = Array.isArray(getCwdNode().children) ? getCwdNode().children : [];
        pool = children
          .filter((c) => (cmd === 'cd' ? c.type === 'folder' : true))
          .map((c) => c.name);
      }

      const matches = pool.filter((item) => String(item).toLowerCase().startsWith(argPrefix));
      if (matches.length === 1) {
        inputEl.value = `${parts[0]} ${matches[0]}`;
      } else if (matches.length > 1) {
        appendLine(`${getCwdPath()}>${val}`, 'term-echo');
        appendLine(matches.join('   '), 'term-dim');
      }
    }

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isBusy) return;
      const val = inputEl.value;
      inputEl.value = '';
      executeCommand(val);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (!isBusy) handleAutocomplete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length === 0) return;
        if (historyIdx === history.length) draftLine = inputEl.value;
        if (historyIdx > 0) {
          historyIdx--;
          inputEl.value = history[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < history.length - 1) {
          historyIdx++;
          inputEl.value = history[historyIdx];
        } else {
          historyIdx = history.length;
          inputEl.value = draftLine;
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        outputEl.innerHTML = '';
      } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (activeAbort) {
          activeAbort.abort();
        } else {
          appendLine(`${getCwdPath()}>${inputEl.value}^C`, 'term-dim');
          inputEl.value = '';
        }
      }
    });

    // Click inside terminal focuses input unless selecting text
    screenEl.addEventListener('click', () => {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;
      inputEl.focus();
    });

    // Toolbar buttons
    containerEl.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('[data-theme]');
      if (themeBtn) {
        setTheme(themeBtn.dataset.theme);
        inputEl.focus();
        return;
      }
      const quickBtn = e.target.closest('[data-quick]');
      if (quickBtn && !isBusy) {
        sound.playClick();
        executeCommand(quickBtn.dataset.quick);
        inputEl.focus();
      }
    });

    appendBanner();
    updatePrompt();

    if (args && typeof args.command === 'string' && args.command.trim()) {
      executeCommand(args.command.trim());
    }

    setTimeout(() => {
      if (!disposed) inputEl.focus();
    }, 30);

    winApi.onClose(() => {
      disposed = true;
      if (activeSpinner) {
        clearInterval(activeSpinner);
        activeSpinner = null;
      }
      if (activeAbort) {
        activeAbort.abort();
        activeAbort = null;
      }
    });
  },
};
