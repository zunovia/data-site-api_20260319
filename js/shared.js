/* ===== Japan Stats — Shared JS ===== */
const APP_ID = '6f7e88733e47d2ae3ddc010642412f04d8ca594c';
const API_BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json';

// Detect if we're in a subdirectory (pages/)
const _isSubDir = window.location.pathname.includes('/pages/');
const _root = _isSubDir ? '../' : '';

// === API Functions ===
async function fetchAPI(endpoint, params = {}) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('appId', APP_ID);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// === API Status Check ===
async function checkAPI() {
  const badge = document.getElementById('api-badge');
  const refreshBtn = document.getElementById('refresh-btn');
  if (badge) badge.textContent = '◌ checking';
  if (refreshBtn) refreshBtn.classList.add('loading');
  try {
    const d = await fetchAPI('getStatsList', { statsCode: '00200524', limit: '1', lang: 'J' });
    if (d?.GET_STATS_LIST?.RESULT?.STATUS === 0) {
      if (badge) { badge.textContent = '● Live'; badge.className = 'api-badge live'; }
    } else throw new Error('bad status');
  } catch {
    if (badge) { badge.textContent = '○ Offline'; badge.className = 'api-badge'; }
  }
  if (refreshBtn) refreshBtn.classList.remove('loading');
  const ts = document.getElementById('last-refresh');
  if (ts) ts.textContent = '最終確認: ' + new Date().toLocaleTimeString('ja-JP');
}

// === Scroll Reveal ===
function initScrollReveal() {
  const els = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// === Animated Counter ===
function animateCounter(el, target, duration = 2500) {
  const start = Date.now();
  const tick = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  tick();
}

// === Particle Background ===
function initParticles(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = c.width = c.offsetWidth, H = c.height = c.offsetHeight;
  window.addEventListener('resize', () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; });
  class P {
    constructor() { this.reset(); }
    reset() { this.x = Math.random()*W; this.y = Math.random()*H; this.r = Math.random()*1.8+0.3; this.vx = (Math.random()-0.5)*0.3; this.vy = (Math.random()-0.5)*0.3; this.a = Math.random()*0.4+0.1; this.p = Math.random()*Math.PI*2; }
    update() { this.x += this.vx; this.y += this.vy; this.p += 0.01; this.a = 0.1+Math.sin(this.p)*0.15; if (this.x<0||this.x>W||this.y<0||this.y>H) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`rgba(200,90,62,${this.a})`; ctx.fill(); }
  }
  const ps = Array.from({length:80}, ()=>new P());
  (function loop() {
    ctx.clearRect(0,0,W,H);
    ps.forEach(p => { p.update(); p.draw(); });
    for (let i=0; i<ps.length; i++) for (let j=i+1; j<ps.length; j++) {
      const dx=ps[i].x-ps[j].x, dy=ps[i].y-ps[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if (d<120) { ctx.beginPath(); ctx.moveTo(ps[i].x,ps[i].y); ctx.lineTo(ps[j].x,ps[j].y); ctx.strokeStyle=`rgba(200,90,62,${0.06*(1-d/120)})`; ctx.lineWidth=0.5; ctx.stroke(); }
    }
    requestAnimationFrame(loop);
  })();
}

// === Header HTML (auto-adjusts path based on directory) ===
function headerHTML(currentPage) {
  return `<header class="header">
    <a href="${_root}index.html" class="header-brand"><span class="header-logo">日本統計</span><span class="header-sub">JAPAN STATS</span></a>
    <div class="header-right">
      <button class="refresh-btn" id="refresh-btn" onclick="checkAPI()"><svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke-linecap="round" stroke-linejoin="round"/></svg><span>更新</span></button>
      <span class="api-badge" id="api-badge">◌ ...</span>
    </div>
  </header>`;
}

// === Footer HTML ===
function footerHTML() {
  return `<footer>
    <p class="footer-brand"><a href="https://www.ryotakaneda.com/" target="_blank" rel="noopener noreferrer">Sur Communication Inc.</a></p>
    <p>出典: 総務省統計局 / 厚生労働省 / 内閣府 | e-Stat API v3.0</p>
    <p id="last-refresh"></p>
  </footer>`;
}

// === Nav Arrow SVG ===
function arrowSVG() {
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

// === Back Button (auto-adjusts path) ===
function backHTML() {
  return `<a href="${_root}index.html" class="back-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>ホームへ戻る</span></a>`;
}

// === Bar Chart ===
function createBarChart(container, data, labels, maxVal, color) {
  const mx = maxVal || Math.max(...data);
  let html = '<div class="bar-chart">';
  data.forEach((v, i) => { html += `<div class="bar-item"><div class="bar-track"><div class="bar-fill" style="height:${(v/mx)*100}%;background:${color}"></div></div><span class="bar-label">${labels[i]}</span></div>`; });
  html += '</div>';
  container.innerHTML = html;
}

// === HBar ===
function createHBar(container, items, color, maxVal) {
  const mx = maxVal || Math.max(...items.map(i => i.value));
  let html = '<div class="hbar-list">';
  items.forEach(d => { html += `<div class="hbar-row"><span class="hbar-name">${d.name}</span><div class="hbar-track"><div class="hbar-fill" style="width:${(d.value/mx)*100}%;background:${color}"></div></div><span class="hbar-val">${d.value.toLocaleString()}</span></div>`; });
  html += '</div>';
  container.innerHTML = html;
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  checkAPI();
});
