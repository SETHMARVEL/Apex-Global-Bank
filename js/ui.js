/**
 * Apex Bank - UI Controller, View Routing, Modals, Toasts & Financial Calculator
 */

function initUI() {
  renderProfileInfo();
  renderNetWorthBanner();
  renderAccountsGrid();
  renderTransactionsList();
  renderGoalsList();
  renderBillsList();
  renderNotifications();
  setupLoanCalculator();
  setupModals();
  setupTheme();
  setupNavigation();
  setupAnalyticsChart();
}

// Format currency with privacy masking support
function formatCurrency(amount, currency = 'USD') {
  if (window.bankStore.state.isPrivacyMasked) {
    return '••••••••';
  }
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Render active profile info across headers and footers
function renderProfileInfo() {
  const profile = window.bankStore.getActiveProfile();
  if (!profile) return;

  const nameEls = document.querySelectorAll('.user-name-display');
  const tierEls = document.querySelectorAll('.user-tier-display');
  const avatarEls = document.querySelectorAll('.user-avatar-display');

  nameEls.forEach(el => el.textContent = profile.name);
  tierEls.forEach(el => el.textContent = profile.tier);
  avatarEls.forEach(el => {
    if (el.tagName === 'IMG') el.src = profile.avatar;
  });
}

// Render top Net Worth banner
function renderNetWorthBanner() {
  const total = window.bankStore.getTotalBalance();
  const amountEl = document.getElementById('totalNetWorthDisplay');
  const eyeIcon = document.getElementById('privacyEyeIcon');

  if (amountEl) {
    amountEl.textContent = formatCurrency(total);
    if (window.bankStore.state.isPrivacyMasked) {
      amountEl.classList.add('privacy-masked');
    } else {
      amountEl.classList.remove('privacy-masked');
    }
  }

  if (eyeIcon) {
    eyeIcon.innerHTML = window.bankStore.state.isPrivacyMasked
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
           <line x1="1" y1="1" x2="23" y2="23"></line>
         </svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
           <circle cx="12" cy="12" r="3"></circle>
         </svg>`;
  }
}

// Render mini account cards in Dashboard
function renderAccountsGrid() {
  const container = document.getElementById('accountsSubgridContainer');
  if (!container) return;

  const profile = window.bankStore.getActiveProfile();
  if (!profile || !profile.accounts) return;

  container.innerHTML = profile.accounts.map((acc, index) => `
    <div class="account-card-mini ${index === 0 ? 'featured' : ''}" data-acc-id="${acc.id}">
      <div class="acc-type">${acc.name}</div>
      <div class="acc-number">${acc.number}</div>
      <div class="acc-balance">${formatCurrency(acc.balance)}</div>
      <div class="acc-apy">${acc.apy}</div>
    </div>
  `).join('');
}

// Render dynamic transactions list with search & category filters
let currentFilterCategory = 'all';
let currentFilterType = 'all';
let currentSearchTerm = '';

function renderTransactionsList() {
  const container = document.getElementById('recentTransactionsList');
  if (!container) return;

  let txs = window.bankStore.state.transactions.filter(
    t => t.profileId === window.bankStore.state.activeProfileId
  );

  // Apply filters
  if (currentFilterCategory !== 'all') {
    txs = txs.filter(t => t.category.toLowerCase().includes(currentFilterCategory.toLowerCase()));
  }

  if (currentFilterType !== 'all') {
    txs = txs.filter(t => t.type === currentFilterType);
  }

  if (currentSearchTerm) {
    const term = currentSearchTerm.toLowerCase();
    txs = txs.filter(t =>
      t.merchant.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      (t.note && t.note.toLowerCase().includes(term))
    );
  }

  if (txs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
        <p>No transactions match your search or filter criteria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = txs.map(t => {
    const isCredit = t.type === 'credit';
    const amountClass = isCredit ? 'credit' : 'debit';
    const amountSign = isCredit ? '+' : '-';

    return `
      <div class="transaction-item" data-tx-id="${t.id}">
        <div class="tx-icon-box" style="background: ${isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.06)'};">
          ${t.icon || (isCredit ? '📥' : '📤')}
        </div>
        <div class="tx-details">
          <div class="tx-merchant">${t.merchant}</div>
          <div class="tx-meta">
            <span>${t.date}</span>
            <span>•</span>
            <span class="tx-category-badge">${t.category}</span>
          </div>
        </div>
        <div class="tx-amount-col">
          <div class="tx-amount ${amountClass}">${amountSign}${formatCurrency(t.amount)}</div>
          <div class="tx-status-badge">${t.status}</div>
        </div>
      </div>
    `;
  }).join('');

  // Attach transaction click to view receipt
  container.querySelectorAll('.transaction-item').forEach(el => {
    el.addEventListener('click', () => {
      const txId = el.dataset.txId;
      const tx = window.bankStore.state.transactions.find(t => t.id === txId);
      if (tx) {
        window.transfersModule?.showReceipt(tx, 0);
      }
    });
  });
}

// Goals / Vaults view
function renderGoalsList() {
  const container = document.getElementById('goalsListContainer');
  if (!container) return;

  const goals = window.bankStore.state.goals.filter(
    g => g.profileId === window.bankStore.state.activeProfileId
  );

  if (goals.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); padding: 20px;">No active savings goals found. Create your first goal below!</p>
    `;
    return;
  }

  container.innerHTML = goals.map(g => {
    const progressPercent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
    return `
      <div class="goal-card" data-goal-id="${g.id}">
        <div class="goal-header">
          <div class="goal-title-wrap">
            <div class="goal-icon-box">${g.icon}</div>
            <div>
              <div class="goal-name">${g.name}</div>
              <div class="goal-target-date">Target: ${g.targetDate}</div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-emerald contribute-goal-btn" data-id="${g.id}">
            + Deposit
          </button>
        </div>

        <div class="goal-progress-bar-bg">
          <div class="goal-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <div class="goal-amounts-row">
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Current Saved</div>
            <div class="goal-current-amount">${formatCurrency(g.currentAmount)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--text-muted);">${progressPercent}% of Goal</div>
            <div style="font-weight: 700; color: var(--text-secondary);">${formatCurrency(g.targetAmount)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach contribute button
  container.querySelectorAll('.contribute-goal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const goalId = btn.dataset.id;
      const goal = window.bankStore.state.goals.find(g => g.id === goalId);
      if (goal) {
        document.getElementById('depositGoalId').value = goal.id;
        document.getElementById('depositGoalNameDisplay').textContent = goal.name;
        window.openModal('contributeGoalModal');
      }
    });
  });
}

// Bills List view
function renderBillsList() {
  const container = document.getElementById('billsListContainer');
  if (!container) return;

  const bills = window.bankStore.state.bills;

  container.innerHTML = bills.map(b => `
    <div class="transaction-item" style="justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="tx-icon-box" style="background: rgba(99, 102, 241, 0.15); color: #818CF8; font-weight: 800;">
          ${b.logoText}
        </div>
        <div>
          <div class="tx-merchant">${b.provider}</div>
          <div class="tx-meta">
            <span class="tx-category-badge">${b.category}</span>
            <span>•</span>
            <span style="color: ${b.isPaid ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">${b.dueDate}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="text-align: right;">
          <div class="tx-amount debit">$${b.amount.toFixed(2)}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${b.autoPay ? 'Auto-Pay Active' : 'Manual'}</div>
        </div>
        ${b.isPaid
          ? `<span class="btn btn-sm btn-secondary" style="color: var(--accent-emerald); cursor: default;">✓ Paid</span>`
          : `<button class="btn btn-sm btn-primary pay-bill-btn" data-bill-id="${b.id}">Pay Now</button>`
        }
      </div>
    </div>
  `).join('');

  // Attach Pay Bill buttons
  container.querySelectorAll('.pay-bill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const billId = btn.dataset.billId;
      try {
        const tx = window.bankStore.payBill(billId);
        window.showToast?.(`Bill paid successfully: $${tx.amount.toFixed(2)}`, 'success');
      } catch (err) {
        window.showToast?.(err.message, 'error');
      }
    });
  });
}

// Notifications drawer
function renderNotifications() {
  const badgeEl = document.getElementById('notificationCountBadge');
  const container = document.getElementById('notificationsDrawerList');
  const unreadCount = window.bankStore.getUnreadNotificationsCount();

  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.style.display = 'block';
      badgeEl.textContent = unreadCount;
    } else {
      badgeEl.style.display = 'none';
    }
  }

  if (container) {
    const list = window.bankStore.state.notifications;
    if (list.length === 0) {
      container.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align: center;">No notifications right now.</p>';
      return;
    }

    container.innerHTML = list.map(n => `
      <div style="padding: 14px 18px; border-bottom: 1px solid var(--border-color); ${n.read ? 'opacity: 0.75;' : 'background: rgba(16, 185, 129, 0.05);'}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h5 style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">${n.title}</h5>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${n.time}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${n.message}</p>
      </div>
    `).join('');
  }
}

// Loan / Mortgage Calculator
function setupLoanCalculator() {
  const amountSlider = document.getElementById('loanAmountSlider');
  const rateSlider = document.getElementById('loanRateSlider');
  const termSlider = document.getElementById('loanTermSlider');

  const amountDisplay = document.getElementById('calcLoanAmountDisplay');
  const rateDisplay = document.getElementById('calcLoanRateDisplay');
  const termDisplay = document.getElementById('calcLoanTermDisplay');

  const monthlyPaymentDisplay = document.getElementById('calcMonthlyPaymentResult');
  const totalInterestDisplay = document.getElementById('calcTotalInterestResult');
  const totalRepaymentDisplay = document.getElementById('calcTotalRepaymentResult');

  const calculateLoan = () => {
    if (!amountSlider || !rateSlider || !termSlider) return;

    const principal = parseFloat(amountSlider.value);
    const annualRate = parseFloat(rateSlider.value) / 100;
    const years = parseInt(termSlider.value);
    const months = years * 12;

    amountDisplay.textContent = `$${principal.toLocaleString()}`;
    rateDisplay.textContent = `${rateSlider.value}%`;
    termDisplay.textContent = `${years} Years (${months} mos)`;

    // Monthly interest calculation
    const monthlyRate = annualRate / 12;
    let monthlyPayment = 0;

    if (monthlyRate > 0) {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    } else {
      monthlyPayment = principal / months;
    }

    const totalRepayment = monthlyPayment * months;
    const totalInterest = totalRepayment - principal;

    if (monthlyPaymentDisplay) monthlyPaymentDisplay.textContent = `$${monthlyPayment.toFixed(2)}`;
    if (totalInterestDisplay) totalInterestDisplay.textContent = `$${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalRepaymentDisplay) totalRepaymentDisplay.textContent = `$${totalRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  [amountSlider, rateSlider, termSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', calculateLoan);
    }
  });

  calculateLoan();
}

// Navigation between views
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const viewSections = document.querySelectorAll('.view-section');
  const pageTitle = document.getElementById('currentPageTitle');
  const pageSubtitle = document.getElementById('currentPageSubtitle');

  const viewMeta = {
    dashboard: { title: 'Financial Overview', sub: 'Welcome back to your premier command center' },
    transfers: { title: 'Transfers & Payments', sub: 'Domestic, international wires, and instant Apex Pay' },
    cards: { title: 'Card Management', sub: 'Manage physical metal, virtual single-use, and travel cards' },
    goals: { title: 'Vaults & Goals', sub: 'Smart automated savings targets & emergency funds' },
    bills: { title: 'Bill Pay & Subscriptions', sub: 'Automate utilities, telecom, and enterprise subscriptions' },
    loans: { title: 'Financing & Loan Calculator', sub: 'Institutional rates, mortgage, and line of credit simulator' },
    analytics: { title: 'Spend Analytics', sub: 'Visual monthly cash flow and expenditure breakdown' },
    security: { title: 'Security & Profile Hub', sub: '2FA authentication, multi-profile switcher & bank statements' }
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.dataset.view;

      // Update sidebar active class
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update view sections
      viewSections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === `view_${targetView}`) {
          sec.classList.add('active');
        }
      });

      // Update Header Text
      if (viewMeta[targetView]) {
        if (pageTitle) pageTitle.textContent = viewMeta[targetView].title;
        if (pageSubtitle) pageSubtitle.textContent = viewMeta[targetView].sub;
      }

      // Close mobile drawer if opened
      document.querySelector('.sidebar')?.classList.remove('open');
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggleBtn');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
    });
  }

  // Quick Action Buttons on Dashboard linking to views
  document.querySelectorAll('[data-goto-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = btn.dataset.gotoView;
      const targetNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
      if (targetNav) targetNav.click();
    });
  });

  // Privacy mask toggle
  const privacyBtn = document.getElementById('privacyToggleBtn');
  if (privacyBtn) {
    privacyBtn.addEventListener('click', () => {
      window.bankStore.togglePrivacyMask();
      renderNetWorthBanner();
      renderAccountsGrid();
      renderTransactionsList();
      window.cardsModule?.render();
    });
  }

  // Profile switch trigger
  const profileBadge = document.getElementById('sidebarProfileBadge');
  if (profileBadge) {
    profileBadge.addEventListener('click', () => {
      window.openModal('profileSwitcherModal');
    });
  }

  // Transaction Search & Filter Bar
  const searchInput = document.getElementById('txSearchInput');
  const catSelect = document.getElementById('txCategorySelect');
  const typeSelect = document.getElementById('txTypeSelect');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      renderTransactionsList();
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      currentFilterCategory = e.target.value;
      renderTransactionsList();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentFilterType = e.target.value;
      renderTransactionsList();
    });
  }

  // Notifications Bell Button
  const notifBtn = document.getElementById('headerNotificationsBtn');
  const notifModal = document.getElementById('notificationsModal');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      window.openModal('notificationsModal');
      window.bankStore.markAllNotificationsRead();
      renderNotifications();
    });
  }

  // Contribute Goal Form
  const contributeForm = document.getElementById('contributeGoalForm');
  if (contributeForm) {
    contributeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = document.getElementById('depositGoalId').value;
      const amount = parseFloat(document.getElementById('depositGoalAmount').value);

      if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid deposit amount', 'error');
        return;
      }

      try {
        const goal = window.bankStore.contributeToGoal(goalId, amount);
        window.closeModal('contributeGoalModal');
        showToast(`Deposited $${amount.toFixed(2)} into ${goal.name}!`, 'success');
        document.getElementById('depositGoalAmount').value = '';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Create Goal Form
  const newGoalForm = document.getElementById('createNewGoalForm');
  if (newGoalForm) {
    newGoalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newGoalName').value.trim();
      const targetAmount = document.getElementById('newGoalTargetAmount').value;
      const targetDate = document.getElementById('newGoalTargetDate').value;
      const icon = document.getElementById('newGoalIcon').value || '🎯';

      if (!name || !targetAmount) {
        showToast('Please specify goal title and target amount', 'error');
        return;
      }

      window.bankStore.createGoal({
        name,
        targetAmount,
        targetDate,
        icon
      });

      window.closeModal('newGoalModal');
      showToast(`Savings goal "${name}" created!`, 'success');
      renderGoalsList();
    });
  }

  // Reset Data Button
  const resetBtn = document.getElementById('resetAllDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all demo banking data back to factory default?')) {
        window.bankStore.resetAllData();
        showToast('Demo data restored to default state', 'info');
      }
    });
  }
}

// Modal System
function setupModals() {
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Clicking backdrop closes modal
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Profile switcher buttons inside modal
  document.querySelectorAll('.select-profile-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const profileId = btn.dataset.profileId;
      window.bankStore.setActiveProfile(profileId);
      window.closeModal('profileSwitcherModal');
      showToast(`Switched account to ${window.bankStore.getActiveProfile().name}`, 'success');
    });
  });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

// Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icon}</span>
    <span style="font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

// Theme handling
function setupTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="5"></circle>
             <line x1="12" y1="1" x2="12" y2="3"></line>
             <line x1="12" y1="21" x2="12" y2="23"></line>
             <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
             <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
             <line x1="1" y1="12" x2="3" y2="12"></line>
             <line x1="21" y1="12" x2="23" y2="12"></line>
             <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
             <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
           </svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
           </svg>`;
    }
  };

  applyTheme(window.bankStore.state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = window.bankStore.toggleTheme();
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });
  }
}

// Spend Analytics Chart (graceful Canvas fallback)
function setupAnalyticsChart() {
  const canvas = document.getElementById('spendingTrendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Simple clean high-DPI canvas render
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth;
  const height = 220;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const incomeData = [4800, 5200, 5100, 6400, 5900, 7150];
  const expenseData = [3100, 2900, 3800, 3200, 3600, 3420];

  const maxVal = 8000;
  const chartHeight = height - 50;
  const chartWidth = width - 40;
  const stepX = chartWidth / (months.length - 1);

  // Background grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
  }

  // Draw Line helper
  const drawLine = (data, color, fillColor) => {
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = 30 + i * stepX;
      const y = 20 + chartHeight - (val / maxVal) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Area fill
    ctx.lineTo(30 + (data.length - 1) * stepX, 20 + chartHeight);
    ctx.lineTo(30, 20 + chartHeight);
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Draw Points
    data.forEach((val, i) => {
      const x = 30 + i * stepX;
      const y = 20 + chartHeight - (val / maxVal) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0F172A';
      ctx.stroke();
    });
  };

  // Draw Expense line
  drawLine(expenseData, '#06B6D4', 'rgba(6, 182, 212, 0.08)');
  // Draw Income line
  drawLine(incomeData, '#10B981', 'rgba(16, 185, 129, 0.15)');

  // Month labels
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  months.forEach((m, i) => {
    ctx.fillText(m, 30 + i * stepX, height - 10);
  });
}

// Global UI exports
window.uiModule = {
  init: initUI,
  renderProfile: renderProfileInfo,
  renderNetWorth: renderNetWorthBanner,
  renderAccounts: renderAccountsGrid,
  renderTransactions: renderTransactionsList,
  renderGoals: renderGoalsList,
  renderBills: renderBillsList,
  renderNotifications: renderNotifications,
  formatCurrency
};

window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
