// ==========================================================================
// BASIC CONFIG & DATA (NON-WEBGL)
// ==========================================================================

const portfolioData = [
  {
    id: "intelligence-infrastructure",
    name: "Intelligence & Infrastructure",
    tagline: "The rails for decision-making, compute, and data.",
    companies: [
      {
        name: "ContractPodAI",
        description:
          "A global leader in Enterprise Agentic AI and Contract Lifecycle Management.",
        stage: "Seed",
        region: "US",
        focus: "Legal",
        url: "https://contractpodai.com",
      },
      {
        name: "Vahan",
        description:
          "Building an AI recruiter for India’s 300M+ blue-collar workers.",
        stage: "Pre-seed",
        region: "India",
        focus: "Recruiting",
        url: "https://vahan.co/",
      },
      {
        name: "Databricks",
        description:
          "Data lakehouse with AI agents trained on your business data.",
        stage: "Series A",
        region: "Global",
        focus: "Data",
        url: "https://www.databricks.com/",
      },
    ],
  },
  {
    id: "planetary-systems",
    name: "Planetary Systems",
    tagline: "Energy, industry, and logistics for a resilient planet.",
    companies: [
      {
        name: "Zingbus",
        description:
          "The future of intercity travel, connecting India by bus.",
        stage: "Seed",
        region: "Asia",
        focus: "Logistics",
        url: "https://www.zingbus.com/",
      },
      {
        name: "Heimdal",
        description:
          "Builds machines that permanently capture and store atmospheric CO2.",
        stage: "Seed",
        region: "USA",
        focus: "Carbon",
        url: "https://www.heimdalccu.com/",
      },
      {
        name: "Humify",
        description:
          "Creating new fertile soil from waste biomass in 2 hours.",
        stage: "Pre-seed",
        region: "Europe",
        focus: "Agriculture",
        url: "https://humify.earth",
      },
    ],
  },
  {
    id: "health-longevity",
    name: "Health & Longevity",
    tagline: "Enabling long and healthy lifes for everyone.",
    companies: [
      {
        name: "Redcliffe Labs",
        description:
          "Diagnostics provider dedicated to giving India its right to quality diagnostics.",
        stage: "Pre-seed",
        region: "Europe",
        focus: "Diagnostics",
        url: "https://redcliffelabs.com/",
      },
      {
        name: "Dawaai",
        description:
          "Catalyzing the future of healthcare landscape in Pakistan.",
        stage: "Seed",
        region: "Asia",
        focus: "Healthcare",
        url: "https://dawaai.pk/",
      },
      {
        name: "Reshape Biotech",
        description:
          "Automate data generation from plate‑based microbiological assays.",
        stage: "Seed",
        region: "Global",
        focus: "Lab Infra",
        url: "https://www.reshapebiotech.com/",
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
        name: "Kapital Grupo",
        description:
          "Data driven neobank for SMBs in LATAM.",
        stage: "Seed",
        region: "LatAm",
        focus: "Banking",
        url: "https://kapital.com/",
      },
      {
        name: "Shop Circle",
        description:
          "Shopify merchants operating system that helps brands scale their tech stacks. ",
        stage: "Pre-seed",
        region: "Global",
        focus: "Ecommerce",
        url: "https://shopcircle.co/",
      },
      {
        name: "Paga",
        description:
          "Paga Group is a payments and financial services ecosystem for Africa.",
        stage: "Pre-seed",
        region: "Global",
        focus: "Payments",
        url: "https://www.mypaga.com/",
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
//      meta.textContent = `${company.stage} \u2022 ${company.region}`;

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
// HERO PARALLAX TILT
// ==========================================================================
function setupHeroParallax() {
  if (prefersReducedMotion) return;

  const hero = document.querySelector(".hero");
  const inner = document.querySelector(".hero-inner");
  if (!hero || !inner) return;

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
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
// BACKGROUND PARALLAX (gradient)
// ==========================================================================
function setupBackgroundParallax() {
  if (prefersReducedMotion) return;

  function update() {
    const y = window.scrollY || window.pageYOffset;
    const offset = -y * 0.12;
    document.body.style.backgroundPosition = `center ${offset}px`;
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
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
  setupBackgroundParallax();

  if (typeof initThreeScene === "function") {
    initThreeScene();
  }
});
