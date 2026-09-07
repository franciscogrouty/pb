/* ============================================================
   Premium Brands · eCommerce B2B — Prototipo (demo)
   Front-end únicamente. Datos de ejemplo.
   Login, pago y WMS/facturación están simulados.
   ============================================================ */

const CONFIG = {
  minTicket: 100000,          // ticket mínimo por compra
  clientDiscount: 0.15,       // 15% para clientes con cuenta
  demoUser: 'cliente',
  demoPass: 'premium'
};

// Tonos de botella por categoría (sobrios, alineados a la marca)
const TONE = {
  Vinos:      { glass:'#6E3B3B', label:'#EFEADF' },
  Destilados: { glass:'#8A5A2B', label:'#EFEADF' },
  Espumantes: { glass:'#9A8A5A', label:'#EFEADF' }
};

// Catálogo de ejemplo (precio = lista pública)
const PRODUCTS = [
  { id:'p1', name:'Vino Reserva Tinto 2019',      cat:'Vinos',      price:14900 },
  { id:'p2', name:'Gran Reserva Carménère',       cat:'Vinos',      price:22900 },
  { id:'p3', name:'Sauvignon Blanc',              cat:'Vinos',      price:12900 },
  { id:'p4', name:'Espumante Brut',               cat:'Espumantes', price:18500 },
  { id:'p5', name:'Espumante Rosé',               cat:'Espumantes', price:19900 },
  { id:'p6', name:'Whisky 12 años',               cat:'Destilados', price:34900 },
  { id:'p7', name:'Whisky 18 años',               cat:'Destilados', price:59900 },
  { id:'p8', name:'Gin Premium',                  cat:'Destilados', price:22400 },
  { id:'p9', name:'Ron Añejo 8 años',             cat:'Destilados', price:27900 },
  { id:'p10',name:'Pisco Reservado',              cat:'Destilados', price:15900 }
];

const state = {
  cart: {},          // { id: qty }
  isClient: false,
  clientName: '',
  category: 'Todos',
  query: ''
};

/* ---------- utilidades ---------- */
const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });
const money = n => CLP.format(Math.round(n));
const roundTo = (n, step=10) => Math.round(n/step)*step;
const $ = sel => document.querySelector(sel);

function clientPrice(p){ return roundTo(p.price * (1 - CONFIG.clientDiscount)); }
function unitPrice(p){ return state.isClient ? clientPrice(p) : p.price; }

function bottleSVG(cat){
  const t = TONE[cat] || TONE.Destilados;
  return `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <rect x="25" y="4" width="10" height="8" rx="2" fill="${t.glass}"/>
    <rect x="26.5" y="11" width="7" height="16" fill="${t.glass}"/>
    <path d="M20 40c0-8 6.5-11 6.5-15v-1h7v1c0 4 6.5 7 6.5 15v66c0 3-2 5-5 5H25c-3 0-5-2-5-5z" fill="${t.glass}"/>
    <rect x="22.5" y="60" width="15" height="26" rx="2" fill="${t.label}" opacity="0.92"/>
  </svg>`;
}

function persist(){ try{ localStorage.setItem('pb_cart', JSON.stringify(state.cart)); }catch(e){} }
function restore(){ try{ const c = JSON.parse(localStorage.getItem('pb_cart')||'{}'); if(c && typeof c==='object') state.cart = c; }catch(e){} }

/* ---------- carrito ---------- */
function cartCount(){ return Object.values(state.cart).reduce((a,b)=>a+b,0); }
function cartSubtotal(){
  return Object.entries(state.cart).reduce((sum,[id,q])=>{
    const p = PRODUCTS.find(x=>x.id===id); return p ? sum + unitPrice(p)*q : sum;
  },0);
}
function addToCart(id){ state.cart[id] = (state.cart[id]||0) + 1; afterCartChange(); }
function setQty(id, q){ if(q<=0){ delete state.cart[id]; } else { state.cart[id]=q; } afterCartChange(); }

function afterCartChange(){ persist(); renderGrid(); renderCart(); updateHeader(); }

/* ---------- render: filtros ---------- */
function renderFilters(){
  const cats = ['Todos', ...Array.from(new Set(PRODUCTS.map(p=>p.cat)))];
  $('#filters').innerHTML = cats.map(c =>
    `<button class="chip ${state.category===c?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');
}

/* ---------- render: grilla ---------- */
function visibleProducts(){
  const q = state.query.trim().toLowerCase();
  return PRODUCTS.filter(p =>
    (state.category==='Todos' || p.cat===state.category) &&
    (!q || p.name.toLowerCase().includes(q))
  );
}
function renderGrid(){
  const items = visibleProducts();
  $('#emptyState').hidden = items.length !== 0;
  $('#grid').innerHTML = items.map(p=>{
    const inCart = state.cart[p.id]||0;
    const showOld = state.isClient;
    const priceBlock = showOld
      ? `<span class="price">${money(clientPrice(p))}</span>
         <span class="price-old">${money(p.price)}</span>
         <span class="price-tag">−15%</span>`
      : `<span class="price">${money(p.price)}</span>`;
    const action = inCart
      ? `<div class="qty" data-id="${p.id}">
           <button data-act="dec" aria-label="Quitar uno">−</button>
           <span>${inCart} en carrito</span>
           <button data-act="inc" aria-label="Agregar uno">+</button>
         </div>`
      : `<button class="add" data-add="${p.id}">Agregar</button>`;
    return `<article class="card">
      <div class="card-img">${bottleSVG(p.cat)}</div>
      <div class="card-body">
        <span class="card-cat">${p.cat}</span>
        <h3 class="card-name">${p.name}</h3>
        <div class="price-row">${priceBlock}</div>
        ${action}
      </div>
    </article>`;
  }).join('');
}

/* ---------- render: carrito ---------- */
function renderCart(){
  const ids = Object.keys(state.cart);
  const box = $('#cartItems');
  if(ids.length===0){
    box.innerHTML = `<p class="cart-empty">Tu carrito está vacío.</p>`;
  } else {
    box.innerHTML = ids.map(id=>{
      const p = PRODUCTS.find(x=>x.id===id); if(!p) return '';
      const q = state.cart[id];
      return `<div class="ci">
        <div class="ci-thumb">${bottleSVG(p.cat)}</div>
        <div class="ci-main">
          <div class="ci-name">${p.name}</div>
          <div class="ci-price">${money(unitPrice(p))} c/u</div>
          <div class="ci-controls" data-id="${id}">
            <button data-act="dec" aria-label="Quitar uno">−</button>
            <span>${q}</span>
            <button data-act="inc" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <div class="ci-line">${money(unitPrice(p)*q)}</div>
      </div>`;
    }).join('');
  }
  const sub = cartSubtotal();
  $('#cartSubtotal').textContent = money(sub);

  const hint = $('#minHint');
  const btn = $('#checkoutBtn');
  if(sub === 0){
    hint.textContent = ''; hint.className = 'min-hint';
    btn.disabled = true;
  } else if(sub < CONFIG.minTicket){
    hint.textContent = `Te faltan ${money(CONFIG.minTicket - sub)} para el mínimo de compra de ${money(CONFIG.minTicket)}.`;
    hint.className = 'min-hint warn';
    btn.disabled = true;
  } else {
    hint.textContent = `✓ Cumples el mínimo de compra de ${money(CONFIG.minTicket)}.`;
    hint.className = 'min-hint ok';
    btn.disabled = false;
  }
}

/* ---------- header / sesión ---------- */
function updateHeader(){
  $('#cartCount').textContent = cartCount();
  const badge = $('#listBadge');
  const acc = $('#accountBtn');
  if(state.isClient){
    badge.textContent = 'Lista cliente'; badge.className = 'list-badge list-client';
    acc.textContent = 'Cerrar sesión';
    $('#clientName').textContent = state.clientName || 'Cartera Premium';
    $('#clientBanner').hidden = false;
  } else {
    badge.textContent = 'Lista pública'; badge.className = 'list-badge list-public';
    acc.textContent = 'Mi cuenta';
    $('#clientBanner').hidden = true;
  }
}

/* ---------- drawer / modales ---------- */
function openCart(){ $('#cart').hidden=false; $('#overlay').hidden=false; }
function closeCart(){ $('#cart').hidden=true; $('#overlay').hidden=true; }
function openLogin(){ $('#loginError').hidden=true; $('#user').value=''; $('#pass').value=''; $('#loginModal').hidden=false; }
function closeLogin(){ $('#loginModal').hidden=true; }

function doLogin(){
  const u = $('#user').value.trim();
  const p = $('#pass').value;
  if(!u || !p){ $('#loginError').hidden = false; return; }  // solo pedimos que no estén vacíos
  state.isClient = true;
  state.clientName = u;
  closeLogin(); afterCartChange();
}
function logout(){ state.isClient=false; afterCartChange(); }

function checkout(){
  const total = cartSubtotal();
  if(total < CONFIG.minTicket) return;
  const n = 'PB-' + new Date().getFullYear() + '-' + String(Math.floor(1000+Math.random()*8999));
  $('#orderNo').textContent = n;
  $('#orderTotal').textContent = money(total);
  state.cart = {}; persist(); renderGrid(); renderCart(); updateHeader();
  closeCart();
  $('#okModal').hidden = false;
}

/* ---------- eventos ---------- */
function bind(){
  // grilla: agregar / +/-
  $('#grid').addEventListener('click', e=>{
    const add = e.target.closest('[data-add]');
    if(add){ addToCart(add.dataset.add); return; }
    const qbox = e.target.closest('.qty');
    if(qbox){
      const btn = e.target.closest('button'); if(!btn) return;
      const id = qbox.dataset.id, cur = state.cart[id]||0;
      setQty(id, btn.dataset.act==='inc' ? cur+1 : cur-1);
    }
  });
  // carrito: +/-
  $('#cartItems').addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const ctr = e.target.closest('.ci-controls'); if(!ctr) return;
    const id = ctr.dataset.id, cur = state.cart[id]||0;
    setQty(id, btn.dataset.act==='inc' ? cur+1 : cur-1);
  });
  // filtros
  $('#filters').addEventListener('click', e=>{
    const c = e.target.closest('[data-cat]'); if(!c) return;
    state.category = c.dataset.cat; renderFilters(); renderGrid();
  });
  // búsqueda
  $('#search').addEventListener('input', e=>{ state.query = e.target.value; renderGrid(); });
  // header
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#overlay').addEventListener('click', closeCart);
  $('#accountBtn').addEventListener('click', ()=> state.isClient ? logout() : openLogin());
  // login
  $('#loginSubmit').addEventListener('click', doLogin);
  $('#pass').addEventListener('keydown', e=>{ if(e.key==='Enter') doLogin(); });
  document.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', closeLogin));
  $('#loginModal').addEventListener('click', e=>{ if(e.target.id==='loginModal') closeLogin(); });
  // checkout
  $('#checkoutBtn').addEventListener('click', checkout);
  $('#okClose').addEventListener('click', ()=> $('#okModal').hidden=true);
  // escape
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ closeCart(); closeLogin(); $('#okModal').hidden=true; }
  });
}

/* ---------- init ---------- */
function init(){
  restore();
  $('#minLabel').textContent = money(CONFIG.minTicket);
  renderFilters();
  renderGrid();
  renderCart();
  updateHeader();
  bind();
}
document.addEventListener('DOMContentLoaded', init);
