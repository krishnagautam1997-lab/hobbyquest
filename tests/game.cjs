const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../game.css'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
class Element {
 constructor(){this.events={};this.textContent='';this.attributes={};this.dataset={};this.classes=new Set();this.classList={toggle:(key,value)=>value?this.classes.add(key):this.classes.delete(key)};this.children=new Map();}
 addEventListener(k,f){this.events[k]=f;}click(){this.events.click?.();}focus(){this.focused=true;}querySelector(s){if(!this.children.has(s))this.children.set(s,new Element());return this.children.get(s);}
}
const nodes=new Map();const el=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
const quests=['world','collect','note'].map(name=>{const n=new Element();n.dataset.quest=name;return n;});
const passport=new Element();const cards=['f1','topic:football','watches'].map(id=>{const n=new Element();n.dataset.worldId=id;return n;});
const calls=[];let api;
const context=vm.createContext({document:{getElementById:el,querySelectorAll:s=>s==='[data-quest]'?quests:s==='[data-passport]'?[passport]:s==='.interest-card[data-world-id]'?cards:[]},window:{HobbyQuestWorld:{navigateSection:id=>calls.push(['section',id])}},setView:view=>calls.push(['view',view]),getTopic:(title,id)=>({title,id}),openTopic:(topic,tab)=>calls.push(['topic',topic.id,tab]),renderProgress(){context.window.HobbyQuestGame.refresh({visited:[],discoveries:0,hasNotes:false});}});
vm.runInContext(source,context);api=context.window.HobbyQuestGame;
assert.equal(el('hud-rank').textContent,'New Explorer');assert.equal(el('quest-tally').textContent,'0 / 3 trail markers');
passport.click();assert.deepEqual(calls.pop(),['section','explorer-passport']);el('open-quests').click();assert.deepEqual(calls.pop(),['section','quest-board']);
quests[0].click();assert.deepEqual(calls.pop(),['view','discover']);assert.equal(el('topic-input').focused,true);
quests[1].click();assert.deepEqual(calls.pop(),['section','discoveries']);quests[2].click();assert.deepEqual(calls.pop(),['topic','f1','notes']);
let opened=0;el('open-guide').addEventListener('click',()=>opened++);el('hud-ai').click();assert.equal(opened,1);
api.refresh({visited:['f1','topic:football','watches'],discoveries:1,hasNotes:false});assert.equal(el('hud-rank').textContent,'World Hopper');assert.equal(el('hud-worlds').textContent,3);assert.equal(el('quest-tally').textContent,'2 / 3 trail markers');assert.ok(cards.every(card=>card.classes.has('on-trail')));assert.ok(quests[0].classes.has('complete'));assert.equal(quests[2].classes.has('complete'),false);assert.match(el('quest-feedback').textContent,/Trail marker added/);
api.refresh({visited:['f1'],discoveries:3,hasNotes:true});assert.equal(el('hud-rank').textContent,'Discovery Collector');assert.equal(el('quest-tally').textContent,'3 / 3 trail markers');assert.equal(cards[2].classes.has('on-trail'),false);assert.match(cards[2].querySelector('.world-card-status').textContent,/UNEXPLORED/);
api.refresh({visited:['f1'],discoveries:0,hasNotes:false});assert.equal(el('quest-tally').textContent,'1 / 3 trail markers','Markers reflect current actions, not permanent learning achievements');assert.equal(quests[1].classes.has('complete'),false);
assert.doesNotMatch(source,/\bfetch\s*\(|localStorage|\.notes\b/,'Game layer gets only summary metadata, no notes or inference');
assert.ok(html.indexOf('class="quest-hud"')<html.indexOf('id="discover-view"'),'HUD is available outside homepage route');assert.ok(html.indexOf('id="quest-board"')<html.indexOf('id="spotlight"'),'Quest log is near the top, not buried');
assert.match(css,/prefers-reduced-motion/);assert.match(css,/forced-colors/);assert.match(css,/\.quest-options\{grid-template-columns:1fr/);
console.log('PASS: first-screen HUD, real explorer rank/counts, optional quest actions/completion/announcements, Passport navigation entry, world trail stamps, no note content/storage/AI requests, mobile stacking and motion/contrast fallbacks.');
