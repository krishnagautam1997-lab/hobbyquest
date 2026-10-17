const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const css=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');
assert.match(css,/\.search-box input:focus-visible\{outline:none\}/);
assert.match(css,/\.search-box:focus-within\{border-color:#ff6689;box-shadow:0 0 0 1px/);
assert.match(css,/@media\(forced-colors:active\)\{\.search-box:focus-within\{outline:2px solid Highlight/);
assert.match(css,/button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,\[tabindex\]:focus-visible\{outline:2px solid/,'Other controls must retain their keyboard focus cues.');
console.log('PASS: search focus cue moves from square input to rounded parent, forced-colours fallback provided, other keyboard outlines preserved.');
