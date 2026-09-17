document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
  document.getElementById("saveProfile").onclick = saveProfile;
});
function renderProfile() {
  const d = FS.load(),
    p = d.profile,
    t = d.targets;
  startingWeight.value = p.startingWeight || "";
  height.value = p.height || "";
  goalWeight.value = p.goalWeight || "";
  recCal.textContent = t.calories + " kcal";
  recProtein.textContent = t.protein + " g";
  recSteps.textContent = Number(t.steps).toLocaleString();
  recSleep.textContent = t.sleep + " h";
}
function saveProfile() {
  const d = FS.load();
  d.profile.startingWeight = Number(startingWeight.value) || 75;
  d.profile.height = Number(height.value) || 168;
  d.profile.goalWeight = Number(goalWeight.value) || d.profile.startingWeight;
  d.profile.currentWeight = d.profile.currentWeight || d.profile.startingWeight;
  d.targets = FS.recommend(d.profile);
  FS.save(d);
  renderProfile();
  FS.toast("Profile and targets updated");
}