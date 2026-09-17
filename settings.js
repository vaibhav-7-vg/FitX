document.addEventListener("DOMContentLoaded", () => {
  renderSettings();
  notifications.onclick = () => toggleSetting("notifications");
  reminders.onclick = () => toggleSetting("reminders");
  logout.onclick = logoutUser;
});
function renderSettings() {
  const d = FS.load();
  setSwitch(notifications, d.settings.notifications);
  setSwitch(reminders, d.settings.reminders);
}
function setSwitch(el, on) {
  el.classList.toggle("on", !!on);
}
function toggleSetting(key) {
  const d = FS.load();
  d.settings[key] = !d.settings[key];
  FS.save(d);
  renderSettings();
  FS.toast("Setting updated");
}
function logoutUser() {
  if (confirm("Log out of FitSync?")) {
    localStorage.removeItem(FS.key);
    location.href = "index.html";
  }
}