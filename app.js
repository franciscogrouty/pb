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

// Vendedores de ejemplo (en producción vienen del sistema de Premium)
const VENDEDORES = [
  { nombre:'Camila',    apellido:'Rojas',    fono:'+56 9 6123 4567', email:'camila.rojas@premiumbrands.cl' },
  { nombre:'Matías',    apellido:'Fuentes',  fono:'+56 9 6234 5678', email:'matias.fuentes@premiumbrands.cl' },
  { nombre:'Valentina', apellido:'Soto',     fono:'+56 9 6345 6789', email:'valentina.soto@premiumbrands.cl' }
];

// Banners del carrusel (cambian según lista pública / cliente)
const BANNERS = {
  public: [
    { bg:'282323', kicker:'Únete', title:'Regístrate y accede a precios exclusivos', sub:'Listas y promociones especiales para puntos de venta.', cta:{ label:'Registrarse', action:'register' } },
    { bg:'3E281B', kicker:'Portafolio', title:'Conoce nuestras marcas premium', sub:'Vinos, espumantes y destilados seleccionados.', cta:{ label:'Ver catálogo', action:'cat:Todos' } },
    { bg:'645A4E', kicker:'Logística', title:'Despacho en 24 horas', sub:'Tu pedido llega rápido a tu punto de venta.' },
    { bg:'5E3A3A', kicker:'Compra directa', title:'Pedidos desde $100.000', sub:'Compra cuando quieras, sin depender de la visita.' }
  ],
  client: [
    { bg:'282323', kicker:'Exclusivo clientes', title:'−15% en todo el catálogo', sub:'Precios preferentes aplicados a tu cuenta.', cta:{ label:'Ver ofertas', action:'cat:Todos' } },
    { bg:'5E3A3A', kicker:'Novedades', title:'Nuevas marcas este mes', sub:'Suma novedades a tu vitrina.', cta:{ label:'Ver vinos', action:'cat:Vinos' } },
    { bg:'645A4E', kicker:'Promo', title:'Espumantes para el fin de semana', sub:'Reponer stock nunca fue tan fácil.', cta:{ label:'Ver espumantes', action:'cat:Espumantes' } },
    { bg:'3E281B', kicker:'Acompañamiento', title:'Tu vendedor, siempre disponible', sub:'Gestiona tus pedidos con respaldo.' }
  ]
};
let bannerMode = null, bannerTimer = null, bannerIdx = 0;

function renderBanners(){
  const mode = state.isClient ? 'client' : 'public';
  if(mode === bannerMode) return;   // no reiniciar si no cambió
  bannerMode = mode; bannerIdx = 0;
  const list = BANNERS[mode];
  const car = $('#carousel');
  car.innerHTML =
    '<div class="carousel-track">' + list.map((b,i)=>
      `<div class="slide ${i===0?'active':''}" style="background:#${b.bg}">
        <div class="slide-kicker">${b.kicker}</div>
        <div class="slide-title">${b.title}</div>
        <div class="slide-sub">${b.sub}</div>
        ${b.cta ? `<button class="slide-cta" data-action="${b.cta.action}">${b.cta.label}</button>` : ''}
      </div>`).join('') + '</div>' +
    '<div class="dots">' + list.map((_,i)=>`<button class="dot ${i===0?'active':''}" data-dot="${i}" aria-label="Banner ${i+1}"></button>`).join('') + '</div>';
  car.hidden = false;
  if(bannerTimer) clearInterval(bannerTimer);
  bannerTimer = setInterval(()=> goBanner(bannerIdx+1), 4500);
}
function goBanner(i){
  const car = $('#carousel');
  const slides = car.querySelectorAll('.slide'), dots = car.querySelectorAll('.dot');
  if(!slides.length) return;
  bannerIdx = (i + slides.length) % slides.length;
  slides.forEach((s,k)=> s.classList.toggle('active', k===bannerIdx));
  dots.forEach((d,k)=> d.classList.toggle('active', k===bannerIdx));
}

/* ---------- utilidades ---------- */
const CLP = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });
const money = n => CLP.format(Math.round(n));
const roundTo = (n, step=10) => Math.round(n/step)*step;
const $ = sel => document.querySelector(sel);
const val = id => { const el = $('#'+id); return el ? el.value.trim() : ''; };

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

/* almacenamiento compartido con el backoffice (admin.html) */
function loadOrders(){ try{ return JSON.parse(localStorage.getItem('pb_orders')||'[]'); }catch(e){ return []; } }
function saveOrders(a){ try{ localStorage.setItem('pb_orders', JSON.stringify(a)); }catch(e){} }
function loadLeads(){ try{ return JSON.parse(localStorage.getItem('pb_leads')||'[]'); }catch(e){ return []; } }
function saveLeads(a){ try{ localStorage.setItem('pb_leads', JSON.stringify(a)); }catch(e){} }

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

  // Diferencia según tipo de cliente
  btn.textContent = state.isClient ? 'Confirmar pedido' : 'Ir a pagar';
  $('#cartNote').innerHTML = state.isClient
    ? 'WMS · Premium Brands cobra y factura · despacho en 24 h. <em>(Simulado en esta demo.)</em>'
    : 'Pago en línea · despacho 24 h · el vendedor asignado envía la factura. <em>(Simulado en esta demo.)</em>';
  const pa = $('#payAmount'); if(pa) pa.textContent = money(sub);
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
  renderBanners();
}

/* ---------- drawer / modales ---------- */
function openCart(){ closePay(); $('#cart').hidden=false; $('#overlay').hidden=false; }
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

/* ---------- pago (solo clientes NO registrados) ---------- */
function openPay(){
  $('#payError').hidden = true;
  ['bName','bRut','bRazon','bRutEmp','bFono','bEmail','payName','payCard','payExp','payCvv'].forEach(id=>{ const el=$('#'+id); if(el) el.value=''; });
  $('#payAmount').textContent = money(cartSubtotal());
  $('#cartTitle').textContent = 'Pago';
  $('#cartView').hidden = true;
  $('#payView').hidden = false;
}
function closePay(){
  $('#payView').hidden = true;
  $('#cartView').hidden = false;
  $('#cartTitle').textContent = 'Tu pedido';
  const b = $('#paySubmit'); if(b){ b.disabled=false; b.innerHTML = 'Pagar <span id="payAmount">'+money(cartSubtotal())+'</span>'; }
}
function submitPay(){
  const req = ['bName','bRut','bRazon','bRutEmp','bFono','bEmail','payName','payCard','payExp','payCvv'];
  const filled = req.every(id=>{ const el=$('#'+id); return el && el.value.trim().length>0; });
  if(!filled){ $('#payError').hidden=false; return; }
  const b = $('#paySubmit');
  b.disabled = true; b.textContent = 'Procesando pago…';
  setTimeout(()=> completeOrder(true), 900);   // pago simulado
}

/* checkout: registrado = crédito directo; no registrado = pago web */
function checkoutClick(){
  if(cartSubtotal() < CONFIG.minTicket) return;
  if(state.isClient) completeOrder(false);
  else openPay();
}

function completeOrder(paid){
  const total = cartSubtotal();
  const n = 'PB-' + new Date().getFullYear() + '-' + String(Math.floor(1000+Math.random()*8999));
  const items = Object.entries(state.cart).map(([id,q])=>{ const p=PRODUCTS.find(x=>x.id===id); return {name:p.name, qty:q, price:unitPrice(p)}; });
  $('#orderNo').textContent = n;
  $('#orderTotal').textContent = money(total);

  const order = { n, ts:Date.now(), tipo: state.isClient?'Registrado':'Público', total, items, estado:'Nuevo', vendedor:null, cliente:'', contacto:null };

  if(state.isClient){
    order.cliente = state.clientName || 'Cliente registrado';
    $('#okTitle').textContent = '¡Pedido recibido!';
    $('#okText').textContent = 'El pedido ingresa al WMS de Premium y Premium Brands emite la factura. Premium Brands se encargará del cobro y se emitirá la factura correspondiente.';
    $('#okExtra').innerHTML = '<div class="ship">Tu pedido se enviará dentro de <strong>24 horas</strong>.</div>';
    $('#okExtra').hidden = false;
  } else {
    const buyer = { nombre:val('bName'), rut:val('bRut'), razon:val('bRazon'), rutEmp:val('bRutEmp'), fono:val('bFono'), email:val('bEmail') };
    const v = VENDEDORES[Math.floor(Math.random()*VENDEDORES.length)];
    order.cliente = buyer.razon || buyer.nombre || 'Punto de venta';
    order.vendedor = v.nombre + ' ' + v.apellido;
    order.contacto = buyer;
    $('#okTitle').textContent = '¡Pago aprobado!';
    $('#okText').textContent = 'Tu pago fue aprobado y tu pedido quedó confirmado.';
    $('#okExtra').innerHTML =
      '<div class="ship">Tu pedido se enviará dentro de <strong>24 horas</strong>.</div>' +
      '<p class="ok-invoice">La factura será enviada por tu vendedor asignado.</p>' +
      '<div class="seller">' +
        '<div class="seller-h">Tu vendedor asignado</div>' +
        '<div class="seller-name">' + v.nombre + ' ' + v.apellido + '</div>' +
        '<div class="seller-row"><span>Teléfono</span>' + v.fono + '</div>' +
        '<div class="seller-row"><span>Email</span>' + v.email + '</div>' +
        '<div class="seller-note">Contacto de ejemplo para la demo.</div>' +
      '</div>';
    $('#okExtra').hidden = false;
  }

  const orders = loadOrders(); orders.push(order); saveOrders(orders);

  state.cart = {}; persist(); renderGrid(); renderCart(); updateHeader();
  closePay(); closeCart();
  $('#okModal').hidden = false;
}

/* ---------- registro (lead) ---------- */
function openReg(){
  $('#regError').hidden = true;
  ['rName','rRut','rRazon','rRutEmp','rFono','rEmail'].forEach(id=>{ const el=$('#'+id); if(el) el.value=''; });
  $('#regForm').hidden = false;
  $('#regDone').hidden = true;
  $('#regModal').hidden = false;
}
function closeReg(){ $('#regModal').hidden = true; }
function submitReg(){
  const ids = ['rName','rRut','rRazon','rRutEmp','rFono','rEmail'];
  if(!ids.every(id=>val(id).length>0)){ $('#regError').hidden = false; return; }
  const lead = { ts:Date.now(), nombre:val('rName'), rut:val('rRut'), razon:val('rRazon'), rutEmp:val('rRutEmp'), fono:val('rFono'), email:val('rEmail'), estado:'Nuevo' };
  const leads = loadLeads(); leads.push(lead); saveLeads(leads);
  $('#regForm').hidden = true;
  $('#regDone').hidden = false;
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
  // registro
  $('#registerBtn').addEventListener('click', openReg);
  $('#regSubmit').addEventListener('click', submitReg);
  $('#regDoneClose').addEventListener('click', closeReg);
  document.querySelectorAll('[data-close-reg]').forEach(b=> b.addEventListener('click', closeReg));
  $('#regModal').addEventListener('click', e=>{ if(e.target.id==='regModal') closeReg(); });
  // carrusel
  $('#carousel').addEventListener('click', e=>{
    const dot = e.target.closest('[data-dot]');
    if(dot){ goBanner(+dot.dataset.dot); return; }
    const cta = e.target.closest('[data-action]');
    if(cta){
      const a = cta.dataset.action;
      if(a === 'register'){ openReg(); }
      else if(a.indexOf('cat:') === 0){
        state.category = a.slice(4);
        renderFilters(); renderGrid();
        const head = document.querySelector('.cat-head');
        if(head && head.scrollIntoView) head.scrollIntoView({ behavior:'smooth' });
      }
    }
  });
  // checkout + pago
  $('#checkoutBtn').addEventListener('click', checkoutClick);
  $('#payBack').addEventListener('click', closePay);
  $('#paySubmit').addEventListener('click', submitPay);
  $('#okClose').addEventListener('click', ()=> $('#okModal').hidden=true);
  // escape
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ closeCart(); closeLogin(); closeReg(); $('#okModal').hidden=true; }
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
