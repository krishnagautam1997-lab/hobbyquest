'use strict';
(() => {
  // Derive the game layer from actual local actions. No points for AI use,
  // no new data storage, no network calls, and no note content in this module.
  const el = id => document.getElementById(id);
  let lastMarkers = null;
  function jump(id) {window.HobbyQuestWorld.navigateSection(id);}
  function refresh({visited,discoveries,hasNotes}) {
    el('hud-rank').textContent = discoveries >= 3 ? 'Discovery Collector' : visited.length >= 3 ? 'World Hopper' : visited.length ? 'Explorer' : 'New Explorer';
    el('hud-worlds').textContent = visited.length;
    el('hud-collection').textContent = discoveries;
    const completed = [visited.length > 0,discoveries > 0,hasNotes];
    const count = completed.filter(Boolean).length;
    el('quest-tally').textContent = `${count} / 3 trail markers`;
    el('quest-world-state').textContent = completed[0] ? '✓ World opened · Explore another' : 'Awaiting your first world';
    el('quest-collect-state').textContent = completed[1] ? '✓ Discovery kept · Find another' : 'Find your first discovery';
    el('quest-note-state').textContent = hasNotes ? '✓ Field note saved · Keep writing' : 'Your own words belong here';
    document.querySelectorAll('[data-quest]').forEach((button,index) => button.classList.toggle('complete',completed[index]));
    document.querySelectorAll('.interest-card[data-world-id]').forEach(card => {
      const opened = visited.includes(card.dataset.worldId);
      card.classList.toggle('on-trail',opened);
      card.querySelector('.world-card-status').textContent = opened ? '✓ ON YOUR TRAIL' : '◇ UNEXPLORED';
    });
    if(lastMarkers !== null && count > lastMarkers) el('quest-feedback').textContent = `Trail marker added. ${count} of 3 exploration markers are on your trail.`;
    lastMarkers = count;
  }
  document.querySelectorAll('[data-passport]').forEach(button=>button.addEventListener('click',()=>jump('explorer-passport')));
  el('open-quests').addEventListener('click',()=>jump('quest-board'));
  el('hud-ai').addEventListener('click',()=>el('open-guide').click());
  document.querySelectorAll('[data-quest]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.quest === 'world') {setView('discover');el('topic-input').focus();return;}
    if(button.dataset.quest === 'collect') {jump('discoveries');return;}
    // A prepared F1 world is always available. Opening notes never spends AI.
    openTopic(getTopic('Formula 1','f1'),'notes');
  }));
  window.HobbyQuestGame = {refresh};
  renderProgress();
})();
