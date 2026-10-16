/* ============================================================
   SCENE: THE LISTENING CORNER (optional)
   A radio dial chooses a voice note. A SEPARATE play button plays
   it. Nothing ever plays by itself. The waveform draws only while
   something is playing. A missing file shows a quiet "waiting for
   a voice" line instead of an error. Transcripts are one tap away.
   ============================================================ */

Router.register('listening', {
  title: 'The Listening Corner',
  mood: 'listening',

  mount: function (ctx) {
    const h = UI.h;
    const R = Rooms.open(ctx, 'listening', 'A rainy-night corner with an armchair, a lamp and a small radio', RECORDINGS.title, RECORDINGS.line);
    const p = R.p;
    const voices = Content.voices();
    let sel = 0, audio = null, playing = false, missing = {}, found = {}, raf = 0, t0 = 0;

    const knob = h('div', { class: 'knob', 'aria-hidden': 'true' }, h('span', { class: 'tick' }));
    const stations = h('div', { class: 'stations', role: 'radiogroup', 'aria-label': 'Choose a voice' });
    const sbtn = [];
    voices.forEach(function (v, i) {
      const b = h('button', { class: 'station', type: 'button', role: 'radio', 'aria-checked': String(i === 0), 'aria-label': v.label,
        on: { click: function () { choose(i); } } }, String(i + 1));
      sbtn.push(b); stations.appendChild(b);
    });
    stations.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose((sel + 1) % voices.length); sbtn[sel].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose((sel + voices.length - 1) % voices.length); sbtn[sel].focus(); }
    });

    const label = h('p', { class: 'radio-label' });
    const wave = h('canvas', { class: 'wave', width: 520, height: 80, role: 'img', 'aria-label': 'Waveform' });
    const status = h('p', { class: 'wave-status', 'aria-live': 'polite' });
    const play = h('button', { class: 'btn play', type: 'button', 'aria-label': 'Play', on: { click: toggle } }, h('span', { class: 'ico', 'aria-hidden': 'true' }, '▶'), h('span', { class: 'txt' }, 'Play'));
    const tbtn = h('button', { class: 'text-btn', type: 'button', 'aria-expanded': 'false', on: { click: function () {
      const open = trans.hidden; trans.hidden = !open; tbtn.setAttribute('aria-expanded', String(open)); tbtn.textContent = open ? 'Hide transcript' : 'Show transcript';
    } } }, 'Show transcript');
    const trans = h('div', { class: 'transcript', hidden: true });
    const panel = h('div', { class: 'radio-panel' }, h('div', { class: 'dial' }, knob, stations), label, wave, status, h('div', { class: 'radio-row' }, play, tbtn), trans);
    if (voices.length) ctx.ui.appendChild(panel);
    else ctx.ui.appendChild(h('p', { class: 'room-empty' }, 'No voices yet. The radio is waiting.'));

    function probe(v) {
      if (v.id in missing) return Promise.resolve(!missing[v.id]);
      return new Promise(function (res) {
        const files = [v.m4a, v.mp3].filter(Boolean);
        let k = 0, done = false;
        const fin = function (ok) { if (done) return; done = true; missing[v.id] = !ok; res(ok); };
        (function next() {
          if (k >= files.length) return fin(false);
          const a = new Audio(); a.preload = 'metadata';
          a.addEventListener('loadedmetadata', function () { found[v.id] = files[k]; fin(true); }, { once: true });
          a.addEventListener('error', function () { k++; next(); }, { once: true });
          a.src = files[k];
        })();
        setTimeout(function () { fin(false); }, 3500);
      });
    }

    function stop(silent) {
      if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } }
      playing = false; Sound.duck(false);
      play.querySelector('.ico').textContent = '▶'; play.querySelector('.txt').textContent = 'Play'; play.setAttribute('aria-label', 'Play');
      cancelAnimationFrame(raf); drawWave(false);
    }

    function choose(i) {
      stop(); sel = i;
      sbtn.forEach(function (b, k) { b.setAttribute('aria-checked', String(k === i)); });
      const rot = voices.length > 1 ? -50 + (100 * i) / (voices.length - 1) : 0;
      knob.style.transform = 'rotate(' + rot + 'deg)';
      const v = voices[i];
      label.textContent = v.label;
      trans.textContent = v.transcript || '';
      tbtn.hidden = !v.transcript;
      if (!v.transcript) { trans.hidden = true; }
      const st = UI.stamp(v); if (st) { label.appendChild(document.createTextNode(' ')); label.appendChild(st); }
      status.textContent = '';
      play.disabled = true; play.setAttribute('aria-disabled', 'true');
      audio = null; drawWave(false);
      p.bloom('radio', 1, 1200); Sound.sfx('tick');
      probe(v).then(function (ok) {
        if (v !== voices[sel]) return;
        if (!ok) { status.textContent = RECORDINGS.waiting; play.title = RECORDINGS.waiting; drawWave(false); return; }
        play.disabled = false; play.removeAttribute('aria-disabled'); play.title = '';
        status.textContent = '';
        audio = new Audio(); audio.preload = 'none';
        audio.src = found[v.id];
        audio.addEventListener('ended', function () { stop(); p.bloom('chair', 1, 1800); p.light(1, 2600); });
        audio.addEventListener('error', function () { stop(); status.textContent = RECORDINGS.waiting; drawWave(false); });
      });
    }

    function toggle() {
      if (!audio) return;
      Sound.unlock();
      if (playing) { stop(); return; }
      const pr = audio.play();
      const started = function () {
        playing = true; Sound.duck(true); t0 = performance.now();
        play.querySelector('.ico').textContent = '❚❚'; play.querySelector('.txt').textContent = 'Pause'; play.setAttribute('aria-label', 'Pause');
        p.bloom('lamp', 1, 1600); p.light(0.6, 2400); p.bloom('window', 0.8, 2400);
        loop();
      };
      if (pr && pr.then) pr.then(started).catch(function () { status.textContent = RECORDINGS.waiting; }); else started();
    }

    /* the waveform draws only while playing; otherwise a quiet dashed line */
    const g = wave.getContext('2d');
    function drawWave(live) {
      const W = wave.width, H = wave.height; g.clearRect(0, 0, W, H);
      g.lineCap = 'round'; g.strokeStyle = live ? '#8a5a1a' : 'rgba(58,42,58,.45)'; g.lineWidth = live ? 3 : 2;
      if (!live) { g.setLineDash([6, 8]); g.beginPath(); g.moveTo(10, H / 2); g.lineTo(W - 10, H / 2); g.stroke(); g.setLineDash([]); return; }
      const t = (performance.now() - t0) / 1000;
      for (let x = 12; x < W - 8; x += 9) {
        const env = 0.35 + 0.65 * Math.abs(Math.sin(x * 0.011 + t * 1.7) * Math.sin(x * 0.037 - t * 2.3 + 1.1));
        const hgt = 4 + env * (H * 0.42) * (0.6 + 0.4 * Math.sin(t * 5 + x * 0.2));
        g.beginPath(); g.moveTo(x, H / 2 - hgt); g.lineTo(x, H / 2 + hgt); g.stroke();
      }
    }
    function loop() { if (!playing) return; drawWave(true); raf = requestAnimationFrame(loop); }

    if (voices.length) choose(0);
    p.ready.then(function () { p.bloom('radio', 0.7, 1800); p.bloom('window', 0.35, 1800); });
    return { unmount: function () { stop(true); audio = null; cancelAnimationFrame(raf); p.destroy(); } };
  }
});
