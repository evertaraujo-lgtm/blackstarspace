# Redesenho institucional — Black Star Space

## CONTRATO DE IMPACTO FUNCIONAL

Objetivo: criar a apresentação institucional no repositório `evertaraujo-lgtm/blackstarspace`, preservando todos os módulos e endereços do simulador. Nenhuma alteração no Protótipo 2.

Subsistemas: HTML/CSS institucional, navegação, ativos estáticos e empacotamento Vite/Firebase Hosting. A implementação não importa o domínio de simulação.

| Função | Contrato, dependências e efeitos |
|---|---|
| `definirMenu(aberto: boolean): void` (nova) | Atualiza apenas `aria-expanded`, rótulo acessível e classe de apresentação da navegação móvel. Depende do cabeçalho DOM. Sem persistência ou acesso à simulação. |
| `atualizarCabecalho(): void` (nova) | Consulta `scrollY` e alterna classe de fundo do cabeçalho. Não modifica a posição da página. |
| `alternarMenu(): void` (nova) | Inverte a expansão consultada no botão via `definirMenu`. |
| `fecharComEscape(evento: KeyboardEvent): void` (nova) | Fecha menu ao pressionar Escape e devolve foco ao botão somente se estava aberto. |
| `fecharPorLink(evento: MouseEvent): void` (nova) | Fecha o menu ao seguir um link. Não cancela a navegação nativa. |
| `adequarMenu(): void` (nova) | Fecha menu ao entrar na largura desktop; não interfere em rolagem ou física. |
| `preservarSimulador(): Plugin` (nova, build) | Declara cópia explícita do runtime legado e do build P2 conforme manifesto, para `dist`. Sem transformação do conteúdo ou ordem dos scripts. |
| `closeBundle(): void` (novo hook de build) | Copia a lista permitida do legado; valida caminhos, hashes e colisões do manifesto P2 antes de copiar os assets compilados. Falha em fonte ausente ou divergente. Não publica nem copia testes, documentos internos ou fontes indiscriminadamente. |
| `configureServer(server: ViteDevServer): void` (novo hook) | Registra servidor somente leitura dos recursos compilados P2 durante desenvolvimento; lista de rotas vem do manifesto. Não muda fontes, estado físico ou comportamento de produção. |
| `servirSnapshot(req, res, next): void` (novo middleware local) | Serve somente URLs listadas no manifesto, com MIME explícito e sem cache; demais requisições seguem ao Vite. Leitura de bytes estáticos, escrita apenas da resposta HTTP local. |
| `coletarAssets(pasta: string, relativo?: string): string[]` (nova, ferramenta) | Enumera somente recursos estáticos do build original, recusando links simbólicos e extensões fora da lista permitida. Lê diretórios, sem executar o simulador. |
| `importarBuild(origem: string, revisao: string): void` (nova, ferramenta) | Valida três páginas e assets de um build de produção pronto, copia bytes para vendor e escreve manifesto SHA-256 com revisão declarada. Não roda build, não acessa código-fonte, não publica. |

Funções existentes modificadas/removidas: nenhuma. Funções do simulador reutilizadas: nenhuma na página institucional; o HTML legado mantém sua árvore de scripts original. Funções nativas de DOM, fs/path e Vite são as dependências novas. Scripts de teste/checagem não integram o runtime.

Invariantes: estado físico e controles preservados byte a byte; imagens originais e artigo preservados; nenhum tráfego externo para tipografia/animação; navegação por teclado e sem JS; conteúdo limitado ao cânone fornecido; geração não equivale a deploy.

Validações previstas: testes físicos existentes, build multipágina, comparação SHA-256 dos recursos legados, inspeção de links/imagens/PDF, desktop/mobile, menu por teclado, console e verificação das rotas do Hosting. Resultados e pendências serão anexados após execução.

## Inspeção inicial

- Destino real: `../Starship`, remote `evertaraujo-lgtm/blackstarspace`, main local um commit à frente; alterações preexistentes em vários arquivos da simulação. Snapshot isolado em `/tmp/blackstarspace-institucional`; nenhuma mudança de física autorizada.
- `index.html` preexistente e não versionado apenas redireciona ao laboratório; substituição institucional explicitamente solicitada. Original preservado em `arquivo/index-redirecionamento-anterior.txt`.
- Vite 7 já instalado, sem configuração de build multipágina. Simulador em scripts globais deferidos, entrada `starship_v1.html`; ordem imutável.
- Hosting anterior publica `.` e reescreve qualquer URL para o laboratório. Proposta: publicar exclusivamente `dist`, clean URLs e rotas explícitas, sem fallback indiscriminado.
- Dez imagens no diretório `img` do Protótipo 2, somente lidas. O arquivo real é `fabricamotores.png`, diferente da inicial maiúscula no pedido; a grafia real será preservada no destino.
- Artigo original em `docs/estudos/Artigo_Cientifico_BlackStar_BSS_Pouso_Propulsivo.pdf` do Protótipo 2. Título interno real: **Desenvolvimento e avaliação numérica de um sistema de pouso propulsivo para veículos reutilizáveis**. Manuscrito de 15/10/2026, preliminar e sem revisão por pares; não usar o título estimado do pedido.
- Bíblia de Cânone v2.1 não encontrada nos dois checkouts. Aplicam-se as regras explícitas fornecidas no pedido; ratificação documental permanece pendente. Não usar versões antigas para preencher lacunas.
- As imagens são ilustrações/reconstituições. `inicio.png` mostra uma oficina; `oficina.png` mostra instalações externas. As descrições seguem o conteúdo efetivo, sem alegar fotografia histórica.
- Leitura HTTP pública confirmou que a raiz atual contém o Protótipo 2; `/tests.html`, `/missao.html` e `/orbitas.html` respondem com suas páginas reais. `/starship_v1.html` hoje retorna a homepage por rewrite, não o laboratório legado. A decisão sobre preservação dos dois runtimes foi apresentada ao responsável enquanto a implementação institucional avança.

Decisão confirmada: preservar ambos. Protótipo 2 permanece principal, com cópia estática do build publicado, assets e endereços inalterados. Protótipo 1 mantém seu runtime legado intacto. Atualizações futuras usarão um importador de build pronto, com manifesto e hashes, sem modificar o repositório original.

## Arquitetura de apresentação

`/` institucional → âncoras editoriais; `/pesquisa` publicação real; `/simulador` porta de entrada independente → versões explicitamente identificadas. CSS e navegação próprios não são carregados pelo simulador. Imagens WebP em `public/media`, originais em `assets/institucional/originais`; PDF fonte em `docs/estudos` e cópia idêntica em `public/publicacoes`.

Nenhum dado de contato, cliente, contrato comercial, certificação ou resultado de voo físico será inventado.


## Arquivos e rotas da entrega

| Área | Arquivos/destinos |
|---|---|
| Institucional | `index.html`, `pesquisa.html`, `simulador.html`, `src/institucional/site.css`, `src/institucional/navegacao.js` |
| Build/Hosting | `vite.config.mjs`, `firebase.json`, scripts npm em `package.json`; lockfile e dependências intactos |
| Simulador principal | `vendor/prototipo2/{tests,missao,orbitas}.html`, assets compilados e manifesto; copiados byte a byte para os mesmos caminhos em dist |
| Simulador legado | Nenhuma alteração em `starship_v1.html`, `src/js`, CSS e imagens originais; cópia explícita no build |
| Artigo | Fonte preservada em `docs/estudos`; publicação em `/publicacoes/pouso-propulsivo-bss-2026.pdf` |
| Ativos | Dez PNGs em `assets/institucional/originais`; 19 derivados WebP em `public/media`; favicon derivado do emblema sem redesenho |
| Verificação | `scripts/verificar-institucional.mjs`, `tests/institucional.smoke.mjs` |
| Atualização P2 | `scripts/atualizar-prototipo2.mjs`, [procedimento](PROTOTIPO_2.md), manifesto e proveniência da captura |
| Navegação/SEO | `/`, `/pesquisa`, `/simulador`; âncoras História, Tecnologias, Operários, BlackStarShip e Recuperação; sitemap, robots e página 404 |

Não foram criadas páginas vazias `/historia` ou `/programas`; os conteúdos estão
na homepage. `/tests.html`, `/missao.html`, `/orbitas.html` e `/starship_v1.html`
continuam acessíveis. O cleanUrls do Hosting pode redirecionar para a forma sem
extensão, preservando o acesso e as dependências.

## Imagens integradas

Todos os PNGs foram copiados sem alterações. Derivados mantêm proporções e conteúdo;
WebP principal até 1.672 px, variante 840 px (exceto emblema, até 576 px).

| Fonte | Uso / derivado principal |
|---|---|
| `inicio.png` | Hero, `/media/inicio.webp` |
| `oficina.png` | Origem e evolução industrial, `/media/oficina.webp` |
| `robo-orbita.png` | Operários, `/media/robo-orbita.webp` |
| `instalacoes.png` | Infraestrutura, `/media/instalacoes.webp` |
| `fabricamotores.png` | Propulsão Boca, `/media/fabricamotores.webp` |
| `montagem.png` | Integração, `/media/montagem.webp` |
| `bss-006.png` | BlackStarShip, `/media/bss-006.webp` |
| `pouso-costa.png` | Recuperação, `/media/pouso-costa.webp` |
| `engenharia.png` | Simulação, `/media/engenharia.webp` |
| `emblema.png` | Cabeçalho/rodapé e favicon, `/media/emblema.webp` |

PNGs: 23.219.115 bytes; todas as variantes WebP juntas: 2.890.240 bytes
(aproximadamente 87,6% menos, mesmo incluindo duas resoluções). Originais não entram
no Hosting. Hashes, dimensões e tamanhos em `ativos.json`. Imagens abaixo do hero
usam lazy loading, dimensões explícitas, alt e legendas de material ilustrativo.
O preload do hero usa o mesmo srcset da imagem; nenhuma fonte ou biblioteca visual externa.

## Catálogo funcional desta entrega

Contrato de produção listado no início: seis funções de navegação, fábrica/hooks Vite e middleware local, além de duas funções do importador. Nenhuma função antiga modificada ou removida.
O middleware oferece o mesmo snapshot durante `npm run dev`, sem alterar seus bytes. A verificação adiciona auxiliares `listar(pasta): string[]`, `hash(arquivo): string`
e `arquivoPublico(caminho): string`: somente leitura de FS, cálculo SHA-256 e
resolução de URLs dentro de dist; falham se recursos ausentes ou internos forem
publicados. O smoke adiciona `abrir(largura, altura): Promise<Page>` e
`conferirImagens(page): Promise<void>`: criam abas, observam console/HTTP, exercitam
rolagem/lazy loading e verificam overflow. Escrevem somente capturas/downloads de
teste; nunca estado físico. Callbacks de listeners/smoke estão no escopo desses
contratos. Cada função nova possui JSDoc imediatamente acima da declaração.

## Validações executadas

Ambiente: Linux, Node 20.20.0, Vite 7.3.6, Chrome instalado e Firebase CLI 15.28.2.
Nenhuma nova dependência. Testes no snapshot isolado dos arquivos reais do destino.

| Validação | Resultado |
|---|---|
| `npm test` (teste físico existente do repositório destino) | Aprovado, 1 arquivo Node test, zero falhas/skips |
| `npm run build` | Aprovado; build multipágina em aproximadamente 0,47 s |
| `npm run verificar:institucional` | Aprovado: dez imagens, 95 links/âncoras, 13 recursos P2 e 34 legados idênticos; PDF idêntico |
| `node --check` nas cinco fontes JS/config/teste novas | Aprovado; projeto legado não possui comando TypeScript |
| Importação repetida do snapshot | Manifesto idêntico; build incompleto recusado antes de modificar o snapshot válido |
| Chrome em 1440, 768, 390 e 320 px | Três páginas em cada largura, sem overflow horizontal ou imagens quebradas |
| Navegação | Enter abre menu, Escape fecha e restaura foco, âncoras funcionam; fundo do cabeçalho responde à rolagem; reduced motion respeitado |
| Artigo | HTTP 200 / application/pdf; botão abre leitor em nova aba e download em pasta exclusiva produz bytes idênticos ao PDF servido |
| Protótipo 2 | Preparo, ignição, avanço, pausa e reinício da missão; variante aquática; órbita avança/reinicia; seis cenários da bancada carregam/avançam |
| `npm run dev` com snapshot P2 | Mesmo smoke completo aprovado; três páginas em quatro larguras, PDF em nova aba/download e controles dos dois protótipos operantes |
| Protótipo 1 | Canvas carrega; iniciar e pausar operantes, sem mudar lógica |
| Console / HTTP do smoke completo | Zero erros / zero respostas de falha |
| Emulador Firebase (projeto demo, sem deploy) | Raiz e rotas 200, URLs .html preservadas por redirecionamento cleanUrls; PDF correto; fontes internas e rota inexistente 404 |
| Arquivos protegidos | 38 arquivos de lógica, estilos de simulação, testes, imagens e lockfile idênticos ao estado inicial |

[Resultado completo do smoke no Hosting](evidencias/smoke.json),
[smoke no dev server](evidencias/smoke-dev.json),
[captura desktop](evidencias/desktop.jpg), [mobile](evidencias/mobile.jpg) e
[capacidade industrial](evidencias/capacidade-industrial.jpg).

A primeira tentativa de Chrome foi bloqueada pelo sandbox; foi reexecutada com
permissão para validação local. O smoke foi ajustado para navegação sem cache
(evita tratar HTTP 304 como erro) e para aguardar load/controles do legado em vez
de silêncio de rede. O favicon ausente foi fornecido como ativo estático, sem
alterar seu HTML. A configuração temporária do emulador precisou de caminho
público relativo à raiz do seu arquivo; o firebase.json da entrega usa `dist`.
O emulador fez uma consulta de metadados ao projeto demo e recebeu 403, mas serviu
os arquivos e rotas locais corretamente; não houve alteração de infraestrutura.

## Pendências e limites

- Bíblia de Cânone v2.1 ausente: o conteúdo segue as regras explícitas do pedido,
  sem preencher lacunas com documentação antiga. Ratificação contra o documento
  completo permanece pendente, sem bloquear a revisão visual.
- Não se atribui SHA de código-fonte ao snapshot público inicial; há proveniência
  HTTP e hashes de todos os bytes. Próximas atualizações devem informar a revisão
  limpa efetivamente compilada conforme o procedimento.
- A física do Protótipo 2 não foi requalificada neste trabalho visual; o build
  publicado foi preservado e seus acessos/controles foram testados. Nenhuma fonte
  do Protótipo 2 foi modificada. Registros preexistentes ou concorrentes continuam
  pertencendo ao operador.
- Sem CI remota executada e sem push/deploy solicitados nesta entrega. Não declarar
  aprovação remota nem publicação. Revisão visual/conteúdo e deploy manual continuam
  como próximos passos do responsável.
- O repositório destino contém alterações preexistentes de simulação; não foram
  descartadas, incluídas em commit ou misturadas com esta entrega institucional.


Conferência adicional do hero em 320, 390, 768 e 1440 px: conteúdo abaixo do
cabeçalho e acima da faixa inferior em todas as larguras, sem sobreposição dos
botões. A entrega foi reaplicada ao destino com checagem de hashes antes de
qualquer sobrescrita; testes existentes e build também passaram no checkout real.
As mudanças continuam sem commit para revisão junto ao trabalho preexistente;
nenhuma operação Git mutável, push ou deploy foi executada.


## Evolução da apresentação — carrossel do hero

A primeira seção passa a reutilizar cinco imagens em um carrossel, preservando
texto e CTAs fixos. O módulo isolado `src/institucional/carrossel.js` consulta
somente DOM e condições de visibilidade/movimento. O [contrato, catálogo das
funções e evidências](CARROSSEL.md) documenta a alteração de 16/10/2026.
Nenhum módulo do simulador ou ativo do snapshot participa dessa mudança.
