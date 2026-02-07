/**
 * Avatar Easter Egg — Dev Projects
 *
 * Click .dp-avatar-wrap: physics-based spin on img. At high angular velocity, confetti bursts
 * and avatar swaps to profile-spun.jpg once per session (no revert).
 * Cooldown 1500ms; clicks during cooldown trigger wiggle or velocity boost if already spinning.
 * Respects prefers-reduced-motion (no listener when reduced).
 * Exposes window.DPAvatarEasterEgg.
 */
(function () {
  'use strict';

  var COOLDOWN_MS = 1500;
  var CLICK_BOOST = 12;
  var MAX_VELOCITY = 50;
  var FRICTION = 0.98;
  var STOP_THRESHOLD = 0.1;
  var HIGH_SPEED_THRESHOLD = 35;
  var SPUN_IMAGE_PATH = 'assets/images/profile-spun.jpg';
  var PARTICLE_COUNT = 35;
  var PARTICLE_VEL_MIN = 2;
  var PARTICLE_VEL_MAX = 6;
  var PARTICLE_SIZE_MIN = 3;
  var PARTICLE_SIZE_MAX = 6;
  var GRAVITY = 0.12;
  var PARTICLE_FRICTION = 0.98;
  var PARTICLE_LIFETIME_FRAMES = 60;
  var COLOR_PALETTE = ['#5B8DEF', '#7DD3C0', '#F7B955', '#EF6B6B', '#C084FC'];

  var reducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var wrap = null;
  var img = null;
  var cooldownUntil = 0;
  var clickHandler = null;
  var currentAngle = 0;
  var angularVelocity = 0;
  var animFrameId = null;
  var spunImageShown = false;

  function getImg(wrapper) {
    if (!wrapper) return null;
    var im = wrapper.querySelector('img');
    return im || null;
  }

  function runConfetti(wrapper) {
    var w = wrapper.offsetWidth;
    var h = wrapper.offsetHeight;
    if (w <= 0 || h <= 0) return;
    var canvasW = w * 3;
    var canvasH = h * 3;
    var canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    wrapper.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var centerX = canvasW / 2;
    var centerY = canvasH / 2;
    var particles = [];
    var i;
    for (i = 0; i < PARTICLE_COUNT; i++) {
      var angle = Math.random() * Math.PI * 2;
      var vel = PARTICLE_VEL_MIN + Math.random() * (PARTICLE_VEL_MAX - PARTICLE_VEL_MIN);
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        size: PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN),
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
        life: PARTICLE_LIFETIME_FRAMES,
        maxLife: PARTICLE_LIFETIME_FRAMES
      });
    }

    var rafId = null;
    function tick() {
      ctx.clearRect(0, 0, canvasW, canvasH);
      var allDead = true;
      for (i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.life <= 0) continue;
        allDead = false;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.vx *= PARTICLE_FRICTION;
        p.vy *= PARTICLE_FRICTION;
        p.life -= 1;
        var opacity = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (allDead) {
        if (rafId) cancelAnimationFrame(rafId);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function spinLoop() {
    if (!wrap || !img || !wrap._dpAvatarEasterEggAttached) {
      animFrameId = null;
      return;
    }
    currentAngle += angularVelocity;
    angularVelocity *= FRICTION;
    img.style.transform = 'rotate(' + currentAngle + 'deg)';
    if (!spunImageShown && angularVelocity >= HIGH_SPEED_THRESHOLD) {
      img.src = SPUN_IMAGE_PATH;
      spunImageShown = true;
      runConfetti(wrap);
    }
    if (angularVelocity < STOP_THRESHOLD) {
      angularVelocity = 0;
      setTimeout(function() { img.style.willChange = ''; img.style.transition = ''; }, 200);
      animFrameId = null;
      return;
    }
    animFrameId = requestAnimationFrame(spinLoop);
  }

  function onWiggleEnd(e) {
    if (e.target !== img) return;
    if (e.animationName === 'dp-avatar-wiggle') {
      img.classList.remove('dp-avatar-wiggle');
      img.removeEventListener('animationend', onWiggleEnd);
    }
  }

  function fireSpin() {
    img.style.transition = 'none';
    img.style.willChange = 'transform';
    angularVelocity = Math.min(angularVelocity + CLICK_BOOST, MAX_VELOCITY);
    cooldownUntil = Date.now() + COOLDOWN_MS;
    if (animFrameId === null) {
      animFrameId = requestAnimationFrame(spinLoop);
    }
  }

  function fireWiggle() {
    if (angularVelocity > 0) {
      img.style.transition = 'none';
      angularVelocity = Math.min(angularVelocity + CLICK_BOOST, MAX_VELOCITY);
      if (animFrameId === null) {
        animFrameId = requestAnimationFrame(spinLoop);
      }
      return;
    }
    img.classList.add('dp-avatar-wiggle');
    img.addEventListener('animationend', onWiggleEnd);
  }

  function handleClick() {
    if (!wrap || !img) return;
    var now = Date.now();
    if (now >= cooldownUntil) {
      fireSpin();
    } else {
      fireWiggle();
    }
  }

  function attach() {
    if (!wrap || !img || wrap._dpAvatarEasterEggAttached) return;
    clickHandler = handleClick;
    wrap.addEventListener('click', clickHandler);
    wrap._dpAvatarEasterEggAttached = true;
  }

  function detach() {
    if (!wrap) return;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (clickHandler) {
      wrap.removeEventListener('click', clickHandler);
      clickHandler = null;
    }
    wrap._dpAvatarEasterEggAttached = false;
  }

  function init() {
    wrap = document.querySelector('.dp-avatar-wrap');
    img = getImg(wrap);
    if (reducedMotionQuery && reducedMotionQuery.matches) {
      detach();
      return;
    }
    attach();
  }

  function onReducedMotionChange() {
    if (reducedMotionQuery && reducedMotionQuery.matches) {
      detach();
    } else {
      init();
    }
  }

  if (reducedMotionQuery && reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);
  }

  window.DPAvatarEasterEgg = {
    init: function () {
      init();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
