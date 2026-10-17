'use strict';

// All effects are local. Native cursors, controls, and storage stay independent.
(() => {
  const canvas = document.getElementById('constellation-background');
  const toggle = document.getElementById('motion-toggle');
  if (!canvas || !toggle) return;
  const root = document.documentElement;
  const context = canvas.getContext('2d');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let userEnabled = true;
  try { userEnabled = localStorage.getItem('hobbyquest.motion.v1') !== 'off'; } catch { /* Effects never require storage. */ }
  let enabled = false;
  let frame = 0;
  let lastTime = 0;
  let pointerFrame = 0;
  let width = 0;
  let height = 0;
  let surface = null;
  const pointer = {x:-1000,y:-1000};
  const particles = Array.from({length:40}, (_,index) => ({x:((index * 137.508) % 997) / 997,y:((index * 83.119) % 991) / 991,vx:Math.sin(index * 2.3) * .000006,vy:Math.cos(index * 3.7) * .000006}));

  function resetSurface() {
    if (!surface) return;
    for (const name of ['--glow-x','--glow-y','--tilt-x','--tilt-y']) surface.style.removeProperty(name);
    surface.classList.remove('pointer-lit');
    surface = null;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1,1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio,0,0,ratio,0,0);
  }

  function draw(time) {
    frame = 0;
    if (!enabled || document.hidden || !context) return;
    const elapsed = Math.min(time - lastTime,60);
    if (elapsed >= 32) {
      lastTime = time;
      context.clearRect(0,0,width,height);
      for (const p of particles) {
        p.x = (p.x + p.vx * elapsed + 1) % 1;
        p.y = (p.y + p.vy * elapsed + 1) % 1;
      }
      for (let index = 0; index < particles.length; index++) {
        const a = particles[index];
        const x = a.x * width, y = a.y * height;
        const nearPointer = Math.hypot(x - pointer.x,y - pointer.y);
        context.beginPath();
        context.arc(x,y,nearPointer < 220 ? 1.7 : 1,0,Math.PI * 2);
        context.fillStyle = nearPointer < 220 ? '#ff7b9c' : '#82616f';
        context.fill();
        if (nearPointer < 190) {
          context.beginPath();context.moveTo(x,y);context.lineTo(pointer.x,pointer.y);
          context.strokeStyle = `rgba(255,55,104,${.2 * (1 - nearPointer / 190)})`;
          context.stroke();
        }
        for (let other = index + 1; other < particles.length; other++) {
          const b = particles[other];
          const distance = Math.hypot(x - b.x * width,y - b.y * height);
          if (distance < 135) {
            context.beginPath();context.moveTo(x,y);context.lineTo(b.x * width,b.y * height);
            context.strokeStyle = `rgba(184,68,99,${.1 * (1 - distance / 135)})`;
            context.stroke();
          }
        }
      }
    }
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    // Ambient light works on touch too; cursor/canvas work remains desktop-only.
    enabled = userEnabled && !preference.matches;
    root.classList.toggle('motion-enabled',enabled);
    root.classList.toggle('motion-paused',!enabled);
    root.classList.toggle('background-paused',document.hidden);
    toggle.textContent = preference.matches ? 'Motion reduced' : enabled ? 'Motion on' : 'Motion off';
    toggle.disabled = preference.matches;
    toggle.setAttribute('aria-pressed',String(enabled));
    cancelAnimationFrame(frame);frame = 0;
    cancelAnimationFrame(pointerFrame);pointerFrame = 0;
    if (!enabled || !finePointer.matches) {
      resetSurface();root.classList.remove('pointer-present');
      if (context) context.clearRect(0,0,width,height);
    } else if (!document.hidden && context) {lastTime = 0;frame = requestAnimationFrame(draw);}
  }

  document.addEventListener('pointermove',event => {
    if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
    pointer.x = event.clientX;pointer.y = event.clientY;
    const candidate = event.target instanceof Element ? event.target.closest('.interest-card, .story-card, .discovery-card, .search-box, .nav-link, .primary-button, .save-button') : null;
    if (surface !== candidate) {resetSurface();surface = candidate;}
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!enabled) return;
      root.classList.add('pointer-present');
      root.style.setProperty('--pointer-x',`${pointer.x}px`);
      root.style.setProperty('--pointer-y',`${pointer.y}px`);
      root.style.setProperty('--scene-x',`${(pointer.x / width - .5) * 9}px`);
      root.style.setProperty('--scene-y',`${(pointer.y / height - .5) * 7}px`);
      if (surface) {
        const bounds = surface.getBoundingClientRect();
        const x = pointer.x - bounds.left, y = pointer.y - bounds.top;
        surface.style.setProperty('--glow-x',`${x}px`);
        surface.style.setProperty('--glow-y',`${y}px`);
        surface.style.setProperty('--tilt-x',`${(y / Math.max(bounds.height,1) - .5) * -5}deg`);
        surface.style.setProperty('--tilt-y',`${(x / Math.max(bounds.width,1) - .5) * 5}deg`);
        surface.classList.add('pointer-lit');
      }
    });
  },{passive:true});
  document.addEventListener('pointerleave',() => {
    cancelAnimationFrame(pointerFrame);pointerFrame = 0;
    pointer.x = -1000;pointer.y = -1000;
    root.classList.remove('pointer-present');resetSurface();
  });
  window.addEventListener('blur',() => {root.classList.remove('pointer-present');resetSurface();});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',sync);
  preference.addEventListener('change',sync);
  finePointer.addEventListener('change',sync);
  toggle.addEventListener('click',() => {
    userEnabled = !userEnabled;
    try {localStorage.setItem('hobbyquest.motion.v1',userEnabled ? 'on' : 'off');} catch { /* Keep the toggle usable without storage. */ }
    sync();
  });
  resize();sync();
})();

