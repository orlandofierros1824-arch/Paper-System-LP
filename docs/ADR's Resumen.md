# ADR-001: Código estándar de ubicación de productos (Pasillo-Anaquel-Estante)

| Campo | Valor |
| --- | --- |
| **Estado** | Propuesto |
| **Fecha** | 2026-10-01 |
| **Proyecto** | Sistema de organización y localización de productos – Papelería Los Piwis |
| **Decisores** | Ángel (PO), Miguel (SM), Edgar, Orlando, Erick (Development Team) |
| **Historias relacionadas** | HU-1, HU-4, HU-5 (Must) · HU-6, HU-9 (Should/Could) |

---

## 1. Contexto

La Papelería Los Piwis maneja una gran variedad de artículos y el propietario no puede conocer con precisión **cuántas unidades hay de cada producto ni en qué parte del local están**. Esto provoca:

- Tiempo perdido recorriendo pasillos para encontrar productos, incluso los más solicitados.
- Aprovechamiento ineficiente del espacio disponible.
- Dificultad para saber qué productos se agotaron y cuáles reponer.

Hoy los productos se acomodan de forma tradicional, es decir, **solo por categoría**, lo cual no permite indicar una posición exacta ni priorizar los artículos de mayor demanda.

El sistema debe permitir que el dueño (y los empleados) **busquen un producto por nombre o código y obtengan su ubicación exacta** (HU-1, HU-5). Los criterios de aceptación exigen que el sistema muestre pasillo, anaquel y estante, y que indique cuando la ubicación está pendiente de registro.

Restricciones relevantes:

- MVP de **10 semanas** con una capacidad total de **140 horas** (14 h/semana entre 5 integrantes).
- Usuario principal: el propietario, sin perfil técnico.
- La ubicación es dato central del MVP: debe ser consistente, validable y fácil de capturar.

**Pregunta a resolver:** ¿cómo representamos la ubicación física de un producto dentro del local para que sea consultable, consistente y barata de implementar y mantener?

---

## 2. Decisión

Se adopta un **código jerárquico estándar de tres niveles** para identificar la ubicación de cada producto:

```
P{n}-A{n}-E{n}      Ejemplo: P1-A2-E3
```

| Segmento | Significado |
| --- | --- |
| `P` | Pasillo |
| `A` | Anaquel |
| `E` | Estante |

Reglas de implementación:

1. En la base de datos, la ubicación se almacena en **tres campos separados** (`pasillo`, `anaquel`, `estante`) y el código `P1-A2-E3` se **genera a partir de ellos**; no se captura como texto libre.
2. El código debe cumplir el formato `^P\d+-A\d+-E\d+$` y se valida al registrar o editar un producto.
3. Un producto sin ubicación asignada se muestra como **"ubicación pendiente"** (HU-5), no como error.
4. Cada anaquel físico del local se rotula con su código para que el sistema y el local usen el mismo lenguaje.

---

## 3. Justificación

1. **Cumple directamente los criterios de aceptación.** HU-1 y HU-5 piden mostrar "pasillo, anaquel y estante"; el esquema de tres niveles mapea 1 a 1 con ese requisito, sin transformaciones intermedias.
2. **Consistencia y validación.** Un formato fijo se puede validar con una expresión regular y evita variantes como "pasillo 1 arriba" o "p1 a2". Esto es lo que hace confiable la búsqueda por ubicación.
3. **Consultable y filtrable.** Al guardar los niveles como campos separados, se puede filtrar por pasillo, agrupar por anaquel y ordenar el listado sin procesar texto, lo que soporta la reorganización basada en demanda (HU-1, HU-5).
4. **Bajo costo de implementación.** Son tres columnas y una validación; no requiere librerías gráficas, hardware ni modelado espacial. Es viable dentro de las 140 horas del MVP, donde el registro de ubicación está priorizado como *Must*.
5. **Baja barrera de uso.** Un código corto es fácil de capturar, leer y recordar para un propietario no técnico, y se puede rotular físicamente en el local.
6. **Extensible.** La estructura jerárquica permite agregar después un nivel adicional (por ejemplo, "nivel" o "sección") o una representación visual de la distribución (historia *Could*) sin migrar datos.

---

## 4. Consecuencias

### Lo que ganamos

- Búsqueda de productos con ubicación exacta, que es el objetivo central del MVP.
- Datos limpios y comparables para listados, filtros y reportes (agotados, demanda, rotación).
- Vocabulario único entre el sistema y el local físico, que reduce errores entre propietario y empleados.
- Implementación simple y rápida, con riesgo bajo para el cronograma del MVP.
- Base lista para evolucionar hacia un mapa del local.

### Lo que sacrificamos / riesgos

- **Trabajo inicial de captura y rotulado:** hay que codificar todos los anaqueles y registrar la ubicación de cada producto, lo cual consume parte de las 140 horas.
- **El sistema depende de que el dato esté actualizado.** Si un producto se mueve físicamente y no se edita su ubicación, el sistema muestra información incorrecta. Se requiere disciplina operativa.
- **Una sola ubicación por producto.** El modelo inicial no contempla un mismo producto repartido en varios estantes ni bodega aparte; si se necesita, habrá que ampliar el modelo.
- **No hay noción de distancia ni de plano.** El código indica *dónde*, pero no qué tan cerca están dos ubicaciones; la optimización por cercanía queda fuera del MVP.
- **Rigidez del formato:** un cambio de layout del local (renumerar pasillos) implica actualizar los registros afectados.

---

## 5. Alternativas consideradas

### A. Organizar solo por categoría (situación actual)
Es el esquema tradicional del local. **Descartada** porque una categoría no identifica una posición exacta ni permite priorizar por demanda. Es justamente el problema que el proyecto busca resolver.

### B. Ubicación como texto libre (ej. "pasillo 1, arriba a la izquierda")
Es la opción más rápida de capturar. **Descartada** porque no se puede validar, genera variantes inconsistentes de un mismo lugar y no permite filtrar ni ordenar de forma confiable. Rompe el criterio de búsqueda por ubicación (HU-1, HU-5).

### C. Coordenadas / plano interactivo del local
Permitiría mostrar la ubicación sobre un mapa y calcular distancias. **Descartada para el MVP** por su costo: requiere modelado espacial y componente gráfico que no caben en 140 horas, y la historia de "representación de la distribución" está priorizada como *Could*. Se deja como evolución futura, que el código jerárquico ya permite.

### D. Etiquetas con código de barras / QR / RFID por producto o por anaquel
Permitiría ubicar y contar con escaneo. **Descartada para el MVP** porque añade costo de hardware, impresión y procesos de escaneo que el negocio no tiene hoy, y no es necesaria para validar la hipótesis principal del MVP (que centralizar inventario y ubicación reduce el tiempo de búsqueda).
