# Documentación de pruebas – Papelería Los Piwis

## 1. Objetivo

Documentar la ejecución de las pruebas automatizadas del sistema Papelería Los Piwis, indicando qué se verifica, cómo se ejecuta, qué resultado se espera y cuál fue el resultado observado.

## 2. Ejecución mediante integración continua

El flujo de trabajo se encuentra en `.github/workflows/CI.yml`.

Se ejecuta cuando se realiza un `push` a la rama `main` o se abre/actualiza un `pull_request` dirigido a `main`. El flujo contiene dos trabajos:

1. **Unitarias e integración:** instala dependencias con `npm ci` y ejecuta `npm run test:unit` y `npm run test:integration`.
2. **Aceptación y E2E:** depende de que el primer trabajo termine correctamente; instala Chromium y ejecuta `npm run test:e2e`.

Por lo tanto, no debe describirse como una ejecución automática después de cualquier commit: el evento que dispara el flujo es el `push` o el `pull_request` configurado.

## 3. Herramientas

- **Node.js y npm:** entorno de ejecución y administración de dependencias.
- **Jest:** ejecución de pruebas unitarias y de integración.
- **Playwright:** automatización del navegador para pruebas E2E.
- **GitHub Actions:** ejecución automatizada del flujo CI.

## 4. Inventario de casos documentados

| ID | Tipo | Caso | Archivo |
|---|---|---|---|
| TEST-01 | Unitaria | Registro de usuarios | [TEST-01](TEST-01-unitarias/TEST-01-registro-usuarios.md) |
| TEST-02 | Integración | Verificación de referencias entre archivos de la interfaz | [TEST-02](TEST-02-integracion/TEST-02-referencias-archivos.md) |
| TEST-03 | Aceptación / E2E | Carga de pantallas principales en el navegador | [TEST-03](TEST-03-aceptacion-e2e/TEST-03-carga-pantallas.md) |

## 5. Consideraciones sobre los resultados

Los estados de esta documentación distinguen entre:

- **Aprobada:** existe evidencia de que la ejecución terminó correctamente.
- **Fallida:** la ejecución se realizó y presentó uno o más errores.
- **Pendiente de evidencia:** falta volver a ejecutar la prueba o registrar su salida actual.

No se debe marcar una prueba como aprobada únicamente porque el comando exista en `package.json` o porque esté incluido en CI. Se debe conservar el resultado real de la ejecución (salida de Bash o registro de GitHub Actions).

## 6. Relación con las historias de usuario

Las historias de usuario se identifican con los números del backlog adjunto. Cuando un caso técnico no comprueba directamente un criterio de aceptación del backlog, se indica expresamente y se clasifica como una validación técnica de soporte. No se asigna una historia de usuario de manera artificial.

## 7. Ejecución local

Desde la raíz del repositorio, ejecutar:

```bash
npm ci
npm run test:unit
npm run test:integration
npm run test:e2e
```

Para ejecutar toda la secuencia del flujo localmente:

```bash
npm ci
npm run test:unit && npm run test:integration && npm run test:e2e
```

La ejecución E2E requiere que Chromium esté instalado. Si no lo está:

```bash
npx playwright install chromium
```

## 8. Evidencia recomendada

Para cada ejecución, registrar la fecha, el comando exacto, el número de pruebas aprobadas/fallidas y el mensaje final de la consola. Para CI, conservar el enlace de la ejecución correspondiente en GitHub Actions.
