const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../papeleria_lp/public');
const paginas = fs.readdirSync(publicDir).filter((f) => f.endsWith('.html'));

for (const pagina of paginas) {
  test(`la pantalla ${pagina} carga correctamente`, async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));

    const respuesta = await page.goto(`/${pagina}`);

    expect(respuesta.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    expect(errores).toEqual([]);
  });
}