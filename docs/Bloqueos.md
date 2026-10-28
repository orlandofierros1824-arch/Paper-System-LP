
## Registro de bloqueos - PAPER-SYSTEMLP — Papelería Los Piwis

**Proyecto:** Sistema de organización y localización de productos —
**Propósito:** Documentar impedimentos que retrasen o pongan en riesgo el desarrollo del MVP.

> **Nota:** Los siguientes bloqueos son riesgos identificados a partir del backlog y del ADR-001. Las fechas, los estados y las soluciones deben confirmarse con el equipo antes de considerarlos bloqueos ocurridos y resueltos.


# ⚡ ZONA DE IMPACTO: BLOQUEOS DEL MVP ⚡
`[ 🟢 RESUELTO ]` · `[ 🟡 MITIGADO ]` · `[ 🔴 ABIERTO ]`

---

| ID | Descripción | Historia | Fecha de bloqueo | Estado | Que se probo  |
| --- | --- | --- | --- | --- | --- |
| BL-01 | Falta de un formato estándar para registrar la ubicación física de los productos, lo que puede generar datos inconsistentes y dificultar su búsqueda. | HU-1, HU-5 | 07/09/2026 | 🟢 Resuelto  | Se propuso en el ADR-001 utilizar el código jerárquico `P{n}-A{n}-E{n}` (ejemplo: `P1-A2-E3`), almacenando pasillo, anaquel y estante en campos separados. |
| BL-02 | Riesgo de que los productos se registren con ubicaciones incompletas o con formatos incorrectos, impidiendo su localización confiable. | HU-1, HU-5 | 17/09/2026 | 🟡 Mitigado | El ADR-001 establece validar el formato de ubicación y mostrar "ubicación pendiente" cuando todavía no se haya asignado una ubicación. |
| BL-03 | La falta de información actualizada sobre las existencias puede impedir identificar correctamente qué productos están disponibles o agotados. | HU-2, HU-4 | 21/09/2026  | 🔴 Abierto | Se requiere definir y probar el registro y la actualización de existencias, incluyendo la representación de productos con cero unidades. |
| BL-04 | No contar con un registro confiable de ventas puede dificultar la clasificación de productos por demanda y la generación de reportes de rotación. | HU-6, HU-8, HU-9 | Por confirmar | Por validar | Se debe verificar qué información de ventas estará disponible en el MVP y definir cómo se calculará la demanda a partir de ella. |
| BL-05 | La capacidad limitada del MVP (140 horas en 10 semanas) puede impedir desarrollar todas las funcionalidades propuestas si no se respeta la priorización del backlog. | HU-1 a HU-10 | 05/10/2026 | 🟢 Resuelto | Utilizar las prioridades MoSCoW del backlog para concentrar el esfuerzo en las funciones esenciales: registro de productos, búsqueda y registro de ubicación. |
| BL-06 | La ausencia de una ubicación física previamente identificada y rotulada puede provocar diferencias entre la ubicación registrada en el sistema y la ubicación real del producto. | HU-1, HU-5 | Por confirmar | Por validar | El ADR-001 propone rotular los anaqueles con el mismo código que utiliza el sistema y mantener actualizada la información cuando se muevan productos. |
| BL-07 | El alcance inicial no contempla productos distribuidos en varias ubicaciones, lo que puede limitar la representación de ciertos casos reales del inventario. | HU-1, HU-5 | 14/10/2026 | 🟡 Mitigado | Mantener el alcance de una ubicación por producto en el MVP y documentar la ampliación del modelo como una posible mejora futura. |
| BL-08 | La generación de reportes de productos agotados, rotación y tendencias depende de contar con existencias y datos de ventas consistentes. | HU-4, HU-6, HU-8, HU-9 | 19/10/2026 | 🔴 Abierto | Verificar la consistencia de los datos de inventario y ventas antes de implementar los reportes; priorizar las funciones según el alcance acordado del MVP. |
