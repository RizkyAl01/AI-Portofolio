import {
  PROFILE,
  EXPERIENCES,
  PROJECTS,
  SKILLS,
  CERTIFICATES
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

function normalizePageId(input) {
  let raw = String(input ?? 'home').trim();
  if (!raw) return 'home';

  raw = raw.replace(/^https?:\/\/(www\.)?rizky\.os\/?/i, '');
  raw = raw.replace(/^rizky\.os\/?/i, '');
  raw = raw.replace(/^\/+|\/+$/g, '');

  if (!raw || raw.toLowerCase() === 'index.html' || raw.toLowerCase() === 'home') {
    return 'home';
  }
  const lower = raw.toLowerCase();
  if (['about', 'experience', 'projects', 'skills', 'contact'].includes(lower)) {
    return lower;
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

  return lower;
}

function pageToUrl(pageId) {
  if (pageId === 'home') return 'https://rizky.os/';
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
  if (pageId.startsWith('project:')) {
    const slug = pageId.slice('project:'.length);
    const proj = (PROJECTS || []).find((p) => p.slug === slug || p.id === slug);
    if (proj) return `${proj.title} — Case Study`;
  }
  return 'Page Not Found';
}

function renderPortrait(className = 'ie-avatar-img', size = 88) {
  const name = PROFILE?.name || 'Rizky Alviando';
  if (PROFILE?.photo) {
    return `
      <img
        class="${className}"
        src="${escapeHtml(PROFILE.photo)}"
        alt="${escapeHtml(name)}"
        width="${size}"
        height="${size}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >
      <span class="ie-avatar-fallback" style="display:none">${getIconSVG('ai', Math.min(44, size))}</span>
    `;
  }
  return `<span class="ie-avatar-fallback">${getIconSVG('ai', Math.min(44, size))}</span>`;
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
          <button type="button" class="ie-action-btn" data-open-app="notepad" data-doc="cv">
            <span class="ie-btn-ico">${getIconSVG('wordpad', 15)}</span>
            <span>Buka CV</span>
          </button>
          <button type="button" class="ie-action-btn" data-open-app="explorer" data-path="C:\\Rizky\\Certificates">
            <span class="ie-btn-ico">${getIconSVG('pdf', 15)}</span>
            <span>Sertifikat (${certCount})</span>
          </button>
          <button type="button" class="ie-action-btn" data-nav="projects">
            <span>Semua Case Studies (${projects.length}) →</span>
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
        <div class="ie-kicker">DESKTOP DIRECTORY</div>
        <h2 class="ie-section-title">Jelajahi Bagian Lain di RizkyOS 95</h2>
        <div class="ie-quick-grid">
          <button type="button" class="ie-quick-tile" data-nav="experience">
            <span class="ie-quick-ico">${getIconSVG('documents', 18)}</span>
            <div>
              <strong>Experience Timeline</strong>
              <span>DJED Komdigi, Bangkit Academy, BPS Jatim, dan ITS</span>
            </div>
          </button>
          <button type="button" class="ie-quick-tile" data-nav="skills">
            <span class="ie-quick-ico">${getIconSVG('ai', 18)}</span>
            <div>
              <strong>Skills &amp; Competencies</strong>
              <span>LLM Fine-Tuning, Graph-RAG, Python, DuckDB, dan Matematika Terapan</span>
            </div>
          </button>
          <button type="button" class="ie-quick-tile" data-open-app="terminal">
            <span class="ie-quick-ico">${getIconSVG('dos', 18)}</span>
            <div>
              <strong>MS-DOS Prompt</strong>
              <span>Jalankan neofetch, telusuri C:\Rizky, atau tanya AI dari CLI</span>
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

  return `
    <div class="ie-article ie-editorial">
      <div class="ie-kicker">PROFILE &amp; BACKGROUND</div>
      <h1 class="ie-article-title">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</h1>
      <p class="ie-article-subtitle">${escapeHtml(PROFILE?.role || 'AI Engineer')} · ${escapeHtml(PROFILE?.location || 'Indonesia')}</p>

      <div class="ie-author-strip">
        <div class="ie-author-avatar">${renderPortrait('ie-avatar-sm', 44)}</div>
        <div>
          <div class="ie-author-name">${escapeHtml(PROFILE?.fullName || PROFILE?.name || 'Rizky Alviando')}</div>
          <div class="ie-author-meta">${escapeHtml(PROFILE?.university || 'ITS Surabaya')} · ${escapeHtml(PROFILE?.gpa || 'Cum Laude')}</div>
        </div>
      </div>

      ${
        PROFILE?.photo
          ? `<figure class="ie-figure">
              <img class="ie-figure-img" src="${escapeHtml(PROFILE.photo)}" alt="${escapeHtml(PROFILE.photoCaption || PROFILE.name || 'Rizky Alviando')}" onerror="this.closest('figure').style.display='none';">
              ${PROFILE.photoCaption ? `<figcaption class="ie-figcaption">${escapeHtml(PROFILE.photoCaption)}</figcaption>` : ''}
            </figure>`
          : ''
      }

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
          <p>Buka versi CV siap cetak di WordPad, lihat slide portofolio PDF, atau ajukan pertanyaan spesifik ke RizkyBot AI.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-open-app="notepad" data-doc="cv">
            Buka CV di WordPad
          </button>
          ${
            PROFILE?.portfolioPdf
              ? `<button type="button" class="ie-action-btn" data-open-pdf="${escapeHtml(PROFILE.portfolioPdf)}" data-pdf-title="Slide Deck Portofolio AI & ML — Rizky Alviando">
                  Lihat Slide Portofolio (PDF)
                </button>`
              : ''
          }
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
                        ? `<button type="button" class="ie-inline-pdf-btn" data-open-pdf="${escapeHtml(exp.certFile)}" data-pdf-title="${escapeHtml(exp.role)} — ${escapeHtml(exp.org)}">
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
          <h3>Ingin versi ringkas CV atau detail pengalaman tertentu?</h3>
          <p>Buka WordPad CV untuk tampilan siap cetak atau tanyakan detail proyek Komdigi langsung ke RizkyBot AI.</p>
        </div>
        <div class="ie-cta-buttons">
          <button type="button" class="ie-action-btn ie-action-primary" data-open-app="notepad" data-doc="cv">
            Buka Printable CV
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
              <div class="ie-tech-label">Tautan &amp; Lampiran</div>
              <div class="ie-ext-links-row">
                ${links
                  .map((lnk) => {
                    if (isLocalPdfPath(lnk.href)) {
                      return `<button type="button" class="ie-ext-link ie-ext-pdf" data-open-pdf="${escapeHtml(lnk.href)}" data-pdf-title="${escapeHtml(lnk.label || project.title)}">
                        <span class="ie-btn-ico">${getIconSVG('pdf', 14)}</span>
                        <span>${escapeHtml(lnk.label || 'Buka Lampiran PDF')}</span>
                      </button>`;
                    }
                    const href = safeHref(lnk.href);
                    if (href === '#') return '';
                    return `<a class="ie-ext-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lnk.label || href)} ↗</a>`;
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
          <p>Seluruh sertifikat PASAS CISDE, BNSP Ilmuwan Data Madya, Komdigi, Bangkit Academy, Coursera, dan TOEP dapat diperiksa langsung melalui PDF Viewer.</p>
        </div>
        <button type="button" class="ie-action-btn ie-action-primary" data-open-app="explorer" data-path="C:\\Rizky\\Certificates">
          <span class="ie-btn-ico">${getIconSVG('folder-open', 15)}</span>
          <span>Buka Folder Certificates</span>
        </button>
      </div>
    </div>
  `;
}

function renderContactPage() {
  const email = PROFILE?.email || '';
  const phone = PROFILE?.phone || '';
  const linkedin = safeHref(PROFILE?.linkedin);
  const github = safeHref(PROFILE?.github);
  const instagram = safeHref(PROFILE?.instagram);
  const canva = safeHref(PROFILE?.canvaPortfolio);
  const bots = Array.isArray(PROFILE?.telegramBots) ? PROFILE.telegramBots : [];

  return `
    <div class="ie-article ie-editorial">
      <div class="ie-kicker">CONTACT &amp; COLLABORATION</div>
      <h1 class="ie-article-title">Contact</h1>
      <p class="ie-article-subtitle">Terbuka untuk diskusi peran AI Engineer / Data Specialist, kolaborasi proyek LLM &amp; RAG, maupun pelatihan data korporat.</p>

      <div class="ie-contact-grid">
        ${
          email
            ? `<a class="ie-contact-card" href="${escapeHtml(safeHref(`mailto:${email}`))}">
                <div class="ie-contact-label">Email</div>
                <div class="ie-contact-value">${escapeHtml(email)}</div>
                <div class="ie-contact-hint">Kirim email langsung →</div>
              </a>`
            : ''
        }
        ${
          linkedin !== '#'
            ? `<a class="ie-contact-card" href="${escapeHtml(linkedin)}" target="_blank" rel="noopener noreferrer">
                <div class="ie-contact-label">LinkedIn</div>
                <div class="ie-contact-value">${escapeHtml(PROFILE?.name || 'Rizky Alviando')}</div>
                <div class="ie-contact-hint">Buka profil LinkedIn ↗</div>
              </a>`
            : ''
        }
        ${
          github !== '#'
            ? `<a class="ie-contact-card" href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer">
                <div class="ie-contact-label">GitHub</div>
                <div class="ie-contact-value">RizkyAl01</div>
                <div class="ie-contact-hint">Lihat repositori kode ↗</div>
              </a>`
            : ''
        }
        ${
          canva !== '#'
            ? `<a class="ie-contact-card" href="${escapeHtml(canva)}" target="_blank" rel="noopener noreferrer">
                <div class="ie-contact-label">Visual Portfolio</div>
                <div class="ie-contact-value">Canva AI &amp; ML Deck</div>
                <div class="ie-contact-hint">Buka presentasi portofolio ↗</div>
              </a>`
            : ''
        }
        ${
          instagram !== '#'
            ? `<a class="ie-contact-card" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer">
                <div class="ie-contact-label">Instagram</div>
                <div class="ie-contact-value">${escapeHtml(PROFILE?.handle || 'rizky.alviando')}</div>
                <div class="ie-contact-hint">Buka Instagram ↗</div>
              </a>`
            : ''
        }
        ${
          phone
            ? `<div class="ie-contact-card ie-contact-static">
                <div class="ie-contact-label">Telepon / WhatsApp · Lokasi</div>
                <div class="ie-contact-value">${escapeHtml(phone)}</div>
                <div class="ie-contact-hint">${escapeHtml(PROFILE?.location || 'Jakarta & Surabaya, Indonesia')}</div>
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
                  .map((b) => {
                    const href = safeHref(b.href);
                    return `
                      <div class="ie-bot-row">
                        <div>
                          <strong>${escapeHtml(b.name)}</strong>
                          <span class="ie-bot-desc"> — ${escapeHtml(b.desc)}</span>
                        </div>
                        ${
                          href !== '#'
                            ? `<a class="ie-text-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Buka ↗</a>`
                            : ''
                        }
                      </div>
                    `;
                  })
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
          <button type="button" class="ie-action-btn" data-open-app="notepad" data-doc="cv">
            Buka Printable CV
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
      <p class="ie-body-text">
        Gunakan alamat seperti <code>https://rizky.os/</code>, <code>https://rizky.os/projects</code>, <code>https://rizky.os/experience</code>, atau kembali ke halaman utama.
      </p>
      <div class="ie-hero-actions">
        <button type="button" class="ie-action-btn ie-action-primary" data-nav="home">Kembali ke Home</button>
        <button type="button" class="ie-action-btn" data-nav="projects">Lihat Semua Proyek</button>
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
    let openMenuName = null;
    let throbberTimer = null;

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
              <button type="button" class="win95-menu-item ie-menu-item" data-action="open-cv">Open CV in WordPad</button>
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
          <input type="text" class="win95-field ie-url-input" value="https://rizky.os/" aria-label="Address URL">
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

    function pulseThrobber() {
      throbberEl.classList.add('is-loading');
      if (throbberTimer) clearTimeout(throbberTimer);
      throbberTimer = setTimeout(() => {
        throbberEl.classList.remove('is-loading');
      }, 420);
    }

    function updateChrome(pageId) {
      const url = pageToUrl(pageId);
      const title = pageToTitle(pageId);
      urlInput.value = url;
      backBtn.disabled = historyIndex <= 0;
      fwdBtn.disabled = historyIndex >= historyStack.length - 1;

      const activeTab = pageId.startsWith('project:') ? 'projects' : pageId;
      rootEl.querySelectorAll('.ie-link-tab').forEach((tab) => {
        tab.classList.toggle('is-active', tab.dataset.nav === activeTab);
      });

      winApi?.setTitle?.(`${title} — Microsoft Internet Explorer`);
      winApi?.setStatus?.(`Done — ${url}`);
    }

    function renderPage(pageId) {
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
      updateChrome(pageId);
      pulseThrobber();
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

      const pdfBtn = e.target.closest('[data-open-pdf]');
      if (pdfBtn) {
        sound.playOpen();
        closeMenus();
        winApi?.os?.openApp?.('pdf-viewer', {
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
        else if (act === 'open-cv') winApi?.os?.openApp?.('notepad', { doc: 'cv' });
        else if (act === 'print') window.print();
        else if (act === 'close') winApi?.close?.();
        else if (act === 'about-ie') {
          winApi?.os?.showDialog?.({
            title: 'About Microsoft Internet Explorer',
            icon: 'ie',
            message:
              'Microsoft Internet Explorer 4.0 — RizkyOS 95 Edition\n\nPembaca portofolio bergaya editorial di dalam antarmuka klasik Windows 95 untuk menelusuri profil, pengalaman, dan studi kasus AI Rizky Alviando.',
            buttons: ['OK']
          });
        }
        return;
      }

      if (openMenuName) closeMenus();
    });

    viewportEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.ie-project-card[data-nav]');
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
      navigate(urlInput.value, true);
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
      if (newArgs && newArgs.page) {
        navigate(newArgs.page, true);
      }
    });

    winApi?.onClose?.(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeydown);
      if (throbberTimer) clearTimeout(throbberTimer);
    });

    navigate(args?.page || 'home', true);
  }
};
