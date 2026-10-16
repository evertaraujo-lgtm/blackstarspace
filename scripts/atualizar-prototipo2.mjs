import { readdirSync, readFileSync, mkdirSync, copyFileSync, writeFileSync, lstatSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const destino = resolve(raiz, 'vendor/prototipo2');
const paginas = ['tests.html', 'missao.html', 'orbitas.html'];
const extensoes = /\.(?:js|css|png|webp|avif|jpg|jpeg|svg|gif|ico|woff2?|ttf|wasm)$/i;

/**
 * Enumera assets compilados em ordem estável. Recusa symlinks, arquivos ocultos
 * e extensões não publicáveis; mapas/fonte não integram o runtime distribuído.
 * @param pasta Diretório absoluto do build pronto. Somente leitura.
 * @param relativo Caminho dentro do build; usado pela recursão de assets.
 * @returns Caminhos relativos seguros, com separador URL e sem código executado.
 */
function coletarAssets(pasta, relativo = 'assets') {
  const arquivos = [];
  for (const entrada of readdirSync(join(pasta, relativo)).sort()) {
    if (entrada.startsWith('.')) throw new Error(`Asset oculto recusado: ${entrada}`);
    const nome = `${relativo}/${entrada}`;
    const estado = lstatSync(join(pasta, nome));
    if (estado.isSymbolicLink()) throw new Error(`Link simbólico recusado: ${nome}`);
    if (estado.isDirectory()) arquivos.push(...coletarAssets(pasta, nome));
    else if (extensoes.test(nome)) arquivos.push(nome);
    else if (!nome.endsWith('.map')) throw new Error(`Recurso não publicável: ${nome}`);
  }
  return arquivos;
}

/**
 * Importa bytes de um build de produção do Protótipo 2, sem tocar suas fontes.
 * Valida as três entradas, caminhos de assets e identidade dos arquivos por hash.
 * @param origem Diretório dist produzido no repositório blackstarprototipo2.
 * @param revisao SHA/referência explícita que identifica esse build para auditoria.
 * @returns void. Escreve somente vendor/prototipo2 e seu manifesto; nunca faz deploy.
 * @throws Em build incompleto, symlink, colisão ou destino inválido. Validar com
 * npm run build, npm run verificar:institucional e smoke após cada importação.
 */
function importarBuild(origem, revisao) {
  const fonte = resolve(origem);
  if (!revisao || fonte === destino) throw new Error('Informe origem dist distinta e revisão não vazia.');
  const arquivos = [...paginas, ...coletarAssets(fonte)];
  const entradas = [];
  for (const caminho of arquivos) {
    if (lstatSync(join(fonte, caminho)).isSymbolicLink()) throw new Error(`Link recusado: ${caminho}`);
    const bytes = readFileSync(join(fonte, caminho));
    if (paginas.includes(caminho)) {
      const html = bytes.toString('utf8');
      if (!/<html[\s>]/i.test(html) || !html.includes('/assets/')) throw new Error(`Página de build inválida: ${caminho}`);
      for (const ref of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)[^"]*"/g)) {
        if (!arquivos.includes(ref[1].slice(1))) throw new Error(`Dependência ausente: ${ref[1]}`);
      }
    }
    entradas.push({ caminho, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  // O manifesto define a lista publicada: sobras de snapshots antigos não entram no build.
  for (const { caminho } of entradas) {
    const alvo = join(destino, caminho);
    mkdirSync(dirname(alvo), { recursive: true });
    copyFileSync(join(fonte, caminho), alvo);
  }
  mkdirSync(destino, { recursive: true });
  writeFileSync(join(destino, 'manifesto.json'), JSON.stringify({ formato: 1, origem: 'evertaraujo-lgtm/blackstarprototipo2', revisao, arquivos: entradas }, null, 2) + '\n');
  console.log(`Importados ${entradas.length} recursos estáticos; revisão ${revisao}. Execute build e smoke antes de publicar.`);
}

const [origem, revisao] = process.argv.slice(2);
if (!origem || !revisao || !existsSync(origem)) {
  console.error('Uso: npm run atualizar:prototipo2 -- /caminho/blackstarprototipo2/dist REVISAO_DO_BUILD');
  process.exitCode = 1;
} else importarBuild(origem, revisao);
