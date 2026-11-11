/**
 * Unity Capital Bank - Money Movement, P2P Transfers & Optical Mobile Check Deposit
 */

const FX_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 153.80,
  CAD: 1.38,
  CHF: 0.89,
  AUD: 1.52,
  SGD: 1.34
};

function initTransfersModule() {
  renderBeneficiariesList();
  renderAccountDropdowns();
  setupTransferEventListeners();
  setupFxCalculator();
}

function renderBeneficiariesList() {
  const container = document.getElementById('beneficiariesScrollList');
  if (!container) return;

  const beneficiaries = window.bankStore.state.beneficiaries;

  container.innerHTML = `
    <!-- Add new button -->
    <div class="beneficiary-chip" id="openAddBeneficiaryBtn">
      <div class="beneficiary-avatar-wrap beneficiary-add-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <div class="beneficiary-name" style="color: var(--accent-emerald);">Add New</div>
    </div>

    ${beneficiaries.map(b => `
      <div class="beneficiary-chip select-beneficiary-item" data-id="${b.id}" data-name="${b.name}" data-handle="${b.handle}">
        <div class="beneficiary-avatar-wrap">
          <img src="${b.avatar}" alt="${b.name}" />
        </div>
        <div class="beneficiary-name">${b.name}</div>
      </div>
    `).join('')}
  `;

  // Attach click to select
  container.querySelectorAll('.select-beneficiary-item').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.name;
      const handle = el.dataset.handle;
      const p2pRecipientInput = document.getElementById('p2pRecipientInput');
      if (p2pRecipientInput) {
        p2pRecipientInput.value = handle || name;
        window.showToast?.(`Selected recipient: ${name}`, 'info');
      }
      // If not on P2P tab, switch to it
      const p2pTabBtn = document.querySelector('[data-transfer-type="p2p"]');
      if (p2pTabBtn) p2pTabBtn.click();
    });
  });

  const addBtn = document.getElementById('openAddBeneficiaryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.openModal?.('addBeneficiaryModal');
    });
  }
}

function renderAccountDropdowns() {
  const profile = window.bankStore.getActiveProfile();
  const sourceDropdown = document.getElementById('transferSourceAccount');
  const internalDestDropdown = document.getElementById('transferInternalDestAccount');
  const depositAccDropdown = document.getElementById('depositTargetAccount');

  if (!profile || !profile.accounts) return;

  const optionsHtml = profile.accounts.map(acc => `
    <option value="${acc.id}">
      ${acc.name} (${acc.number}) — $${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </option>
  `).join('');

  if (sourceDropdown) sourceDropdown.innerHTML = optionsHtml;
  if (internalDestDropdown) {
    // Exclude first or provide sensible default
    internalDestDropdown.innerHTML = profile.accounts.map((acc, i) => `
      <option value="${acc.id}" ${i === 1 ? 'selected' : ''}>
        ${acc.name} (${acc.number})
      </option>
    `).join('');
  }
  if (depositAccDropdown) depositAccDropdown.innerHTML = optionsHtml;
}

function setupTransferEventListeners() {
  // Tab switching inside transfer card
  const tabBtns = document.querySelectorAll('.transfer-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const transferType = btn.dataset.transferType;
      document.querySelectorAll('.transfer-type-content').forEach(panel => {
        panel.style.display = 'none';
      });

      const activePanel = document.getElementById(`transferPanel_${transferType}`);
      if (activePanel) activePanel.style.display = 'block';
    });
  });

  // Transfer Submit Form
  const transferForm = document.getElementById('sendMoneyForm');
  if (transferForm) {
    transferForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fromAccId = document.getElementById('transferSourceAccount').value;
      const activeTab = document.querySelector('.transfer-tab-btn.active')?.dataset.transferType || 'p2p';
      const amount = parseFloat(document.getElementById('transferAmountInput').value);
      const note = document.getElementById('transferNoteInput')?.value || '';

      if (isNaN(amount) || amount <= 0) {
        window.showToast?.('Please enter a valid transfer amount', 'error');
        return;
      }

      let recipientInfo = '';
      let toAccId = null;
      let fee = 0;

      if (activeTab === 'internal') {
        toAccId = document.getElementById('transferInternalDestAccount').value;
        if (fromAccId === toAccId) {
          window.showToast?.('Cannot transfer to the same account', 'error');
          return;
        }
      } else if (activeTab === 'p2p') {
        const handle = document.getElementById('p2pRecipientInput').value.trim();
        if (!handle) {
          window.showToast?.('Please specify a recipient email, phone, or handle', 'error');
          return;
        }
        recipientInfo = { name: handle };
      } else if (activeTab === 'wire') {
        const wireName = document.getElementById('wireRecipientName').value.trim();
        const wireRouting = document.getElementById('wireRoutingNumber').value.trim();
        const wireAccount = document.getElementById('wireAccountNumber').value.trim();
        if (!wireName || !wireRouting || !wireAccount) {
          window.showToast?.('Please complete all domestic wire bank fields', 'error');
          return;
        }
        recipientInfo = { name: `${wireName} (Acct ···${wireAccount.slice(-4)})` };
        fee = 15.00; // Standard domestic wire fee
      } else if (activeTab === 'fx') {
        const iban = document.getElementById('fxIbanInput').value.trim();
        const swift = document.getElementById('fxSwiftInput').value.trim();
        const currency = document.getElementById('fxCurrencySelect').value;
        if (!iban || !swift) {
          window.showToast?.('Please specify IBAN and SWIFT/BIC codes', 'error');
          return;
        }
        recipientInfo = { name: `SWIFT: ${swift} (${currency})` };
        fee = 5.00;
      }

      try {
        const newTx = window.bankStore.executeTransfer({
          fromAccId,
          toType: activeTab,
          toAccId,
          recipient: recipientInfo,
          amount,
          note,
          fee
        });

        // Trigger celebratory confetti if available
        if (window.confetti) {
          window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }

        // Show receipt
        showDigitalReceipt(newTx, fee);

        // Reset form inputs
        document.getElementById('transferAmountInput').value = '';
        document.getElementById('transferNoteInput').value = '';
        renderAccountDropdowns();
      } catch (err) {
        window.showToast?.(err.message, 'error');
      }
    });
  }

  // Add Beneficiary Form
  const addBeneficiaryForm = document.getElementById('addBeneficiaryForm');
  if (addBeneficiaryForm) {
    addBeneficiaryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newBenName').value.trim();
      const handle = document.getElementById('newBenHandle').value.trim();
      const bank = document.getElementById('newBenBank').value.trim();

      if (!name || !handle) {
        window.showToast?.('Please enter recipient name and handle', 'error');
        return;
      }

      window.bankStore.state.beneficiaries.push({
        id: 'ben_' + Date.now(),
        name,
        handle,
        bank: bank || 'External Bank',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        accountNum: '··· ' + Math.floor(1000 + Math.random() * 9000)
      });

      window.bankStore.saveState();
      window.closeModal?.('addBeneficiaryModal');
      renderBeneficiariesList();
      window.showToast?.(`Added ${name} to your frequent contacts!`, 'success');
    });
  }

  // Mobile Check Deposit Simulation
  setupCheckDepositCapture();
}

function setupCheckDepositCapture() {
  const checkFrontBox = document.getElementById('checkFrontBox');
  const checkBackBox = document.getElementById('checkBackBox');
  let frontCaptured = false;
  let backCaptured = false;

  const updateBoxState = (box, isFront) => {
    box.classList.add('captured');
    box.innerHTML = `
      <div style="font-size: 2rem;">✅</div>
      <div style="font-weight: 700; color: var(--accent-emerald);">
        Check ${isFront ? 'Front' : 'Back'} Captured & Endorsed
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">Optical character check: Valid (Click to retake)</div>
    `;
  };

  if (checkFrontBox) {
    checkFrontBox.addEventListener('click', () => {
      frontCaptured = true;
      updateBoxState(checkFrontBox, true);
      window.showToast?.('Front of check captured successfully', 'info');
    });
  }

  if (checkBackBox) {
    checkBackBox.addEventListener('click', () => {
      backCaptured = true;
      updateBoxState(checkBackBox, false);
      window.showToast?.('Back endorsement captured successfully', 'info');
    });
  }

  const depositForm = document.getElementById('mobileDepositForm');
  if (depositForm) {
    depositForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!frontCaptured || !backCaptured) {
        window.showToast?.('Please tap both boxes to capture check front and back', 'error');
        return;
      }

      const accId = document.getElementById('depositTargetAccount').value;
      const amount = parseFloat(document.getElementById('depositAmountInput').value);
      const checkNum = document.getElementById('depositCheckNumber').value || '84102';

      try {
        const tx = window.bankStore.depositCheck({
          accId,
          amount,
          checkNumber: checkNum
        });

        window.showToast?.(`Check #${checkNum} verified! +$${amount.toFixed(2)} credited`, 'success');
        window.closeModal?.('mobileCheckDepositModal');

        // Reset check state
        frontCaptured = false;
        backCaptured = false;
        if (checkFrontBox) checkFrontBox.innerHTML = `<span>📷 Click to scan front</span>`;
        if (checkBackBox) checkBackBox.innerHTML = `<span>📷 Click to scan back endorsement</span>`;
        document.getElementById('depositAmountInput').value = '';
      } catch (err) {
        window.showToast?.(err.message, 'error');
      }
    });
  }
}

function setupFxCalculator() {
  const fxAmountInput = document.getElementById('fxCalcAmount');
  const fxCurrencySelect = document.getElementById('fxCalcCurrency');
  const fxResultDisplay = document.getElementById('fxCalcResult');

  const updateFx = () => {
    if (!fxAmountInput || !fxCurrencySelect || !fxResultDisplay) return;
    const usd = parseFloat(fxAmountInput.value) || 0;
    const curr = fxCurrencySelect.value;
    const rate = FX_RATES[curr] || 1.0;
    const converted = usd * rate;

    fxResultDisplay.textContent = `${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${curr}`;
  };

  if (fxAmountInput) fxAmountInput.addEventListener('input', updateFx);
  if (fxCurrencySelect) fxCurrencySelect.addEventListener('change', updateFx);
  updateFx();
}

function showDigitalReceipt(transaction, fee = 0) {
  const modal = document.getElementById('digitalReceiptModal');
  const content = document.getElementById('digitalReceiptContent');
  if (!modal || !content) return;

  const profile = window.bankStore.getActiveProfile();
  const dateFormatted = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  content.innerHTML = `
    <div class="digital-receipt">
      <div class="receipt-header">
        <div class="receipt-logo">UNITY CAPITAL BANK</div>
        <div style="font-size: 0.75rem; color: #64748B; margin-bottom: 8px;">ELECTRONIC FUNDS TRANSFER ADVICE</div>
        <div class="receipt-badge">Completed & Verified</div>
      </div>

      <div class="receipt-row">
        <span style="color: #64748B;">Reference ID:</span>
        <span style="font-family: monospace; font-weight: 700;">#UCB-${transaction.id.replace('tx_', '')}</span>
      </div>

      <div class="receipt-row">
        <span style="color: #64748B;">Date & Timestamp:</span>
        <span style="font-weight: 600;">${dateFormatted}</span>
      </div>

      <div class="receipt-row">
        <span style="color: #64748B;">Sender:</span>
        <span style="font-weight: 600;">${profile.name}</span>
      </div>

      <div class="receipt-row">
        <span style="color: #64748B;">Recipient / Action:</span>
        <span style="font-weight: 600;">${transaction.merchant}</span>
      </div>

      <div class="receipt-row">
        <span style="color: #64748B;">Category:</span>
        <span style="font-weight: 600;">${transaction.category}</span>
      </div>

      <div class="receipt-row">
        <span style="color: #64748B;">Transfer Fee:</span>
        <span style="font-weight: 600;">${fee > 0 ? '$' + fee.toFixed(2) : 'Free ($0.00)'}</span>
      </div>

      <div class="receipt-row total">
        <span>Amount Transferred:</span>
        <span style="color: #059669;">$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div style="margin-top: 16px; font-size: 0.7rem; color: #94A3B8; text-align: center;">
        Unity Capital Bank, N.A. · FDIC Insured · 256-bit TLS Encrypted Transmission
      </div>
    </div>
  `;

  window.openModal?.('digitalReceiptModal');
}

// Export
window.transfersModule = {
  init: initTransfersModule,
  refreshDropdowns: renderAccountDropdowns,
  refreshBeneficiaries: renderBeneficiariesList,
  showReceipt: showDigitalReceipt
};
