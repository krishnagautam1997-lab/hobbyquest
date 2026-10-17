'use strict';

// Guest atlas and prepared guides. Explicit live AI requests live in chat.js.
const STORAGE_KEY = 'hobbyquest.atlas.v1';
const PROGRESS_KEY = 'hobbyquest.progress.v1';
const TOPICS = [
  {id:'astronomy',title:'Astronomy',category:'Beyond our world',description:'Big questions. A very, very big universe.',intro:'Look up. There’s an entire universe of questions waiting for you.',symbol:'☉',caption:'A LITTLE COSMIC PERSPECTIVE',heading:'Looking into the past.',body:'Light takes time to travel. The light from the Sun takes about eight minutes to reach Earth, while light from distant stars can take years. Looking at the night sky means seeing different moments in the past, all at once.',question:'If you could see one thing in space up close, what would you choose?',paths:['Start with our solar system: planets, moons, and the Sun.','Find out why stars have different colors.','Try spotting the Moon at the same time over several evenings.']},
  {id:'photography',title:'Street photography',category:'An eye for the everyday',description:'Ordinary moments. Extraordinary stories.',intro:'Notice the stories hiding in a familiar street, a shadow, or a fleeting moment.',symbol:'▧',caption:'THE BEAUTY IN BETWEEN',heading:'The scene is already there.',body:'Street photography is about paying attention to everyday life. Light, geometry, gestures, and timing can turn an ordinary place into an interesting frame. A phone is enough to begin noticing these elements.',question:'What makes a photograph feel like it tells a story?',paths:['Photograph the same corner in three different kinds of light.','Look for repeating shapes, reflections, and shadows.','Consider consent, privacy, and local rules before photographing people.']},
  {id:'philosophy',title:'Philosophy',category:'A different way to think',description:'Good questions have a way of staying.',intro:'Make room for questions about knowledge, meaning, and how we choose to live.',symbol:'◌',caption:'STAY WITH THE QUESTION',heading:'What makes a good question?',body:'Philosophy often begins by examining an assumption we usually take for granted. What counts as knowledge? What makes an action right? People can disagree about the answers while still learning from the reasons behind them.',question:'Can you think of a belief you changed after hearing someone else’s perspective?',paths:['Explore ethics: how should we act?','Explore epistemology: what can we know?','Write down one assumption and a thoughtful objection to it.']},
  {id:'architecture',title:'Architecture',category:'Places that shape us',description:'See familiar places with fresh eyes.',intro:'Every space makes choices about light, movement, materials, and the people who use it.',symbol:'▥',caption:'READ THE SPACE AROUND YOU',heading:'Buildings change how we feel.',body:'Architecture shapes everyday experiences: where we walk, what we notice, and how a space feels. Daylight, scale, materials, and the arrangement of rooms all contribute. You can begin exploring by looking carefully at a place you already know.',question:'What is one place that makes you feel calm, and what about its design helps?',paths:['Notice where daylight enters your favorite room.','Compare two buildings’ entrances and how easy they are to navigate.','Sketch a familiar space and mark where people naturally gather.']}
];

Object.assign(TOPICS[0],{art:'space',sheet:'worlds',aliases:['space']});
Object.assign(TOPICS[1],{art:'photography',sheet:'worlds',aliases:['photography']});
Object.assign(TOPICS[2],{art:'art',sheet:'rabbit'});
Object.assign(TOPICS[3],{art:'japan',sheet:'worlds'});
function makeTopic(id,title,category,description,heading,body,question,paths,art=id,sheet='worlds',aliases=[]) {
  return {id,title,category,description,intro:description,heading,body,question,paths,art,sheet,aliases};
}
TOPICS.push(
  makeTopic('f1','Formula 1','Speed. People. Obsession.','Rivalries, engineering, and life beyond the track.','Grip from the air.','An F1 car uses its shape to produce downforce: an aerodynamic force that presses the car toward the track. More grip helps in corners, but the setup also has to balance drag on the straights. The interesting story is the trade-off.','Would you rather design the fastest car or make the right call from the pit wall?',['Follow a rivalry through the choices each driver makes.','Explore downforce, tyres, and pit strategy.','Connect racing to materials, watches, and aerodynamics.'],'f1','worlds',['f1','formula one']),
  makeTopic('watches','Watches','Time, craft, and culture','Tiny machines. Surprisingly big stories.','A tiny mechanical world.','A mechanical watch stores energy in a wound spring and releases it through a regulated mechanism. Design, craftsmanship, and culture all shape why people find watches interesting. A price tag alone does not tell the whole story.','What draws you to a watch: the design, the mechanism, or the story?',['Look closely at a mechanical movement.','Compare a tool watch with a dress watch.','Explore the relationship between timing and motorsport.'],'watches','worlds',['watch culture']),
  makeTopic('streetwear','Streetwear','Style. Stories. Subcultures.','What we wear says more than we think.','Clothes carry context.','Streetwear draws on scenes such as skateboarding, music, sport, and independent design. The same garment can mean something different in another community. Its history is often as interesting as its silhouette.','What piece of clothing feels most like you?',['Follow one silhouette through different scenes.','Explore how music and sport shape style.','Look at materials and construction, not only a label.']),
  makeTopic('japan','Japan','Culture. People. The unexpected.','Follow a detail into a completely different story.','Start with one detail.','A place becomes more interesting when you move beyond a single image of it. Architecture, regional food, design, language, and everyday routines offer different entry points into Japan. Choose a question instead of trying to absorb a whole country at once.','Would you begin with food, cities, design, or language?',['Explore a particular city or region.','Follow one everyday object into its design history.','Compare how local traditions change over time.']),
  makeTopic('truecrime','True Crime','Real stories. Careful questions.','Evidence, storytelling, and the people behind a case.','Evidence before theory.','A compelling narrative is not the same as a well-supported claim. When exploring a case, distinguish established facts from allegations and speculation. Remember that real people and their families are part of the story.','What makes a crime story responsible rather than just gripping?',['Check how a claim is supported.','Notice the difference between a record and a retelling.','Explore the ethics of telling real people’s stories.']),
  makeTopic('football','Football','The beautiful game','The tactics. The stories. The culture.','Watch the space without the ball.','Football becomes a different game when you notice movement away from the ball. A run can pull a defender out of position or create an option for someone else. Tactics are a conversation between space, timing, and decisions.','What do you enjoy more: a clever team move or a moment of individual brilliance?',['Explore pressing and why teams use it.','Follow the history of a club or rivalry.','Notice how one player changes the shape of a team.']),
  makeTopic('aviation','Aviation','Engineering with altitude','The ideas that make flight possible.','A whole system in the sky.','Flight brings together aerodynamics, structures, propulsion, navigation, and people. One simple question about a wing or an engine can open several connected subjects.','What would you explore first: the wing, the engine, or the cockpit?',['Explore the shape of a wing.','Follow the path of air through a jet engine.','Connect aircraft design to materials.'],'aviation','rabbit'),
  makeTopic('cinema','Cinema','Stories in motion','Frames, sound, and the art of feeling something.','A scene is made of choices.','Framing, editing, sound, light, and performance work together to shape a scene. Watching how those choices interact can make a familiar film feel new.','Which scene stayed with you, and what made it work?',['Watch a scene with attention to sound.','Notice what a cut leaves out.','Explore a director’s visual choices.'],'cinema','rabbit',['film']),
  makeTopic('food','Food','A very good rabbit hole','Flavour, ritual, and the stories on a plate.','One dish, many connections.','A dish can connect geography, technique, ingredients, migration, and memory. Pick something you love eating and follow one of those threads.','What food instantly reminds you of a place or person?',['Follow one ingredient through different dishes.','Explore the technique behind a favourite meal.','Connect food to local history.'],'food','rabbit'),
  makeTopic('chess','Chess','Small board. Big possibilities.','Patterns, decisions, and beautiful ideas.','Look for a plan.','A chess position is more than the next move. Piece activity, king safety, and the shape of the pawns can suggest a plan. Understanding why a move fits that plan can be more satisfying than memorising it.','Do you prefer careful plans or surprising tactical ideas?',['Explore how pieces work together.','Follow one instructive game.','Look for a pattern you recognise.'],'chess','rabbit'),
  makeTopic('art','Art','Look a little longer','Ideas, materials, and new ways of seeing.','Your first reaction is a starting point.','An artwork can invite questions about materials, form, context, and the person looking at it. You do not need the perfect interpretation to begin noticing.','What catches your eye before you read the label?',['Look closely at one material.','Explore the context around a work.','Compare two very different interpretations.'],'art','rabbit'),
  makeTopic('skincare','Skincare','Formulation meets everyday culture','Ingredients, packaging, and personal routines.','A world behind a familiar product.','Skincare connects formulation, packaging, marketing, and daily habits. Product claims are a useful place to practise asking what evidence supports a message. This example is for topic exploration, not personal medical advice.','Are you more curious about formulation, design, or the culture around a routine?',['Explore how a product label is structured.','Look at the design of a familiar bottle.','Compare a marketing claim with its supporting evidence.'],'skincare','rabbit'),
  makeTopic('economics','Economics','Choices, incentives, and trade-offs','The systems behind everyday decisions.','Start with a trade-off.','Economics often starts with choices under constraints. Incentives, scarcity, and opportunity costs can help explain everyday behaviour, while real outcomes still depend on context.','What everyday choice made you think about value differently?',['Explore opportunity cost in an everyday decision.','Look at the incentives in a familiar system.','Compare a simple model with real-world context.'],'economics','rabbit'),
  makeTopic('gaming','Gaming','Play. Design. Community.','What makes a world worth coming back to?','Good play is built from decisions.','Games combine rules, feedback, challenge, and expression. A small design choice can change what a player notices or feels. You can explore those ideas without needing to make a game yourself.','What makes a game stay with you after you stop playing?',['Notice how a game teaches a mechanic.','Explore the relationship between sound and feedback.','Follow the culture around a favourite genre.'],'gaming','rabbit')
);
const SPOTLIGHT = ['f1','watches','streetwear','astronomy','japan','truecrime','football','photography'];
TOPICS.push(
  makeTopic('sneakers','Sneakers','Design. Drops. Everyday icons.','A whole culture, from the sole up.','Start with the details.','A sneaker can be a design object, a sports tool, or a piece of personal history. Shape, materials, colour, and the communities around a shoe all offer different threads to follow. You do not need a rare pair to have an interesting opinion.','What makes a sneaker memorable to you: its shape, its story, or how you wear it?',['Compare the silhouettes of two pairs you like.','Follow a shoe from its sporting roots into everyday style.','Notice materials, stitching, and the shape of the sole.'],'sneakers','culture',['sneaker','trainers']),
  makeTopic('kpop','K-pop','Sound. Performance. Fandom.','Follow the music beyond the chorus.','A song is only one way in.','You can explore K-pop through music, choreography, visual concepts, production, or fan communities. Pick one performance and notice how those choices work together. There is room for curiosity without needing to know every group or release.','What catches you first: the song, the choreography, or the visual concept?',['Compare a music video with a live performance of the same song.','Listen for an instrument or sound you had not noticed before.','Explore how styling and choreography support a concept.'],'kpop','culture',['kpop','k pop','korean pop']),
  makeTopic('anime','Anime','Frames. Feeling. Entire worlds.','One scene can open a whole universe.','Look beyond the plot.','Animation invites curiosity about drawing, motion, sound, storytelling, and the worlds creators imagine. Start with a scene you remember and ask what made it land. You can follow the craft, a genre, or the community around a favourite work.','Which animated world would you want to spend one afternoon in?',['Notice how colour and lighting change a scene’s mood.','Compare a quiet moment with an action sequence.','Follow the work of a director, animator, or composer.'],'anime','culture',['japanese animation']),
  makeTopic('history','History','People. Evidence. Turning points.','The past is full of unfinished questions.','Ask how we know.','History becomes richer when you compare the evidence behind a story with the story itself. A letter, object, photograph, or building can offer a different perspective. Start with one time, place, or person rather than trying to cover everything.','What everyday object would you follow back through time?',['Choose one event and compare accounts from different perspectives.','Ask who created a source, when, and for whom.','Connect a familiar place or object to its past.'],'history','culture',['world history']),
  makeTopic('cricket','Cricket','Timing. Tactics. Rivalries.','More than a score on a screen.','Watch the contest within the match.','A cricket match offers many smaller stories: a batter reading a bowler, a field changing, or a team responding to pressure. Follow one of those contests and notice the decisions rather than only the result. Different formats offer different rhythms to explore.','What draws you in: a perfectly timed shot, a clever spell, or a tense finish?',['Follow the choices in one batter–bowler contest.','Notice how a field changes as a plan develops.','Explore the story of a team, ground, or rivalry.'],'cricket','culture',['criceket']),
  makeTopic('fashion','Fashion','Silhouettes. Identity. Expression.','Style is a conversation without words.','Read an outfit like a composition.','Fashion can be explored through shape, proportion, fabric, history, and personal expression. Look at why an outfit works for you rather than treating a trend as a rule. A familiar wardrobe can be as interesting a starting point as a runway.','What outfit feels most like you, and why?',['Compare how two fabrics change the same silhouette.','Explore an era or subculture through its clothing.','Notice the balance of shape, texture, and colour in an outfit.'],'fashion','culture',['style','fashio']),
  makeTopic('perfumes','Perfumes','Scent. Memory. Atmosphere.','Invisible details. Lasting impressions.','Give a scent your own words.','Perfume opens a world of sensory language, design, memory, and craft. Instead of searching for the perfect description, begin with what a scent reminds you of: a place, a texture, or a mood. Bottle design and the story around a fragrance offer other paths in.','If a favourite memory had a scent, what would it be?',['Describe a familiar scent without using its name.','Explore the visual design of a perfume bottle.','Compare your first impression with what you notice later.'],'perfumes','culture',['perfume','fragrance','fragrances']),
  makeTopic('cars','Cars','Design. Engineering. Car culture.','Every curve has a story behind it.','Start with what catches your eye.','Cars connect industrial design, engineering, motorsport, and personal culture. One detail—a headlight, a sound, or a body shape—can open a much bigger conversation. You can explore the craft and stories without owning a car or chasing a price tag.','Would you begin with the design, the engineering, or the story of a car?',['Compare the proportions of two very different cars.','Explore how an everyday car and a racing car solve different problems.','Follow one model through changes in its design.'],'cars','culture',['car','automotive','automobiles'])
);
const CULTURE_WORLDS = ['sneakers','kpop','anime','history','cricket','fashion','perfumes','cars'];
const RABBIT_HOLES = ['aviation','cinema','food','chess','art','skincare','economics','gaming'];
const DISCOVERIES = [
 {id:'air-and-grip',topic:'f1',title:'Why F1 cars chase the air.',description:'A little downforce. A very different kind of grip.',tag:'ENGINEERING ↔ SPORT'},
 {id:'time-in-miniature',topic:'watches',title:'An entire machine on your wrist.',description:'Follow a spring into a world of tiny, deliberate decisions.',tag:'CRAFT ↔ MECHANICS'},
 {id:'space-between-stars',topic:'astronomy',title:'The sky is a collection of old light.',description:'Looking up means looking into more than one moment.',tag:'SPACE ↔ TIME'},
 {id:'game-without-ball',topic:'football',title:'The game happening without the ball.',description:'Once you notice the space, you see a different match.',tag:'SPORT ↔ STRATEGY'}
];
const $ = (selector) => document.querySelector(selector);
const CARD_ART = {
  astronomy:'<circle cx="120" cy="70" r="34"/><ellipse cx="120" cy="70" rx="75" ry="19" transform="rotate(-25 120 70)"/><circle cx="120" cy="70" r="47" stroke-dasharray="2 8"/><path d="M40 35h8m-4-4v8M194 84h10m-5-5v10M176 27h6m-3-3v6"/><circle cx="57" cy="103" r="2" fill="currentColor"/><circle cx="180" cy="48" r="3" fill="currentColor"/>',
  photography:'<path d="M67 48h28l8-13h35l8 13h28v61H67z"/><circle cx="120" cy="77" r="21"/><circle cx="120" cy="77" r="12"/><path d="M153 59h9M51 42V27h20M169 27h20v15M51 115v12h20M169 127h20v-12M87 48v-6h8"/>',
  philosophy:'<path d="M120 23l47 26v53l-47 26-47-26V49zM73 49l47 27 47-27M120 76v52M120 23v53M73 102l47-26 47 26"/><ellipse cx="120" cy="76" rx="79" ry="22" transform="rotate(-28 120 76)"/>',
  architecture:'<path d="M63 104V57l38-22 38 22v47l-38 22zM63 57l38 22 38-22M101 79v47M139 79l29-17 28 17v35l-28 16-29-16M168 95v35M139 79l29 16 28-16M63 80L40 93v21l23 13 23-13M40 93l23 13 23-13M63 106v21"/>',
  custom:'<circle cx="120" cy="75" r="37"/><circle cx="120" cy="75" r="59" stroke-dasharray="2 9"/><path d="M120 21v108M66 75h108M83 38l74 74M83 112l74-74"/><circle cx="120" cy="75" r="9" fill="currentColor"/>'
};
let storageAvailable = true;
let atlas = loadAtlas();
let progress = loadProgress();
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
  // A modal sits in the browser's top layer, above the page toast.
  // Repeat feedback inside it so save confirmations remain visible.
  if ($('#topic-dialog').open) {
    $('#dialog-status').textContent = message;
    $('#dialog-status').hidden = false;
  }
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}

function getTopic(title, id) {
  const normalized = title.trim().toLocaleLowerCase();
  const names = topic => [topic.title,...(topic.aliases || [])].map(name => name.toLocaleLowerCase());
  const known = TOPICS.find(topic => topic.id === id || names(topic).includes(normalized));
  const saved = (id && atlas.find(item => item.id === id)) || atlas.find(item => item.title.trim().toLocaleLowerCase() === normalized || (known && names(known).includes(item.title.trim().toLocaleLowerCase())));
  // Preserve IDs created before a custom interest gains a curated cover/guide.
  // In particular, topic:football must not become football and orphan its notes.
  if (known) return {...known,id:saved?.id || id || known.id};
  return {id:id || saved?.id || `topic:${normalized}`,title:saved?.title || title.trim(),category:'A curiosity of your own',description:'A world of your own. Start anywhere.',intro:'Every question is a place to start. Make this interest your own.',custom:true,heading:'Your curiosity has a place here.',body:'We haven’t generated an answer about this topic on this page. Choose Ask AI for a live introduction or a deeper conversation. You can also save this world and keep your own separate notes.',question:`What first made you curious about ${title.trim()}?`,paths:['Write down what you already know or think you know.','Capture one question you would like to explore.','Add a source or an observation to your notes as you learn.']};
}

function createCard(topic, saved = false) {
  const card = document.createElement('article');
  card.className = 'interest-card';
  card.dataset.worldId = topic.id;
  const button = document.createElement('button');
  button.className = 'card-open';
  button.type = 'button';
  button.setAttribute('aria-label', `Explore ${topic.title}`);
  // Only fixed markup enters innerHTML. User-provided topic titles always use textContent.
  button.innerHTML = '<div class="card-art" aria-hidden="true"></div><span class="world-card-status">◇ UNEXPLORED</span><div class="card-content"><span class="card-category"></span><h3></h3><p></p><div class="card-bottom"><span></span><span aria-hidden="true">↗</span></div></div>';
  const art = button.querySelector('.card-art');
  if (topic.custom) { art.classList.add('art-custom'); art.innerHTML='<span class="custom-cover-label">YOUR OWN WORLD · DECORATIVE COVER</span>'; }
  else art.classList.add(`sheet-${topic.sheet || 'worlds'}`,`tile-${topic.art || 'space'}`);
  button.querySelector('.card-category').textContent = topic.category;
  button.querySelector('h3').textContent = topic.title;
  button.querySelector('.card-content p').textContent = topic.description;
  button.querySelector('.card-bottom span').textContent = saved ? 'Resume your world' : 'Enter this world';
  if (topic.art === 'watches') art.title = 'Illustrative Patek Philippe Nautilus cover. Not an official product photograph.';
  button.addEventListener('click', () => openTopic(topic,saved && atlas.find(item => item.id === topic.id)?.notes ? 'notes' : 'ready'));
  card.append(button);
  return card;
}

function renderAtlas() {
  $('#saved-count').textContent = atlas.length;
  $('#atlas-grid').replaceChildren(...atlas.map(item => createCard(getTopic(item.title,item.id),true)));
  $('#empty-atlas').hidden = atlas.length > 0;
  $('#saved-preview-grid').replaceChildren(...atlas.map(item => createCard(getTopic(item.title,item.id),true)));
  $('#saved-preview-grid').hidden = atlas.length === 0;
  $('#saved-preview-empty').hidden = atlas.length > 0;
  $('#saved-preview-count').textContent = atlas.length ? `${atlas.length} saved ${atlas.length === 1 ? 'world' : 'worlds'}. Pick up where you left off.` : 'Your next favourite thing deserves a place here.';
  renderProgress();
  if (window.HobbyQuestWorld) window.HobbyQuestWorld.refreshSaved();
}

function setView(view, updateRoute = true) {
  document.title = view === 'world' ? 'Formula 1 · HobbyQuest' : view === 'atlas' ? 'My Atlas · HobbyQuest' : 'HobbyQuest · Get into anything';
  $('#discover-view').hidden = view !== 'discover';
  $('#atlas-view').hidden = view !== 'atlas';
  $('#world-view').hidden = view !== 'world';
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view || (view === 'world' && button.dataset.view === 'discover');
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
  if (updateRoute && window.HobbyQuestWorld) window.HobbyQuestWorld.navigateView(view);
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

function recordVisit(id) {
  if (!progress.visited.includes(id)) { progress.visited.push(id); persistProgress(); renderProgress(); }
}

function openTopic(topic, startAt = 'ready') {
  topic = getTopic(topic.title,topic.id);
  if (window.HobbyQuestWorld && (topic.id === 'f1' || TOPICS.find(item => item.id === 'f1').aliases.some(name => name.toLowerCase() === topic.title.toLowerCase()) || topic.title === 'Formula 1')) {
    window.HobbyQuestWorld.open({notes:startAt === 'notes'});
    return;
  }
  activeTopic = topic;
  $('#dialog-status').hidden = true;
  $('#dialog-status').textContent = '';
  $('#dialog-title').textContent = topic.title;
  $('#dialog-category').textContent = topic.category;
  $('#dialog-intro').textContent = topic.intro;
  $('#ready-label').textContent = topic.custom ? 'YOUR OWN TOPIC · TRY ASK AI' : 'PREPARED EXAMPLE · TRY ASK AI FOR LIVE CHAT';
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
  selectTab(startAt === 'notes' ? 'notes-tab' : 'ready-tab');
  $('#topic-dialog').showModal();
  recordVisit(topic.id);
}

$('#interest-grid').replaceChildren(...SPOTLIGHT.map(id => createCard(getTopic(TOPICS.find(topic => topic.id === id).title,id))));
$('#culture-grid').replaceChildren(...CULTURE_WORLDS.map(id => createCard(getTopic(TOPICS.find(topic => topic.id === id).title,id))));
$('#rabbit-grid').replaceChildren(...RABBIT_HOLES.map(id => createCard(TOPICS.find(topic => topic.id === id))));
document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
  const topic = TOPICS.find(item => item.id === button.dataset.topic);
  if (topic) openTopic(topic);
}));
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
$('#custom-topic-button').addEventListener('click', () => $('#topic-input').focus());
$('#open-atlas').addEventListener('click', () => { setView('atlas'); window.scrollTo({top:0,behavior:'auto'}); });
document.querySelectorAll('[data-home-anchor]').forEach(link => link.addEventListener('click', () => setView('discover')));
$('#account-button').addEventListener('click', () => $('#account-dialog').showModal());
$('#close-account').addEventListener('click', () => $('#account-dialog').close());
$('#continue-guest').addEventListener('click', () => $('#account-dialog').close());
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
renderDiscoveries();
initCarousels();
setView('discover');
if (!storageAvailable) showToast('Browser storage is unavailable. Your atlas will last only for this session.');

function loadProgress() {
  const fallback = {visited:atlas.map(item => item.id),discoveries:[]};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return fallback;
    return {visited:[...new Set([...(Array.isArray(data.visited) ? data.visited.filter(id => typeof id === 'string') : []),...fallback.visited])].slice(0,2000),discoveries:[...new Set(Array.isArray(data.discoveries) ? data.discoveries.filter(id => DISCOVERIES.some(item => item.id === id)) : [])]};
  } catch { return fallback; }
}
function persistProgress() {
  try {localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));return true;}
  catch {showToast('Progress is available for this session only because browser storage is unavailable.');return false;}
}
function renderProgress() {
  $('#worlds-explored').textContent = progress.visited.length;
  $('#interests-saved').textContent = atlas.length;
  $('#discoveries-collected').textContent = progress.discoveries.length;
  window.HobbyQuestExplorer?.refresh({visited:progress.visited.map(id => ({id,title:atlas.find(item => item.id === id)?.title || TOPICS.find(item => item.id === id)?.title || id.replace(/^topic:/,'')})),discoveries:progress.discoveries.length});
  window.HobbyQuestGame?.refresh({visited:progress.visited,discoveries:progress.discoveries.length,hasNotes:atlas.some(item=>item.notes.trim().length > 0)});
  $('#explorer-badge').textContent = progress.discoveries.length >= 3 ? '✦ Collector unlocked · 3 discoveries' : progress.visited.length >= 3 ? '✦ World Hopper unlocked · 3 worlds' : progress.visited.length >= 1 ? '✧ First Spark unlocked · Your trail has begun' : 'Your first spark is waiting.';
}
function renderDiscoveries() {
  $('#discovery-grid').replaceChildren(...DISCOVERIES.map(discovery => {
    const topic = TOPICS.find(item => item.id === discovery.topic);
    const card = document.createElement('article');card.className='discovery-card';
    const open = document.createElement('button');open.className='discovery-open';open.type='button';open.setAttribute('aria-label',`Read discovery: ${discovery.title}`);
    open.innerHTML='<div class="card-art discovery-art" aria-hidden="true"></div><div class="discovery-copy"><small></small><h3></h3><p></p></div>';
    open.querySelector('.card-art').classList.add(`sheet-${topic.sheet || 'worlds'}`,`tile-${topic.art || 'space'}`);
    open.querySelector('small').textContent=discovery.tag;open.querySelector('h3').textContent=discovery.title;open.querySelector('p').textContent=discovery.description;
    open.addEventListener('click',()=>openTopic(getTopic(topic.title)));
    const collect = document.createElement('button');collect.type='button';collect.className='collect-button';
    const selected=progress.discoveries.includes(discovery.id);collect.textContent=selected?'✓ Collected · Remove':'+ Collect discovery';collect.setAttribute('aria-pressed',String(selected));collect.setAttribute('aria-label',`${selected?'Remove':'Collect'} discovery: ${discovery.title}`);
    collect.addEventListener('click',()=>{const index=progress.discoveries.indexOf(discovery.id);if(index>=0)progress.discoveries.splice(index,1);else progress.discoveries.push(discovery.id);const saved=persistProgress();renderDiscoveries();renderProgress();if(saved)showToast(index>=0?'Discovery removed from your collection.':'Discovery collected. A little more you.');});
    card.append(open,collect);return card;
  }));
}
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(button => button.addEventListener('click',()=>{
    const row=document.getElementById(button.dataset.carousel);const card=row.firstElementChild;if(!card)return;
    row.scrollBy({left:Number(button.dataset.direction)*(card.getBoundingClientRect().width+17)*2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }));
  document.querySelectorAll('.carousel').forEach(row=>row.addEventListener('keydown',event=>{
    if(event.target!==row || !['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();row.scrollBy({left:event.key==='ArrowRight'?240:-240,behavior:'auto'});
  }));
  document.querySelectorAll('.carousel').forEach(row => row.addEventListener('scroll',refreshCarouselControls,{passive:true}));
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(refreshCarouselControls);
    document.querySelectorAll('.carousel').forEach(row => observer.observe(row));
  }
  window.addEventListener?.('resize',refreshCarouselControls,{passive:true});
  refreshCarouselControls();
}

function refreshCarouselControls() {
  document.querySelectorAll('[data-carousel]').forEach(button => {
    const row = document.getElementById(button.dataset.carousel);
    if (!row || typeof row.clientWidth !== 'number' || row.clientWidth === 0) return;
    const end = row.scrollWidth - row.clientWidth;
    button.disabled = end <= 2 || (Number(button.dataset.direction) < 0 ? row.scrollLeft <= 2 : row.scrollLeft >= end - 2);
  });
}

