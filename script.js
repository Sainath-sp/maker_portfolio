(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  /* ---------- scroll progress + nav highlight ---------- */
  const bar = $('.progress span');
  const links = $$('.nav a');
  const secs = links.map(a => $(a.getAttribute('href')));
  let scrollP = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollP = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.width = scrollP * 100 + '%';
    let cur = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.rv').forEach(el => io.observe(el));

  /* ---------- 3D tilt on cards (pointer devices only) ---------- */
  if (matchMedia('(hover:hover)').matches && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .08s';
        el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(6px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transition = ''; el.style.transform = ''; });
    });
  }

  /* ---------- portrait parallax ---------- */
  const portrait = $('#portrait');
  let mx = 0, my = 0;
  addEventListener('pointermove', e => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
    if (portrait && !reduce) portrait.style.transform = `rotateY(${mx * 10}deg) rotateX(${-my * 8}deg)`;
  });

  /* =====================================================
     3D ROBOT ARM — joints are driven by scroll position
     ===================================================== */
  const canvas = $('#bg3d');
  let gl = false;
  try { gl = !!(window.THREE && document.createElement('canvas').getContext('webgl')); } catch (_) {}
  if (!gl) return;

  const C = { green: 0x2BFF88, yellow: 0xFFD23F, red: 0xFF4D6D, blue: 0x2E9BFF, white: 0xF4F7FB };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  /* lights */
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(5, 9, 7); scene.add(key);
  [[C.green, -7, 2, 4], [C.blue, 7, 3, 3], [C.red, 0, -1, 7]].forEach(([c, x, y, z]) => {
    const l = new THREE.PointLight(c, 160, 24, 2); l.position.set(x, y, z); scene.add(l);
  });

  /* materials */
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x172036, metalness: 0.55, roughness: 0.38 });
  const edgeMat = new THREE.LineBasicMaterial({ color: C.white, transparent: true, opacity: 0.45 });
  const glow = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.35 });

  function part(geo, mat = bodyMat) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, mat));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat));
    return g;
  }
  /* link: box standing along +Y from its pivot */
  function link(len, w, d = w) {
    const geo = new THREE.BoxGeometry(w, len, d); geo.translate(0, len / 2, 0);
    return part(geo);
  }
  /* joint: glowing cylinder whose axis is Z */
  function joint(color, r = 0.5, h = 0.8) {
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(r, r, h, 28); geo.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(geo, glow(color)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.02, 0.04, 8, 36), new THREE.MeshBasicMaterial({ color: C.white }));
    ring.position.z = h / 2; g.add(ring);
    const ring2 = ring.clone(); ring2.position.z = -h / 2; g.add(ring2);
    return g;
  }

  const L1 = 2.5, L2 = 2.3, L3 = 0.9;
  const root = new THREE.Group(); scene.add(root);

  /* base */
  const base = part(new THREE.CylinderGeometry(1.5, 1.7, 0.4, 36)); base.position.y = 0.2; root.add(base);
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.06, 8, 60), new THREE.MeshBasicMaterial({ color: C.green }));
  baseRing.rotation.x = Math.PI / 2; baseRing.position.y = 0.42; root.add(baseRing);

  /* kinematic chain */
  const yaw = new THREE.Group(); yaw.position.y = 0.4; root.add(yaw);
  const turret = part(new THREE.CylinderGeometry(0.8, 0.95, 0.9, 6)); turret.position.y = 0.45; yaw.add(turret);

  const shoulder = new THREE.Group(); shoulder.position.y = 1.15; yaw.add(shoulder);
  shoulder.add(joint(C.yellow, 0.55, 1.1));
  shoulder.add(link(L1, 0.6, 0.6));
  const sStripe = new THREE.Mesh(new THREE.BoxGeometry(0.62, L1 * 0.5, 0.62), glow(C.yellow)); sStripe.scale.set(1.01, 1, 0.3);
  sStripe.position.y = L1 * 0.5; shoulder.add(sStripe);

  const elbow = new THREE.Group(); elbow.position.y = L1; shoulder.add(elbow);
  elbow.add(joint(C.blue, 0.48, 0.95));
  elbow.add(link(L2, 0.48, 0.48));

  const wrist = new THREE.Group(); wrist.position.y = L2; elbow.add(wrist);
  wrist.add(joint(C.red, 0.38, 0.75));
  const roll = new THREE.Group(); wrist.add(roll);
  roll.add(link(L3, 0.34, 0.34));
  const hand = new THREE.Group(); hand.position.y = L3; roll.add(hand);
  const palm = part(new THREE.BoxGeometry(0.9, 0.2, 0.5)); hand.add(palm);
  const fingerGeo = new THREE.BoxGeometry(0.14, 0.7, 0.3); fingerGeo.translate(0, 0.35, 0);
  const fL = part(fingerGeo, glow(C.green)); const fR = part(fingerGeo, glow(C.green));
  fL.position.y = fR.position.y = 0.1; hand.add(fL, fR);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: C.yellow }));
  tip.position.y = 0.95; hand.add(tip);
  const tipLight = new THREE.PointLight(C.yellow, 25, 6, 2); tipLight.position.y = 1; hand.add(tipLight);

  /* floor: grid + spinning rings */
  const grid = new THREE.GridHelper(40, 40, C.blue, C.blue);
  grid.material.transparent = true; grid.material.opacity = 0.14; grid.position.y = -0.01; root.add(grid);
  const rings = new THREE.Group(); root.add(rings);
  [[3, C.green], [4.4, C.yellow], [5.8, C.blue]].forEach(([r, c], i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.035, 90, 1), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.01; m.userData.s = (i % 2 ? -1 : 1) * (0.1 + i * 0.05); rings.add(m);
    if (i === 1) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: c })); d.position.set(r, 0, 0); m.add(d); d.rotation.x = Math.PI / 2; }
  });

  /* floating particles */
  const N = 160, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const pal = [C.green, C.yellow, C.red, C.blue, C.white].map(h => new THREE.Color(h));
  for (let i = 0; i < N; i++) {
    pos.set([(Math.random() - 0.5) * 22, Math.random() * 12 - 2, (Math.random() - 0.5) * 12 - 2], i * 3);
    const c = pal[i % 5]; col.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.8 }));
  scene.add(pts);

  /* poses: [yaw, shoulder, elbow, wrist, roll, grip, arm-x]  one per page section */
  const POSES = [
    [ 0.30,  0.05, -0.55,  0.45,  0.0, 0.55,  1.0],  // hero
    [-0.60,  0.75, -1.30,  0.70,  1.2, 0.15, -4.6],  // skills
    [ 1.10, -0.45,  1.50, -0.85, -1.0, 0.85,  4.8],  // projects
    [-1.20,  0.95, -0.95,  1.00,  2.2, 0.10, -4.8],  // achievements
    [ 0.40, -0.70,  1.80, -1.10,  0.6, 0.70,  4.8],  // experience
    [ 0.00,  0.25, -0.45,  0.30,  0.0, 0.40,  0.0],  // contact
  ];
  const cur = POSES[0].slice();
  let smoothP = 0;

  function size() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    const narrow = w / h < 0.9;
    cam.position.set(0, 2.4, narrow ? 19 : 14.5);
    cam.updateProjectionMatrix();
    root.position.y = narrow ? -4.6 : -5.2;
    root.scale.setScalar(narrow ? 0.85 : 1.3);
  }
  addEventListener('resize', size); size();

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    smoothP = lerp(smoothP, scrollP, reduce ? 1 : 0.07);
    const n = POSES.length - 1, f = smoothP * n, i = Math.min(n - 1, Math.floor(f)), k = smooth(f - i);
    const narrow = innerWidth / innerHeight < 0.9;
    for (let j = 0; j < 7; j++) cur[j] = lerp(POSES[i][j], POSES[i + 1][j], k);
    const idle = reduce ? 0 : 1;

    yaw.rotation.y = cur[0] + Math.sin(t * 0.5) * 0.08 * idle;
    shoulder.rotation.z = cur[1] + Math.sin(t * 0.9) * 0.05 * idle;
    elbow.rotation.z = cur[2] + Math.sin(t * 1.1 + 1) * 0.07 * idle;
    wrist.rotation.z = cur[3] + Math.sin(t * 1.4) * 0.12 * idle;
    roll.rotation.y = cur[4] + t * 0.4 * idle;
    fL.position.x = -0.12 - cur[5] * 0.28; fR.position.x = 0.12 + cur[5] * 0.28;
    root.position.x = narrow ? 0 : lerp(root.position.x, cur[6], 0.12);

    baseRing.material.color.setHex([C.green, C.yellow, C.red, C.blue][Math.floor(smoothP * 4.999) % 4]);
    rings.children.forEach(r => (r.rotation.z += r.userData.s * 0.01 * idle));
    pts.rotation.y = t * 0.02 * idle; pts.position.y = -smoothP * 3;

    cam.position.x = Math.sin(smoothP * Math.PI * 2) * 1.6 + mx * 0.8;
    cam.position.y = 2.4 + smoothP * 1.2 - my * 0.5;
    cam.lookAt(0, 0.4, 0);

    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  frame();
})();
