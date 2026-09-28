(function () {
  'use strict';

  /* ---------------- Theme toggle (padrão: claro) ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'labelly-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  themeToggle.addEventListener('click', function () {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Smooth scroll com inércia ("andar no gelo") ---------------- */
  // Sem o Lenis, o scroll do mouse/trackpad move a página em saltos fixos.
  // O Lenis intercepta o wheel/touch e interpola a posição real do scroll a cada
  // frame, então soltar o mouse ainda "escorrega" um pouco antes de assentar.
  let lenis = null;
  if (!prefersReducedMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 0.85,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); }, // cubic-out: desacelera suave no final, sem exagerar no "escorregão"
      smoothWheel: true,
      smoothTouch: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Links de âncora passam a scrollar pelo Lenis (respeitando a altura do header fixo)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      const targetEl = document.querySelector(hash);
      if (!targetEl) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(targetEl, { offset: -90, duration: 0.95 });
      } else {
        const top = targetEl.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---------------- Header: encolhe + sombra ao rolar ---------------- */
  const header = document.getElementById('siteHeader');
  function handleHeaderScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ---------------- Parallax sutil no hero ---------------- */
  const heroBg = document.querySelector('.hero-bg');
  const heroSection = document.querySelector('.hero');
  if (heroBg && heroSection && !prefersReducedMotion) {
    let ticking = false;
    function updateParallax() {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + (window.scrollY * 0.18) + 'px)';
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  /* ---------------- Menu mobile ---------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    mainNav.classList.toggle('nav-open');
  });
  mainNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      mainNav.classList.remove('nav-open');
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------------- Contadores (count-up) ---------------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  function animateCount(el) {
    const target = parseFloat(el.dataset.count || '0');
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const divisor = decimals ? Math.pow(10, decimals) : 1;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      const displayValue = decimals ? (value / divisor).toFixed(decimals) : Math.round(value).toLocaleString('pt-BR');
      el.textContent = displayValue + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statNumbers.forEach(function (el) { statsObserver.observe(el); });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('open');
      });
      if (!isOpen) item.classList.add('open');
    });
  });
})();
