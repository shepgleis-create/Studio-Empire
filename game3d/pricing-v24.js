/* Studio Empire v0.24: real post-release pricing and timed discount campaigns. */
(function(g){'use strict';
const core=g.StudioEmpireCareer,industry=g.StudioEmpireIndustry;if(!core||!industry)return;
const number=(x,d=0)=>Number.isFinite(+x)?+x:d,day=s=>number(s.dailySerial,number(s.weekNumber)*7);
const fail=reason=>({ok:false,reason});
const priceFor=g=>g.size==='indie'?16:g.size==='standard'?35:60;
function demand(game,price){const base=priceFor(game),value=Math.max(5,number(price,base));return Math.max(.45,Math.min(1.9,Math.pow(base/value,.92)))}
function forecast(game,price){const factor=demand(game,price);return{price,relativeUnits:Math.round(factor*100),relativeGross:Math.round(factor*price/priceFor(game)*100)}}
function change(gameId,price,store=g.localStorage){price=Number(price);if(!Number.isInteger(price)||price<5||price>90)return fail('INVALID_PRICE');
return industry.transaction('game-price',s=>{const game=s.games.find(x=>String(x.id)===String(gameId));if(!game)return fail('GAME_NOT_FOUND');
if(game.saleEndsDay)return fail('SALE_IN_PROGRESS');
if(day(s)<number(game.lastPriceDay,-100)+14)return fail('PRICE_CHANGE_COOLDOWN');
if(number(game.price)===price)return fail('UNCHANGED_PRICE');
game.originalPrice=number(game.originalPrice,priceFor(game));const previous=game.price;game.price=price;game.lastPriceDay=day(s);
s.history=[{date:s.month+'/'+(s.day||1)+'/'+s.year,text:'Changed '+game.name+' from $'+previous+' to $'+price+'.'},...(s.history||[])].slice(0,60);return{game:game.name,previous,newPrice:price,forecast:forecast(game,price)}},store)}
function discount(gameId,percent,days,store=g.localStorage){percent=Number(percent);days=Number(days);if(![10,20,30,40].includes(percent)||![7,14,28].includes(days))return fail('INVALID_SALE');
return industry.transaction('game-sale',s=>{const game=s.games.find(x=>String(x.id)===String(gameId));if(!game)return fail('GAME_NOT_FOUND');
if(game.saleEndsDay)return fail('SALE_ALREADY_ACTIVE');
if(day(s)<number(game.lastPriceDay,-100)+14)return fail('PRICE_CHANGE_COOLDOWN');
const base=number(game.price,priceFor(game)),offer=Math.max(5,Math.round(base*(1-percent/100)));if(base===offer)return fail('DISCOUNT_TOO_SMALL');
game.originalPrice=number(game.originalPrice,priceFor(game));game.saleRegularPrice=base;game.price=offer;game.saleEndsDay=day(s)+days;game.lastPriceDay=day(s);
s.history=[{date:s.month+'/'+(s.day||1)+'/'+s.year,text:'Started '+percent+'% off sale for '+game.name+' ('+days+' days).'},...(s.history||[])].slice(0,60);
return{game:game.name,price:offer,saleEndsDay:game.saleEndsDay}},store)}
function onDay(s){for(const game of s.games||[]){if(game.saleEndsDay&&day(s)>=game.saleEndsDay){game.price=game.saleRegularPrice||priceFor(game);delete game.saleRegularPrice;delete game.saleEndsDay;
s.history=[{date:s.month+'/'+(s.day||1)+'/'+s.year,text:'Discount ended for '+game.name+'.'},...(s.history||[])].slice(0,60)}}}
const prior=industry.transaction;industry.transaction=function(action,fn,store=g.localStorage){if(action==='daily-simulation')return prior(action,s=>{const r=fn(s);if(r?.ok!==false)onDay(s);return r},store);return prior(action,fn,store)};
g.StudioEmpirePricing24={change,discount,demand,forecast,onDay,priceFor};
})(typeof window!=='undefined'?window:globalThis);