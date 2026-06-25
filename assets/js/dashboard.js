document.addEventListener('DOMContentLoaded', () => {
  // Global variables to store transaction records
  let allTransactions = [];
  let salesChart = null;
  let categoryChart = null;

  // DOM Elements
  const totalRevenueEl = document.getElementById('total-revenue');
  const totalTxnsEl = document.getElementById('total-txns');
  const avgOrderEl = document.getElementById('avg-order');
  const successRateEl = document.getElementById('success-rate');
  
  const transactionsBody = document.getElementById('transactions-body');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const statusFilter = document.getElementById('status-filter');
  const refreshBtn = document.getElementById('refresh-btn');

  // Format currency helper (Rupiah IDR)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Fetch transactions data
  async function loadDashboardData() {
    try {
      showLoading();
      
      const response = await fetch('./data/transactions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      allTransactions = await response.json();
      
      // Sort transactions by date descending
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      updateDashboard();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      transactionsBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">
            Error loading data. Make sure you are running a local web server (e.g. Live Server).<br>
            <span style="font-size: 0.8rem; color: #f43f5e;">${error.message}</span>
          </td>
        </tr>
      `;
    }
  }

  function showLoading() {
    transactionsBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-row">Retrieving records, please wait...</td>
      </tr>
    `;
    totalRevenueEl.innerText = 'Rp --';
    totalTxnsEl.innerText = '--';
    avgOrderEl.innerText = 'Rp --';
    successRateEl.innerText = '--%';
  }

  // Calculate stats & render UI components
  function updateDashboard() {
    // 1. Calculate KPI Metrics
    const completedTxns = allTransactions.filter(t => t.status === 'Completed');
    const totalRevenue = completedTxns.reduce((sum, t) => sum + t.amount, 0);
    const txnCount = completedTxns.length;
    const avgOrderValue = txnCount > 0 ? totalRevenue / txnCount : 0;
    
    const successRate = allTransactions.length > 0 
      ? (completedTxns.length / allTransactions.length) * 100 
      : 0;

    // Update KPI Elements
    animateCountUp(totalRevenueEl, totalRevenue, true);
    animateCountUp(totalTxnsEl, txnCount, false);
    animateCountUp(avgOrderEl, avgOrderValue, true);
    animateCountUp(successRateEl, successRate, false, '%');

    // 2. Render Charts
    renderSalesTrendChart(completedTxns);
    renderCategoryDistributionChart(completedTxns);

    // 3. Render Table
    renderTable(allTransactions);
  }

  // Count up animation for indicators
  function animateCountUp(element, endVal, isCurrency = false, suffix = '') {
    let startVal = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const currentVal = startVal + (endVal - startVal) * easeProgress;

      if (isCurrency) {
        element.innerText = formatCurrency(currentVal);
      } else {
        element.innerText = Math.round(currentVal).toLocaleString('id-ID') + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        if (isCurrency) {
          element.innerText = formatCurrency(endVal);
        } else {
          element.innerText = Math.round(endVal).toLocaleString('id-ID') + suffix;
        }
      }
    }

    requestAnimationFrame(updateCount);
  }

  // Render Daily Sales Trend Chart (Line Chart)
  function renderSalesTrendChart(transactions) {
    // Group transaction values by date (YYYY-MM-DD)
    const salesByDate = {};
    
    // Sort transactions chronologically for the line chart
    const chronologicalTxns = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    chronologicalTxns.forEach(txn => {
      const dateStr = new Date(txn.date).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric'
      });
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + txn.amount;
    });

    const labels = Object.keys(salesByDate);
    const data = Object.values(salesByDate);

    if (salesChart) {
      salesChart.destroy();
    }

    const ctx = document.getElementById('sales-trend-chart').getContext('2d');
    
    // Gradient fill for line area
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: data,
          borderColor: '#8b5cf6',
          borderWidth: 3,
          pointBackgroundColor: '#8b5cf6',
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#fff',
          fill: true,
          backgroundColor: gradient,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return ' ' + formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'transparent'
            },
            ticks: {
              color: '#9ca3af',
              font: { family: 'Outfit', size: 11 }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'transparent'
            },
            ticks: {
              color: '#9ca3af',
              font: { family: 'Outfit', size: 11 },
              callback: function(value) {
                if (value >= 1e6) {
                  return 'Rp ' + (value / 1e6) + 'M';
                }
                return 'Rp ' + value.toLocaleString('id-ID');
              }
            }
          }
        }
      }
    });
  }

  // Render Product Category Distribution Chart (Doughnut Chart)
  function renderCategoryDistributionChart(transactions) {
    const categories = {};
    
    transactions.forEach(txn => {
      categories[txn.category] = (categories[txn.category] || 0) + txn.amount;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (categoryChart) {
      categoryChart.destroy();
    }

    const ctx = document.getElementById('category-chart').getContext('2d');
    
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#8b5cf6', // purple
            '#3b82f6', // blue
            '#14b8a6', // teal
            '#f59e0b', // orange
            '#f43f5e'  // rose
          ],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9ca3af',
              font: { family: 'Outfit', size: 12 },
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return ` ${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Render Transactions list inside the HTML Table
  function renderTable(transactions) {
    transactionsBody.innerHTML = '';

    if (transactions.length === 0) {
      transactionsBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">No transactions match the filter criteria.</td>
        </tr>
      `;
      return;
    }

    transactions.forEach(txn => {
      const row = document.createElement('tr');
      
      const formattedDate = new Date(txn.date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      row.innerHTML = `
        <td style="font-weight: 600; color: #fff;">${txn.id}</td>
        <td>${formattedDate}</td>
        <td>${txn.customer}</td>
        <td><span style="color: var(--text-secondary); font-size: 0.85rem;">${txn.category}</span></td>
        <td style="font-weight: 500;">${formatCurrency(txn.amount)}</td>
        <td><span class="status-badge ${txn.status.toLowerCase()}">${txn.status}</span></td>
      `;
      
      transactionsBody.appendChild(row);
    });
  }

  // Filtering and Searching event listener logic
  function filterAndSearchTransactions() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;

    const filtered = allTransactions.filter(txn => {
      const matchesSearch = txn.customer.toLowerCase().includes(searchQuery) || 
                            txn.id.toLowerCase().includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'All' || txn.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || txn.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    renderTable(filtered);
  }

  searchInput.addEventListener('input', filterAndSearchTransactions);
  categoryFilter.addEventListener('change', filterAndSearchTransactions);
  statusFilter.addEventListener('change', filterAndSearchTransactions);

  refreshBtn.addEventListener('click', () => {
    // Add rotational animation effect to refresh icon
    const icon = refreshBtn.querySelector('i');
    if (icon) {
      icon.style.transition = 'transform 0.5s ease';
      icon.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
      }, 500);
    }
    loadDashboardData();
  });

  // Init Data load
  loadDashboardData();
});
