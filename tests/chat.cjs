const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../chat.js'),'utf8');
class Element{
 constructor(){this.events={};this.children=[];this.value='';this.textContent='';this.dataset={};this.checked=false;this.open=false;this.attributes={};}
 addEventListener(k,f){(this.events[k]||=[]).push(f);}async trigger(k,e={}){for(const f of this.events[k]||[])await f({preventDefault(){},...e});}
 replaceChildren(...c){this.children=c;}append(...c){this.children.push(...c);}setAttribute(k,v){this.attributes[k]=v;}
 showModal(){this.open=true;}close(){this.open=false;this.trigger('close');}focus(){this.focused=true;}
 set innerHTML(v){throw Error('Chat must render text, not HTML');}
}
const memory=new Map([['hobbyquest.atlas.v1','PRIVATE NOTE SENTINEL'],['hobbyquest.stories.v1','STORY SENTINEL']]);
let calls=[];let mode='ok';
function boot(failWrite=false){
 const nodes=new Map();const el=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
 const suggestions=['Give me a beginner introduction.','Three rabbit holes?'].map(text=>{const e=new Element();e.dataset.chatPrompt=text;return e;});
 const context=vm.createContext({document:{getElementById:el,createElement:()=>new Element(),querySelectorAll:()=>suggestions},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>{if(failWrite)throw Error('full');memory.set(k,v);}},window:{confirm:()=>true},getTopic:(title,id)=>({title:title==='f1'?'Formula 1':title,id:id||`topic:${title.toLowerCase()}`}),activeTopic:{id:'topic:football',title:'Football'},AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});if(mode==='network')throw Error('offline');return {ok:mode==='ok',status:mode==='rate_limited'?429:503,json:async()=>mode==='ok'?{answer:'<img src=x onerror=alert(1)> A real answer.'}:{error:mode}};}});
 vm.runInContext(source,context);return {el,suggestions};
}
async function topic(app,title){app.el('chat-world').value=title;await app.el('chat-topic-form').trigger('submit');}
async function send(app,text){app.el('chat-input').value=text;await app.el('chat-form').trigger('submit');}
(async()=>{
 let app=boot();await app.el('open-guide').trigger('click');assert.equal(calls.length,0);assert.equal(app.el('chat-send').disabled,true);
 await topic(app,'Football');await send(app,'Explain pressing.');assert.equal(calls.length,0,'Consent required');app.el('chat-consent').checked=true;
 await send(app,'Explain pressing.');assert.equal(calls.length,1);assert.equal(calls[0].body.topic,'Football');assert.equal(calls[0].body.messages.length,1);assert.ok(!JSON.stringify(calls[0]).includes('SENTINEL'));assert.equal(calls[0].options.credentials,'omit');
 assert.equal(app.el('chat-log').children[1].children[1].textContent,'<img src=x onerror=alert(1)> A real answer.');
 await send(app,'How can I spot it?');assert.equal(calls.at(-1).body.messages.length,3);
 await topic(app,'Watches');assert.equal(app.el('chat-log').children.length,1);await send(app,'Explain mechanical watches.');assert.equal(calls.at(-1).body.messages.length,1,'Interests cannot share context');
 app=boot();await topic(app,'Football');assert.equal(app.el('chat-log').children.length,4,'Reload preserves complete pairs');
 app.el('chat-consent').checked=true;mode='daily_limit';await send(app,'Another question');assert.match(app.el('chat-status').textContent,/allowance is used up/);assert.equal(app.el('chat-input').value,'Another question');assert.equal(app.el('chat-log').children.length,4,'Failures cannot create fake AI replies');
 for(const error of ['network','rate_limited','unavailable','timeout']){mode=error;await send(app,'Retry me');assert.equal(app.el('chat-input').value,'Retry me');assert.equal(app.el('chat-send').disabled,false);}
 mode='ok';for(let i=0;i<12;i++)await send(app,`Follow-up ${i}`);assert.ok(calls.at(-1).body.messages.length<=7);assert.equal(JSON.parse(memory.get('hobbyquest.conversations.v1')).find(w=>w.title==='Football').messages.length,20);
 const before=memory.get('hobbyquest.conversations.v1');app=boot(true);await topic(app,'Football');app.el('chat-consent').checked=true;await send(app,'Session only');assert.equal(memory.get('hobbyquest.conversations.v1'),before);assert.match(app.el('chat-storage').textContent,/session/);
 app=boot();await topic(app,'Football');await app.el('chat-forget').trigger('click');const saved=JSON.parse(memory.get('hobbyquest.conversations.v1'));assert.equal(saved.some(w=>w.title==='Football'),false);assert.equal(saved.some(w=>w.title==='Watches'),true);
 assert.equal(memory.get('hobbyquest.atlas.v1'),'PRIVATE NOTE SENTINEL');assert.equal(memory.get('hobbyquest.stories.v1'),'STORY SENTINEL');
 console.log('PASS: explicit consent/no automatic requests, any-interest chat, bounded context and history, per-interest isolation/reload, text-only rendering, independent reset, note/story preservation, retry drafts, quota/rate/network/timeout errors and storage failure.');
})().catch(e=>{console.error(e);process.exitCode=1;});
