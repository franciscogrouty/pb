/* ============================================================
   Premium Brands · Backoffice (demo)
   Lee/escribe los mismos datos que la tienda (localStorage).
   ============================================================ */

const ESTADOS = ['Nuevo', 'En preparación', 'Despachado', 'Facturado'];
const LEAD_EST = ['Nuevo', 'Contactado', 'Descartado'];

// Datos base para generar pedidos de ejemplo
const CAT = [
  ['Vino Reserva Tinto 2019', 14900], ['Gran Reserva Carménère', 22900],
  ['Sauvignon Blanc', 12900], ['Espumante Brut', 18500], ['Espumante Rosé', 19900],
  ['Whisky 12 años', 34900], ['Whisky 18 años', 59900], ['Gin Premium', 22400],
  ['Ron Añejo 8 años', 27900], ['Pisco Reservado', 15900]
];
const VEND = ['Camila Rojas', 'Matías Fuentes', 'Valentina Soto'];
const RAZ = ['Botillería Los Andes SpA', 'Minimarket El Sol Ltda', 'Distribuidora La Viña SpA', 'Almacén Doña Rosa EIRL', 'Licorería Centro SpA'];
const NOM = ['Juan Pérez', 'María González', 'Pedro Soto', 'Ana Muñoz', 'Luis Rojas'];

/* ---------- almacenamiento ---------- */
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
const save = (k, a) => { try { localStorage.setItem(k, JSON.stringify(a)); } catch (e) {} };
const loadOrders = () => load('pb_orders');
const saveOrders = (a) => save('pb_orders', a);
const loadLeads = () => load('pb_leads');
const saveLeads = (a) => save('pb_leads', a);

/* ---------- utilidades ---------- */
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const money = n => CLP.format(Math.round(n || 0));
const $ = s => document.querySelector(s);
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function fecha(ts) {
  const d = new Date(ts || Date.now());
  return d.toLocaleDateString('es-CL') + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- generación de ejemplos ---------- */
function makeFakeOrder(offsetMin = 0) {
  const tipo = Math.random() < 0.5 ? 'Registrado' : 'Público';
  const nItems = 2 + Math.floor(Math.random() * 3);
  const items = [];
  let total = 0;
  for (let i = 0; i < nItems; i++) {
    const [name, price] = rnd(CAT);
    const unit = tipo === 'Registrado' ? Math.round(price * 0.85 / 10) * 10 : price;
    const qty = 1 + Math.floor(Math.random() * 3);
    items.push({ name, qty, price: unit });
    total += unit * qty;
  }
  return {
    n: 'PB-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 8999)),
    ts: Date.now() - offsetMin * 60000,
    tipo,
    total,
    items,
    estado: rnd(ESTADOS),
    vendedor: tipo === 'Público' ? rnd(VEND) : null,
    cliente: tipo === 'Registrado' ? ('Cliente ' + rnd(NOM)) : rnd(RAZ),
    contacto: null
  };
}
function makeFakeLead(offsetMin = 0) {
  const nombre = rnd(NOM);
  return {
    ts: Date.now() - offsetMin * 60000,
    nombre,
    rut: '1' + (2 + Math.floor(Math.random() * 7)) + '.' + Math.floor(100 + Math.random() * 899) + '.' + Math.floor(100 + Math.random() * 899) + '-' + Math.floor(Math.random() * 10),
    razon: rnd(RAZ),
    rutEmp: '76.' + Math.floor(100 + Math.random() * 899) + '.' + Math.floor(100 + Math.random() * 899) + '-K',
    fono: '+56 9 ' + Math.floor(1000 + Math.random() * 8999) + ' ' + Math.floor(1000 + Math.random() * 8999),
    email: nombre.toLowerCase().replace(/[^a-z]/g, '.') + '@negocio.cl',
    estado: 'Nuevo'
  };
}

/* ---------- render ---------- */
function renderStats() {
  const o = loadOrders(), l = loadLeads();
  const monto = o.reduce((s, x) => s + (x.total || 0), 0);
  const nuevos = o.filter(x => x.estado === 'Nuevo').length;
  const cards = [
    [o.length, 'Pedidos'],
    [money(monto), 'Monto total'],
    [nuevos, 'Pedidos nuevos'],
    [l.filter(x => x.estado === 'Nuevo').length, 'Leads por contactar']
  ];
  $('#stats').innerHTML = cards.map(c =>
    `<div class="stat"><div class="stat-n">${c[0]}</div><div class="stat-l">${c[1]}</div></div>`
  ).join('');
}

function renderOrders() {
  const o = loadOrders().slice().sort((a, b) => b.ts - a.ts);
  const body = $('#ordersBody');
  if (!o.length) { body.innerHTML = `<tr class="empty-row"><td colspan="9">Aún no hay pedidos. Usa “Cargar datos de ejemplo” o crea uno.</td></tr>`; return; }
  body.innerHTML = o.map(x => {
    const items = (x.items || []).map(i => `${esc(i.name)} ×${i.qty}`).join(', ');
    const badge = x.tipo === 'Registrado' ? '<span class="badge b-reg">Registrado</span>' : '<span class="badge b-pub">Público</span>';
    const sel = `<select class="est-sel" data-order="${esc(x.n)}">` +
      ESTADOS.map(e => `<option ${e === x.estado ? 'selected' : ''}>${e}</option>`).join('') + `</select>`;
    return `<tr>
      <td class="mono">${esc(x.n)}</td>
      <td class="mono">${fecha(x.ts)}</td>
      <td>${badge}</td>
      <td>${esc(x.cliente)}</td>
      <td class="admin-items">${esc(items)}</td>
      <td class="mono"><strong>${money(x.total)}</strong></td>
      <td>${esc(x.vendedor || '—')}</td>
      <td>${sel}</td>
      <td><button class="lnk-del" data-del-order="${esc(x.n)}">Eliminar</button></td>
    </tr>`;
  }).join('');
}

function renderLeads() {
  const l = loadLeads().slice().sort((a, b) => b.ts - a.ts);
  const body = $('#leadsBody');
  if (!l.length) { body.innerHTML = `<tr class="empty-row"><td colspan="8">Aún no hay registros.</td></tr>`; return; }
  body.innerHTML = l.map((x, i) => {
    const sel = `<select class="est-sel" data-lead="${x.ts}">` +
      LEAD_EST.map(e => `<option ${e === x.estado ? 'selected' : ''}>${e}</option>`).join('') + `</select>`;
    return `<tr>
      <td class="mono">${fecha(x.ts)}</td>
      <td>${esc(x.nombre)}</td>
      <td>${esc(x.razon)}</td>
      <td class="mono">${esc(x.rutEmp)}</td>
      <td class="mono">${esc(x.fono)}</td>
      <td>${esc(x.email)}</td>
      <td>${sel}</td>
      <td><button class="lnk-del" data-del-lead="${x.ts}">Eliminar</button></td>
    </tr>`;
  }).join('');
}

function renderAll() { renderStats(); renderOrders(); renderLeads(); }

/* ---------- acciones ---------- */
function bind() {
  $('#seedBtn').addEventListener('click', () => {
    const o = loadOrders(); for (let i = 0; i < 5; i++) o.push(makeFakeOrder(i * 37)); saveOrders(o);
    const l = loadLeads(); for (let i = 0; i < 3; i++) l.push(makeFakeLead(i * 53)); saveLeads(l);
    renderAll();
  });
  $('#fakeBtn').addEventListener('click', () => {
    const o = loadOrders(); o.push(makeFakeOrder()); saveOrders(o); renderAll();
  });
  $('#clearBtn').addEventListener('click', () => {
    if (!confirm('¿Vaciar todos los pedidos y registros de la demo?')) return;
    saveOrders([]); saveLeads([]); renderAll();
  });

  // pedidos: cambio de estado / eliminar
  $('#ordersBody').addEventListener('change', e => {
    const sel = e.target.closest('[data-order]'); if (!sel) return;
    const o = loadOrders(); const it = o.find(x => x.n === sel.dataset.order);
    if (it) { it.estado = sel.value; saveOrders(o); renderStats(); }
  });
  $('#ordersBody').addEventListener('click', e => {
    const b = e.target.closest('[data-del-order]'); if (!b) return;
    saveOrders(loadOrders().filter(x => x.n !== b.dataset.delOrder)); renderAll();
  });

  // leads: cambio de estado / eliminar
  $('#leadsBody').addEventListener('change', e => {
    const sel = e.target.closest('[data-lead]'); if (!sel) return;
    const l = loadLeads(); const it = l.find(x => String(x.ts) === sel.dataset.lead);
    if (it) { it.estado = sel.value; saveLeads(l); renderStats(); }
  });
  $('#leadsBody').addEventListener('click', e => {
    const b = e.target.closest('[data-del-lead]'); if (!b) return;
    saveLeads(loadLeads().filter(x => String(x.ts) !== b.dataset.delLead)); renderAll();
  });
}

document.addEventListener('DOMContentLoaded', () => { bind(); renderAll(); });
