import {
  PROFILE,
  EXPERIENCES,
  PROJECTS,
  SKILLS,
  CERTIFICATES
} from '../data.js';
import { getIconSVG } from '../icons.js';
import { sound } from '../sound.js';

const CANONICAL_HOST = 'rizkyalviando.ai.id';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

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

function isLocalPdfPath(rawUrl) {
  const url = String(rawUrl ?? '').trim();
  return /^assets\/[^\s<>"']+\.pdf$/i.test(url);
}

function renderExtIconBtn(url, label, extraClass = '') {
  const href = safeHref(url);
  if (href === '#') return '';
  const cls = extraClass ? `ie-ext-icon-btn ${extraClass}` : 'ie-ext-icon-btn';
  return `<a class="${cls}" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${getIconSVG('external-link', 14)}</a>`;
}

const OFFICIAL_TARGETS = {
  linkedin: {
    id: 'linkedin',
    title: 'LinkedIn - Rizky Alviando, S.Mat.',
    url: PROFILE?.linkedin || 'https://www.linkedin.com/in/rizky-alviando-31b47021b/',
    breadcrumb: 'https://www.linkedin.com › in › rizky-alviando-31b47021b',
    displayUrl: 'linkedin.com/in/rizky-alviando-31b47021b',
    badge: 'LinkedIn',
    desc: 'AI Engineer di DJED Komdigi · S1 Matematika ITS (Cum Laude, IPK 3.67/4.00) · Bangkit Academy ML Graduate · Best Presentation GPBL Shibaura Institute of Technology Tokyo.'
  },
  github: {
    id: 'github',
    title: 'GitHub - @RizkyAl01',
    url: PROFILE?.github || 'https://github.com/RizkyAl01',
    breadcrumb: 'https://github.com › RizkyAl01',
    displayUrl: 'github.com/RizkyAl01',
    badge: 'GitHub',
    desc: 'Repositori kode open-source Rizky Alviando: Smart Agentic RAG, LexGraph Legal Graph-RAG, AegisLake Medallion Pipeline, SentinelEval, NusantaraASR, dan RizkyOS 95.'
  },
  canva: {
    id: 'canva',
    title: 'Portofolio AI & Machine Learning 2026 - Rizky Alviando',
    url: PROFILE?.canvaPortfolio || 'https://canva.link/Rizky-Alviando-PortoAIML26',
    breadcrumb: 'https://canva.link › Rizky-Alviando-PortoAIML26',
    displayUrl: 'canva.link/Rizky-Alviando-PortoAIML26',
    badge: 'Slide Deck',
    desc: 'Presentasi visual portofolio AI & Machine Learning Rizky Alviando (tersedia sebagai PDF dan tautan Canva resmi).'
  },
  rag_demo: {
    id: 'rag_demo',
    title: 'Smart Agentic RAG: AI Document Assistant',
    url: 'https://project-rag-zeta.vercel.app/',
    breadcrumb: 'https://project-rag-zeta.vercel.app',
    displayUrl: 'project-rag-zeta.vercel.app',
    badge: 'Live Demo',
    desc: 'Aplikasi tanya-jawab dokumen PDF menggunakan LangGraph state machine, FastAPI, Groq LLM, PyMuPDF, dan Supabase pgvector.'
  },
  sugaryzer: {
    id: 'sugaryzer',
    title: 'Sugaryzer - Bangkit Academy 2024 Capstone',
    url: 'https://github.com/orgs/Sugaryzer/repositories',
    breadcrumb: 'https://github.com › orgs › Sugaryzer › repositories',
    displayUrl: 'github.com/orgs/Sugaryzer/repositories',
    badge: 'Capstone Repo',
    desc: 'Proyek Capstone Bangkit Academy 2024: OCR pembaca kode barcode & nutrisi kemasan serta klasifikasi konsumsi gula harian berbasis TensorFlow (Akurasi 89%).'
  },
  telegram: {
    id: 'telegram',
    title: 'Bot Telegram Rizky Alviando (@yourneed_bot · @crawlyt_bot · @guruserbabisa_bot)',
    url: 'https://t.me/yourneed_bot',
    breadcrumb: 'https://t.me › yourneed_bot',
    displayUrl: 't.me/yourneed_bot',
    badge: 'Telegram',
    desc: 'Bot publik Telegram berbasis FastAPI Webhook, Groq LLM, dan orkestrasi n8n yang dibangun Rizky Alviando.'
  },
  coursera: {
    id: 'coursera',
    title: 'Coursera Verified Credentials - DeepLearning.AI & Stanford',
    url: 'https://coursera.org/verify/professional-cert/7QM26EI7X8DK',
    breadcrumb: 'https://coursera.org › verify › professional-cert › 7QM26EI7X8DK',
    displayUrl: 'coursera.org/verify/professional-cert/7QM26EI7X8DK',
    badge: 'Coursera',
    desc: '6 sertifikasi spesialisasi Coursera terverifikasi: TensorFlow Developer, Machine Learning, Deep Learning, Mathematics for ML, dan TensorFlow Data & Deployment.'
  },
  plti: {
    id: 'plti',
    title: 'PLTI - Sertifikat TOEP (Test of English Proficiency)',
    url: 'https://plti.co.id',
    breadcrumb: 'https://plti.co.id',
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
    topics: ['windows-95', 'fastapi', 'groq-llm', 'bm25-rag', 'threejs'],
    projectSlug: 'rizkyos-portfolio-ai',
    description:
      'RizkyOS 95 Desktop Portfolio, 3D Isometric Room (Three.js), & FastAPI + Groq LLM + Semantic BM25 RAG Assistant.',
    files: [
      { name: 'api/index.py', type: 'file', info: 'FastAPI Backend, Semantic BM25 Retriever, /api/web-chat & /api/ie-agent' },
      { name: 'frontend/os/wm.js', type: 'file', info: 'Windows 95 Window Manager, BIOS Boot, Taskbar & CRT Engine' },
      { name: 'frontend/os/apps/browser.js', type: 'file', info: 'Internet Explorer 4.0 Editorial Reader & RizkySearch 95' },
      { name: 'frontend/os/apps/messenger.js', type: 'file', info: 'RizkyBot Messenger 95 (1999 MSN Transcript & Nudge)' },
      { name: 'frontend/open-world.html', type: 'file', info: 'Interactive 3D Isometric Room (Three.js + GLTF + Playable Chess)' },
      { name: 'README.md', type: 'file', info: 'Architecture & Deployment Documentation' }
    ],
    readme: `# RizkyOS 95 - Desktop Portfolio & AI Assistant

Portofolio interaktif bergaya sistem operasi desktop **Windows 95** milik **Rizky Alviando, S.Mat.** (AI Engineer di DJED Komdigi & Lulusan S1 Matematika ITS Cum Laude).

## Arsitektur Utama
- **Frontend OS Shell**: Window Manager modular Vanilla ES6 (\`wm.js\`), 14 aplikasi (Internet Explorer 4.0 + RizkySearch 95, RizkyBot Messenger 95, MS-DOS Prompt, Ojek Rush 95, Minesweeper 95, Catur 95, Rubik Solver 95, 3D Room).
- **Backend AI & Search**: FastAPI (\`api/index.py\`) dengan Semantic Markdown Chunking & BM25 Retriever, Groq LLM multi-model fallback, Supabase PostgreSQL memory, dan Upstash Redis rate-limiting.`
  },
  {
    name: 'Smart-Agentic-RAG',
    full_name: 'RizkyAl01/Smart-Agentic-RAG',
    language: 'Python',
    stargazers_count: 4,
    topics: ['langgraph', 'agentic-rag', 'fastapi', 'pgvector', 'supabase'],
    projectSlug: 'smart-agentic-rag',
    description:
      'Agentic PDF Document Assistant powered by LangGraph, FastAPI, Groq LLM, PyMuPDF, and Supabase pgvector.',
    files: [
      { name: 'app/graph.py', type: 'file', info: 'LangGraph State Machine (Query Rewrite -> Retrieve -> Grade -> Generate)' },
      { name: 'app/ingest.py', type: 'file', info: 'PyMuPDF PDF Parsing & Recursive Character Chunking' },
      { name: 'app/vectorstore.py', type: 'file', info: 'Supabase PostgreSQL pgvector Similarity Search' },
      { name: 'README.md', type: 'file', info: 'System Architecture & Evaluation Benchmarks' }
    ],
    readme: `# Smart Agentic RAG - AI Document Assistant

Sistem tanya-jawab dokumen PDF menggunakan **LangGraph**, **FastAPI**, **Groq LLM**, dan **Supabase pgvector**.`
  },
  {
    name: 'AegisLake-Medallion',
    full_name: 'RizkyAl01/AegisLake-Medallion',
    language: 'Python',
    stargazers_count: 3,
    topics: ['medallion', 'duckdb', 'polars', 'airflow', 'uu-pdp'],
    projectSlug: 'aegislake',
    description:
      'Medallion Architecture (Bronze-Silver-Gold) Data Pipeline & IndonesianPIIGuard (UU PDP) with DuckDB & Airflow.',
    files: [
      { name: 'dags/medallion_pipeline.py', type: 'file', info: 'Apache Airflow DAG (Bronze -> Silver -> Gold)' },
      { name: 'aegislake/pii_guard.py', type: 'file', info: 'IndonesianPIIGuard (Auto-masking NIK 16-digit, Telepon, Rekening)' },
      { name: 'aegislake/sandbox.py', type: 'file', info: 'Isolated DuckDB Columnar Analytics Sandbox' },
      { name: 'README.md', type: 'file', info: 'Data Governance & UU PDP Compliance Guide' }
    ],
    readme: `# AegisLake - Pipeline Data Medallion & Sandbox Pelatihan AI

Arsitektur data **Bronze–Silver–Gold** yang dilengkapi penyensoran PII otomatis sesuai **UU PDP** sebelum dataset menyentuh pelatihan model AI.`
  },
  {
    name: 'LexGraph-Legal-RAG',
    full_name: 'RizkyAl01/LexGraph-Legal-RAG',
    language: 'Python',
    stargazers_count: 4,
    topics: ['graph-rag', 'neo4j', 'pgvector', 'bm25', 'flashrank'],
    projectSlug: 'lexgraph',
    description:
      'Indonesian Legal & Regulation Graph-RAG using Pasal/Ayat chunking, BM25 + pgvector (RRF), Neo4j, & FlashRank ONNX.',
    files: [
      { name: 'lexgraph/chunker.py', type: 'file', info: 'Structural Legal Chunker (BAB, Bagian, Pasal, Ayat)' },
      { name: 'lexgraph/hybrid_retriever.py', type: 'file', info: 'BM25 + PostgreSQL pgvector + Reciprocal Rank Fusion (RRF)' },
      { name: 'lexgraph/graph_traverse.py', type: 'file', info: 'Neo4j Multi-Hop Cross-Referenced Pasal Expansion' },
      { name: 'README.md', type: 'file', info: 'Legal Graph-RAG Architecture' }
    ],
    readme: `# LexGraph - Pencarian Regulasi & Dokumen Hukum dengan Graph-RAG

Mesin pencari regulasi berbasis **Graph-RAG** dengan pemotongan struktur **Pasal–Ayat**, pencarian hibrida **BM25 + pgvector (RRF)**, ekspansi graf **Neo4j**, dan reranking **FlashRank ONNX**.`
  },
  {
    name: 'SentinelEval-LLM',
    full_name: 'RizkyAl01/SentinelEval-LLM',
    language: 'TypeScript / Python',
    stargazers_count: 3,
    topics: ['ai-safety', 'red-teaming', 'llm-evaluation'],
    projectSlug: 'sentineleval',
    description:
      'Automated LLM Red-Teaming & AI Risk Governance Benchmark (Homoglyph, Nusantara Local Dialect, & Jailbreak Guards).',
    files: [
      { name: 'sentineleval/attacks/', type: 'folder', info: 'Adversarial Prompt Suites (Homoglyph, Bahasa Daerah, Multi-Turn)' },
      { name: 'sentineleval/evaluator.py', type: 'file', info: 'Automated Safety Scoring & Risk Matrix Generator' },
      { name: 'README.md', type: 'file', info: 'Red-Teaming Methodology' }
    ],
    readme: `# SentinelEval - Perangkat Uji Keamanan (Red-Teaming) & Evaluasi Risiko LLM

Kerangka kerja pengujian adversarial otomatis untuk menguji ketahanan model bahasa terhadap serangan prompt injection, manipulasi karakter homoglyph, dan jailbreak berbahasa lokal Nusantara.`
  },
  {
    name: 'NusantaraASR-Pipeline',
    full_name: 'RizkyAl01/NusantaraASR-Pipeline',
    language: 'Python',
    stargazers_count: 3,
    topics: ['whisperx', 'wav2vec2', 'pyannote', 'asr'],
    projectSlug: 'nusantara-asr',
    description:
      'YouTube Audio Transcription & Regional Dialect Post-Correction with WhisperX large-v3, Wav2Vec2, & Pyannote.',
    files: [
      { name: 'pipeline/transcribe.py', type: 'file', info: 'WhisperX large-v3 + Wav2Vec2 Forced Alignment' },
      { name: 'pipeline/diarize.py', type: 'file', info: 'Pyannote Speaker Diarization & VAD' },
      { name: 'README.md', type: 'file', info: 'Audio Pipeline Documentation' }
    ],
    readme: `# NusantaraASR - Pipeline Transkripsi Audio & Diarisasi Pembicara

Pipeline ekstraksi dan transkripsi audio YouTube berskala besar (workflow success rate 95%) menggunakan **WhisperX large-v3**, perataan waktu **Wav2Vec2**, dan pemisahan pembicara **Pyannote**.`
  },
  {
    name: 'Sugaryzer-Bangkit-Capstone',
    full_name: 'Sugaryzer/Sugaryzer-App',
    language: 'Python / TensorFlow',
    stargazers_count: 6,
    topics: ['bangkit-academy', 'tensorflow', 'ocr', 'computer-vision'],
    projectSlug: 'sugaryzer-bangkit',
    description:
      'Bangkit Academy 2024 Capstone MVP: Daily Sugar Consumption Analysis with OCR & TensorFlow Classification (89% Acc).',
    files: [
      { name: 'ml/ocr_barcode.py', type: 'file', info: 'Computer Vision & OCR Barcode / Nutrition Label Extractor' },
      { name: 'ml/sugar_classifier.py', type: 'file', info: 'TensorFlow Daily Sugar Intake Classification & Clustering Model' },
      { name: 'README.md', type: 'file', info: 'Bangkit Academy 2024 Capstone Documentation' }
    ],
    readme: `# Sugaryzer - Bangkit Academy 2024 Capstone Project

Aplikasi kesehatan yang dikembangkan oleh tim lintas fungsi (Machine Learning, Cloud Computing, Mobile Development) di **Bangkit Academy 2024** dengan akurasi klasifikasi konsumsi gula harian 89%.`
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

  const payload = encodeURIComponent(JSON.stringify({ url, title: fallbackTitle || url }));
  return `agent:web:${payload}`;
}

function detectExternalTargetCommand(rawInput) {
  const text = String(rawInput ?? '').trim();
  if (!text) return null;
  const lower = text.toLowerCase();

  const repoUrlMatch = text.match(/github\.com\/rizkyal01\/([A-Za-z0-9._-]+)/i);
  if (repoUrlMatch) {
    return `agent:github-repo:${repoUrlMatch[1]}`;
  }
  if (/github\.com\/orgs\/sugaryzer/i.test(lower)) {
    return 'agent:github-repo:Sugaryzer-Bangkit-Capstone';
  }

  if (
    /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/rizky-alviando-31b47021b\/?$/i.test(lower) ||
    /^(visit|buka|open|kunjungi|lihat)?\s*(profil\s+)?linkedin(\s+asli|\s+aslinya|\s+rizky)?$/i.test(lower)
  ) {
    return 'agent:linkedin';
  }

  if (
    /^(https?:\/\/)?(www\.)?github\.com\/rizkyal01\/?$/i.test(lower) ||
    /^(visit|buka|open|kunjungi|lihat|inspect)?\s*(live\s+)?github(\s+asli|\s+aslinya|\s+rizky|\s+@?rizkyal01)?$/i.test(lower)
  ) {
    return 'agent:github';
  }

  if (
    /canva\.link\/rizky-alviando-portoaiml26/i.test(lower) ||
    /^(visit|buka|open|lihat)\s+(canva|slide\s+portofolio|portofolio\s+canva)$/i.test(lower)
  ) {
    return 'agent:canva';
  }

  if (/^https?:\/\/(www\.)?coursera\.org\/verify\//i.test(lower)) {
    return mapExternalUrlToInternalNav(text);
  }

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
  const isInternalOrigin = /^(https?:\/\/)?(www\.)?(rizkyalviando\.ai\.id|rizky\.os)(\/|$)/i.test(raw);
  if (isInternalOrigin) {
    raw = raw.replace(/^(https?:\/\/)?(www\.)?(rizkyalviando\.ai\.id|rizky\.os)\/?/i, '');
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
  if (pageId === 'home') return `${CANONICAL_ORIGIN}/`;
  if (pageId === 'search') return `${CANONICAL_ORIGIN}/search`;
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
    return `${CANONICAL_ORIGIN}/certs/${cert ? cert.id : key}`;
  }
  if (pageId.startsWith('agent:web:')) {
    try {
      const parsed = JSON.parse(decodeURIComponent(pageId.slice('agent:web:'.length)));
      if (parsed?.url) return parsed.url;
    } catch {
      // ignore
    }
    return `${CANONICAL_ORIGIN}/search`;
  }
  if (pageId.startsWith('agent:')) {
    const t = pageId.slice('agent:'.length);
    return OFFICIAL_TARGETS[t]?.url || `${CANONICAL_ORIGIN}/${t}`;
  }
  if (pageId.startsWith('search:')) {
    const q = pageId.slice('search:'.length);
    return `${CANONICAL_ORIGIN}/search?q=${encodeURIComponent(q)}`;
  }
  if (pageId.startsWith('project:')) {
    const slug = pageId.slice('project:'.length);
    const proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
    if (proj?.url && /^https?:\/\//i.test(proj.url)) {
      return proj.url.replace(/^https?:\/\/rizky\.os/i, CANONICAL_ORIGIN);
    }
    return `${CANONICAL_ORIGIN}/projects/${slug}`;
  }
  return `${CANONICAL_ORIGIN}/${pageId}`;
}

function pageToTitle(pageId) {
  const brand = PROFILE?.name || 'Rizky Alviando';
  if (pageId === 'home') return `${brand} - Portfolio`;
  if (pageId === 'about') return `About - ${brand}`;
  if (pageId === 'experience') return `Experience - ${brand}`;
  if (pageId === 'projects') return `Projects & Case Studies - ${brand}`;
  if (pageId === 'skills') return `Skills & Technical Stack - ${brand}`;
  if (pageId === 'contact') return `Contact - ${brand}`;
  if (pageId === 'search') return `RizkySearch 95`;
  if (pageId.startsWith('agent:github-repo:')) {
    const repo = pageId.slice('agent:github-repo:'.length);
    return `RizkyAl01/${repo} - GitHub`;
  }
  if (pageId.startsWith('agent:pdf:')) {
    const cert = findCertByFileOrId(pageId.slice('agent:pdf:'.length));
    return `${cert?.title || 'Dokumen PDF'} - PDF Viewer`;
  }
  if (pageId.startsWith('agent:web:')) {
    return `Web Reader - RizkySearch 95`;
  }
  if (pageId.startsWith('agent:')) {
    const t = pageId.slice('agent:'.length);
    const info = OFFICIAL_TARGETS[t];
    return info ? info.title : brand;
  }
  if (pageId.startsWith('search:')) {
    const q = pageId.slice('search:'.length);
    return `${q} - RizkySearch 95`;
  }
  if (pageId.startsWith('project:')) {
    const slug = pageId.slice('project:'.length);
    const proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
    if (proj) return `${proj.title} - Case Study`;
  }
  return 'Page Not Found';
}

function renderPortrait(className = 'ie-avatar-img', size = 88) {
  const name = PROFILE?.name || 'Rizky Alviando';
  const photoSrc = PROFILE?.photo || 'assets/images/IMG-20250903-WA0024.jpg';
  return `<img class="${className}" src="${escapeHtml(photoSrc)}" alt="${escapeHtml(name)}" width="${size}" height="${size}">`;
}

function renderEditorialProjectItem(project, indexNumber) {
  const slug = project.slug || project.id || '';
  const num = String(indexNumber + 1).padStart(2, '0');
  const techText = Array.isArray(project.techStack) ? project.techStack.slice(0, 5).join(' · ') : '';
  const topMetric =
    Array.isArray(project.metrics) && project.metrics.length
      ? `${project.metrics[0].label}: ${project.metrics[0].value}`
      : '';
  const metaParts = [project.category, project.date, project.readTime, topMetric].filter(Boolean);

  return `
    <article class="ie-editorial-item" data-nav="project:${escapeHtml(slug)}" tabindex="0" role="button">
      <div class="ie-ed-num">${num}</div>
      <div class="ie-ed-body">
        <div class="ie-ed-meta">${escapeHtml(metaParts.join(' · '))}</div>
        <h3 class="ie-ed-title">${escapeHtml(project.title || 'Untitled Project')}</h3>
        <p class="ie-ed-thesis">${escapeHtml(project.subtitle || project.summary || '')}</p>
        ${techText ? `<div class="ie-ed-tech">${escapeHtml(techText)}</div>` : ''}
      </div>
    </article>
  `;
}

function renderHomePage() {
  const projects = Array.isArray(PROJECTS) ? PROJECTS : [];
  const featured = projects.slice(0, 5);
  const certCount = Array.isArray(CERTIFICATES) ? CERTIFICATES.length : 0;

  return `
    <div class="ie-article ie-home ie-editorial">
      <header class="ie-hero">
        <div class="ie-hero-top">
          <div class="ie-avatar-frame">
            ${renderPortrait('ie-avatar-img', 92)}
          </div>
          <div class="ie-hero-copy">
            <h1 class="ie-headline">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</h1>
            <p class="ie-subhead">${escapeHtml(PROFILE?.role || 'AI Engineer & Data Specialist')} - ${escapeHtml(PROFILE?.location || 'Jakarta & Surabaya')}</p>
            <div class="ie-meta-strip">
              IPK 3,67 Cum Laude (ITS) · ${projects.length} Proyek AI &amp; Data · ${certCount} Dokumen Resmi · DJED Komdigi
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
            <span>Buka CV (PDF)</span>
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

      <section class="ie-section">
        <div class="ie-section-head">
          <h2 class="ie-section-title">Selected Case Studies</h2>
          <button type="button" class="ie-text-link" data-nav="projects">Semua proyek (${projects.length}) →</button>
        </div>
        <div class="ie-editorial-list">
          ${featured.map((proj, idx) => renderEditorialProjectItem(proj, idx)).join('')}
        </div>
      </section>

      <section class="ie-section">
        <h2 class="ie-section-title">Direktori Portofolio</h2>
        <div class="ie-dir-list">
          <button type="button" class="ie-dir-row" data-nav="about">
            <span class="ie-dir-name">About Me</span>
            <span class="ie-dir-desc">Biografi, pendidikan ITS Cum Laude &amp; Shibaura Tokyo, serta kepemimpinan</span>
            <span class="ie-dir-arrow">→</span>
          </button>
          <button type="button" class="ie-dir-row" data-nav="experience">
            <span class="ie-dir-name">Experience</span>
            <span class="ie-dir-desc">DJED Komdigi, Bangkit Academy, BPS Jatim, dan Departemen Matematika ITS</span>
            <span class="ie-dir-arrow">→</span>
          </button>
          <button type="button" class="ie-dir-row" data-nav="skills">
            <span class="ie-dir-name">Skills &amp; Stack</span>
            <span class="ie-dir-desc">Fine-Tuning LLM, Graph-RAG, Medallion DuckDB, PyTorch, dan Matematika Terapan</span>
            <span class="ie-dir-arrow">→</span>
          </button>
          <button type="button" class="ie-dir-row" data-nav="agent:linkedin">
            <span class="ie-dir-name">LinkedIn - Rizky Alviando</span>
            <span class="ie-dir-desc">Profil profesional lengkap beserta lisensi sertifikasi dan tautan resmi</span>
            <span class="ie-dir-arrow">→</span>
          </button>
          <button type="button" class="ie-dir-row" data-nav="agent:github">
            <span class="ie-dir-name">GitHub - @RizkyAl01</span>
            <span class="ie-dir-desc">Daftar repositori publik, struktur berkas, dan README teknis</span>
            <span class="ie-dir-arrow">→</span>
          </button>
          <button type="button" class="ie-dir-row" data-open-app="room3d">
            <span class="ie-dir-name">3D Room Portfolio</span>
            <span class="ie-dir-desc">Ruang kerja isometrik 3D interaktif dengan dossier dan papan catur</span>
            <span class="ie-dir-arrow">→</span>
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
          <h1 class="ie-article-title" style="margin-bottom:4px">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</h1>
          <p class="ie-article-subtitle" style="margin-bottom:6px">${escapeHtml(PROFILE?.role || 'AI Engineer')} · ${escapeHtml(PROFILE?.location || 'Indonesia')}</p>
          <div class="ie-meta-strip">${escapeHtml(PROFILE?.university || 'ITS Surabaya')} · ${escapeHtml(PROFILE?.gpa || 'Cum Laude')}</div>
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
          ? `<section class="ie-section">
              <h2 class="ie-section-title">Pendidikan</h2>
              <div class="ie-ledger">
                ${education
                  .map(
                    (ed) => `
                    <div class="ie-ledger-row">
                      <div class="ie-ledger-left">
                        <div class="ie-ledger-period">${escapeHtml(ed.period)}</div>
                        <div class="ie-ledger-loc">${escapeHtml(ed.location || '')}</div>
                      </div>
                      <div class="ie-ledger-right">
                        <h3 class="ie-ledger-role">${escapeHtml(ed.institution)}</h3>
                        <div class="ie-ledger-org">${escapeHtml(ed.degree)} · ${escapeHtml(ed.score)}</div>
                        <p class="ie-body-text">${escapeHtml(ed.details)}</p>
                      </div>
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
          ? `<section class="ie-section">
              <h2 class="ie-section-title">Organisasi &amp; Kepemimpinan</h2>
              <div class="ie-ledger">
                ${organizations
                  .map(
                    (org) => `
                    <div class="ie-ledger-row">
                      <div class="ie-ledger-left">
                        <div class="ie-ledger-period">${escapeHtml(org.period)}</div>
                      </div>
                      <div class="ie-ledger-right">
                        <h3 class="ie-ledger-role">${escapeHtml(org.role)}</h3>
                        <div class="ie-ledger-org">${escapeHtml(org.org)}</div>
                        <p class="ie-body-text">${escapeHtml(org.summary)}</p>
                      </div>
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
              <div class="ie-meta-strip"><strong>Minat di luar riset &amp; kode:</strong> ${escapeHtml(interests.join(' · '))}</div>
            </section>`
          : ''
      }

      <div class="ie-cta-box">
        <div>
          <h3>Dokumen Resmi &amp; Diskusi Langsung</h3>
          <p>Buka dokumen CV resmi (PDF), lihat slide portofolio AI &amp; ML (PDF), atau ajukan pertanyaan spesifik ke RizkyBot AI.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF)</span>
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
      <h1 class="ie-article-title">Experience</h1>
      <p class="ie-article-subtitle">Rekam jejak rekayasa AI, pelatihan korporat, statistik daerah, dan koordinasi operasional akademik.</p>

      <div class="ie-ledger">
        ${experiences
          .map((exp) => {
            const highlights = Array.isArray(exp.highlights) ? exp.highlights : [];
            const tags = Array.isArray(exp.tags) ? exp.tags : [];
            const certObj = exp.certFile ? findCertByFileOrId(exp.certFile) : null;
            return `
              <article class="ie-ledger-row">
                <div class="ie-ledger-left">
                  <div class="ie-ledger-period">${escapeHtml(exp.period || '')}</div>
                  ${exp.location ? `<div class="ie-ledger-loc">${escapeHtml(exp.location)}</div>` : ''}
                  ${exp.type ? `<div class="ie-ledger-type">${escapeHtml(exp.type)}</div>` : ''}
                </div>
                <div class="ie-ledger-right">
                  <h2 class="ie-ledger-role">${escapeHtml(exp.role || '')}</h2>
                  <div class="ie-ledger-org">${escapeHtml(exp.org || '')}</div>
                  ${exp.summary ? `<p class="ie-body-text">${escapeHtml(exp.summary)}</p>` : ''}
                  ${
                    highlights.length
                      ? `<ul class="ie-bullet-list">
                          ${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
                        </ul>`
                      : ''
                  }
                  <div class="ie-ledger-foot">
                    ${tags.length ? `<div class="ie-ed-tech">${escapeHtml(tags.join(' · '))}</div>` : ''}
                    ${
                      exp.certFile && isLocalPdfPath(exp.certFile)
                        ? `<button type="button" class="ie-text-link" data-nav="agent:pdf:${escapeHtml(certObj ? certObj.id : exp.certFile)}">
                            Lihat Sertifikat (PDF) →
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
          <h3>Dokumen CV &amp; Diskusi Karier</h3>
          <p>Baca dokumen CV resmi atau slide Portofolio AI &amp; ML, atau tanyakan detail proyek Komdigi langsung ke RizkyBot AI.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF)</span>
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
    <div class="ie-article ie-editorial">
      <h1 class="ie-article-title">Projects &amp; Case Studies</h1>
      <p class="ie-article-subtitle">Arsip studi kasus arsitektur LLM, Graph-RAG, evaluasi keamanan AI, pipeline data, dan riset terapan (${projects.length} karya).</p>

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

      <div class="ie-editorial-list">
        ${
          filtered.length
            ? filtered.map(({ proj, originalIdx }) => renderEditorialProjectItem(proj, originalIdx)).join('')
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
          ? `<div class="ie-meta-strip ie-case-metrics-line">
              ${metrics.map((m) => `<span><strong>${escapeHtml(m.label)}:</strong> ${escapeHtml(m.value)}</span>`).join(' · ')}
            </div>`
          : ''
      }

      ${
        techStack.length
          ? `<div class="ie-ed-tech" style="margin-bottom:18px">
              <strong>Stack:</strong> ${escapeHtml(techStack.join(' · '))}
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
              <div class="ie-tech-label">Tautan &amp; Lampiran</div>
              <div class="ie-ext-links-row">
                ${links
                  .map((lnk) => {
                    const internalTarget = mapExternalUrlToInternalNav(lnk.href, lnk.label || project.title);
                    const isPdf = isLocalPdfPath(lnk.href) || internalTarget.startsWith('agent:pdf:');
                    const extHref = safeHref(lnk.href);
                    return `
                      <button type="button" class="ie-ext-link ${isPdf ? 'ie-ext-pdf' : ''}" data-nav="${escapeHtml(internalTarget)}">
                        <span class="ie-btn-ico">${getIconSVG(isPdf ? 'pdf' : 'ie', 14)}</span>
                        <span>${escapeHtml(lnk.label || 'Buka Lampiran')}</span>
                      </button>
                      ${
                        !isPdf && extHref !== '#'
                          ? renderExtIconBtn(extHref, `Buka ${lnk.label || 'tautan'} di tab baru`)
                          : ''
                      }
                    `;
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
    <div class="ie-article ie-editorial">
      <h1 class="ie-article-title">Skills &amp; Technical Specification</h1>
      <p class="ie-article-subtitle">Ringkasan kemampuan teknis AI Engineering, rekayasa data, matematika terapan, dan kepemimpinan proyek.</p>

      <div class="ie-spec-sheet">
        ${skillGroups
          .map((group) => {
            const items = Array.isArray(group.items) ? group.items : [];
            return `
              <section class="ie-spec-group">
                <h2 class="ie-spec-heading">${escapeHtml(group.category || 'Skills')}</h2>
                <div class="ie-spec-table">
                  ${items
                    .map(
                      (item) => `
                      <div class="ie-spec-row">
                        <div class="ie-spec-key">${escapeHtml(item.name || '')}</div>
                        <div class="ie-spec-val">${escapeHtml(item.detail || '')}</div>
                      </div>
                    `
                    )
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
          <p>Seluruh sertifikat PASAS CISDE, BNSP Ilmuwan Data Madya, Komdigi, Bangkit Academy, Coursera, dan TOEP dapat dilihat langsung di PDF Viewer.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:pdf:pasas-cisde">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Lihat Sertifikat (PDF)</span>
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
      <h1 class="ie-article-title">Contact</h1>
      <p class="ie-article-subtitle">Terbuka untuk diskusi peran AI Engineer / Data Specialist, kolaborasi proyek LLM &amp; RAG, maupun pelatihan data korporat.</p>

      <div class="ie-spec-sheet">
        <section class="ie-spec-group">
          <h2 class="ie-spec-heading">Kanal Resmi</h2>
          <div class="ie-spec-table">
            <div class="ie-spec-row">
              <div class="ie-spec-key">Website</div>
              <div class="ie-spec-val">
                <code>${escapeHtml(PROFILE?.website || CANONICAL_ORIGIN)}</code>
              </div>
            </div>
            ${
              email
                ? `<div class="ie-spec-row">
                    <div class="ie-spec-key">Email</div>
                    <div class="ie-spec-val"><a class="ie-text-link" href="${escapeHtml(safeHref(`mailto:${email}`))}">${escapeHtml(email)}</a></div>
                  </div>`
                : ''
            }
            ${
              phone
                ? `<div class="ie-spec-row">
                    <div class="ie-spec-key">Telepon / WhatsApp</div>
                    <div class="ie-spec-val">${escapeHtml(phone)} · ${escapeHtml(PROFILE?.location || 'Jakarta & Surabaya')}</div>
                  </div>`
                : ''
            }
            <div class="ie-spec-row">
              <div class="ie-spec-key">LinkedIn</div>
              <div class="ie-spec-val ie-spec-links">
                <button type="button" class="ie-text-link" data-nav="agent:linkedin">Lihat Profil LinkedIn →</button>
                ${renderExtIconBtn(OFFICIAL_TARGETS.linkedin.url, 'Buka LinkedIn di tab baru')}
              </div>
            </div>
            <div class="ie-spec-row">
              <div class="ie-spec-key">GitHub</div>
              <div class="ie-spec-val ie-spec-links">
                <button type="button" class="ie-text-link" data-nav="agent:github">Lihat Repositori @RizkyAl01 →</button>
                ${renderExtIconBtn(OFFICIAL_TARGETS.github.url, 'Buka GitHub di tab baru')}
              </div>
            </div>
            <div class="ie-spec-row">
              <div class="ie-spec-key">Portofolio Visual</div>
              <div class="ie-spec-val ie-spec-links">
                <button type="button" class="ie-text-link" data-nav="agent:canva">Lihat Slide Portofolio (PDF) →</button>
                ${renderExtIconBtn(OFFICIAL_TARGETS.canva.url, 'Buka Canva asli di tab baru')}
              </div>
            </div>
          </div>
        </section>

        ${
          bots.length
            ? `<section class="ie-spec-group">
                <h2 class="ie-spec-heading">Bot Telegram Publik</h2>
                <div class="ie-spec-table">
                  ${bots
                    .map(
                      (b) => `
                      <div class="ie-spec-row">
                        <div class="ie-spec-key"><code>${escapeHtml(b.name)}</code></div>
                        <div class="ie-spec-val ie-spec-links">
                          <span>${escapeHtml(b.desc)}</span>
                          ${renderExtIconBtn(b.href, `Buka ${b.name} di Telegram (tab baru)`)}
                        </div>
                      </div>
                    `
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }
      </div>

      <div class="ie-cta-box">
        <div>
          <h3>Respon Instan atau Tinggalkan Pesan</h3>
          <p>Gunakan RizkyBot Messenger untuk tanya jawab real-time, atau tulis catatan singkat di Guest book.txt.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-open-app="messenger">
            Buka RizkyBot Messenger
          </button>
          <button type="button" class="ie-action-btn" data-open-app="guestbook">
            Buka Guest book.txt
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
 * RIZKYSEARCH 95 & EXTERNAL PROFILE / DOCUMENT VIEWS
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
        externalUrl: t.url,
        snippet: t.desc,
        score: sc + 5
      });
    }
  }

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
          badge: 'GitHub Repo',
          breadcrumb: `https://github.com › RizkyAl01 › ${repo.name}`,
          title: `${repo.full_name || `RizkyAl01/${repo.name}`} - ${repo.language}`,
          nav,
          externalUrl: `https://github.com/RizkyAl01/${repo.name}`,
          snippet: repo.description,
          techText: repo.topics?.slice(0, 4).join(' · ') || '',
          score: sc + 3
        });
      }
    }
  }

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
        : `${CANONICAL_ORIGIN} › search`;
      webItems.push({
        category: 'web',
        badge: w.source || w.domain || 'Web',
        breadcrumb: crumb,
        title: w.title || rawUrl || 'Hasil Web',
        nav,
        externalUrl: safeHref(rawUrl) !== '#' ? rawUrl : '',
        snippet: snippetText,
        score: Number(w.score || 4)
      });
    }
  }

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
        badge: p.category || 'Case Study',
        breadcrumb: `${CANONICAL_ORIGIN} › projects › ${p.slug}`,
        title: `${p.title} (${p.date || '2026'})`,
        nav: `project:${p.slug}`,
        snippet: p.summary || p.subtitle || '',
        techText: (p.techStack || []).slice(0, 5).join(' · '),
        score: sc
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

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
        badge: e.type || 'Experience',
        breadcrumb: `${CANONICAL_ORIGIN} › experience › ${e.id}`,
        title: `${e.role} - ${e.org} (${e.period})`,
        nav: 'experience',
        snippet: e.summary || (e.highlights && e.highlights[0]) || '',
        techText: (e.tags || []).slice(0, 4).join(' · '),
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
        badge: 'Education',
        breadcrumb: `${CANONICAL_ORIGIN} › about`,
        title: `${ed.institution} - ${ed.degree} (${ed.score})`,
        nav: 'about',
        snippet: ed.details || '',
        score: sc
      });
    }
  }

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
        badge: c.category || 'PDF',
        breadcrumb: `${CANONICAL_ORIGIN} › certs › ${c.id}`,
        title: `${c.title} - ${c.issuer} (${c.year})`,
        nav: `agent:pdf:${c.id}`,
        externalUrl: safeHref(c.verifyUrl) !== '#' ? c.verifyUrl : '',
        snippet: `Dokumen PDF resmi (${c.size || 'PDF'}) · Kredensial: ${c.credentialId || c.id}.`,
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
    { id: 'projects', label: 'Projects', count: counts?.projects?.length },
    { id: 'experience', label: 'Experience', count: counts?.experience?.length },
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
            placeholder="Cari proyek, pengalaman Komdigi, LinkedIn, GitHub, atau sertifikat Rizky..."
            aria-label="RizkySearch 95 Input"
          >
          <button type="submit" class="win95-btn primary ie-search-submit">Search</button>
        </div>
        <div class="ie-agent-chips">
          <span class="ie-agent-chips-label">Pintasan:</span>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="agent:linkedin">LinkedIn</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="agent:github">GitHub @RizkyAl01</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="search:pengalaman ai engineer komdigi">Pengalaman Komdigi</button>
          <button type="button" class="win95-btn win95-btn-sm ie-agent-chip" data-nav="search:prestasi tokyo gpbl shibaura">GPBL Tokyo</button>
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
    <div class="ie-article ie-editorial ie-search-portal">
      <h1 class="ie-article-title">RizkySearch 95</h1>
      <p class="ie-article-subtitle">
        Mesin pencari khusus portofolio <strong>Rizky Alviando</strong> untuk menelusuri profil LinkedIn, repositori GitHub, 13 studi kasus AI, dan 15 dokumen PDF resmi.
      </p>

      ${renderSearchBoxHeader('', 'all', null)}

      <section class="ie-section">
        <h2 class="ie-section-title">Profil &amp; Dokumen Resmi</h2>
        <div class="ie-dir-list">
          ${targets
            .map((t) => {
              const navTarget = t.id === 'coursera' ? 'agent:pdf:coursera-tf' : `agent:${t.id}`;
              return `
                <div class="ie-dir-row ie-dir-row-static">
                  <div class="ie-dir-main">
                    <button type="button" class="ie-hit-title-btn" data-nav="${escapeHtml(navTarget)}">${escapeHtml(t.title)}</button>
                    <div class="ie-dir-desc">${escapeHtml(t.desc)}</div>
                  </div>
                  <div class="ie-dir-actions">
                    <button type="button" class="ie-text-link" data-nav="${escapeHtml(navTarget)}">Buka →</button>
                    ${renderExtIconBtn(t.url, `Buka ${t.badge} di tab baru`)}
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </section>
    </div>
  `;
}

function formatAgentStepsHtml(steps) {
  if (!Array.isArray(steps) || !steps.length) return '';
  return steps
    .map((s, idx) => {
      if (typeof s === 'string') {
        return `<div class="ie-trace-line"><span class="ie-trace-num">[0${idx + 1}]</span> ${escapeHtml(s)}</div>`;
      }
      const num = typeof s.step === 'number' ? `0${s.step}` : `0${idx + 1}`;
      const label =
        s.action || (typeof s.step === 'string' ? s.step : '') || s.title || s.stage || `STEP_${idx + 1}`;
      const detail = s.detail || s.text || s.message || '';
      return `<div class="ie-trace-line"><span class="ie-trace-num">[${escapeHtml(num)} · ${escapeHtml(label)}]</span> ${escapeHtml(detail)}</div>`;
    })
    .join('');
}

function renderBlockedAgentHtml(query, reason) {
  const defaultReason =
    'Akses Dibatasi oleh RizkyOS 95 Security Zone: Mesin pencari ini dikhususkan hanya untuk penelusuran informasi, proyek, dokumen, dan profil resmi terkait Rizky Alviando.';
  return `
    <section class="ie-security-panel win95-raised">
      <div class="ie-security-head">
        <span class="ie-security-ico">${getIconSVG('warning', 28)}</span>
        <div>
          <h2 class="ie-security-title">Permintaan di Luar Ruang Lingkup Portofolio Rizky Alviando</h2>
        </div>
      </div>
      <p class="ie-security-reason">${escapeHtml(reason || defaultReason)}</p>
      <div class="ie-security-meta">
        Input yang dibatasi: <code>${escapeHtml(query)}</code>
      </div>
      <div class="ie-security-actions">
        <button type="button" class="ie-action-btn ie-action-primary" data-nav="agent:linkedin">
          LinkedIn - Rizky Alviando
        </button>
        <button type="button" class="ie-action-btn" data-nav="agent:github">
          GitHub - @RizkyAl01
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
        Menampilkan <strong>${items.length}</strong> hasil untuk <strong>"${escapeHtml(query)}"</strong>
      </div>

      ${
        aiSummary && activeTab === 'all'
          ? `<section class="ie-agent-overview">
              <div class="ie-meta-strip" style="margin-bottom:6px"><strong>Ringkasan AI · RizkySearch 95</strong></div>
              <p class="ie-agent-overview-text">${escapeHtml(aiSummary)}</p>
              <div class="ie-agent-overview-foot">
                <button type="button" class="ie-text-link" data-nav="agent:linkedin">LinkedIn - Rizky Alviando →</button>
                <span>·</span>
                <button type="button" class="ie-text-link" data-nav="agent:github">GitHub - @RizkyAl01 →</button>
                <span>·</span>
                <button type="button" class="ie-text-link" data-nav="agent:pdf:cv-rizky-alviando">Buka CV (PDF) →</button>
                <span>·</span>
                <button
                  type="button"
                  class="ie-text-link"
                  data-open-app="messenger"
                  data-prefill="${escapeHtml(`Jelaskan lebih detail tentang "${query}" terkait Rizky Alviando.`)}"
                >
                  Diskusikan di RizkyBot Messenger →
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
                      <span>${escapeHtml(hit.breadcrumb || CANONICAL_ORIGIN)}</span>
                      ${hit.badge ? `<span>· ${escapeHtml(hit.badge)}</span>` : ''}
                    </div>
                    <h3 class="ie-search-hit-title">
                      <button type="button" class="ie-hit-title-btn" data-nav="${escapeHtml(hit.nav)}">
                        ${escapeHtml(hit.title)}
                      </button>
                    </h3>
                    <p class="ie-search-hit-snippet">${escapeHtml(hit.snippet || '')}</p>
                    <div class="ie-hit-foot">
                      ${hit.techText ? `<span class="ie-ed-tech">${escapeHtml(hit.techText)}</span>` : ''}
                      ${
                        hit.externalUrl && safeHref(hit.externalUrl) !== '#'
                          ? renderExtIconBtn(hit.externalUrl, `Buka ${hit.title || 'halaman'} di tab baru`)
                          : ''
                      }
                    </div>
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
              <div class="ie-search-web-list">
                ${cvChunks
                  .map((ch) => {
                    const title = typeof ch === 'string' ? 'Kutipan CV Rizky Alviando' : ch.heading || ch.title || 'Kutipan CV';
                    const body = typeof ch === 'string' ? ch : ch.content || ch.text || ch.snippet || '';
                    return `
                      <article class="ie-search-hit-card">
                        <div class="ie-search-hit-url">${CANONICAL_ORIGIN} › cv › ${escapeHtml(title)}</div>
                        <h3 class="ie-search-hit-title">
                          <button type="button" class="ie-hit-title-btn" data-nav="agent:pdf:cv-rizky-alviando">
                            ${escapeHtml(title)} - Buka CV Resmi (PDF)
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
            <strong>LinkedIn - Rizky Alviando</strong>
            <code>${escapeHtml(target.url)}</code>
          </div>
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
            <div class="ie-dossier-loc">${escapeHtml(PROFILE?.location || 'Jakarta & Surabaya, Indonesia')} · 500+ koneksi</div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar">
          ${renderExtIconBtn(target.url, 'Buka LinkedIn di tab baru', 'ie-action-primary')}
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:cv-rizky-alviando">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka CV (PDF)</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="agent:pdf:portfolio-deck">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Buka Portofolio (PDF)</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="messenger" data-prefill="Ceritakan ringkasan profil LinkedIn dan pengalaman kerja utama Rizky Alviando.">
            <span class="ie-btn-ico">${getIconSVG('messenger', 15)}</span>
            <span>Tanya RizkyBot</span>
          </button>
        </div>

        <section class="ie-dossier-section">
          <h3>Tentang (About)</h3>
          <div class="ie-prose">
            ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Proyek Unggulan</h3>
          <div class="ie-editorial-list">
            ${featuredProjs.map((p, i) => renderEditorialProjectItem(p, i)).join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Pengalaman (${exps.length} Posisi)</h3>
          <div class="ie-ledger">
            ${exps
              .map((e) => {
                const certObj = e.certFile ? findCertByFileOrId(e.certFile) : null;
                return `
                  <div class="ie-ledger-row">
                    <div class="ie-ledger-left">
                      <div class="ie-ledger-period">${escapeHtml(e.period)}</div>
                      <div class="ie-ledger-loc">${escapeHtml(e.location || '')}</div>
                    </div>
                    <div class="ie-ledger-right">
                      <h4 class="ie-ledger-role">${escapeHtml(e.role)}</h4>
                      <div class="ie-ledger-org">${escapeHtml(e.org)}</div>
                      <p class="ie-body-text">${escapeHtml(e.summary || '')}</p>
                      ${
                        certObj
                          ? `<button type="button" class="ie-text-link" data-nav="agent:pdf:${escapeHtml(certObj.id)}">Lihat Sertifikat (PDF) →</button>`
                          : ''
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Pendidikan</h3>
          <div class="ie-ledger">
            ${edus
              .map(
                (ed) => `
                <div class="ie-ledger-row">
                  <div class="ie-ledger-left">
                    <div class="ie-ledger-period">${escapeHtml(ed.period)}</div>
                  </div>
                  <div class="ie-ledger-right">
                    <h4 class="ie-ledger-role">${escapeHtml(ed.institution)}</h4>
                    <div class="ie-ledger-org">${escapeHtml(ed.degree)} · ${escapeHtml(ed.score)}</div>
                    <p class="ie-body-text">${escapeHtml(ed.details || '')}</p>
                  </div>
                </div>
              `
              )
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>Lisensi &amp; Sertifikasi (${certs.length} Dokumen)</h3>
          <div class="ie-dir-list">
            ${certs
              .map(
                (c) => `
                <div class="ie-dir-row ie-dir-row-static">
                  <div class="ie-dir-main">
                    <button type="button" class="ie-hit-title-btn" data-nav="agent:pdf:${escapeHtml(c.id)}">${escapeHtml(c.title)}</button>
                    <div class="ie-dir-desc">${escapeHtml(c.issuer)} (${escapeHtml(c.year)})${c.credentialId ? ` · ${escapeHtml(c.credentialId)}` : ''}</div>
                  </div>
                  <div class="ie-dir-actions">
                    <button type="button" class="ie-text-link" data-nav="agent:pdf:${escapeHtml(c.id)}">Lihat PDF →</button>
                    ${
                      safeHref(c.verifyUrl) !== '#'
                        ? renderExtIconBtn(c.verifyUrl, `Verifikasi kredensial ${c.title} di tab baru`)
                        : ''
                    }
                  </div>
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
            <strong>GitHub - @${escapeHtml(login)}</strong>
            <code>${escapeHtml(target.url)}</code>
          </div>
        </div>

        <div class="ie-dossier-header">
          <div class="ie-avatar-frame">
            ${renderPortrait('ie-avatar-img', 84)}
          </div>
          <div class="ie-dossier-head-copy">
            <h2 class="ie-dossier-name">${escapeHtml(displayName)} (<code>@${escapeHtml(login)}</code>)</h2>
            <p class="ie-dossier-headline">${escapeHtml(bio)}</p>
            <div class="ie-meta-strip">
              Repositories: ${escapeHtml(publicReposCount)} · Followers: ${escapeHtml(followersCount)} · Jakarta &amp; Surabaya, Indonesia
            </div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar">
          ${renderExtIconBtn(target.url, 'Buka GitHub di tab baru', 'ie-action-primary')}
          <button type="button" class="ie-action-btn" data-nav="agent:linkedin">
            LinkedIn - Rizky Alviando
          </button>
          <button type="button" class="ie-action-btn" data-nav="projects">
            Semua Case Studies →
          </button>
        </div>

        <section class="ie-dossier-section">
          <h3>Public Repositories (${rawRepos.length})</h3>
          <div class="ie-dir-list">
            ${rawRepos
              .map((repo) => {
                const repoName = repo.name || 'web-chatbot';
                const navTarget = `agent:github-repo:${repoName}`;
                const repoUrl = safeHref(repo.html_url) !== '#'
                  ? repo.html_url
                  : `https://github.com/RizkyAl01/${repoName}`;
                return `
                  <div class="ie-dir-row ie-dir-row-static">
                    <div class="ie-dir-main">
                      <button type="button" class="ie-hit-title-btn" data-nav="${escapeHtml(navTarget)}">
                        ${escapeHtml(repo.full_name || `RizkyAl01/${repoName}`)}
                      </button>
                      <div class="ie-dir-desc">${escapeHtml(repo.description || 'Repositori kode & eksperimen rekayasa AI Rizky Alviando.')}</div>
                      ${repo.language ? `<div class="ie-ed-tech">${escapeHtml(repo.language)}</div>` : ''}
                    </div>
                    <div class="ie-dir-actions">
                      <button type="button" class="ie-text-link" data-nav="${escapeHtml(navTarget)}">README →</button>
                      ${renderExtIconBtn(repoUrl, `Buka repo ${repoName} di tab baru`)}
                    </div>
                  </div>
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
  const repoExternalUrl =
    safeHref(remoteRepo.html_url || probe.url) !== '#'
      ? remoteRepo.html_url || probe.url
      : `https://github.com/RizkyAl01/${encodeURIComponent(cleanName)}`;
  const topics =
    Array.isArray(remoteRepo.topics) && remoteRepo.topics.length
      ? remoteRepo.topics
      : fallback.topics || ['ai-engineering', 'python'];
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
            <button type="button" class="ie-text-link" data-nav="agent:github">← @RizkyAl01 Repositories</button>
            <code>https://github.com/RizkyAl01/${escapeHtml(cleanName)}</code>
          </div>
        </div>

        <div class="ie-dossier-header">
          <div class="ie-dossier-head-copy">
            <div class="ie-meta-strip">Public Repository · ${escapeHtml(lang)} · ★ ${escapeHtml(stars)}</div>
            <h2 class="ie-dossier-name">${escapeHtml(title)}</h2>
            <p class="ie-dossier-headline">${escapeHtml(desc)}</p>
            <div class="ie-ed-tech" style="margin-top:6px">${escapeHtml(topics.join(' · '))}</div>
          </div>
        </div>

        <div class="ie-dossier-cta-bar">
          ${renderExtIconBtn(repoExternalUrl, `Buka repo ${cleanName} di GitHub (tab baru)`, 'ie-action-primary')}
          <button type="button" class="ie-action-btn" data-nav="project:${escapeHtml(relatedSlug)}">
            Baca Case Study →
          </button>
          <button
            type="button"
            class="ie-action-btn"
            data-open-app="messenger"
            data-prefill="${escapeHtml(`Jelaskan arsitektur kode dan implementasi pada repositori GitHub ${title}.`)}"
          >
            <span class="ie-btn-ico">${getIconSVG('messenger', 14)}</span>
            <span>Tanya RizkyBot</span>
          </button>
        </div>

        <section class="ie-dossier-section">
          <h3>Struktur Berkas</h3>
          <div class="ie-spec-table">
            ${files
              .map(
                (f) => `
                <div class="ie-spec-row">
                  <div class="ie-spec-key"><code>${escapeHtml(f.name || f.path || '')}</code></div>
                  <div class="ie-spec-val">${escapeHtml(f.info || (f.size ? `${f.size} bytes` : f.type || 'file'))}</div>
                </div>
              `
              )
              .join('')}
          </div>
        </section>

        <section class="ie-dossier-section">
          <h3>README.md</h3>
          <pre class="ie-readme-pre win95-sunken">${escapeHtml(readmeText)}</pre>
        </section>
      </div>
    </div>
  `;
}

function renderPdfViewerPage(certKey, extraCanvaLink = false) {
  const certs = Array.isArray(CERTIFICATES) ? CERTIFICATES : [];
  let cert = findCertByFileOrId(certKey);
  if (!cert && isLocalPdfPath(certKey)) {
    cert = {
      id: 'custom-pdf',
      title: certKey.split('/').pop() || 'Document.pdf',
      issuer: 'Rizky Alviando',
      year: '2026',
      credentialId: '',
      file: certKey
    };
  }
  if (!cert && certs.length) cert = certs[0];

  const encodedSrc = safeAssetUrl(cert?.file || 'assets/certs/Rizky_Alviando_CV_ID.pdf');
  const safeVerify = safeHref(cert?.verifyUrl);
  const showCanvaBtn = extraCanvaLink || cert?.id === 'portfolio-deck';

  return `
    <div class="ie-article ie-pdf-page">
      <div class="ie-breadcrumb">
        <button type="button" class="ie-text-link" data-nav="search">← RizkySearch 95</button>
        <span class="ie-crumb-cat">PDF Viewer</span>
      </div>

      <div class="ie-dossier-card">
        <div class="ie-dossier-header" style="padding-bottom:10px">
          <div class="ie-dossier-head-copy">
            <div class="ie-meta-strip">${escapeHtml(cert?.issuer || 'Rizky Alviando')} · ${escapeHtml(cert?.date || cert?.year || '2026')}${cert?.credentialId ? ` · ID: ${escapeHtml(cert.credentialId)}` : ''}</div>
            <h2 class="ie-dossier-name">${escapeHtml(cert?.title || 'Dokumen PDF')}</h2>
          </div>
        </div>

        <div class="ie-dossier-cta-bar" style="align-items:center">
          <label class="ie-pdf-switch-label">
            <span>Dokumen:</span>
            <select class="win95-field ie-pdf-select" aria-label="Pilih Dokumen PDF">
              ${certs
                .map(
                  (c) =>
                    `<option value="${escapeHtml(c.id)}" ${c.id === cert?.id ? 'selected' : ''}>${escapeHtml(c.title)} (${escapeHtml(c.year)})</option>`
                )
                .join('')}
            </select>
          </label>
          <a class="ie-ext-icon-btn ie-action-primary" href="${escapeHtml(encodedSrc)}" target="_blank" rel="noopener noreferrer" title="Buka PDF di tab baru" aria-label="Buka PDF di tab baru">${getIconSVG('external-link', 14)}</a>
          <a class="ie-action-btn" href="${escapeHtml(encodedSrc)}" download>
            Download PDF
          </a>
          ${
            safeVerify !== '#'
              ? renderExtIconBtn(safeVerify, 'Verifikasi kredensial di tab baru')
              : ''
          }
          ${
            showCanvaBtn
              ? renderExtIconBtn(OFFICIAL_TARGETS.canva.url, 'Buka Canva asli di tab baru')
              : ''
          }
          <button
            type="button"
            class="ie-action-btn"
            data-open-pdf="${escapeHtml(cert?.file || '')}"
            data-cert-id="${escapeHtml(cert?.id || '')}"
            data-pdf-title="${escapeHtml(cert?.title || '')}"
          >
            Buka di Acrobat Reader 95
          </button>
        </div>

        <div class="ie-pdf-frame-wrap win95-sunken">
          <iframe
            class="ie-pdf-frame"
            src="${escapeHtml(encodedSrc)}"
            title="${escapeHtml(cert?.title || 'PDF Preview')}"
          ></iframe>
        </div>
      </div>
    </div>
  `;
}

function renderWebReaderHtml(targetId, agentData, customWebPayload = null) {
  if (targetId === 'canva') {
    return renderPdfViewerPage('portfolio-deck', true);
  }
  const target = OFFICIAL_TARGETS[targetId] || {
    id: targetId,
    title: customWebPayload?.title || 'Web Reader',
    url: customWebPayload?.url || `${CANONICAL_ORIGIN}/search`,
    badge: 'Web Result',
    desc: customWebPayload?.snippet || agentData?.ai_summary || PROFILE?.summary || ''
  };
  const safeExternal = safeHref(target.url);
  const bots = Array.isArray(PROFILE?.telegramBots) ? PROFILE.telegramBots : [];

  return `
    <div class="ie-agent-dossier">
      <div class="ie-dossier-card">
        <div class="ie-li-banner">
          <div class="ie-li-banner-top">
            <strong>${escapeHtml(target.badge)}</strong>
            <code>${escapeHtml(target.url)}</code>
          </div>
        </div>

        <h2 class="ie-dossier-name" style="margin-top:12px">${escapeHtml(target.title)}</h2>
        <p class="ie-body-text">${escapeHtml(agentData?.ai_summary || target.desc)}</p>

        ${
          targetId === 'telegram' && bots.length
            ? `<section class="ie-dossier-section">
                <h3>Bot Telegram Rizky Alviando</h3>
                <div class="ie-spec-table">
                  ${bots
                    .map(
                      (b) => `
                      <div class="ie-spec-row">
                        <div class="ie-spec-key"><code>${escapeHtml(b.name)}</code></div>
                        <div class="ie-spec-val ie-spec-links">
                          <span>${escapeHtml(b.desc)}</span>
                          ${renderExtIconBtn(b.href, `Buka ${b.name} di Telegram (tab baru)`)}
                        </div>
                      </div>
                    `
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }

        <div class="ie-dossier-cta-bar" style="margin-top:14px">
          ${
            safeExternal !== '#'
              ? renderExtIconBtn(safeExternal, `Kunjungi ${target.title || 'situs asli'} di tab baru`, 'ie-action-primary')
              : ''
          }
          <button type="button" class="ie-action-btn" data-nav="search">
            ← Kembali ke Pencarian
          </button>
          <button type="button" class="ie-action-btn" data-nav="projects">
            Semua Proyek →
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
        Halaman <code>${escapeHtml(rawRoute)}</code> tidak ditemukan di <strong>${CANONICAL_HOST}</strong>.
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
  title: 'Rizky Alviando - Microsoft Internet Explorer',
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
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="search">RizkySearch 95...</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="open-cv">Buka CV (PDF)...</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-action="open-portfolio">Buka Portofolio (PDF)...</button>
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
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="home">Home</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="search">RizkySearch 95</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="agent:linkedin">LinkedIn - Rizky Alviando</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="agent:github">GitHub - @RizkyAl01</button>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="agent:pdf:cv-rizky-alviando">CV Rizky (PDF)</button>
              <div class="win95-menu-sep"></div>
              <button type="button" class="win95-menu-item ie-menu-item" data-nav="about">About Me</button>
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
            <button type="button" class="win95-toolbar-btn ie-nav-btn" data-nav="search" title="RizkySearch 95">
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
          <input type="text" class="win95-field ie-url-input" value="${CANONICAL_ORIGIN}/" placeholder="Ketik URL ${CANONICAL_HOST}, linkedin, github, atau kata kunci pencarian..." aria-label="Address or Search Query">
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
            <button type="button" class="ie-link-tab" data-nav="search">Search</button>
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

      winApi?.setTitle?.(`${title} - Microsoft Internet Explorer`);
      winApi?.setStatus?.(`Done - ${url}`);
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
        viewportEl.innerHTML = renderPdfViewerPage('portfolio-deck', true);
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
            { step: 1, action: 'Route Check', detail: `Memuat ${displayQuery}...` },
            { step: 2, action: 'Live Sync', detail: 'Menyinkronkan data terbaru dari server...' }
          ]
        : [
            { step: 1, action: 'Scope Check', detail: `Memeriksa kueri "${queryOrTarget}"...` },
            { step: 2, action: 'Search Index', detail: 'Memindai 13 proyek, 9 pengalaman, 15 dokumen PDF, LinkedIn, dan GitHub...' }
          ];

      const initialBodyHtml = isRepoMode
        ? renderGitHubRepoDossierHtml(repoName, null)
        : isTargetMode
        ? targetId === 'linkedin'
          ? renderLinkedInDossierHtml(null)
          : targetId === 'github'
          ? renderGitHubDossierHtml(null)
          : renderWebReaderHtml(targetId, null)
        : renderSerpBodyHtml(queryOrTarget, serpBuckets, serpTab, null);

      viewportEl.innerHTML = `
        <div class="ie-article ie-editorial ie-agent-page">
          <div class="ie-breadcrumb">
            <button type="button" class="ie-text-link" data-nav="search">← RizkySearch 95</button>
            <span class="ie-crumb-cat">${CANONICAL_HOST}</span>
          </div>

          <div class="ie-serp-header-host">
            ${renderSearchBoxHeader(displayQuery, serpTab, serpBuckets)}
          </div>

          <div class="ie-info-strip" aria-live="polite">
            <span class="ie-info-strip-ico">${getIconSVG('info', 14)}</span>
            <span class="ie-info-strip-text">Memuat hasil untuk "${escapeHtml(displayQuery)}"...</span>
            <details class="ie-trace-details">
              <summary>Detail proses</summary>
              <div class="ie-trace-list">${formatAgentStepsHtml(initialSteps)}</div>
            </details>
          </div>

          <div class="ie-agent-result-body">${initialBodyHtml}</div>
        </div>
      `;
      viewportEl.scrollTop = 0;

      setThrobberLoading(true);
      winApi?.setStatus?.(`Memuat "${displayQuery}"...`);

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

        const stripTextEl = viewportEl.querySelector('.ie-info-strip-text');
        const stripEl = viewportEl.querySelector('.ie-info-strip');
        const traceListEl = viewportEl.querySelector('.ie-trace-list');
        const bodyEl = viewportEl.querySelector('.ie-agent-result-body');
        const headerHost = viewportEl.querySelector('.ie-serp-header-host');
        if (!stripTextEl || !bodyEl) return;

        if (traceListEl && data && Array.isArray(data.agent_steps) && data.agent_steps.length) {
          traceListEl.innerHTML = formatAgentStepsHtml(data.agent_steps);
        }

        if (data && (data.allowed === false || data.intent === 'blocked')) {
          stripEl?.classList.add('is-blocked');
          stripTextEl.textContent = 'RizkyOS 95 Security Zone: Permintaan di luar ruang lingkup portofolio Rizky Alviando.';
          if (headerHost) {
            headerHost.innerHTML = renderSearchBoxHeader(displayQuery, serpTab, null);
          }
          bodyEl.innerHTML = renderBlockedAgentHtml(displayQuery, data.reason);
          winApi?.setStatus?.('RizkyOS 95 Security Zone: Akses dibatasi.');
          return;
        }

        stripEl?.classList.remove('is-blocked');
        stripTextEl.textContent = `Terverifikasi · ${CANONICAL_HOST}`;

        if (isRepoMode || data?.target_id === 'github_repo') {
          bodyEl.innerHTML = renderGitHubRepoDossierHtml(repoName || data?.live_probe?.repo_name || 'web-chatbot', data);
        } else if (isTargetMode) {
          if (targetId === 'linkedin') {
            bodyEl.innerHTML = renderLinkedInDossierHtml(data);
          } else if (targetId === 'github') {
            bodyEl.innerHTML = renderGitHubDossierHtml(data);
          } else {
            bodyEl.innerHTML = renderWebReaderHtml(targetId, data);
          }
        } else {
          serpBuckets = buildSerpItems(queryOrTarget, data);
          lastSerpState = { query: queryOrTarget, buckets: serpBuckets, agentData: data };
          if (headerHost) {
            headerHost.innerHTML = renderSearchBoxHeader(queryOrTarget, serpTab, serpBuckets);
          }
          bodyEl.innerHTML = renderSerpBodyHtml(queryOrTarget, serpBuckets, serpTab, data);
        }

        winApi?.setStatus?.(`Done - ${pageToUrl(historyStack[historyIndex] || 'search')}`);
      } catch {
        if (reqId !== activeAgentReqId) return;
        const stripTextEl = viewportEl.querySelector('.ie-info-strip-text');
        if (stripTextEl) {
          stripTextEl.textContent = `Menampilkan indeks lokal · ${CANONICAL_HOST}`;
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
        viewportEl.innerHTML = renderPdfViewerPage(certKey, false);
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
          payload = { title: 'Web Result', url: `${CANONICAL_ORIGIN}/search` };
        }
        viewportEl.innerHTML = `<div class="ie-article ie-editorial">${renderWebReaderHtml('web', null, payload)}</div>`;
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
              'Microsoft Internet Explorer 4.0 - RizkyOS 95\n\nMenampilkan profil, studi kasus AI, sertifikat PDF, serta RizkySearch 95 untuk rizkyalviando.ai.id.',
            buttons: ['OK']
          });
        }
        return;
      }

      if (openMenuName) closeMenus();
    });

    viewportEl.addEventListener('change', (e) => {
      const pdfSelect = e.target.closest('.ie-pdf-select');
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
