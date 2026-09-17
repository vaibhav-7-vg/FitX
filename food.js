const FOOD_AI_URL="https://fitsync-food-ai.gawalivaibhav883.workers.dev/";
const FOOD_DB=[
["egg",78,6.3,0.6],["banana",105,1.3,3.1],["apple",95,0.5,4.4],["chapati",120,3.5,2.5],
["roti",120,3.5,2.5],["rice",205,4.3,0.6],["dal",180,10,7],["chicken",240,30,0],
["paneer",265,18,0],["milk",120,6,0],["curd",90,5,0],["oats",150,5,4],
["poha",180,4,2.5],["upma",200,5,2.5],["idli",58,2,0.8],["dosa",168,3.9,1.5],
["vada pav",290,7,3],["pizza",285,12,2],["sandwich",250,10,3],["orange",62,1.2,3.1]
];
document.addEventListener("DOMContentLoaded",()=>{
FS.nav("food");
renderFood();
const btn=document.getElementById("analyzeBtn");
if(btn)btn.onclick=analyzeFood;
});
function parseQty(text){
const m=text.match(/(\d+(?:\.\d+)?)\s*(?:x|×)?/i);
return m?Number(m[1]):1;
}
function localFallback(input){
const qty=parseQty(input);
const found=FOOD_DB.find(x=>input.includes(x[0]));
if(!found)return null;
return{
foodName:found[0].replace(/\b\w/g,c=>c.toUpperCase()),
serving:String(qty)+" serving",
calories:Math.round(found[1]*qty),
protein:Math.round(found[2]*qty*10)/10,
carbs:0,
fat:0,
fiber:Math.round(found[3]*qty*10)/10,
confidence:"Low",
note:"Local fallback estimate."
};
}
async function analyzeFood(){
const inputEl=document.getElementById("foodInput");
const resultEl=document.getElementById("foodResult");
const input=inputEl.value.trim();
if(!input){
FS.toast("Tell me what you ate first");
return;
}
const btn=document.getElementById("analyzeBtn");
if(btn){
btn.disabled=true;
btn.textContent="Analyzing...";
}
if(resultEl){
resultEl.innerHTML=`<div class="notice">Analyzing your food with FitSync AI...</div>`;
}
try{
const response=await fetch(FOOD_AI_URL,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({food:input})
});
const result=await response.json();
if(!response.ok||!result.success||!result.data){
throw new Error(result.error||"AI analysis failed");
}
const ai=result.data;
const item={
name:String(ai.foodName||input),
serving:String(ai.serving||"1 serving"),
cal:Math.round(Number(ai.calories)||0),
protein:Math.round((Number(ai.protein)||0)*10)/10,
carbs:Math.round((Number(ai.carbs)||0)*10)/10,
fat:Math.round((Number(ai.fat)||0)*10)/10,
fiber:Math.round((Number(ai.fiber)||0)*10)/10,
confidence:String(ai.confidence||"Medium"),
note:String(ai.note||"Nutrition values are estimated."),
date:FS.dateKey()
};
saveFood(item);
if(resultEl){
resultEl.innerHTML=`<div class="notice"><b class="success">Added:</b> ${escapeHtml(item.name)} — ${item.cal} kcal, ${item.protein} g protein, ${item.carbs} g carbs, ${item.fat} g fat, ${item.fiber} g fiber.<br><small>${escapeHtml(item.note)}</small></div>`;
}
inputEl.value="";
renderFood();
FS.toast("Food analyzed and added");
}catch(error){
console.error(error);
const fallback=localFallback(input);
if(fallback){
const item={
name:fallback.foodName,
serving:fallback.serving,
cal:fallback.calories,
protein:fallback.protein,
carbs:fallback.carbs,
fat:fallback.fat,
fiber:fallback.fiber,
confidence:fallback.confidence,
note:fallback.note,
date:FS.dateKey()
};
saveFood(item);
if(resultEl){
resultEl.innerHTML=`<div class="notice"><b class="success">Added with local estimate:</b> ${escapeHtml(item.name)} × ${parseQty(input)} — ${item.cal} kcal, ${item.protein} g protein, ${item.fiber} g fiber.<br><small>AI was temporarily unavailable.</small></div>`;
}
inputEl.value="";
renderFood();
}else{
if(resultEl){
resultEl.innerHTML=`<div class="notice">AI could not analyze this food right now. Please try again.</div>`;
}
FS.toast("Food AI unavailable");
}
}finally{
if(btn){
btn.disabled=false;
btn.textContent="Analyze Food";
}
}
}
function saveFood(item){
const d=FS.load();
if(!d.today.carbs)d.today.carbs=0;
if(!d.today.fat)d.today.fat=0;
d.foods.push(item);
d.today.calories+=item.cal;
d.today.protein+=item.protein;
d.today.fiber+=item.fiber;
d.today.carbs+=item.carbs;
d.today.fat+=item.fat;
FS.save(d);
}
function escapeHtml(value){
return String(value).replace(/[&<>"']/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"
}[c]));
}
function renderFood(){
const d=FS.load();
document.getElementById("todayCal").textContent=Math.round(d.today.calories);
document.getElementById("todayPro").textContent=Math.round(d.today.protein*10)/10+" g";
document.getElementById("todayFiber").textContent=Math.round(d.today.fiber*10)/10+" g";
const foods=d.foods.filter(f=>f.date===FS.dateKey());
document.getElementById("foodCount").textContent=foods.length;
document.getElementById("foodHistory").innerHTML=foods.length?foods.slice().reverse().map(f=>`<div class="history-item"><b>${escapeHtml(f.name)}</b><span>${f.cal} kcal</span><span>${f.protein}g P</span><span>${f.fiber}g F</span></div>`).join(""):`<div class="history-empty">No foods logged today.</div>`;
}