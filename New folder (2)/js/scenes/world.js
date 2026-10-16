/* ============================================================
   SCENE: THE LITTLE WORLD
   One connected painting. It starts as pencil; places bloom into
   watercolour as she nears them (pointer, touch or keyboard focus),
   and slowly bloom by themselves so no gesture is ever required.
   The hilltop lantern (the Birthday Reveal) is always lit and
   always open, and a skip link is always on screen.
   ============================================================ */

Router.register('world', {
  title: 'The little world',
  mood: 'world',

  mount: function (ctx) {
    const h = UI.h;
    const host = h('div', { class: 'world-host' });
    ctx.el.insertBefore(host, ctx.ui);
    const p = Painting.create({ scene: 'world', host: host, label: 'A painted little world: a hill with a glowing lantern, a cottage for My World, a gallery, a garden, a listening corner and a desk, joined by a winding path' });

    const btns = {};
    const roomIds = WORLD.places.filter(function (x) { return x.id !== 'reveal'; });
    const visitedCount = function () { return roomIds.filter(function (x) { return Store.has('visited', x.id); }).length; };

    WORLD.places.forEach(function (pl) {
      const isReveal = pl.id === 'reveal';
      const btn = h('button', {
        class: 'pin place-btn' + (isReveal ? ' reveal' : '') + (Store.has('visited', pl.id) ? ' visited' : ''), type: 'button',
        'aria-label': pl.label + '. ' + pl.blurb,
        on: {
          click: function () { Sound.unlock(); Sound.sfx('pop'); Router.go(pl.id, { origin: UI.centerOf(btn) }); },
          focus: function () { p.bloom(pl.anchor, Math.max(p.bloomLevel(pl.anchor), 0.85), 1600); },
          pointerenter: function () { p.bloom(pl.anchor, Math.max(p.bloomLevel(pl.anchor), 0.8), 1600); }
        }
      }, h('span', { class: 'dot', 'aria-hidden': 'true' }), h('span', { class: 'tag' }, pl.label));
      btns[pl.id] = btn;
      p.pin(btn, pl.anchor);
      if (isReveal) {
        const glow = h('div', { class: 'pin lantern-glow', 'aria-hidden': 'true' });
        p.pin(glow, 'reveal');
        p.stage.insertBefore(glow, btn);
      }
    });

    /* proximity: colour follows the pointer or finger */
    p.stage.addEventListener('pointermove', function (e) {
      const n = p.near(e.clientX, e.clientY)[0];
      if (n && n.d < n.rad * 1.3) p.bloom(n.name, Math.max(p.bloomLevel(n.name), 0.75), 1400);
    });

    /* state: visited places are fully coloured at once */
    const placeAnchor = {}; WORLD.places.forEach(function (x) { placeAnchor[x.id] = x.anchor; });
    const lightTarget = function () { return Math.min(1, visitedCount() / CONFIG.lightAfterVisiting); };
    p.ready.then(function () {
      roomIds.forEach(function (x) { if (Store.has('visited', x.id)) p.bloom(placeAnchor[x.id], 1, 0); });
      p.bloom('reveal', 0.9, ctx.from ? 0 : 1800);
      const lt = lightTarget();
      if (lt > 0) p.light(lt, ctx.from ? 0 : 2400);
      if (visitedCount() >= roomIds.length) { p.bloomAll(1, ctx.from ? 0 : 3000); ctx.el.classList.add('lit'); }
    });

    /* no gesture needed: unvisited places slowly bloom on their own */
    let idle = 0; const timers = [];
    roomIds.forEach(function (x, i) {
      timers.push(setTimeout(function () { if (p.bloomLevel(placeAnchor[x.id]) < 0.45) p.bloom(placeAnchor[x.id], 0.45, 2600); }, 2600 + i * 1700));
    });

    const skip = h('button', { class: 'text-btn', type: 'button', on: { click: function () { Router.go('reveal', { origin: UI.centerOf(skip) }); } } }, ENTRANCE.skipLabel);
    ctx.ui.appendChild(h('div', { class: 'world-foot' },
      h('p', { class: 'note-hand hint' }, 'It colours in where you go.'), skip));

    return { unmount: function () { timers.forEach(clearTimeout); p.destroy(); } };
  }
});
