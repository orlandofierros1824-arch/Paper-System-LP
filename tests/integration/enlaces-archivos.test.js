const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../papeleria_lp/public');
const htmlFiles = fs.readdirSync(publicDir).filter((f) => f.endsWith('.html'));

const esLocal = (ref) =>
  !/^(https?:)?\/\/|^mailto:|^tel:|^#|^data:|^javascript:/i.test(ref);

describe.each(htmlFiles)('%s', (archivo) => {
  test('todas sus referencias locales existen', () => {
    const html = fs.readFileSync(path.join(publicDir, archivo), 'utf8');
    const refs = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)]
      .map((m) => m[1])
      .filter(esLocal)
      .map((ref) => ref.split(/[?#]/)[0])
      .filter(Boolean);

    const faltantes = refs.filter((ref) => {
      const ruta = ref.startsWith('/')
        ? path.join(publicDir, ref)
        : path.join(publicDir, path.dirname(archivo), ref);
      return !fs.existsSync(ruta);
    });

    expect(faltantes).toEqual([]);
  });
});