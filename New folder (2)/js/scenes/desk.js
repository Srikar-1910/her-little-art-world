/* ============================================================
   SCENE: THE DESK OF UNSENT WORDS (optional)
   Four envelopes, each opening in its own way:
     flap  the flap lifts
     seal  the wax seal breaks, then the flap lifts
     pull  the letter slides up and out
     fold  a folded note unfolds
   Tap or press Enter on an envelope. Letters are shown still, in
   the serif face, exactly as written in content/letters.js.
   ============================================================ */

Router.register('desk', {
  title: 'The Desk of Unsent Words',
  mood: 'desk',

  mount: function (ctx) {
    const h = UI.h;
    const R = Rooms.open(ctx, 'desk', 'A wooden desk seen from above with four envelopes, a pen, an inkwell and a pressed flower', LETTERS.title, LETTERS.line);
    const p = R.p;
    const letters = Content.letters();
    const anchors = ['env0', 'env1', 'env2', 'env3'];

    function envelope(type) {
      const e = h('div', { class: 'envx type-' + type, 'aria-hidden': 'true' });
      if (type === 'fold') {
        e.appendChild(h('div', { class: 'fold-note' }, h('div', { class: 'panel p1' }), h('div', { class: 'panel p2' }), h('div', { class: 'panel p3' })));
      } else {
        e.appendChild(h('div', { class: 'env-back' }));
        e.appendChild(h('div', { class: 'env-letter' }));
        e.appendChild(h('div', { class: 'env-pocket' }));
        e.appendChild(h('div', { class: 'env-flap' }));
        if (type === 'seal') e.appendChild(h('div', { class: 'wax' }, h('span', { class: 'half a' }), h('span', { class: 'half b' })));
      }
      return e;
    }
    const SFXMAP = { flap: 'page', seal: 'seal', pull: 'pull', fold: 'page' };

    function openLetter(l, btn) {
      Sound.unlock();
      const art = envelope(l.opening);
      const text = h('div', { class: 'letter-text', tabindex: '-1' },
        h('h3', null, l.heading || ''),
        (l.body || []).map(function (para) { return para ? h('p', null, para) : h('br'); }),
        l.signoff ? h('p', { class: 'signoff' }, l.signoff) : null);
      const body = h('div', { class: 'desk-sheet', 'data-opening': l.opening },
        h('div', { class: 'env-stage' }, art),
        text);
      const sh = UI.sheet({ kicker: l.label, title: '', stamp: UI.stamp(l), tone: 'paper', wide: false, label: l.label, body: body, seed: UI.hashStr(l.id) });
      const finish = function () {
        body.classList.add('read');
        UI.say(l.heading || l.label);
        setTimeout(function () { try { text.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 50);
      };
      if (UI.reduceMotion) { art.classList.add('go'); finish(); }
      else {
        setTimeout(function () { art.classList.add('go'); Sound.sfx(SFXMAP[l.opening] || 'page'); }, 450);
        setTimeout(finish, l.opening === 'seal' ? 2300 : 1900);
      }
      Store.add('opened', l.id); btn.classList.add('opened');
      const n = letters.filter(function (x) { return Store.has('opened', x.id); }).length;
      p.bloom(anchors[letters.indexOf(l)] || 'env0', 1, 1500);
      p.light(Math.min(1, n / Math.max(1, letters.length)), 2400);
      if (n >= letters.length) p.bloomAll(1, 3000);
    }

    letters.forEach(function (l, i) {
      const btn = h('button', { class: 'pin env-btn' + (Store.has('opened', l.id) ? ' opened' : ''), type: 'button', 'aria-label': 'Open the envelope: ' + l.label,
        on: { click: function () { openLetter(l, btn); } } }, h('span', { class: 'env-ring', 'aria-hidden': 'true' }));
      p.pin(btn, anchors[i], { k: 1.15, aspect: 0.68 });
    });
    if (!letters.length) ctx.ui.appendChild(h('p', { class: 'room-empty' }, 'The envelopes are still being written. Come back soon.'));

    p.ready.then(function () {
      anchors.forEach(function (a, i) { setTimeout(function () { p.bloom(a, Store.has('opened', (letters[i] || {}).id) ? 1 : 0.4, 2000); }, 500 + i * 450); });
      const n = letters.filter(function (x) { return Store.has('opened', x.id); }).length;
      if (n) p.light(Math.min(1, n / letters.length), 0);
    });
    return { unmount: function () { p.destroy(); } };
  }
});
