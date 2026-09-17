import {auth,db} from "./firebase.js";
import {signInAnonymously} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $=id=>document.getElementById(id);
let uid="",myCode="";

function makeCode(){
 return "FS-"+Math.random().toString(36).substring(2,8).toUpperCase();
}

async function start(){
 try{
  const r=await signInAnonymously(auth);
  uid=r.user.uid;

  const ref=doc(db,"users",uid);
  const snap=await getDoc(ref);

  if(snap.exists()){
   myCode=snap.data().friendCode;
  }else{
   myCode=makeCode();
   await setDoc(ref,{friendCode:myCode,createdAt:Date.now()});
  }

  showCode();
 }catch(e){
  console.error(e);
  $("connectMsg").innerHTML='<div class="notice danger">Firebase error: '+e.message+'</div>';
 }
}

function showCode(){
 const box=document.createElement("div");
 box.className="notice";
 box.style.marginTop="12px";
 box.innerHTML="<b>Your Friend Code</b><br><strong>"+myCode+"</strong><br><small>Share this code with your friend.</small>";
 $("connectMsg").before(box);
}

async function connectFriend(){
 const code=$("friendCode").value.trim().toUpperCase();
 if(!code){$("connectMsg").innerHTML='<div class="notice">Enter a friend code.</div>';return;}
 if(code===myCode){$("connectMsg").innerHTML='<div class="notice danger">You cannot connect with yourself.</div>';return;}

 try{
  const q=await getDoc(doc(db,"users",code));
  if(!q.exists()){
   $("connectMsg").innerHTML='<div class="notice danger">Friend code not found.</div>';
   return;
  }
 }catch(e){
  console.error(e);
  $("connectMsg").innerHTML='<div class="notice danger">Connection error.</div>';
 }
}

document.addEventListener("DOMContentLoaded",()=>{
 $("connectBtn").onclick=connectFriend;
 start();
});