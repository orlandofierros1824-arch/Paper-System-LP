# UT-02 — Verificar que el servidor está conectado

## 1. Información general

- **Proyecto:** Paper System-LP
- **Sistema:** Gestión de Inventario de Papelería Los Piwis
- **Tipo de prueba:** Unitaria
- **ID de prueba:** UT-02
- **Responsable:** Orlando Fierros
- **Fecha:** 04/11/2026
- **Versión del sistema:** 0.8

## 2. Descripción de la prueba

**Nombre:** Verificar que el servidor está conectado.

**Objetivo:** Comprobar que el servidor de la aplicación se encuentra activo, acepta solicitudes y responde correctamente a las peticiones realizadas desde el sistema.

**Módulo evaluado:** Servidor / Backend.

## 3. Precondiciones

- Tener instalado Node.js y npm.
- Contar con las dependencias necesarias del proyecto.
- Tener configurado el servidor en el backend.
- Contar con los archivos de configuración necesarios para iniciar la aplicación.

## 4. Datos de entrada

- Dirección local del servidor: `http://localhost`
- Puerto configurado para el servidor.
- Solicitud HTTP para comprobar la respuesta del servidor.

## 5. Procedimiento

1. Abrir Visual Studio Code y acceder a la carpeta del proyecto.
2. Abrir una terminal en la ubicación del servidor.
3. Ejecutar el comando correspondiente para iniciar el servidor, por ejemplo, `npm run dev`, si está configurado en el proyecto.
4. Esperar a que la terminal indique que el servidor se inició correctamente.
5. Acceder desde el navegador a la dirección local y al puerto configurado.
6. Comprobar que el servidor responde a la solicitud realizada.

## 6. Resultados

**Resultado esperado:** El servidor inicia correctamente, permanece activo y responde a las solicitudes realizadas desde el navegador, sin presentar errores de conexión.

**Resultado obtenido:** Pendiente de ejecución.

**Estado:** PENDIENTE.

## 7. Evidencias

- Captura de pantalla de la terminal mostrando que el servidor inició correctamente.
- Captura del navegador mostrando la respuesta del servidor.
- Registro de posibles errores presentados durante la ejecución.
