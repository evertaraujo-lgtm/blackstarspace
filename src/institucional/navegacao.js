/**
 * Navegação institucional isolada. Consulta apenas DOM/rolagem e não importa
 * nenhum estado do laboratório. Os links continuam operantes sem JavaScript.
 */
const cabecalho = document.querySelector('.cabecalho');
const botao = document.querySelector('.menu-botao');
const menu = document.querySelector('#menu-principal');
const desktop = window.matchMedia('(min-width: 960px)');

/** Define a expansão móvel e seu estado acessível, sem alterar o foco ou o domínio. */
function definirMenu(aberto) {
  botao.setAttribute('aria-expanded', String(aberto));
  menu.classList.toggle('aberto', aberto);
  botao.setAttribute('aria-label', aberto ? 'Fechar navegação' : 'Abrir navegação');
}

/** Alterna a apresentação do cabeçalho após 24 px de rolagem; não desloca a página. */
function atualizarCabecalho() {
  cabecalho.classList.toggle('solido', window.scrollY > 24);
}

/** Inverte a expansão solicitada pelo botão de navegação. */
function alternarMenu() {
  definirMenu(botao.getAttribute('aria-expanded') !== 'true');
}

/** Fecha com Escape e devolve foco ao botão somente quando o menu estava aberto. */
function fecharComEscape(evento) {
  if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
    definirMenu(false);
    botao.focus();
  }
}

/** Seguir um link recolhe o menu, preservando a navegação padrão e suas âncoras. */
function fecharPorLink(evento) {
  if (evento.target.closest('a')) definirMenu(false);
}

/** Evita manter uma expansão móvel residual quando a janela passa a desktop. */
function adequarMenu() {
  if (desktop.matches) definirMenu(false);
}

document.documentElement.classList.add('js');
botao.addEventListener('click', alternarMenu);
menu.addEventListener('click', fecharPorLink);
document.addEventListener('keydown', fecharComEscape);
window.addEventListener('scroll', atualizarCabecalho, { passive: true });
desktop.addEventListener('change', adequarMenu);
atualizarCabecalho();
