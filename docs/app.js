'use strict';

let currentPos = null;
let savedPoints = JSON.parse(localStorage.getItem('ondemeucarro_points') || '[]');

// ── GPS ──────────────────────────────────────────────────────────────────────
function initGPS() {
  if (!navigator.geolocation) {
    setGPSBadge('error', 'SEM GPS');
    return;
  }
  setGPSBadge('waiting', 'GPS...');
  navigator.geolocation.watchPosition(onGPSSuccess, onGPSError, {
    enableHighAccuracy: true,
    maximumAge: 4000,
    timeout: 15000,
  });
}

function onGPSSuccess(pos) {
  currentPos = pos;
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const acc = Math.round(pos.coords.accuracy);

  document.getElementById('lat-val').textContent = lat.toFixed(6);
  document.getElementById('lng-val').textContent = lng.toFixed(6);
  document.getElementById('lat-val').classList.add('live');
  document.getElementById('lng-val').classList.add('live');

  const pct = Math.max(5, Math.min(100, 100 - (acc / 60) * 100));
  document.getElementById('acc-fill').style.width = pct + '%';
  document.getElementById('acc-text').textContent = '±' + acc + 'm precisão';

  setGPSBadge('active', '±' + acc + 'm');
}

function onGPSError(err) {
  setGPSBadge('error', 'ERRO GPS');
  document.getElementById('acc-text').textContent = 'permita acesso ao GPS';
}

function setGPSBadge(state, label) {
  const badge = document.getElementById('gps-badge');
  badge.className = 'gps-badge ' + state;
  document.getElementById('gps-label').textContent = label;
}

// ── SAVE ─────────────────────────────────────────────────────────────────────
function saveLocation() {
  if (!currentPos) {
    showToast('Aguarde o GPS obter sua posição');
    return;
  }
  const nameEl = document.getElementById('point-name');
  const name = nameEl.value.trim() || 'Meu carro';

  const point = {
    id: Date.now(),
    name,
    lat: currentPos.coords.latitude,
    lng: currentPos.coords.longitude,
    accuracy: Math.round(currentPos.coords.accuracy),
    timestamp: Date.now(),
    timeFormatted: new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }),
  };

  savedPoints.unshift(point);
  persist();
  nameEl.value = '';

  const btn = document.getElementById('btn-save');
  btn.textContent = '✓ Salvo!';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> Salvar localização';
    btn.disabled = false;
  }, 2000);

  renderLastSaved();
  renderHistory();
  showToast('"' + name + '" salvo!');
}

// ── NAVIGATE ─────────────────────────────────────────────────────────────────
function navigateTo(point) {
  if (!point) return;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=walking`;
  window.open(url, '_blank');
}

// ── DELETE ───────────────────────────────────────────────────────────────────
function deletePoint(id) {
  savedPoints = savedPoints.filter(p => p.id !== id);
  persist();
  renderLastSaved();
  renderHistory();
  showToast('Ponto removido');
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function renderLastSaved() {
  const el = document.getElementById('last-saved');
  if (!savedPoints.length) { el.style.display = 'none'; return; }
  const p = savedPoints[0];
  el.style.display = 'block';
  document.getElementById('last-name').textContent = p.name;
  document.getElementById('last-time').textContent = p.timeFormatted;
  document.getElementById('last-coords').textContent =
    p.lat.toFixed(6) + ', ' + p.lng.toFixed(6);
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const count = document.getElementById('history-count');
  count.textContent = savedPoints.length + ' ' + (savedPoints.length === 1 ? 'ponto' : 'pontos');

  if (!savedPoints.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◎</div>
        <p>Nenhum ponto salvo ainda.</p>
        <p class="empty-sub">Estacione, salve e encontre seu carro sempre.</p>
      </div>`;
    return;
  }

  list.innerHTML = savedPoints.map(p => `
    <div class="history-card">
      <div class="history-card-header">
        <span class="history-name">${escHtml(p.name)}</span>
        <span class="history-time">${p.timeFormatted}</span>
      </div>
      <div class="history-coords">${p.lat.toFixed(6)}, ${p.lng.toFixed(6)} · ±${p.accuracy}m</div>
      <div class="history-actions">
        <button class="btn-hist-nav" onclick="navigateTo(savedPoints.find(x=>x.id===${p.id}))">
          Navegar até aqui
        </button>
        <button class="btn-hist-del" onclick="deletePoint(${p.id})">Remover</button>
      </div>
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function persist() {
  localStorage.setItem('ondemeucarro_points', JSON.stringify(savedPoints));
}

// ── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ── SERVICE WORKER ───────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── INIT ─────────────────────────────────────────────────────────────────────
renderLastSaved();
renderHistory();
initGPS();
