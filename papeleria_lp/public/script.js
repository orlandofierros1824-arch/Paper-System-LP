/* ==========================================================================
   3. INVENTARIO
   Pide los productos a la base de datos (API_PRODUCTOS) y los muestra como
   tarjetas. Las categorías se generan solas a partir de los productos.
   Lee: #catList, #productList, #resultCount, #feedback, #searchInput
   ========================================================================== */

const lista    = document.getElementById("productList");
const contador = document.getElementById("resultCount");
const feedback = document.getElementById("feedback");
const input    = document.getElementById("searchInput");
const catBox   = document.getElementById("catList");

let productos = [];        // productos que llegan de la base de datos
let filtro = "all";        // all | low | out
let categoriaActiva = "";  // "" = todas

// Icono según el nombre de la categoría (si no coincide, usa 📦)
const ICONOS = [
    [/papel|cuaderno|libreta|carpeta/i, "📄"],
    [/escrit|pluma|bol[ií]grafo|l[aá]piz|marcador/i, "✏️"],
    [/impres|tinta|t[oó]ner/i, "🖨️"],
    [/color|arte|pintur|dibujo/i, "🎨"],
    [/pegament|adhesiv|cinta|tijera/i, "🧴"],
    [/oficin|mobiliario|escritorio/i, "🗂️"],
    [/comput|laptop|electr|gaming/i, "💻"]
];
const icono = cat => (ICONOS.find(([re]) => re.test(cat ?? "")) || [null, "📦"])[1];

const ETIQUETA = { available: "Disponible", low: "Stock bajo", out: "Agotado" };

function estado(p) {
    if (p.existencia <= 0) return "out";
    if (p.existencia <= (p.minimo ?? 5)) return "low";
    return "available";
}

function mensaje(texto) {
    feedback.textContent = texto;
    feedback.style.display = texto ? "block" : "none";
}

// Crea un elemento con clase y texto (textContent evita inyectar HTML)
function el(tag, clase, texto) {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
}

// Tarjetas de categorías: al pulsar una, filtra los productos
function renderCategorias() {
    const nombres = [...new Set(productos.map(p => p.categoria).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "es"));
    document.getElementById("categorias").hidden = !nombres.length;
    catBox.replaceChildren();

    const crear = (valor, etiqueta, ico) => {
        const b = el("button", "cat" + (categoriaActiva === valor ? " active" : ""));
        b.type = "button";
        b.append(el("span", "ico", ico), el("span", "", etiqueta));
        b.addEventListener("click", () => {
            categoriaActiva = categoriaActiva === valor ? "" : valor;
            renderCategorias();
            render();
        });
        catBox.append(b);
    };
    crear("", "Todas", "🗂️");
    nombres.forEach(n => crear(n, n, icono(n)));
}

// Dibuja las tarjetas de producto aplicando búsqueda, categoría y filtro
function render() {
    const q = input.value.trim().toLowerCase();

    const visibles = productos.filter(p => {
        const coincide = [p.nombre, p.codigo, p.categoria, p.ubicacion]
            .some(v => String(v ?? "").toLowerCase().includes(q));
        const enCategoria = !categoriaActiva || p.categoria === categoriaActiva;
        return coincide && enCategoria && (filtro === "all" || estado(p) === filtro);
    });

    lista.replaceChildren();

    if (!visibles.length) {
        lista.append(el("div", "empty-state", productos.length
            ? "No hay productos que coincidan con la búsqueda."
            : "Aún no hay productos registrados."));
    }

    visibles.forEach(p => {
        const est = estado(p);
        const card = el("article", "card");

        const img = el("div", "card-img", icono(p.categoria));
        img.append(el("span", "status " + est, ETIQUETA[est]));

        const cuerpo = el("div", "card-body");
        cuerpo.append(
            el("div", "code", "Código: " + (p.codigo ?? "—")),
            el("h3", "", p.nombre),
            el("div", "loc", "📍 " + (p.ubicacion ?? "Sin ubicación asignada")),
            el("div", "cat-name", p.categoria ?? "")
        );

        const pie = el("div", "card-foot");
        pie.append(
            el("span", "price", "$" + Number(p.precio ?? 0).toFixed(2)),
            el("span", "stock-txt", `${p.existencia} ${p.unidad ?? "unidades"}`)
        );

        card.append(img, cuerpo, pie);
        lista.append(card);
    });

    contador.textContent = productos.length
        ? `${visibles.length} de ${productos.length} productos`
        : "Sin productos";
}

function aplicarFiltro(f) {
    filtro = f;
    document.querySelectorAll(".chip").forEach(c =>
        c.classList.toggle("active", c.dataset.filter === f));
    render();
}

// Botones de filtro y enlaces del menú con data-filter
document.querySelectorAll("[data-filter]").forEach(e =>
    e.addEventListener("click", () => aplicarFiltro(e.dataset.filter)));

document.getElementById("searchForm").addEventListener("submit", e => {
    e.preventDefault();
    render();
    document.getElementById("inventario").scrollIntoView({ behavior: "smooth" });
});
input.addEventListener("input", render);

// CONEXIÓN CON LA BASE DE DATOS
async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS);
        if (!res.ok) throw new Error("error " + res.status);
        productos = await res.json();
        mensaje("");
    } catch (err) {
        productos = [];
        mensaje("No se pudieron cargar los productos (" + err.message + "). Revisa que el servidor y la base de datos estén activos.");
    }
    renderCategorias();
    render();
}

cargarProductos();


/* ==========================================================================
   SESIÓN
   Pregunta al servidor (/api/me) si hay una sesión iniciada.
   - Sin sesión: el enlace del encabezado sigue diciendo "Iniciar sesión".
   - Con sesión: muestra "Hola, nombre" y el enlace lleva a perfil.html.
   El resto de la página se ve igual con o sin sesión. Dueño y empleados
   acceden a "Administrar productos" desde perfil.html.
   ========================================================================== */
async function cargarSesion() {
    const link = document.getElementById("sessionLink");
    try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (!res.ok) return;                       // sin sesión: no se cambia nada
        const u = await res.json();
        link.querySelector("span").textContent = "Hola, " + u.nombre;
        link.href = "perfil.html";
        link.querySelector("strong").textContent = "Mi perfil";
    } catch (err) { /* sin conexión: se deja el enlace como está */ }
}
cargarSesion();