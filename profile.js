(function(){
"use strict";

const KEY="fitsync_data_v2";

function $(id){return document.getElementById(id);}
function num(id){const e=$(id);const n=e?parseFloat(e.value):0;return Number.isFinite(n)?n:0;}
function text(id,v){const e=$(id);if(e)e.textContent=v;}
function val(id,v){const e=$(id);if(e)e.value=v;}

function getData(){
 try{
  const x=JSON.parse(localStorage.getItem(KEY)||"{}");
  if(!x.targets)x.targets={};
  return x;
 }catch(e){return {targets:{}};}
}

let data=getData();

function recommend(weight,height,goal){
 if(weight<=0||height<=0||goal<=0)
  return {calories:2000,protein:110,steps:8000,sleep:7.5};

 const bmi=weight/Math.pow(height/100,2);
 let calories=22*weight+2*(height-160);
 const diff=goal-weight;

 if(diff<-2)calories-=250;
 else if(diff>2)calories+=200;

 calories=Math.round(Math.max(1400,Math.min(3200,calories)));

 let protein=Math.round(Math.max(70,Math.min(180,goal*1.6)));

 let steps=8000;
 if(bmi>=30)steps=7000;
 else if(bmi>=27)steps=7500;
 else if(bmi>=24)steps=8000;
 else steps=9000;

 if(diff<-5)steps+=500;
 steps=Math.min(12000,steps);

 return {calories,protein,steps,sleep:7.5};
}

function updateRecommendations(){
 let weight=num("startingWeight")||num("weight");
 let height=num("height");
 let goal=num("goalWeight");

 if(weight<=0||height<=0||goal<=0)return;

 const r=recommend(weight,height,goal);

 text("recommendedCalories",r.calories+" kcal");
 text("recommendedProtein",r.protein+" g");
 text("recommendedSteps",r.steps.toLocaleString());
 text("recommendedSleep",r.sleep+" h");

 if($("targetCalories"))val("targetCalories",r.calories);
 if($("targetProtein"))val("targetProtein",r.protein);
 if($("targetSteps"))val("targetSteps",r.steps);
 if($("targetSleep"))val("targetSleep",r.sleep);

 if($("targetCal"))val("targetCal",r.calories);
 if($("proteinTarget"))val("proteinTarget",r.protein);
 if($("stepsTarget"))val("stepsTarget",r.steps);
 if($("sleepTarget"))val("sleepTarget",r.sleep);

 const bmi=weight/Math.pow(height/100,2);
 text("bmiValue",bmi.toFixed(1));

 const diff=weight-goal;
 if($("weightDifference")){
  text("weightDifference",
   diff>0?Math.abs(diff).toFixed(1)+" kg to lose":
   diff<0?Math.abs(diff).toFixed(1)+" kg to gain":
   "Goal weight reached");
 }
}

function saveProfile(){
 const weight=num("startingWeight")||num("weight");
 const height=num("height");
 const goal=num("goalWeight");

 if(weight<=0||height<=0||goal<=0){
  alert("Please enter valid weight, height and goal weight.");
  return;
 }

 const r=recommend(weight,height,goal);

 data.weight=weight;
 data.startingWeight=weight;
 data.height=height;
 data.goalWeight=goal;

 data.targets={
  calories:r.calories,
  protein:r.protein,
  steps:r.steps,
  sleep:r.sleep
 };

 data.targetCal=r.calories;
 data.targetCalories=r.calories;
 data.targetProtein=r.protein;
 data.proteinTarget=r.protein;
 data.targetSteps=r.steps;
 data.stepsTarget=r.steps;
 data.targetSleep=r.sleep;
 data.sleepTarget=r.sleep;

 localStorage.setItem(KEY,JSON.stringify(data));
 updateRecommendations();

 if(typeof window.toast==="function")window.toast("Profile and goals updated ✓");
 else alert("Profile and goals updated ✓");

 window.dispatchEvent(new CustomEvent("fitsyncProfileUpdated",{detail:{weight,height,goalWeight:goal,targets:r}}));
}

function loadProfile(){
 const weight=Number(data.startingWeight||data.weight||75);
 const height=Number(data.height||170);
 const goal=Number(data.goalWeight||65);

 if($("startingWeight"))val("startingWeight",weight);
 if($("weight"))val("weight",weight);
 if($("height"))val("height",height);
 if($("goalWeight"))val("goalWeight",goal);

 updateRecommendations();
}

function init(){
 ["startingWeight","weight","height","goalWeight"].forEach(id=>{
  const e=$(id);
  if(e){
   e.addEventListener("input",updateRecommendations);
   e.addEventListener("change",updateRecommendations);
  }
 });

 ["saveProfile","saveProfileBtn","saveGoals","saveButton"].forEach(id=>{
  const e=$(id);
  if(e)e.addEventListener("click",e=>{e.preventDefault();saveProfile();});
 });

 const form=document.querySelector("form");
 if(form)form.addEventListener("submit",e=>{e.preventDefault();saveProfile();});

 loadProfile();
}

if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",init);
else init();

window.FitXProfile={
 calculateRecommendations:recommend,
 updateRecommendations:updateRecommendations,
 saveProfile:saveProfile,
 loadProfile:loadProfile
};

})();