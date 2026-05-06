document.addEventListener('DOMContentLoaded', function () {

  // ── Hero Particles Canvas ──
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 80;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.5 + 0.1
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p, i) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          var dx = p.x - particles[j].x;
          var dy = p.y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.08 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ── Navbar scroll effect ──
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Mobile nav ──
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileClose = document.querySelector('.mobile-nav-close');

  function openMobileNav() { mobileNav && mobileNav.classList.add('open'); mobileOverlay && mobileOverlay.classList.add('show'); }
  function closeMobileNav() { mobileNav && mobileNav.classList.remove('open'); mobileOverlay && mobileOverlay.classList.remove('show'); }

  if (hamburger) hamburger.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);
  document.querySelectorAll('.mobile-nav a').forEach(function (a) { a.addEventListener('click', closeMobileNav); });

  // ── Animated counters ──
  var counters = document.querySelectorAll('[data-count]');
  var countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var current = 0;
      var step = Math.max(1, Math.floor(target / 60));
      var timer = setInterval(function () {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString('en-IN') + suffix;
      }, 25);
    });
    countersAnimated = true;
  }
  function checkCounters() {
    var bar = document.querySelector('.trust-bar');
    if (!bar) return;
    var rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) animateCounters();
  }
  window.addEventListener('scroll', checkCounters);
  checkCounters();

  // ── Countdown timer ──
  var cdEl = document.querySelector('.countdown-bar');
  if (cdEl) {
    var deadline = new Date(new Date().getFullYear(), 6, 31, 23, 59, 59);
    if (deadline < new Date()) deadline.setFullYear(deadline.getFullYear() + 1);
    function updateCountdown() {
      var diff = deadline - new Date();
      if (diff <= 0) return;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var dEl = document.getElementById('cd-days');
      var hEl = document.getElementById('cd-hours');
      var mEl = document.getElementById('cd-mins');
      var sEl = document.getElementById('cd-secs');
      if (dEl) dEl.textContent = d;
      if (hEl) hEl.textContent = h;
      if (mEl) mEl.textContent = m;
      if (sEl) sEl.textContent = s;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement;
      var list = item.closest('.faq-list');
      if (!list) return;
      var wasOpen = item.classList.contains('open');
      list.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ── WhatsApp widget ──
  var waBtn = document.querySelector('.wa-btn');
  var waPopup = document.querySelector('.wa-popup');
  if (waBtn && waPopup) {
    waBtn.addEventListener('click', function () { waPopup.classList.toggle('show'); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.wa-float')) waPopup.classList.remove('show');
    });
  }

  // ── Back to top ──
  var btt = document.querySelector('.back-top');
  if (btt) {
    window.addEventListener('scroll', function () {
      btt.classList.toggle('show', window.scrollY > 300);
    });
    btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // ── Tilt effect on service cards ──
  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / 20;
      var rotateY = (centerX - x) / 20;
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-12px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  // ── AOS init ──
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 80 });
  }

  // ── Swiper init ──
  if (typeof Swiper !== 'undefined') {
    new Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
    });
  }

  // ── Smooth reveal for sections (skip if AOS handles it) ──
  if (typeof AOS === 'undefined') {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(function (section) {
      section.classList.add('section-hidden');
      observer.observe(section);
    });
  }
});
