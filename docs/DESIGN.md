# Visual Direction: Rizky's Information Universe (Light Editorial & 3D Cartographic Archipelago)

## 1. Tujuan & Referensi
Situs ini adalah pusat informasi menyeluruh tentang **Rizky Alviando**—bukan sekadar daftar proyek teknis. Pengunjung dapat menjelajahi profil, pengalaman kerja, katalog lengkap proyek (termasuk proyek mandiri dan adaptasi/rework rekayasa pribadi), pendidikan, organisasi & kepemimpinan, pencapaian, keahlian, sertifikasi, minat, hingga kontak dengan tujuan akhir yang jelas: *"Rekrut Rizky sebagai AI Engineer"*.

Gunakan koleksi [Emma Bostian's developer portfolios](https://github.com/emmabostian/developer-portfolios) sebatas indeks inspirasi untuk hierarki editorial dan interaksi yang punya tujuan; dilarang menyalin kode, aset, narasi, atau desain utuh.

---

## 2. Sistem Warna: Wajib Light Theme (Editorial Terang & Samudra Blueprint)
**DILARANG menggunakan tema gelap (dark mode/kotak hitam pekat).** Seluruh halaman dan kanvas interaktif wajib memakai palet terang yang bersih, manusiawi, dan memenuhi kontras **WCAG AA**:

- **Latar Utama (`--bg-primary`)**: `#f8fafc` atau `#ffffff` (putih bersih / slate sangat muda).
- **Permukaan Kartu (`--bg-surface`)**: `#ffffff` dengan permukaan sekunder/aksen (`--bg-muted`) `#f1f5f9`.
- **Teks Utama (`--text-primary`)**: `#0f172a` (gelap tajam, rasio kontras tinggi).
- **Teks Sekunder (`--text-secondary`)**: `#475569` (abu-abu slate untuk deskripsi/metadata).
- **Garis & Border (`--border-subtle`)**: `#e2e8f0` hingga `#cbd5e1` (hairline dividers 1px).
- **Satu Aksen Utama (`--accent-primary`)**: `#0284c7` / `#0369a1` (biru profesional untuk fokus, pulau aktif, dan CTA utama).
- **Palet Kartografi Globe (Samudra & Daratan Pulau)**:
  - **Samudra Bola Dunia**: Gradasi terang `#f0f9ff` ke `#e0f2fe` dengan garis lintang/bujur `#cbd5e1`.
  - **Daratan Pulau (Islands)**: Poligon teritori terang yang kontras di atas samudra (mis. permukaan daratan `#ffffff` / `#f8fafc` atau tint lembut `#e0f2fe`–`#bae6fd`, garis pantai tegas `#0284c7` / `#0369a1`, dan kontur pesisir luar tipis). Pulau yang sedang aktif diberi highlight aksen yang jelas namun tetap memenuhi kontras teks gelap `#0f172a`.

*Alasan*: Tema terang dan estetika peta kepulauan (archipelago blueprint) menjadikan navigasi 360° terasa nyata, berkarakter kuat, bebas klise AI-slop, dan sangat mudah dipindai oleh perekrut.

---

## 3. Tipografi & Spacing
- **Font Sans-Serif Utama**: Gunakan satu keluarga font humanis/geometris yang tajam untuk judul, label pulau, dan isi dengan skala jelas (`clamp()` untuk hero dan heading section).
- **Font Monospace**: Gunakan seperlunya hanya untuk koordinat kartografi `(lat, lon)`, jumlah sub-item di pulau, tanggal, metrik terukur, dan tag stack teknis.
- **Hierarki lewat Ruang**: Gunakan garis pemisah tipis (`1px solid #e2e8f0`), proporsi kolom yang bersih, dan ruang kosong (whitespace) yang lega.

---

## 4. Navigasi: Satu Header Utama & Tanpa Navigasi Ganda
- **No Sidebar**: Dilarang menggunakan sidebar vertikal di semua ukuran layar.
- **No Double Navigation**: Dilarang keras menampilkan dua bar navigasi yang memuat daftar tautan yang sama (misalnya `.site-header` dan `.subnav` bertumpuk).
- **Single Sticky Top Header**: Hanya gunakan **SATU** sticky header di bagian atas yang bersih dan ringkas untuk navigasi antar-section.
- **Floating Back-to-Top**: Sediakan satu tombol melayang *Back-to-Top* menggunakan **ikon panah atas murni** dengan `aria-label` yang jelas, tanpa menghalangi konten atau tombol chatbot pada layar sempit.

---

## 5. Globe 360°: 3D Cartographic Archipelago (Pulau Wilayah, Bukan Sekadar Titik)
Pengalaman *Atlas/Globe 360°* pada `#atlas-stage` dan `#atlas-canvas` wajib dirender sebagai **Kepulauan Kartografi 3D (3D Cartographic Archipelago)** yang memisahkan antar tab/kategori informasi utama:

- **6 Pulau / Benua Kartografi Utama (Islands)**:
  - Jangan lagi merender titik-titik kecil biasa sebagai penanda utama di atas bola dunia.
  - Ganti menjadi **6 Pulau Wilayah** yang merepresentasikan tab/kategori informasi:
    1. **Pulau Proyek** (Katalog proyek AI, NLP, Computer Vision, Full-Stack & Data)
    2. **Pulau Pengalaman** (Riwayat kerja & magang AI Engineer)
    3. **Pulau Organisasi** (Kepemimpinan & kontribusi komunitas/kampus)
    4. **Pulau Pendidikan** (Rekam akademik & publikasi/riset)
    5. **Pulau Keahlian** (Stack teknis, sertifikasi, pencapaian & minat)
    6. **Pulau Kontak** (Saluran kolaborasi & rekrutmen)
- **Geometri & Visual Pulau di Atas Bola 3D**:
  - Setiap Pulau digambar sebagai **poligon daratan organik multi-titik `(lon, lat)`** yang diproyeksikan mengikuti lengkungan 3D permukaan bola dunia (dengan *back-face culling* / peredupan halus saat berada di belahan belakang bola).
  - Lengkap dengan **garis pantai (coastline)** yang tegas, **kontur pesisir (coastal ring / shallow water contour)**, **elevasi/relief halus**, dan **label nama Pulau + badge jumlah item** yang selalu terbaca jelas.
  - Di dalam masing-masing pulau terdapat **penanda sub-item/kota kecil (landmarks)** yang mewakili entri nyata di kategori tersebut. Saat sebuah Pulau dipilih/diklik, panel informasi (`#atlas-detail`) menampilkan ringkasan pulau beserta daftar lengkap item/proyek di wilayah tersebut dan tombol loncat langsung ke seksinya.
- **Ukuran Globe Besar & Kontrol Ikon Murni di Dalam Frame**:
  - Radius visual bola dunia wajib memenuhi **~75%–82% tinggi `.atlas-stage`**.
  - Tombol kontrol rotasi (`#atlas-left`, `#atlas-right`, `#atlas-spin`, `#atlas-reset`) **WAJIB berada di dalam frame `.atlas-stage`** sebagai overlay floating, berbentuk **pure tombol ikon SVG (tanpa label teks terlihat)** berukuran ramah sentuh (~40–44px) dengan `aria-label` aksesibel.
  - **Tanpa Slider Sudut**: Dilarang menampilkan `<input type="range">` di layar.
  - Putaran otomatis bersifat *opt-in* (menghormati `prefers-reduced-motion`), dengan indeks HTML aksesibel untuk memilih Pulau via klik atau keyboard.

---

## 6. Katalog Proyek Lengkap dengan Filter Kategori (Tanpa Sidebar)
- **Cakupan Proyek Lengkap**:
  - Tampilkan seluruh portofolio terverifikasi Rizky secara utuh: proyek utama di CV, eksplorasi di `BELAJAR-MANDIRI`, serta proyek hasil adaptasi/rework rekayasa pribadi dari `DJED-Komdigi` dan `PROJEK-PROJEK MAGANG` (plus riset `Paper Rizky`).
  - Seluruh proyek hasil rework wajib menggunakan **narasi rekayasa pribadi dan arsitektur tingkat tinggi**, tanpa menyalin data sensitif institusi atau mengekspos kredensial/secret.
- **Pengelompokan & Filter Kategori Horizontal**:
  - Karena jumlah proyek bertambah banyak, seksi `#proyek` wajib menyediakan **bar filter/tab kategori horizontal** (mis. *Semua*, *LLM & RAG / Chatbot*, *Computer Vision & Multimodal*, *Data, BI & Analitik*, *Riset & Eksplorasi Mandiri*) — **tanpa sidebar**.
  - Setiap entri proyek disajikan sebagai studi kasus (dossier) yang memuat: *Kategori/Asal Rework, Masalah & Tujuan, Peran & Arsitektur Teknis Rizky, Stack Terverifikasi, serta Hasil/Metrik atau Tautan yang sah*.
- **Aksesibilitas & Responsivitas**:
  - Pastikan filter proyek dapat diakses dengan keyboard (`aria-pressed` / `role="tab"`), kontras memenuhi WCAG AA, dan tidak ada horizontal overflow pada lebar `360px`, `375px`, `768px`, dan `1280px`.

---

## 9. Mode Peta Ruangan 360° (Panoramic Workspace Room) & Meja Interaktif

### 9.1 Konsep & Transisi Arsitektur (Pivot Berdasarkan Arahan User)
Sesuai arahan eksplisit user:
1. **Terminal Chatbot ACC**: Antarmuka CRT/Retina PC monitor dengan prompt `visitor@ai-lab:~$` dan perintah CLI dipertahankan sepenuhnya sebagai aplikasi resmi di dalam PC.
2. **Bebas 3D Open World Walking & Bebas Fast Travel**: Seluruh pulau mengapung dan dock fast-travel 7 distrik di bawah dihilangkan.
3. **Peta 360 Derajat Ruangan Kerja**: Pengalaman berganti menjadi **Bilik Kerja 360° (Panoramic Workspace Room)** yang imersif, berpusat pada **Meja Kerja Kecil (Small Work Desk)**.

### 9.2 Tata Letak Meja Kerja & Aset Interaktif (Revisi Berdasarkan Review User)
Di tengah ruangan panorama 360°, terdapat meja kerja kayu realistis (bukan animasi/kartun) yang memuat dua kelompok aset interaktif utama:

1. **Koleksi Buku Dossier Interaktif (Buku-buku di Meja)**:
   - 📘 **Buku 1 - Profil & Kontak Resmi**:
     - Menampilkan foto asli Rizky Alviando di Shibaura Institute of Technology, Tokyo (`assets/images/IMG-20250903-WA0024.jpg`).
     - Ringkasan profesional: S1 Matematika ITS Cum Laude (IPK 3.67), dengan keahlian utama di bidang **AI Engineer**, **Data Science**, **LLM Engineering**, dan **Optimasi Operasional**.
     - Kontak resmi: Email (`risky.alviando@gmail.com`), LinkedIn, GitHub (`RizkyAl01`), WhatsApp.
   - 📗 **Buku 2 - Rekam Akademik & Pendidikan (Lengkap dengan Tahun & Nilai)**:
     - **SDN 1 Ngliman**: 2009 - 2015, Danem 289.5.
     - **SMPN 1 Sawahan**: 2015 - 2018, NEM 360.5 (Tertinggi di angkatan 1 sekolah).
     - **SMA Negeri 2 Nganjuk**: 2018 - 2021, MIPA, Nilai 89.40/100.00, Peringkat 4 OSN Tingkat Kabupaten Nganjuk, Organisasi Bina IT Smada.
     - **Institut Teknologi Sepuluh Nopember (ITS)**: 2021 - 2025, Sarjana Matematika, IPK 3.67/4.00, Predikat Cum Laude, Juara 3 Calculus Cup, Beasiswa JASSO.
     - **Shibaura Institute of Technology (Tokyo, Jepang)**: Sep 2025, Global Project-Based Learning Data Science & Communication, Best Presentation Team (12 tim lintas 6 negara).
   - 📕 **Buku 3 - Pengalaman Kerja, Magang & Asistensi**:
     - **Asisten Dosen (Departemen Matematika & SKPB ITS)**:
       - Mengajar mata kuliah **Kalkulus 1 dan Kalkulus 2** secara berkelanjutan dari semester 3 sampai lulus.
       - Mengajar mata kuliah **Algoritma Pemrograman** dan **Pemrograman Berorientasi Objek (PBO / OOP)** dari semester 5 sampai lulus.
     - **Ketua / Koordinator Asisten Lab Pemrograman & Komputasi Visual ITS** (Sep 2023 - Sep 2024): Mengelola asisten praktikum dan standarisasi modul Java & PBO.
     - **AI Engineer di DJED Komdigi** (Sep 2026 - Sekarang): Rekayasa AI, sandbox tata kelola data, Graph-RAG, evaluasi model.
     - **AI Engineer di Kementerian Komunikasi dan Digital** (Nov 2025 - Mei 2026): SFT/CPT Gemma & Qwen via LoRA/QLoRA (akurasi 72.04%), Klasifikasi DTSEN Desil (akurasi 99%), Pipeline Transkripsi YouTube (95%).
     - **Machine Learning Cohort di Bangkit Academy** (Sep 2024 - Jan 2025): Nilai akhir 92.79, MVP Sugaryzer (akurasi 89%).
     - **Agen Statistik di BPS Jatim / Pojok Statistik ITS** (Jul 2024 - Sep 2025).
     - **Statistisi Internship di DISPERPUSIP Jatim** (Jul 2024 - Okt 2024): 10 dataset regional, Tableau dashboard.
     - **Freelance Excel Trainer** (Jun 2026 - Jul 2026): Pelatihan formula lanjut & visualisasi data untuk 15 profesional korporat.
   - 📙 **Buku 4 - Organisasi & Kepemimpinan**:
     - Koordinator Asisten Dosen Kalkulus SKPB ITS & Lab Pemrograman Visual.
     - Kepala Sub Divisi Olimpiade Matematika ITS 15th (OMITS): Memimpin perumusan 100 naskah soal tingkat nasional bersama dosen juri.
     - Pengurus Komunitas Pecinta Catur ID: Pelaksana Turnamen Catur Akbar Nasional 2023.
     - Staff Ahli LKKI Departemen Matematika ITS & Himpunan Mahasiswa Matematika (Himatika) ITS.
   - 📔 **Buku 5 - Sertifikasi Resmi & Lampiran Berkas**:
     - Dilengkapi tombol tautan dan pratinjau lampiran PDF resmi untuk seluruh sertifikat:
       - PASAS Certified International Specialist in Data Engineering (CISDE) - Singapore (`assets/certs/PASAS_CISDE_Data_Engineering.pdf`).
       - Associate Data Scientist (Ilmuwan Data Madya) - BNSP RI (`assets/certs/BNSP_Ilmuwan_Data_Madya.pdf`).
       - Sertifikat Pemagangan AI Engineer Predikat Sangat Baik - Kemnaker RI & Komdigi.
       - Sertifikat Kelulusan Bangkit Academy Machine Learning (`assets/certs/Bangkit_Academy_2024.pdf`).
       - 6x Sertifikat Spesialisasi Coursera DeepLearning.AI & Stanford Online (`assets/certs/Coursera_Certificate_...pdf`).
       - Test of English Proficiency (TOEP) Skor 505 (`assets/certs/TOEP_PLTI_Certificate.pdf`) & TOEFL 580.
       - Piagam Best Presentation Award SIT Tokyo & Beasiswa JASSO.

2. **Workstation PC Desktop**:
   - Tanpa simbol/emoji berlebih. Tombol bersih dan lugas:
     - **Aplikasi Chatbot**: Membuka popup monitor terminal CRT/Retina retro-modern dengan prompt `visitor@ai-lab:~$`. Mendukung pertanyaan umum maupun pertanyaan seputar portofolio Rizky, ditenagai model Qwen (`qwen/qwen3.8-27b`) via API tanpa menampilkan penjelasan teknis mesin ke pengunjung.
     - **Folder Projek**: Membuka file explorer 4 subjek terverifikasi:
       1. *ML / DL / Data Mining*
       2. *LLM & Generative AI*
       3. *Computer Vision (CV)*
       4. *Asistensi / Math / Optimasi & Riset Operasi* (Model Linear Programming Simplex, Big-M, Hungarian Assignment, Model Transportasi VAM, dan solver Python PuLP/Scipy).


### 9.3 Lingkungan Bilik 360° (Panoramic Ambiance)
- **Rotasi 360° Mulus**: Pengguna dapat menggeser mouse atau swipe sentuh secara horizontal (yaw 0-360°) dan vertikal (pitch -60° hingga +60°) untuk mengamati seluruh sudut bilik.
- **Dinding Piagam & Ijazah**: Piagam berbingkai kayu emas/perak terpajang di dinding bilik kerja (Cum Laude ITS, Piagam Tokyo, Sertifikat CISDE).
- **Papan Tulis Whiteboard Riset Operasi & AI**: Papan tulis dinding yang menampilkan diagram arsitektur RAG, penurunan fungsi loss cross-entropy, dan tabel simpleks linear programming.
- **Pencahayaan Studio Lembut**: Cahaya jendela alami studio (`#FFFDF8`) tanpa langit kartun biru berlebihan. Palet warna selaras `dashboard_pdrb` (`#FCFCFB`, `#F4F3F1`, `#C2441F`, `#1F1F1F`).


### 9.1 Konsep & Transisi Arsitektur (Pivot Berdasarkan Arahan User)
Sesuai arahan eksplisit user:
1. **Terminal Chatbot ACC**: Antarmuka CRT/Retina PC monitor dengan prompt `visitor@ai-lab:~$` dan perintah CLI dipertahankan sepenuhnya sebagai aplikasi resmi di dalam PC.
2. **Bebas 3D Open World Walking & Bebas Fast Travel**: Seluruh pulau mengapung dan dock fast-travel 7 distrik di bawah dihilangkan.
3. **Peta 360 Derajat Ruangan Kerja**: Pengalaman berganti menjadi **Bilik Kerja 360° (Panoramic Workspace Room)** yang imersif, berpusat pada **Meja Kerja Kecil (Small Work Desk)**.

### 9.2 Tata Letak Meja Kerja & Aset Interaktif (Revisi Berdasarkan Review User)
Di tengah ruangan panorama 360°, terdapat meja kerja kayu realistis (bukan animasi/kartun) yang memuat dua kelompok aset interaktif utama:

1. **Koleksi Buku Dossier Interaktif (Buku-buku di Meja)**:
   - 📘 **Buku 1 - Profil & Kontak Resmi**:
     - Menampilkan foto asli Rizky Alviando di Shibaura Institute of Technology, Tokyo (`assets/images/IMG-20250903-WA0024.jpg`).
     - Ringkasan profesional: S1 Matematika ITS Cum Laude (IPK 3.67), dengan keahlian utama di bidang **AI Engineer**, **Data Science**, **LLM Engineering**, dan **Optimasi Operasional**.
     - Kontak resmi: Email (`risky.alviando@gmail.com`), LinkedIn, GitHub (`RizkyAl01`), WhatsApp.
   - 📗 **Buku 2 - Rekam Akademik & Pendidikan (Lengkap dengan Tahun & Nilai)**:
     - **SDN 1 Ngliman**: 2009 - 2015, Danem 289.5.
     - **SMPN 1 Sawahan**: 2015 - 2018, NEM 360.5 (Tertinggi di angkatan 1 sekolah).
     - **SMA Negeri 2 Nganjuk**: 2018 - 2021, MIPA, Nilai 89.40/100.00, Peringkat 4 OSN Tingkat Kabupaten Nganjuk, Organisasi Bina IT Smada.
     - **Institut Teknologi Sepuluh Nopember (ITS)**: 2021 - 2025, Sarjana Matematika, IPK 3.67/4.00, Predikat Cum Laude, Juara 3 Calculus Cup, Beasiswa JASSO.
     - **Shibaura Institute of Technology (Tokyo, Jepang)**: Sep 2025, Global Project-Based Learning Data Science & Communication, Best Presentation Team (12 tim lintas 6 negara).
   - 📕 **Buku 3 - Pengalaman Kerja, Magang & Asistensi**:
     - **Asisten Dosen (Departemen Matematika & SKPB ITS)**:
       - Mengajar mata kuliah **Kalkulus 1 dan Kalkulus 2** secara berkelanjutan dari semester 3 sampai lulus.
       - Mengajar mata kuliah **Algoritma Pemrograman** dan **Pemrograman Berorientasi Objek (PBO / OOP)** dari semester 5 sampai lulus.
     - **Ketua / Koordinator Asisten Lab Pemrograman & Komputasi Visual ITS** (Sep 2023 - Sep 2024): Mengelola asisten praktikum dan standarisasi modul Java & PBO.
     - **AI Engineer di DJED Komdigi** (Sep 2026 - Sekarang): Rekayasa AI, sandbox tata kelola data, Graph-RAG, evaluasi model.
     - **AI Engineer di Kementerian Komunikasi dan Digital** (Nov 2025 - Mei 2026): SFT/CPT Gemma & Qwen via LoRA/QLoRA (akurasi 72.04%), Klasifikasi DTSEN Desil (akurasi 99%), Pipeline Transkripsi YouTube (95%).
     - **Machine Learning Cohort di Bangkit Academy** (Sep 2024 - Jan 2025): Nilai akhir 92.79, MVP Sugaryzer (akurasi 89%).
     - **Agen Statistik di BPS Jatim / Pojok Statistik ITS** (Jul 2024 - Sep 2025).
     - **Statistisi Internship di DISPERPUSIP Jatim** (Jul 2024 - Okt 2024): 10 dataset regional, Tableau dashboard.
     - **Freelance Excel Trainer** (Jun 2026 - Jul 2026): Pelatihan formula lanjut & visualisasi data untuk 15 profesional korporat.
   - 📙 **Buku 4 - Organisasi & Kepemimpinan**:
     - Koordinator Asisten Dosen Kalkulus SKPB ITS & Lab Pemrograman Visual.
     - Kepala Sub Divisi Olimpiade Matematika ITS 15th (OMITS): Memimpin perumusan 100 naskah soal tingkat nasional bersama dosen juri.
     - Pengurus Komunitas Pecinta Catur ID: Pelaksana Turnamen Catur Akbar Nasional 2023.
     - Staff Ahli LKKI Departemen Matematika ITS & Himpunan Mahasiswa Matematika (Himatika) ITS.
   - 📔 **Buku 5 - Sertifikasi Resmi & Lampiran Berkas**:
     - Dilengkapi tombol tautan dan pratinjau lampiran PDF resmi untuk seluruh sertifikat:
       - PASAS Certified International Specialist in Data Engineering (CISDE) - Singapore (`assets/certs/PASAS_CISDE_Data_Engineering.pdf`).
       - Associate Data Scientist (Ilmuwan Data Madya) - BNSP RI (`assets/certs/BNSP_Ilmuwan_Data_Madya.pdf`).
       - Sertifikat Pemagangan AI Engineer Predikat Sangat Baik - Kemnaker RI & Komdigi.
       - Sertifikat Kelulusan Bangkit Academy Machine Learning (`assets/certs/Bangkit_Academy_2024.pdf`).
       - 6x Sertifikat Spesialisasi Coursera DeepLearning.AI & Stanford Online (`assets/certs/Coursera_Certificate_...pdf`).
       - Test of English Proficiency (TOEP) Skor 505 (`assets/certs/TOEP_PLTI_Certificate.pdf`) & TOEFL 580.
       - Piagam Best Presentation Award SIT Tokyo & Beasiswa JASSO.

2. **Workstation PC Desktop**:
   - Tanpa simbol/emoji berlebih. Tombol bersih dan lugas:
     - **Aplikasi Chatbot**: Membuka popup monitor terminal CRT/Retina retro-modern dengan prompt `visitor@ai-lab:~$`. Mendukung pertanyaan umum maupun pertanyaan seputar portofolio Rizky, ditenagai model Qwen (`qwen/qwen3.8-27b`) via API tanpa menampilkan penjelasan teknis mesin ke pengunjung.
     - **Folder Projek**: Membuka file explorer 4 subjek terverifikasi:
       1. *ML / DL / Data Mining*
       2. *LLM & Generative AI*
       3. *Computer Vision (CV)*
       4. *Asistensi / Math / Optimasi & Riset Operasi* (Model Linear Programming Simplex, Big-M, Hungarian Assignment, Model Transportasi VAM, dan solver Python PuLP/Scipy).


### 9.3 Lingkungan Bilik 360° (Panoramic Ambiance)
- **Rotasi 360° Mulus**: Pengguna dapat menggeser mouse atau swipe sentuh secara horizontal (yaw 0-360°) dan vertikal (pitch -60° hingga +60°) untuk mengamati seluruh sudut bilik.
- **Dinding Piagam & Ijazah**: Piagam berbingkai kayu emas/perak terpajang di dinding bilik kerja (Cum Laude ITS, Piagam Tokyo, Sertifikat CISDE).
- **Papan Tulis Whiteboard Riset Operasi & AI**: Papan tulis dinding yang menampilkan diagram arsitektur RAG, penurunan fungsi loss cross-entropy, dan tabel simpleks linear programming.
- **Pencahayaan Studio Lembut**: Cahaya jendela alami studio (`#FFFDF8`) tanpa langit kartun biru berlebihan. Palet warna selaras `dashboard_pdrb` (`#FCFCFB`, `#F4F3F1`, `#C2441F`, `#1F1F1F`).


### 8.1 Kamera Zoomable: Transisi Mulus FPP (Mata) ke TPP (Avatar Terlihat)
- **Kontrol Jarak Kamera Dinamis (Scroll Wheel / Pinch / Slider Zoom)**:
  - Jarak kamera (`camDist`) dapat diatur mulus dari `0.0` (FPP penuh di ketinggian mata 1.65m) hingga `18.0` (TPP / isometrik luas dari belakang avatar).
  - **Saat Zoom Penuh (`camDist = 0`)**: Mode FPP murni di ketinggian mata manusia. Pandangan diarahkan lewat mouse look, reticle aktif di tengah.
  - **Saat Zoom Out (`camDist > 0.5`)**: Kamera mundur dan naik secara diagonal, memperlihatkan karakter avatar humanoid 3D (rambut, kacamata, jaket, sneakers) yang sedang berjalan di jalan batu dan berbelok menghadap arah tujuannya.
  - Rotasi arah pandang (*yaw* horizontal dan *pitch* vertikal) dapat dikendalikan dengan *mouse drag* atau sentuhan layar.

### 8.2 Skala Peta Luas & Estetika Maketa Arsitektur (Bukan Gaming/Kartun)
- **Skala Peta Megah & Lapang**:
  - Lansekap diperluas menjadi radius boulevard ~13m dengan area lantai 120x120m, memberikan ruang jalan yang lapang, megah, dan tidak sempit.
- **Palet Warna Studio Editorial (Acuan: `dashboard_pdrb`)**:
  - Latar belakang bukan langit kartun biru cerah, melainkan **studio arsitektural bersih bernuansa batu lembut alami (`#FCFCFB` / `#F5F5F3`)** dengan kabut lembut harmonis.
- **Material Maketa Arsitektural**:
  - Menghilangkan ornamen kartun/gaming (bunga warna-warni bulat mencolok ditiadakan).
  - Menggunakan material arsitektur elegan: paving batu granit abu-abu muda (`#E2E8F0`), trotoar batu potong (`#CBD5E1`), kayu mahoni/walnut bertekstur lembut, batu kapur (*limestone*), kaca arsitektural berbayang halus, dan tanaman pagar terpotong rapi (*manicured hedges*).

### 8.3 Anti-Overlap Teks & Isolasi Input Formulir
- **Penanganan Overlap Teks**:
  - Label nama gedung 3D (*billboard sprite*) dilengkapi mekanisme *distance-fading*: label di kejauhan (>18m) memudar secara otomatis sehingga tidak bertumpuk di layar, dan tampil tegas saat pengunjung mendekat.
- **Isolasi Input Form (Cegah Spasi Masuk Menara)**:
  - Event listener keyboard wajib mendeteksi elemen aktif. Jika pengguna sedang mengetik di dalam `<input>` (misal terminal PC atau modal nama), seluruh *shortcut* game (seperti `Space` atau `W/A/S/D`) **dinonaktifkan 100%**.

### 8.4 Bilik Ruangan Menara Komdigi & Fakta Sah CV
- Setiap bilik gedung menampilkan aset interior fisik yang kaya:
  - **🏢 Bilik Menara Komdigi**:
    - **Nempel di Tembok**: Piagam penugasan resmi Direktorat Kecerdasan Artifisial & Ekosistem Teknologi Baru (DJED), dashboard metrik evaluasi model bahasa *LLM as a Judge*, diagram alur *Smart Agentic RAG*, dan akurasi 99% klasifikasi desil DTSEN.
    - **Aset Interior Lantai**: Rak server komputasi enterprise dengan lampu telemetri, meja konferensi AI Engineer dengan berkas arsitektur model, dan lencana identitas resmi.
  - **🏆 Bilik Prestasi & Sertifikat**:
    - Trophy fisik Juara 3 Calculus Cup ITS, piagam tim presentasi terbaik SIT Tokyo, plakat beasiswa JASSO, plakat Cum Laude S1 Matematika ITS, serta sertifikat resmi PASAS CISDE, BNSP Data Scientist, dan Kemnaker Komdigi.

### 8.4 Antarmuka Chatbot: Pop-Up Monitor PC Fisik (Akses dari Peta)
- Saat pemain mendekati meja komputer di tengah peta atau menekan tombol `[E]`:
  - Muncul **overlay modal unit monitor PC lengkap** (casing bezel monitor, leher stand penyangga, tombol power LED hijau, dan layar CRT/IPS retina).
  - Terminal antarmuka `RIZKY-OS` dengan command prompt `visitor@ai-lab:~$` dan tombol eksekusi perintah cepat.
  - Tombol tutup `[✕ Tutup Monitor [ESC]]` untuk kembali seketika ke navigasi FPP.

### 8.5 Onboarding Bersih Anti-Slop
- Tanpa kuis chatbot klise atau popup survei yang memblokir.
- Pengunjung langsung masuk ke dunia 3D dalam mode pandangan FPP dengan kebebasan melangkah.
- Status pengunjung disajikan secara diskret di top bar: `[👤 Tamu / Klik untuk input nama rekruter]` tanpa interupsi.

---

## 10. Ruangan Isometrik 3D Realistis, Simulasi Desktop PC OS, & Dossier Flipbook

### 10.1 Konsep Visual Ruangan Isometrik 3D Realistis
Berdasarkan arahan eksplisit user dan acuan aset nyata (`28-isometric-room.rar`):
1. **Estetika Arsitektural Nyata (Bukan Kartun / Low-Poly Polos)**:
   - Menggunakan model 3D ruangan realistis (`RoomModel.glb`) dengan **baked daylight textures** (`bakedTextureDaycmp.webp`), tekstur pinboard dinding (`boardBakedDcmp.webp`), dan lantai kayu parquet (`texture.png`).
   - Pencahayaan lembut studio arsitektural: cahaya matahari pagi/siang yang masuk dari jendela samping dengan bayangan halus, lampu meja baca, dan aksen backlight monitor yang realistis.
2. **Kamera Isometrik Presisi**:
   - Sudut pandang isometrik 3D yang elegan (`camera.position.set(14, 10, -14)`), menampilkan sudut ruangan yang hangat dengan meja kerja, kursi ergonomis, rak buku, tanaman monstera hias, papan pajangan dinding, dan papan catur.
   - Kontrol navigasi ramah: pengguna dapat memutar sedikit sudut ruangan (*subtle orbit*) atau langsung mengklik objek interaktif.

### 10.2 Tiga Hotspot Interaktif Utama
1. **🖥️ Workstation PC Desktop**:
   - Klik monitor PC -> Kamera bertransisi mulus (*smooth camera zoom*) menghadap penuh ke layar monitor PC.
   - Layar monitor PC bertransformasi menjadi **Simulasi Desktop OS Developer**:
     - Kursor mouse interaktif yang responsif.
     - Status bar atas/bawah: Jam sistem, indikator koneksi, status resource.
     - **Shortcut `.exe` (`terminal.exe` / `chatbot.exe`)**: Membuka terminal chatbot CRT/Retina dengan prompt `visitor@ai-lab:~$`, terhubung ke `/api/web-chat` (model Qwen).
     - **Shortcut Folder (`📁 Portofolio_Projects`)**: Membuka antarmuka **File Explorer** dengan daftar 4 kategori proyek terverifikasi (*ML & Data Science*, *LLM & Agentic AI*, *Computer Vision*, *Math & Riset Operasi*). Saat file proyek diklik, muncul jendela dossier proyek (judul, deskripsi masalah, solusi rekayasa Rizky, stack terverifikasi, metrik, dan tombol live demo/repo/sertifikat).
     - **Shortcut Dokumen (`📄 Resume_Rizky_Alviando.pdf`)**: Membuka modal preview PDF kurikulum vitae resmi.
     - Tombol **"✕ Keluar ke Ruangan [ESC]"** untuk mengembalikan kamera ke sudut isometrik semula.

2. **📖 Buku Dossier di Meja (Real physical flipbook feel)**:
   - Klik buku di meja -> Membuka antarmuka **3D Animated Flipbook** menggunakan pustaka `StPageFlip` (`page-flip.browser.min.js`).
   - Pengalaman autentik buka buku fisik: efek melengkung (*curl*), bayangan lipatan halaman, drag mouse untuk membalik lembaran, dan nuansa kertas halus.
   - Struktur Halaman Buku:
     - **Sampul Buku**: Hardcover kulit elegan dengan emboss emas: *"RIZKY ALVIANDO — PORTFOLIO & DOSSIER REKAYASA AI"*.
     - **Halaman 1-2 (Profil & Kontak Resmi)**: Foto asli Rizky di Shibaura Institute of Technology, Tokyo (`IMG-20250903-WA0024.jpg`), ringkasan keahlian S1 Matematika ITS Cum Laude (IPK 3.67), dan saluran kontak terverifikasi (Email, LinkedIn, GitHub, WhatsApp).
     - **Halaman 3-4 (Rekam Pendidikan Lengkap)**: Riwayat pendidikan lengkap tanpa rekaan: SDN 1 Ngliman (Danem 289.5), SMPN 1 Sawahan (NEM 360.5 tertinggi 1 angkatan), SMAN 2 Nganjuk (89.40, OSN), ITS (Cum Laude 3.67, Juara 3 Calculus Cup), dan SIT Tokyo (Best Presentation Team).
     - **Halaman 5-6 (Pengalaman Kerja, Magang & Asistensi)**: DJED Komdigi, Asdos Kalkulus 1 & 2 (semester 3 - lulus), Asdos Pemrograman & PBO (semester 5 - lulus), Magang AI Engineer Komdigi, Bangkit ML Cohort, BPS Jatim, Disperpusip, dan Freelance Excel Trainer.
     - **Halaman 7-8 (Organisasi & Sertifikasi Resmi)**: OMITS, Catur ID, Himatika ITS, serta lampiran resmi dengan tombol preview PDF langsung (PASAS CISDE, BNSP Data Scientist, Bangkit, 6x Coursera, TOEP).

3. **🖼️ Piagam & Foto di Dinding**:
   - Papan pajangan dinding dan bingkai foto di rak/tembok.
   - Klik bingkai -> Zoom kamera atau modal inspeksi resolusi tinggi untuk melihat foto asli tim penghargaan SIT Tokyo dan piagam kelulusan Cum Laude ITS.

4. **♟️ Arena Catur Interaktif vs Master AI Agent (~1800 ELO)**:
   - Terletak pada meja kopi di ruangan 3D dan dapat diakses juga melalui shortcut desktop `Catur_1800_AI`.
   - Mengadu kemampuan catur pengunjung / Rizky (rating riil ~1600 ELO di Komunitas Catur ID) melawan agen AI catur yang dikalibrasi ke ~1800 ELO.
   - Mesin AI menggunakan algoritma Minimax dengan pemangkasan Alpha-Beta pada Depth 3-4, dioptimasi dengan Piece-Square Tables (PST) Michniewski untuk evaluasi strategis (kontrol sentral d4/e4/d5/e5, pengembangan perwira ringan, perlindungan raja pasca-rokade).
   - Antarmuka papan 8x8 yang responsif dengan notasi aljabar dinamis, deteksi skak/skakmat otomatis, dan rak bidak tangkapan.

5. **▼ Hotspot Pointer Berarah ke Bawah (Downward Pointer Pins)**:
   - Menggantikan pil horizontal besar yang menutupi ruangan dengan penanda pin vertikal yang ramping:
     - Badge ringkas dengan ikon SVG monokromatik (`PC Workstation`, `Buku Dossier Portofolio`, `Papan Catur • AI ~1800 ELO`, `Piagam Tokyo & Pinboard`).
     - Panah tajam ke bawah (`▼`) yang menunjuk langsung ke koordinat 3D objek terkait dengan animasi pantulan halus (`animate-bounce`).
   - Memberikan navigasi ruang yang presisi tanpa mengorbankan estetika visual ruangan isometrik.

6. **📜 Hub Sertifikasi Coursera & Desain Anti-Slop**:
   - Menampilkan seluruh 6 sertifikasi Coursera Specialization (DeepLearning.AI & Stanford) di File Explorer dan Flipbook Halaman 8 dengan tombol "Buka PDF" dan "Verifikasi Resmi ↗".
   - Kepatuhan ketat terhadap `.clinerules/01-anti-slop.md`: Seluruh emoji pada kartu proyek dan sidebar diganti dengan badge monospace teknis (`[ML]`, `[LLM]`, `[CV]`, `[MATH]`) dan SVG monokrom standar rekayasa.


