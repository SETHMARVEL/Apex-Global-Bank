/**
 * Apex Bank - Central Reactive State Management & Data Store
 * Handles localStorage synchronization, transactions, profiles, cards, and goals.
 */

const STORAGE_KEY = 'apex_bank_state_v1';

const DEFAULT_STATE = {
  activeProfileId: 'personal',
  isPrivacyMasked: false,
  theme: 'dark',

  profiles: {
    personal: {
      id: 'personal',
      name: 'Elena Rostova',
      email: 'elena.rostova@apexbank.vip',
      phone: '+1 (555) 234-8921',
      tier: 'Private Wealth Elite',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      accounts: [
        {
          id: 'acc_chk_01',
          name: 'Premier Checking',
          number: '··· 4821',
          fullNumber: '4029 8812 9014 4821',
          routing: '021000021',
          type: 'checking',
          currency: 'USD',
          balance: 24850.75,
          color: '#10B981',
          apy: '0.15% APY'
        },
        {
          id: 'acc_svg_01',
          name: 'High-Yield Vault',
          number: '··· 9032',
          fullNumber: '4029 8812 5591 9032',
          routing: '021000021',
          type: 'savings',
          currency: 'USD',
          balance: 42500.00,
          color: '#06B6D4',
          apy: '4.85% APY'
        },
        {
          id: 'acc_fx_01',
          name: 'Global Multi-Currency',
          number: '··· 3109',
          fullNumber: '4029 8812 7702 3109',
          routing: '021000021',
          type: 'multicurrency',
          currency: 'EUR',
          balance: 3210.00,
          color: '#8B5CF6',
          apy: 'Zero FX Fees'
        }
      ]
    },

    business: {
      id: 'business',
      name: 'TechFlow Dynamics LLC',
      email: 'finance@techflowdynamics.io',
      phone: '+1 (555) 890-4100',
      tier: 'Commercial Platinum Tier',
      avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80',
      accounts: [
        {
          id: 'acc_biz_chk',
          name: 'Operating Commercial Checking',
          number: '··· 8901',
          fullNumber: '8910 1192 4810 8901',
          routing: '021000088',
          type: 'checking',
          currency: 'USD',
          balance: 184200.00,
          color: '#3B82F6',
          apy: 'Commercial Yield'
        },
        {
          id: 'acc_biz_payroll',
          name: 'Payroll Reserve Escrow',
          number: '··· 4419',
          fullNumber: '8910 1192 3302 4419',
          routing: '021000088',
          type: 'savings',
          currency: 'USD',
          balance: 95000.00,
          color: '#10B981',
          apy: '3.90% APY'
        },
        {
          id: 'acc_biz_tax',
          name: 'Tax & Treasury Vault',
          number: '··· 2201',
          fullNumber: '8910 1192 7720 2201',
          routing: '021000088',
          type: 'treasury',
          currency: 'USD',
          balance: 62980.00,
          color: '#F59E0B',
          apy: '5.10% T-Bills'
        }
      ]
    }
  },

  cards: [
    {
      id: 'card_titanium',
      profileId: 'personal',
      name: 'Titanium World Elite Debit',
      holder: 'ELENA ROSTOVA',
      number: '4821 9021 3490 8821',
      expiry: '09/29',
      cvv: '842',
      theme: 'card-theme-titanium',
      network: 'VISA',
      type: 'Physical Metal',
      isFrozen: false,
      onlinePurchases: true,
      internationalUsage: true,
      atmDailyLimit: 2500,
      onlineDailyLimit: 10000,
      spentThisMonth: 3418.50
    },
    {
      id: 'card_cyber',
      profileId: 'personal',
      name: 'Cyber Neon Virtual Card',
      holder: 'ELENA ROSTOVA',
      number: '5319 7712 0048 6231',
      expiry: '11/28',
      cvv: '319',
      theme: 'card-theme-emerald',
      network: 'MASTERCARD',
      type: 'Virtual Single-Use',
      isFrozen: false,
      onlinePurchases: true,
      internationalUsage: true,
      atmDailyLimit: 500,
      onlineDailyLimit: 2500,
      spentThisMonth: 612.20
    },
    {
      id: 'card_sapphire',
      profileId: 'personal',
      name: 'Sapphire Travel Elite',
      holder: 'ELENA ROSTOVA',
      number: '4112 6099 2145 9940',
      expiry: '04/30',
      cvv: '912',
      theme: 'card-theme-sapphire',
      network: 'VISA',
      type: 'Metal Multi-Currency',
      isFrozen: false,
      onlinePurchases: true,
      internationalUsage: true,
      atmDailyLimit: 3000,
      onlineDailyLimit: 15000,
      spentThisMonth: 1240.00
    },
    {
      id: 'card_biz_corp',
      profileId: 'business',
      name: 'Commercial Executive Fleet Card',
      holder: 'TECHFLOW DYNAMICS LLC',
      number: '5542 9011 2309 4410',
      expiry: '01/30',
      cvv: '551',
      theme: 'card-theme-titanium',
      network: 'MASTERCARD',
      type: 'Corporate Charge',
      isFrozen: false,
      onlinePurchases: true,
      internationalUsage: true,
      atmDailyLimit: 5000,
      onlineDailyLimit: 50000,
      spentThisMonth: 18450.00
    }
  ],

  beneficiaries: [
    {
      id: 'ben_1',
      name: 'Alex Rivera',
      handle: 'alex.r@apexbank.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bank: 'Apex Bank Instant',
      accountNum: '··· 8192'
    },
    {
      id: 'ben_2',
      name: 'Emily Watson',
      handle: 'emily.w@nexus.org',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      bank: 'Chase Premier',
      accountNum: '··· 4019'
    },
    {
      id: 'ben_3',
      name: 'Liam Chen',
      handle: 'liam.chen@finmail.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
      bank: 'Barclays UK',
      accountNum: '··· 9931'
    },
    {
      id: 'ben_4',
      name: 'Sarah Miller',
      handle: 'sarah.m@family.net',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      bank: 'Wells Fargo',
      accountNum: '··· 2187'
    },
    {
      id: 'ben_5',
      name: 'Marcus Vance',
      handle: 'marcus@vancecapital.co',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      bank: 'Citi Private Bank',
      accountNum: '··· 5501'
    }
  ],

  goals: [
    {
      id: 'goal_amalfi',
      profileId: 'personal',
      name: 'Dream Villa in Amalfi',
      currentAmount: 18500,
      targetAmount: 30000,
      targetDate: 'Aug 2027',
      category: 'Travel & Leisure',
      icon: '✈️'
    },
    {
      id: 'goal_emergency',
      profileId: 'personal',
      name: '6-Month Emergency Safety Vault',
      currentAmount: 25000,
      targetAmount: 25000,
      targetDate: 'Achieved',
      category: 'Security',
      icon: '🛡️'
    },
    {
      id: 'goal_ev',
      profileId: 'personal',
      name: 'Porsche Taycan EV Downpayment',
      currentAmount: 14200,
      targetAmount: 40000,
      targetDate: 'Dec 2027',
      category: 'Automotive',
      icon: '⚡'
    }
  ],

  bills: [
    {
      id: 'bill_aws',
      provider: 'Amazon Web Services',
      category: 'Cloud Infrastructure',
      amount: 149.50,
      dueDate: 'Due in 3 days',
      isPaid: false,
      autoPay: true,
      logoText: 'AWS'
    },
    {
      id: 'bill_fiber',
      provider: 'HyperFiber Gigabit Telecom',
      category: 'Internet & Telecom',
      amount: 89.99,
      dueDate: 'Due in 7 days',
      isPaid: false,
      autoPay: true,
      logoText: 'FIBER'
    },
    {
      id: 'bill_insurance',
      provider: 'Anthem Premier Health & Life',
      category: 'Healthcare',
      amount: 320.00,
      dueDate: 'Due Nov 25',
      isPaid: false,
      autoPay: false,
      logoText: 'MED'
    },
    {
      id: 'bill_electric',
      provider: 'Apex Clean Power Utility',
      category: 'Utilities',
      amount: 112.40,
      dueDate: 'Paid on Nov 1',
      isPaid: true,
      autoPay: true,
      logoText: 'ECO'
    }
  ],

  transactions: [
    {
      id: 'tx_101',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Stripe Global Dividend Payout',
      category: 'Income',
      amount: 4850.00,
      type: 'credit',
      date: 'Today, 2:15 PM',
      isoDate: '2026-11-04T14:15:00',
      status: 'Completed',
      icon: '💼',
      note: 'Quarterly shareholder equity distribution'
    },
    {
      id: 'tx_102',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Apple Park Store Cupertino',
      category: 'Technology',
      amount: 1299.00,
      type: 'debit',
      date: 'Yesterday, 5:40 PM',
      isoDate: '2026-11-03T17:40:00',
      status: 'Completed',
      icon: '💻',
      note: 'Hardware upgrade - M4 MacBook Air'
    },
    {
      id: 'tx_103',
      profileId: 'personal',
      accId: 'acc_svg_01',
      merchant: 'Apex Monthly Compound Interest',
      category: 'Yield & APY',
      amount: 168.42,
      type: 'credit',
      date: 'Nov 1, 2026',
      isoDate: '2026-11-01T00:01:00',
      status: 'Completed',
      icon: '📈',
      note: '4.85% APY Vault interest accrual'
    },
    {
      id: 'tx_104',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Whole Foods Organic Market',
      category: 'Groceries',
      amount: 184.22,
      type: 'debit',
      date: 'Nov 1, 2026',
      isoDate: '2026-11-01T18:22:00',
      status: 'Completed',
      icon: '🥑',
      note: 'Weekly essentials'
    },
    {
      id: 'tx_105',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Equinox Health & Fitness Club',
      category: 'Wellness',
      amount: 295.00,
      type: 'debit',
      date: 'Oct 30, 2026',
      isoDate: '2026-10-30T09:00:00',
      status: 'Completed',
      icon: '🏋️',
      note: 'Monthly VIP Membership'
    },
    {
      id: 'tx_106',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Transfer from Alex Rivera',
      category: 'P2P Transfer',
      amount: 450.00,
      type: 'credit',
      date: 'Oct 28, 2026',
      isoDate: '2026-10-28T16:10:00',
      status: 'Completed',
      icon: '🤝',
      note: 'Ski lodge weekend trip split'
    },
    {
      id: 'tx_107',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Blue Bottle Artisanal Coffee',
      category: 'Dining',
      amount: 18.50,
      type: 'debit',
      date: 'Oct 28, 2026',
      isoDate: '2026-10-28T08:15:00',
      status: 'Completed',
      icon: '☕',
      note: 'Morning espresso and roast'
    },
    {
      id: 'tx_108',
      profileId: 'personal',
      accId: 'acc_chk_01',
      merchant: 'Lufthansa First Class Airfare',
      category: 'Travel',
      amount: 2840.00,
      type: 'debit',
      date: 'Oct 25, 2026',
      isoDate: '2026-10-25T11:30:00',
      status: 'Completed',
      icon: '✈️',
      note: 'SFO to Zurich booking'
    },

    // Business transactions
    {
      id: 'tx_201',
      profileId: 'business',
      accId: 'acc_biz_chk',
      merchant: 'Enterprise SaaS Enterprise License (Adobe)',
      category: 'Software',
      amount: 3450.00,
      type: 'debit',
      date: 'Today, 11:00 AM',
      isoDate: '2026-11-04T11:00:00',
      status: 'Completed',
      icon: '⚡',
      note: 'Annual seat renewal'
    },
    {
      id: 'tx_202',
      profileId: 'business',
      accId: 'acc_biz_chk',
      merchant: 'Wire Inflow: Acquired Client Retainer',
      category: 'Revenue',
      amount: 65000.00,
      type: 'credit',
      date: 'Yesterday, 3:00 PM',
      isoDate: '2026-11-03T15:00:00',
      status: 'Completed',
      icon: '🏢',
      note: 'Q4 Consulting SLA Agreement'
    }
  ],

  notifications: [
    {
      id: 'notif_1',
      title: 'Dividend Credit Received',
      message: '+$4,850.00 from Stripe Global has been settled into your Premier Checking.',
      time: '2 hours ago',
      read: false,
      type: 'success'
    },
    {
      id: 'notif_2',
      title: 'High-Yield Interest Applied',
      message: 'Your Vault Savings earned $168.42 this cycle at 4.85% APY.',
      time: 'Nov 1',
      read: false,
      type: 'info'
    },
    {
      id: 'notif_3',
      title: 'Biometric Login Verified',
      message: 'Secure session initiated from Windows 11 Chrome.',
      time: 'Just now',
      read: true,
      type: 'security'
    }
  ]
};

class BankStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure schema consistency
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, using defaults', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in store listener', err);
      }
    }
  }

  // Profile operations
  getActiveProfile() {
    return this.state.profiles[this.state.activeProfileId];
  }

  setActiveProfile(profileId) {
    if (this.state.profiles[profileId]) {
      this.state.activeProfileId = profileId;
      this.saveState();
    }
  }

  togglePrivacyMask() {
    this.state.isPrivacyMasked = !this.state.isPrivacyMasked;
    this.saveState();
    return this.state.isPrivacyMasked;
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.saveState();
    return this.state.theme;
  }

  // Account calculations
  getTotalBalance() {
    const profile = this.getActiveProfile();
    if (!profile) return 0;
    return profile.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }

  getAccount(accId) {
    const profile = this.getActiveProfile();
    return profile.accounts.find(a => a.id === accId);
  }

  // Transfers & Payments
  executeTransfer({ fromAccId, toType, toAccId, recipient, amount, note, fee = 0 }) {
    const profile = this.getActiveProfile();
    const sourceAcc = profile.accounts.find(a => a.id === fromAccId);

    if (!sourceAcc) {
      throw new Error('Source account not found.');
    }

    const totalDeduction = amount + fee;
    if (sourceAcc.balance < totalDeduction) {
      throw new Error(`Insufficient balance in ${sourceAcc.name}. Available: $${sourceAcc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }

    // Deduct from source
    sourceAcc.balance -= totalDeduction;

    let transactionTitle = '';
    let category = 'Transfer';
    let icon = '💸';

    if (toType === 'internal') {
      const destAcc = profile.accounts.find(a => a.id === toAccId);
      if (!destAcc) throw new Error('Destination account not found.');
      destAcc.balance += amount;
      transactionTitle = `Internal Transfer to ${destAcc.name}`;
      category = 'Internal Transfer';
      icon = '🔄';
    } else if (toType === 'p2p') {
      transactionTitle = `Apex Pay to ${recipient.name || recipient}`;
      category = 'P2P Transfer';
      icon = '🤝';
    } else if (toType === 'wire') {
      transactionTitle = `Domestic Wire to ${recipient.name || recipient}`;
      category = 'Wire Transfer';
      icon = '🏛️';
    } else if (toType === 'fx') {
      transactionTitle = `International FX Transfer to ${recipient.name || recipient}`;
      category = 'International SWIFT';
      icon = '🌐';
    }

    const newTx = {
      id: 'tx_' + Date.now(),
      profileId: this.state.activeProfileId,
      accId: fromAccId,
      merchant: transactionTitle,
      category,
      amount: amount,
      type: 'debit',
      date: 'Just now',
      isoDate: new Date().toISOString(),
      status: 'Completed',
      icon,
      note: note || 'Transfer dispatched'
    };

    this.state.transactions.unshift(newTx);

    this.state.notifications.unshift({
      id: 'notif_' + Date.now(),
      title: 'Payment Dispatched',
      message: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} successfully transferred via ${category}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    });

    this.saveState();
    return newTx;
  }

  // Mobile Check Deposit
  depositCheck({ accId, amount, checkNumber }) {
    const profile = this.getActiveProfile();
    const targetAcc = profile.accounts.find(a => a.id === accId);

    if (!targetAcc) throw new Error('Target account not found.');
    if (amount <= 0 || isNaN(amount)) throw new Error('Please enter a valid check amount.');

    targetAcc.balance += amount;

    const newTx = {
      id: 'tx_' + Date.now(),
      profileId: this.state.activeProfileId,
      accId,
      merchant: `Mobile Check Deposit #${checkNumber || '84102'}`,
      category: 'Deposit',
      amount,
      type: 'credit',
      date: 'Just now',
      isoDate: new Date().toISOString(),
      status: 'Completed',
      icon: '📸',
      note: 'Verified via Apex Instant Optical Verification'
    };

    this.state.transactions.unshift(newTx);

    this.state.notifications.unshift({
      id: 'notif_' + Date.now(),
      title: 'Mobile Check Deposited',
      message: `+$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been cleared and added to your ${targetAcc.name}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    });

    this.saveState();
    return newTx;
  }

  // Bill Pay
  payBill(billId) {
    const bill = this.state.bills.find(b => b.id === billId);
    if (!bill) throw new Error('Bill not found.');
    if (bill.isPaid) throw new Error('Bill is already paid.');

    const profile = this.getActiveProfile();
    const checkingAcc = profile.accounts.find(a => a.type === 'checking') || profile.accounts[0];

    if (checkingAcc.balance < bill.amount) {
      throw new Error(`Insufficient balance in ${checkingAcc.name} to pay this bill.`);
    }

    checkingAcc.balance -= bill.amount;
    bill.isPaid = true;
    bill.dueDate = 'Paid Just Now';

    const newTx = {
      id: 'tx_' + Date.now(),
      profileId: this.state.activeProfileId,
      accId: checkingAcc.id,
      merchant: `Bill Pay: ${bill.provider}`,
      category: 'Utilities & Bills',
      amount: bill.amount,
      type: 'debit',
      date: 'Just now',
      isoDate: new Date().toISOString(),
      status: 'Completed',
      icon: '🧾',
      note: `Electronic settlement for ${bill.category}`
    };

    this.state.transactions.unshift(newTx);

    this.state.notifications.unshift({
      id: 'notif_' + Date.now(),
      title: 'Bill Paid',
      message: `$${bill.amount.toFixed(2)} paid to ${bill.provider}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    });

    this.saveState();
    return newTx;
  }

  // Goals
  contributeToGoal(goalId, amount) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) throw new Error('Goal not found.');

    const profile = this.getActiveProfile();
    const checkingAcc = profile.accounts.find(a => a.type === 'checking') || profile.accounts[0];

    if (checkingAcc.balance < amount) {
      throw new Error('Insufficient funds in checking account.');
    }

    checkingAcc.balance -= amount;
    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);

    const newTx = {
      id: 'tx_' + Date.now(),
      profileId: this.state.activeProfileId,
      accId: checkingAcc.id,
      merchant: `Vault Allocation: ${goal.name}`,
      category: 'Savings Vault',
      amount: amount,
      type: 'debit',
      date: 'Just now',
      isoDate: new Date().toISOString(),
      status: 'Completed',
      icon: '🎯',
      note: `Contributed to ${goal.name}`
    };

    this.state.transactions.unshift(newTx);
    this.saveState();
    return goal;
  }

  createGoal({ name, targetAmount, targetDate, category, icon }) {
    const newGoal = {
      id: 'goal_' + Date.now(),
      profileId: this.state.activeProfileId,
      name,
      currentAmount: 0,
      targetAmount: parseFloat(targetAmount),
      targetDate: targetDate || '2028',
      category: category || 'General Vault',
      icon: icon || '💎'
    };
    this.state.goals.push(newGoal);
    this.saveState();
    return newGoal;
  }

  // Cards
  getActiveCards() {
    return this.state.cards.filter(c => c.profileId === this.state.activeProfileId);
  }

  toggleCardFreeze(cardId) {
    const card = this.state.cards.find(c => c.id === cardId);
    if (card) {
      card.isFrozen = !card.isFrozen;
      this.saveState();
      return card.isFrozen;
    }
    return false;
  }

  updateCardSetting(cardId, settingName, value) {
    const card = this.state.cards.find(c => c.id === cardId);
    if (card && settingName in card) {
      card[settingName] = value;
      this.saveState();
    }
  }

  createVirtualCard({ nickname, spendingLimit, network = 'VISA', theme = 'card-theme-emerald' }) {
    const randDigits = () => Math.floor(1000 + Math.random() * 9000);
    const profile = this.getActiveProfile();

    const newCard = {
      id: 'card_v_' + Date.now(),
      profileId: this.state.activeProfileId,
      name: nickname || 'Virtual Web Card',
      holder: profile.name.toUpperCase(),
      number: `${network === 'VISA' ? '4912' : '5241'} ${randDigits()} ${randDigits()} ${randDigits()}`,
      expiry: '12/29',
      cvv: String(Math.floor(100 + Math.random() * 900)),
      theme: theme,
      network: network,
      type: 'Virtual Disposable',
      isFrozen: false,
      onlinePurchases: true,
      internationalUsage: true,
      atmDailyLimit: 200,
      onlineDailyLimit: spendingLimit || 2000,
      spentThisMonth: 0
    };

    this.state.cards.push(newCard);
    this.saveState();
    return newCard;
  }

  // Notifications
  markAllNotificationsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.saveState();
  }

  getUnreadNotificationsCount() {
    return this.state.notifications.filter(n => !n.read).length;
  }
}

// Global Store singleton
window.bankStore = new BankStore();
