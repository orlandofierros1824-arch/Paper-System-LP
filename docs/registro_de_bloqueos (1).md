<!--
══════════════════════════════════════════════════════════════
═
Registro de Bloqueos y Riesgos del MVP
Ubicación: docs/bloqueos.md
Proyecto: Sistema de Gestión de Inventario - Papelería Los Piwis
══════════════════════════════════════════════════════════════
═
-->
# ⚡ ZONA DE IMPACTO: BLOQUEOS Y RIESGOS DEL MVP ⚡

**Proyecto:** `Sistema de organización y localización de productos — Papelería Los Piwis`  
**Propósito:** Documentar impedimentos, dependencias y riesgos técnicos u organizacionales que retrasen o pongan en riesgo el desarrollo del MVP en el plazo de 10 semanas (140 horas).

`[ 🟢 RESUELTO ]` · `[ 🟡 MITIGADO ]` · `[ 🔴 ABIERTO ]`

---

## 📋 Resumen Ejecutivo
El presente documento recopila el registro y seguimiento de los bloqueos identificados a partir del Product Backlog, las Historias de Usuario (`HU-01` a `HU-10`) y las decisiones de arquitectura (`ADR-001`). Su objetivo es clasificar los impedimentos según su naturaleza (**técnico**, **dependencia**, **organizacional**, **externo**, etc.), definir su nivel de escalamiento (**autonomía**, **equipo**, **escalamiento externo**) y trazar las acciones correctivas propuestas junto con los responsables y el estado actual.

---

## 🔍 Tabla Detallada de Bloqueos e Impedimentos

| ID | Descripción del Bloqueo | Historia | Fecha | Tipo | Escalamiento | Intentos Previos | Acciones Propuestas / Solución | Responsable | Estado |
|---|---|---|---|---|---|---|---|---|---|
| **BL-01** | Falta de un formato estándar para registrar la ubicación física de los productos, lo que genera datos inconsistentes y dificulta la búsqueda. | HU-1, HU-5 | 07/09/2026 | Técnico / Organizacional | Equipo | Discusión interna sobre esquemas de texto libre. | Se propuso en el ADR-001 utilizar el código jerárquico `P{n}-A{n}-E{n}` (ejemplo: `P1-A2-E3`), almacenando pasillo, anaquel y estante en campos separados. | Ángel (PO) | 🟢 Resuelto |
| **BL-02** | Riesgo de que los productos se registren con ubicaciones incompletas o formatos incorrectos, impidiendo su localización confiable. | HU-1, HU-5 | 17/09/2026 | Técnico | Autonomía | Validación manual por parte del usuario en la interfaz cliente. | El ADR-001 establece validar el formato de ubicación y mostrar "ubicación pendiente" cuando todavía no se haya asignado una posición. | Erik Guardado | 🟡 Mitigado |
| **BL-03** | La falta de información actualizada sobre las existencias impide identificar correctamente qué productos están disponibles o agotados. | HU-2, HU-4 | 21/09/2026 | Dependencia / Técnico | Equipo | Borrador inicial de historias de usuario del MVP. | Se requiere definir y probar el registro y la actualización de existencias, incluyendo la representación clara de productos con cero unidades. | Edgar Uribe | 🔴 Abierto |
| **BL-04** | No contar con un registro confiable de ventas dificulta la clasificación de productos por demanda y la generación de reportes de rotación. | HU-6, HU-8, HU-9 | Por confirmar | Dependencia | Equipo | Revisión general del backlog y alcance inicial del MVP. | Verificar qué información de ventas estará disponible en el MVP y definir el algoritmo para calcular la demanda a partir de ella. | Orlando Fierros | 🔴 Abierto |
| **BL-05** | La capacidad limitada del equipo (140 horas en 10 semanas) puede impedir desarrollar todas las funcionalidades si no se respeta la priorización. | HU-1 a HU-10 | 05/10/2026 | Organizacional / Personal | Equipo | Asignación libre de tareas sin estimación previa de tallas. | Utilizar las prioridades MoSCoW del backlog para concentrar el esfuerzo en las funciones esenciales: registro, búsqueda y ubicación. | Miguel (SM) | 🟢 Resuelto |
| **BL-06** | La ausencia de una ubicación física previamente identificada y rotulada puede provocar discrepancias entre el sistema y el local real. | HU-1, HU-5 | Por confirmar | Externo / Organizacional | Escalamiento Externo | Intentos de organizar el local por categoría tradicional sin éxito. | Rotular físicamente los anaqueles con el mismo código del sistema y mantener sincronizada la información al mover mercancía. | Ángel (PO) | 🟡 Mitigado |
| **BL-07** | El alcance inicial no contempla productos distribuidos en múltiples ubicaciones simultáneas, limitando ciertos casos reales de inventario. | HU-1, HU-5 | 14/10/2026 | Organizacional | Autonomía | Evaluar esquemas de múltiples ubicaciones por producto. | Mantener el alcance de una ubicación por producto en el MVP y documentar la ampliación del modelo como mejora futura. | Equipo Dev | 🟡 Mitigado |
| **BL-08** | La generación de reportes de productos agotados, rotación y tendencias depende directamente de contar con datos de ventas consistentes. | HU-4, HU-6, HU-8, HU-9 | 19/10/2026 | Dependencia | Equipo | Pruebas aisladas de reportes sin datos base en la base de datos MySQL. | Verificar la consistencia de los datos de inventario y ventas antes de implementar los reportes finales en la interfaz. | Miguel / Edgar | 🔴 Abierto |

---

## 📌 Guía de Clasificación y Criterios

* **Tipos de Bloqueo:**
  * `Técnico`: Fallas de arquitectura, código o herramientas.
  * `Dependencia`: Bloqueado por otra tarea, módulo o componente previo.
  * `Organizacional`: Decisiones de alcance, tiempos o distribución de equipo.
  * `Acceso`: Falta de credenciales, permisos o recursos de infraestructura.
  * `Conocimiento`: Curva de aprendizaje o falta de dominio tecnológico.
  * `Personal`: Disponibilidad de integrantes o factores humanos.
  * `Externo`: Factores fuera del control directo del equipo de desarrollo.

* **Niveles de Escalamiento:**
  * `Autonomía`: Resuelto directamente por el desarrollador o responsable de forma interna.
  * `Equipo`: Tratado de manera colaborativa en ceremonias ágiles y reuniones de planeación.
  * `Escalamiento Externo`: Requiere intervención del Product Owner, Profesor, Facilitador o Dueño del negocio.

---
<!--
══════════════════════════════════════════════════════════════
═
Actualizar este archivo al final de cada sprint o revisión de avance.
══════════════════════════════════════════════════════════════
═
-->