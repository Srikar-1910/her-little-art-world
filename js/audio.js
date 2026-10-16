/* ============================================================
   AUDIO — gentle sound, entirely optional.

   Two layers:
     1. SFX     soft chimes, page turns, water, etc. These are
                SYNTHESISED in the browser with the Web Audio API,
                so they need no files and cannot go missing.
     2. Ambient an optional looping file (assets/audio/background.mp3).
                If it isn't there, nothing happens and nothing breaks.

   Voice recordings are played by the Listening Corner itself; it
   calls Sound.duck(true) so the ambience steps back while she listens.

   Browsers block sound until the visitor interacts, so everything
   wakes up on the first tap or key press (Sound.unlock()).

   API
     Sound.init()          read saved preference
     Sound.unlock()        call from a user gesture
     Sound.isOn()  Sound.toggle()  Sound.setOn(bool)
     Sound.sfx('chime'|'bloom'|'page'|'seal'|'pop'|'splash'|
               'sparkle'|'squeeze'|'pull'|'tick'|'wish')
     Sound.duck(true|false)
   ============================================================ */

const Sound = (function () {
  'use strict';

  const cfg = CONFIG.audio;
  let ac = null, master = null, noiseBuf = null;
  let ambient = null, ambientOk = true;
  let on = true, unlocked = false, ducked = false, fadeTimer = null;

  /* ---------- web audio plumbing ---------- */
  function ensureCtx() {
    if (ac) return ac;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = cfg.sfxVolume;
      master.connect(ac.destination);
    } catch (e) { ac = null; }
    return ac;
  }

  function tone(freq, t, dur, type, vol, glideTo) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(t, dur, vol, filterType, f1, f2) {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = filterType || 'bandpass';
    f.frequency.setValueAtTime(f1 || 1500, t);
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
  }

  const SFX = {
    chime(t)   { tone(784, t, 1.4, 'sine', 0.22); tone(1175, t + 0.02, 1.1, 'sine', 0.10); tone(1568, t + 0.04, 0.8, 'sine', 0.05); },
    bloom(t)   { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.07, 0.9, 'sine', 0.13); }); },
    page(t)    { noise(t, 0.16, 0.20, 'bandpass', 2800, 1200); },
    seal(t)    { tone(110, t, 0.18, 'sine', 0.30, 60); noise(t, 0.09, 0.15, 'highpass', 3000, 5000); },
    pop(t)     { tone(520, t, 0.12, 'sine', 0.20, 880); },
    splash(t)  { noise(t, 0.55, 0.20, 'bandpass', 900, 380); },
    sparkle(t) { for (let i = 0; i < 4; i++) tone(1400 + Math.random() * 1500, t + i * 0.06, 0.35, 'sine', 0.07); },
    squeeze(t) { noise(t, 0.22, 0.13, 'lowpass', 900, 300); tone(180, t, 0.2, 'sine', 0.10, 120); },
    pull(t)    { tone(300, t, 0.16, 'triangle', 0.12, 190); },
    tick(t)    { tone(1200, t, 0.05, 'square', 0.035); },
    wish(t)    { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, t + i * 0.16, 1.6, 'sine', 0.11); }); }
  };

  /* ---------- ambient file ---------- */
  function buildAmbient() {
    if (ambient || !cfg.ambient) return;
    try {
      ambient = new Audio();
      ambient.loop = true;
      ambient.preload = 'auto';
      ambient.volume = 0;
      ambient.addEventListener('error', function () { ambientOk = false; ambient = null; }, { once: true });
      ambient.src = cfg.ambient;
    } catch (e) { ambient = null; ambientOk = false; }
  }

  function fadeTo(target, ms) {
    if (!ambient) return;
    clearInterval(fadeTimer);
    const from = ambient.volume, steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    fadeTimer = setInterval(function () {
      i++;
      if (!ambient) { clearInterval(fadeTimer); return; }
      ambient.volume = Math.min(1, Math.max(0, from + (target - from) * (i / steps)));
      if (i >= steps) {
        clearInterval(fadeTimer);
        if (target === 0) { try { ambient.pause(); } catch (e) { /* ignore */ } }
      }
    }, 50);
  }

  function ambientTarget() { return ducked ? cfg.ambientDucked : cfg.ambientVolume; }

  function startAmbient() {
    if (!cfg.enabled || !ambientOk) return;
    buildAmbient();
    if (!ambient) return;
    const p = ambient.play();
    if (p && p.catch) p.catch(function () { /* blocked or missing: ignore */ });
    fadeTo(ambientTarget(), 2200);
  }

  document.addEventListener('visibilitychange', function () {
    if (!ambient) return;
    if (document.hidden) { try { ambient.pause(); } catch (e) { /* ignore */ } }
    else if (on && unlocked) { const p = ambient.play(); if (p && p.catch) p.catch(function () { /* ignore */ }); }
  });

  /* ---------- public ---------- */
  return {
    init() {
      const saved = Store.flag('sound');
      on = saved === undefined ? true : !!saved;
      if (!cfg.enabled) on = false;
      return this;
    },

    // Call from any user gesture. Safe to call many times.
    unlock() {
      if (!cfg.enabled) return;
      ensureCtx();
      if (ac && ac.state === 'suspended') { ac.resume().catch(function () { /* ignore */ }); }
      if (!unlocked) {
        unlocked = true;
        if (on) startAmbient();
      }
    },

    isOn() { return on && cfg.enabled; },

    setOn(v) {
      on = !!v && cfg.enabled;
      Store.flag('sound', on);
      if (on) { if (unlocked) startAmbient(); }
      else fadeTo(0, 500);
      return on;
    },

    toggle() { return this.setOn(!on); },

    sfx(name) {
      if (!on || !cfg.enabled || !cfg.sfx) return;
      if (!ensureCtx()) return;
      try {
        if (ac.state === 'suspended') ac.resume();
        if (SFX[name]) SFX[name](ac.currentTime + 0.005);
      } catch (e) { /* never break the page for a sound */ }
    },

    duck(v) {
      ducked = !!v;
      if (ambient && on) fadeTo(ambientTarget(), 900);
    }
  };
})();
