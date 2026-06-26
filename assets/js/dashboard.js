// Global State
let transactionsData = [];
let filteredTransactions = [];
let currentPage = 1;
const rowsPerPage = 5;

// Chart Instances & Configs
let trendChart = null;
let categoryChart = null;
let currentTrendType = 'line'; // default
let currentCatType = 'doughnut'; // default

// DOM Elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const tableBody = document.getElementById('table-body');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const paginationInfo = document.getElementById('pagination-info');

const txModal = document.getElementById('tx-modal');
const txForm = document.getElementById('tx-form');
const toastNotif = document.getElementById('toast-notif');
const toastText = document.getElementById('toast-text');
const toastIcon = document.getElementById('toast-icon');

// Currency Formatter (IDR)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Date Formatter
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initData();
  setupEventListeners();
});

// Theme Logic
function initTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  if (trendChart && categoryChart) {
    updateChartsTheme();
  }
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeToggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  } else {
    themeToggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  }
}

// Data Load with Persistence via localStorage
async function initData() {
  const localData = localStorage.getItem('dashboard_transactions');
  if (localData) {
    transactionsData = JSON.parse(localData);
    onDataLoaded();
  } else {
    try {
      const response = await fetch('./data/transactions.json');
      if (!response.ok) throw new Error('Network response was not ok');
      transactionsData = await response.json();
      saveDataToLocalStorage();
      onDataLoaded();
    } catch (error) {
      console.error('Error fetching data:', error);
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-danger);">Failed to load data. Make sure you are running a local server.</td></tr>`;
    }
  }
}

function saveDataToLocalStorage() {
  localStorage.setItem('dashboard_transactions', JSON.stringify(transactionsData));
}

function onDataLoaded() {
  filteredTransactions = [...transactionsData];
  populateFilters();
  calculateMetrics();
  renderTrendChart();
  renderCategoryChart();
  renderTable();
}

// Populate Category Filter dropdown dynamically
function populateFilters() {
  const currentSelection = categoryFilter.value;
  const categories = [...new Set(transactionsData.map(tx => tx.category))];
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  // Restore selection if still valid
  if (categories.includes(currentSelection)) {
    categoryFilter.value = currentSelection;
  }
}

// Calculate Dashboard Metrics
function calculateMetrics() {
  const successTransactions = transactionsData.filter(tx => tx.status === 'Success');
  
  const totalRevenue = successTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalCount = transactionsData.length;
  const aov = successTransactions.length > 0 ? (totalRevenue / successTransactions.length) : 0;
  const successRate = totalCount > 0 ? ((successTransactions.length / totalCount) * 100) : 0;
  
  document.getElementById('metric-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('metric-total-tx').textContent = totalCount;
  document.getElementById('metric-aov').textContent = formatCurrency(aov);
  document.getElementById('metric-success-rate').textContent = successRate.toFixed(1) + '%';
}

// Setup Event Listeners
function setupEventListeners() {
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });
}

// Filter and Search Logic
function applyFilters() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedCat = categoryFilter.value;
  const selectedStatus = statusFilter.value;
  
  filteredTransactions = transactionsData.filter(tx => {
    const matchSearch = tx.customer.toLowerCase().includes(searchQuery) || 
                        tx.id.toLowerCase().includes(searchQuery) ||
                        tx.category.toLowerCase().includes(searchQuery);
    const matchCat = selectedCat === '' || tx.category === selectedCat;
    const matchStatus = selectedStatus === '' || tx.status === selectedStatus;
    
    return matchSearch && matchCat && matchStatus;
  });
  
  currentPage = 1;
  renderTable();
  updateCharts();
}

// Reset Filters Functionality
function resetFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  statusFilter.value = '';
  applyFilters();
  showToast("Filters successfully cleared!");
}

// Render Transactions Table with Pagination & Deletion
function renderTable() {
  tableBody.innerHTML = '';
  
  if (filteredTransactions.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No transactions match your search/filters.</td></tr>`;
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    paginationInfo.textContent = 'Showing 0 to 0 of 0 entries';
    return;
  }
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredTransactions.length);
  const paginatedItems = filteredTransactions.slice(startIndex, endIndex);
  
  paginatedItems.forEach(tx => {
    const tr = document.createElement('tr');
    
    let statusClass = 'badge-success';
    if (tx.status === 'Pending') statusClass = 'badge-warning';
    if (tx.status === 'Failed') statusClass = 'badge-failed';
    
    tr.innerHTML = `
      <td style="font-weight: 600;">${tx.id}</td>
      <td>${formatDate(tx.date)}</td>
      <td style="font-weight: 500;">${tx.customer}</td>
      <td>${tx.category}</td>
      <td style="font-weight: 600;">${formatCurrency(tx.amount)}</td>
      <td><span class="badge ${statusClass}">${tx.status}</span></td>
      <td style="text-align: center;">
        <button class="action-btn" onclick="deleteTransaction('${tx.id}')" title="Hapus Transaksi">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
  
  // Update Pagination Controls
  prevPageBtn.disabled = (currentPage === 1);
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  nextPageBtn.disabled = (currentPage === totalPages || totalPages === 0);
  
  paginationInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${filteredTransactions.length} entries`;
}

// Modal lifecycle management
function openModal() {
  txModal.classList.add('active');
}

function closeModal() {
  txModal.classList.remove('active');
  txForm.reset();
}

// Add Transaction Functionality
function addTransaction(e) {
  e.preventDefault();
  
  const customerVal = document.getElementById('form-customer').value.trim();
  const categoryVal = document.getElementById('form-category').value;
  const amountVal = parseFloat(document.getElementById('form-amount').value);
  const paymentVal = document.getElementById('form-payment').value;
  const statusVal = document.getElementById('form-status').value;
  
  if (!customerVal || !categoryVal || isNaN(amountVal) || !paymentVal || !statusVal) {
    showToast("Harap isi semua inputan dengan benar!", true);
    return;
  }
  
  // Auto-generate ID: TX-(MaxID+1)
  let nextIdNum = 1001;
  if (transactionsData.length > 0) {
    const ids = transactionsData.map(tx => {
      const num = parseInt(tx.id.replace('TX-', ''));
      return isNaN(num) ? 0 : num;
    });
    nextIdNum = Math.max(...ids) + 1;
  }
  const generatedId = `TX-${nextIdNum}`;
  
  const newTx = {
    id: generatedId,
    date: new Date().toISOString(),
    customer: customerVal,
    category: categoryVal,
    amount: amountVal,
    status: statusVal,
    payment_method: paymentVal
  };
  
  transactionsData.unshift(newTx); // Add to the front of the list
  saveDataToLocalStorage();
  
  closeModal();
  populateFilters();
  calculateMetrics();
  applyFilters();
  showToast(`Transaksi ${generatedId} berhasil ditambahkan!`);
}

// Delete Transaction Functionality
function deleteTransaction(id) {
  if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${id}?`)) {
    transactionsData = transactionsData.filter(tx => tx.id !== id);
    saveDataToLocalStorage();
    populateFilters();
    calculateMetrics();
    applyFilters();
    showToast(`Transaksi ${id} berhasil dihapus!`);
  }
}

// Export Filtered Data to CSV
function exportToCSV() {
  if (filteredTransactions.length === 0) {
    showToast("Tidak ada data transaksi untuk diekspor!", true);
    return;
  }
  
  const headers = ['ID Transaksi', 'Tanggal', 'Nama Customer', 'Kategori', 'Nominal (IDR)', 'Status', 'Metode Pembayaran'];
  const csvRows = [headers.join(',')];
  
  filteredTransactions.forEach(tx => {
    const row = [
      tx.id,
      tx.date,
      `"${tx.customer.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount,
      tx.status,
      tx.payment_method
    ];
    csvRows.push(row.join(','));
  });
  
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", encodedUri);
  downloadLink.setAttribute("download", `transactions_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(downloadLink);
  
  downloadLink.click();
  document.body.removeChild(downloadLink);
  showToast("Data transaksi berhasil diekspor ke CSV!");
}

// Render Sales Trend Chart with custom types (Line / Bar)
function renderTrendChart() {
  const theme = document.documentElement.getAttribute('data-theme');
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  
  const salesByDate = {};
  filteredTransactions
    .filter(tx => tx.status === 'Success')
    .forEach(tx => {
      const date = tx.date.split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + tx.amount;
    });
    
  const sortedDates = Object.keys(salesByDate).sort();
  const salesAmounts = sortedDates.map(date => salesByDate[date]);
  
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  
  if (trendChart) {
    trendChart.destroy();
  }
  
  trendChart = new Chart(trendCtx, {
    type: currentTrendType,
    data: {
      labels: sortedDates.map(d => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`;
      }),
      datasets: [{
        label: 'Sales Revenue (IDR)',
        data: salesAmounts,
        borderColor: '#6366f1',
        backgroundColor: currentTrendType === 'line' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.8)',
        borderWidth: currentTrendType === 'line' ? 3 : 0,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: value => formatCurrency(value).replace(',00', '')
          }
        }
      }
    }
  });
}

// Toggle Trend Chart Type (Line / Bar)
function toggleTrendChartType(type) {
  if (currentTrendType === type) return;
  currentTrendType = type;
  
  document.getElementById('btn-trend-line').classList.toggle('active', type === 'line');
  document.getElementById('btn-trend-bar').classList.toggle('active', type === 'bar');
  
  renderTrendChart();
}

// Render Category Doughnut / Polar chart
function renderCategoryChart() {
  const theme = document.documentElement.getAttribute('data-theme');
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  
  const revenueByCategory = {};
  filteredTransactions
    .filter(tx => tx.status === 'Success')
    .forEach(tx => {
      revenueByCategory[tx.category] = (revenueByCategory[tx.category] || 0) + tx.amount;
    });
    
  const categories = Object.keys(revenueByCategory);
  const categoryAmounts = categories.map(cat => revenueByCategory[cat]);
  
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  
  if (categoryChart) {
    categoryChart.destroy();
  }
  
  categoryChart = new Chart(categoryCtx, {
    type: currentCatType,
    data: {
      labels: categories,
      datasets: [{
        data: categoryAmounts,
        backgroundColor: [
          '#6366f1', // Primary
          '#06b6d4', // Secondary
          '#10b981', // Success
          '#f59e0b', // Warning
          '#ef4444'  // Danger
        ],
        borderWidth: currentCatType === 'doughnut' ? 0 : 1,
        borderColor: theme === 'dark' ? '#111827' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 10,
            font: { size: 10 }
          }
        }
      },
      cutout: currentCatType === 'doughnut' ? '70%' : undefined,
      scales: currentCatType === 'polarArea' ? {
        r: {
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          ticks: { display: false }
        }
      } : undefined
    }
  });
}

// Toggle Category Chart Type (Doughnut / PolarArea)
function toggleCatChartType(type) {
  if (currentCatType === type) return;
  currentCatType = type;
  
  document.getElementById('btn-cat-doughnut').classList.toggle('active', type === 'doughnut');
  document.getElementById('btn-cat-polar').classList.toggle('active', type === 'polarArea');
  
  renderCategoryChart();
}

// Update charts with filtered data
function updateCharts() {
  renderTrendChart();
  renderCategoryChart();
}

// Update charts styles for dark / light theme toggle
function updateChartsTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  
  if (trendChart) {
    trendChart.options.scales.x.ticks.color = textColor;
    trendChart.options.scales.x.grid.color = gridColor;
    trendChart.options.scales.y.ticks.color = textColor;
    trendChart.options.scales.y.grid.color = gridColor;
    trendChart.update();
  }
  
  if (categoryChart) {
    categoryChart.options.plugins.legend.labels.color = textColor;
    if (categoryChart.options.scales && categoryChart.options.scales.r) {
      categoryChart.options.scales.r.grid.color = gridColor;
      categoryChart.options.scales.r.angleLines.color = gridColor;
    }
    categoryChart.update();
  }
}

// Toast Alert System
function showToast(message, isError = false) {
  toastText.textContent = message;
  
  if (isError) {
    toastNotif.classList.add('toast-danger');
    toastIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>`;
    toastIcon.style.color = 'var(--color-danger)';
    toastIcon.style.backgroundColor = 'var(--color-danger-bg)';
  } else {
    toastNotif.classList.remove('toast-danger');
    toastIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`;
    toastIcon.style.color = 'var(--color-success)';
    toastIcon.style.backgroundColor = 'var(--color-success-bg)';
  }
  
  toastNotif.classList.add('active');
  
  setTimeout(() => {
    toastNotif.classList.remove('active');
  }, 3500);
}
