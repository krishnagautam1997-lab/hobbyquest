'use strict';

// Scroll-linked zoom without scroll hijacking, hidden content, or an animation dependency.
(() => {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('.collection, .world-section:not(.world-notes):not(.world-footnote):not(.world-connections)')];
  const heroes = [...document.querySelectorAll('.hero, .world-hero')];
  let enabled = false, frame = 0;
  const clamp = value => Math.min(1,Math.max(0,value));
  function paint() {
    frame = 0;if (!enabled || document.hidden) return;
    const height = Math.max(window.innerHeight,1);
    // Read untransformed parent geometry first. Only their children are transformed.
    const sectionBounds = sections.filter(node => node.getClientRects().length).map(node => ({node,rect:node.getBoundingClientRect()}));
    const heroBounds = heroes.filter(node => node.getClientRects().length).map(node => ({node,rect:node.getBoundingClientRect()}));
    for (const {node,rect} of sectionBounds) {
      if (rect.top > height+150 || rect.bottom < -150) continue;
      const entering = clamp((height-rect.top)/(height*.5));
      const leaving = clamp(rect.bottom/(height*.3));
      const reveal = Math.min(entering,leaving);
      node.style.setProperty('--section-scale',(.94+.06*reveal).toFixed(4));
      node.style.setProperty('--section-y',`${(28*(1-entering)).toFixed(2)}px`);
      node.style.setProperty('--section-opacity',(.72+.28*reveal).toFixed(3));
    }
    for (const {node,rect} of heroBounds) {
      if (rect.bottom < -100 || rect.top > height) continue;
      const progress = clamp(-rect.top/Math.max(rect.height,1));
      node.style.setProperty('--hero-copy-scale',(1-.04*progress).toFixed(4));
      node.style.setProperty('--hero-copy-y',`${(-32*progress).toFixed(2)}px`);
      node.style.setProperty('--hero-art-scale',(1.05-.08*progress).toFixed(4));
    }
  }
  function schedule() {if (enabled && !document.hidden && !frame) frame = requestAnimationFrame(paint);}
  function sync() {
    enabled = root.classList.contains('motion-enabled') && !preference.matches && !document.hidden;
    // Avoid observing our own class changes in an endless loop.
    if (root.classList.contains('scroll-motion') !== enabled) root.classList.toggle('scroll-motion',enabled);
    if (!enabled) {cancelAnimationFrame(frame);frame = 0;} else schedule();
  }
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
    new MutationObserver(schedule).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
  }
  sync();
})();
