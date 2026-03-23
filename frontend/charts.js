const API = 'http://127.0.0.1:5000/api';

const COLORS = [
  '#e94560','#3b82f6','#22c55e','#f59e0b',
  '#8b5cf6','#06b6d4','#f97316','#ec4899'
];

const charts = {};

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function animateValue(id, value, isFloat = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const end = parseFloat(value);
  const duration = 1000;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * ease;
    el.textContent = isFloat ? current.toFixed(1) : Math.round(current).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function makeChart(id, type, labels, values, label, colors) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const bgColors = colors || (type === 'doughnut' || type === 'pie' ? COLORS : COLORS[0]);

  const config = {
    type,
    data: {
      labels,
      datasets: [{
        label: label || '',
        data: values,
        backgroundColor: bgColors,
        borderColor: type === 'bar' ? bgColors : undefined,
        borderRadius: type === 'bar' ? 8 : 0,
        borderWidth: type === 'doughnut' ? 3 : 0,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      plugins: {
        legend: {
          display: type === 'doughnut' || type === 'pie',
          position: 'bottom',
          labels: { padding: 16, font: { size: 12 }, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => `  ${ctx.parsed.y ?? ctx.parsed}: ${label || 'count'}`
          }
        }
      },
      scales: type === 'bar' ? {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      } : {}
    }
  };
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(ctx, config);
}

function updateChart(id, labels, values) {
  if (!charts[id]) return;
  charts[id].data.labels = labels;
  charts[id].data.datasets[0].data = values;
  charts[id].update('active');
}

// Sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const section = item.dataset.section;

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(`section-${section}`).classList.add('active');
    document.getElementById('page-title').textContent = item.querySelector('.nav-text').textContent;
  });
});

// Sidebar toggle
document.getElementById('toggle-sidebar').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
});

async function loadFilterOptions() {
  const opts = await fetchJSON(`${API}/filter-options`);
  const cityEl    = document.getElementById('filter-city');
  const trafficEl = document.getElementById('filter-traffic');
  const weatherEl = document.getElementById('filter-weather');
  opts.cities.forEach(c  => { const o = document.createElement('option'); o.value = c; o.textContent = c; cityEl.appendChild(o); });
  opts.traffic.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; trafficEl.appendChild(o); });
  opts.weather.forEach(w => { const o = document.createElement('option'); o.value = w; o.textContent = w; weatherEl.appendChild(o); });
}

async function applyFilters() {
  const city    = document.getElementById('filter-city').value;
  const traffic = document.getElementById('filter-traffic').value;
  const weather = document.getElementById('filter-weather').value;

  const data = await fetchJSON(`${API}/filtered?city=${city}&traffic=${traffic}&weather=${weather}`);

  animateValue('total-orders', data.total_orders);
  animateValue('avg-delivery', data.avg_delivery_time, true);
  animateValue('avg-rating',   data.avg_rating, true);
  document.getElementById('total-badge').textContent = data.total_orders.toLocaleString();

  updateChart('vehicleChart',   Object.keys(data.vehicle),    Object.values(data.vehicle));
  updateChart('weatherChart',   Object.keys(data.weather),    Object.values(data.weather));
  updateChart('trafficChart',   Object.keys(data.traffic),    Object.values(data.traffic));
  updateChart('orderTypeChart', Object.keys(data.order_type), Object.values(data.order_type));
  updateChart('cityChart',      Object.keys(data.city),       Object.values(data.city));
}

async function init() {
  await loadFilterOptions();

  const summary = await fetchJSON(`${API}/summary`);
  animateValue('total-orders', summary.total_orders);
  animateValue('avg-delivery', summary.avg_delivery_time, true);
  animateValue('avg-rating',   summary.avg_rating, true);
  animateValue('avg-age',      summary.avg_age, true);
  document.getElementById('total-badge').textContent = summary.total_orders.toLocaleString();

  const filtered = await fetchJSON(`${API}/filtered?city=All&traffic=All&weather=All`);
  makeChart('vehicleChart',   'bar',      Object.keys(filtered.vehicle),    Object.values(filtered.vehicle),    'Orders', COLORS[1]);
  makeChart('weatherChart',   'doughnut', Object.keys(filtered.weather),    Object.values(filtered.weather));
  makeChart('trafficChart',   'doughnut', Object.keys(filtered.traffic),    Object.values(filtered.traffic));
  makeChart('orderTypeChart', 'bar',      Object.keys(filtered.order_type), Object.values(filtered.order_type), 'Orders', COLORS[2]);
  makeChart('cityChart',      'bar',      Object.keys(filtered.city),       Object.values(filtered.city),       'Orders', COLORS[3]);

  const dw = await fetchJSON(`${API}/delivery-time-by-weather`);
  makeChart('deliveryWeatherChart', 'bar', dw.labels, dw.values, 'Avg min', COLORS[0]);

  const dt = await fetchJSON(`${API}/delivery-time-by-traffic`);
  makeChart('deliveryTrafficChart', 'bar', dt.labels, dt.values, 'Avg min', COLORS[4]);

  const fest = await fetchJSON(`${API}/festival-comparison`);
  makeChart('festivalChart', 'bar', fest.labels, fest.values, 'Avg min', [COLORS[1], COLORS[2]]);

  // Multiple deliveries
  const multiRes = await fetchJSON(`${API}/filtered?city=All&traffic=All&weather=All`);
  makeChart('ratingChart', 'bar', Object.keys(filtered.vehicle), Object.values(filtered.vehicle), 'Count', COLORS[5]);

  // Add backend routes needed
  const ratingRes = await fetch(`${API}/rating-distribution`);
  const ratingData = await ratingRes.json();
  makeChart('ratingChart', 'bar', ratingData.labels, ratingData.values, 'Count', COLORS[1]);

  document.getElementById('filter-city').addEventListener('change', applyFilters);
  document.getElementById('filter-traffic').addEventListener('change', applyFilters);
  document.getElementById('filter-weather').addEventListener('change', applyFilters);
  document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('filter-city').value    = 'All';
    document.getElementById('filter-traffic').value = 'All';
    document.getElementById('filter-weather').value = 'All';
    applyFilters();
  });
}

init();