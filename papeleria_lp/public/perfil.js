/* ==========================================================================
   ARCHIVO: perfil.js  ·  funcionamiento de perfil.html
   Reemplaza al PHP + jQuery + Bootstrap del diseño original.
   SE CONECTA CON (server.js):
     GET  /api/perfil           -> mis datos (nombre, correo, rol, fecha, id)
     PUT  /api/perfil           -> modificar nombre, correo y contraseña (exige la actual)
     POST /api/perfil/eliminar  -> desactivar mi cuenta (solo clientes)
     POST /api/logout           -> cerrar sesión
   El servidor siempre usa TU sesión: esta página no puede ver ni cambiar
   el perfil de otra persona.
   ========================================================================== */

const $ = id => document.getElementById(id);
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let perfil = null;

// Petición al servidor; con 401 (sin sesión) manda al login
async function api(url, metodo = "GET", cuerpo) {
    const res = await fetch(url, {
        method: metodo,
        headers: cuerpo ? { "Content-Type": "application/json" } : {},
        credentials: "same-origin",
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    let datos = {};
    try { datos = await res.json(); } catch (_) {}
    if (res.status === 401) { location.href = "login.html"; throw new Error("Sin sesión"); }
    return { ok: res.ok, datos };
}

// Muestra un mensaje en una caja (tipo: "error" o "success"); texto vacío = ocultar
function mensaje(caja, texto, tipo) {
    caja.textContent = texto;
    caja.className = "auth-message" + (texto ? " " + tipo : "");
}
const aviso = (texto, tipo = "success") => mensaje($("authMessage"), texto, tipo);
const ERROR_CONEXION = "No se pudo conectar con el servidor. Intenta de nuevo.";

/* ---------- Mostrar los datos ---------- */
function resumenCarrito(id) {
    const caja = $("carritoResumen");
    caja.replaceChildren();
    let unidades = 0;
    try { unidades = (JSON.parse(localStorage.getItem("piwis_carrito_" + id)) || [])
        .reduce((s, i) => s + (Number(i.cantidad) || 0), 0); } catch (_) {}
    if (!unidades) return;
    const card = document.createElement("div");
    card.className = "carrito-card";
    card.append(`🛒 Tienes ${unidades} ${unidades === 1 ? "producto" : "productos"} en tu carrito. `);
    const a = document.createElement("a");
    a.href = "catalogo.html";
    a.textContent = "Ir al catálogo";
    card.append(a);
    caja.append(card);
}

function mostrar(u) {
    perfil = u;
    $("bienvenida").textContent = "BIENVENIDO " + u.nombre.toUpperCase();
    $("pNombre").textContent = u.nombre;
    $("pCorreo").textContent = u.correo;
    $("pRol").textContent = u.rol_nombre;
    const f = new Date(u.fecha_creacion);
    $("pFecha").textContent = isNaN(f) ? "—" : f.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

    $("adminLink").hidden = !["DUENO", "EMPLEADO"].includes(u.rol);
    $("usuariosLink").hidden = u.rol !== "DUENO";
    $("btnEliminar").hidden = u.rol !== "CLIENTE";        // solo los clientes pueden eliminar su cuenta
    $("notaEquipo").hidden = u.rol === "CLIENTE";
    resumenCarrito(u.id);
}

/* ---------- Casilla de confirmación: habilita o bloquea los botones ---------- */
const chk = $("confirmarAccion");
function verificar() {
    const ok = chk.checked;
    $("btnModificar").disabled = !ok;
    $("btnEliminar").disabled = !ok;
    $("submitModificar").disabled = !ok;
    $("mensajeConfirmacion").hidden = ok;
}
chk.addEventListener("change", verificar);
verificar();

/* ---------- Modificar datos ---------- */
const dlgMod = $("dlgModificar"), formMod = $("formModificar");

$("btnModificar").addEventListener("click", () => {
    formMod.reset();
    mensaje($("errModificar"), "");
    formMod.nombre.value = perfil.nombre;
    formMod.correo.value = perfil.correo;
    dlgMod.showModal();
});

formMod.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formMod, err = $("errModificar");
    const nombre = f.nombre.value.trim(), correo = f.correo.value.trim();
    const nueva = f.nueva.value, actual = f.actual.value;

    if (!chk.checked) return mensaje(err, "Debes marcar la casilla de confirmación.", "error");
    if (nombre.length < 3) return mensaje(err, "Escribe tu nombre completo.", "error");
    if (!EMAIL_VALIDO.test(correo)) return mensaje(err, "Escribe un correo electrónico válido.", "error");
    if (nueva && (nueva.length < 8 || !/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)))
        return mensaje(err, "La nueva contraseña debe tener al menos 8 caracteres, con letras y números.", "error");
    if (nueva && nueva !== f.confirmar.value) return mensaje(err, "Las contraseñas nuevas no coinciden.", "error");
    if (!actual) return mensaje(err, "Escribe tu contraseña actual.", "error");

    const boton = $("submitModificar");
    boton.disabled = true;
    try {
        const { ok, datos } = await api("/api/perfil", "PUT", { nombre, correo, actual, nueva });
        if (!ok) return mensaje(err, datos.error || "No se pudieron guardar los cambios.", "error");
        dlgMod.close();
        mostrar({ ...perfil, nombre: datos.nombre, correo: datos.correo });
        aviso("Datos actualizados.");
        chk.checked = false;       // cada cambio pide confirmar de nuevo
    } catch (er) {
        if (er.message !== "Sin sesión") mensaje(err, ERROR_CONEXION, "error");
    } finally {
        verificar();
    }
});

/* ---------- Eliminar cuenta (clientes) ---------- */
const dlgEli = $("dlgEliminar"), formEli = $("formEliminar");

$("btnEliminar").addEventListener("click", () => {
    formEli.reset();
    $("submitEliminar").disabled = true;
    mensaje($("errEliminar"), "");
    dlgEli.showModal();
});

// El botón rojo solo se habilita al escribir exactamente ELIMINAR
formEli.confirmar.addEventListener("input", () => {
    $("submitEliminar").disabled = formEli.confirmar.value !== "ELIMINAR";
});

formEli.addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("errEliminar");
    if (!formEli.password.value) return mensaje(err, "Escribe tu contraseña.", "error");
    const boton = $("submitEliminar");
    boton.disabled = true;
    try {
        const { ok, datos } = await api("/api/perfil/eliminar", "POST",
            { confirmar: formEli.confirmar.value, password: formEli.password.value });
        if (!ok) { boton.disabled = false; return mensaje(err, datos.error || "No se pudo eliminar la cuenta.", "error"); }
        location.href = "index.html";      // la sesión ya se cerró en el servidor
    } catch (er) {
        boton.disabled = false;
        if (er.message !== "Sin sesión") mensaje(err, ERROR_CONEXION, "error");
    }
});

/* ---------- Cerrar ventanas y sesión ---------- */
document.querySelectorAll("[data-cerrar]").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));

$("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    location.href = "login.html";
});

/* ---------- Arranque ---------- */
(async function iniciar() {
    try {
        const { ok, datos } = await api("/api/perfil");   // sin sesión, api() redirige al login
        if (!ok) return aviso(datos.error || "No se pudo cargar tu perfil.", "error");
        mostrar(datos);
    } catch (err) {
        if (err.message !== "Sin sesión") aviso(ERROR_CONEXION, "error");
    }
})();