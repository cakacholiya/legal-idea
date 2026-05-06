document.addEventListener('DOMContentLoaded', function () {

  // ── Typing effect ──
  var typedEl = document.getElementById('typed-text');
  if (typedEl) {
    var words = ['Tax Filing', 'GST Compliance', 'TDS Returns', 'Company Setup', 'Investments'];
    var wordIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 100;

    function typeLoop() {
      var current = words[wordIndex];
      if (isDeleting) {
        typedEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        typedEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIndex === current.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 400;
      }

      setTimeout(typeLoop, typeSpeed);
    }
    setTimeout(typeLoop, 1000);
  }

  // ── Countdown timer ──
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
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── Tax Calculator ──
  var calcBtn = document.getElementById('calc-submit');
  if (calcBtn) {
    function calculateTax() {
      var income = parseInt(document.getElementById('calc-income').value) || 0;
      var regime = document.getElementById('calc-regime').value;
      var deduction80c = Math.min(parseInt(document.getElementById('calc-80c').value) || 0, 150000);

      var taxWithout = 0;
      var taxWith = 0;

      if (regime === 'old') {
        taxWithout = calcOldRegimeTax(income);
        taxWith = calcOldRegimeTax(income - deduction80c - 50000);
      } else {
        taxWithout = calcNewRegimeTax(income);
        taxWith = calcNewRegimeTax(income - 75000);
      }

      var savings = Math.max(0, taxWithout - taxWith);

      document.getElementById('calc-result').textContent = '₹' + savings.toLocaleString('en-IN');
      document.getElementById('cb-gross').textContent = '₹' + taxWithout.toLocaleString('en-IN');
      document.getElementById('cb-after').textContent = '₹' + taxWith.toLocaleString('en-IN');
      document.getElementById('cb-save').textContent = '₹' + savings.toLocaleString('en-IN');
    }

    function calcOldRegimeTax(taxable) {
      if (taxable <= 0) return 0;
      taxable = Math.max(0, taxable);
      var tax = 0;
      if (taxable > 1000000) { tax += (taxable - 1000000) * 0.30; taxable = 1000000; }
      if (taxable > 500000) { tax += (taxable - 500000) * 0.20; taxable = 500000; }
      if (taxable > 250000) { tax += (taxable - 250000) * 0.05; }
      return Math.round(tax * 1.04);
    }

    function calcNewRegimeTax(taxable) {
      if (taxable <= 0) return 0;
      taxable = Math.max(0, taxable);
      var tax = 0;
      var slabs = [
        [300000, 0], [600000, 0.05], [900000, 0.10],
        [1200000, 0.15], [1500000, 0.20], [Infinity, 0.30]
      ];
      var prev = 0;
      for (var i = 0; i < slabs.length; i++) {
        var limit = slabs[i][0];
        var rate = slabs[i][1];
        var slabAmount = Math.min(taxable, limit) - prev;
        if (slabAmount > 0) tax += slabAmount * rate;
        prev = limit;
        if (taxable <= limit) break;
      }
      return Math.round(tax * 1.04);
    }

    calcBtn.addEventListener('click', calculateTax);
    calculateTax();
  }

  // ── Animated stat counters (ring numbers) ──
  var ringNumbers = document.querySelectorAll('.ring-number');
  var ringsAnimated = false;

  function animateRings() {
    if (ringsAnimated) return;
    ringNumbers.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var current = 0;
      var step = Math.max(1, Math.floor(target / 50));
      var timer = setInterval(function () {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString('en-IN') + suffix;
      }, 30);
    });
    ringsAnimated = true;
  }

  var statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) animateRings();
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  // ── Parallax on hero float cards ──
  var heroVisual = document.querySelector('.hero-v2-visual');
  if (heroVisual && window.innerWidth > 992) {
    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 20;
      var y = (e.clientY / window.innerHeight - 0.5) * 20;
      var cards = heroVisual.querySelectorAll('.float-card');
      cards.forEach(function (card, i) {
        var factor = (i + 1) * 0.5;
        card.style.transform = 'translateY(' + (-15 + y * factor * 0.3) + 'px) translateX(' + (x * factor * 0.2) + 'px)';
      });
    });
  }

  // ── Hero particles ──
  var canvas = document.getElementById('hero-particles');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 60;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var dx = p.x - particles[j].x;
          var dy = p.y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 * (1 - dist / 100)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }
});
