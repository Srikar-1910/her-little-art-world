/* ============================================================
   SCENE: ENTRANCE
   A pencil sketch of a garden wall and an open arched door. The
   watercolour spreads out from the door, then the light arrives.
   The door is the button; there is also a plain "Come in" button
   and a link straight to the birthday reveal.
   ============================================================ */

Router.register('entrance', {
  title: 'Welcome',
  mood: 'entrance',

  mount: function (ctx) {
    const h = UI.h;
    const name = (HER.name || '').trim();
    const returning = !!Store.flag('entered');

    let today = false;
    if (HER.birthday && HER.birthday.month && HER.birthday.day) {
      const d = new Date();
      today = d.getMonth() + 1 === HER.birthday.month && d.getDate() === HER.birthday.day;
    }

    const host = h('div', { class: 'entrance-host' });
    ctx.el.insertBefore(host, ctx.ui);
    const p = Painting.create({ scene: 'entrance', host: host, label: 'A garden wall at night with an arched door standing open and golden light spilling out' });

    /* the door itself is a button */
    const doorBtn = h('button', { class: 'pin entrance-door', type: 'button', 'aria-label': ENTRANCE.doorHint, on: { click: openDoor } });
    p.pin(doorBtn, 'door'); doorBtn.classList.add('pin');

    const text = h('div', { class: 'entrance-text' },
      h('p', { class: 'eyebrow' }, ENTRANCE.eyebrow + (name ? '' : ' you')),
      h('h1', null, ENTRANCE.greeting + (name ? ',' : '')),
      name ? h('p', { class: 'name' }, name) : null,
      h('p', { class: 'sub' }, returning ? ENTRANCE.returning : ENTRANCE.subtitle),
      today ? h('p', { class: 'today' }, ENTRANCE.todayLine) : null);
    p.stage.appendChild(text);

    const enter = h('button', { class: 'btn', type: 'button', on: { click: openDoor } }, ENTRANCE.button);
    const skip = h('button', { class: 'text-btn', type: 'button', on: { click: function () { Store.flag('entered', true); Router.go('reveal', { origin: UI.centerOf(skip) }); } } }, ENTRANCE.skipLabel);
    ctx.ui.appendChild(h('div', { class: 'entrance-actions' }, enter, h('div', { class: 'links' }, skip)));
    const flash = h('div', { class: 'entrance-flash', 'aria-hidden': 'true' });
    document.body.appendChild(flash);

    /* the painting comes to life: pencil first, then colour, then light */
    let timers = [];
    const later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    p.ready.then(function () {
      later(function () { p.bloom('door', 1, 3000); }, 500);
      later(function () { p.bloom('lantern', 1, 2600); }, 1400);
      later(function () { p.bloomAll(1, 4200); }, 2200);
      later(function () { p.light(1, 3200); }, 4200);
    });

    let opened = false;
    function openDoor() {
      if (opened) return;
      opened = true;
      Sound.unlock(); Sound.sfx('chime');
      Store.flag('entered', true);
      p.bloomAll(1, 400); p.light(1, 800);
      const c = UI.centerOf(doorBtn);
      flash.style.setProperty('--fx', c.x + 'px'); flash.style.setProperty('--fy', c.y + 'px');
      Atmosphere.burst(c.x, c.y - 40, '#ffe2a8', 36, 3);
      ctx.el.classList.add('opening');
      setTimeout(function () { Sound.sfx('sparkle'); }, 500);
      setTimeout(function () { Router.go('world', { replace: true, origin: c }); }, UI.reduceMotion ? 300 : 1500);
    }

    setTimeout(function () { try { enter.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 3000);
    return { unmount: function () { timers.forEach(clearTimeout); p.destroy(); if (flash.parentNode) flash.parentNode.removeChild(flash); } };
  }
});
