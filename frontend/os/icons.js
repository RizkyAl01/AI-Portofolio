/**
 * RizkyOS 95 — Authentic Windows 95 Pixel-Art SVG Icon Library
 * Crisp 32x32 retro pixel-styled inline SVGs with zero gradient ID collisions.
 */

const ICONS = {
  // Classic Win95 My Computer (CRT monitor + desktop unit)
  computer: `
    <rect x="4" y="3" width="24" height="17" fill="#000"/>
    <rect x="5" y="4" width="22" height="15" fill="#dfdfdf"/>
    <rect x="6" y="5" width="20" height="13" fill="#c0c0c0"/>
    <rect x="6" y="5" width="19" height="1" fill="#fff"/>
    <rect x="6" y="5" width="1" height="12" fill="#fff"/>
    <rect x="7" y="6" width="18" height="11" fill="#808080"/>
    <rect x="8" y="7" width="16" height="9" fill="#008080"/>
    <rect x="9" y="8" width="14" height="1" fill="#00a0a0"/>
    <rect x="9" y="8" width="1" height="7" fill="#00a0a0"/>
    <rect x="10" y="9" width="4" height="3" fill="#ffff00"/>
    <rect x="15" y="10" width="6" height="1" fill="#fff"/>
    <rect x="15" y="12" width="4" height="1" fill="#c0c0c0"/>
    <rect x="12" y="20" width="8" height="2" fill="#808080"/>
    <rect x="13" y="20" width="6" height="1" fill="#c0c0c0"/>
    <rect x="2" y="22" width="28" height="7" fill="#000"/>
    <rect x="3" y="23" width="26" height="5" fill="#c0c0c0"/>
    <rect x="3" y="23" width="25" height="1" fill="#fff"/>
    <rect x="3" y="23" width="1" height="4" fill="#fff"/>
    <rect x="5" y="25" width="8" height="1" fill="#808080"/>
    <rect x="18" y="25" width="6" height="2" fill="#808080"/>
    <rect x="19" y="25" width="4" height="1" fill="#000"/>
    <rect x="26" y="25" width="2" height="2" fill="#00cc00"/>
  `,

  // Internet Explorer 4.0 (classic blue globe + golden swooshing orbit + 'e')
  ie: `
    <rect x="11" y="4" width="10" height="2" fill="#003399"/>
    <rect x="8" y="6" width="16" height="2" fill="#0055cc"/>
    <rect x="6" y="8" width="20" height="14" fill="#0078d7"/>
    <rect x="8" y="22" width="16" height="3" fill="#0055cc"/>
    <rect x="11" y="25" width="10" height="2" fill="#003399"/>
    <!-- Globe meridians / highlight -->
    <rect x="10" y="7" width="5" height="3" fill="#4cc2ff"/>
    <rect x="8" y="10" width="4" height="4" fill="#4cc2ff"/>
    <rect x="16" y="8" width="6" height="4" fill="#0099ff"/>
    <!-- Bold white 'e' letterform -->
    <rect x="11" y="10" width="10" height="2" fill="#fff"/>
    <rect x="10" y="12" width="3" height="8" fill="#fff"/>
    <rect x="19" y="12" width="3" height="4" fill="#fff"/>
    <rect x="12" y="14" width="10" height="2" fill="#fff"/>
    <rect x="11" y="19" width="10" height="2" fill="#fff"/>
    <rect x="19" y="18" width="2" height="2" fill="#fff"/>
    <!-- Classic golden orbital ring swoosh -->
    <rect x="21" y="4" width="4" height="2" fill="#ffcc00"/>
    <rect x="24" y="6" width="3" height="3" fill="#ffcc00"/>
    <rect x="25" y="9" width="2" height="3" fill="#ff9900"/>
    <rect x="3" y="19" width="3" height="3" fill="#ffcc00"/>
    <rect x="5" y="22" width="4" height="2" fill="#ffcc00"/>
    <rect x="8" y="24" width="6" height="2" fill="#ffaa00"/>
    <rect x="14" y="25" width="5" height="2" fill="#ff9900"/>
    <rect x="2" y="16" width="3" height="3" fill="#ffe066"/>
  `,

  // RizkyBot Messenger 95 (retro speech bubble + green buddy / AI sparkle)
  messenger: `
    <rect x="3" y="4" width="20" height="14" fill="#000"/>
    <rect x="4" y="5" width="18" height="12" fill="#ffffe1"/>
    <rect x="4" y="5" width="17" height="1" fill="#fff"/>
    <rect x="6" y="18" width="5" height="3" fill="#000"/>
    <rect x="7" y="17" width="3" height="3" fill="#ffffe1"/>
    <rect x="6" y="21" width="2" height="2" fill="#000"/>
    <!-- Chat lines inside bubble -->
    <rect x="6" y="8" width="10" height="2" fill="#000080"/>
    <rect x="6" y="12" width="13" height="2" fill="#008080"/>
    <!-- Messenger buddy / AI orb bottom right -->
    <rect x="18" y="14" width="10" height="10" fill="#000"/>
    <rect x="19" y="15" width="8" height="8" fill="#00aa44"/>
    <rect x="20" y="16" width="2" height="2" fill="#80ffaa"/>
    <rect x="21" y="17" width="4" height="2" fill="#fff"/>
    <rect x="15" y="23" width="14" height="6" fill="#000"/>
    <rect x="16" y="24" width="12" height="4" fill="#0066cc"/>
    <rect x="17" y="25" width="10" height="1" fill="#66b3ff"/>
  `,

  // MS-DOS Prompt (classic Win95 console icon with C:\>)
  dos: `
    <rect x="2" y="4" width="28" height="24" fill="#000"/>
    <rect x="3" y="5" width="26" height="22" fill="#c0c0c0"/>
    <rect x="3" y="5" width="25" height="1" fill="#fff"/>
    <rect x="3" y="5" width="1" height="21" fill="#fff"/>
    <rect x="4" y="6" width="24" height="4" fill="#000080"/>
    <rect x="24" y="7" width="3" height="2" fill="#c0c0c0"/>
    <rect x="4" y="11" width="24" height="15" fill="#000"/>
    <!-- Pixel 'C:' -->
    <rect x="6" y="13" width="4" height="1" fill="#00ff66"/>
    <rect x="6" y="14" width="1" height="4" fill="#00ff66"/>
    <rect x="6" y="18" width="4" height="1" fill="#00ff66"/>
    <rect x="11" y="14" width="1" height="1" fill="#00ff66"/>
    <rect x="11" y="17" width="1" height="1" fill="#00ff66"/>
    <!-- Pixel '\' -->
    <rect x="13" y="13" width="1" height="2" fill="#00ff66"/>
    <rect x="14" y="15" width="1" height="2" fill="#00ff66"/>
    <rect x="15" y="17" width="1" height="2" fill="#00ff66"/>
    <!-- Pixel '>' -->
    <rect x="17" y="14" width="1" height="1" fill="#00ff66"/>
    <rect x="18" y="15" width="1" height="1" fill="#00ff66"/>
    <rect x="19" y="16" width="1" height="1" fill="#00ff66"/>
    <rect x="18" y="17" width="1" height="1" fill="#00ff66"/>
    <rect x="17" y="18" width="1" height="1" fill="#00ff66"/>
    <!-- Cursor block -->
    <rect x="21" y="18" width="4" height="1" fill="#fff"/>
    <rect x="6" y="21" width="12" height="1" fill="#008833"/>
  `,

  // Classic Win95 Notepad (cyan-bound spiral pad with lines)
  notepad: `
    <rect x="5" y="4" width="20" height="25" fill="#000"/>
    <rect x="6" y="5" width="18" height="23" fill="#fff"/>
    <rect x="6" y="5" width="18" height="4" fill="#008080"/>
    <rect x="6" y="5" width="18" height="1" fill="#00c0c0"/>
    <!-- Spiral rings -->
    <rect x="8" y="2" width="2" height="4" fill="#000"/>
    <rect x="12" y="2" width="2" height="4" fill="#000"/>
    <rect x="16" y="2" width="2" height="4" fill="#000"/>
    <rect x="20" y="2" width="2" height="4" fill="#000"/>
    <rect x="8" y="3" width="1" height="2" fill="#dfdfdf"/>
    <rect x="12" y="3" width="1" height="2" fill="#dfdfdf"/>
    <rect x="16" y="3" width="1" height="2" fill="#dfdfdf"/>
    <rect x="20" y="3" width="1" height="2" fill="#dfdfdf"/>
    <!-- Ruled text lines -->
    <rect x="8" y="11" width="13" height="1" fill="#000080"/>
    <rect x="8" y="14" width="14" height="1" fill="#808080"/>
    <rect x="8" y="17" width="12" height="1" fill="#808080"/>
    <rect x="8" y="20" width="14" height="1" fill="#808080"/>
    <rect x="8" y="23" width="9" height="1" fill="#808080"/>
    <!-- Diagonal yellow pencil on right -->
    <rect x="22" y="15" width="5" height="3" fill="#ffcc00"/>
    <rect x="20" y="18" width="5" height="3" fill="#ffcc00"/>
    <rect x="18" y="21" width="5" height="3" fill="#e6a800"/>
    <rect x="25" y="13" width="3" height="2" fill="#ff8080"/>
    <rect x="17" y="24" width="3" height="2" fill="#000"/>
  `,

  // Classic Win95 WordPad (rich document with blue 'W' badge)
  wordpad: `
    <rect x="4" y="3" width="22" height="26" fill="#000"/>
    <rect x="5" y="4" width="20" height="24" fill="#fff"/>
    <rect x="5" y="4" width="20" height="5" fill="#000080"/>
    <rect x="7" y="6" width="6" height="1" fill="#fff"/>
    <rect x="7" y="11" width="8" height="8" fill="#0066cc"/>
    <rect x="9" y="13" width="4" height="4" fill="#fff"/>
    <rect x="17" y="11" width="6" height="1" fill="#000"/>
    <rect x="17" y="14" width="6" height="1" fill="#808080"/>
    <rect x="17" y="17" width="5" height="1" fill="#808080"/>
    <rect x="7" y="21" width="16" height="1" fill="#808080"/>
    <rect x="7" y="24" width="12" height="1" fill="#808080"/>
  `,

  // Classic Win95 Yellow Manilla Folder
  folder: `
    <rect x="3" y="6" width="11" height="3" fill="#000"/>
    <rect x="4" y="7" width="9" height="2" fill="#ffdd55"/>
    <rect x="2" y="9" width="28" height="18" fill="#000"/>
    <rect x="3" y="10" width="26" height="16" fill="#ffcc33"/>
    <rect x="3" y="10" width="25" height="1" fill="#ffffaa"/>
    <rect x="3" y="10" width="1" height="15" fill="#ffffaa"/>
    <rect x="3" y="25" width="26" height="1" fill="#cc8800"/>
    <rect x="28" y="10" width="1" height="16" fill="#cc8800"/>
    <rect x="4" y="12" width="24" height="1" fill="#e6aa11"/>
  `,

  // Classic Win95 Open Folder
  'folder-open': `
    <rect x="3" y="6" width="10" height="3" fill="#000"/>
    <rect x="4" y="7" width="8" height="2" fill="#e6aa11"/>
    <rect x="2" y="9" width="23" height="16" fill="#000"/>
    <rect x="3" y="10" width="21" height="14" fill="#cc9900"/>
    <!-- Paper peeking out -->
    <rect x="6" y="11" width="15" height="6" fill="#fff"/>
    <rect x="8" y="13" width="10" height="1" fill="#808080"/>
    <!-- Tilted front flap -->
    <rect x="4" y="15" width="26" height="12" fill="#000"/>
    <rect x="5" y="16" width="24" height="10" fill="#ffcc33"/>
    <rect x="5" y="16" width="23" height="1" fill="#ffffaa"/>
    <rect x="5" y="25" width="24" height="1" fill="#b37700"/>
    <rect x="28" y="16" width="1" height="10" fill="#b37700"/>
  `,

  // Classic Retro PDF Certificate / Document
  pdf: `
    <rect x="5" y="2" width="17" height="28" fill="#000"/>
    <rect x="22" y="7" width="5" height="23" fill="#000"/>
    <rect x="22" y="3" width="1" height="4" fill="#000"/>
    <rect x="23" y="4" width="1" height="3" fill="#000"/>
    <rect x="24" y="5" width="1" height="2" fill="#000"/>
    <rect x="25" y="6" width="1" height="1" fill="#000"/>
    <rect x="6" y="3" width="15" height="26" fill="#fff"/>
    <rect x="21" y="8" width="5" height="21" fill="#fff"/>
    <rect x="21" y="4" width="4" height="4" fill="#dfdfdf"/>
    <rect x="21" y="7" width="5" height="1" fill="#808080"/>
    <!-- Bold red PDF ribbon -->
    <rect x="4" y="12" width="24" height="9" fill="#000"/>
    <rect x="5" y="13" width="22" height="7" fill="#cc0000"/>
    <rect x="5" y="13" width="22" height="1" fill="#ff4444"/>
    <!-- Crisp pixel 'P D F' -->
    <rect x="7" y="15" width="1" height="4" fill="#fff"/>
    <rect x="8" y="15" width="2" height="1" fill="#fff"/>
    <rect x="10" y="15" width="1" height="2" fill="#fff"/>
    <rect x="8" y="17" width="2" height="1" fill="#fff"/>
    <rect x="13" y="15" width="1" height="4" fill="#fff"/>
    <rect x="14" y="15" width="2" height="1" fill="#fff"/>
    <rect x="14" y="18" width="2" height="1" fill="#fff"/>
    <rect x="16" y="16" width="1" height="2" fill="#fff"/>
    <rect x="19" y="15" width="1" height="4" fill="#fff"/>
    <rect x="20" y="15" width="3" height="1" fill="#fff"/>
    <rect x="20" y="17" width="2" height="1" fill="#fff"/>
    <!-- Bottom doc lines -->
    <rect x="8" y="24" width="14" height="1" fill="#808080"/>
    <rect x="8" y="26" width="10" height="1" fill="#c0c0c0"/>
  `,

  // Retro Arcade Game / Ojek Rush 95 (green racer scooter + checkered flag)
  game: `
    <rect x="2" y="4" width="28" height="24" fill="#000"/>
    <rect x="3" y="5" width="26" height="22" fill="#1a1a2e"/>
    <!-- Checkered top header -->
    <rect x="3" y="5" width="3" height="3" fill="#fff"/>
    <rect x="9" y="5" width="3" height="3" fill="#fff"/>
    <rect x="15" y="5" width="3" height="3" fill="#fff"/>
    <rect x="21" y="5" width="3" height="3" fill="#fff"/>
    <rect x="27" y="5" width="2" height="3" fill="#fff"/>
    <rect x="6" y="8" width="3" height="3" fill="#fff"/>
    <rect x="12" y="8" width="3" height="3" fill="#fff"/>
    <rect x="18" y="8" width="3" height="3" fill="#fff"/>
    <rect x="24" y="8" width="3" height="3" fill="#fff"/>
    <!-- Road strip -->
    <rect x="3" y="19" width="26" height="8" fill="#505050"/>
    <rect x="6" y="23" width="4" height="1" fill="#ffcc00"/>
    <rect x="14" y="23" width="4" height="1" fill="#ffcc00"/>
    <rect x="22" y="23" width="4" height="1" fill="#ffcc00"/>
    <!-- Green Ojek Rider silhouette -->
    <rect x="13" y="12" width="6" height="4" fill="#00cc44"/>
    <rect x="14" y="13" width="4" height="2" fill="#000"/>
    <rect x="11" y="16" width="10" height="5" fill="#00aa33"/>
    <rect x="13" y="17" width="6" height="2" fill="#80ffaa"/>
    <rect x="14" y="21" width="4" height="4" fill="#000"/>
    <rect x="15" y="22" width="2" height="2" fill="#ffcc00"/>
  `,

  // Classic Win95 Minesweeper (bevel tile + spiky naval mine)
  minesweeper: `
    <rect x="2" y="2" width="28" height="28" fill="#000"/>
    <rect x="3" y="3" width="26" height="26" fill="#c0c0c0"/>
    <rect x="3" y="3" width="25" height="2" fill="#fff"/>
    <rect x="3" y="3" width="2" height="25" fill="#fff"/>
    <rect x="3" y="27" width="26" height="2" fill="#808080"/>
    <rect x="27" y="3" width="2" height="26" fill="#808080"/>
    <!-- Spikes -->
    <rect x="15" y="5" width="2" height="22" fill="#000"/>
    <rect x="5" y="15" width="22" height="2" fill="#000"/>
    <rect x="8" y="8" width="2" height="2" fill="#000"/>
    <rect x="22" y="8" width="2" height="2" fill="#000"/>
    <rect x="8" y="22" width="2" height="2" fill="#000"/>
    <rect x="22" y="22" width="2" height="2" fill="#000"/>
    <!-- Mine core -->
    <rect x="11" y="9" width="10" height="14" fill="#000"/>
    <rect x="9" y="11" width="14" height="10" fill="#000"/>
    <!-- Classic white pixel highlight -->
    <rect x="12" y="12" width="3" height="3" fill="#fff"/>
    <rect x="19" y="19" width="2" height="2" fill="#555"/>
    <!-- Red danger dot corner -->
    <rect x="22" y="6" width="3" height="3" fill="#ff0000"/>
  `,

  // 90s Guestbook (hardcover blue/gold book with bookmark & quill)
  guestbook: `
    <rect x="4" y="3" width="22" height="26" fill="#000"/>
    <rect x="5" y="4" width="4" height="24" fill="#000066"/>
    <rect x="9" y="4" width="16" height="24" fill="#004499"/>
    <rect x="9" y="4" width="1" height="24" fill="#66aaff"/>
    <!-- Gold title plate -->
    <rect x="12" y="8" width="10" height="7" fill="#ffcc00"/>
    <rect x="13" y="9" width="8" height="5" fill="#ffffcc"/>
    <rect x="14" y="11" width="6" height="1" fill="#000080"/>
    <rect x="15" y="13" width="4" height="1" fill="#808080"/>
    <!-- Red bookmark ribbon -->
    <rect x="15" y="25" width="4" height="5" fill="#cc0000"/>
    <rect x="16" y="28" width="2" height="2" fill="#008080"/>
    <!-- White pages edge -->
    <rect x="25" y="5" width="2" height="22" fill="#fff"/>
    <rect x="27" y="5" width="1" height="22" fill="#000"/>
  `,

  // 3D Isometric Room (crisp retro pixel isometric cube with lit faces)
  room3d: `
    <!-- Top diamond face -->
    <polygon points="16,3 28,9 16,15 4,9" fill="#66e0e0" stroke="#000" stroke-width="1.5"/>
    <!-- Left wall face -->
    <polygon points="4,9 16,15 16,28 4,22" fill="#2288aa" stroke="#000" stroke-width="1.5"/>
    <!-- Right wall face -->
    <polygon points="28,9 16,15 16,28 28,22" fill="#0d4f73" stroke="#000" stroke-width="1.5"/>
    <!-- Glowing desk/window pixel accents -->
    <rect x="13" y="7" width="6" height="3" fill="#ffff66"/>
    <rect x="7" y="14" width="5" height="4" fill="#aaffff"/>
    <rect x="20" y="16" width="5" height="4" fill="#ffcc33"/>
  `,

  // Display Properties (CRT with colorful wallpaper + paintbrush)
  display: `
    <rect x="3" y="4" width="26" height="20" fill="#000"/>
    <rect x="4" y="5" width="24" height="18" fill="#c0c0c0"/>
    <rect x="4" y="5" width="23" height="1" fill="#fff"/>
    <rect x="4" y="5" width="1" height="17" fill="#fff"/>
    <rect x="6" y="7" width="20" height="14" fill="#808080"/>
    <rect x="7" y="8" width="18" height="12" fill="#008080"/>
    <!-- Retro color palette stripes inside screen -->
    <rect x="8" y="9" width="5" height="5" fill="#ff3366"/>
    <rect x="13" y="9" width="5" height="5" fill="#ffcc00"/>
    <rect x="18" y="9" width="6" height="5" fill="#33ccff"/>
    <rect x="8" y="14" width="8" height="5" fill="#00cc66"/>
    <rect x="16" y="14" width="8" height="5" fill="#000080"/>
    <!-- Stand -->
    <rect x="12" y="24" width="8" height="3" fill="#808080"/>
    <rect x="8" y="27" width="16" height="2" fill="#000"/>
    <rect x="9" y="26" width="14" height="2" fill="#c0c0c0"/>
  `,

  // Recycle Bin (Empty)
  'recycle-empty': `
    <rect x="7" y="5" width="18" height="3" fill="#000"/>
    <rect x="8" y="6" width="16" height="2" fill="#dfdfdf"/>
    <rect x="8" y="8" width="16" height="20" fill="#000"/>
    <rect x="9" y="9" width="14" height="18" fill="#c0c0c0"/>
    <rect x="9" y="9" width="2" height="18" fill="#fff"/>
    <rect x="21" y="9" width="2" height="18" fill="#808080"/>
    <!-- Mesh lines -->
    <rect x="12" y="10" width="1" height="16" fill="#808080"/>
    <rect x="19" y="10" width="1" height="16" fill="#808080"/>
    <!-- Green recycle emblem -->
    <rect x="14" y="14" width="4" height="2" fill="#009900"/>
    <rect x="13" y="16" width="2" height="4" fill="#00aa00"/>
    <rect x="17" y="16" width="2" height="4" fill="#00aa00"/>
    <rect x="14" y="19" width="4" height="2" fill="#007700"/>
  `,

  // Recycle Bin (Full — overflowing crumpled papers)
  'recycle-full': `
    <!-- Crumpled papers sticking out of top -->
    <rect x="9" y="2" width="6" height="5" fill="#000"/>
    <rect x="10" y="3" width="4" height="4" fill="#fff"/>
    <rect x="15" y="1" width="7" height="6" fill="#000"/>
    <rect x="16" y="2" width="5" height="5" fill="#ffff99"/>
    <rect x="17" y="4" width="3" height="1" fill="#808080"/>
    <rect x="12" y="4" width="5" height="4" fill="#dfdfdf"/>
    <!-- Bin body -->
    <rect x="7" y="7" width="18" height="3" fill="#000"/>
    <rect x="8" y="8" width="16" height="2" fill="#dfdfdf"/>
    <rect x="8" y="10" width="16" height="18" fill="#000"/>
    <rect x="9" y="11" width="14" height="16" fill="#c0c0c0"/>
    <rect x="9" y="11" width="2" height="16" fill="#fff"/>
    <rect x="21" y="11" width="2" height="16" fill="#808080"/>
    <rect x="12" y="12" width="1" height="14" fill="#808080"/>
    <rect x="19" y="12" width="1" height="14" fill="#808080"/>
    <!-- Green recycle emblem -->
    <rect x="14" y="16" width="4" height="2" fill="#009900"/>
    <rect x="13" y="18" width="2" height="4" fill="#00aa00"/>
    <rect x="17" y="18" width="2" height="4" fill="#00aa00"/>
    <rect x="14" y="21" width="4" height="2" fill="#007700"/>
  `,

  // Iconic Windows 95 4-Pane Flying Flag Logo
  start: `
    <!-- Speed trail pixels -->
    <rect x="2" y="8" width="2" height="2" fill="#000"/>
    <rect x="5" y="7" width="2" height="2" fill="#ff0000"/>
    <rect x="2" y="13" width="2" height="2" fill="#000"/>
    <rect x="5" y="12" width="2" height="2" fill="#0080ff"/>
    <rect x="2" y="18" width="2" height="2" fill="#000"/>
    <rect x="5" y="18" width="2" height="2" fill="#000"/>
    <!-- Flag outline -->
    <rect x="9" y="5" width="20" height="20" fill="#000"/>
    <!-- Top-left Red pane -->
    <rect x="10" y="6" width="8" height="8" fill="#ff2a00"/>
    <rect x="10" y="6" width="3" height="2" fill="#ff7755"/>
    <!-- Top-right Green pane -->
    <rect x="20" y="7" width="8" height="8" fill="#00b020"/>
    <rect x="20" y="7" width="3" height="2" fill="#66e077"/>
    <!-- Bottom-left Blue pane -->
    <rect x="10" y="16" width="8" height="8" fill="#0078e7"/>
    <rect x="10" y="16" width="3" height="2" fill="#66b8ff"/>
    <!-- Bottom-right Yellow pane -->
    <rect x="20" y="17" width="8" height="7" fill="#ffcc00"/>
    <rect x="20" y="17" width="3" height="2" fill="#ffee77"/>
  `,

  // Sound On (classic speaker + blue sound waves)
  'sound-on': `
    <rect x="4" y="12" width="6" height="8" fill="#000"/>
    <rect x="5" y="13" width="4" height="6" fill="#e6c840"/>
    <polygon points="10,12 18,6 18,26 10,20" fill="#dfdfdf" stroke="#000" stroke-width="1.5"/>
    <rect x="12" y="12" width="4" height="8" fill="#c0c0c0"/>
    <!-- Waves -->
    <rect x="21" y="12" width="2" height="8" fill="#0000cc"/>
    <rect x="24" y="9" width="2" height="14" fill="#0066ff"/>
    <rect x="27" y="6" width="2" height="20" fill="#0099ff"/>
  `,

  // Sound Off (classic speaker + red X)
  'sound-off': `
    <rect x="3" y="12" width="6" height="8" fill="#000"/>
    <rect x="4" y="13" width="4" height="6" fill="#c0c0c0"/>
    <polygon points="9,12 17,6 17,26 9,20" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>
    <!-- Red mute X -->
    <rect x="20" y="11" width="2" height="2" fill="#cc0000"/>
    <rect x="22" y="13" width="2" height="2" fill="#cc0000"/>
    <rect x="24" y="15" width="2" height="2" fill="#cc0000"/>
    <rect x="26" y="17" width="2" height="2" fill="#cc0000"/>
    <rect x="28" y="19" width="2" height="2" fill="#cc0000"/>
    <rect x="28" y="11" width="2" height="2" fill="#cc0000"/>
    <rect x="26" y="13" width="2" height="2" fill="#cc0000"/>
    <rect x="22" y="17" width="2" height="2" fill="#cc0000"/>
    <rect x="20" y="19" width="2" height="2" fill="#cc0000"/>
  `,

  // Classic Win95 Info Dialog Icon
  info: `
    <rect x="10" y="3" width="12" height="2" fill="#000"/>
    <rect x="6" y="5" width="20" height="2" fill="#000"/>
    <rect x="4" y="7" width="24" height="18" fill="#000"/>
    <rect x="6" y="25" width="20" height="2" fill="#000"/>
    <rect x="10" y="27" width="12" height="2" fill="#000"/>
    <rect x="10" y="5" width="12" height="22" fill="#fff"/>
    <rect x="6" y="7" width="20" height="18" fill="#fff"/>
    <rect x="14" y="8" width="4" height="4" fill="#0000cc"/>
    <rect x="14" y="14" width="4" height="10" fill="#0000cc"/>
    <rect x="12" y="14" width="2" height="2" fill="#0000cc"/>
    <rect x="12" y="22" width="8" height="2" fill="#0000cc"/>
  `,

  // Classic Win95 Warning Triangle
  warning: `
    <polygon points="16,3 30,28 2,28" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <rect x="14" y="10" width="4" height="10" fill="#000"/>
    <rect x="14" y="22" width="4" height="4" fill="#000"/>
  `,

  // Classic Win95 Critical Error Circle
  error: `
    <rect x="10" y="3" width="12" height="2" fill="#000"/>
    <rect x="6" y="5" width="20" height="2" fill="#000"/>
    <rect x="4" y="7" width="24" height="18" fill="#000"/>
    <rect x="6" y="25" width="20" height="2" fill="#000"/>
    <rect x="10" y="27" width="12" height="2" fill="#000"/>
    <rect x="10" y="5" width="12" height="22" fill="#dd0000"/>
    <rect x="6" y="7" width="20" height="18" fill="#dd0000"/>
    <rect x="10" y="10" width="3" height="3" fill="#fff"/>
    <rect x="13" y="13" width="3" height="3" fill="#fff"/>
    <rect x="16" y="16" width="3" height="3" fill="#fff"/>
    <rect x="19" y="19" width="3" height="3" fill="#fff"/>
    <rect x="19" y="10" width="3" height="3" fill="#fff"/>
    <rect x="16" y="13" width="3" height="3" fill="#fff"/>
    <rect x="13" y="16" width="3" height="3" fill="#fff"/>
    <rect x="10" y="19" width="3" height="3" fill="#fff"/>
  `,

  // Generic Document File
  file: `
    <rect x="5" y="2" width="16" height="28" fill="#000"/>
    <rect x="21" y="7" width="6" height="23" fill="#000"/>
    <rect x="21" y="3" width="1" height="4" fill="#000"/>
    <rect x="22" y="4" width="1" height="3" fill="#000"/>
    <rect x="23" y="5" width="1" height="2" fill="#000"/>
    <rect x="24" y="6" width="1" height="1" fill="#000"/>
    <rect x="6" y="3" width="14" height="26" fill="#fff"/>
    <rect x="20" y="8" width="6" height="21" fill="#fff"/>
    <rect x="20" y="4" width="4" height="4" fill="#dfdfdf"/>
    <rect x="20" y="7" width="6" height="1" fill="#808080"/>
    <rect x="9" y="10" width="10" height="2" fill="#000080"/>
    <rect x="9" y="14" width="14" height="1" fill="#808080"/>
    <rect x="9" y="17" width="14" height="1" fill="#808080"/>
    <rect x="9" y="20" width="12" height="1" fill="#808080"/>
    <rect x="9" y="23" width="9" height="1" fill="#808080"/>
  `,

  // Hyperlink / Shortcut
  link: `
    <rect x="7" y="4" width="18" height="18" fill="#000"/>
    <rect x="8" y="5" width="16" height="16" fill="#3399ff"/>
    <rect x="10" y="7" width="12" height="2" fill="#fff"/>
    <rect x="10" y="11" width="12" height="2" fill="#99ddff"/>
    <rect x="14" y="5" width="2" height="16" fill="#0055aa"/>
    <rect x="8" y="13" width="16" height="2" fill="#0055aa"/>
    <!-- Classic Win95 Shortcut Arrow Box -->
    <rect x="3" y="18" width="11" height="11" fill="#000"/>
    <rect x="4" y="19" width="9" height="9" fill="#fff"/>
    <rect x="7" y="21" width="4" height="1" fill="#000"/>
    <rect x="10" y="22" width="1" height="3" fill="#000"/>
    <rect x="8" y="22" width="2" height="2" fill="#000"/>
    <rect x="6" y="24" width="2" height="2" fill="#000"/>
  `,

  // Retro AI Co-Processor Chip
  ai: `
    <!-- Gold pins -->
    <rect x="9" y="2" width="2" height="4" fill="#ffcc00"/>
    <rect x="15" y="2" width="2" height="4" fill="#ffcc00"/>
    <rect x="21" y="2" width="2" height="4" fill="#ffcc00"/>
    <rect x="9" y="26" width="2" height="4" fill="#ffcc00"/>
    <rect x="15" y="26" width="2" height="4" fill="#ffcc00"/>
    <rect x="21" y="26" width="2" height="4" fill="#ffcc00"/>
    <rect x="2" y="9" width="4" height="2" fill="#ffcc00"/>
    <rect x="2" y="15" width="4" height="2" fill="#ffcc00"/>
    <rect x="2" y="21" width="4" height="2" fill="#ffcc00"/>
    <rect x="26" y="9" width="4" height="2" fill="#ffcc00"/>
    <rect x="26" y="15" width="4" height="2" fill="#ffcc00"/>
    <rect x="26" y="21" width="4" height="2" fill="#ffcc00"/>
    <!-- Chip body -->
    <rect x="6" y="6" width="20" height="20" fill="#000"/>
    <rect x="7" y="7" width="18" height="18" fill="#2c3e50"/>
    <rect x="9" y="9" width="14" height="14" fill="#001a22"/>
    <!-- Glowing AI text -->
    <rect x="11" y="12" width="4" height="1" fill="#00ffaa"/>
    <rect x="11" y="13" width="1" height="7" fill="#00ffaa"/>
    <rect x="14" y="13" width="1" height="7" fill="#00ffaa"/>
    <rect x="12" y="16" width="2" height="1" fill="#00ffaa"/>
    <rect x="18" y="12" width="3" height="1" fill="#00e5ff"/>
    <rect x="19" y="13" width="1" height="6" fill="#00e5ff"/>
    <rect x="18" y="19" width="3" height="1" fill="#00e5ff"/>
  `,

  // Shut Down Icon (monitor with power symbol)
  shutdown: `
    <rect x="4" y="3" width="24" height="18" fill="#000"/>
    <rect x="5" y="4" width="22" height="16" fill="#c0c0c0"/>
    <rect x="7" y="6" width="18" height="12" fill="#000044"/>
    <!-- Red power icon -->
    <rect x="15" y="7" width="2" height="5" fill="#ff3333"/>
    <rect x="11" y="9" width="2" height="6" fill="#ff3333"/>
    <rect x="19" y="9" width="2" height="6" fill="#ff3333"/>
    <rect x="13" y="14" width="6" height="2" fill="#ff3333"/>
    <!-- Base -->
    <rect x="12" y="21" width="8" height="3" fill="#808080"/>
    <rect x="7" y="24" width="18" height="4" fill="#000"/>
    <rect x="8" y="25" width="16" height="2" fill="#c0c0c0"/>
  `,

  // Programs Folder (Start Menu)
  programs: `
    <rect x="3" y="8" width="10" height="3" fill="#000"/>
    <rect x="4" y="9" width="8" height="2" fill="#ffdd55"/>
    <rect x="2" y="11" width="24" height="16" fill="#000"/>
    <rect x="3" y="12" width="22" height="14" fill="#ffcc33"/>
    <rect x="3" y="12" width="21" height="1" fill="#ffffaa"/>
    <!-- Mini app window popping out -->
    <rect x="12" y="4" width="17" height="13" fill="#000"/>
    <rect x="13" y="5" width="15" height="11" fill="#fff"/>
    <rect x="13" y="5" width="15" height="3" fill="#000080"/>
    <rect x="15" y="10" width="11" height="1" fill="#008080"/>
    <rect x="15" y="13" width="8" height="1" fill="#808080"/>
  `,

  // Documents Folder (Start Menu)
  documents: `
    <rect x="3" y="9" width="10" height="3" fill="#000"/>
    <rect x="4" y="10" width="8" height="2" fill="#ffdd55"/>
    <rect x="2" y="12" width="25" height="15" fill="#000"/>
    <rect x="3" y="13" width="23" height="13" fill="#ffcc33"/>
    <!-- Crisp white document sheets peeking out -->
    <rect x="9" y="4" width="15" height="13" fill="#000"/>
    <rect x="10" y="5" width="13" height="11" fill="#fff"/>
    <rect x="12" y="7" width="9" height="1" fill="#cc0000"/>
    <rect x="12" y="10" width="9" height="1" fill="#000080"/>
    <rect x="12" y="13" width="6" height="1" fill="#808080"/>
  `,

  // Settings / Control Panel (Start Menu)
  settings: `
    <rect x="3" y="9" width="10" height="3" fill="#000"/>
    <rect x="4" y="10" width="8" height="2" fill="#ffdd55"/>
    <rect x="2" y="12" width="24" height="15" fill="#000"/>
    <rect x="3" y="13" width="22" height="13" fill="#ffcc33"/>
    <!-- Metallic pixel gear overlay -->
    <rect x="18" y="6" width="4" height="16" fill="#000"/>
    <rect x="12" y="12" width="16" height="4" fill="#000"/>
    <rect x="14" y="8" width="12" height="12" fill="#000"/>
    <rect x="15" y="9" width="10" height="10" fill="#dfdfdf"/>
    <rect x="19" y="7" width="2" height="14" fill="#dfdfdf"/>
    <rect x="13" y="13" width="14" height="2" fill="#dfdfdf"/>
    <rect x="17" y="11" width="6" height="6" fill="#008080"/>
    <rect x="18" y="12" width="4" height="4" fill="#000080"/>
  `,

  // Bonus System Tray CRT Monitor Toggle Icon
  crt: `
    <rect x="3" y="5" width="26" height="19" fill="#000"/>
    <rect x="4" y="6" width="24" height="17" fill="#c0c0c0"/>
    <rect x="6" y="8" width="20" height="13" fill="#002211"/>
    <rect x="7" y="10" width="18" height="1" fill="#00ff66"/>
    <rect x="7" y="13" width="18" height="1" fill="#00cc44"/>
    <rect x="7" y="16" width="18" height="1" fill="#00ff66"/>
    <rect x="7" y="19" width="18" height="1" fill="#00cc44"/>
    <rect x="11" y="24" width="10" height="3" fill="#808080"/>
    <rect x="8" y="26" width="16" height="2" fill="#000"/>
  `,
};

const ALIASES = {
  explorer: 'computer',
  browser: 'ie',
  terminal: 'dos',
  'ojek-rush': 'game',
  'recycle-bin': 'recycle-full',
  'pdf-viewer': 'pdf',
  cert: 'pdf',
  doc: 'notepad',
  txt: 'notepad',
  exe: 'programs',
};

export const ICON_KEYS = Object.keys(ICONS);

/**
 * Return a crisp retro Windows 95 inline SVG string for the given icon key.
 * @param {string} key
 * @param {number} [size=32]
 * @returns {string}
 */
export function getIconSVG(key, size = 32) {
  const safeSize = Number(size) > 0 ? Number(size) : 32;
  const normalized = typeof key === 'string' ? key.trim().toLowerCase() : 'file';
  const resolved = ICONS[normalized] ? normalized : (ALIASES[normalized] || 'file');
  const body = ICONS[resolved] || ICONS.file;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${safeSize}" height="${safeSize}" shape-rendering="crispEdges" aria-hidden="true" style="display:block;flex-shrink:0;image-rendering:pixelated;">${body}</svg>`;
}
