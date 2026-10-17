const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
class Element {
 constructor(){this.attributes={};this.events={};this.children=[];this.hidden=false;this.value='';this.textContent='';this.dataset={};this.map=new Map();this.classList={add(){},toggle(){}};}
 setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k];} removeAttribute(k){delete this.attributes[k];}
 addEventListener(type,fn){(this.events[type]||=[]).push(fn);}trigger(type,event={}){for(const fn of this.events[type]||[])fn({preventDefault(){},...event});}
 replaceChildren(...children){this.children=children;}append(...children){this.children.push(...children);}get firstElementChild(){return this.children[0];}
 querySelector(selector){if(!this.map.has(selector))this.map.set(selector,new Element());return this.map.get(selector);}
 showModal(){this.open=true;}close(){this.open=false;}focus(){this.focused=true;}setCustomValidity(value){this.validationMessage=value;}reportValidity(){return !this.validationMessage;}
 getBoundingClientRect(){return {width:216,height:300,left:0,top:0};}scrollBy(options){this.scrolled=options;}
}
const memory=new Map([['hobbyquest.atlas.v1',JSON.stringify([{id:'topic:football',title:'football',notes:'Existing private note.'}])]]);
function boot({failWrite=false}={}){
 const nodes=new Map();const find=s=>{if(!nodes.has(s))nodes.set(s,new Element());return nodes.get(s);};
 const tabs=['ready','deeper','notes'].map(name=>{const el=find(`#${name}-tab`);el.id=`${name}-tab`;el.setAttribute('aria-controls',`${name}-panel`);return el;});
 const nav=['discover','atlas'].map(view=>{const el=new Element();el.dataset.view=view;return el;});
 const arrows=['interest-grid','culture-grid','discovery-grid','rabbit-grid'].flatMap(name=>[-1,1].map(direction=>{const el=new Element();el.dataset={carousel:name,direction:String(direction)};return el;}));
 const rows=['interest-grid','culture-grid','discovery-grid','saved-preview-grid','rabbit-grid'].map(id=>find('#'+id));
 const document={querySelector:find,querySelectorAll:s=>s==='[role="tab"]'?tabs:s==='[data-view]'?nav:s==='[data-carousel]'?arrows:s==='.carousel'?rows:[],getElementById:id=>find('#'+id),createElement:()=>new Element()};
 const context=vm.createContext({document,window:{scrollTo(){},matchMedia:()=>({matches:false})},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>{if(failWrite)throw Error('storage blocked');memory.set(k,v);}},setTimeout:()=>1,clearTimeout(){},console});vm.runInContext(source,context);
 return {find,tabs,nav,arrows,run:code=>vm.runInContext(code,context)};
}
let app=boot();
assert.equal(app.find('#interest-grid').children.length,8);assert.equal(app.find('#rabbit-grid').children.length,8);
assert.equal(app.find('#culture-grid').children.length,8);
assert.equal(app.run('new Set(TOPICS.map(t=>t.id)).size === TOPICS.length'),true);
for(const [query,id] of [['sneakers','sneakers'],['Kpop','kpop'],['K-pop','kpop'],['anime','anime'],['history','history'],['cricket','cricket'],['fashion','fashion'],['perfume','perfumes'],['cars','cars']]){
 assert.equal(app.run(`getTopic(${JSON.stringify(query)}).id`),id);
 assert.equal(app.run(`getTopic(${JSON.stringify(query)}).sheet`),'culture');
 assert.equal(app.run(`getTopic(${JSON.stringify(query)}).paths.length`),3);
}
assert.equal(app.find('#saved-count').textContent,1);assert.equal(app.find('#worlds-explored').textContent,1);
assert.equal(app.run("getTopic('Football','football').id"),'topic:football','Curated cover must preserve the old custom interest ID.');
app.run("openTopic(getTopic('Football','football'))");assert.equal(app.find('#interest-notes').value,'Existing private note.');
app.find('#atlas-grid').children[0].children[0].trigger('click');assert.equal(app.find('#notes-panel').hidden,false,'Saved worlds with notes should open the notes tab.');
app.find('#save-interest').trigger('click');assert.equal(app.find('#saved-count').textContent,1,'Cannot accidentally remove a world with notes.');
const oldCount=app.find('#worlds-explored').textContent;app.run("openTopic(getTopic('F1'))");app.run("openTopic(getTopic('Formula One'))");assert.equal(app.find('#worlds-explored').textContent,oldCount+1,'Aliases and repeated visits must not inflate counts.');
app.find('#topic-input').value='Ancient coins';app.find('#topic-form').trigger('submit');assert.match(app.find('#ready-body').textContent,/haven’t generated an answer/);
app.find('#interest-notes').value='My separate coins note.';app.find('#save-notes').trigger('click');assert.equal(app.find('#saved-count').textContent,2);assert.match(app.find('#dialog-status').textContent,/Notes saved/);
app=boot();app.run("openTopic(getTopic('football'))");assert.equal(app.find('#interest-notes').value,'Existing private note.');
app.run("openTopic(getTopic('ANCIENT COINS'))");assert.equal(app.find('#interest-notes').value,'My separate coins note.');
for(let index=0;index<3;index++)app.find('#discovery-grid').children[index].children[1].trigger('click');
assert.equal(app.find('#discoveries-collected').textContent,3);assert.match(app.find('#explorer-badge').textContent,/Collector unlocked/);
app=boot();assert.equal(app.find('#discoveries-collected').textContent,3);app.find('#discovery-grid').children[0].children[1].trigger('click');assert.equal(app.find('#discoveries-collected').textContent,2);
app.find('#account-button').trigger('click');assert.equal(app.find('#account-dialog').open,true);app.find('#continue-guest').trigger('click');assert.equal(app.find('#account-dialog').open,false);
app.arrows[1].trigger('click');assert.ok(app.find('#interest-grid').scrolled.left>0);
app.arrows[3].trigger('click');assert.ok(app.find('#culture-grid').scrolled.left>0);
app.find('#topic-input').value='<img src=x onerror=alert(1)>';app.find('#topic-form').trigger('submit');assert.equal(app.find('#dialog-title').textContent,'<img src=x onerror=alert(1)>');
const before=memory.get('hobbyquest.atlas.v1');app=boot({failWrite:true});app.run("openTopic(getTopic('Another topic'))");app.find('#interest-notes').value='Session note';app.find('#save-notes').trigger('click');assert.equal(memory.get('hobbyquest.atlas.v1'),before);assert.match(app.find('#dialog-status').textContent,/storage is unavailable/);
memory.set('hobbyquest.atlas.v1',JSON.stringify([{id:'topic:kpop',title:'Kpop',notes:'Earlier K-pop note.'},{id:'topic:perfume',title:'perfume',notes:'Earlier fragrance note.'}]));
app=boot();app.run("openTopic(getTopic('K-pop','kpop'))");assert.equal(app.find('#interest-notes').value,'Earlier K-pop note.');
app.run("openTopic(getTopic('Perfumes','perfumes'))");assert.equal(app.find('#interest-notes').value,'Earlier fragrance note.');
assert.equal(app.find('#saved-count').textContent,2);
console.log('PASS: 24 homepage world cards, all eight new guides/aliases, culture carousel, old Football/K-pop/perfume notes preserved, arbitrary topics, saved-note navigation, save feedback, persistent separate notes, unique visits, real collect/uncollect counts, badges, account-preview controls, text injection and failed storage.');

