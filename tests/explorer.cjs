const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../explorer.js'),'utf8');
const chatSource=fs.readFileSync(path.join(__dirname,'../chat.js'),'utf8');
class Element {
 constructor(){this.events={};this.children=[];this.value='';this.textContent='';this.checked=false;this.attributes={};this.open=false;}
 addEventListener(k,f){(this.events[k]||=[]).push(f);}async trigger(k,e={}){for(const f of this.events[k]||[])await f({preventDefault(){},...e});}
 replaceChildren(...c){this.children=c;}append(...c){this.children.push(...c);}setAttribute(k,v){this.attributes[k]=v;}
 showModal(){this.open=true;}close(){this.open=false;}focus(){}click(){return this.trigger('click');}
 set innerHTML(v){throw Error('Guest content must use textContent');}
}
const KEY='hobbyquest.sparks.v1';const BADGES='hobbyquest.passport.v1';
const memory=new Map([['hobbyquest.atlas.v1','PRIVATE NOTE'],['hobbyquest.progress.v1','PROGRESS'],['hobbyquest.stories.v1','STORIES']]);
let now='2026-10-17T23:59:00Z';let failRead=false,failWrite=false,calls=0,mode='ok';
class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}}
function boot(withChat=false){
 const nodes=new Map();const el=id=>{if(!nodes.has(id)) nodes.set(id,new Element());return nodes.get(id);};const events={};
 const window={addEventListener:(k,f)=>events[k]=f};const document={getElementById:el,createElement:()=>new Element(),querySelectorAll:()=>[],addEventListener:(k,f)=>events[k]=f};
 const context=vm.createContext({window,document,Date:Clock,localStorage:{getItem:k=>{if(failRead) throw Error('blocked');return memory.get(k)||null;},setItem:(k,v)=>{if(failWrite)throw Error('full');memory.set(k,v);}},setInterval:()=>1,setTimeout,clearTimeout,AbortController,getTopic:(title,id)=>({title,id:id||title}),fetch:async()=>{calls++;if(mode==='network')throw Error('offline');return {ok:mode==='ok',status:503,json:async()=>mode==='ok'?{answer:'A useful reply.'}:{error:mode}};}});
 vm.runInContext(source,context);if(withChat) vm.runInContext(chatSource,context);
 return {el,events,api:window.HobbyQuestExplorer};
}
function passport(app,count=3,discoveries=3){app.api.refresh({visited:Array.from({length:count},(_,i)=>({id:String(i),title:i===0?'<img src=x>':`World ${i}`})),discoveries});}
async function send(app,text='A test question'){app.el('chat-input').value=text;await app.el('chat-form').trigger('submit');}
(async()=>{
 let app=boot();assert.equal(app.el('sparks-home-count').textContent,'10 / 10');assert.equal(calls,0);
 passport(app,0,0);assert.equal(app.el('passport-empty').hidden,false);assert.equal(app.el('passport-badges').children.length,3);
 passport(app);assert.equal(app.el('passport-stamps').children[0].textContent,'World 2');assert.equal(app.el('passport-stamps').children[2].textContent,'<img src=x>');assert.ok(app.el('passport-badges').children.every(b=>b.className.includes('unlocked')));
 passport(app,3,0);assert.ok(app.el('passport-badges').children[2].className.includes('unlocked'),'Earned Collector survives uncollect');
 app=boot();passport(app,0,0);assert.ok(app.el('passport-badges').children.every(b=>b.className.includes('unlocked')),'Badges survive reload');
 app.api.sparks.use();assert.equal(app.el('sparks-home-count').textContent,'9 / 10');app=boot();assert.equal(app.el('sparks-chat-count').textContent,'9 / 10 Sparks');
 memory.set(KEY,JSON.stringify({day:'2026-10-17',used:10}));app.events.storage({key:KEY});assert.equal(app.el('sparks-exhausted').hidden,false);assert.equal(app.api.sparks.available(),false);
 now='2026-10-18T00:00:00Z';app.api.sparks.refresh();assert.equal(app.el('sparks-home-count').textContent,'10 / 10');
 for(const bad of ['{bad','null','[]',JSON.stringify({day:'2026-10-18',used:-1}),JSON.stringify({day:'2026-10-18',used:400})]){memory.set(KEY,bad);app=boot();assert.equal(app.api.sparks.available(),true);app.api.sparks.use();assert.equal(app.el('sparks-home-count').textContent,'9 / 10');}
 memory.set(KEY,JSON.stringify({day:'2026-10-18',used:2}));failWrite=true;app=boot();app.api.sparks.use();app.api.sparks.use();assert.equal(app.el('sparks-home-count').textContent,'6 / 10','Session-only usage cannot be overwritten by stale saved state');assert.match(app.el('sparks-chat-note').textContent,/Session-only/);failWrite=false;
 failRead=true;app=boot();app.api.sparks.use();assert.equal(app.el('sparks-home-count').textContent,'9 / 10');failRead=false;
 memory.delete(KEY);app=boot(true);app.el('chat-world').value='Test';await app.el('chat-topic-form').trigger('submit');
 await send(app);assert.equal(calls,0,'Consent still required');assert.equal(app.el('sparks-home-count').textContent,'10 / 10');app.el('chat-consent').checked=true;
 for(const error of ['network','daily_limit','unavailable','rate_limited']){mode=error;await send(app);assert.equal(app.el('sparks-home-count').textContent,'10 / 10','Failed replies do not deduct');assert.equal(app.el('chat-input').value,'A test question');}
 mode='ok';for(let i=0;i<10;i++)await send(app);assert.equal(app.el('sparks-home-count').textContent,'0 / 10');const before=calls;await send(app,'Keep my draft');assert.equal(calls,before,'Exhausted allowance prevents a request');assert.equal(app.el('chat-input').value,'Keep my draft');assert.match(app.el('chat-status').textContent,/10 Sparks/);
 app=boot(true);assert.equal(app.el('sparks-chat-count').textContent,'0 / 10 Sparks');now='2026-10-19T00:00:00Z';app.api.sparks.refresh();assert.equal(app.el('sparks-chat-count').textContent,'10 / 10 Sparks');
 assert.equal(memory.get('hobbyquest.atlas.v1'),'PRIVATE NOTE');assert.equal(memory.get('hobbyquest.progress.v1'),'PROGRESS');assert.equal(memory.get('hobbyquest.stories.v1'),'STORIES');assert.equal(JSON.parse(memory.get(BADGES)).length,3);
 console.log('PASS: Passport stamps, safe titles, three permanent action badges, old guest-data isolation; 10 browser-local Sparks, success-only deduction, no-consent/error/no-request states, reload/midnight/cross-tab refresh, invalid data, storage failures, exhausted draft preservation and daily reset.');
})().catch(error=>{console.error(error);process.exitCode=1;});
