/* =============================================
   MERCY OF GOD — Site JavaScript
   Vanilla JS, zero dependencies

   Features:
   - Mobile navigation with keyboard trap
   - Header scroll effects
   - Scroll-reveal animations (IntersectionObserver)
   - Number counter animation
   - Smooth scroll for anchor links
   - Back-to-top button
   ============================================= */

(function () {
  'use strict';

  // =========================================
  // DOM CACHE
  // =========================================
  var header      = document.getElementById('site-header');
  var navToggle   = document.getElementById('nav-toggle');
  var primaryNav  = document.getElementById('primary-nav');
  var navLinks    = document.querySelectorAll('.nav-link');
  var backToTop   = document.getElementById('back-to-top');
  var yearSpan    = document.getElementById('current-year');

  // =========================================
  // UTILITIES
  // =========================================

  /** Throttle helper — limits function calls to once per `limit` ms */
  function throttle(fn, limit) {
    var waiting = false;
    return function () {
      if (!waiting) {
        fn.apply(this, arguments);
        waiting = true;
        setTimeout(function () { waiting = false; }, limit);
      }
    };
  }

  /** Check if user prefers reduced motion */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================
  // FOOTER YEAR
  // =========================================
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // =========================================
  // MOBILE NAVIGATION
  // =========================================
  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    primaryNav.classList.add('is-open');
    // Focus first link
    var firstLink = primaryNav.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    primaryNav.classList.remove('is-open');
  }

  function toggleNav() {
    var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleNav);
  }

  // Close nav when a link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (primaryNav.classList.contains('is-open')) {
        closeNav();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      closeNav();
      navToggle.focus();
    }
  });

  // Close nav if window resizes past mobile breakpoint
  window.addEventListener('resize', throttle(function () {
    if (window.innerWidth >= 960 && primaryNav.classList.contains('is-open')) {
      closeNav();
    }
  }, 200));

  // =========================================
  // HEADER SCROLL EFFECT
  // =========================================
  function handleScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header shadow
    if (header) {
      header.classList.toggle('scrolled', scrollY > 20);
    }

    // Back-to-top visibility
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 600);
    }
  }

  window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
  // Run once on load
  handleScroll();

  // =========================================
  // BACK TO TOP
  // =========================================
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =========================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var headerHeight = header ? header.offsetHeight : 72;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      // Set focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // =========================================
  // SCROLL-REVEAL ANIMATIONS
  // =========================================
  var animatables = document.querySelectorAll('[data-animate]');

  if (prefersReducedMotion) {
    // Show everything immediately
    animatables.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    animatables.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all
    animatables.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // =========================================
  // NUMBER COUNTER ANIMATION
  // =========================================
  var counterElements = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    var duration = 1800; // ms
    var startTime = null;
    var startVal = 0;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var current = Math.floor(easedProgress * (target - startVal) + startVal);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  if (counterElements.length > 0 && !prefersReducedMotion && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    // Show final values immediately
    counterElements.forEach(function (el) {
      var target = el.getAttribute('data-count');
      if (target) el.textContent = target;
    });
  }

  // =========================================
  // ACTIVE NAV LINK HIGHLIGHT ON SCROLL
  // Only for same-page anchor links
  // =========================================
  var sections = document.querySelectorAll('section[id]');

  function updateActiveNavOnScroll() {
    var scrollY = window.pageYOffset + 150;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          var href = link.getAttribute('href');
          // Only match hash links on the current page
          if (href === '#' + id) {
            link.classList.add('active');
          } else if (href.startsWith('#')) {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', throttle(updateActiveNavOnScroll, 150), { passive: true });

  /* ------------------------------------------------
     Contact Form (Formspree AJAX submission)
     ------------------------------------------------ */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Check honeypot
      if (contactForm.querySelector('[name="website"]').value) return;

      const btn = contactForm.querySelector('.form-submit');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending\u2026';

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            contactForm.reset();
            btn.innerHTML = 'Message Sent \u2713';
            btn.classList.add('btn-success');
            setTimeout(function () {
              btn.disabled = false;
              btn.innerHTML = originalText;
              btn.classList.remove('btn-success');
            }, 4000);
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          btn.innerHTML = 'Error \u2014 Please try again';
          btn.classList.add('btn-error');
          setTimeout(function () {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.classList.remove('btn-error');
          }, 4000);
        });
    });
  }

})();
