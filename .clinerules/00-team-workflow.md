# Tim Multi-Role (Cline)

Cline tidak punya sub-agent file seperti VS Code. Gantinya: satu agent yang **berganti topi (role)** per fase,
dipandu rules ini. Selalu umumkan role aktif di awal respons: `[ROLE: PM]`, `[ROLE: Frontend]`, dst.

## Proyek
Portofolio Rizky Alviando + chatbot. Frontend statis: `frontend/index.html`. Backend FastAPI: `api/index.py`. Deploy: Vercel (`vercel.json`).

## Alur wajib
1. **[PM]** Baca `docs/TASKS.md`, pecah pekerjaan, tentukan urutan. Gunakan Plan mode.
2. **[Security]** Selesaikan T0 (secret hardcode) SEBELUM fitur lain.
3. **[Designer]** Tentukan arah visual singkat (lihat `01-anti-slop.md`), tulis di `docs/DESIGN.md`.
4. **[Frontend]** Ubah hanya `frontend/**`. **[Backend]** hanya `api/**`, `requirements.txt`, `vercel.json`.
5. **[QA]** Review read-only terhadap checklist di `docs/TASKS.md` + anti-slop. Output: daftar temuan bertingkat.
6. **[Tester]** Jalankan tes/cek (lihat bawah). Laporkan lulus/gagal dengan bukti.
7. Jika QA/Tester gagal -> kembali ke Dev (maks 3 iterasi), lalu PM menutup dan update `docs/TASKS.md`.

## Model per role (via Antigravity CLI `agy`)
Cline memakai model utamanya sendiri sebagai PM/koordinator. Untuk delegasi ke role lain, jalankan di terminal:
`powershell -File tools\run-role.ps1 -Role <role> -Task "<tugas>"`

| Role | Model | Mode |
|------|-------|------|
| pm, security | claude-opus-5-5-high | plan / accept-edits |
| designer, qa | gemini-4-argon-high | accept-edits / plan (read-only) |
| frontend, backend | claude-sonnet-5-5-high | accept-edits |
| tester | gemini-3.8-flash-medium | accept-edits |

### Jalur Copilot (cadangan jika agy/Claude kena limit)
Agent di `.github\agents\*.agent.md` punya `model:` berisi daftar fallback (Sonnet 5.5 / GPT-5.6 Luna / Gemini 3.8 Flash via Copilot).
Pilih agent di VS Code Chat, model dipakai otomatis. Nama model harus persis seperti di model picker; sesuaikan jika berbeda.

QA sengaja beda model dari developer agar review independen. Ganti model di `tools\run-role.ps1`.
Rules tambahan: `02-antislop-skills.md` (skill di `.cline\skills\`) dan `03-ponytail.md` (minim kode, tanpa memotong validasi/keamanan).
Jika agy headless menolak tool "command", tambahkan allow-rule di `permissions.allow` pada settings.json agy.

## Kepemilikan file (hindari konflik)
- Frontend: `frontend/**` (kecuali skrip `*.py` bantu)
- Backend: `api/**`, `requirements.txt`, `vercel.json`
- QA/Tester: tidak mengubah kode produk; Tester boleh menambah `tests/**`

## Pengecekan Tester
- Backend: `pytest tests/` (httpx TestClient, mock Groq/Supabase), `python -m py_compile api/index.py`
- Frontend: buka lewat `uvicorn api.index:app --reload`, cek console tanpa error, responsif 375/768/1280px, Lighthouse >= 90
- Keamanan: grep pola `gsk_`, `bot[0-9]+:`, `eyJ` harus kosong

## Definisi selesai
Tes hijau + QA approve + tidak ada secret di kode + `docs/TASKS.md` diperbarui.
