/**
 * Smritilata Sarkar — Minimal Pokémon QA Portfolio
 * Interactive Controller (thezeroquotient style + 3D Pokéball Animation)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const burstCanvas = document.getElementById('burst-canvas');
  const soundToggle = document.getElementById('sound-toggle');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const summonStage = document.getElementById('summon-stage');
  const mainBall = document.getElementById('main-pokeball');
  const triggerBtn = document.getElementById('trigger-summon-btn');
  const skipBtn = document.getElementById('skip-summon-btn');
  const replayBtn = document.getElementById('replay-summon-btn');
  const floatingPokeball = document.getElementById('floating-pokeball');
  const trainerCard = document.getElementById('trainer-card');
  const pokemonPicker = document.getElementById('pokemon-picker');
  const activeCompanionName = document.getElementById('active-companion-name');
  const miniPokeball = document.getElementById('mini-pokeball');
  const navLinks = document.querySelectorAll('.nav-link');
  const mLinks = document.querySelectorAll('.m-link');

  let isOpening = false;
  let isSummoned = false;

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
      const speed = Math.random() * 10 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = Math.random() * 4 + 2;
      this.life = 1.0;
      this.decay = Math.random() * 0.025 + 0.015;
      
      const defaultColors = ['#ef4444', '#0284c7', '#fde047', '#10b981', '#a855f7', '#ffffff'];
      this.color = customColor || defaultColors[Math.floor(Math.random() * defaultColors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.12; // subtle gravity
      this.vx *= 0.97;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnBurst(originX, originY, color = null, count = 45) {
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
  // 2. 3D POKÉBALL OPENING / SUMMON ANIMATION
  // =========================================================================
  function summonQAEngineer() {
    if (isOpening || isSummoned || !summonStage) return;
    isOpening = true;

    // Wobble & audio
    if (window.pokeAudio) {
      window.pokeAudio.playBallClick();
      window.pokeAudio.playBallWobble();
    }

    if (mainBall) {
      mainBall.classList.add('ball-shaking');
    }

    // Phase 1: Ball shaking
    setTimeout(() => {
      if (mainBall) mainBall.classList.remove('ball-shaking');
      summonStage.className = 'hero-card-col stage-opening';

      // Calculate center of Pokéball for burst blast
      let centerX = window.innerWidth / 2;
      let centerY = window.innerHeight / 2;
      if (mainBall) {
        const rect = mainBall.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }
      spawnBurst(centerX, centerY, null, 70);

      // Play laser release audio
      if (window.pokeAudio) {
        window.pokeAudio.playBallRelease();
      }

      // Phase 2: Deploy Trainer Card
      setTimeout(() => {
        summonStage.className = 'hero-card-col stage-opened';
        isSummoned = true;
        isOpening = false;

        // Victory jingle fanfare
        if (window.pokeAudio) {
          window.pokeAudio.playVictoryJingle();
        }

        // Secondary subtle sparkle burst
        setTimeout(() => {
          if (trainerCard) {
            const cardRect = trainerCard.getBoundingClientRect();
            spawnBurst(cardRect.left + cardRect.width / 2, cardRect.top + cardRect.height / 2, '#38bdf8', 25);
          }
        }, 200);
      }, 420);
    }, 380);
  }

  function resetSummon() {
    if (!summonStage) return;
    summonStage.className = 'hero-card-col stage-closed';
    isSummoned = false;
    isOpening = false;

    if (window.pokeAudio) {
      window.pokeAudio.playBallClick();
    }
  }

  function skipSummon() {
    if (!summonStage) return;
    summonStage.className = 'hero-card-col stage-opened';
    isSummoned = true;
    isOpening = false;

    if (window.pokeAudio) {
      window.pokeAudio.playVictoryJingle();
    }
  }

  // Event Listeners for Summon
  if (mainBall) {
    mainBall.addEventListener('click', () => {
      if (!isSummoned) summonQAEngineer();
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', summonQAEngineer);
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', resetSummon);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', skipSummon);
  }

  // Floating Action Pokéball Button
  if (floatingPokeball) {
    floatingPokeball.addEventListener('click', () => {
      const rect = floatingPokeball.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#ef4444', 25);

      if (window.pokeAudio) {
        window.pokeAudio.playBallClick();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        if (!isSummoned) {
          summonQAEngineer();
        } else {
          // If already summoned, reset and re-summon for user delight!
          resetSummon();
          setTimeout(summonQAEngineer, 300);
        }
      }, 350);
    });
  }

  // Spacebar to trigger summon when near top of the page
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSummoned && window.scrollY < 350 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      summonQAEngineer();
    }
  });

  // =========================================================================
  // 3. SOUND TOGGLE
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
  // 4. MOBILE MENU TOGGLE
  // =========================================================================
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDrawer.classList.toggle('open');
    });

    mLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        if (window.pokeAudio) window.pokeAudio.playMenuClick();
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // =========================================================================
  // 5. GOTTA CATCH 'EM ALL — COMPANION PICKER WITH POKÉBALL CATCH ANIMATION
  // =========================================================================
  if (pokemonPicker) {
    const pokeButtons = pokemonPicker.querySelectorAll('.poke-btn');

    pokeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pokeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const pokeName = btn.getAttribute('data-pokemon');
        const color = btn.getAttribute('data-color') || '#0284c7';

        if (activeCompanionName) {
          activeCompanionName.textContent = pokeName;
        }

        // Wobble mini-pokeball animation
        if (miniPokeball) {
          miniPokeball.classList.remove('wobble-catch');
          void miniPokeball.offsetWidth; // trigger reflow
          miniPokeball.classList.add('wobble-catch');
        }

        // Particle burst at button center
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        spawnBurst(centerX, centerY, color, 30);

        // Play catch audio
        if (window.pokeAudio) {
          window.pokeAudio.playBugCaught();
        }
      });
    });
  }

  // =========================================================================
  // 6. INTERACTIVE TRAINER CARD (Hover 3D Tilt + Tap Fanfare)
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

    trainerCard.addEventListener('click', () => {
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
  // 7. SCROLL SPY & SOUND TRIGGERS ON NAVIGATION
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
