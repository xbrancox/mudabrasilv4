/* ============================================================
   MEUVOTO — VERIFICADOR DE REFERÊNCIAS QUEBRADAS
   ------------------------------------------------------------
   Varre todos os .html do repositório, extrai src/href de
   <script>, <link>, <img>, <a> e checa se o arquivo existe.
   Ignora: URLs externas, mailto:, tel:, data:, #âncoras,
   templates JS (${...}) e referências commented-out.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function walk(dir, out = []) {
  let items;
  try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return out; }
  for (const it of items) {
    if (it.name === 'node_modules' || it.name === '.git' || it.name === 'app') continue;
    const full = path.join(dir, it.name);
    if (it.isDirectory()) walk(full, out);
    else if (it.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/* Extrai URLs de atributos de tags HTML reais (ignora linhas comentadas) */
function extractRefs(html) {
  const refs = new Set();
  // Remove blocos comentados <!-- ... -->
  const semComentario = html.replace(/<!--[\s\S]*?-->/g, '');
  const tagRe = /<(script|link|img|a|source|video|audio|iframe)\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(semComentario)) !== null) {
    const tag = m[0];
    const attrRe = /(?:src|href|data-src|poster)\s*=\s*["']([^"']+)["']/gi;
    let a;
    while ((a = attrRe.exec(tag)) !== null) {
      const v = a[1].trim();
      if (!v) continue;
      if (v.includes('${') || v.includes('{{') || v.includes('+')) continue; // template JS
      refs.add(v);
    }
  }
  return [...refs];
}

function isExternal(ref) {
  return /^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(ref);
}

const htmlFiles = walk(ROOT);
const quebrados = [];
let totalRefs = 0;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const refs = extractRefs(html);
  const dir = path.dirname(file);

  for (const ref of refs) {
    if (isExternal(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean) continue;
    totalRefs++;
    const abs = path.resolve(dir, clean);
    if (!abs.startsWith(ROOT)) continue; // fora do repo
    if (fs.existsSync(abs)) continue;
    quebrados.push({ arquivo: rel, ref, alvo: path.relative(ROOT, abs).replace(/\\/g, '/') });
  }
}

console.log('=== REFERÊNCIAS QUEBRADAS ===');
if (!quebrados.length) {
  console.log('Nenhuma referência quebrada encontrada em ' + htmlFiles.length + ' página(s), ' + totalRefs + ' referência(s) checada(s).');
} else {
  quebrados.forEach(b => console.log('  ' + b.arquivo + '  ->  ' + b.ref + '   (procura: ' + b.alvo + ')'));
  console.log('\nTotal: ' + quebrados.length + ' quebrada(s) em ' + htmlFiles.length + ' página(s).');
}
process.exit(quebrados.length ? 1 : 0);
