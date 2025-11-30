// ==========================================================================
// THREE.JS GALAXY BACKGROUND + PLANET WORLDS + AUDIO + INTERACTIONS
// ==========================================================================

const prefersReducedMotionWebGL = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;

let dvScene, dvCamera, dvRenderer;
let dvGalaxyGroup, dvGalaxyPointsCore, dvGalaxyPointsHalo, dvStarsPoints;
let dvParticleTexture = null;
let dvViewportWidth = window.innerWidth;
let dvViewportHeight = window.innerHeight;
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

let focusWorlds = [];
let raycaster, pointer, hoveredWorld = null;

let bgAudio = null;
let audioInitialized = false;

const cursorBursts = [];
const MAX_BURSTS = 6;

const comets = [];
const MAX_COMETS = 10;
let lastCometTime = 0;

const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// Planet configs (ringed planet will look like Saturn)
const worldConfigs = [
  {
    name: "Intelligence & Infrastructure",
    section: "#focus-areas",
    angle: 0,
    color: 0x1f3b7a,
    emissive: 0x1e3a8a,
    ringColor: 0x9ca3ff,      // gas giant with ring
    moonCount: 0,
    planetRadius: 0.39,
    style: "gas",
  },
  {
    name: "Planetary Systems",
    section: "#focus-areas",
    angle: Math.PI * 0.4,
    color: 0x0f766e,
    emissive: 0x115e59,
    ringColor: null,
    moonCount: 1,
    planetRadius: 0.34,
    style: "rocky",
  },
  {
    name: "Bio & Materials",
    section: "#focus-areas",
    angle: Math.PI * 0.8,
    color: 0x9d174d,
    emissive: 0xbe185d,
    ringColor: null,
    moonCount: 2,             // two moons, clearly different sizes
    planetRadius: 0.26,
    style: "rocky",
  },
  {
    name: "Finance & Coordination",
    section: "#focus-areas",
    angle: Math.PI * 1.2,
    color: 0x4c1d95,
    emissive: 0x5b21b6,
    ringColor: null,
    moonCount: 0,
    planetRadius: 0.32,
    style: "gas",
  },
  {
    name: "Signals & Updates",
    section: "#updates",
    angle: Math.PI * 1.6,
    color: 0x9d7a0d,
    emissive: 0x7f6000,
    ringColor: null,
    moonCount: 1,
    planetRadius: 0.28,
    style: "ocean",
  },
];

// --------------------------------------------------------------------------
// Audio
// --------------------------------------------------------------------------
function setupGalaxyAudio() {
  const el = document.getElementById("dv-audio");
  if (!el) return;

  bgAudio = el;
  bgAudio.loop = true;
  bgAudio.volume = 0.35;

  const tryPlay = () => {
    if (audioInitialized || !bgAudio) return;
    audioInitialized = true;

    const p = bgAudio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }

    window.removeEventListener("pointerdown", tryPlay);
    window.removeEventListener("keydown", tryPlay);
  };

  window.addEventListener("pointerdown", tryPlay, { once: true });
  window.addEventListener("keydown", tryPlay, { once: true });
}

// --------------------------------------------------------------------------
// Helper: radial particle texture
// --------------------------------------------------------------------------
function createParticleTexture(size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const center = size / 2;
  const r = size / 2;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, r);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.6, "rgba(160,190,255,0.25)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  return texture;
}

// --------------------------------------------------------------------------
// Helper: planet textures (gas / rocky / ocean-ish)
// --------------------------------------------------------------------------
function createPlanetTexture(mainColorHex, style = "gas") {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const mainColor = new THREE.Color(mainColorHex);
  const lighter = mainColor.clone().offsetHSL(0, 0.06, 0.12);
  const darker = mainColor.clone().offsetHSL(0, -0.06, -0.12);

  // Base fill
  ctx.fillStyle = mainColor.getStyle();
  ctx.fillRect(0, 0, size, size);

  if (style === "gas") {
    // Stripy gas giant
    const bandCount = 9;
    const bandHeight = size / bandCount;
    for (let i = 0; i < bandCount; i++) {
      const t = i / (bandCount - 1 || 1);
      const c = lighter.clone().lerp(darker, t);
      ctx.fillStyle = `rgba(${Math.round(c.r * 255)}, ${Math.round(
        c.g * 255
      )}, ${Math.round(c.b * 255)}, 0.45)`;

      const y = i * bandHeight + (Math.random() - 0.5) * 12;
      const h = bandHeight * (0.7 + Math.random() * 0.6);
      ctx.beginPath();
      ctx.rect(-30, y, size + 60, h);
      ctx.fill();
    }

    // A few bigger storms
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 16 + Math.random() * 26;
      const alpha = 0.15 + Math.random() * 0.2;
      const c = lighter.clone().lerp(darker, Math.random());
      ctx.fillStyle = `rgba(${Math.round(c.r * 255)}, ${Math.round(
        c.g * 255
      )}, ${Math.round(c.b * 255)}, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        radius * (0.8 + Math.random() * 0.4),
        radius,
        (Math.random() - 0.5) * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  } else if (style === "rocky") {
    // Rocky continents / craters
    ctx.fillStyle = mainColor.getStyle();
    ctx.fillRect(0, 0, size, size);

    const patchCount = 70;
    for (let i = 0; i < patchCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 10 + Math.random() * 40;
      const alpha = 0.25 + Math.random() * 0.25;
      const c = lighter.clone().lerp(darker, Math.random());
      ctx.fillStyle = `rgba(${Math.round(c.r * 255)}, ${Math.round(
        c.g * 255
      )}, ${Math.round(c.b * 255)}, ${alpha})`;

      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        radius * (0.7 + Math.random() * 0.6),
        radius * (0.4 + Math.random() * 0.6),
        (Math.random() - 0.5) * 1.0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Small craters
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 5 + Math.random() * 12;
      ctx.strokeStyle = `rgba(15,23,42,0.45)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (style === "ocean") {
    // Ocean / ice world
    const ocean = mainColor.clone();
    const shallow = mainColor.clone().offsetHSL(0.02, 0.1, 0.18);
    const ice = new THREE.Color(0xe5f2ff);

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, shallow.getStyle());
    grad.addColorStop(0.5, ocean.getStyle());
    grad.addColorStop(1, darker.getStyle());
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Ice caps
    ctx.fillStyle = `rgba(229,242,255,0.6)`;
    ctx.beginPath();
    ctx.ellipse(size / 2, size * 0.12, size * 0.45, size * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size / 2, size * 0.88, size * 0.45, size * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cloudy streaks
    ctx.strokeStyle = `rgba(255,255,255,0.35)`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(-30, y);
      ctx.quadraticCurveTo(
        size * (0.3 + Math.random() * 0.4),
        y + (Math.random() - 0.5) * 30,
        size + 30,
        y + (Math.random() - 0.5) * 20
      );
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

// --------------------------------------------------------------------------
// Helper: Saturn-style ring texture (soft fade inside/outside)
// --------------------------------------------------------------------------
function createRingTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const rOuter = size * 0.48;
  const rInner = size * 0.32;

  const gradient = ctx.createRadialGradient(center, center, rInner, center, center, rOuter);
  gradient.addColorStop(0.0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.2, "rgba(209,213,255,0.4)");
  gradient.addColorStop(0.6, "rgba(199,210,254,0.75)");
  gradient.addColorStop(1.0, "rgba(15,23,42,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, rOuter, 0, Math.PI * 2);
  ctx.arc(center, center, rInner, 0, Math.PI * 2, true);
  ctx.fill("evenodd");

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

// --------------------------------------------------------------------------
// Init
// --------------------------------------------------------------------------
function initThreeScene() {
  if (prefersReducedMotionWebGL) return;
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("dv-scene");
  if (!canvas) return;

  dvRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  dvRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  dvRenderer.setSize(dvViewportWidth, dvViewportHeight);

  dvScene = new THREE.Scene();

  dvCamera = new THREE.PerspectiveCamera(
    45,
    dvViewportWidth / dvViewportHeight,
    0.1,
    120
  );
  dvCamera.position.set(0, 0, 10);
  dvScene.add(dvCamera);

  const ambient = new THREE.AmbientLight(0x7f8cff, 0.8);
  dvScene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(4, 6, 8);
  dvScene.add(dir);

  dvParticleTexture = createParticleTexture(64);

  createGalaxy();
  createFocusWorlds();
  createFarStars();

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2(0, 0);

  window.addEventListener("resize", onThreeResize);
  lastScrollY = window.scrollY;
  window.addEventListener("scroll", onScrollUpdate, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown);

  setupGalaxyAudio();
  animateThree();
}

// --------------------------------------------------------------------------
// Galaxy
// --------------------------------------------------------------------------
function createGalaxy() {
  dvGalaxyGroup = new THREE.Group();
  dvGalaxyGroup.position.set(0, 0, 0);
  dvScene.add(dvGalaxyGroup);

  const coreCount = 4500;
  const corePositions = new Float32Array(coreCount * 3);
  const coreColors = new Float32Array(coreCount * 3);
  const coreInner = new THREE.Color(0x4f8bff);
  const coreOuter = new THREE.Color(0x8b5cf6);

  const branches = 5;
  const spin = 1.1;
  const randomness = 0.6;

  for (let i = 0; i < coreCount; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 5.0;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    const spinAngle = radius * spin;

    const randomX =
      (Math.random() - 0.5) * randomness * radius * (Math.random() * 0.8 + 0.2);
    const randomY =
      (Math.random() - 0.5) * randomness * radius * (Math.random() * 0.8 + 0.2);
    const randomZ =
      (Math.random() - 0.5) * randomness * radius * (Math.random() * 0.8 + 0.2);

    corePositions[i3    ] =
      Math.cos(branchAngle + spinAngle) * radius + randomX;
    corePositions[i3 + 1] = randomY * 0.7;
    corePositions[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = coreInner.clone();
    mixedColor.lerp(coreOuter, radius / 5.0);

    coreColors[i3    ] = mixedColor.r;
    coreColors[i3 + 1] = mixedColor.g;
    coreColors[i3 + 2] = mixedColor.b;
  }

  const coreGeometry = new THREE.BufferGeometry();
  coreGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(corePositions, 3)
  );
  coreGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(coreColors, 3)
  );

  const coreMaterial = new THREE.PointsMaterial({
    size: 0.06,
    map: dvParticleTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    opacity: 0.95,
  });

  dvGalaxyPointsCore = new THREE.Points(coreGeometry, coreMaterial);
  dvGalaxyGroup.add(dvGalaxyPointsCore);

  const haloCount = 2500;
  const haloPositions = new Float32Array(haloCount * 3);
  const haloColors = new Float32Array(haloCount * 3);
  const haloInner = new THREE.Color(0x1d4ed8);
  const haloOuter = new THREE.Color(0x020617);

  for (let i = 0; i < haloCount; i++) {
    const i3 = i * 3;
    const radius = 5.0 + Math.random() * 4.0;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.6;

    haloPositions[i3    ] = radius * Math.cos(phi) * Math.cos(theta);
    haloPositions[i3 + 1] = radius * Math.sin(phi) * 0.7;
    haloPositions[i3 + 2] = radius * Math.cos(phi) * Math.sin(theta);

    const t = (radius - 5.0) / 4.0;
    const mixedColor = haloInner.clone().lerp(haloOuter, t);

    haloColors[i3    ] = mixedColor.r;
    haloColors[i3 + 1] = mixedColor.g;
    haloColors[i3 + 2] = mixedColor.b;
  }

  const haloGeometry = new THREE.BufferGeometry();
  haloGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(haloPositions, 3)
  );
  haloGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(haloColors, 3)
  );

  const haloMaterial = new THREE.PointsMaterial({
    size: 0.1,
    map: dvParticleTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    opacity: 0.35,
  });

  dvGalaxyPointsHalo = new THREE.Points(haloGeometry, haloMaterial);
  dvGalaxyGroup.add(dvGalaxyPointsHalo);
}

// --------------------------------------------------------------------------
// Far stars
// --------------------------------------------------------------------------
function createFarStars() {
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 25 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3    ] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.cos(phi);
    positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x9ca3af,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  dvStarsPoints = new THREE.Points(geom, mat);
  dvScene.add(dvStarsPoints);
}

// --------------------------------------------------------------------------
// Planets & rings & moons
// --------------------------------------------------------------------------
function createPlanetWorld(config) {
  const group = new THREE.Group();
  const radius = config.planetRadius || 0.4;
  const planetTexture = createPlanetTexture(config.color, config.style || "gas");

  const planetGeo = new THREE.SphereGeometry(radius, 64, 64);
  const planetMat = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.emissive,
    emissiveIntensity: 0.45,
    metalness: 0.05,
    roughness: 0.85,
    map: planetTexture,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  group.add(planet);

  // Saturn-style ring for ringed planet
  if (config.ringColor) {
    const innerR = radius * 1.6;
    const outerR = radius * 2.7;
    const ringGeo = new THREE.RingGeometry(innerR, outerR, 80, 1);
    const ringTex = createRingTexture();
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.4;
    ringMesh.rotation.z = Math.PI / 4;
    group.add(ringMesh);
  }

  // Moons: clearly different sizes
  const moonCount = config.moonCount || 0;
  for (let i = 0; i < moonCount; i++) {
    const base = 0.03;
    // For 2 moons: one big, one small; otherwise random in range
    const moonRadius =
      moonCount === 2
        ? (i === 0 ? base * 1.8 : base * 0.8)
        : base + Math.random() * 0.07;

    const moonGeo = new THREE.SphereGeometry(moonRadius, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      emissive: 0x6b7280,
      emissiveIntensity: 0.35,
      metalness: 0.02,
      roughness: 0.9,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);

    const angle = (i / (moonCount || 1)) * Math.PI * 2 + 0.7;
    const dist = radius * (2.1 + (moonCount === 2 ? i * 0.7 : Math.random() * 0.4));
    moon.position.set(
      Math.cos(angle) * dist,
      Math.sin(angle) * 0.55,
      0.12 + i * 0.06
    );

    group.add(moon);
  }

  group.userData.baseEmissiveIntensity = 0.45;
  return group;
}

function createFocusWorlds() {
  const worldGroup = new THREE.Group();
  dvGalaxyGroup.add(worldGroup);

  worldConfigs.forEach((config, index) => {
    const meshGroup = createPlanetWorld(config);

    const orbitRadius = 3.8;
    const angle = config.angle;

    meshGroup.position.set(
      Math.cos(angle) * orbitRadius,
      Math.sin(angle) * 0.7,
      Math.sin(angle) * orbitRadius * 0.4
    );

    const label = document.createElement("div");
    label.className = "world-label";
    label.textContent = config.name;
    document.body.appendChild(label);

    meshGroup.userData = {
      name: config.name,
      section: config.section,
      baseScale: 1,
      index,
      labelEl: label,
      baseEmissiveIntensity: 0.45,
    };

    worldGroup.add(meshGroup);
    focusWorlds.push(meshGroup);
  });
}

// --------------------------------------------------------------------------
// Burst & comet particles (purple)
// --------------------------------------------------------------------------
function createBurstAt(position) {
  if (!dvParticleTexture) return;

  const count = 90;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  const colors = new Float32Array(count * 3);

  const colorInner = new THREE.Color(0xc4b5fd);
  const colorOuter = new THREE.Color(0x4f46e5);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const dir = new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5),
      (Math.random() - 0.5)
    ).normalize();

    const speed = 2 + Math.random() * 4;
    const vel = dir.multiplyScalar(speed);
    velocities.push(vel);

    positions[i3    ] = 0;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;

    const t = Math.random();
    const c = colorInner.clone().lerp(colorOuter, t);
    colors[i3    ] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.09,
    map: dvParticleTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    opacity: 1,
  });

  const points = new THREE.Points(geom, mat);
  points.position.copy(position);

  dvScene.add(points);

  cursorBursts.push({
    points,
    velocities,
    life: 0,
    maxLife: 1.1 + Math.random() * 0.4,
  });

  if (cursorBursts.length > MAX_BURSTS) {
    const oldest = cursorBursts.shift();
    if (oldest && oldest.points) {
      dvScene.remove(oldest.points);
      oldest.points.geometry.dispose();
      oldest.points.material.dispose();
    }
  }
}

function createCometAt(position, direction) {
  if (!dvParticleTexture) return;

  const count = 45;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  const colors = new Float32Array(count * 3);

  const colorHead = new THREE.Color(0xf9fafb);
  const colorTail = new THREE.Color(0xa855f7);

  const dirNorm = direction.clone().normalize().multiplyScalar(4);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = i / (count - 1 || 1);

    const jitter = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );

    const vel = dirNorm.clone().multiplyScalar(0.5 + 0.5 * (1 - t)).add(jitter);
    velocities.push(vel);

    positions[i3    ] = -dirNorm.x * t * 0.1;
    positions[i3 + 1] = -dirNorm.y * t * 0.1;
    positions[i3 + 2] = -dirNorm.z * t * 0.1;

    const c = colorHead.clone().lerp(colorTail, t);
    colors[i3    ] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.08,
    map: dvParticleTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    opacity: 0.95,
  });

  const points = new THREE.Points(geom, mat);
  points.position.copy(position);

  dvScene.add(points);

  comets.push({
    points,
    velocities,
    life: 0,
    maxLife: 1.5 + Math.random() * 0.6,
  });

  if (comets.length > MAX_COMETS) {
    const oldest = comets.shift();
    if (oldest && oldest.points) {
      dvScene.remove(oldest.points);
      oldest.points.geometry.dispose();
      oldest.points.material.dispose();
    }
  }
}

// --------------------------------------------------------------------------
// Events
// --------------------------------------------------------------------------
function onThreeResize() {
  dvViewportWidth = window.innerWidth;
  dvViewportHeight = window.innerHeight;
  if (!dvRenderer || !dvCamera) return;
  dvRenderer.setSize(dvViewportWidth, dvViewportHeight);
  dvCamera.aspect = dvViewportWidth / dvViewportHeight;
  dvCamera.updateProjectionMatrix();
}

function onScrollUpdate() {
  const y = window.scrollY;
  scrollVelocity = (y - lastScrollY) * 0.001;
  lastScrollY = y;
}

function onPointerMove(event) {
  if (!dvCamera || !raycaster) return;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const now = performance.now();
  if (now - lastCometTime > 80) {
    lastCometTime = now;
    raycaster.setFromCamera(pointer, dvCamera);
    const hitPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(interactionPlane, hitPoint);
    if (hitPoint) {
      createCometAt(hitPoint, raycaster.ray.direction);
    }
  }
}

function onPointerDown() {
  if (!dvCamera || !raycaster) return;

  // 1) Immer einen Burst an der Klickposition erzeugen
  raycaster.setFromCamera(pointer, dvCamera);
  const planeHit = new THREE.Vector3();
  raycaster.ray.intersectPlane(interactionPlane, planeHit);
  if (planeHit) {
    createBurstAt(planeHit);
  }

  // 2) Explizit schauen, ob wir einen Planet getroffen haben
  if (!focusWorlds.length) return;

  const intersects = raycaster.intersectObjects(focusWorlds, true);
  if (!intersects.length) return;

  // Nächstes getroffenen Mesh nach oben „hochklettern“, bis wir bei einem
  // der Planet-Groups (focusWorlds) sind:
  let obj = intersects[0].object;
  while (obj && obj.parent && !focusWorlds.includes(obj)) {
    obj = obj.parent;
  }

  if (!focusWorlds.includes(obj)) return;

  const targetSection = obj.userData && obj.userData.section;
  if (targetSection && typeof smoothScrollTo === "function") {
    smoothScrollTo(targetSection);
  }
}

// --------------------------------------------------------------------------
// Animation loop
// --------------------------------------------------------------------------
function animateThree() {
  if (!dvRenderer || !dvScene || !dvCamera || !dvGalaxyGroup) return;

  requestAnimationFrame(animateThree);

  const time = performance.now() * 0.001;
  const docHeight =
    document.body.scrollHeight - window.innerHeight || window.innerHeight;
  const scrollProgress =
    docHeight > 0 ? window.scrollY / docHeight : 0;

  const baseZ = 10;
  const targetZ = baseZ - scrollProgress * 4;
  dvCamera.position.z += (targetZ - dvCamera.position.z) * 0.05;

  const baseY = Math.sin(time * 0.07) * 0.3;
  const targetY = baseY + (scrollProgress - 0.5) * 1.6;
  dvCamera.position.y += (targetY - dvCamera.position.y) * 0.05;

  const targetGX = pointer.x * 0.6;
  const targetGY = pointer.y * 0.4;
  dvGalaxyGroup.position.x += (targetGX - dvGalaxyGroup.position.x) * 0.06;
  dvGalaxyGroup.position.y += (targetGY - dvGalaxyGroup.position.y) * 0.06;

  scrollVelocity *= 0.92;

  const slowSpin = 0.003;
  const wobbleX = Math.sin(time * 0.35) * 0.08;
  const wobbleY = Math.cos(time * 0.22) * 0.04;

  dvGalaxyGroup.rotation.y += slowSpin + scrollVelocity * 0.8;
  dvGalaxyGroup.rotation.x = wobbleX + scrollProgress * 0.35;
  dvGalaxyGroup.rotation.z = wobbleY * 0.7;

  if (dvGalaxyPointsHalo && dvGalaxyPointsHalo.material) {
    const haloMat = dvGalaxyPointsHalo.material;
    haloMat.opacity = 0.28 + Math.sin(time * 0.6) * 0.08;
    haloMat.size = 0.1 + Math.sin(time * 0.9) * 0.02;
  }

  if (dvGalaxyPointsCore && dvGalaxyPointsCore.material) {
    const coreMat = dvGalaxyPointsCore.material;
    coreMat.size = 0.055 + Math.sin(time * 1.3) * 0.012;
  }

  if (dvStarsPoints) {
    dvStarsPoints.rotation.y -= 0.0006;
  }

  const pulseTime = performance.now() * 0.001;
  focusWorlds.forEach((meshGroup) => {
    const pulse =
      1 + Math.sin(pulseTime * 2.0 + meshGroup.userData.index) * 0.06;
    const targetScale =
      hoveredWorld === meshGroup ? meshGroup.userData.baseScale * 1.6 : pulse;
    meshGroup.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.18
    );

    meshGroup.rotation.y += 0.003;

    const highlight = hoveredWorld === meshGroup
      ? 0.9
      : meshGroup.userData.baseEmissiveIntensity;

    meshGroup.traverse((child) => {
      if (
        child.isMesh &&
        child.material &&
        child.material.emissive !== undefined
      ) {
        const mat = child.material;
        mat.emissiveIntensity += (highlight - mat.emissiveIntensity) * 0.2;
      }
    });

    const label = meshGroup.userData.labelEl;
    if (label) {
      const worldPos = new THREE.Vector3();
      meshGroup.getWorldPosition(worldPos);
      const projected = worldPos.clone().project(dvCamera);

      if (projected.z > -1 && projected.z < 1) {
        const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

        let opacity = 0.7;
        if (hoveredWorld === meshGroup) opacity = 1.0;
        label.style.opacity = opacity.toFixed(2);
      } else {
        label.style.opacity = "0";
      }
    }
  });

  const dt = 0.016;

  for (let i = cursorBursts.length - 1; i >= 0; i--) {
    const burst = cursorBursts[i];
    burst.life += dt;
    const t = burst.life / burst.maxLife;

    if (!burst.points || !burst.points.geometry) continue;

    const geom = burst.points.geometry;
    const positions = geom.attributes.position.array;

    for (let j = 0; j < burst.velocities.length; j++) {
      const v = burst.velocities[j];
      const idx = j * 3;
      positions[idx    ] += v.x * dt;
      positions[idx + 1] += v.y * dt;
      positions[idx + 2] += v.z * dt;
    }

    geom.attributes.position.needsUpdate = true;

    const mat = burst.points.material;
    mat.opacity = Math.max(0, 1 - t);

    if (burst.life >= burst.maxLife) {
      dvScene.remove(burst.points);
      burst.points.geometry.dispose();
      burst.points.material.dispose();
      cursorBursts.splice(i, 1);
    }
  }

  for (let i = comets.length - 1; i >= 0; i--) {
    const comet = comets[i];
    comet.life += dt;
    const t = comet.life / comet.maxLife;

    if (!comet.points || !comet.points.geometry) continue;

    const geom = comet.points.geometry;
    const positions = geom.attributes.position.array;

    for (let j = 0; j < comet.velocities.length; j++) {
      const v = comet.velocities[j];
      const idx = j * 3;
      positions[idx    ] += v.x * dt;
      positions[idx + 1] += v.y * dt;
      positions[idx + 2] += v.z * dt;
    }

    geom.attributes.position.needsUpdate = true;

    const mat = comet.points.material;
    mat.opacity = Math.max(0, 0.9 * (1 - t));

    if (comet.life >= comet.maxLife) {
      dvScene.remove(comet.points);
      comet.points.geometry.dispose();
      comet.points.material.dispose();
      comets.splice(i, 1);
    }
  }

  dvRenderer.render(dvScene, dvCamera);
}
