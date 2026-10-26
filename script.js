/**
 * Smritilata Sarkar — Minimal Pokémon QA Portfolio
 * Interactive Controller (thezeroquotient style)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const burstCanvas = document.getElementById('burst-canvas');
  const soundToggle = document.getElementById('sound-toggle');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const trainerCard = document.getElementById('trainer-card');
  const pokemonPicker = document.getElementById('pokemon-picker');
  const activeCompanionName = document.getElementById('active-companion-name');
  const navLinks = document.querySelectorAll('.nav-link');
  const mLinks = document.querySelectorAll('.m-link');

  // =========================================================================
  // 1. PARTICLE CANVAS BURST ENGINE
  // =========================================================================
  const ctx = burstCanvas ? burstCanvas.getContext('2d') : null;
  let particles = [];
  let animId = null;

  function resizeCanvas() {
    if (burstCanvas) {
      burstCanvas.width = window.innerWidth;
      burstCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, customColor) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = Math.random() * 3.5 + 2;
      this.life = 1.0;
      this.decay = Math.random() * 0.03 + 0.02;
      
      const defaultColors = ['#ef4444', '#0284c7', '#fde047', '#10b981', '#a855f7'];
      this.color = customColor || defaultColors[Math.floor(Math.random() * defaultColors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.12; // subtle gravity
      this.vx *= 0.96;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnBurst(originX, originY, color = null, count = 35) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(originX, originY, color));
    }
    if (!animId) {
      renderParticles();
    }
  }

  function renderParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    if (particles.length > 0) {
      animId = requestAnimationFrame(renderParticles);
    } else {
      ctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
      animId = null;
    }
  }

  // =========================================================================
  // 2. SOUND TOGGLE
  // =========================================================================
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (window.pokeAudio) {
        const isEnabled = window.pokeAudio.toggleSound();
        const icon = soundToggle.querySelector('.sfx-icon');
        if (icon) {
          icon.textContent = isEnabled ? '🔊' : '🔇';
        }
        if (isEnabled) {
          window.pokeAudio.playMenuClick();
        }
      }
    });
  }

  // =========================================================================
  // 3. MOBILE MENU TOGGLE
  // =========================================================================
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDrawer.classList.toggle('open');
    });

    // Close when clicking any mobile link
    mLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        if (window.pokeAudio) window.pokeAudio.playMenuClick();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // =========================================================================
  // 4. GOTTA CATCH 'EM ALL — COMPANION PICKER
  // =========================================================================
  if (pokemonPicker) {
    const pokeButtons = pokemonPicker.querySelectorAll('.poke-btn');

    pokeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        pokeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const pokeName = btn.getAttribute('data-pokemon');
        const color = btn.getAttribute('data-color') || '#0284c7';

        if (activeCompanionName) {
          activeCompanionName.textContent = pokeName;
        }

        // Particle burst at button center
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        spawnBurst(centerX, centerY, color, 28);

        // Play catch audio
        if (window.pokeAudio) {
          window.pokeAudio.playBugCaught();
        }
      });
    });
  }

  // =========================================================================
  // 5. INTERACTIVE TRAINER CARD (Hover 3D Tilt + Tap Fanfare)
  // =========================================================================
  if (trainerCard) {
    trainerCard.addEventListener('mousemove', (e) => {
      const rect = trainerCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      trainerCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    trainerCard.addEventListener('mouseleave', () => {
      trainerCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });

    trainerCard.addEventListener('click', (e) => {
      const rect = trainerCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      spawnBurst(centerX, centerY, '#0284c7', 40);

      if (window.pokeAudio) {
        window.pokeAudio.playVictoryJingle();
      }
    });
  }

  // =========================================================================
  // 6. SCROLL SPY & SOUND TRIGGERS ON NAVIGATION
  // =========================================================================
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.pokeAudio) {
        window.pokeAudio.playMenuClick();
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});
