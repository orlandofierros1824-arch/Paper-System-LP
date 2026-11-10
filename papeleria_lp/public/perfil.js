/* ==========================================================================
   ARCHIVO: perfil.js
   QUÉ HACE: da funcionamiento a perfil.html.
     - Comprueba que haya una sesión iniciada (si no, manda a login.html)
     - Muestra los datos de la cuenta que vienen de la base de datos
     - Permite cambiar el nombre y la contraseña
     - Permite cerrar sesión
   SE CONECTA CON (rutas de server.js):
     GET  /api/perfil           -> datos de tu cuenta
     PUT  /api/perfil           -> cambiar nombre
     PUT  /api/perfil/password  -> cambiar contraseña (pide la actual)
     POST /api/logout           -> cerrar sesión
   El servidor siempre usa TU sesión para saber de quién es el perfil;
   esta página no puede pedir ni cambiar el de otra persona.
   ========================================================================== */

const $ = id => document.getElementById(id);

/* ==========================================================================
   COMUNICACIÓN CON EL SERVIDOR
   ========================================================================== */

// Hace una petición y devuelve { ok, datos }.
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

// Muestra un mensaje arriba (tipo: "error" o "success"). Texto vacío = ocultar.
function mensaje(texto, tipo) {
    const caja = $("authMessage");
    caja.textContent = texto;
    caja.className = "auth-message" + (texto ? " " + tipo : "");
    if (texto) caja.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const ERROR_CONEXION = "No se pudo conectar con el servidor. Intenta de nuevo.";

/* ==========================================================================
   MOSTRAR LOS DATOS DEL PERFIL
   ========================================================================== */

const formNombre = $("formNombre");
const formPassword = $("formPassword");

function mostrarPerfil(u) {
    $("resNombre").textContent = u.nombre;
    $("resRol").textContent = u.rol_nombre;
    $("avatar").textContent = u.nombre.trim().charAt(0).toUpperCase() || "?";
    $("correo").value = u.correo;
    formNombre.nombre.value = u.nombre;

    // Fecha en la que se creó la cuenta
    const fecha = new Date(u.fecha_creacion);
    $("resFecha").textContent = isNaN(fecha)
        ? ""
        : "Miembro desde " + fecha.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

    // El acceso a administración solo se ofrece a dueño y empleados.
    // (El servidor igual lo protege: esto es solo para no mostrar un enlace inútil.)
    $("adminLink").hidden = !["DUENO", "EMPLEADO"].includes(u.rol);
    $("usuariosLink").hidden = u.rol !== "DUENO";
}

/* ==========================================================================
   CAMBIAR NOMBRE
   ========================================================================== */

formNombre.addEventListener("submit", async e => {
    e.preventDefault();
    mensaje("");
    const nombre = formNombre.nombre.value.trim();

    if (nombre.length < 3) return mensaje("Escribe tu nombre completo.", "error");

    const boton = formNombre.querySelector("[type=submit]");
    boton.disabled = true;
    try {
        const { ok, datos } = await api("/api/perfil", "PUT", { nombre });
        if (!ok) return mensaje(datos.error || "No se pudo guardar el nombre.", "error");
        $("resNombre").textContent = datos.nombre;
        $("avatar").textContent = datos.nombre.charAt(0).toUpperCase();
        mensaje("Nombre actualizado.", "success");
    } catch (err) {
        if (err.message !== "Sin sesión") mensaje(ERROR_CONEXION, "error");
    } finally {
        boton.disabled = false;
    }
});

/* ==========================================================================
   CAMBIAR CONTRASEÑA
   ========================================================================== */

formPassword.addEventListener("submit", async e => {
    e.preventDefault();
    mensaje("");
    const f = formPassword;
    const actual = f.actual.value;
    const nueva = f.nueva.value;

    // Validaciones antes de enviar (el servidor las repite)
    if (!actual) return mensaje("Escribe tu contraseña actual.", "error");
    if (nueva.length < 8 || !/[A-Za-z]/.test(nueva) || !/\d/.test(nueva))
        return mensaje("La nueva contraseña debe tener al menos 8 caracteres, con letras y números.", "error");
    if (nueva !== f.confirmar.value) return mensaje("Las contraseñas nuevas no coinciden.", "error");

    const boton = f.querySelector("[type=submit]");
    boton.disabled = true;
    try {
        // La confirmación NO se envía; solo la actual y la nueva
        const { ok, datos } = await api("/api/perfil/password", "PUT", { actual, nueva });
        if (!ok) return mensaje(datos.error || "No se pudo cambiar la contraseña.", "error");
        f.reset();
        mensaje("Contraseña actualizada.", "success");
    } catch (err) {
        if (err.message !== "Sin sesión") mensaje(ERROR_CONEXION, "error");
    } finally {
        boton.disabled = false;
    }
});

// Botones "Ver / Ocultar" de las contraseñas
document.querySelectorAll(".toggle-pass").forEach(btn =>
    btn.addEventListener("click", () => {
        const campo = btn.previousElementSibling;
        const oculto = campo.type === "password";
        campo.type = oculto ? "text" : "password";
        btn.textContent = oculto ? "Ocultar" : "Ver";
        btn.setAttribute("aria-label", oculto ? "Ocultar contraseña" : "Mostrar contraseña");
    }));

/* ==========================================================================
   CERRAR SESIÓN
   ========================================================================== */

$("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    location.href = "login.html";
});

/* ==========================================================================
   ARRANQUE: carga el perfil al abrir la página
   ========================================================================== */

(async function iniciar() {
    try {
        const { ok, datos } = await api("/api/perfil");   // sin sesión, api() redirige al login
        if (!ok) return mensaje(datos.error || "No se pudo cargar tu perfil.", "error");
        mostrarPerfil(datos);
    } catch (err) {
        if (err.message !== "Sin sesión") mensaje(ERROR_CONEXION, "error");
    }
})();