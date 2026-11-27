[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/best-household-budget-site-20261126-1457) [![license MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![Node 22](https://img.shields.io/badge/Node-22-brightgreen)](https://nodejs.org)

# Dompet Keluarga — Anggaran Rumah Tangga November 2026

Dompet Keluarga adalah site statis offline untuk mengatur anggaran rumah tangga: tambah, edit, dan hapus transaksi, pilih kategori dari 10 kategori yang tersedia, lihat ringkasan bulanan, chart per kategori, target anggaran, dan kalkulator sisa uang. Semua data tersimpan di localStorage browser, tanpa akun dan tanpa server.

## Bounty

Entry untuk bounty [Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457) ($50, 10 tempat) di make.fun.

## Menjalankan

Jalankan server statis dari folder `app/`:

```bash
npx serve app
```

atau:

```bash
cd app
python3 -m http.server
```

Lalu buka alamat yang ditampilkan di browser desktop atau phone. Tanpa build step, tanpa network.

## Fitur

- Tambah, edit, dan hapus transaksi pemasukan dan pengeluaran
- 10 kategori transaksi: makan, transport, listrik, air, internet, belanja, pendidikan, kesehatan, hiburan, lain-lain
- Ringkasan bulanan: pemasukan, pengeluaran, dan sisa uang
- Chart pengeluaran per kategori
- Target anggaran per kategori dengan indikator tercapai atau terlampaui
- Kalkulator sisa uang berdasarkan pemasukan dan pengeluaran
- Data tersimpan otomatis di localStorage

## Data

Data contoh November 2026: gaji Rp8.500.000, total pemasukan Rp9.250.000, pengeluaran Rp6.125.000. Semua perubahan yang dibuat tersimpan lokal di browser dan tetap ada saat halaman dibuka kembali.
