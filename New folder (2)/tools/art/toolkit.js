/* Painterly SVG toolkit for the direction boards (concept art only - not project code). */
(function () {
  const COL = {
    cream: '#F3E9D2', paper2: '#E6D6B5', paper3: '#D9C59C',
    graphite: '#3B3A3D', graphiteSoft: '#6D6A66',
    peach: '#EBB596', rose: '#C98B92', lav: '#A99CC6', sage: '#9CB08B', teal: '#4E9093',
    gold: '#C8A04A', glow: '#FFD27A', hot: '#FFE7A8',
    ink: '#2B2448', plum: '#4B3350', deepTeal: '#1F4950', lamp: '#FFC673',
    brown: '#8B6A4E', wood: '#9A7152', warmShadow: '#5B4256', moss: '#6E8A5E', leafDark: '#3F5E4B'
  };
  const FLAGS = { noText: false };
  const A = {}; const CTX = { W: 1, H: 1 };
  const anchor = (name, x, y, rad) => { A[name] = [Math.round(x / CTX.W * 10000) / 10000, Math.round(y / CTX.H * 10000) / 10000].concat(rad ? [Math.round(rad / CTX.W * 10000) / 10000] : []); return ''; };
  let uid = 0;
  const nid = (p) => p + (++uid);
  const f = (n) => Math.round(n * 10) / 10;

  function rng(seed) {
    let s = ((seed * 2654435761) >>> 0) || 123456789;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };

  function smooth(pts, closed = true) {
    const n = pts.length;
    const g = (i) => pts[((i % n) + n) % n];
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    const m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p0 = closed ? g(i - 1) : pts[Math.max(i - 1, 0)];
      const p1 = g(i);
      const p2 = closed ? g(i + 1) : pts[i + 1];
      const p3 = closed ? g(i + 2) : pts[Math.min(i + 2, n - 1)];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + (closed ? 'Z' : '');
  }
  function blobPts(r, cx, cy, rx, ry, n = 9, j = 0.2) {
    const a0 = r() * 6.283;
    return Array.from({ length: n }, (_, i) => {
      const a = a0 + (i / n) * 6.283, k = 1 + (r() - 0.5) * 2 * j;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
  }
  const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  const scaleAbout = (pts, k, dx = 0, dy = 0) => { const c = centroid(pts); return pts.map((p) => [c[0] + (p[0] - c[0]) * k + dx, c[1] + (p[1] - c[1]) * k + dy]); };

  /* ---------- shared filter defs ---------- */
  function defs() {
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="wash" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="3" result="n1"/>
 <feDisplacementMap in="SourceGraphic" in2="n1" scale="15" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency="0.045 0.03" numOctaves="4" seed="8" result="n2"/>
 <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.0 0 0 0 0.35" result="na"/>
 <feComposite in="d" in2="na" operator="in" result="body"/>
 <feMorphology in="d" operator="erode" radius="2.5" result="er"/>
 <feGaussianBlur in="er" stdDeviation="2.2" result="erb"/>
 <feComposite in="d" in2="erb" operator="out" result="rim"/>
 <feColorMatrix in="rim" type="matrix" values="0.78 0 0 0 0  0 0.74 0 0 0  0 0 0.8 0 0  0 0 0 0.9 0" result="rimd"/>
 <feMerge><feMergeNode in="body"/><feMergeNode in="rimd"/></feMerge>
</filter>
<filter id="washL" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="11" result="n1"/>
 <feDisplacementMap in="SourceGraphic" in2="n1" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency="0.06 0.04" numOctaves="3" seed="4" result="n2"/>
 <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0 0 0 0.4" result="na"/>
 <feComposite in="d" in2="na" operator="in"/>
</filter>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
 <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="21" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
 <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.05" result="g"/>
 <feComposite in="SourceGraphic" in2="g" operator="in"/>
</filter>
<filter id="edge" x="-10%" y="-10%" width="120%" height="120%">
 <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="6" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="dry" x="-10%" y="-30%" width="120%" height="160%">
 <feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="3" seed="2" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -0.9" result="na"/>
 <feComposite in="SourceGraphic" in2="na" operator="in"/>
</filter>
<filter id="b2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="b5" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="b12" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="b28" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="28"/></filter>
<filter id="paperF" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="5" result="t"/>
 <feDiffuseLighting in="t" lighting-color="#fff4dc" surfaceScale="1.7" diffuseConstant="1.05"><feDistantLight azimuth="48" elevation="60"/></feDiffuseLighting>
</filter>
<filter id="blotF" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency="0.007 0.009" numOctaves="3" seed="14" result="t"/>
 <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.22  0.0 1.1 0 0 -0.32"/>
</filter>
<filter id="fibre" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency="0.02 0.5" numOctaves="2" seed="31" result="t"/>
 <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.34  0 0 0 0 0.2  0 1.2 0 0 -0.5"/>
</filter>
<filter id="sway" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/></filter>
</defs></svg>`;
  }

  /* ---------- primitives ---------- */
  function paint(r, pts, color, o = {}) {
    const { op = 0.82, shade = 0.38, hi = 0.32, light = [-0.5, -0.7], dark = COL.plum, lite = '#fff2c8', size } = o;
    const sz = size || Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]));
    const L = Math.hypot(light[0], light[1]) || 1, lx = light[0] / L, ly = light[1] / L;
    let s = `<path d="${smooth(pts)}" fill="${color}" opacity="${op}" filter="url(#wash)"/>`;
    if (shade) s += `<path d="${smooth(scaleAbout(pts, 0.78, -lx * sz * 0.1, -ly * sz * 0.1))}" fill="${mix(color, dark, 0.5)}" opacity="${shade}" filter="url(#washL)"/>`;
    if (hi) s += `<path d="${smooth(scaleAbout(pts, 0.5, lx * sz * 0.14, ly * sz * 0.14))}" fill="${mix(color, lite, 0.65)}" opacity="${hi}" filter="url(#washL)"/>`;
    return s;
  }
  function pencil(d, o = {}) {
    const { w = 1.3, op = 0.75, col = COL.graphite, dash = '' } = o;
    const da = dash ? ` stroke-dasharray="${dash}"` : '';
    return `<g class="pn" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"><path d="${d}" stroke="${col}" stroke-width="${w}" opacity="${op}"${da}/><path d="${d}" stroke="${col}" stroke-width="${f(w * 0.55)}" opacity="${f(op * 0.5)}" transform="translate(.9 -.8)"${da}/></g>`;
  }
  const brokenDash = (r, n = 6) => Array.from({ length: n }, () => `${f(18 + r() * 70)} ${f(2 + r() * 8)}`).join(' ');
  function line(r, x1, y1, x2, y2, o = {}) {
    const mx = (x1 + x2) / 2 + (r() - 0.5) * 3, my = (y1 + y2) / 2 + (r() - 0.5) * 3;
    return pencil(`M${f(x1)} ${f(y1)}Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`, o);
  }
  function hatch(r, x, y, w, h, o = {}) {
    const { gap = 6, ang = 35, op = 0.3, col = COL.graphite, wd = 0.8 } = o;
    const t = Math.tan((ang * Math.PI) / 180);
    let d = '';
    for (let i = -h * t; i < w; i += gap * (0.8 + r() * 0.5)) {
      const a = r() * 0.15 * h;
      d += `M${f(x + i)} ${f(y + a)}L${f(x + i + h * t)} ${f(y + h - r() * 0.15 * h)}`;
    }
    return pencil(d, { w: wd, op, col });
  }
  function ridge(r, W, y, amp, fq, ph, bottom, step = 40) {
    const pts = [];
    for (let x = -40; x <= W + 40; x += step) {
      pts.push([x, y + amp * (Math.sin(x * fq + ph) * 0.6 + Math.sin(x * fq * 2.3 + ph * 1.7) * 0.3) + (r() - 0.5) * amp * 0.2]);
    }
    return { top: pts, d: smooth(pts, false) + `L${W + 40} ${bottom}L-40 ${bottom}Z`, line: smooth(pts, false) };
  }
  function glow(cx, cy, rad, color, op = 0.8, o = {}) {
    const id = nid('g');
    return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="0.45" stop-color="${color}" stop-opacity="${op * 0.38}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><circle class="lt" cx="${cx}" cy="${cy}" r="${rad}" fill="url(#${id})" style="mix-blend-mode:${o.blend || 'screen'}"/>`;
  }
  function beam(x1, y1, x2, y2, spread, color, op = 0.45, blur = 'b12') {
    const id = nid('bm');
    const ang = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, dx = Math.cos(ang) * spread, dy = Math.sin(ang) * spread;
    const w0 = spread * 0.12, ox = Math.cos(ang) * w0, oy = Math.sin(ang) * w0;
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>
<polygon class="lt" points="${f(x1 - ox)},${f(y1 - oy)} ${f(x1 + ox)},${f(y1 + oy)} ${f(x2 + dx)},${f(y2 + dy)} ${f(x2 - dx)},${f(y2 - dy)}" fill="url(#${id})" filter="url(#${blur})" style="mix-blend-mode:screen"/>`;
  }
  function dust(r, x, y, w, h, n, col = '#fff1c4', op = 0.8) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const rr = 0.7 + r() * 1.9, o = (0.25 + r() * 0.65) * op;
      const cx = x + r() * w, cy = y + r() * h;
      s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" fill="${col}" opacity="${f(o)}"${rr > 2 ? ' filter="url(#b2)"' : ''}/>`;
    }
    return `<g class="lt" style="mix-blend-mode:screen">${s}</g>`;
  }
  function stars(r, x, y, w, h, n, col = '#fff6d8') {
    let s = '';
    for (let i = 0; i < n; i++) {
      const cx = x + r() * w, cy = y + r() * h, rr = 0.5 + r() * r() * 1.8;
      s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" fill="${col}" opacity="${f(0.25 + r() * 0.7)}"/>`;
    }
    return s;
  }
  function tape(x, y, w, h, rot, col = '#E8D9A8', op = 0.72) {
    const r = rng(Math.floor(x * 7 + y * 3));
    const z = (side) => { let p = ''; const n = 5; for (let i = 0; i <= n; i++) p += ` ${side ? w : 0},${f((i / n) * h + (i % 2 ? 1.8 : -1.2) + r())}`; return p; };
    const left = [], right = [];
    for (let i = 0; i <= 5; i++) { left.push(`0,${f((i / 5) * h + (i % 2 ? 2 : -1))}`); right.push(`${w},${f(((5 - i) / 5) * h + (i % 2 ? -1.6 : 1.2))}`); }
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><polygon points="${left.join(' ')} ${right.join(' ')}" fill="${col}" opacity="${op}" stroke="${COL.graphiteSoft}" stroke-opacity=".25" stroke-width=".7"/><rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="url(#tapeH)" opacity=".28"/></g>`;
  }
  function hand(text, x, y, size = 22, o = {}) {
    if (FLAGS.noText) return '';
    const { rot = -2, fill = COL.graphite, op = 0.88, anchor = 'start', fam = "'TeX Gyre Chorus','Lora',cursive", weight = 400 } = o;
    return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-style="italic" font-weight="${weight}" fill="${fill}" opacity="${op}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})" filter="url(#rough)">${text}</text>`;
  }
  function scribble(r, x, y, w, rows = 3, o = {}) {
    const { gap = 15, col = COL.graphite, op = 0.55, amp = 3.2, wd = 1.1 } = o;
    let d = '';
    for (let k = 0; k < rows; k++) {
      let xx = x, yy = y + k * gap;
      d += `M${f(xx)} ${f(yy)}`;
      const end = x + w * (k === rows - 1 ? 0.5 + r() * 0.3 : 0.88 + r() * 0.12);
      while (xx < end) {
        const step = 5 + r() * 9;
        xx += step;
        d += `q${f(step / 2)} ${f(-amp - r() * amp)} ${f(step)} ${f((r() - 0.5) * 2)}`;
      }
    }
    return pencil(d, { w: wd, op, col });
  }
  function arrow(x1, y1, x2, y2, bend = 20, o = {}) {
    const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 - bend * 0.6;
    const a = Math.atan2(y2 - my, x2 - mx), hl = 9;
    return pencil(`M${x1} ${y1}Q${f(mx)} ${f(my)} ${x2} ${y2}M${f(x2 - Math.cos(a - 0.5) * hl)} ${f(y2 - Math.sin(a - 0.5) * hl)}L${x2} ${y2}L${f(x2 - Math.cos(a + 0.5) * hl)} ${f(y2 - Math.sin(a + 0.5) * hl)}`, Object.assign({ w: 1.2, op: 0.7 }, o));
  }
  function vignette(W, H, strength = 0.5, col = '#1a1230', cx = 0.5, cy = 0.5) {
    const id = nid('vg');
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.78"><stop offset="0.45" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}" stop-opacity="${strength}"/></radialGradient><rect class="lt" width="${W}" height="${H}" fill="url(#${id})"/>`;
  }
  function grainOverlay(W, H, op = 0.5) {
    return `<rect width="${W}" height="${H}" filter="url(#paperF)" opacity="${op}" style="mix-blend-mode:multiply"/><rect width="${W}" height="${H}" filter="url(#blotF)" opacity=".5" style="mix-blend-mode:multiply"/><rect width="${W}" height="${H}" filter="url(#fibre)" opacity=".35" style="mix-blend-mode:multiply"/>`;
  }
  /* A painted scene sitting on a sheet of cream paper: uneven painted edge, graphite border, tape. */
  function scene(inner, pw, ph, o = {}) {
    const { m = 26, paper = COL.cream, seed = 1, tapes = true, border = true, grain = 0.55 } = o;
    const W = pw + m * 2, H = ph + m * 2, r = rng(seed * 17 + 3);
    const id = nid('mk');
    const jag = (x1, y1, x2, y2, n) => Array.from({ length: n }, (_, i) => [x1 + ((x2 - x1) * i) / n + (r() - 0.5) * 4, y1 + ((y2 - y1) * i) / n + (r() - 0.5) * 4]);
    const pts = [].concat(jag(m, m, m + pw, m, 14), jag(m + pw, m, m + pw, m + ph, 9), jag(m + pw, m + ph, m, m + ph, 14), jag(m, m + ph, m, m, 9));
    const d = pts.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join('') + 'Z';
    const bx = m - 9 - r() * 3;
    const bd = `M${f(bx)} ${f(bx + 2)}L${f(W - bx + 2)} ${f(bx)}L${f(W - bx)} ${f(H - bx)}L${f(bx - 1)} ${f(H - bx + 2)}Z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block">
<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g filter="url(#edge)"><path d="${d}" fill="#fff"/></g></mask>
<linearGradient id="tapeH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="${paper}"/>
<g mask="url(#${id})"><g transform="translate(${m} ${m})">${inner}</g></g>
${border ? pencil(bd, { w: 1.3, op: 0.55, dash: brokenDash(r, 8) }) : ''}
${grainOverlay(W, H, grain)}
${tapes ? tape(m - 18, m - 10, 62, 20, -38) + tape(W - m - 40, m - 14, 62, 20, 36) + tape(m - 20, H - m - 6, 58, 20, 34) + tape(W - m - 38, H - m - 4, 58, 20, -36) : ''}
</svg>`;
  }

  /* ---------- objects ---------- */
  function tree(r, x, y, h, o = {}) {
    const { leaf = [COL.moss, COL.sage, COL.teal], trunk = COL.brown, light = [-0.5, -0.7], dark = COL.plum, n = 8, outline = true, op = 0.85 } = o;
    const R = h * 0.36, cx = x, cy = y - h * 0.62;
    let s = '';
    // trunk
    const tw = h * 0.05;
    const tp = [[x - tw, y], [x - tw * 0.7, y - h * 0.3], [x - tw * 0.4, y - h * 0.5], [x + tw * 0.4, y - h * 0.5], [x + tw * 0.8, y - h * 0.3], [x + tw * 1.3, y]];
    s += `<path d="${smooth(tp)}" fill="${trunk}" opacity=".9" filter="url(#wash)"/>`;
    s += `<path d="M${f(x + tw * 0.2)} ${f(y)}L${f(x + tw * 0.1)} ${f(y - h * 0.45)}L${f(x + tw * 0.7)} ${f(y - h * 0.44)}L${f(x + tw * 1.3)} ${f(y)}Z" fill="${mix(trunk, dark, 0.6)}" opacity=".5" filter="url(#washL)"/>`;
    s += pencil(`M${f(x - tw)} ${f(y)}Q${f(x - tw * 0.6)} ${f(y - h * 0.25)} ${f(x - tw * 0.4)} ${f(y - h * 0.5)}M${f(x + tw * 1.3)} ${f(y)}Q${f(x + tw)} ${f(y - h * 0.25)} ${f(x + tw * 0.4)} ${f(y - h * 0.5)}`, { w: 1.2, op: 0.6, dash: brokenDash(r, 3) });
    s += hatch(r, x - tw * 0.2, y - h * 0.4, tw * 1.4, h * 0.38, { gap: 5, ang: 12, op: 0.25 });
    // canopy blobs: dark first, then mids, then lights
    const blobs = [];
    for (let i = 0; i < n; i++) {
      const a = r() * 6.283, d = r() * R * 0.62;
      blobs.push({ x: cx + Math.cos(a) * d * 1.15, y: cy + Math.sin(a) * d * 0.85, rr: R * (0.42 + r() * 0.3) });
    }
    blobs.sort((a, b) => b.y - a.y);
    blobs.forEach((b, i) => {
      const col = leaf[i % leaf.length];
      const pts = blobPts(r, b.x, b.y, b.rr * 1.1, b.rr, 10, 0.22);
      s += paint(r, pts, mix(col, dark, 0.15 + 0.2 * (b.y > cy ? 1 : 0)), { op, size: b.rr * 2, light, dark, shade: 0.4, hi: 0.35 });
    });
    if (outline) {
      blobs.slice(0, Math.ceil(n * 0.7)).forEach((b) => {
        const pts = blobPts(r, b.x, b.y, b.rr * 1.1, b.rr, 10, 0.22);
        s += pencil(smooth(pts), { w: 1, op: 0.38, dash: brokenDash(r, 5) });
      });
      // leaf scribbles
      let d = '';
      for (let i = 0; i < 16; i++) { const a = r() * 6.283, dd = R * (0.2 + r() * 0.8); const px = cx + Math.cos(a) * dd, py = cy + Math.sin(a) * dd * 0.8; d += `M${f(px)} ${f(py)}q${f(4 + r() * 4)} ${f(-3 - r() * 4)} ${f(8 + r() * 4)} ${f(r() * 3)}`; }
      s += pencil(d, { w: 0.9, op: 0.3 });
    }
    return s;
  }
  function flower(r, x, y, h, col, o = {}) {
    const { petal = 5, sz = h * 0.2, center = COL.gold, leafc = COL.sage, lean = (r() - 0.5) * 12, light = [-0.5, -0.7] } = o;
    const tx = x + lean, ty = y - h;
    let s = pencil(`M${f(x)} ${f(y)}Q${f(x + lean * 0.2)} ${f(y - h * 0.5)} ${f(tx)} ${f(ty)}`, { w: 1.6, op: 0.6, col: COL.leafDark });
    s += `<path d="M${f(x)} ${f(y)}Q${f(x + lean * 0.2)} ${f(y - h * 0.5)} ${f(tx)} ${f(ty)}" stroke="${leafc}" stroke-width="3" fill="none" opacity=".8" filter="url(#washL)"/>`;
    // leaf
    const ly = y - h * (0.25 + r() * 0.2), side = r() > 0.5 ? 1 : -1;
    s += `<path d="${smooth([[x, ly], [x + side * sz * 1.3, ly - sz * 0.9], [x + side * sz * 2.2, ly - sz * 0.5], [x + side * sz * 1.2, ly + sz * 0.1]])}" fill="${mix(leafc, COL.leafDark, 0.2)}" opacity=".8" filter="url(#washL)"/>`;
    for (let i = 0; i < petal; i++) {
      const a = (i / petal) * 6.283 + r() * 0.4;
      const px = tx + Math.cos(a) * sz * 0.8, py = ty + Math.sin(a) * sz * 0.8;
      const pts = blobPts(r, px, py, sz * 0.75, sz * 0.5, 7, 0.15).map((p) => [tx + (p[0] - tx), ty + (p[1] - ty)]);
      s += `<path d="${smooth(pts)}" fill="${mix(col, i % 2 ? '#ffffff' : COL.plum, i % 2 ? 0.18 : 0.12)}" opacity=".82" filter="url(#wash)"/>`;
    }
    s += `<circle cx="${f(tx)}" cy="${f(ty)}" r="${f(sz * 0.35)}" fill="${center}" opacity=".95" filter="url(#washL)"/>`;
    s += pencil(smooth(blobPts(r, tx, ty, sz * 1.5, sz * 1.4, 8, 0.2)), { w: 0.9, op: 0.28, dash: brokenDash(r, 4) });
    return s;
  }
  function grass(r, x, y, w, n, col = COL.sage, hgt = 18) {
    let d = '', s = '';
    for (let i = 0; i < n; i++) {
      const gx = x + r() * w, hh = hgt * (0.5 + r()), lean = (r() - 0.5) * 10;
      d += `M${f(gx)} ${f(y)}Q${f(gx + lean * 0.4)} ${f(y - hh * 0.6)} ${f(gx + lean)} ${f(y - hh)}`;
    }
    s += `<path d="${d}" stroke="${col}" stroke-width="2.2" fill="none" opacity=".75" stroke-linecap="round" filter="url(#washL)"/>`;
    s += pencil(d, { w: 0.8, op: 0.35, col: COL.leafDark });
    return s;
  }
  function cottage(r, x, y, s, o = {}) {
    const { wall = COL.paper2, roof = COL.rose, win = COL.lamp, glowOn = true, door = COL.plum, light = [-0.5, -0.7] } = o;
    const w = 150 * s, h = 90 * s;
    let o2 = '';
    const body = [[x - w / 2, y], [x - w / 2 + 2, y - h], [x + w / 2 - 2, y - h], [x + w / 2, y]];
    o2 += `<path d="${smooth(body)}" fill="${wall}" opacity=".95" filter="url(#wash)"/>`;
    o2 += `<path d="M${f(x + w * 0.1)} ${f(y)}L${f(x + w * 0.1)} ${f(y - h)}L${f(x + w / 2 - 2)} ${f(y - h)}L${f(x + w / 2)} ${f(y)}Z" fill="${mix(wall, COL.plum, 0.5)}" opacity=".35" filter="url(#washL)"/>`;
    const roofPts = [[x - w * 0.62, y - h + 4], [x, y - h - 62 * s], [x + w * 0.62, y - h + 4]];
    o2 += `<path d="${smooth([[x - w * 0.62, y - h + 6], [x - w * 0.3, y - h - 28 * s], [x, y - h - 62 * s], [x + w * 0.3, y - h - 28 * s], [x + w * 0.62, y - h + 6], [x, y - h + 10 * s]])}" fill="${roof}" opacity=".95" filter="url(#wash)"/>`;
    o2 += `<path d="${smooth([[x, y - h - 60 * s], [x + w * 0.3, y - h - 28 * s], [x + w * 0.6, y - h + 6], [x + w * 0.1, y - h + 6]])}" fill="${mix(roof, COL.plum, 0.5)}" opacity=".4" filter="url(#washL)"/>`;
    o2 += pencil(`M${f(x - w * 0.62)} ${f(y - h + 6)}L${f(x)} ${f(y - h - 62 * s)}L${f(x + w * 0.62)} ${f(y - h + 6)}`, { w: 1.5, op: 0.7 });
    o2 += pencil(`M${f(x - w / 2)} ${f(y)}L${f(x - w / 2 + 2)} ${f(y - h + 6)}M${f(x + w / 2)} ${f(y)}L${f(x + w / 2 - 2)} ${f(y - h + 6)}`, { w: 1.4, op: 0.65 });
    // windows
    const wins = [[x - w * 0.28, y - h * 0.58], [x + w * 0.3, y - h * 0.58]];
    wins.forEach((p) => {
      const ww = 22 * s, hh = 26 * s;
      o2 += `<rect x="${f(p[0] - ww / 2)}" y="${f(p[1] - hh / 2)}" width="${f(ww)}" height="${f(hh)}" rx="${f(6 * s)}" fill="${win}" opacity=".95" filter="url(#washL)"/>`;
      o2 += pencil(`M${f(p[0] - ww / 2)} ${f(p[1] - hh / 2)}h${f(ww)}v${f(hh)}h${f(-ww)}Z M${f(p[0])} ${f(p[1] - hh / 2)}v${f(hh)}M${f(p[0] - ww / 2)} ${f(p[1])}h${f(ww)}`, { w: 1.1, op: 0.7 });
    });
    // door
    o2 += `<path d="${smooth([[x - 12 * s, y], [x - 12 * s, y - 34 * s], [x, y - 44 * s], [x + 12 * s, y - 34 * s], [x + 12 * s, y]])}" fill="${door}" opacity=".9" filter="url(#washL)"/>`;
    o2 += pencil(`M${f(x - 12 * s)} ${f(y)}L${f(x - 12 * s)} ${f(y - 34 * s)}Q${f(x)} ${f(y - 50 * s)} ${f(x + 12 * s)} ${f(y - 34 * s)}L${f(x + 12 * s)} ${f(y)}`, { w: 1.2, op: 0.7 });
    if (glowOn) {
      o2 += glow(wins[0][0], wins[0][1], 70 * s, COL.lamp, 0.85) + glow(wins[1][0], wins[1][1], 70 * s, COL.lamp, 0.85);
    }
    return o2;
  }
  function frame(x, y, w, h, inner, o = {}) {
    const { t = 12, gold = COL.gold, id = nid('fr'), rot = 0 } = o;
    return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
<rect x="${x - t}" y="${y - t}" width="${w + 2 * t}" height="${h + 2 * t}" fill="${gold}" opacity=".95" filter="url(#washL)"/>
<rect x="${x - t}" y="${y - t}" width="${w + 2 * t}" height="${h + 2 * t}" fill="none" stroke="${mix(gold, COL.plum, 0.55)}" stroke-width="2" opacity=".6"/>
<rect x="${x - t * 0.45}" y="${y - t * 0.45}" width="${w + t * 0.9}" height="${h + t * 0.9}" fill="none" stroke="${mix(gold, '#fff0b8', 0.6)}" stroke-width="2.4" opacity=".7"/>
<g clip-path="url(#${id})">${inner}</g>
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${COL.plum}" stroke-width="2.5" opacity=".7"/></g>`;
  }

  window.P = { FLAGS, A, CTX, anchor, COL, rng, mix, smooth, blobPts, centroid, scaleAbout, defs, paint, pencil, brokenDash, line, hatch, ridge, glow, beam, dust, stars, tape, hand, scribble, arrow, vignette, grainOverlay, scene, tree, flower, grass, cottage, frame, nid, f };
})();
