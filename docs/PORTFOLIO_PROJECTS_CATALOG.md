# Verified Portfolio Projects Catalog: Rizky Alviando

> **Compiled by:** Agent REA (Reverse Engineer Anything)  
> **Methodology:** Evidence-Backed Deconstruction & Clean Reconstruction (`https://github.com/morluto/rea.git`)  
> **Verification Status:** 100% Source-Verified (`py_compile` & runtime self-tests passed; zero secrets/tokens or internal agency credentials included)

---

## Ringkasan Eksekutif

Dokumen ini memuat katalog lengkap proyek-proyek teknis **Rizky Alviando** yang telah diaudit secara *evidence-backed* dari kode sumber nyata di workspace (`BELAJAR-MANDIRI`, hasil rework bersih dari `DJED-Komdigi` & `PROJEK-PROJEK MAGANG`, serta riset di `Paper Rizky`). Seluruh proyek magang/pekerjaan utama telah di-rework menjadi repositori portofolio pribadi yang bersih, modular, bebas *secret*, dan siap ditampilkan oleh **Designer** dan **Frontend** pada aplikasi `web-chatbot`.

---

## Kategori A: Proyek Rework & Improvement Utama (AI Engineering, Data Governance & Systems)

### 1. AegisLake: Multi-Modal Medallion Data Lakehouse & Zero-Trust AI Sandbox
- **Path Portofolio Pribadi:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\aegislake-medallion-sandbox`
- **Asal Rekonstruksi (Read-Only Audit):** `pipeline_data`, `AI Sandbox`, `mission-ki-local`, `data_pipeline`, `extraction`
- **Peran & Kontribusi:** AI & Data Governance Engineer, merancang arsitektur Lakehouse Medallion adaptif (Bronze $\rightarrow$ Silver $\rightarrow$ Gold), mesin anonimisasi PII Indonesia (UU PDP No. 27/2022), ekstraktor PDF-ke-Markdown terstruktur, dan Zero-Trust AI Sandbox Gateway.
- **Arsitektur & Algoritma Inti (Terverifikasi):**
  - **Bronze Layer (`01_bronze_raw`)**: Ingesti multi-konektor (CKAN, HuggingFace, Kaggle, Garuda, SERP, YouTube, Audio) dengan *fingerprinting* `SHA-256` dan kompresi *streaming* (`gzip`/`zlib`).
  - **Silver Layer (`02_silver_processed`)**: Mesin `IndonesianPIIGuard` yang menggabungkan pola regex standar nasional (NIK 16 digit, No HP `+62/08`, Email, NPWP, Nomor Rekening berkonteks, Alamat RT/RW/Kelurahan) dengan **Gazetteer Nusantara NER** (Jawa, Sunda, Batak, Minang, Bugis, Bali, Arab/Barat-Indonesia), deteksi honorifik (`Bpk`, `Ibu`, `Dr`, `Prof`), *whitelist* institusi publik anti-*false-positive*, serta $k$-anonymity ($k=5$).
  - **Gold Layer (`03_gold_output`)**: Formatter korpus Continuous Pre-Training (`CPT JSONL.gz`), *semantic RAG chunks*, dan generator metadata silsilah data berstandar **W3C PROV-O Data Card**.
  - **Zero-Trust AI Sandbox Gateway**: Otentikasi 2-lapis (`verify_credentials` berbasis HMAC/SHA-256 $\rightarrow$ `require_action` RBAC/ABAC per aksi), *in-process query engine* **DuckDB** di atas Parquet S3/SeaweedFS, serta **Declarative Model Training** (menghilangkan celah keamanan RCE `pickle.loads` pada file `.pkl` mentah dan memastikan *zero raw data egress*).
- **Tech Stack:** Python, FastAPI, DuckDB, Polars/Pandas, S3/SeaweedFS (`boto3`), SQLite/PostgreSQL, PyMuPDF, Apache Airflow & Spark (DAG).

---

### 2. LexGraph: Structural Legal Graph-RAG & Hybrid Retrieval Engine
- **Path Portofolio Pribadi:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\lexgraph-legal-rag`
- **Asal Rekonstruksi (Read-Only Audit):** `Hackathon` (v1 FastAPI + pgvector) & `Hackathon-v2` (v2 Neo4j + GraphQL)
- **Peran & Kontribusi:** AI Engineer, membangun sistem konsultasi regulasi berbasis **Hybrid Search + 1-Hop Property Graph RAG** yang menjaga keutuhan hierarki pasal hukum dan memverifikasi sitasi secara ketat.
- **Arsitektur & Algoritma Inti (Terverifikasi):**
  - **Hierarchical Legal Clause Chunker**: Memecah dokumen hukum berdasarkan struktur **Pasal $\rightarrow$ Ayat $\rightarrow$ Huruf** dengan *overlap* 200 karakter tanpa melintasi batas ayat, menyisipkan *breadcrumb* konteks pasal ke dalam teks *embedding*, dan mencegah duplikasi korpus dengan `SHA-256`.
  - **Hybrid Retrieval dengan Reciprocal Rank Fusion (RRF)**: Menggabungkan pencarian *dense vector* 384-dimensi (`sentence-transformers/all-MiniLM-L6-v2` pada `pgvector`) dan *full-text lexical search* menggunakan rumus $\text{RRF}(d) = \sum \frac{1}{60 + \text{rank}(d)}$.
  - **Evidence-Verified 1-Hop Graph Expansion**: Mengekstrak dan menelusuri relasi regulasi berarah (`amends`, `repeals`, `implements`, `related_to`) yang wajib lolos gerbang verifikasi ketat (kutipan *verbatim* harus ditemukan di teks sumber, halaman terverifikasi, dan $\text{confidence} \ge 0.80$).
  - **Cross-Encoder Reranking & Zero-Evidence Guard**: Menilai ulang kandidat langsung dan kandidat tetangga graf 1-hop menggunakan **FlashRank (`ms-marco-MiniLM-L-12-v2` ONNX)** sebelum dikirim ke LLM Groq, serta menghentikan pemanggilan LLM secara otomatis bila bukti kosong.
- **Tech Stack:** Python, FastAPI, PostgreSQL (`pgvector`), Neo4j, Strawberry GraphQL, Sentence-Transformers, FlashRank ONNX, PyMuPDF4LLM, Tesseract OCR (`ind+eng`), Groq LLM.

---

### 3. SentinelEval: LLM Red-Teaming, Adversarial Attack Suite & AI Governance Registry
- **Path Portofolio Pribadi:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\sentineleval-ai-redteam`
- **Asal Rekonstruksi (Read-Only Audit):** `djed-assesment`, `moonshot-data`, `katalog-usecase`, `mockup-aies`
- **Peran & Kontribusi:** AI Safety & Governance Engineer, mengembangkan *toolkit* pengujian keamanan/ketahanan LLM (terinspirasi Project Moonshot & NIST AI RMF 1.0) beserta sistem registrasi & klasifikasi risiko *use-case* AI (TRL 1-9).
- **Arsitektur & Algoritma Inti (Terverifikasi):**
  - **5 Modul Serangan Adversarial (`AdversarialAttackSuite`)**:
    1. *Homoglyph v2 Attack*: Substitusi karakter Unicode mirip-visual (Cyrillic confusables) untuk menguji ketahanan *guardrail*.
    2. *Colloquial Nusantara & SEA WordSwap*: Substitusi kata benda/sapaan dengan istilah kolokial lokal untuk menguji *cultural & dialect robustness*.
    3. *Character Swap (`charswap`)* & *Punctuation Injection*: Perturbasi tingkat karakter dan tanda baca.
    4. *Payload Masking Attack*: Penyamaran entitas sensitif untuk menguji kebocoran konteks.
  - **Cookbook & Recipe Benchmark Runner**: Mengeksekusi kumpulan skenario uji (*recipes*) terhadap dataset etika regional (10K skema etika daerah) dan menghitung skor ketahanan (*Robustness Score*).
  - **AI Governance Risk & TRL Gate**: Mengklasifikasikan *use-case* AI ke dalam tingkat **Low Risk**, **High Risk** (wajib *Regulatory Sandbox* + *Human-in-the-Loop* + skor ketahanan $\ge 0.85$ & $\text{TRL} \ge 6$), atau **Unacceptable Risk** (ditolak otomatis).
- **Tech Stack:** Python, Next.js 14 (App Router), React 18, TypeScript, Redux Toolkit (RTK Query), Custom Glassmorphic Design System.

---

### 4. NusantaraASR: Multi-Dialect Speech Diarization & LLM Post-Correction Pipeline
- **Path Portofolio Pribadi:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\nusantara-asr-postcorrector`
- **Asal Rekonstruksi (Read-Only Audit):** `whisper-processor`, `whisperx_corrector`, `modular_service`, `youtube2transcripts`, `dataset nusantara yt`, `YT TRANSCIPT`
- **Peran & Kontribusi:** Speech & NLP Engineer, merancang *pipeline* transkripsi bahasa Indonesia & bahasa daerah (Jawa `jw`) dari audio/YouTube hingga *post-correction* berbasis sinyal *alignment* dan LLM.
- **Arsitektur & Algoritma Inti (Terverifikasi):**
  - **Batch & Chunked ASR Ingestion**: Ekstraksi audio YouTube dan pemotongan segmen otomatis untuk diproses oleh **WhisperX (`large-v3`)**, *forced alignment* `Wav2Vec2`, dan *speaker diarization* `Pyannote` maupun **Gemini 1.5 Flash**.
  - **4-Signal Word Suspicion Detector (`MultiSignalErrorDetector`)**: Menghitung skor kecurigaan kata $S(w) \in [0, 1]$ dengan bobot terkalibrasi:
    $$S(w) = 0.55(1 - \text{conf}) + 0.20\,\mathbb{I}(\text{alpha\_ratio} < 0.70) + 0.15\,\mathbb{I}(\text{ms/char} \notin [25, 350]) + 0.10\,\mathbb{I}(\text{weird\_char})$$
  - **Speaker Diarization Flicker Corrector**: Memperbaiki anomali pergantian pembicara mikro $A \rightarrow B \rightarrow A$ dengan durasi $B < 1.5\text{s}$ dan menggabungkan segmen yatim ($< 0.8\text{s}$) ke pembicara tetangga.
  - **Levenshtein-Guarded LLM Post-Correction**: Mengirim hanya segmen yang ter-flag ke LLM (Groq `llama-3.1-8b-instant` / `llama-3.3-70b`) dan menolak koreksi agresif jika rasio jarak edit karakter melebihi `MAX_EDIT_DISTANCE_RATIO = 0.35`, dilengkapi evaluator **WER & CER**.
- **Tech Stack:** Python, PyTorch, WhisperX (`large-v3`), Wav2Vec2, Pyannote Audio, Groq LLM, Google Gemini 1.5 Flash, `yt-dlp`.

---

### 5. CyberPulse: Stealth Web Intelligence Crawler & Parallel Multi-Modal Moderation Engine
- **Path Portofolio Pribadi:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\cyberpulse-web-intelligence`
- **Asal Rekonstruksi (Read-Only Audit):** `pengawasan-ruang-digital`, `pengawasan-ruang-digital-backend`, `pengawasan-ruang-digital-crawling`, `crawler_quora`, `scraping_web_ui`
- **Peran & Kontribusi:** Backend & Web Intelligence Engineer, membangun mesin *crawling* lintas mesin pencari (Google, Baidu, Quora) yang tahan proteksi anti-bot serta *backend* moderasi multi-modal paralel (Teks LLM + Gambar OCR).
- **Arsitektur & Algoritma Inti (Terverifikasi):**
  - **Stealth Multi-Engine Crawler**: Menggunakan `undetected-chromedriver` & Selenium dengan *monkeypatch* pembersihan *handle* proses Windows (`WinError 6`), simulasi pengetikan manusia, *domain whitelist/exclusion filtering*, dan ekstraksi *inner text* beserta tangkapan layar penuh & *thumbnail* dalam format `base64`.
  - **Parallel Multi-Modal Inference (`/api/v1/inference/parallel`)**: Menjalankan klasifikasi teks LLM dan ekstraksi OCR screenshot secara paralel menggunakan `asyncio.gather` + `loop.run_in_executor` dengan sesi database terisolasi per *worker thread*.
  - **Production Observability & Protection**: Dilengkapi `CorrelationIdMiddleware`, *structured JSON logging* (`structlog`), autentikasi JWT/Argon2, dan *rate limiting* (`SlowAPI`).
- **Tech Stack:** Python, FastAPI, SQLAlchemy, PostgreSQL/SQLite, Selenium, `undetected-chromedriver`, BeautifulSoup4, Structlog, SlowAPI, Pillow.

---

### 6. GarudaSentimen: Indonesian Football Public Discourse NLP & Sentiment Analytics Pipeline
- **Path Portofolio Pribadi:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\garuda-football-sentiment`
- **Asal Rekonstruksi (Read-Only Audit):** `Sentimen Analisis Sepak Bola Era STY`
- **Peran & Kontribusi:** NLP Data Scientist, membangun *pipeline* normalisasi slang media sosial dan analisis sentimen berbasis aspek terhadap opini publik sepak bola nasional.
- **Arsitektur & Algoritma Inti (Terverifikasi):**
  - **Social Media Slang Normalizer**: Pembersihan tag `<username>` berulang, normalisasi kosakata tidak baku bahasa Indonesia (*"gak"*, *"yg"*, *"drpd"*, *"blm"*), dan ekstraksi fitur TF-IDF N-Gram.
  - **Policy Aspect Tagger**: Pemetaan otomatis ke dalam aspek *Naturalization & Diaspora*, *Coaching & Tactics*, dan *Federation & Grassroots League*.
- **Tech Stack:** Python, Scikit-Learn, Pandas, Regex NLP Pipeline.

---

## Kategori B: Proyek Mandiri & Riset yang Sudah Ada di `BELAJAR-MANDIRI` & `Paper Rizky`

### 7. Smart Agentic RAG: AI Document Assistant
- **Path:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\smart_agentic_rag`
- **Live Demo:** `https://project-rag-zeta.vercel.app/`
- **Deskripsi & Arsitektur:** Aplikasi tanya-jawab dokumen PDF pintar berbasis **LangGraph** dan **FastAPI** yang secara otonom memutuskan kapan harus mengekstrak PDF (`PDFMarkdownExtractor`), mengindeks dokumen (`DocumentIndexer`), menulis ulang kueri (`query_rewriter`), mengklasifikasikan topik (`classifier`), atau mencari bukti vektor di **Supabase PostgreSQL (`pgvector`)**.
- **Tech Stack:** Python, FastAPI, LangGraph, Groq Cloud LLM (`qwen/qwen3-27b`), HuggingFace Embeddings (`all-MiniLM-L6-v2`), Supabase (`pgvector`), PyMuPDF, Vanilla JS Frontend, Vercel.

---

### 8. Interactive 360° Universe Portfolio & Grounded Personal AI Co-Pilot (`web-chatbot` / `nasya-bot` / `telegram-bot`)
- **Path:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\web-chatbot` (serta ekosistem `nasya-bot` & `telegram-bot`)
- **Deskripsi & Arsitektur:** Website portofolio interaktif berkonsep *360° Knowledge Atlas* yang terintegrasi dengan asisten AI multi-kanal (Web Widget & Telegram Webhook). Menggunakan *strict system prompt grounding* di atas data CV terverifikasi, proteksi CORS *allowlist*, dan *rate limiting* berlapis (**Upstash Redis** + *in-memory fallback*) dengan *audit log* ke Google Sheets.
- **Tech Stack:** Python, FastAPI, Groq LLM (`llama-3.1-8b-instant`), Upstash Redis, Google Sheets API (`gspread`), HTML5 Canvas/CSS3/Vanilla JS, Playwright E2E Testing, Vercel.

---

### 9. Coursera Certificate Auto-Cropper & Formatter
- **Path:** `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\coursera-cert-downloader`
- **Deskripsi & Arsitektur:** Aplikasi web berbasis **Flask** dan **NumPy/Pillow** yang mengunduh gambar sertifikat secara *streaming* dan mendeteksi batas tepi warna latar secara simetris pada 5 titik vertikal ($20\%, 40\%, 50\%, 60\%, 80\%$) menggunakan ambang batas jarak Manhattan piksel ($\sum |p_x - bg| > 30$) agar sertifikat terpotong presisi tanpa memotong elemen visual.
- **Tech Stack:** Python, Flask, NumPy, Pillow (PIL), Requests, HTML/CSS/JS.

---

### 10. High-Utility Sequential & Itemset Pattern Mining (`T-BUM` & `MISP-BU`) & Machining Chatter AI
- **Path:** `D:\MAGANG_AI_ENGINEER\Paper Rizky` (`opt_tbum.py`, `MISP-BU.ipynb`, `chatter_pipeline`)
- **Deskripsi & Arsitektur:**
  - **Riset Algoritma Data Mining (`T-BUM` / `MISP-BU`)**: Implementasi dan optimasi algoritma pencarian pola sekuensial/itemset bernilai guna tinggi (*Top-k High-Utility Pattern Mining*) dengan pemangkasan ruang kandidat (*candidate pruning*) yang diuji pada dataset skala besar (`BMS-POS`, `Chess`, `Bible`, `Ecommerce`).
  - **Machining Chatter Detection Pipeline (`chatter_pipeline`)**: *Pipeline* pelatihan model *machine learning* dan *dashboard* analitik untuk mendeteksi getaran *chatter* pada proses pemesinan berbasis sinyal sensor (`SensingData`).
- **Tech Stack:** Python, NumPy, Pandas, Scikit-Learn, Matplotlib, Jupyter Notebook.

---

## Ringkasan Pemetaan Node untuk Atlas Visual Portofolio (`web-chatbot`)

| ID Node | Nama Proyek di Portofolio (Humanized, Tanpa Path Lokal di UI Publik) | Kategori / Cluster | Highlight Teknis Jujur & Natural |
| :--- | :--- | :--- | :--- |
| `proj-aegislake` | **AegisLake: Pipeline Data Medallion & Sandbox Pelatihan AI** | Data & AI Pipeline | Mengelola alur data bertahap (Bronze, Silver, Gold) dengan penyensoran data pribadi (PII) otomatis sebelum dipakai melatih model atau dieksplorasi di dashboard. |
| `proj-lexgraph` | **LexGraph: Pencarian Regulasi & Dokumen Hukum dengan Graph-RAG** | LLM, RAG & Governance | Membantu pencarian pasal dan aturan yang saling merujuk dengan menggabungkan pencarian teks (BM25), kemiripan vektor, dan grafik relasi antar-pasal. |
| `proj-sentineleval` | **SentinelEval: Uji Keamanan & Evaluasi Risiko Model Bahasa (LLM)** | LLM, RAG & Governance | Menguji seberapa tahan model AI terhadap prompt berbahaya, kebocoran data sensitif, dan jawaban bias sebelum model dirilis ke pengguna. |
| `proj-nusantara-asr` | **NusantaraASR: Transkripsi YouTube & Koreksi Bahasa Daerah** | NLP & Speech | Mengunduh dan mentranskripsi ribuan video YouTube secara otomatis, memisahkan suara pembicara, lalu merapikan hasil transkripsi bahasa Indonesia maupun daerah. |
| `proj-cyberpulse` | **CyberPulse: Crawler Web Paralel & Pemantauan Konten** | Data & AI Pipeline | Mengumpulkan halaman web secara paralel dengan browser otomatis dan menyaring konten berisiko menggunakan aturan teks cepat serta klasifikasi AI. |
| `proj-garuda-nlp` | **GarudaSentimen: Analisis Opini Publik Sepak Bola Indonesia** | NLP & Speech | Memetakan ribuan komentar suporter sepak bola Indonesia berdasarkan topik pembicaraan (pelatih, pemain, federasi, taktik) dan nada sentimennya. |
| `proj-chatter-tokyo` | **Deteksi Dini Chattering pada Proses Pemesinan** | Riset & Pemodelan ML | Mengolah data sinyal sensor pemesinan untuk mendeteksi gejala getaran berlebih (chattering) lebih awal dengan model klasifikasi machine learning hingga akurasi 92,83% (Presentasi Terbaik GPBL Shibaura Institute of Technology, Tokyo). |
| `proj-tbum-its` | **Penemuan Pola Penyebab Kecelakaan Pesawat dengan Metode T-BUM** | Riset & Pemodelan ML | Mengembangkan metode Targeted Balanced Utility Pattern Mining (T-BUM) dengan proses pembentukan dan penggabungan kandidat pola yang lebih efisien dari segi waktu komputasi. |
| `proj-web-portfolio` | **Portofolio Web Interaktif & Asisten AI Pribadi** | LLM, RAG & Governance | Website portofolio ini sendiri, dilengkapi peta bola dunia 360° berbasis pulau navigasi dan chatbot tanya-jawab CV yang terhubung ke RAG. |
| `proj-sugaryzer` | **Sugaryzer: Aplikasi Analisis & Rekomendasi Konsumsi Gula Harian** | Riset & Pemodelan ML | Membangun aplikasi pembaca kode barcode/tabel gizi OCR dan model klasifikasi konsumsi gula harian pada proyek capstone Bangkit Academy (akurasi 89%). |
| `proj-smart-rag` | **Smart Agentic RAG: AI Document Assistant** (`https://project-rag-zeta.vercel.app/`) | LLM, RAG & Governance | Aplikasi tanya-jawab dokumen PDF pintar menggunakan LangGraph, FastAPI, Groq LLM, dan pencarian vektor Supabase (`pgvector`) yang mengekstrak isi dokumen, menyusun ulang pertanyaan, dan menjawab secara akurat. |
| `proj-komdigi-audio` | **Otomasi Transkripsi & Dataset Audio Skala Besar (Komdigi)** | Data & AI Pipeline | Merancang alur kerja otomatis di lingkungan kerja untuk mengumpulkan dan mentranskripsi puluhan ribu jam audio YouTube sebagai bahan pelatihan model bahasa (keberhasilan workflow 95%). |
| `proj-bdc-2024` | **Analisis Sentimen Multi-Kelas dengan Arsitektur Transformer (Big Data Challenge 2024)** | NLP & Speech | Mengimplementasikan arsitektur Transformer (IndoBERT dan RoBERTa) untuk klasifikasi sentimen multi-kelas pada data teks bahasa Indonesia dengan capaian F1-score 70% pada 8 kelas sentimen. |



---

## Kategori C: Katalog Sertifikasi & Lisensi Terverifikasi (`frontend/assets/certs/`)

Seluruh sertifikat di bawah ini telah diekstraksi secara *read-only* dari dokumen PDF asli dan disalin ke `D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\web-chatbot\frontend\assets\certs\` untuk ditampilkan melalui **In-Page PDF Preview Modal** (tanpa menyertakan dokumen PII sensitif seperti E-KTP, NPWP, atau Ijazah/Transkrip):

| No | Judul Sertifikat / Spesialisasi | Lembaga Penerbit | Tanggal Terbit | Credential ID / Nomor Sertifikat | URL Verifikasi Resmi | File di `frontend/assets/certs/` |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **DeepLearning.AI TensorFlow Developer Professional Certificate** (4 Courses: Intro to TF, CNNs in TF, NLP in TF, Sequences/Time Series & Prediction) | DeepLearning.AI (Coursera) | 10 Nov 2024 | `7QM26EI7X8DK` | `https://coursera.org/verify/professional-cert/7QM26EI7X8DK` | `Coursera_Certificate_7QM26EI7X8DK.pdf` |
| 2 | **TensorFlow: Advanced Techniques Specialization** (4 Courses: Custom Models/Layers/Loss, Custom & Distributed Training, Advanced Computer Vision, Generative Deep Learning) | DeepLearning.AI (Coursera) | 8 Des 2024 | `DWAXSL54L1K8` | `https://coursera.org/verify/specialization/DWAXSL54L1K8` | `Coursera_Certificate_DWAXSL54L1K8.pdf` |
| 3 | **Machine Learning Specialization** (3 Courses: Supervised ML Regression & Classification, Advanced Learning Algorithms, Unsupervised Learning/Recommenders/RL) | DeepLearning.AI & Stanford Online (Coursera) | 23 Okt 2024 | `R2QFYZQBKUZ0` | `https://coursera.org/verify/specialization/R2QFYZQBKUZ0` | `Coursera_Certificate_R2QFYZQBKUZ0.pdf` |
| 4 | **Linear Algebra for Machine Learning and Data Science** | DeepLearning.AI (Coursera) | 9 Okt 2024 | `IGGJJHSJPAYX` | `https://coursera.org/verify/IGGJJHSJPAYX` | `Coursera_Certificate_IGGJJHSJPAYX.pdf` |
| 5 | **Structuring Machine Learning Projects** | DeepLearning.AI (Coursera) | 10 Nov 2024 | `XQDE9UOUISYB` | `https://coursera.org/verify/XQDE9UOUISYB` | `Coursera_Certificate_XQDE9UOUISYB.pdf` |
| 6 | **Generative AI for Everyone** | DeepLearning.AI (Coursera) | 8 Des 2024 | `QYKA1M4SUDZJ` | `https://coursera.org/verify/QYKA1M4SUDZJ` | `Coursera_Certificate_QYKA1M4SUDZJ.pdf` |
| 7 | **Certified International Specialist in Data Engineering (Foundation) - CISDE** | PASAS Institute, Singapore | 25 Jan 2026 (Valid s.d. 30 Jan 2029) | `CISDE15620` | - (Offline / Institute Registry) | `PASAS_CISDE_Data_Engineering.pdf` (juga hal. 5 di `Bangkit Academy_merged.pdf`) |
| 8 | **Sertifikat Kompetensi: Ilmuwan Data Madya (Junior/Associate Data Scientist)** - Bidang Sains Data (9 Unit Kompetensi `J.62DMI00.*`) | BNSP (Badan Nasional Sertifikasi Profesi) - LSP BPPTIK | 29 Des 2025 (Valid 3 Tahun) | No. `63111 2511 6 0012155 2025` / Reg. `J.1389.02283.2025` | - (BNSP / LSP BPPTIK Registry) | `BNSP_Ilmuwan_Data_Madya.pdf` (juga hal. 3-4 di `Bangkit Academy_merged.pdf`) |
| 9 | **Bangkit Academy 2024 Graduate: Machine Learning Learning Path** (Full Graduate + 12 Sub-Courses Transcript) | Bangkit Academy (Google, GoTo, Traveloka - Kemendikbudristek MSIB) | 10 Jan 2025 (Periode Sep-Des 2024) | `BA24/GRAD/XXIV-01/M004B4KY3923` (ID: `M004B4KY3923`) | - (Bangkit Certificate Registry) | `Bangkit_Academy_2024.pdf` (juga hal. 1-2 di `Bangkit Academy_merged.pdf`) |
| 10 | **Sertifikat Pemagangan Lulusan Perguruan Tinggi: AI Engineer (Predikat: Sangat Baik)** | Kemnaker RI & Pusbang Talenta Digital BPSDM Komdigi | 24 Mei 2026 (Periode 24 Nov 2025 - 23 Mei 2026) | `MN.031.017197.02.2025` | QR Verification (SIAPkerja / MagangHub) | `sertifikat_dff5d104-76a7-4fe8-924b-a61df52a3010.pdf` |
| 11 | **TOEFL Certificate of Achievement: Total Score 580** (Listening: 590, Structure: 540, Reading: 610) | Global Operation (SK Diknas `421.9/6251/418.20/2023`) | 4 Okt 2025 (Valid 2 Tahun) | `GO/4/4467/10/2025` | Metadata Only (Tidak disalin ke publik untuk menjaga privasi TTL) | *(Metadata saja)* |
| 12 | **Test of English Proficiency (TOEP): Score 505** (Listening: 99, Reading: 116) | TEFLIN & PT Pusat Layanan Tes Indonesia (PLTI) | 25 Jul 2026 (Valid 2 Tahun) | `TOEP-88-201-261233-45978` | `https://plti.co.id` | `TOEP_PLTI_Certificate.pdf` |
| 13 | **Intermediate Data Science (Fresh Graduate Academy / FGA)** | Digital Talent Scholarship (DTS) 2025, BPSDM Komdigi & DQLab | 21 Jul - 10 Agu 2025 | `19510809840-739/FGA/BLSDM.Komdigi/2025` | - (DTS Komdigi Registry) | `FGA_Intermediate_Data_Science.pdf` |
| 14 | **Pengantar Machine Learning dengan Python** & **Python for Data Professional Beginner** | DQLab | 2024 | Listed on LinkedIn (`Profile.pdf`) | - | *(Tercantum di LinkedIn Profile)* |

---

## Kategori D: Fakta Tambahan Terverifikasi dari `Profile.pdf` (LinkedIn) & `Portofolio Rizky Alviando.pdf`

### 1. Profil & Headline LinkedIn (`Profile.pdf`)
- **Nama & Gelar:** Rizky Alviando, S.Mat.
- **Headline:** `AI Engineer | Fresh graduate of Applied Mathematics, ITS Surabaya | Certified Associate Data Scientist (CADS) from BNSP | Certified International Specialist in Data Engineering (CISDE) from PASAS Institute`
- **Lokasi:** Kota Bekasi, Jawa Barat, Indonesia
- **Kontak & Tautan:** `risky.alviando@gmail.com` | `https://www.linkedin.com/in/rizky-alviando-31b47021b/` | `https://github.com/RizkyAl01` | IG: `@alviandoo._`
- **Keahlian Teratas (Top Skills):** Fine Tuning, Prompt Engineering, Large Language Models (LLM)

### 2. Pengalaman Kerja & Akademik Lengkap (`Profile.pdf`)
- **AI Engineer - Ministry of Communication and Information Technology of the Republic of Indonesia (Komdigi)** *(Nov 2025 - Mei 2026 | 7 bulan | Jakarta Pusat)*:
  - Melakukan **Supervised Fine-Tuning (SFT)** dan **Continued Pre-Training (CPT)** pada berbagai arsitektur LLM open-source (**Qwen**, **Gemma**, **Llama-3.2-1B**) menggunakan **LoRA/QLoRA** & HuggingFace Transformers.
  - Mengembangkan dan melakukan *fine-tuning* model LLM (**Gemma 2B**) untuk mengklasifikasikan tingkat **Desil Rumah Tangga (DTSEN Desil 1-10)** serta menghasilkan narasi penalaran (*reasoning*) otomatis berdasarkan metadata dan kondisi fisik rumah (**Akurasi Tepat Sasaran: 54.00%, Akurasi Toleransi $\pm 1$ Desil: 99.00%**).
  - Eksplorasi dan pemanfaatan **Vision-Language Models (VLM)** untuk menganalisis data visual guna mendukung akurasi penalaran model.
  - Merancang dan mengeksekusi *pipeline end-to-end data collection* dan *data scraping* skala besar (*success rate* crawling 95%, scraping situs anti-bot >90%).
  - Memetakan alur input/output dan menyusun *timeline* teknis pengembangan agen AI pendidikan nusantara (*emotion analyzer*, *personal mentor*, *content generator*).
  - Berkolaborasi dengan Tim Solusi AI sebagai Tim Teknis untuk melakukan *monitoring*, *quality assurance*, dan perbaikan model RAG yang dikembangkan peserta **AITFxUB**.
- **Laboratory Coordinator Assistant - Institut Teknologi Sepuluh Nopember (ITS)** *(Sep 2023 - Agu 2025 | 2 tahun | Surabaya)*:
  - Koordinator Asisten Laboratorium Pemrograman dan Komputasi Visual (Departemen Matematika ITS), bertanggung jawab atas pengelolaan SDM asisten dan pelaksanaan praktikum.
- **Assistant Lecturer - Institut Teknologi Sepuluh Nopember (ITS)** *(Agu 2022 - Agu 2025 | 3 tahun 1 bulan | Surabaya)*:
  - Dosen Asisten mata kuliah Kalkulus di SKPB ITS.
- **Machine Learning Cohort - Bangkit Academy led by Google, Tokopedia, Gojek, & Traveloka** *(Agu 2024 - Jan 2025 | 6 bulan)*.
- **Statistisi - Data Analytics - Dinas Perpustakaan dan Kearsipan Provinsi Jawa Timur** *(Jul 2024 - Agu 2024 | 2 bulan | Surabaya)*.
- **Kepemimpinan & Organisasi di ITS:**
  - **Olimpiade Matematika ITS (OMITS)**: *Head Of Sub Division* *(Mar 2023 - Sep 2023 | 7 bulan)*.
  - **LKKI Departemen Matematika ITS**: *Staff of Media and Information Department* *(Jan 2023 - Des 2023 | 1 tahun)*.

### 3. Pendidikan & Penghargaan (`Profile.pdf` & `Portofolio Rizky Alviando.pdf`)
- **Institut Teknologi Sepuluh Nopember (ITS Surabaya)** - Sarjana Matematika *(Jul 2021 - Agu 2025)*:
  - **IPK:** `3.67 / 4.00` (**Cum Laude / Dengan Pujian**)
  - **Laboratorium:** Pembelajaran Mesin dan Big Data
  - **Nilai Tugas Akhir:** **A** (*Top-k High-Utility Pattern Mining* `T-BUM` dengan struktur data `iCMAP` untuk ekstraksi pola faktor risiko kecelakaan penerbangan fatal, mengungguli waktu komputasi metode `MISP-BU` dan `THUIM`).
- **Shibaura Institute of Technology (芝浦工業大学), Tokyo, Japan** - *Global Project Based Learning (GPBL), Data Science* *(Sep 2025)*:
  - **Award:** Penerima **JASSO Scholarship** & **Best Presentation in Team (dari 12 Tim lintas 6 Negara)**.
  - **Riset:** *Early Detection of Industrial Machining Chatter* menggunakan data sensor berkecepatan tinggi (*sound pressure* & *spindle acceleration*) dengan model **XGBoost + Attention, LSTM, dan RNN**.
- **SMA Negeri 2 Nganjuk** - Jurusan MIPA *(2018 - 2021)*.
