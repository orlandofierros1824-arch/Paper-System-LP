/* ==========================================================================
   ARCHIVO: usuarios.js
   QUÉ HACE: da funcionamiento a usuarios.html (solo para el DUEÑO).
   SE CONECTA CON (rutas de server.js):
     GET   /api/me                       -> comprueba que seas el dueño
     GET   /api/admin/usuarios           -> lista de cuentas
     PATCH /api/admin/usuarios/:id/rol   -> cambia entre EMPLEADO y CLIENTE
     PATCH /api/admin/usuarios/:id/activo-> activa o desactiva una cuenta
   Reglas (las aplica el servidor, aquí solo se reflejan): nadie puede
   cambiar su propio rol, y los dueños no se tocan desde esta pantalla.
   ========================================================================== */

const $ = id => document.getElementById(id);
const ROL_TEXTO = { DUENO: "Dueño", EMPLEADO: "Empleado", CLIENTE: "Cliente" };

let usuarios = [];
let filtro = "all";

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

function aviso(texto, tipo = "success") {
    const caja = $("authMessage");
    caja.textContent = texto;
    caja.className = "auth-message" + (texto ? " " + tipo : "");
}

function celda(texto, clase) {
    const td = document.createElement("td");
    td.textContent = texto;
    if (clase) td.className = clase;
    return td;
}

function render() {
    const q = $("buscar").value.trim().toLowerCase();
    const cuerpo = $("tablaBody");

    const visibles = usuarios.filter(u => {
        const coincide = [u.nombre, u.correo].some(v => String(v ?? "").toLowerCase().includes(q));
        const pasa = filtro === "all" ? true
            : filtro === "inactive" ? !u.activo
            : u.rol === filtro;
        return coincide && pasa;
    });

    cuerpo.replaceChildren();
    if (!visibles.length) {
        const tr = document.createElement("tr");
        const td = celda("Ningún usuario coincide.", "muted");
        td.colSpan = 5; td.style.textAlign = "center"; td.style.padding = "28px";
        tr.append(td); cuerpo.append(tr);
    }

    visibles.forEach(u => {
        const tr = document.createElement("tr");
        if (!u.activo) tr.className = "inactiva";
        tr.append(celda(u.nombre + (u.es_yo ? " (tú)" : ""), "nombre"), celda(u.correo, "muted"));

        // Rol: lista desplegable solo para empleados y clientes que no seas tú
        const tdRol = document.createElement("td");
        if (u.rol === "DUENO" || u.es_yo) {
            tdRol.textContent = ROL_TEXTO[u.rol] ?? u.rol_nombre;
        } else {
            const sel = document.createElement("select");
            sel.className = "sel-rol";
            [["EMPLEADO", "Empleado"], ["CLIENTE", "Cliente"]].forEach(([v, t]) => sel.append(new Option(t, v)));
            sel.value = u.rol;
            sel.addEventListener("change", () => cambiarRol(u, sel));
            tdRol.append(sel);
        }
        tr.append(tdRol);

        const tdEstado = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "status " + (u.activo ? "available" : "inactive");
        badge.textContent = u.activo ? "Activo" : "Inactivo";
        tdEstado.append(badge);
        tr.append(tdEstado);

        // Acciones: no se puede desactivar a un dueño ni a uno mismo
        const tdAcc = document.createElement("td");
        if (u.rol !== "DUENO" && !u.es_yo) {
            const b = document.createElement("button");
            b.type = "button"; b.className = "btn ghost small";
            b.textContent = u.activo ? "Desactivar" : "Activar";
            b.addEventListener("click", () => cambiarActivo(u));
            tdAcc.append(b);
        }
        tr.append(tdAcc);
        cuerpo.append(tr);
    });

    $("resultCount").textContent = `${visibles.length} de ${usuarios.length} usuarios`;
}

async function cargar() {
    const { ok, datos } = await api("/api/admin/usuarios");
    if (!ok) return aviso(datos.error || "No se pudieron cargar los usuarios.", "error");
    usuarios = datos;
    render();
}

async function cambiarRol(u, sel) {
    sel.disabled = true;
    const { ok, datos } = await api(`/api/admin/usuarios/${u.id}/rol`, "PATCH", { rol: sel.value });
    if (ok) aviso(`${u.nombre} ahora es ${ROL_TEXTO[sel.value].toLowerCase()}.`);
    else aviso(datos.error || "No se pudo cambiar el rol.", "error");
    await cargar();   // recarga para mostrar lo que realmente quedó guardado
}

async function cambiarActivo(u) {
    const accion = u.activo ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que quieres ${accion} la cuenta de ${u.nombre}?`)) return;
    const { ok, datos } = await api(`/api/admin/usuarios/${u.id}/activo`, "PATCH", { activo: !u.activo });
    if (ok) aviso(u.activo ? "Cuenta desactivada." : "Cuenta activada.");
    else aviso(datos.error || "No se pudo cambiar el estado.", "error");
    await cargar();
}

document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
    filtro = c.dataset.filter;
    document.querySelectorAll(".chip").forEach(x => x.classList.toggle("active", x === c));
    render();
}));
$("buscar").addEventListener("input", render);

$("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    location.href = "login.html";
});

// ARRANQUE: solo el dueño puede ver esta pantalla
(async function iniciar() {
    try {
        const { ok, datos } = await api("/api/me");
        if (!ok) return;
        $("userName").textContent = datos.nombre;
        if (datos.rol !== "DUENO") {
            $("contenido").hidden = true;
            $("resultCount").textContent = "";
            return aviso("Solo el dueño puede administrar usuarios.", "error");
        }
        await cargar();
    } catch (err) {
        if (err.message !== "Sin sesión") aviso("No se pudo conectar con el servidor.", "error");
    }
})();
