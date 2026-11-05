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
/* ---------- Sesión actual ---------- */
app.get("/api/me", async (req, res) => {
    try {
        const t = jwt.verify(req.cookies?.piwis_token, process.env.JWT_SECRET);
        const [rows] = await pool.execute(
            "SELECT nombre FROM usuarios WHERE id_usuario = ? AND activo = TRUE",
            [t.id]
        );
        if (!rows[0]) return res.status(401).json({ error: "Sin sesión" });
        res.json({ nombre: rows[0].nombre, rol: t.rol });
        } catch (err) {
        console.error("api/me:", err.message);
        res.status(401).json({ error: "Sin sesión" });
    }
});
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

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

/* Limita intentos para frenar ataques de fuerza bruta */
const limiteAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: "Demasiados intentos. Espera unos minutos." }
});

/* ---------- Registro ---------- */
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

/* ---------- Login ---------- */
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

/* ---------- Productos (público, como en tu index.html) ---------- */
app.get("/api/productos", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT producto AS nombre, categoria, codigo_ubicacion AS ubicacion,
                    stock AS existencia, unidad_medida AS unidad, stock_minimo AS minimo
             FROM vw_inventario WHERE activo = TRUE ORDER BY producto`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ---------- Archivos de la web ---------- */
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));