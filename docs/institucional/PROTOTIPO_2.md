# Cópia estática do Protótipo 2

## Contrato de preservação

O simulador principal continua em `/tests.html`, `/missao.html` e `/orbitas.html`.
O site institucional não importa o código-fonte do Protótipo 2. O diretório
`vendor/prototipo2` guarda apenas HTML e assets compilados de um build de produção,
com lista completa de caminhos, tamanhos e SHA-256 em `manifesto.json`.

O snapshot inicial foi obtido dos três endereços efetivamente publicados em
`https://blackstarspace.web.app/`, com suas dependências estáticas. A referência
`publicado-2026-10-15` identifica essa captura; **não é um SHA de commit**.
O commit de origem do deploy não estava exposto nas páginas; não foi inferido
pelo nome de arquivos ou pela árvore local. Os hashes documentam os bytes reais.
A captura contém 13 recursos, totalizando 366.150 bytes. Não se incluiu a homepage
antiga: a raiz é deliberadamente substituída pela apresentação institucional.

`vite.config.mjs` confere o manifesto antes de copiar cada recurso para `dist`.
Rejeita paths inválidos, hashes divergentes e colisões com arquivos diferentes.
Os recursos originais não são transformados ou minificados novamente.
Durante `npm run dev`, um middleware somente leitura serve as mesmas páginas e
assets do manifesto, com MIME explícito. Reinicie o dev server após importar um
novo snapshot. O Protótipo 1 é copiado à parte, com HTML, scripts deferidos, CSS e imagens
inalterados; suas dependências mantêm os caminhos originais.

## Atualização reproduzível a partir do repositório original

No checkout original de `evertaraujo-lgtm/blackstarprototipo2`, escolha uma revisão
validada. Não misture modificações locais não registradas com a revisão declarada.
Execute manualmente:

```bash
# No repositório original; operação de engenharia separada deste redesenho.
git status --short
git rev-parse HEAD
npm ci
npm run build
```

Depois, no repositório **blackstarspace**, sem alterar as fontes do outro projeto:

```bash
npm run atualizar:prototipo2 -- /caminho/blackstarprototipo2/dist SHA_OBTIDO_ACIMA
npm run build
npm run verificar:institucional
npm test
npm run preview -- --host 127.0.0.1 --port 4175
# Em outro terminal, com o preview aberto:
npm run test:institucional
```

O importador lê o build pronto, valida as três páginas e as dependências HTML,
recusa symlinks/arquivos ocultos e publica somente extensões estáticas permitidas.
Grava os arquivos e um manifesto ordenado em `vendor/prototipo2`. Sobras de um
snapshot anterior não entram em `dist`: a lista do manifesto é a autoridade.
Não edite bundles manualmente. Confira a revisão e o diff do manifesto, rode
os smokes e versione a cópia junto das mudanças institucionais após revisão.
Nenhum desses comandos realiza deploy.

O importador não executa o build, não autentica a revisão declarada nem substitui
a qualificação física no repositório de origem. O SHA informado deve corresponder
ao checkout limpo efetivamente utilizado. Se novas páginas ou tipos de recursos
forem introduzidos no Protótipo 2, atualize explicitamente a lista permitida,
o contrato funcional e os testes antes de importar.

## Hosting e endereços antigos

- A pasta pública é `dist`; não usar `.` como diretório publicado.
- `/` serve `index.html`; `/pesquisa` e `/simulador` são páginas completas.
- Os três endereços `.html` do Protótipo 2 e `/starship_v1.html` continuam acessíveis.
- `cleanUrls` pode redirecionar `.html` para a forma sem extensão; o conteúdo e as
  dependências continuam servidos. Os links originais continuam válidos.
- Não há rewrite global. Um recurso ausente deve retornar 404, nunca HTML no lugar
  de JavaScript. Há página 404 com acesso à homepage e ao laboratório.
- Imagens originais, documentos internos, testes, vendor e fontes TypeScript não
  são publicados. O JS clássico em `src/js` é runtime indispensável do legado e
  é copiado explicitamente, sem arquivos internos do repositório.
- Assets compilados com hash recebem cache longo; imagens editoriais sem hash
  recebem cache curto. O PDF tem Content-Type explícito e nosniff.

Antes de um deploy **manual e autorizado**, confirme build, manifesto e smoke no
emulador Firebase. Este trabalho não executa deploy nem muda o projeto Firebase.
