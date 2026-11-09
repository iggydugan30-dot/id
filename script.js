const STORAGE_KEY = 'cookie-clicker-save';

const defaultState = {
  cookies: 0,
  totalCookies: 0,
  clickPower: 1,
  cookiesPerSecond: 0,
  cursor: 0,
  grandma: 0,
  factory: 0,
  mine: 0,
  ship: 0,
};

const shopItems = [
  { key: 'cursor', name: 'Cursor', baseCost: 15, cps: 0.1 },
  { key: 'grandma', name: 'Grandma', baseCost: 100, cps: 1 },
  { key: 'factory', name: 'Factory', baseCost: 1100, cps: 8 },
  { key: 'mine', name: 'Mine', baseCost: 12000, cps: 47 },
  { key: 'ship', name: 'Ship', baseCost: 130000, cps: 260 },
];

const state = loadState();

const cookieButton = document.getElementById('cookieButton');
const cookiesDisplay = document.getElementById('cookiesDisplay');
const cpsDisplay = document.getElementById('cpsDisplay');
const clickPowerDisplay = document.getElementById('clickPowerDisplay');
const shopList = document.getElementById('shopList');
const resetButton = document.getElementById('resetButton');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return { ...defaultState };
    return { ...defaultState, ...saved };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatNumber(value) {
  const abs = Math.abs(value);
  if (abs >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return value.toFixed(value >= 100 ? 0 : 1).replace(/\.0$/, '');
}

function getCost(item) {
  return Math.floor(item.baseCost * Math.pow(1.15, state[item.key]));
}

function clickCookie() {
  state.cookies += state.clickPower;
  state.totalCookies += state.clickPower;
  saveState();
  render();

  cookieButton.classList.remove('popped');
  void cookieButton.offsetWidth;
  cookieButton.classList.add('popped');
}

function buyUpgrade(item) {
  const cost = getCost(item);
  if (state.cookies < cost) return;

  state.cookies -= cost;
  state[item.key] += 1;
  state.cookiesPerSecond += item.cps;
  saveState();
  render();
}

function renderShop() {
  shopList.innerHTML = '';

  shopItems.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shop-item';
    const cost = getCost(item);
    const owned = state[item.key];

    button.disabled = state.cookies < cost;
    button.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <span>Owned: ${owned}</span>
      </div>
      <div class="price">${formatNumber(cost)}🍪</div>
    `;

    button.addEventListener('click', () => buyUpgrade(item));
    shopList.appendChild(button);
  });
}

function render() {
  cookiesDisplay.textContent = formatNumber(state.cookies);
  cpsDisplay.textContent = formatNumber(state.cookiesPerSecond);
  clickPowerDisplay.textContent = formatNumber(state.clickPower);
  renderShop();
}

function tick() {
  if (state.cookiesPerSecond > 0) {
    state.cookies += state.cookiesPerSecond / 2;
    state.totalCookies += state.cookiesPerSecond / 2;
    saveState();
    render();
  }
}

function resetGame() {
  Object.assign(state, defaultState);
  saveState();
  render();
}

cookieButton.addEventListener('click', clickCookie);
resetButton.addEventListener('click', resetGame);

render();
setInterval(tick, 500);

window.addEventListener('beforeunload', saveState);
