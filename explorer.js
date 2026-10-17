'use strict';
(() => {
  // A transparent guest experience limit, NOT server-side abuse protection.
  // Never read or transmit notes or conversation content from this module.
  const KEY = 'hobbyquest.sparks.v1';
  const LIMIT = 10;
  const BADGES_KEY = 'hobbyquest.passport.v1';
  const BADGE_NAMES = ['First World','World Hopper','Collector'];
  const el = id => document.getElementById(id);
  const day = () => new Date().toISOString().slice(0,10);
  let state = {day:day(),used:0};
  let sessionOnly = false;
  let earned = [];
  let badgeSavingFailed = false;
  try {const saved=JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');if(Array.isArray(saved)) earned=BADGE_NAMES.filter(name=>saved.includes(name));} catch { /* Keep session progress when storage cannot be read. */ }
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.day === day() && Number.isInteger(data.used) && data.used >= 0 && data.used <= LIMIT) state = {day:data.day,used:sessionOnly && state.day===data.day ? Math.max(state.used,data.used) : data.used};
        else if (!sessionOnly) state = {day:day(),used:0};
      } else if (!sessionOnly) state = {day:day(),used:0};
    } catch { sessionOnly = true; }
    if (state.day !== day()) state = {day:day(),used:0};
    return LIMIT - state.used;
  }
  function renderSparks() {
    const remaining = read();
    el('sparks-home-count').textContent = `${remaining} / ${LIMIT}`;
    el('sparks-chat-count').textContent = `${remaining} / ${LIMIT} Sparks`;
    el('sparks-meter').value = remaining;
    el('sparks-exhausted').hidden = remaining > 0;
    const reset = 'Resets at 00:00 UTC (4 a.m. Dubai).';
    el('sparks-home-note').textContent = `${reset} ${sessionOnly ? 'Saving unavailable: allowance is session-only.' : 'Guest allowance stays in this browser.'}`;
    el('sparks-chat-note').textContent = `${sessionOnly ? 'Session-only allowance' : 'Daily allowance on this browser'} · One received reply = one Spark · ${reset} Shared free capacity may run out sooner.`;
  }
  function useSpark() {
    read();
    state.used = Math.min(LIMIT,state.used + 1);
    try { localStorage.setItem(KEY,JSON.stringify(state)); sessionOnly = false; }
    catch { sessionOnly = true; }
    renderSparks();
  }
  function refresh({visited,discoveries}) {
    const stamps = visited.slice(-8).reverse().map(world => {
      const stamp = document.createElement('span');
      stamp.className = 'passport-stamp';
      stamp.textContent = world.title;
      return stamp;
    });
    el('passport-stamps').replaceChildren(...stamps);
    el('passport-empty').hidden = visited.length > 0;
    const badges = [
      {name:'First World',symbol:'◎',count:visited.length,goal:1,unit:'world opened'},
      {name:'World Hopper',symbol:'↗',count:visited.length,goal:3,unit:'different worlds opened'},
      {name:'Collector',symbol:'✦',count:discoveries,goal:3,unit:'discoveries collected'}
    ];
    el('passport-badges').replaceChildren(...badges.map(badge => {
      if (badge.count >= badge.goal && !earned.includes(badge.name)) {
        earned.push(badge.name);
        try {localStorage.setItem(BADGES_KEY,JSON.stringify(earned));badgeSavingFailed=false;} catch {badgeSavingFailed=true;}
      }
      const unlocked = earned.includes(badge.name);
      const card = document.createElement('article');card.className = `passport-badge${unlocked ? ' unlocked' : ''}`;
      const symbol = document.createElement('span');symbol.className='badge-symbol';symbol.textContent=badge.symbol;symbol.setAttribute('aria-hidden','true');
      const name = document.createElement('h4');name.textContent=badge.name;
      const status = document.createElement('p');status.textContent=`${unlocked ? 'Unlocked' : `${Math.min(badge.count,badge.goal)} / ${badge.goal}`} · ${badge.goal} ${badge.unit}`;
      card.append(symbol,name,status);return card;
    }));
    if (badgeSavingFailed) el('passport-storage').textContent = 'Browser saving is unavailable. New badges last for this session only. Existing notes are unchanged.';
  }
  window.HobbyQuestExplorer = {refresh,sparks:{available:() => {renderSparks();return read() > 0;},use:useSpark,refresh:renderSparks}};
  window.addEventListener('storage',event => {if(event.key === KEY || event.key === null) renderSparks();});
  window.addEventListener('focus',renderSparks);
  document.addEventListener('visibilitychange',() => {if(!document.hidden) renderSparks();});
  // Keep a long-open tab accurate across midnight without any network requests.
  setInterval(renderSparks,60000);
  el('passport-ask').addEventListener('click',() => el('open-guide').click());
  renderSparks();
})();
