import { defineConfig } from 'vite';
import { cpSync, readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));

/**
 * Preserva o runtime clássico e o snapshot compilado P2 sem passá-los pelo bundler:
 * HTML, scripts, CSS e imagens mantêm seus bytes e URLs. Manifesto P2 determina a
 * lista/hashes e colisões divergentes abortam o build; não expõe testes/docs.
 * Só escreve dist; não executa scripts, não publica e falha se faltar uma fonte.
 * Validado por scripts/verificar-institucional.mjs e smoke do laboratório.
 */
function preservarSimulador() {
  return {
    name: 'preservar-simulador-classico',
    /** Oferece o mesmo snapshot no dev server, somente nas URLs públicas do manifesto. */
    configureServer(server) {
      const snapshot = resolve(raiz, 'vendor/prototipo2');
      const manifesto = JSON.parse(readFileSync(resolve(snapshot, 'manifesto.json'), 'utf8'));
      const rotas = new Map();
      for (const recurso of manifesto.arquivos) {
        rotas.set('/' + recurso.caminho, recurso.caminho);
        if (recurso.caminho.endsWith('.html')) rotas.set('/' + recurso.caminho.slice(0, -5), recurso.caminho);
      }
      /** Serve bytes imutados de uma rota permitida; delega as demais ao Vite. */
      function servirSnapshot(req, res, next) {
        const caminho = rotas.get(new URL(req.url || '/', 'http://localhost').pathname);
        if (!caminho) return next();
        const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm' };
        res.setHeader('Content-Type', mime[extname(caminho)] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store');
        res.end(readFileSync(resolve(snapshot, caminho)));
      }
      server.middlewares.use(servirSnapshot);
    },
    /** Copia runtimes após o build institucional, validando manifesto P2 e colisões. */
    closeBundle() {
      for (const caminho of ['starship_v1.html', 'src/js', 'src/styles/starship_v1.css', 'assets/images']) {
        cpSync(resolve(raiz, caminho), resolve(raiz, 'dist', caminho), { recursive: true });
      }
      const snapshot = resolve(raiz, 'vendor/prototipo2');
      const manifesto = JSON.parse(readFileSync(resolve(snapshot, 'manifesto.json'), 'utf8'));
      for (const recurso of manifesto.arquivos) {
        if (!/^(?:tests\.html|missao\.html|orbitas\.html|assets\/[\w./-]+)$/.test(recurso.caminho)
          || recurso.caminho.split('/').includes('..')) throw new Error('Caminho inválido no snapshot.');
        const fonte = resolve(snapshot, recurso.caminho);
        const bytes = readFileSync(fonte);
        if (createHash('sha256').update(bytes).digest('hex') !== recurso.sha256) throw new Error(`Snapshot alterado: ${recurso.caminho}`);
        const alvo = resolve(raiz, 'dist', recurso.caminho);
        if (existsSync(alvo) && !bytes.equals(readFileSync(alvo))) throw new Error(`Colisão de assets: ${recurso.caminho}`);
        mkdirSync(resolve(alvo, '..'), { recursive: true });
        copyFileSync(fonte, alvo);
      }
    },
  };
}

export default defineConfig({
  plugins: [preservarSimulador()],
  build: {
    rollupOptions: {
      input: {
        institucional: resolve(raiz, 'index.html'),
        pesquisa: resolve(raiz, 'pesquisa.html'),
        simulador: resolve(raiz, 'simulador.html'),
      },
    },
  },
});
