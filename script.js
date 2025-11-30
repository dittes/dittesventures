// ==== PORTFOLIO DATA =======================================================
const portfolioData = [
  {
    id: "intelligence-infrastructure",
    name: "Intelligence & Infrastructure",
    tagline: "The rails for decision-making, compute, and data.",
    companies: [
      {
        name: "Signalframe",
        description:
          "Continuous intelligence engine turning noisy operational data into real-time decisions.",
        stage: "Seed",
        region: "Europe",
        focus: "AI Infra",
        url: "#",
      },
      {
        name: "Deepline",
        description:
          "Developer-first observability layer for autonomous systems and complex ML pipelines.",
        stage: "Pre-seed",
        region: "US & EU",
        focus: "DevTools",
        url: "#",
      },
      {
        name: "Metric Cloud",
        description:
          "Composable compute marketplace optimizing where and how heavy workloads are executed.",
        stage: "Series A",
        region: "Global",
        focus: "Compute",
        url: "#",
      },
    ],
  },
  {
    id: "planetary-systems",
    name: "Planetary Systems",
    tagline: "Energy, industry, and logistics for a resilient planet.",
    companies: [
      {
        name: "Gradient Loop",
        description:
          "Software-defined heat networks orchestrating urban energy flows in real time.",
        stage: "Seed",
        region: "DACH",
        focus: "Climate Infra",
        url: "#",
      },
      {
        name: "Stellar Freight",
        description:
          "Routing and optimization engine for low-carbon freight across rail, sea, and road.",
        stage: "Seed",
        region: "Europe",
        focus: "Logistics",
        url: "#",
      },
      {
        name: "Forge Matter",
        description:
          "Electrified micro-factories producing industrial components close to demand centers.",
        stage: "Pre-seed",
        region: "Europe",
        focus: "Industry",
        url: "#",
      },
    ],
  },
  {
    id: "bio-materials",
    name: "Bio & Materials",
    tagline: "Engineering matter to be programmable and sustainable.",
    companies: [
      {
        name: "Helix Foundry",
        description:
          "Cloud-native biofoundry compressing design-build-test cycles for industrial biology.",
        stage: "Seed",
        region: "UK",
        focus: "SynBio",
        url: "#",
      },
      {
        name: "Latticewood",
        description:
          "Engineered timber composites with steel-like strength and radically lower footprint.",
        stage: "Series A",
        region: "Nordics",
        focus: "Materials",
        url: "#",
      },
      {
        name: "NanoLumen",
        description:
          "Functional nano-coatings that make everyday materials smarter and more durable.",
        stage: "Seed",
        region: "EU",
        focus: "Nanotech",
        url: "#",
      },
    ],
  },
  {
    id: "finance-coordination",
    name: "Finance & Coordination",
    tagline:
      "Protocols and networks for native internet governance and value.",
    companies: [
      {
        name: "CoordNet",
        description:
          "Composable coordination primitives for DAOs and network-native organizations.",
        stage: "Seed",
        region: "Global",
        focus: "Coordination",
        url: "#",
      },
      {
        name: "StateLayer",
        description:
          "Base-layer infrastructure for verifiable off-chain computation and settlement.",
        stage: "Seed",
        region: "Global",
        focus: "Infra",
        url: "#",
      },
      {
        name: "Common Pool",
        description:
          "Funding marketplace routing capital toward public goods and shared infra at scale.",
        stage: "Pre-seed",
        region: "Global",
        focus: "Public Goods",
        url: "#",
      },
    ],
  },
];

const prefersReducedMotion = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;

// ==========================================================================
// SMOOTH SCROLL
// ==========================================================================
function smoothScrollTo(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;

  const rect = target.getBoundingClientRect();
  const offset = rect.top + window.pageYOffset - headerHeight - 16;

  window.scrollTo({
    top: offset,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

// ==========================================================================
// PORTFOLIO RENDERING
// ==========================================================================
function renderPortfolio() {
  const container = document.getElementById("portfolio-groups");
  if (!container) return;

  container.innerHTML = "";

  portfolioData.forEach((group) => {
    const groupEl = document.createElement("section");
    groupEl.className = "portfolio-group";
    groupEl.setAttribute("aria-labelledby", `portfolio-${group.id}-title`);

    const headerEl = document.createElement("div");
    headerEl.className = "portfolio-group-header";

    const titleEl = document.createElement("h3");
    titleEl.className = "portfolio-group-title";
    titleEl.id = `portfolio-${group.id}-title`;
    titleEl.textContent = group.name;

    const taglineEl = document.createElement("p");
    taglineEl.className = "portfolio-group-tagline";
    taglineEl.textContent = group.tagline;

    headerEl.appendChild(titleEl);
    headerEl.appendChild(taglineEl);

    const gridEl = document.createElement("div");
    gridEl.className = "portfolio-grid";

    group.companies.forEach((company) => {
      const card = document.createElement("article");
      card.className = "portfolio-card reveal";

      const chip = document.createElement("p");
      chip.className = "portfolio-chip";
      chip.textContent = company.focus;

      const name = document.createElement("h4");
      name.className = "portfolio-name";
      name.textContent = company.name;

      const desc = document.createElement("p");
      desc.className = "portfolio-desc";
      desc.textContent = company.description;

      const meta = document.createElement("p");
      meta.className = "portfolio-meta";
      meta.textContent = `${company.stage} \u2022 ${company.region}`;

      const link = document.createElement("a");
      link.className = "portfolio-link";
      link.href = company.url || "#";
      link.target = company.url && company.url !== "#" ? "_blank" : "_self";
      link.rel = "noopener noreferrer";
      link.textContent = "Visit site";

      card.appendChild(chip);
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(meta);
      card.appendChild(link);

      gridEl.appendChild(card);
    });

    groupEl.appendChild(headerEl);
    groupEl.appendChild(gridEl);
    container.appendChild(groupEl);
  });
}

// ==========================================================================
// SCROLL SPY
// ==========================================================================
function setupScrollSpy() {
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  if (!navLinks.length || !("IntersectionObserver" in window)) return;

  const sections = [];
  navLinks.forEach((link) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const section = document.querySelector(id);
    if (section) sections.push({ id, el: section });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = `#${entry.target.id}`;
        const link = document.querySelector(`.site-nav a[href="${id}"]`);
        if (!link) return;

        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("nav-active"));
          link.classList.add("nav-active");
        }
      });
    },
    {
      root: null,
      threshold: 0.4,
    }
  );

  sections.forEach((section) => observer.observe(section.el));
}

// ==========================================================================
// MOBILE NAV
// ==========================================================================
function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches('a[href^="#"]')) {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ==========================================================================
// SMOOTH SCROLL BINDINGS
// ==========================================================================
function setupSmoothScroll() {
  const headerLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  headerLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      event.preventDefault();
      smoothScrollTo(href);
    });
  });

  const ctaButtons = document.querySelectorAll("[data-scroll-target]");
  ctaButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-scroll-target");
      if (!target) return;
      smoothScrollTo(target);
    });
  });
}

// ==========================================================================
// FOOTER YEAR
// ==========================================================================
function setFooterYear() {
  const el = document.getElementById("footer-year");
  if (!el) return;
  el.textContent = new Date().getFullYear();
}

// ==========================================================================
// HERO PARALLAX TILT (CSS TRANSFORM-BASED)
// ==========================================================================
function setupHeroParallax() {
  if (prefersReducedMotion) return;

  const hero = document.querySelector(".hero");
  const inner = document.querySelector(".hero-inner");
  if (!hero || !inner) return;

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    const rotateX = y * -6;
    const rotateY = x * 8;

    inner.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(0)
    `;
  });

  hero.addEventListener("mouseleave", () => {
    inner.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
}

// ==========================================================================
// SCROLL REVEAL
// ==========================================================================
function markRevealTargets() {
  const selectors = [
    ".focus-card",
    ".team-card",
    ".updates-stream",
    ".contact-card",
  ];
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add("reveal");
    });
  });
}

function setupScrollReveal() {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("reveal-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ==========================================================================
// THREE.JS BACKGROUND (3D ORBITAL NETWORK)
// ==========================================================================
let dvScene, dvCamera, dvRenderer, dvNetworkGroup;
let dvViewportWidth = window.innerWidth;
let dvViewportHeight = window.innerHeight;
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

function initThreeScene() {
  if (prefersReducedMotion) return;
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
    100
  );
  dvCamera.position.set(0, 0, 8);
  dvScene.add(dvCamera);

  // Ambient light
  const ambient = new THREE.AmbientLight(0x7080ff, 0.6);
  dvScene.add(ambient);

  // Directional light
  const directional = new THREE.DirectionalLight(0xffffff, 0.9);
  directional.position.set(2, 4, 5);
  dvScene.add(directional);

  createOrbitalNetwork();

  window.addEventListener("resize", onThreeResize);
  lastScrollY = window.scrollY;
  window.addEventListener("scroll", onScrollUpdate, { passive: true });

  animateThree();
}

function createOrbitalNetwork() {
  dvNetworkGroup = new THREE.Group();
  dvScene.add(dvNetworkGroup);

  // Central wireframe icosahedron
  const icoGeom = new THREE.IcosahedronGeometry(2.2, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x3b82ff,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const ico = new THREE.Mesh(icoGeom, icoMat);
  dvNetworkGroup.add(ico);

  // Nodes around the core
  const nodeGeom = new THREE.SphereGeometry(0.06, 16, 16);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.7,
    metalness: 0.35,
    roughness: 0.4,
  });

  const nodeCount = 120;
  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeom, nodeMat);
    const radius = 2.4 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;

    node.position.set(
      radius * Math.cos(phi) * Math.cos(theta),
      radius * Math.sin(phi),
      radius * Math.cos(phi) * Math.sin(theta)
    );

    dvNetworkGroup.add(node);
  }

  // Halo line
  const curvePoints = [];
  const segments = 80;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    curvePoints.push(
      new THREE.Vector3(
        Math.cos(angle) * 3.2,
        Math.sin(angle) * 0.6,
        Math.sin(angle) * 2.4
      )
    );
  }
  const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const curveMat = new THREE.LineBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.45,
  });
  const line = new THREE.LineLoop(curveGeom, curveMat);
  dvNetworkGroup.add(line);
}

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
  scrollVelocity = (y - lastScrollY) * 0.0009; // small kick based on scroll speed
  lastScrollY = y;
}

function animateThree() {
  if (!dvRenderer || !dvScene || !dvCamera || !dvNetworkGroup) return;

  requestAnimationFrame(animateThree);

  const docHeight =
    document.body.scrollHeight - window.innerHeight || window.innerHeight;
  const scrollProgress = docHeight > 0 ? window.scrollY / docHeight : 0;

  // Base rotation based on how far we've scrolled
  const targetRotX = scrollProgress * Math.PI * 0.5;
  const targetRotY = scrollProgress * Math.PI * 1.2;

  // Scroll velocity decays over time
  scrollVelocity *= 0.9;

  dvNetworkGroup.rotation.x +=
    (targetRotX - dvNetworkGroup.rotation.x) * 0.04 + scrollVelocity;
  dvNetworkGroup.rotation.y +=
    (targetRotY - dvNetworkGroup.rotation.y) * 0.04;

  // Slight camera Y shift for parallax
  dvCamera.position.y = (scrollProgress - 0.5) * 1.4;

  dvRenderer.render(dvScene, dvCamera);
}

// ==========================================================================
// INIT
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderPortfolio();
  markRevealTargets();
  setupSmoothScroll();
  setupScrollSpy();
  setupMobileNav();
  setupHeroParallax();
  setupScrollReveal();
  setFooterYear();
  initThreeScene();
});
