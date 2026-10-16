// Dev tool. Bakes painted layers (sketch / wash / full) for each scene into assets/art/*.png
// Usage: node build-art.js out_dir scene:variant[:stage] ...   (variant = d|m)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const SIZE = { d: [1440, 810], m: [560, 1040] };
(async () => {
  const [, , out, ...jobs] = process.argv;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const anchors = {};
  for (const j of jobs) {
    const [sc, v, st] = j.split(':'); const [W, H] = SIZE[v];
    for (const mode of (st !== undefined ? ['full'] : ['sketch', 'wash', 'full'])) {
      const t0 = Date.now();
      const p = await b.newPage({ viewport: { width: W, height: H } });
      p.on('pageerror', (e) => console.log('ERR', e.message));
      await p.goto('file://' + path.resolve(__dirname, 'gen.html') + `?s=${sc}&w=${W}&h=${H}&m=${mode}${st !== undefined ? '&stage=' + st : ''}`);
      await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
      const name = `${sc}${st !== undefined ? st : ''}-${v}-${mode}`;
      await p.locator('#art').screenshot({ path: path.join(out, name + '.png'), omitBackground: true, timeout: 280000 });
      if (mode === 'full') anchors[sc + (st !== undefined ? st : '') + '-' + v] = await p.evaluate(() => window.__anchors);
      await p.close();
      console.log(name, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
  }
  fs.writeFileSync(path.join(out, `anchors-${Date.now()}.json`), JSON.stringify(anchors));
  await b.close();
})();
