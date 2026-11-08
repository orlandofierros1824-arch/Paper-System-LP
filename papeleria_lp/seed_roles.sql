-- ============================================================
-- Datos MÍNIMOS que necesita el sistema para funcionar.
-- Ejecútalo UNA vez, en la misma base de datos donde creaste las tablas.
-- Sin estos roles, el registro responde "Configuración incompleta del servidor".
-- ============================================================

INSERT INTO roles (codigo, nombre, descripcion) VALUES
    ('DUENO',    'Dueño',    'Control total del sistema'),
    ('EMPLEADO', 'Empleado', 'Administra productos y existencias'),
    ('CLIENTE',  'Cliente',  'Consulta el inventario')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================
-- Convertirte en DUEÑO (haz esto DESPUÉS de crear tu cuenta en login.html).
-- Cambia el correo por el que usaste al registrarte:
-- ============================================================
-- UPDATE usuarios
--    SET id_rol = (SELECT id_rol FROM roles WHERE codigo = 'DUENO')
--  WHERE correo = 'tu_correo@ejemplo.com';

-- Para dar acceso a un empleado, igual pero con 'EMPLEADO'.
