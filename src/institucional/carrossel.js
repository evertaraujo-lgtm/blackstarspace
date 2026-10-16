/** Carrossel visual da homepage. Não importa nem altera qualquer estado do simulador. */
const hero = document.querySelector('[data-carrossel]');

/**
 * Conecta imagens e controles declarados no hero, sem bibliotecas ou persistência.
 * @param {HTMLElement} raiz Seção institucional; deve conter ao menos dois slides.
 * @returns {void} Registra eventos/timer de apresentação. Validação: docs/institucional/CARROSSEL.md.
 */
function iniciarCarrossel(raiz) {
  const slides = [...raiz.querySelectorAll('.hero-slide')];
  if (slides.length < 2) return;
  const controles = raiz.querySelector('.carrossel-controles');
  const botao = raiz.querySelector('[data-reproducao]');
  const contador = raiz.querySelector('[data-slide-atual]');
  const legenda = raiz.querySelector('[data-slide-legenda]');
  const anuncio = raiz.querySelector('[data-slide-anuncio]');
  const movimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  let indice = 0, pedido = 0, timer, pausado = movimento.matches;
  let visivel = true, sobreposto = false, emFoco = false;

  /** Cancela a única troca agendada; não altera o slide nem a intenção do operador. */
  function suspenderTroca() {
    clearTimeout(timer);
    timer = undefined;
  }

  /** Atualiza controle acessível e agenda 7 s somente nas condições de reprodução. */
  function atualizarReproducao() {
    suspenderTroca();
    const parado = pausado || movimento.matches;
    botao.disabled = movimento.matches;
    botao.setAttribute('aria-pressed', String(parado));
    botao.setAttribute('aria-label', movimento.matches ? 'Troca automática desativada pela preferência de movimento reduzido' : parado ? 'Retomar troca automática de imagens' : 'Pausar troca automática de imagens');
    botao.title = botao.getAttribute('aria-label');
    botao.textContent = parado ? '▶' : 'Ⅱ';
    const executar = !parado && !document.hidden && visivel && !sobreposto && !emFoco;
    raiz.dataset.estadoReproducao = executar ? 'ativa' : 'pausada';
    if (executar) timer = setTimeout(avancarAutomaticamente, 7000);
  }

  /**
   * Exibe imagem decodificada; falha mantém a anterior e pedidos antigos não vencem.
   * @param {number} novoIndice Índice circular solicitado, sem alterar layout ou foco.
   * @param {boolean} anunciar Anuncia posição/descrição somente por comando manual.
   * @returns {Promise<void>} Muda classes, aria-hidden, contador e legenda do hero.
   */
  async function mostrarSlide(novoIndice, anunciar = false) {
    const requisicao = ++pedido;
    const destino = (novoIndice + slides.length) % slides.length;
    try { await slides[destino].decode(); }
    catch { if (requisicao === pedido) atualizarReproducao(); return; }
    if (requisicao !== pedido) return;
    indice = destino;
    slides.forEach((slide, i) => {
      slide.classList.toggle('ativa', i === indice);
      slide.setAttribute('aria-hidden', String(i !== indice));
    });
    contador.textContent = String(indice + 1).padStart(2, '0');
    legenda.textContent = slides[indice].dataset.legenda;
    if (anunciar) anuncio.textContent = `Imagem ${indice + 1} de ${slides.length}: ${slides[indice].alt}`;
    atualizarReproducao();
  }

  /** Avança pela apresentação, sem anúncio automático ou alteração de foco. */
  function avancarAutomaticamente() { void mostrarSlide(indice + 1); }

  /** Retrocede circularmente por comando e mantém autoplay pausado até retomada. */
  function anterior() { pausado = true; suspenderTroca(); void mostrarSlide(indice - 1, true); }

  /** Avança circularmente por comando e mantém autoplay pausado até retomada. */
  function proximo() { pausado = true; suspenderTroca(); void mostrarSlide(indice + 1, true); }

  /** Alterna intenção de reprodução; movimento reduzido continua tendo prioridade. */
  function alternarReproducao() { pausado = !pausado; emFoco = false; atualizarReproducao(); }

  controles.hidden = false;
  raiz.querySelector('[data-anterior]').addEventListener('click', anterior);
  raiz.querySelector('[data-proximo]').addEventListener('click', proximo);
  botao.addEventListener('click', alternarReproducao);
  raiz.addEventListener('pointerenter', evento => { sobreposto = evento.pointerType !== 'touch'; atualizarReproducao(); });
  raiz.addEventListener('pointerleave', () => { sobreposto = false; atualizarReproducao(); });
  raiz.addEventListener('focusin', () => { emFoco = true; atualizarReproducao(); });
  raiz.addEventListener('focusout', evento => { emFoco = raiz.contains(evento.relatedTarget); atualizarReproducao(); });
  document.addEventListener('visibilitychange', atualizarReproducao);
  movimento.addEventListener('change', () => { if (movimento.matches) pausado = true; atualizarReproducao(); });
  const observador = new IntersectionObserver(entradas => {
    visivel = entradas[0].isIntersecting;
    atualizarReproducao();
  }, { threshold: 0 });
  observador.observe(raiz);
  atualizarReproducao();
}

if (hero) iniciarCarrossel(hero);
