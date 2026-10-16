/* Senna — o carro em 3D (Three.js r149, build clássico).
   Um F1 genérico de 1988 modelado com geometria simples, no estilo desenho técnico:
   corpo cor de papel, arestas em tinta e o vermelho só para destacar a peça.
   Sem pintura nem logotipos (CLAUDE.md). A rolagem é lida de window.sennaCar
   (script.js): p = progresso da seção, k = quanto o carro está desmontado, speed = km/h. */
(function () {
  const wrap = document.getElementById('car');
  const canvas = document.getElementById('car-canvas');
  const fallback = wrap && wrap.querySelector('.car__fallback');
  if (!wrap || !canvas) return;

  function useFallback() {
    wrap.classList.add('no-webgl');
    if (fallback) fallback.hidden = false;
  }
  if (!window.THREE) { useFallback(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) { useFallback(); return; }

  const T = THREE;
  const V3 = T.Vector3;
  const rootStyle = getComputedStyle(document.documentElement);
  const tok = (name) => rootStyle.getPropertyValue(name).trim();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const COLOR = {
    paper: new T.Color(tok('--paper-100')),
    paper2: new T.Color(tok('--paper-200')),
    ink: new T.Color(tok('--ink-900')),
    graphite: new T.Color(tok('--ink-700')),
    red: new T.Color(tok('--red-500')),
    red4: new T.Color(tok('--red-400')),
  };

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(28, 2, 0.1, 100);
  scene.add(new T.HemisphereLight(0xffffff, COLOR.paper2, 0.95));
  const sun = new T.DirectionalLight(0xffffff, 0.85);
  sun.position.set(4, 7, 5);
  scene.add(sun);
  const rim = new T.DirectionalLight(0xffffff, 0.35);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  /* ---------- plataforma giratória ---------- */
  const turntable = new T.Group();
  scene.add(turntable);
  const ring = new T.Mesh(new T.RingGeometry(3.0, 3.03, 160), new T.MeshBasicMaterial({ color: COLOR.red, side: T.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(ring);
  const tickPts = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const len = i % 6 === 0 ? 0.22 : 0.09;
    tickPts.push(new V3(Math.cos(a) * 3.05, 0.003, Math.sin(a) * 3.05), new V3(Math.cos(a) * (3.05 + len), 0.003, Math.sin(a) * (3.05 + len)));
  }
  turntable.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(tickPts), new T.LineBasicMaterial({ color: COLOR.red })));

  // sombra de contato: um degradê em canvas, preso ao carro
  const sc = document.createElement('canvas');
  sc.width = sc.height = 256;
  const g2 = sc.getContext('2d');
  const grad = g2.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.42)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g2.fillStyle = grad;
  g2.fillRect(0, 0, 256, 256);
  const shadow = new T.Mesh(new T.PlaneGeometry(6.4, 2.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  turntable.add(shadow);

  const car = new T.Group();
  turntable.add(car);

  /* ---------- geometria ---------- */
  function densify(pts, step) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let j = 0; j < n; j++) out.push(new T.Vector2(a[0] + (b[0] - a[0]) * (j / n), a[1] + (b[1] - a[1]) * (j / n)));
    }
    return out;
  }
  // perfil lateral (x, y) extrudado na largura (z); taper(x) afina a largura ao longo do carro
  function profile(pts, depth, taper, bevel = 0.018) {
    const geo = new T.ExtrudeGeometry(new T.Shape(densify(pts, 0.1)), {
      depth: depth - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, steps: 1, curveSegments: 4,
    });
    geo.translate(0, 0, -(depth - 2 * bevel) / 2);
    if (taper) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * taper(pos.getX(i)));
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    return geo;
  }
  function box(w, h, d) {
    const b = Math.min(0.014, Math.min(w, h, d) * 0.3);
    const shape = new T.Shape();
    shape.moveTo(-w / 2 + b, -h / 2 + b);
    shape.lineTo(w / 2 - b, -h / 2 + b);
    shape.lineTo(w / 2 - b, h / 2 - b);
    shape.lineTo(-w / 2 + b, h / 2 - b);
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 1, steps: 1 });
    geo.translate(0, 0, -(d - 2 * b) / 2);
    return geo;
  }
  function tire(r, w) {
    const ri = r * 0.64, c = 0.055;
    const pts = [[ri, -w / 2], [r - c, -w / 2], [r, -w / 2 + c], [r, w / 2 - c], [r - c, w / 2], [ri, w / 2]].map((p) => new T.Vector2(p[0], p[1]));
    const geo = new T.LatheGeometry(pts, 44);
    geo.rotateX(Math.PI / 2);
    return geo;
  }
  function cyl(r, len, seg = 20) {
    const geo = new T.CylinderGeometry(r, r, len, seg);
    geo.rotateX(Math.PI / 2);
    return geo;
  }
  const UP = new V3(0, 1, 0);
  function rodBetween(a, b, r) {
    const va = new V3(...a), vb = new V3(...b);
    const geo = new T.CylinderGeometry(r, r, va.distanceTo(vb), 8);
    const m = new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(UP, vb.clone().sub(va).normalize()));
    geo.applyMatrix4(m);
    const mid = va.add(vb).multiplyScalar(0.5);
    geo.translate(mid.x, mid.y, mid.z);
    return geo;
  }

  /* ---------- pintura Marlboro (exceção registrada no CLAUDE.md) ----------
     A pintura é desenhada em canvas na vista lateral do carro (x, y em metros do modelo)
     e projetada de lado nas carenagens. O nome vai em adesivos à parte, para nunca espelhar. */
  const LIV = { x0: -2.45, x1: 2.45, y0: 0, y1: 1.1 };
  const livCanvas = document.createElement('canvas');
  livCanvas.width = 2048;
  livCanvas.height = Math.round(2048 * (LIV.y1 - LIV.y0) / (LIV.x1 - LIV.x0));
  const livTex = new T.CanvasTexture(livCanvas);
  livTex.anisotropy = 4;
  function drawLivery() {
    const c = livCanvas.getContext('2d');
    const W2 = livCanvas.width, H2 = livCanvas.height;
    const px = (x) => ((x - LIV.x0) / (LIV.x1 - LIV.x0)) * W2;
    const py = (y) => H2 - ((y - LIV.y0) / (LIV.y1 - LIV.y0)) * H2;
    const poly = (pts, color) => {
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(px(x), py(y)) : c.moveTo(px(x), py(y))));
      c.closePath();
      c.fillStyle = color;
      c.fill();
    };
    c.fillStyle = tok('--white');
    c.fillRect(0, 0, W2, H2);
    // o chevron: vermelho embaixo do bico, mergulha antes do sidepod e sobe em diagonal até a traseira
    poly([[2.5, -0.1], [2.5, 0.17], [1.0, 0.2], [0.5, 0.13], [-2.2, 0.95], [-2.5, 0.95], [-2.5, -0.1]], tok('--red-500'));
    livTex.needsUpdate = true;
  }
  drawLivery();

  // adesivo com o nome: canvas com texto, plano fino colado na superfície
  const decalTextures = [];
  function nameTexture(fg, bg) {
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 256;
    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 4;
    const draw = () => {
      const c = cv.getContext('2d');
      c.clearRect(0, 0, 1024, 256);
      if (bg) { c.fillStyle = bg; c.fillRect(0, 0, 1024, 256); }
      c.fillStyle = fg;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = `700 190px ${tok('--font-serif')}`;
      c.fillText('Marlboro', 512, 140, 980);
      tex.needsUpdate = true;
    };
    draw();
    decalTextures.push(draw);
    return tex;
  }
  const NAME_ON_RED = nameTexture(tok('--white'));
  const NAME_ON_WHITE = nameTexture(tok('--ink-900'));
  // a fonte serifada chega depois do primeiro desenho: redesenha quando estiver pronta
  if (document.fonts && document.fonts.load) {
    document.fonts.load(`700 190px ${tok('--font-serif')}`).then(() => decalTextures.forEach((d) => d())).catch(() => {});
  }

  // UV pela vista lateral: cada vértice pega a cor da pintura na sua posição (x, y) do carro
  function sideUV(geo, dx = 0, dy = 0) {
    const pos = geo.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) + dx - LIV.x0) / (LIV.x1 - LIV.x0);
      uv[i * 2 + 1] = (pos.getY(i) + dy - LIV.y0) / (LIV.y1 - LIV.y0);
    }
    geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
    return geo;
  }

  /* ---------- peças ---------- */
  const parts = {};
  const pickables = [];
  const baseMat = {
    body: new T.MeshStandardMaterial({ color: COLOR.paper, roughness: 0.55, metalness: 0.02 }),
    livery: new T.MeshStandardMaterial({ map: livTex, roughness: 0.38, metalness: 0.05 }),
    white: new T.MeshStandardMaterial({ color: new T.Color(tok('--white')), roughness: 0.4, metalness: 0.05 }),
    red: new T.MeshStandardMaterial({ color: COLOR.red, roughness: 0.4, metalness: 0.05 }),
    dark: new T.MeshStandardMaterial({ color: COLOR.ink, roughness: 0.85 }),
    metal: new T.MeshStandardMaterial({ color: COLOR.graphite, roughness: 0.35, metalness: 0.65 }),
    glass: new T.MeshBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.18 }),
  };

  function makePart(id, vec, anchors) {
    const group = new T.Group();
    car.add(group);
    const part = {
      id, group, vec: new V3(...vec), subs: {}, anchors,
      mats: {
        body: baseMat.body.clone(), livery: baseMat.livery.clone(), white: baseMat.white.clone(), red: baseMat.red.clone(),
        dark: baseMat.dark.clone(), metal: baseMat.metal.clone(), glass: baseMat.glass,
      },
      decalMats: [],
      edge: new T.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.9 }),
      heat: 0,
    };
    parts[id] = part;
    return part;
  }
  function sub(part, name, vec) {
    const g = new T.Group();
    part.group.add(g);
    part.subs[name] = { group: g, vec: new V3(...vec) };
    return g;
  }
  function add(part, parent, geo, matKey, pos = [0, 0, 0], rot = [0, 0, 0], edges = true) {
    const mesh = new T.Mesh(geo, part.mats[matKey]);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.userData.part = part.id;
    parent.add(mesh);
    pickables.push(mesh);
    if (edges) mesh.add(new T.LineSegments(new T.EdgesGeometry(geo, 24), part.edge));
    return mesh;
  }
  // adesivo: plano com o nome, levemente afastado da superfície (polygonOffset evita cintilar)
  function decal(part, parent, tex, w, h, pos, rot, order = 'XYZ') {
    const mat = new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    part.decalMats.push(mat);
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot, order);
    mesh.userData.part = part.id;
    parent.add(mesh);
    return mesh;
  }

  // Monocoque: célula de sobrevivência, cockpit, assoalho e suspensões
  const chassis = makePart('chassis', [0, 0.12, 0], [{ p: [0.55, 0.64, 0] }]);
  const monoTaper = (x) => (x < 0.6 ? 1 : 1 - 0.68 * Math.min(1, (x - 0.6) / 1.7));
  add(chassis, chassis.group, profile([[-0.55, 0.1], [1.0, 0.1], [1.8, 0.13], [2.25, 0.17], [2.32, 0.22], [2.22, 0.27], [1.6, 0.35], [0.95, 0.45], [0.75, 0.52], [0.15, 0.56], [-0.1, 0.62], [-0.55, 0.66]], 0.68, monoTaper), 'livery');
  chassis.group.children[chassis.group.children.length - 1].geometry = sideUV(chassis.group.children[chassis.group.children.length - 1].geometry);
  decal(chassis, chassis.group, NAME_ON_WHITE, 0.5, 0.125, [1.78, 0.347, 0], [-Math.PI / 2, 0, -0.128], 'ZYX'); // nome no bico
  add(chassis, chassis.group, box(0.72, 0.05, 0.4), 'dark', [0.3, 0.548, 0], [0, 0, 0.07]);              // abertura do cockpit
  add(chassis, chassis.group, new T.SphereGeometry(0.13, 20, 14), 'dark', [0.02, 0.66, 0], [0, 0, 0], false); // capacete, só volume
  add(chassis, chassis.group, box(0.03, 0.13, 0.4), 'glass', [0.74, 0.6, 0], [0, 0, -0.5]);              // para-brisa
  for (const z of [-1, 1]) {
    add(chassis, chassis.group, box(0.1, 0.05, 0.08), 'red', [0.56, 0.64, z * 0.4]);                    // retrovisores
    add(chassis, chassis.group, rodBetween([0.56, 0.6, z * 0.3], [0.56, 0.63, z * 0.38], 0.01), 'dark', [0, 0, 0], [0, 0, 0], false);
    // suspensão dianteira e traseira (braços em A)
    for (const y of [0.2, 0.36]) {
      add(chassis, chassis.group, rodBetween([1.25, y, z * 0.18], [1.45, y + 0.04, z * 0.66], 0.014), 'dark', [0, 0, 0], [0, 0, 0], false);
      add(chassis, chassis.group, rodBetween([1.65, y, z * 0.16], [1.45, y + 0.04, z * 0.66], 0.014), 'dark', [0, 0, 0], [0, 0, 0], false);
      add(chassis, chassis.group, rodBetween([-1.75, y, z * 0.2], [-1.55, y + 0.04, z * 0.56], 0.016), 'dark', [0, 0, 0], [0, 0, 0], false);
      add(chassis, chassis.group, rodBetween([-1.35, y, z * 0.22], [-1.55, y + 0.04, z * 0.56], 0.016), 'dark', [0, 0, 0], [0, 0, 0], false);
    }
  }
  add(chassis, chassis.group, box(3.7, 0.024, 1.28), 'dark', [-0.3, 0.085, 0]);                          // assoalho

  // Motor: carenagem (sobe mais) e o V6 turbo com câmbio (sobe menos)
  const engine = makePart('engine', [-0.1, 0, 0], [{ p: [-0.85, 0.42, 0.3], s: 'block' }, { p: [-0.85, 0.42, -0.3], s: 'block' }]);
  const cover = sub(engine, 'cover', [-0.35, 1.15, 0]);
  const block = sub(engine, 'block', [-0.55, 0.6, 0]);
  const coverTaper = (x) => (x > -0.9 ? 1 : 1 - 0.45 * Math.min(1, (-0.9 - x) / 1.15));
  add(engine, cover, profile([[-2.05, 0.3], [-0.55, 0.3], [-0.55, 0.66], [-0.58, 0.93], [-0.76, 0.96], [-0.96, 0.86], [-1.5, 0.62], [-2.0, 0.44]], 0.56, coverTaper), 'livery');
  cover.children[cover.children.length - 1].geometry = sideUV(cover.children[cover.children.length - 1].geometry);
  add(engine, cover, box(0.05, 0.13, 0.22), 'dark', [-0.555, 0.83, 0]);                                    // tomada de ar
  add(engine, block, box(1.0, 0.18, 0.34), 'metal', [-1.2, 0.26, 0]);                                       // cárter
  for (const s of [-1, 1]) {
    add(engine, block, box(0.92, 0.2, 0.15), 'metal', [-1.2, 0.42, s * 0.12], [s * 0.7, 0, 0]);             // bancadas a 80°
    add(engine, block, box(0.86, 0.04, 0.09), 'dark', [-1.2, 0.51, s * 0.2], [s * 0.7, 0, 0]);              // tampas de comando
    add(engine, block, cyl(0.09, 0.15), 'metal', [-0.82, 0.32, s * 0.33]);                                  // turbos
    add(engine, block, new T.TorusGeometry(0.085, 0.022, 8, 24), 'dark', [-0.82, 0.32, s * 0.41], [0, 0, 0], false);
    add(engine, block, rodBetween([-0.86, 0.3, s * 0.3], [-2.05, 0.36, s * 0.16], 0.032), 'dark', [0, 0, 0], [0, 0, 0], false); // escape
  }
  add(engine, block, box(0.55, 0.22, 0.28), 'metal', [-1.95, 0.27, 0]);                                     // câmbio

  // Sidepods (radiadores), um de cada lado
  const pod = makePart('pod', [0, -0.04, 0], [{ p: [-0.2, 0.47, 0.52], s: 'R' }, { p: [-0.2, 0.47, -0.52], s: 'L' }]);
  for (const [name, s] of [['R', 1], ['L', -1]]) {
    const g = sub(pod, name, [0.1, 0, s * 1.3]);
    add(pod, g, sideUV(profile([[-1.25, 0.11], [0.5, 0.11], [0.62, 0.16], [0.62, 0.4], [0.5, 0.46], [-0.6, 0.44], [-1.25, 0.28]], 0.36)), 'livery', [0, 0, s * 0.52]);
    decal(pod, g, NAME_ON_RED, 0.66, 0.165, [-0.45, 0.21, s * 0.703], [0, s > 0 ? 0 : Math.PI, 0]);          // nome na lateral
    add(pod, g, box(0.04, 0.22, 0.27), 'dark', [0.63, 0.28, s * 0.52]);                                     // entrada do radiador
  }

  // Rodas: pneu (torno), aro e cubo com raios para a rotação aparecer
  const spinners = [];
  function wheel(part, name, s, x, r, w, z, vec) {
    const g = sub(part, name, vec);
    g.position.set(x, r, s * z);
    const spin = new T.Group();
    g.add(spin);
    spinners.push(spin);
    add(part, spin, tire(r, w), 'dark');
    add(part, spin, cyl(r * 0.64, w * 0.9, 28), 'body');
    add(part, spin, cyl(r * 0.16, w * 1.04, 12), 'metal');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(part, spin, box(r * 0.5, 0.035, 0.02), 'dark', [Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, s * w * 0.46], [0, 0, a], false);
    }
  }
  // âncoras das rodas: no grupo de cada roda (origem = centro da roda), acima do pneu
  const wheelF = makePart('wheelF', [0, 0, 0], [{ p: [0, 0.4, 0], s: 'R' }, { p: [0, 0.4, 0], s: 'L' }]);
  wheel(wheelF, 'R', 1, 1.45, 0.32, 0.28, 0.8, [0.55, 0.05, 1.6]);
  wheel(wheelF, 'L', -1, 1.45, 0.32, 0.28, 0.8, [0.55, 0.05, -1.6]);
  const wheelR = makePart('wheelR', [0, 0, 0], [{ p: [0, 0.42, 0], s: 'R' }, { p: [0, 0.42, 0], s: 'L' }]);
  wheel(wheelR, 'R', 1, -1.55, 0.34, 0.42, 0.78, [-0.55, 0.05, 1.65]);
  wheel(wheelR, 'L', -1, -1.55, 0.34, 0.42, 0.78, [-0.55, 0.05, -1.65]);

  // Asas
  const wingF = makePart('wingF', [1.6, 0.05, 0], [{ p: [2.0, 0.3, 0] }]);
  add(wingF, wingF.group, box(0.5, 0.03, 1.8), 'white', [2.05, 0.1, 0]);
  add(wingF, wingF.group, box(0.32, 0.025, 1.7), 'red', [1.92, 0.17, 0], [0, 0, 0.28]);
  for (const s of [-1, 1]) add(wingF, wingF.group, box(0.6, 0.2, 0.025), 'red', [2.0, 0.17, s * 0.9]);
  const wingR = makePart('wingR', [-1.5, 0.55, 0], [{ p: [-2.15, 1.08, 0] }]);
  for (const s of [-1, 1]) {
    add(wingR, wingR.group, box(0.8, 0.62, 0.025), 'red', [-2.15, 0.72, s * 0.52]);
    decal(wingR, wingR.group, NAME_ON_RED, 0.7, 0.175, [-2.15, 0.62, s * 0.536], [0, s > 0 ? 0 : Math.PI, 0]); // nome nas placas laterais
  }
  const mainPlane = add(wingR, wingR.group, box(0.48, 0.03, 1.02), 'red', [-2.18, 0.92, 0], [0, 0, -0.12]);
  decal(wingR, mainPlane, NAME_ON_RED, 0.95, 0.24, [0, 0.017, 0], [-Math.PI / 2, 0, Math.PI / 2]);                 // nome em cima da asa
  add(wingR, wingR.group, box(0.26, 0.025, 1.02), 'white', [-1.97, 1.0, 0], [0, 0, -0.45]);
  add(wingR, wingR.group, box(0.42, 0.025, 0.95), 'white', [-2.3, 0.5, 0], [0, 0, -0.1]);
  add(wingR, wingR.group, box(0.3, 0.4, 0.03), 'dark', [-2.1, 0.62, 0]);

  /* ---------- cards ---------- */
  const labels = {};
  wrap.querySelectorAll('.car__labels li[data-part]').forEach((li) => { labels[li.dataset.part] = li; });

  let hot = null;
  function setHot(id) {
    if (hot === id) return;
    hot = id;
    Object.entries(labels).forEach(([pid, li]) => li.classList.toggle('is-hot', pid === id));
  }
  Object.entries(labels).forEach(([id, li]) => {
    li.addEventListener('pointerenter', () => setHot(id));
    li.addEventListener('pointerleave', () => setHot(null));
  });

  /* ---------- interação: arrastar e apontar ---------- */
  let dragYaw = 0, dragVel = 0, dragging = false, lastX = 0;
  const raycaster = new T.Raycaster();
  const ndc = new T.Vector2();
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; dragVel = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragYaw += dx * 0.009;
      dragVel = dx * 0.009;
      return;
    }
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    setHot(hit ? hit.object.userData.part : null);
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { if (!dragging) setHot(null); });

  /* ---------- tamanho ---------- */
  let W = 1, H = 1;
  function resize() {
    const r = wrap.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(wrap);
  resize();

  /* ---------- quadro a quadro ---------- */
  const angleOut = document.getElementById('car-angle');
  const tmp = new V3();
  let wheelAngle = 0, camR = 0, lookY = 0.5, last = performance.now(), running = false, kSmooth = 0;

  function placeCamera(el) {
    camera.position.set(0, lookY + camR * Math.sin(el), camR * Math.cos(el));
    camera.lookAt(0, lookY, 0);
    camera.updateMatrixWorld();
  }

  // caixa do carro (sem a plataforma) projetada na tela: quanto escalar a distância e onde fica o centro
  const bbox = new T.Box3();
  const corner = new V3();
  function projectedFit() {
    car.updateMatrixWorld(true);
    bbox.setFromObject(car);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? bbox.max.x : bbox.min.x, i & 2 ? bbox.max.y : bbox.min.y, i & 4 ? bbox.max.z : bbox.min.z).project(camera);
      minX = Math.min(minX, corner.x); maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y); maxY = Math.max(maxY, corner.y);
    }
    const scale = Math.max((maxX - minX) / 2 / 0.88, (maxY - minY) / 2 / 0.86);
    return { scale: clamp(scale, 0.6, 1.6), cy: (bbox.min.y + bbox.max.y) / 2 };
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const state = window.sennaCar || { p: 0, k: 0, speed: 0 };
    const p = state.p, k = state.k;
    kSmooth += (k - kSmooth) * Math.min(1, dt * 12);
    const ke = kSmooth;

    // giro: a rolagem dá a volta; o arraste soma (com inércia)
    if (!dragging) { dragYaw += dragVel; dragVel *= 0.92; }
    // uma volta completa com o carro montado; durante a desmontagem ele assenta numa vista 3/4 lateral
    const spinT = reduceMotion ? 1 : clamp(p / 0.44);
    const yaw = -0.55 + (spinT * spinT * (3 - 2 * spinT)) * Math.PI * 2 + 0.3 * ke + dragYaw;
    turntable.rotation.y = yaw;
    if (angleOut) angleOut.textContent = String(Math.round(((yaw * 180) / Math.PI % 360 + 360) % 360)).padStart(3, '0');

    // entrada: o carro sobe na plataforma
    const intro = reduceMotion ? 1 : clamp(p / 0.06);
    car.position.y = (1 - intro) * -0.4;
    car.scale.setScalar(0.9 + intro * 0.1);

    // rodas: giram com a velocidade da telemetria
    const omega = reduceMotion ? 0 : clamp(state.speed / 318) * 24;
    wheelAngle -= omega * dt;
    spinners.forEach((s) => { s.rotation.z = wheelAngle; });

    // explosão
    Object.values(parts).forEach((part) => {
      part.group.position.copy(part.vec).multiplyScalar(ke);
      Object.values(part.subs).forEach((s) => {
        if (!s.group.userData.base) s.group.userData.base = s.group.position.clone();
        s.group.position.copy(s.group.userData.base).addScaledVector(s.vec, ke);
      });
      // destaque: arestas e um brilho vermelho na peça apontada
      part.heat += ((hot === part.id ? 1 : 0) - part.heat) * Math.min(1, dt * 10);
      part.edge.color.copy(COLOR.ink).lerp(COLOR.red, part.heat);
      // nas partes vermelhas o destaque também clareia, para continuar visível
      ['body', 'livery', 'white', 'red', 'dark', 'metal'].forEach((m) => { part.mats[m].emissive.copy(COLOR.red).multiplyScalar(part.heat * 0.35); });
      part.decalMats.forEach((m) => { m.emissive.copy(COLOR.red).multiplyScalar(part.heat * 0.35); });
    });

    // câmera: sobe um pouco ao desmontar e, a cada quadro, aproxima ou afasta
    // até a caixa do carro projetada ocupar ~84% da largura ou ~74% da altura do palco
    const el = 0.17 + 0.22 * ke;
    if (!camR) camR = 9;
    placeCamera(el);
    const fit = projectedFit();
    const targetR = camR * fit.scale;
    camR += (targetR - camR) * Math.min(1, dt * 5);
    lookY += (fit.cy - lookY) * Math.min(1, dt * 5);
    placeCamera(el);

    renderer.render(scene, camera);
    placeLabels();
    requestAnimationFrame(frame);
  }

  // cada card segue a sua peça; em peças duplas (rodas, sidepods) fica no lado mais próximo da câmera
  function placeLabels() {
    scene.updateMatrixWorld();
    const placed = [];
    Object.values(parts).forEach((part) => {
      const li = labels[part.id];
      if (!li) return;
      let best = null, bestD = Infinity;
      part.anchors.forEach((a) => {
        // a âncora está nas coordenadas do grupo da peça (ou da sub-peça, quando a.s existe)
        const g = a.s ? part.subs[a.s].group : part.group;
        g.localToWorld(tmp.set(...a.p));
        const d = tmp.distanceTo(camera.position);
        if (d < bestD) { bestD = d; best = tmp.clone(); }
      });
      best.project(camera);
      const w2 = li.offsetWidth / 2 + 8;
      const x = clamp(((best.x + 1) / 2) * W, w2, W - w2);
      placed.push({ li, x, y: ((1 - best.y) / 2) * H, w: li.offsetWidth, h: li.offsetHeight });
    });

    // sem sobreposição: de baixo para cima, um card que encosta noutro já posicionado sobe acima dele
    const gap = 6, lift = 16;
    placed.sort((a, b) => b.y - a.y);
    const done = [];
    placed.forEach((c) => {
      let top = c.y - lift - c.h;
      for (let moved = true, n = 0; moved && n < 8; n++) {
        moved = false;
        for (const o of done) {
          const overlapX = Math.abs(c.x - o.x) < (c.w + o.w) / 2 + gap;
          const overlapY = top < o.top + o.h + gap && top + c.h > o.top - gap;
          if (overlapX && overlapY) { top = o.top - c.h - gap; moved = true; }
        }
      }
      top = clamp(top, 4, H - c.h - 4);
      done.push({ x: c.x, w: c.w, h: c.h, top });
      // o fio liga o card à peça, crescendo quando o card precisou subir
      c.li.style.setProperty('--wire', `${Math.max(lift, c.y - top - c.h).toFixed(0)}px`);
      c.li.style.transform = `translate(${(c.x - c.w / 2).toFixed(1)}px, ${top.toFixed(1)}px)`;
    });
  }

  // só desenha enquanto a seção está na tela
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    else if (!entry.isIntersecting) running = false;
  }, { rootMargin: '200px 0px' }).observe(wrap);
})();
