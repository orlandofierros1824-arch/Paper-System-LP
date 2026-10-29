<!--
══════════════════════════════════════════════════════════════
═
Registro de Bloqueos e Impedimentos
Ubicación: docs/bloqueos.md
══════════════════════════════════════════════════════════════
═
-->
# ⚡ ZONA DE IMPACTO: BLOQUEOS DEL MVP ⚡

**Proyecto:** `Sistema de Gestión de Inventario - Papelería Los Piwis`  
**Propósito:** Documentar impedimentos, dependencias y riesgos que retrasen o pongan en riesgo el desarrollo del MVP en el plazo de 10 semanas (140 horas).

---

## 📊 Resumen Ejecutivo

Este documento centraliza el seguimiento de impedimentos técnicos, organizacionales, de dependencia y de conocimiento detectados durante la planificación y ejecución del proyecto. Permite al equipo identificar cuellos de botella, registrar alternativas probadas y escalar oportunamente a los niveles correspondientes (autonomía del equipo, gestión interna o validación con la facilitadora/propietario).

| Estado | Cantidad | Descripción |
| :--- | :---: | :--- |
| `🟢 Resuelto` | **2** | Impedimentos superados mediante decisiones de arquitectura o acuerdos de equipo. |
| `🟡 Mitigado` | **3** | Riesgos controlados mediante alcance o acciones preventivas. |
| `🔴 Abierto` | **3** | Impedimentos actuales que requieren atención activa en los próximos sprints. |
| **Total** | **8** | |

---

## 📋 Tabla de Control de Bloqueos

| ID | Descripción | Historia | Tipo | Escalamiento | Intentos Previos | Responsable | Estado | Qué se probó / Solución |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BL-01` | Falta de un formato estándar para registrar la ubicación física de los productos. | `HU-1`, `HU-5` | Técnico / Organizacional | Equipo | Discusión interna sobre esquemas de texto libre. | Ángel (PO) | `🟢 Resuelto` | Se estableció en el `ADR-001` el código jerárquico `P{n}-A{n}-E{n}`. |
| `BL-02` | Riesgo de registro de ubicaciones incompletas o erróneas en el sistema. | `HU-1`, `HU-5` | Técnico | Autonomía | Validación manual en cliente. | Erik Guardado | `🟡 Mitigado` | Validación por expresiones regulares en backend y estado "ubicación pendiente". |
| `BL-03` | Falta de información actualizada de existencias para productos agotados/disponibles. | `HU-2`, `HU-4` | Dependencia / Técnico | Equipo | Borrador inicial de historias de usuario. | Edgar Uribe | `🔴 Abierto` | Definición de esquemas preliminares de inventario en MySQL. |
| `BL-04` | Ausencia de registro histórico de ventas para clasificar demanda. | `HU-6`, `HU-8`, `HU-9` | Dependencia | Equipo | Revisión del backlog general. | Orlando Fierros | `🔴 Abierto` | Análisis de requisitos para el módulo de ventas y rotación. |
| `BL-05` | Capacidad limitada del equipo (140 horas en 10 semanas) frente al alcance total. | `HU-1` a `HU-10` | Organizacional / Personal | Equipo | Asignación libre de tareas sin estimación de tallas. | Miguel (SM) | `🟢 Resuelto` | Filtrado mediante prioridades MoSCoW y enfoque estricto en el MVP. |
| `BL-06` | Ausencia de ubicación física previamente identificada y rotulada en el local. | `HU-1`, `HU-5` | Externo / Organizacional | Escalamiento Externo (Dueño) | Intentos de organizar por categoría tradicional. | Ángel (PO) | `🟡 Mitigado` | Coordinación con el propietario para el etiquetado físico de anaqueles. |
| `BL-07` | Limitación del modelo de una sola ubicación por producto en el MVP. | `HU-1`, `HU-5` | Organizacional | Autonomía | Evaluar múltiples ubicaciones simultáneas. | Equipo Dev | `🟡 Mitigado` | Acotar el MVP a una ubicación principal y documentar mejoras futuras. |
| `BL-08` | Dependencia de datos consistentes de inventario para generar reportes y alertas. | `HU-4`, `HU-6`, `HU-8` | Dependencia | Equipo | Pruebas aisladas de reportes sin datos base. | Miguel / Edgar | `🔴 Abierto` | Verificación de flujos de datos previos en la base de datos. |

---

## 📌 Convenciones de Clasificación

* **Tipos de Bloqueo:** `Técnico`, `Dependencia`, `Organizacional`, `Acceso`, `Conocimiento`, `Personal`, `Externo`.
* **Niveles de Escalamiento:**
  * `Autonomía`: Resuelto directamente por el desarrollador o responsable asignado.
  * `Equipo`: Tratado en ceremonias ágiles (Daily/Sprint Planning).
  * `Escalamiento Externo`: Requiere intervención del Product Owner, Profesor o Dueño del negocio.

---
<!--
══════════════════════════════════════════════════════════════
═
Nota: Actualizar este registro al finalizar cada sprint para reflejar
el estado real de los impedimentos del proyecto.
══════════════════════════════════════════════════════════════
═
-->