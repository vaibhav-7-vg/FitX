document.addEventListener("DOMContentLoaded",()=>{
  FS.nav("home"); renderHome();
});
function renderHome(){
  const d=FS.load(), n=d.today, t=d.targets, s=FS.score(d);
  const hr=new Date().getHours();
  document.getElementById("greeting").textContent=hr<12?"Good morning!":hr<17?"Good afternoon!":"Good evening!";
  document.getElementById("score").textContent=s;
  document.getElementById("scoreRing").style.setProperty("--score",s+"%");
  document.getElementById("scoreText").textContent=s>=80?"Excellent work today.":s>=50?"You're making good progress.":"Let's make today count.";
  document.getElementById("cal").textContent=Math.round(n.calories);
  document.getElementById("protein").textContent=Number(n.protein).toFixed(1);
  document.getElementById("steps").textContent=Number(n.steps).toLocaleString();
  document.getElementById("sleep").textContent=Number(n.sleep).toFixed(1).replace(".0","");
  [["cal",n.calories,t.calories],["protein",n.protein,t.protein],["steps",n.steps,t.steps]].forEach(([id,v,target])=>{
    document.getElementById(id+"Bar").style.width=FS.pct(v,target)+"%";
  });
  document.getElementById("calTargetText").textContent=`${Math.round(n.calories)} / ${t.calories} kcal`;
  document.getElementById("proteinTargetText").textContent=`${Math.round(n.protein)} / ${t.protein} g`;
  document.getElementById("stepsTargetText").textContent=`${Number(n.steps).toLocaleString()} / ${Number(t.steps).toLocaleString()}`;
  let advice=n.steps<t.steps?`Add a short walk. You need about ${Math.max(0,t.steps-n.steps).toLocaleString()} more steps to reach today's target.`:
    n.protein<t.protein?`Protein is still below target. Your remaining target is about ${Math.round(t.protein-n.protein)} g.`:
    n.sleep<t.sleep?`Try to protect your sleep tonight. Your current logged sleep is ${n.sleep} h.`:
    "You're on track. Keep your meals, movement and recovery consistent.";
  document.getElementById("advisor").textContent=advice;
}