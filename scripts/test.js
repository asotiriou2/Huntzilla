/* ============================================================
   HUNTZILLA — MAIN SCRIPT
   - Pixel Runner game (with music + SFX)
   - Chaos Mode easter eggs
   - Animated starfield background
   ============================================================ */

/* ------------------------------------------------------------
   AUDIO — shared by game + chaos mode
   ------------------------------------------------------------ */
const music = document.getElementById('game-music');
let musicStarted = false;
let musicEnabled = true;

function startMusic() {
    if (!musicEnabled) return;
    if (musicStarted || !music) return;
    musicStarted = true;
    music.volume = 0.35;
    music.play().catch(() => { /* autoplay blocked — ignore */ });
}

function stopMusic() {
    if (music) music.pause();
}

/* ---- Web Audio helpers for SFX (no files needed) ---- */
const _AudioCtx = window.AudioContext || window.webkitAudioContext;
let _actx = null;

function ensureAudio() {
    if (!_actx) _actx = new _AudioCtx();
    if (_actx.state === 'suspended') _actx.resume();
}

function beep(freq, dur = 0.08, type = 'square', vol = 0.05) {
    if (!musicEnabled) return;
    ensureAudio();
    const o = _actx.createOscillator();
    const g = _actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, _actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, _actx.currentTime + dur);
    o.connect(g).connect(_actx.destination);
    o.start();
    o.stop(_actx.currentTime + dur);
}

/* ---- #music-button wiring (works on any page with the button) ---- */
(function () {
    const btn = document.getElementById('music-button');
    if (!btn) return;
    btn.addEventListener('click', e => {
        e.stopPropagation();
        musicEnabled = !musicEnabled;
        btn.textContent = musicEnabled ? 'Music: on' : 'Music: off';
        if (musicEnabled) startMusic();
        else stopMusic();
    });
})();

/* ------------------------------------------------------------
   PIXEL RUNNER GAME
   ------------------------------------------------------------ */
(function () {
    const canvas = document.getElementById('pixel-runner');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('pixel-runner-score');

    const W = canvas.width, H = canvas.height;
    const GROUND_Y = H - 30;
    const GRAVITY = 0.6;
    const JUMP_V = -10;

    let player, obstacles, score, best = 0, running, spawnTimer, speed;
    let lastMilestone = 0;
    let lastShown = -1;

    function reset() {
        player = { x: 60, y: GROUND_Y - 24, w: 24, h: 24, vy: 0, onGround: true };
        obstacles = [];
        score = 0;
        speed = 4;
        spawnTimer = 60;
        running = true;
        lastMilestone = 0;
        lastShown = -1;
        updateScore();
        startMusic();
    }

    function updateScore() {
        const shown = Math.floor(score);
        if (shown === lastShown) return;
        lastShown = shown;
        scoreEl.textContent = `Score: ${shown}  |  Best: ${best}`;
    }

    function jump() {
        ensureAudio();
        startMusic();
        if (!running) { reset(); return; }
        if (player.onGround) {
            player.vy = JUMP_V;
            player.onGround = false;
            beep(660, 0.08, 'square', 0.06);
        }
    }

    function spawnObstacle() {
        const h = 18 + Math.random() * 20;
        obstacles.push({ x: W, y: GROUND_Y - h, w: 14 + Math.random() * 10, h });
    }

    function update() {
        if (!running) return;

        // physics
        player.vy += GRAVITY;
        player.y += player.vy;
        if (player.y + player.h >= GROUND_Y) {
            player.y = GROUND_Y - player.h;
            player.vy = 0;
            player.onGround = true;
        }

        // obstacles
        if (--spawnTimer <= 0) {
            spawnObstacle();
            spawnTimer = 70 + Math.random() * 60;
        }
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.x -= speed;
            if (o.x + o.w < 0) obstacles.splice(i, 1);
            // collision (AABB)
            if (
                player.x < o.x + o.w &&
                player.x + player.w > o.x &&
                player.y < o.y + o.h &&
                player.y + player.h > o.y
            ) {
                running = false;
                best = Math.max(best, Math.floor(score));
                updateScore();
                stopMusic();
                beep(120, 0.3, 'sawtooth', 0.08);
                setTimeout(() => beep(80, 0.4, 'sawtooth', 0.08), 120);
            }
        }

        score += 0.1;
        speed = 4 + score * 0.002;   // slowly speeds up
        updateScore();

        // milestone ding every 10 points
        const s = Math.floor(score);
        if (s > 0 && s % 10 === 0 && s !== lastMilestone) {
            lastMilestone = s;
            beep(880, 0.06, 'square', 0.04);
            setTimeout(() => beep(1320, 0.08, 'square', 0.04), 70);
        }
    }

    function draw() {
        // sky
        ctx.fillStyle = '#005E89';
        ctx.fillRect(0, 0, W, H);

        // distant pixels (parallax feel)
        ctx.fillStyle = '#007BB3';
        for (let i = 0; i < 8; i++) {
            const bx = (i * 70 - (score * 2) % 70);
            ctx.fillRect(bx, GROUND_Y - 40, 30, 20);
        }

        // ground
        ctx.fillStyle = '#030315';
        ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
        ctx.fillStyle = '#00F1F3';
        ctx.fillRect(0, GROUND_Y, W, 3);

        // obstacles (yellow)
        ctx.fillStyle = '#FFD700';
        obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

        // player (teal box + eye)
        ctx.fillStyle = '#00F1F3';
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#030315';
        ctx.fillRect(player.x + player.w - 8, player.y + 6, 4, 4);

        // game over overlay
        if (!running) {
            ctx.fillStyle = 'rgba(3,3,21,0.75)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#00F1F3';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('Click / Space to restart', W / 2, H / 2 + 18);
        }
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    // input
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });
    document.addEventListener('keydown', e => {
        if (e.code === 'Space' && document.activeElement === document.body) {
            e.preventDefault();
            jump();
        }
    });

    reset();
    loop();
})();

/* ============================================================
   HUNTZILLA CHAOS MODE — drop at the bottom of scripts/index.js
   ============================================================ */
(function () {
    'use strict';

    /* ---------- 1. KONAMI CODE → CONFETTI STORM ---------- */
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
        'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let kIdx = 0;
    document.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === konami[kIdx]) {
            if (++kIdx === konami.length) {
                kIdx = 0;
                confettiStorm();
            }
        } else {
            kIdx = 0;
        }
    });

    function confettiStorm() {
        for (let i = 0; i < 150; i++) {
            const p = document.createElement('div');
            p.textContent = ['🎉','✨','🎊','💥','⭐','🦖'][Math.floor(Math.random()*6)];
            p.style.cssText = `
        position:fixed; left:${Math.random()*100}vw; top:-40px;
        font-size:${14+Math.random()*24}px; pointer-events:none;
        z-index:99999; transition: transform ${2+Math.random()*2}s ease-in,
                                        opacity ${2+Math.random()*2}s ease-in;
      `;
            document.body.appendChild(p);
            requestAnimationFrame(() => {
                p.style.transform = `translateY(${window.innerHeight+60}px) rotate(${Math.random()*720-360}deg)`;
                p.style.opacity = '0';
            });
            setTimeout(() => p.remove(), 4500);
        }
    }

    /* ---------- 2. CLICK LOGO 5 TIMES → LOGO GOES DRUNK ---------- */
    const logo = document.querySelector('.header-centre img');
    if (logo) {
        let clicks = 0, resetTimer;
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            clicks++;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => clicks = 0, 1500);
            if (clicks >= 5) {
                clicks = 0;
                drunkLogo();
            }
        });
    }

    function drunkLogo() {
        const logo = document.querySelector('.header-centre img');
        if (!logo) return;
        logo.style.transition = 'transform 0.15s';
        let t = 0;
        const iv = setInterval(() => {
            t += 0.3;
            logo.style.transform =
                `rotate(${Math.sin(t)*25}deg) translateY(${Math.cos(t*1.7)*10}px) scale(${1+Math.sin(t*2)*0.1})`;
            if (t > 18) { clearInterval(iv); logo.style.transform = ''; }
        }, 50);
    }

    /* ---------- 3. RANDOM PAGE TITLE SILLINESS ---------- */
    const titles = [
        'Huntzilla 🦖',
        'Do NOT click anything 👀',
        'You found the secret page!',
        'Huntzilla — 100% virus free*',
        'Still here? Impressive.',
        'Huntzilla 🦖 (this time it\'s personal)',
    ];
    let tIdx = 0;
    setInterval(() => {
        if (!document.hidden) {
            document.title = titles[tIdx++ % titles.length];
        }
    }, 5000);

    /* ---------- 4. SHAKE THE SCREEN IF YOU SCROLL TOO FAST ---------- */
    let lastScroll = 0, shakeCooldown = 0;
    window.addEventListener('scroll', () => {
        const now = Date.now();
        const delta = Math.abs(window.scrollY - lastScroll);
        lastScroll = window.scrollY;
        if (delta > 800 && now - shakeCooldown > 3000) {
            shakeCooldown = now;
            shakeScreen();
        }
    });

    function shakeScreen() {
        document.body.style.transition = 'transform 0.05s';
        let n = 0;
        const iv = setInterval(() => {
            document.body.style.transform =
                `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`;
            if (++n > 12) {
                clearInterval(iv);
                document.body.style.transform = '';
            }
        }, 50);
    }

    /* ---------- 5. SECRET MESSAGE IN THE CONSOLE ---------- */
    console.log('%c🦖 HUNTZILLA', 'font-size:40px; font-weight:bold; color:#00F1F3; text-shadow: 2px 2px 0 #030315;');
    console.log('%cYou found the developer console. Respect.', 'color:#FFD700; font-size:16px;');
    console.log('%cTry the Konami code: ↑↑↓↓←→←→BA', 'color:#fff; background:#005E89; padding:4px 8px; border-radius:4px;');
    console.log('%cThen try clicking the logo 5 times fast.', 'color:#fff;');
    console.log('%cAnd scroll really fast 👀', 'color:#fff;');

    /* ---------- 6. EASTER EGG: TYPE "party" ANYWHERE ---------- */
    let partyBuf = '';
    document.addEventListener('keydown', e => {
        if (e.key.length !== 1) return;
        partyBuf = (partyBuf + e.key.toLowerCase()).slice(-5);
        if (partyBuf === 'party') {
            partyBuf = '';
            partyMode();
        }
    });

    function partyMode() {
        confettiStorm();
        const html = document.documentElement;
        let t = 0;
        const iv = setInterval(() => {
            html.style.filter = `hue-rotate(${t}deg)`;
            t += 30;
            if (t > 720) { clearInterval(iv); html.style.filter = ''; }
        }, 60);
        // duck says hi
        const duck = document.createElement('div');
        duck.textContent = '🦆';
        duck.style.cssText = `position:fixed; bottom:20px; right:20px;
      font-size:60px; z-index:99999; transition: transform 0.3s;
      cursor:pointer;`;
        document.body.appendChild(duck);
        setTimeout(() => { duck.style.transform = 'translateY(-400px) scale(0)'; }, 2000);
        setTimeout(() => duck.remove(), 2500);
    }

    /* ---------- 7. FAKE "HACKER" SCROLLING CODE IN A CORNER ---------- */
    function hackerPanel() {
        const p = document.createElement('pre');
        p.style.cssText = `position:fixed; bottom:10px; left:10px;
      font-family: monospace; font-size:10px; color:#00ff88;
      background:rgba(0,0,0,0.7); padding:8px; border-radius:6px;
      z-index:99998; pointer-events:none; max-height:120px;
      overflow:hidden; line-height:1.2; opacity:0.7;`;
        document.body.appendChild(p);
        const chars = '01アイウエオカキクケコサシスセソ$#@%&';
        setInterval(() => {
            let line = '';
            for (let i = 0; i < 30; i++) line += chars[Math.floor(Math.random()*chars.length)];
            const lines = p.textContent.split('\n').slice(-6);
            lines.push(line);
            p.textContent = lines.join('\n');
        }, 120);
    }

    // Uncomment to enable the hacker panel:
    // hackerPanel();

    /* ---------- 8. PROTECT THE FOOTER (it fights back) ---------- */
    const footer = document.querySelector('footer');
    if (footer) {
        footer.addEventListener('mouseenter', () => {
            footer.style.transition = 'transform 0.3s';
            footer.style.transform = 'translateY(-3px)';
        });
        footer.addEventListener('mouseleave', () => {
            footer.style.transform = '';
        });
    }

})();

/* ============================================================
   CHAOS BACKGROUND — full-screen animated canvas
   ============================================================ */
(function () {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.id = 'chaos-bg';
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        pointer-events: none;
        background: #030315;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, stars, comets, nebulaPhase;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        buildStars();
    }

    function buildStars() {
        const count = Math.floor((W * H) / 6000);   // density
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                z: Math.random() * 3 + 0.3,        // parallax depth
                r: Math.random() * 1.6 + 0.3,
                tw: Math.random() * Math.PI * 2,   // twinkle phase
            });
        }
    }

    let cometTimer = 200;
    comets = [];

    function spawnComet() {
        const fromLeft = Math.random() < 0.5;
        comets.push({
            x: fromLeft ? -50 : W + 50,
            y: Math.random() * H * 0.6,
            vx: (fromLeft ? 1 : -1) * (8 + Math.random() * 6),
            vy: 1 + Math.random() * 3,
            life: 1,
            len: 80 + Math.random() * 120,
        });
    }

    function loop() {
        // fade previous frame (trail effect)
        ctx.fillStyle = 'rgba(3,3,21,0.35)';
        ctx.fillRect(0, 0, W, H);

        // ── nebula pulse
        nebulaPhase = (nebulaPhase || 0) + 0.003;
        const cx = W * 0.5 + Math.sin(nebulaPhase) * W * 0.25;
        const cy = H * 0.5 + Math.cos(nebulaPhase * 0.7) * H * 0.25;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
        grad.addColorStop(0, 'rgba(0,241,243,0.10)');
        grad.addColorStop(0.4, 'rgba(0,123,179,0.05)');
        grad.addColorStop(1, 'rgba(3,3,21,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // ── stars
        for (const s of stars) {
            s.tw += 0.05;
            const alpha = 0.4 + Math.sin(s.tw) * 0.4;
            ctx.fillStyle = `rgba(0,241,243,${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();

            // slow parallax drift
            s.y += s.z * 0.15;
            if (s.y > H) { s.y = -2; s.x = Math.random() * W; }

            // occasional yellow sparkle
            if (Math.random() < 0.001) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(s.x, s.y, 2, 2);
            }
        }

        // ── comets
        if (--cometTimer <= 0) {
            spawnComet();
            cometTimer = 180 + Math.random() * 300;
        }
        for (let i = comets.length - 1; i >= 0; i--) {
            const c = comets[i];
            c.x += c.vx;
            c.y += c.vy;
            c.life -= 0.008;

            ctx.strokeStyle = `rgba(255,255,255,${Math.max(c.life, 0)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x - c.vx * (c.len / 100), c.y - c.vy * (c.len / 100));
            ctx.stroke();

            if (c.life <= 0 || c.x < -200 || c.x > W + 200 || c.y > H + 200) {
                comets.splice(i, 1);
            }
        }

        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    resize();
    loop();
})();