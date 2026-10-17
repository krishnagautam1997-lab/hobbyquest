const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../scroll.js'),'utf8');
function boot({reduced=false,off=false}={}){
 const classes=new Set(off?[]:['motion-enabled']),queue=new Map(),events={},changes=[];let id=0;
 class Surface{constructor(top,height){this.rect={top,height,bottom:top+height};this.visible=true;this.values=new Map();this.style={setProperty:(k,v)=>this.values.set(k,v)};}getClientRects(){return this.visible?[this.rect]:[];}getBoundingClientRect(){return this.rect;}}
 const section=new Surface(700,700),hero=new Surface(-200,800);
 const root={classList:{contains:c=>classes.has(c),toggle:(c,on)=>on?classes.add(c):classes.delete(c)}};
 const preference={matches:reduced,addEventListener:(name,fn)=>preference.change=fn};
 const document={documentElement:root,body:{},hidden:false,querySelectorAll:s=>s.includes('.collection')?[section]:[hero],addEventListener:(name,fn)=>events[name]=fn};
 class MutationObserver{constructor(fn){changes.push(fn);}observe(){}}
 vm.runInNewContext(source,{document,window:{innerHeight:800,matchMedia:()=>preference,addEventListener:(name,fn)=>events[name]=fn},MutationObserver,requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:id=>queue.delete(id)});
 return {classes,queue,events,changes,document,section,hero,preference,flush:()=>{const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn());}};
}
let app=boot();app.flush();assert.equal(app.section.values.get('--section-scale'),'0.9550');assert.equal(app.queue.size,0,'No endless background scroll loop.');assert.ok(Number(app.hero.values.get('--hero-copy-scale'))<1,'Passing the hero zooms its copy out.');
app.section.rect={top:200,bottom:900,height:700};app.events.scroll();app.events.scroll();assert.equal(app.queue.size,1,'Scroll work is batched into one frame.');app.flush();assert.equal(app.section.values.get('--section-scale'),'1.0000','Arriving sections zoom to full size.');
app.classes.delete('motion-enabled');app.changes[0]();assert.equal(app.classes.has('scroll-motion'),false);app.events.scroll();assert.equal(app.queue.size,0,'The existing motion switch disables scroll effects.');
app=boot({reduced:true});assert.equal(app.queue.size,0);assert.equal(app.classes.has('scroll-motion'),false);
app=boot({off:true});assert.equal(app.queue.size,0);
app=boot();app.flush();app.document.hidden=true;app.events.visibilitychange();app.events.scroll();assert.equal(app.queue.size,0,'Hidden tabs do no scroll animation work.');
app=boot();app.section.visible=false;app.flush();assert.equal(app.section.values.size,0,'Hidden route sections are untouched.');
console.log('PASS: scroll-linked hero zoom out, section zoom in, stable parent measurement, one-frame batching, hidden-route/tab pause and motion/reduced-motion controls.');
