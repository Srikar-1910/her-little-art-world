/* ============================================================
   SCENE: THE MEMORY GARDEN
   Six small things, each opening in its own way: a flower blooms,
   a lantern lights, a bottle yields a note, a key turns, a cup
   steams, a bird house opens. Tap or press Enter on any of them.
   Memories come from content/memories.js. Nothing is invented:
   a missing photo is a taped blank saying "photo goes here".
   ============================================================ */

(function () {
  'use strict';
  const h = UI.h;

  /* tiny animated props shown at the top of an opened memory */
  const PROPS = {
    flower: '<svg viewBox="0 0 120 130" aria-hidden="true"><path class="stem" d="M60 126Q56 90 60 58" fill="none" stroke="#6E8A5E" stroke-width="3" stroke-linecap="round"/><path class="leafy" d="M58 104q-22-4-26-20q20 0 26 20z" fill="#9CB08B"/><g class="petals" style="transform-origin:60px 54px"><ellipse cx="60" cy="34" rx="11" ry="19" fill="#C98B92"/><ellipse cx="60" cy="34" rx="11" ry="19" fill="#EBB596" transform="rotate(72 60 54)"/><ellipse cx="60" cy="34" rx="11" ry="19" fill="#C98B92" transform="rotate(144 60 54)"/><ellipse cx="60" cy="34" rx="11" ry="19" fill="#A99CC6" transform="rotate(216 60 54)"/><ellipse cx="60" cy="34" rx="11" ry="19" fill="#EBB596" transform="rotate(288 60 54)"/></g><circle class="heart" cx="60" cy="54" r="8" fill="#C8A04A"/></svg>',
    lantern: '<svg viewBox="0 0 120 130" aria-hidden="true"><circle class="halo" cx="60" cy="66" r="52" fill="#FFC673" opacity="0"/><path d="M60 8V26" stroke="#3B3A3D" stroke-width="2"/><path d="M46 28h28l8 62H38z" fill="#EBB596" stroke="#3B3A3D" stroke-width="2" stroke-linejoin="round"/><path class="flame" d="M60 48q-9 14 0 28q9-14 0-28z" fill="#FFE7A8" opacity="0"/><path d="M38 90h44v8H38z" fill="#4B3350"/></svg>',
    bottle: '<svg viewBox="0 0 120 130" aria-hidden="true"><rect class="note" x="52" y="36" width="16" height="48" rx="3" fill="#F3E9D2" stroke="#3B3A3D" stroke-width="1.5"/><path d="M50 40h20l10 18v52q0 8-8 8H48q-8 0-8-8V58z" fill="#9CC4C0" fill-opacity=".55" stroke="#3B3A3D" stroke-width="2" stroke-linejoin="round"/><rect x="52" y="18" width="16" height="26" rx="3" fill="#9CC4C0" fill-opacity=".55" stroke="#3B3A3D" stroke-width="2"/><rect x="54" y="8" width="12" height="12" rx="3" fill="#9A7152"/></svg>',
    key: '<svg viewBox="0 0 120 130" aria-hidden="true"><rect x="22" y="80" width="76" height="38" rx="4" fill="#9A7152" stroke="#3B3A3D" stroke-width="2"/><g class="lid" style="transform-origin:22px 80px"><rect x="22" y="62" width="76" height="20" rx="4" fill="#B08560" stroke="#3B3A3D" stroke-width="2"/></g><g class="keyg" style="transform-origin:60px 40px"><circle cx="60" cy="30" r="13" fill="none" stroke="#C8A04A" stroke-width="6"/><path d="M60 43V86M60 70h12M60 84h9" stroke="#C8A04A" stroke-width="6" stroke-linecap="round" fill="none"/></g></svg>',
    cup: '<svg viewBox="0 0 120 130" aria-hidden="true"><path class="steam s1" d="M46 66q-8-12 0-24t0-24" fill="none" stroke="#6D6A66" stroke-width="3" stroke-linecap="round" opacity="0"/><path class="steam s2" d="M62 66q-8-12 0-24t0-24" fill="none" stroke="#6D6A66" stroke-width="3" stroke-linecap="round" opacity="0"/><path class="steam s3" d="M78 66q-8-12 0-24t0-24" fill="none" stroke="#6D6A66" stroke-width="3" stroke-linecap="round" opacity="0"/><path d="M28 72h64l-6 40q-1 8-9 8H43q-8 0-9-8z" fill="#F3E9D2" stroke="#3B3A3D" stroke-width="2" stroke-linejoin="round"/><path d="M92 82q22 0 18 18t-26 12" fill="none" stroke="#3B3A3D" stroke-width="2.4"/><ellipse cx="60" cy="72" rx="32" ry="6" fill="#C98B92" opacity=".7"/></svg>',
    bird: '<svg viewBox="0 0 120 130" aria-hidden="true"><path d="M60 8V22" stroke="#3B3A3D" stroke-width="2"/><path d="M30 56L60 24L90 56V112H30z" fill="#4E9093" stroke="#3B3A3D" stroke-width="2" stroke-linejoin="round"/><g class="peek" style="transform-origin:60px 90px"><circle cx="60" cy="84" r="13" fill="#EBB596" stroke="#3B3A3D" stroke-width="1.6"/><path d="M71 82l12 4l-12 3z" fill="#C8A04A"/><circle cx="56" cy="81" r="2" fill="#3B3A3D"/></g><g class="door" style="transform-origin:42px 84px"><circle cx="60" cy="84" r="17" fill="#4B3350" opacity=".92"/></g></svg>'
  };
  const SFX = { flower: 'bloom', lantern: 'chime', bottle: 'page', key: 'pop', cup: 'sparkle', bird: 'pop' };
  const NAMES = { flower: 'the flower', lantern: 'the lantern', bottle: 'the bottle', key: 'the key', cup: 'the cup', bird: 'the bird house' };

  Router.register('garden', {
    title: 'The Memory Garden',
    mood: 'garden',

    mount: function (ctx) {
      const R = Rooms.open(ctx, 'garden', 'A garden at golden hour with a rose arch, flowers and small objects hanging among the branches', GARDEN.title, GARDEN.line);
      const p = R.p;
      const mems = Content.memories();
      const btns = [];

      mems.forEach(function (m) {
        const done = Store.has('opened', m.id);
        const btn = h('button', { class: 'pin garden-obj obj-' + m.object + (done ? ' opened' : ''), type: 'button',
          'aria-label': 'Open ' + NAMES[m.object] + ': ' + m.title,
          on: { click: function () { openMemory(m, btn); } } },
          h('span', { class: 'orb', 'aria-hidden': 'true' }));
        btns.push(btn);
        p.pin(btn, m.object, { k: 0.9, aspect: 1 });
      });

      if (!mems.length) ctx.ui.appendChild(h('p', { class: 'room-empty' }, GARDEN.empty));

      function openMemory(m, btn) {
        Sound.unlock(); Sound.sfx(SFX[m.object] || 'pop');
        const c = UI.centerOf(btn);
        Atmosphere.sparkle(c.x, c.y, '#ffe2a8');
        p.bloom(m.object, 1, 1200);
        Store.add('opened', m.id); btn.classList.add('opened');
        const opened = Store.count('opened');
        p.light(Math.min(1, opened / Math.max(1, mems.length)), 2400);
        if (opened >= mems.length) p.bloomAll(1, 3200);

        const prop = h('div', { class: 'opener op-' + m.object, 'aria-hidden': 'true' });
        prop.innerHTML = PROPS[m.object] || '';
        const body = h('div', { class: 'memory-sheet' }, prop, Rooms.memory(m));
        const sh = UI.sheet({ kicker: NAMES[m.object], title: m.title, tone: 'paper', wide: false, stamp: UI.stamp(m), body: body, seed: UI.hashStr(m.id) });
        requestAnimationFrame(function () { setTimeout(function () { prop.classList.add('go'); }, 350); });
        return sh;
      }

      p.ready.then(function () {
        p.bloom('flower', 0.3, 1800);
        mems.forEach(function (m, i) { setTimeout(function () { p.bloom(m.object, Math.max(p.bloomLevel(m.object), Store.has('opened', m.id) ? 1 : 0.4), 2200); }, 600 + i * 450); });
        const opened = Store.count('opened');
        if (opened) p.light(Math.min(1, opened / Math.max(1, mems.length)), 0);
      });
      return { unmount: function () { p.destroy(); } };
    }
  });
})();
