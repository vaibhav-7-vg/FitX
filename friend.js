import { auth, db } from "./firebase.js";

import {
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  collection,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const FS = window.FS;
const $ = id => document.getElementById(id);

let uid = "";
let myCode = "";


/* ---------- HELPERS ---------- */

function toast(msg) {
  if (FS && FS.toast) FS.toast(msg);
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FS-";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function connectionId(a, b) {
  return [a, b].sort().join("_");
}

function scoreToday(today, targets) {
  const t = today || {};
  const g = targets || {};

  const calories =
    Math.min(100, ((t.calories || 0) / (g.calories || 1)) * 100);

  const protein =
    Math.min(100, ((t.protein || 0) / (g.protein || 1)) * 100);

  const steps =
    Math.min(100, ((t.steps || 0) / (g.steps || 1)) * 100);

  const exercise =
    Math.min(100, ((t.exercise || 0) / 30) * 100);

  const sleep =
    Math.min(100, ((t.sleep || 0) / (g.sleep || 1)) * 100);

  return Math.round(
    (calories + protein + steps + exercise + sleep) / 5
  );
}


/* ---------- START ---------- */

document.addEventListener("DOMContentLoaded", start);

async function start() {
  try {

    const result = await signInAnonymously(auth);
    uid = result.user.uid;

    await prepareUser();

    createExtraUI();

    $("connectBtn").onclick = connectFriend;

    await loadRequests();
    await renderFriend();

  } catch (error) {
    console.error(error);
    $("connectMsg").innerHTML =
      `<div class="notice danger">Firebase error: ${error.message}</div>`;
  }
}


/* ---------- USER ---------- */

async function prepareUser() {

  const d = FS.load();
  const userRef = doc(db, "users", uid);

  const snap = await getDoc(userRef);

  if (snap.exists() && snap.data().friendCode) {

    myCode = snap.data().friendCode;

  } else {

    while (true) {

      const newCode = makeCode();

      const codeSnap =
        await getDoc(doc(db, "friendCodes", newCode));

      if (!codeSnap.exists()) {

        myCode = newCode;

        await setDoc(
          doc(db, "friendCodes", myCode),
          {
            uid: uid
          }
        );

        break;
      }
    }
  }

  await setDoc(
    userRef,
    {
      friendCode: myCode,
      name: d.name || "FitSync User",
      today: d.today || {},
      targets: d.targets || {},
      updatedAt: serverTimestamp()
    },
    {
      merge: true
    }
  );
}


/* ---------- EXTRA UI ---------- */

function createExtraUI() {

  const card = $("connectMsg").closest(".card");

  if (!$("myCodeBox")) {

    const box = document.createElement("div");

    box.id = "myCodeBox";
    box.className = "notice";
    box.style.marginTop = "14px";

    box.innerHTML =
      `<b>Your Friend Code</b>
       <div style="font-size:24px;font-weight:800;margin-top:6px;letter-spacing:2px">
       ${myCode}
       </div>
       <div class="muted" style="margin-top:5px">
       Share this code with your friend.
       </div>`;

    card.appendChild(box);
  }

  if (!$("requestBox")) {

    const box = document.createElement("section");

    box.className = "card section";
    box.id = "requestBox";

    box.innerHTML =
      `<h2 class="card-title">Friend Requests</h2>
       <div id="requestList" class="muted">Checking requests...</div>`;

    document.querySelector("main").appendChild(box);
  }
}


/* ---------- SEND REQUEST ---------- */

async function connectFriend() {

  const input = $("friendCode").value.trim().toUpperCase();

  if (!input) {
    toast("Enter a friend code");
    return;
  }

  if (input === myCode) {
    toast("You cannot connect with yourself");
    return;
  }

  try {

    $("connectMsg").innerHTML =
      `<div class="notice">Searching for friend...</div>`;

    const codeSnap =
      await getDoc(doc(db, "friendCodes", input));

    if (!codeSnap.exists()) {

      $("connectMsg").innerHTML =
        `<div class="notice danger">Friend code not found.</div>`;

      return;
    }

    const friendUid = codeSnap.data().uid;

    if (friendUid === uid) {
      toast("You cannot connect with yourself");
      return;
    }

    const connectionSnap =
      await getDoc(
        doc(db, "connections", connectionId(uid, friendUid))
      );

    if (connectionSnap.exists()) {

      $("connectMsg").innerHTML =
        `<div class="notice">
        <span class="success">Already connected.</span>
        </div>`;

      await renderFriend();
      return;
    }

    const requestId = uid + "_" + friendUid;

    const requestRef =
      doc(db, "friendRequests", requestId);

    const oldRequest = await getDoc(requestRef);

    if (
      oldRequest.exists() &&
      oldRequest.data().status === "pending"
    ) {

      $("connectMsg").innerHTML =
        `<div class="notice">
        Friend request already sent.
        </div>`;

      return;
    }

    const d = FS.load();

    await setDoc(
      requestRef,
      {
        fromUid: uid,
        toUid: friendUid,
        fromCode: myCode,
        fromName: d.name || "FitSync User",
        status: "pending",
        createdAt: serverTimestamp()
      }
    );

    $("connectMsg").innerHTML =
      `<div class="notice">
      <span class="success">Friend request sent.</span>
      </div>`;

    toast("Request sent");

  } catch (error) {

    console.error(error);

    $("connectMsg").innerHTML =
      `<div class="notice danger">${error.message}</div>`;
  }
}


/* ---------- REQUESTS ---------- */

async function loadRequests() {

  const list = $("requestList");

  if (!list) return;

  try {

    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", uid),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);

    if (snap.empty) {

      list.innerHTML =
        `<div class="muted">No pending friend requests.</div>`;

      return;
    }

    list.innerHTML = "";

    snap.forEach(item => {

      const data = item.data();

      const row = document.createElement("div");

      row.className = "notice";
      row.style.marginBottom = "10px";

      row.innerHTML =
        `<div>
          <b>${data.fromName || "FitSync User"}</b>
          <div class="muted">Code: ${data.fromCode || "—"}</div>
        </div>`;

      const accept = document.createElement("button");

      accept.className = "btn";
      accept.textContent = "Accept";
      accept.style.marginTop = "10px";

      accept.onclick = () =>
        acceptRequest(item.id, data.fromUid);

      row.appendChild(accept);
      list.appendChild(row);
    });

  } catch (error) {

    console.error(error);

    list.innerHTML =
      `<div class="notice danger">${error.message}</div>`;
  }
}


/* ---------- ACCEPT ---------- */

async function acceptRequest(requestId, friendUid) {

  try {

    await updateDoc(
      doc(db, "friendRequests", requestId),
      {
        status: "accepted",
        respondedAt: serverTimestamp()
      }
    );

    await setDoc(
      doc(db, "connections", connectionId(uid, friendUid)),
      {
        users: [uid, friendUid],
        createdAt: serverTimestamp()
      }
    );

    toast("Friend connected");

    await loadRequests();
    await renderFriend();

  } catch (error) {

    console.error(error);
    toast("Could not accept request");
    console.error(error);
  }
}


/* ---------- COMPARISON ---------- */

async function renderFriend() {

  const d = FS.load();

  const my = scoreToday(
    d.today,
    d.targets
  );

  const connections = await getDocs(
    query(
      collection(db, "connections"),
      where("users", "array-contains", uid)
    )
  );

  if (connections.empty) {

    $("myScore").textContent = my;
    $("friendScore").textContent = 0;

    $("myScore").style.color = "";
    $("friendScore").style.color = "";

    $("winnerText").className = "badge gray";
    $("winnerText").textContent =
      "Connect a friend to compare";

    $("compareTable").innerHTML =
      `<tr>
        <td colspan="4" class="muted">
        Friend data will appear after connection.
        </td>
      </tr>`;

    return;
  }

  const connection = connections.docs[0].data();

  const friendUid =
    connection.users.find(id => id !== uid);

  if (!friendUid) return;

  const friendSnap =
    await getDoc(doc(db, "users", friendUid));

  if (!friendSnap.exists()) return;

  const friend = friendSnap.data();

  /* Update our latest data */

  await setDoc(
    doc(db, "users", uid),
    {
      today: d.today || {},
      targets: d.targets || {},
      updatedAt: serverTimestamp()
    },
    {
      merge: true
    }
  );

  const friendToday = friend.today || {};
  const friendTargets = friend.targets || d.targets;

  const friendScore =
    scoreToday(friendToday, friendTargets);

  $("myScore").textContent = my;
  $("friendScore").textContent = friendScore;

  /* Higher score = green, lower score = red */

  if (my > friendScore) {

    $("myScore").style.color = "#22d66b";
    $("friendScore").style.color = "#ff5c5c";

    $("winnerText").className = "badge green";
    $("winnerText").textContent =
      "Your points are higher";

  } else if (friendScore > my) {

    $("myScore").style.color = "#ff5c5c";
    $("friendScore").style.color = "#22d66b";

    $("winnerText").className = "badge red";
    $("winnerText").textContent =
      "Friend's points are higher";

  } else {

    $("myScore").style.color = "";
    $("friendScore").style.color = "";

    $("winnerText").className = "badge gray";
    $("winnerText").textContent =
      "Points are equal";
  }


  const rows = [

    [
      "Health score",
      my,
      friendScore
    ],

    [
      "Calories",
      Math.round(d.today.calories || 0),
      Math.round(friendToday.calories || 0)
    ],

    [
      "Protein (g)",
      Math.round(d.today.protein || 0),
      Math.round(friendToday.protein || 0)
    ],

    [
      "Fiber (g)",
      Math.round(d.today.fiber || 0),
      Math.round(friendToday.fiber || 0)
    ],

    [
      "Steps",
      Math.round(d.today.steps || 0),
      Math.round(friendToday.steps || 0)
    ],

    [
      "Exercise (min)",
      Math.round(d.today.exercise || 0),
      Math.round(friendToday.exercise || 0)
    ],

    [
      "Sleep (h)",
      Number(d.today.sleep || 0),
      Number(friendToday.sleep || 0)
    ]

  ];


  $("compareTable").innerHTML =
    rows.map(row => {

      const diff =
        Math.round((row[1] - row[2]) * 10) / 10;

      const cls =
        diff > 0
          ? "success"
          : diff < 0
          ? "danger"
          : "muted";

      return `
        <tr>
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td class="${cls}">
            ${diff > 0 ? "+" : ""}${diff}
          </td>
        </tr>
      `;

    }).join("");
}