// Tech, AI, data and "big company" props.
import { THREE, toon, glow, G, put, group, PAL, screenTex, textTex, ctex, rng } from '../core.js';
import { register, find } from '../registry.js';
const g0 = () => new THREE.Group();

register('server-rack', {
  tags: ['tech', 'datacenter', 'ai', 'server'], aliases: ['server', 'rack'], desc: 'White server cabinet with blinking LEDs (data hall shots).',
  opts: { h: 'height (2.2)', color: 'cabinet color', seed: 'LED pattern' },
  build: ({ h = 2.2, color = 0xe9ebf2, seed = 1 } = {}) => {
    const g = g0(), r = rng(seed); put(g, G.box(.7, h, 1), toon(color), { y: h / 2 });
    const t = ctex(128, 512, (x, W, H) => { x.fillStyle = '#20253a'; x.fillRect(0, 0, W, H); for (let j = 0; j < 20; j++) { x.fillStyle = '#353b55'; x.fillRect(8, j * 25 + 4, W - 16, 18); for (let i = 0; i < 4; i++) if (r() < .5) { x.fillStyle = r() < .8 ? '#5fe0c0' : '#ff7a6a'; x.fillRect(14 + i * 9, j * 25 + 10, 5, 5); } } }, { key: 'rack' + seed });
    put(g, G.plane(.56, h - .16), glow(0xffffff, { map: t }), { y: h / 2, z: .505, noInk: true });
    for (let i = 0; i < 5; i++) put(g, G.box(.02, h - .16, .02), toon(0xcfd2dc), { x: -.28 + i * .14, y: h / 2, z: .52 });
    return g;
  },
});

register('server-row', { tags: ['tech', 'datacenter'], desc: 'A row of n server racks side by side.', opts: { n: 'count (6)' },
  build: ({ n = 6, h = 2.2 } = {}) => { const g = g0(); const s = find('server-rack'); for (let i = 0; i < n; i++) { const r = s.build({ h, seed: i + 1 }); r.position.x = (i - (n - 1) / 2) * .72; g.add(r); } return g; } });

register('hologram-globe', {
  tags: ['tech', 'world', 'map', 'globe', 'power', 'villain'], aliases: ['globe', 'earth'], desc: 'Glowing wireframe-ish Earth on a pedestal with orbit rings (world domination shots).',
  opts: { r: 'radius (0.9)', pedestal: 'true/false', rings: 'count (2)' },
  build: ({ r = .9, pedestal = true, rings = 2 } = {}) => {
    const g = g0(), y = pedestal ? 1.0 + r : r;
    const t = ctex(1024, 512, (x, W, H) => {
      x.fillStyle = '#1d3f9a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#6fb8ff'; x.lineWidth = 3;
      for (let i = 0; i <= 24; i++) { x.beginPath(); x.moveTo(i * W / 24, 0); x.lineTo(i * W / 24, H); x.stroke(); } for (let j = 0; j <= 12; j++) { x.beginPath(); x.moveTo(0, j * H / 12); x.lineTo(W, j * H / 12); x.stroke(); }
      x.fillStyle = '#8ef0ff'; x.strokeStyle = '#ffffff'; x.lineWidth = 6; const r2 = rng(9);
      for (const [cx, cy, s] of [[230, 170, 130], [300, 330, 90], [540, 190, 120], [560, 330, 90], [780, 170, 160], [860, 360, 70]]) { x.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, rr = s * (.6 + r2() * .5); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .7); } x.closePath(); x.fill(); x.stroke(); }
    }, { key: 'globe' });
    const globe = put(g, G.sph(r, 48, 32), glow(0xffffff, { map: t }), { y, noInk: true }); globe.userData.spin = true; globe.name = 'globe';
    put(g, G.sph(r * 1.06, 32, 24), new THREE.MeshBasicMaterial({ color: 0x8fe8ff, transparent: true, opacity: .14, depthWrite: false }), { y, noInk: true, shadow: false });
    for (let i = 0; i < rings; i++) put(g, G.torus(r * (1.25 + i * .15), .012, 64), glow(i ? 0x9fe8ff : PAL.gold), { y, rx: Math.PI / 2 + (i ? -.5 : .25), rz: i * .6, noInk: true });
    if (pedestal) { put(g, G.cyl(.55, .7, .9, 32), toon(0x2a3060), { y: .45 }); put(g, G.cyl(.62, .62, .04, 40), glow(PAL.cyan), { y: .9, noInk: true }); }
    return g;
  },
});

register('holo-platform', { tags: ['tech', 'villain', 'stage', 'power'], aliases: ['platform', 'pad'], desc: 'Round glowing floor platform with cyan and gold rings (stand a character on it).', opts: { r: 'radius (1.6)' },
  build: ({ r = 1.6 } = {}) => { const g = g0(); put(g, G.cyl(r, r, .08, 64), toon(0x1c2250), { y: .04 }); put(g, G.torus(r * .55, .025, 64), glow(PAL.cyan), { y: .09, rx: Math.PI / 2, noInk: true });
    put(g, G.cyl(r * .3, r * .3, .02, 48), glow(0x9fe8ff), { y: .09, noInk: true }); put(g, G.torus(r * 1.05, .02, 80), glow(PAL.gold), { y: .02, rx: Math.PI / 2, noInk: true }); return g; } });

register('ai-core', {
  tags: ['tech', 'ai', 'robot', 'data', 'machine'], aliases: ['ai-tank', 'supercomputer'], desc: 'Tall glowing cylinder with a friendly screen face and a gauge (the hungry AI).',
  opts: { text: 'label on top', mood: 'happy|hungry|angry' },
  build: ({ text = 'MORE DATA', mood = 'happy' } = {}) => {
    const g = g0(); put(g, G.cyl(.95, 1.05, .4, 40), toon(0x2a2f48), { y: .2 });
    const t = ctex(1024, 768, (x, W, H) => { x.fillStyle = '#123a6a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#7fe3ff'; x.lineWidth = 6; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(0, i * 128 + 64); x.lineTo(W, i * 128 + 64); x.stroke(); }
      x.fillStyle = '#e6c25a'; x.font = 'bold 84px Helvetica'; x.textAlign = 'center'; x.fillText(text, W / 2, 110);
      x.lineWidth = 12; x.strokeStyle = '#9ff0ff'; x.beginPath(); x.arc(W / 2, 400, 200, 0, 7); x.stroke(); x.fillStyle = '#ffffff';
      for (const s of [-1, 1]) { x.beginPath(); x.arc(W / 2 + s * 80, 370, 52, 0, 7); x.fill(); x.fillStyle = '#123a6a'; x.beginPath(); x.arc(W / 2 + s * 80 + 10, 360, 26, 0, 7); x.fill(); x.fillStyle = '#ffffff'; }
      x.beginPath(); if (mood === 'angry') { x.moveTo(W / 2 - 70, 500); x.quadraticCurveTo(W / 2, 450, W / 2 + 70, 500); } else { x.moveTo(W / 2 - 70, 470); x.quadraticCurveTo(W / 2, mood === 'hungry' ? 560 : 530, W / 2 + 70, 470); } x.stroke(); }, { key: 'aicore' + text + mood });
    put(g, new THREE.CylinderGeometry(.8, .8, 2.6, 48, 1, true), glow(0xffffff, { map: t, side: THREE.DoubleSide }), { y: 1.7, noInk: true });
    for (const y of [.42, 3.0]) put(g, G.torus(.82, .04, 48), toon(0xc8cde0), { y, rx: Math.PI / 2 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; put(g, G.box(.05, 2.6, .05), toon(0xc8cde0), { x: Math.cos(a) * .82, y: 1.7, z: Math.sin(a) * .82 }); }
    const gauge = find('gauge').build({ value: mood === 'hungry' ? .08 : .7, label: 'DATA' }); gauge.position.set(.75, 0, .9); g.add(gauge); return g;
  },
});

register('gauge', { tags: ['ui', 'meter', 'data', 'speed'], aliases: ['meter', 'dial'], desc: 'Round dial on a post with needle. value 0..1 (red to green).', opts: { value: '0..1', label: 'text', post: 'true/false' },
  build: ({ value = .5, label = 'POWER', post = true } = {}) => { const g = g0(), y = post ? 1.0 : .3; if (post) put(g, G.cyl(.04, .04, y, 10), toon(0x3a3f55), { y: y / 2 });
    put(g, G.cyl(.32, .32, .08, 40), toon(0x3a3f55), { y, rx: Math.PI / 2 });
    const t = ctex(512, 512, (x) => { x.fillStyle = '#f4f2ea'; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); x.lineWidth = 34; [['#e2463b', 0], ['#f5c84a', .33], ['#7bd88f', .66]].forEach(([c, s]) => { x.strokeStyle = c; x.beginPath(); x.arc(256, 280, 180, Math.PI * (1 + s * .9 + .05), Math.PI * (1 + (s + .33) * .9 + .05)); x.stroke(); });
      x.fillStyle = '#555'; x.font = 'bold 54px Helvetica'; x.textAlign = 'center'; x.fillText(label, 256, 420); x.fillStyle = '#e2463b'; x.font = 'bold 40px Helvetica'; x.fillText('E', 110, 330); x.fillStyle = '#3a9a5a'; x.fillText('F', 402, 330); }, { key: 'gauge' + label });
    put(g, G.plane(.56, .56), toon(0xffffff, { map: t }), { y, z: .045, noInk: true });
    const nd = group(g, { y: y - .02, z: .055, rz: Math.PI / 2 - value * Math.PI * .9 - .05 }); put(nd, G.box(.02, .22, .01), toon(PAL.red), { y: .11 }); put(g, G.cyl(.03, .03, .03, 12), toon(0x333333), { y: y - .02, z: .06, rx: Math.PI / 2 });
    g.userData.needle = nd; return g; } });

register('robot-bot', { tags: ['tech', 'ai', 'robot'], aliases: ['robot', 'bot'], desc: 'Small robot: cube head with a screen face, stick body. Sits on a pedestal.', opts: { face: 'text/symbol on screen', pedestal: 'true/false' },
  build: ({ face = '◉ ◉', pedestal = true } = {}) => { const g = g0(), b = pedestal ? .45 : 0; if (pedestal) put(g, G.rbox(.6, .45, .6, .03), toon(0x4a4f66), { y: .225 });
    put(g, G.cap(.14, .2), toon(PAL.offwhite), { y: b + .45 }); for (const s of [-1, 1]) put(g, G.cyl(.025, .025, .3, 8), toon(PAL.black), { x: s * .07, y: b + .15 });
    const h = put(g, G.rbox(.5, .42, .42, .06), toon(PAL.black), { y: b + .85 }); put(h, G.plane(.38, .28), glow(0xffffff, { map: textTex(face, { w: 256, h: 192, bg: '#0e1424', fg: '#8ff0ff', font: 'bold 80px Helvetica', key: 'bot' + face }) }), { z: .215, noInk: true });
    put(g, G.cyl(.01, .01, .2, 6), toon(PAL.black), { y: b + 1.15 }); put(g, G.sph(.04), glow(PAL.cyan), { y: b + 1.26, noInk: true }); return g; } });

register('phone-big', { tags: ['tech', 'phone', 'social', 'ui'], aliases: ['smartphone', 'giant-phone'], desc: 'Phone as a set piece (stand up, screen content). lines: [...] draws a portrait list of rows ("JADE $14"), name left and amount right.', opts: { screen: 'chat|dashboard|chart|code|logo:TEXT', h: 'height (1.6)', lines: 'array of row strings, e.g. ["JADE $14", "MAX $96"] (overrides screen)' },
  build: ({ screen = 'chat', h = 1.6, lines = null } = {}) => { const g = g0(), w = h * .5;
    const tex = lines ? ctex(400, 1200, (x, W, H) => { x.fillStyle = '#16193f'; x.fillRect(0, 0, W, H); const rh = Math.min(260, (H - 80) / lines.length); const C = ['#c8b8ff', '#ffb066', '#ffffff'];
      lines.forEach((ln, i) => { const k = ln.lastIndexOf(' '), name = ln.slice(0, k), amt = ln.slice(k + 1), y = 60 + i * rh; x.fillStyle = '#242a66'; x.beginPath(); x.roundRect(24, y, W - 48, rh - 24, 28); x.fill();
        x.fillStyle = C[i % 3]; x.font = '900 70px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, W / 2, y + (rh - 24) * .3); x.fillStyle = '#ffffff'; x.font = '900 120px Helvetica, Arial'; x.fillText(amt, W / 2, y + (rh - 24) * .7); }); }, { key: 'phone:' + lines.join('|') }) : screenTex(screen, 5);
    put(g, G.rbox(w, h, .08, .08), toon(PAL.black), { y: h / 2 }); put(g, G.plane(w * .88, h * .9), glow(0xffffff, { map: tex }), { y: h / 2, z: .042, noInk: true }); return g; } });

register('counter-board', {
  tags: ['ui', 'sign', 'number', 'stat', 'time'], aliases: ['big-number', 'scoreboard', 'stat-board'], desc: 'Big hanging board with a label and a big number (DAY 118, 4 MONTHS, $60B).',
  opts: { label: 'small top text', value: 'big text', color: 'board color hex string', w: 'width (2.4)' },
  build: ({ label = 'DAY', value = '118', color = '#e2463b', fg = '#f6d36a', w = 2.4 } = {}) => {
    const g = g0(), h = w * .5; const t = ctex(1024, 512, (x, W, H) => { x.fillStyle = color; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = 'bold 80px Helvetica'; x.textAlign = 'center'; x.fillText(label, W / 2, 110); x.fillStyle = fg; x.font = 'bold 260px Helvetica'; x.fillText(value, W / 2, 390); }, { key: 'cb' + label + value + color });
    put(g, G.box(w + .08, h + .08, .06), toon(0x2a2a38), {}); put(g, G.plane(w, h), glow(0xffffff, { map: t }), { z: .035, noInk: true }); return g;
  },
});

register('chip', { tags: ['tech', 'ai', 'gpu', 'hardware'], aliases: ['gpu', 'cpu', 'microchip'], desc: 'Computer chip with pins (GPU/CPU stand-in). Scale it up as a hero object.', opts: { label: 'text on die' },
  build: ({ label = 'GPU' } = {}) => { const g = g0(); put(g, G.rbox(.5, .06, .5, .015), toon(0x2c6e4a), { y: .03 }); const d = put(g, G.rbox(.3, .05, .3, .01), toon(0x2a2a33), { y: .08 });
    put(d, G.plane(.24, .24), glow(0xffffff, { map: textTex(label, { w: 256, h: 256, fg: '#e6c25a', font: 'bold 90px Helvetica', bg: '#22222b', key: 'chip' + label }) }), { y: .026, rx: -Math.PI / 2, noInk: true });
    for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { put(g, G.box(.025, .02, .06), toon(PAL.gold), { x: -.21 + i * .06, y: .02, z: s * .27, noInk: true }); put(g, G.box(.06, .02, .025), toon(PAL.gold), { x: s * .27, y: .02, z: -.21 + i * .06, noInk: true }); } return g; } });

register('satellite', { tags: ['space', 'tech', 'orbit'], desc: 'Satellite with solar panels.', opts: {},
  build: () => { const g = g0(); put(g, G.rbox(.4, .4, .5, .03), toon(PAL.gold), {}); for (const s of [-1, 1]) { put(g, G.cyl(.02, .02, .4, 8), toon(PAL.steel), { x: s * .38, rz: Math.PI / 2 }); put(g, G.box(.8, .02, .4), toon(0x2b4aa8), { x: s * .98 }); } put(g, G.cone(.15, .15, 16), toon(PAL.offwhite), { z: .32, rx: -Math.PI / 2 }); return g; } });

register('rocket', { tags: ['space', 'launch', 'vehicle'], desc: 'Cartoon rocket on fins.', opts: { color: 'body color' },
  build: ({ color = PAL.offwhite } = {}) => { const g = g0(); put(g, G.cap(.35, 2.2), toon(color), { y: 1.6 }); put(g, G.cone(.36, .7, 24), toon(PAL.red), { y: 3.25 });
    put(g, G.cyl(.15, .15, .05, 20), glow(PAL.cyan), { y: 2.1, z: .34, rx: Math.PI / 2, noInk: true }); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; put(g, G.box(.04, .6, .45), toon(PAL.red), { x: Math.cos(a) * .4, y: .55, z: Math.sin(a) * .4, ry: -a + Math.PI / 2 }); } return g; } });


