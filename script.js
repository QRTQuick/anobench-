// ---- 3D Background Animation ----
(function(){
  const wrap = document.getElementById('canvas-wrap');
  let width = window.innerWidth, height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, width/height, 0.1, 100);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  wrap.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c93ff, 0.6);
  rim.position.set(-5, -3, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x4cc98a, 0.4);
  fill.position.set(-4, 4, 3);
  scene.add(fill);

  const markGroup = new THREE.Group();
  scene.add(markGroup);

  const greenMat = new THREE.MeshStandardMaterial({ color:0x2E9A63, metalness:0.4, roughness:0.28, emissive:0x0B3A22, emissiveIntensity:0.25 });
  const blueMat  = new THREE.MeshStandardMaterial({ color:0x5C77F5, metalness:0.45, roughness:0.24, emissive:0x121B4A, emissiveIntensity:0.3 });

  const extrudeSettings = { depth:0.34, bevelEnabled:true, bevelThickness:0.035, bevelSize:0.035, bevelSegments:3 };

  function makeRing(rOuter, rInner){
    const shape = new THREE.Shape();
    shape.absarc(0,0,rOuter,0,Math.PI*2,false);
    const hole = new THREE.Path();
    hole.absarc(0,0,rInner,0,Math.PI*2,true);
    shape.holes.push(hole);
    return shape;
  }
  const ringShape = makeRing(3.05, 2.78);
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth:0.22, bevelEnabled:true, bevelThickness:0.03, bevelSize:0.03, bevelSegments:2 });
  const ring = new THREE.Mesh(ringGeo, greenMat);
  ring.position.z = -0.11;
  markGroup.add(ring);

  const aShape = new THREE.Shape();
  aShape.moveTo(-0.05, 1.9);
  aShape.lineTo(1.55, -1.75);
  aShape.lineTo(0.85, -1.75);
  aShape.lineTo(0.15, -0.35);
  aShape.lineTo(-0.05, -0.55);
  aShape.lineTo(0.35, -0.95);
  aShape.lineTo(-0.55, 0.35);
  aShape.lineTo(-0.15, -0.05);
  aShape.lineTo(-1.05, -1.75);
  aShape.lineTo(-1.65, -1.75);
  aShape.lineTo(-0.05, 1.9);
  const aGeo = new THREE.ExtrudeGeometry(aShape, extrudeSettings);
  const aMesh = new THREE.Mesh(aGeo, greenMat);
  aMesh.position.set(-0.35, -0.05, 0);
  aMesh.scale.set(0.72, 0.72, 1);
  markGroup.add(aMesh);

  function makeBar(w, h, skew){
    const shape = new THREE.Shape();
    shape.moveTo(0,0);
    shape.lineTo(w, 0);
    shape.lineTo(w - skew, h);
    shape.lineTo(0, h);
    shape.lineTo(0,0);
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }
  const bar1 = new THREE.Mesh(makeBar(1.9, 0.62, 0.28), blueMat);
  bar1.position.set(0.15, 0.62, 0);
  markGroup.add(bar1);

  const bar2 = new THREE.Mesh(makeBar(1.55, 0.55, 0.24), blueMat);
  bar2.position.set(0.15, -0.35, 0);
  markGroup.add(bar2);

  markGroup.scale.set(1.0, 1.0, 1.0);
  markGroup.rotation.y = -0.15;

  let clock = new THREE.Clock();

  function resize(){
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resize);

  // ---- Scroll-driven X rotation across the WHOLE page ----
  let targetRotX = 0;
  let currentRotX = 0;

  function onScroll(){
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY || doc.scrollTop;
    const progress = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
    targetRotX = progress * Math.PI * 3.4;
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    currentRotX += (targetRotX - currentRotX) * 0.06;
    markGroup.rotation.x = currentRotX;
    markGroup.rotation.y = -0.15 + Math.sin(t * 0.2) * 0.15;
    markGroup.position.y = Math.sin(t * 0.5) * 0.1;

    renderer.render(scene, camera);
  }
  animate();
})();

// ---- Scroll reveal ----
(function(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
  items.forEach(el=> io.observe(el));
})();

// ---- Nav mobile menu ----
(function(){
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', ()=>{
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> mobileMenu.classList.remove('open'));
  });
})();

// ---- Theme toggle (persisted) ----
(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  
  // Initialize theme
  const saved = localStorage.getItem('anobench-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  
  function updateIcon(){
    const theme = root.getAttribute('data-theme');
    icon.src = theme === 'dark'
      ? 'https://img.icons8.com/ios-filled/50/moon-symbol.png'
      : 'https://img.icons8.com/ios-filled/50/sun--v1.png';
  }
  
  updateIcon();
  
  toggle.addEventListener('click', ()=>{
    root.classList.add('theme-transitioning');
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('anobench-theme', next);
    updateIcon();
    setTimeout(() => root.classList.remove('theme-transitioning'), 400);
  });
})();
