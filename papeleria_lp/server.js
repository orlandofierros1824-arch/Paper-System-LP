/* ==========================================================================
   ARCHIVO: server.js
   Servidor de Papelería Los Piwis (Express + MySQL).
   Es TU server.js con estos cambios:
     1. Se corrigió el ORDEN: /api/me estaba antes de cookieParser() y por eso
        nunca leía la cookie de sesión (siempre respondía "Sin sesión").
     2. Se agregó la protección por rol (requiereRol) revisada en la base de datos.
     3. Se agregaron las rutas de administración de productos (/api/admin/...).
   Todo lo demás (registro, login, logout, /api/productos público) sigue igual.
   ========================================================================== */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PROD = process.env.NODE_ENV === "production";

app.set("trust proxy", 1); // necesario detrás del proxy de Render

/* ---------- Middlewares generales (el orden importa) ---------- */
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());   // debe ir ANTES de cualquier ruta que lea req.cookies

/* ---------- Base de datos (Aiven exige SSL) ---------- */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: fs.readFileSync(path.join(__dirname, "ca.pem")) },
    waitForConnections: true,
    connectionLimit: 5
});

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSONAL = ["DUENO", "EMPLEADO"];   // roles que pueden administrar productos

/* Limita intentos para frenar ataques de fuerza bruta */
const limiteAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: "Demasiados intentos. Espera unos minutos." }
});

/* ==========================================================================
   SESIÓN Y ROLES
   ========================================================================== */

/* Devuelve el usuario de la sesión actual { id, nombre, rol } o null.
   El rol se consulta en la base en cada petición: si el dueño desactiva a un
   empleado o le cambia el rol, el cambio aplica de inmediato (no espera a que
   expire el token de 8 horas). */
async function usuarioActual(req) {
    const token = req.cookies?.piwis_token;
    if (!token) return null;
    try {
        const t = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.execute(
            `SELECT u.id_usuario AS id, u.nombre, r.codigo AS rol
             FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ? AND u.activo = TRUE AND r.activo = TRUE`,
            [t.id]
        );
        return rows[0] ?? null;
    } catch (err) {
        if (err.name !== "JsonWebTokenError" && err.name !== "TokenExpiredError")
            console.error("usuarioActual:", err.message);
        return null;
    }
}

/* Middleware: solo deja pasar a los roles indicados.
   Uso: app.get("/ruta", requiereRol("DUENO", "EMPLEADO"), (req, res) => {...}) */
function requiereRol(...roles) {
    return async (req, res, next) => {
        const u = await usuarioActual(req);
        if (!u) return res.status(401).json({ error: "Inicia sesión para continuar." });
        if (!roles.includes(u.rol))
            return res.status(403).json({ error: "No tienes permiso para esta acción." });
        req.usuario = u;
        next();
    };
}

/* ---------- Sesión actual ---------- */
app.get("/api/me", async (req, res) => {
    const u = await usuarioActual(req);
    if (!u) return res.status(401).json({ error: "Sin sesión" });
    res.json({ id: u.id, nombre: u.nombre, rol: u.rol });
});

/* ==========================================================================
   REGISTRO, LOGIN Y LOGOUT (sin cambios)
   ========================================================================== */

app.post("/api/registro", limiteAuth, async (req, res) => {
    try {
        const nombre = String(req.body.nombre ?? "").trim();
        const correo = String(req.body.correo ?? "").trim().toLowerCase();
        const password = String(req.body.password ?? "");

        // El servidor SIEMPRE valida de nuevo
        if (nombre.length < 3 || nombre.length > 120)
            return res.status(400).json({ error: "Escribe tu nombre completo." });
        if (!EMAIL_VALIDO.test(correo) || correo.length > 190)
            return res.status(400).json({ error: "Correo electrónico no válido." });
        if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
            return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, con letras y números." });

        const hash = await bcrypt.hash(password, 12);

        // El rol lo decide el servidor: todo registro público es CLIENTE
        const [r] = await pool.execute(
            `INSERT INTO usuarios (nombre, correo, password_hash, id_rol)
             SELECT ?, ?, ?, id_rol FROM roles WHERE codigo = 'CLIENTE'`,
            [nombre, correo, hash]
        );
        if (r.affectedRows === 0)
            return res.status(500).json({ error: "Configuración incompleta del servidor." });

        res.status(201).json({ mensaje: "Cuenta creada" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY")
            return res.status(409).json({ error: "Ese correo ya está registrado." });
        console.error(err);
        res.status(500).json({ error: "Error del servidor. Intenta más tarde." });
    }
});

app.post("/api/login", limiteAuth, async (req, res) => {
    try {
        const correo = String(req.body.correo ?? "").trim().toLowerCase();
        const password = String(req.body.password ?? "");

        const [rows] = await pool.execute(
            `SELECT u.id_usuario, u.nombre, u.password_hash, r.codigo AS rol
             FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.correo = ? AND u.activo = TRUE`,
            [correo]
        );
        const u = rows[0];
        const ok = u && await bcrypt.compare(password, u.password_hash);
        if (!ok) return res.status(401).json({ error: "Correo o contraseña incorrectos." });

        const token = jwt.sign({ id: u.id_usuario, rol: u.rol }, process.env.JWT_SECRET, { expiresIn: "8h" });
        res.cookie("piwis_token", token, {
            httpOnly: true,       // JavaScript del navegador no puede leerla
            secure: PROD,         // solo por HTTPS en producción
            sameSite: "lax",
            maxAge: 8 * 60 * 60 * 1000
        });
        res.json({ nombre: u.nombre });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor. Intenta más tarde." });
    }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("piwis_token");
    res.json({ mensaje: "Sesión cerrada" });
});

/* ==========================================================================
   PRODUCTOS PÚBLICOS: solo los activos, para el inventario (lee las tablas, no la vista)
   ========================================================================== */

app.get("/api/productos", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.id_producto AS id, p.codigo_producto AS codigo, p.nombre, c.nombre AS categoria, p.precio,
                    u.codigo AS ubicacion, p.stock AS existencia,
                    p.unidad_medida AS unidad, p.stock_minimo AS minimo
             FROM productos p
             JOIN categorias c ON c.id_categoria = p.id_categoria
             LEFT JOIN ubicaciones u ON u.id_ubicacion = p.id_ubicacion
             WHERE p.activo = TRUE
             ORDER BY p.nombre`
        );
        // DECIMAL llega como texto: se convierte a número
        res.json(rows.map(r => ({ ...r, precio: Number(r.precio) })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ==========================================================================
   ADMINISTRACIÓN DE PRODUCTOS (solo DUENO y EMPLEADO)
   ========================================================================== */

const MAX_ID = Number.MAX_SAFE_INTEGER;

/* Devuelve el número si es entero entre min y max; si no, null */
function entero(v, min, max) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/* Valida y limpia los datos de un producto. Devuelve { error } o { datos } */
function leerProducto(b) {
    const codigo = String(b.codigo ?? "").trim();
    const nombre = String(b.nombre ?? "").trim();
    const descripcion = String(b.descripcion ?? "").trim() || null;
    const unidad = String(b.unidad ?? "pieza").trim() || "pieza";
    const id_categoria = entero(b.id_categoria, 1, MAX_ID);
    const id_ubicacion = b.id_ubicacion ? entero(b.id_ubicacion, 1, MAX_ID) : null;
    const precio = Number(b.precio);
    const stock_minimo = entero(b.stock_minimo ?? 0, 0, 1000000);

    if (!codigo || codigo.length > 60) return { error: "El código es obligatorio (máximo 60 caracteres)." };
    if (nombre.length < 2 || nombre.length > 160) return { error: "El nombre debe tener entre 2 y 160 caracteres." };
    if (descripcion && descripcion.length > 2000) return { error: "La descripción es demasiado larga." };
    if (unidad.length > 30) return { error: "La unidad de medida es demasiado larga." };
    if (!id_categoria) return { error: "Elige una categoría." };
    if (b.id_ubicacion && !id_ubicacion) return { error: "Ubicación no válida." };
    if (!Number.isFinite(precio) || precio < 0 || precio > 99999999) return { error: "Precio no válido." };
    if (stock_minimo === null) return { error: "El stock mínimo no es válido." };

    return {
        datos: {
            codigo, nombre, descripcion, unidad, id_categoria, id_ubicacion,
            precio: Math.round(precio * 100) / 100, stock_minimo
        }
    };
}

/* Traduce errores de MySQL a mensajes comprensibles */
function errorProducto(err, res) {
    if (err.code === "ER_DUP_ENTRY")
        return res.status(409).json({ error: "Ya existe un producto con ese código." });
    if (err.code === "ER_NO_REFERENCED_ROW_2")
        return res.status(400).json({ error: "La categoría o la ubicación no existe." });
    console.error(err);
    return res.status(500).json({ error: "Error del servidor. Intenta más tarde." });
}

/* ---------- Lista completa (incluye inactivos y datos para editar) ---------- */
app.get("/api/admin/productos", requiereRol(...PERSONAL), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.id_producto AS id, p.codigo_producto AS codigo, p.nombre, p.descripcion,
                    p.id_categoria, c.nombre AS categoria,
                    p.id_ubicacion, u.codigo AS ubicacion,
                    p.precio, p.stock AS existencia, p.stock_minimo AS minimo,
                    p.unidad_medida AS unidad, p.activo
             FROM productos p
             JOIN categorias c ON c.id_categoria = p.id_categoria
             LEFT JOIN ubicaciones u ON u.id_ubicacion = p.id_ubicacion
             ORDER BY p.nombre`
        );
        // DECIMAL llega como texto y BOOLEAN como 0/1: se convierten a número y true/false
        res.json(rows.map(r => ({ ...r, precio: Number(r.precio), activo: !!r.activo })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ---------- Crear producto (solo el JEFE; con existencias iniciales opcionales) ---------- */
app.post("/api/admin/productos", requiereRol("DUENO"), async (req, res) => {
    const body = req.body ?? {};
    const { error, datos } = leerProducto(body);
    if (error) return res.status(400).json({ error });
    const stockInicial = entero(body.stock ?? 0, 0, 1000000);
    if (stockInicial === null) return res.status(400).json({ error: "Las existencias iniciales no son válidas." });

    // Transacción: o se guarda todo (producto + movimiento) o no se guarda nada
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [r] = await conn.execute(
            `INSERT INTO productos
               (codigo_producto, nombre, descripcion, id_categoria, id_ubicacion,
                precio, stock, stock_minimo, unidad_medida)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [datos.codigo, datos.nombre, datos.descripcion, datos.id_categoria, datos.id_ubicacion,
             datos.precio, stockInicial, datos.stock_minimo, datos.unidad]
        );
        if (stockInicial > 0) {
            await conn.execute(
                `INSERT INTO movimientos_inventario
                   (id_producto, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo)
                 VALUES (?, ?, 'ENTRADA', ?, 0, ?, 'Existencias iniciales')`,
                [r.insertId, req.usuario.id, stockInicial, stockInicial]
            );
        }
        await conn.commit();
        res.status(201).json({ id: r.insertId });
    } catch (err) {
        await conn.rollback();
        errorProducto(err, res);
    } finally {
        conn.release();
    }
});

/* ---------- Editar producto (NO cambia existencias: para eso está el movimiento) ---------- */
app.put("/api/admin/productos/:id", requiereRol(...PERSONAL), async (req, res) => {
    const id = entero(req.params.id, 1, MAX_ID);
    if (!id) return res.status(400).json({ error: "Producto no válido." });

    // EMPLEADO: solo puede cambiar la ubicación (organización del almacén).
    // Precio, nombre, código, categoría y mínimo quedan reservados al jefe.
    if (req.usuario.rol === "EMPLEADO") {
        const idUbicacion = req.body?.id_ubicacion ? entero(req.body.id_ubicacion, 1, MAX_ID) : null;
        if (req.body?.id_ubicacion && !idUbicacion) return res.status(400).json({ error: "Ubicación no válida." });
        try {
            const [r] = await pool.execute("UPDATE productos SET id_ubicacion = ? WHERE id_producto = ?", [idUbicacion, id]);
            if (r.affectedRows === 0) return res.status(404).json({ error: "El producto no existe." });
            return res.json({ mensaje: "Ubicación actualizada" });
        } catch (err) {
            return errorProducto(err, res);
        }
    }

    // DUENO: edita todo
    const { error, datos } = leerProducto(req.body ?? {});
    if (error) return res.status(400).json({ error });

    try {
        const [r] = await pool.execute(
            `UPDATE productos
             SET codigo_producto = ?, nombre = ?, descripcion = ?, id_categoria = ?,
                 id_ubicacion = ?, precio = ?, stock_minimo = ?, unidad_medida = ?
             WHERE id_producto = ?`,
            [datos.codigo, datos.nombre, datos.descripcion, datos.id_categoria,
             datos.id_ubicacion, datos.precio, datos.stock_minimo, datos.unidad, id]
        );
        if (r.affectedRows === 0) return res.status(404).json({ error: "El producto no existe." });
        res.json({ mensaje: "Producto actualizado" });
    } catch (err) {
        errorProducto(err, res);
    }
});

/* ---------- Movimiento de existencias (entrada, salida o ajuste) ---------- */
const TIPOS_SUMA = ["ENTRADA", "AJUSTE_POSITIVO"];
const TIPOS_RESTA = ["SALIDA", "AJUSTE_NEGATIVO"];

app.post("/api/admin/productos/:id/movimiento", requiereRol(...PERSONAL), async (req, res) => {
    const id = entero(req.params.id, 1, MAX_ID);
    const tipo = String(req.body?.tipo ?? "");
    const cantidad = entero(req.body?.cantidad, 1, 1000000);
    const motivo = String(req.body?.motivo ?? "").trim().slice(0, 255) || null;

    if (!id) return res.status(400).json({ error: "Producto no válido." });
    if (![...TIPOS_SUMA, ...TIPOS_RESTA].includes(tipo)) return res.status(400).json({ error: "Tipo de movimiento no válido." });
    if (!cantidad) return res.status(400).json({ error: "La cantidad debe ser un número entero mayor a 0." });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // FOR UPDATE bloquea la fila: evita que dos personas cambien el stock a la vez
        const [rows] = await conn.execute("SELECT stock FROM productos WHERE id_producto = ? FOR UPDATE", [id]);
        if (!rows[0]) { await conn.rollback(); return res.status(404).json({ error: "El producto no existe." }); }

        const anterior = rows[0].stock;
        const nuevo = TIPOS_SUMA.includes(tipo) ? anterior + cantidad : anterior - cantidad;
        if (nuevo < 0) {
            await conn.rollback();
            return res.status(400).json({ error: `No hay suficientes existencias (actuales: ${anterior}).` });
        }

        await conn.execute("UPDATE productos SET stock = ? WHERE id_producto = ?", [nuevo, id]);
        await conn.execute(
            `INSERT INTO movimientos_inventario
               (id_producto, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, req.usuario.id, tipo, cantidad, anterior, nuevo, motivo]
        );
        await conn.commit();
        res.json({ existencia: nuevo });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: "Error del servidor. Intenta más tarde." });
    } finally {
        conn.release();
    }
});

/* ---------- Activar / desactivar (solo el DUEÑO). No se borra nada. ---------- */
app.patch("/api/admin/productos/:id/activo", requiereRol("DUENO"), async (req, res) => {
    const id = entero(req.params.id, 1, MAX_ID);
    if (!id || typeof req.body?.activo !== "boolean") return res.status(400).json({ error: "Datos no válidos." });
    try {
        const [r] = await pool.execute("UPDATE productos SET activo = ? WHERE id_producto = ?", [req.body.activo, id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: "El producto no existe." });
        res.json({ activo: req.body.activo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ==========================================================================
   CATEGORÍAS Y UBICACIONES (listas para los menús + alta rápida)
   ========================================================================== */

app.get("/api/admin/categorias", requiereRol(...PERSONAL), async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id_categoria AS id, nombre FROM categorias WHERE activa = TRUE ORDER BY nombre");
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: "Error del servidor." }); }
});

app.post("/api/admin/categorias", requiereRol("DUENO"), async (req, res) => {
    const nombre = String(req.body?.nombre ?? "").trim();
    if (nombre.length < 2 || nombre.length > 100) return res.status(400).json({ error: "El nombre debe tener entre 2 y 100 caracteres." });
    try {
        const [r] = await pool.execute("INSERT INTO categorias (nombre) VALUES (?)", [nombre]);
        res.status(201).json({ id: r.insertId, nombre });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Esa categoría ya existe." });
        console.error(err); res.status(500).json({ error: "Error del servidor." });
    }
});

app.get("/api/admin/ubicaciones", requiereRol(...PERSONAL), async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id_ubicacion AS id, codigo FROM ubicaciones WHERE activa = TRUE ORDER BY codigo");
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: "Error del servidor." }); }
});

/* Normaliza un componente de ubicación: "1" -> "P1" (según la letra), "p1" -> "P1" */
function componente(valor, letra) {
    const v = String(valor ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{1,10}$/.test(v)) return null;
    return /^\d+$/.test(v) ? letra + v : v;
}

app.post("/api/admin/ubicaciones", requiereRol(...PERSONAL), async (req, res) => {
    const pasillo = componente(req.body?.pasillo, "P");
    const anaquel = componente(req.body?.anaquel, "A");
    const estante = componente(req.body?.estante, "E");
    if (!pasillo || !anaquel || !estante)
        return res.status(400).json({ error: "Escribe pasillo, anaquel y estante (por ejemplo 1,2,3)." });
    const codigo = `${pasillo}-${anaquel}-${estante}`;
    try {
        const [r] = await pool.execute(
            "INSERT INTO ubicaciones (pasillo, anaquel, estante, codigo) VALUES (?, ?, ?, ?)",
            [pasillo, anaquel, estante, codigo]
        );
        res.status(201).json({ id: r.insertId, codigo });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Esa ubicación ya existe." });
        console.error(err); res.status(500).json({ error: "Error del servidor." });
    }
});

/* ==========================================================================
   USUARIOS (solo el DUEÑO)
   El jefe ve las cuentas, convierte clientes en empleados (o al revés) y
   desactiva cuentas. Reglas de seguridad:
     - No puede cambiar su propio rol ni desactivarse a sí mismo.
     - No puede tocar a otro dueño desde aquí (ese rol se da solo en la base).
     - Solo se pueden asignar los roles EMPLEADO y CLIENTE.
   ========================================================================== */

const ROLES_ASIGNABLES = ["EMPLEADO", "CLIENTE"];

/* Busca el rol actual de un usuario (o null si no existe) */
async function rolDe(id) {
    const [rows] = await pool.execute(
        `SELECT r.codigo AS rol FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`, [id]);
    return rows[0]?.rol ?? null;
}

app.get("/api/admin/usuarios", requiereRol("DUENO"), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id_usuario AS id, u.nombre, u.correo, r.codigo AS rol, r.nombre AS rol_nombre,
                    u.activo, u.fecha_creacion
             FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
             ORDER BY (r.codigo = 'DUENO') DESC, u.nombre`
        );
        // Nunca se envía password_hash
        res.json(rows.map(u => ({ ...u, activo: !!u.activo, es_yo: u.id === req.usuario.id })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.patch("/api/admin/usuarios/:id/rol", requiereRol("DUENO"), async (req, res) => {
    const id = entero(req.params.id, 1, MAX_ID);
    const rol = String(req.body?.rol ?? "");
    if (!id || !ROLES_ASIGNABLES.includes(rol)) return res.status(400).json({ error: "Datos no válidos." });
    if (id === req.usuario.id) return res.status(400).json({ error: "No puedes cambiar tu propio rol." });
    try {
        const actual = await rolDe(id);
        if (!actual) return res.status(404).json({ error: "El usuario no existe." });
        if (actual === "DUENO") return res.status(400).json({ error: "No se puede cambiar el rol de un dueño desde aquí." });
        await pool.execute(
            "UPDATE usuarios SET id_rol = (SELECT id_rol FROM roles WHERE codigo = ?) WHERE id_usuario = ?", [rol, id]);
        res.json({ rol });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.patch("/api/admin/usuarios/:id/activo", requiereRol("DUENO"), async (req, res) => {
    const id = entero(req.params.id, 1, MAX_ID);
    if (!id || typeof req.body?.activo !== "boolean") return res.status(400).json({ error: "Datos no válidos." });
    if (id === req.usuario.id) return res.status(400).json({ error: "No puedes desactivar tu propia cuenta." });
    try {
        const actual = await rolDe(id);
        if (!actual) return res.status(404).json({ error: "El usuario no existe." });
        if (actual === "DUENO") return res.status(400).json({ error: "No se puede desactivar a un dueño desde aquí." });
        await pool.execute("UPDATE usuarios SET activo = ? WHERE id_usuario = ?", [req.body.activo, id]);
        res.json({ activo: req.body.activo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ==========================================================================
   PERFIL (cualquier usuario con sesión: dueño, empleado o cliente)
   Cada quien solo puede ver y cambiar SU propio perfil: el id sale de la
   sesión (req.usuario.id), nunca de lo que mande el navegador.
   ========================================================================== */

const TODOS = ["DUENO", "EMPLEADO", "CLIENTE"];

/* Ver mi perfil */
app.get("/api/perfil", requiereRol(...TODOS), async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT u.nombre, u.correo, r.codigo AS rol, r.nombre AS rol_nombre, u.fecha_creacion
             FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ?`,
            [req.usuario.id]
        );
        if (!rows[0]) return res.status(404).json({ error: "Perfil no encontrado." });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* Cambiar mi nombre (el correo y el rol NO se pueden cambiar desde aquí) */
app.put("/api/perfil", requiereRol(...TODOS), async (req, res) => {
    const nombre = String(req.body?.nombre ?? "").trim();
    if (nombre.length < 3 || nombre.length > 120)
        return res.status(400).json({ error: "Escribe tu nombre completo (3 a 120 caracteres)." });
    try {
        await pool.execute("UPDATE usuarios SET nombre = ? WHERE id_usuario = ?", [nombre, req.usuario.id]);
        res.json({ nombre });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* Cambiar mi contraseña: exige la contraseña actual */
app.put("/api/perfil/password", limiteAuth, requiereRol(...TODOS), async (req, res) => {
    try {
        const actual = String(req.body?.actual ?? "");
        const nueva = String(req.body?.nueva ?? "");

        if (nueva.length < 8 || nueva.length > 72 || !/[A-Za-z]/.test(nueva) || !/\d/.test(nueva))
            return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres, con letras y números." });
        if (nueva === actual)
            return res.status(400).json({ error: "La nueva contraseña debe ser distinta a la actual." });

        const [rows] = await pool.execute("SELECT password_hash FROM usuarios WHERE id_usuario = ?", [req.usuario.id]);
        const ok = rows[0] && await bcrypt.compare(actual, rows[0].password_hash);
        // Se responde 400 (y no 401) para que la pantalla no crea que la sesión expiró
        if (!ok) return res.status(400).json({ error: "La contraseña actual no es correcta." });

        const hash = await bcrypt.hash(nueva, 12);
        await pool.execute("UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?", [hash, req.usuario.id]);
        res.json({ mensaje: "Contraseña actualizada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor. Intenta más tarde." });
    }
});

/* ==========================================================================
   ARCHIVOS DE LA WEB (carpeta public)
   ========================================================================== */

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));