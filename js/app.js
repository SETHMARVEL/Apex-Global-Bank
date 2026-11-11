/**
 * Unity Capital Bank - Application Bootstrap & Main Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Unity Capital Digital Banking Portal...');

  // Initialize all subsystems
  if (window.uiModule) window.uiModule.init();
  if (window.cardsModule) window.cardsModule.init();
  if (window.transfersModule) window.transfersModule.init();
  if (window.assistantModule) window.assistantModule.init();

  // Listen for changes from the reactive store
  window.bankStore.subscribe(() => {
    if (window.uiModule) {
      window.uiModule.renderProfile();
      window.uiModule.renderNetWorth();
      window.uiModule.renderAccounts();
      window.uiModule.renderTransactions();
      window.uiModule.renderGoals();
      window.uiModule.renderBills();
      window.uiModule.renderNotifications();
    }

    if (window.cardsModule) {
      window.cardsModule.render();
    }

    if (window.transfersModule) {
      window.transfersModule.refreshDropdowns();
    }
  });

  // Handle Mobile Check Deposit Quick Action button
  const quickDepositBtn = document.getElementById('quickActionDepositBtn');
  if (quickDepositBtn) {
    quickDepositBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openModal('mobileCheckDepositModal');
    });
  }

  // Handle Quick Action Send button
  const quickSendBtn = document.getElementById('quickActionSendBtn');
  if (quickSendBtn) {
    quickSendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const transferNav = document.querySelector('.nav-item[data-view="transfers"]');
      if (transferNav) transferNav.click();
    });
  }

  // Handle Statement Download Simulation
  const downloadStmtBtn = document.getElementById('downloadStatementBtn');
  if (downloadStmtBtn) {
    downloadStmtBtn.addEventListener('click', () => {
      window.showToast('Generating official encrypted PDF bank statement...', 'info');
      setTimeout(() => {
        window.showToast('Statement downloaded: Unity_Capital_Statement_Nov_2026.pdf', 'success');
      }, 1200);
    });
  }

  // Window resize handler for analytics chart
  window.addEventListener('resize', () => {
    window.uiModule?.setupAnalyticsChart?.();
  });
});
