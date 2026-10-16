/* Studio, garden, gallery, listening corner, letter desk, finale */
(function () {
  const { COL, rng, mix, smooth, blobPts, paint, pencil, brokenDash, hatch, ridge, glow, beam, dust, stars, hand, scribble, arrow, tape, vignette, tree, flower, grass, frame, f } = P;
  const { paperTag, titleText, lantern, ivy } = S1;

  const jr = (r, x, y, w, h, j = 2) => [[x + (r() - 0.5) * j, y + (r() - 0.5) * j], [x + w + (r() - 0.5) * j, y + (r() - 0.5) * j], [x + w + (r() - 0.5) * j, y + h + (r() - 0.5) * j], [x + (r() - 0.5) * j, y + h + (r() - 0.5) * j]];
  function rectP(r, x, y, w, h, col, o = {}) {
    const { op = 0.92, line = true, j = 2, shade = 0.3 } = o;
    const pts = jr(r, x, y, w, h, j);
    let s = `<path d="M${pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L')}Z" fill="${col}" opacity="${op}" filter="url(#wash)"/>`;
    if (shade) s += `<path d="M${f(x + w * 0.55)} ${f(y)}L${f(x + w)} ${f(y)}L${f(x + w)} ${f(y + h)}L${f(x + w * 0.5)} ${f(y + h)}Z" fill="${mix(col, COL.plum, 0.55)}" opacity="${shade}" filter="url(#washL)"/>`;
    if (line) s += pencil(`M${pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L')}Z`, { w: 1.2, op: 0.6 });
    return s;
  }
  function planks(r, x, y, w, h, base, gap = 26) {
    let s = '';
    for (let yy = y, i = 0; yy < y + h; yy += gap * (0.9 + i * 0.12), i++) {
      s += `<rect x="${x}" y="${f(yy)}" width="${w}" height="${f(gap * (0.9 + i * 0.12))}" fill="${mix(base, [COL.brown, COL.plum, COL.peach][i % 3], 0.18 + r() * 0.2)}" opacity=".9" filter="url(#washL)"/>`;
      s += pencil(`M${x} ${f(yy)}L${x + w} ${f(yy + (r() - 0.5) * 3)}`, { w: 1, op: 0.35 });
    }
    return s;
  }
  function paperSheet(r, x, y, w, h, rot, o = {}) {
    const { col = '#f8efd8', lines = 3, tapeOn = true, sketch = false } = o;
    let s = `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x + 3}" y="${y + 4}" width="${w}" height="${h}" fill="${COL.ink}" opacity=".25" filter="url(#b2)"/><path d="M${f(x)} ${f(y)}L${f(x + w)} ${f(y + 1)}L${f(x + w - 1)} ${f(y + h)}L${f(x + 1)} ${f(y + h - 1)}Z" fill="${col}" filter="url(#rough)"/>`;
    s += pencil(`M${f(x)} ${f(y)}L${f(x + w)} ${f(y + 1)}L${f(x + w - 1)} ${f(y + h)}L${f(x + 1)} ${f(y + h - 1)}Z`, { w: 0.9, op: 0.4 });
    if (sketch) s += pencil(smooth(blobPts(r, x + w * 0.5, y + h * 0.5, w * 0.28, h * 0.2, 7, 0.2)) + `M${f(x + w * 0.2)} ${f(y + h * 0.78)}Q${f(x + w * 0.5)} ${f(y + h * 0.6)} ${f(x + w * 0.82)} ${f(y + h * 0.8)}`, { w: 1, op: 0.55 });
    else s += scribble(r, x + w * 0.12, y + h * 0.2, w * 0.76, lines, { gap: Math.min(14, h / (lines + 1.5)), op: 0.5 });
    if (tapeOn) s += tape(x + w / 2 - 16, y - 8, 32, 14, -3 + rot * 0.2);
    return s + '</g>';
  }
  function mini(kind, w, h, r) {
    let s = '';
    if (kind === 'moon') {
      s += `<rect width="${w}" height="${h}" fill="${COL.ink}"/><rect width="${w}" height="${h}" fill="${COL.teal}" opacity=".35" filter="url(#washL)"/>`;
      s += glow(w * 0.62, h * 0.3, w * 0.4, '#ffe3a0', 0.8) + `<circle cx="${w * 0.62}" cy="${h * 0.3}" r="${w * 0.07}" fill="#fff1c8" filter="url(#washL)"/>`;
      s += stars(r, 0, 0, w, h * 0.5, 22);
      [[0.62, COL.deepTeal], [0.74, '#173a40'], [0.86, '#0f2a30']].forEach((a, i) => { const rd = ridge(r, w, h * a[0], h * 0.05, 0.03 + i * 0.01, i * 2, h, 20); s += `<path d="${rd.d}" fill="${a[1]}" filter="url(#wash)"/>`; });
    } else if (kind === 'still') {
      s += `<rect width="${w}" height="${h}" fill="${COL.peach}" opacity=".9"/><rect width="${w}" height="${h}" fill="${COL.rose}" opacity=".3" filter="url(#washL)"/><rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="${COL.brown}" filter="url(#wash)"/>`;
      s += paint(r, blobPts(r, w * 0.5, h * 0.62, w * 0.14, h * 0.18, 8, 0.12), COL.teal, { size: w * 0.3 });
      [[0.38, 0.32, COL.rose], [0.5, 0.26, '#fff0cf'], [0.62, 0.34, COL.lav]].forEach((a) => { s += paint(r, blobPts(r, w * a[0], h * a[1], w * 0.08, w * 0.08, 7, 0.2), a[2], { size: w * 0.16 }); s += pencil(`M${f(w * a[0])} ${f(h * a[1] + 8)}L${f(w * 0.5)} ${f(h * 0.48)}`, { w: 1.2, op: 0.6, col: COL.leafDark }); });
      s += glow(w * 0.2, h * 0.15, w * 0.5, '#fff0c0', 0.5);
    } else if (kind === 'abstract') {
      s += `<rect width="${w}" height="${h}" fill="#efe3cb"/>`;
      [[0.3, 0.35, COL.lav], [0.65, 0.3, COL.rose], [0.5, 0.65, COL.teal], [0.25, 0.75, COL.peach], [0.75, 0.72, COL.sage]].forEach((a) => { s += paint(r, blobPts(r, w * a[0], h * a[1], w * 0.3, h * 0.22, 9, 0.25), a[2], { op: 0.7, size: w * 0.5 }); });
      s += pencil(`M${f(w * 0.1)} ${f(h * 0.8)}Q${f(w * 0.5)} ${f(h * 0.2)} ${f(w * 0.9)} ${f(h * 0.6)}`, { w: 2.4, op: 0.8, col: COL.gold });
    } else {
      s += `<rect width="${w}" height="${h}" fill="${COL.deepTeal}"/>`;
      s += glow(w * 0.5, h * 0.6, w * 0.6, COL.lamp, 0.9);
      s += `<path d="${smooth([[w * 0.32, h], [w * 0.32, h * 0.45], [w * 0.5, h * 0.3], [w * 0.68, h * 0.45], [w * 0.68, h]])}" fill="#ffd488" filter="url(#washL)"/>`;
      s += `<path d="${smooth([[0, h * 0.85], [w, h * 0.85], [w, h], [0, h]])}" fill="${COL.plum}" opacity=".8" filter="url(#wash)"/>`;
    }
    return s;
  }

  /* ============ STUDIO ============ */
  function studio(W, H, seed = 3) {
    const r = rng(seed), P_ = H > W, fl = H * 0.74;
    let s = `<rect width="${W}" height="${H}" fill="#c48f6c"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="${smooth(blobPts(r, r() * W, r() * fl, W * 0.35, H * 0.2, 8, 0.25))}" fill="${[COL.peach, COL.sage, COL.rose, COL.plum, COL.paper3, COL.warmShadow][i]}" opacity=".4" filter="url(#wash)"/>`;
    s += hatch(r, 0, 0, W, fl, { gap: 14, ang: 20, op: 0.07 });
    // floor
    s += planks(r, 0, fl, W, H - fl, '#a87b56', 22);
    s += `<path d="M0 ${f(fl)}Q${W / 2} ${f(fl + 6)} ${W} ${f(fl - 2)}" stroke="${COL.plum}" stroke-width="5" opacity=".4" fill="none" filter="url(#washL)"/>`;
    // window (arched)
    const wx = P_ ? W * 0.5 : W * 0.7, ww = P_ ? W * 0.5 : W * 0.24, wt = P_ ? H * 0.04 : H * 0.08, wb = P_ ? H * 0.26 : H * 0.55;
    const arch = `M${f(wx - ww / 2)} ${f(wb)}L${f(wx - ww / 2)} ${f(wt + ww / 2)}A${f(ww / 2)} ${f(ww / 2)} 0 0 1 ${f(wx + ww / 2)} ${f(wt + ww / 2)}L${f(wx + ww / 2)} ${f(wb)}Z`;
    s += `<linearGradient id="stW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c4d8"/><stop offset=".6" stop-color="#fbe2a8"/><stop offset="1" stop-color="#ffd48a"/></linearGradient><path d="${arch}" fill="url(#stW)" filter="url(#washL)"/>`;
    s += paint(r, blobPts(r, wx - ww * 0.15, wb - 30, ww * 0.35, 28, 8, 0.2), COL.sage, { op: 0.8, size: ww * 0.7 });
    s += pencil(arch, { w: 3, op: 0.7, col: '#5b3f2e' }) + pencil(`M${f(wx)} ${f(wt)}V${f(wb)}M${f(wx - ww / 2)} ${f((wt + wb) / 2 + 20)}H${f(wx + ww / 2)}`, { w: 2.4, op: 0.65, col: '#5b3f2e' });
    s += glow(wx, (wt + wb) / 2, ww * 1.3, '#ffdc9a', 0.8);
    // light shafts onto floor and easel
    const ex = P_ ? W * 0.4 : W * 0.4;
    s += beam(wx - ww * 0.2, wt + ww * 0.5, ex - 40, fl + 40, ww * 0.55, '#ffe3a8', 0.55, 'b12');
    s += beam(wx + ww * 0.2, wt + ww * 0.5, ex + 120, fl + 60, ww * 0.4, '#ffe3a8', 0.4, 'b12');
    // pinned sketches
    const pins = P_ ? [[0.06, 0.4, -5], [0.78, 0.42, 4]] : [[0.06, 0.12, -4], [0.17, 0.2, 3], [0.27, 0.1, 2]];
    pins.forEach((p, i) => { s += paperSheet(r, W * p[0], H * p[1], P_ ? 70 : 96, P_ ? 90 : 124, p[2], { sketch: i % 2 === 0, lines: 4 }); });
    // shelf with jars
    if (!P_) {
      s += rectP(r, W * 0.04, H * 0.46, W * 0.26, 10, COL.wood, { shade: 0.4 });
      for (let i = 0; i < 6; i++) { const jx = W * 0.05 + i * W * 0.04, jh = 38 + r() * 26; s += `<path d="${smooth([[jx, H * 0.46], [jx - 1, H * 0.46 - jh], [jx + 22, H * 0.46 - jh], [jx + 23, H * 0.46]])}" fill="${[COL.teal, COL.rose, COL.lav, COL.sage, COL.peach, COL.gold][i]}" opacity=".6" filter="url(#washL)"/>` + pencil(`M${jx} ${f(H * 0.46)}V${f(H * 0.46 - jh)}H${jx + 22}V${f(H * 0.46)}`, { w: 1.1, op: 0.55 }); }
    }
    // easel + half-sketch half-colour canvas
    const cw = P_ ? W * 0.5 : W * 0.24, ch = cw * 1.2, cx0 = ex - cw / 2, cy0 = fl - ch - (P_ ? 50 : 60);
    s += pencil(`M${f(cx0 - 14)} ${f(fl + 40)}L${f(ex - 4)} ${f(cy0 - 30)}L${f(ex + 4)} ${f(cy0 - 30)}L${f(cx0 + cw + 14)} ${f(fl + 40)}M${f(ex)} ${f(cy0 + 10)}L${f(ex + 38)} ${f(fl + 50)}`, { w: 5, op: 0.85, col: '#6a4a34' });
    s += rectP(r, cx0 - 8, cy0 + ch - 6, cw + 16, 12, COL.wood, { shade: 0.4 });
    s += `<rect x="${f(cx0)}" y="${f(cy0)}" width="${f(cw)}" height="${f(ch)}" fill="#fbf2dc" filter="url(#washL)"/>`;
    // coloured right half (wash edge diagonal)
    const split = cx0 + cw * 0.46;
    s += `<clipPath id="cvClip"><rect x="${f(cx0)}" y="${f(cy0)}" width="${f(cw)}" height="${f(ch)}"/></clipPath><g clip-path="url(#cvClip)">`;
    const lan = (col) => `M${f(cx0)} ${f(cy0 + ch * 0.62)}Q${f(cx0 + cw * 0.3)} ${f(cy0 + ch * 0.42)} ${f(cx0 + cw * 0.55)} ${f(cy0 + ch * 0.6)}T${f(cx0 + cw)} ${f(cy0 + ch * 0.55)}`;
    // graphite sketch (whole)
    s += pencil(lan(), { w: 1.4, op: 0.7 }) + pencil(`M${f(cx0)} ${f(cy0 + ch * 0.78)}Q${f(cx0 + cw * 0.5)} ${f(cy0 + ch * 0.66)} ${f(cx0 + cw)} ${f(cy0 + ch * 0.8)}`, { w: 1.3, op: 0.6 });
    s += `<circle cx="${f(cx0 + cw * 0.3)}" cy="${f(cy0 + ch * 0.22)}" r="${f(cw * 0.08)}" fill="none" stroke="${COL.graphite}" stroke-width="1.2" opacity=".6" filter="url(#rough)"/>`;
    s += hatch(r, cx0, cy0 + ch * 0.62, cw * 0.45, ch * 0.2, { gap: 7, ang: 40, op: 0.3 });
    // coloured part
    s += `<path d="M${f(split)} ${f(cy0)}L${f(cx0 + cw)} ${f(cy0)}L${f(cx0 + cw)} ${f(cy0 + ch)}L${f(split - 22)} ${f(cy0 + ch)}Q${f(split + 14)} ${f(cy0 + ch * 0.6)} ${f(split - 12)} ${f(cy0 + ch * 0.3)}Z" fill="#f4c39b" filter="url(#wash)"/>`;
    s += paint(r, blobPts(r, cx0 + cw * 0.8, cy0 + ch * 0.2, cw * 0.18, ch * 0.08, 8, 0.2), COL.rose, { op: 0.7, size: cw * 0.4 });
    s += paint(r, [[split, cy0 + ch * 0.58], [cx0 + cw * 0.7, cy0 + ch * 0.48], [cx0 + cw, cy0 + ch * 0.56], [cx0 + cw, cy0 + ch * 0.92], [split - 10, cy0 + ch * 0.92]], COL.sage, { op: 0.85, size: cw });
    s += paint(r, [[split + 8, cy0 + ch * 0.76], [cx0 + cw * 0.78, cy0 + ch * 0.68], [cx0 + cw, cy0 + ch * 0.74], [cx0 + cw, cy0 + ch], [split, cy0 + ch]], COL.teal, { op: 0.8, size: cw });
    s += `<circle cx="${f(cx0 + cw * 0.74)}" cy="${f(cy0 + ch * 0.24)}" r="${f(cw * 0.075)}" fill="#ffe7a8" filter="url(#washL)"/>` + glow(cx0 + cw * 0.74, cy0 + ch * 0.24, cw * 0.4, '#ffe0a0', 0.8);
    s += `</g>` + pencil(`M${f(cx0)} ${f(cy0)}h${f(cw)}v${f(ch)}h${f(-cw)}Z`, { w: 1.4, op: 0.7 });
    s += hand('graphite  →  colour', cx0 + cw / 2, cy0 - 40, P_ ? 15 : 19, { anchor: 'middle', rot: -3, fill: COL.plum, op: 0.85 });
    s += arrow(cx0 + cw * 0.22, cy0 - 30, cx0 + cw * 0.34, cy0 + ch * 0.14, -18, { col: COL.plum });
    P.anchor('canvas', cx0 + cw / 2, cy0 + ch / 2, cw * 0.9); P.anchor('window', wx, (wt + wb) / 2, ww * 1.2);
    // brush hovering
    const bx = split - 6, by = cy0 + ch * 0.4;
    s += `<g transform="rotate(35 ${f(bx)} ${f(by)})">${rectP(r, bx, by, 8, 76, '#7a5538', { line: true, shade: 0.4 })}<path d="M${f(bx)} ${f(by)}L${f(bx + 8)} ${f(by)}L${f(bx + 4)} ${f(by - 22)}Z" fill="${COL.rose}" filter="url(#washL)"/></g>`;
    // table with jars, paints, sketchbooks
    const tx = P_ ? W * 0.62 : W * 0.66, ty = fl + (P_ ? 20 : 8), tw = P_ ? W * 0.45 : W * 0.3;
    s += rectP(r, tx - tw / 2 - 8, ty + 40, tw, 14, COL.wood, { shade: 0.45 });
    s += pencil(`M${f(tx - tw / 2)} ${f(ty + 54)}V${f(H)}M${f(tx + tw / 2 - 16)} ${f(ty + 54)}V${f(H)}`, { w: 4, op: 0.7, col: '#5a3f2c' });
    const sb = [COL.teal, COL.rose, COL.sage, COL.lav];
    sb.forEach((c, i) => { s += rectP(r, tx - tw * 0.1 + (i % 2) * 6, ty + 40 - (i + 1) * 15, tw * 0.34, 14, c, { shade: 0.35, op: 0.9 }); });
    // jar with brushes
    s += `<path d="${smooth([[tx - tw * 0.42, ty + 40], [tx - tw * 0.42 - 2, ty - 8], [tx - tw * 0.3, ty - 8], [tx - tw * 0.3 + 2, ty + 40]])}" fill="#cfe1dc" opacity=".7" filter="url(#washL)"/>`;
    for (let i = 0; i < 5; i++) { const bx2 = tx - tw * 0.4 + i * 7, tip = ty - 52 - r() * 22; s += pencil(`M${f(bx2)} ${f(ty + 10)}L${f(bx2 + (i - 2) * 4)} ${f(tip)}`, { w: 2.4, op: 0.8, col: '#6a4a34' }) + `<path d="M${f(bx2 + (i - 2) * 4)} ${f(tip)}l-2 -12 l4 0z" fill="${[COL.rose, COL.teal, COL.gold, COL.lav, COL.sage][i]}" stroke="${COL.graphite}" stroke-width=".6" filter="url(#washL)"/>`; }
    // paint pans
    s += rectP(r, tx + tw * 0.28, ty + 24, tw * 0.22, 16, '#f0e3c6', { shade: 0.2 });
    [COL.rose, COL.teal, COL.gold, COL.lav].forEach((c, i) => { s += `<circle cx="${f(tx + tw * 0.3 + i * tw * 0.05 + 6)}" cy="${f(ty + 32)}" r="5" fill="${c}" opacity=".95" filter="url(#washL)"/>`; });
    P.anchor('table', tx, ty + 20, tw * 0.7);
    // hanging lamp
    s += pencil(`M${W * (P_ ? 0.15 : 0.1)} 0V${H * 0.08}`, { w: 1.3, op: 0.6 }) + lantern(r, W * (P_ ? 0.15 : 0.1), H * 0.11, 1.3);
    s += glow(W * (P_ ? 0.15 : 0.1), H * 0.14, W * 0.3, COL.lamp, 0.45);
    s += dust(r, wx - ww, wt + ww * 0.3, ww * 1.6, fl - wt, P_ ? 28 : 50);
    s += vignette(W, H, 0.72, '#2a1020', 0.6, 0.45);
    // marginal notes
    s += hand(P_ ? 'tap the brush' : 'drag the brush — the sketch fills with colour', P_ ? W * 0.05 : W * 0.04, H * (P_ ? 0.92 : 0.9), P_ ? 14 : 20, { rot: -3, fill: '#4a2f3c', op: 0.85 });
    return s;
  }

  /* ============ MEMORY GARDEN ============ */
  function garden(W, H, seed = 11) {
    const r = rng(seed), P_ = H > W;
    let s = `<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f4a86"/><stop offset=".35" stop-color="#c9809a"/><stop offset=".6" stop-color="#f0a77a"/><stop offset="1" stop-color="#f6cf8e"/></linearGradient><rect width="${W}" height="${H}" fill="url(#gSky)"/>`;
    s += glow(W * (P_ ? 0.2 : 0.14), H * 0.28, W * 0.6, '#ffd890', 0.9);
    const rd = ridge(r, W, H * 0.42, 24, 0.01, 1, H, 34); s += `<path d="${rd.d}" fill="${mix(COL.plum, COL.sage, 0.45)}" filter="url(#wash)" opacity=".95"/>`;
    // back trees
    for (let i = 0; i < (P_ ? 3 : 6); i++) s += tree(r, W * (0.06 + i * (P_ ? 0.4 : 0.18)) + r() * 30, H * 0.56, H * (0.34 + r() * 0.1), { leaf: [COL.moss, COL.leafDark, '#5f7f64'], dark: COL.plum, n: 8, op: 0.95 });
    s += `<rect y="${H * 0.4}" width="${W}" height="${H * 0.2}" fill="#ffe6bb" opacity=".28" filter="url(#b28)" class="lt" style="mix-blend-mode:screen"/>`;
    // rose arch (gate)
    const ax = W * (P_ ? 0.5 : 0.56), ay = H * 0.58, aw = W * (P_ ? 0.5 : 0.22);
    s += `<path d="M${f(ax - aw / 2)} ${f(ay + H * 0.1)}V${f(ay - aw * 0.4)}Q${f(ax)} ${f(ay - aw * 0.95)} ${f(ax + aw / 2)} ${f(ay - aw * 0.4)}V${f(ay + H * 0.1)}" fill="none" stroke="${COL.paper3}" stroke-width="7" opacity=".9" filter="url(#washL)"/>`;
    s += pencil(`M${f(ax - aw / 2)} ${f(ay + H * 0.1)}V${f(ay - aw * 0.4)}Q${f(ax)} ${f(ay - aw * 0.95)} ${f(ax + aw / 2)} ${f(ay - aw * 0.4)}V${f(ay + H * 0.1)}`, { w: 1.6, op: 0.6 });
    s += ivy(r, ax - aw / 2, ay + H * 0.08, 24, [0.2, -1.2], { sz: 1.1 }) + ivy(r, ax + aw / 2, ay + H * 0.08, 24, [-0.2, -1.2], { sz: 1.1 });
    s += ivy(r, ax - aw / 2 + 4, ay - aw * 0.4, 16, [1, -0.4], { sz: 1.1 }) + ivy(r, ax + aw / 2 - 4, ay - aw * 0.4, 16, [-1, -0.4], { sz: 1.1 });
    s += glow(ax, ay, aw * 0.6, '#ffe2a8', 0.6);
    // meadow
    s += `<path d="${smooth([[-30, H * 0.62], [W * 0.5, H * 0.6], [W + 30, H * 0.63], [W + 30, H + 20], [-30, H + 20]])}" fill="${COL.moss}" filter="url(#wash)"/>`;
    s += `<path d="${smooth([[-30, H * 0.7], [W * 0.5, H * 0.67], [W + 30, H * 0.72], [W + 30, H + 20], [-30, H + 20]])}" fill="${COL.sage}" opacity=".7" filter="url(#wash)"/>`;
    // stepping stones path
    for (let i = 0; i < 9; i++) { const t = i / 8, px = W * (0.5 + Math.sin(t * 3) * 0.08), py = H * (0.64 + t * 0.34), k = 0.35 + t; s += `<path d="${smooth(blobPts(r, px, py, 34 * k, 12 * k, 8, 0.15))}" fill="${COL.paper2}" opacity=".95" filter="url(#wash)"/>` + pencil(smooth(blobPts(r, px, py, 34 * k, 12 * k, 8, 0.15)), { w: 1, op: 0.4 }); }
    // flowers by depth
    const cols = [COL.rose, COL.peach, COL.lav, '#fff0cf', COL.rose, COL.teal];
    for (let layer = 0; layer < 3; layer++) {
      const n = (P_ ? 16 : 30) + layer * 4, yy = [H * 0.68, H * 0.8, H * 0.96][layer], sc = [0.8, 1.3, 2][layer];
      for (let i = 0; i < n; i++) {
        const fx = r() * W; if (Math.abs(fx - W * 0.5) < 50 * sc && layer < 2) continue;
        s += flower(r, fx, yy + r() * H * 0.04, (46 + r() * 46) * sc, cols[Math.floor(r() * cols.length)], { sz: (8 + r() * 5) * sc, petal: 5 + Math.floor(r() * 3) });
      }
      s += grass(r, 0, yy + 20, W, 40, COL.moss, 26 * sc);
    }
    // hanging memory objects on strings from the arch/branches
    const objs = P_ ? [[0.2, 0.16, 'lantern'], [0.8, 0.2, 'bird'], [0.5, 0.31, 'cup'], [0.84, 0.4, 'key'], [0.18, 0.38, 'bottle']] : [[0.34, 0.14, 'lantern'], [0.72, 0.18, 'bird'], [0.46, 0.3, 'cup'], [0.86, 0.34, 'key'], [0.22, 0.34, 'bottle']];
    objs.forEach(([ox, oy, k]) => {
      const x = W * ox, y = H * oy;
      s += pencil(`M${f(x)} 0V${f(y - 14)}`, { w: 1, op: 0.5 });
      if (k === 'lantern') s += lantern(r, x, y, 1.2);
      else if (k === 'bird') s += `<path d="${smooth([[x - 16, y + 20], [x - 16, y - 6], [x, y - 22], [x + 16, y - 6], [x + 16, y + 20]])}" fill="${COL.teal}" filter="url(#wash)"/>` + `<circle cx="${x}" cy="${y + 4}" r="5" fill="${COL.plum}" opacity=".8"/>` + pencil(`M${x - 16} ${y + 20}V${y - 6}L${x} ${y - 22}L${x + 16} ${y - 6}V${y + 20}Z`, { w: 1.3, op: 0.7 });
      else if (k === 'cup') s += `<path d="${smooth([[x - 16, y - 8], [x + 16, y - 8], [x + 12, y + 14], [x - 12, y + 14]])}" fill="#f3e6cf" filter="url(#wash)"/>` + `<ellipse cx="${x}" cy="${y - 8}" rx="16" ry="4" fill="${COL.rose}" opacity=".6"/>` + pencil(`M${x - 16} ${y - 8}L${x - 12} ${y + 14}L${x + 12} ${y + 14}L${x + 16} ${y - 8}`, { w: 1.2, op: 0.65 });
      else if (k === 'key') s += `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${COL.gold}" stroke-width="4" opacity=".95"/>` + pencil(`M${x} ${y + 8}V${y + 38}M${x} ${y + 30}h8M${x} ${y + 38}h6`, { w: 3, op: 0.9, col: COL.gold });
      else s += `<path d="${smooth([[x - 9, y - 6], [x + 9, y - 6], [x + 12, y + 24], [x - 12, y + 24]])}" fill="#cfe5e0" opacity=".8" filter="url(#wash)"/>` + `<rect x="${x - 4}" y="${y - 14}" width="8" height="8" fill="${COL.wood}"/>` + pencil(`M${x - 9} ${y - 6}L${x - 12} ${y + 24}H${x + 12}L${x + 9} ${y - 6}`, { w: 1.2, op: 0.6 });
      s += glow(x, y + 6, 36, COL.glow, 0.6);
      P.anchor(k, x, y + 6, P_ ? 90 : 110);
    });
    P.anchor('flower', W * 0.2, H * 0.78, P_ ? 110 : 130);
    // glowing discovery orbs in flowers
    [[0.2, 0.78], [0.62, 0.84], [0.82, 0.72]].forEach((o) => { s += glow(W * o[0], H * o[1], 22, COL.glow, 0.95) + `<circle cx="${W * o[0]}" cy="${H * o[1]}" r="3" fill="#fff5d0"/>`; });
    // dappled light + low sun beams
    s += beam(W * 0.1, H * 0.1, W * 0.65, H * 0.95, W * 0.35, '#ffe3a8', 0.38, 'b28');
    s += beam(W * 0.2, H * 0.05, W * 0.95, H * 0.8, W * 0.22, '#ffe3a8', 0.28, 'b28');
    for (let i = 0; i < 14; i++) s += `<ellipse cx="${f(r() * W)}" cy="${f(H * 0.62 + r() * H * 0.36)}" rx="${f(14 + r() * 26)}" ry="${f(6 + r() * 10)}" fill="#fff0bb" opacity=".16" filter="url(#b5)" class="lt" style="mix-blend-mode:screen"/>`;
    s += dust(r, 0, H * 0.2, W, H * 0.6, P_ ? 20 : 34);
    // dark foreground leaves
    s += tree(r, -20, H * 1.05, H * 0.5, { leaf: ['#2c4038', '#35503f', '#2f3a4e'], trunk: '#2b2238', dark: '#14102c', n: 6, op: 0.95, outline: false });
    s += vignette(W, H, 0.68, '#1c0e2a', 0.5, 0.5);
    s += hand(P_ ? 'something is hiding here' : 'something is tucked in among the flowers…', P_ ? W * 0.05 : W * 0.5, H * (P_ ? 0.94 : 0.97), P_ ? 15 : 21, { rot: -2, fill: '#fbf0d6', op: 0.9 });
    return s;
  }

  /* ============ GALLERY ============ */
  function gallery(W, H, seed = 21) {
    const r = rng(seed), P_ = H > W, fl = H * 0.8;
    let s = `<rect width="${W}" height="${H}" fill="#3a2a46"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="${smooth(blobPts(r, r() * W, r() * fl, W * 0.3, H * 0.25, 8, 0.3))}" fill="${[COL.plum, COL.deepTeal, '#5b3a56', COL.ink, COL.teal, COL.plum][i]}" opacity=".5" filter="url(#wash)"/>`;
    s += hatch(r, 0, 0, W, fl, { gap: 10, ang: 60, op: 0.08, col: '#d9c8e8' });
    // wainscot rail
    s += `<rect x="0" y="${f(fl - 60)}" width="${W}" height="10" fill="${COL.gold}" opacity=".4" filter="url(#washL)"/>`;
    // floor w reflections
    s += planks(r, 0, fl, W, H - fl, '#4d3340', 26);
    const frames = P_
      ? [[0.5, 0.1, 0.62, 0.34, 'moon', 0], [0.27, 0.5, 0.32, 0.2, 'still', -1.5], [0.73, 0.52, 0.3, 0.18, 'abstract', 1.5]]
      : [[0.13, 0.2, 0.16, 0.42, 'still', -1], [0.5, 0.12, 0.34, 0.46, 'moon', 0], [0.82, 0.22, 0.17, 0.36, 'abstract', 1], [0.3, 0.52, 0.09, 0.14, 'door', 1.5]];
    frames.forEach(([fx, fy, fw, fh, kind, rot], idx) => {
      const w = fw * W, h = fh * H * (P_ ? 1.0 : 1), x = fx * W - w / 2, y = fy * H;
      const cxm = x + w / 2;
      P.anchor('frame' + idx, cxm, y + h / 2, Math.max(w, h) * 0.8);
      s += beam(cxm, -10, cxm, y + h + 20, w * 0.75, '#ffe4ae', idx === (P_ ? 0 : 1) ? 0.75 : 0.5, 'b12');
      s += `<ellipse cx="${f(cxm)}" cy="${f(y + h * 0.5)}" rx="${f(w * 0.8)}" ry="${f(h * 0.7)}" fill="#ffd9a0" opacity="${idx === (P_ ? 0 : 1) ? 0.35 : 0.2}" filter="url(#b28)" class="lt" style="mix-blend-mode:screen"/>`;
      s += `<rect x="${f(x - 8)}" y="${f(y + h + 20)}" width="${f(w + 16)}" height="8" fill="#000" opacity=".3" filter="url(#b5)"/>`;
      s += frame(x, y, w, h, `<g transform="translate(${f(x)} ${f(y)})">${mini(kind, w, h, r)}</g>`, { t: P_ ? 9 : 12, rot });
      s += `<path d="M${f(cxm - w * 0.28)} ${f(y + h + 36)}h${f(w * 0.56)}v16h${f(-w * 0.56)}Z" fill="#f3e9d2" opacity=".85" filter="url(#washL)"/>` + scribble(r, cxm - w * 0.22, y + h + 43, w * 0.44, 1, { gap: 10, op: 0.55 });
      s += glow(cxm, y - 6, 22, '#ffe9b8', 0.9);
    });
    // deeper story card
    const [dx, dy] = P_ ? [W * 0.5, H * 0.74] : [W * 0.64, H * 0.66];
    P.anchor('story', dx + 5, dy + 15, 90);
    s += paperSheet(r, dx - 50, dy - 20, 110, 74, -3, { lines: 4 });
    s += hand('a deeper story', dx + 5, dy - 30, P_ ? 14 : 18, { anchor: 'middle', fill: '#f6e3b8', rot: -3, op: 0.85 });
    // bench silhouette
    s += `<path d="${smooth([[W * 0.34, fl + 30], [W * 0.66, fl + 30], [W * 0.66, fl + 44], [W * 0.34, fl + 44]])}" fill="#140c20" opacity=".92" filter="url(#wash)"/>` + `<path d="M${W * 0.37} ${fl + 44}V${H - 10}M${W * 0.63} ${fl + 44}V${H - 10}" stroke="#140c20" stroke-width="7" opacity=".9"/>`;
    s += dust(r, 0, 0, W, fl, P_ ? 22 : 40, '#ffe9bb', 0.6);
    s += vignette(W, H, 0.78, '#07040f', 0.5, 0.42);
    return s;
  }

  /* ============ LISTENING CORNER ============ */
  function listening(W, H, seed = 33) {
    const r = rng(seed), P_ = H > W, fl = H * 0.76;
    let s = `<rect width="${W}" height="${H}" fill="#1f2347"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="${smooth(blobPts(r, r() * W, r() * fl, W * 0.35, H * 0.22, 8, 0.3))}" fill="${[COL.deepTeal, COL.plum, COL.ink, COL.teal, '#3a3466', COL.deepTeal][i]}" opacity=".3" filter="url(#wash)"/>`;
    s += hatch(r, 0, 0, W, fl, { gap: 12, ang: 70, op: 0.08, col: '#b9b4e0' });
    // window with moon and rain
    const wx = P_ ? W * 0.5 : W * 0.2, ww = P_ ? W * 0.55 : W * 0.2, wt = H * (P_ ? 0.05 : 0.1), wb = H * (P_ ? 0.34 : 0.55);
    s += `<rect x="${f(wx - ww / 2)}" y="${f(wt)}" width="${f(ww)}" height="${f(wb - wt)}" fill="#26335e" filter="url(#washL)"/>`;
    s += glow(wx + ww * 0.1, wt + (wb - wt) * 0.3, ww * 0.7, '#cfe0ff', 0.55) + `<circle cx="${f(wx + ww * 0.1)}" cy="${f(wt + (wb - wt) * 0.3)}" r="${f(ww * 0.09)}" fill="#f4f1de" filter="url(#washL)"/>`;
    s += stars(r, wx - ww / 2, wt, ww, (wb - wt) * 0.5, 14);
    let rain = ''; for (let i = 0; i < 24; i++) { const rx = wx - ww / 2 + r() * ww, ry = wt + r() * (wb - wt - 30); rain += `M${f(rx)} ${f(ry)}l-3 ${f(14 + r() * 14)}`; }
    s += pencil(rain, { w: 1, op: 0.35, col: '#cfe0ff' });
    s += pencil(`M${f(wx - ww / 2)} ${f(wt)}h${f(ww)}v${f(wb - wt)}h${f(-ww)}Z M${f(wx)} ${f(wt)}V${f(wb)}M${f(wx - ww / 2)} ${f((wt + wb) / 2)}H${f(wx + ww / 2)}`, { w: 3, op: 0.7, col: '#0e0f26' });
    s += `<path d="${smooth([[wx - ww / 2 - 30, wt - 10], [wx - ww / 2 + 30, wt - 10], [wx - ww / 2 + 10, wb + 30], [wx - ww / 2 - 34, wb + 30]])}" fill="${COL.rose}" opacity=".45" filter="url(#wash)"/>`;
    // floor + rug
    s += planks(r, 0, fl, W, H - fl, '#3b2c46', 22);
    const rx = W * (P_ ? 0.5 : 0.46), ry = fl + (H - fl) * 0.55;
    s += `<path d="${smooth(blobPts(r, rx, ry, W * (P_ ? 0.46 : 0.36), (H - fl) * 0.38, 12, 0.07))}" fill="${COL.rose}" opacity=".7" filter="url(#wash)"/>` + `<path d="${smooth(blobPts(r, rx, ry, W * (P_ ? 0.36 : 0.28), (H - fl) * 0.26, 12, 0.07))}" fill="${COL.lav}" opacity=".5" filter="url(#washL)"/>`;
    // armchair
    const ax = W * (P_ ? 0.36 : 0.44), ay = fl + 30;
    s += `<path d="${smooth([[ax - 100, ay], [ax - 98, ay - 90], [ax - 44, ay - 156], [ax + 44, ay - 156], [ax + 98, ay - 90], [ax + 100, ay]])}" fill="#243a56" filter="url(#rough)"/>`;
    s += paint(r, [[ax - 70, ay], [ax - 76, ay - 100], [ax - 40, ay - 150], [ax + 40, ay - 150], [ax + 76, ay - 100], [ax + 70, ay]], mix(COL.teal, COL.plum, 0.4), { size: 150 });
    s += paint(r, [[ax - 96, ay - 20], [ax - 90, ay - 80], [ax - 60, ay - 84], [ax - 56, ay - 20]], mix(COL.teal, COL.plum, 0.5), { size: 60 }) + paint(r, [[ax + 96, ay - 20], [ax + 90, ay - 80], [ax + 60, ay - 84], [ax + 56, ay - 20]], mix(COL.teal, COL.plum, 0.5), { size: 60 });
    s += paint(r, [[ax - 62, ay - 20], [ax - 58, ay - 48], [ax + 58, ay - 50], [ax + 62, ay - 20]], mix(COL.teal, COL.lav, 0.3), { size: 124 });
    s += paint(r, [[ax - 55, ay - 30], [ax - 10, ay - 52], [ax + 54, ay - 40], [ax + 50, ay + 4], [ax - 50, ay + 6]], COL.peach, { op: 0.88, size: 110 }); // blanket
    s += pencil(`M${f(ax - 70)} ${f(ay)}L${f(ax - 76)} ${f(ay - 100)}L${f(ax - 40)} ${f(ay - 150)}L${f(ax + 40)} ${f(ay - 150)}L${f(ax + 76)} ${f(ay - 100)}L${f(ax + 70)} ${f(ay)}`, { w: 1.5, op: 0.6 });
    // side table, lamp, radio w/ waveform
    const tx = W * (P_ ? 0.78 : 0.68), ty = fl + 14;
    s += rectP(r, tx - 52, ty - 44, 104, 8, COL.wood, { shade: 0.4 }) + pencil(`M${f(tx - 40)} ${f(ty - 36)}V${f(ty + 52)}M${f(tx + 40)} ${f(ty - 36)}V${f(ty + 52)}`, { w: 3, op: 0.7 });
    s += rectP(r, tx - 44, ty - 84, 60, 40, COL.wood, { shade: 0.5 }); // radio
    s += `<circle cx="${f(tx - 28)}" cy="${f(ty - 64)}" r="11" fill="#e9d6a8" opacity=".85" filter="url(#washL)"/><path d="M${f(tx - 6)} ${f(ty - 74)}h14M${f(tx - 6)} ${f(ty - 66)}h14M${f(tx - 6)} ${f(ty - 58)}h14" stroke="${COL.graphite}" stroke-width="1.4" opacity=".55"/>`;
    // waveform rising from radio
    let wv = `M${f(tx + 18)} ${f(ty - 66)}`; for (let i = 1; i < 26; i++) { const k = i / 26; wv += `L${f(tx + 18 + i * (P_ ? 4 : 9))} ${f(ty - 66 - Math.sin(i * 1.3) * 18 * Math.sin(k * 3.1) - k * 70)}`; }
    s += pencil(wv, { w: 1.6, op: 0.85, col: '#fbe3a8' });
    s += `<path d="${wv}" stroke="${COL.glow}" stroke-width="6" fill="none" opacity=".35" filter="url(#b5)"/>`;
    P.anchor('radio', tx - 14, ty - 64, P_ ? 120 : 160); P.anchor('chair', ax, ay - 80, 170); P.anchor('window', wx, (wt + wb) / 2, ww);
    // lamp
    const lx = tx + 40, lyy = ty - 44;
    P.anchor('lamp', lx, lyy - 96, 160);
    s += pencil(`M${f(lx)} ${f(lyy)}V${f(lyy - 80)}`, { w: 3, op: 0.8 }) + `<path d="${smooth([[lx - 30, lyy - 80], [lx + 30, lyy - 80], [lx + 20, lyy - 118], [lx - 20, lyy - 118]])}" fill="${COL.lamp}" filter="url(#washL)"/>` + pencil(`M${f(lx - 30)} ${f(lyy - 80)}L${f(lx - 20)} ${f(lyy - 118)}H${f(lx + 20)}L${f(lx + 30)} ${f(lyy - 80)}Z`, { w: 1.3, op: 0.7 });
    s += glow(lx, lyy - 96, W * 0.5, COL.lamp, 0.85) + glow(lx, lyy - 96, 50, '#fff0c0', 0.95);
    s += beam(lx, lyy - 90, lx - W * 0.3, fl + 90, W * 0.2, '#ffd89a', 0.4, 'b28');
    // cup with steam
    s += `<path d="${smooth([[tx + 26, ty - 56], [tx + 4, ty - 56], [tx + 8, ty - 46], [tx + 22, ty - 46]])}" fill="#f3e6cf" opacity=".95" filter="url(#washL)"/>`;
    s += pencil(`M${f(tx + 12)} ${f(ty - 60)}q-6 -12 0 -22t0 -20`, { w: 1.4, op: 0.35, col: '#fff' });
    // shelf with plants (back wall right)
    if (!P_) {
      s += rectP(r, W * 0.62, H * 0.34, W * 0.26, 9, COL.wood, { shade: 0.4 });
      for (let i = 0; i < 3; i++) { const px = W * (0.65 + i * 0.08); s += `<path d="${smooth([[px, H * 0.34], [px + 2, H * 0.34 - 22], [px + 26, H * 0.34 - 22], [px + 28, H * 0.34]])}" fill="${COL.rose}" opacity=".8" filter="url(#washL)"/>`; for (let k = 0; k < 6; k++) s += paint(r, blobPts(r, px + 14 + (k - 3) * 6, H * 0.34 - 34 - r() * 20, 9, 12, 6, 0.2), COL.sage, { size: 22 }); }
    }
    s += dust(r, lx - 220, lyy - 220, 340, 260, P_ ? 18 : 30);
    s += vignette(W, H, 0.7, '#070516', 0.55, 0.55);
    s += hand(P_ ? 'press play' : 'press play — a real voice, just for her', P_ ? W * 0.06 : W * 0.06, H * (P_ ? 0.9 : 0.93), P_ ? 14 : 20, { rot: -2, fill: '#f6e3b8', op: 0.85 });
    return s;
  }

  /* ============ LETTER DESK (top-down) ============ */
  function desk(W, H, seed = 41) {
    const r = rng(seed), P_ = H > W;
    let s = `<rect width="${W}" height="${H}" fill="#7d5a44"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="${smooth(blobPts(r, r() * W, r() * H, W * 0.3, H * 0.14, 8, 0.3))}" fill="${[COL.brown, '#5a3f2e', COL.wood, COL.plum, '#8a6648', COL.brown, '#6b4a38', COL.wood, COL.plum][i]}" opacity=".45" filter="url(#wash)"/>`;
    // wood grain streaks
    for (let i = 0; i < 14; i++) s += `<path d="${smooth([[0, r() * H], [W * 0.5, r() * H], [W, r() * H]], false)}" stroke="#3b2618" stroke-width="${f(1 + r() * 2)}" fill="none" opacity=".18" filter="url(#dry)"/>`;
    // plank seams
    const nseam = P_ ? 2 : 3; for (let i = 1; i <= nseam; i++) s += pencil(`M${f(W * i / (nseam + 1))} 0V${H}`, { w: 2, op: 0.5, col: '#2c1a10' });
    // large sheet with handwriting (placeholder scribbles)
    const bx = W * (P_ ? 0.08 : 0.3), by = H * (P_ ? 0.4 : 0.1), bw = W * (P_ ? 0.84 : 0.36), bh = H * (P_ ? 0.34 : 0.78);
    s += paperSheet(r, bx, by, bw, bh, P_ ? -2 : 2, { lines: P_ ? 8 : 12, col: '#f7ecd2' });
    s += hand('[ a note, not yet sent ]', bx + bw * 0.12, by + 38, P_ ? 16 : 22, { rot: P_ ? -2 : 2, fill: COL.graphite, op: 0.85 });
    s += pencil(`M${f(bx + bw * 0.1)} ${f(by + bh * 0.88)}q${f(bw * 0.1)} -14 ${f(bw * 0.2)} -2t${f(bw * 0.2)} -4`, { w: 1.4, op: 0.6 });
    // envelopes
    const env = (x, y, w, h, rot, col, seal, open) => {
      let e = `<g transform="rotate(${rot} ${f(x + w / 2)} ${f(y + h / 2)})"><rect x="${x + 4}" y="${y + 6}" width="${w}" height="${h}" fill="#000" opacity=".3" filter="url(#b5)"/>`;
      if (open) e += paperSheet(r, x + w * 0.08, y - h * 0.55, w * 0.84, h * 0.9, -2, { lines: 3, tapeOn: false });
      e += `<path d="M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}L${x} ${y + h}Z" fill="${col}" filter="url(#rough)"/>`;
      e += pencil(`M${x} ${y}h${w}v${h}h${-w}Z M${x} ${y + h}L${x + w / 2} ${y + h * 0.5}L${x + w} ${y + h}`, { w: 1.1, op: 0.55 });
      if (open) e += `<path d="M${x} ${y}L${x + w / 2} ${y - h * 0.42}L${x + w} ${y}Z" fill="${mix(col, COL.plum, 0.18)}" filter="url(#washL)"/>` + pencil(`M${x} ${y}L${x + w / 2} ${y - h * 0.42}L${x + w} ${y}`, { w: 1.1, op: 0.55 });
      else { e += pencil(`M${x} ${y}L${x + w / 2} ${y + h * 0.55}L${x + w} ${y}`, { w: 1.1, op: 0.55 }); e += `<circle cx="${f(x + w / 2)}" cy="${f(y + h * 0.55)}" r="${f(Math.min(w, h) * 0.12)}" fill="${seal}" filter="url(#wash)"/>` + `<circle cx="${f(x + w / 2)}" cy="${f(y + h * 0.55)}" r="${f(Math.min(w, h) * 0.06)}" fill="none" stroke="${COL.plum}" opacity=".5"/>`; }
      e += scribble(r, x + w * 0.2, y + h * 0.7, w * 0.5, 1, { gap: 10, op: 0.35 });
      return e + '</g>';
    };
    const ew = P_ ? W * 0.4 : W * 0.17, eh = ew * 0.66;
    const E = P_ ? [[0.06, 0.06, -6, COL.rose, COL.gold, false], [0.5, 0.1, 5, COL.lav, COL.rose, false], [0.12, 0.8, 4, COL.sage, COL.gold, false], [0.52, 0.8, -4, '#f6ead0', COL.rose, true]] : [[0.05, 0.12, -7, COL.rose, COL.gold, false], [0.07, 0.5, 5, COL.lav, COL.rose, false], [0.72, 0.1, 6, COL.sage, COL.gold, false], [0.72, 0.52, -5, '#f6ead0', COL.rose, true]];
    E.forEach((e, i) => { P.anchor('env' + i, W * e[0] + ew / 2, H * e[1] + eh / 2, ew * 0.9); s += env(W * e[0], H * e[1], ew, eh, e[2], e[3], e[4], e[5]); });
    // pen, ink, pressed flower, washi tape
    const px = W * (P_ ? 0.1 : 0.62), py = H * (P_ ? 0.3 : 0.9);
    s += `<g transform="rotate(-18 ${px} ${py})"><rect x="${px}" y="${py}" width="${W * (P_ ? 0.5 : 0.2)}" height="8" rx="4" fill="${COL.deepTeal}" filter="url(#washL)"/>${pencil(`M${px} ${py}h${W * (P_ ? 0.5 : 0.2)}v8h${-W * (P_ ? 0.5 : 0.2)}Z`, { w: 1, op: 0.6 })}<path d="M${px + W * (P_ ? 0.5 : 0.2)} ${py}l16 4l-16 4z" fill="${COL.gold}"/></g>`;
    const ix = W * (P_ ? 0.78 : 0.08), iy = H * (P_ ? 0.3 : 0.85);
    s += `<circle cx="${ix}" cy="${iy}" r="${P_ ? 24 : 32}" fill="${COL.ink}" opacity=".9" filter="url(#wash)"/><circle cx="${ix - 6}" cy="${iy - 8}" r="${P_ ? 7 : 10}" fill="#fff" opacity=".28" filter="url(#b2)"/>${pencil(`M${ix - 10} ${iy - 40}h20`, { w: 8, op: 0.8, col: '#3a2a4a' })}`;
    const fx = W * (P_ ? 0.4 : 0.84), fy = H * (P_ ? 0.93 : 0.88);
    s += `<g transform="rotate(20 ${fx} ${fy})">${pencil(`M${fx} ${fy}q10 -30 6 -60`, { w: 1.6, op: 0.7, col: COL.leafDark })}${[0, 1, 2, 3, 4].map((i) => paint(r, blobPts(r, fx + 6 + Math.cos(i * 1.25) * 14, fy - 60 + Math.sin(i * 1.25) * 14, 12, 8, 6, 0.2), i % 2 ? COL.rose : COL.lav, { size: 24 })).join('')}<circle cx="${fx + 6}" cy="${fy - 60}" r="5" fill="${COL.gold}"/></g>`;
    s += tape(W * 0.02, H * 0.62, 90, 22, -8, '#cfe3d2', 0.7);
    // lamp pool + moonlight contrast
    s += glow(W * (P_ ? 0.15 : 0.18), H * 0.05, W * (P_ ? 0.9 : 0.55), COL.lamp, 0.75) + glow(W * (P_ ? 0.15 : 0.18), H * 0.05, 90, '#fff0c0', 0.8);
    s += `<rect x="${W * 0.7}" y="0" width="${W * 0.3}" height="${H}" fill="#6a7fd0" opacity=".16" filter="url(#b28)" class="lt" style="mix-blend-mode:screen"/>`;
    s += dust(r, 0, 0, W, H * 0.6, P_ ? 16 : 26);
    s += vignette(W, H, 0.62, '#120a14', 0.4, 0.4);
    s += hand('open one', P_ ? W * 0.58 : W * 0.78, P_ ? H * 0.78 : H * 0.48, P_ ? 15 : 22, { rot: -6, fill: '#fbe9bd', op: 0.9 });
    return s;
  }

  /* ============ FINALE ============ */
  function finale(W, H, seed = 51, stage = 2) {
    const r = rng(seed), P_ = H > W, k = [0.1, 0.5, 1][stage];
    let s = `<linearGradient id="fnSky${stage}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120e2e"/><stop offset=".45" stop-color="${mix('#2a2050', '#6a3a66', k)}"/><stop offset=".75" stop-color="${mix('#3a2a5c', '#e88a5a', k)}"/><stop offset="1" stop-color="${mix('#3a2a5c', '#ffd27a', k)}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#fnSky${stage})"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="${smooth(blobPts(r, r() * W, H * (0.05 + r() * 0.4), W * 0.3, H * 0.05, 8, 0.25))}" fill="${[COL.lav, COL.rose, COL.teal, COL.plum, COL.peach, COL.lav][i]}" opacity="${0.18 + 0.1 * k}" filter="url(#wash)"/>`;
    s += stars(r, 0, 0, W, H * 0.5, P_ ? 60 : 120);
    const hx = W * 0.5, hy = H * (P_ ? 0.5 : 0.56);
    s += glow(hx, hy, W * 0.8, '#ffc873', 0.9 * k) + glow(hx, hy, W * 0.25, '#fff0c0', k);
    // rays
    if (stage > 0) for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28; s += beam(hx, hy, hx + Math.cos(a) * W, hy + Math.sin(a) * W, W * 0.05, '#ffe6a0', 0.3 * k, 'b12'); }
    // hills
    const hills = [['#3a2f5e', 0.58, 22], ['#2b2650', 0.66, 26], ['#1c1a3c', 0.76, 24]];
    const HR = hills.map((h, i) => ridge(r, W, H * h[1], h[2], 0.009 + i * 0.002, i * 2 + 1, H, 36));
    hills.forEach((h, i) => { s += `<path d="${HR[i].d}" fill="${mix(h[0], '#b4657a', 0.35 * k * (1 - i * 0.3))}" filter="url(#wash)"/>`; s += pencil(HR[i].line, { w: 1.1, op: 0.3, col: '#f2d7a0', dash: brokenDash(r, 6) }); });
    // central hill + great tree with lanterns
    const tx = hx, ty = H * (P_ ? 0.66 : 0.7);
    s += `<path d="${smooth([[tx - W * 0.3, H], [tx - W * 0.12, ty + 10], [tx, ty - 6], [tx + W * 0.12, ty + 10], [tx + W * 0.3, H]], false)}L${tx + W * 0.3} ${H}Z" fill="#17142f" filter="url(#wash)"/>`;
    s += tree(r, tx, ty, H * (P_ ? 0.42 : 0.58), { leaf: ['#1b2447', '#232a4e', '#2a2552'], trunk: '#120f26', dark: '#07050f', n: 16, op: 0.98, outline: false });
    const R0 = H * (P_ ? 0.42 : 0.58) * 0.36, tcx = tx, tcy = ty - H * (P_ ? 0.42 : 0.58) * 0.62;
    for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * R0 * 1.1, x = tcx + Math.cos(a) * d * 1.15, y = tcy + Math.sin(a) * d * 0.9; const lit = r() < [0.1, 0.5, 1][stage]; s += glow(x, y, lit ? 26 : 8, COL.glow, lit ? 0.95 : 0.25) + (lit ? `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="#fff6d0"/>` : ''); }
    // string lights along hill & small lit windows
    for (let i = 0; i < 12; i++) { const x = W * (0.08 + i * 0.075), y = H * (P_ ? 0.78 : 0.8) + Math.sin(i * 1.3) * 10; s += glow(x, y, 18 * (0.2 + k), COL.glow, 0.9 * k) + `<circle cx="${f(x)}" cy="${f(y)}" r="2" fill="#fff0c0" opacity="${k}"/>`; }
    // sky lanterns rising
    for (let i = 0; i < (P_ ? 12 : 22); i++) { const x = r() * W, y = H * (0.05 + r() * 0.45), sz = 6 + r() * 8; s += glow(x, y, sz * 4, COL.glow, 0.9 * k) + `<path d="${smooth([[x - sz, y + sz], [x - sz * 0.8, y - sz * 0.6], [x, y - sz], [x + sz * 0.8, y - sz * 0.6], [x + sz, y + sz]])}" fill="${mix('#7a4a3a', '#ffcf80', k)}" opacity=".95" filter="url(#washL)"/>`; }
    // foreground: wish scroll between two posts, candles
    const sw = W * (P_ ? 0.84 : 0.46), sh = H * (P_ ? 0.26 : 0.3), sx = W * 0.5 - sw / 2, sy = H - sh - H * (P_ ? 0.06 : 0.07);
    s += `<rect x="0" y="${f(sy + sh * 0.7)}" width="${W}" height="${H}" fill="#0c0a1e" opacity=".85" filter="url(#wash)"/>`;
    s += pencil(`M${f(sx - 10)} ${f(sy - 30)}V${H}M${f(sx + sw + 10)} ${f(sy - 30)}V${H}`, { w: 6, op: 0.9, col: '#2a1f35' });
    s += `<rect x="${f(sx + 4)}" y="${f(sy + 6)}" width="${f(sw)}" height="${f(sh)}" fill="#000" opacity=".5" filter="url(#b12)"/>`;
    s += `<path d="${smooth([[sx, sy], [sx + sw * 0.5, sy - 3], [sx + sw, sy + 1], [sx + sw + 2, sy + sh * 0.5], [sx + sw, sy + sh], [sx + sw * 0.5, sy + sh + 3], [sx, sy + sh - 1], [sx - 2, sy + sh * 0.5]])}" fill="${mix('#c9b48a', '#fbeccb', k)}" filter="url(#rough)"/>`;
    s += pencil(`M${f(sx)} ${f(sy)}L${f(sx + sw)} ${f(sy + 1)}L${f(sx + sw)} ${f(sy + sh)}L${f(sx)} ${f(sy + sh - 1)}Z`, { w: 1.2, op: 0.5 });
    // rolled ends
    [[sx - 8, 1], [sx + sw - 4, -1]].forEach(([x]) => { s += `<rect x="${f(x)}" y="${f(sy - 4)}" width="14" height="${f(sh + 8)}" rx="7" fill="${COL.paper3}" filter="url(#washL)"/>` + pencil(`M${f(x + 7)} ${f(sy - 3)}V${f(sy + sh + 3)}`, { w: 1, op: 0.35 }); });
    s += hand('[ the final wish goes here ]', W * 0.5, sy + sh * 0.42, P_ ? 20 : 30, { anchor: 'middle', rot: -1.5, fill: '#3a2a3c', op: 0.88 });
    s += scribble(r, sx + sw * 0.16, sy + sh * 0.62, sw * 0.68, 2, { gap: sh * 0.14, op: 0.45 });
    s += tape(sx + sw * 0.5 - 20, sy - 10, 40, 16, -2);
    [[sx - 34], [sx + sw + 28]].forEach(([x], i) => { const y = H - H * 0.08; P.anchor('candle' + i, x, y - 12, 90); s += `<rect x="${f(x - 8)}" y="${f(y)}" width="16" height="${f(H * 0.09)}" fill="#f3e6cf" filter="url(#washL)"/>` + `<path d="M${f(x)} ${f(y - 4)}q-7 -12 0 -24q7 12 0 24z" fill="#ffb050" filter="url(#b2)"/>` + glow(x, y - 12, 60 * (0.4 + k), '#ffc060', 0.9 * k) + glow(x, y - 12, 14, '#fff6d0', 1); });
    s += glow(W * 0.5, sy + sh * 0.5, sw * 0.8, '#ffd890', 0.5 * k); P.anchor('scroll', W * 0.5, sy + sh * 0.5, sw * 0.6); P.anchor('tree', tx, ty - H * 0.2, W * 0.3);
    s += dust(r, 0, H * 0.2, W, H * 0.7, Math.round((P_ ? 14 : 24) * (0.3 + k)));
    s += vignette(W, H, 0.55 - 0.1 * k, '#05030f', 0.5, 0.55);
    if (stage === 2) s += titleText('Happy Birthday', W * 0.5, H * (P_ ? 0.075 : 0.105), P_ ? 38 : 66, { rot: -2 });
    return s;
  }

  window.S2 = { studio, garden, gallery, listening, desk, finale, mini, paperSheet, rectP };
})();
