/* Live source contract: no free touring, sequential paid purchases, requirements and save preservation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'..','office-economy.js'),'utf8');
const ctx={Date,Math,Intl,Number,JSON,globalThis:{},window:undefined};vm.createContext(ctx);vm.runInContext(code,ctx);const eco=ctx.globalThis.StudioEmpireOfficeEconomy;assert.ok(eco);
function state(extra={}){return {studio:'Test Studio',year:1980,month:1,office:1,officeVersion:2,cash:75000,staff:[{id:1},{id:2},{id:3}],games:[{title:'Game 1'}],fans:500,rep:19,yearlyProfit:2000,totalSpent:0,officeHistory:[],history:[],researchHistory:[],...extra}}
function store(s){const map=new Map(s?[[eco.SAVE_KEY,JSON.stringify(s)]]:[]);return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),snapshot:()=>JSON.parse(map.get(eco.SAVE_KEY))}}
let db=store();assert.equal(eco.purchase(2,db).ok,false);
db=store(state());assert.equal(eco.purchase(4,db).reason,'BUY_IN_ORDER');
for(const bad of [{games:[]},{staff:[{id:1}]},{fans:100},{rep:0},{cash:10}]){db=store(state(bad));assert.equal(eco.purchase(2,db).ok,false);assert.equal(db.snapshot().office,1)}
db=store(state({unrelated:{save:'intact'}}));let r=eco.purchase(2,db);assert.equal(r.ok,true);assert.equal(db.snapshot().cash,35000);assert.equal(db.snapshot().office,2);assert.equal(db.snapshot().totalSpent,40000);assert.equal(db.snapshot().officeHistory[0].price,40000);assert.equal(db.snapshot().unrelated.save,'intact');
assert.equal(eco.purchase(2,db).reason,'ALREADY_OWNED');assert.equal(db.snapshot().cash,35000);
db=store(state({office:2,year:1995,cash:200000,staff:Array(5).fill({id:1}),games:Array(3).fill({title:'G'}),fans:3000,rep:25}));r=eco.purchase(3,db);assert.equal(r.ok,true);assert.equal(db.snapshot().cash,85000);
db=store(state({office:3,year:2026,cash:800000,staff:Array(12).fill({id:1}),games:Array(9).fill({title:'G'}),fans:26000,rep:55}));r=eco.purchase(4,db);assert.equal(r.ok,true);assert.equal(db.snapshot().cash,460000);assert.equal(db.snapshot().office,4);
db=store(state());db.setItem=()=>{throw Error('save blocked')};assert.equal(eco.purchase(2,db).reason,'SAVE_ERROR');
console.log('PASS: actual career upgrade economics, required progress, sequential purchases, one-time deductions, and save preservation.');
