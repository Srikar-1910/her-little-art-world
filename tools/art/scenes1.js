/* Entrance + main world concept art */
(function () {
  const { COL, rng, mix, smooth, blobPts, paint, pencil, brokenDash, hatch, ridge, glow, beam, dust, stars, hand, scribble, tape, vignette, tree, flower, grass, cottage, f, nid } = P;

  function cr(pts, t) {
    const n = pts.length - 1, i = Math.min(Math.floor(t * n), n - 1), u = t * n - i;
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n)];
    const q = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])];
  }
  function strip(pts, w0, w1, N = 70) {
    const L = [], R = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = cr(pts, t), q = cr(pts, Math.min(1, t + 0.01)), q0 = cr(pts, Math.max(0, t - 0.01));
      const tx = q[0] - q0[0], ty = q[1] - q0[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
      const w = (w0 + (w1 - w0) * Math.pow(t, 0.85)) / 2;
      L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
    }
    return { L, R, d: smooth(L.concat(R.reverse()), true), dl: smooth(L, false), dr: smooth(R.slice().reverse(), false) };
  }
  const lineD = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');

  function titleText(text, x, y, size, o = {}) {
    if (P.FLAGS.noText) return '';
    const { fill = '#FFE9B0', under = COL.rose, anchor = 'middle', rot = -2, outline = COL.graphite } = o;
    const fam = "'TeX Gyre Chorus','Lora',serif";
    const t = (dx, dy, fl, st, sw, op, flt) => `<text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" font-family="${fam}" font-size="${size}" font-style="italic" fill="${fl}" stroke="${st}" stroke-width="${sw}" opacity="${op}" filter="${flt}" transform="rotate(${rot} ${x} ${y})">${text}</text>`;
    return t(3.5, 3, under, 'none', 0, 0.8, 'url(#washL)') + t(0, 0, fill, 'none', 0, 0.97, 'url(#rough)') + t(-0.6, -0.5, 'none', outline, 0.9, 0.55, 'url(#rough)');
  }
  function paperTag(r, x, y, text, size = 18, o = {}) {
    if (P.FLAGS.noText) return '';
    const { rot = -3, w = text.length * size * 0.5 + 34, h = size * 1.9, col = COL.cream, glowing = false } = o;
    const pts = [[0, 0], [w * 0.5, -1.5], [w, 1], [w + 3, h * 0.5], [w, h], [w * 0.5, h + 1.5], [0, h - 1], [-3, h * 0.5]];
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
${glowing ? glow(w / 2, h / 2, w * 0.8, COL.glow, 0.5) : ''}
<path d="${smooth(pts)}" fill="${COL.ink}" opacity=".28" transform="translate(3 4)" filter="url(#b2)"/>
<path d="${smooth(pts)}" fill="${col}" opacity=".97" filter="url(#washL)"/>
<path d="${smooth(pts)}" fill="none" stroke="${COL.graphite}" stroke-width="1" opacity=".5" filter="url(#rough)"/>
<text x="${w / 2}" y="${h * 0.66}" text-anchor="middle" font-family="'TeX Gyre Chorus','Lora',serif" font-style="italic" font-size="${size}" fill="${COL.graphite}" opacity=".9" filter="url(#rough)">${text}</text>
${tape(w / 2 - 20, -9, 40, 15, -4)}</g>`;
  }
  function stones(r, x0, y0, w, h, base, o = {}) {
    const { rowH = 34, lightX = null, lightR = 300, warm = COL.lamp } = o;
    let s = '';
    for (let y = y0, row = 0; y < y0 + h; y += rowH, row++) {
      let x = x0 - (row % 2 ? rowH * 0.9 : 0);
      while (x < x0 + w) {
        const sw = rowH * (1.4 + r() * 1.3), sh = rowH * (0.82 + r() * 0.2);
        let c = mix(base, [COL.plum, COL.teal, COL.ink, COL.lav][Math.floor(r() * 4)], 0.18 + r() * 0.3);
        if (lightX) { const d = Math.hypot(x + sw / 2 - lightX[0], y - lightX[1]); const k = Math.max(0, 1 - d / lightR); c = mix(c, warm, k * 0.55); }
        const pts = [[x + 2, y + 2], [x + sw - 2, y + 1], [x + sw - 1, y + sh - 2], [x + 3, y + sh - 1]].map((p) => [p[0] + (r() - 0.5) * 3, p[1] + (r() - 0.5) * 3]);
        s += `<path d="${smooth(pts)}" fill="${c}" opacity=".92" filter="url(#washL)"/>`;
        s += pencil(smooth(pts), { w: 0.9, op: 0.28, dash: brokenDash(r, 3) });
        x += sw;
      }
    }
    return s;
  }
  function ivy(r, x, y, len, dir, o = {}) {
    const { sz = 1, cols = [COL.moss, COL.leafDark, COL.sage, '#7d9a6a'], roses = true } = o;
    let s = '';
    let px = x, py = y, vine = `M${f(px)} ${f(py)}`;
    const leaves = [];
    for (let i = 0; i < len; i++) {
      px += dir[0] * (4 + r() * 4) + (r() - 0.5) * 7; py += dir[1] * (4 + r() * 4) + (r() - 0.5) * 5;
      vine += `L${f(px)} ${f(py)}`;
      leaves.push([px, py]);
    }
    s += pencil(vine, { w: 1.4, op: 0.5, col: COL.leafDark });
    leaves.forEach((p, i) => {
      const k = 6 * sz * (0.8 + r() * 0.9);
      const pts = blobPts(r, p[0] + (r() - 0.5) * 8, p[1] + (r() - 0.5) * 8, k * 1.2, k, 6, 0.3);
      s += paint(r, pts, cols[i % cols.length], { op: 0.88, size: k * 2, shade: 0.4, hi: 0.3 });
      if (roses && r() < 0.1) { const rp = blobPts(r, p[0] + 6, p[1], 7 * sz, 7 * sz, 6, 0.25); s += paint(r, rp, [COL.rose, COL.peach][i % 2], { op: 0.92, size: 14 }); s += pencil(smooth(rp), { w: 0.8, op: 0.5 }); }
    });
    return s;
  }
  function lantern(r, x, y, s = 1, col = COL.lamp) {
    return `${pencil(`M${x} ${f(y - 60 * s)}L${x} ${f(y - 14 * s)}`, { w: 1.2, op: 0.7 })}
<path d="${smooth([[x - 9 * s, y - 14 * s], [x + 9 * s, y - 14 * s], [x + 12 * s, y + 10 * s], [x - 12 * s, y + 10 * s]])}" fill="${col}" opacity=".95" filter="url(#washL)"/>
${pencil(`M${f(x - 9 * s)} ${f(y - 14 * s)}L${f(x + 9 * s)} ${f(y - 14 * s)}L${f(x + 12 * s)} ${f(y + 10 * s)}L${f(x - 12 * s)} ${f(y + 10 * s)}Z M${f(x)} ${f(y - 14 * s)}V${f(y + 10 * s)}`, { w: 1.2, op: 0.7 })}
${glow(x, y - 2 * s, 90 * s, col, 0.9)}${glow(x, y - 2 * s, 28 * s, '#fff0c0', 0.9)}`;
  }

  /* ============ ENTRANCE ============ */
  function entrance(W, H, seed = 5) {
    const r = rng(seed), P_ = H > W;
    const cx = W * 0.5, base = H * (P_ ? 0.76 : 0.80);
    const dw = P_ ? 170 : 220, dh = P_ ? 250 : 330;
    let s = `<linearGradient id="enSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1640"/><stop offset=".55" stop-color="#2d2a5c"/><stop offset="1" stop-color="#4a3a6c"/></linearGradient>
<rect width="${W}" height="${H}" fill="url(#enSky)"/>`;
    // sky washes + stars + moon
    for (let i = 0; i < 5; i++) s += `<path d="${smooth(blobPts(r, r() * W, H * 0.08 + r() * H * 0.1, W * 0.3, H * 0.06, 8, 0.25))}" fill="${[COL.teal, COL.lav, COL.plum, COL.deepTeal, COL.rose][i]}" opacity=".22" filter="url(#wash)"/>`;
    s += stars(r, 0, 0, W, H * 0.25, P_ ? 40 : 90);
    s += glow(W * (P_ ? 0.8 : 0.84), H * 0.1, 60, '#ffe7b0', 0.55) + `<circle cx="${W * (P_ ? 0.8 : 0.84)}" cy="${H * 0.1}" r="${P_ ? 15 : 20}" fill="#fff0c4" opacity=".92" filter="url(#washL)"/>`;
    // far tree line behind wall
    const rd = ridge(r, W, H * 0.24, 22, 0.012, 2, H, 30);
    s += `<path d="${rd.d}" fill="${COL.deepTeal}" opacity=".85" filter="url(#wash)"/>`;
    // wall
    const wallTop = H * (P_ ? 0.3 : 0.27);
    s += `<rect x="-20" y="${wallTop}" width="${W + 40}" height="${H}" fill="#2c2850" filter="url(#washL)"/>`;
    s += stones(r, -20, wallTop, W + 40, base - wallTop + 10, '#2b2650', { rowH: P_ ? 30 : 38, lightX: [cx, base - dh * 0.4], lightR: P_ ? 230 : 400 });
    // wall cap
    s += `<path d="${smooth([[-20, wallTop - 4], [W * 0.25, wallTop - 8], [W * 0.5, wallTop - 5], [W * 0.75, wallTop - 9], [W + 20, wallTop - 4], [W + 20, wallTop + 14], [-20, wallTop + 14]])}" fill="${COL.paper3}" opacity=".5" filter="url(#wash)"/>`;
    // arch stones
    const ay = base - dh;
    const arch = (k) => { let d = `M${f(cx - dw / 2 - k)} ${f(base)}L${f(cx - dw / 2 - k)} ${f(ay + dw * 0.5)}`; for (let i = 1; i <= 14; i++) { const a = Math.PI - (i / 14) * Math.PI; d += `L${f(cx + Math.cos(a) * (dw / 2 + k))} ${f(ay + dw * 0.5 - Math.sin(a) * (dw / 2 + k))}`; } return d + `L${f(cx + dw / 2 + k)} ${f(base)}`; };
    s += `<path d="${arch(26)}Z" fill="#5a4f7e" opacity=".9" filter="url(#wash)"/>`;
    // door interior glow
    s += `<radialGradient id="enDoor" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#fff2c4"/><stop offset=".45" stop-color="#ffc673"/><stop offset="1" stop-color="#e58b52"/></radialGradient>
<path d="${arch(0)}Z" fill="url(#enDoor)" filter="url(#washL)"/>`;
    // interior hint: silhouettes of a plant and hanging lamp inside
    s += `<g opacity=".55"><path d="${smooth([[cx - dw * 0.22, base], [cx - dw * 0.3, base - dh * 0.35], [cx - dw * 0.12, base - dh * 0.28], [cx - dw * 0.05, base]])}" fill="#8b4a3c" filter="url(#washL)"/>${hatch(r, cx - dw * 0.3, base - dh * 0.5, dw * 0.55, dh * 0.4, { op: 0.2, ang: -20, col: '#7a3b34' })}</g>`;
    // door leaf swung open (left), foreshortened
    s += `<path d="${smooth([[cx - dw / 2, base], [cx - dw / 2, ay + dw * 0.5], [cx - dw / 2 - dw * 0.34, ay + dw * 0.5 + 18], [cx - dw / 2 - dw * 0.34, base - 12]])}" fill="${COL.wood}" opacity=".95" filter="url(#wash)"/>`;
    s += `<path d="${smooth([[cx - dw / 2 - dw * 0.12, base - 6], [cx - dw / 2 - dw * 0.12, ay + dw * 0.55 + 20], [cx - dw / 2 - dw * 0.3, ay + dw * 0.52 + 22], [cx - dw / 2 - dw * 0.3, base - 14]])}" fill="${mix(COL.wood, COL.plum, 0.5)}" opacity=".5" filter="url(#washL)"/>`;
    s += pencil(`M${f(cx - dw / 2)} ${f(base)}L${f(cx - dw / 2)} ${f(ay + dw * 0.5)}L${f(cx - dw / 2 - dw * 0.34)} ${f(ay + dw * 0.5 + 18)}L${f(cx - dw / 2 - dw * 0.34)} ${f(base - 12)}Z`, { w: 1.4, op: 0.7 });
    s += pencil(`M${f(cx - dw / 2 - dw * 0.17)} ${f(ay + dw * 0.5 + 10)}V${f(base - 10)}`, { w: 1, op: 0.45 });
    s += pencil(arch(26), { w: 1.6, op: 0.65 });
    s += pencil(arch(0), { w: 1.2, op: 0.5 });
    // arch voussoir marks
    let vm = '';
    for (let i = 1; i < 13; i++) { const a = Math.PI - (i / 13) * Math.PI, c = Math.cos(a), sn = Math.sin(a); vm += `M${f(cx + c * dw / 2)} ${f(ay + dw * 0.5 - sn * dw / 2)}L${f(cx + c * (dw / 2 + 26))} ${f(ay + dw * 0.5 - sn * (dw / 2 + 26))}`; }
    s += pencil(vm, { w: 0.9, op: 0.35 });
    // ivy + roses
    s += ivy(r, cx - dw / 2 - 40, base, 38, [0.35, -1.5], { sz: 1.2 });
    s += ivy(r, cx + dw / 2 + 36, base, 40, [-0.25, -1.4], { sz: 1.2 });
    s += ivy(r, cx - dw / 2 - 20, ay + dw * 0.5, 24, [0.9, -0.6], { sz: 1.1 });
    s += ivy(r, cx + dw / 2 + 10, ay + dw * 0.5 - 20, 24, [-0.8, -0.8], { sz: 1.1 });
    // lantern
    const lx = cx + dw / 2 + (P_ ? 56 : 100), ly = base - dh * 0.62;
    P.anchor('door', cx, base - dh * 0.45, dh * 0.7); P.anchor('lantern', lx, ly, 120); P.anchor('step', cx, base + 60, 160);
    s += lantern(r, lx, ly, P_ ? 1 : 1.25);
    // ground
    s += `<path d="${smooth([[-30, base - 4], [W * 0.3, base + 6], [W * 0.7, base + 2], [W + 30, base + 8], [W + 30, H + 20], [-30, H + 20]], true)}" fill="#2a2349" filter="url(#wash)"/>`;
    for (let i = 0; i < (P_ ? 70 : 150); i++) {
      const gy = base + 8 + r() * (H - base - 4);
      const t = (gy - base) / (H - base);
      const gx = r() * W, gw = 16 + t * 36 + r() * 12, gh = gw * 0.5;
      const near = Math.max(0, 1 - Math.hypot((gx - cx) / (W * 0.4), (gy - base) / (H * 0.3)));
      const c = mix(mix(COL.plum, COL.teal, r() * 0.5), COL.lamp, near * 0.6);
      const pts = blobPts(r, gx, gy, gw, gh, 7, 0.15);
      s += `<path d="${smooth(pts)}" fill="${c}" opacity=".85" filter="url(#washL)"/>`;
      if (r() < 0.6) s += pencil(smooth(pts), { w: 0.9, op: 0.3, dash: brokenDash(r, 3) });
    }
    // light spill on ground + beams
    s += `<polygon points="${cx - dw * 0.45},${base} ${cx + dw * 0.45},${base} ${cx + W * (P_ ? 0.32 : 0.26)},${H} ${cx - W * (P_ ? 0.32 : 0.26)},${H}" fill="${COL.lamp}" opacity=".5" filter="url(#b28)" class="lt" style="mix-blend-mode:screen"/>`;
    s += `<polygon points="${cx - dw * 0.3},${base} ${cx + dw * 0.3},${base} ${cx + dw * 0.9},${H} ${cx - dw * 0.9},${H}" fill="#ffe9ae" opacity=".45" filter="url(#b12)" class="lt" style="mix-blend-mode:screen"/>`;
    s += glow(cx, base - dh * 0.4, dh * 1.1, COL.lamp, 0.55);
    s += beam(cx - dw * 0.1, base - dh * 0.6, cx - dw * 1.5, base + 90, dw * 0.35, '#ffd89a', 0.28);
    s += beam(cx + dw * 0.15, base - dh * 0.6, cx + dw * 1.6, base + 70, dw * 0.3, '#ffd89a', 0.22);
    s += dust(r, cx - dw * 1.2, base - dh * 0.8, dw * 2.4, dh * 1.1, P_ ? 26 : 46);
    // foreground leaves (dark frame)
    const fg = (x, y, k, a) => { let o = ''; for (let i = 0; i < 7; i++) { const ang = a + (i - 3) * 0.28, L = k * (0.7 + r() * 0.5); const tx = x + Math.cos(ang) * L, ty = y + Math.sin(ang) * L; const pts = [[x, y], [x + Math.cos(ang - 0.18) * L * 0.55, y + Math.sin(ang - 0.18) * L * 0.55], [tx, ty], [x + Math.cos(ang + 0.18) * L * 0.55, y + Math.sin(ang + 0.18) * L * 0.55]]; o += `<path d="${smooth(pts)}" fill="${mix('#14102c', COL.leafDark, 0.25 + r() * 0.2)}" opacity=".96" filter="url(#wash)"/>` + pencil(`M${f(x)} ${f(y)}L${f(tx)} ${f(ty)}`, { w: 0.9, op: 0.25, col: '#8aa' }); } return o; };
    s += fg(-10, H + 10, H * 0.34, -1.0) + fg(W + 10, H + 10, H * 0.34, -2.15);
    s += vignette(W, H, 0.62, '#0d0a20', 0.5, 0.55);
    // greeting
    if (P_) {
      s += titleText('Happy Birthday', cx, H * 0.15, 46, { rot: -2 });
      s += hand('[ her name ]', cx, H * 0.15 + 36, 24, { anchor: 'middle', fill: '#f6e3b8', rot: -1.5, op: 0.9 });
    } else {
      s += titleText('Happy Birthday', cx, H * 0.17, 84, { rot: -2 });
      s += hand('[ her name ]', cx, H * 0.17 + 58, 36, { anchor: 'middle', fill: '#f6e3b8', rot: -1.5, op: 0.92 });
    }
    s += paperTag(r, cx - (P_ ? 56 : 74), base + (P_ ? 40 : 50), 'step inside', P_ ? 20 : 24, { glowing: true, rot: -2, col: '#f6ecd2' });
    if (!P_) s += hand('the door’s already open…', W * 0.08, H * 0.64, 22, { rot: -6, fill: '#e8d8b8', op: 0.7 });
    return s;
  }

  /* ============ WORLD ============ */
  function world(W, H, seed = 9) {
    const r = rng(seed), P_ = H > W;
    let s = `<linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c78a6"/><stop offset=".3" stop-color="#b79db8"/><stop offset=".55" stop-color="#f1b99a"/><stop offset=".72" stop-color="#f7d3a2"/><stop offset="1" stop-color="#f3dcb5"/></linearGradient>
<rect width="${W}" height="${H}" fill="url(#wSky)"/>`;
    // painted sky washes + dry-brush clouds
    for (let i = 0; i < 7; i++) s += `<path d="${smooth(blobPts(r, r() * W, H * (0.05 + r() * 0.3), W * (0.18 + r() * 0.14), H * 0.035, 8, 0.25))}" fill="${[COL.lav, COL.rose, COL.peach, '#fff1d0', COL.teal][i % 5]}" opacity="${0.3 + r() * 0.25}" filter="url(#wash)"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="${smooth(blobPts(r, r() * W, H * (0.12 + r() * 0.3), W * 0.2, H * 0.014, 8, 0.2))}" fill="#fff4dc" opacity=".6" filter="url(#dry)"/>`;
    const sunX = W * (P_ ? 0.62 : 0.56), sunY = H * (P_ ? 0.36 : 0.4);
    s += glow(sunX, sunY, W * 0.5, '#ffd89a', 0.85) + glow(sunX, sunY, W * 0.16, '#fff3c8', 0.9);
    // hills (far -> near) with haze between
    const layers = [
      { y: 0.40, amp: 22, c: mix(COL.lav, COL.peach, 0.55), fq: 0.007 },
      { y: 0.47, amp: 26, c: mix(COL.lav, COL.sage, 0.4), fq: 0.009 },
      { y: 0.56, amp: 30, c: mix(COL.sage, COL.lav, 0.25), fq: 0.008 },
      { y: 0.66, amp: 28, c: COL.sage, fq: 0.011 },
      { y: 0.78, amp: 24, c: COL.moss, fq: 0.012 }
    ];
    const R = layers.map((l, i) => ridge(r, W, H * l.y, l.amp, l.fq, i * 1.7 + 0.5, H, 36));
    layers.forEach((l, i) => {
      s += `<path d="${R[i].d}" fill="${l.c}" opacity=".95" filter="url(#wash)"/>`;
      s += `<path d="${R[i].d}" fill="${mix(l.c, COL.plum, 0.5)}" opacity=".22" filter="url(#washL)" transform="translate(${(i % 2 ? 18 : -22)} 20)"/>`;
      s += pencil(R[i].line, { w: 1.1, op: 0.3, dash: brokenDash(r, 6) });
      s += `<rect x="0" y="${H * l.y - 10}" width="${W}" height="${H * 0.1}" fill="#ffe6bb" opacity="${0.22}" filter="url(#b28)" class="lt" style="mix-blend-mode:screen"/>`;
    });
    s += hatch(r, 0, H * 0.56, W, H * 0.12, { gap: 9, ang: 55, op: 0.1 });
    // path
    const pp = P_
      ? [[W * 0.45, H + 10], [W * 0.62, H * 0.9], [W * 0.3, H * 0.8], [W * 0.62, H * 0.66], [W * 0.38, H * 0.55], [W * 0.6, H * 0.44], [W * 0.5, H * 0.3]]
      : [[W * 0.44, H + 10], [W * 0.52, H * 0.9], [W * 0.3, H * 0.82], [W * 0.4, H * 0.7], [W * 0.62, H * 0.66], [W * 0.5, H * 0.58], [W * 0.5, H * 0.46], [W * 0.5, H * 0.38]];
    const st = strip(pp, P_ ? 70 : 120, 5);
    s += `<path d="${st.d}" fill="#f8e2b4" opacity=".92" filter="url(#wash)"/>`;
    s += `<path d="${st.d}" fill="${COL.peach}" opacity=".3" filter="url(#washL)" transform="translate(6 3)"/>`;
    s += pencil(st.dl, { w: 1.2, op: 0.45, dash: brokenDash(r, 9) }) + pencil(st.dr, { w: 1.2, op: 0.45, dash: brokenDash(r, 9) });
    for (let i = 0; i < 60; i++) { const t = r() * 0.95, p = cr(pp, t); s += `<ellipse cx="${f(p[0] + (r() - 0.5) * (P_ ? 70 : 120) * (1 - t))}" cy="${f(p[1])}" rx="${f(7 * (1 - t) + 2)}" ry="${f(3.2 * (1 - t) + 1)}" fill="${COL.paper3}" opacity=".5" filter="url(#washL)"/>`; }
    // places
    const pl = P_
      ? { reveal: [0.5, 0.29], studio: [0.62, 0.43], gallery: [0.8, 0.54], listen: [0.22, 0.52], garden: [0.26, 0.69], desk: [0.7, 0.8] }
      : { reveal: [0.5, 0.375], studio: [0.64, 0.62], gallery: [0.83, 0.64], listen: [0.37, 0.64], garden: [0.17, 0.77], desk: [0.78, 0.84] };
    const px = (k) => [pl[k][0] * W, pl[k][1] * H];
    Object.keys(pl).forEach((k) => P.anchor(k, pl[k][0] * W, pl[k][1] * H - (k === 'reveal' ? 10 : 30), (P_ ? 150 : 200)));
    // reveal: hilltop gate & lantern (the only gold)
    { const [x, y] = px('reveal'); const k = P_ ? 0.8 : 1;
      s += `<path d="${smooth([[x - 18 * k, y + 2], [x - 18 * k, y - 26 * k], [x, y - 40 * k], [x + 18 * k, y - 26 * k], [x + 18 * k, y + 2]], false)}" fill="none" stroke="${COL.graphite}" stroke-width="2.2" opacity=".7" filter="url(#rough)"/>`;
      s += glow(x, y - 14 * k, 70 * k, COL.glow, 0.95) + glow(x, y - 14 * k, 18 * k, '#fff6d6', 1);
      s += beam(x, y - 14 * k, x, y + 60, 26 * k, '#ffe7a8', 0.28); }
    // listening: tree + bench + lantern
    { const [x, y] = px('listen'); const k = P_ ? 0.7 : 0.95;
      s += tree(r, x, y, 150 * k, { leaf: [COL.teal, COL.moss, COL.sage], dark: COL.deepTeal });
      s += `<path d="${smooth([[x + 10 * k, y + 2], [x + 62 * k, y], [x + 62 * k, y - 8 * k], [x + 10 * k, y - 8 * k]])}" fill="${COL.wood}" opacity=".95" filter="url(#washL)"/>` + pencil(`M${f(x + 10 * k)} ${f(y - 8 * k)}H${f(x + 62 * k)}M${f(x + 16 * k)} ${f(y - 8 * k)}V${f(y + 10 * k)}M${f(x + 56 * k)} ${f(y - 8 * k)}V${f(y + 10 * k)}`, { w: 1.2, op: 0.65 });
      s += lantern(r, x + 36 * k, y - 62 * k, 0.8 * k); }
    // studio cottage
    { const [x, y] = px('studio'); s += cottage(r, x, y, P_ ? 0.75 : 1.15, { roof: COL.rose, wall: '#f1dcb6' }); s += glow(x, y - 40, 150, COL.lamp, 0.4); }
    // gallery pavilion (teal roof, golden frames)
    { const [x, y] = px('gallery'); const k = P_ ? 0.62 : 0.9;
      s += cottage(r, x, y, k, { roof: COL.teal, wall: '#d9d0ec', win: '#ffdca0', door: COL.deepTeal });
      for (let i = 0; i < 3; i++) s += `<rect x="${f(x - 54 * k + i * 38 * k)}" y="${f(y - 55 * k)}" width="${f(26 * k)}" height="${f(32 * k)}" fill="none" stroke="${COL.gold}" stroke-width="${f(3 * k)}" opacity=".0"/>`; }
    // garden: flower patch + arch
    { const [x, y] = px('garden'); const k = P_ ? 0.8 : 1;
      s += `<path d="${smooth(blobPts(r, x, y, 140 * k, 38 * k, 10, 0.2))}" fill="${COL.moss}" opacity=".9" filter="url(#wash)"/>`;
      const cols = [COL.rose, COL.peach, COL.lav, '#fff0cf', COL.rose];
      for (let i = 0; i < (P_ ? 16 : 26); i++) { const fx = x + (r() - 0.5) * 240 * k, fy = y + (r() - 0.3) * 40 * k; s += flower(r, fx, fy, (26 + r() * 30) * k, cols[i % cols.length], { sz: (6 + r() * 4) * k }); }
      s += glow(x, y - 28, 110 * k, '#ffd9a8', 0.28); }
    // desk (foreground)
    { const [x, y] = px('desk'); const k = P_ ? 0.8 : 1;
      s += `<path d="${smooth([[x - 55 * k, y - 28 * k], [x + 55 * k, y - 30 * k], [x + 62 * k, y - 20 * k], [x - 60 * k, y - 18 * k]])}" fill="${COL.wood}" filter="url(#wash)"/>` + pencil(`M${f(x - 50 * k)} ${f(y - 18 * k)}V${f(y + 22 * k)}M${f(x + 54 * k)} ${f(y - 19 * k)}V${f(y + 22 * k)}`, { w: 2.2, op: 0.7 });
      s += `<path d="${smooth([[x - 20 * k, y - 32 * k], [x + 12 * k, y - 36 * k], [x + 16 * k, y - 29 * k], [x - 17 * k, y - 26 * k]])}" fill="#fff6e0" filter="url(#washL)"/>` + pencil(`M${f(x - 20 * k)} ${f(y - 32 * k)}L${f(x + 12 * k)} ${f(y - 36 * k)}L${f(x + 16 * k)} ${f(y - 29 * k)}L${f(x - 17 * k)} ${f(y - 26 * k)}Z`, { w: 1, op: 0.6 });
      s += lantern(r, x + 40 * k, y - 78 * k, 0.8 * k); }
    // light layers
    s += beam(sunX, sunY, W * 0.2, H * 0.98, W * 0.3, '#ffdfa0', 0.2, 'b28');
    s += beam(sunX, sunY, W * 0.85, H * 0.98, W * 0.25, '#ffdfa0', 0.15, 'b28');
    s += dust(r, 0, H * 0.3, W, H * 0.6, P_ ? 22 : 38);
    // foreground dark trees framing
    s += `<g filter="url(#sway)">` + tree(r, P_ ? -30 : W * -0.01, H * 1.04, H * (P_ ? 0.6 : 0.8), { leaf: ['#2c3b46', '#334a48', '#3b3a5c'], trunk: '#2b2238', dark: '#14102c', light: [0.6, -0.6], n: 9, op: 0.97 }) + `</g>`;
    s += tree(r, P_ ? W + 30 : W * 1.02, H * 1.04, H * (P_ ? 0.5 : 0.7), { leaf: ['#2c3b46', '#334a48', '#3b3a5c'], trunk: '#2b2238', dark: '#14102c', light: [-0.6, -0.6], n: 9, op: 0.97 });
    s += grass(r, 0, H, W, P_ ? 40 : 80, '#344a45', 40);
    s += vignette(W, H, 0.5, '#241238', 0.5, 0.45);
    // labels
    const T = (k, text, dx = 0, dy = 40, rot = -3) => { const [x, y] = px(k); return paperTag(r, x - (text.length * (P_ ? 6.5 : 8) + 34) / 2 + dx, y + dy, text, P_ ? 13 : 16, { rot }); };
    s += T('studio', 'the studio', 0, P_ ? 10 : 18, -2) + T('garden', 'memory garden', 0, P_ ? 28 : 30, 2) + T('gallery', 'gallery', 0, P_ ? 12 : 24, 3) + T('listen', 'listening corner', P_ ? -10 : 0, P_ ? 12 : 18, -3) + T('desk', 'desk of unsent words', P_ ? -30 : 0, P_ ? 28 : 26, 2);
    { const [x, y] = px('reveal'); s += hand(P_ ? 'something glows' : 'something glows up there…', x + (P_ ? 28 : 36), y - 34, P_ ? 16 : 22, { rot: -4, fill: '#5b3a52', op: 0.85 }); }
    return s;
  }
  window.S1 = { entrance, world, titleText, paperTag, stones, ivy, lantern, strip, cr, lineD };
})();
