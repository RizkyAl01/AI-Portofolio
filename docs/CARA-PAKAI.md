# Cara Pakai Tim

## Setup sekali saja
1. Login Copilot CLI (sekali, hanya untuk jalur terminal): `cd D:\MAGANG_AI_ENGINEER\BELAJAR-MANDIRI\web-chatbot`, lalu `node tools\.copilot\node_modules\@github\copilot\npm-loader.js` dan ketik `/login`.
2. (Opsional) Izinkan tool `command` di `permissions.allow` pada settings.json agy, agar role yang menjalankan perintah tidak ditolak.
3. Rotasi semua key yang ada di `api/index.py` (lihat T0 di `docs/TASKS.md`).

## Jalur A: VS Code Copilot Chat (paling mudah)
1. Buka **folder `web-chatbot`** di VS Code (bukan folder induknya), lalu buka Chat (`Ctrl+Alt+I`).
2. Di dropdown mode pilih agent **PM**, lalu tulis: `Kerjakan backlog di docs/TASKS.md mulai T0.` Jika agent tidak muncul: Reload Window.
3. PM mendelegasikan ke Security -> Designer -> Frontend/Backend -> QA -> Tester. Jika tidak mendelegasikan, pilih tiap agent satu per satu dari dropdown. Model tiap role diatur di `model:` pada `.github/agents/*.agent.md`.
4. Anda cukup mereview hasil dan menyetujui langkah yang diminta.

## Jalur B: Cline
1. Pasang ekstensi Cline, pilih model utama (mis. Claude/Gemini).
2. Plan mode: "Baca .clinerules dan docs/TASKS.md, mulai dari T0 sebagai PM." Cline membaca `.clinerules/` otomatis (workflow, anti-slop, ponytail).
3. Act mode: Cline berganti role per fase dan menulis `[ROLE: ...]` di awal jawaban.
4. Untuk role dengan model berbeda, jalankan dari terminal Cline:
   `powershell -File tools\run-role.ps1 -Role qa -Task "Review perubahan frontend terhadap docs/DESIGN.md"`

## Jalur C: Terminal murni (model beda tiap role, fallback otomatis)
```powershell
.\tools\run-role.ps1 -Role security -Task "Kerjakan T0"
.\tools\run-role.ps1 -Role designer -Task "Tulis docs/DESIGN.md"
.\tools\run-role.ps1 -Role frontend -Task "Terapkan DESIGN.md ke frontend/"
.\tools\run-role.ps1 -Role qa       -Task "Review semua perubahan"
.\tools\run-role.ps1 -Role tester   -Task "Tulis dan jalankan tes"
```
`-Engine auto` (default) mencoba `agy` dulu, lalu pindah ke Copilot jika gagal. Paksa dengan `-Engine agy` atau `-Engine copilot`.

## Urutan yang disarankan
T0 Security -> Designer (`docs/DESIGN.md`) -> Frontend + Backend -> QA -> Tester -> perbaiki -> QA ulang.
Review diff sendiri sebelum commit. Jangan commit sebelum key lama dirotasi.
