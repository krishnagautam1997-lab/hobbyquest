'use strict';

// Dependency-free spherical projection. A static round CSS globe remains if WebGL fails.
(() => {
  const canvas = document.getElementById('earth-canvas');
  if (!canvas) return;
  const host = canvas.parentElement;
  const root = document.documentElement;
  let gl;
  try { gl = canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false}); } catch { return; }
  if (!gl) return;
  const vertexSource = 'attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}';
  const fragmentSource = `precision mediump float;
    varying vec2 v_uv; uniform sampler2D u_map; uniform float u_angle;
    void main(){
      vec2 p=v_uv*2.-1.; float r=dot(p,p); if(r>1.) discard;
      float tilt=-.21; p=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*p;
      vec3 n=vec3(p,sqrt(max(0.,1.-r)));
      float longitude=atan(n.x,n.z)+u_angle;
      vec2 uv=vec2(fract(longitude/6.2831853+.5),.5-asin(clamp(n.y,-1.,1.))/3.14159265);
      vec3 land=texture2D(u_map,uv).rgb;
      float sunlight=max(0.,dot(n,normalize(vec3(-.65,.5,.8))));
      float rim=pow(1.-n.z,3.);
      vec3 color=land*(.19+sunlight*.99)+vec3(.48,.015,.075)*rim*.48;
      gl_FragColor=vec4(color,1.-smoothstep(.993,1.,r));
    }`;
  function shader(type,source) {
    const result = gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);
    if (!gl.getShaderParameter(result,gl.COMPILE_STATUS)) {gl.deleteShader(result);return null;}return result;
  }
  const vertex = shader(gl.VERTEX_SHADER,vertexSource), fragment = shader(gl.FRAGMENT_SHADER,fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
  gl.useProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
  const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const angleLocation = gl.getUniformLocation(program,'u_angle');
  const texture = gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(program,'u_map'),0);
  let ready = false, failed = false, visible = true, frame = 0, lastTime = 0, angle = -.3;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function draw() {
    if (!ready || failed) return;
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(angleLocation,angle);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function running() {
    return ready && !failed && visible && !document.hidden && !reduced.matches && root.classList.contains('motion-enabled') && !document.querySelector('dialog[open]');
  }
  function tick(time) {
    frame = 0;if (!running()) return;
    if (!lastTime) lastTime = time;
    const elapsed = time-lastTime;
    if (elapsed >= 40) {angle += Math.min(elapsed,80)*.00006545;lastTime = time;draw();}
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame = 0;lastTime = 0;
    if (running()) frame = requestAnimationFrame(tick);else draw();
  }
  function resize() {
    const size = Math.min(768,Math.max(240,Math.round(host.clientWidth*Math.min(window.devicePixelRatio || 1,1.5))));
    if (canvas.width !== size) {canvas.width = size;canvas.height = size;draw();}
  }
  const image = new Image();image.decoding = 'async';
  image.onload = () => {
    if (failed) return;
    try {gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}
    catch {failed = true;return;}
    ready = true;host.classList.add('globe-ready');resize();draw();sync();
  };
  image.onerror = () => {failed = true;cancelAnimationFrame(frame);};
  image.src = 'assets/earth-red.webp';
  if (typeof IntersectionObserver !== 'undefined') new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();},{threshold:0}).observe(canvas);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(host);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
    new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','hidden']});
  }
  canvas.addEventListener('webglcontextlost',event => {event.preventDefault();failed = true;ready = false;cancelAnimationFrame(frame);host.classList.remove('globe-ready');});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);window.addEventListener('resize',resize,{passive:true});
})();
