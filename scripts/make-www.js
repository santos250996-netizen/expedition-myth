// Copia el shell estático del juego a www/ (webDir de Capacitor).
// Lista explícita para no arrastrar node_modules, workflows ni docs al APK.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = path.join(root, 'www');

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

for (const item of ['index.html', 'sw.js', 'manifest.json', 'icon.svg', 'css', 'js', 'assets']) {
    fs.cpSync(path.join(root, item), path.join(dest, item), { recursive: true });
}

console.log('www/ listo:', fs.readdirSync(dest).join(', '));
