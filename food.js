const FOOD_DB=[
  ["egg",78,6.3,0.6],["banana",105,1.3,3.1],["apple",95,0.5,4.4],["chapati",120,3.5,2.5],
  ["roti",120,3.5,2.5],["rice",205,4.3,0.6],["dal",180,10,7],["chicken",240,30,0],
  ["paneer",265,18,0],["milk",120,6,0],["curd",90,5,0],["oats",150,5,4],
  ["poha",180,4,2.5],["upma",200,5,2.5],["idli",58,2,0.8],["dosa",168,3.9,1.5],
  ["vada pav",290,7,3],["pizza",285,12,2],["sandwich",250,10,3],["orange",62,1.2,3.1]
];
document.addEventListener("DOMContentLoaded",()=>{FS.nav("food");renderFood();document.getElementById("analyzeBtn").onclick=analyzeFood});
function parseQty(text){const m=text.match(/(\d+(?:\.\d+)?)\s*(?:x|×)?/i);return m?Number(m[1]):1}
function analyzeFood(){
  const input=document.getElementById("foodInput").value.trim().toLowerCase();if(!input){FS.toast("Tell me what you ate first");return}
  const qty=parseQty(input);let found=FOOD_DB.find(x=>input.includes(x[0]));
  if(!found){document.getElementById("foodResult").innerHTML=`<div class="notice">I couldn't confidently recognize that food. Try a common food name and quantity, for example <b>2 eggs and 1 banana</b>.</div>`;return}
  const item={name:found[0].replace(/\b\w/g,c=>c.toUpperCase()),cal:Math.round(found[1]*qty),protein:Math.round(found[2]*qty*10)/10,fiber:Math.round(found[3]*qty*10)/10,date:FS.dateKey()};
  const d=FS.load();d.foods.push(item);d.today.calories+=item.cal;d.today.protein+=item.protein;d.today.fiber+=item.fiber;FS.save(d);
  document.getElementById("foodResult").innerHTML=`<div class="notice"><b class="success">Added:</b> ${item.name} × ${qty} — ${item.cal} kcal, ${item.protein} g protein, ${item.fiber} g fiber.</div>`;
  document.getElementById("foodInput").value="";renderFood();
}
function renderFood(){
  const d=FS.load();document.getElementById("todayCal").textContent=Math.round(d.today.calories);
  document.getElementById("todayPro").textContent=Math.round(d.today.protein*10)/10+" g";
  document.getElementById("todayFiber").textContent=Math.round(d.today.fiber*10)/10+" g";
  const foods=d.foods.filter(f=>f.date===FS.dateKey());document.getElementById("foodCount").textContent=foods.length;
  document.getElementById("foodHistory").innerHTML=foods.length?foods.slice().reverse().map(f=>`<div class="history-item"><b>${f.name}</b><span>${f.cal} kcal</span><span>${f.protein}g P</span><span>${f.fiber}g F</span></div>`).join(""):`<div class="history-empty">No foods logged today.</div>`;
}