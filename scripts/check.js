#!/usr/bin/env node
/**
 * Verificação rápida antes de commit:
 *  - node --check em todos os arquivos de server/
 *  - com --tests, roda também o smoke (npm test)
 *
 * Uso: npm run check  |  npm run check -- --tests
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const alvos = ['server'];

let verificados = 0;
const falhas = [];

for (const dir of alvos) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) continue;
  for (const arquivo of fs.readdirSync(base)) {
    if (!arquivo.endsWith('.js')) continue;
    const caminho = path.join(base, arquivo);
    try {
      execFileSync(process.execPath, ['--check', caminho], { stdio: 'pipe' });
      verificados += 1;
    } catch (erro) {
      falhas.push({ arquivo: `${dir}/${arquivo}`, saida: (erro.stderr || erro.message).toString() });
    }
  }
}

console.log(`sintaxe: ${verificados} arquivo(s) ok, ${falhas.length} com erro`);
for (const f of falhas) console.error(`\n✖ ${f.arquivo}\n${f.saida.split('\n').slice(0, 6).join('\n')}`);

const rodarTestes = process.argv.includes('--tests');
if (rodarTestes && falhas.length === 0) {
  console.log('\nrodando smoke (npm test)...');
  try {
    execFileSync('npm', ['test'], { cwd: root, stdio: 'inherit', shell: true });
  } catch {
    process.exit(1);
  }
}

process.exit(falhas.length ? 1 : 0);