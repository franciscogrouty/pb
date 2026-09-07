# Premium Brands · eCommerce B2B — Prototipo (Demo)

Prototipo **front-end** del canal de compra B2B para puntos de venta de Premium Brands.
Sitio estático (HTML + CSS + JS), listo para desplegar en **Vercel** sin configuración.

## Qué muestra la demo
- **Catálogo** con filtros por categoría y búsqueda.
- **Precios diferenciados**: lista pública vs. lista cliente (con descuento y etiqueta).
- **Acceso de clientes** (login) que activa precios/promos exclusivos.
- **Carrito** con la regla de **ticket mínimo de $100.000** por compra.
- **Confirmación de pedido** con la lógica "ingresa al WMS y se emite factura".

## Importante (alcance del prototipo)
- Productos, precios y el descuento de cliente son **datos de ejemplo**.
- El **login** es demo (credenciales fijas), **no** es autenticación real.
- El **pago** y la conexión con **WMS y facturación** están **simulados**.
  Esa es la parte de integración que se construye en el proyecto real.

**Credenciales demo:** usuario `cliente` · contraseña `premium`

## Cómo desplegar en Vercel

### Opción A — Dashboard (sin instalar nada)
1. Entra a https://vercel.com y crea un proyecto nuevo ("Add New… → Project").
2. Sube esta carpeta (o conéctala desde un repositorio de GitHub).
3. Framework Preset: **Other**. Root Directory: la carpeta del proyecto. Sin build.
4. Deploy → obtienes una URL pública (p. ej. `premiumbrands-demo.vercel.app`).

### Opción B — CLI
```bash
npm i -g vercel
cd pb-mvp
vercel          # primer deploy (preview)
vercel --prod   # a producción
```

### Ver en local (opcional)
```bash
npx serve .
# o simplemente abre index.html en el navegador
```

## Personalizar
Todo en `app.js`, arriba del archivo:
- `CONFIG.minTicket` → ticket mínimo (hoy $100.000).
- `CONFIG.clientDiscount` → descuento de cliente (hoy 15%).
- `CONFIG.demoUser` / `CONFIG.demoPass` → credenciales demo.
- `PRODUCTS` → catálogo (nombre, categoría, precio). Reemplazar por productos reales.

Colores y tipografías de marca están en `styles.css` (variables `:root`).

## Archivos
```
pb-mvp/
├── index.html    · estructura
├── styles.css    · identidad de marca Premium Brands
├── app.js        · datos de ejemplo + lógica (carrito, login, checkout)
└── README.md
```

## Del prototipo al producto
Cuando se apruebe, la versión productiva incorpora: autenticación real de clientes,
catálogo administrable, medios de pago / crédito B2B, y las integraciones con el
**WMS** y la **facturación electrónica** (SII/DTE), sobre una base tipo Next.js.
