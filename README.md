# MIS Business Intelligence Dashboard

A modern, high-fidelity Business Intelligence (BI) Dashboard designed to aggregate transaction logs, compute business metrics, and display insights through interactive charts.

---

## 📂 Repository Structure

The project directory is structured as follows:

```text
mis-bi-dashboard/
├── index.html                  # Main layout and page structure
├── README.md                   # Project documentation
├── assets/
│   ├── css/
│   │   └── style.css           # Custom variables, layout, glassmorphic styles
│   ├── js/
│   │   └── dashboard.js        # Data fetching, metric calculations, chart handling
│   └── images/                 # Project assets & images
└── data/
    └── transactions.json       # Mock transaction logs (JSON format)
```

---

## ⚡ Tech Stack & Libraries

1. **HTML5**: Structured semantic markup, standard viewport responsiveness.
2. **Vanilla CSS3**:
   - Modern Custom Properties (Variables) for theme switching.
   - Glassmorphism UI patterns (`backdrop-filter`).
   - Dynamic micro-animations & transitions.
   - CSS Grid & Flexbox responsive architecture.
3. **JavaScript (ES6+)**:
   - Asynchronous `fetch()` calls to load metrics data.
   - Data aggregation (Total Sales, Total Transactions, AOV, Success Rate).
   - Live query search, dynamic categories extraction, and status filters.
   - Client-side pagination.
4. **Chart.js (v4 CDN)**: Displays line charts for sales trends and doughnut charts for category share.

---

## 🚀 How to Run Locally

Because the dashboard retrieves data dynamically from `data/transactions.json` using JavaScript `fetch()`, modern web browsers will block requests made directly via the `file://` protocol due to **CORS (Cross-Origin Resource Sharing)** security constraints. 

You must run the dashboard using a local development server:

### Option 1: Python HTTP Server (Recommended)
Open your terminal inside the `mis-bi-dashboard/` folder and run:
```bash
python -m http.server 8000
```
Then, open your browser and navigate to: `http://localhost:8000`

### Option 2: Node.js (NPX)
If you have Node.js installed, run:
```bash
npx serve
```
Then, open your browser and navigate to the address shown in the terminal (usually `http://localhost:3000`).

### Option 3: VS Code Live Server
If you use VS Code, right-click `index.html` and select **"Open with Live Server"**.

---

## 🎨 Key UI Features

- **Dark & Light Mode Toggle**: Seamless, high-performance visual transition saved inside local storage.
- **Dynamic Metrics Tracker**: Instantly aggregates metrics dynamically based on the current filtered transaction list.
- **Search and Filters**: Filter data in real-time by transaction ID, customer name, transaction status, or product category.
- **Smooth Pagination**: Limits grid overload and renders table entries cleanly (5 rows per page).
