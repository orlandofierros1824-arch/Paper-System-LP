/* ==========================================================================
   ARCHIVO: productos.js
   QUÉ HACE: da funcionamiento a productos.html.
     - Comprueba que haya una sesión iniciada con rol DUENO o EMPLEADO
     - Pide a la base de datos (vía servidor) productos, categorías y ubicaciones
     - Crea y edita productos, registra movimientos de existencias
       y (solo el dueño) activa o desactiva productos
   SE CONECTA CON (rutas de server.js):
     GET   /api/me                          -> quién eres y qué rol tienes
     GET   /api/admin/productos             -> lista completa de productos
     POST  /api/admin/productos             -> crear producto
     PUT   /api/admin/productos/:id         -> editar producto
     POST  /api/admin/productos/:id/movimiento -> entrada/salida/ajuste de existencias
     PATCH /api/admin/productos/:id/activo  -> activar / desactivar (solo dueño)
     GET   /api/admin/categorias, POST /api/admin/categorias
     GET   /api/admin/ubicaciones, POST /api/admin/ubicaciones
     POST  /api/logout                      -> cerrar sesión
   La seguridad real está en el servidor: aunque alguien manipule esta
   página, el servidor vuelve a revisar sesión y rol en cada petición.
   ========================================================================== */

const $ = id => document.getElementById(id);

// --- Estado de la pantalla ---
let productos = [];
let categorias = [];
let ubicaciones = [];
let filtro = "all";        // all | low | out | inactive
let editandoId = null;     // id del producto que se edita (null = se está creando uno)
let movimientoId = null;   // id del producto al que se le registra un movimiento
let esDueno = false;       // solo el dueño puede activar/desactivar

/* ==========================================================================
   COMUNICACIÓN CON EL SERVIDOR
   ========================================================================== */

// Hace una petición al servidor y devuelve { ok, datos }.
// Si el servidor responde 401 (sin sesión), manda a la pantalla de login.
async function api(url, metodo = "GET", cuerpo) {
    const res = await fetch(url, {
        method: metodo,
        headers: cuerpo ? { "Content-Type": "application/json" } : {},
        credentials: "same-origin",      // envía la cookie de sesión
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    let datos = {};
    try { datos = await res.json(); } catch (_) { /* respuesta sin JSON */ }
    if (res.status === 401) {
        location.href = "login.html";
        throw new Error("Sin sesión");
    }
    return { ok: res.ok, datos };
}

/* ==========================================================================
   MENSAJES
   ========================================================================== */

// Muestra un mensaje en una caja (tipo: "error" o "success"). Texto vacío = ocultar.
function mensaje(caja, texto, tipo) {
    caja.textContent = texto;
    caja.className = "auth-message" + (texto ? " " + tipo : "");
}
const aviso = (texto, tipo = "success") => mensaje($("authMessage"), texto, tipo);

/* ==========================================================================
   ESTADO DE UN PRODUCTO (igual que en la página pública)
   ========================================================================== */

function estado(p) {
    if (!p.activo) return "inactive";
    if (p.existencia <= 0) return "out";
    if (p.existencia <= p.minimo) return "low";
    return "available";
}
const ETIQUETA = { available: "Disponible", low: "Stock bajo", out: "Agotado", inactive: "Inactivo" };

/* ==========================================================================
   TABLA DE PRODUCTOS
   ========================================================================== */

// Crea una celda <td> con texto (textContent evita inyectar HTML)
function celda(texto, clase) {
    const td = document.createElement("td");
    td.textContent = texto;
    if (clase) td.className = clase;
    return td;
}

// Crea un botón pequeño de acción
function botonAccion(texto, alClic) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn ghost small";
    b.textContent = texto;
    b.addEventListener("click", alClic);
    return b;
}

function render() {
    const q = $("buscar").value.trim().toLowerCase();
    const cuerpo = $("tablaBody");

    const visibles = productos.filter(p => {
        const coincide = [p.nombre, p.codigo, p.categoria, p.ubicacion]
            .some(v => String(v ?? "").toLowerCase().includes(q));
        const e = estado(p);
        const pasa = filtro === "all" ? true : e === filtro;
        return coincide && pasa;
    });

    cuerpo.replaceChildren();

    if (!visibles.length) {
        const tr = document.createElement("tr");
        const td = celda(productos.length ? "Ningún producto coincide con la búsqueda." : "Aún no hay productos. Crea el primero con «Nuevo producto».", "muted");
        td.colSpan = 8;
        td.style.textAlign = "center";
        td.style.padding = "28px";
        tr.append(td);
        cuerpo.append(tr);
    }

    visibles.forEach(p => {
        const e = estado(p);
        const tr = document.createElement("tr");
        if (!p.activo) tr.className = "inactiva";

        tr.append(
            celda(p.codigo, "codigo"),
            celda(p.nombre, "nombre"),
            celda(p.categoria),
            celda(p.ubicacion ?? "Sin asignar", p.ubicacion ? "" : "muted"),
            celda("$" + p.precio.toFixed(2), "num"),
            celda(`${p.existencia} ${p.unidad}`, "num")
        );

        // Etiqueta de estado con color
        const tdEstado = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "status " + e;
        badge.textContent = ETIQUETA[e];
        tdEstado.append(badge);
        tr.append(tdEstado);

        // Botones de acción
        const tdAcc = document.createElement("td");
        tdAcc.className = "acciones";
        tdAcc.append(
            botonAccion("Editar", () => abrirProducto(p)),
            botonAccion("Movimiento", () => abrirMovimiento(p))
        );
        if (esDueno) {
            tdAcc.append(botonAccion(p.activo ? "Desactivar" : "Activar", () => cambiarActivo(p)));
        }
        tr.append(tdAcc);
        cuerpo.append(tr);
    });

    $("resultCount").textContent = productos.length
        ? `${visibles.length} de ${productos.length} productos`
        : "Sin productos";
}

// Filtros y buscador
document.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => {
        filtro = c.dataset.filter;
        document.querySelectorAll(".chip").forEach(x => x.classList.toggle("active", x === c));
        render();
    }));
$("buscar").addEventListener("input", render);

/* ==========================================================================
   CARGA DE DATOS
   ========================================================================== */

async function cargarProductos() {
    const { ok, datos } = await api("/api/admin/productos");
    if (!ok) return aviso(datos.error || "No se pudieron cargar los productos.", "error");
    productos = datos;
    render();
}

async function cargarCatalogos() {
    const [c, u] = await Promise.all([api("/api/admin/categorias"), api("/api/admin/ubicaciones")]);
    if (c.ok) categorias = c.datos;
    if (u.ok) ubicaciones = u.datos;
}

// Llena una lista desplegable. "vacio" es el texto de la opción sin valor (si aplica).
function llenarSelect(select, items, idKey, textoFn, vacio) {
    const actual = select.value;
    select.replaceChildren();
    if (vacio) select.append(new Option(vacio, ""));
    items.forEach(it => select.append(new Option(textoFn(it), it[idKey])));
    select.value = actual;
}

function refrescarSelects() {
    const f = $("formProducto");
    llenarSelect(f.id_categoria, categorias, "id", c => c.nombre, categorias.length ? null : "Crea una categoría con «+»");
    llenarSelect(f.id_ubicacion, ubicaciones, "id", u => u.codigo, "Sin asignar");
}

/* ==========================================================================
   CREAR / EDITAR PRODUCTO
   ========================================================================== */

const dlgProducto = $("dlgProducto");
const formProducto = $("formProducto");

function abrirProducto(p) {
    editandoId = p ? p.id : null;
    mensaje($("errProducto"), "");
    formProducto.reset();
    refrescarSelects();

    $("dlgProductoTitulo").textContent = p ? "Editar producto" : "Nuevo producto";
    // Las existencias iniciales solo se piden al crear; después se usan los movimientos
    $("stockField").hidden = !!p;

    if (p) {
        formProducto.codigo.value = p.codigo;
        formProducto.nombre.value = p.nombre;
        formProducto.descripcion.value = p.descripcion ?? "";
        formProducto.id_categoria.value = p.id_categoria;
        formProducto.id_ubicacion.value = p.id_ubicacion ?? "";
        formProducto.precio.value = p.precio;
        formProducto.stock_minimo.value = p.minimo;
        formProducto.unidad.value = p.unidad;
    }
    dlgProducto.showModal();
}

formProducto.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formProducto;
    const cuerpo = {
        codigo: f.codigo.value,
        nombre: f.nombre.value,
        descripcion: f.descripcion.value,
        id_categoria: f.id_categoria.value,
        id_ubicacion: f.id_ubicacion.value || null,
        precio: f.precio.value,
        stock_minimo: f.stock_minimo.value,
        unidad: f.unidad.value
    };
    if (!editandoId) cuerpo.stock = f.stock.value || 0;

    const boton = f.querySelector("[type=submit]");
    boton.disabled = true;
    try {
        const { ok, datos } = editandoId
            ? await api(`/api/admin/productos/${editandoId}`, "PUT", cuerpo)
            : await api("/api/admin/productos", "POST", cuerpo);
        if (!ok) return mensaje($("errProducto"), datos.error || "No se pudo guardar.", "error");
        dlgProducto.close();
        await cargarProductos();
        aviso(editandoId ? "Producto actualizado." : "Producto creado.");
    } catch (err) {
        mensaje($("errProducto"), "No se pudo conectar con el servidor.", "error");
    } finally {
        boton.disabled = false;
    }
});

// Botón «+» junto a Categoría: pide el nombre y la crea
$("nuevaCatBtn").addEventListener("click", async () => {
    const nombre = prompt("Nombre de la nueva categoría:");
    if (!nombre || !nombre.trim()) return;
    const { ok, datos } = await api("/api/admin/categorias", "POST", { nombre });
    if (!ok) return mensaje($("errProducto"), datos.error || "No se pudo crear la categoría.", "error");
    await cargarCatalogos();
    refrescarSelects();
    formProducto.id_categoria.value = datos.id;   // la deja seleccionada
});

// Botón «+» junto a Ubicación: pide pasillo, anaquel y estante
$("nuevaUbiBtn").addEventListener("click", async () => {
    const texto = prompt("Escribe pasillo, anaquel y estante separados por comas.\nEjemplo: 1,2,3  (genera P1-A2-E3)");
    if (!texto) return;
    const [pasillo, anaquel, estante] = texto.split(",").map(s => s.trim());
    const { ok, datos } = await api("/api/admin/ubicaciones", "POST", { pasillo, anaquel, estante });
    if (!ok) return mensaje($("errProducto"), datos.error || "No se pudo crear la ubicación.", "error");
    await cargarCatalogos();
    refrescarSelects();
    formProducto.id_ubicacion.value = datos.id;
});

/* ==========================================================================
   MOVIMIENTOS DE EXISTENCIAS
   El servidor actualiza el stock y deja el registro en movimientos_inventario.
   ========================================================================== */

const dlgMovimiento = $("dlgMovimiento");
const formMovimiento = $("formMovimiento");

function abrirMovimiento(p) {
    movimientoId = p.id;
    mensaje($("errMov"), "");
    formMovimiento.reset();
    $("movProducto").textContent = `${p.nombre} · existencias actuales: ${p.existencia} ${p.unidad}`;
    dlgMovimiento.showModal();
}

formMovimiento.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formMovimiento;
    const boton = f.querySelector("[type=submit]");
    boton.disabled = true;
    try {
        const { ok, datos } = await api(`/api/admin/productos/${movimientoId}/movimiento`, "POST", {
            tipo: f.tipo.value,
            cantidad: f.cantidad.value,
            motivo: f.motivo.value
        });
        if (!ok) return mensaje($("errMov"), datos.error || "No se pudo registrar el movimiento.", "error");
        dlgMovimiento.close();
        await cargarProductos();
        aviso("Movimiento registrado.");
    } catch (err) {
        mensaje($("errMov"), "No se pudo conectar con el servidor.", "error");
    } finally {
        boton.disabled = false;
    }
});

/* ==========================================================================
   ACTIVAR / DESACTIVAR (solo dueño)
   Un producto desactivado deja de verse en el inventario público, pero no se
   borra: conserva su historial de ventas y movimientos.
   ========================================================================== */

async function cambiarActivo(p) {
    const accion = p.activo ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que quieres ${accion} «${p.nombre}»?`)) return;
    const { ok, datos } = await api(`/api/admin/productos/${p.id}/activo`, "PATCH", { activo: !p.activo });
    if (!ok) return aviso(datos.error || "No se pudo cambiar el estado.", "error");
    await cargarProductos();
    aviso(p.activo ? "Producto desactivado." : "Producto activado.");
}

/* ==========================================================================
   CERRAR VENTANAS Y SESIÓN
   ========================================================================== */

// Cualquier botón con data-cerrar cierra la ventana en la que está
document.querySelectorAll("[data-cerrar]").forEach(b =>
    b.addEventListener("click", () => b.closest("dialog").close()));

$("nuevoBtn").addEventListener("click", () => abrirProducto(null));

$("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    location.href = "login.html";
});

/* ==========================================================================
   ARRANQUE
   ========================================================================== */

(async function iniciar() {
    try {
        const { ok, datos } = await api("/api/me");   // si no hay sesión, api() redirige al login
        if (!ok) return;
        $("userName").textContent = datos.nombre;

        if (!["DUENO", "EMPLEADO"].includes(datos.rol)) {
            aviso("Tu cuenta no tiene permiso para administrar productos.", "error");
            $("resultCount").textContent = "";
            document.querySelector(".toolbar").hidden = true;
            document.querySelector(".tabla-wrap").hidden = true;
            return;
        }
        esDueno = datos.rol === "DUENO";
        $("nuevoBtn").hidden = false;

        await cargarCatalogos();
        await cargarProductos();
    } catch (err) {
        if (err.message !== "Sin sesión") aviso("No se pudo conectar con el servidor.", "error");
    }
})();
