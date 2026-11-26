/**
 * RizkyOS 95 - Catur 95 (Pure Vanilla JS Chess Engine + RizkyBot AI + Win95 UI)
 * Zero external dependencies. 100% legal FIDE rules: pins, checks, castling,
 * en passant, promotion picker, checkmate, stalemate, 50-move, insufficient
 * material, and threefold repetition detection.
 */

import { sound } from '../sound.js';

// ============================================================================
// 1. CHESS CONSTANTS & BOARD ENCODING
// ============================================================================

const EMPTY = 0;
const PAWN = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK = 4;
const QUEEN = 5;
const KING = 6;

const WHITE = 1;
const BLACK = -1;

// Castling rights bitmask
const CASTLE_WK = 1;
const CASTLE_WQ = 2;
const CASTLE_BK = 4;
const CASTLE_BQ = 8;

const FILES = 'abcdefgh';
const RANKS = '87654321';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE_CHAR_TO_VAL = {
  P: PAWN,
  N: KNIGHT,
  B: BISHOP,
  R: ROOK,
  Q: QUEEN,
  K: KING,
  p: -PAWN,
  n: -KNIGHT,
  b: -BISHOP,
  r: -ROOK,
  q: -QUEEN,
  k: -KING,
};

const VAL_TO_PIECE_CHAR = {
  [PAWN]: 'P',
  [KNIGHT]: 'N',
  [BISHOP]: 'B',
  [ROOK]: 'R',
  [QUEEN]: 'Q',
  [KING]: 'K',
  [-PAWN]: 'p',
  [-KNIGHT]: 'n',
  [-BISHOP]: 'b',
  [-ROOK]: 'r',
  [-QUEEN]: 'q',
  [-KING]: 'k',
};

const TYPE_TO_SAN = {
  [PAWN]: '',
  [KNIGHT]: 'N',
  [BISHOP]: 'B',
  [ROOK]: 'R',
  [QUEEN]: 'Q',
  [KING]: 'K',
};

const PIECE_VALUES = {
  [PAWN]: 100,
  [KNIGHT]: 320,
  [BISHOP]: 330,
  [ROOK]: 500,
  [QUEEN]: 900,
  [KING]: 20000,
};

const MATERIAL_POINTS = {
  [PAWN]: 1,
  [KNIGHT]: 3,
  [BISHOP]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: 0,
};

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const KING_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const QUEEN_DIRS = [...BISHOP_DIRS, ...ROOK_DIRS];

const MODES = {
  'ai-1': { label: 'vs RizkyBot (Santai / Depth 1)', isAi: true, depth: 1, qDepth: 1, jitter: 34 },
  'ai-2': { label: 'vs RizkyBot (Menengah / Depth 2)', isAi: true, depth: 2, qDepth: 3, jitter: 8 },
  'ai-3': { label: 'vs RizkyBot (Master / Depth 3)', isAi: true, depth: 3, qDepth: 4, jitter: 0 },
  pvp: { label: '2 Pemain (Lokal)', isAi: false, depth: 0, qDepth: 0, jitter: 0 },
};

// Piece-Square Tables (White's perspective: index 0 = a8, index 63 = h1)
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 26, 26, 10,  5,  5,
   0,  0,  0, 22, 22,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const PST_KNIGHT = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

const PST_BISHOP = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  6, 10, 10,  6,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20,
];

const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  6,  6,  0,  0,  0,
];

const PST_QUEEN = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20,
];

const PST_KING_MG = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

const PST_KING_EG = [
 -50,-40,-30,-20,-20,-30,-40,-50,
 -30,-20,-10,  0,  0,-10,-20,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-30,  0,  0,  0,  0,-30,-30,
 -50,-30,-30,-30,-30,-30,-30,-50,
];

const PST_BY_TYPE = {
  [PAWN]: PST_PAWN,
  [KNIGHT]: PST_KNIGHT,
  [BISHOP]: PST_BISHOP,
  [ROOK]: PST_ROOK,
  [QUEEN]: PST_QUEEN,
};

// ============================================================================
// 2. PURE CHESS RULES ENGINE (100% LEGAL MOVE GENERATION & EVALUATION)
// ============================================================================

function sqToAlg(sq) {
  if (sq < 0 || sq > 63) return '-';
  return FILES[sq & 7] + RANKS[sq >> 3];
}

function algToSq(alg) {
  if (!alg || alg.length !== 2) return -1;
  const c = FILES.indexOf(alg[0]);
  const r = RANKS.indexOf(alg[1]);
  if (c < 0 || r < 0) return -1;
  return (r << 3) | c;
}

function mirrorSq(sq) {
  return ((7 - (sq >> 3)) << 3) | (sq & 7);
}

function parseFEN(fen = START_FEN) {
  const parts = String(fen).trim().split(/\s+/);
  const rows = (parts[0] || '').split('/');
  if (rows.length !== 8) {
    throw new Error(`Invalid FEN board: ${fen}`);
  }

  const board = new Array(64).fill(EMPTY);
  let wKingSq = -1;
  let bKingSq = -1;

  for (let r = 0; r < 8; r++) {
    let c = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '8') {
        c += ch.charCodeAt(0) - 48;
      } else {
        const val = PIECE_CHAR_TO_VAL[ch];
        if (val === undefined || c >= 8) {
          throw new Error(`Invalid FEN piece '${ch}' in ${fen}`);
        }
        const sq = (r << 3) | c;
        board[sq] = val;
        if (val === KING) wKingSq = sq;
        else if (val === -KING) bKingSq = sq;
        c++;
      }
    }
    if (c !== 8) {
      throw new Error(`Invalid FEN rank length at row ${r}: ${fen}`);
    }
  }

  const turn = parts[1] === 'b' ? BLACK : WHITE;
  const castleStr = parts[2] || '-';
  let castling = 0;
  if (castleStr.includes('K')) castling |= CASTLE_WK;
  if (castleStr.includes('Q')) castling |= CASTLE_WQ;
  if (castleStr.includes('k')) castling |= CASTLE_BK;
  if (castleStr.includes('q')) castling |= CASTLE_BQ;

  const epSquare = parts[3] && parts[3] !== '-' ? algToSq(parts[3]) : -1;
  const halfMoveClock = Math.max(0, parseInt(parts[4] || '0', 10) || 0);
  const fullMoveNumber = Math.max(1, parseInt(parts[5] || '1', 10) || 1);

  return {
    board,
    turn,
    castling,
    epSquare,
    halfMoveClock,
    fullMoveNumber,
    wKingSq,
    bKingSq,
  };
}

function toFEN(pos) {
  const rows = [];
  for (let r = 0; r < 8; r++) {
    let emptyRun = 0;
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const p = pos.board[(r << 3) | c];
      if (p === EMPTY) {
        emptyRun++;
      } else {
        if (emptyRun > 0) {
          rowStr += String(emptyRun);
          emptyRun = 0;
        }
        rowStr += VAL_TO_PIECE_CHAR[p];
      }
    }
    if (emptyRun > 0) rowStr += String(emptyRun);
    rows.push(rowStr);
  }

  let castleStr = '';
  if (pos.castling & CASTLE_WK) castleStr += 'K';
  if (pos.castling & CASTLE_WQ) castleStr += 'Q';
  if (pos.castling & CASTLE_BK) castleStr += 'k';
  if (pos.castling & CASTLE_BQ) castleStr += 'q';
  if (!castleStr) castleStr = '-';

  return [
    rows.join('/'),
    pos.turn === WHITE ? 'w' : 'b',
    castleStr,
    pos.epSquare >= 0 ? sqToAlg(pos.epSquare) : '-',
    String(pos.halfMoveClock),
    String(pos.fullMoveNumber),
  ].join(' ');
}

function createInitialPosition() {
  return parseFEN(START_FEN);
}

function clonePosition(pos) {
  return {
    board: pos.board.slice(),
    turn: pos.turn,
    castling: pos.castling,
    epSquare: pos.epSquare,
    halfMoveClock: pos.halfMoveClock,
    fullMoveNumber: pos.fullMoveNumber,
    wKingSq: pos.wKingSq,
    bKingSq: pos.bKingSq,
  };
}

/**
 * Determine whether square `sq` is attacked by any piece of `bySide` (WHITE=1 or BLACK=-1).
 */
function isSquareAttacked(board, sq, bySide) {
  const r = sq >> 3;
  const c = sq & 7;

  // 1. Pawn attacks
  const pawnRow = bySide === WHITE ? r + 1 : r - 1;
  if (pawnRow >= 0 && pawnRow < 8) {
    const enemyPawn = bySide * PAWN;
    if (c > 0 && board[(pawnRow << 3) | (c - 1)] === enemyPawn) return true;
    if (c < 7 && board[(pawnRow << 3) | (c + 1)] === enemyPawn) return true;
  }

  // 2. Knight attacks
  const enemyKnight = bySide * KNIGHT;
  for (let i = 0; i < 8; i++) {
    const nr = r + KNIGHT_OFFSETS[i][0];
    const nc = c + KNIGHT_OFFSETS[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (board[(nr << 3) | nc] === enemyKnight) return true;
    }
  }

  // 3. King attacks
  const enemyKing = bySide * KING;
  for (let i = 0; i < 8; i++) {
    const nr = r + KING_OFFSETS[i][0];
    const nc = c + KING_OFFSETS[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (board[(nr << 3) | nc] === enemyKing) return true;
    }
  }

  // 4. Diagonal rays (Bishop / Queen)
  const enemyBishop = bySide * BISHOP;
  const enemyQueen = bySide * QUEEN;
  for (let i = 0; i < 4; i++) {
    const dr = BISHOP_DIRS[i][0];
    const dc = BISHOP_DIRS[i][1];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[(nr << 3) | nc];
      if (p !== EMPTY) {
        if (p === enemyBishop || p === enemyQueen) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // 5. Orthogonal rays (Rook / Queen)
  const enemyRook = bySide * ROOK;
  for (let i = 0; i < 4; i++) {
    const dr = ROOK_DIRS[i][0];
    const dc = ROOK_DIRS[i][1];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[(nr << 3) | nc];
      if (p !== EMPTY) {
        if (p === enemyRook || p === enemyQueen) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

function findKingSq(pos, side) {
  const cached = side === WHITE ? pos.wKingSq : pos.bKingSq;
  const target = side * KING;
  if (cached >= 0 && cached < 64 && pos.board[cached] === target) {
    return cached;
  }
  for (let sq = 0; sq < 64; sq++) {
    if (pos.board[sq] === target) return sq;
  }
  return -1;
}

function isInCheck(pos, side = pos.turn) {
  const kSq = findKingSq(pos, side);
  if (kSq < 0) return false;
  return isSquareAttacked(pos.board, kSq, -side);
}

/**
 * Apply a move immutably and return the next position state.
 */
function applyMove(pos, move) {
  const next = clonePosition(pos);
  const b = next.board;
  const side = pos.turn;

  b[move.from] = EMPTY;

  // En passant removes the pawn beside the origin square
  if (move.isEp) {
    const capSq = ((move.from >> 3) << 3) | (move.to & 7);
    b[capSq] = EMPTY;
  }

  // Place moved (or promoted) piece on destination
  const placed = move.promo ? side * move.promo : move.piece;
  b[move.to] = placed;

  // Move rook during castling
  if (move.isCastle === 'K') {
    if (side === WHITE) {
      b[63] = EMPTY;
      b[61] = ROOK;
    } else {
      b[7] = EMPTY;
      b[5] = -ROOK;
    }
  } else if (move.isCastle === 'Q') {
    if (side === WHITE) {
      b[56] = EMPTY;
      b[59] = ROOK;
    } else {
      b[0] = EMPTY;
      b[3] = -ROOK;
    }
  }

  // Update cached king square
  if (Math.abs(move.piece) === KING) {
    if (side === WHITE) next.wKingSq = move.to;
    else next.bKingSq = move.to;
  }

  // Update castling rights on king/rook move or rook capture on corner square
  let c = next.castling;
  if (move.from === 60 || move.to === 60) c &= ~(CASTLE_WK | CASTLE_WQ);
  if (move.from === 4 || move.to === 4) c &= ~(CASTLE_BK | CASTLE_BQ);
  if (move.from === 63 || move.to === 63) c &= ~CASTLE_WK;
  if (move.from === 56 || move.to === 56) c &= ~CASTLE_WQ;
  if (move.from === 7 || move.to === 7) c &= ~CASTLE_BK;
  if (move.from === 0 || move.to === 0) c &= ~CASTLE_BQ;
  next.castling = c;

  // En passant target square
  next.epSquare = move.isDoublePush ? ((move.from + move.to) >> 1) : -1;

  // Clocks & turn
  next.halfMoveClock =
    Math.abs(move.piece) === PAWN || move.captured !== EMPTY ? 0 : pos.halfMoveClock + 1;
  next.fullMoveNumber = side === BLACK ? pos.fullMoveNumber + 1 : pos.fullMoveNumber;
  next.turn = -side;

  return next;
}

/**
 * Generate all pseudo-legal moves for `pos.turn`, then filter strictly for king safety.
 */
function generateLegalMoves(pos, capturesOnly = false) {
  const pseudo = [];
  const board = pos.board;
  const side = pos.turn;

  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece === EMPTY || piece * side < 0) continue;

    const type = Math.abs(piece);
    const r = sq >> 3;
    const c = sq & 7;

    if (type === PAWN) {
      const dir = side === WHITE ? -1 : 1;
      const startRank = side === WHITE ? 6 : 1;
      const promoRank = side === WHITE ? 0 : 7;
      const nr = r + dir;

      if (nr >= 0 && nr < 8) {
        // Forward push
        const pushSq = (nr << 3) | c;
        if (board[pushSq] === EMPTY) {
          if (nr === promoRank) {
            for (const promo of [QUEEN, ROOK, BISHOP, KNIGHT]) {
              pseudo.push({
                from: sq, to: pushSq, piece, captured: EMPTY,
                promo, isCastle: null, isEp: false, isDoublePush: false,
              });
            }
          } else if (!capturesOnly) {
            pseudo.push({
              from: sq, to: pushSq, piece, captured: EMPTY,
              promo: 0, isCastle: null, isEp: false, isDoublePush: false,
            });
            // Double push from starting rank
            if (r === startRank) {
              const dblSq = ((r + dir * 2) << 3) | c;
              if (board[dblSq] === EMPTY) {
                pseudo.push({
                  from: sq, to: dblSq, piece, captured: EMPTY,
                  promo: 0, isCastle: null, isEp: false, isDoublePush: true,
                });
              }
            }
          }
        }

        // Diagonal captures + En Passant
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nc < 0 || nc > 7) continue;
          const capSq = (nr << 3) | nc;
          const target = board[capSq];

          if (target !== EMPTY && target * side < 0) {
            if (nr === promoRank) {
              for (const promo of [QUEEN, ROOK, BISHOP, KNIGHT]) {
                pseudo.push({
                  from: sq, to: capSq, piece, captured: target,
                  promo, isCastle: null, isEp: false, isDoublePush: false,
                });
              }
            } else {
              pseudo.push({
                from: sq, to: capSq, piece, captured: target,
                promo: 0, isCastle: null, isEp: false, isDoublePush: false,
              });
            }
          } else if (capSq === pos.epSquare) {
            const epVictimSq = (r << 3) | nc;
            if (board[epVictimSq] === -side * PAWN) {
              pseudo.push({
                from: sq, to: capSq, piece, captured: -side * PAWN,
                promo: 0, isCastle: null, isEp: true, isDoublePush: false,
              });
            }
          }
        }
      }
    } else if (type === KNIGHT) {
      for (let i = 0; i < 8; i++) {
        const nr = r + KNIGHT_OFFSETS[i][0];
        const nc = c + KNIGHT_OFFSETS[i][1];
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
        const to = (nr << 3) | nc;
        const target = board[to];
        if (target * side > 0) continue;
        if (capturesOnly && target === EMPTY) continue;
        pseudo.push({
          from: sq, to, piece, captured: target,
          promo: 0, isCastle: null, isEp: false, isDoublePush: false,
        });
      }
    } else if (type === BISHOP || type === ROOK || type === QUEEN) {
      const dirs = type === BISHOP ? BISHOP_DIRS : type === ROOK ? ROOK_DIRS : QUEEN_DIRS;
      for (let i = 0; i < dirs.length; i++) {
        const dr = dirs[i][0];
        const dc = dirs[i][1];
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const to = (nr << 3) | nc;
          const target = board[to];
          if (target === EMPTY) {
            if (!capturesOnly) {
              pseudo.push({
                from: sq, to, piece, captured: EMPTY,
                promo: 0, isCastle: null, isEp: false, isDoublePush: false,
              });
            }
          } else {
            if (target * side < 0) {
              pseudo.push({
                from: sq, to, piece, captured: target,
                promo: 0, isCastle: null, isEp: false, isDoublePush: false,
              });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
    } else if (type === KING) {
      for (let i = 0; i < 8; i++) {
        const nr = r + KING_OFFSETS[i][0];
        const nc = c + KING_OFFSETS[i][1];
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
        const to = (nr << 3) | nc;
        const target = board[to];
        if (target * side > 0) continue;
        if (capturesOnly && target === EMPTY) continue;
        pseudo.push({
          from: sq, to, piece, captured: target,
          promo: 0, isCastle: null, isEp: false, isDoublePush: false,
        });
      }

      // Castling (only when not capturesOnly)
      if (!capturesOnly) {
        if (side === WHITE && sq === 60 && !isSquareAttacked(board, 60, BLACK)) {
          // Kingside O-O (e1 -> g1)
          if (
            (pos.castling & CASTLE_WK) &&
            board[63] === ROOK &&
            board[61] === EMPTY &&
            board[62] === EMPTY &&
            !isSquareAttacked(board, 61, BLACK) &&
            !isSquareAttacked(board, 62, BLACK)
          ) {
            pseudo.push({
              from: 60, to: 62, piece, captured: EMPTY,
              promo: 0, isCastle: 'K', isEp: false, isDoublePush: false,
            });
          }
          // Queenside O-O-O (e1 -> c1)
          if (
            (pos.castling & CASTLE_WQ) &&
            board[56] === ROOK &&
            board[57] === EMPTY &&
            board[58] === EMPTY &&
            board[59] === EMPTY &&
            !isSquareAttacked(board, 59, BLACK) &&
            !isSquareAttacked(board, 58, BLACK)
          ) {
            pseudo.push({
              from: 60, to: 58, piece, captured: EMPTY,
              promo: 0, isCastle: 'Q', isEp: false, isDoublePush: false,
            });
          }
        } else if (side === BLACK && sq === 4 && !isSquareAttacked(board, 4, WHITE)) {
          // Kingside O-O (e8 -> g8)
          if (
            (pos.castling & CASTLE_BK) &&
            board[7] === -ROOK &&
            board[5] === EMPTY &&
            board[6] === EMPTY &&
            !isSquareAttacked(board, 5, WHITE) &&
            !isSquareAttacked(board, 6, WHITE)
          ) {
            pseudo.push({
              from: 4, to: 6, piece, captured: EMPTY,
              promo: 0, isCastle: 'K', isEp: false, isDoublePush: false,
            });
          }
          // Queenside O-O-O (e8 -> c8)
          if (
            (pos.castling & CASTLE_BQ) &&
            board[0] === -ROOK &&
            board[1] === EMPTY &&
            board[2] === EMPTY &&
            board[3] === EMPTY &&
            !isSquareAttacked(board, 3, WHITE) &&
            !isSquareAttacked(board, 2, WHITE)
          ) {
            pseudo.push({
              from: 4, to: 2, piece, captured: EMPTY,
              promo: 0, isCastle: 'Q', isEp: false, isDoublePush: false,
            });
          }
        }
      }
    }
  }

  // Strictly filter out moves leaving own king in check (handles all pins & EP pins)
  const legal = [];
  for (let i = 0; i < pseudo.length; i++) {
    const mv = pseudo[i];
    const nextPos = applyMove(pos, mv);
    const ownKing = findKingSq(nextPos, side);
    if (ownKing >= 0 && !isSquareAttacked(nextPos.board, ownKing, -side)) {
      legal.push(mv);
    }
  }
  return legal;
}

/**
 * Position key for threefold repetition (includes EP only if an enemy pawn sits adjacent).
 */
function getPositionKey(pos) {
  let epPart = '-';
  if (pos.epSquare >= 0) {
    const epR = pos.epSquare >> 3;
    const epC = pos.epSquare & 7;
    const pawnRow = pos.turn === WHITE ? epR + 1 : epR - 1;
    const moverPawn = pos.turn * PAWN;
    const hasAdjacentPawn =
      (epC > 0 && pos.board[(pawnRow << 3) | (epC - 1)] === moverPawn) ||
      (epC < 7 && pos.board[(pawnRow << 3) | (epC + 1)] === moverPawn);
    if (hasAdjacentPawn) {
      epPart = String(pos.epSquare);
    }
  }
  return `${pos.board.join(',')}|${pos.turn}|${pos.castling}|${epPart}`;
}

/**
 * Detect insufficient mating material (K vs K, K+B vs K, K+N vs K, K+B vs K+B same color).
 */
function isInsufficientMaterial(pos) {
  const board = pos.board;
  let knights = 0;
  let bishopSquareColors = null;

  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p === EMPTY) continue;
    const t = Math.abs(p);
    if (t === KING) continue;
    if (t === PAWN || t === ROOK || t === QUEEN) return false;
    if (t === KNIGHT) {
      knights++;
      if (knights > 1) return false;
    } else if (t === BISHOP) {
      const sqColor = ((sq >> 3) + (sq & 7)) & 1;
      if (bishopSquareColors === null) {
        bishopSquareColors = sqColor;
      } else if (bishopSquareColors !== sqColor) {
        return false;
      }
    }
  }

  // K+N + any bishop on board can checkmate
  if (knights === 1 && bishopSquareColors !== null) return false;
  return true;
}

/**
 * Return comprehensive game status: active | checkmate | stalemate | draw.
 */
function getGameStatus(pos, legalMoves = null, repetitionCounts = null) {
  const moves = legalMoves || generateLegalMoves(pos);
  const inCheck = isInCheck(pos, pos.turn);

  if (moves.length === 0) {
    if (inCheck) {
      return {
        over: true,
        state: 'checkmate',
        winner: -pos.turn,
        inCheck: true,
        reason: 'checkmate',
      };
    }
    return {
      over: true,
      state: 'draw',
      winner: 0,
      inCheck: false,
      reason: 'stalemate',
    };
  }

  if (pos.halfMoveClock >= 100) {
    return {
      over: true,
      state: 'draw',
      winner: 0,
      inCheck,
      reason: 'fifty-move',
    };
  }

  if (isInsufficientMaterial(pos)) {
    return {
      over: true,
      state: 'draw',
      winner: 0,
      inCheck,
      reason: 'insufficient',
    };
  }

  if (repetitionCounts) {
    const key = getPositionKey(pos);
    if ((repetitionCounts.get(key) || 0) >= 3) {
      return {
        over: true,
        state: 'draw',
        winner: 0,
        inCheck,
        reason: 'repetition',
      };
    }
  }

  return {
    over: false,
    state: 'active',
    winner: 0,
    inCheck,
    reason: null,
  };
}

/**
 * Format move into authentic Standard Algebraic Notation (SAN).
 */
function formatMoveSAN(pos, move, allLegalMoves, nextPos = null) {
  let san = '';
  const type = Math.abs(move.piece);
  const isCapture = move.captured !== EMPTY || move.isEp;

  if (move.isCastle === 'K') {
    san = 'O-O';
  } else if (move.isCastle === 'Q') {
    san = 'O-O-O';
  } else {
    if (type === PAWN) {
      if (isCapture) {
        san += FILES[move.from & 7] + 'x';
      }
      san += sqToAlg(move.to);
      if (move.promo) {
        san += '=' + TYPE_TO_SAN[move.promo];
      }
    } else {
      san += TYPE_TO_SAN[type];
      // Disambiguation if another identical piece can legally move to `move.to`
      const rivals = allLegalMoves.filter(
        (m) => m.from !== move.from && m.to === move.to && m.piece === move.piece
      );
      if (rivals.length > 0) {
        const fromFile = move.from & 7;
        const fromRank = move.from >> 3;
        const sameFile = rivals.some((m) => (m.from & 7) === fromFile);
        const sameRank = rivals.some((m) => (m.from >> 3) === fromRank);
        if (!sameFile) {
          san += FILES[fromFile];
        } else if (!sameRank) {
          san += RANKS[fromRank];
        } else {
          san += sqToAlg(move.from);
        }
      }
      if (isCapture) san += 'x';
      san += sqToAlg(move.to);
    }
  }

  const after = nextPos || applyMove(pos, move);
  if (isInCheck(after, after.turn)) {
    const oppMoves = generateLegalMoves(after);
    san += oppMoves.length === 0 ? '#' : '+';
  }

  return san;
}

// ============================================================================
// 3. AI OPPONENT ("RizkyBot Chess") - ALPHA-BETA MINIMAX + PST + MVV-LVA
// ============================================================================

const MATE_SCORE = 100000;
const MAX_SEARCH_NODES = 48000;

/**
 * Static board evaluation in centipawns from `pos.turn`'s perspective.
 */
function evaluatePosition(pos) {
  const board = pos.board;
  let scoreWhite = 0;
  let nonPawnMaterial = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p === EMPTY) continue;
    const type = Math.abs(p);
    if (type !== PAWN && type !== KING) {
      nonPawnMaterial += PIECE_VALUES[type];
    }
    if (p === BISHOP) whiteBishops++;
    else if (p === -BISHOP) blackBishops++;
  }

  // Endgame blend factor: 0.0 (full middlegame) -> 1.0 (pure endgame)
  const egFactor = Math.max(0, Math.min(1, 1 - (nonPawnMaterial - 1300) / 3600));

  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p === EMPTY) continue;
    const isWhite = p > 0;
    const type = Math.abs(p);
    const pstSq = isWhite ? sq : mirrorSq(sq);

    let val = PIECE_VALUES[type];
    if (type === KING) {
      val += Math.round(PST_KING_MG[pstSq] * (1 - egFactor) + PST_KING_EG[pstSq] * egFactor);
    } else {
      val += PST_BY_TYPE[type][pstSq];
    }

    if (isWhite) scoreWhite += val;
    else scoreWhite -= val;
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) scoreWhite += 28;
  if (blackBishops >= 2) scoreWhite -= 28;

  return pos.turn === WHITE ? scoreWhite : -scoreWhite;
}

function scoreMoveForOrdering(move) {
  let score = 0;
  if (move.captured !== EMPTY) {
    const victim = PIECE_VALUES[Math.abs(move.captured)] || 100;
    const attacker = PIECE_VALUES[Math.abs(move.piece)] || 100;
    score += 10000 + victim * 10 - attacker;
  }
  if (move.promo) {
    score += 8000 + (PIECE_VALUES[move.promo] || 0);
  }
  if (move.isCastle) {
    score += 350;
  }
  // Center square preference for quiet moves
  const r = move.to >> 3;
  const c = move.to & 7;
  if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
    score += 25;
  }
  return score;
}

function orderMoves(moves) {
  if (moves.length <= 1) return moves;
  return moves.slice().sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));
}

function quiescence(pos, alpha, beta, qDepth, ply, ctx) {
  ctx.nodes++;
  const inCheck = isInCheck(pos, pos.turn);

  if (!inCheck) {
    const standPat = evaluatePosition(pos);
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (qDepth <= 0 || ctx.nodes >= ctx.maxNodes) return alpha;
  } else if (qDepth <= 0 || ctx.nodes >= ctx.maxNodes) {
    return evaluatePosition(pos);
  }

  const moves = orderMoves(generateLegalMoves(pos, !inCheck));
  if (inCheck && moves.length === 0) {
    return -MATE_SCORE + ply;
  }

  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i];
    // In quiescence outside check, skip underpromotions
    if (!inCheck && mv.promo && mv.promo !== QUEEN) continue;
    const nextPos = applyMove(pos, mv);
    const score = -quiescence(nextPos, -beta, -alpha, qDepth - 1, ply + 1, ctx);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
    if (ctx.nodes >= ctx.maxNodes) break;
  }

  return alpha;
}

function negamax(pos, depth, alpha, beta, ply, qDepth, ctx) {
  ctx.nodes++;

  if (pos.halfMoveClock >= 100 || isInsufficientMaterial(pos)) {
    return 0;
  }

  if (depth <= 0 || ctx.nodes >= ctx.maxNodes) {
    return qDepth > 0
      ? quiescence(pos, alpha, beta, qDepth, ply, ctx)
      : evaluatePosition(pos);
  }

  const moves = orderMoves(generateLegalMoves(pos, false));
  if (moves.length === 0) {
    if (isInCheck(pos, pos.turn)) {
      return -MATE_SCORE + ply;
    }
    return 0; // Stalemate
  }

  let best = -Infinity;
  for (let i = 0; i < moves.length; i++) {
    const nextPos = applyMove(pos, moves[i]);
    const score = -negamax(nextPos, depth - 1, -beta, -alpha, ply + 1, qDepth, ctx);
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
    if (ctx.nodes >= ctx.maxNodes) break;
  }

  return best;
}

/**
 * Evaluate a single root move given current alpha-beta context.
 */
function evaluateRootMove(pos, move, depth, qDepth, alpha, repetitionCounts, ctx) {
  const nextPos = applyMove(pos, move);

  // Avoid stumbling into threefold repetition when ahead (or seek it when losing)
  if (repetitionCounts) {
    const key = getPositionKey(nextPos);
    if ((repetitionCounts.get(key) || 0) >= 2) {
      return 0;
    }
  }

  if (nextPos.halfMoveClock >= 100 || isInsufficientMaterial(nextPos)) {
    return 0;
  }

  return -negamax(nextPos, depth - 1, -Infinity, -alpha, 1, qDepth, ctx);
}

/**
 * Synchronous best-move search (used for tests and fast Depth 1/2 evaluations).
 */
function chooseBestMove(pos, depth = 2, options = {}) {
  const { qDepth = depth >= 3 ? 4 : depth === 2 ? 3 : 1, jitter = 0, repetitionCounts = null } = options;
  const moves = orderMoves(generateLegalMoves(pos, false));
  if (moves.length === 0) return null;
  if (moves.length === 1) return { move: moves[0], score: 0, nodes: 1 };

  const ctx = { nodes: 0, maxNodes: MAX_SEARCH_NODES };
  let alpha = -Infinity;
  const scored = [];

  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i];
    const score = evaluateRootMove(pos, mv, depth, qDepth, jitter > 0 ? -Infinity : alpha, repetitionCounts, ctx);
    scored.push({ move: mv, score });
    if (score > alpha) alpha = score;
  }

  scored.sort((a, b) => b.score - a.score);

  if (jitter > 0) {
    const topScore = scored[0].score;
    const pool = scored.filter((item) => topScore - item.score <= jitter);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { move: pick.move, score: pick.score, nodes: ctx.nodes };
  }

  return { move: scored[0].move, score: scored[0].score, nodes: ctx.nodes };
}

/**
 * Compute captured pieces & material balance relative to starting army.
 */
function computeCapturedAndMaterial(board) {
  const startCounts = {
    [QUEEN]: 1,
    [ROOK]: 2,
    [BISHOP]: 2,
    [KNIGHT]: 2,
    [PAWN]: 8,
  };
  const liveWhite = { [QUEEN]: 0, [ROOK]: 0, [BISHOP]: 0, [KNIGHT]: 0, [PAWN]: 0 };
  const liveBlack = { [QUEEN]: 0, [ROOK]: 0, [BISHOP]: 0, [KNIGHT]: 0, [PAWN]: 0 };

  let whiteMat = 0;
  let blackMat = 0;

  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p === EMPTY) continue;
    const t = Math.abs(p);
    if (p > 0) {
      whiteMat += MATERIAL_POINTS[t];
      if (liveWhite[t] !== undefined) liveWhite[t]++;
    } else {
      blackMat += MATERIAL_POINTS[t];
      if (liveBlack[t] !== undefined) liveBlack[t]++;
    }
  }

  // Pieces captured BY White are missing Black pieces (and vice versa)
  const capturedByWhite = [];
  const capturedByBlack = [];
  for (const t of [QUEEN, ROOK, BISHOP, KNIGHT, PAWN]) {
    const missingBlack = Math.max(0, startCounts[t] - liveBlack[t]);
    for (let i = 0; i < missingBlack; i++) capturedByWhite.push(-t);
    const missingWhite = Math.max(0, startCounts[t] - liveWhite[t]);
    for (let i = 0; i < missingWhite; i++) capturedByBlack.push(t);
  }

  return {
    capturedByWhite,
    capturedByBlack,
    whiteDiff: whiteMat - blackMat,
    blackDiff: blackMat - whiteMat,
  };
}

// ============================================================================
// 4. CRISP STAUNTON INLINE SVG CHESS PIECES (HIGH-CONTRAST, ZERO EXTERNAL CDN)
// ============================================================================

function buildPieceSvg(pieceVal, sizeAttr = '') {
  const isWhite = pieceVal > 0;
  const type = Math.abs(pieceVal);

  const fill = isWhite ? '#fdfaf2' : '#202124';
  const stroke = isWhite ? '#141414' : '#080808';
  const detail = isWhite ? '#1c1c1c' : '#e8e2d5';
  const dim = sizeAttr ? ` width="${sizeAttr}" height="${sizeAttr}"` : '';

  let shapes = '';
  if (type === PAWN) {
    shapes = `
      <circle cx="22.5" cy="13.5" r="4.5" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
      <path d="M18.5 18.2 C18.5 23.2 14.8 27.5 12.8 33.8 H32.2 C30.2 27.5 26.5 23.2 26.5 18.2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="10.5" y="33.8" width="24" height="4.4" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M16.5 18.5 H28.5 M13.5 34 H31.5" fill="none" stroke="${detail}" stroke-width="1.4" stroke-linecap="round"/>
    `;
  } else if (type === ROOK) {
    shapes = `
      <path d="M11 8.5 H15.8 V12.5 H20 V8.5 H25 V12.5 H29.2 V8.5 H34 V16 L30.8 18.5 H14.2 L11 16 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M14.5 18.5 H30.5 L32 31.2 H13 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="10.5" y="31.2" width="24" height="3.2" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="8.8" y="34.4" width="27.4" height="4" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M13.5 16 H31.5 M14.8 19 H30.2 M13.5 31.2 H31.5" fill="none" stroke="${detail}" stroke-width="1.3"/>
    `;
  } else if (type === KNIGHT) {
    shapes = `
      <path d="M14.5 34.4 C15 27.8 18.4 24.4 21.8 21.8 C19.2 22.3 16.8 24.1 13.8 24.4 C11.5 24.6 10.2 22.9 10.8 20.8 L14.5 15.2 C15.2 13.6 16.8 11.7 19 10.5 L20.2 6.8 L23.8 9.6 C28.4 10 32.2 13.6 33.4 19.8 C34.4 24.8 33.8 30.2 32 34.4 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="10" y="34.4" width="25" height="4" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="18.2" cy="14.8" r="1.25" fill="${detail}"/>
      <circle cx="13.2" cy="21.1" r="0.85" fill="${detail}"/>
      <path d="M23.5 12.2 C27.2 13.4 29.8 17.2 30.2 23.2 C30.4 26.8 29.5 30.2 28.5 33" fill="none" stroke="${detail}" stroke-width="1.3" stroke-linecap="round"/>
    `;
  } else if (type === BISHOP) {
    shapes = `
      <circle cx="22.5" cy="7.4" r="2.3" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>
      <path d="M22.5 10 C16.6 13.8 14.2 19.6 16.2 25.8 H28.8 C30.8 19.6 28.4 13.8 22.5 10 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="15" y="25.8" width="15" height="3" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M13.5 28.8 H31.5 L33.5 34.4 H11.5 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="9.2" y="34.4" width="26.6" height="4" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M22.5 15.2 V21.4 M19.4 18.3 H25.6 M16.5 26 H28.5 M14 34.4 H31" fill="none" stroke="${detail}" stroke-width="1.4" stroke-linecap="round"/>
    `;
  } else if (type === QUEEN) {
    shapes = `
      <path d="M12.2 28.6 L8.5 14.5 L16 21.8 L15.2 11.4 L20.2 21 L22.5 10.2 L24.8 21 L29.8 11.4 L29 21.8 L36.5 14.5 L32.8 28.6 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="8.2" cy="13.2" r="2.1" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="15" cy="9.8" r="2.1" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="22.5" cy="8.4" r="2.2" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="30" cy="9.8" r="2.1" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="36.8" cy="13.2" r="2.1" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <rect x="11.2" y="28.6" width="22.6" height="3" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M10.4 31.6 H34.6 L35.8 34.6 H9.2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="9" y="34.6" width="27" height="3.8" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M13 28.6 H32 M11.5 31.8 H33.5 M11 34.8 H34" fill="none" stroke="${detail}" stroke-width="1.3"/>
    `;
  } else if (type === KING) {
    shapes = `
      <path d="M21 5 H24 V8 H27 V11 H24 V14 H21 V11 H18 V8 H21 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22.5 14.2 C19.4 12.2 11.8 13.6 10.6 20.2 C9.8 24.4 12 27.6 14 29.2 H31 C33 27.6 35.2 24.4 34.4 20.2 C33.2 13.6 25.6 12.2 22.5 14.2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="12.6" y="29.2" width="19.8" height="2.8" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="10.8" y="32" width="23.4" height="2.8" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="9" y="34.8" width="27" height="3.8" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M22.5 14.5 V29 M14 29.2 H31 M12.2 32.2 H32.8 M11 34.8 H34" fill="none" stroke="${detail}" stroke-width="1.3"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"${dim} aria-hidden="true">${shapes}</svg>`;
}

const PIECE_SVG_CACHE = {};
for (const val of [PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, -PAWN, -KNIGHT, -BISHOP, -ROOK, -QUEEN, -KING]) {
  PIECE_SVG_CACHE[val] = buildPieceSvg(val);
}

const PIECE_NAMES_ID = {
  [QUEEN]: 'Menteri (Q)',
  [ROOK]: 'Benteng (R)',
  [BISHOP]: 'Gajah (B)',
  [KNIGHT]: 'Kuda (N)',
  [PAWN]: 'Pion',
  [KING]: 'Raja',
};

// Exported for automated unit / sanity verification without requiring a browser DOM
export const ChessEngine = {
  EMPTY,
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
  WHITE,
  BLACK,
  START_FEN,
  sqToAlg,
  algToSq,
  parseFEN,
  toFEN,
  createInitialPosition,
  isSquareAttacked,
  isInCheck,
  generateLegalMoves,
  applyMove,
  getPositionKey,
  isInsufficientMaterial,
  getGameStatus,
  formatMoveSAN,
  evaluatePosition,
  chooseBestMove,
  computeCapturedAndMaterial,
};

// ============================================================================
// 5. CATUR 95 - AUTHENTIC WINDOWS 95 APPLICATION MODULE
// ============================================================================

export const chessApp = {
  id: 'chess',
  title: 'Catur 95 - Lawan Rizky AI',
  icon: 'chess',
  width: 620,
  height: 500,
  minWidth: 460,
  minHeight: 420,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi) {
    containerEl.innerHTML = `
      <div class="chess-app">
        <div class="chess-toolbar win95-toolbar">
          <div class="chess-toolbar-group">
            <button type="button" class="win95-btn win95-btn-sm chess-tb-btn" data-action="new" title="Mulai permainan baru">Baru</button>
            <button type="button" class="win95-btn win95-btn-sm chess-tb-btn" data-action="undo" title="Batalkan langkah terakhir (Ctrl+Z)" disabled>Undo</button>
            <button type="button" class="win95-btn win95-btn-sm chess-tb-btn" data-action="hint" title="Minta saran langkah terbaik">Hint</button>
            <button type="button" class="win95-btn win95-btn-sm chess-tb-btn" data-action="flip" title="Putar arah papan">Putar</button>
          </div>
          <span class="win95-toolbar-sep" aria-hidden="true"></span>
          <div class="chess-toolbar-group">
            <select class="win95-field chess-mode-select" data-el="mode" aria-label="Mode permainan">
              <option value="ai-1">vs RizkyBot (Santai / D1)</option>
              <option value="ai-2" selected>vs RizkyBot (Menengah / D2)</option>
              <option value="ai-3">vs RizkyBot (Master / D3)</option>
              <option value="pvp">2 Pemain (Lokal)</option>
            </select>
            <div class="chess-color-group" role="group" aria-label="Pilih warna bidak">
              <button type="button" class="win95-btn win95-btn-sm chess-color-btn is-active" data-color="w" title="Main sebagai Putih">
                <span class="chess-color-swatch is-white" aria-hidden="true"></span>Putih
              </button>
              <button type="button" class="win95-btn win95-btn-sm chess-color-btn" data-color="b" title="Main sebagai Hitam">
                <span class="chess-color-swatch is-black" aria-hidden="true"></span>Hitam
              </button>
            </div>
          </div>
        </div>

        <div class="chess-workspace">
          <div class="chess-board-pane">
            <div class="chess-board-stage">
              <div class="chess-board-frame win95-sunken">
                <div class="chess-board-grid-wrap">
                  <div class="chess-ranks" data-el="ranks" aria-hidden="true"></div>
                  <div class="chess-board" data-el="board" role="grid" aria-label="Papan Catur 8x8"></div>
                  <div class="chess-coord" aria-hidden="true"></div>
                  <div class="chess-files" data-el="files" aria-hidden="true"></div>
                </div>
              </div>

              <div class="chess-promo-overlay" data-el="promo-overlay" hidden>
                <div class="chess-promo-dialog win95-raised" role="dialog" aria-modal="true" aria-label="Promosi Pion">
                  <div class="chess-promo-titlebar">Promosi Pion</div>
                  <div class="chess-promo-body">
                    <div class="chess-promo-text" data-el="promo-text">Pilih bidak promosi:</div>
                    <div class="chess-promo-grid" data-el="promo-grid"></div>
                    <div class="chess-promo-footer">
                      <button type="button" class="win95-btn win95-btn-sm" data-action="cancel-promo">Batal</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside class="chess-sidebar">
            <div class="chess-status-box win95-sunken">
              <div class="chess-turn-row">
                <span class="chess-turn-swatch is-white" data-el="turn-swatch" aria-hidden="true"></span>
                <span class="chess-turn-text" data-el="turn-text">Giliran: Putih</span>
              </div>
              <div class="chess-status-sub" data-el="status-sub">vs RizkyBot (Menengah)</div>
              <div class="chess-result-actions" data-el="result-actions" hidden>
                <button type="button" class="win95-btn win95-btn-sm primary" data-action="new">Main Lagi</button>
              </div>
            </div>

            <fieldset class="win95-groupbox chess-captured-box">
              <legend>Bidak Ditangkap</legend>
              <div class="chess-cap-row">
                <span class="chess-cap-label" data-el="cap-top-label">Hitam</span>
                <div class="chess-cap-pieces" data-el="cap-top-pieces"></div>
                <span class="chess-mat-diff" data-el="cap-top-diff" hidden></span>
              </div>
              <div class="chess-cap-row">
                <span class="chess-cap-label" data-el="cap-bot-label">Putih</span>
                <div class="chess-cap-pieces" data-el="cap-bot-pieces"></div>
                <span class="chess-mat-diff" data-el="cap-bot-diff" hidden></span>
              </div>
            </fieldset>

            <div class="chess-history-panel">
              <div class="chess-history-head">
                <span>Notasi Langkah</span>
                <span class="chess-move-count" data-el="move-count">0 langkah</span>
              </div>
              <div class="chess-history-list win95-sunken win95-scrollbar" data-el="history">
                <div class="chess-history-empty">Belum ada langkah.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    `;

    // DOM References
    const boardEl = containerEl.querySelector('[data-el="board"]');
    const ranksEl = containerEl.querySelector('[data-el="ranks"]');
    const filesEl = containerEl.querySelector('[data-el="files"]');
    const modeSelect = containerEl.querySelector('[data-el="mode"]');
    const undoBtn = containerEl.querySelector('[data-action="undo"]');
    const hintBtn = containerEl.querySelector('[data-action="hint"]');
    const colorBtns = containerEl.querySelectorAll('.chess-color-btn');
    const turnSwatchEl = containerEl.querySelector('[data-el="turn-swatch"]');
    const turnTextEl = containerEl.querySelector('[data-el="turn-text"]');
    const statusSubEl = containerEl.querySelector('[data-el="status-sub"]');
    const resultActionsEl = containerEl.querySelector('[data-el="result-actions"]');
    const capTopLabel = containerEl.querySelector('[data-el="cap-top-label"]');
    const capTopPieces = containerEl.querySelector('[data-el="cap-top-pieces"]');
    const capTopDiff = containerEl.querySelector('[data-el="cap-top-diff"]');
    const capBotLabel = containerEl.querySelector('[data-el="cap-bot-label"]');
    const capBotPieces = containerEl.querySelector('[data-el="cap-bot-pieces"]');
    const capBotDiff = containerEl.querySelector('[data-el="cap-bot-diff"]');
    const historyEl = containerEl.querySelector('[data-el="history"]');
    const moveCountEl = containerEl.querySelector('[data-el="move-count"]');
    const promoOverlay = containerEl.querySelector('[data-el="promo-overlay"]');
    const promoText = containerEl.querySelector('[data-el="promo-text"]');
    const promoGrid = containerEl.querySelector('[data-el="promo-grid"]');

    // Mutable App State
    let modeKey = 'ai-2';
    let humanColor = WHITE;
    let flipped = false;
    let snapshots = []; // [{ pos, move, san, key }]
    let currentPos = createInitialPosition();
    let legalMoves = [];
    let gameStatus = null;
    let selectedSq = -1;
    let hintMove = null;
    let pendingPromoMoves = null; // array of 4 legal promotion moves awaiting user pick
    let aiThinking = false;
    let hintThinking = false;
    let jobToken = 0;
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

    function cancelAsyncJobs() {
      jobToken++;
      aiThinking = false;
      hintThinking = false;
      for (const id of activeTimeouts) {
        clearTimeout(id);
      }
      activeTimeouts.clear();
    }

    function buildRepetitionCounts() {
      const counts = new Map();
      for (let i = 0; i < snapshots.length; i++) {
        const k = snapshots[i].key;
        counts.set(k, (counts.get(k) || 0) + 1);
      }
      return counts;
    }

    function isAiTurn() {
      const cfg = MODES[modeKey];
      return cfg.isAi && !gameStatus.over && currentPos.turn !== humanColor;
    }

    function playMoveSound(move, status, moverSide) {
      if (status.state === 'checkmate') {
        const cfg = MODES[modeKey];
        if (cfg.isAi && status.winner !== humanColor) {
          sound.playError();
          scheduleTimeout(() => sound.playBeep(196, 0.16), 140);
        } else {
          sound.playBeep(523, 0.08);
          scheduleTimeout(() => sound.playBeep(659, 0.08), 85);
          scheduleTimeout(() => sound.playBeep(784, 0.09), 170);
          scheduleTimeout(() => sound.playBeep(1047, 0.16), 265);
        }
        return;
      }

      if (status.state === 'draw') {
        sound.playBeep(440, 0.08);
        scheduleTimeout(() => sound.playBeep(392, 0.12), 100);
        return;
      }

      if (status.inCheck) {
        sound.playBeep(780, 0.07);
        scheduleTimeout(() => sound.playBeep(580, 0.09), 80);
        return;
      }

      if (move.promo) {
        sound.playBeep(660, 0.06);
        scheduleTimeout(() => sound.playBeep(880, 0.09), 70);
        return;
      }

      if (move.isCastle) {
        sound.playClick();
        scheduleTimeout(() => sound.playClick(), 85);
        return;
      }

      if (move.captured !== EMPTY || move.isEp) {
        sound.playBeep(moverSide === WHITE ? 380 : 340, 0.055);
        scheduleTimeout(() => sound.playBeep(240, 0.045), 48);
        return;
      }

      sound.playClick();
    }

    function hidePromotionModal() {
      pendingPromoMoves = null;
      promoOverlay.hidden = true;
      promoGrid.innerHTML = '';
    }

    function showPromotionModal(promoMoves) {
      pendingPromoMoves = promoMoves;
      const side = currentPos.turn;
      const destAlg = sqToAlg(promoMoves[0].to);
      promoText.textContent = `Pilih bidak promosi untuk pion di ${destAlg}:`;
      promoGrid.innerHTML = '';

      const order = [QUEEN, ROOK, BISHOP, KNIGHT];
      for (const pieceType of order) {
        const mv = promoMoves.find((m) => m.promo === pieceType);
        if (!mv) continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'win95-btn chess-promo-btn';
        btn.dataset.promo = String(pieceType);
        btn.innerHTML = `
          <span class="chess-promo-icon">${PIECE_SVG_CACHE[side * pieceType]}</span>
          <span class="chess-promo-label">${PIECE_NAMES_ID[pieceType]}</span>
        `;
        promoGrid.appendChild(btn);
      }

      promoOverlay.hidden = false;
      sound.playClick();
    }

    function renderCoordinates() {
      ranksEl.innerHTML = '';
      filesEl.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const rankLabel = document.createElement('div');
        rankLabel.className = 'chess-coord';
        rankLabel.textContent = flipped ? String(i + 1) : String(8 - i);
        ranksEl.appendChild(rankLabel);

        const fileLabel = document.createElement('div');
        fileLabel.className = 'chess-coord';
        fileLabel.textContent = flipped ? FILES[7 - i] : FILES[i];
        filesEl.appendChild(fileLabel);
      }
    }

    function renderBoard() {
      const lastSnap = snapshots.length > 1 ? snapshots[snapshots.length - 1] : null;
      const lastMove = lastSnap ? lastSnap.move : null;
      const checkedKingSq = gameStatus.inCheck ? findKingSq(currentPos, currentPos.turn) : -1;

      const selectedMovesMap = new Map();
      if (selectedSq >= 0) {
        for (let i = 0; i < legalMoves.length; i++) {
          const mv = legalMoves[i];
          if (mv.from === selectedSq) {
            // Multiple promotion moves share the same destination square; store first
            if (!selectedMovesMap.has(mv.to)) {
              selectedMovesMap.set(mv.to, mv);
            }
          }
        }
      }

      const frag = document.createDocumentFragment();
      for (let viewRow = 0; viewRow < 8; viewRow++) {
        for (let viewCol = 0; viewCol < 8; viewCol++) {
          const r = flipped ? 7 - viewRow : viewRow;
          const c = flipped ? 7 - viewCol : viewCol;
          const sq = (r << 3) | c;
          const piece = currentPos.board[sq];
          const isLight = ((r + c) & 1) === 0;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `chess-sq ${isLight ? 'chess-sq-light' : 'chess-sq-dark'}`;
          btn.dataset.sq = String(sq);

          const targetMove = selectedMovesMap.get(sq);
          if (sq === selectedSq) btn.classList.add('is-selected');
          if (lastMove && sq === lastMove.from) btn.classList.add('is-last-from');
          if (lastMove && sq === lastMove.to) btn.classList.add('is-last-to');
          if (sq === checkedKingSq) btn.classList.add('is-check');
          if (hintMove && sq === hintMove.from) btn.classList.add('is-hint-from');
          if (hintMove && sq === hintMove.to) btn.classList.add('is-hint-to');

          if (targetMove) {
            const isCap = targetMove.captured !== EMPTY || targetMove.isEp;
            btn.classList.add(isCap ? 'is-capture' : 'is-legal');
            const marker = document.createElement('span');
            marker.className = isCap ? 'chess-capture-ring' : 'chess-move-dot';
            marker.setAttribute('aria-hidden', 'true');
            btn.appendChild(marker);
          }

          if (piece !== EMPTY) {
            const pieceWrap = document.createElement('span');
            pieceWrap.className = `chess-piece ${piece > 0 ? 'chess-piece-w' : 'chess-piece-b'}`;
            pieceWrap.innerHTML = PIECE_SVG_CACHE[piece];
            btn.appendChild(pieceWrap);
          }

          const alg = sqToAlg(sq);
          const pieceDesc = piece !== EMPTY
            ? `${piece > 0 ? 'Putih' : 'Hitam'} ${PIECE_NAMES_ID[Math.abs(piece)]}`
            : 'Kosong';
          btn.setAttribute('aria-label', `${alg}: ${pieceDesc}`);
          frag.appendChild(btn);
        }
      }

      boardEl.innerHTML = '';
      boardEl.appendChild(frag);
    }

    function renderCaptured() {
      const mat = computeCapturedAndMaterial(currentPos.board);
      // Top row corresponds to player at top of board; bottom row corresponds to player at bottom
      const topIsWhite = flipped;
      const topList = topIsWhite ? mat.capturedByWhite : mat.capturedByBlack;
      const botList = topIsWhite ? mat.capturedByBlack : mat.capturedByWhite;
      const topDiff = topIsWhite ? mat.whiteDiff : mat.blackDiff;
      const botDiff = topIsWhite ? mat.blackDiff : mat.whiteDiff;

      const cfg = MODES[modeKey];
      const whiteName = cfg.isAi ? (humanColor === WHITE ? 'Putih (Anda)' : 'Putih (AI)') : 'Putih';
      const blackName = cfg.isAi ? (humanColor === BLACK ? 'Hitam (Anda)' : 'Hitam (AI)') : 'Hitam';

      capTopLabel.textContent = topIsWhite ? whiteName : blackName;
      capBotLabel.textContent = topIsWhite ? blackName : whiteName;

      capTopPieces.innerHTML = topList
        .map((p) => `<span class="chess-cap-icon">${PIECE_SVG_CACHE[p]}</span>`)
        .join('');
      capBotPieces.innerHTML = botList
        .map((p) => `<span class="chess-cap-icon">${PIECE_SVG_CACHE[p]}</span>`)
        .join('');

      if (topDiff > 0) {
        capTopDiff.textContent = `+${topDiff}`;
        capTopDiff.hidden = false;
      } else {
        capTopDiff.hidden = true;
      }

      if (botDiff > 0) {
        capBotDiff.textContent = `+${botDiff}`;
        capBotDiff.hidden = false;
      } else {
        capBotDiff.hidden = true;
      }
    }

    function renderHistory() {
      const plyCount = snapshots.length - 1;
      moveCountEl.textContent = `${plyCount} langkah`;

      if (plyCount <= 0) {
        historyEl.innerHTML = '<div class="chess-history-empty">Belum ada langkah.</div>';
        return;
      }

      const frag = document.createDocumentFragment();
      for (let i = 1; i < snapshots.length; i += 2) {
        const moveNum = ((i - 1) >> 1) + 1;
        const whiteSnap = snapshots[i];
        const blackSnap = snapshots[i + 1] || null;

        const row = document.createElement('div');
        row.className = 'chess-history-row';

        const numEl = document.createElement('span');
        numEl.className = 'chess-move-num';
        numEl.textContent = `${moveNum}.`;
        row.appendChild(numEl);

        const wEl = document.createElement('span');
        wEl.className = 'chess-move-san';
        if (i === snapshots.length - 1) wEl.classList.add('is-latest');
        wEl.textContent = whiteSnap.san;
        row.appendChild(wEl);

        const bEl = document.createElement('span');
        bEl.className = 'chess-move-san';
        if (blackSnap) {
          if (i + 1 === snapshots.length - 1) bEl.classList.add('is-latest');
          bEl.textContent = blackSnap.san;
        }
        row.appendChild(bEl);

        frag.appendChild(row);
      }

      historyEl.innerHTML = '';
      historyEl.appendChild(frag);
      historyEl.scrollTop = historyEl.scrollHeight;
    }

    function renderStatus() {
      const cfg = MODES[modeKey];
      const plyCount = snapshots.length - 1;
      const sideLabel = currentPos.turn === WHITE ? 'Putih' : 'Hitam';

      turnSwatchEl.className = 'chess-turn-swatch';
      resultActionsEl.hidden = !gameStatus.over;

      if (gameStatus.over) {
        turnSwatchEl.classList.add('is-over');
        if (gameStatus.state === 'checkmate') {
          const winnerName = gameStatus.winner === WHITE ? 'Putih' : 'Hitam';
          turnTextEl.textContent = `SKAKMAT! ${winnerName} Menang`;
          if (cfg.isAi) {
            statusSubEl.textContent =
              gameStatus.winner === humanColor
                ? 'Selamat! Anda mengalahkan RizkyBot!'
                : 'RizkyBot memenangkan pertandingan.';
          } else {
            statusSubEl.textContent = `Pertandingan selesai dalam ${plyCount} langkah.`;
          }
          winApi.setStatus(`Skakmat: ${winnerName} menang (${plyCount} langkah). Klik "Baru" untuk main lagi.`);
        } else {
          const drawReasons = {
            stalemate: 'Pat (Stalemate)',
            'fifty-move': 'Aturan 50 Langkah',
            insufficient: 'Material Tidak Cukup',
            repetition: 'Pengulangan Posisi 3×',
          };
          const reasonText = drawReasons[gameStatus.reason] || 'Seri';
          turnTextEl.textContent = 'REMIS (Seri)';
          statusSubEl.textContent = reasonText;
          winApi.setStatus(`Permainan Remis: ${reasonText} (${plyCount} langkah).`);
        }
      } else if (aiThinking) {
        turnSwatchEl.classList.add('is-thinking');
        turnTextEl.textContent = 'RizkyBot berpikir...';
        statusSubEl.textContent = cfg.label;
        winApi.setStatus(`RizkyBot sedang menganalisis langkah (${cfg.label})...`);
      } else {
        turnSwatchEl.classList.add(currentPos.turn === WHITE ? 'is-white' : 'is-black');
        if (gameStatus.inCheck) {
          turnSwatchEl.classList.add('is-check');
          turnTextEl.textContent = `SKAK! Giliran ${sideLabel}`;
          statusSubEl.textContent = `Raja ${sideLabel} terancam, wajib selamatkan!`;
          winApi.setStatus(`SKAK! Giliran ${sideLabel}: ${legalMoves.length} langkah legal tersedia.`);
        } else {
          turnTextEl.textContent = `Giliran: ${sideLabel}`;
          statusSubEl.textContent = cfg.label;
          if (hintMove) {
            const hintSan = formatMoveSAN(currentPos, hintMove, legalMoves);
            winApi.setStatus(`Saran RizkyBot: ${hintSan} (${sqToAlg(hintMove.from)} -> ${sqToAlg(hintMove.to)})`);
          } else {
            winApi.setStatus(`${cfg.label} | Giliran ${sideLabel} (${legalMoves.length} langkah legal)`);
          }
        }
      }

      // Sync toolbar button states
      const canUndo = cfg.isAi
        ? (aiThinking ? plyCount >= 1 : (humanColor === WHITE ? plyCount >= 1 : plyCount >= 2))
        : plyCount >= 1;
      undoBtn.disabled = !canUndo;
      hintBtn.disabled = gameStatus.over || aiThinking || hintThinking;

      colorBtns.forEach((btn) => {
        btn.disabled = !cfg.isAi;
        const isWhiteBtn = btn.dataset.color === 'w';
        btn.classList.toggle('is-active', (isWhiteBtn && humanColor === WHITE) || (!isWhiteBtn && humanColor === BLACK));
      });
    }

    function renderAll() {
      renderCoordinates();
      renderBoard();
      renderCaptured();
      renderHistory();
      renderStatus();
    }

    /**
     * Non-blocking chunked alpha-beta root search so the browser never freezes on Depth 3.
     */
    function runAsyncSearch(pos, depth, qDepth, jitter, onDone) {
      const token = ++jobToken;
      const moves = orderMoves(generateLegalMoves(pos, false));
      if (moves.length === 0) {
        onDone(null);
        return;
      }
      if (moves.length === 1) {
        scheduleTimeout(() => {
          if (token !== jobToken) return;
          onDone(moves[0]);
        }, 120);
        return;
      }

      const repetitionCounts = buildRepetitionCounts();
      const ctx = { nodes: 0, maxNodes: MAX_SEARCH_NODES };
      const scored = [];
      let alpha = -Infinity;
      let idx = 0;

      function processChunk() {
        if (disposed || token !== jobToken) return;
        const chunkStart = Date.now();

        while (idx < moves.length) {
          const mv = moves[idx++];
          const score = evaluateRootMove(
            pos,
            mv,
            depth,
            qDepth,
            jitter > 0 ? -Infinity : alpha,
            repetitionCounts,
            ctx
          );
          scored.push({ move: mv, score });
          if (score > alpha) alpha = score;

          // Yield back to UI thread every ~24ms so interactions stay responsive
          if (Date.now() - chunkStart >= 24 && idx < moves.length) {
            scheduleTimeout(processChunk, 0);
            return;
          }
        }

        scored.sort((a, b) => b.score - a.score);
        let chosen = scored[0].move;
        if (jitter > 0) {
          const topScore = scored[0].score;
          const pool = scored.filter((item) => topScore - item.score <= jitter);
          chosen = pool[Math.floor(Math.random() * pool.length)].move;
        }
        onDone(chosen);
      }

      // Brief natural pause so player sees their move clearly before RizkyBot replies
      scheduleTimeout(processChunk, 220);
    }

    function maybeTriggerAiTurn() {
      if (!isAiTurn()) return;
      const cfg = MODES[modeKey];
      aiThinking = true;
      selectedSq = -1;
      hintMove = null;
      renderStatus();

      runAsyncSearch(currentPos, cfg.depth, cfg.qDepth, cfg.jitter, (bestMove) => {
        aiThinking = false;
        if (!bestMove || gameStatus.over) {
          renderAll();
          return;
        }
        commitMove(bestMove);
      });
    }

    function commitMove(move) {
      cancelAsyncJobs();
      const moverSide = currentPos.turn;
      const nextPos = applyMove(currentPos, move);
      const san = formatMoveSAN(currentPos, move, legalMoves, nextPos);
      const nextKey = getPositionKey(nextPos);

      snapshots.push({
        pos: nextPos,
        move,
        san,
        key: nextKey,
      });

      currentPos = nextPos;
      selectedSq = -1;
      hintMove = null;
      hidePromotionModal();

      legalMoves = generateLegalMoves(currentPos, false);
      gameStatus = getGameStatus(currentPos, legalMoves, buildRepetitionCounts());

      playMoveSound(move, gameStatus, moverSide);
      renderAll();

      if (!gameStatus.over) {
        maybeTriggerAiTurn();
      }
    }

    function startNewGame() {
      cancelAsyncJobs();
      hidePromotionModal();
      currentPos = createInitialPosition();
      snapshots = [{
        pos: currentPos,
        move: null,
        san: null,
        key: getPositionKey(currentPos),
      }];
      selectedSq = -1;
      hintMove = null;
      legalMoves = generateLegalMoves(currentPos, false);
      gameStatus = getGameStatus(currentPos, legalMoves, buildRepetitionCounts());
      renderAll();
      maybeTriggerAiTurn();
    }

    function performUndo() {
      const cfg = MODES[modeKey];
      const wasAiThinking = aiThinking;
      cancelAsyncJobs();
      hidePromotionModal();

      let pliesToUndo = 1;
      if (cfg.isAi) {
        if (wasAiThinking) {
          // AI hadn't replied yet -> undo human's last move
          pliesToUndo = 1;
        } else if (gameStatus.over) {
          // Undo back to human's last turn
          pliesToUndo = currentPos.turn === humanColor ? 2 : 1;
        } else if (currentPos.turn === humanColor) {
          pliesToUndo = 2;
        } else {
          pliesToUndo = 1;
        }
        // Never undo White's opening AI move if human plays Black and only 1 ply exists
        const minLen = humanColor === BLACK ? 2 : 1;
        if (snapshots.length <= minLen) {
          renderAll();
          return;
        }
        const targetLen = Math.max(minLen, snapshots.length - pliesToUndo);
        snapshots = snapshots.slice(0, targetLen);
      } else {
        if (snapshots.length <= 1) return;
        snapshots = snapshots.slice(0, snapshots.length - 1);
      }

      currentPos = clonePosition(snapshots[snapshots.length - 1].pos);
      selectedSq = -1;
      hintMove = null;
      legalMoves = generateLegalMoves(currentPos, false);
      gameStatus = getGameStatus(currentPos, legalMoves, buildRepetitionCounts());
      sound.playClick();
      renderAll();
    }

    function requestHint() {
      if (gameStatus.over || aiThinking || hintThinking) return;
      hintThinking = true;
      hintMove = null;
      selectedSq = -1;
      sound.playClick();
      renderStatus();
      winApi.setStatus('Mencari saran langkah terbaik...');

      runAsyncSearch(currentPos, 2, 3, 0, (bestMove) => {
        hintThinking = false;
        if (!bestMove) {
          renderStatus();
          return;
        }
        hintMove = bestMove;
        selectedSq = bestMove.from;
        sound.playBeep(680, 0.055);
        renderBoard();
        renderStatus();
      });
    }

    function handleSquareClick(sq) {
      if (gameStatus.over || aiThinking || !promoOverlay.hidden) return;
      if (isAiTurn()) return;

      const piece = currentPos.board[sq];

      // 1. If a square is already selected, check if `sq` is a legal destination
      if (selectedSq >= 0) {
        const matching = legalMoves.filter((m) => m.from === selectedSq && m.to === sq);
        if (matching.length > 0) {
          if (matching.length > 1 && matching[0].promo) {
            showPromotionModal(matching);
          } else {
            commitMove(matching[0]);
          }
          return;
        }
      }

      // 2. Clicking the already-selected square deselects it
      if (sq === selectedSq) {
        selectedSq = -1;
        renderBoard();
        return;
      }

      // 3. Clicking a friendly piece selects it
      if (piece !== EMPTY && piece * currentPos.turn > 0) {
        selectedSq = sq;
        hintMove = null;
        sound.playClick();
        renderBoard();
        renderStatus();
        return;
      }

      // 4. Otherwise clear selection
      if (selectedSq >= 0) {
        selectedSq = -1;
        renderBoard();
      }
    }

    // Event Listeners
    const onBoardClick = (e) => {
      const sqBtn = e.target.closest('.chess-sq');
      if (!sqBtn) return;
      const sq = parseInt(sqBtn.dataset.sq, 10);
      if (Number.isInteger(sq) && sq >= 0 && sq < 64) {
        handleSquareClick(sq);
      }
    };

    const onBoardContextMenu = (e) => {
      e.preventDefault();
      if (selectedSq >= 0 || hintMove) {
        selectedSq = -1;
        hintMove = null;
        renderBoard();
        renderStatus();
      }
    };

    const onContainerClick = (e) => {
      const promoBtn = e.target.closest('[data-promo]');
      if (promoBtn && pendingPromoMoves) {
        const promoType = parseInt(promoBtn.dataset.promo, 10);
        const chosen = pendingPromoMoves.find((m) => m.promo === promoType);
        if (chosen) {
          commitMove(chosen);
        }
        return;
      }

      const colorBtn = e.target.closest('[data-color]');
      if (colorBtn && !colorBtn.disabled) {
        const nextColor = colorBtn.dataset.color === 'b' ? BLACK : WHITE;
        if (nextColor !== humanColor) {
          humanColor = nextColor;
          flipped = humanColor === BLACK;
          sound.playClick();
          startNewGame();
        }
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn || actionBtn.disabled) return;
      const action = actionBtn.dataset.action;

      if (action === 'new') {
        sound.playOpen();
        startNewGame();
      } else if (action === 'undo') {
        performUndo();
      } else if (action === 'hint') {
        requestHint();
      } else if (action === 'flip') {
        flipped = !flipped;
        sound.playClick();
        renderCoordinates();
        renderBoard();
        renderCaptured();
      } else if (action === 'cancel-promo') {
        sound.playClick();
        hidePromotionModal();
      }
    };

    const onModeChange = () => {
      const nextMode = modeSelect.value;
      if (!MODES[nextMode]) return;
      modeKey = nextMode;
      sound.playClick();
      if (!MODES[modeKey].isAi) {
        // Keep current position in PvP if mid-game? Fresh start is cleaner & predictable
        flipped = false;
        startNewGame();
      } else {
        flipped = humanColor === BLACK;
        startNewGame();
      }
    };

    const onWindowKeyDown = (e) => {
      // Only respond when Catur 95 window is focused/active
      if (!winApi.el || !winApi.el.classList.contains('is-active')) return;
      if (e.key === 'Escape') {
        if (!promoOverlay.hidden) {
          hidePromotionModal();
          sound.playClick();
        } else if (selectedSq >= 0 || hintMove) {
          selectedSq = -1;
          hintMove = null;
          renderBoard();
          renderStatus();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!undoBtn.disabled) {
          e.preventDefault();
          performUndo();
        }
      }
    };

    boardEl.addEventListener('click', onBoardClick);
    boardEl.addEventListener('contextmenu', onBoardContextMenu);
    containerEl.addEventListener('click', onContainerClick);
    modeSelect.addEventListener('change', onModeChange);
    window.addEventListener('keydown', onWindowKeyDown);

    // Initialize game
    startNewGame();

    // Guaranteed cleanup when window closes
    winApi.onClose(() => {
      disposed = true;
      cancelAsyncJobs();
      boardEl.removeEventListener('click', onBoardClick);
      boardEl.removeEventListener('contextmenu', onBoardContextMenu);
      containerEl.removeEventListener('click', onContainerClick);
      modeSelect.removeEventListener('change', onModeChange);
      window.removeEventListener('keydown', onWindowKeyDown);
    });
  },
};
