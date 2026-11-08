/* ==========================================================================
   ARCHIVO: script.js
   QUÉ HACE: da vida a la página. Tiene tres partes:
     1. CONFIGURACIÓN  -> lo único que normalmente tendrás que editar
     2. CARRUSEL       -> cambia las imágenes automáticamente
     3. INVENTARIO     -> pide los productos a la base de datos, los muestra,
                          y hace funcionar el buscador y los filtros
   SE CONECTA CON:
     - index.html  -> busca elementos por su id (carousel, productList, etc.)
     - Una base de datos -> a través de la dirección API_PRODUCTOS (ver abajo)
   ========================================================================== */


/* ==========================================================================
   1. CONFIGURACIÓN
   ========================================================================== */

/* IMÁGENES DEL CARRUSEL
   Cada línea es una imagen del carrusel:
     src    -> ruta del archivo (guárdalos en la carpeta "img")
     titulo -> texto grande que aparece sobre la imagen
     texto  -> texto pequeño debajo del título
   Para agregar una imagen, copia una línea y cambia sus datos.
   Para quitar una, borra su línea. */
const SLIDES = [
    { src: "img/slide1.jpg", titulo: "Todo para la escuela y la oficina", texto: "Cuadernos, papel y escritura en un solo lugar." },
    { src: "img/slide2.jpg", titulo: "Encuentra cada producto",           texto: "Pasillo, anaquel y estante al instante." },
    { src: "img/slide3.jpg", titulo: "Inventario siempre al día",         texto: "Detecta lo que necesita reposición." }
];

/* CONEXIÓN CON LA BASE DE DATOS
   Esta es la dirección a la que la página le pide los productos.
   Puede ser:
     - Un archivo JSON de GitHub (enlace "Raw")
     - Una ruta de tu servidor Express (ej. "/api/productos")
     - Una dirección de Supabase u otro servicio
   Debe responder con una lista en formato JSON así:
   [{ "nombre": "Cuaderno profesional", "categoria": "Cuadernos",
      "ubicacion": "P1-A2-E3", "existencia": 8, "unidad": "unidades", "minimo": 5 }]
     minimo = existencias a partir de las cuales se marca "Stock bajo" */
const API_PRODUCTOS = "/api/productos";


/* ==========================================================================
   2. CARRUSEL
   Lee: #carousel, #slides, #dots (de index.html)
   Muestra: las imágenes de SLIDES, una a la vez, con cambio automático
   ========================================================================== */

const carousel  = document.getElementById("carousel");   // contenedor completo
const slidesBox = document.getElementById("slides");     // aquí se crean las imágenes
const dotsBox   = document.getElementById("dots");       // aquí se crean los puntitos

// Lee el tiempo del atributo data-interval de index.html. Si falta, usa 5000 ms.
const intervalo = Number(carousel.dataset.interval) || 5000;

let actual = 0;    // número de la imagen que se ve ahora (0 = la primera)
let timer = null;  // guarda el temporizador del cambio automático

// Por cada imagen de SLIDES, crea su diapositiva y su puntito
SLIDES.forEach((s, i) => {
    // --- La imagen ---
    const slide = document.createElement("figure");
    slide.className = "slide" + (i === 0 ? " active" : "");  // solo la primera empieza visible
    slide.style.backgroundImage = `url("${s.src}")`;

    // --- El texto sobre la imagen ---
    const cap = document.createElement("figcaption");
    const h = document.createElement("strong");
    const p = document.createElement("span");
    h.textContent = s.titulo;
    p.textContent = s.texto;
    cap.append(h, p);
    slide.append(cap);
    slidesBox.append(slide);

    // --- El puntito de abajo; al hacer clic salta a esa imagen ---
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Ir a la imagen ${i + 1}`);
    dot.addEventListener("click", () => { irA(i); reiniciar(); });
    dotsBox.append(dot);
});

// Cambia a la imagen número n. El cálculo con % hace que después de la
// última vuelva a la primera (y antes de la primera vaya a la última).
function irA(n) {
    const slides = slidesBox.children;
    const dots = dotsBox.children;
    slides[actual].classList.remove("active");   // oculta la actual
    dots[actual].classList.remove("active");
    actual = (n + slides.length) % slides.length;
    slides[actual].classList.add("active");      // muestra la nueva
    dots[actual].classList.add("active");
}

// Funciones del temporizador automático
function iniciar()   { timer = setInterval(() => irA(actual + 1), intervalo); }
function detener()   { clearInterval(timer); }
function reiniciar() { detener(); iniciar(); }  // reinicia la cuenta tras un clic manual

// Flechas: avanzan o retroceden y reinician el tiempo
carousel.querySelector(".prev").addEventListener("click", () => { irA(actual - 1); reiniciar(); });
carousel.querySelector(".next").addEventListener("click", () => { irA(actual + 1); reiniciar(); });

// Pausa el carrusel mientras el mouse está encima, y lo reanuda al salir
carousel.addEventListener("mouseenter", detener);
carousel.addEventListener("mouseleave", iniciar);

// Respeta a quienes tienen activada "reducir movimiento" en su dispositivo:
// en ese caso el carrusel no avanza solo (solo con flechas y puntos).
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) iniciar();


/* ==========================================================================
   3. INVENTARIO
   Lee: #productList, #resultCount, #feedback, #searchInput (de index.html)
   Se conecta con: la base de datos, mediante API_PRODUCTOS
   Muestra: una fila por producto, con nombre, categoría, ubicación,
            existencias y su estado (Disponible / Stock bajo / Agotado)
   ========================================================================== */

const lista    = document.getElementById("productList");  // donde se dibujan los productos
const contador = document.getElementById("resultCount");  // texto "X de Y productos"
const feedback = document.getElementById("feedback");     // aviso de error
const input    = document.getElementById("searchInput");  // caja del buscador

let productos = [];   // aquí se guardan los productos que llegan de la base de datos
let filtro = "all";   // filtro activo: "all" (todos), "low" (stock bajo) o "out" (agotados)

// Decide el estado de un producto según sus existencias
function estado(p) {
    if (p.existencia <= 0) return "out";                    // sin existencias -> agotado
    if (p.existencia <= (p.minimo ?? 5)) return "low";      // igual o menor al mínimo -> stock bajo
    return "available";                                     // en cualquier otro caso -> disponible
}

// Texto que se muestra en la etiqueta de color de cada producto
const ETIQUETA = { available: "Disponible", low: "Stock bajo", out: "Agotado" };

// Muestra (o esconde, si el texto está vacío) el aviso de error
function mensaje(texto) {
    feedback.textContent = texto;
    feedback.style.display = texto ? "block" : "none";
}

// DIBUJA LA LISTA: toma los productos, aplica búsqueda y filtro,
// y crea una fila en pantalla por cada uno que coincida.
function render() {
    const q = input.value.trim().toLowerCase();   // lo que el usuario escribió en el buscador

    // Se queda solo con los productos que cumplan búsqueda Y filtro
    const visibles = productos.filter(p => {
        // Busca el texto en el nombre, la categoría o la ubicación
        const coincide = [p.nombre, p.categoria, p.ubicacion]
            .some(v => String(v ?? "").toLowerCase().includes(q));
        const est = estado(p);
        const pasaFiltro = filtro === "all" || est === filtro;
        return coincide && pasaFiltro;
    });

    lista.replaceChildren();   // borra lo que había antes para redibujar

    // Si no hay nada que mostrar, explica por qué
    if (!visibles.length) {
        const vacio = document.createElement("div");
        vacio.className = "empty-state";
        vacio.textContent = productos.length
            ? "No hay productos que coincidan con la búsqueda."
            : "Aún no hay productos registrados.";
        lista.append(vacio);
    }

    // Crea la fila de cada producto
    visibles.forEach(p => {
        const est = estado(p);
        const art = document.createElement("article");
        art.className = "product";

        // Lado izquierdo: nombre y "Categoría · Ubicación: código"
        const info = document.createElement("div");
        const nombre = document.createElement("h4");
        const detalle = document.createElement("p");
        nombre.textContent = p.nombre;
        detalle.textContent = `${p.categoria ?? "Sin categoría"} · Ubicación: ${p.ubicacion ?? "Sin asignar"}`;
        info.append(nombre, detalle);

        // Lado derecho: cantidad y etiqueta de estado con color
        const stock = document.createElement("div");
        stock.className = "stock";
        const cant = document.createElement("strong");
        const badge = document.createElement("span");
        cant.textContent = `${p.existencia} ${p.unidad ?? "unidades"}`;
        badge.className = "status " + est;      // la clase da el color (verde/ámbar/rojo)
        badge.textContent = ETIQUETA[est];
        stock.append(cant, badge);

        art.append(info, stock);
        lista.append(art);
    });

    // Actualiza el texto "X de Y productos" bajo el título
    contador.textContent = productos.length
        ? `${visibles.length} de ${productos.length} productos`
        : "Sin productos";
}

// Cambia el filtro activo, marca el botón correspondiente y redibuja
function aplicarFiltro(f) {
    filtro = f;
    document.querySelectorAll(".chip").forEach(c =>
        c.classList.toggle("active", c.dataset.filter === f));
    render();
}

// Cualquier elemento con data-filter (botones de filtro y enlaces del menú)
// aplica ese filtro al hacer clic.
document.querySelectorAll("[data-filter]").forEach(el =>
    el.addEventListener("click", () => aplicarFiltro(el.dataset.filter)));

// Al enviar el buscador (Enter o botón ⌕): filtra y baja a la lista
document.getElementById("searchForm").addEventListener("submit", e => {
    e.preventDefault();   // evita que el navegador recargue la página
    render();
    document.getElementById("inventario").scrollIntoView({ behavior: "smooth" });
});

// Además, filtra mientras se escribe, sin necesidad de pulsar Enter
input.addEventListener("input", render);

// CONEXIÓN CON LA BASE DE DATOS
// Pide los productos a API_PRODUCTOS. Si algo falla (servidor apagado,
// dirección incorrecta, etc.), muestra el aviso en pantalla.
async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS);        // hace la petición
        if (!res.ok) throw new Error(res.status);      // si el servidor responde con error, salta al catch
        productos = await res.json();                  // convierte la respuesta en una lista de productos
        mensaje("");                                   // todo bien: sin aviso
    } catch (err) {
        productos = [];
        mensaje("No se pudo conectar con la base de datos. Revisa que el servidor esté activo.");
    }
    render();   // dibuja la lista (con datos, o vacía si hubo error)
}

// Se ejecuta al abrir la página: es lo que arranca la carga de productos
cargarProductos();


/* ==========================================================================
   SESIÓN
   Pregunta al servidor (/api/me) si hay una sesión iniciada.
   - Sin sesión: el enlace del encabezado sigue diciendo "Iniciar sesión".
   - Con sesión: muestra "Hola, nombre" y el enlace lleva a perfil.html.
   - Dueño o empleado: además aparece "Administrar productos" en el menú.
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

        // Dueño y empleados ven además el enlace "Administrar productos" en el menú
        if (["DUENO", "EMPLEADO"].includes(u.rol)) {
            document.getElementById("adminNav").hidden = false;
        }
    } catch (err) { /* sin conexión: se deja el enlace como está */ }
}
cargarSesion();