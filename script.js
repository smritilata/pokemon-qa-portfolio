/**
 * Poké-Portfolio Core Interactive Logic
 * Handles Pokéball Opening Sequence, Particle Bursts, Mini-Game, Audio Triggers, and Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const stage = document.getElementById('summon-stage');
  const mainBall = document.getElementById('main-pokeball');
  const triggerBtn = document.getElementById('trigger-summon-btn');
  const replayBtn = document.getElementById('replay-summon-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const dialogueText = document.getElementById('dialogue-typed-text');
  const burstCanvas = document.getElementById('burst-canvas');
  const themePills = document.querySelectorAll('.ball-pill');

  let isSummoned = false;
  let isOpening = false;

  // Canvas setup for particle blast
  const ctx = burstCanvas ? burstCanvas.getContext('2d') : null;
  let particles = [];
  let shockwaves = [];
  let animId = null;

  function resizeCanvas() {
    if (burstCanvas) {
      burstCanvas.width = window.innerWidth;
      burstCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle & Shockwave Engine
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = Math.random() * 4 + 2;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.015;
      const colors = ['#ef4444', '#38bdf8', '#fbbf24', '#ffffff', '#a855f7'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15; // subtle gravity
      this.vx *= 0.98;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Shockwave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 10;
      this.maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.6;
      this.life = 1.0;
      this.decay = 0.025;
      this.color = '#38bdf8';
    }

    update() {
      this.radius += 20;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4 * this.life;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function createBurst(originX, originY) {
    particles = [];
    shockwaves = [];
    for (let i = 0; i < 90; i++) {
      particles.push(new Particle(originX, originY));
    }
    shockwaves.push(new Shockwave(originX, originY));
    shockwaves.push(new Shockwave(originX, originY));

    if (!animId) {
      renderLoop();
    }
  }

  function renderLoop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    shockwaves = shockwaves.filter(s => s.life > 0);
    shockwaves.forEach(s => {
      s.update();
      s.draw(ctx);
    });

    if (particles.length > 0 || shockwaves.length > 0) {
      animId = requestAnimationFrame(renderLoop);
    } else {
      ctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
      animId = null;
    }
  }

  // =========================================================================
  // POKÉBALL OPENING / RELEASE SEQUENCE
  // =========================================================================
  function summonQAEngineer() {
    if (isOpening || isSummoned) return;
    isOpening = true;

    if (window.pokeAudio) {
      window.pokeAudio.playBallClick();
      window.pokeAudio.playBallWobble();
    }

    // Phase 1: Shake the ball
    mainBall.classList.add('ball-shaking');
    dialogueText.textContent = "Releasing security seal... Pokéball is energizing!";

    setTimeout(() => {
      mainBall.classList.remove('ball-shaking');
      stage.classList.remove('stage-closed');
      stage.classList.add('stage-opening');

      // Calculate center of Pokéball for burst effect
      const rect = mainBall.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createBurst(centerX, centerY);

      // Play epic release sound
      if (window.pokeAudio) {
        window.pokeAudio.playBallRelease();
      }

      // Phase 2: Full deployment
      setTimeout(() => {
        stage.classList.remove('stage-opening');
        stage.classList.add('stage-opened');
        isSummoned = true;
        isOpening = false;

        dialogueText.textContent = "✦ Smritilata Sarkar was summoned! Ready to squash bugs and engineer automated tests!";
        
        // Victory fanfare
        if (window.pokeAudio) {
          window.pokeAudio.playVictoryJingle();
        }
      }, 450);
    }, 380);
  }

  // Reset / Replay Summon
  function resetSummon() {
    stage.classList.remove('stage-opening', 'stage-opened');
    stage.classList.add('stage-closed');
    isSummoned = false;
    isOpening = false;
    dialogueText.textContent = "A wild QA Champion appeared! Click the Pokéball to release Smritilata Sarkar!";
    
    if (window.pokeAudio) {
      window.pokeAudio.playBallClick();
    }

    // Scroll to top of stage
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

  // Spacebar to trigger summon when on top
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSummoned && window.scrollY < 300) {
      e.preventDefault();
      summonQAEngineer();
    }
  });

  // Sound toggle button
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (window.pokeAudio) {
        const enabled = window.pokeAudio.toggleSound();
        const icon = soundToggle.querySelector('.icon');
        const text = soundToggle.querySelector('.btn-text');
        if (enabled) {
          icon.textContent = '🔊';
          text.textContent = 'SFX: ON';
          window.pokeAudio.playMenuClick();
        } else {
          icon.textContent = '🔇';
          text.textContent = 'SFX: OFF';
        }
      }
    });
  }

  // Theme switchers
  themePills.forEach(pill => {
    pill.addEventListener('click', () => {
      themePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const themeClass = pill.getAttribute('data-theme');
      document.body.className = themeClass;
      if (window.pokeAudio) window.pokeAudio.playMenuClick();
    });
  });

  // =========================================================================
  // SKILLS FILTERING
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (window.pokeAudio) window.pokeAudio.playMenuClick();

      const filter = btn.getAttribute('data-filter');
      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // =========================================================================
  // POKÉ-BUG CATCHER MINI-GAME
  // =========================================================================
  const startBtn = document.getElementById('start-game-btn');
  const gameBoard = document.getElementById('game-board');
  const gameIntro = document.getElementById('game-intro');
  const scoreVal = document.getElementById('game-score-val');
  const timeVal = document.getElementById('game-time-val');

  let score = 0;
  let timeLeft = 30;
  let gameInterval = null;
  let spawnInterval = null;
  let gameActive = false;

  const bugSprites = ['🐛', '🐞', '🪲', '👾', '🦗'];

  function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = 0;
    timeLeft = 30;
    scoreVal.textContent = score;
    timeVal.textContent = timeLeft + 's';
    gameIntro.style.display = 'none';
    startBtn.disabled = true;
    startBtn.textContent = 'HUNTING BUGS...';

    if (window.pokeAudio) window.pokeAudio.playBallRelease();

    // Spawn bugs continuously
    spawnInterval = setInterval(spawnBug, 750);

    // Timer countdown
    gameInterval = setInterval(() => {
      timeLeft--;
      timeVal.textContent = timeLeft + 's';

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function spawnBug() {
    if (!gameActive) return;
    const boardRect = gameBoard.getBoundingClientRect();
    const maxX = boardRect.width - 60;
    const maxY = boardRect.height - 60;

    const bug = document.createElement('div');
    bug.className = 'spawned-bug';
    bug.textContent = bugSprites[Math.floor(Math.random() * bugSprites.length)];

    const posX = Math.floor(Math.random() * maxX);
    const posY = Math.floor(Math.random() * maxY);

    bug.style.left = `${posX}px`;
    bug.style.top = `${posY}px`;

    bug.addEventListener('click', (e) => {
      e.stopPropagation();
      catchBug(bug);
    });

    gameBoard.appendChild(bug);

    // Auto despawn after 2.2s if not caught
    setTimeout(() => {
      if (bug.parentNode === gameBoard) {
        bug.style.opacity = '0';
        setTimeout(() => bug.remove(), 200);
      }
    }, 2200);
  }

  function catchBug(bugElem) {
    if (!gameActive) return;
    score++;
    scoreVal.textContent = score;

    if (window.pokeAudio) window.pokeAudio.playBugCaught();

    // Capture visual effect
    bugElem.textContent = '⚡';
    bugElem.style.background = '#38bdf8';
    bugElem.style.transform = 'scale(1.4)';

    setTimeout(() => {
      bugElem.remove();
    }, 150);
  }

  function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    // Clear board of remaining bugs
    document.querySelectorAll('.spawned-bug').forEach(b => b.remove());

    startBtn.disabled = false;
    startBtn.textContent = 'HUNT AGAIN';
    gameIntro.style.display = 'flex';
    gameIntro.innerHTML = `<p>🎉 Great Job! You squashed <strong>${score} bugs</strong> with Smritilata!<br>Every software application needs a vigilant QA Champion like her!</p>`;

    if (window.pokeAudio) window.pokeAudio.playVictoryJingle();
  }

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

  // =========================================================================
  // MOBILE NAVIGATION & ACTIVE SCROLL SPY
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.pokeAudio) window.pokeAudio.playMenuClick();
      if (navMenu) navMenu.classList.remove('mobile-open');
    });
  });

  // Active section scroll spy
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 140;

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

// Transmission Form Handler
function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('sender-name').value;
  const email = document.getElementById('sender-email').value;
  const subject = document.getElementById('sender-subject').value;
  const message = document.getElementById('sender-message').value;
  const feedback = document.getElementById('form-feedback');

  if (window.pokeAudio) window.pokeAudio.playVictoryJingle();

  feedback.style.color = '#34d399';
  feedback.textContent = `Transmission ready! Opening email client to dispatch to Smritilata Sarkar...`;

  setTimeout(() => {
    const mailtoUrl = `mailto:smritilatasarkar2018@gmail.com?subject=${encodeURIComponent(`[QA Inquiry] ${subject}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoUrl;
  }, 900);
}
