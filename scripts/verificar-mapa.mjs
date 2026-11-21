import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const mapa = readFileSync('MAPA_DO_CODIGO.md', 'utf8');
const erros = [];
let referencias = 0;
for (const [, , destino] of mapa.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
  if (/^https?:/.test(destino)) continue;
  if (destino.startsWith('#')) {
    if (!mapa.includes(`id="${destino.slice(1)}"`)) erros.push(`Âncora não encontrada: ${destino}`);
  } else if (!existsSync(resolve(destino.split('#')[0]))) erros.push(`Arquivo não encontrado: ${destino}`);
}
// Cada ponto do mapa tem um link seguido da seta e do termo literal de Ctrl+F.
for (const [, arquivo, termo] of mapa.matchAll(/\[[^\]]+\]\(([^)]+)\) → `([^`]+)`/g)) {
  referencias++;
  if (!existsSync(resolve(arquivo))) continue;
  if (!readFileSync(arquivo, 'utf8').includes(termo.replaceAll('\\|', '|'))) erros.push(`Termo não encontrado em ${arquivo}: ${termo}`);
}
if (referencias < 35) erros.push('O mapa deve manter os pontos de implementação e uso de todos os requisitos.');
if (!readFileSync('README.md', 'utf8').includes('](MAPA_DO_CODIGO.md)')) erros.push('Falta o link do README para o mapa.');
if (erros.length) { console.error(erros.join('\n')); process.exitCode = 1; }
else console.log(`Mapa verificado: ${referencias} pares de arquivo e termo; todos os links relativos existem.`);
