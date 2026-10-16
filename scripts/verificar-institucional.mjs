import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(raiz, 'dist');
const manifesto = JSON.parse(readFileSync(resolve(raiz, 'vendor/prototipo2/manifesto.json')));

/** Enumera arquivos de validação, sem escrever nem executar o runtime. */
function listar(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap(entrada => {
    const p = join(pasta, entrada.name);
    return entrada.isDirectory() ? listar(p) : [p];
  });
}

/** Obtém SHA-256 dos bytes em disco para comparar fontes, snapshot e distribuição. */
function hash(arquivo) {
  return createHash('sha256').update(readFileSync(arquivo)).digest('hex');
}

/** Resolve um caminho público local sem fallback que possa mascarar arquivos ausentes. */
function arquivoPublico(caminho) {
  const p = resolve(dist, '.' + decodeURI(caminho));
  assert(p.startsWith(dist + '/') || p === dist, `Caminho fora do dist: ${caminho}`);
  if (p === dist) return join(dist, 'index.html');
  return existsSync(p) ? p : p + '.html';
}

for (const recurso of manifesto.arquivos) {
  assert.equal(hash(join(dist, recurso.caminho)), recurso.sha256, `Snapshot P2 divergente: ${recurso.caminho}`);
}
const legados = ['starship_v1.html', 'src/styles/starship_v1.css', ...listar(join(raiz, 'src/js')).map(p => relative(raiz, p)), ...listar(join(raiz, 'assets/images')).map(p => relative(raiz, p))];
for (const arquivo of legados) assert.equal(hash(join(raiz, arquivo)), hash(join(dist, arquivo)), `Runtime legado divergente: ${arquivo}`);

const imagens = new Set();
let links = 0;
for (const pagina of ['index.html', 'pesquisa.html', 'simulador.html']) {
  const html = readFileSync(join(dist, pagina), 'utf8');
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `H1 em ${pagina}`);
  assert(!/buran|estaleiro orbital|voo tripulado em 2026/i.test(html), 'Referência institucional vedada');
  for (const tag of html.matchAll(/<img\s[^>]+>/g)) {
    assert(/\balt="[^"]+"/.test(tag[0]) && /\bwidth="\d+"/.test(tag[0]) && /\bheight="\d+"/.test(tag[0]), `Imagem sem contrato acessível: ${tag[0]}`);
    const src = tag[0].match(/\bsrc="([^"]+)"/)[1];
    imagens.add(src);
  }
  const refs = [...html.matchAll(/(?:href|src)="([^"?#]*)(#[^"]*)?"/g)];
  for (const [, caminho, fragmento] of refs) {
    if (/^(?:https?:|mailto:|data:)/.test(caminho)) continue;
    const alvo = caminho ? arquivoPublico(new URL(caminho, 'https://local/' + pagina).pathname) : join(dist, pagina);
    assert(existsSync(alvo), `Link quebrado em ${pagina}: ${caminho}`);
    if (fragmento && alvo.endsWith('.html')) assert(readFileSync(alvo, 'utf8').includes(`id="${fragmento.slice(1)}"`), `Âncora ausente: ${caminho}${fragmento}`);
    links++;
  }
  for (const [, conjunto] of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const item of conjunto.split(',')) assert(existsSync(arquivoPublico(item.trim().split(/\s+/)[0])), `Srcset ausente: ${item}`);
  }
}
assert.equal(imagens.size, 10, 'As dez imagens originais devem estar representadas.');
const ativos = JSON.parse(readFileSync(join(raiz, 'docs/institucional/ativos.json')));
for (const ativo of ativos) assert.equal(hash(join(raiz, 'assets/institucional/originais', ativo.origem.split('/').at(-1))), ativo.sha256);
const original = join(raiz, 'docs/estudos/Artigo_Cientifico_BlackStar_BSS_Pouso_Propulsivo.pdf');
assert.equal(hash(original), hash(join(dist, 'publicacoes/pouso-propulsivo-bss-2026.pdf')));
assert(readFileSync(original).subarray(0, 5).equals(Buffer.from('%PDF-')));
const hosting = JSON.parse(readFileSync(join(raiz, 'firebase.json'))).hosting;
assert.equal(hosting.public, 'dist');
assert.equal(hosting.cleanUrls, true);
assert(!hosting.rewrites.some(r => r.source === '**'), 'Fallback global pode mascarar assets e rotas quebradas.');
for (const arquivo of listar(dist)) assert(!/\.(?:ts|map)$|(?:^|[/\\])(?:docs|tests|node_modules|vendor)(?:[/\\])/.test(relative(dist, arquivo)), `Arquivo interno publicado: ${arquivo}`);
console.log(JSON.stringify({ resultado: 'aprovado', imagens: imagens.size, links, recursosPrototipo2: manifesto.arquivos.length, recursosLegados: legados.length, pdfIdentico: true, hosting: 'dist, clean URLs, sem fallback global' }, null, 2));
