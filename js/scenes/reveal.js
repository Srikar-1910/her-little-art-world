/* ============================================================
   SCENE: THE BIRTHDAY REVEAL
   Always reachable. Two candles: tap each (or "Light both"). The
   world goes dark plum, then amber, then a restrained gold bloom.
   The wish scroll unrolls. The wish is plain HTML, still and
   legible. While it is open all background motion stops.
   No sound is needed, nothing is dragged, nothing must be visited.
   ============================================================ */

Router.register('reveal', {
  title: 'The Birthday Reveal',
  mood: 'none',

  mount: function (ctx) {
    const h = UI.h;
    const host = h('div', { class: 'reveal-host' });
    ctx.el.insertBefore(host, ctx.ui);
    const f = Painting.frames({ scene: 'finale', anchorKey: 'finale2', count: 3, host: host, label: 'Night over a hill with a great tree full of lanterns; two candles and a scroll in the foreground' });

    const lit = [false, false];
    let stage = 0, wishShown = false, timers = [];
    const later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    const flames = [];

    [0, 1].forEach(function (i) {
      const b = h('button', { class: 'pin candle-btn', type: 'button', 'aria-label': 'Light candle ' + (i + 1) + ' of 2', 'aria-pressed': 'false', on: { click: function () { light(i); } } },
        h('span', { class: 'wick' }), h('span', { class: 'flame', 'aria-hidden': 'true' }), h('span', { class: 'glow', 'aria-hidden': 'true' }));
      flames.push(b);
      f.pin(b, 'candle' + i, { k: 0.7, aspect: 1.4 });
    });

    const intro = h('p', { class: 'reveal-intro' }, 'A little universe has been waiting for this moment. Light the candles to open your birthday surprise.');
    const both = h('button', { class: 'btn small', type: 'button', on: { click: function () { light(0); later(function () { light(1); }, UI.reduceMotion ? 0 : 700); } } }, 'Light the candles & reveal your wish ✨');
    const tools = h('div', { class: 'reveal-tools' }, intro, both);
    ctx.ui.appendChild(tools);

    function light(i) {
      if (lit[i]) return;
      Sound.unlock(); Sound.sfx('pop');
      lit[i] = true;
      flames[i].classList.add('lit'); flames[i].setAttribute('aria-pressed', 'true'); flames[i].setAttribute('aria-label', 'Candle ' + (i + 1) + ' is lit');
      const c = UI.centerOf(flames[i]); Atmosphere.sparkle(c.x, c.y - 20, '#ffc060');
      const n = lit.filter(Boolean).length;
      if (n === 1) { tween(0.5, 1800); UI.say('One candle lit.'); }
      if (n === 2) {
        both.hidden = true; intro.textContent = 'Make a wish. This little universe is all yours.';
        const center = { x: window.innerWidth / 2, y: window.innerHeight * 0.43 };
        Atmosphere.burst(center.x, center.y, '#ffe2a8', 90, 5);
        Atmosphere.sparkle(center.x, center.y, '#fff1c9');
        tween(1, 1500);
        later(function () { document.body.classList.add('gold'); tween(2, UI.reduceMotion ? 300 : 3200); Sound.sfx('wish'); }, UI.reduceMotion ? 200 : 1700);
        later(showWish, UI.reduceMotion ? 700 : 4300);
      }
    }

    /* crossfade the frames: 0 dark plum -> 1 amber -> 2 gold */
    let raf = 0;
    function tween(to, ms) {
      cancelAnimationFrame(raf);
      const from = f.level(), t0 = performance.now(), d = UI.reduceMotion ? 300 : ms;
      (function step(t) {
        const k = Math.min(1, (t - t0) / d), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        f.show(from + (to - from) * e);
        if (k < 1) raf = requestAnimationFrame(step);
      })(performance.now());
    }

    const scroll = h('article', { class: 'wish-scroll', hidden: true, 'aria-labelledby': 'wishHead', tabindex: '-1' });
    f.pin(scroll, 'scroll');
    function showWish() {
      if (wishShown) return; wishShown = true;
      const W = REVEAL.wish;
      const colors = Store.flag('studio-colors') || {};
      const dots = Object.keys(colors).slice(0, 3).map(function (k) {
        const x = STUDIO.pigments.filter(function (z) { return z.id === colors[k]; })[0];
        return x ? h('i', { class: 'motif-dot', style: { background: x.color }, 'aria-hidden': 'true' }) : null;
      });
      scroll.appendChild(h('div', { class: 'scroll-inner' },
        Content.wishReady() ? [
          h('h2', { id: 'wishHead' }, W.heading),
          W.paragraphs.map(function (t) { return h('p', null, t); }),
          W.signoff ? h('p', { class: 'signoff' }, W.signoff) : null,
          UI.stamp(W) ? h('p', null, UI.stamp(W)) : null
        ] : [h('h2', { id: 'wishHead' }, REVEAL.title)],
        h('div', { class: 'motifs', 'aria-hidden': 'true' }, h('span', { class: 'motif-lantern' }, '✦'), dots),
        h('p', { class: 'afterword' }, REVEAL.afterword)));
      scroll.hidden = false;
      void scroll.offsetWidth;
      scroll.classList.add('open');
      ctx.el.classList.add('wish-open');            // stops every background animation
      document.body.classList.add('still');
      Atmosphere.setMood('none');
      UI.say(REVEAL.title);
      later(function () { try { scroll.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, UI.reduceMotion ? 100 : 1600);
    }

    const title = h('h1', { class: 'reveal-title', 'aria-hidden': 'true' }, REVEAL.title);
    f.stage.appendChild(title);

    return { unmount: function () {
      timers.forEach(clearTimeout); cancelAnimationFrame(raf);
      document.body.classList.remove('gold', 'still');
      f.destroy();
    } };
  }
});
