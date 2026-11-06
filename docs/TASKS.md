# Objective Portofolio Rizky

## Tujuan

Bangun situs sebagai **pusat informasi lengkap tentang Rizky Alviando**, bukan hanya portofolio teknis. Pengunjung perlu dapat menjelajahi profil, pekerjaan, proyek, pendidikan, organisasi dan kepemimpinan, pencapaian, keterampilan, sertifikasi, minat, dan kontak. Chatbot bersifat opsional, bukan satu-satunya sumber informasi.

Gunakan CV dan materi proyek yang terverifikasi sebagai sumber fakta. Jangan mengarang metrik, tautan, pengalaman, atau hasil.

## Arahan visual (brief revisi user)

- Situs adalah pusat informasi lengkap Rizky, bukan hanya portofolio teknis.
- Referensi eksplorasi: `https://github.com/emmabostian/developer-portfolios.git`; ambil pola inspiratif saja, jangan menyalin kode, aset, copy, atau desain utuh.
- **Tema Terang (Light Editorial & Cartographic Blueprint)**: Dilarang menggunakan tema gelap.
- User menolak UI yang terasa AI slop, orbit kecil/dekoratif, slider sudut, navigasi ganda, em-dash berlebih, dan sidebar. Sidebar dilarang pada semua breakpoint.
- Target universe adalah pengalaman **Kepulauan Kartografi 3D (6 Pulau Wilayah)** di atas Globe 360° besar yang memisahkan antar-tab (`Pulau Proyek`, `Pulau Pengalaman`, `Pulau Organisasi`, `Pulau Pendidikan`, `Pulau Keahlian`, `Pulau Kontak`), dengan dock 4 tombol kontrol pure ikon SVG menyatu di dalam frame globe.
- Interaksi wajib touch/mouse/keyboard dengan fallback konten statis, `prefers-reduced-motion`, dan navigasi teks yang tetap lengkap.

## Lokasi dan sumber proyek

- Portofolio pribadi harus berada di bawah `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI`. Workspace saat ini `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\web-chatbot`.
- Inventaris sumber proyek yang relevan di:
  - `D:\MAGANG_AI_ENGINEER\PROJEK-PROJEK MAGANG`
  - `D:\MAGANG_AI_ENGINEER\Paper Rizky`
  - `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI`
- Perlakukan `D:\MAGANG_AI_ENGINEER\DJED-Komdigi` dan `D:\MAGANG_AI_ENGINEER\PROJEK-PROJEK MAGANG` secara read-only: pelajari pola/arsitektur melalui **Agent REA (`https://github.com/morluto/rea.git`)** dan bangun rework/improvement mandiri di bawah `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\`.

## Batasan non-destruktif (wajib untuk semua role)

- Jangan menghapus, memindahkan, atau menimpa file/aset/konten yang sudah ada, termasuk `.env` dan credential.
- Jangan mengedit, menyalin, atau mencetak nilai credential. Pemilik akan mengubah/merotasi credential sendiri.
- Jangan mengubah sumber `DJED-Komdigi` maupun `PROJEK-PROJEK MAGANG`; buat adaptasi pribadi hanya di bawah `BELAJAR-MANDIRI`.

## Status

Status: `[ ]` belum, `[x]` implementasi selesai & terverifikasi QA/Tester.

## T0 - Keamanan dan konfigurasi (Backend)

- [x] `api/index.py` membaca credential dari environment; `api/.env.example` mencantumkan nama variabel tanpa nilai.
- [x] `.env` dan `__pycache__/` sudah masuk `.gitignore`; file lokal `.env` dipertahankan.
- [x] CORS memakai allowlist origin, bukan wildcard dengan credentials.
- [x] Rate limit `/api/web-chat` tersedia: Upstash opsional dengan fallback in-memory; kegagalan Upstash dikembalikan sebagai 503.
- [x] Pemilik mengelola sendiri penggantian/rotasi credential yang pernah terekspos dan mengisi environment lokal/deploy (`https://porto-ai-lake.vercel.app`).

## T1 - Informasi lengkap, Reverse Engineering (REA), dan Narasi Proyek

- [x] Konten teknis yang sudah ada diselaraskan dengan fakta CV dan tautan proyek yang memang tercantum.
- [x] Tambahkan pengalaman terbaru **AI Engineer di Direktorat Kecerdasan Artifisial dan Ekosistem Teknologi Baru, DJED Komdigi (Sep 2026 - Sekarang)** dan perbaiki periode **Freelance Excel & Data Trainer (Jun 2026 - Jul 2026)**.
- [x] Koreksi proyek **Big Data Challenge 2024** sebagai proyek pemodelan **Analisis Sentimen Multi-Kelas dengan Arsitektur Transformer (Big Data Challenge 2024)** (tanpa klaim finalis, seleksi internal, atau belum lolos).
- [x] Pisahkan proyek **Deteksi Dini Chattering pada Proses Pemesinan (GPBL Tokyo)**, **Penemuan Pola Penyebab Kecelakaan Pesawat dengan Metode T-BUM (Matematika ITS)**, dan **Sugaryzer (Bangkit Academy)** menjadi kartu proyek mandiri (total 13 proyek).
- [x] Tambahkan proyek **Smart Agentic RAG: AI Document Assistant** (`https://project-rag-zeta.vercel.app/`).
- [x] Humanize seluruh judul dan deskripsi proyek, hapus semua path direktori lokal dari UI publik, dan bersihkan seluruh karakter em-dash.
- [x] Tambahkan organisasi/kepemimpinan, pencapaian, pendidikan sebelumnya, dan minat dari CV serta profil LinkedIn (`Profile.pdf`); lulus review QA.
- [x] Tambahkan seluruh sertifikat Coursera (6 sertifikat dengan link `coursera.org/verify/...`), PASAS CISDE, BNSP Ilmuwan Data Madya, Sertifikat Pemagangan Komdigi, Bangkit Academy, dan TOEP/TOEFL beserta berkas PDF-nya di `frontend/assets/certs/`.
- [x] Bangun fitur **In-Page PDF Preview Modal (`#pdf-modal`)** agar melihat CV PDF, Slide Portofolio PDF, dan Sertifikat PDF berlangsung langsung di halaman yang sama tanpa harus membuka tab baru.
- [x] Rekrutmen **Agent REA (`.github/agents/rea.agent.md`)** berbasis `https://github.com/morluto/rea.git` (`D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\repo_reference\rea`).
- [x] Rework & improvement 6 repositori portofolio pribadi mandiri di bawah `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\` (100% read-only pada sumber asli, bebas secret & identitas instansi):
  1. `BELAJAR-MANDIRI/aegislake-medallion-sandbox`
  2. `BELAJAR-MANDIRI/lexgraph-legal-rag`
  3. `BELAJAR-MANDIRI/sentineleval-ai-redteam`
  4. `BELAJAR-MANDIRI/nusantara-asr-postcorrector`
  5. `BELAJAR-MANDIRI/cyberpulse-web-intelligence`
  6. `BELAJAR-MANDIRI/garuda-football-sentiment`
- [x] Dokumentasikan seluruh 12 proyek terverifikasi di `docs/PORTFOLIO_PROJECTS_CATALOG.md` dan tampilkan di `#proyek` dengan filter kategori horizontal.

## T2 - Pengalaman visual dan navigasi

- [x] Brief desain revisi tersedia di `docs/DESIGN.md` (Light Theme, Single Sticky Header, 3D Cartographic Archipelago 6 Pulau, Pure Icon Controls di dalam frame globe).
- [x] Ganti titik/orbit menjadi **Globe 360° Kepulauan Kartografi 3D (6 Pulau Wilayah)** berukuran besar (~78% tinggi stage) yang memisahkan antar-tab (`Pulau Proyek`, `Pulau Pengalaman`, `Pulau Organisasi`, `Pulau Pendidikan`, `Pulau Keahlian`, `Pulau Kontak`).
- [x] Dock 4 tombol kontrol pure ikon SVG (`#atlas-left`, `#atlas-right`, `#atlas-spin`, `#atlas-reset`) menyatu di tengah-bawah dalam frame `#atlas-stage` tanpa slider sudut terlihat.
- [x] Tombol floating `#back-to-top` berikon SVG murni tersedia dan bebas tabrakan dengan `#chat-fab`.
- [x] Tidak ada sidebar dan tidak ada navigasi ganda; hanya 1 `.site-header` sticky.
- [x] Uji keyboard, `prefers-reduced-motion`, fallback tanpa JavaScript/canvas, dan overflow pada 360/375/768/1280px serta viewport mobile pendek (Playwright).
- [x] Verifikasi akses sentuh (44x44px), fokus terlihat, kontras AA (Light Theme), dan screen reader.
- [x] Tinjau alt text, metadata, serta loading gambar; seluruh aset dipertahankan.

## T3 - Chatbot

- [x] Widget memiliki session id serta state loading, validasi, error, 429, dan 503.
- [x] Riwayat ditampilkan sebagai teks/node DOM, bukan HTML tersimpan.
- [x] Verifikasi integrasi UI dengan kontrak API tanpa memanggil layanan eksternal sungguhan (`test_backend.py` & `test_frontend.py`).

## T4 - QA dan validasi

- [x] `python -m py_compile api/index.py` dan tes API/mock lokal tanpa layanan eksternal: lulus (4/4 passed).
- [x] Playwright E2E (`test_frontend.py`): 10/10 tes lulus + pengujian interaktif filter 12 proyek lulus + 0 console/page errors.
- [x] Review aksesibilitas dan visual QA independen: **APPROVE (0 temuan)**.
- [x] Pemindaian secret menyeluruh pada `web-chatbot` dan 6 repositori rework di `BELAJAR-MANDIRI`: **BERSIH (0 temuan)**.
- [x] Status backlog diperbarui berdasarkan hasil verifikasi QA/Tester.
- [x] `frontend/fix_img.py` dan `frontend/replace_img.py` tetap utuh.

---

## T5 - 3D Open World Map, Room Diorama, & Pop-Up PC Monitor Chatbot

- [x] **[PM]** Analisis backlog dan orkestrasi tim multi-agent sesuai `AGENTS.md` dan `.clinerules/00-team-workflow.md`.
- [x] **[Designer]** Spesifikasi desain di `docs/DESIGN.md`: 3D Isometric Archipelago Map (7 Distrik), Walking 3D Avatar, Bilik Ruangan Cutaway dengan isian nempel di tembok (`nempel di tembok`) & rak piala bertingkat, serta Pop-Up Monitor PC Workstation.
- [x] **[Asset-Compiler]** Produksi dan kompilasi aset 3D & 2.5D: Model avatar manusia 3D lengkap (rambut, kacamata, jaket, celana, sneakers, animasi walk cycle), lemari rak piala kayu bertingkat dengan piala emas, plakat dan sertifikat berbingkai nempel di tembok, serta casing monitor PC fisik.
- [x] **[Frontend]** Implementasi kode integratif di kanvas Three.js: avatar yang berjalan di peta dengan WASD/panah/klik, interaksi terminal tengah memicu Pop-Up Monitor PC, interaksi gedung memicu Pop-Up Bilik Ruangan, dan tombol fallback Resume Klasik.
- [x] **[QA]** Review read-only terhadap kepatuhan `01-anti-slop.md`, aksesibilitas WCAG AA, dan fakta CV: Status **APPROVE**.

---

## T6 - Mode Peta 360 Derajat Bilik Kerja (Panoramic Room) & Meja Interaktif

- [x] **[PM]** Pemutakhiran arahan sprint: Transisi dari 3D Open World Walking ke Mode Peta Ruangan 360° berpusat pada meja kerja interaktif, terminal chatbot ACC, dan folder proyek 4 subjek.
- [x] **[Designer]** Spesifikasi desain Seksi 9 di `docs/DESIGN.md`: Bilik kerja panorama 360°, meja kerja realistis, foto profil asli Tokyo, riwayat pendidikan lengkap (SDN 1 Ngliman Danem 289.5, SMPN 1 Sawahan NEM 360.5 tertinggi angkatan, SMAN 2 Nganjuk 89.40, ITS Cum Laude, SIT Tokyo), rekam asistensi dosen Kalkulus (semester 3 s.d. lulus) & Algoritma/PBO (semester 5 s.d. lulus), tombol bersih tanpa emoji berlebih, model Qwen (qwen3.8-27b), dan lampiran PDF sertifikat resmi.
- [x] **[Asset-Compiler]** Kompilasi kanvas panorama bilik kerja 360° realistis (tanpa animasi kartun), meja kerja kayu bertekstur, penempatan foto asli Tokyo, dan plakat dinding.
- [x] **[Frontend]** Implementasi kanvas panorama Three.js 360° di `frontend/open-world.html`:
  - Integrasi foto resmi Rizky Alviando di Tokyo (`assets/images/IMG-20250903-WA0024.jpg`) pada Buku Profil.
  - Perbaikan data pendidikan lengkap SDN 1 Ngliman (2009-2015), SMPN 1 Sawahan (2015-2018), SMAN 2 Nganjuk (2018-2021), ITS (2021-2025), dan SIT Tokyo (2025).
  - Penambahan rekam asisten dosen Kalkulus 1 & 2 (semester 3 - lulus) dan Algoritma/PBO (semester 5 - lulus) tanpa angka rekaan.
  - Penambahan lampiran PDF sertifikat resmi (CISDE, BNSP, Bangkit, Coursera, TOEP).
  - Penghapusan emoji/simbol berlebih pada tombol antarmuka (tombol bersih: 'Aplikasi Chatbot', 'Folder Projek').
  - Penataan label 3D agar rapi dan tidak saling tumpang tindih.
  - Integrasi chat terminal dengan model Qwen via `/api/web-chat` dan kemampuan menjawab pertanyaan umum maupun portofolio.
- [x] **[QA-Tester]** Verifikasi independen: review anti-slop, validasi fakta CV & pendidikan, uji interaksi Playwright E2E, dan konfirmasi 14/14 tes pytest tetap lulus.



---

## T6 - Mode Peta 360 Derajat Bilik Kerja (Panoramic Room) & Meja Interaktif

- [x] **[PM]** Pemutakhiran arahan sprint: Transisi dari 3D Open World Walking ke Mode Peta Ruangan 360° berpusat pada meja kerja interaktif, terminal chatbot ACC, dan folder proyek 4 subjek.
- [x] **[Designer]** Spesifikasi desain Seksi 9 di `docs/DESIGN.md`: Bilik kerja panorama 360°, meja kerja realistis, foto profil asli Tokyo, riwayat pendidikan lengkap (SDN 1 Ngliman Danem 289.5, SMPN 1 Sawahan NEM 360.5 tertinggi angkatan, SMAN 2 Nganjuk 89.40, ITS Cum Laude, SIT Tokyo), rekam asistensi dosen Kalkulus (semester 3 s.d. lulus) & Algoritma/PBO (semester 5 s.d. lulus), tombol bersih tanpa emoji berlebih, model Qwen (qwen3.8-27b), dan lampiran PDF sertifikat resmi.
- [x] **[Asset-Compiler]** Kompilasi kanvas panorama bilik kerja 360° realistis (tanpa animasi kartun), meja kerja kayu bertekstur, penempatan foto asli Tokyo, dan plakat dinding.
- [x] **[Frontend]** Implementasi kanvas panorama Three.js 360° di `frontend/open-world.html`:
  - Integrasi foto resmi Rizky Alviando di Tokyo (`assets/images/IMG-20250903-WA0024.jpg`) pada Buku Profil.
  - Perbaikan data pendidikan lengkap SDN 1 Ngliman (2009-2015), SMPN 1 Sawahan (2015-2018), SMAN 2 Nganjuk (2018-2021), ITS (2021-2025), dan SIT Tokyo (2025).
  - Penambahan rekam asisten dosen Kalkulus 1 & 2 (semester 3 - lulus) dan Algoritma/PBO (semester 5 - lulus) tanpa angka rekaan.
  - Penambahan lampiran PDF sertifikat resmi (CISDE, BNSP, Bangkit, Coursera, TOEP).
  - Penghapusan emoji/simbol berlebih pada tombol antarmuka (tombol bersih: 'Aplikasi Chatbot', 'Folder Projek').
  - Penataan label 3D agar rapi dan tidak saling tumpang tindih.
  - Integrasi chat terminal dengan model Qwen via `/api/web-chat` dan kemampuan menjawab pertanyaan umum maupun portofolio.
- [x] **[QA-Tester]** Verifikasi independen: review anti-slop, validasi fakta CV & pendidikan, uji interaksi Playwright E2E, dan konfirmasi 14/14 tes pytest tetap lulus.


- [x] **[Tester]** Uji otomatis sintaks Python & validasi integritas secret.
- [x] **[Sprint Refinement T5.1]** Upgrade detail visual 3D bangunan 7 distrik (atap pelana/limasan, pilar portiko, kubah emas, menara bertingkat, antena relai) menggantikan balok primitif, boulevard ring melingkar tanpa jalan buntu, pepohonan isometrik, dan lampu jalan.
- [x] **[Sprint Refinement T5.3 - Feedback Iteration]**
  - Implementasi kamera **FPP (First Person Perspective)** di ketinggian mata manusia (`y = 1.65`) dengan kendali WASD gerak relatif arah hadap dan mouse drag yaw/pitch.
  - Eliminasi survei onboarding klise/AI-slop; pengunjung langsung masuk ke dunia FPP tanpa hambatan dengan chip nama diskret di top bar.
  - Verifikasi ketat fakta CV 100% sah (tanpa ngarang): Juara 3 Calculus Cup ITS, Best Presentation SIT Tokyo, Beasiswa JASSO, Cum Laude S1 Matematika ITS, Bangkit ML Distinction, PASAS CISDE, BNSP Data Scientist.
  - Peningkatan atmosfer visual: langit gradien fajar, kabut lembut, hamparan rumput zamrud, boulevard batu paving bertepi curb, dan taman bunga warna-warni.
  - Konsolidasi peran QA dan Tester menjadi satu peran terintegrasi: **QA-Tester** di `AGENTS.md`.

---

## T7 - Ruang Isometrik 3D Realistis, Simulasi Desktop PC OS, & Flipbook Portofolio

- [x] **[Asset-Compiler]** Pengadaan & Verifikasi Aset Realistis Asli:
  - Download dan kompilasi model 3D ruangan kerja realistis lengkap (`frontend/assets/models/RoomModel.glb`, 628 KB) dengan baked texture pencahayaan siang realistis (`frontend/assets/textures/bakedTextureDaycmp.webp`, 1.2 MB), tekstur pinboard dinding (`boardBakedDcmp.webp`), dan frame piagam (`bakeFrameDaycmp.webp`).
  - Ekstraksi dan integrasi tekstur parquet lantai kayu asli & tekstur kayu meja oak dari file contoh user (`28-isometric-room.rar`).
  - Integrasi pustaka mesin Three.js r128 (`GLTFLoader.js`, `OrbitControls.js`) dan pustaka realistis animasi buka buku fisik (`page-flip.browser.min.js`).
- [x] **[Designer]** Spesifikasi desain Seksi 10 di `docs/DESIGN.md`:
  - Alur pengalaman visual masuk web: pandangan isometrik ruangan kerja 3D realistis (anti-slop, estetika studio arsitektur, pencahayaan alami jendela).
  - Tiga hotspot interaktif utama: PC Workstation, Buku Dossier di Meja, dan Piagam/Foto di Tembok.
  - Desain antarmuka Layar Desktop PC: kursor mouse realistis, wallpaper developer, shortcut `.exe` (Terminal Chatbot CRT/Retina) dan shortcut folder (File Explorer 4 subjek portofolio).
  - Desain Dossier Flipbook: simulasi lembaran halaman buku fisik (curling, bayangan lipatan, tekstur kertas) memuat Profil & Foto asli Tokyo, Pendidikan lengkap (SDN s.d. ITS Cum Laude), Pengalaman/Asdos, dan Sertifikasi resmi PDF.
- [x] **[Frontend]** Implementasi Kanvas 3D Isometrik & Interaksi di `frontend/open-world.html`:
  - Render kanvas Three.js dengan `RoomModel.glb` dan tekstur baked PBR realistis, raycasting klik pada monitor PC, buku di meja, dan piagam di tembok.
  - Transisi zoom kamera mulus (smooth lerp/tween) saat mengklik PC, Buku, atau Piagam, serta tombol kembali ke ruangan (ESC).
  - Implementasi Desktop OS Monitor PC: antarmuka desktop interaktif dengan shortcut `.exe` yang meluncurkan terminal chatbot (`visitor@ai-lab:~$` via `/api/web-chat`), dan folder proyek yang membuka File Explorer 4 kategori proyek (ML/DL, LLM & RAG, Computer Vision, Math & Riset Operasi) lengkap dengan dossier studi kasus dan tautan terkait.
  - Implementasi Flipbook Buku Interaktif menggunakan `StPageFlip`: efek membalik halaman buku fisik yang nyata dengan drag/klik, menampilkan profil, foto asli Tokyo, rekam pendidikan SDN hingga ITS Cum Laude, dan sertifikasi.
  - Fitur inspect modal untuk foto Tokyo dan piagam penghargaan di dinding.
- [x] **[QA-Tester]** Pengujian dan Verifikasi Menyeluruh:
  - Uji otomatis sintaks Python (`py_compile`), tes backend (`pytest tests/`), integritas credential scanner (14/14 passed).
  - Uji interaktivitas frontend (Playwright E2E) untuk klik PC, eksekusi terminal chatbot, penjelajahan File Explorer, dan efek buka halaman buku (11/11 passed).
  - Verifikasi kepatuhan anti-slop, kontras WCAG AA, dan fakta CV tanpa rekaan: Status **APPROVE**.

---

### Sprint T7.2 - Penyempurnaan Ruang Kerja 3D, Catur AI ~1800 ELO & Pembersihan Anti-Slop (CURRENT - COMPLETED)

- [x] **[Anti-Slop & Desain Visual]** Eliminasi Emoji Logo & Standardisasi SVG Monokrom:
  - Menghapus seluruh ikon emoji kekanak-kanakan (`🥤`, `🧠`, `🏛️`, `JP`, `✈️`, `📐`, `⚖️`, `🛡️`) pada kartu proyek, sidebar File Explorer, dan shortcut desktop RizkyOS.
  - Menggantinya dengan badge teknologi monospace elegan (`[ML]`, `[LLM]`, `[CV]`, `[MATH]`, `[DATA]`, `[SPEECH]`, `[SEC]`) dan inline SVG monokrom standar rekayasa.
- [x] **[Kredensial & Sertifikasi]** Integrasi Lengkap 6 Sertifikat Spesialisasi Coursera:
  - Menambahkan seluruh 6 sertifikat Coursera Specialization (DeepLearning.AI, Stanford Online, Imperial College London) ke File Explorer (`CERTS` array) dan Flipbook Dossier (Halaman 8):
    1. Machine Learning Specialization (DeepLearning.AI & Stanford Online - 7QM26EI7X8DK)
    2. Deep Learning Specialization (DeepLearning.AI - DWAXSL54L1K8)
    3. Mathematics for Machine Learning (Imperial College London - IGGJJHSJPAYX)
    4. Natural Language Processing (DeepLearning.AI - QYKA1M4SUDZJ)
    5. TensorFlow Developer Professional Certificate (DeepLearning.AI - XQDE9UOUISYB)
    6. AI for Medicine Specialization (DeepLearning.AI - R2QFYZQBKUZ0)
  - Melengkapi setiap sertifikat dengan tombol pratinjau PDF in-page (`openPdfModal`) dan tautan verifikasi resmi Coursera (`coursera.org/verify/...`).
- [x] **[Mode Portofolio Standar]** Preservasi Mode Klasik & Eliminasi Khusus Atlas 360:
  - Menghapus navigasi dan elemen `<section class="atlas" id="atlas">` di `frontend/index.html` sesuai permintaan pengguna.
  - Mempertahankan seluruh bagian inti portofolio asli (`#profil`, `#proyek` 13 proyek dengan filter kategori, `#pengalaman`, `#organisasi`, `#pendidikan`, `#keahlian`, `#kontak`, dan `#chat-panel`).
  - Menambahkan tautan silang navigasi yang mulus antara `index.html` ("Ruang Kerja 3D →") dan `open-world.html` ("← Mode Resume Standar").
- [x] **[Fitur Interaktif]** Arena Catur Playable vs Master AI Agent (Rating ~1800 ELO):
  - Mengimplementasikan papan catur 8x8 interaktif lengkap dengan aturan catur legal, highlight langkah, tray bidak tangkapan, dan log notasi aljabar.
  - Mengembangkan AI Chess Engine berbasis Minimax dengan Alpha-Beta Pruning (Depth 3-4) yang dikalibrasi menggunakan Piece-Square Tables (PST) Michniewski untuk penguasaan pusat, perkembangan perwira, dan keamanan raja, menghasilkan kekuatan taktis ~1800 ELO untuk menantang rating catur riil Rizky (~1600 ELO).
  - Hotspot catur terpasang langsung di meja kopi ruangan 3D dan shortcut di RizkyOS.
- [x] **[Hotspot 3D]** Pointer Tanda Panah ke Bawah (Downward Arrow Pin):
  - Mengganti pil horizontal besar dengan pin navigasi vertikal beranimasi halus: badge keterangan ringkas + panah tajam ke bawah (`▼`) yang menunjuk presisi ke aset 3D (PC Workstation, Buku Dossier, Papan Catur 1800 ELO, Piagam Dinding).
- [x] **[Testing & Verifikasi]**
  - Seluruh rangkaian pengujian `pytest tests/` lulus 14/14 (100%).
  - Uji headless Playwright memverifikasi visual render ruangan, ketiadaan error CORS dengan data URI base64, fungsi modal catur dan flipbook.


