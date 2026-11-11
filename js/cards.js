/**
 * Unity Capital Bank - Interactive 3D Cards Engine & Virtual Card Generator
 */

let activeCardIndex = 0;

function initCardsModule() {
  renderCardsSection();
  setupCardsEventListeners();
}

function getCards() {
  return window.bankStore.getActiveCards();
}

function renderCardsSection() {
  const cards = getCards();
  const showcaseContainer = document.getElementById('cardsShowcaseWrapper');
  const selectorContainer = document.getElementById('cardSelectorTabs');
  const controlsContainer = document.getElementById('cardControlsWrapper');

  if (!showcaseContainer || !selectorContainer || !controlsContainer) return;

  if (cards.length === 0) {
    showcaseContainer.innerHTML = '<p class="text-muted">No cards found for this account.</p>';
    return;
  }

  // Ensure valid index
  if (activeCardIndex >= cards.length) {
    activeCardIndex = 0;
  }

  const currentCard = cards[activeCardIndex];

  // Render selector tabs
  selectorContainer.innerHTML = cards.map((c, idx) => `
    <button class="btn btn-sm ${idx === activeCardIndex ? 'btn-primary' : 'btn-secondary'} card-tab-selector" data-index="${idx}">
      ${c.name}
    </button>
  `).join('');

  // Render 3D Card
  const isMasked = window.bankStore.state.isPrivacyMasked;
  const maskedCardNum = isMasked
    ? '•••• •••• •••• ' + currentCard.number.slice(-4)
    : currentCard.number;

  showcaseContainer.innerHTML = `
    <div class="credit-card-3d ${currentCard.isFrozen ? 'is-frozen' : ''}" id="interactiveCardElement">
      <!-- Frozen Overlay -->
      <div class="card-frozen-overlay">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>CARD TEMPORARILY FROZEN</span>
      </div>

      <!-- Front Face -->
      <div class="card-face card-face-front ${currentCard.theme}">
        <div class="card-top-row">
          <div class="card-chip"></div>
          <div class="card-contactless">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8.5 16.5a5 5 0 0 1 0-7"></path>
              <path d="M12 19a8.5 8.5 0 0 0 0-14"></path>
              <path d="M15.5 21.5a12 12 0 0 0 0-19"></path>
            </svg>
          </div>
        </div>

        <div class="card-number-display" id="cardNumberDisplay" title="Click to copy number">
          ${maskedCardNum}
        </div>

        <div class="card-bottom-row">
          <div>
            <div class="card-holder-label">Cardholder</div>
            <div class="card-holder-name">${currentCard.holder}</div>
          </div>
          <div>
            <div class="card-expiry-label">Expires</div>
            <div class="card-expiry-val">${currentCard.expiry}</div>
          </div>
          <div class="card-network-logo">${currentCard.network}</div>
        </div>
      </div>

      <!-- Back Face -->
      <div class="card-face card-face-back">
        <div class="card-mag-strip"></div>
        <div class="card-cvv-strip-row">
          <div style="font-size: 0.65rem; color: #94A3B8;">SECURITY CODE</div>
          <div class="card-white-bar">${isMasked ? '•••' : currentCard.cvv}</div>
        </div>
        <div class="card-disclaimer-text">
          Issued by Unity Capital Bank, N.A. Member FDIC. Use of this card is subject to the terms and conditions of the cardholder agreement. 24/7 Concierge: +1 (800) 555-UNITY.
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 14px;">
      <button class="btn btn-sm btn-secondary" id="flipCardActionBtn">
        🔄 Flip Card to ${document.getElementById('interactiveCardElement')?.classList.contains('flipped') ? 'Front' : 'Back (CVV)'}
      </button>
      <button class="btn btn-sm btn-secondary" id="copyCardNumBtn" style="margin-left: 8px;">
        📋 Copy Number
      </button>
    </div>
  `;

  // Render Controls Panel
  controlsContainer.innerHTML = `
    <div class="card-controls-panel">
      <!-- Freeze Card Switch -->
      <div class="control-toggle-row">
        <div class="control-info">
          <div class="quick-action-icon ${currentCard.isFrozen ? 'icon-cyan' : 'icon-emerald'}">
            🔒
          </div>
          <div class="control-text">
            <h4>Freeze Card Instantly</h4>
            <p>Block all new charges, ATM withdrawals, and digital wallet authorizations.</p>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" id="freezeCardToggle" ${currentCard.isFrozen ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <!-- Online Purchases -->
      <div class="control-toggle-row">
        <div class="control-info">
          <div class="quick-action-icon icon-blue">🌐</div>
          <div class="control-text">
            <h4>Online & E-Commerce Purchases</h4>
            <p>Allow card details to be entered on web checkouts and subscriptions.</p>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" id="onlinePurchasesToggle" ${currentCard.onlinePurchases ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <!-- International Usage -->
      <div class="control-toggle-row">
        <div class="control-info">
          <div class="quick-action-icon icon-purple">✈️</div>
          <div class="control-text">
            <h4>International Transactions</h4>
            <p>Zero foreign transaction fees applied when enabled.</p>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" id="intlUsageToggle" ${currentCard.internationalUsage ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <!-- Daily ATM Slider -->
      <div class="range-slider-wrapper">
        <div class="range-header">
          <span>Daily ATM Withdrawal Limit</span>
          <span style="color: var(--accent-emerald);" id="atmLimitValDisplay">$${currentCard.atmDailyLimit.toLocaleString()}</span>
        </div>
        <input type="range" class="range-slider-input" id="atmLimitSlider" min="200" max="5000" step="100" value="${currentCard.atmDailyLimit}">
      </div>

      <!-- Daily Online Slider -->
      <div class="range-slider-wrapper">
        <div class="range-header">
          <span>Daily Online Spending Limit</span>
          <span style="color: var(--accent-cyan);" id="onlineLimitValDisplay">$${currentCard.onlineDailyLimit.toLocaleString()}</span>
        </div>
        <input type="range" class="range-slider-input" id="onlineLimitSlider" min="500" max="25000" step="500" value="${currentCard.onlineDailyLimit}">
      </div>
    </div>
  `;

  // Attach controls listeners
  bindCardControlEvents(currentCard);
}

function bindCardControlEvents(card) {
  const cardElem = document.getElementById('interactiveCardElement');
  const flipBtn = document.getElementById('flipCardActionBtn');
  const copyBtn = document.getElementById('copyCardNumBtn');
  const freezeToggle = document.getElementById('freezeCardToggle');
  const onlineToggle = document.getElementById('onlinePurchasesToggle');
  const intlToggle = document.getElementById('intlUsageToggle');
  const atmSlider = document.getElementById('atmLimitSlider');
  const atmDisplay = document.getElementById('atmLimitValDisplay');
  const onlineSlider = document.getElementById('onlineLimitSlider');
  const onlineDisplay = document.getElementById('onlineLimitValDisplay');

  // Flip Card
  const toggleFlip = () => {
    if (cardElem) {
      cardElem.classList.toggle('flipped');
      if (flipBtn) {
        flipBtn.innerHTML = cardElem.classList.contains('flipped')
          ? '🔄 Flip Card to Front'
          : '🔄 Flip Card to Back (CVV)';
      }
    }
  };

  if (cardElem) cardElem.addEventListener('click', toggleFlip);
  if (flipBtn) flipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFlip();
  });

  // Copy number
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard?.writeText(card.number.replace(/\s+/g, ''));
      window.showToast?.('Card number copied to clipboard', 'info');
    });
  }

  // Freeze toggle
  if (freezeToggle) {
    freezeToggle.addEventListener('change', (e) => {
      const isFrozen = window.bankStore.toggleCardFreeze(card.id);
      window.showToast?.(
        isFrozen ? `Card ${card.name} is now FROZEN` : `Card ${card.name} is now ACTIVE`,
        isFrozen ? 'error' : 'success'
      );
      renderCardsSection();
    });
  }

  // Online toggle
  if (onlineToggle) {
    onlineToggle.addEventListener('change', (e) => {
      window.bankStore.updateCardSetting(card.id, 'onlinePurchases', e.target.checked);
      window.showToast?.(`Online purchases ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  // Intl toggle
  if (intlToggle) {
    intlToggle.addEventListener('change', (e) => {
      window.bankStore.updateCardSetting(card.id, 'internationalUsage', e.target.checked);
      window.showToast?.(`International transactions ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  // Sliders
  if (atmSlider && atmDisplay) {
    atmSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      atmDisplay.textContent = `$${val.toLocaleString()}`;
    });
    atmSlider.addEventListener('change', (e) => {
      window.bankStore.updateCardSetting(card.id, 'atmDailyLimit', parseInt(e.target.value));
      window.showToast?.(`ATM limit set to $${parseInt(e.target.value).toLocaleString()}`, 'info');
    });
  }

  if (onlineSlider && onlineDisplay) {
    onlineSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      onlineDisplay.textContent = `$${val.toLocaleString()}`;
    });
    onlineSlider.addEventListener('change', (e) => {
      window.bankStore.updateCardSetting(card.id, 'onlineDailyLimit', parseInt(e.target.value));
      window.showToast?.(`Online limit set to $${parseInt(e.target.value).toLocaleString()}`, 'info');
    });
  }

  // Tab switching
  document.querySelectorAll('.card-tab-selector').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCardIndex = parseInt(btn.dataset.index);
      renderCardsSection();
    });
  });
}

function setupCardsEventListeners() {
  const newVirtualCardBtn = document.getElementById('openNewCardModalBtn');
  const createVirtualCardForm = document.getElementById('createVirtualCardForm');

  if (newVirtualCardBtn) {
    newVirtualCardBtn.addEventListener('click', () => {
      window.openModal?.('newVirtualCardModal');
    });
  }

  if (createVirtualCardForm) {
    createVirtualCardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nickname = document.getElementById('vCardNickname')?.value || 'Online Shopping Shield';
      const limit = parseFloat(document.getElementById('vCardLimit')?.value || '1500');
      const network = document.getElementById('vCardNetwork')?.value || 'VISA';
      const theme = document.getElementById('vCardTheme')?.value || 'card-theme-emerald';

      const newCard = window.bankStore.createVirtualCard({
        nickname,
        spendingLimit: limit,
        network,
        theme
      });

      window.closeModal?.('newVirtualCardModal');
      window.showToast?.(`Virtual card created: ${newCard.name}`, 'success');
      activeCardIndex = getCards().length - 1;
      renderCardsSection();
    });
  }
}

// Export to window
window.cardsModule = {
  init: initCardsModule,
  render: renderCardsSection
};
