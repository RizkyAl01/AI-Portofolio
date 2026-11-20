/**
 * RizkyOS 95 — Rubik Solver 95 (Mathematical 3x3x3 Cube Engine, Validator & 7-Stage Solver)
 * Authentic Windows 95 utility craft — strict border-radius: 0, zero AI-slop.
 *
 * Sticker Layout (54 indices: U=0..8, R=9..17, F=18..26, D=27..35, L=36..44, B=45..53)
 * Standard Western Color Scheme:
 *   U = White ('W'), R = Red ('R'), F = Green ('G'),
 *   D = Yellow ('Y'), L = Orange ('O'), B = Blue ('B')
 */

import { sound } from '../sound.js';

// ============================================================================
// 1. CONSTANTS, 3D GEOMETRY & EXACT 54-STICKER MOVE ENGINE
// ============================================================================

const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];

const FACE_OFFSET = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 };

const FACE_DEFAULT_COLOR = { U: 'W', R: 'R', F: 'G', D: 'Y', L: 'O', B: 'B' };

const COLOR_META = {
  W: { code: 'W', name: 'Putih', short: 'P', hex: '#f4f4ee', shade: '#dcdcd2', border: '#7c7c74', text: '#111111' },
  Y: { code: 'Y', name: 'Kuning', short: 'K', hex: '#e5c518', shade: '#c4a40e', border: '#7a6500', text: '#111111' },
  G: { code: 'G', name: 'Hijau', short: 'H', hex: '#00913d', shade: '#007330', border: '#00471d', text: '#ffffff' },
  B: { code: 'B', name: 'Biru', short: 'B', hex: '#0048b0', shade: '#00378a', border: '#002157', text: '#ffffff' },
  R: { code: 'R', name: 'Merah', short: 'M', hex: '#c62034', shade: '#9e1627', border: '#660c17', text: '#ffffff' },
  O: { code: 'O', name: 'Oranye', short: 'O', hex: '#e86a17', shade: '#c4540c', border: '#7d3404', text: '#ffffff' },
};

const COLOR_ORDER = ['W', 'Y', 'G', 'B', 'R', 'O'];

const FACE_NORMALS = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

// Local basis (rightVec, downVec) when looking directly at each face (row 0..2, col 0..2)
const FACE_BASIS = {
  U: { right: [1, 0, 0], down: [0, 0, 1] },
  R: { right: [0, 0, -1], down: [0, -1, 0] },
  F: { right: [1, 0, 0], down: [0, -1, 0] },
  D: { right: [1, 0, 0], down: [0, 0, -1] },
  L: { right: [0, 0, 1], down: [0, -1, 0] },
  B: { right: [-1, 0, 0], down: [0, -1, 0] },
};

function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Exact 90-degree clockwise rotation around outward unit axis `n` (right-handed -90 deg).
 * Formula: v' = (v . n) * n + (v x n)
 */
function rotCW90(v, n) {
  const d = dot3(v, n);
  const c = cross3(v, n);
  return [
    Math.round(d * n[0] + c[0]),
    Math.round(d * n[1] + c[1]),
    Math.round(d * n[2] + c[2]),
  ];
}

// Precompute 3D metadata for every sticker 0..53
const STICKER_GEO = [];
const GEO_KEY_TO_INDEX = new Map();

for (const face of FACES) {
  const n = FACE_NORMALS[face];
  const { right, down } = FACE_BASIS[face];
  const base = FACE_OFFSET[face];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = base + row * 3 + col;
      const dx = col - 1;
      const dy = row - 1;
      const pos = [
        n[0] + dx * right[0] + dy * down[0],
        n[1] + dx * right[1] + dy * down[1],
        n[2] + dx * right[2] + dy * down[2],
      ];
      const key = `${pos[0]},${pos[1]},${pos[2]}|${n[0]},${n[1]},${n[2]}`;
      STICKER_GEO[idx] = { idx, face, row, col, pos, normal: n, right, down };
      GEO_KEY_TO_INDEX.set(key, idx);
    }
  }
}

// Derive exact 54-sticker permutations for clockwise turns U, R, F, D, L, B from 3D geometry
const BASE_MOVE_PERM = {};
for (const face of FACES) {
  const n = FACE_NORMALS[face];
  const perm = new Int8Array(54);
  for (let i = 0; i < 54; i++) {
    const g = STICKER_GEO[i];
    if (dot3(g.pos, n) === 1) {
      const np = rotCW90(g.pos, n);
      const nn = rotCW90(g.normal, n);
      const dst = GEO_KEY_TO_INDEX.get(`${np[0]},${np[1]},${np[2]}|${nn[0]},${nn[1]},${nn[2]}`);
      perm[dst] = i; // next[dst] = prev[i]
    } else {
      perm[i] = i;
    }
  }
  BASE_MOVE_PERM[face] = perm;
}

function composePerm(p1, p2) {
  // Applies p1 first, then p2: out[i] = p1[p2[i]]
  const out = new Int8Array(54);
  for (let i = 0; i < 54; i++) {
    out[i] = p1[p2[i]];
  }
  return out;
}

const MOVE_PERM = {};
for (const face of FACES) {
  const p1 = BASE_MOVE_PERM[face];
  const p2 = composePerm(p1, p1);
  const p3 = composePerm(p2, p1);
  MOVE_PERM[face] = p1;
  MOVE_PERM[`${face}2`] = p2;
  MOVE_PERM[`${face}'`] = p3;
}

const ALL_MOVES = Object.keys(MOVE_PERM);

const MOVE_LABELS_ID = {
  U: 'Putar Atas (U) searah jarum jam',
  "U'": "Putar Atas (U') berlawanan jarum jam",
  U2: 'Putar Atas (U2) 180°',
  D: 'Putar Bawah (D) searah jarum jam',
  "D'": "Putar Bawah (D') berlawanan jarum jam",
  D2: 'Putar Bawah (D2) 180°',
  R: 'Putar Kanan (R) searah jarum jam',
  "R'": "Putar Kanan (R') berlawanan jarum jam",
  R2: 'Putar Kanan (R2) 180°',
  L: 'Putar Kiri (L) searah jarum jam',
  "L'": "Putar Kiri (L') berlawanan jarum jam",
  L2: 'Putar Kiri (L2) 180°',
  F: 'Putar Depan (F) searah jarum jam',
  "F'": "Putar Depan (F') berlawanan jarum jam",
  F2: 'Putar Depan (F2) 180°',
  B: 'Putar Belakang (B) searah jarum jam',
  "B'": "Putar Belakang (B') berlawanan jarum jam",
  B2: 'Putar Belakang (B2) 180°',
};

export function createSolvedCube() {
  const state = new Array(54);
  for (const face of FACES) {
    const off = FACE_OFFSET[face];
    const col = FACE_DEFAULT_COLOR[face];
    for (let i = 0; i < 9; i++) state[off + i] = col;
  }
  return state;
}

export function cloneCube(state) {
  return state.slice();
}

export function applyMove(state, move) {
  const perm = MOVE_PERM[move];
  if (!perm) throw new Error(`Invalid Rubik move: ${move}`);
  const next = new Array(54);
  for (let i = 0; i < 54; i++) {
    next[i] = state[perm[i]];
  }
  return next;
}

export function applyMoves(state, moves) {
  let cur = state.slice();
  const list = typeof moves === 'string'
    ? moves.trim().split(/\s+/).filter(Boolean)
    : moves;
  for (const m of list) {
    cur = applyMove(cur, m);
  }
  return cur;
}

export function invertMove(move) {
  if (move.endsWith("'")) return move[0];
  if (move.endsWith('2')) return move;
  return `${move}'`;
}

export function isSolved(state) {
  if (!Array.isArray(state) || state.length !== 54) return false;
  for (const face of FACES) {
    const off = FACE_OFFSET[face];
    const center = state[off + 4];
    for (let i = 0; i < 9; i++) {
      if (state[off + i] !== center) return false;
    }
  }
  return true;
}

export function scrambleCube(length = 20, rng = Math.random) {
  const OPP = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F' };
  const suffixes = ['', "'", '2'];
  const moves = [];
  let lastFace = null;
  let prevFace = null;
  for (let i = 0; i < length; i++) {
    const choices = FACES.filter((f) => {
      if (f === lastFace) return false;
      if (prevFace && f === prevFace && lastFace === OPP[f]) return false;
      return true;
    });
    const face = choices[Math.floor(rng() * choices.length)];
    const suf = suffixes[Math.floor(rng() * suffixes.length)];
    moves.push(face + suf);
    prevFace = lastFace;
    lastFace = face;
  }
  return { state: applyMoves(createSolvedCube(), moves), moves };
}

// ============================================================================
// 2. MATHEMATICAL CUBE STATE VALIDATOR
// ============================================================================

// 8 corners in exact clockwise cyclic order starting from U/D facelet
const CORNER_SLOTS = [
  { name: 'UFR', faces: ['U', 'R', 'F'], idx: [8, 9, 20], solved: ['W', 'R', 'G'] },
  { name: 'UFL', faces: ['U', 'F', 'L'], idx: [6, 18, 38], solved: ['W', 'G', 'O'] },
  { name: 'UBL', faces: ['U', 'L', 'B'], idx: [0, 36, 47], solved: ['W', 'O', 'B'] },
  { name: 'UBR', faces: ['U', 'B', 'R'], idx: [2, 45, 11], solved: ['W', 'B', 'R'] },
  { name: 'DFR', faces: ['D', 'F', 'R'], idx: [29, 26, 15], solved: ['Y', 'G', 'R'] },
  { name: 'DFL', faces: ['D', 'L', 'F'], idx: [27, 44, 24], solved: ['Y', 'O', 'G'] },
  { name: 'DBL', faces: ['D', 'B', 'L'], idx: [33, 53, 42], solved: ['Y', 'B', 'O'] },
  { name: 'DBR', faces: ['D', 'R', 'B'], idx: [35, 17, 51], solved: ['Y', 'R', 'B'] },
];

// 12 edges with primary facelet first (U/D for U/D edges, F/B for E-layer edges)
const EDGE_SLOTS = [
  { name: 'UF', idx: [7, 19], solved: ['W', 'G'] },
  { name: 'UR', idx: [5, 10], solved: ['W', 'R'] },
  { name: 'UB', idx: [1, 46], solved: ['W', 'B'] },
  { name: 'UL', idx: [3, 37], solved: ['W', 'O'] },
  { name: 'DF', idx: [28, 25], solved: ['Y', 'G'] },
  { name: 'DR', idx: [32, 16], solved: ['Y', 'R'] },
  { name: 'DB', idx: [34, 52], solved: ['Y', 'B'] },
  { name: 'DL', idx: [30, 43], solved: ['Y', 'O'] },
  { name: 'FR', idx: [23, 12], solved: ['G', 'R'] },
  { name: 'FL', idx: [21, 41], solved: ['G', 'O'] },
  { name: 'BL', idx: [50, 39], solved: ['B', 'O'] },
  { name: 'BR', idx: [48, 14], solved: ['B', 'R'] },
];

function permutationParity(perm) {
  let inv = 0;
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) {
      if (perm[i] > perm[j]) inv++;
    }
  }
  return inv % 2;
}

/**
 * Validate any 54-sticker cube state using the Fundamental Theorem of Cube Theory.
 * Returns { valid: true } or { valid: false, code, message }.
 */
export function validateCube(state) {
  if (!Array.isArray(state) || state.length !== 54) {
    return { valid: false, code: 'LENGTH', message: 'Data kubus tidak valid (harus 54 stiker).' };
  }

  // 1. Valid colors & color counts
  const counts = { W: 0, Y: 0, G: 0, B: 0, R: 0, O: 0 };
  for (let i = 0; i < 54; i++) {
    const c = state[i];
    if (!COLOR_META[c]) {
      return { valid: false, code: 'UNKNOWN_COLOR', message: `Warna stiker tidak dikenal di indeks ${i}.` };
    }
    counts[c]++;
  }

  const badCounts = COLOR_ORDER
    .filter((c) => counts[c] !== 9)
    .map((c) => `${COLOR_META[c].name} (${counts[c]})`);
  if (badCounts.length > 0) {
    return {
      valid: false,
      code: 'COLOR_COUNT',
      message: `Jumlah stiker tidak seimbang: ${badCounts.join(', ')}. Setiap warna harus tepat 9 stiker.`,
    };
  }

  // 2. Distinct centers matching standard orientation
  const centerColors = FACES.map((f) => state[FACE_OFFSET[f] + 4]);
  if (new Set(centerColors).size !== 6) {
    return {
      valid: false,
      code: 'CENTERS',
      message: 'Keenam stiker tengah (center) harus memiliki 6 warna yang berbeda.',
    };
  }
  for (const f of FACES) {
    const actual = state[FACE_OFFSET[f] + 4];
    const expected = FACE_DEFAULT_COLOR[f];
    if (actual !== expected) {
      return {
        valid: false,
        code: 'CENTER_SCHEME',
        message: `Stiker tengah sisi ${f} harus berwarna ${COLOR_META[expected].name} (skema standar Barat).`,
      };
    }
  }

  // 3. Validate all 8 physical corners + corner orientation parity
  const cornerPerm = new Array(8);
  const cornerSeen = new Array(8).fill(false);
  let cornerOriSum = 0;

  for (let s = 0; s < 8; s++) {
    const [i0, i1, i2] = CORNER_SLOTS[s].idx;
    const cols = [state[i0], state[i1], state[i2]];
    let matchedId = -1;
    let matchedOri = -1;

    for (let cid = 0; cid < 8; cid++) {
      const target = CORNER_SLOTS[cid].solved;
      for (let ori = 0; ori < 3; ori++) {
        // ori = position of target[0] (W/Y) inside cols[0..2]
        if (
          cols[ori] === target[0] &&
          cols[(ori + 1) % 3] === target[1] &&
          cols[(ori + 2) % 3] === target[2]
        ) {
          matchedId = cid;
          matchedOri = ori;
          break;
        }
      }
      if (matchedId !== -1) break;
    }

    if (matchedId === -1) {
      const label = cols.map((c) => COLOR_META[c].name).join('-');
      return {
        valid: false,
        code: 'INVALID_CORNER',
        message: `Sudut ${CORNER_SLOTS[s].name} (${label}) tidak mungkin ada secara fisik (kombinasi atau arah warna salah).`,
      };
    }
    if (cornerSeen[matchedId]) {
      return {
        valid: false,
        code: 'DUP_CORNER',
        message: `Keping sudut ${CORNER_SLOTS[matchedId].name} muncul ganda! Periksa ulang input warna sudut.`,
      };
    }
    cornerSeen[matchedId] = true;
    cornerPerm[s] = matchedId;
    cornerOriSum += matchedOri;
  }

  // 4. Validate all 12 physical edges + edge orientation parity
  const edgePerm = new Array(12);
  const edgeSeen = new Array(12).fill(false);
  let edgeOriSum = 0;

  for (let s = 0; s < 12; s++) {
    const [i0, i1] = EDGE_SLOTS[s].idx;
    const c0 = state[i0];
    const c1 = state[i1];
    let matchedId = -1;
    let matchedOri = -1;

    for (let eid = 0; eid < 12; eid++) {
      const [t0, t1] = EDGE_SLOTS[eid].solved;
      if (c0 === t0 && c1 === t1) {
        matchedId = eid;
        matchedOri = 0;
        break;
      }
      if (c0 === t1 && c1 === t0) {
        matchedId = eid;
        matchedOri = 1;
        break;
      }
    }

    if (matchedId === -1) {
      return {
        valid: false,
        code: 'INVALID_EDGE',
        message: `Tepi ${EDGE_SLOTS[s].name} (${COLOR_META[c0].name}-${COLOR_META[c1].name}) tidak mungkin ada secara fisik.`,
      };
    }
    if (edgeSeen[matchedId]) {
      return {
        valid: false,
        code: 'DUP_EDGE',
        message: `Keping tepi ${EDGE_SLOTS[matchedId].name} muncul ganda! Periksa ulang input warna tepi.`,
      };
    }
    edgeSeen[matchedId] = true;
    edgePerm[s] = matchedId;
    edgeOriSum += matchedOri;
  }

  // 5. Parity invariants
  if (edgeOriSum % 2 !== 0) {
    return {
      valid: false,
      code: 'EDGE_PARITY',
      message: 'Kubus mustahil diselesaikan: paritas orientasi tepi ganjil (ada 1 tepi terbalik secara fisik).',
    };
  }
  if (cornerOriSum % 3 !== 0) {
    return {
      valid: false,
      code: 'CORNER_PARITY',
      message: 'Kubus mustahil diselesaikan: paritas puntiran sudut tidak habis dibagi 3 (ada sudut terpuntir secara fisik).',
    };
  }

  const cPar = permutationParity(cornerPerm);
  const ePar = permutationParity(edgePerm);
  if ((cPar + ePar) % 2 !== 0) {
    return {
      valid: false,
      code: 'PERM_PARITY',
      message: 'Kubus mustahil diselesaikan: paritas permutasi sudut & tepi tidak cocok (misalnya 2 sudut atau 2 tepi tertukar).',
    };
  }

  return { valid: true, message: 'Kubus valid secara matematis dan siap dipecahkan!' };
}

// ============================================================================
// 3. MOVE SIMPLIFIER & COMPLETE DETERMINISTIC 7-STAGE SOLVER
// ============================================================================

const OPP_FACE = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F' };

function parseMovePower(m) {
  const face = m[0];
  if (m.length === 1) return { face, pow: 1 };
  if (m[1] === '2') return { face, pow: 2 };
  return { face, pow: 3 };
}

function formatMovePower(face, pow) {
  const p = ((pow % 4) + 4) % 4;
  if (p === 0) return null;
  if (p === 1) return face;
  if (p === 2) return `${face}2`;
  return `${face}'`;
}

/**
 * Cleanly cancel redundant moves and merge commuting opposite-face turns (e.g., U D U' -> D).
 */
export function simplifyMoves(moves) {
  const stack = []; // entries: { face, pow }
  for (const raw of moves) {
    if (!raw) continue;
    const { face, pow } = parseMovePower(raw);

    // Try merging with top, or second-from-top if top is the opposite commuting face
    let merged = false;
    for (let i = stack.length - 1; i >= 0; i--) {
      const top = stack[i];
      if (top.face === face) {
        top.pow = (top.pow + pow) % 4;
        if (top.pow === 0) {
          stack.splice(i, 1);
        }
        merged = true;
        break;
      }
      if (top.face !== OPP_FACE[face]) {
        break;
      }
    }
    if (!merged && pow % 4 !== 0) {
      stack.push({ face, pow: pow % 4 });
    }
  }
  return stack.map((e) => formatMovePower(e.face, e.pow)).filter(Boolean);
}

// View orientation maps: map logical (U, D, F, R, B, L) -> physical faces (preserving chirality!)
const VIEW_MAPS_U_TOP = {
  F: { U: 'U', D: 'D', F: 'F', R: 'R', B: 'B', L: 'L' },
  R: { U: 'U', D: 'D', F: 'R', R: 'B', B: 'L', L: 'F' },
  B: { U: 'U', D: 'D', F: 'B', R: 'L', B: 'F', L: 'R' },
  L: { U: 'U', D: 'D', F: 'L', R: 'F', B: 'R', L: 'B' },
};

// z2-flipped views where logical U = physical D (Yellow on logical top!)
const VIEW_MAPS_D_TOP = {
  F: { U: 'D', D: 'U', F: 'F', R: 'L', B: 'B', L: 'R' },
  L: { U: 'D', D: 'U', F: 'L', R: 'B', B: 'R', L: 'F' },
  B: { U: 'D', D: 'U', F: 'B', R: 'R', B: 'F', L: 'L' },
  R: { U: 'D', D: 'U', F: 'R', R: 'F', B: 'L', L: 'B' },
};

function mapMoves(alg, viewMap) {
  const list = typeof alg === 'string' ? alg.trim().split(/\s+/).filter(Boolean) : alg;
  return list.map((m) => viewMap[m[0]] + m.slice(1));
}

// Fast lookup of physical sticker indices by logical edge/corner names
const EDGE_IDX_BY_NAME = {};
for (const e of EDGE_SLOTS) {
  EDGE_IDX_BY_NAME[e.name] = e.idx;
  EDGE_IDX_BY_NAME[e.name[1] + e.name[0]] = [e.idx[1], e.idx[0]];
}

const CORNER_IDX_BY_FACES = new Map();
for (const c of CORNER_SLOTS) {
  const key = c.faces.slice().sort().join('');
  const map = {};
  for (let i = 0; i < 3; i++) map[c.faces[i]] = c.idx[i];
  CORNER_IDX_BY_FACES.set(key, map);
}

function getEdgeStickers(state, f1, f2) {
  const pair = EDGE_IDX_BY_NAME[f1 + f2];
  return [state[pair[0]], state[pair[1]]];
}

function getCornerStickers(state, f1, f2, f3) {
  const key = [f1, f2, f3].sort().join('');
  const m = CORNER_IDX_BY_FACES.get(key);
  return [state[m[f1]], state[m[f2]], state[m[f3]]];
}

function findEdge(state, cA, cB) {
  for (const e of EDGE_SLOTS) {
    const s0 = state[e.idx[0]];
    const s1 = state[e.idx[1]];
    if (s0 === cA && s1 === cB) return { name: e.name, fA: e.name[0], fB: e.name[1] };
    if (s0 === cB && s1 === cA) return { name: e.name, fA: e.name[1], fB: e.name[0] };
  }
  return null;
}

function findCorner(state, cA, cB, cC) {
  const want = [cA, cB, cC].sort().join('');
  for (const c of CORNER_SLOTS) {
    const cols = [state[c.idx[0]], state[c.idx[1]], state[c.idx[2]]];
    if (cols.slice().sort().join('') === want) {
      const fA = c.faces[cols.indexOf(cA)];
      const fB = c.faces[cols.indexOf(cB)];
      const fC = c.faces[cols.indexOf(cC)];
      return { name: c.name, fA, fB, fC };
    }
  }
  return null;
}

/**
 * Deterministic 7-Stage Solver (solves ANY valid 3x3x3 state from sticker colors alone).
 * Returns { valid, stages: [{ id, name, description, moves }], allMoves, totalMoves }
 */
export function solveCube(inputState) {
  const check = validateCube(inputState);
  if (!check.valid) {
    return {
      valid: false,
      error: check.message,
      code: check.code,
      stages: [],
      allMoves: [],
      totalMoves: 0,
    };
  }

  let cube = cloneCube(inputState);
  const stages = [];

  function runStage(id, name, description, fn) {
    const rawMoves = [];
    const exec = (alg, viewMap = VIEW_MAPS_U_TOP.F) => {
      const mapped = mapMoves(alg, viewMap);
      for (const m of mapped) {
        cube = applyMove(cube, m);
        rawMoves.push(m);
      }
    };
    fn(exec);
    const cleaned = simplifyMoves(rawMoves);
    stages.push({ id, name, description, moves: cleaned });
  }

  // Helper: map physical face letter back to logical face letter in a given viewMap
  function invFace(viewMap, physFace) {
    for (const k of FACES) {
      if (viewMap[k] === physFace) return k;
    }
    return physFace;
  }

  // --------------------------------------------------------------------------
  // STAGE 1: Salib Putih (White Cross on U)
  // --------------------------------------------------------------------------
  runStage(1, 'Salib Putih (Atas)', 'Membentuk salib putih di sisi U yang sejajar dengan pusat F/R/B/L.', (exec) => {
    const targets = [
      { front: 'F', color: 'G' },
      { front: 'R', color: 'R' },
      { front: 'B', color: 'B' },
      { front: 'L', color: 'O' },
    ];

    for (const { front, color } of targets) {
      const vm = VIEW_MAPS_U_TOP[front];
      let guard = 0;
      while (guard++ < 12) {
        const loc = findEdge(cube, 'W', color);
        const lW = invFace(vm, loc.fA);
        const lC = invFace(vm, loc.fB);

        // Already solved at UF
        if (lW === 'U' && lC === 'F') break;

        // Flipped in place at UF
        if (lW === 'F' && lC === 'U') {
          exec("F R' D' R F2", vm);
          break;
        }

        // In U layer at another slot (UR, UB, UL) -> kick cleanly to D layer
        if (lW === 'U' || lC === 'U') {
          const other = lW === 'U' ? lC : lW;
          exec(`${other}2`, vm);
          continue;
        }

        // In D layer -> align to DF, then insert cleanly
        if (lW === 'D' || lC === 'D') {
          const side = lW === 'D' ? lC : lW;
          if (side === 'R') exec("D'", vm);
          else if (side === 'B') exec('D2', vm);
          else if (side === 'L') exec('D', vm);

          if (lW === 'D') {
            exec('F2', vm);
          } else {
            exec("D R F' R'", vm);
          }
          break;
        }

        // In middle (E) layer: FR, FL, BR, BL
        const pairSet = lW + lC;
        if (pairSet === 'RF') {
          exec("F'", vm);
          break;
        }
        if (pairSet === 'FR') {
          exec("R' D' R F2", vm);
          break;
        }
        if (pairSet === 'LF') {
          exec('F', vm);
          break;
        }
        if (pairSet === 'FL') {
          exec("L D L' F2", vm);
          break;
        }
        if (pairSet === 'BR' || pairSet === 'RB') {
          exec("R D' R'", vm);
          continue;
        }
        if (pairSet === 'BL' || pairSet === 'LB') {
          exec("L' D L", vm);
          continue;
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // STAGE 2: Sudut Putih (First Layer Corners on U)
  // --------------------------------------------------------------------------
  runStage(2, 'Sudut Putih (Lapisan 1)', 'Menempatkan 4 sudut putih untuk menyelesaikan lapisan pertama.', (exec) => {
    const targets = [
      { front: 'F', cF: 'G', cR: 'R' },
      { front: 'R', cF: 'R', cR: 'B' },
      { front: 'B', cF: 'B', cR: 'O' },
      { front: 'L', cF: 'O', cR: 'G' },
    ];

    for (const { front, cF, cR } of targets) {
      const vm = VIEW_MAPS_U_TOP[front];
      let guard = 0;
      while (guard++ < 12) {
        const loc = findCorner(cube, 'W', cF, cR);
        const lW = invFace(vm, loc.fA);
        const lF = invFace(vm, loc.fB);
        const lR = invFace(vm, loc.fC);
        const faces = [lW, lF, lR];

        // Already solved at UFR
        if (lW === 'U' && lF === 'F' && lR === 'R') break;

        // If corner is in U layer (wrong slot or twisted at UFR), kick it down to D layer
        if (faces.includes('U')) {
          if (faces.includes('F') && faces.includes('R')) {
            exec("R' D' R", vm);
          } else if (faces.includes('R') && faces.includes('B')) {
            exec("B' D' B", vm);
          } else if (faces.includes('B') && faces.includes('L')) {
            exec("L' D' L", vm);
          } else {
            exec("F' D' F", vm);
          }
          continue;
        }

        // Now guaranteed in D layer -> rotate D so corner sits at DFR
        if (faces.includes('F') && faces.includes('L')) {
          exec('D', vm);
          continue;
        }
        if (faces.includes('B') && faces.includes('L')) {
          exec('D2', vm);
          continue;
        }
        if (faces.includes('B') && faces.includes('R')) {
          exec("D'", vm);
          continue;
        }

        // Now at DFR: 3 orientations of White
        if (lW === 'F') {
          exec("D' R' D R", vm);
          break;
        }
        if (lW === 'R') {
          exec("D F D' F'", vm);
          break;
        }
        // lW === 'D': rotate White onto R face at DFR, then loop finishes it
        exec("R' D2 R D", vm);
      }
    }
  });

  // --------------------------------------------------------------------------
  // STAGE 3: Tepi Lapisan Tengah (Middle Layer Edges: FR, RB, BL, LF)
  // --------------------------------------------------------------------------
  runStage(3, 'Tepi Lapisan Tengah', 'Menyelesaikan 4 tepi lapisan tengah (F2L Layer 2).', (exec) => {
    const targets = [
      { front: 'F', cF: 'G', cR: 'R' },
      { front: 'R', cF: 'R', cR: 'B' },
      { front: 'B', cF: 'B', cR: 'O' },
      { front: 'L', cF: 'O', cR: 'G' },
    ];

    for (const { front, cF, cR } of targets) {
      const vm = VIEW_MAPS_U_TOP[front];
      let guard = 0;
      while (guard++ < 10) {
        const loc = findEdge(cube, cF, cR);
        const l1 = invFace(vm, loc.fA);
        const l2 = invFace(vm, loc.fB);

        // Already solved at FR
        if (l1 === 'F' && l2 === 'R') break;

        // If stuck in any E-layer slot, kick it out into D layer
        if (l1 !== 'D' && l2 !== 'D') {
          const s = l1 + l2;
          let kickFront = front;
          if (s === 'FR' || s === 'RF') kickFront = vm.F;
          else if (s === 'RB' || s === 'BR') kickFront = vm.R;
          else if (s === 'BL' || s === 'LB') kickFront = vm.B;
          else kickFront = vm.L;
          exec("D' R' D R D F D' F'", VIEW_MAPS_U_TOP[kickFront]);
          continue;
        }

        // Edge is in D layer:
        if (l2 === 'D') {
          // cF is on side, cR is on D -> align side to F, insert right (DF -> FR)
          if (l1 === 'R') exec("D'", vm);
          else if (l1 === 'B') exec('D2', vm);
          else if (l1 === 'L') exec('D', vm);
          exec("D' R' D R D F D' F'", vm);
          break;
        } else {
          // l1 === 'D': cR is on side, cF is on D -> align side to R, insert left from R-view (DR -> FR)
          const vmR = VIEW_MAPS_U_TOP[vm.R];
          const sideInR = invFace(vmR, loc.fB);
          if (sideInR === 'R') exec("D'", vmR);
          else if (sideInR === 'B') exec('D2', vmR);
          else if (sideInR === 'L') exec('D', vmR);
          exec("D L D' L' D' F' D F", vmR);
          break;
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // STAGE 4: Salib Kuning (Yellow Cross — OLL Edges on D, using z2 view D=top)
  // --------------------------------------------------------------------------
  runStage(4, 'Salib Kuning (Bawah)', 'Membentuk salib kuning pada lapisan terakhir (sisi D).', (exec) => {
    const checkYellowEdges = (vm) => ({
      F: getEdgeStickers(cube, vm.U, vm.F)[0] === 'Y',
      R: getEdgeStickers(cube, vm.U, vm.R)[0] === 'Y',
      B: getEdgeStickers(cube, vm.U, vm.B)[0] === 'Y',
      L: getEdgeStickers(cube, vm.U, vm.L)[0] === 'Y',
    });

    let guard = 0;
    while (guard++ < 6) {
      const base = checkYellowEdges(VIEW_MAPS_D_TOP.F);
      const count = (base.F ? 1 : 0) + (base.R ? 1 : 0) + (base.B ? 1 : 0) + (base.L ? 1 : 0);
      if (count === 4) break;

      if (count === 0) {
        // Dot -> L-shape
        exec("F R U R' U' F'", VIEW_MAPS_D_TOP.F);
        continue;
      }

      // Check Horizontal Line (L & R yellow, F & B not) across views
      let solvedCase = false;
      for (const f of ['F', 'L', 'B', 'R']) {
        const vm = VIEW_MAPS_D_TOP[f];
        const y = checkYellowEdges(vm);
        if (y.L && y.R && !y.F && !y.B) {
          exec("F R U R' U' F'", vm);
          solvedCase = true;
          break;
        }
      }
      if (solvedCase) continue;

      // Otherwise L-shape: find view where B & L are yellow (F & R not)
      for (const f of ['F', 'L', 'B', 'R']) {
        const vm = VIEW_MAPS_D_TOP[f];
        const y = checkYellowEdges(vm);
        if (y.B && y.L && !y.F && !y.R) {
          exec("F U R U' R' F'", vm);
          solvedCase = true;
          break;
        }
      }
      if (!solvedCase) {
        exec("F R U R' U' F'", VIEW_MAPS_D_TOP.F);
      }
    }
  });

  // --------------------------------------------------------------------------
  // STAGE 5: Sejajarkan Tepi Kuning (Align Yellow Cross Edges with Side Centers)
  // --------------------------------------------------------------------------
  runStage(5, 'Sejajarkan Tepi Kuning', 'Menyamakan warna samping keempat tepi kuning dengan pusat sisi.', (exec) => {
    const matchedSides = () => {
      const res = {};
      for (const side of ['F', 'R', 'B', 'L']) {
        res[side] = getEdgeStickers(cube, 'D', side)[1] === FACE_DEFAULT_COLOR[side];
      }
      return res;
    };

    const alignBestD = () => {
      let bestTurns = 0;
      let bestCount = -1;
      let tmp = cloneCube(cube);
      for (let t = 0; t < 4; t++) {
        let cnt = 0;
        for (const side of ['F', 'R', 'B', 'L']) {
          if (getEdgeStickers(tmp, 'D', side)[1] === FACE_DEFAULT_COLOR[side]) cnt++;
        }
        if (cnt > bestCount) {
          bestCount = cnt;
          bestTurns = t;
        }
        tmp = applyMove(tmp, 'D');
      }
      if (bestTurns === 1) exec('D');
      else if (bestTurns === 2) exec('D2');
      else if (bestTurns === 3) exec("D'");
      return bestCount;
    };

    let guard = 0;
    while (guard++ < 6) {
      const cnt = alignBestD();
      if (cnt === 4) break;

      // Check if 2 adjacent edges match -> orient so matching edges are logical B & R
      let foundAdj = false;
      for (const f of ['F', 'L', 'B', 'R']) {
        const vm = VIEW_MAPS_D_TOP[f];
        const m = matchedSides();
        if (m[vm.B] && m[vm.R]) {
          exec("R U R' U R U2 R' U", vm);
          foundAdj = true;
          break;
        }
      }
      if (!foundAdj) {
        // Opposite pair matched -> one Sune produces adjacent pair
        exec("R U R' U R U2 R' U", VIEW_MAPS_D_TOP.F);
      }
    }
  });

  // --------------------------------------------------------------------------
  // STAGE 6: Posisi Sudut Kuning (Permute Last-Layer Corners via Niklas)
  // --------------------------------------------------------------------------
  runStage(6, 'Posisi Sudut Kuning', 'Memindahkan 4 sudut kuning ke posisi rumahnya (tanpa merusak salib).', (exec) => {
    const cornerInHomeSlot = (vm, cF, cR) => {
      const physF = vm[cF];
      const physR = vm[cR];
      const actual = getCornerStickers(cube, vm.U, physF, physR).slice().sort().join('');
      const want = ['Y', FACE_DEFAULT_COLOR[physF], FACE_DEFAULT_COLOR[physR]].sort().join('');
      return actual === want;
    };

    const countHome = () => {
      let c = 0;
      for (const f of ['F', 'L', 'B', 'R']) {
        if (cornerInHomeSlot(VIEW_MAPS_D_TOP[f], 'F', 'R')) c++;
      }
      return c;
    };

    let guard = 0;
    while (guard++ < 8) {
      const home = countHome();
      if (home === 4) break;

      if (home === 0) {
        exec("U R U' L' U R' U' L", VIEW_MAPS_D_TOP.F);
        continue;
      }

      // Find view where logical UFR is the home corner (Niklas & inverse Niklas both fix UFR!)
      for (const f of ['F', 'L', 'B', 'R']) {
        const vm = VIEW_MAPS_D_TOP[f];
        if (cornerInHomeSlot(vm, 'F', 'R')) {
          // Pick forward or inverse Niklas so 3-cycles solve in 1 algorithm (8 moves instead of 16)
          const tryFwd = applyMoves(cube, mapMoves("U R U' L' U R' U' L", vm));
          let fwdHome = 0;
          for (const ff of ['F', 'L', 'B', 'R']) {
            const v2 = VIEW_MAPS_D_TOP[ff];
            const a2 = getCornerStickers(tryFwd, v2.U, v2.F, v2.R).slice().sort().join('');
            const w2 = ['Y', FACE_DEFAULT_COLOR[v2.F], FACE_DEFAULT_COLOR[v2.R]].sort().join('');
            if (a2 === w2) fwdHome++;
          }
          if (fwdHome === 4) {
            exec("U R U' L' U R' U' L", vm);
          } else {
            exec("L' U R U' L U R' U'", vm);
          }
          break;
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // STAGE 7: Orientasi Sudut Kuning (Twist LL Corners via R' D' R D & Final D)
  // --------------------------------------------------------------------------
  runStage(7, 'Orientasi Sudut Kuning', 'Memuntir sudut kuning agar menghadap D dan menyelesaikan kubus.', (exec) => {
    const vm = VIEW_MAPS_D_TOP.F; // Fixed reference frame throughout Stage 7!

    const getUfrYellowFace = () => {
      const [cU, cF, cR] = getCornerStickers(cube, vm.U, vm.F, vm.R);
      if (cU === 'Y') return 'U';
      if (cF === 'Y') return 'F';
      return 'R';
    };

    for (let slot = 0; slot < 4; slot++) {
      const yFace = getUfrYellowFace();
      if (yFace === 'R') {
        // 2x (R' D' R D) twists UFR (R -> U) cleanly in 8 moves
        exec("R' D' R D R' D' R D", vm);
      } else if (yFace === 'F') {
        // Exact inverse 2x (D' R' D R) twists UFR (F -> U) in 8 moves (order-6 preserved!)
        exec("D' R' D R D' R' D R", vm);
      }
      exec('U', vm); // Rotate next LL corner into logical UFR (physical D turn)
    }

    // Final D-layer alignment
    let alignGuard = 0;
    while (getEdgeStickers(cube, 'D', 'F')[1] !== 'G' && alignGuard++ < 4) {
      exec('D');
    }
  });

  const allMoves = stages.flatMap((s) => s.moves);

  return {
    valid: isSolved(cube),
    stages,
    allMoves,
    totalMoves: allMoves.length,
    finalState: cube,
  };
}

// ============================================================================
// 4. 3D PROJECTION & TRUE CUBIE-SLICE ANIMATED CANVAS RENDERER
// ============================================================================

function rotateVecX(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

function rotateVecY(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function rotateVecAroundAxis(v, axis, angle) {
  // Rodrigues' rotation formula
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const d = dot3(v, axis);
  const cr = cross3(axis, v);
  return [
    v[0] * c + cr[0] * s + axis[0] * d * (1 - c),
    v[1] * c + cr[1] * s + axis[1] * d * (1 - c),
    v[2] * c + cr[2] * s + axis[2] * d * (1 - c),
  ];
}

// Precompute 26 outer cubies with plastic body quads and sticker quads
const CUBIE_SIZE = 0.96;
const HALF_C = CUBIE_SIZE / 2;
const STICKER_HALF = 0.415;
const STICKER_LIFT = 0.486;

const BODY_FACES_LOCAL = FACES.map((face) => {
  const n = FACE_NORMALS[face];
  const { right, down } = FACE_BASIS[face];
  const corners = [
    [-HALF_C, -HALF_C],
    [HALF_C, -HALF_C],
    [HALF_C, HALF_C],
    [-HALF_C, HALF_C],
  ].map(([rx, dy]) => [
    n[0] * HALF_C + right[0] * rx + down[0] * dy,
    n[1] * HALF_C + right[1] * rx + down[1] * dy,
    n[2] * HALF_C + right[2] * rx + down[2] * dy,
  ]);
  return { face, normal: n, corners };
});

function createCubeRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  // Prebuild 26 cubie descriptors with attached sticker indices
  const cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        const stickers = [];
        for (const face of FACES) {
          const n = FACE_NORMALS[face];
          const key = `${x},${y},${z}|${n[0]},${n[1]},${n[2]}`;
          const sIdx = GEO_KEY_TO_INDEX.get(key);
          if (sIdx !== undefined) {
            const { right, down } = FACE_BASIS[face];
            const quad = [
              [-STICKER_HALF, -STICKER_HALF],
              [STICKER_HALF, -STICKER_HALF],
              [STICKER_HALF, STICKER_HALF],
              [-STICKER_HALF, STICKER_HALF],
            ].map(([rx, dy]) => [
              x + n[0] * STICKER_LIFT + right[0] * rx + down[0] * dy,
              y + n[1] * STICKER_LIFT + right[1] * rx + down[1] * dy,
              z + n[2] * STICKER_LIFT + right[2] * rx + down[2] * dy,
            ]);
            stickers.push({ sIdx, normal: n, quad, face });
          }
        }
        const bodyQuads = BODY_FACES_LOCAL.map((bf) => ({
          normal: bf.normal,
          quad: bf.corners.map((p) => [x + p[0], y + p[1], z + p[2]]),
        }));
        cubies.push({ pos: [x, y, z], stickers, bodyQuads });
      }
    }
  }

  function render(cubeState, yaw, pitch, anim = null) {
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2 + 2;
    const fov = Math.min(W, H) * 1.48;
    const camDist = 6.9;

    // Classic Win95 CAD drafting backdrop (crisp subtle dot grid, zero neon slop)
    ctx.fillStyle = '#262b30';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#343b42';
    for (let gx = 12; gx < W; gx += 16) {
      for (let gy = 12; gy < H; gy += 16) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    // Subtle ground contact plate shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + Math.min(W, H) * 0.36, 72, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Directional light in camera space
    const lightDir = [0.35, 0.72, 0.60];
    const lLen = Math.hypot(lightDir[0], lightDir[1], lightDir[2]);
    lightDir[0] /= lLen;
    lightDir[1] /= lLen;
    lightDir[2] /= lLen;

    const animAxis = anim ? FACE_NORMALS[anim.face] : null;
    const animAngle = anim ? anim.angle : 0;

    const drawPolys = [];

    const transformPt = (p, inSlice) => {
      let v = inSlice ? rotateVecAroundAxis(p, animAxis, animAngle) : p;
      v = rotateVecY(v, yaw);
      v = rotateVecX(v, pitch);
      return v;
    };

    const transformNorm = (n, inSlice) => {
      let v = inSlice ? rotateVecAroundAxis(n, animAxis, animAngle) : n;
      v = rotateVecY(v, yaw);
      v = rotateVecX(v, pitch);
      return v;
    };

    const project = (v) => {
      const z = camDist - v[2];
      const scale = fov / Math.max(1.2, z);
      return [cx + v[0] * scale, cy - v[1] * scale, z];
    };

    for (const cubie of cubies) {
      const inSlice = Boolean(animAxis && dot3(cubie.pos, animAxis) === 1);

      // Cubie black plastic shell faces
      for (const bq of cubie.bodyQuads) {
        const tn = transformNorm(bq.normal, inSlice);
        // Backface cull against camera view vector (0,0,+camDist)
        const v0 = transformPt(bq.quad[0], inSlice);
        const viewVec = [-v0[0], -v0[1], camDist - v0[2]];
        if (dot3(tn, viewVec) <= 0.01) continue;

        const pts = bq.quad.map((p) => project(transformPt(p, inSlice)));
        const avgZ = (pts[0][2] + pts[1][2] + pts[2][2] + pts[3][2]) * 0.25;
        drawPolys.push({
          z: avgZ + 0.012, // Keep plastic slightly behind sticker on same face
          pts,
          fill: '#141618',
          stroke: '#08090a',
          lineWidth: 1,
          isSticker: false,
        });
      }

      // Colored stickers on visible outer faces
      for (const st of cubie.stickers) {
        const tn = transformNorm(st.normal, inSlice);
        const v0 = transformPt(st.quad[0], inSlice);
        const viewVec = [-v0[0], -v0[1], camDist - v0[2]];
        if (dot3(tn, viewVec) <= 0.01) continue;

        const pts = st.quad.map((p) => project(transformPt(p, inSlice)));
        const avgZ = (pts[0][2] + pts[1][2] + pts[2][2] + pts[3][2]) * 0.25;
        const colCode = cubeState[st.sIdx];
        const meta = COLOR_META[colCode] || COLOR_META.W;
        const shadeFactor = Math.max(0.72, Math.min(1.06, 0.80 + 0.28 * dot3(tn, lightDir)));

        drawPolys.push({
          z: avgZ,
          pts,
          fill: shadeFactor < 0.88 ? meta.shade : meta.hex,
          border: meta.border,
          isSticker: true,
          isCenter: (st.sIdx % 9) === 4,
          faceLabel: st.face,
          labelColor: meta.text,
        });
      }
    }

    // Painter's algorithm: farthest z first
    drawPolys.sort((a, b) => b.z - a.z);

    for (const poly of drawPolys) {
      const p = poly.pts;
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      ctx.lineTo(p[1][0], p[1][1]);
      ctx.lineTo(p[2][0], p[2][1]);
      ctx.lineTo(p[3][0], p[3][1]);
      ctx.closePath();
      ctx.fillStyle = poly.fill;
      ctx.fill();

      if (poly.isSticker) {
        ctx.strokeStyle = poly.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Crisp subtle top-left highlight bevel on sticker
        ctx.beginPath();
        ctx.moveTo(p[3][0] * 0.88 + p[1][0] * 0.12, p[3][1] * 0.88 + p[1][1] * 0.12);
        ctx.lineTo(p[0][0] * 0.88 + p[2][0] * 0.12, p[0][1] * 0.88 + p[2][1] * 0.12);
        ctx.lineTo(p[1][0] * 0.88 + p[3][0] * 0.12, p[1][1] * 0.88 + p[3][1] * 0.12);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle face letter on center cubies so Singmaster notation is crystal clear
        if (poly.isCenter) {
          const mx = (p[0][0] + p[1][0] + p[2][0] + p[3][0]) * 0.25;
          const my = (p[0][1] + p[1][1] + p[2][1] + p[3][1]) * 0.25;
          ctx.fillStyle = poly.labelColor;
          ctx.globalAlpha = 0.72;
          ctx.font = 'bold 10px "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(poly.faceLabel, mx, my);
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.strokeStyle = poly.stroke;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }
  }

  return { render };
}

// ============================================================================
// 5. WIN95 APPLICATION: RUBIK SOLVER 95
// ============================================================================

const CAM_PRESETS = {
  default: { yaw: -0.62, pitch: 0.46, label: 'Depan-Atas (Putih)' },
  back: { yaw: 2.52, pitch: 0.46, label: 'Belakang-Atas' },
  bottom: { yaw: -0.62, pitch: -0.58, label: 'Bawah (Kuning)' },
};

const SPEED_PRESETS = {
  slow: { label: 'Lambat', stepMs: 660, animMs: 360 },
  normal: { label: 'Normal', stepMs: 340, animMs: 200 },
  fast: { label: 'Cepat', stepMs: 150, animMs: 95 },
};

const KEYPAD_MOVES = ['U', "U'", 'D', "D'", 'L', "L'", 'R', "R'", 'F', "F'", 'B', "B'"];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const rubikApp = {
  id: 'rubik',
  title: 'Rubik Solver 95',
  icon: 'rubik',
  width: 680,
  height: 530,
  minWidth: 500,
  minHeight: 440,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    containerEl.innerHTML = `
      <div class="rubik-app">
        <div class="rubik-toolbar win95-toolbar">
          <div class="rubik-mode-group">
            <button type="button" class="win95-btn win95-btn-sm rubik-mode-btn is-active" data-mode="play">Mode Main</button>
            <button type="button" class="win95-btn win95-btn-sm rubik-mode-btn" data-mode="paint">Input Warna</button>
          </div>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <div class="rubik-actions-group">
            <button type="button" class="win95-btn win95-btn-sm rubik-action-btn" data-action="scramble">Acak (20)</button>
            <button type="button" class="win95-btn win95-btn-sm rubik-action-btn" data-action="reset">Reset</button>
            <button type="button" class="win95-btn win95-btn-sm primary rubik-solve-btn" data-action="solve">Solve!</button>
          </div>
          <div class="rubik-state-badge" data-el="badge">TERPECAHKAN</div>
        </div>

        <div class="rubik-workspace">
          <div class="rubik-left-pane">
            <div class="rubik-stage-box win95-sunken">
              <canvas class="rubik-canvas" width="292" height="224" aria-label="Kubus Rubik 3D Interaktif"></canvas>
              <div class="rubik-move-banner" data-el="move-banner" hidden></div>
              <div class="rubik-cam-hint">Seret untuk putar kamera 3D</div>
              <div class="rubik-cam-bar">
                <button type="button" class="win95-btn win95-btn-sm rubik-cam-btn is-active" data-cam="default">Default</button>
                <button type="button" class="win95-btn win95-btn-sm rubik-cam-btn" data-cam="back">Belakang</button>
                <button type="button" class="win95-btn win95-btn-sm rubik-cam-btn" data-cam="bottom">Bawah (D)</button>
              </div>
            </div>

            <fieldset class="win95-groupbox rubik-net-box">
              <legend data-el="net-legend">Jaring 2D (6 Sisi)</legend>
              <div class="rubik-palette" data-el="palette" hidden>
                ${COLOR_ORDER.map((code, i) => `
                  <button type="button" class="win95-btn win95-btn-sm rubik-swatch-btn${i === 0 ? ' is-active' : ''}" data-color="${code}" title="Pilih warna ${COLOR_META[code].name}">
                    <span class="rubik-swatch-chip" style="background:${COLOR_META[code].hex};border-color:${COLOR_META[code].border}"></span>
                    <span class="rubik-swatch-count" data-count="${code}">9</span>
                  </button>
                `).join('')}
              </div>
              <div class="rubik-net-wrap">
                <div class="rubik-net-grid" data-el="net-grid"></div>
              </div>
              <div class="rubik-paint-footer" data-el="paint-footer" hidden>
                <button type="button" class="win95-btn win95-btn-sm primary rubik-validate-btn" data-action="validate-solve">Validasi &amp; Solve!</button>
                <button type="button" class="win95-btn win95-btn-sm" data-action="reset">Reset Kubus</button>
              </div>
              <div class="rubik-diag" data-el="diag" hidden></div>
            </fieldset>
          </div>

          <div class="rubik-right-pane">
            <fieldset class="win95-groupbox rubik-keypad-box">
              <legend>Putar Manual (Notasi Singmaster)</legend>
              <div class="rubik-keypad">
                ${KEYPAD_MOVES.map((m) => `
                  <button type="button" class="win95-btn win95-btn-sm rubik-key-btn" data-move="${m}" title="${escapeHtml(MOVE_LABELS_ID[m])}">${m}</button>
                `).join('')}
              </div>
            </fieldset>

            <fieldset class="win95-groupbox rubik-solution-box">
              <legend>Pemutar Solusi 7-Tahap</legend>
              <div class="rubik-player-bar">
                <button type="button" class="win95-btn win95-btn-sm rubik-play-btn" data-action="first" title="Ke awal solusi">|&lt;</button>
                <button type="button" class="win95-btn win95-btn-sm rubik-play-btn" data-action="prev" title="Langkah sebelumnya">&lt; Prev</button>
                <button type="button" class="win95-btn win95-btn-sm primary rubik-play-btn rubik-play-main" data-action="play-toggle" data-el="play-btn">Play</button>
                <button type="button" class="win95-btn win95-btn-sm rubik-play-btn" data-action="next" title="Langkah berikutnya">Next &gt;</button>
                <button type="button" class="win95-btn win95-btn-sm rubik-play-btn" data-action="last" title="Ke hasil akhir">&gt;|</button>
              </div>

              <div class="rubik-player-meta">
                <div class="rubik-speed-group">
                  <button type="button" class="win95-btn win95-btn-sm rubik-speed-btn" data-speed="slow">Lambat</button>
                  <button type="button" class="win95-btn win95-btn-sm rubik-speed-btn is-active" data-speed="normal">Normal</button>
                  <button type="button" class="win95-btn win95-btn-sm rubik-speed-btn" data-speed="fast">Cepat</button>
                </div>
                <span class="rubik-step-counter" data-el="step-counter">Langkah 0 / 0</span>
              </div>

              <div class="win95-progress rubik-progress" aria-label="Progres solusi">
                <div class="win95-progress-bar" data-el="progress-bar" style="width:0%"></div>
              </div>

              <div class="rubik-stages-list win95-sunken win95-scrollbar" data-el="stages-list">
                <div class="rubik-empty-sol">
                  Klik <b>Acak (20)</b> atau masukkan warna kubus fisik melalui <b>Input Warna</b>, lalu tekan <b>Solve!</b> untuk melihat solusi matematis 7-tahap langkah demi langkah.
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    `;

    // DOM References
    const canvas = containerEl.querySelector('.rubik-canvas');
    const renderer = createCubeRenderer(canvas);
    const badgeEl = containerEl.querySelector('[data-el="badge"]');
    const moveBannerEl = containerEl.querySelector('[data-el="move-banner"]');
    const netLegendEl = containerEl.querySelector('[data-el="net-legend"]');
    const paletteEl = containerEl.querySelector('[data-el="palette"]');
    const paintFooterEl = containerEl.querySelector('[data-el="paint-footer"]');
    const diagEl = containerEl.querySelector('[data-el="diag"]');
    const netGridEl = containerEl.querySelector('[data-el="net-grid"]');
    const stagesListEl = containerEl.querySelector('[data-el="stages-list"]');
    const stepCounterEl = containerEl.querySelector('[data-el="step-counter"]');
    const progressBarEl = containerEl.querySelector('[data-el="progress-bar"]');
    const playBtnEl = containerEl.querySelector('[data-el="play-btn"]');
    const modeBtns = containerEl.querySelectorAll('.rubik-mode-btn');
    const camBtns = containerEl.querySelectorAll('.rubik-cam-btn');
    const speedBtns = containerEl.querySelectorAll('.rubik-speed-btn');
    const swatchBtns = containerEl.querySelectorAll('.rubik-swatch-btn');

    // App State
    let mode = 'play'; // 'play' | 'paint'
    let selectedColor = 'W';
    let speedKey = 'normal';
    let cube = createSolvedCube();

    // Solution playback state
    let solution = null; // { stages, allMoves, totalMoves }
    let solutionSnapshots = []; // length = allMoves.length + 1
    let stepIndex = 0; // 0 .. allMoves.length
    let isPlaying = false;
    let playTimerId = null;

    // 3D Camera & Slice Animation state
    let camYaw = CAM_PRESETS.default.yaw;
    let camPitch = CAM_PRESETS.default.pitch;
    let targetYaw = camYaw;
    let targetPitch = camPitch;
    let isDragging = false;
    let dragPointerId = null;
    let lastDragX = 0;
    let lastDragY = 0;

    // Active slice animation
    let activeAnim = null; // { baseState, nextState, face, targetAngle, startTs, durationMs, move }
    let rafId = null;
    let disposed = false;
    const activeTimeouts = new Set();
    const stickerBtns = new Array(54);

    function scheduleTimeout(fn, ms) {
      const id = setTimeout(() => {
        activeTimeouts.delete(id);
        if (!disposed) fn();
      }, ms);
      activeTimeouts.add(id);
      return id;
    }

    // Build 2D Unfolded Net DOM once (4 cols x 3 rows of 3x3 face blocks)
    const NET_LAYOUT = [
      { face: 'U', col: 2, row: 1 },
      { face: 'L', col: 1, row: 2 },
      { face: 'F', col: 2, row: 2 },
      { face: 'R', col: 3, row: 2 },
      { face: 'B', col: 4, row: 2 },
      { face: 'D', col: 2, row: 3 },
    ];

    function buildNetDom() {
      netGridEl.innerHTML = '';
      for (const { face, col, row } of NET_LAYOUT) {
        const faceEl = document.createElement('div');
        faceEl.className = 'rubik-face-grid';
        faceEl.style.gridColumn = String(col);
        faceEl.style.gridRow = String(row);
        faceEl.dataset.face = face;
        const off = FACE_OFFSET[face];
        for (let i = 0; i < 9; i++) {
          const idx = off + i;
          const isCenter = i === 4;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = isCenter ? 'rubik-sticker rubik-sticker-center' : 'rubik-sticker';
          btn.dataset.idx = String(idx);
          if (isCenter) {
            btn.textContent = face;
            btn.title = `Sisi ${face} (${COLOR_META[FACE_DEFAULT_COLOR[face]].name} — stiker tengah tetap)`;
          } else {
            btn.title = `Stiker ${face}${i + 1}`;
          }
          faceEl.appendChild(btn);
          stickerBtns[idx] = btn;
        }
        netGridEl.appendChild(faceEl);
      }
    }

    function stopPlayback() {
      isPlaying = false;
      if (playTimerId !== null) {
        clearTimeout(playTimerId);
        playTimerId = null;
      }
      playBtnEl.textContent = 'Play';
      playBtnEl.classList.remove('is-active');
      updateBadge();
    }

    function clearSolution() {
      stopPlayback();
      solution = null;
      solutionSnapshots = [];
      stepIndex = 0;
      renderSolutionPanel();
    }

    function showDiag(message, type = 'info') {
      if (!message) {
        diagEl.hidden = true;
        diagEl.textContent = '';
        diagEl.className = 'rubik-diag';
        return;
      }
      diagEl.hidden = false;
      diagEl.textContent = message;
      diagEl.className = `rubik-diag ${type === 'error' ? 'is-error' : 'is-ok'}`;
    }

    function updateBadge() {
      badgeEl.className = 'rubik-state-badge';
      if (mode === 'paint') {
        badgeEl.textContent = 'INPUT WARNA';
        badgeEl.classList.add('is-paint');
      } else if (isPlaying) {
        badgeEl.textContent = 'MEMUTAR...';
        badgeEl.classList.add('is-playing');
      } else if (isSolved(cube)) {
        badgeEl.textContent = 'TERPECAHKAN';
        badgeEl.classList.add('is-solved');
      } else {
        badgeEl.textContent = 'TERACAK';
        badgeEl.classList.add('is-scrambled');
      }
    }

    function syncNetColors() {
      const counts = { W: 0, Y: 0, G: 0, B: 0, R: 0, O: 0 };
      for (let i = 0; i < 54; i++) {
        const code = cube[i];
        counts[code] = (counts[code] || 0) + 1;
        const meta = COLOR_META[code] || COLOR_META.W;
        const btn = stickerBtns[i];
        if (!btn) continue;
        btn.style.backgroundColor = meta.hex;
        btn.style.borderColor = meta.border;
        btn.style.color = meta.text;
      }
      for (const code of COLOR_ORDER) {
        const el = containerEl.querySelector(`[data-count="${code}"]`);
        if (el) {
          el.textContent = String(counts[code] || 0);
          el.classList.toggle('is-warn', counts[code] !== 9);
        }
      }
      netGridEl.classList.toggle('is-paint-mode', mode === 'paint');
      updateBadge();
    }

    function getMoveAngle(move) {
      // Clockwise around outward normal = -PI/2 in right-handed coords
      if (move.endsWith("'")) return Math.PI / 2;
      if (move.endsWith('2')) return -Math.PI;
      return -Math.PI / 2;
    }

    function commitActiveAnim() {
      if (!activeAnim) return;
      cube = activeAnim.nextState;
      activeAnim = null;
      syncNetColors();
    }

    function triggerMoveAnimation(baseState, nextState, move, durationMs) {
      activeAnim = {
        baseState,
        nextState,
        face: move[0],
        targetAngle: getMoveAngle(move),
        startTs: performance.now(),
        durationMs: Math.max(40, durationMs),
        move,
      };
      moveBannerEl.textContent = `${move} — ${MOVE_LABELS_ID[move] || move}`;
      moveBannerEl.hidden = false;
    }

    function applyManualMove(move) {
      if (mode === 'paint') {
        setMode('play');
      }
      clearSolution();
      showDiag('');
      commitActiveAnim();
      const prev = cube;
      const next = applyMove(prev, move);
      cube = next;
      triggerMoveAnimation(prev, next, move, 155);
      sound.playBeep(move.endsWith("'") ? 520 : 640, 0.035);
      syncNetColors();
      winApi.setStatus(
        isSolved(cube)
          ? 'Kubus Rubik terpecahkan sempurna!'
          : `Gerakan: ${move} (${MOVE_LABELS_ID[move]})`
      );
    }

    function renderSolutionPanel() {
      const total = solution ? solution.totalMoves : 0;
      stepCounterEl.textContent = `Langkah ${stepIndex} / ${total}`;
      const pct = total > 0 ? Math.round((stepIndex / total) * 100) : 0;
      progressBarEl.style.width = `${pct}%`;

      // Update player button enabled states
      const hasSol = Boolean(solution && total > 0);
      containerEl.querySelector('[data-action="first"]').disabled = !hasSol || stepIndex === 0;
      containerEl.querySelector('[data-action="prev"]').disabled = !hasSol || stepIndex === 0;
      containerEl.querySelector('[data-action="play-toggle"]').disabled = !hasSol;
      containerEl.querySelector('[data-action="next"]').disabled = !hasSol || stepIndex >= total;
      containerEl.querySelector('[data-action="last"]').disabled = !hasSol || stepIndex >= total;

      if (!solution) {
        stagesListEl.innerHTML = `
          <div class="rubik-empty-sol">
            Klik <b>Acak (20)</b> atau masukkan warna kubus fisik melalui <b>Input Warna</b>, lalu tekan <b>Solve!</b> untuk melihat solusi matematis 7-tahap langkah demi langkah.
          </div>
        `;
        return;
      }

      if (total === 0) {
        stagesListEl.innerHTML = `
          <div class="rubik-empty-sol rubik-already-solved">
            Kubus sudah dalam kondisi terpecahkan sempurna (0 langkah).
          </div>
        `;
        return;
      }

      let globalIdx = 0;
      const html = solution.stages.map((st) => {
        const startStep = globalIdx;
        const pillsHtml = st.moves.length === 0
          ? '<span class="rubik-stage-skip">Sudah selesai (0 langkah)</span>'
          : st.moves.map((m) => {
              globalIdx++;
              const stepNum = globalIdx;
              const cls = stepNum === stepIndex
                ? 'rubik-move-pill is-active'
                : (stepNum < stepIndex ? 'rubik-move-pill is-done' : 'rubik-move-pill');
              return `<button type="button" class="${cls}" data-step="${stepNum}" title="Langkah ${stepNum}: ${escapeHtml(MOVE_LABELS_ID[m])}">${m}</button>`;
            }).join('');

        const stageDone = st.moves.length === 0 || stepIndex >= globalIdx;
        const stageActive = st.moves.length > 0 && stepIndex > startStep && stepIndex <= globalIdx;
        return `
          <div class="rubik-stage-item${stageActive ? ' is-current' : ''}${stageDone ? ' is-done' : ''}">
            <div class="rubik-stage-head">
              <span class="rubik-stage-name">${st.id}. ${escapeHtml(st.name)}</span>
              <span class="rubik-stage-count">${st.moves.length} langkah</span>
            </div>
            <div class="rubik-moves-wrap">${pillsHtml}</div>
          </div>
        `;
      }).join('');

      stagesListEl.innerHTML = html;

      // Scroll active move pill into view cleanly
      const activePill = stagesListEl.querySelector('.rubik-move-pill.is-active');
      if (activePill && typeof activePill.scrollIntoView === 'function') {
        activePill.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }

    function jumpToStep(targetStep, animateSingle = false) {
      if (!solution) return;
      const clamped = Math.max(0, Math.min(solution.totalMoves, targetStep));
      const prevStep = stepIndex;
      commitActiveAnim();
      stepIndex = clamped;
      const nextState = cloneCube(solutionSnapshots[stepIndex]);

      if (animateSingle && Math.abs(stepIndex - prevStep) === 1) {
        const prevState = cloneCube(solutionSnapshots[prevStep]);
        const isForward = stepIndex > prevStep;
        const movePlayed = isForward
          ? solution.allMoves[stepIndex - 1]
          : invertMove(solution.allMoves[prevStep - 1]);
        cube = nextState;
        triggerMoveAnimation(prevState, nextState, movePlayed, SPEED_PRESETS[speedKey].animMs);
        sound.playBeep(isForward ? 620 : 480, 0.03);
      } else {
        cube = nextState;
        if (stepIndex > 0) {
          const lastM = solution.allMoves[stepIndex - 1];
          moveBannerEl.textContent = `Langkah ${stepIndex}/${solution.totalMoves}: ${lastM}`;
          moveBannerEl.hidden = false;
        } else {
          moveBannerEl.hidden = true;
        }
      }

      syncNetColors();
      renderSolutionPanel();

      if (stepIndex === solution.totalMoves && solution.totalMoves > 0) {
        winApi.setStatus(`Selesai! Kubus terpecahkan dalam ${solution.totalMoves} langkah.`);
      } else if (stepIndex > 0) {
        const m = solution.allMoves[stepIndex - 1];
        winApi.setStatus(`Langkah ${stepIndex}/${solution.totalMoves}: ${m} — ${MOVE_LABELS_ID[m]}`);
      } else {
        winApi.setStatus(`Solusi siap: ${solution.totalMoves} langkah (7 tahap). Klik Play atau Next.`);
      }
    }

    function scheduleNextPlayStep() {
      if (!isPlaying || !solution || disposed) return;
      if (stepIndex >= solution.totalMoves) {
        stopPlayback();
        sound.playBeep(660, 0.07);
        scheduleTimeout(() => sound.playBeep(880, 0.07), 80);
        scheduleTimeout(() => sound.playBeep(1100, 0.12), 165);
        return;
      }
      playTimerId = setTimeout(() => {
        playTimerId = null;
        if (!isPlaying || disposed) return;
        jumpToStep(stepIndex + 1, true);
        if (stepIndex >= solution.totalMoves) {
          stopPlayback();
          sound.playBeep(660, 0.07);
          scheduleTimeout(() => sound.playBeep(880, 0.07), 80);
          scheduleTimeout(() => sound.playBeep(1100, 0.12), 165);
        } else {
          scheduleNextPlayStep();
        }
      }, SPEED_PRESETS[speedKey].stepMs);
    }

    function togglePlay() {
      if (!solution || solution.totalMoves === 0) return;
      if (isPlaying) {
        stopPlayback();
        sound.playClick();
        return;
      }
      if (stepIndex >= solution.totalMoves) {
        jumpToStep(0, false);
      }
      isPlaying = true;
      playBtnEl.textContent = 'Pause';
      playBtnEl.classList.add('is-active');
      updateBadge();
      sound.playClick();
      jumpToStep(stepIndex + 1, true);
      scheduleNextPlayStep();
    }

    function runSolver() {
      commitActiveAnim();
      stopPlayback();

      const res = solveCube(cube);
      if (!res.valid) {
        sound.playError();
        showDiag(res.error || 'Kubus tidak valid.', 'error');
        winApi.setStatus(`Validasi gagal: ${res.error}`);
        return;
      }

      if (mode === 'paint') {
        setMode('play', true);
      }

      solution = res;
      solutionSnapshots = [cloneCube(cube)];
      let cur = cloneCube(cube);
      for (const m of res.allMoves) {
        cur = applyMove(cur, m);
        solutionSnapshots.push(cur);
      }
      stepIndex = 0;

      if (res.totalMoves === 0) {
        showDiag('Kubus sudah terpecahkan sempurna!', 'ok');
        sound.playBeep(880, 0.08);
        winApi.setStatus('Kubus sudah dalam posisi terpecahkan (0 langkah).');
      } else {
        showDiag(`Valid! Solusi ditemukan: ${res.totalMoves} langkah (7 tahap).`, 'ok');
        sound.playOpen();
        winApi.setStatus(`Solusi siap: ${res.totalMoves} langkah (7 tahap). Tekan Play atau klik langkah.`);
      }
      renderSolutionPanel();
    }

    function doScramble() {
      if (mode === 'paint') setMode('play');
      commitActiveAnim();
      clearSolution();
      showDiag('');
      const { state: scrambled, moves } = scrambleCube(20);
      cube = scrambled;
      moveBannerEl.textContent = `Diacak 20 langkah: ${moves.slice(0, 6).join(' ')} ...`;
      moveBannerEl.hidden = false;
      sound.playBeep(460, 0.05);
      scheduleTimeout(() => sound.playBeep(580, 0.05), 55);
      syncNetColors();
      winApi.setStatus(`Kubus diacak 20 langkah (${moves.join(' ')}). Klik Solve! untuk memecahkan.`);
    }

    function doReset() {
      commitActiveAnim();
      clearSolution();
      showDiag('');
      cube = createSolvedCube();
      moveBannerEl.hidden = true;
      sound.playClick();
      syncNetColors();
      winApi.setStatus('Kubus direset ke posisi terpecahkan.');
    }

    function setMode(nextMode, keepDiag = false) {
      if (nextMode !== 'play' && nextMode !== 'paint') return;
      commitActiveAnim();
      if (nextMode === 'paint') {
        stopPlayback();
        clearSolution();
        moveBannerEl.hidden = true;
      }
      mode = nextMode;
      modeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
      paletteEl.hidden = mode !== 'paint';
      paintFooterEl.hidden = mode !== 'paint';
      netLegendEl.textContent = mode === 'paint'
        ? 'Input Warna Kubus Fisik (Klik Stiker Non-Tengah)'
        : 'Jaring 2D (6 Sisi Sinkron)';
      if (!keepDiag) showDiag('');
      syncNetColors();
      winApi.setStatus(
        mode === 'paint'
          ? 'Mode Input Warna: pilih warna di palet lalu klik stiker di jaring 2D.'
          : 'Mode Main: putar manual, Acak (20), atau klik Solve!'
      );
    }

    function setCamPreset(key) {
      const p = CAM_PRESETS[key];
      if (!p) return;
      targetYaw = p.yaw;
      targetPitch = p.pitch;
      camBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.cam === key));
      sound.playClick();
    }

    function setSpeed(key) {
      if (!SPEED_PRESETS[key]) return;
      speedKey = key;
      speedBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.speed === key));
      sound.playClick();
    }

    // 3D Render Loop
    function renderLoop(ts) {
      if (disposed) return;

      // Smooth camera interpolation toward preset target when not dragging
      if (!isDragging) {
        camYaw += (targetYaw - camYaw) * 0.16;
        camPitch += (targetPitch - camPitch) * 0.16;
      }

      if (activeAnim) {
        const elapsed = ts - activeAnim.startTs;
        const rawT = Math.min(1, Math.max(0, elapsed / activeAnim.durationMs));
        // Crisp ease-out cubic
        const ease = 1 - Math.pow(1 - rawT, 3);
        if (rawT >= 1) {
          cube = activeAnim.nextState;
          activeAnim = null;
          renderer.render(cube, camYaw, camPitch, null);
        } else {
          renderer.render(activeAnim.baseState, camYaw, camPitch, {
            face: activeAnim.face,
            angle: activeAnim.targetAngle * ease,
          });
        }
      } else {
        renderer.render(cube, camYaw, camPitch, null);
      }

      rafId = requestAnimationFrame(renderLoop);
    }

    // Pointer Drag Orbit on 3D Canvas
    const onCanvasPointerDown = (e) => {
      e.preventDefault();
      winApi.focus();
      isDragging = true;
      dragPointerId = e.pointerId;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      camBtns.forEach((b) => b.classList.remove('is-active'));
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }
    };

    const onWindowPointerMove = (e) => {
      if (!isDragging || (dragPointerId !== null && e.pointerId !== dragPointerId)) return;
      const dx = e.clientX - lastDragX;
      const dy = e.clientY - lastDragY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      camYaw += dx * 0.012;
      camPitch = Math.max(-1.32, Math.min(1.32, camPitch + dy * 0.012));
      targetYaw = camYaw;
      targetPitch = camPitch;
    };

    const onWindowPointerUp = (e) => {
      if (!isDragging) return;
      if (dragPointerId !== null && e.pointerId !== dragPointerId) return;
      isDragging = false;
      dragPointerId = null;
    };

    // Keyboard shortcuts when Rubik window is focused
    function isWindowFocused() {
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return false;
      if (winApi.el && (winApi.el.classList.contains('is-active') || winApi.el.classList.contains('active'))) return true;
      return containerEl.contains(ae);
    }

    const onWindowKeyDown = (e) => {
      if (!isWindowFocused() || mode === 'paint') return;
      const k = e.key.toUpperCase();
      if (FACES.includes(k) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        applyManualMove(e.shiftKey ? `${k}'` : k);
        return;
      }
      if (solution && solution.totalMoves > 0) {
        if (e.code === 'Space') {
          e.preventDefault();
          togglePlay();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          stopPlayback();
          jumpToStep(stepIndex + 1, true);
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          stopPlayback();
          jumpToStep(stepIndex - 1, true);
        }
      }
    };

    // Event Delegation inside Container
    const onContainerClick = (e) => {
      winApi.focus();

      // Mode buttons
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) {
        sound.playClick();
        setMode(modeBtn.dataset.mode);
        return;
      }

      // Camera preset buttons
      const camBtn = e.target.closest('[data-cam]');
      if (camBtn) {
        setCamPreset(camBtn.dataset.cam);
        return;
      }

      // Speed buttons
      const spdBtn = e.target.closest('[data-speed]');
      if (spdBtn) {
        setSpeed(spdBtn.dataset.speed);
        return;
      }

      // Paint swatch palette
      const swBtn = e.target.closest('[data-color]');
      if (swBtn) {
        selectedColor = swBtn.dataset.color;
        swatchBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.color === selectedColor));
        sound.playClick();
        return;
      }

      // 2D Net sticker paint click
      const stickerEl = e.target.closest('.rubik-sticker');
      if (stickerEl && mode === 'paint') {
        const idx = parseInt(stickerEl.dataset.idx, 10);
        if (idx % 9 === 4) {
          sound.playError();
          showDiag('Stiker tengah (center) bersifat tetap dan tidak bisa diubah.', 'error');
          return;
        }
        cube[idx] = selectedColor;
        showDiag('');
        sound.playClick();
        syncNetColors();
        return;
      }

      // Manual Singmaster keypad
      const moveBtn = e.target.closest('[data-move]');
      if (moveBtn) {
        applyManualMove(moveBtn.dataset.move);
        return;
      }

      // Solution move pill jump
      const pillBtn = e.target.closest('[data-step]');
      if (pillBtn) {
        stopPlayback();
        const targetStep = parseInt(pillBtn.dataset.step, 10);
        sound.playClick();
        jumpToStep(targetStep, Math.abs(targetStep - stepIndex) === 1);
        return;
      }

      // Toolbar & Player Actions
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.dataset.action;
      if (action === 'scramble') doScramble();
      else if (action === 'reset') doReset();
      else if (action === 'solve' || action === 'validate-solve') runSolver();
      else if (action === 'first') { stopPlayback(); sound.playClick(); jumpToStep(0, false); }
      else if (action === 'prev') { stopPlayback(); jumpToStep(stepIndex - 1, true); }
      else if (action === 'play-toggle') togglePlay();
      else if (action === 'next') { stopPlayback(); jumpToStep(stepIndex + 1, true); }
      else if (action === 'last') { stopPlayback(); sound.playClick(); jumpToStep(solution ? solution.totalMoves : 0, false); }
    };

    canvas.addEventListener('pointerdown', onCanvasPointerDown);
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
    window.addEventListener('keydown', onWindowKeyDown);
    containerEl.addEventListener('click', onContainerClick);

    buildNetDom();
    syncNetColors();
    renderSolutionPanel();
    winApi.setStatus('Rubik Solver 95 siap — Klik Acak (20) atau Input Warna untuk memecahkan kubus!');
    rafId = requestAnimationFrame(renderLoop);

    winApi.onClose(() => {
      disposed = true;
      stopPlayback();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      for (const id of activeTimeouts) clearTimeout(id);
      activeTimeouts.clear();
      canvas.removeEventListener('pointerdown', onCanvasPointerDown);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
      window.removeEventListener('keydown', onWindowKeyDown);
      containerEl.removeEventListener('click', onContainerClick);
    });
  },
};
