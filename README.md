# Management Information System - Business Intelligence Dashboard (MIS-BI Dashboard)

Sebuah dashboard analitik bisnis premium yang dibangun dengan HTML, CSS Vanilla, dan Javascript. Aplikasi ini dirancang untuk menyajikan data metrik finansial, tren penjualan, dan distribusi kategori produk secara real-time.

## Struktur Repositori

Repositori ini diatur dengan struktur berikut:
```
mis-bi-dashboard/
├── index.html
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── dashboard.js
│   └── images/
└── data/
    └── transactions.json
```

## Fitur Utama

1. **Visualisasi Data Dinamis**: Menampilkan grafik tren pendapatan harian (Line Chart) dan pembagian kategori penjualan (Doughnut Chart) menggunakan **Chart.js**.
2. **Indikator Metrik (KPIs)**: Perhitungan otomatis untuk *Total Revenue*, *Sales Volume*, *Average Ticket Value*, dan *Success Rate*.
3. **Penyaringan Lanjutan**: Cari data transaksi berdasarkan ID atau nama pelanggan, serta saring berdasarkan kategori barang dan status transaksi (*Completed*, *Pending*, *Failed*).
4. **Desain Premium Modern**: Layout responsif (mendukung Mobile & Desktop) dengan estetika *dark-mode* dan efek *glassmorphism*.
5. **Animasi Halus**: Dilengkapi dengan mikro-animasi pada tombol, baris tabel, serta animasi perhitungan angka (*count-up*) pada KPI card.

## Teknologi yang Digunakan

* **Struktur & Tata Letak**: HTML5 Semantic
* **Styling**: Vanilla CSS (dengan Grid & Flexbox, CSS Variables, Backdrop filters)
* **Logika Aplikasi**: Javascript ES6 (Fetch API, Array processing, Animations)
* **Grafik & Visual**: [Chart.js (v4.4.x via CDN)](https://www.chartjs.org/)
* **Ikonografi**: [Lucide Icons (via CDN)](https://lucide.dev/)

## Cara Menjalankan Project

Karena aplikasi ini melakukan request data lokal dari file JSON (`data/transactions.json`) menggunakan `fetch()`, web browser memerlukan protokol server (`http://` atau `https://`) untuk menghindari pembatasan keamanan CORS (`file://`).

Anda dapat menjalankannya dengan salah satu metode berikut:

### Metode 1: Menggunakan Extension VS Code (Live Server)
1. Buka folder `mis-bi-dashboard` di VS Code.
2. Instal ekstensi **Live Server** (oleh ritwickdey).
3. Klik tombol **Go Live** di pojok kanan bawah editor VS Code Anda.

### Metode 2: Menggunakan Python HTTP Server
Jika Anda memiliki Python yang terinstal di komputer:
1. Buka Command Prompt / PowerShell.
2. Navigasikan ke dalam direktori project:
   ```bash
   cd mis-bi-dashboard
   ```
3. Jalankan server lokal:
   ```bash
   python -m http.server 8000
   ```
4. Buka browser dan kunjungi `http://localhost:8000`.

### Metode 3: Menggunakan Node.js (npx)
Jika Anda memiliki Node.js terinstal:
1. Buka terminal Anda.
2. Navigasikan ke direktori project.
3. Jalankan server sederhana:
   ```bash
   npx serve .
   ```
4. Buka URL yang diberikan di terminal (biasanya `http://localhost:3000` atau `http://localhost:5000`).
