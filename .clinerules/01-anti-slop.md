# Anti-Slop (desain & copy)

"Slop" = tampilan/teks generik ala AI. Hindari:

## Visual
- Gradient ungu-biru + blob blur sebagai satu-satunya identitas (saat ini `.bg-shape` di index.html: kurangi/ganti).
- Glassmorphism di semua kartu, shadow lembut seragam, rounded 24px di mana-mana.
- Emoji sebagai ikon, hero generik "Hi, I'm ... 👋".
- Font tanpa hierarki. Pilih 1 pasang font dengan skala tipografi jelas.
- Grid 3 kartu identik tanpa konten nyata.

## Copy
- Buzzword kosong: "passionate", "cutting-edge", "seamless", "leverage", "revolutionize".
- Klaim tanpa bukti. Setiap proyek harus punya: masalah, peran Rizky, stack, hasil terukur, link.
- Sumber fakta tunggal: `Rizky Alviando-CV-ID_raw.md`. Jangan mengarang angka/pengalaman.

## Wajib
- Satu palet terbatas (1 aksen), konsisten via CSS variables.
- Kontras WCAG AA, `alt` pada gambar, fokus keyboard terlihat, `prefers-reduced-motion`.
- Gambar dioptimasi (`IMG-*.jpg` besar -> webp, `loading="lazy"`).
- Meta SEO + Open Graph, `lang="id"`.
- Satu halaman = satu tujuan: "Rekrut Rizky sebagai AI Engineer".
