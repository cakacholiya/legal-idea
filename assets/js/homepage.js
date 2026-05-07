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

  // ── Tax Calculator V2 — AY 2026-27 ──
  var calcBtn = document.getElementById('calc-submit');
  var incomeInput = document.getElementById('calc-income');
  var incomeSlider = document.getElementById('calc-income-slider');

  if (incomeInput && incomeSlider) {
    incomeInput.addEventListener('input', function () { incomeSlider.value = this.value; });
    incomeSlider.addEventListener('input', function () { incomeInput.value = this.value; });
  }

  function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  function calcOldRegimeTax(taxable, age) {
    if (taxable <= 0) return 0;
    var exemptLimit = age === 'supersenior' ? 500000 : age === 'senior' ? 300000 : 250000;
    var tax = 0;
    var t = Math.max(0, taxable);
    if (t > 1000000) { tax += (t - 1000000) * 0.30; t = 1000000; }
    if (t > 500000) { tax += (t - 500000) * 0.20; t = 500000; }
    if (t > exemptLimit) { tax += (t - exemptLimit) * 0.05; }
    if (taxable <= 500000) tax = 0;
    return Math.round(tax * 1.04);
  }

  function calcNewRegimeTax(taxable) {
    if (taxable <= 0) return 0;
    var t = Math.max(0, taxable);
    var tax = 0;
    var slabs = [
      [400000, 0], [800000, 0.05], [1200000, 0.10],
      [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]
    ];
    var prev = 0;
    for (var i = 0; i < slabs.length; i++) {
      var limit = slabs[i][0], rate = slabs[i][1];
      var amt = Math.min(t, limit) - prev;
      if (amt > 0) tax += amt * rate;
      prev = limit;
      if (t <= limit) break;
    }
    if (taxable <= 1200000) tax = Math.max(0, tax - 60000);
    if (taxable <= 1200000 && tax < 0) tax = 0;
    return Math.round(tax * 1.04);
  }

  function runCalculator() {
    var income = parseInt(document.getElementById('calc-income').value) || 0;
    var age = document.getElementById('calc-age').value;
    var d80c = Math.min(parseInt(document.getElementById('calc-80c').value) || 0, 150000);
    var d80d = Math.min(parseInt(document.getElementById('calc-80d').value) || 0, 100000);
    var hra = parseInt(document.getElementById('calc-hra').value) || 0;
    var nps = Math.min(parseInt(document.getElementById('calc-nps').value) || 0, 50000);
    var hloan = Math.min(parseInt(document.getElementById('calc-hloan').value) || 0, 200000);
    var other = parseInt(document.getElementById('calc-other').value) || 0;

    var oldStdDed = 50000;
    var newStdDed = 75000;
    var totalOldDed = d80c + d80d + hra + nps + hloan + other + oldStdDed;
    var oldTaxable = Math.max(0, income - totalOldDed);
    var newTaxable = Math.max(0, income - newStdDed);

    var oldTax = calcOldRegimeTax(oldTaxable, age);
    var newTax = calcNewRegimeTax(newTaxable);

    var oldRate = income > 0 ? ((oldTax / income) * 100).toFixed(1) : '0';
    var newRate = income > 0 ? ((newTax / income) * 100).toFixed(1) : '0';

    document.getElementById('res-old-tax').textContent = fmt(oldTax);
    document.getElementById('res-new-tax').textContent = fmt(newTax);
    document.getElementById('res-old-rate').textContent = oldRate + '%';
    document.getElementById('res-new-rate').textContent = newRate + '%';

    var oldCard = document.getElementById('regime-old-card');
    var newCard = document.getElementById('regime-new-card');
    oldCard.classList.remove('winner-highlight');
    newCard.classList.remove('winner-highlight');

    var winnerEl = document.getElementById('winner-regime');
    var winnerAmt = document.getElementById('winner-amount');
    var diff = Math.abs(oldTax - newTax);

    if (oldTax <= newTax) {
      oldCard.classList.add('winner-highlight');
      winnerEl.textContent = 'Old Regime';
      winnerAmt.textContent = fmt(diff);
    } else {
      newCard.classList.add('winner-highlight');
      winnerEl.textContent = 'New Regime';
      winnerAmt.textContent = fmt(diff);
    }

    var maxTax = Math.max(oldTax, newTax, 1);
    document.getElementById('bar-old').style.width = ((oldTax / maxTax) * 100) + '%';
    document.getElementById('bar-new').style.width = ((newTax / maxTax) * 100) + '%';
    document.getElementById('bar-old-val').textContent = fmt(oldTax);
    document.getElementById('bar-new-val').textContent = fmt(newTax);

    document.getElementById('bd-old-gross').textContent = fmt(income);
    document.getElementById('bd-old-std').textContent = '-' + fmt(oldStdDed);
    document.getElementById('bd-old-80c').textContent = '-' + fmt(d80c);
    document.getElementById('bd-old-80d').textContent = '-' + fmt(d80d);
    document.getElementById('bd-old-others').textContent = '-' + fmt(hra + nps + hloan + other);
    document.getElementById('bd-old-taxable').textContent = fmt(oldTaxable);
    document.getElementById('bd-old-final').textContent = fmt(oldTax);

    document.getElementById('bd-new-gross').textContent = fmt(income);
    document.getElementById('bd-new-std').textContent = '-' + fmt(newStdDed);
    document.getElementById('bd-new-taxable').textContent = fmt(newTaxable);
    document.getElementById('bd-new-final').textContent = fmt(newTax);
    document.getElementById('bd-new-rebate').textContent = newTaxable <= 1200000 ? 'Up to ₹60,000' : '₹0';

    var tipEl = document.getElementById('savings-tip-text');
    var tips = [];
    if (income <= 700000) {
      tips.push('With income up to ₹7 lakh, you pay zero tax under the new regime thanks to the Section 87A rebate.');
    } else if (income <= 1200000) {
      tips.push('Great news! With income up to ₹12 lakh, the new regime offers full rebate under Section 87A — effectively zero tax!');
    }
    if (oldTax < newTax && totalOldDed > 375000) {
      tips.push('Your deductions of ' + fmt(totalOldDed) + ' make the old regime significantly better for you. Keep maximizing 80C, 80D, and NPS.');
    }
    if (newTax < oldTax) {
      tips.push('The new regime is better for you. You save ' + fmt(diff) + ' compared to the old regime. Consider redirecting 80C investments into higher-return options since deductions don\'t matter here.');
    }
    if (d80c < 150000) {
      tips.push('You can invest ' + fmt(150000 - d80c) + ' more under Section 80C (PPF, ELSS, NPS Tier-I) to save up to ' + fmt(Math.round((150000 - d80c) * 0.312)) + ' more in old regime.');
    }
    if (d80d === 0) {
      tips.push('Consider buying health insurance — Section 80D allows ₹25,000 deduction for self + ₹50,000 for senior citizen parents.');
    }
    if (nps === 0 && income > 1000000) {
      tips.push('NPS investment of ₹50,000 under 80CCD(1B) can save you ₹15,600 extra in the old regime (at 30% bracket).');
    }
    if (tips.length === 0) {
      tips.push('Enter your income and deductions above to get personalized tax-saving recommendations from our experts.');
    }
    tipEl.innerHTML = tips.join('<br><br>');
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', runCalculator);
    runCalculator();
  }

  // Info tooltip toggles
  document.querySelectorAll('.info-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var key = btn.getAttribute('data-tooltip');
      var popup = document.getElementById('info-' + key);
      if (!popup) return;
      var wasVisible = popup.classList.contains('visible');
      document.querySelectorAll('.info-popup.visible').forEach(function (p) { p.classList.remove('visible'); });
      if (!wasVisible) popup.classList.add('visible');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.info-popup') && !e.target.closest('.info-btn')) {
      document.querySelectorAll('.info-popup.visible').forEach(function (p) { p.classList.remove('visible'); });
    }
  });

  var shareBtn = document.getElementById('calc-share-wa');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var income = document.getElementById('calc-income').value || '0';
      var oldTax = document.getElementById('res-old-tax').textContent;
      var newTax = document.getElementById('res-new-tax').textContent;
      var oldRate = document.getElementById('res-old-rate').textContent;
      var newRate = document.getElementById('res-new-rate').textContent;
      var winnerEl = document.getElementById('regime-winner');
      var winner = winnerEl ? winnerEl.textContent.trim() : '';
      var tipEl = document.getElementById('savings-tip-text');
      var tip = tipEl ? tipEl.textContent.trim() : '';

      var text = '📊 *Tax Comparison — AY 2026-27*\n'
        + '━━━━━━━━━━━━━━━━\n'
        + '💰 *Gross Income:* ₹' + Number(income).toLocaleString('en-IN') + '\n\n'
        + '*Old Regime*\n'
        + '  Tax: ' + oldTax + ' | Eff. Rate: ' + oldRate + '\n\n'
        + '*New Regime*\n'
        + '  Tax: ' + newTax + ' | Eff. Rate: ' + newRate + '\n\n'
        + (winner ? '🏆 ' + winner + '\n\n' : '')
        + (tip ? '💡 *Tip:* ' + tip + '\n\n' : '')
        + '🔗 Try the calculator yourself: https://cakacholiya.github.io/legal-idea/\n'
        + '_Powered by Legal Idea_';

      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
    });
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
