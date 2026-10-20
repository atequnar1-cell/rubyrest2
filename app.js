const APP_NAME = 'rubyrest2_vip_platform';
const VIP_PLANS = [
  { level: 1, title: 'VIP 1', price: 50, dailyProfit: 8 },
  { level: 2, title: 'VIP 2', price: 120, dailyProfit: 20 },
  { level: 3, title: 'VIP 3', price: 260, dailyProfit: 45 },
  { level: 4, title: 'VIP 4', price: 420, dailyProfit: 75 },
  { level: 5, title: 'VIP 5', price: 680, dailyProfit: 120 },
  { level: 6, title: 'VIP 6', price: 1100, dailyProfit: 180 },
  { level: 7, title: 'VIP 7', price: 1800, dailyProfit: 320 },
  { level: 8, title: 'VIP 8', price: 2800, dailyProfit: 520 },
  { level: 9, title: 'VIP 9', price: 4500, dailyProfit: 860 },
  { level: 10, title: 'VIP 10', price: 7200, dailyProfit: 1450 },
];

const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const authForm = document.getElementById('authForm');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const nameField = document.getElementById('nameField');
const referralField = document.getElementById('referralField');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const referralInput = document.getElementById('referralInput');
const plansContainer = document.getElementById('plansContainer');
const transactionsTableBody = document.getElementById('transactionsTableBody');
const adminTableBody = document.getElementById('adminTableBody');
const logoutBtn = document.getElementById('logoutBtn');

const state = {
  mode: 'login',
};

function getUsers() {
  return JSON.parse(localStorage.getItem(`${APP_NAME}:users`) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(`${APP_NAME}:users`, JSON.stringify(users));
}

function getTransactions() {
  return JSON.parse(localStorage.getItem(`${APP_NAME}:transactions`) || '[]');
}

function saveTransactions(transactions) {
  localStorage.setItem(`${APP_NAME}:transactions`, JSON.stringify(transactions));
}

function getCurrentUser() {
  const current = localStorage.getItem(`${APP_NAME}:currentUser`);
  if (!current) return null;
  return JSON.parse(current);
}

function setCurrentUser(user) {
  localStorage.setItem(`${APP_NAME}:currentUser`, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(`${APP_NAME}:currentUser`);
}

function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function showToast(message) {
  alert(message);
}

function createReferralCode(name) {
  const safe = (name || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  return `${safe || 'RUBY'}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function ensureSeedData() {
  let users = getUsers();
  if (!users.length) {
    const adminUser = {
      id: 'admin_01',
      name: 'Admin User',
      email: 'admin@rubyrest2.com',
      password: 'admin123',
      role: 'admin',
      vipLevel: 10,
      balance: 0,
      referralCode: 'ADMINVIP',
      referredBy: null,
      claimedDates: [],
      createdAt: Date.now(),
    };

    users = [adminUser];
    saveUsers(users);
  }

  const transactions = getTransactions();
  if (!transactions.length) {
    saveTransactions([
      {
        id: generateId('seed'),
        userId: 'admin_01',
        type: 'vip_purchase',
        amount: 7200,
        status: 'approved',
        level: 10,
        createdAt: Date.now() - 86400000,
        description: 'VIP 10 activation',
      },
    ]);
  }
}

function getUserByEmail(email) {
  return getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getUserById(userId) {
  return getUsers().find((user) => user.id === userId);
}

function getUserTransactions(userId) {
  return getTransactions().filter((tx) => tx.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

function renderPlans() {
  plansContainer.innerHTML = '';

  VIP_PLANS.forEach((plan) => {
    const card = document.createElement('div');
    card.className = `plan-card ${plan.level === 5 ? 'featured' : ''}`;

    const currentUser = getCurrentUser();
    const isActive = currentUser && currentUser.vipLevel >= plan.level;

    card.innerHTML = `
      <div class="plan-meta">
        <span>${plan.title}</span>
        <span>${isActive ? 'Active' : 'Available'}</span>
      </div>
      <div class="plan-price">${formatCurrency(plan.price)}</div>
      <div class="plan-meta">
        <span>Daily profit</span>
        <span>${formatCurrency(plan.dailyProfit)}</span>
      </div>
      <ul class="plan-list">
        <li>• VIP access</li>
        <li>• Daily claim eligibility</li>
        <li>• Referral loyalty perks</li>
      </ul>
      <button class="primary-btn ${isActive ? 'hidden' : ''}" data-plan-level="${plan.level}">
        Buy ${plan.title}
      </button>
    `;

    const button = card.querySelector('button');
    if (button) {
      button.addEventListener('click', () => createVipPurchaseRequest(plan));
    }

    plansContainer.appendChild(card);
  });
}

function renderTransactions() {
  const user = getCurrentUser();
  const list = getUserTransactions(user.id);

  transactionsTableBody.innerHTML = list.length
    ? list
        .map(
          (tx) => `
            <tr>
              <td>${tx.type.replace('_', ' ')}</td>
              <td>${formatCurrency(tx.amount)}</td>
              <td>
                <span class="status-badge status-${tx.status}">${tx.status}</span>
              </td>
              <td>${formatDate(tx.createdAt)}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="4">No transactions yet.</td></tr>';
}

function renderAdminTable() {
  const users = getUsers();
  const pending = getTransactions().filter((tx) => tx.status === 'pending');

  if (!pending.length) {
    adminTableBody.innerHTML = '<tr><td colspan="5">No pending approvals.</td></tr>';
    return;
  }

  adminTableBody.innerHTML = pending
    .map((tx) => {
      const user = getUserById(tx.userId);
      const memberName = user ? user.name : 'Unknown user';
      return `
        <tr>
          <td>${memberName}</td>
          <td>${tx.type.replace('_', ' ')}</td>
          <td>${formatCurrency(tx.amount)}</td>
          <td>${tx.level ? `VIP ${tx.level}` : '—'}</td>
          <td>
            <button class="approve-btn" data-approve-id="${tx.id}">Approve</button>
            <button class="reject-btn" data-reject-id="${tx.id}">Reject</button>
          </td>
        </tr>
      `;
    })
    .join('');

  document.querySelectorAll('[data-approve-id]').forEach((button) => {
    button.addEventListener('click', () => handleAdminDecision(button.dataset.approveId, 'approved'));
  });

  document.querySelectorAll('[data-reject-id]').forEach((button) => {
    button.addEventListener('click', () => handleAdminDecision(button.dataset.rejectId, 'rejected'));
  });
}

function updateDashboardSummary() {
  const user = getCurrentUser();
  if (!user) return;

  const approvedDeposits = getTransactions().filter(
    (tx) => tx.userId === user.id && tx.type === 'deposit_request' && tx.status === 'approved'
  );

  const referralBonus = getTransactions().filter(
    (tx) => tx.userId === user.id && tx.type === 'referral_bonus' && tx.status === 'approved'
  );

  const claimedToday = user.claimedDates.includes(new Date().toDateString());
  const currentPlan = VIP_PLANS.find((plan) => plan.level === user.vipLevel) || { dailyProfit: 0 };

  document.getElementById('welcomeName').textContent = `Welcome, ${user.name}`;
  document.getElementById('sidebarUserName').textContent = user.name;
  document.getElementById('sidebarUserEmail').textContent = user.email;
  document.getElementById('sidebarVipLevel').textContent = `VIP ${user.vipLevel}`;
  document.getElementById('userBalance').textContent = formatCurrency(user.balance);
  document.getElementById('summaryVipLevel').textContent = `VIP ${user.vipLevel}`;
  document.getElementById('summaryReferral').textContent = formatCurrency(referralBonus.reduce((sum, tx) => sum + tx.amount, 0));
  document.getElementById('summaryDailyClaim').textContent = `${claimedToday ? 'Claimed' : formatCurrency(currentPlan.dailyProfit)}`;
  document.getElementById('summaryApprovedDeposits').textContent = formatCurrency(approvedDeposits.reduce((sum, tx) => sum + tx.amount, 0));
  document.getElementById('referralCodeDisplay').textContent = user.referralCode;

  const invitedMembers = getUsers().filter((member) => member.referredBy === user.id).length;
  document.getElementById('referralSummaryText').textContent = invitedMembers
    ? `${invitedMembers} invited member${invitedMembers > 1 ? 's' : ''}`
    : 'No invited members yet.';

  document.getElementById('claimDailyBtn').disabled = claimedToday || user.vipLevel < 1;
  document.getElementById('claimDailyBtn').textContent = claimedToday ? 'Already claimed' : 'Claim today';
}

function renderApp() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    authScreen.classList.add('active');
    appScreen.classList.remove('active');
    return;
  }

  authScreen.classList.remove('active');
  appScreen.classList.add('active');

  const isAdmin = currentUser.role === 'admin';
  document.querySelectorAll('.admin-only').forEach((el) => {
    el.classList.toggle('hidden', !isAdmin);
  });

  renderPlans();
  renderTransactions();
  renderAdminTable();
  updateDashboardSummary();

  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === 'dashboardView');
  });

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active');
  });
  document.getElementById('dashboardView').classList.add('active');
}

function setAuthMode(mode) {
  state.mode = mode;

  const isLogin = mode === 'login';
  nameField.classList.toggle('hidden', isLogin);
  referralField.classList.toggle('hidden', isLogin);
  authSubmitBtn.textContent = isLogin ? 'Login' : 'Create account';

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
}

async function loginUser(email, password) {
  const user = getUserByEmail(email);
  if (!user) {
    showToast('No account found with this email.');
    return;
  }

  if (user.password !== password) {
    showToast('Wrong password.');
    return;
  }

  setCurrentUser(user);
  renderApp();
}

function registerUser(name, email, password, referralCode) {
  const existing = getUserByEmail(email);
  if (existing) {
    showToast('A user with this email already exists.');
    return;
  }

  const users = getUsers();
  const newUser = {
    id: generateId('user'),
    name,
    email,
    password,
    role: 'member',
    vipLevel: 0,
    balance: 0,
    referralCode: createReferralCode(name),
    referredBy: null,
    claimedDates: [],
    createdAt: Date.now(),
  };

  if (referralCode) {
    const referrer = users.find((u) => u.referralCode.toLowerCase() === referralCode.toLowerCase());
    if (referrer) {
      newUser.referredBy = referrer.id;
    } else {
      showToast('Referral code not found. You can still continue without it.');
    }
  }

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  renderApp();
}

function createVipPurchaseRequest(plan) {
  const user = getCurrentUser();
  if (!user) return;

  const tx = {
    id: generateId('tx'),
    userId: user.id,
    type: 'vip_purchase',
    amount: plan.price,
    status: 'pending',
    level: plan.level,
    createdAt: Date.now(),
    description: `${plan.title} purchase request`,
  };

  const transactions = getTransactions();
  transactions.unshift(tx);
  saveTransactions(transactions);
  renderTransactions();
  renderAdminTable();
  showToast(`${plan.title} purchase request submitted for admin approval.`);
}

function createDepositRequest() {
  const user = getCurrentUser();
  const amount = Number(document.getElementById('depositAmount').value);

  if (!user || !amount || amount <= 0) {
    showToast('Enter a valid deposit amount.');
    return;
  }

  const tx = {
    id: generateId('tx'),
    userId: user.id,
    type: 'deposit_request',
    amount,
    status: 'pending',
    createdAt: Date.now(),
    description: 'Deposit request',
  };

  const transactions = getTransactions();
  transactions.unshift(tx);
  saveTransactions(transactions);
  renderTransactions();
  renderAdminTable();
  document.getElementById('depositAmount').value = '';
  showToast('Deposit request submitted.');
}

function createWithdrawalRequest() {
  const user = getCurrentUser();
  const amount = Number(document.getElementById('withdrawalAmount').value);

  if (!user || !amount || amount <= 0) {
    showToast('Enter a valid withdrawal amount.');
    return;
  }

  const tx = {
    id: generateId('tx'),
    userId: user.id,
    type: 'withdrawal_request',
    amount,
    status: 'pending',
    createdAt: Date.now(),
    description: 'Withdrawal request',
  };

  const transactions = getTransactions();
  transactions.unshift(tx);
  saveTransactions(transactions);
  renderTransactions();
  renderAdminTable();
  document.getElementById('withdrawalAmount').value = '';
  showToast('Withdrawal request submitted.');
}

function claimDailyProfit() {
  const user = getCurrentUser();
  if (!user) return;

  if (user.vipLevel < 1) {
    showToast('You need at least VIP 1 to claim daily profits.');
    return;
  }

  const today = new Date().toDateString();
  if (user.claimedDates.includes(today)) {
    showToast('You already claimed your daily profit today.');
    return;
  }

  const plan = VIP_PLANS.find((item) => item.level === user.vipLevel);
  const amount = plan ? plan.dailyProfit : 0;

  const users = getUsers();
  const targetIndex = users.findIndex((member) => member.id === user.id);
  const updatedUser = { ...users[targetIndex], balance: Number(users[targetIndex].balance) + amount, claimedDates: [...users[targetIndex].claimedDates, today] };
  users[targetIndex] = updatedUser;
  saveUsers(users);

  const transactions = getTransactions();
  transactions.unshift({
    id: generateId('tx'),
    userId: user.id,
    type: 'daily_claim',
    amount,
    status: 'approved',
    createdAt: Date.now(),
    description: `Daily claim for ${plan.title}`,
  });
  saveTransactions(transactions);

  setCurrentUser(updatedUser);
  renderApp();
  showToast(`Daily claim of ${formatCurrency(amount)} added to your balance.`);
}

function handleAdminDecision(transactionId, decision) {
  const transactions = getTransactions();
  const txIndex = transactions.findIndex((tx) => tx.id === transactionId);
  if (txIndex === -1) return;

  const tx = transactions[txIndex];
  const users = getUsers();
  const user = users.find((member) => member.id === tx.userId);

  if (!user) return;

  tx.status = decision;

  if (decision === 'approved') {
    if (tx.type === 'deposit_request') {
      user.balance = Number(user.balance) + Number(tx.amount);
    }

    if (tx.type === 'vip_purchase') {
      user.vipLevel = Math.max(user.vipLevel, Number(tx.level || 0));
      const referral = users.find((member) => member.id === user.referredBy);
      if (referral) {
        const bonus = Number(tx.amount) * 0.1;
        referral.balance = Number(referral.balance) + bonus;
        transactions.unshift({
          id: generateId('tx'),
          userId: referral.id,
          type: 'referral_bonus',
          amount: bonus,
          status: 'approved',
          createdAt: Date.now(),
          description: `10% referral bonus from ${user.name}`,
        });
      }
    }

    if (tx.type === 'withdrawal_request') {
      user.balance = Math.max(0, Number(user.balance) - Number(tx.amount));
    }
  }

  if (decision === 'rejected' && tx.type === 'withdrawal_request') {
    tx.status = 'rejected';
  }

  saveTransactions(transactions);
  saveUsers(users);
  setCurrentUser(user);
  renderApp();
}

function bindEvents() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
  });

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const referral = referralInput.value.trim();

    if (state.mode === 'login') {
      loginUser(email, password);
      return;
    }

    if (!name || !email || !password) {
      showToast('Please enter your name, email, and password.');
      return;
    }

    registerUser(name, email, password, referral);
  });

  logoutBtn.addEventListener('click', () => {
    clearCurrentUser();
    renderApp();
    authForm.reset();
  });

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const viewName = `${button.dataset.view}`;
      document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
      document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === viewName));
    });
  });

  document.getElementById('depositBtn').addEventListener('click', createDepositRequest);
  document.getElementById('withdrawalBtn').addEventListener('click', createWithdrawalRequest);
  document.getElementById('claimDailyBtn').addEventListener('click', claimDailyProfit);
}

function initialize() {
  ensureSeedData();
  setAuthMode('login');
  bindEvents();
  renderApp();
}

initialize();

window.addEventListener('storage', () => {
  renderApp();
});

if (window.supabase) {
  console.info('Supabase client detected. You can replace localStorage logic with database queries here.');
}
