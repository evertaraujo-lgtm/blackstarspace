# Carrossel da primeira seção — 16/10/2026

## CONTRATO DE IMPACTO FUNCIONAL

Objetivo: alternar as imagens ilustrativas do hero com transição discreta, sem
mudar o texto, os botões ou os recursos dos simuladores. Usar apenas os WebP já
existentes: início, instalações, robótica orbital, motores e recuperação costeira.

Subsistemas: apresentação institucional HTML/CSS e novo módulo isolado
`src/institucional/carrossel.js`, importado somente pela homepage.

| Função | Responsabilidade, assinatura, dependências e efeitos |
|---|---|
| `iniciarCarrossel(raiz: HTMLElement): void` | Inicializa uma instância com as imagens e controles declarados no DOM. Registra eventos e observador de visibilidade; não acessa estado da simulação. |
| `suspenderTroca(): void` | Cancela o timeout pendente, sem trocar a imagem. Dependência: timer de apresentação. |
| `atualizarReproducao(): void` | Atualiza rótulo/estado do botão e agenda uma única troca após 7 s, somente se reprodução autorizada, seção visível, aba ativa e movimento reduzido desativado. |
| `mostrarSlide(novoIndice: number, anunciar?: boolean): Promise<void>` | Aguarda decodificação, ignora pedido superado, alterna classes/aria-hidden, contador e legenda. Mantém a imagem anterior em falha de carregamento. Anúncio acessível somente na navegação manual. |
| `avancarAutomaticamente(): void` | Solicita próximo slide sem mover foco ou anunciar a troca ao leitor de tela. |
| `anterior(): void` e `proximo(): void` | Pausam a reprodução e navegam circularmente por comando explícito. Não alteram a página/rolagem. |
| `alternarReproducao(): void` | Alterna a pausa solicitada; preferência de movimento reduzido mantém reprodução automática desativada. |

Callbacks de pointerenter/pointerleave/focusin/focusout, visibilitychange,
MediaQueryList e IntersectionObserver atualizam somente condições de apresentação
e o agendamento compartilhado. Funções existentes reutilizadas: navegação DOM
continua carregada sem alteração; nenhuma função de produção existente precisa
ser modificada ou removida. APIs nativas: decode, setTimeout/clearTimeout,
matchMedia, IntersectionObserver e eventos DOM. Sem biblioteca ou persistência.

Invariantes: somente uma imagem semanticamente ativa; texto/CTAs estáveis;
controles de teclado e pausa; sem autoplay ou transição com reduced motion;
sem agendamento fora da seção/aba; fallback estático utilizável sem JavaScript;
mesmas imagens/URLs; lógica, bundles e rotas dos simuladores intactos.

Validação: smoke direcionado real no Chrome (troca automática, anterior/próximo,
pausa/retomada, foco, visibilidade, movimento reduzido, erro de imagem e viewport
320/390/1440 px), build, verificação institucional existente, console e comparação
de arquivos protegidos. Não realizar deploy.

## Posição na arquitetura

`index.html` → módulo de carrossel → apenas DOM das imagens/controles do hero.
O CSS compartilha cores/tipografia da página. Navegação principal, páginas de
pesquisa/laboratório, runtime legado e snapshot P2 não importam o módulo.

## Resultado da validação

- Build Vite aprovado; módulo do carrossel com cerca de 1 KB gzip, sem dependências novas.
- Verificação institucional aprovada: dez imagens originais representadas, 100 links/âncoras válidos, PDF idêntico e runtimes preservados.
- Smoke Chrome real aprovado: intervalo de 7 s, anterior/próximo circulares, contador e anúncio manual, pausa mantida por mais de um intervalo e retomada efetiva.
- Foco em CTA e saída da seção suspendem a troca. Movimento reduzido desativa autoplay e transição; setas continuam operantes.
- Viewports 1440, 768, 390 e 320 px: sem overflow ou sobreposição; controles com pelo menos 44 px de altura. Texto e CTAs idênticos antes/depois das trocas.
- Bloqueio controlado da imagem seguinte mantém o slide anterior. Sem JavaScript, a primeira imagem aparece e os controles de carrossel ficam ocultos.
- Zero erros de console/HTTP na operação nominal; a falha de recurso foi injetada somente em uma aba separada de teste.
- 49 arquivos protegidos dos simuladores e lockfile idênticos ao estado inicial. Nenhum ganho, força, controlador ou bundle do snapshot foi alterado.

Para repetir a revisão: abrir homepage, aguardar sete segundos sem foco/ponteiro sobre a seção, navegar com setas/Enter, pausar por mais de sete segundos, retomar, rolar para fora e testar a preferência reduced motion. O build e `npm run verificar:institucional` mantêm suas verificações anteriores.

Não foi realizado deploy. A atualização deve ser publicada pelo repositório `blackstarspace` (`../Starship`), nunca pelo checkout do Protótipo 2.
