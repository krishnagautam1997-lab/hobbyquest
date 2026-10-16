'use strict';

// No API calls, keys, tracking, or external dependencies in this Day 1 preview.
const STORAGE_KEY = 'hobbyquest.atlas.v1';
const TOPICS = [
  {id:'astronomy',title:'Astronomy',category:'Beyond our world',description:'Big questions. A very, very big universe.',intro:'Look up. There’s an entire universe of questions waiting for you.',symbol:'☉',caption:'A LITTLE COSMIC PERSPECTIVE',heading:'Looking into the past.',body:'Light takes time to travel. The light from the Sun takes about eight minutes to reach Earth, while light from distant stars can take years. Looking at the night sky means seeing different moments in the past, all at once.',question:'If you could see one thing in space up close, what would you choose?',paths:['Start with our solar system: planets, moons, and the Sun.','Find out why stars have different colors.','Try spotting the Moon at the same time over several evenings.']},
  {id:'photography',title:'Street photography',category:'An eye for the everyday',description:'Ordinary moments. Extraordinary stories.',intro:'Notice the stories hiding in a familiar street, a shadow, or a fleeting moment.',symbol:'▧',caption:'THE BEAUTY IN BETWEEN',heading:'The scene is already there.',body:'Street photography is about paying attention to everyday life. Light, geometry, gestures, and timing can turn an ordinary place into an interesting frame. A phone is enough to begin noticing these elements.',question:'What makes a photograph feel like it tells a story?',paths:['Photograph the same corner in three different kinds of light.','Look for repeating shapes, reflections, and shadows.','Consider consent, privacy, and local rules before photographing people.']},
  {id:'philosophy',title:'Philosophy',category:'A different way to think',description:'Good questions have a way of staying.',intro:'Make room for questions about knowledge, meaning, and how we choose to live.',symbol:'◌',caption:'STAY WITH THE QUESTION',heading:'What makes a good question?',body:'Philosophy often begins by examining an assumption we usually take for granted. What counts as knowledge? What makes an action right? People can disagree about the answers while still learning from the reasons behind them.',question:'Can you think of a belief you changed after hearing someone else’s perspective?',paths:['Explore ethics: how should we act?','Explore epistemology: what can we know?','Write down one assumption and a thoughtful objection to it.']},
  {id:'architecture',title:'Architecture',category:'Places that shape us',description:'See familiar places with fresh eyes.',intro:'Every space makes choices about light, movement, materials, and the people who use it.',symbol:'▥',caption:'READ THE SPACE AROUND YOU',heading:'Buildings change how we feel.',body:'Architecture shapes everyday experiences: where we walk, what we notice, and how a space feels. Daylight, scale, materials, and the arrangement of rooms all contribute. You can begin exploring by looking carefully at a place you already know.',question:'What is one place that makes you feel calm, and what about its design helps?',paths:['Notice where daylight enters your favorite room.','Compare two buildings’ entrances and how easy they are to navigate.','Sketch a familiar space and mark where people naturally gather.']}
];

const $ = (selector) => document.querySelector(selector);
let storageAvailable = true;
let atlas = loadAtlas();
let activeTopic = null;
let toastTimer;

function loadAtlas() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    const unique = new Set();
    return stored.filter(item => {
      if (!item || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 100 || typeof item.id !== 'string' || unique.has(item.id)) return false;
      unique.add(item.id);
      return true;
    }).map(item => ({id:item.id,title:item.title,notes:typeof item.notes === 'string' ? item.notes.slice(0,10000) : ''}));
  } catch {
    storageAvailable = false;
    return [];
  }
}

function persistAtlas() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atlas));
    storageAvailable = true;
    return true;
  } catch {
    storageAvailable = false;
    showToast('Browser storage is unavailable. Changes will last only until this page closes.');
    return false;
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}

function getTopic(title, id) {
  const normalized = title.trim().toLocaleLowerCase();
  const known = TOPICS.find(topic => topic.id === id || topic.title.toLocaleLowerCase() === normalized);
  if (known) return known;
  return {id:id || `topic:${normalized}`,title:title.trim(),category:'A curiosity of your own',description:'A new thread in your personal atlas.',intro:'Every question is a place to start. Make this interest your own.',symbol:'✳',caption:'FOLLOW YOUR OWN THREAD',custom:true,heading:'Your curiosity has a place here.',body:'You can save this topic and keep your own questions and notes here. Live AI explanations aren’t connected in this preview, so we haven’t generated an answer about this topic.',question:`What first made you curious about ${title.trim()}?`,paths:['Write down what you already know or think you know.','Capture one question you would like to explore.','Add a source or an observation to your notes as you learn.']};
}

function createCard(topic, saved = false) {
  const card = document.createElement('article');
  card.className = 'interest-card';
  const button = document.createElement('button');
  button.className = 'card-open';
  button.type = 'button';
  button.setAttribute('aria-label', `Explore ${topic.title}`);
  // Only fixed markup enters innerHTML. User-provided topic titles always use textContent.
  button.innerHTML = '<div class="card-art"><span class="card-art-symbol" aria-hidden="true"></span><span class="card-art-caption"></span></div><div class="card-content"><span class="card-category"></span><h3></h3><p></p><div class="card-bottom"><span></span><span aria-hidden="true">↗</span></div></div>';
  button.querySelector('.card-art').classList.add(`art-${topic.custom ? 'custom' : topic.id}`);
  button.querySelector('.card-art-symbol').textContent = topic.symbol;
  button.querySelector('.card-art-caption').textContent = topic.caption;
  button.querySelector('.card-category').textContent = topic.category;
  button.querySelector('h3').textContent = topic.title;
  button.querySelector('.card-content p').textContent = topic.description;
  button.querySelector('.card-bottom span').textContent = saved ? 'Continue exploring' : 'Follow this curiosity';
  button.addEventListener('click', () => openTopic(topic));
  card.append(button);
  return card;
}

function renderAtlas() {
  $('#saved-count').textContent = atlas.length;
  $('#atlas-grid').replaceChildren(...atlas.map(item => createCard(getTopic(item.title,item.id),true)));
  $('#empty-atlas').hidden = atlas.length > 0;
}

function setView(view) {
  $('#discover-view').hidden = view !== 'discover';
  $('#atlas-view').hidden = view !== 'atlas';
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
}

function selectTab(id, focus = false) {
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    const selected = tab.id === id;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  });
}

function updateSaveButton() {
  const saved = atlas.some(item => item.id === activeTopic.id);
  $('#save-interest').textContent = saved ? '✓ Saved to my atlas · Unsave' : '+ Save to my atlas';
  $('#save-interest').setAttribute('aria-pressed',String(saved));
}

function openTopic(topic) {
  activeTopic = topic;
  $('#dialog-title').textContent = topic.title;
  $('#dialog-category').textContent = topic.category;
  $('#dialog-intro').textContent = topic.intro;
  $('#ready-label').textContent = topic.custom ? 'YOUR OWN TOPIC · AI COMES LATER' : 'EXAMPLE CONTENT · AI COMES LATER';
  $('#deeper-label').textContent = topic.custom ? 'A STARTING FRAMEWORK · NO AI GENERATED CONTENT' : 'EXAMPLE EXPLORATION PATH';
  $('#ready-heading').textContent = topic.heading;
  $('#ready-body').textContent = topic.body;
  $('#ready-question').textContent = topic.question;
  $('#interest-notes').value = atlas.find(item => item.id === topic.id)?.notes || '';
  $('#deeper-list').replaceChildren(...topic.paths.map(path => {
    const item = document.createElement('li');
    item.textContent = path;
    return item;
  }));
  updateSaveButton();
  selectTab('ready-tab');
  $('#topic-dialog').showModal();
}

$('#interest-grid').replaceChildren(...TOPICS.map(topic => createCard(topic)));
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$('.brand').addEventListener('click', event => { event.preventDefault(); setView('discover'); });
$('#discover-again').addEventListener('click', () => { setView('discover'); $('#topic-input').focus(); });
$('#topic-form').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('#topic-input').value.trim();
  if (!title) { $('#topic-input').setCustomValidity('Enter something you are curious about.'); $('#topic-input').reportValidity(); return; }
  openTopic(getTopic(title));
});
$('#topic-input').addEventListener('input', () => $('#topic-input').setCustomValidity(''));
$('#surprise-button').addEventListener('click', () => openTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]));
$('#close-dialog').addEventListener('click', () => $('#topic-dialog').close());
$('#topic-dialog').addEventListener('click', event => {
  if (event.target !== $('#topic-dialog')) return;
  const rect = $('#topic-dialog').getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#topic-dialog').close();
});
document.querySelectorAll('[role="tab"]').forEach(tab => {
  tab.addEventListener('click', () => selectTab(tab.id));
  tab.addEventListener('keydown', event => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const index = tabs.indexOf(tab);
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); selectTab(target.id,true); }
  });
});
$('#save-interest').addEventListener('click', () => {
  const index = atlas.findIndex(item => item.id === activeTopic.id);
  if (index >= 0) {
    // Keep notes when removing an interest, so a single click cannot destroy them.
    if (atlas[index].notes) {
      showToast('This interest has notes. Clear and save its notes first if you want to remove it.');
      return;
    }
    atlas.splice(index,1);
  } else atlas.push({id:activeTopic.id,title:activeTopic.title,notes:''});
  const persisted = persistAtlas();
  renderAtlas();
  updateSaveButton();
  if (persisted) showToast(index >= 0 ? 'Interest removed from your atlas.' : 'Saved to your atlas on this browser.');
});
$('#save-notes').addEventListener('click', () => {
  let item = atlas.find(item => item.id === activeTopic.id);
  if (!item) { item = {id:activeTopic.id,title:activeTopic.title,notes:''}; atlas.push(item); }
  item.notes = $('#interest-notes').value;
  const persisted = persistAtlas();
  renderAtlas();
  updateSaveButton();
  if (persisted) showToast('Notes saved for this interest on this browser.');
});
renderAtlas();
setView('discover');
if (!storageAvailable) showToast('Browser storage is unavailable. Your atlas will last only for this session.');
