document.addEventListener("DOMContentLoaded",()=>{FS.nav("activity");loadActivity();document.getElementById("saveActivity").onclick=saveActivity});
function loadActivity(){const d=FS.load();stepsInput.value=d.today.steps||"";exerciseInput.value=d.today.exercise||"";sleepInput.value=d.today.sleep||"";renderActivity()}
function saveActivity(){
  const d=FS.load(), old=d.activityHistory.find(x=>x.date===FS.dateKey());
  d.today.steps=Number(stepsInput.value)||0;d.today.exercise=Number(exerciseInput.value)||0;d.today.sleep=Number(sleepInput.value)||0;
  const entry={date:FS.dateKey(),steps:d.today.steps,exercise:d.today.exercise,sleep:d.today.sleep,score:FS.score(d)};
  if(old)Object.assign(old,entry);else d.activityHistory.push(entry);
  d.activityHistory.sort((a,b)=>b.date.localeCompare(a.date));FS.save(d);renderActivity();FS.toast("Activity saved");
}
function renderActivity(){
  const d=FS.load(),n=d.today;sumSteps.textContent=n.steps.toLocaleString();sumExercise.textContent=n.exercise+"m";sumSleep.textContent=n.sleep+"h";sumScore.textContent=FS.score(d);
  const rows=d.activityHistory.slice().sort((a,b)=>b.date.localeCompare(a.date));
  activityHistory.innerHTML=rows.length?`<div class="history-item history-head"><span>Date</span><span>Steps</span><span>Exercise</span><span>Sleep</span></div>`+rows.map(x=>`<div class="history-item"><b>${x.date===FS.dateKey()?"Today":FS.formatDate(x.date)}</b><span>${Number(x.steps).toLocaleString()}</span><span>${x.exercise}m</span><span>${x.sleep}h</span></div>`).join(""):`<div class="history-empty">Your saved activity will appear here with date.</div>`;
}