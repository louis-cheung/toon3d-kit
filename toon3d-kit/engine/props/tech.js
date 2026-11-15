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

