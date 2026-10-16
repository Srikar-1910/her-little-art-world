/* ============================================================
   SCENE: MY WORLD
   A quiet full-screen portrait reveal with a user-initiated song.
   ============================================================ */
Router.register('myworld', {
  title: 'My World',
  mood: 'world',
  mount: function (ctx) {
    const h = UI.h;
    const root = h('div', { class: 'myworld-screen' });
    const glow = h('div', { class: 'myworld-glow', 'aria-hidden': 'true' });
    const frame = h('div', { class: 'myworld-frame' });
    const sketch = h('div', { class: 'myworld-sketch', 'aria-hidden': 'true' });
    const img = h('img', {
      class: 'myworld-portrait',
      src: 'assets/myworld/my-world-portrait.png',
      alt: 'A softly painted portrait, made for this little world.',
      draggable: 'false'
    });
    const kicker = h('p', { class: 'myworld-kicker' }, 'a little world, made for you');
    const title = h('h1', { class: 'myworld-title' }, 'My World');
    const note = h('p', { class: 'myworld-note' }, 'Some things are better felt than explained.');
    const audio = new Audio('assets/myworld/peasamaley.mp3');
    audio.preload = 'metadata';
    audio.loop = false;
    const play = h('button', {
      class: 'myworld-play',
      type: 'button',
      'aria-pressed': 'false',
      on: { click: function () {
        if (audio.paused) {
          audio.play().then(function () {
            play.textContent = 'Ⅱ  Pause Peasamaley';
            play.setAttribute('aria-pressed', 'true');
          }).catch(function () {
            note.textContent = 'Tap the music button once more to play the song.';
          });
        } else {
          audio.pause();
          play.textContent = '▶  Play Peasamaley';
          play.setAttribute('aria-pressed', 'false');
        }
      } }
    }, '▶  Play Peasamaley');
    audio.addEventListener('ended', function () {
      play.textContent = '▶  Play Peasamaley';
      play.setAttribute('aria-pressed', 'false');
    });
    frame.appendChild(sketch);
    frame.appendChild(img);
    root.appendChild(glow);
    root.appendChild(frame);
    root.appendChild(kicker);
    root.appendChild(title);
    root.appendChild(note);
    root.appendChild(play);
    ctx.ui.appendChild(root);
    // Start the pencil-to-portrait reveal after the scene mounts.
    requestAnimationFrame(function () { root.classList.add('myworld-start'); });
    return { unmount: function () {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    } };
  }
});
