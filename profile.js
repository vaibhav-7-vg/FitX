(function(){
"use strict";
const KEY="fitsync_data_v2";
const $=id=>document.getElementById(id);
const n=id=>parseFloat($(id)?.value)||0;

function calc(w,h,g){
 const bmi=w/Math.pow(h/100,2);
 let cal=22*w+2*(h-160);
 if(g<w-2)cal-=250;
 else if(g>w+2)cal+=200;
 cal=Math.round(Math.max(1400,Math.min(3200,cal)));
 let protein=Math.round(Math.max(70,Math.min(180,g*1.6)));
 let steps=bmi>=30?7000:bmi>=27?7500:bmi>=24?8000:9000;
 if(g<w-5)steps+=500;
 return {cal,protein,steps:Math.min(12000,steps),sleep:7.5,bmi};
}

function update(){
 const w=n("startingWeight"),h=n("height"),g=n("goalWeight");
 if(!w||!h||!g)return;
 const r=calc(w,h,g);
 $("recCal").textContent=r.cal+" kcal";
 $("recProtein").textContent=r.protein+" g";
 $("recSteps").textContent=r.steps.toLocaleString();
 $("recSleep").textContent=r.sleep+" h";
}

function save(){
 const w=n("startingWeight"),h=n("height"),g=n("goalWeight");
 if(!w||!h||!g){alert("Please enter valid weight, height and goal weight.");return;}
 const r=calc(w,h,g);
 let d={};
 try{d=JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){}
 d.startingWeight=w;
 d.weight=w;
 d.height=h;
 d.goalWeight=g;
 d.targets={calories:r.cal,protein:r.protein,steps:r.steps,sleep:r.sleep};
 localStorage.setItem(KEY,JSON.stringify(d));
 update();
 alert("Profile and daily targets saved!");
}

function load(){
 let d={};
 try{d=JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){}
 if(d.startingWeight||d.weight)$("startingWeight").value=d.startingWeight||d.weight;
 if(d.height)$("height").value=d.height;
 if(d.goalWeight)$("goalWeight").value=d.goalWeight;
 update();
}

document.addEventListener("DOMContentLoaded",function(){
 ["startingWeight","height","goalWeight"].forEach(id=>{
  $(id).addEventListener("input",update);
  $(id).addEventListener("change",update);
 });
 $("saveProfile").addEventListener("click",save);
 load();
});

})();