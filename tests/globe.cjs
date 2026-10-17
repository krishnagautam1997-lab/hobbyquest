const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../globe.js'),'utf8');
function boot({noWebGL=false,reduced=false,badShader=false}={}){
 const classes=new Set(['motion-enabled']),hostClasses=new Set(),queue=new Map(),changes=[],events={},canvasEvents={},angles=[];let id=0,image,intersection,draws=0;
 const preference={matches:reduced,addEventListener:(name,fn)=>preference.change=fn};
 const host={clientWidth:600,classList:{add:c=>hostClasses.add(c),remove:c=>hostClasses.delete(c)}};
 const gl={createShader:()=>({}),getShaderParameter:()=>!badShader,createProgram:()=>({}),getProgramParameter:()=>true,createBuffer:()=>({}),getAttribLocation:()=>0,getUniformLocation:(p,name)=>name,createTexture:()=>({}),uniform1f:(name,value)=>angles.push(value),drawArrays:()=>draws++};
 for(const name of ['shaderSource','compileShader','deleteShader','attachShader','linkProgram','useProgram','bindBuffer','bufferData','enableVertexAttribArray','vertexAttribPointer','activeTexture','bindTexture','texParameteri','uniform1i','viewport','clearColor','clear','texImage2D'])gl[name]=()=>{};
 const canvas={parentElement:host,width:0,height:0,getContext:()=>noWebGL?null:gl,addEventListener:(name,fn)=>canvasEvents[name]=fn};
 const document={documentElement:{classList:{contains:c=>classes.has(c)}},body:{},hidden:false,dialog:false,getElementById:()=>canvas,querySelector:()=>document.dialog?{}:null,addEventListener:(name,fn)=>events[name]=fn};
 class Image{constructor(){image=this;}set src(value){this.url=value;}}
 class MutationObserver{constructor(fn){changes.push(fn);}observe(){}}
 class IntersectionObserver{constructor(fn){intersection=fn;}observe(){}}
 class ResizeObserver{constructor(fn){this.fn=fn;}observe(){this.fn();}}
 vm.runInNewContext(code,{document,window:{devicePixelRatio:2,matchMedia:()=>preference,addEventListener(){}},Image,MutationObserver,IntersectionObserver,ResizeObserver,Float32Array,requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:id=>queue.delete(id)});
 return {classes,hostClasses,queue,changes,events,canvasEvents,angles,canvas,document,preference,load:()=>image?.onload(),intersect:value=>intersection?.([{isIntersecting:value}]),draws:()=>draws,flush:time=>{const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(time));}};
}
let app=boot();app.load();assert.equal(app.hostClasses.has('globe-ready'),true);assert.equal(app.canvas.width,768,'Globe resolution is capped.');assert.equal(app.queue.size,1);app.flush(100);app.flush(150);assert.ok(app.angles.at(-1)>-.3,'Longitude actually advances around the sphere.');
app.classes.delete('motion-enabled');app.changes[0]();assert.equal(app.queue.size,0,'The saved motion switch stops the globe.');
app.classes.add('motion-enabled');app.changes[0]();assert.equal(app.queue.size,1);app.document.dialog=true;app.changes[1]();assert.equal(app.queue.size,0,'Reading dialogs pause rotation.');
app.document.dialog=false;app.changes[1]();app.intersect(false);assert.equal(app.queue.size,0,'Offscreen globes stop GPU work.');app.intersect(true);app.document.hidden=true;app.events.visibilitychange();assert.equal(app.queue.size,0,'Hidden tabs stop GPU work.');
app=boot({reduced:true});app.load();assert.ok(app.draws()>0);assert.equal(app.queue.size,0,'Reduced motion retains a static round Earth.');
app=boot();app.load();app.canvasEvents.webglcontextlost({preventDefault(){}});assert.equal(app.hostClasses.has('globe-ready'),false);assert.equal(app.queue.size,0,'Context loss reveals the CSS fallback.');
app=boot({noWebGL:true});app.load();assert.equal(app.hostClasses.has('globe-ready'),false);assert.equal(app.queue.size,0);
app=boot({badShader:true});app.load();assert.equal(app.queue.size,0);
console.log('PASS: spherical projection setup, real longitude rotation, capped resolution, motion/reduced-motion controls, dialog/offscreen/hidden-tab pauses, and WebGL failure fallback.');

