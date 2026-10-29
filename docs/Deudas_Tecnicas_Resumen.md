<!--
══════════════════════════════════════════════════════════════
═
Registro de Deuda Técnica
Ubicación: docs/deuda-tecnica.md
Actualizar al final de cada sprint.
══════════════════════════════════════════════════════════════
═
-->
# 💻 Registro de Deuda Técnica
**Proyecto:** `Sistema de Gestión de Inventario - Papelería Los Piwis`
**Última actualización:** `2026-10-01`
**Total de deudas registradas:** `5`
---
## 📊 Resumen
| Prioridad | Cantidad | Resueltas |
|-----------|----------|-----------|
| 🔴 Alta | `2` | `0` |
| 🟡 Media | `2` | `0` |
| 🟢 Baja | `1` | `0` |
| **Total** | **`5`** | **`0`** |
---
## 🔴 Deudas de Prioridad Alta
### DT-001: `Falta de pruebas automatizadas en los endpoints de autenticación y productos`
| Campo | Detalle |
|-------|---------|
| **Descripción** | Los endpoints críticos del backend en Python (`/api/auth/login` y `/api/products`) carecen de pruebas unitarias y de integración. |
| **Ubicación** | `backend/tests/` (Módulo de pruebas ausente) |
| **Impacto** | 🔴 Alto |
| **Prioridad** | 🔴 Alta |
| **Solución propuesta** | Implementar un conjunto de pruebas utilizando `pytest` y `unittest` para validar JWT y operaciones CRUD de inventario. |
| **Esfuerzo estimado** | `M` |
| **Responsable** | `Equipo de Desarrollo Backend` |
| **Fecha de registro** | `2026-10-01` |
| **Estado** | `Pendiente` |

**Detalle:**
Debido a la prisa por entregar las primeras historias de usuario del MVP, se priorizó la funcionalidad sobre la cobertura de pruebas. Si se modifica la lógica de autenticación o el esquema de base de datos, existe alto riesgo de introducir regresiones no detectadas.
**Criterios de aceptación:**
- [ ] Configurar el entorno de pruebas con `pytest` en el backend.
- [ ] Alcanzar al menos un `60%` de cobertura en los endpoints principales de inventario.
- [ ] Integrar las pruebas en el pipeline de CI/CD en GitHub Actions.

---
### DT-002: `Ausencia de conexión pool y gestión óptima de sesiones en MySQL`
| Campo | Detalle |
|-------|---------|
| **Descripción** | Las consultas a la base de datos abren y cierran conexiones individuales por cada petición HTTP sin utilizar un pool de conexiones (`Connection Pooling`). |
| **Ubicación** | `backend/database.py` o módulo de conexión |
| **Impacto** | 🔴 Alto |
| **Prioridad** | 🔴 Alta |
| **Solución propuesta** | Integrar un pool de conexiones utilizando herramientas como `SQLAlchemy` o el conector optimizado para MySQL en Python. |
| **Esfuerzo estimado** | `M` |
| **Responsable** | `Edgar Adrian Uribe` |
| **Fecha de registro** | `2026-10-01` |
| **Estado** | `Pendiente` |

---
## 🟡 Deudas de Prioridad Media
### DT-003: `Manejo de errores genérico en las respuestas de la API`
| Campo | Detalle |
|-------|---------|
| **Descripción** | Las excepciones del servidor devuelven mensajes genéricos o trazas completas de Python al frontend en lugar de códigos de error estructurados en formato JSON. |
| **Ubicación** | `backend/middlewares/` o manejadores de excepciones globales |
| **Impacto** | 🟡 Medio |
| **Prioridad** | 🟡 Media |
| **Solución propuesta** | Crear un decorador o manejador global de excepciones en el backend que estandarice los códigos de estado HTTP y mensajes de error. |
| **Esfuerzo estimado** | `S` |
| **Responsable** | `Erik Damian Guardado` |
| **Fecha de registro** | `2026-10-01` |
| **Estado** | `Pendiente` |

---
### DT-004: `Hardcoding de URL base de la API en componentes del Frontend`
| Campo | Detalle |
|-------|---------|
| **Descripción** | Algunos componentes de React tienen escrita directamente la URL local del servidor backend en lugar de utilizar variables de entorno (`import.meta.env`). |
| **Ubicación** | `frontend/src/services/api.js` |
| **Impacto** | 🟡 Medio |
| **Prioridad** | 🟡 Media |
| **Solución propuesta** | Centralizar la configuración de Axios y migrar todas las rutas base a archivos `.env` (desarrollo y producción). |
| **Esfuerzo estimado** | `S` |
| **Responsable** | `Orlando Fabian Fierros` |
| **Fecha de registro** | `2026-10-01` |
| **Estado** | `Pendiente` |

---
## 🟢 Deudas de Prioridad Baja
### DT-005: `Falta de documentación Docstring en funciones auxiliares`
| Campo | Detalle |
|-------|---------|
| **Descripción** | Funciones de cálculo de rotación de inventario y validación de códigos de ubicación no cuentan con comentarios de documentación estándar (`Docstrings`). |
| **Ubicación** | `backend/utils/` |
| **Impacto** | 🟢 Bajo |
| **Prioridad** | 🟢 Baja |
| **Solución propuesta** | Agregar bloques de documentación tipo Google Style docstrings en los módulos de lógica de negocio. |
| **Esfuerzo estimado** | `S` |
| **Responsable** | `Miguel Angel Lobo` |
| **Fecha de registro** | `2026-10-01` |
| **Estado** | `Pendiente` |

---
## 📋 Ejemplos de Deudas Técnicas Comunes (Referencia)
| Tipo | Ejemplo |
|------|---------|
| **Falta de tests** | El módulo de pagos no tiene pruebas automatizadas |
| **Código duplicado** | La misma función está copiada en 3 archivos |
| **Hardcoding** | Valores de configuración escritos directamente en el código |
| **Dependencias desactualizadas** | Usar librerías con vulnerabilidades conocidas |
| **Código sin documentar** | Funciones complejas sin comentarios |
---
## Historial de Actualizaciones
| Fecha | Cambio | Autor |
|-------|--------|-------|
| `2026-10-01` | Registro inicial de deuda técnica para MVP | Ángel Alberto González Flores |
---
<!--
══════════════════════════════════════════════════════════════
═
Recuerda:
- Actualizar este documento al final de cada sprint.
- No toda la deuda se paga; lo importante es documentarla.
- Priorizar según impacto en el usuario y en el equipo.
══════════════════════════════════════════════════════════════
═
-->
