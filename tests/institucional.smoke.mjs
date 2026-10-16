import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { mkdirSync, mkdtempSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';

const base = process.env.SITE_URL || 'http://127.0.0.1:4175';
const capturas = process.env.SCREENSHOT_DIR || '/tmp/blackstarspace-smoke';
mkdirSync(capturas, { recursive: true });
const downloads = mkdtempSync(join(capturas, 'downloads-'));
const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined),
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const erros = [], respostasRuins = [], resultados = [];

/** Cria uma aba instrumentada para erros reais e respostas HTTP de falha. */
async function abrir(largura, altura) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: largura, height: altura, deviceScaleFactor: 1 });
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) respostasRuins.push({ url: r.url(), status: r.status() }); });
  return page;
}

/** Exercita lazy loading antes de conferir dimensões reais e overflow em toda a página. */
async function conferirImagens(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 35));
    }
    await Promise.all([...document.images].map(i => i.decode()));
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const estado = await page.evaluate(() => ({
    largura: innerWidth, conteudo: document.documentElement.scrollWidth,
    imagens: [...document.images].map(i => ({ src: i.currentSrc, largura: i.naturalWidth })),
  }));
  assert(estado.conteudo <= estado.largura, `Overflow horizontal: ${JSON.stringify(estado)}`);
  assert(estado.imagens.every(i => i.largura > 0), 'Imagem quebrada');
}

try {
  for (const largura of [1440, 768, 390, 320]) {
    const page = await abrir(largura, largura === 1440 ? 1000 : 844);
    for (const rota of ['/', '/pesquisa', '/simulador']) {
      const response = await page.goto(base + rota, { waitUntil: 'networkidle0' });
      assert.equal(response.status(), 200);
      await conferirImagens(page);
      assert.equal(await page.$$eval('h1', es => es.length), 1);
      resultados.push({ rota, largura, imagens: 'ok', overflow: false });
      if (rota === '/' && [1440, 390].includes(largura)) {
        await page.screenshot({ path: join(capturas, `homepage-${largura}.jpg`), fullPage: true, quality: 75 });
        if (largura === 1440) await page.screenshot({ path: join(capturas, 'hero-desktop.jpg'), quality: 85 });
      }
    }
    if (largura < 960) {
      await page.focus('.menu-botao'); await page.keyboard.press('Enter');
      assert.equal(await page.$eval('.menu-botao', e => e.getAttribute('aria-expanded')), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('.menu-botao', e => e.getAttribute('aria-expanded')), 'false');
      assert(await page.$eval('.menu-botao', e => document.activeElement === e));
      await page.click('.menu-botao');
      await page.click('#menu-principal a[href="/#historia"]');
      await page.waitForFunction(() => location.hash === '#historia');
      assert.equal(await page.$eval('.menu-botao', e => e.getAttribute('aria-expanded')), 'false');
    }
    await page.close();
  }

  const page = await abrir(1440, 1000);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(base + '/', { waitUntil: 'networkidle0' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForSelector('.cabecalho.solido');
  await page.goto(base + '/pesquisa', { waitUntil: 'networkidle0' });
  const pdf = await fetch(base + '/publicacoes/pouso-propulsivo-bss-2026.pdf');
  assert.equal(pdf.status, 200); assert(pdf.headers.get('content-type').includes('application/pdf'));
  const bytes = Buffer.from(await pdf.arrayBuffer()); assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  const abaPdf = browser.waitForTarget(t => t.opener() === page.target());
  await page.click('a[target="_blank"]');
  const leitor = await (await abaPdf).page();
  await leitor.waitForFunction(() => location.href.includes('/publicacoes/pouso-propulsivo-bss-2026.pdf'));
  await leitor.close();
  const client = await page.createCDPSession();
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  await page.click('a[download]');
  for (let i = 0; i < 60 && !readdirSync(downloads).some(n => n.endsWith('.pdf')); i++) await esperar(100);
  assert(readFileSync(join(downloads, 'BlackStar_Pouso_Propulsivo_2026.pdf')).equals(bytes));
  resultados.push({ pdf: 'abre com MIME correto e download idêntico' });

  await page.goto(base + '/missao.html', { waitUntil: 'networkidle0' });
  await page.click('#preparar'); await page.click('#ignicao'); await page.click('#iniciar');
  await page.waitForFunction(() => !document.querySelector('#tempo-missao').textContent.includes('0.00 s'));
  await esperar(900); await page.click('#pausar');
  const tempo = await page.$eval('#tempo-missao', e => e.textContent);
  assert(!/^t = 0(?:\.0+)? s/.test(tempo));
  await page.click('#reiniciar');
  await page.select('#variante-missao', 'agua');
  await page.click('#iniciar'); await esperar(500); await page.click('#pausar');
  assert(await page.$eval('#painel-aquatico', e => !e.hidden));
  resultados.push({ missao: 'preparo, ignição, avanço, pausa, reinício e variante aquática', tempo });

  await page.goto(base + '/orbitas.html', { waitUntil: 'networkidle0' });
  const orbitalInicial = await page.$eval('#orbital-dados', e => e.textContent);
  await page.click('#orbital-play'); await esperar(500); await page.click('#orbital-play');
  assert.notEqual(await page.$eval('#orbital-dados', e => e.textContent), orbitalInicial);
  await page.click('#orbital-reset');
  resultados.push({ orbitas: 'avanço e reinício' });

  await page.goto(base + '/tests.html', { waitUntil: 'networkidle0' });
  assert.equal(await page.$$eval('#scenario-selector option', es => es.length), 6);
  await page.click('#play-tests'); await esperar(500);
  assert.notEqual(await page.$eval('#sim-time', e => e.textContent), 't = 0,000 s');
  resultados.push({ bancada: 'seis cenários e avanço' });
  await page.click('#play-tests');

  await page.goto(base + '/starship_v1.html', { waitUntil: 'load' });
  await page.waitForSelector('#startBtn');
  assert(await page.$('canvas')); assert(await page.$('#startBtn'));
  await page.click('#pauseBtn'); await page.click('#startBtn'); await esperar(250); await page.click('#pauseBtn');
  resultados.push({ legado: 'canvas, iniciar e pausar' });
  await page.close();

  assert.deepEqual(respostasRuins, [], 'Respostas HTTP de falha');
  assert.deepEqual(erros, [], 'Erros no console ou exceções');
  console.log(JSON.stringify({ resultado: 'aprovado', resultados, erros, respostasRuins, capturas }, null, 2));
} catch (erro) {
  console.error(JSON.stringify({ resultados, erros, respostasRuins }, null, 2));
  throw erro;
} finally { await browser.close(); }
