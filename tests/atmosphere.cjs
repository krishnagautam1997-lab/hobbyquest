const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname,'../motion.js'),'utf8');
class Surface {
  constructor(){this.values=new Map();this.classes=new Set();this.attributes={};this.events={};this.style={setProperty:(k,v)=>this.values.set(k,v),removeProperty:k=>this.values.delete(k)};this.classList={add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(type,fn){this.events[type]=fn;}
  closest(){return this;}
  getBoundingClientRect(){return {left:100,top:100,width:240,height:300};}
}
function boot({reduced=false,fine=true,stored='on',hidden=false,noCanvas=false}={}) {
  const root=new Surface(),toggle=new Surface(),surface=new Surface();
  const queued=new Map(),writes=[],events={},windowEvents={};let id=0,clears=0;
  const context={setTransform(){},clearRect(){clears++;},beginPath(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){}};
  const canvas={getContext:()=>noCanvas?null:context};
  const preference={matches:reduced,addEventListener(type,fn){this.change=fn;}};
  const finePointer={matches:fine,addEventListener(type,fn){this.change=fn;}};
  const document={documentElement:root,hidden,getElementById:id=>id==='motion-toggle'?toggle:canvas,addEventListener:(type,fn)=>events[type]=fn};
  vm.runInNewContext(code,{document,window:{innerWidth:1200,innerHeight:800,devicePixelRatio:2,matchMedia:q=>q.includes('reduced-motion')?preference:finePointer,addEventListener:(type,fn)=>windowEvents[type]=fn},localStorage:{getItem:()=>stored,setItem:(k,v)=>writes.push([k,v])},Element:Surface,requestAnimationFrame:fn=>{queued.set(++id,fn);return id;},cancelAnimationFrame:id=>queued.delete(id),console});
  return {root,toggle,surface,queued,writes,events,document,preference,canvas,clears:()=>clears,flush:time=>{const callbacks=Array.from(queued.values());queued.clear();callbacks.forEach(fn=>fn(time));}};
}
let app=boot();
assert.equal(app.toggle.attributes['aria-pressed'],'true');
assert.equal(app.canvas.width,1800,'Canvas pixel ratio is capped for performance.');
app.events.pointermove({clientX:220,clientY:240,pointerType:'mouse',target:app.surface});
app.flush(40);
assert.equal(app.root.values.get('--pointer-x'),'220px');
assert.equal(app.surface.values.get('--glow-x'),'120px');
assert.equal(app.surface.classes.has('pointer-lit'),true);
assert.equal(app.queued.size,1,'Particle rendering keeps only one outstanding animation frame.');
app.toggle.events.click();
assert.equal(app.toggle.attributes['aria-pressed'],'false');
assert.equal(app.surface.classes.has('pointer-lit'),false);
assert.equal(app.queued.size,0);
assert.deepEqual(app.writes,[['hobbyquest.motion.v1','off']],'Motion preference must never overwrite interests or notes.');
app.toggle.events.click();
app.document.hidden=true;app.events.visibilitychange();
assert.equal(app.queued.size,0,'Background tabs must stop animating.');
assert.equal(app.root.classes.has('background-paused'),true,'CSS ambient animation must pause in hidden tabs.');
app.document.hidden=false;app.events.visibilitychange();
assert.equal(app.root.classes.has('background-paused'),false);
app=boot({reduced:true});
assert.equal(app.toggle.disabled,true);
assert.equal(app.queued.size,0);
assert.equal(app.root.classes.has('motion-enabled'),false);
app=boot({fine:false});
assert.equal(app.toggle.textContent,'Motion on');
assert.equal(app.toggle.disabled,false);
assert.equal(app.root.classes.has('motion-enabled'),true,'Touch devices retain lightweight ambient light.');
app.events.pointermove({clientX:220,clientY:240,pointerType:'touch',target:app.surface});
assert.equal(app.root.values.has('--pointer-x'),false);
app.toggle.events.click();
assert.equal(app.root.classes.has('motion-enabled'),false);
assert.equal(app.queued.size,0);
app=boot({stored:'off'});
assert.equal(app.queued.size,0);
app=boot({noCanvas:true});
assert.equal(app.queued.size,0,'A missing drawing context must not break app controls.');
console.log('PASS: cursor glow, card lighting, bounded animation frames, motion toggle, saved motion preference, untouched atlas storage, background pause, reduced motion, touch ambient controls and missing canvas support.');



