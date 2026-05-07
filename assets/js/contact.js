document.addEventListener('DOMContentLoaded', function() {

  // Particle animation for hero
  const canvas = document.getElementById('contact-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      };
    }

    for (let i = 0; i < 60; i++) {
      particles.push(createParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.1 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    }
    animate();
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Form input animations
  const inputs = document.querySelectorAll('.input-icon-wrap input, .input-icon-wrap select, .input-icon-wrap textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.input-icon-wrap').classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.input-icon-wrap').classList.remove('focused');
    });
  });

  // Form submission — redirect to WhatsApp
  const form = document.querySelector('.contact-form-v2');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = (form.querySelector('#cf-name') || {}).value || '';
      var email = (form.querySelector('#cf-email') || {}).value || '';
      var phone = (form.querySelector('#cf-phone') || {}).value || '';
      var service = (form.querySelector('#cf-service') || {}).value || '';
      var message = (form.querySelector('#cf-message') || {}).value || '';

      var text = 'Hi Legal Idea, I need help.\n\n'
        + '*Name:* ' + name + '\n'
        + '*Email:* ' + email + '\n'
        + (phone ? '*Phone:* ' + phone + '\n' : '')
        + '*Service:* ' + service + '\n'
        + (message ? '*Message:* ' + message + '\n' : '');

      var btn = form.querySelector('.submit-btn');
      var originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> <span>Redirecting to WhatsApp...</span>';
      btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';

      setTimeout(function() {
        window.open('https://api.whatsapp.com/send?phone=917828054641&text=' + encodeURIComponent(text), '_blank');
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        form.reset();
      }, 500);
    });
  }

  // Animate stats on scroll
  const stats = document.querySelectorAll('.hero-stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(s => observer.observe(s));

});
