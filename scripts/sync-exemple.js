// Recopie exemples/boutique.dbml dans la constante SAMPLE de src/index.html.
// Usage : node scripts/sync-exemple.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const page = path.join(root, 'src', 'index.html');
const sample = fs.readFileSync(path.join(root, 'exemples', 'boutique.dbml'), 'utf8');
const html = fs.readFileSync(page, 'utf8');
const re = /^const SAMPLE = .*; \/\/ @sample$/m;
if (!re.test(html)) throw new Error('Ligne « const SAMPLE = …; // @sample » introuvable dans src/index.html');
// JSON.stringify : la chaîne reste sur une ligne ; « </ » échappé pour ne pas fermer le <script>.
const literal = JSON.stringify(sample).replace(/<\//g, '<\/');
fs.writeFileSync(page, html.replace(re, () => `const SAMPLE = ${literal}; // @sample`));
console.log('SAMPLE mis à jour (' + sample.length + ' caractères)');
