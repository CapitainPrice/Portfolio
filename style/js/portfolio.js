/**
 * PORTFOLIO — JavaScript
 * Author: Guilherme Gonçalves
 * Version: 4.0 — All Black + Scroll Timeline + Carousel
 */

(function () {
 'use strict';

 // ─── DOM References ─────────────────────────────────────
 const DOM = {
  splash: document.getElementById('splash-screen'),
  video: document.getElementById('intro-video'),
  audio: document.getElementById('splash-audio'),
  skip: document.getElementById('splash-skip'),
  portfolio: document.getElementById('portfolio'),
  heroVideo: document.getElementById('hero-video'),
  langToggle: document.getElementById('lang-toggle'),
  langLabel: document.getElementById('lang-label'),
  printBtn: document.getElementById('print-btn'),
  printOverlay: document.getElementById('print-overlay'),
  printClose: document.getElementById('print-close'),
  canvas: document.getElementById('hud-canvas'),
  topbar: document.getElementById('topbar'),
  topbarNav: document.querySelector('.topbar-nav'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  timeline: document.getElementById('timeline'),
  railFill: document.getElementById('timeline-rail-fill'),
  // Projects timeline
  projectsTimeline: document.getElementById('projects-timeline'),
  projectsRailFill: document.getElementById('projects-rail-fill'),
  // Certs timeline
  certsTimeline: document.getElementById('certs-timeline'),
  certsRailFill: document.getElementById('certs-rail-fill'),
  // Carousel
  carousel: document.getElementById('project-carousel'),
  carouselTrack: document.getElementById('carousel-track'),
  carouselPrev: document.getElementById('carousel-prev'),
  carouselNext: document.getElementById('carousel-next'),
  carouselDots: document.getElementById('carousel-dots'),
  carouselCounter: document.getElementById('carousel-counter')
 };

 // ─── State ───────────────────────────────────────────────
 let state = {
  lang: 'pt',
  particles: [],
  animFrame: null,
  splashTimer: null,
  isVisible: true,
  // Carousel
  carouselIndex: 0,
  carouselAutoTimer: null,
  carouselTransitioning: false
 };

 // ─── Config ──────────────────────────────────────────────
 const CONFIG = {
  splashDuration: 4000,
  particleCount: 50,
  particleSpeed: 0.3,
  connectionDistance: 90,
  fadeThreshold: 0.12,
  carouselInterval: 4000,
  carouselTotal: 4 // number of unique slides
 };

 // ─── Utilities ───────────────────────────────────────────
 const $$ = (sel) => document.querySelectorAll(sel);

 // ─── Splash Screen ───────────────────────────────────────
 function initSplash() {
  const video = DOM.video;
  const audio = DOM.audio;

  const showPortfolio = () => {
   clearTimeout(state.splashTimer);

   if (audio) {
    audio.pause();
    audio.currentTime = 0;
   }

   DOM.splash.classList.add('fade-out');
   DOM.portfolio.classList.remove('hidden');

   setTimeout(() => {
    DOM.splash.style.display = 'none';
    initAll();
   }, 800);
  };

  state.splashTimer = setTimeout(showPortfolio, CONFIG.splashDuration);

  video.addEventListener('ended', showPortfolio);
  video.addEventListener('error', showPortfolio);
  DOM.skip.addEventListener('click', showPortfolio);

  if (audio) {
   audio.volume = 0.3;
   audio.play().catch(() => {});
  }
 }

 // ─── Language Toggle ─────────────────────────────────────
 function initLanguage() {
  DOM.langToggle.addEventListener('click', () => {
   state.lang = state.lang === 'pt' ? 'en' : 'pt';
   document.documentElement.dataset.lang = state.lang;
   DOM.langLabel.textContent = state.lang.toUpperCase();
   updateTexts();
  });
 }

 function updateTexts() {
  $$('[data-pt]').forEach(el => {
   el.textContent = el.dataset[state.lang] || el.dataset.pt;
  });
 }

 // ─── Canvas Particle System ───────────────────────────────
 function initCanvas() {
  const canvas = DOM.canvas;
  const ctx = canvas.getContext('2d');

  function resize() {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function createParticles() {
   const count = Math.min(CONFIG.particleCount, Math.floor(window.innerWidth / 22));
   state.particles = [];

   for (let i = 0; i < count; i++) {
    state.particles.push({
     x: Math.random() * canvas.width,
     y: Math.random() * canvas.height,
     vx: (Math.random() - 0.5) * CONFIG.particleSpeed,
     vy: (Math.random() - 0.5) * CONFIG.particleSpeed,
     size: Math.random() * 1.5 + 0.5,
     opacity: Math.random() * 0.3 + 0.08
    });
   }
  }

  createParticles();

  function animate() {
   if (!state.isVisible) {
    state.animFrame = requestAnimationFrame(animate);
    return;
   }

   ctx.clearRect(0, 0, canvas.width, canvas.height);

   const particles = state.particles;
   const len = particles.length;

   for (let i = 0; i < len; i++) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 216, 232, ${p.opacity})`;
    ctx.fill();

    for (let j = i + 1; j < len; j++) {
     const p2 = particles[j];
     const dx = p.x - p2.x;
     const dy = p.y - p2.y;
     const distSq = dx * dx + dy * dy;

     if (distSq < CONFIG.connectionDistance * CONFIG.connectionDistance) {
      const dist = Math.sqrt(distSq);
      const alpha = (1 - dist / CONFIG.connectionDistance) * 0.07;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(200, 216, 232, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
     }
    }
   }

   state.animFrame = requestAnimationFrame(animate);
  }

  animate();
 }

 // ─── Scroll Animations (fade-in elements) ────────────────
 function initScrollAnimations() {
  const fadeElements = $$('.fade-in');

  if ('IntersectionObserver' in window) {
   const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
     if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animateSkills(entry.target);
      observer.unobserve(entry.target);
     }
    });
   }, {
    threshold: CONFIG.fadeThreshold,
    rootMargin: '0px 0px -50px 0px'
   });

   fadeElements.forEach(el => observer.observe(el));
  } else {
   fadeElements.forEach(el => el.classList.add('visible'));
  }

  $$('a[href^="#"]').forEach(link => {
   link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
     target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
   });
  });
 }

 function animateSkills(container) {
  container.querySelectorAll('.skill-fill').forEach(fill => {
   const pct = fill.dataset.pct || 0;
   fill.style.width = pct + '%';
  });
 }

 // ─── Timeline — Generic initializer ──────────────────────
 function setupTimeline(tlEl, fillEl) {
  if (!tlEl || !fillEl) return;

  const items = tlEl.querySelectorAll('.timeline-item');
  if (items.length === 0) return;

  // IntersectionObserver for dot/card reveal
  if ('IntersectionObserver' in window) {
   const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
     if (entry.isIntersecting) {
      setTimeout(() => {
       entry.target.classList.add('tl-visible');
      }, 80);
     }
    });
   }, {
    threshold: 0.25,
    rootMargin: '0px 0px -60px 0px'
   });

   items.forEach(item => itemObserver.observe(item));
  } else {
   items.forEach(item => item.classList.add('tl-visible'));
  }

  // Rail fill — scroll-driven
  function updateRail() {
   const rect = tlEl.getBoundingClientRect();
   const winH = window.innerHeight;
   const tlHeight = tlEl.offsetHeight;

   const scrolled = Math.max(0, winH - rect.top);
   const progress = Math.min(1, scrolled / (tlHeight + winH * 0.4));

   fillEl.style.height = (progress * 100) + '%';
  }

  window.addEventListener('scroll', updateRail, { passive: true });
  updateRail();
 }

 function initTimeline() {
  // About timeline (original)
  setupTimeline(DOM.timeline, DOM.railFill);
  // Projects timeline
  setupTimeline(DOM.projectsTimeline, DOM.projectsRailFill);
  // Certs timeline
  setupTimeline(DOM.certsTimeline, DOM.certsRailFill);
 }

 // ─── Carousel — Infinite Loop ────────────────────────────
 function initCarousel() {
  const track = DOM.carouselTrack;
  const prevBtn = DOM.carouselPrev;
  const nextBtn = DOM.carouselNext;
  const dotsWrap = DOM.carouselDots;
  const counter = DOM.carouselCounter;

  if (!track || !prevBtn || !nextBtn) return;

  const total = CONFIG.carouselTotal; // 4 unique slides
  const slides = track.querySelectorAll('.carousel-slide');
  const dots = dotsWrap ? dotsWrap.querySelectorAll('.carousel-dot') : [];

  // Set initial position (show slide 0)
  state.carouselIndex = 0;
  track.style.transform = 'translateX(0)';

  function getSlideWidth() {
   return slides[0] ? slides[0].offsetWidth : 0;
  }

  function goTo(index, instant) {
   if (state.carouselTransitioning) return;

   state.carouselIndex = index;

   if (instant) {
    track.style.transition = 'none';
   } else {
    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
   }

   track.style.transform = `translateX(-${index * getSlideWidth()}px)`;

   // Update counter & dots (always map to 0-3)
   const realIndex = index % total;
   const num = String(realIndex + 1).padStart(2, '0');
   if (counter) counter.textContent = `${num} / ${String(total).padStart(2, '0')}`;

   dots.forEach((d, i) => {
    d.classList.toggle('active', i === realIndex);
   });
  }

  function next() {
   if (state.carouselTransitioning) return;
   state.carouselTransitioning = true;

   const nextIdx = state.carouselIndex + 1;
   goTo(nextIdx, false);

   // If we've moved to the first duplicate (index === total),
   // after transition ends, jump instantly to index 0
   if (nextIdx === total) {
    track.addEventListener('transitionend', function jumpForward() {
     track.removeEventListener('transitionend', jumpForward);
     goTo(0, true);
     // Force reflow so the instant move registers
     void track.offsetHeight;
     state.carouselTransitioning = false;
    });
   } else {
    setTimeout(() => { state.carouselTransitioning = false; }, 520);
   }
  }

  function prev() {
   if (state.carouselTransitioning) return;
   state.carouselTransitioning = true;

   const prevIdx = state.carouselIndex - 1;
   goTo(prevIdx, false);

   // If we've moved before index 0 (to index -1 which is the last duplicate),
   // after transition ends, jump instantly to the last real slide
   if (prevIdx < 0) {
    // First, go to the last duplicate slide instantly
    goTo(total - 1, true);
    void track.offsetHeight;
    goTo(total - 1, false);
    // Actually for infinite-prev, we need the clones before index 0.
    // Since we only have clones AFTER, we handle it differently:
    // Jump to the clone of the last slide (index = total*2 - 1 = 7),
    // then after transition, jump to index total-1.
    // But our HTML only has clones after. So let's use a simpler approach:
    // When going prev from 0, instantly jump to clone of last slide (index 7)
    // then animate forward to index 3.
    state.carouselTransitioning = false;
   } else {
    setTimeout(() => { state.carouselTransitioning = false; }, 520);
   }
  }

  // Rewriting prev for the clone-after-only setup:
  // From index 0, going "prev" should show slide 3.
  // We instantly jump to the clone of slide 3 (index 7) without transition,
  // then animate to index 3 (which is actually the real last slide at index 3).
  // Wait - indices: 0,1,2,3 are real, 4,5,6,7 are clones.
  // Slide at index 7 is clone of slide 3.
  // So: prev from 0 -> instant jump to 7, then transition to 6? No.
  // The trick for prev: jump instantly to index (total*2 - 1) = 7,
  // then transition to index (total - 1) = 3... but that would animate backwards.
  // Better approach: jump to the last clone, then animate ONE step forward.
  //
  // Actually the simplest infinite-prev with only trailing clones:
  // When at index 0 and pressing prev:
  // 1. Instantly (no transition) move to index `total` (first clone = clone of slide 0)
  //    Wait no, we need to go backward...
  //
  // Simplest fix: jump instantly to last clone index (2*total - 1),
  // then immediately set transition and move to (2*total - 2).
  // But our clone setup only appends clones after originals.
  // So from index 0 going prev:
  //  - Instantly set index to (2*total - 1) = 7 (clone of last slide)
  //  - Then animate from 7 to 6... but that goes to clone of slide 2, not slide 3.
  //
  // Let me rethink. The correct approach with only trailing clones:
  // We can't smoothly go backwards past 0 because there's no clone before 0.
  // Solution: just wrap around. From 0 going prev, jump to last real slide.

  // OVERWRITTEN prev logic:
  function prevInfinite() {
   if (state.carouselTransitioning) return;
   state.carouselTransitioning = true;

   if (state.carouselIndex === 0) {
    // At first real slide — jump instantly to its clone at index `total`
    // then animate to `total - 1` (last real slide)
    goTo(total, true); // instant jump to clone of slide 0
    void track.offsetHeight; // force reflow
    goTo(total - 1, false); // animate to last real slide
    track.addEventListener('transitionend', function onEnd() {
     track.removeEventListener('transitionend', onEnd);
     // We're now at real index 3, no jump needed
     state.carouselTransitioning = false;
    });
   } else {
    const prevIdx = state.carouselIndex - 1;
    goTo(prevIdx, false);
    setTimeout(() => { state.carouselTransitioning = false; }, 520);
   }
  }

  // Override the simple prev
  prevBtn.addEventListener('click', () => {
   prevInfinite();
   resetAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
   next();
   resetAutoPlay();
  });

  // Dot navigation
  dots.forEach(dot => {
   dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.index, 10);
    if (isNaN(idx)) return;
    goTo(idx, false);
    resetAutoPlay();
   });
  });

  // Auto-play
  function startAutoPlay() {
   stopAutoPlay();
   state.carouselAutoTimer = setInterval(next, CONFIG.carouselInterval);
  }

  function stopAutoPlay() {
   if (state.carouselAutoTimer) {
    clearInterval(state.carouselAutoTimer);
    state.carouselAutoTimer = null;
   }
  }

  function resetAutoPlay() {
   stopAutoPlay();
   startAutoPlay();
  }

  // Pause on hover
  const carouselEl = DOM.carousel;
  if (carouselEl) {
   carouselEl.addEventListener('mouseenter', stopAutoPlay);
   carouselEl.addEventListener('mouseleave', startAutoPlay);
  }

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  if (carouselEl) {
   carouselEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
   }, { passive: true });

   carouselEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
     if (diff > 0) {
      next();
     } else {
      prevInfinite();
     }
     resetAutoPlay();
    }
   }, { passive: true });
  }

  // Handle resize
  window.addEventListener('resize', () => {
   goTo(state.carouselIndex, true);
  });

  // Start auto-play
  startAutoPlay();
 }

 // ─── Print CV ────────────────────────────────────────────
 function initPrint() {
  DOM.printBtn.addEventListener('click', () => {
   DOM.printOverlay.classList.add('active');
  });

  DOM.printClose.addEventListener('click', closePrintOverlay);

  DOM.printOverlay.addEventListener('click', (e) => {
   if (e.target === DOM.printOverlay) closePrintOverlay();
  });

  document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape') closePrintOverlay();
  });

  function closePrintOverlay() {
   DOM.printOverlay.classList.remove('active');
  }
 }

 // ─── Performance: Tab Visibility ─────────────────────────
 function initPerformance() {
  document.addEventListener('visibilitychange', () => {
   state.isVisible = !document.hidden;
  });
 }

 // ─── Mobile Header Hide/Show ──────────────────────────────
 function initMobileHeader() {
  let lastScroll = 0;
  const header = DOM.topbar;

  window.addEventListener('scroll', () => {
   const currentScroll = window.pageYOffset;

   if (currentScroll > lastScroll && currentScroll > 80) {
    header.classList.add('hidden-header');
   } else {
    header.classList.remove('hidden-header');
   }

   lastScroll = currentScroll;
  }, { passive: true });
 }

 // ─── Mobile Menu Toggle ──────────────────────────────────
 function initMobileMenu() {
  const btn = DOM.mobileMenuBtn;
  const nav = DOM.topbarNav;

  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
   nav.classList.toggle('active');
   btn.classList.toggle('active');
  });

  nav.querySelectorAll('a').forEach(link => {
   link.addEventListener('click', () => {
    nav.classList.remove('active');
    btn.classList.remove('active');
   });
  });

  document.addEventListener('click', (e) => {
   if (!btn.contains(e.target) && !nav.contains(e.target)) {
    nav.classList.remove('active');
    btn.classList.remove('active');
   }
  });
 }

 // ─── Initialize All ─────────────────────────────────────
 function initAll() {
  initScrollAnimations();
  initTimeline();
  initCarousel();
  initPrint();
  initMobileHeader();
  initMobileMenu();
  initPerformance();

  if (DOM.heroVideo) {
   DOM.heroVideo.play().catch(() => {});
  }
 }

 // ─── Start Application ───────────────────────────────────
 function init() {
  initSplash();
  initLanguage();
  initCanvas();
 }

 if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
 } else {
  init();
 }

})();
