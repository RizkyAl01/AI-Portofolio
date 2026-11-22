import {
  PROFILE,
  EXPERIENCES,
  PROJECTS,
  SKILLS,
  CERTIFICATES
} from '../data.js';
import { getIconSVG } from '../icons.js';
import { sound } from '../sound.js';

const RIZKY_PHOTO_SRC = PROFILE?.photo || 'assets/images/IMG-20250903-WA0024.jpg';
if (typeof Image !== 'undefined' && RIZKY_PHOTO_SRC) {
  const preloadedPhoto = new Image();
  preloadedPhoto.src = RIZKY_PHOTO_SRC;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeAssetUrl(rawPath) {
  const path = String(rawPath ?? '').trim();
  if (!path) return '';
  if (/^(javascript|data|vbscript):/i.test(path)) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return encodeURI(normalized);
}

function isLocalPdfPath(rawUrl) {
  const url = String(rawUrl ?? '').trim();
  return /^assets\/[^\s<>"']+\.pdf$/i.test(url);
}

const VALID_ICON_KEYS = new Set([
  'computer', 'ie', 'messenger', 'dos', 'notepad', 'wordpad', 'folder',
  'folder-open', 'pdf', 'game', 'minesweeper', 'guestbook', 'room3d',
  'display', 'recycle-empty', 'recycle-full', 'start', 'sound-on',
  'sound-off', 'info', 'warning', 'error', 'file', 'link', 'ai',
  'shutdown', 'programs', 'documents', 'settings'
]);

function safeIconKey(key, fallback = 'info') {
  return VALID_ICON_KEYS.has(key) ? key : fallback;
}

const OFFICIAL_TARGETS = {
  linkedin: {
    id: 'linkedin',
    title: 'Rizky Alviando, S.Mat. | LinkedIn',
    url: PROFILE?.linkedin || 'https://www.linkedin.com/in/rizky-alviando-31b47021b/',
    breadcrumb: 'https://www.linkedin.com › in › rizky-alviando-31b47021b',
    displayUrl: 'linkedin.com/in/rizky-alviando-31b47021b',
    badge: 'LINKEDIN PROFILE',
    desc: 'AI Engineer di DJED Komdigi · S1 Matematika ITS (Cum Laude, IPK 3.67/4.00) · Bangkit Academy ML Graduate · Best Presentation GPBL Shibaura Institute of Technology Tokyo.'
  },
  github: {
    id: 'github',
    title: 'RizkyAl01 (Rizky Alviando) · GitHub',
    url: PROFILE?.github || 'https://github.com/RizkyAl01',
    breadcrumb: 'https://github.com › RizkyAl01',
    displayUrl: 'github.com/RizkyAl01',
    badge: 'GITHUB PROFILE',
    desc: 'Repositori kode open-source Rizky Alviando: Smart Agentic RAG, LexGraph Legal Graph-RAG, AegisLake Medallion Pipeline, SentinelEval, NusantaraASR, dan RizkyOS 95.'
  },
  canva: {
    id: 'canva',
    title: 'Portofolio AI & Machine Learning 2026 — Rizky Alviando',
    url: PROFILE?.canvaPortfolio || 'https://canva.link/Rizky-Alviando-PortoAIML26',
    breadcrumb: 'https://canva.link › Rizky-Alviando-PortoAIML26',
    displayUrl: 'canva.link/Rizky-Alviando-PortoAIML26',
    badge: 'SLIDE DECK',
    desc: 'Slide deck presentasi visual portofolio AI & Machine Learning Rizky Alviando (dirender langsung di dalam Internet Explorer 4.0).'
  },
  rag_demo: {
    id: 'rag_demo',
    title: 'Smart Agentic RAG: AI Document Assistant (Production Demo)',
    url: 'https://project-rag-zeta.vercel.app/',
    breadcrumb: 'https://project-rag-zeta.vercel.app › agentic-rag',
    displayUrl: 'project-rag-zeta.vercel.app',
    badge: 'RAG SYSTEM',
    desc: 'Aplikasi tanya-jawab dokumen PDF pintar menggunakan LangGraph state machine, FastAPI, Groq LLM, PyMuPDF, dan Supabase pgvector.'
  },
  sugaryzer: {
    id: 'sugaryzer',
    title: 'Sugaryzer — Bangkit Academy 2024 Capstone MVP',
    url: 'https://github.com/orgs/Sugaryzer/repositories',
    breadcrumb: 'https://github.com › orgs › Sugaryzer › repositories',
    displayUrl: 'github.com/orgs/Sugaryzer/repositories',
    badge: 'CAPSTONE REPO',
    desc: 'Proyek Capstone Bangkit Academy 2024: OCR pembaca kode barcode & nutrisi kemasan serta model klasifikasi konsumsi gula harian berbasis TensorFlow (Akurasi 89%).'
  },
  telegram: {
    id: 'telegram',
    title: 'Telegram AI & Automation Bots (@yourneed_bot · @crawlyt_bot · @guruserbabisa_bot)',
    url: 'https://t.me/yourneed_bot',
    breadcrumb: 'https://t.me › yourneed_bot · crawlyt_bot · guruserbabisa_bot',
    displayUrl: 't.me/yourneed_bot',
    badge: 'TELEGRAM BOTS',
    desc: 'Ekosistem bot publik Telegram yang dibangun Rizky menggunakan FastAPI Webhook, Groq LLM, dan orkestrasi n8n.'
  },
  coursera: {
    id: 'coursera',
    title: 'Coursera Verified Credentials — DeepLearning.AI & Stanford',
    url: 'https://coursera.org/verify/professional-cert/7QM26EI7X8DK',
    breadcrumb: 'https://coursera.org › verify › professional-cert › 7QM26EI7X8DK',
    displayUrl: 'coursera.org/verify/professional-cert/7QM26EI7X8DK',
    badge: 'COURSERA VERIFY',
    desc: '6 sertifikasi spesialisasi Coursera terverifikasi: TensorFlow Developer, Machine Learning, Deep Learning, Mathematics for ML, dan TensorFlow Data & Deployment.'
  },
  plti: {
    id: 'plti',
    title: 'PLTI — Sertifikat TOEP (Test of English Proficiency) Rizky Alviando',
    url: 'https://plti.co.id',
    breadcrumb: 'https://plti.co.id › verify › toep',
    displayUrl: 'plti.co.id',
    badge: 'PLTI TOEP',
    desc: 'Sertifikasi kemampuan bahasa Inggris akademik TOEP dari Pusat Layanan Tes Indonesia (PLTI).'
  }
};

const FALLBACK_GITHUB_REPOS = [
  {
    name: 'web-chatbot',
    full_name: 'RizkyAl01/web-chatbot',
    language: 'JavaScript / Python',
    stargazers_count: 5,
    updated_at: '2026-11',
    topics: ['windows-95', 'fastapi', 'groq-llm', 'bm25-rag', 'threejs', 'portfolio-os'],
    projectSlug: 'rizkyos-portfolio-ai',
    description:
      'RizkyOS 95 Desktop Portfolio, 3D Isometric Room (Three.js), & FastAPI + Groq LLM + Semantic BM25 RAG Assistant.',
    files: [
      { name: 'api/index.py', type: 'file', info: 'FastAPI Backend, Semantic BM25 Retriever, /api/web-chat & /api/ie-agent' },
      { name: 'frontend/os/wm.js', type: 'file', info: 'Windows 95 Window Manager, BIOS Boot, Taskbar & CRT Engine' },
      { name: 'frontend/os/apps/browser.js', type: 'file', info: 'Internet Explorer 4.0 Editorial Reader & In-Portal Search Engine' },
      { name: 'frontend/os/apps/messenger.js', type: 'file', info: 'RizkyBot Messenger 95 (1999 MSN Transcript & Nudge)' },
      { name: 'frontend/open-world.html', type: 'file', info: 'Interactive 3D Isometric Room (Three.js + GLTF + Playable Chess)' },
      { name: 'README.md', type: 'file', info: 'Architecture & Deployment Documentation' }
    ],
    readme: `# RizkyOS 95 — Retro Desktop OS Portfolio & AI Assistant

Portofolio interaktif bergaya sistem operasi desktop **Windows 95** milik **Rizky Alviando, S.Mat.** (AI Engineer di DJED Komdigi & Lulusan S1 Matematika ITS Cum Laude).

## Arsitektur Utama
- **Frontend OS Shell**: Window Manager modular Vanilla ES6 (\`wm.js\`), 14 aplikasi native (Internet Explorer 4.0 + In-Portal Search Engine, RizkyBot Messenger 95, MS-DOS Prompt, Ojek Rush 95, Minesweeper 95, Catur 95, Rubik Solver 95, 3D Isometric Room).
- **Backend AI & Search Agent**: FastAPI (\`api/index.py\`) dengan Semantic Markdown Chunking & BM25 Retriever (\`<= 9.500\` karakter per request), Groq LLM multi-model fallback, Supabase PostgreSQL memory, dan Upstash Redis rate-limiting.`
  },
  {
    name: 'Smart-Agentic-RAG',
    full_name: 'RizkyAl01/Smart-Agentic-RAG',
    language: 'Python',
    stargazers_count: 4,
    updated_at: '2026-08',
    topics: ['langgraph', 'agentic-rag', 'fastapi', 'pgvector', 'supabase', 'groq'],
    projectSlug: 'smart-agentic-rag',
    description:
      'Agentic PDF Document Assistant powered by LangGraph, FastAPI, Groq LLM, PyMuPDF, and Supabase pgvector.',
    files: [
      { name: 'app/graph.py', type: 'file', info: 'LangGraph State Machine (Query Rewrite -> Retrieve -> Grade -> Generate)' },
      { name: 'app/ingest.py', type: 'file', info: 'PyMuPDF PDF Parsing & Recursive Character Chunking' },
      { name: 'app/vectorstore.py', type: 'file', info: 'Supabase PostgreSQL pgvector Similarity Search' },
      { name: 'app/main.py', type: 'file', info: 'FastAPI Streaming Endpoint & Session Management' },
      { name: 'README.md', type: 'file', info: 'System Architecture & Evaluation Benchmarks' }
    ],
    readme: `# Smart Agentic RAG — AI Document Assistant

Sistem tanya-jawab dokumen PDF pintar menggunakan **LangGraph**, **FastAPI**, **Groq LLM**, dan **Supabase pgvector**.

## Fitur Utama
1. **Self-Correcting Retrieval Loop**: Agen mengevaluasi relevansi dokumen yang ditarik; bila kurang relevan, agen menulis ulang kueri secara otomatis.
2. **Strict Citation Grounding**: Setiap klaim jawaban disertai rujukan halaman PDF asli untuk menekan halusinasi.`
  },
  {
    name: 'AegisLake-Medallion',
    full_name: 'RizkyAl01/AegisLake-Medallion',
    language: 'Python',
    stargazers_count: 3,
    updated_at: '2026-10',
    topics: ['medallion-architecture', 'duckdb', 'polars', 'airflow', 'pii-masking', 'uu-pdp'],
    projectSlug: 'aegislake',
    description:
      'Medallion Architecture (Bronze-Silver-Gold) Data Pipeline & IndonesianPIIGuard (UU PDP) with DuckDB & Airflow.',
    files: [
      { name: 'dags/medallion_pipeline.py', type: 'file', info: 'Apache Airflow DAG (Bronze -> Silver -> Gold)' },
      { name: 'aegislake/pii_guard.py', type: 'file', info: 'IndonesianPIIGuard (Auto-masking NIK 16-digit, Telepon, Rekening)' },
      { name: 'aegislake/sandbox.py', type: 'file', info: 'Isolated DuckDB Columnar Analytics Sandbox' },
      { name: 'README.md', type: 'file', info: 'Data Governance & UU PDP Compliance Guide' }
    ],
    readme: `# AegisLake — Pipeline Data Medallion & Sandbox Pelatihan AI

Arsitektur data **Bronze–Silver–Gold** yang dilengkapi penyensoran PII otomatis sesuai **UU PDP** sebelum dataset menyentuh pelatihan model AI.

## Komponen Inti
- **Bronze Layer**: Penyerapan data mentah dengan pencatatan fingerprint SHA-256.
- **Silver Layer (\`IndonesianPIIGuard\`)**: Penyamaran otomatis NIK 16-digit, nomor telepon, rekening bank, dan identitas personal.
- **Gold Layer**: Penyimpanan kolumnar teroptimasi dengan sandbox kueri **DuckDB** berlatensi rendah.`
  },
  {
    name: 'LexGraph-Legal-RAG',
    full_name: 'RizkyAl01/LexGraph-Legal-RAG',
    language: 'Python',
    stargazers_count: 4,
    updated_at: '2026-10',
    topics: ['graph-rag', 'neo4j', 'pgvector', 'bm25', 'flashrank', 'legal-ai'],
    projectSlug: 'lexgraph',
    description:
      'Indonesian Legal & Regulation Graph-RAG using Pasal/Ayat chunking, BM25 + pgvector (RRF), Neo4j, & FlashRank ONNX.',
    files: [
      { name: 'lexgraph/chunker.py', type: 'file', info: 'Structural Legal Chunker (BAB, Bagian, Pasal, Ayat)' },
      { name: 'lexgraph/hybrid_retriever.py', type: 'file', info: 'BM25 + PostgreSQL pgvector + Reciprocal Rank Fusion (RRF)' },
      { name: 'lexgraph/graph_traverse.py', type: 'file', info: 'Neo4j Multi-Hop Cross-Referenced Pasal Expansion' },
      { name: 'lexgraph/reranker.py', type: 'file', info: 'FlashRank ONNX Low-Latency Reranking' },
      { name: 'README.md', type: 'file', info: 'Legal Graph-RAG Architecture' }
    ],
    readme: `# LexGraph — Pencarian Regulasi & Dokumen Hukum dengan Graph-RAG

Mesin pencari regulasi berbasis **Graph-RAG** yang memadukan pemotongan sadar struktur **Pasal–Ayat**, pencarian hibrida **BM25 + pgvector (RRF)**, ekspansi graf relasi **Neo4j**, dan reranking **FlashRank ONNX**.`
  },
  {
    name: 'SentinelEval-LLM',
    full_name: 'RizkyAl01/SentinelEval-LLM',
    language: 'TypeScript / Python',
    stargazers_count: 3,
    updated_at: '2026-09',
    topics: ['ai-safety', 'red-teaming', 'llm-evaluation', 'prompt-injection'],
    projectSlug: 'sentineleval',
    description:
      'Automated LLM Red-Teaming & AI Risk Governance Benchmark (Homoglyph, Nusantara Local Dialect, & Jailbreak Guards).',
    files: [
      { name: 'sentineleval/attacks/', type: 'folder', info: 'Adversarial Prompt Suites (Homoglyph, Bahasa Daerah, Multi-Turn)' },
      { name: 'sentineleval/evaluator.py', type: 'file', info: 'Automated Safety Scoring & Risk Matrix Generator' },
      { name: 'README.md', type: 'file', info: 'Red-Teaming Methodology' }
    ],
    readme: `# SentinelEval — Perangkat Uji Keamanan (Red-Teaming) & Evaluasi Risiko LLM

Kerangka kerja pengujian adversarial otomatis untuk menguji ketahanan model bahasa terhadap serangan prompt injection, manipulasi karakter homoglyph, dan jailbreak berbahasa lokal Nusantara.`
  },
  {
    name: 'NusantaraASR-Pipeline',
    full_name: 'RizkyAl01/NusantaraASR-Pipeline',
    language: 'Python',
    stargazers_count: 3,
    updated_at: '2026-06',
    topics: ['whisperx', 'wav2vec2', 'pyannote', 'asr', 'indonesian-nlp'],
    projectSlug: 'nusantara-asr',
    description:
      'YouTube Audio Transcription & Regional Dialect Post-Correction with WhisperX large-v3, Wav2Vec2, & Pyannote.',
    files: [
      { name: 'pipeline/transcribe.py', type: 'file', info: 'WhisperX large-v3 + Wav2Vec2 Forced Alignment' },
      { name: 'pipeline/diarize.py', type: 'file', info: 'Pyannote Speaker Diarization & VAD' },
      { name: 'pipeline/evaluate_wer.py', type: 'file', info: 'Word Error Rate (WER) & Character Error Rate (CER) Benchmark' },
      { name: 'README.md', type: 'file', info: 'Audio Pipeline Documentation' }
    ],
    readme: `# NusantaraASR — Pipeline Transkripsi Audio & Diarisasi Pembicara

Pipeline ekstraksi dan transkripsi audio YouTube berskala besar (workflow success rate 95%) menggunakan **WhisperX large-v3**, perataan waktu **Wav2Vec2**, dan pemisahan pembicara **Pyannote**.`
  },
  {
    name: 'Sugaryzer-Bangkit-Capstone',
    full_name: 'Sugaryzer/Sugaryzer-App',
    language: 'Python / TensorFlow',
    stargazers_count: 6,
    updated_at: '2025-01',
    topics: ['bangkit-academy', 'tensorflow', 'ocr', 'computer-vision', 'healthcare-ai'],
    projectSlug: 'sugaryzer-bangkit',
    description:
      'Bangkit Academy 2024 Capstone MVP: Daily Sugar Consumption Analysis with OCR & TensorFlow Classification (89% Acc).',
    files: [
      { name: 'ml/ocr_barcode.py', type: 'file', info: 'Computer Vision & OCR Barcode / Nutrition Label Extractor' },
      { name: 'ml/sugar_classifier.py', type: 'file', info: 'TensorFlow Daily Sugar Intake Classification & Clustering Model' },
      { name: 'README.md', type: 'file', info: 'Bangkit Academy 2024 Capstone Documentation' }
    ],
    readme: `# Sugaryzer — Bangkit Academy 2024 Capstone Project

Aplikasi kesehatan pintar yang dikembangkan oleh tim lintas fungsi (Machine Learning, Cloud Computing, Mobile Development) di **Bangkit Academy 2024**.

- **OCR & Barcode Detection**: Membaca label informasi nilai gizi dan barcode kemasan minuman/makanan.
- **TensorFlow Classification (Akurasi 89%)**: Mengklasifikasikan tingkat konsumsi gula harian serta memberikan rekomendasi kesehatan personal.`
  }
];

function findCertByFileOrId(fileOrId) {
  const key = String(fileOrId ?? '').trim();
  if (!key) return (CERTIFICATES || [])[0] || null;
  const certs = Array.isArray(CERTIFICATES) ? CERTIFICATES : [];
  return (
    certs.find(
      (c) =>
        c.id === key ||
        c.file === key ||
        c.file?.toLowerCase().endsWith(key.toLowerCase()) ||
        c.credentialId?.toLowerCase() === key.toLowerCase()
    ) || null
  );
}

function mapExternalUrlToInternalNav(rawUrl, fallbackTitle = '') {
  const url = String(rawUrl ?? '').trim();
  if (!url) return 'search';
  const lower = url.toLowerCase();

  if (isLocalPdfPath(url)) {
    const cert = findCertByFileOrId(url);
    return cert ? `agent:pdf:${cert.id}` : `agent:pdf:${url}`;
  }
  if (/linkedin\.com\/in\/rizky-alviando-31b47021b/i.test(lower)) {
    return 'agent:linkedin';
  }
  const ghRepoMatch = url.match(/github\.com\/rizkyal01\/([A-Za-z0-9._-]+)/i);
  if (ghRepoMatch) {
    return `agent:github-repo:${ghRepoMatch[1]}`;
  }
  if (/github\.com\/orgs\/sugaryzer/i.test(lower)) {
    return 'agent:github-repo:Sugaryzer-Bangkit-Capstone';
  }
  if (/github\.com\/rizkyal01/i.test(lower)) {
    return 'agent:github';
  }
  if (/canva\.link\/rizky-alviando-portoaiml26/i.test(lower)) {
    return 'agent:canva';
  }
  if (/project-rag-zeta\.vercel\.app/i.test(lower)) {
    return 'project:smart-agentic-rag';
  }
  if (/t\.me\/(crawlyt_bot|yourneed_bot|guruserbabisa_bot)/i.test(lower)) {
    return 'agent:telegram';
  }
  const courseraMatch = lower.match(
    /coursera\.org\/verify\/(?:professional-cert\/|specialization\/)?([a-z0-9]+)/i
  );
  if (courseraMatch) {
    const code = courseraMatch[1];
    const cert = (CERTIFICATES || []).find(
      (c) =>
        c.verifyUrl?.toLowerCase().includes(code) ||
        c.file?.toLowerCase().includes(code)
    );
    return cert ? `agent:pdf:${cert.id}` : 'agent:pdf:coursera-tf';
  }
  if (/plti\.co\.id/i.test(lower)) {
    const toep = (CERTIFICATES || []).find((c) => /toep/i.test(c.id) || /toep/i.test(c.file));
    return toep ? `agent:pdf:${toep.id}` : 'agent:plti';
  }

  // Generic web search result -> open in-IE Web Reader view
  const payload = encodeURIComponent(JSON.stringify({ url, title: fallbackTitle || url }));
  return `agent:web:${payload}`;
}

function detectExternalTargetCommand(rawInput) {
  const text = String(rawInput ?? '').trim();
  if (!text) return null;
  const lower = text.toLowerCase();

  // Specific GitHub repo URL or command
  const repoUrlMatch = text.match(/github\.com\/rizkyal01\/([A-Za-z0-9._-]+)/i);
  if (repoUrlMatch) {
    return `agent:github-repo:${repoUrlMatch[1]}`;
  }
  if (/github\.com\/orgs\/sugaryzer/i.test(lower)) {
    return 'agent:github-repo:Sugaryzer-Bangkit-Capstone';
  }

  // Official LinkedIn
  if (
    /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/rizky-alviando-31b47021b\/?$/i.test(lower) ||
    /^(visit|buka|open|kunjungi|lihat)?\s*(profil\s+)?linkedin(\s+asli|\s+aslinya|\s+rizky)?$/i.test(lower)
  ) {
    return 'agent:linkedin';
  }

  // Official GitHub
  if (
    /^(https?:\/\/)?(www\.)?github\.com\/rizkyal01\/?$/i.test(lower) ||
    /^(visit|buka|open|kunjungi|lihat|inspect)?\s*(live\s+)?github(\s+asli|\s+aslinya|\s+rizky|\s+@?rizkyal01)?$/i.test(lower)
  ) {
    return 'agent:github';
  }

  // Official Canva
  if (
    /canva\.link\/rizky-alviando-portoaiml26/i.test(lower) ||
    /^(visit|buka|open|lihat)\s+(canva|slide\s+portofolio|portofolio\s+canva)$/i.test(lower)
  ) {
    return 'agent:canva';
  }

  // Coursera verify URL
  if (/^https?:\/\/(www\.)?coursera\.org\/verify\//i.test(lower)) {
    return mapExternalUrlToInternalNav(text);
  }

  // Official Telegram bots
  if (/^https?:\/\/t\.me\/(crawlyt_bot|yourneed_bot|guruserbabisa_bot)/i.test(lower)) {
    return 'agent:telegram';
  }

  return null;
}

function normalizePageId(input) {
  const rawOrig = String(input ?? 'home').trim();
  if (!rawOrig) return 'home';

  if (rawOrig.toLowerCase().startsWith('search:')) {
    const q = rawOrig.slice('search:'.length).trim();
    return q ? `search:${q}` : 'search';
  }
  if (rawOrig.toLowerCase().startsWith('agent:github-repo:')) {
    const repo = rawOrig.slice('agent:github-repo:'.length).trim();
    return repo ? `agent:github-repo:${repo}` : 'agent:github';
  }
  if (rawOrig.toLowerCase().startsWith('agent:pdf:')) {
    const target = rawOrig.slice('agent:pdf:'.length).trim();
    return target ? `agent:pdf:${target}` : 'agent:canva';
  }
  if (rawOrig.toLowerCase().startsWith('agent:web:')) {
    return rawOrig;
  }
  if (rawOrig.toLowerCase().startsWith('agent:')) {
    const t = rawOrig.slice('agent:'.length).trim().toLowerCase();
    return OFFICIAL_TARGETS[t] ? `agent:${t}` : 'search';
  }

  let raw = rawOrig;
  const isInternalOrigin = /^(https?:\/\/)?(www\.)?rizky\.os(\/|$)/i.test(raw);
  if (isInternalOrigin) {
    raw = raw.replace(/^(https?:\/\/)?(www\.)?rizky\.os\/?/i, '');
  }
  raw = raw.replace(/^\/+|\/+$/g, '');

  if (!raw || raw.toLowerCase() === 'index.html' || raw.toLowerCase() === 'home') {
    return 'home';
  }

  const lower = raw.toLowerCase();
  if (['about', 'experience', 'projects', 'skills', 'contact', 'search'].includes(lower)) {
    return lower;
  }

  if (lower.startsWith('search?q=') || lower.startsWith('search/?q=')) {
    const qPart = raw.split('q=')[1] || '';
    try {
      const decoded = decodeURIComponent(qPart.replace(/\+/g, ' ')).trim();
      return decoded ? `search:${decoded}` : 'search';
    } catch {
      return `search:${qPart.trim()}`;
    }
  }
  if (lower.startsWith('certs/') || lower.startsWith('cert/')) {
    const cId = raw.split('/').slice(1).join('/');
    return `agent:pdf:${cId}`;
  }
  if (lower.startsWith('agent/')) {
    const t = lower.slice('agent/'.length).trim();
    if (OFFICIAL_TARGETS[t]) return `agent:${t}`;
  }
  if (lower.startsWith('project:')) {
    return `project:${raw.slice('project:'.length).trim()}`;
  }
  if (lower.startsWith('projects/')) {
    return `project:${raw.slice('projects/'.length).trim()}`;
  }
  if (lower.startsWith('project/')) {
    return `project:${raw.slice('project/'.length).trim()}`;
  }

  const match = (PROJECTS || []).find(
    (p) => p.slug?.toLowerCase() === lower || p.id?.toLowerCase() === lower
  );
  if (match) return `project:${match.slug || match.id}`;

  const extRoute = detectExternalTargetCommand(rawOrig);
  if (extRoute) return extRoute;

  return `search:${rawOrig}`;
}

function pageToUrl(pageId) {
  if (pageId === 'home') return 'https://rizky.os/';
  if (pageId === 'search') return 'https://rizky.os/search';
  if (pageId === 'agent:linkedin') return OFFICIAL_TARGETS.linkedin.url;
  if (pageId === 'agent:github') return OFFICIAL_TARGETS.github.url;
  if (pageId === 'agent:canva') return OFFICIAL_TARGETS.canva.url;
  if (pageId.startsWith('agent:github-repo:')) {
    const repo = pageId.slice('agent:github-repo:'.length);
    return `https://github.com/RizkyAl01/${repo}`;
  }
  if (pageId.startsWith('agent:pdf:')) {
    const key = pageId.slice('agent:pdf:'.length);
    const cert = findCertByFileOrId(key);
    return `https://rizky.os/certs/${cert ? cert.id : key}`;
  }
  if (pageId.startsWith('agent:web:')) {
    try {
      const parsed = JSON.parse(decodeURIComponent(pageId.slice('agent:web:'.length)));
      if (parsed?.url) return parsed.url;
    } catch {
      // ignore
    }
    return 'https://rizky.os/search/reader';
  }
  if (pageId.startsWith('agent:')) {
    const t = pageId.slice('agent:'.length);
    return OFFICIAL_TARGETS[t]?.url || `https://rizky.os/agent/${t}`;
  }
  if (pageId.startsWith('search:')) {
    const q = pageId.slice('search:'.length);
    return `https://rizky.os/search?q=${encodeURIComponent(q)}`;
  }
  if (pageId.startsWith('project:')) {
    const slug = pageId.slice('project:'.length);
    const proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
    if (proj?.url && /^https?:\/\//i.test(proj.url)) return proj.url;
    return `https://rizky.os/projects/${slug}`;
  }
  return `https://rizky.os/${pageId}`;
}

function pageToTitle(pageId) {
  const brand = PROFILE?.name || 'Rizky Alviando';
  if (pageId === 'home') return `${brand} — Portfolio Dossier`;
  if (pageId === 'about') return `About — ${brand}`;
  if (pageId === 'experience') return `Experience — ${brand}`;
  if (pageId === 'projects') return `Projects & Case Studies — ${brand}`;
  if (pageId === 'skills') return `Skills & Competencies — ${brand}`;
  if (pageId === 'contact') return `Contact — ${brand}`;
  if (pageId === 'search') return `RizkySearch 95 — Search Engine`;
  if (pageId.startsWith('agent:github-repo:')) {
    const repo = pageId.slice('agent:github-repo:'.length);
    return `RizkyAl01/${repo} — GitHub Repository`;
  }
  if (pageId.startsWith('agent:pdf:')) {
    const cert = findCertByFileOrId(pageId.slice('agent:pdf:'.length));
    return `${cert?.title || 'PDF Document'} — In-Portal Viewer`;
  }
  if (pageId.startsWith('agent:web:')) {
    return `Web Reader — RizkySearch 95`;
  }
  if (pageId.startsWith('agent:')) {
    const t = pageId.slice('agent:'.length);
    const info = OFFICIAL_TARGETS[t];
    return info ? info.title : `Browser Agent — ${brand}`;
  }
  if (pageId.startsWith('search:')) {
    const q = pageId.slice('search:'.length);
    return `${q} — RizkySearch 95`;
  }
  if (pageId.startsWith('project:')) {
    const slug = pageId.slice('project:'.length);
    const proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
    if (proj) return `${proj.title} — Case Study`;
  }
  return 'Page Not Found';
}

function renderPortrait(className = 'ie-avatar-img', size = 88) {
  const name = PROFILE?.name || 'Rizky Alviando';
  const photoSrc = PROFILE?.photo || 'assets/images/IMG-20250903-WA0024.jpg';
  return `<img class="${className}" src="${escapeHtml(photoSrc)}" alt="${escapeHtml(name)}" width="${size}" height="${size}">`;
}

function renderProjectCard(project, indexNumber) {
  const slug = project.slug || project.id || '';
  const num = String(indexNumber + 1).padStart(2, '0');
  const tech = Array.isArray(project.techStack) ? project.techStack.slice(0, 4) : [];
  const metrics = Array.isArray(project.metrics) ? project.metrics.slice(0, 2) : [];

  return `
    <article class="ie-project-card" data-nav="project:${escapeHtml(slug)}" tabindex="0" role="button">
      <div class="ie-card-eyebrow">
        <span class="ie-card-index">${num}</span>
        <span class="ie-card-cat">${escapeHtml(project.category || 'Engineering')}</span>
        <span class="ie-card-meta-right">
          ${escapeHtml(project.date || '')}${project.readTime ? ` · ${escapeHtml(project.readTime)}` : ''}
        </span>
      </div>
      <div class="ie-card-body">
        <h3 class="ie-card-title">${escapeHtml(project.title || 'Untitled Project')}</h3>
        <p class="ie-card-subtitle">${escapeHtml(project.subtitle || project.summary || '')}</p>
        ${
          metrics.length
            ? `<div class="ie-card-metrics">
                ${metrics
                  .map(
                    (m) =>
                      `<span class="ie-mini-metric"><strong>${escapeHtml(m.value)}</strong> ${escapeHtml(m.label)}</span>`
                  )
                  .join('')}
              </div>`
            : ''
        }
        ${
          tech.length
            ? `<div class="ie-tags">
                ${tech.map((t) => `<span class="ie-tag">${escapeHtml(t)}</span>`).join('')}
              </div>`
            : ''
        }
        <div class="ie-card-cta">Baca Case Study →</div>
      </div>
    </article>
  `;
}

function renderHomePage() {
  const projects = Array.isArray(PROJECTS) ? PROJECTS : [];
  const featured = projects.slice(0, 4);
  const stats = Array.isArray(PROFILE?.stats) ? PROFILE.stats : [];
  const certCount = Array.isArray(CERTIFICATES) ? CERTIFICATES.length : 0;

  return `
    <div class="ie-article ie-home">
      <header class="ie-hero">
        <div class="ie-hero-top">
          <div class="ie-avatar-frame">
            ${renderPortrait('ie-avatar-img', 92)}
          </div>
          <div class="ie-hero-copy">
            <div class="ie-kicker">PORTFOLIO DOSSIER · ${escapeHtml(PROFILE?.location || 'Indonesia')}</div>
            <h1 class="ie-headline">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</h1>
            <p class="ie-subhead">${escapeHtml(PROFILE?.role || 'AI Engineer & Data Specialist')}</p>
            <div class="ie-badges">
              <span class="ie-badge ie-badge-navy">${escapeHtml(PROFILE?.degree || 'S1 Matematika ITS')} · ${escapeHtml(PROFILE?.gpa || 'Cum Laude')}</span>
              <span class="ie-badge ie-badge-teal">AI Engineer · DJED Komdigi</span>
              <span class="ie-badge">Bangkit ML · SIT Tokyo GPBL</span>
            </div>
          </div>
        </div>

        <p class="ie-lead">${escapeHtml(PROFILE?.tagline || PROFILE?.summary || '')}</p>

        <div class="ie-hero-actions">
          <button type="button" class="ie-action-btn ie-action-primary" data-open-app="messenger">
            <span class="ie-btn-ico">${getIconSVG('messenger', 15)}</span>
            <span>Tanya RizkyBot AI</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF Asli)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:portfolio-deck">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka Portofolio (PDF)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="search">
            <span class="ie-btn-ico">${getIconSVG('ai', 15)}</span>
            <span>RizkySearch 95</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="explorer" data-path="C:\\Rizky\\Certificates">
            <span class="ie-btn-ico">${getIconSVG('folder-open', 15)}</span>
            <span>Sertifikat (${certCount})</span>
          </button>
        </div>
      </header>

      ${
        stats.length
          ? `<section class="ie-stats-grid" aria-label="Ringkasan pencapaian">
              ${stats
                .map(
                  (st) => `
                  <div class="ie-stat-card">
                    <div class="ie-stat-value">${escapeHtml(st.value)}</div>
                    <div class="ie-stat-label">${escapeHtml(st.label)}</div>
                  </div>
                `
                )
                .join('')}
            </section>`
          : ''
      }

      <section class="ie-section">
        <div class="ie-section-head">
          <div>
            <div class="ie-kicker">SELECTED CASE STUDIES</div>
            <h2 class="ie-section-title">Arsitektur AI, Data Governance &amp; Riset</h2>
          </div>
          <button type="button" class="ie-text-link" data-nav="projects">Indeks lengkap (${projects.length}) →</button>
        </div>
        <div class="ie-cards-grid">
          ${featured.map((proj, idx) => renderProjectCard(proj, idx)).join('')}
        </div>
      </section>

      <section class="ie-section ie-directory-box">
        <div class="ie-kicker">IN-PORTAL SEARCH &amp; PROFILE EXPLORER</div>
        <h2 class="ie-section-title">Jelajahi Bagian Lain di Dalam Portal IE 4.0</h2>
        <div class="ie-quick-grid">
          <button type="button" class="ie-quick-tile" data-nav="search">
            <span class="ie-quick-ico">${getIconSVG('ie', 18)}</span>
            <div>
              <strong>RizkySearch 95 Engine</strong>
              <span>Cari topik karier, riset, sertifikat, atau profil di dalam IE 4.0</span>
            </div>
          </button>
          <button type="button" class="ie-quick-tile" data-nav="agent:linkedin">
            <span class="ie-quick-ico">${getIconSVG('info', 18)}</span>
            <div>
              <strong>LinkedIn Profile (In-Portal)</strong>
              <span>Tampilan penuh profil LinkedIn Rizky Alviando langsung di IE 4.0</span>
            </div>
          </button>
          <button type="button" class="ie-quick-tile" data-nav="agent:github">
            <span class="ie-quick-ico">${getIconSVG('dos', 18)}</span>
            <div>
              <strong>GitHub @RizkyAl01 (In-Portal)</strong>
              <span>Telusuri daftar repositori publik &amp; baca README.md di dalam IE 4.0</span>
            </div>
          </button>
          <button type="button" class="ie-quick-tile" data-open-app="room3d">
            <span class="ie-quick-ico">${getIconSVG('room3d', 18)}</span>
            <div>
              <strong>3D Room Portfolio</strong>
              <span>Ruang kerja isometrik 3D interaktif dengan dossier dan catur</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderAboutPage() {
  const paragraphs =
    Array.isArray(PROFILE?.bioParagraphs) && PROFILE.bioParagraphs.length
      ? PROFILE.bioParagraphs
      : [PROFILE?.summary || ''];
  const education = Array.isArray(PROFILE?.education) ? PROFILE.education : [];
  const organizations = Array.isArray(PROFILE?.organizations) ? PROFILE.organizations : [];
  const interests = Array.isArray(PROFILE?.interests) ? PROFILE.interests : [];
  const photoSrc = PROFILE?.photo || 'assets/images/IMG-20250903-WA0024.jpg';

  return `
    <div class="ie-article ie-editorial">
      <div class="ie-hero-top" style="margin-bottom:18px">
        <div class="ie-avatar-frame">
          ${renderPortrait('ie-avatar-img', 96)}
        </div>
        <div class="ie-hero-copy">
          <div class="ie-kicker">PROFILE &amp; BACKGROUND</div>
          <h1 class="ie-article-title" style="margin-bottom:4px">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</h1>
          <p class="ie-article-subtitle" style="margin-bottom:6px">${escapeHtml(PROFILE?.role || 'AI Engineer')} · ${escapeHtml(PROFILE?.location || 'Indonesia')}</p>
          <div class="ie-author-meta">${escapeHtml(PROFILE?.university || 'ITS Surabaya')} · ${escapeHtml(PROFILE?.gpa || 'Cum Laude')}</div>
        </div>
      </div>

      <figure class="ie-figure">
        <img class="ie-figure-img" src="${escapeHtml(photoSrc)}" alt="${escapeHtml(PROFILE?.photoCaption || PROFILE?.name || 'Rizky Alviando')}">
        ${PROFILE?.photoCaption ? `<figcaption class="ie-figcaption">${escapeHtml(PROFILE.photoCaption)}</figcaption>` : ''}
      </figure>

      <div class="ie-prose">
        ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>

      ${
        education.length
          ? `<section class="ie-callout-card">
              <div class="ie-kicker">EDUCATION</div>
              <h3>Riwayat Pendidikan</h3>
              <div class="ie-edu-list">
                ${education
                  .map(
                    (ed) => `
                    <div class="ie-edu-item">
                      <div class="ie-edu-head">
                        <strong>${escapeHtml(ed.institution)}</strong>
                        <span>${escapeHtml(ed.period)}</span>
                      </div>
                      <div class="ie-edu-sub">${escapeHtml(ed.degree)} · ${escapeHtml(ed.score)}</div>
                      <p class="ie-edu-detail">${escapeHtml(ed.details)}</p>
                    </div>
                  `
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      ${
        organizations.length
          ? `<section class="ie-callout-card">
              <div class="ie-kicker">LEADERSHIP &amp; COMMUNITY</div>
              <h3>Organisasi &amp; Kepemimpinan</h3>
              <div class="ie-edu-list">
                ${organizations
                  .map(
                    (org) => `
                    <div class="ie-edu-item">
                      <div class="ie-edu-head">
                        <strong>${escapeHtml(org.role)}</strong>
                        <span>${escapeHtml(org.period)}</span>
                      </div>
                      <div class="ie-edu-sub">${escapeHtml(org.org)}</div>
                      <p class="ie-edu-detail">${escapeHtml(org.summary)}</p>
                    </div>
                  `
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      ${
        interests.length
          ? `<section class="ie-section">
              <div class="ie-kicker">BEYOND CODE</div>
              <div class="ie-tags">
                ${interests.map((item) => `<span class="ie-tag">${escapeHtml(item)}</span>`).join('')}
              </div>
            </section>`
          : ''
      }

      <div class="ie-cta-box">
        <div>
          <h3>Dokumen Resmi &amp; Diskusi Langsung</h3>
          <p>Buka dokumen CV resmi (PDF asli), lihat slide portofolio AI &amp; ML (PDF), atau ajukan pertanyaan spesifik ke RizkyBot AI.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF Asli)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:portfolio-deck">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka Portofolio (PDF)</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="messenger">
            Tanya RizkyBot AI
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderExperiencePage() {
  const experiences = Array.isArray(EXPERIENCES) ? EXPERIENCES : [];

  return `
    <div class="ie-article ie-editorial">
      <div class="ie-kicker">CAREER &amp; LEADERSHIP TIMELINE</div>
      <h1 class="ie-article-title">Experience</h1>
      <p class="ie-article-subtitle">Rekam jejak rekayasa AI, pelatihan korporat, statistik daerah, dan koordinasi operasional akademik.</p>

      <div class="ie-timeline">
        ${experiences
          .map((exp) => {
            const highlights = Array.isArray(exp.highlights) ? exp.highlights : [];
            const tags = Array.isArray(exp.tags) ? exp.tags : [];
            const certObj = exp.certFile ? findCertByFileOrId(exp.certFile) : null;
            return `
              <article class="ie-timeline-item">
                <div class="ie-timeline-dot" aria-hidden="true"></div>
                <div class="ie-timeline-content">
                  <div class="ie-timeline-meta">
                    <span class="ie-timeline-period">${escapeHtml(exp.period || '')}</span>
                    ${exp.location ? `<span>·</span><span>${escapeHtml(exp.location)}</span>` : ''}
                    ${exp.type ? `<span class="ie-type-pill">${escapeHtml(exp.type)}</span>` : ''}
                  </div>
                  <h2 class="ie-timeline-role">${escapeHtml(exp.role || '')}</h2>
                  <div class="ie-timeline-org">${escapeHtml(exp.org || '')}</div>
                  ${exp.summary ? `<p class="ie-body-text">${escapeHtml(exp.summary)}</p>` : ''}
                  ${
                    highlights.length
                      ? `<ul class="ie-bullet-list">
                          ${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
                        </ul>`
                      : ''
                  }
                  <div class="ie-exp-footer">
                    ${
                      tags.length
                        ? `<div class="ie-tags">
                            ${tags.map((t) => `<span class="ie-tag">${escapeHtml(t)}</span>`).join('')}
                          </div>`
                        : ''
                    }
                    ${
                      exp.certFile && isLocalPdfPath(exp.certFile)
                        ? `<button type="button" class="ie-inline-pdf-btn" data-nav="agent:pdf:${escapeHtml(certObj ? certObj.id : exp.certFile)}">
                            <span class="ie-btn-ico">${getIconSVG('pdf', 13)}</span>
                            <span>Lihat Sertifikat PDF</span>
                          </button>`
                        : ''
                    }
                  </div>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>

      <div class="ie-cta-box">
        <div>
          <h3>Ingin melihat dokumen CV resmi atau detail pengalaman tertentu?</h3>
          <p>Buka dokumen CV asli (PDF) &amp; slide Portofolio (PDF) langsung di dalam IE 4.0, atau tanyakan detail proyek Komdigi ke RizkyBot AI.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF Asli)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:portfolio-deck">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka Portofolio (PDF)</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="messenger" data-prefill="Ceritakan pengalaman kerja Rizky Alviando sebagai AI Engineer di Komdigi dan hasil yang dicapai.">
            Tanya RizkyBot AI
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderProjectsPage(selectedCategory = 'All') {
  const projects = Array.isArray(PROJECTS) ? PROJECTS : [];
  const categories = ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))];
  const indexed = projects.map((proj, originalIdx) => ({ proj, originalIdx }));
  const filtered =
    selectedCategory === 'All'
      ? indexed
      : indexed.filter(({ proj }) => proj.category === selectedCategory);

  return `
    <div class="ie-article">
      <div class="ie-kicker">TECHNICAL CASE STUDIES</div>
      <h1 class="ie-article-title">Projects &amp; Research</h1>
      <p class="ie-article-subtitle">Dokumentasi teknis proyek LLM, Graph-RAG, evaluasi keamanan AI, pipeline data, dan riset terapan yang dikerjakan Rizky.</p>

      <div class="ie-filter-bar" role="tablist" aria-label="Filter kategori proyek">
        ${categories
          .map(
            (cat) => `
            <button
              type="button"
              class="ie-filter-btn ${cat === selectedCategory ? 'is-active' : ''}"
              data-filter-cat="${escapeHtml(cat)}"
              role="tab"
              aria-selected="${cat === selectedCategory ? 'true' : 'false'}"
            >
              ${escapeHtml(cat)}
            </button>
          `
          )
          .join('')}
      </div>

      <div class="ie-cards-grid">
        ${
          filtered.length
            ? filtered.map(({ proj, originalIdx }) => renderProjectCard(proj, originalIdx)).join('')
            : '<p class="ie-body-text">Belum ada proyek pada kategori ini.</p>'
        }
      </div>
    </div>
  `;
}

function renderProjectDetailPage(slug) {
  const projects = Array.isArray(PROJECTS) ? PROJECTS : [];
  const idx = projects.findIndex((p) => p.slug === slug || p.id === slug);
  if (idx === -1) return renderNotFoundPage(`project:${slug}`);

  const project = projects[idx];
  const prevProject = idx > 0 ? projects[idx - 1] : null;
  const nextProject = idx < projects.length - 1 ? projects[idx + 1] : null;
  const metrics = Array.isArray(project.metrics) ? project.metrics : [];
  const techStack = Array.isArray(project.techStack) ? project.techStack : [];
  const sections = Array.isArray(project.sections) ? project.sections : [];
  const links = Array.isArray(project.links) ? project.links : [];
  const issueNo = `${String(idx + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  const askPrompt = `Ceritakan detail teknis, arsitektur, dan hasil dari proyek "${project.title}" yang dikerjakan Rizky Alviando.`;

  return `
    <article class="ie-article ie-editorial ie-case-study">
      <div class="ie-breadcrumb">
        <button type="button" class="ie-text-link" data-nav="projects">← Semua Proyek</button>
        <span class="ie-crumb-cat">Case Study ${issueNo} · ${escapeHtml(project.category || 'Engineering')}</span>
      </div>

      <header class="ie-case-header">
        <h1 class="ie-article-title">${escapeHtml(project.title || '')}</h1>
        ${project.subtitle ? `<p class="ie-article-subtitle">${escapeHtml(project.subtitle)}</p>` : ''}

        <div class="ie-author-strip">
          <div class="ie-author-avatar">${renderPortrait('ie-avatar-sm', 42)}</div>
          <div>
            <div class="ie-author-name">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</div>
            <div class="ie-author-meta">
              <span>${escapeHtml(project.date || '')}</span>
              ${project.readTime ? `<span>·</span><span>${escapeHtml(project.readTime)}</span>` : ''}
            </div>
          </div>
        </div>
      </header>

      ${
        metrics.length
          ? `<div class="ie-metrics-strip">
              ${metrics
                .map(
                  (m) => `
                  <div class="ie-metric-box">
                    <div class="ie-metric-val">${escapeHtml(m.value)}</div>
                    <div class="ie-metric-lbl">${escapeHtml(m.label)}</div>
                  </div>
                `
                )
                .join('')}
            </div>`
          : ''
      }

      ${
        techStack.length
          ? `<div class="ie-tech-block">
              <div class="ie-tech-label">Stack &amp; Teknologi</div>
              <div class="ie-tags">
                ${techStack.map((t) => `<span class="ie-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
            </div>`
          : ''
      }

      ${project.summary ? `<p class="ie-lead">${escapeHtml(project.summary)}</p>` : ''}

      <div class="ie-prose">
        ${sections
          .map((sec) => {
            const paras = Array.isArray(sec.paragraphs) ? sec.paragraphs : [];
            const bullets = Array.isArray(sec.bullets) ? sec.bullets : [];
            return `
              <section class="ie-prose-section">
                ${sec.heading ? `<h2>${escapeHtml(sec.heading)}</h2>` : ''}
                ${paras.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
                ${
                  bullets.length
                    ? `<ul class="ie-bullet-list">
                        ${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
                      </ul>`
                    : ''
                }
                ${sec.quote ? `<blockquote class="ie-quote">${escapeHtml(sec.quote)}</blockquote>` : ''}
              </section>
            `;
          })
          .join('')}
      </div>

      ${
        links.length
          ? `<div class="ie-ext-links">
              <div class="ie-tech-label">Tautan &amp; Lampiran (Dibuka di Dalam Portal IE 4.0)</div>
              <div class="ie-ext-links-row">
                ${links
                  .map((lnk) => {
                    const internalTarget = mapExternalUrlToInternalNav(lnk.href, lnk.label || project.title);
                    const isPdf = isLocalPdfPath(lnk.href) || internalTarget.startsWith('agent:pdf:');
                    return `<button type="button" class="ie-ext-link ${isPdf ? 'ie-ext-pdf' : ''}" data-nav="${escapeHtml(internalTarget)}">
                      <span class="ie-btn-ico">${getIconSVG(isPdf ? 'pdf' : 'ie', 14)}</span>
                      <span>${escapeHtml(lnk.label || 'Buka di Portal IE')} →</span>
                    </button>`;
                  })
                  .join('')}
              </div>
            </div>`
          : ''
      }

      <div class="ie-cta-box ie-ask-box">
        <div>
          <h3>Ingin diskusi lebih dalam soal proyek ini?</h3>
          <p>Tanyakan langsung arsitektur, trade-off desain, atau implementasi teknisnya ke RizkyBot AI.</p>
        </div>
        <button
          type="button"
          class="ie-action-btn ie-action-primary"
          data-open-app="messenger"
          data-prefill="${escapeHtml(askPrompt)}"
        >
          <span class="ie-btn-ico">${getIconSVG('messenger', 15)}</span>
          <span>Tanya RizkyBot soal proyek ini</span>
        </button>
      </div>

      <nav class="ie-case-nav" aria-label="Navigasi antar proyek">
        ${
          prevProject
            ? `<button type="button" class="ie-case-nav-btn" data-nav="project:${escapeHtml(prevProject.slug || prevProject.id)}">
                <span class="ie-nav-dir">← Proyek Sebelumnya</span>
                <strong>${escapeHtml(prevProject.title)}</strong>
              </button>`
            : '<span></span>'
        }
        ${
          nextProject
            ? `<button type="button" class="ie-case-nav-btn ie-case-nav-next" data-nav="project:${escapeHtml(nextProject.slug || nextProject.id)}">
                <span class="ie-nav-dir">Proyek Berikutnya →</span>
                <strong>${escapeHtml(nextProject.title)}</strong>
              </button>`
            : ''
        }
      </nav>
    </article>
  `;
}

function renderSkillsPage() {
  const skillGroups = Array.isArray(SKILLS) ? SKILLS : [];
  const certs = Array.isArray(CERTIFICATES) ? CERTIFICATES : [];

  return `
    <div class="ie-article">
      <div class="ie-kicker">CAPABILITIES &amp; TOOLKIT</div>
      <h1 class="ie-article-title">Skills &amp; Competencies</h1>
      <p class="ie-article-subtitle">Perpaduan rekayasa AI &amp; LLM, fondasi matematika dan statistika, serta pengalaman memimpin tim teknis.</p>

      <div class="ie-skills-grid">
        ${skillGroups
          .map((group) => {
            const items = Array.isArray(group.items) ? group.items : [];
            const iconSvg = getIconSVG(safeIconKey(group.icon || group.iconKey, 'info'), 18);
            return `
              <section class="ie-skill-card">
                <header class="ie-skill-card-head">
                  <span class="ie-skill-icon" aria-hidden="true">${iconSvg}</span>
                  <h2>${escapeHtml(group.category || 'Skills')}</h2>
                </header>
                <div class="ie-skill-list">
                  ${items
                    .map((item) => {
                      const tier = String(item.level || '').trim();
                      const tierSlug = tier.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return `
                        <div class="ie-skill-item">
                          <div class="ie-skill-row">
                            <strong class="ie-skill-name">${escapeHtml(item.name || '')}</strong>
                            ${tier ? `<span class="ie-skill-tier ie-tier-${escapeHtml(tierSlug)}">${escapeHtml(tier)}</span>` : ''}
                          </div>
                          ${item.detail ? `<div class="ie-skill-detail">${escapeHtml(item.detail)}</div>` : ''}
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              </section>
            `;
          })
          .join('')}
      </div>

      <div class="ie-cta-box">
        <div>
          <h3>Sertifikasi Terverifikasi (${certs.length} Dokumen PDF)</h3>
          <p>Seluruh sertifikat PASAS CISDE, BNSP Ilmuwan Data Madya, Komdigi, Bangkit Academy, Coursera, dan TOEP dapat dibaca langsung di dalam Internet Explorer 4.0.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:pasas-cisde">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Baca Sertifikat di IE 4.0</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="explorer" data-path="C:\\Rizky\\Certificates">
            <span class="ie-btn-ico">${getIconSVG('folder-open', 15)}</span>
            <span>Buka Folder Certificates</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderContactPage() {
  const email = PROFILE?.email || '';
  const phone = PROFILE?.phone || '';
  const bots = Array.isArray(PROFILE?.telegramBots) ? PROFILE.telegramBots : [];

  return `
    <div class="ie-article ie-editorial">
      <div class="ie-kicker">CONTACT &amp; COLLABORATION</div>
      <h1 class="ie-article-title">Contact</h1>
      <p class="ie-article-subtitle">Terbuka untuk diskusi peran AI Engineer / Data Specialist, kolaborasi proyek LLM &amp; RAG, maupun pelatihan data korporat.</p>

      <div class="ie-contact-grid">
        <button type="button" class="ie-contact-card" data-nav="agent:linkedin">
          <div class="ie-contact-label">LinkedIn (In-Portal View)</div>
          <div class="ie-contact-value">${escapeHtml(PROFILE?.name || 'Rizky Alviando')}</div>
          <div class="ie-contact-hint">Buka profil LinkedIn di IE 4.0 →</div>
        </button>
        <button type="button" class="ie-contact-card" data-nav="agent:github">
          <div class="ie-contact-label">GitHub (In-Portal View)</div>
          <div class="ie-contact-value">@RizkyAl01</div>
          <div class="ie-contact-hint">Telusuri repositori &amp; README di IE 4.0 →</div>
        </button>
        <button type="button" class="ie-contact-card" data-nav="agent:canva">
          <div class="ie-contact-label">Visual Portfolio Deck</div>
          <div class="ie-contact-value">Portofolio AI &amp; ML 2026</div>
          <div class="ie-contact-hint">Baca slide deck di dalam IE 4.0 →</div>
        </button>
        ${
          email
            ? `<div class="ie-contact-card ie-contact-static">
                <div class="ie-contact-label">Email &amp; Telepon / WhatsApp</div>
                <div class="ie-contact-value">${escapeHtml(email)}</div>
                <div class="ie-contact-hint">${escapeHtml(phone)} · ${escapeHtml(PROFILE?.location || 'Jakarta & Surabaya')}</div>
              </div>`
            : ''
        }
      </div>

      ${
        bots.length
          ? `<section class="ie-callout-card">
              <div class="ie-kicker">TELEGRAM AUTOMATION BOTS</div>
              <h3>Bot Publik yang Dibangun Rizky</h3>
              <div class="ie-bot-list">
                ${bots
                  .map(
                    (b) => `
                      <div class="ie-bot-row">
                        <div>
                          <strong>${escapeHtml(b.name)}</strong>
                          <span class="ie-bot-desc"> — ${escapeHtml(b.desc)}</span>
                        </div>
                        <button type="button" class="ie-text-link" data-nav="agent:telegram">Inspect di IE →</button>
                      </div>
                    `
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      <div class="ie-cta-box">
        <div>
          <h3>Respon Instan atau Tinggalkan Jejak di RizkyOS 95</h3>
          <p>Gunakan RizkyBot Messenger untuk tanya jawab real-time, atau tulis catatan singkat di RizkyBook Guestbook.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-open-app="messenger">
            Buka RizkyBot Messenger
          </button>
          <button type="button" class="ie-action-btn" data-open-app="guestbook">
            Isi RizkyBook Guestbook
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF Asli)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:portfolio-deck">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka Portofolio (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * IN-PORTAL SEARCH ENGINE (BING / GOOGLE SERP STYLE) & IN-IE PAGE RENDERING
 * ========================================================================== */

function tokenizeSearchQuery(query) {
  return String(query ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_+-]+/g, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length >= 2);
}

function scoreTextMatch(tokens, fullQueryLower, ...fields) {
  const haystack = fields
    .filter(Boolean)
    .map((f) => (Array.isArray(f) ? f.join(' ') : String(f)))
    .join(' ')
    .toLowerCase();
  if (!haystack) return 0;

  let score = 0;
  if (fullQueryLower.length >= 3 && haystack.includes(fullQueryLower)) {
    score += 12;
  }
  for (const tok of tokens) {
    if (haystack.includes(tok)) {
      score += tok.length >= 5 ? 4 : 2;
    }
  }
  return score;
}

function buildSerpItems(query, agentData) {
  const clean = String(query ?? '').trim();
  const fullLower = clean.toLowerCase();
  const tokens = tokenizeSearchQuery(clean);
  const showAllDefault = !tokens.length || /^(rizky|alviando|all|semua|profil|portofolio)$/i.test(clean);

  const webItems = [];
  const seenNavs = new Set();

  // 1. Official Profiles & Repos matching query
  for (const t of Object.values(OFFICIAL_TARGETS)) {
    const sc = showAllDefault
      ? 6
      : scoreTextMatch(tokens, fullLower, t.id, t.title, t.displayUrl, t.desc, t.badge);
    if (sc > 0) {
      const nav = t.id === 'rag_demo' ? 'project:smart-agentic-rag' : `agent:${t.id}`;
      seenNavs.add(nav);
      webItems.push({
        category: 'web',
        badge: t.badge,
        breadcrumb: t.breadcrumb,
        title: t.title,
        nav,
        snippet: t.desc,
        score: sc + 5
      });
    }
  }

  // 2. GitHub Repositories matching query
  for (const repo of FALLBACK_GITHUB_REPOS) {
    const sc = scoreTextMatch(
      tokens,
      fullLower,
      repo.name,
      repo.description,
      repo.language,
      repo.topics,
      'github repo kode'
    );
    if (sc > 0 || /github|repo|kode/i.test(fullLower)) {
      const nav = `agent:github-repo:${repo.name}`;
      if (!seenNavs.has(nav)) {
        seenNavs.add(nav);
        webItems.push({
          category: 'web',
          badge: 'GITHUB REPO',
          breadcrumb: `https://github.com › RizkyAl01 › ${repo.name}`,
          title: `${repo.full_name || `RizkyAl01/${repo.name}`} — ${repo.language}`,
          nav,
          snippet: repo.description,
          tags: repo.topics?.slice(0, 4) || [],
          score: sc + 3
        });
      }
    }
  }

  // 3. Remote web_results from POST /api/ie-agent (DuckDuckGo / backend search)
  if (Array.isArray(agentData?.web_results)) {
    for (const w of agentData.web_results) {
      const rawUrl = w.url || w.href || '';
      const snippetText = w.snippet || w.description || '';
      let nav = '';
      if (w.in_portal_route && w.in_portal_route !== 'agent:web') {
        nav = w.in_portal_route;
      } else if (w.in_portal_route === 'agent:web') {
        nav = `agent:web:${encodeURIComponent(JSON.stringify({ url: rawUrl, title: w.title || rawUrl, snippet: snippetText }))}`;
      } else if (w.target_id && OFFICIAL_TARGETS[w.target_id]) {
        nav = `agent:${w.target_id}`;
      } else {
        nav = mapExternalUrlToInternalNav(rawUrl, w.title);
      }
      if (seenNavs.has(nav)) continue;
      seenNavs.add(nav);
      const crumb = rawUrl
        ? rawUrl.replace(/^https?:\/\//i, 'https://').replace(/\//g, ' › ')
        : 'https://rizky.os › web › result';
      webItems.push({
        category: 'web',
        badge: (w.source || w.domain || 'WEB RESULT').toUpperCase(),
        breadcrumb: crumb,
        title: w.title || rawUrl || 'Web Result',
        nav,
        snippet: snippetText,
        score: Number(w.score || 4)
      });
    }
  }

  // 4. Case Studies / Projects
  const projectItems = (PROJECTS || [])
    .map((p) => {
      const sc = showAllDefault
        ? 5
        : scoreTextMatch(
            tokens,
            fullLower,
            p.title,
            p.subtitle,
            p.category,
            p.summary,
            p.techStack,
            (p.sections || []).map((s) => `${s.heading} ${(s.paragraphs || []).join(' ')}`)
          );
      return {
        category: 'projects',
        badge: `CASE STUDY · ${p.category || 'AI'}`,
        breadcrumb: `https://rizky.os › projects › ${p.slug}`,
        title: `${p.title} (${p.date || '2026'})`,
        nav: `project:${p.slug}`,
        snippet: p.summary || p.subtitle || '',
        tags: (p.techStack || []).slice(0, 5),
        score: sc
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // 5. Experiences & Education
  const expItems = (EXPERIENCES || [])
    .map((e) => {
      const sc = showAllDefault
        ? 4
        : scoreTextMatch(
            tokens,
            fullLower,
            e.role,
            e.org,
            e.period,
            e.location,
            e.summary,
            e.highlights,
            e.tags,
            'pengalaman kerja karier'
          );
      return {
        category: 'experience',
        badge: `EXPERIENCE · ${e.type || 'Career'}`,
        breadcrumb: `https://rizky.os › experience › ${e.id}`,
        title: `${e.role} — ${e.org} (${e.period})`,
        nav: 'experience',
        snippet: e.summary || (e.highlights && e.highlights[0]) || '',
        tags: (e.tags || []).slice(0, 4),
        score: sc
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  for (const ed of PROFILE?.education || []) {
    const sc = showAllDefault
      ? 4
      : scoreTextMatch(
          tokens,
          fullLower,
          ed.institution,
          ed.location,
          ed.degree,
          ed.score,
          ed.details,
          'pendidikan kuliah kampus ipk its tokyo shibaura'
        );
    if (sc > 0) {
      expItems.push({
        category: 'experience',
        badge: 'EDUCATION',
        breadcrumb: `https://rizky.os › about › education`,
        title: `${ed.institution} — ${ed.degree} (${ed.score})`,
        nav: 'about',
        snippet: ed.details || '',
        score: sc
      });
    }
  }

  // 6. Certificates & PDF Documents
  const pdfItems = (CERTIFICATES || [])
    .map((c) => {
      const sc = showAllDefault
        ? 4
        : scoreTextMatch(
            tokens,
            fullLower,
            c.id,
            c.title,
            c.issuer,
            c.category,
            c.year,
            c.credentialId,
            'sertifikat pdf cv portofolio'
          );
      return {
        category: 'pdfs',
        badge: `PDF · ${c.category || 'Document'}`,
        breadcrumb: `https://rizky.os › certs › ${c.id}`,
        title: `${c.title} — ${c.issuer} (${c.year})`,
        nav: `agent:pdf:${c.id}`,
        snippet: `Dokumen PDF resmi (${c.size || 'PDF'}) · Kredensial: ${c.credentialId || c.id}. Klik untuk membaca dokumen PDF langsung di dalam Internet Explorer 4.0.`,
        score: sc
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const allItems = [...webItems, ...projectItems, ...expItems, ...pdfItems].sort(
    (a, b) => b.score - a.score
  );

  return {
    all: allItems,
    web: webItems,
    projects: projectItems,
    experience: expItems,
    pdfs: pdfItems
  };
}

function renderSearchBoxHeader(currentQuery = '', activeTab = 'all', counts = null) {
  const tabs = [
    { id: 'all', label: 'All', count: counts?.all?.length },
    { id: 'web', label: 'Web & Profiles', count: counts?.web?.length },
    { id: 'projects', label: 'Projects & Case Studies', count: counts?.projects?.length },
    { id: 'experience', label: 'Experience & Education', count: counts?.experience?.length },
    { id: 'pdfs', label: 'Certificates & PDF', count: counts?.pdfs?.length }
  ];

  return `
    <div class="ie-serp-header">
      <form class="ie-search-form" autocomplete="off">
        <div class="ie-search-input-row">
          <span class="ie-search-ico">${getIconSVG('ie', 16)}</span>
          <input
            type="text"
            class="win95-field ie-search-input"
            value="${escapeHtml(currentQuery)}"
            placeholder="Cari apa saja tentang Rizky Alviando, LinkedIn, GitHub, proyek, sertifikat..."
            aria-label="RizkySearch 95 Input"
          >
          <button type="submit" class="win95-btn primary ie-search-submit">Search</button>
        </div>
        <div class="ie-agent-chips">
          <span class="ie-agent-chips-label">Populer:</span>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="agent:linkedin">Profil LinkedIn</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="agent:github">GitHub @RizkyAl01</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="search:pengalaman ai engineer komdigi">Pengalaman Komdigi</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="search:prestasi tokyo gpbl shibaura">Prestasi Tokyo GPBL</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="search:graph-rag dan fine-tuning llm">Graph-RAG &amp; LLM</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="agent:pdf:cv-rizky-alviando">CV Resmi (PDF)</button>
        </div>
      </form>
      ${
        counts
          ? `<div class="ie-serp-tabs" role="tablist" aria-label="Filter kategori hasil pencarian">
              ${tabs
                .map(
                  (t) => `
                  <button
                    type="button"
                    class="ie-filter-btn ${activeTab === t.id ? 'is-active' : ''}"
                    data-serp-tab="${escapeHtml(t.id)}"
                    role="tab"
                    aria-selected="${activeTab === t.id ? 'true' : 'false'}"
                  >
                    ${escapeHtml(t.label)}${typeof t.count === 'number' ? ` (${t.count})` : ''}
                  </button>
                `
                )
                .join('')}
            </div>`
          : ''
      }
    </div>
  `;
}

function renderSearchHomePage() {
  const targets = [
    OFFICIAL_TARGETS.linkedin,
    OFFICIAL_TARGETS.github,
    OFFICIAL_TARGETS.canva,
    OFFICIAL_TARGETS.coursera
  ];

  return `
    <div class="ie-article ie-search-portal">
      <div class="ie-kicker">RIZKYSEARCH 95 · IN-PORTAL SEARCH ENGINE &amp; BROWSER AGENT</div>
      <h1 class="ie-article-title">RizkySearch 95</h1>
      <p class="ie-article-subtitle">
        Mesin pencari internal bergaya Bing / Google di dalam Internet Explorer 4.0. Seluruh hasil pencarian, profil <strong>LinkedIn</strong>, repositori <strong>GitHub</strong>, <strong>13 studi kasus AI</strong>, serta <strong>15 dokumen PDF</strong> dibuka langsung di dalam jendela portal ini.
      </p>

      ${renderSearchBoxHeader('', 'all', null)}

      <section class="ie-section">
        <div class="ie-section-head">
          <div>
            <div class="ie-kicker">IN-PORTAL VERIFIED PROFILES &amp; DOCUMENTS</div>
            <h2 class="ie-section-title">Jelajahi Profil &amp; Dokumen Resmi di Dalam IE 4.0</h2>
          </div>
          <span class="ie-zone-pill">100% In-Portal Rendering</span>
        </div>

        <div class="ie-agent-targets-grid">
          ${targets
            .map((t) => {
              const navTarget =
                t.id === 'coursera' ? 'agent:pdf:coursera-tf' : `agent:${t.id}`;
              return `
                <article class="ie-agent-target-card">
                  <div class="ie-agent-target-top">
                    <span class="ie-agent-target-badge">${escapeHtml(t.badge)}</span>
                    <code class="ie-agent-target-domain">${escapeHtml(t.displayUrl)}</code>
                  </div>
                  <h3 class="ie-agent-target-title">${escapeHtml(t.title)}</h3>
                  <p class="ie-agent-target-desc">${escapeHtml(t.desc)}</p>
                  <div class="ie-agent-target-actions">
                    <button type="button" class="ie-action-btn ie-action-primary" data-nav="${escapeHtml(navTarget)}">
                      <span>Buka Halaman di Dalam IE 4.0 →</span>
                    </button>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      </section>

      <section class="ie-callout-card ie-agent-policy-note">
        <div class="ie-kicker">RIZKYOS 95 SECURITY ZONE · SCOPE-LOCKED SEARCH</div>
        <h3>Pencarian Khusus Seputar Rizky Alviando</h3>
        <p class="ie-body-text">
          Ketik kata kunci apa saja di kotak pencarian atau langsung di <strong>Address Bar</strong> Internet Explorer (misalnya <code>linkedin</code>, <code>github</code>, <code>pengalaman komdigi</code>, <code>tokyo</code>, <code>aegislake</code>, <code>lexgraph</code>, atau <code>bnsp</code>). Kueri di luar konteks Rizky Alviando akan ditolak secara otomatis oleh Security Zone.
        </p>
      </section>
    </div>
  `;
}

function formatAgentStepsHtml(steps) {
  if (!Array.isArray(steps) || !steps.length) return '';
  return steps
    .map((s, idx) => {
      if (typeof s === 'string') {
        return `<div class="ie-agent-step-line"><span class="ie-agent-step-num">[0${idx + 1}]</span> <span>${escapeHtml(s)}</span></div>`;
      }
      const num = typeof s.step === 'number' ? `0${s.step}` : `0${idx + 1}`;
      const label =
        s.action || (typeof s.step === 'string' ? s.step : '') || s.title || s.stage || `STEP_${idx + 1}`;
      const detail = s.detail || s.text || s.message || '';
      const status = s.status ? ` · ${String(s.status).toUpperCase()}` : '';
      return `<div class="ie-agent-step-line"><span class="ie-agent-step-num">[${escapeHtml(num)} ${escapeHtml(label)}${escapeHtml(status)}]</span> <span>${escapeHtml(detail)}</span></div>`;
    })
    .join('');
}

function renderBlockedAgentHtml(query, reason) {
  const defaultReason =
    'Akses Dibatasi oleh RizkyOS 95 Security Zone: Mesin pencari dan Browser Agent ini dikhususkan hanya untuk penelusuran informasi, proyek, dokumen, dan profil resmi terkait Rizky Alviando.';
  return `
    <section class="ie-security-panel win95-raised">
      <div class="ie-security-head">
        <span class="ie-security-ico">${getIconSVG('warning', 28)}</span>
        <div>
          <div class="ie-kicker">RIZKYOS 95 SECURITY ZONE · ACCESS RESTRICTED</div>
          <h2 class="ie-security-title">Kueri atau Alamat di Luar Ruang Lingkup Rizky Alviando</h2>
        </div>
      </div>
      <p class="ie-security-reason">${escapeHtml(reason || defaultReason)}</p>
      <div class="ie-security-meta">
        Input yang dibatasi: <code>${escapeHtml(query)}</code>
      </div>
      <div class="ie-security-actions">
        <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:linkedin">
          Buka LinkedIn Rizky (In-Portal)
        </button>
        <button type="button" class="ie-action-btn" data-nav="agent:github">
          Buka GitHub @RizkyAl01 (In-Portal)
        </button>
        <button type="button" class="ie-action-btn" data-nav="search:pengalaman ai engineer komdigi">
          Cari: Pengalaman Komdigi
        </button>
        <button type="button" class="ie-action-btn" data-nav="home">
          Kembali ke Home
        </button>
      </div>
    </section>
  `;
}

function renderSerpBodyHtml(query, serpBuckets, activeTab, agentData) {
  const aiSummary = agentData?.ai_summary || '';
  const items = serpBuckets[activeTab] || serpBuckets.all || [];
  const cvChunks = Array.isArray(agentData?.cv_chunks) ? agentData.cv_chunks : [];

  return `
    <div class="ie-search-results-wrap">
      <div class="ie-serp-meta">
        Menampilkan <strong>${items.length}</strong> hasil di dalam portal untuk <strong>"${escapeHtml(query)}"</strong> (Kategori: ${escapeHtml(activeTab.toUpperCase())})
      </div>

      ${
        aiSummary && activeTab === 'all'
          ? `<section class="ie-agent-overview">
              <div class="ie-kicker">BING / RIZKYSEARCH AI COPILOT ANSWER · GROQ LLM + BM25</div>
              <p class="ie-agent-overview-text">${escapeHtml(aiSummary)}</p>
              <div class="ie-agent-overview-foot">
                <button type="button" class="ie-action-btn" data-nav="agent:linkedin">
                  <span>Profil LinkedIn (In-Portal)</span>
                </button>
                <button type="button" class="ie-action-btn" data-nav="agent:github">
                  <span>GitHub @RizkyAl01 (In-Portal)</span>
                </button>
                <button type="button" class="ie-action-btn" data-nav="agent:pdf:cv-rizky-alviando">
                  <span>CV Resmi (PDF di IE)</span>
                </button>
                <button
                  type="button"
                  class="ie-action-btn"
                  data-open-app="messenger"
                  data-prefill="${escapeHtml(`Jelaskan lebih detail tentang "${query}" terkait Rizky Alviando.`)}"
                >
                  <span class="ie-btn-ico">${getIconSVG('messenger', 14)}</span>
                  <span>Tanya di RizkyBot Messenger</span>
                </button>
              </div>
            </section>`
          : ''
      }

      ${
        items.length
          ? `<div class="ie-search-web-list">
              ${items
                .map(
                  (hit) => `
                  <article class="ie-search-hit-card">
                    <div class="ie-search-hit-url">
                      <span class="ie-hit-badge">${escapeHtml(hit.badge || 'RESULT')}</span>
                      <span>${escapeHtml(hit.breadcrumb || 'https://rizky.os')}</span>
                    </div>
                    <h3 class="ie-search-hit-title">
                      <button type="button" class="ie-hit-title-btn" data-nav="${escapeHtml(hit.nav)}">
                        ${escapeHtml(hit.title)}
                      </button>
                    </h3>
                    <p class="ie-search-hit-snippet">${escapeHtml(hit.snippet || '')}</p>
                    ${
                      Array.isArray(hit.tags) && hit.tags.length
                        ? `<div class="ie-tags">
                            ${hit.tags.map((t) => `<span class="ie-tag">${escapeHtml(t)}</span>`).join('')}
                          </div>`
                        : ''
                    }
                  </article>
                `
                )
                .join('')}
            </div>`
          : ''
      }

      ${
        !items.length && cvChunks.length
          ? `<section class="ie-search-section">
              <div class="ie-kicker">RETRIEVED CV DOSSIER CHUNKS</div>
              <div class="ie-search-web-list">
                ${cvChunks
                  .map((ch) => {
                    const title = typeof ch === 'string' ? 'Kutipan CV Rizky Alviando' : ch.heading || ch.title || 'Kutipan CV';
                    const body = typeof ch === 'string' ? ch : ch.content || ch.text || ch.snippet || '';
                    return `
                      <article class="ie-search-hit-card">
                        <div class="ie-search-hit-url">
                          <span class="ie-hit-badge">CV CHUNK</span>
                          <span>https://rizky.os › cv › ${escapeHtml(title)}</span>
                        </div>
                        <h3 class="ie-search-hit-title">
                          <button type="button" class="ie-hit-title-btn" data-nav="agent:pdf:cv-rizky-alviando">
                            ${escapeHtml(title)} — Buka CV Resmi (PDF)
                          </button>
                        </h3>
                        <p class="ie-search-hit-snippet">${escapeHtml(String(body).slice(0, 420))}</p>
                      </article>
                    `;
                  })
                  .join('')}
              </div>
            </section>`
          : ''
      }

      ${
        !items.length && !cvChunks.length
          ? `<section class="ie-callout-card">
              <h3>Tidak ada hasil pada tab ini untuk "${escapeHtml(query)}"</h3>
              <p class="ie-body-text">
                Coba pindah ke tab <strong>All</strong>, atau cari kata kunci seperti <code>linkedin</code>, <code>github</code>, <code>komdigi</code>, <code>tokyo</code>, <code>graph-rag</code>, <code>aegislake</code>, atau <code>bnsp</code>.
              </p>
            </section>`
          : ''
      }
    </div>
  `;
}

function renderLinkedInDossierHtml(agentData) {
  const target = OFFICIAL_TARGETS.linkedin;
  const exps = Array.isArray(EXPERIENCES) ? EXPERIENCES : [];
  const edus = Array.isArray(PROFILE?.education) ? PROFILE.education : [];
  const certs = Array.isArray(CERTIFICATES) ? CERTIFICATES : [];
  const featuredProjs = (PROJECTS || []).slice(0, 4);
  const paragraphs =
    Array.isArray(PROFILE?.bioParagraphs) && PROFILE.bioParagraphs.length
      ? PROFILE.bioParagraphs
      : [agentData?.ai_summary || PROFILE?.summary || ''];

  return `
    <div class="ie-agent-dossier ie-linkedin-dossier">
      <div class="ie-dossier-card">
        <div class="ie-li-banner">
          <div class="ie-li-banner-top">
            <span class="ie-agent-target-badge">LINKEDIN · IN-PORTAL PROFILE VIEW</span>
            <code>${escapeHtml(target.url)}</code>
          </div>
          <div class="ie-li-banner-sub">Dirender penuh di dalam portal Internet Explorer 4.0 — RizkyOS 95</div>
        </div>

        <div class="ie-dossier-header">
          <div class="ie-avatar-frame">
            ${renderPortrait('ie-avatar-img', 88)}
          </div>
          <div class="ie-dossier-head-copy">
            <h2 class="ie-dossier-name">${escapeHtml(PROFILE?.fullName || 'Rizky Alviando, S.Mat.')}</h2>
            <p class="ie-dossier-headline">
              AI Engineer at DJED Komdigi · S1 Mathematics ITS (Cum Laude, GPA 3.67/4.00) · Bangkit ML Graduate · Best Presentation GPBL SIT Tokyo
            </p>
            <div class="ie-dossier-loc">${escapeHtml(PROFILE?.location || 'Jakarta & Surabaya, Indonesia')} · 500+ koneksi · Terverifikasi</div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Lihat CV Resmi (Inline PDF di IE)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:portfolio-deck">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Lihat Slide Portofolio (Inline PDF di IE)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:github">
            <span class="ie-btn-ico">${getIconSVG('dos', 15)}</span>
            <span>Buka GitHub @RizkyAl01 di IE</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="messenger" data-prefill="Ceritakan ringkasan profil LinkedIn dan pengalaman kerja utama Rizky Alviando.">
            <span class="ie-btn-ico">${getIconSVG('messenger', 15)}</span>
            <span>Kirim Pesan via RizkyBot</span>
          </button>
        </div>

        <section class="ie-dossier-section">
          <h3>Tentang (About)</h3>
          <div class="ie-prose">
            ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Unggulan (Featured Projects &amp; Documents)</h3>
          <div class="ie-gh-repos-grid">
            ${featuredProjs
              .map(
                (p) => `
                <article class="ie-gh-repo-card">
                  <div class="ie-gh-repo-top">
                    <strong class="ie-gh-repo-name">${escapeHtml(p.title)}</strong>
                    <span class="ie-tag">${escapeHtml(p.category)}</span>
                  </div>
                  <p class="ie-gh-repo-desc">${escapeHtml(p.summary || p.subtitle || '')}</p>
                  <div class="ie-gh-repo-foot">
                    <button type="button" class="ie-text-link" data-nav="project:${escapeHtml(p.slug)}">Baca Case Study di IE →</button>
                  </div>
                </article>
              `
              )
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Pengalaman (Experience — ${exps.length} Posisi)</h3>
          <div class="ie-edu-list">
            ${exps
              .map((e) => {
                const certObj = e.certFile ? findCertByFileOrId(e.certFile) : null;
                return `
                  <div class="ie-edu-item">
                    <div class="ie-edu-head">
                      <strong>${escapeHtml(e.role)}</strong>
                      <span>${escapeHtml(e.period)}</span>
                    </div>
                    <div class="ie-edu-sub">${escapeHtml(e.org)} · ${escapeHtml(e.location || '')} (${escapeHtml(e.type || '')})</div>
                    <p class="ie-edu-detail">${escapeHtml(e.summary || '')}</p>
                    ${
                      Array.isArray(e.highlights) && e.highlights.length
                        ? `<ul class="ie-bullet-list">
                            ${e.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
                          </ul>`
                        : ''
                    }
                    ${
                      certObj
                        ? `<div style="margin-top:6px">
                            <button type="button" class="ie-inline-pdf-btn" data-nav="agent:pdf:${escapeHtml(certObj.id)}">
                              <span class="ie-btn-ico">${getIconSVG('pdf', 13)}</span>
                              <span>Tampilkan Sertifikat PDF di IE</span>
                            </button>
                          </div>`
                        : ''
                    }
                  </div>
                `;
              })
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Pendidikan (Education)</h3>
          <div class="ie-edu-list">
            ${edus
              .map(
                (ed) => `
                <div class="ie-edu-item">
                  <div class="ie-edu-head">
                    <strong>${escapeHtml(ed.institution)}</strong>
                    <span>${escapeHtml(ed.period)}</span>
                  </div>
                  <div class="ie-edu-sub">${escapeHtml(ed.degree)} · ${escapeHtml(ed.score)}</div>
                  <p class="ie-edu-detail">${escapeHtml(ed.details || '')}</p>
                </div>
              `
              )
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Lisensi &amp; Sertifikasi (${certs.length} Dokumen Resmi — Klik untuk Baca di IE)</h3>
          <div class="ie-dossier-certs-grid">
            ${certs
              .map(
                (c) => `
                <div class="ie-dossier-cert-item">
                  <div>
                    <strong>${escapeHtml(c.title)}</strong>
                    <div class="ie-edu-sub">${escapeHtml(c.issuer)} (${escapeHtml(c.year)}) · ${escapeHtml(c.credentialId || '')}</div>
                  </div>
                  <button type="button" class="ie-inline-pdf-btn" data-nav="agent:pdf:${escapeHtml(c.id)}">
                    <span class="ie-btn-ico">${getIconSVG('pdf', 13)}</span>
                    <span>Baca PDF di IE</span>
                  </button>
                </div>
              `
              )
              .join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderGitHubDossierHtml(agentData) {
  const target = OFFICIAL_TARGETS.github;
  const probe = agentData?.live_probe || {};
  const ghProfile = probe.github_profile || probe.profile || {};
  const rawRepos =
    Array.isArray(probe.github_repos) && probe.github_repos.length
      ? probe.github_repos
      : Array.isArray(probe.repos) && probe.repos.length
      ? probe.repos
      : FALLBACK_GITHUB_REPOS;

  const login = ghProfile.login || 'RizkyAl01';
  const displayName = ghProfile.name || PROFILE?.name || 'Rizky Alviando';
  const bio =
    ghProfile.bio ||
    agentData?.ai_summary ||
    'AI Engineer & Data Specialist · S1 Matematika ITS (Cum Laude) · LLM, Graph-RAG, Data Engineering.';
  const publicReposCount = ghProfile.public_repos ?? rawRepos.length;
  const followersCount = ghProfile.followers ?? 18;

  return `
    <div class="ie-agent-dossier ie-github-dossier">
      <div class="ie-dossier-card">
        <div class="ie-li-banner">
          <div class="ie-li-banner-top">
            <span class="ie-agent-target-badge">GITHUB · IN-PORTAL PROFILE &amp; REPOSITORIES</span>
            <code>${escapeHtml(target.url)}</code>
          </div>
          <div class="ie-li-banner-sub">Klik salah satu repositori di bawah untuk membuka detail &amp; membaca README.md langsung di dalam IE 4.0</div>
        </div>

        <div class="ie-dossier-header">
          <div class="ie-avatar-frame">
            ${renderPortrait('ie-avatar-img', 84)}
          </div>
          <div class="ie-dossier-head-copy">
            <h2 class="ie-dossier-name">${escapeHtml(displayName)} (<code>@${escapeHtml(login)}</code>)</h2>
            <p class="ie-dossier-headline">${escapeHtml(bio)}</p>
            <div class="ie-gh-stats-row">
              <span class="ie-badge ie-badge-navy">Repositories: ${escapeHtml(publicReposCount)}</span>
              <span class="ie-badge ie-badge-teal">Followers: ${escapeHtml(followersCount)}</span>
              <span class="ie-badge">Location: Jakarta &amp; Surabaya, ID</span>
            </div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:github-repo:web-chatbot">
            <span>Inspect Repo: RizkyAl01/web-chatbot</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:github-repo:Smart-Agentic-RAG">
            <span>Inspect Repo: Smart-Agentic-RAG</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:linkedin">
            <span>Buka LinkedIn di IE →</span>
          </button>
        </div>

        <section class="ie-dossier-section">
          <h3>Public Repositories (${rawRepos.length}) — Klik untuk Membaca README di Dalam IE</h3>
          <div class="ie-gh-repos-grid">
            ${rawRepos
              .map((repo) => {
                const repoName = repo.name || 'web-chatbot';
                const navTarget = `agent:github-repo:${repoName}`;
                return `
                  <article class="ie-gh-repo-card" data-nav="${escapeHtml(navTarget)}" tabindex="0" role="button">
                    <div class="ie-gh-repo-top">
                      <strong class="ie-gh-repo-name">${escapeHtml(repo.full_name || `RizkyAl01/${repoName}`)}</strong>
                      ${repo.language ? `<span class="ie-tag">${escapeHtml(repo.language)}</span>` : ''}
                    </div>
                    <p class="ie-gh-repo-desc">${escapeHtml(repo.description || 'Repositori kode & eksperimen rekayasa AI Rizky Alviando.')}</p>
                    <div class="ie-gh-repo-foot">
                      <button type="button" class="ie-text-link" data-nav="${escapeHtml(navTarget)}">
                        Buka Repo &amp; README.md di IE →
                      </button>
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderGitHubRepoDossierHtml(repoName, agentData) {
  const cleanName = String(repoName ?? 'web-chatbot').trim();
  const fallback =
    FALLBACK_GITHUB_REPOS.find(
      (r) => r.name.toLowerCase() === cleanName.toLowerCase()
    ) || FALLBACK_GITHUB_REPOS[0];

  const probe = agentData?.live_probe || {};
  const remoteRepo = probe.github_repo || probe.repo || {};
  const title = remoteRepo.full_name || fallback.full_name || `RizkyAl01/${cleanName}`;
  const desc = remoteRepo.description || fallback.description || '';
  const lang = remoteRepo.language || fallback.language || 'Python';
  const stars = remoteRepo.stargazers_count ?? fallback.stargazers_count ?? 4;
  const topics =
    Array.isArray(remoteRepo.topics) && remoteRepo.topics.length
      ? remoteRepo.topics
      : fallback.topics || ['ai-engineering', 'python', 'rizky-alviando'];
  const files =
    Array.isArray(probe.files) && probe.files.length
      ? probe.files
      : Array.isArray(remoteRepo.files) && remoteRepo.files.length
      ? remoteRepo.files
      : fallback.files || [
          { name: 'src/', type: 'folder', info: 'Core implementation modules' },
          { name: 'README.md', type: 'file', info: 'Repository documentation' }
        ];
  const readmeText =
    probe.readme ||
    remoteRepo.readme ||
    agentData?.ai_summary ||
    fallback.readme ||
    `# ${title}\n\n${desc}`;
  const relatedSlug = fallback.projectSlug || 'rizkyos-portfolio-ai';

  return `
    <div class="ie-agent-dossier ie-github-dossier">
      <div class="ie-dossier-card">
        <div class="ie-li-banner">
          <div class="ie-li-banner-top">
            <span class="ie-agent-target-badge">GITHUB REPOSITORY · IN-PORTAL CODE &amp; README VIEW</span>
            <code>https://github.com/RizkyAl01/${escapeHtml(cleanName)}</code>
          </div>
          <div class="ie-li-banner-sub">
            <button type="button" class="ie-text-link" data-nav="agent:github">← Kembali ke Daftar Repositori @RizkyAl01</button>
          </div>
        </div>

        <div class="ie-dossier-header">
          <div class="ie-dossier-head-copy">
            <div class="ie-kicker">PUBLIC REPOSITORY · ${escapeHtml(lang)} · ★ ${escapeHtml(stars)}</div>
            <h2 class="ie-dossier-name">${escapeHtml(title)}</h2>
            <p class="ie-dossier-headline">${escapeHtml(desc)}</p>
            <div class="ie-tags" style="margin-top:8px">
              ${topics.map((t) => `<span class="ie-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="project:${escapeHtml(relatedSlug)}">
            <span>Baca Case Study Lengkap Proyek Ini di IE →</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:github">
            <span>← Semua Repositori @RizkyAl01</span>
          </button>
          <button
            type="button"
            class="ie-action-btn"
            data-open-app="messenger"
            data-prefill="${escapeHtml(`Jelaskan arsitektur kode dan implementasi pada repositori GitHub ${title}.`)}"
          >
            <span class="ie-btn-ico">${getIconSVG('messenger', 14)}</span>
            <span>Tanya RizkyBot soal Repo Ini</span>
          </button>
        </div>

        <section class="ie-dossier-section">
          <h3>Struktur Berkas Repositori</h3>
          <div class="ie-edu-list">
            ${files
              .map(
                (f) => `
                <div class="ie-edu-item">
                  <div class="ie-edu-head">
                    <strong><code>${escapeHtml(f.name || f.path || '')}</code></strong>
                    <span>${escapeHtml(f.type || 'file')}</span>
                  </div>
                  <div class="ie-edu-sub">${escapeHtml(f.info || (f.size ? `${f.size} bytes` : f.path || ''))}</div>
                </div>
              `
              )
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>README.md</h3>
          <pre class="ie-agent-console win95-sunken" style="white-space:pre-wrap;padding:14px;font-family:'JetBrains Mono','Courier New',monospace;font-size:12.5px;line-height:1.6">${escapeHtml(readmeText)}</pre>
        </section>
      </div>
    </div>
  `;
}

function renderInlinePdfPortalPage(certKey) {
  const certs = Array.isArray(CERTIFICATES) ? CERTIFICATES : [];
  let cert = findCertByFileOrId(certKey);
  if (!cert && isLocalPdfPath(certKey)) {
    cert = {
      id: 'custom-pdf',
      title: certKey.split('/').pop() || 'Document.pdf',
      issuer: 'Rizky Alviando Official Document',
      year: '2026',
      credentialId: 'PDF-DOC',
      file: certKey
    };
  }
  if (!cert && certs.length) cert = certs[0];

  const encodedSrc = safeAssetUrl(cert?.file || 'assets/certs/Rizky_Alviando_CV_ID.pdf');

  return `
    <div class="ie-article ie-inline-pdf-page">
      <div class="ie-breadcrumb">
        <button type="button" class="ie-text-link" data-nav="search">← Kembali ke RizkySearch 95</button>
        <span class="ie-crumb-cat">In-Portal PDF Reader · Internet Explorer 4.0</span>
      </div>

      <div class="ie-dossier-card">
        <div class="ie-dossier-header" style="padding-bottom:10px">
          <div class="ie-dossier-head-copy">
            <div class="ie-kicker">OFFICIAL PDF DOCUMENT · ${escapeHtml(cert?.issuer || 'RizkyOS 95')} (${escapeHtml(cert?.year || '2026')})</div>
            <h2 class="ie-dossier-name">${escapeHtml(cert?.title || 'Document.pdf')}</h2>
            <div class="ie-dossier-loc">
              Berkas: <code>${escapeHtml(cert?.file || '')}</code>
              ${cert?.credentialId ? ` · Credential ID: <code>${escapeHtml(cert.credentialId)}</code>` : ''}
            </div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar" style="align-items:center">
          <label style="display:flex;align-items:center;gap:6px;flex:1;min-width:220px">
            <span style="font-size:12px;font-weight:700">Ganti Dokumen PDF:</span>
            <select class="win95-field ie-inline-pdf-select" aria-label="Pilih Dokumen PDF di IE" style="flex:1;max-width:420px">
              ${certs
                .map(
                  (c) =>
                    `<option value="${escapeHtml(c.id)}" ${c.id === cert?.id ? 'selected' : ''}>${escapeHtml(c.title)} (${escapeHtml(c.year)})</option>`
                )
                .join('')}
            </select>
          </label>
          <a class="ie-action-btn" href="${escapeHtml(encodedSrc)}" download>
            <span class="ie-btn-ico">${getIconSVG('pdf', 14)}</span>
            <span>Download PDF</span>
          </a>
          <button
            type="button"
            class="ie-action-btn"
            data-open-pdf="${escapeHtml(cert?.file || '')}"
            data-cert-id="${escapeHtml(cert?.id || '')}"
            data-pdf-title="${escapeHtml(cert?.title || '')}"
          >
            <span>Buka di Jendela Acrobat Terpisah</span>
          </button>
        </div>

        <div class="win95-sunken" style="height:440px;background:#525659;margin-top:10px">
          <iframe
            class="ie-inline-pdf"
            src="${escapeHtml(encodedSrc)}"
            title="${escapeHtml(cert?.title || 'PDF Preview')}"
            style="width:100%;height:100%;border:0;display:block"
          ></iframe>
        </div>
      </div>
    </div>
  `;
}

function renderInPortalWebReaderHtml(targetId, agentData, customWebPayload = null) {
  if (targetId === 'canva') {
    return renderInlinePdfPortalPage('portfolio-deck');
  }
  const target = OFFICIAL_TARGETS[targetId] || {
    id: targetId,
    title: customWebPayload?.title || 'In-Portal Web Reader',
    url: customWebPayload?.url || 'https://rizky.os/search',
    breadcrumb: customWebPayload?.url || 'https://rizky.os › web › reader',
    badge: 'IN-PORTAL WEB VIEW',
    desc: customWebPayload?.snippet || agentData?.ai_summary || PROFILE?.summary || ''
  };
  const bots = Array.isArray(PROFILE?.telegramBots) ? PROFILE.telegramBots : [];

  return `
    <div class="ie-agent-dossier">
      <div class="ie-dossier-card">
        <div class="ie-li-banner">
          <div class="ie-li-banner-top">
            <span class="ie-agent-target-badge">${escapeHtml(target.badge)}</span>
            <code>${escapeHtml(target.url)}</code>
          </div>
          <div class="ie-li-banner-sub">Halaman dirender langsung di dalam portal Internet Explorer 4.0</div>
        </div>

        <h2 class="ie-dossier-name" style="margin-top:12px">${escapeHtml(target.title)}</h2>
        <p class="ie-body-text">${escapeHtml(agentData?.ai_summary || target.desc)}</p>

        ${
          targetId === 'telegram' && bots.length
            ? `<section class="ie-dossier-section">
                <h3>Arsitektur &amp; Daftar Bot Telegram Rizky Alviando</h3>
                <div class="ie-edu-list">
                  ${bots
                    .map(
                      (b) => `
                      <div class="ie-edu-item">
                        <div class="ie-edu-head">
                          <strong>${escapeHtml(b.name)}</strong>
                          <code>${escapeHtml(b.href)}</code>
                        </div>
                        <p class="ie-edu-detail">${escapeHtml(b.desc)}</p>
                      </div>
                    `
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }

        <div class="ie-dossier-cta-bar" style="margin-top:14px">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="search">
            <span>← Kembali ke Hasil Pencarian</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="projects">
            <span>Lihat 13 Case Studies Teknis →</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="messenger">
            <span class="ie-btn-ico">${getIconSVG('messenger', 14)}</span>
            <span>Coba Chat AI Langsung di RizkyBot Messenger</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderNotFoundPage(rawRoute) {
  return `
    <div class="ie-article ie-notfound">
      <div class="ie-notfound-icon">${getIconSVG('warning', 40)}</div>
      <h1 class="ie-article-title">The page cannot be displayed</h1>
      <p class="ie-body-text">
        Halaman <code>${escapeHtml(rawRoute)}</code> tidak ditemukan di server internal <strong>rizky.os</strong>.
      </p>
      <div class="ie-hero-actions">
        <button type="button" class="ie-action-btn ie-action-primary" data-nav="home">Kembali ke Home</button>
        <button type="button" class="ie-action-btn" data-nav="search">Buka RizkySearch 95</button>
      </div>
    </div>
  `;
}

export const browserApp = {
  id: 'browser',
  title: 'Rizky Alviando — Microsoft Internet Explorer',
  icon: 'ie',
  width: 780,
  height: 590,
  minWidth: 420,
  minHeight: 380,
  singleton: true,
  resizable: true,

  onOpen(containerEl, winApi, args = {}) {
    const historyStack = [];
    let historyIndex = -1;
    let projectFilter = 'All';
    let serpTab = 'all';
    let lastSerpState = null;
    let openMenuName = null;
    let throbberTimer = null;
    let activeAgentReqId = 0;

    const projectFavItems = (PROJECTS || [])
      .slice(0, 6)
      .map(
        (p, idx) =>
          `<button type="button" class="win95-menu-item ie-menu-item" data-nav="project:${escapeHtml(p.slug || p.id)}">${String(idx + 1).padStart(2, '0')}. ${escapeHtml(p.title)}</button>`
      )
      .join('');

    containerEl.innerHTML = `
      <div class="ie-app">
        <div class="win95-menubar ie-menubar" role="menubar">
          <div class="ie-menu-group">
            <button type="button" class="win95-menubar-item ie-menu-btn" data-menu="file"><u>F</u>ile</button>
            <div class="win95-menu-dropdown ie-menu-dropdown" data-dropdown="file" hidden>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="search">RizkySearch 95 (In-Portal Search)...</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="open-cv">Open CV (Inline PDF)...</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="open-portfolio">Open Portofolio (Inline PDF)...</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="print">Print Page...</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="close">Close</button>
            </div>
          </div>
          <div class="ie-menu-group">
            <button type="button" class="win95-menubar-item ie-menu-btn" data-menu="view"><u>V</u>iew</button>
            <div class="win95-menu-dropdown ie-menu-dropdown" data-dropdown="view" hidden>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="back">Back</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="forward">Forward</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="refresh">Refresh</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="home">Home Page</button>
            </div>
          </div>
          <div class="ie-menu-group">
            <button type="button" class="win95-menubar-item ie-menu-btn" data-menu="favorites">F<u>a</u>vorites</button>
            <div class="win95-menu-dropdown ie-menu-dropdown" data-dropdown="favorites" hidden>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="home">Home Dossier</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="search">RizkySearch 95 Engine</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="agent:linkedin">LinkedIn Profile (In-Portal)</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="agent:github">GitHub @RizkyAl01 (In-Portal)</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="agent:pdf:cv-rizky-alviando">CV Resmi (In-Portal PDF)</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="about">About Rizky</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="experience">Experience</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="projects">Projects &amp; Case Studies</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="skills">Skills</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="contact">Contact</button>
              ${projectFavItems ? `<div class="win95-menu-sep"></div>${projectFavItems}` : ''}
            </div>
          </div>
          <div class="ie-menu-group">
            <button type="button" class="win95-menubar-item ie-menu-btn" data-menu="help"><u>H</u>elp</button>
            <div class="win95-menu-dropdown ie-menu-dropdown" data-dropdown="help" hidden>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="about-ie">About Internet Explorer 4.0...</button>
            </div>
          </div>
        </div>

        <div class="win95-toolbar ie-toolbar">
          <div class="ie-toolbar-btns">
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-action="back" title="Back" disabled>◀ Back</button>
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-action="forward" title="Forward" disabled>Forward ▶</button>
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-action="refresh" title="Refresh">↻ Refresh</button>
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-action="home" title="Home">Home</button>
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-nav="search" title="RizkySearch 95 In-Portal Search Engine">
              <span class="ie-tb-ico">${getIconSVG('ai', 14)}</span>
              <span>Search</span>
            </button>
            <span class="win95-toolbar-sep" aria-hidden="true"></span>
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-open-app="messenger" title="Open RizkyBot Messenger">
              <span class="ie-tb-ico">${getIconSVG('messenger', 14)}</span>
              <span>RizkyBot AI</span>
            </button>
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-open-app="explorer" data-path="C:\\Rizky\\Certificates" title="Browse Certificates">
              <span class="ie-tb-ico">${getIconSVG('pdf', 14)}</span>
              <span>Certificates</span>
            </button>
          </div>
          <div class="ie-throbber win95-sunken" title="Microsoft Internet Explorer 4.0">
            <svg class="ie-globe-svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="#003399" stroke="#ffffff" stroke-width="1.2"/>
              <ellipse cx="12" cy="12" rx="4.5" ry="9" fill="none" stroke="#80c8ff" stroke-width="1.1"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="#80c8ff" stroke-width="1.1"/>
              <path d="M5 7.5 Q12 9.5 19 7.5 M5 16.5 Q12 14.5 19 16.5" fill="none" stroke="#80c8ff" stroke-width="0.9"/>
              <ellipse cx="12" cy="12" rx="10.5" ry="3.8" transform="rotate(-24 12 12)" fill="none" stroke="#ffcc00" stroke-width="1.5"/>
            </svg>
          </div>
        </div>

        <form class="ie-addressbar" autocomplete="off">
          <span class="ie-bar-label">Address</span>
          <input type="text" class="win95-field ie-url-input" value="https://rizky.os/" placeholder="Ketik URL rizky.os, linkedin, github, atau kata kunci pencarian..." aria-label="Address or Search Query">
          <button type="submit" class="win95-btn win95-btn-sm ie-go-btn">Go</button>
        </form>

        <div class="ie-linksbar" role="navigation" aria-label="Quick Links">
          <span class="ie-bar-label">Links</span>
          <div class="ie-links-list">
            <button type="button" class="ie-link-tab" data-nav="home">Home</button>
            <button type="button" class="ie-link-tab" data-nav="about">About</button>
            <button type="button" class="ie-link-tab" data-nav="experience">Experience</button>
            <button type="button" class="ie-link-tab" data-nav="projects">Projects</button>
            <button type="button" class="ie-link-tab" data-nav="skills">Skills</button>
            <button type="button" class="ie-link-tab" data-nav="contact">Contact</button>
            <button type="button" class="ie-link-tab" data-nav="search">Search Agent</button>
          </div>
        </div>

        <main class="ie-viewport win95-sunken win95-scrollbar win95-selectable" tabindex="0"></main>
      </div>
    `;

    const rootEl = containerEl.querySelector('.ie-app');
    const viewportEl = containerEl.querySelector('.ie-viewport');
    const urlInput = containerEl.querySelector('.ie-url-input');
    const addressForm = containerEl.querySelector('.ie-addressbar');
    const backBtn = containerEl.querySelector('.ie-nav-btn[data-action="back"]');
    const fwdBtn = containerEl.querySelector('.ie-nav-btn[data-action="forward"]');
    const throbberEl = containerEl.querySelector('.ie-throbber');

    function closeMenus() {
      openMenuName = null;
      rootEl.querySelectorAll('.ie-menu-dropdown').forEach((d) => {
        d.hidden = true;
      });
      rootEl.querySelectorAll('.ie-menu-btn').forEach((b) => {
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
      const dd = rootEl.querySelector(`.ie-menu-dropdown[data-dropdown="${menuName}"]`);
      const btn = rootEl.querySelector(`.ie-menu-btn[data-menu="${menuName}"]`);
      if (dd) dd.hidden = false;
      if (btn) btn.classList.add('is-open');
    }

    function setThrobberLoading(isLoading) {
      if (throbberTimer) clearTimeout(throbberTimer);
      if (isLoading) {
        throbberEl.classList.add('is-loading');
      } else {
        throbberTimer = setTimeout(() => {
          throbberEl.classList.remove('is-loading');
        }, 260);
      }
    }

    function updateChrome(pageId) {
      const url = pageToUrl(pageId);
      const title = pageToTitle(pageId);
      urlInput.value = url;
      backBtn.disabled = historyIndex <= 0;
      fwdBtn.disabled = historyIndex >= historyStack.length - 1;

      const activeTab = pageId.startsWith('project:')
        ? 'projects'
        : pageId === 'search' || pageId.startsWith('search:') || pageId.startsWith('agent:')
        ? 'search'
        : pageId;
      rootEl.querySelectorAll('.ie-link-tab').forEach((tab) => {
        tab.classList.toggle('is-active', tab.dataset.nav === activeTab);
      });

      winApi?.setTitle?.(`${title} — Microsoft Internet Explorer`);
      winApi?.setStatus?.(`Done — ${url}`);
    }

    function refreshSerpTabView() {
      if (!lastSerpState) return;
      const { query, buckets, agentData } = lastSerpState;
      const headerHost = viewportEl.querySelector('.ie-serp-header-host');
      const bodyHost = viewportEl.querySelector('.ie-agent-result-body');
      if (headerHost) {
        headerHost.innerHTML = renderSearchBoxHeader(query, serpTab, buckets);
      }
      if (bodyHost) {
        bodyHost.innerHTML = renderSerpBodyHtml(query, buckets, serpTab, agentData);
      }
    }

    async function runBrowserAgentFlow(mode, queryOrTarget) {
      const reqId = ++activeAgentReqId;
      const isTargetMode = mode === 'agent' || mode === 'github-repo';
      const isRepoMode = mode === 'github-repo';
      const targetId = mode === 'agent' ? queryOrTarget : isRepoMode ? 'github_repo' : null;
      const repoName = isRepoMode ? queryOrTarget : null;

      if (mode === 'agent' && queryOrTarget === 'canva') {
        viewportEl.innerHTML = renderInlinePdfPortalPage('portfolio-deck');
        viewportEl.scrollTop = 0;
        setThrobberLoading(false);
        return;
      }

      const displayQuery = isRepoMode
        ? `https://github.com/RizkyAl01/${repoName}`
        : isTargetMode
        ? OFFICIAL_TARGETS[targetId]?.url || targetId
        : queryOrTarget;

      let serpBuckets = !isTargetMode ? buildSerpItems(queryOrTarget, null) : null;
      if (!isTargetMode) {
        lastSerpState = { query: queryOrTarget, buckets: serpBuckets, agentData: null };
      } else {
        lastSerpState = null;
      }

      const initialSteps = isTargetMode
        ? [
            { step: 1, action: 'In-Portal Router', detail: `Memuat halaman ${displayQuery} di dalam viewport IE 4.0...`, status: 'ALLOW' },
            { step: 2, action: 'Remote Agent Probe', detail: `Menghubungi POST /api/ie-agent untuk sinkronisasi data live...`, status: 'RUNNING' }
          ]
        : [
            { step: 1, action: 'Security Zone Check', detail: `Memeriksa kueri "${queryOrTarget}" pada RizkyOS 95 Security Zone...`, status: 'CHECKING' },
            { step: 2, action: 'In-Portal Indexer', detail: `Menyusun SERP dari 13 proyek, 9 pengalaman, 15 PDF, LinkedIn, dan GitHub...`, status: 'DONE' },
            { step: 3, action: 'AI Search Copilot', detail: `Menghubungi POST /api/ie-agent (Groq LLM + Semantic BM25)...`, status: 'RUNNING' }
          ];

      const initialBodyHtml = isRepoMode
        ? renderGitHubRepoDossierHtml(repoName, null)
        : isTargetMode
        ? targetId === 'linkedin'
          ? renderLinkedInDossierHtml(null)
          : targetId === 'github'
          ? renderGitHubDossierHtml(null)
          : renderInPortalWebReaderHtml(targetId, null)
        : renderSerpBodyHtml(queryOrTarget, serpBuckets, serpTab, null);

      viewportEl.innerHTML = `
        <div class="ie-article ie-agent-page">
          <div class="ie-breadcrumb">
            <button type="button" class="ie-text-link" data-nav="search">← Beranda RizkySearch 95</button>
            <span class="ie-crumb-cat">In-Portal Search Engine &amp; Browser Agent</span>
          </div>

          <div class="ie-serp-header-host">
            ${renderSearchBoxHeader(displayQuery, serpTab, serpBuckets)}
          </div>

          <section class="ie-agent-console win95-sunken" aria-live="polite">
            <div class="ie-agent-console-head">
              <strong>IE 4.0 IN-PORTAL AGENT TRACE</strong>
              <span class="ie-agent-status-badge is-running">SYNCING /API/IE-AGENT...</span>
            </div>
            <div class="ie-agent-steps">${formatAgentStepsHtml(initialSteps)}</div>
          </section>

          <div class="ie-agent-result-body">${initialBodyHtml}</div>
        </div>
      `;
      viewportEl.scrollTop = 0;

      setThrobberLoading(true);
      winApi?.setStatus?.(`Memuat hasil di dalam portal untuk "${displayQuery}"...`);

      try {
        const payload = isRepoMode
          ? { query: `agent:github-repo:${repoName}`, url: `https://github.com/RizkyAl01/${repoName}` }
          : isTargetMode
          ? { query: `agent:${targetId}`, url: OFFICIAL_TARGETS[targetId]?.url || '' }
          : { query: queryOrTarget };

        const response = await fetch('/api/ie-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (reqId !== activeAgentReqId) return;

        const stepsEl = viewportEl.querySelector('.ie-agent-steps');
        const badgeEl = viewportEl.querySelector('.ie-agent-status-badge');
        const bodyEl = viewportEl.querySelector('.ie-agent-result-body');
        const headerHost = viewportEl.querySelector('.ie-serp-header-host');
        if (!stepsEl || !badgeEl || !bodyEl) return;

        if (data && Array.isArray(data.agent_steps) && data.agent_steps.length) {
          stepsEl.innerHTML = formatAgentStepsHtml(data.agent_steps);
        }

        if (data && (data.allowed === false || data.intent === 'blocked')) {
          badgeEl.textContent = 'RESTRICTED (SCOPE LOCK)';
          badgeEl.className = 'ie-agent-status-badge is-blocked';
          if (headerHost) {
            headerHost.innerHTML = renderSearchBoxHeader(displayQuery, serpTab, null);
          }
          bodyEl.innerHTML = renderBlockedAgentHtml(displayQuery, data.reason);
          winApi?.setStatus?.('RizkyOS 95 Security Zone: Permintaan di luar ruang lingkup Rizky Alviando.');
          return;
        }

        badgeEl.textContent = 'IN-PORTAL · 200 OK';
        badgeEl.className = 'ie-agent-status-badge is-ok';

        if (isRepoMode || data?.target_id === 'github_repo') {
          bodyEl.innerHTML = renderGitHubRepoDossierHtml(repoName || data?.live_probe?.repo_name || 'web-chatbot', data);
        } else if (isTargetMode) {
          if (targetId === 'linkedin') {
            bodyEl.innerHTML = renderLinkedInDossierHtml(data);
          } else if (targetId === 'github') {
            bodyEl.innerHTML = renderGitHubDossierHtml(data);
          } else {
            bodyEl.innerHTML = renderInPortalWebReaderHtml(targetId, data);
          }
        } else {
          // Always render full Bing-like SERP on search:<query> (even if backend matched a target)
          serpBuckets = buildSerpItems(queryOrTarget, data);
          lastSerpState = { query: queryOrTarget, buckets: serpBuckets, agentData: data };
          if (headerHost) {
            headerHost.innerHTML = renderSearchBoxHeader(queryOrTarget, serpTab, serpBuckets);
          }
          bodyEl.innerHTML = renderSerpBodyHtml(queryOrTarget, serpBuckets, serpTab, data);
        }

        winApi?.setStatus?.(`Done — ${pageToUrl(historyStack[historyIndex] || 'search')}`);
      } catch {
        if (reqId !== activeAgentReqId) return;
        const badgeEl = viewportEl.querySelector('.ie-agent-status-badge');
        if (badgeEl) {
          badgeEl.textContent = 'IN-PORTAL LOCAL INDEX';
          badgeEl.className = 'ie-agent-status-badge is-ok';
        }
      } finally {
        if (reqId === activeAgentReqId) {
          setThrobberLoading(false);
        }
      }
    }

    function renderPage(pageId) {
      activeAgentReqId += 1;
      updateChrome(pageId);

      if (pageId === 'search') {
        lastSerpState = null;
        viewportEl.innerHTML = renderSearchHomePage();
        viewportEl.scrollTop = 0;
        setThrobberLoading(false);
        return;
      }
      if (pageId.startsWith('agent:pdf:')) {
        lastSerpState = null;
        const certKey = pageId.slice('agent:pdf:'.length);
        viewportEl.innerHTML = renderInlinePdfPortalPage(certKey);
        viewportEl.scrollTop = 0;
        setThrobberLoading(false);
        return;
      }
      if (pageId.startsWith('agent:github-repo:')) {
        const repoName = pageId.slice('agent:github-repo:'.length);
        runBrowserAgentFlow('github-repo', repoName);
        return;
      }
      if (pageId.startsWith('agent:web:')) {
        lastSerpState = null;
        let payload = null;
        try {
          payload = JSON.parse(decodeURIComponent(pageId.slice('agent:web:'.length)));
        } catch {
          payload = { title: 'Web Result', url: 'https://rizky.os/search' };
        }
        viewportEl.innerHTML = `<div class="ie-article">${renderInPortalWebReaderHtml('web', null, payload)}</div>`;
        viewportEl.scrollTop = 0;
        setThrobberLoading(false);
        return;
      }
      if (pageId.startsWith('agent:')) {
        const targetId = pageId.slice('agent:'.length);
        runBrowserAgentFlow('agent', targetId);
        return;
      }
      if (pageId.startsWith('search:')) {
        const query = pageId.slice('search:'.length);
        serpTab = 'all';
        runBrowserAgentFlow('search', query);
        return;
      }

      lastSerpState = null;
      let html = '';
      if (pageId === 'home') {
        html = renderHomePage();
      } else if (pageId === 'about') {
        html = renderAboutPage();
      } else if (pageId === 'experience') {
        html = renderExperiencePage();
      } else if (pageId === 'projects') {
        html = renderProjectsPage(projectFilter);
      } else if (pageId.startsWith('project:')) {
        html = renderProjectDetailPage(pageId.slice('project:'.length));
      } else if (pageId === 'skills') {
        html = renderSkillsPage();
      } else if (pageId === 'contact') {
        html = renderContactPage();
      } else {
        html = renderNotFoundPage(pageId);
      }

      viewportEl.innerHTML = html;
      viewportEl.scrollTop = 0;
      setThrobberLoading(true);
      setThrobberLoading(false);
    }

    function submitQueryOrCommand(rawInput) {
      const text = String(rawInput ?? '').trim();
      if (!text) {
        navigate('search', true);
        return;
      }
      navigate(text, true);
    }

    function navigate(rawTarget, pushHistory = true) {
      const pageId = normalizePageId(rawTarget);
      if (pushHistory) {
        if (historyStack[historyIndex] !== pageId) {
          historyStack.splice(historyIndex + 1);
          historyStack.push(pageId);
          historyIndex = historyStack.length - 1;
        }
      }
      renderPage(pageId);
      winApi?.focus?.();
    }

    function goBack() {
      if (historyIndex > 0) {
        historyIndex -= 1;
        renderPage(historyStack[historyIndex]);
      }
    }

    function goForward() {
      if (historyIndex < historyStack.length - 1) {
        historyIndex += 1;
        renderPage(historyStack[historyIndex]);
      }
    }

    function handleAppTrigger(el) {
      const appId = el.dataset.openApp;
      if (!appId) return;
      const appArgs = {};
      if (el.dataset.doc) appArgs.doc = el.dataset.doc;
      if (el.dataset.path) appArgs.path = el.dataset.path;
      if (el.dataset.prefill) appArgs.prefillPrompt = el.dataset.prefill;
      winApi?.os?.openApp?.(appId, appArgs);
    }

    rootEl.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.ie-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        sound.playClick();
        toggleMenu(menuBtn.dataset.menu);
        return;
      }

      const serpTabBtn = e.target.closest('[data-serp-tab]');
      if (serpTabBtn) {
        sound.playClick();
        serpTab = serpTabBtn.dataset.serpTab || 'all';
        refreshSerpTabView();
        return;
      }

      const cmdBtn = e.target.closest('[data-agent-cmd]');
      if (cmdBtn) {
        sound.playClick();
        closeMenus();
        submitQueryOrCommand(cmdBtn.dataset.agentCmd);
        return;
      }

      const pdfBtn = e.target.closest('[data-open-pdf]');
      if (pdfBtn) {
        sound.playOpen();
        closeMenus();
        winApi?.os?.openApp?.('pdf-viewer', {
          certId: pdfBtn.dataset.certId || undefined,
          file: pdfBtn.dataset.openPdf,
          title: pdfBtn.dataset.pdfTitle || 'PDF Document'
        });
        return;
      }

      const filterBtn = e.target.closest('[data-filter-cat]');
      if (filterBtn) {
        sound.playClick();
        projectFilter = filterBtn.dataset.filterCat || 'All';
        renderPage('projects');
        return;
      }

      const openAppEl = e.target.closest('[data-open-app]');
      if (openAppEl) {
        sound.playClick();
        closeMenus();
        handleAppTrigger(openAppEl);
        return;
      }

      const navEl = e.target.closest('[data-nav]');
      if (navEl) {
        sound.playClick();
        closeMenus();
        navigate(navEl.dataset.nav, true);
        return;
      }

      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        sound.playClick();
        const act = actionEl.dataset.action;
        closeMenus();
        if (act === 'back') goBack();
        else if (act === 'forward') goForward();
        else if (act === 'refresh') renderPage(historyStack[historyIndex] || 'home');
        else if (act === 'home') navigate('home', true);
        else if (act === 'open-cv') navigate('agent:pdf:cv-rizky-alviando', true);
        else if (act === 'open-portfolio') navigate('agent:pdf:portfolio-deck', true);
        else if (act === 'print') window.print();
        else if (act === 'close') winApi?.close?.();
        else if (act === 'about-ie') {
          winApi?.os?.showDialog?.({
            title: 'About Microsoft Internet Explorer',
            icon: 'ie',
            message:
              'Microsoft Internet Explorer 4.0 — RizkyOS 95 Edition\n\nDilengkapi RizkySearch 95 In-Portal Search Engine untuk mencari dan menampilkan profil LinkedIn, repositori GitHub + README.md, 13 studi kasus AI, serta 15 dokumen PDF langsung di dalam jendela browser ini.',
            buttons: ['OK']
          });
        }
        return;
      }

      if (openMenuName) closeMenus();
    });

    viewportEl.addEventListener('change', (e) => {
      const pdfSelect = e.target.closest('.ie-inline-pdf-select');
      if (pdfSelect && pdfSelect.value) {
        sound.playClick();
        navigate(`agent:pdf:${pdfSelect.value}`, true);
      }
    });

    viewportEl.addEventListener('submit', (e) => {
      const searchForm = e.target.closest('.ie-search-form');
      if (searchForm) {
        e.preventDefault();
        sound.playClick();
        const input = searchForm.querySelector('.ie-search-input');
        const q = input ? input.value.trim() : '';
        if (!q) {
          navigate('search', true);
        } else {
          // Search box always runs in-portal SERP unless user explicitly typed an agent: route
          const extDirect = detectExternalTargetCommand(q);
          navigate(extDirect || `search:${q}`, true);
        }
      }
    });

    viewportEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('[data-nav][role="button"]');
        if (card) {
          e.preventDefault();
          sound.playClick();
          navigate(card.dataset.nav, true);
        }
      }
    });

    addressForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playClick();
      submitQueryOrCommand(urlInput.value);
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
      if (newArgs && newArgs.query) {
        navigate(`search:${newArgs.query}`, true);
      } else if (newArgs && newArgs.page) {
        navigate(newArgs.page, true);
      }
    });

    winApi?.onClose?.(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeydown);
      if (throbberTimer) clearTimeout(throbberTimer);
      activeAgentReqId += 1;
    });

    if (args?.query) {
      navigate(`search:${args.query}`, true);
    } else {
      navigate(args?.page || 'home', true);
    }
  }
};
