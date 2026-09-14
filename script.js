/* ==========================================================================
   WebMint — script.js
   Vanilla JS interactions: nav state, mobile menu, scroll reveal,
   animated stats, hero parallax, and enquiry form validation.
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ *
   * Sticky nav background on scroll
   * ------------------------------------------------------------------ */
  function initNavScrollState() {
    const nav = document.getElementById("siteNav");
    if (!nav) return;

    const setState = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    setState();
    window.addEventListener("scroll", setState, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Mobile menu: open/close, close on link click or Escape key
   * ------------------------------------------------------------------ */
  function initMobileMenu() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    const open = () => {
      menu.dataset.state = "open";
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      menu.dataset.state = "closed";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.dataset.state === "open";
      isOpen ? close() : open();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.dataset.state === "open") close();
    });
  }

  /* ------------------------------------------------------------------ *
   * Scroll-reveal: fade + rise elements into view once, via
   * IntersectionObserver. Falls back to fully visible if unsupported
   * or if the visitor prefers reduced motion.
   * ------------------------------------------------------------------ */
  function initScrollReveal() {
    const selectors = [
      ".section-head",
      ".service-item",
      ".work-item",
      ".why__statement",
      ".principle",
      ".process-step",
      ".proof__inner",
      ".contact__intro",
      ".form",
    ];
    const targets = document.querySelectorAll(selectors.join(","));

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.removeAttribute("data-reveal"));
      return;
    }

    targets.forEach((el, i) => {
      el.setAttribute("data-reveal", "");
      // Light stagger within small groups, capped so long lists don't
      // take too long to fully appear.
      const delay = Math.min(i % 4, 3) * 90;
      el.style.transitionDelay = `${delay}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * Animated counters for the social-proof stats.
   * Only animates values that have a real, positive data-target —
   * placeholder "—" stats are left untouched rather than faking a number.
   * ------------------------------------------------------------------ */
  function initCounters() {
    const values = document.querySelectorAll(".proof__value[data-target]");
    if (!values.length) return;

    const animateValue = (el, target) => {
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.target || 0);
          // Real stats only: once WebMint has real numbers, set a
          // positive data-target in index.html and this will animate it.
          if (target > 0) animateValue(el, target);
          observer.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );

    values.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * Subtle hero parallax on pointer move (desktop, fine-pointer only).
   * Purely decorative; disabled for touch devices and reduced motion.
   * ------------------------------------------------------------------ */
  function initHeroParallax() {
    const visual = document.querySelector(".hero__visual");
    const browser = document.querySelector(".browser-mock");
    const phone = document.querySelector(".phone-mock");
    if (!visual || !browser || !phone) return;
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    let raf = null;

    visual.addEventListener("mousemove", (e) => {
      const rect = visual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        browser.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
        phone.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      });
    });

    visual.addEventListener("mouseleave", () => {
      browser.style.transform = "";
      phone.style.transform = "";
    });
  }

  /* ------------------------------------------------------------------ *
   * Enquiry form: client-side validation + accessible error messaging.
   *
   * NOTE FOR DEVELOPERS: this validates and prepares the form data but
   * does not send it anywhere yet. Wire `handleValidSubmit()` up to
   * Formspree, EmailJS, or a custom backend endpoint before launch.
   * ------------------------------------------------------------------ */
  function initForm() {
    const form = document.getElementById("enquiryForm");
    const status = document.getElementById("formStatus");
    if (!form || !status) return;

    const rules = {
      fName: (v) => v.trim().length > 1 || "Please enter your name.",
      fEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Please enter a valid email address.",
      fNeed: (v) => v !== "" || "Let us know what you need.",
      fMessage: (v) => v.trim().length > 9 || "Tell us a bit more about the project (10+ characters).",
    };

    const showError = (field, message) => {
      const group = field.closest(".form__group");
      const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);
      if (group) group.classList.add("has-error");
      if (errorEl) errorEl.textContent = message;
    };

    const clearError = (field) => {
      const group = field.closest(".form__group");
      const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);
      if (group) group.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
    };

    const validateField = (field) => {
      const rule = rules[field.id];
      if (!rule) return true;
      const result = rule(field.value);
      if (result === true) {
        clearError(field);
        return true;
      }
      showError(field, result);
      return false;
    };

    // Validate on blur for immediate, non-intrusive feedback.
    Object.keys(rules).forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.addEventListener("blur", () => validateField(field));
    });



    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-success", "is-error");

      let isValid = true;
      Object.keys(rules).forEach((id) => {
        const field = document.getElementById(id);
        if (field && !validateField(field)) isValid = false;
      });

      if (!isValid) {
        status.textContent = "Please check the highlighted fields and try again.";
        status.classList.add("is-error");
        form.querySelector(".has-error input, .has-error select, .has-error textarea")?.focus();
        return;
      }

      form.submit();
    });
  }

  /* ------------------------------------------------------------------ *
   * Back-to-top button
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initNavScrollState();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initHeroParallax();
    initForm();
    initBackToTop();
  });
})();
