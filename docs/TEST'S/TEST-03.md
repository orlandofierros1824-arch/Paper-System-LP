# TEST 03 — Verificar el diseño, legibilidad y responsividad de la interfaz de usuario

## 1. Información general

* **Proyecto:** Paper System-LP

* **Sistema:** Gestión de Inventario de Papelería Los Piwis

* **Tipo de prueba:** Aceptación / Interfaz de Usuario (UI/UX)

* **ID de prueba:** TE-03

* **Responsable:** Miguel lobo

* **Fecha:** 04/11/2026

* **Versión del sistema:** 0.8

## 2. Descripción de la prueba

* **Nombre:** Verificación del diseño visual y adaptabilidad de la interfaz de búsqueda y ubicación.

* **Objetivo:** Comprobar que el diseño de la página web presente de forma clara, ordenada y accesible la información esencial de los productos (nombre, stock, demanda y ubicación en formato `Pasillo-Anaquel-Estante`), garantizando una correcta visualización tanto en equipos de escritorio como en dispositivos móviles.

* **Módulo evaluado:** Frontend (React, Componentes de Interfaz y Hojas de Estilo).

## 3. Precondiciones

* Tener instalado Node.js y npm en el equipo de desarrollo.

* Contar con las dependencias del proyecto frontend actualizadas.

* Tener iniciado el servidor de desarrollo local de React (Vite).

* Contar con datos de prueba precargados en la base de datos o simulados en el cliente.

## 4. Datos de entrada

* **URL de acceso local:** `http://localhost:3000`

* **Resoluciones de prueba:**

  * Escritorio: `1920x1080` píxeles.

* **Término de prueba:** Búsqueda del producto "Cuaderno profesional" con ubicación `P1-A2-E3`.

## 5. Procedimiento

1. Abrir la terminal en la carpeta del proyecto frontend y ejecutar el comando `npm run dev`.

2. Esperar a que la terminal indique que el servidor de desarrollo está activo y accesible.

3. Abrir el navegador web e ingresar a la dirección local `http://localhost:3000`.

4. Verificar visualmente que la página principal muestre el título institucional ("Papelería Los Piwis"), el panel de inicio de sesión y la barra de búsqueda con un diseño limpio e intuitivo.

5. Introducir el término "Cuaderno profesional" en la barra de búsqueda y activar la consulta.

6. Comprobar que la tarjeta de resultados refleje de manera destacada y legible:

   * Nombre del producto.

   * Cantidad en stock (ej. 8 unidades).

   * Nivel de demanda (ej. Alta).

   * Código de ubicación estructurado (`Pasillo - Anaquel - Estante`).

   * Estado actual (Disponible / Agotado).

7. Abrir las herramientas de desarrollo del navegador (DevTools), activar el modo responsivo y verificar que la interfaz se adapte correctamente a pantallas pequeñas sin solapamiento de textos ni desbordamiento de componentes.

## 6. Resultados

* **Resultado esperado:** La interfaz presenta un diseño profesional y coherente con los requerimientos del MVP. La información de ubicación y existencias se lee con claridad en cualquier resolución, cumpliendo con las expectativas de usabilidad para el propietario y los empleados de la papelería.

* **Resultado obtenido:** Pendiente de ejecución formal en entorno de pruebas.

* **Estado:** PENDIENTE.

## 7. Evidencias

<img width="1919" height="1034" alt="Captura de pantalla 2026-11-04 212143" src="https://github.com/user-attachments/assets/421f2ffb-4718-45e2-8ba3-9afbddf71edc" />

