const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const worldSource=fs.readFileSync(path.join(__dirname,'../world.js'),'utf8');
class Element {
 constructor(){this.attributes={};this.events={};this.children=[];this.hidden=false;this.value='';this.textContent='';this.dataset={};this.map=new Map();this.classList={add(){},toggle(){}};}
 setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k];} removeAttribute(k){delete this.attributes[k];}
 addEventListener(type,fn){(this.events[type]||=[]).push(fn);}trigger(type,event={}){for(const fn of this.events[type]||[])fn({preventDefault(){},...event});}
 replaceChildren(...children){this.children=children;}append(...children){this.children.push(...children);}get firstElementChild(){return this.children[0];}
 querySelector(selector){if(!this.map.has(selector))this.map.set(selector,new Element());return this.map.get(selector);}
 showModal(){this.open=true;}close(){this.open=false;}focus(){this.focused=true;}setCustomValidity(value){this.validationMessage=value;}reportValidity(){return !this.validationMessage;}
 getBoundingClientRect(){return {width:216,height:300,left:0,top:0};}scrollBy(options){this.scrolled=options;}scrollIntoView(options){this.jumped=options;}
}
const memory=new Map([['hobbyquest.atlas.v1',JSON.stringify([{id:'topic:football',title:'football',notes:'Existing private note.'}])]]);
function boot({failWrite=false,hash=''}={}){
 const nodes=new Map();const find=s=>{if(!nodes.has(s))nodes.set(s,new Element());return nodes.get(s);};
 const tabs=['ready','deeper','notes'].map(name=>{const el=find(`#${name}-tab`);el.id=`${name}-tab`;el.setAttribute('aria-controls',`${name}-panel`);return el;});
 const nav=['discover','atlas'].map(view=>{const el=new Element();el.dataset.view=view;return el;});
 const arrows=['interest-grid','culture-grid','discovery-grid','rabbit-grid'].flatMap(name=>[-1,1].map(direction=>{const el=new Element();el.dataset={carousel:name,direction:String(direction)};return el;}));
 const rows=['interest-grid','culture-grid','discovery-grid','saved-preview-grid','rabbit-grid'].map(id=>find('#'+id));
 const allButtons=()=>{const found=[];const walk=e=>{if(e.dataset.saveStory)found.push(e);e.children.forEach(walk);};for(const e of nodes.values())walk(e);return found;};
 const document={activeElement:null,querySelector:find,querySelectorAll:s=>s==='[data-save-story]'?allButtons():s==='[role="tab"]'?tabs:s==='[data-view]'?nav:s==='[data-carousel]'?arrows:s==='.carousel'?rows:[],getElementById:id=>find('#'+id),createElement:()=>new Element()};
 const events={};const location={hash};const history={pushState(a,b,url){location.hash=url;}};
 const context=vm.createContext({document,window:{location,history,scrollY:240,scrollTo(){},addEventListener:(name,fn)=>{events[name]=fn;},matchMedia:()=>({matches:false})},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>{if(failWrite)throw Error('storage blocked');memory.set(k,v);}},setTimeout:()=>1,clearTimeout(){},console});vm.runInContext(source,context);vm.runInContext(worldSource,context);
 return {find,tabs,nav,arrows,events,location,run:code=>vm.runInContext(code,context)};
}

memory.set('hobbyquest.atlas.v1',JSON.stringify([{id:'topic:f1',title:'F1',notes:'Earlier F1 notes.'},{id:'topic:football',title:'football',notes:'Do not change football.'}]));
let app=boot({hash:'#world/f1'});
assert.equal(app.find('#world-view').hidden,false);
assert.equal(app.find('#discover-view').hidden,true);
assert.equal(app.find('#f1-notes').value,'Earlier F1 notes.');
for(const part of ['rivalries','people','engineering','history'])assert.equal(app.find('#f1-'+part+'-grid').children.length,2);
const count=app.find('#worlds-explored').textContent;
app.run("openTopic(getTopic('Formula One'))");assert.equal(app.find('#worlds-explored').textContent,count);
app.find('#f1-rivalries-grid').children[0].children[0].trigger('click');
assert.equal(app.find('#story-dialog').open,true);
assert.match(app.find('#story-source').href,/^https:\/\//);
app.find('#save-active-story').trigger('click');
assert.equal(JSON.parse(memory.get('hobbyquest.stories.v1')).length,1);
assert.equal(app.find('#atlas-story-grid').children.length,1);
assert.equal(app.find('#f1-saved-count').textContent,1);
assert.equal(JSON.parse(memory.get('hobbyquest.atlas.v1')).length,2);
app=boot({hash:'#world/f1'});assert.equal(app.find('#f1-saved-count').textContent,1,'Story saves persist after a refresh.');
app.find('#f1-notes').value='Separate F1 memory.';app.find('#f1-notes').trigger('input');
let warned=false;app.events.beforeunload({preventDefault(){warned=true;}});assert.equal(warned,true);
app.run("setView('atlas')");app.run("openTopic(getTopic('F1'),'notes')");assert.equal(app.find('#f1-notes').value,'Separate F1 memory.','Navigation preserves an unsaved F1 draft.');
app.find('#save-f1-notes').trigger('click');assert.match(app.find('#f1-note-status').textContent,/saved in this browser/);
warned=false;app.events.beforeunload({preventDefault(){warned=true;}});assert.equal(warned,false);
let stored=JSON.parse(memory.get('hobbyquest.atlas.v1'));
assert.equal(stored.find(i=>i.id==='topic:f1').notes,'Separate F1 memory.');
assert.equal(stored.find(i=>i.id==='topic:football').notes,'Do not change football.');
app.find('#save-world').trigger('click');assert.equal(JSON.parse(memory.get('hobbyquest.atlas.v1')).length,2,'A world with notes cannot be removed accidentally.');
app.find('#world-back').trigger('click');assert.equal(app.find('#world-view').hidden,true);assert.equal(app.location.hash,'#atlas');
app.run("openTopic(getTopic('F1'))");app.location.hash='#home';app.events.popstate();assert.equal(app.find('#discover-view').hidden,false,'Browser Back leaves the world correctly.');
app.run("setView('atlas')");app.find('#atlas-story-grid').children[0].children[0].trigger('click');app.find('#story-to-notes').trigger('click');
assert.equal(app.location.hash,'#world/f1');assert.match(app.find('#f1-notes').value,/Separate F1 memory/);assert.match(app.find('#f1-note-status').textContent,/draft/);
app.find('#save-f1-notes').trigger('click');
app=boot({hash:'#world/f1'});assert.match(app.find('#f1-notes').value,/How would being teammates/,'Story questions are explicitly saved with F1 notes.');
app.find('#f1-saved-grid').children[0].children[1].trigger('click');assert.equal(app.find('#f1-saved-count').textContent,0);
stored=JSON.parse(memory.get('hobbyquest.atlas.v1'));assert.equal(stored.find(i=>i.id==='topic:football').notes,'Do not change football.');
app.find('#f1-notes').value='x'.repeat(10000);app.find('#f1-notes').trigger('input');app.find('#f1-engineering-grid').children[0].children[0].trigger('click');app.find('#story-to-notes').trigger('click');assert.equal(app.find('#story-dialog').open,true);assert.match(app.find('#story-status').textContent,/full/);assert.equal(app.find('#f1-notes').value.length,10000);
const before=memory.get('hobbyquest.stories.v1');app=boot({failWrite:true});app.find('#f1-people-grid').children[0].children[0].trigger('click');app.find('#save-active-story').trigger('click');assert.equal(memory.get('hobbyquest.stories.v1'),before);assert.match(app.find('#story-status').textContent,/session only/);
app.find('#interest-grid').clientWidth=300;app.find('#interest-grid').scrollWidth=800;app.find('#interest-grid').scrollLeft=0;app.run('refreshCarouselControls()');assert.equal(app.arrows[0].disabled,true);assert.equal(app.arrows[1].disabled,false);
memory.set('hobbyquest.stories.v1',JSON.stringify(['bad-id',{},'f1-tyres','f1-tyres']));app=boot();assert.equal(app.find('#f1-saved-count').textContent,1,'Stored story IDs are validated and deduplicated.');
console.log('PASS: F1 deep links, four sections/eight stories, readable sourced story dialog, independent story persistence, legacy F1/Football note isolation, explicit note saving, draft retention, unsaved-refresh warning, save protection, Atlas, browser Back, question-to-notes, capacity guard, storage failures and carousel bounds.');


