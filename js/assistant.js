/**
 * Unity Capital Bank - Intelligent AI Financial Assistant
 * Context-aware banking agent analyzing real account balances, spending, and interest.
 */

function initAssistantModule() {
  setupAssistantUI();
}

function setupAssistantUI() {
  const toggleBtn = document.getElementById('floatingAssistantBtn');
  const drawer = document.getElementById('assistantDrawer');
  const closeBtn = document.getElementById('closeAssistantBtn');
  const sendBtn = document.getElementById('assistantSendBtn');
  const inputField = document.getElementById('assistantInput');
  const messagesContainer = document.getElementById('assistantMessages');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = () => {
    drawer.classList.toggle('active');
    if (drawer.classList.contains('active')) {
      inputField?.focus();
    }
  };

  toggleBtn.addEventListener('click', toggleDrawer);
  if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);

  const sendMessage = () => {
    const text = inputField.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    inputField.value = '';

    // Simulate AI thinking and reply
    setTimeout(() => {
      const reply = generateAiResponse(text);
      appendMessage(reply, 'ai');
    }, 450);
  };

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (inputField) {
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Quick prompt chips
  document.querySelectorAll('.quick-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        if (!drawer.classList.contains('active')) {
          drawer.classList.add('active');
        }
        appendMessage(prompt, 'user');
        setTimeout(() => {
          const reply = generateAiResponse(prompt);
          appendMessage(reply, 'ai');
        }, 400);
      }
    });
  });
}

function appendMessage(text, sender) {
  const container = document.getElementById('assistantMessages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = sender === 'user' ? 'user-bubble' : 'ai-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  container.appendChild(bubble);

  container.scrollTop = container.scrollHeight;
}

function generateAiResponse(query) {
  const q = query.toLowerCase();
  const profile = window.bankStore.getActiveProfile();
  const accounts = profile.accounts;
  const totalBalance = window.bankStore.getTotalBalance();

  // Balance query
  if (q.includes('balance') || q.includes('how much money') || q.includes('net worth')) {
    const checking = accounts.find(a => a.type === 'checking');
    const savings = accounts.find(a => a.type === 'savings');
    return `Hello ${profile.name.split(' ')[0]}! 💼\n\nYour total net worth across Unity Capital accounts is **$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}**:\n` +
      `• **${checking ? checking.name : 'Checking'}**: $${(checking ? checking.balance : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `• **${savings ? savings.name : 'Vault Savings'}**: $${(savings ? savings.balance : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `\nWould you like me to move funds into your 4.85% APY Vault?`;
  }

  // Spending analysis
  if (q.includes('spend') || q.includes('analysis') || q.includes('breakdown') || q.includes('budget')) {
    const debits = window.bankStore.state.transactions.filter(t => t.type === 'debit' && t.profileId === window.bankStore.state.activeProfileId);
    const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);
    return `📊 **Spending Summary for this cycle:**\n\n` +
      `Total outflows: **$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}** across ${debits.length} transactions.\n\n` +
      `💡 **AI Insight:** You are currently saving approximately 38% of your inbound monthly capital. Your top expense category this month is **Technology & Travel**. You are well within your healthy safe-to-spend range!`;
  }

  // Interest / APY
  if (q.includes('interest') || q.includes('apy') || q.includes('vault') || q.includes('yield')) {
    const savings = accounts.find(a => a.type === 'savings');
    const bal = savings ? savings.balance : 0;
    const yearlyEarn = bal * 0.0485;
    const monthlyEarn = yearlyEarn / 12;

    return `🏦 **Unity Capital High-Yield Vault Details:**\n\n` +
      `• Current APY: **4.85% compounded daily**\n` +
      `• Current Vault Balance: **$${bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}**\n` +
      `• Estimated Monthly Interest: **+$${monthlyEarn.toFixed(2)} / mo**\n` +
      `• Estimated Annual Gain: **+$${yearlyEarn.toFixed(2)} / yr**\n\n` +
      `There are zero withdrawal restrictions or lockup penalties.`;
  }

  // Card Freeze
  if (q.includes('freeze') || q.includes('lost card') || q.includes('block')) {
    const cards = window.bankStore.getActiveCards();
    const primary = cards[0];
    if (primary) {
      return `💳 **Card Security Control:**\n\n` +
        `Your primary card is **${primary.name}** (ending in ${primary.number.slice(-4)}).\n` +
        `Current Status: **${primary.isFrozen ? 'FROZEN ❄️' : 'ACTIVE ✅'}**\n\n` +
        `You can toggle freeze status anytime from the **Cards** tab in the sidebar or from the quick controls!`;
    }
  }

  // Transfer / Send
  if (q.includes('transfer') || q.includes('send money') || q.includes('wire')) {
    return `💸 **Money Movement:**\n\n` +
      `You can send instant funds with:\n` +
      `1. **Unity Pay (P2P)**: Free instant transfers to any email, phone, or contact.\n` +
      `2. **Domestic ACH/Wire**: Routing & Account settlement.\n` +
      `3. **SWIFT / International**: Real-time FX exchange with zero hidden spreads.\n\n` +
      `Tap **Transfers** in the navigation or use the "Send Money" quick button on your dashboard.`;
  }

  // Deposit Check
  if (q.includes('check') || q.includes('deposit')) {
    return `📸 **Mobile Check Deposit:**\n\n` +
      `You can deposit checks instantly using optical image capture! Simply click **Deposit Check** on your dashboard, snap the front and endorsed back, and funds are verified instantly.`;
  }

  // Default intelligent fallback
  return `I'm here to assist with your Unity Capital Banking needs! You can ask me about:\n` +
    `• "What is my current balance?"\n` +
    `• "Analyze my spending this month"\n` +
    `• "How much interest does my vault earn?"\n` +
    `• "How do I freeze or replace my card?"\n` +
    `• "Calculate a loan or transfer"`;
}

// Export
window.assistantModule = {
  init: initAssistantModule
};
