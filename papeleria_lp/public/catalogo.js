/* ==========================================================================
   ARCHIVO: catalogo.js
   QUÉ HACE: muestra el catálogo y maneja el carrito.
     - Cualquiera ve los productos con su precio (con o sin sesión).
     - Solo con sesión aparecen "Agregar al carrito" y el carrito.
   SE CONECTA CON: /api/productos (lista de la base de datos) y /api/me (sesión).
   CARRITO: se guarda en este navegador (localStorage), separado por usuario, y
   solo guarda id y cantidad. Nombre y precio se toman siempre de la lista
   actual. Cuando se confirme el pedido, el servidor volverá a calcular
   precios y existencias desde la base de datos (el navegador no es de fiar).
   ========================================================================== */

const $ = id => document.getElementById(id);

// Icono según la categoría (si no coincide, 📦)
const ICONOS = [
    [/[uú]tiles|escolar/i, "🎒"], [/papel|cuaderno|libreta|carpeta/i, "📄"],
    [/escrit|pluma|bol[ií]grafo|l[aá]piz|marcador/i, "✏️"], [/impres|tinta|t[oó]ner/i, "🖨️"],
    [/color|arte|pintur|dibujo/i, "🎨"], [/pegament|adhesiv|cinta|tijera/i, "🧴"],
    [/oficin|mobiliario|escritorio/i, "🗂️"], [/comput|laptop|electr|gaming/i, "💻"]
];
const icono = c => (ICONOS.find(([re]) => re.test(c ?? "")) || [null, "📦"])[1];
const dinero = n => "$" + Number(n ?? 0).toFixed(2);
const ETIQUETA = { available: "Disponible", low: "Stock bajo", out: "Agotado" };
const estado = p => p.existencia <= 0 ? "out" : p.existencia <= (p.minimo ?? 5) ? "low" : "available";

function el(tag, clase, texto) {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;   // textContent evita inyectar HTML
    return e;
}

let productos = [];     // lista que llega de la base de datos
let sesion = null;      // { id, nombre, rol } si hay sesión; null si no
let carrito = [];       // [{ id, cantidad }]
let categoria = "";     // "" = todas

const prod = id => productos.find(p => p.id === id);

/* ---------- Aviso emergente ---------- */
let tToast;
function aviso(texto) {
    const t = $("toast");
    t.textContent = texto;
    t.classList.add("show");
    clearTimeout(tToast);
    tToast = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ==========================================================================
   CARRITO
   ========================================================================== */

const clave = () => "piwis_carrito_" + sesion.id;   // un carrito por usuario
function leerCarrito() {
    try { return JSON.parse(localStorage.getItem(clave())) || []; } catch (_) { return []; }
}
function guardarCarrito() {
    try { localStorage.setItem(clave(), JSON.stringify(carrito)); } catch (_) {}
}

// Quita del carrito lo que ya no existe o se agotó, y ajusta cantidades al stock
function sincronizar() {
    carrito = carrito
        .map(i => ({ id: i.id, cantidad: Math.min(Number(i.cantidad) || 0, prod(i.id)?.existencia ?? 0) }))
        .filter(i => i.cantidad > 0);
    guardarCarrito();
}

function agregar(p, n) {
    const item = carrito.find(i => i.id === p.id);
    const quiere = (item?.cantidad ?? 0) + n;
    const total = Math.min(quiere, p.existencia);
    if (item) item.cantidad = total; else carrito.push({ id: p.id, cantidad: total });
    guardarCarrito();
    renderCarrito();
    aviso(quiere > p.existencia
        ? `Solo hay ${p.existencia} disponibles de «${p.nombre}».`
        : `«${p.nombre}» agregado al carrito.`);
}

function cambiar(id, delta) {
    const item = carrito.find(i => i.id === id);
    const p = prod(id);
    if (!item || !p) return;
    item.cantidad += delta;
    if (item.cantidad > p.existencia) { item.cantidad = p.existencia; aviso(`Solo hay ${p.existencia} disponibles.`); }
    if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
    guardarCarrito();
    renderCarrito();
}

function renderCarrito() {
    const caja = $("cartItems");
    caja.replaceChildren();
    let total = 0, unidades = 0;

    carrito.forEach(i => {
        const p = prod(i.id);
        if (!p) return;
        total += p.precio * i.cantidad;
        unidades += i.cantidad;

        const fila = el("div", "item");
        const info = el("div");
        info.append(el("h4", "", p.nombre), el("div", "unit", dinero(p.precio) + " c/u"));
        fila.append(info, el("div", "linea", dinero(p.precio * i.cantidad)));

        const qty = el("div", "qty");
        const menos = el("button", "", "−"), mas = el("button", "", "+");
        menos.type = mas.type = "button";
        menos.addEventListener("click", () => cambiar(i.id, -1));
        mas.addEventListener("click", () => cambiar(i.id, 1));
        qty.append(menos, el("span", "", String(i.cantidad)), mas);

        const quitar = el("button", "quitar", "Quitar");
        quitar.type = "button";
        quitar.addEventListener("click", () => cambiar(i.id, -i.cantidad));
        fila.append(qty, quitar);
        caja.append(fila);
    });

    if (!unidades) caja.append(el("div", "vacio", "Tu carrito está vacío. Agrega productos desde el catálogo."));
    $("cartCount").textContent = unidades;
    $("cartCount").hidden = !unidades;
    $("cartTotal").textContent = dinero(total);
}

function panel(abrir) {
    $("drawer").classList.toggle("open", abrir);
    $("overlay").classList.toggle("open", abrir);
    $("drawer").setAttribute("aria-hidden", String(!abrir));
}

/* ==========================================================================
   CATÁLOGO
   ========================================================================== */

// Un bloque (tarjeta) por producto
function tarjeta(p) {
    const est = estado(p);
    const card = el("article", "card");

    const img = el("div", "card-img", icono(p.categoria));
    img.append(el("span", "status " + est, ETIQUETA[est]));

    const cuerpo = el("div", "card-body");
    const precio = el("div", "precio-fila");
    precio.append(el("span", "price", dinero(p.precio)),
        el("span", "stock-txt", est === "low" ? `Quedan ${p.existencia}` : ""));
    cuerpo.append(el("div", "code", "Código: " + (p.codigo ?? "—")), el("h3", "", p.nombre),
        el("div", "cat-name", p.categoria ?? ""), precio);

    const acc = el("div", "card-act");
    if (!sesion) {
        // Sin sesión: se ve el producto y el precio, pero no se puede pedir
        const a = el("a", "login-hint", "Inicia sesión para pedir");
        a.href = "login.html";
        acc.append(a);
    } else if (est === "out") {
        const b = el("button", "btn-add", "Agotado");
        b.disabled = true;
        acc.append(b);
    } else {
        let n = 1;
        const qty = el("div", "qty");
        const menos = el("button", "", "−"), mas = el("button", "", "+"), num = el("span", "", "1");
        menos.type = mas.type = "button";
        menos.addEventListener("click", () => { if (n > 1) num.textContent = --n; });
        mas.addEventListener("click", () => { if (n < p.existencia) num.textContent = ++n; });
        qty.append(menos, num, mas);

        const b = el("button", "btn-add", "Agregar al carrito");
        b.type = "button";
        b.addEventListener("click", () => { agregar(p, n); n = 1; num.textContent = "1"; });
        acc.append(qty, b);
    }
    card.append(img, cuerpo, acc);
    return card;
}

function render() {
    const q = $("searchInput").value.trim().toLowerCase();
    const orden = $("orden").value;
    const vis = productos
        .filter(p => [p.nombre, p.codigo, p.categoria].some(v => String(v ?? "").toLowerCase().includes(q))
            && (!categoria || p.categoria === categoria))
        .sort(orden === "precio-asc" ? (a, b) => a.precio - b.precio
            : orden === "precio-desc" ? (a, b) => b.precio - a.precio
            : (a, b) => a.nombre.localeCompare(b.nombre, "es"));

    const grid = $("productGrid");
    grid.replaceChildren();
    if (!vis.length) grid.append(el("div", "empty-state",
        productos.length ? "No hay productos que coincidan con la búsqueda." : "Aún no hay productos registrados."));
    vis.forEach(p => grid.append(tarjeta(p)));
    $("resultCount").textContent = productos.length ? `${vis.length} de ${productos.length} productos` : "Sin productos";
}

function renderCategorias() {
    const nombres = [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
    const caja = $("catChips");
    caja.replaceChildren();
    [["", "Todas"], ...nombres.map(n => [n, n])].forEach(([valor, texto]) => {
        const b = el("button", "chip" + (categoria === valor ? " active" : ""), texto);
        b.type = "button";
        b.addEventListener("click", () => { categoria = valor; renderCategorias(); render(); });
        caja.append(b);
    });
}

/* ==========================================================================
   ARRANQUE
   ========================================================================== */

async function cargarSesion() {
    try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (res.ok) sesion = await res.json();
    } catch (_) { /* sin conexión: se trata como visitante */ }
    if (!sesion) return;

    const link = $("sessionLink");
    link.querySelector("span").textContent = "Hola, " + sesion.nombre;
    link.querySelector("strong").textContent = "Mi perfil";
    link.href = "perfil.html";
    $("cartBtn").hidden = false;          // el carrito solo existe con sesión
    carrito = leerCarrito();
}

async function cargarProductos() {
    try {
        const res = await fetch("/api/productos");
        if (!res.ok) throw new Error("error " + res.status);
        productos = await res.json();
    } catch (err) {
        productos = [];
        const f = $("feedback");
        f.textContent = "No se pudieron cargar los productos (" + err.message + ").";
        f.style.display = "block";
    }
}

$("searchForm").addEventListener("submit", e => { e.preventDefault(); render(); });
$("searchInput").addEventListener("input", render);
$("orden").addEventListener("change", render);
$("cartBtn").addEventListener("click", () => panel(true));
$("cartClose").addEventListener("click", () => panel(false));
$("overlay").addEventListener("click", () => panel(false));
document.addEventListener("keydown", e => { if (e.key === "Escape") panel(false); });

(async function iniciar() {
    await cargarSesion();
    await cargarProductos();
    if (sesion) sincronizar();
    renderCategorias();
    render();
    renderCarrito();
})();
