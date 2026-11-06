# Antigravity Multi-Agent Team Configuration

File ini adalah panduan utama bagi Google Antigravity (IDE & `agy` CLI) dalam mengelola proyek ini. Antigravity bertindak sebagai **PM (Project Manager / Orchestrator)** yang mengoordinasikan tim spesialis melalui sub-agent otonom atau pemanggilan role.

> [!IMPORTANT]
> **Aturan Non-Destruktif & Keamanan Kredensial:**
> 1. DILARANG menghapus, menimpa, memindahkan, atau mencetak nilai `.env` maupun credential (`gsk_`, `bot[0-9]+:`, `eyJ`). Pemilik mengelola rotasi credential sendiri.
> 2. DILARANG menghapus/menimpa file proyek atau konfigurasi yang sudah ada (termasuk folder `.github/`, `.cline/`, `.clinerules/`, `tools/`).
> 3. Objective situs: Pusat informasi lengkap portofolio imersif (universe 360° tanpa sidebar, anti AI-slop).

---

## 1. Alur Kerja Tim (Workflow)

Saat menerima tugas besar dari pengguna atau dari `docs/TASKS.md`, Antigravity bertindak sebagai **PM** dengan alur tahapan berikut:

1. **[PM]** Analisis backlog di `docs/TASKS.md`, pecah tugas menjadi sub-task terukur, tentukan urutan pengerjaan.
2. **[Security]** Selesaikan isu keamanan / sanitasi secret sebelum fitur lain disentuh (T0).
3. **[Designer]** Tentukan arah visual (anti-slop, universe 360°, tanpa sidebar) di `docs/DESIGN.md`.
4. **[Frontend & Backend]** Kerjakan implementasi kode (dapat didelegasikan ke sub-agent secara paralel).
5. **[QA]** Review independen terhadap requirement, anti-slop, dan aksesibilitas (Read-Only). Menghasilkan tabel temuan dan status `APPROVE` / `REJECT`.
6. **[Tester]** Jalankan tes otomatis (`pytest tests/`, cek sintaks, mock service). Laporkan hasil kelulusan.
7. Jika QA atau Tester menolak -> Kembalikan ke Dev untuk diperbaiki (maksimal 3 iterasi). PM memperbarui `docs/TASKS.md` saat selesai.

---

## 2. Definisi Peran & Batasan File (File Ownership)

| Role | Tanggung Jawab & Batasan File | Tooling & Mode | Model Ideal (Antigravity / `agy`) |
| :--- | :--- | :--- | :--- |
| **PM** | Memecah backlog, koordinasi tim, update `docs/TASKS.md`. Dilarang menulis kode produk sendiri. | Planning / Orchestration | `claude-opus-5-5-high` / `pro` |
| **Designer** | Menulis panduan visual di `docs/DESIGN.md`. Hanya boleh menulis di `docs/**`. Anti-slop 1 aksen warna. | Search / Edit Docs | `gemini-4-argon-high` / `pro` |
| **Frontend** | Implementasi UI portofolio universe 360° & chatbot widget. Hanya boleh mengubah `frontend/**`. | Edit / Search / Test | `claude-sonnet-5-5-high` / `pro` |
| **Backend** | API FastAPI & deploy Vercel. Hanya boleh mengubah `api/**`, `requirements.txt`, `vercel.json`. Jaga kontrak `POST /api/web-chat`. | Edit / Search / Test | `claude-sonnet-5-5-high` / `pro` |
| **Asset-Compiler** | Spesialis kompilasi & generator aset 2D/3D (spritesheet karakter, tileset isometrik/pixel kaya tekstur, model low-poly Three.js/GLTF, shader & lighting). Mengubah bentuk geometris datar sederhana menjadi aset dunia game yang imersif dan berestetika tinggi. | Asset Generation / Procedural Mesh | `gemini-4-argon-high` / `pro` |
| **QA-Tester** | Pengujian menyeluruh & verifikasi independen (Review requirement, anti-slop, aksesibilitas WCAG AA, eksekusi tes otomatis `pytest tests/`, `py_compile`, sanitasi secret scanner, dan pelaporan status APPROVE/REJECT). | Test & Inspection (Automated & Visual) | `gemini-3.8-flash-medium` / `flash` |

---

## 3. Instruksi Orkestrasi Sub-Agent (Antigravity IDE)

Jika pengguna meminta pengerjaan tugas secara otonom di Antigravity IDE:
* **Delegasi Paralel:** Gunakan tool `invoke_subagent` untuk mendelegasikan tugas Frontend dan Backend secara bersamaan dengan mode workspace terisolasi (`Workspace: branch` atau `share`).
* **Independent QA-Tester Verification:** Jalankan sub-agent QA-Tester untuk mereview perubahan dan mengeksekusi tes otomatis sebelum menyetujui penyelesaian task.
* **Gunakan Skill & Rules Proyek:** Sub-agent wajib mematuhi aturan anti-slop di `.clinerules/01-anti-slop.md` dan prinsip minimalis di `.clinerules/03-ponytail.md`.

---

## 4. Jalur Eksekusi Terminal (`agy`)

Jika pengerjaan didelegasikan lewat terminal Antigravity CLI (`agy`), gunakan skrip bawaan proyek:
```powershell
powershell -File tools\run-role.ps1 -Role <role> -Task "<tugas>" -Engine agy
```
Skrip ini secara otomatis memetakan model terbaik per role tanpa memotong kuota eksternal (GitHub Copilot / API luar).

---

## 5. Kriteria Selesai (Definition of Done)
* Tes otomatis di `tests/` hijau / lulus (mocked, tidak panggil live API).
* Tidak ada secret/token hardcoded di kode (`gsk_`, `bot[0-9]+:`, `eyJ` bersih).
* QA-Tester independen memberikan status **APPROVE**.
* `docs/TASKS.md` diperbarui dengan status terkini.

