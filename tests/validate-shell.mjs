import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const index=readFileSync('game3d/index.html','utf8');
test('3D browser shell contains actual management assets in correct order',()=>{
  const arr=['career-simulation.js','office-economy.js','career-interface.js'];
  for(const s of arr)assert.ok(index.includes(s),'Missing '+s);
  assert.ok(index.indexOf('career-simulation.js')<index.indexOf('career-interface.js'));
  assert.ok(index.indexOf('office-economy.js')<index.indexOf('career-interface.js'));
  assert.ok(index.includes('scene-details.js'));
  assert.ok(index.includes('career-interface.css'));
});
