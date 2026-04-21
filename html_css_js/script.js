const themeToggle = document.getElementById("theme-toggle");
const navLinks = document.querySelectorAll("[data-nav-link]");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const backToTopButton = document.querySelector(".back-to-top");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const interactiveCards = document.querySelectorAll(".interactive-card");
const filterChips = document.querySelectorAll(".chip-filter");
const rotatingText = document.querySelector(".hero-rotating");
const statValues = document.querySelectorAll(".stat-value[data-count-to]");
const heroSection = document.querySelector(".hero");
const heroGlow = document.querySelector(".hero-glow");
const themeSwitch = document.querySelector(".theme-switch");
const themeCurrent = document.querySelector(".theme-current");

const THEME_STORAGE_KEY = "portfolio-theme";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function loadThemePreference() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (!themeToggle) {
    return;
  }

  if (savedTheme === "light") {
    themeToggle.checked = true;
  } else if (savedTheme === "dark") {
    themeToggle.checked = false;
  } else {
    const prefersLightTheme = window.matchMedia("(prefers-color-scheme: light)").matches;
    themeToggle.checked = prefersLightTheme;
  }

  syncThemeSwitchUI();
}

function persistThemePreference() {
  if (!themeToggle) {
    return;
  }

  const themeValue = themeToggle.checked ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, themeValue);
  syncThemeSwitchUI();
}

function syncThemeSwitchUI() {
  if (!themeToggle) {
    return;
  }

  const selectedTheme = themeToggle.checked ? "light" : "dark";
  const statusText = selectedTheme === "light" ? "Light mode selected" : "Dark mode selected";

  if (themeSwitch) {
    themeSwitch.setAttribute("aria-checked", selectedTheme === "light" ? "true" : "false");
    themeSwitch.setAttribute("data-theme-selected", selectedTheme);
  }

  if (themeCurrent) {
    themeCurrent.textContent = statusText;
  }
}

function setActiveNavLink(activeId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function setupSectionObserver() {
  if (!sections.length) {
    return;
  }

  let ticking = false;
  const header = document.querySelector(".site-header");

  const updateActiveLink = () => {
    const headerOffset = header ? header.offsetHeight : 0;
    const viewportAnchor = headerOffset + window.innerHeight * 0.32;
    let closestSectionId = sections[0].id;
    let smallestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height * 0.5;
      const distance = Math.abs(sectionCenter - viewportAnchor);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestSectionId = section.id;
      }
    });

    setActiveNavLink(closestSectionId);
    ticking = false;
  };

  const onScrollOrResize = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateActiveLink);
  };

  onScrollOrResize();
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
}

function setupRevealObserver() {
  if (!revealItems.length) {
    return;
  }

  const supportsObserver = "IntersectionObserver" in window;
  if (!supportsObserver) {
    revealItems.forEach((item) => item.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function toggleBackToTopButton() {
  if (!backToTopButton) {
    return;
  }

  const shouldShow = window.scrollY > 400;
  backToTopButton.classList.toggle("visible", shouldShow);
}

function getErrorElement(input) {
  const describedById = input.getAttribute("aria-describedby");
  if (!describedById) {
    return null;
  }

  return document.getElementById(describedById);
}

function validateInput(input) {
  const value = input.value.trim();
  let message = "";

  if (!value) {
    message = "This field is required.";
  } else if (input.name === "email" && !EMAIL_PATTERN.test(value)) {
    message = "Please enter a valid email address.";
  } else if (input.name === "message" && value.length < 10) {
    message = "Message should be at least 10 characters.";
  }

  const errorElement = getErrorElement(input);
  if (errorElement) {
    errorElement.textContent = message;
  }

  input.classList.toggle("invalid", Boolean(message));
  return !message;
}

function setupContactFormValidation() {
  if (!contactForm) {
    return;
  }

  const inputs = contactForm.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateInput(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        validateInput(input);
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    let isFormValid = true;

    inputs.forEach((input) => {
      if (!validateInput(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      event.preventDefault();
      if (formStatus) {
        formStatus.textContent = "Please fix the highlighted fields before sending.";
      }
      return;
    }

    if (formStatus) {
      formStatus.textContent = "Opening your email app to send the message...";
    }
  });
}

function setupCardInteractivity() {
  if (!interactiveCards.length) {
    return;
  }

  interactiveCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 6;
      const rotateY = (x - 0.5) * 8;

      card.style.transform = `translateY(-4px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    card.addEventListener("mouseenter", () => {
      card.classList.add("is-active");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-active");
      card.style.transform = "";
    });
  });
}

function applyProjectFilter(filterValue) {
  interactiveCards.forEach((card) => {
    const tagList = card.dataset.projectTags || "";
    const tags = tagList.split(",").map((tag) => tag.trim().toLowerCase());
    const isMatch = filterValue === "all" || tags.includes(filterValue);
    card.classList.toggle("filtered-out", !isMatch);
  });
}

function activateFilterChip(chip) {
  const filterValue = chip.dataset.filter || "all";

  filterChips.forEach((item) => {
    const isPressed = item === chip;
    item.setAttribute("aria-pressed", isPressed ? "true" : "false");
  });

  applyProjectFilter(filterValue.toLowerCase());
}

function setupChipFiltering() {
  if (!filterChips.length || !interactiveCards.length) {
    return;
  }

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activateFilterChip(chip);
    });
  });
}

function setupRotatingHeroText() {
  if (!rotatingText) {
    return;
  }

  const phraseData = rotatingText.dataset.rotatePhrases || "";
  const phrases = phraseData
    .split(",")
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  if (phrases.length < 2) {
    return;
  }

  let phraseIndex = 0;
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const switchDelay = prefersReducedMotion ? 3000 : 2200;

  window.setInterval(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    const nextText = phrases[phraseIndex];

    if (prefersReducedMotion) {
      rotatingText.textContent = nextText;
      return;
    }

    rotatingText.classList.add("is-changing");
    window.setTimeout(() => {
      rotatingText.textContent = nextText;
      rotatingText.classList.remove("is-changing");
    }, 170);
  }, switchDelay);
}

function animateStatValue(element) {
  const target = Number(element.dataset.countTo || "0");
  if (!Number.isFinite(target) || target <= 0) {
    element.textContent = "0";
    return;
  }

  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  if (prefersReducedMotion) {
    element.textContent = String(target);
    return;
  }

  const durationMs = 900;
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.round(target * eased);

    element.textContent = String(current);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
}

function setupHeroStatsAnimation() {
  if (!statValues.length) {
    return;
  }

  const runCountUp = () => {
    statValues.forEach((element) => animateStatValue(element));
  };

  if (!("IntersectionObserver" in window)) {
    runCountUp();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, statsObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCountUp();
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(statValues[0]);
}

function setupHeroGlowParallax() {
  if (!heroSection || !heroGlow) {
    return;
  }

  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
    return;
  }

  heroSection.addEventListener("mousemove", (event) => {
    const rect = heroSection.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    heroSection.style.setProperty("--hero-glow-x", `${xPercent.toFixed(2)}%`);
    heroSection.style.setProperty("--hero-glow-y", `${yPercent.toFixed(2)}%`);
  });

}

function init() {
  loadThemePreference();
  setupSectionObserver();
  setupRevealObserver();
  setupContactFormValidation();
  setupCardInteractivity();
  setupChipFiltering();
  setupRotatingHeroText();
  setupHeroStatsAnimation();
  setupHeroGlowParallax();
  toggleBackToTopButton();

  if (themeToggle) {
    themeToggle.addEventListener("change", persistThemePreference);
  }

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", toggleBackToTopButton, { passive: true });
}

init();
