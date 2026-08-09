const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Emulate an iPhone X-like viewport (manual fallback)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');

  const url = 'http://localhost:5173/starship_v1.html';
  const consoleErrors = [];
  const badResponses = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));
  page.on('response', (res) => {
    if (res.status() >= 400) badResponses.push({ url: res.url(), status: res.status() });
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Try to trigger a draw pass for the HUD and wait up to 5s for mobileHudButtons
  try {
    await page.evaluate(() => { if (typeof window.drawFlightTelemetryBar === 'function') window.drawFlightTelemetryBar(); });
  } catch (e) {
    // ignore errors from manual draw invocation
  }
  const maxPoll = 50;
  for (let i = 0; i < maxPoll; i++) {
    const defined = await page.evaluate(() => typeof window.mobileHudButtons !== 'undefined');
    if (defined) break;
    await new Promise((res) => setTimeout(res, 100));
  }

  const hudInfo = await page.evaluate(() => {
    return {
      mobileHudButtonsDefined: typeof window.mobileHudButtons !== 'undefined',
      mobileHudButtons: window.mobileHudButtons ? {
        speeds: (window.mobileHudButtons.speeds || []).map(b => ({ multiplier: b.multiplier, x: b.x, y: b.y, w: b.w, h: b.h })),
        start: window.mobileHudButtons.start ? { x: window.mobileHudButtons.start.x, y: window.mobileHudButtons.start.y, w: window.mobileHudButtons.start.w, h: window.mobileHudButtons.start.h } : null,
        instances: window.mobileHudButtons.instances ? { x: window.mobileHudButtons.instances.x, y: window.mobileHudButtons.instances.y, r: window.mobileHudButtons.instances.r } : null,
      } : null,
      telemetryStyle: window.telemetryHudStyle,
      isMobileViewport: window.matchMedia && window.matchMedia('(max-width: 720px)').matches,
    };
  });
    const debugInfo = await page.evaluate(() => ({
      hasDrawFlightTelemetryBar: typeof window.drawFlightTelemetryBar === 'function',
      hasDrawSpaceXTelemetryHudMobile: typeof window.drawSpaceXTelemetryHudMobile === 'function',
      canvasCount: document.querySelectorAll('canvas').length,
      canvasRect: (function () { const c = document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { w: r.width, h: r.height }; })(),
    }));

  // screenshot
  const screenshotPath = 'tests/mobile_hud_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });

  console.log('URL:', url);
  console.log('Mobile HUD style:', hudInfo.telemetryStyle);
  console.log('Is mobile viewport:', hudInfo.isMobileViewport);
  console.log('mobileHudButtonsDefined:', hudInfo.mobileHudButtonsDefined);
  if (hudInfo.mobileHudButtons) console.log('mobileHudButtons summary:', JSON.stringify(hudInfo.mobileHudButtons, null, 2));
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
  console.log('Console errors captured:', consoleErrors.length);
  if (consoleErrors.length) consoleErrors.forEach((e, i) => console.log(`${i+1}) ${e}`));
  if (badResponses.length) {
    console.log('Bad responses:', JSON.stringify(badResponses, null, 2));
  }
  console.log('Screenshot saved to', screenshotPath);

  await browser.close();

  // exit code 0 for success (we'll report errors but not fail CI for simple 404s)
  process.exit(0);
})();