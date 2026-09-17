document.addEventListener("DOMContentLoaded", () => {
  FS.nav("friend");
  renderFriend();
  connectBtn.onclick = connectFriend;
});
function connectFriend() {
  const code = friendCode.value.trim();
  if (!code) {
    FS.toast("Enter a friend code");
    return;
  }
  const d = FS.load();
  d.friend.connected = true;
  d.friend.code = code;
  d.friend.name = "Friend";
  // Local prototype friend data; replace with Supabase/Realtime data when backend is connected.
  d.friend.today =
    d.friend.today && Object.keys(d.friend.today).length
      ? d.friend.today
      : {
          calories: 1800,
          protein: 105,
          fiber: 24,
          steps: 7840,
          exercise: 35,
          sleep: 7.5,
        };
  FS.save(d);
  connectMsg.innerHTML = `<div class="notice"><span class="success">Connected.</span> Comparison is ready.</div>`;
  renderFriend();
  FS.toast("Friend connected");
}
function renderFriend() {
  const d = FS.load(),
    n = d.today,
    f = d.friend.today || {},
    my = FS.score(d);
  myScore.textContent = my;
  friendScore.textContent = d.friend.connected ? friendPoints(d) : 0;
  if (!d.friend.connected) {
    compareHero.classList.remove("low");
    winnerText.className = "badge gray";
    winnerText.textContent = "Connect a friend to compare";
    compareTable.innerHTML = `<tr><td colspan="4" class="muted">Friend data will appear after connection.</td></tr>`;
    return;
  }
  const fs = friendPoints(d);
  compareHero.classList.toggle("low", fs > my);
  winnerText.className =
    "badge " + (my > fs ? "green" : my < fs ? "red" : "gray");
  winnerText.textContent =
    my > fs
      ? "Your points are higher"
      : my < fs
      ? "Friend's points are higher"
      : "Points are equal";
  const rows = [
    ["Health score", my, fs],
    ["Calories", Math.round(n.calories), Math.round(f.calories || 0)],
    ["Protein (g)", Math.round(n.protein), Math.round(f.protein || 0)],
    ["Fiber (g)", Math.round(n.fiber), Math.round(f.fiber || 0)],
    ["Steps", n.steps, f.steps || 0],
    ["Exercise (min)", n.exercise, f.exercise || 0],
    ["Sleep (h)", n.sleep, f.sleep || 0],
  ];
  compareTable.innerHTML = rows
    .map(
      (r) =>
        `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="${ r[1] >= r[2] ? "success" : "danger" }">${r[1] >= r[2] ? "+" : ""}${ Math.round((r[1] - r[2]) * 10) / 10 }</td></tr>`
    )
    .join("");
}
function friendPoints(d) {
  const f = d.friend.today || {},
    t = d.targets;
  return Math.round(
    (Math.min(100, ((f.calories || 0) / t.calories) * 100) +
      Math.min(100, ((f.protein || 0) / t.protein) * 100) +
      Math.min(100, ((f.steps || 0) / t.steps) * 100) +
      Math.min(100, ((f.exercise || 0) / 30) * 100) +
      Math.min(100, ((f.sleep || 0) / t.sleep) * 100)) /
      5
  );
}