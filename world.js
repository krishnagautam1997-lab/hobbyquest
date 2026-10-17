'use strict';

// One reusable world-page pattern. Data stays local; guides are prepared, not AI responses.
(() => {
  const STORIES_KEY = 'hobbyquest.stories.v1';
  const stories = [
    {id:'f1-senna-prost',section:'rivalries',art:2,tag:'RIVALRIES · 1988–1989',title:'When your teammate is your biggest rival.',description:'Senna, Prost, and the tension inside the same garage.',body:[
      'Ayrton Senna and Alain Prost were McLaren teammates in 1988 and 1989. Senna took the drivers’ title in 1988; Prost won it the following year. Their contest is a useful way into a very F1 kind of rivalry: competing for yourself while driving for the same team.',
      'Start with the shared garage rather than a hero-and-villain story. What do drivers share, and what are they trying to win from one another? Following the races and decisions in order is more revealing than starting with a verdict.'
    ],takeaway:'A team can be one organisation and two competing ambitions.',question:'How would being teammates change a rivalry?',source:'https://www.formula1.com/en/information/drivers-hall-of-fame-ayrton-senna.FLD7ZtO0nUn7JzLEn5rOJ',sourceTitle:'Formula 1 · Ayrton Senna’s career'},
    {id:'f1-undercut',section:'rivalries',art:3,tag:'RIVALRIES · STRATEGY',title:'An overtake that happens in the pit lane.',description:'The undercut turns a tyre change into a tactical move.',body:[
      'An undercut is an attempt to gain a position by stopping before a rival. The chasing driver pits first, then tries to use fresher tyres to set quicker laps while the rival stays out. When the other car eventually stops, the order may have changed.',
      'It is an attempt, not a guarantee. A compelling way to watch the contest is to follow the gap before and after the stops. The question becomes less “Who is ahead right now?” and more “Whose plan is working?”'
    ],takeaway:'Track position can change without a wheel-to-wheel pass.',question:'Would you pit first to attack, or wait to see what your rival does?',source:'https://www.formula1.com/en/latest/article/f1-glossary-u-z.5JSlDsnyvYmbK0TCjTs7KB',sourceTitle:'Formula 1 · Glossary: undercut'},
    {id:'f1-race-engineer',section:'people',art:4,tag:'PEOPLE · COMMUNICATION',title:'The person on the other end of the radio.',description:'A race engineer turns information into a conversation.',body:[
      'A race engineer is a key link between a driver and the people working on the car. Communication and composure matter: useful information has to reach a driver who is already concentrating on a demanding task.',
      'Try listening to a radio exchange for how something is said, not just the instruction. What does the driver need to know now? What can wait? It is an interesting connection between technical work and the very human skill of making a message clear.'
    ],takeaway:'Clear communication is part of performance, not an extra on top of it.',question:'What would make you trust the voice guiding you through a high-pressure moment?',source:'https://www.astonmartinf1.com/en-GB/news/feature/avatrade-explains-the-role-of-a-race-engineer',sourceTitle:'Aston Martin F1 Team · The race engineer’s role'},
    {id:'f1-team-sport',section:'people',art:5,tag:'PEOPLE · THE TEAM',title:'One driver in view. A whole team behind them.',description:'Look past the cockpit and a different sport comes into focus.',body:[
      'The driver is the person you see racing, but Formula 1 is a team sport. The work around a car brings together engineering, preparation, pit stops, and decisions made while a race is unfolding. Following one car means following more than one person.',
      'On your next watch, choose a role outside the cockpit. Notice a pit crew preparing, a radio message, or a strategy discussion. Which part of that work changes how you understand the driver’s result?'
    ],takeaway:'A result is a team story, even when one name is on the timing screen.',question:'Which role would you want to shadow for a race weekend?',source:'https://www.formula1.com/en/page/what-is-f1',sourceTitle:'Formula 1 · What is F1?'},
    {id:'f1-air-and-grip',section:'engineering',art:0,tag:'ENGINEERING · AERODYNAMICS',title:'Why a fast car wants to be pushed down.',description:'Downforce and drag make speed a balancing act.',body:[
      'Downforce is an aerodynamic force pushing a car toward the track. That can improve grip and help a driver carry speed through corners. Drag acts against the car’s forward movement, resisting its progress through the air.',
      'This makes “more” an incomplete answer. A setup that helps in corners may carry a cost on the straights. Look at the shape of a circuit and ask where a car needs its strengths. The interesting engineering often lives in that trade-off.'
    ],takeaway:'Fast around a lap is not always the same as fast in a straight line.',question:'Would you prioritise the corners or the straights on a circuit you know?',source:'https://www.formula1.com/en/latest/article/f1-glossary-a-e.1MFONigMlQSbSQtpP7YCy2.1MFONigMlQSbSQtpP7YCy2',sourceTitle:'Formula 1 · Glossary: downforce and drag'},
    {id:'f1-tyres',section:'engineering',art:1,tag:'ENGINEERING · TYRES',title:'Four small contact patches. A big story.',description:'Rubber is part of the strategy, not just the equipment.',body:[
      'Tyres are central to the way an F1 car performs. Different compounds offer different performance characteristics, and tyre condition matters as a stint develops. A tyre choice is connected to what a team wants the car to do and when it plans to stop.',
      'Instead of memorising every compound first, watch how a driver’s pace changes over several laps. Notice when tyre management becomes part of the conversation. Then ask how that changes the team’s next decision.'
    ],takeaway:'The car is racing on tyres whose story changes throughout a stint.',question:'When would you protect the tyres, and when would you use everything they have?',source:'https://www.formula1.com/en/latest/article/the-beginners-guide-to-f1-tyres.61SvF0Kfg29UR2SPhakDqd',sourceTitle:'Formula 1 · Beginner’s guide to tyres'},
    {id:'f1-silverstone-1950',section:'history',art:6,tag:'HISTORY · 13 MAY 1950',title:'A starting line at Silverstone.',description:'The first World Championship race is a doorway into another era.',body:[
      'The first Formula 1 World Championship race took place at Silverstone on 13 May 1950. Giuseppe “Nino” Farina won in an Alfa Romeo. That gives you a specific starting point rather than a whole history to memorise.',
      'Look at footage from that day and compare what you notice with a race today: the cars, the surroundings, and the people watching. What feels familiar, and what seems far away? One observation can become your next question.'
    ],takeaway:'Start with a dated moment, then follow what changed around it.',question:'What would you notice first if you could stand beside that 1950 starting line?',source:'https://corp.formula1.com/formula-1-marks-75th-anniversary-with-new-colourised-footage-of-first-grand-prix-at-silverstone/',sourceTitle:'Formula 1 · The first championship Grand Prix'},
    {id:'f1-changing-rules',section:'history',art:7,tag:'HISTORY ↔ ENGINEERING · 2026',title:'A new rulebook. A different design problem.',description:'Why an old explainer needs its date attached.',body:[
      'F1 engineering changes with the rules. The 2026 changes introduced active aerodynamics with movable front and rear wings, replacing the earlier DRS system. The same sport can therefore need a different explanation in a different season.',
      'When you find an older technical video, ask which year its car belongs to. Rather than treating an older design as wrong, compare the problem it was solving with the one a newer car faces. History becomes a way to understand engineering.'
    ],takeaway:'A technical explanation makes more sense when you know its era.',question:'Which change would you follow: aerodynamics, engines, tyres, or safety?',source:'https://corp.formula1.com/f1-2026-regulations-terminology-update/',sourceTitle:'Formula 1 · 2026 regulation terminology'}
  ];
  let savedStories = loadStories();
  let activeStory = null;
  let inWorld = false;
  let notesDirty = false;
  let returnY = 0;
  let returnView = 'discover';
  let returnFocus = null;
  const getF1 = () => getTopic('Formula 1','f1');

  function loadStories() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORIES_KEY) || '[]');
      return Array.isArray(raw) ? [...new Set(raw.filter(id => stories.some(story => story.id === id)))] : [];
    } catch { return []; }
  }

  function storyCard(story) {
    const card = document.createElement('article');
    card.className = 'story-card';
    const open = document.createElement('button');
    open.type = 'button';open.className = 'story-open';open.setAttribute('aria-label',`Read story: ${story.title}`);
    open.innerHTML = '<div class="story-art" aria-hidden="true"></div><div class="story-copy"><span class="card-category"></span><h3></h3><p></p><span class="story-read">QUICK READ ↗</span></div>';
    open.querySelector('.story-art').classList.add(`f1-art-${story.art}`);
    open.querySelector('.card-category').textContent = story.tag;
    open.querySelector('h3').textContent = story.title;
    open.querySelector('p').textContent = story.description;
    open.addEventListener('click',() => openStory(story));
    const save = document.createElement('button');save.type = 'button';save.className = 'save-button';save.dataset.saveStory = story.id;
    save.addEventListener('click',() => toggleStory(story));
    card.append(open,save);return card;
  }

  function updateStoryButtons() {
    document.querySelectorAll('[data-save-story]').forEach(button => {
      const story = stories.find(item => item.id === button.dataset.saveStory);
      if (!story) return;
      const selected = savedStories.includes(story.id);
      button.textContent = selected ? '✓ Story saved · Unsave' : '+ Save story';
      button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',`${selected ? 'Unsave' : 'Save'} story: ${story.title}`);
    });
    if (activeStory) {
      const selected = savedStories.includes(activeStory.id);
      $('#save-active-story').textContent = selected ? '✓ Story saved · Unsave' : '+ Save story';
      $('#save-active-story').setAttribute('aria-pressed',String(selected));
    }
  }

  function refreshSaved() {
    const selected = stories.filter(story => savedStories.includes(story.id));
    $('#atlas-story-grid').replaceChildren(...selected.map(storyCard));
    $('#f1-saved-grid').replaceChildren(...selected.map(storyCard));
    $('#atlas-story-grid').hidden = selected.length === 0;
    $('#f1-saved-grid').hidden = selected.length === 0;
    $('#atlas-stories-empty').hidden = selected.length > 0;
    $('#f1-saved-empty').hidden = selected.length > 0;
    $('#empty-atlas').hidden = atlas.length > 0 || selected.length > 0;
    $('#f1-saved-count').textContent = selected.length;
    const count = selected.length;
    const hasNotes = Boolean(atlas.find(item => item.id === getF1().id)?.notes);
    $('#f1-collection-summary').textContent = `${count} ${count === 1 ? 'story' : 'stories'} saved · ${hasNotes ? 'Your F1 notes are saved too.' : 'Add your own notes below.'}`;
    updateStoryButtons();updateWorldSave();
    if (typeof refreshCarouselControls === 'function') refreshCarouselControls();
  }

  function toggleStory(story) {
    const selected = savedStories.includes(story.id);
    savedStories = selected ? savedStories.filter(id => id !== story.id) : [...savedStories,story.id];
    let persisted = true;
    try { localStorage.setItem(STORIES_KEY,JSON.stringify(savedStories)); } catch { persisted = false; }
    const message = persisted ? selected ? 'Story removed from your collection. Your notes are unchanged.' : 'Story saved in your atlas on this browser.' : 'Browser storage is unavailable. This story change is for this session only.';
    refreshSaved();$('#story-status').textContent = message;showToast(message);
  }

  function openStory(story) {
    activeStory = story;
    $('#story-title').textContent = story.title;$('#story-category').textContent = story.tag;
    $('#story-cover').className = `story-cover f1-art-${story.art}`;
    $('#story-body').replaceChildren(...story.body.map(text => {const p = document.createElement('p');p.textContent = text;return p;}));
    $('#story-takeaway').textContent = story.takeaway;
    $('#story-source').href = story.source;$('#story-source').textContent = `${story.sourceTitle} ↗`;
    $('#story-status').textContent = '';
    updateStoryButtons();$('#story-dialog').showModal();
  }

  function updateWorldSave() {
    const saved = atlas.some(item => item.id === getF1().id);
    $('#save-world').textContent = saved ? '✓ World saved · Unsave' : '+ Save this world';
    $('#save-world').setAttribute('aria-pressed',String(saved));
  }

  function jump(id) {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});
    if (id === 'f1-notes-section') $('#f1-notes').focus({preventScroll:true});
  }

  function showWorld({notes = false, focus = true} = {}) {
    const wasInWorld = inWorld;
    inWorld = true;
    setView('world',false);
    if (!notesDirty) $('#f1-notes').value = atlas.find(item => item.id === getF1().id)?.notes || '';
    recordVisit(getF1().id);refreshSaved();
    if (notes) jump('f1-notes-section');
    else if (!wasInWorld) {
      window.scrollTo({top:0,behavior:'auto'});
      if (focus) $('#f1-title').focus({preventScroll:true});
    }
  }

  function open(options = {}) {
    if (!inWorld) {
      returnY = window.scrollY || 0;
      returnView = $('#atlas-view').hidden ? 'discover' : 'atlas';
      returnFocus = document.activeElement;
    }
    if (window.location.hash !== '#world/f1') window.history.pushState(null,'','#world/f1');
    showWorld(options);
  }

  function navigateView(view) {
    if (view === 'world') return;
    inWorld = false;
    const hash = view === 'atlas' ? '#atlas' : '#home';
    if (window.location.hash !== hash) window.history.pushState(null,'',hash);
    window.scrollTo({top:0,behavior:'auto'});
  }

  function route() {
    if (window.location.hash === '#world/f1') {showWorld({focus:false});return;}
    const wasInWorld = inWorld;
    inWorld = false;
    const view = window.location.hash === '#atlas' ? 'atlas' : 'discover';
    setView(view,false);
    if (wasInWorld && (window.location.hash === '#home' || window.location.hash === '#atlas' || !window.location.hash)) window.scrollTo({top:returnY,behavior:'auto'});
  }

  $('#world-back').addEventListener('click',() => {
    setView(returnView);window.scrollTo({top:returnY,behavior:'auto'});
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  document.querySelectorAll('.world-jump').forEach(button => button.addEventListener('click',() => jump(button.dataset.section)));
  $('#close-story').addEventListener('click',() => $('#story-dialog').close());
  $('#story-dialog').addEventListener('click',event => {
    if (event.target !== $('#story-dialog')) return;
    const rect = $('#story-dialog').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#story-dialog').close();
  });
  $('#save-active-story').addEventListener('click',() => {if (activeStory) toggleStory(activeStory);});
  $('#story-to-notes').addEventListener('click',() => {
    if (!activeStory) return;
    const question = `${activeStory.title}\n${activeStory.question}`;
    const notes = $('#f1-notes');
    const existing = notesDirty ? notes.value : atlas.find(item => item.id === getF1().id)?.notes || '';
    if (existing.length + question.length + 2 > 10000) {$('#story-status').textContent = 'Your F1 notes are full. Save or edit them before adding another question.';return;}
    $('#story-dialog').close();
    if (!inWorld) open({notes:true,focus:false});
    notes.value = [notes.value.trimEnd(),question].filter(Boolean).join('\n\n');
    notesDirty = true;$('#f1-note-status').textContent = 'Question added to your draft. Save F1 notes to keep it after a refresh.';
    if (window.location.hash !== '#world/f1') window.history.pushState(null,'','#world/f1');
    jump('f1-notes-section');
  });
  $('#f1-notes').addEventListener('input',() => {notesDirty = true;$('#f1-note-status').textContent = 'Unsaved changes. Save F1 notes before refreshing.';});
  $('#save-f1-notes').addEventListener('click',() => {
    const topic = getF1();let item = atlas.find(item => item.id === topic.id);
    if (!item) {item = {id:topic.id,title:topic.title,notes:''};atlas.push(item);}
    item.notes = $('#f1-notes').value.slice(0,10000);
    const persisted = persistAtlas();notesDirty = !persisted;
    renderAtlas();
    $('#f1-note-status').textContent = persisted ? 'F1 notes saved in this browser. Your other interests’ notes are unchanged.' : 'Browser storage is unavailable. These notes are only in this session; do not refresh before copying them.';
  });
  $('#save-world').addEventListener('click',() => {
    const topic = getF1();const index = atlas.findIndex(item => item.id === topic.id);
    if (index >= 0 && atlas[index].notes) {showToast('This world has notes. Clear and save its notes first if you want to remove it.');return;}
    if (index >= 0) atlas.splice(index,1);else atlas.push({id:topic.id,title:topic.title,notes:''});
    const persisted = persistAtlas();renderAtlas();
    if (persisted) showToast(index >= 0 ? 'World removed from your atlas. Saved stories are unchanged.' : 'F1 world saved in your atlas on this browser.');
  });
  window.addEventListener('beforeunload',event => {if (notesDirty) {event.preventDefault();event.returnValue = '';}});
  window.addEventListener('popstate',route);window.addEventListener('hashchange',route);
  for (const section of ['rivalries','people','engineering','history']) $('#f1-'+section+'-grid').replaceChildren(...stories.filter(story => story.section === section).map(storyCard));
  window.HobbyQuestWorld = {open,navigateView,refreshSaved};
  refreshSaved();route();
})();
