const FS = {
  key: "fitsync_data_v2",
  defaults: {
    profile: {
      startingWeight: 75,
      height: 168,
      currentWeight: 75,
      goalWeight: 68,
    },
    targets: { calories: 1950, protein: 120, steps: 8000, sleep: 8 },
    today: {
      calories: 0,
      protein: 0,
      fiber: 0,
      steps: 0,
      exercise: 0,
      sleep: 0,
    },
    foods: [],
    activityHistory: [],
    friend: { connected: false, code: "", name: "Friend", today: {} },
    settings: { notifications: true, reminders: true },
  },
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return structuredClone(this.defaults);
      const d = JSON.parse(raw);
      return {
        ...structuredClone(this.defaults),
        ...d,
        profile: { ...this.defaults.profile, ...(d.profile || {}) },
        targets: { ...this.defaults.targets, ...(d.targets || {}) },
        today: { ...this.defaults.today, ...(d.today || {}) },
        settings: { ...this.defaults.settings, ...(d.settings || {}) },
        foods: d.foods || [],
        activityHistory: d.activityHistory || [],
        friend: { ...this.defaults.friend, ...(d.friend || {}) },
      };
    } catch (e) {
      return structuredClone(this.defaults);
    }
  },
  save(d) {
    localStorage.setItem(this.key, JSON.stringify(d));
  },
  dateKey(date = new Date()) {
    const x = new Date(date);
    return x.toISOString().slice(0, 10);
  },
  formatDate(key) {
    const d = new Date(key + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  },
  score(d) {
    const t = d.targets,
      n = d.today;
    const cal = n.calories ? Math.min(100, (n.calories / t.calories) * 100) : 0;
    const pro = Math.min(100, (n.protein / t.protein) * 100);
    const steps = Math.min(100, (n.steps / t.steps) * 100);
    const ex = Math.min(100, (n.exercise / 30) * 100);
    const sleep = Math.min(100, (n.sleep / t.sleep) * 100);
    return Math.round((cal + pro + steps + ex + sleep) / 5);
  },
  pct(v, t) {
    return Math.max(0, Math.min(100, (v / t) * 100));
  },
  recommend(profile) {
    const w = Number(profile.startingWeight) || 70,
      h = Number(profile.height) || 168;
    const goal = Number(profile.goalWeight) || w;
    // Simple non-medical baseline recommendations for a prototype.
    const bmi = h ? w / (h / 100) ** 2 : 22;
    let calories = Math.round(Math.max(1400, w * 26 + (goal < w ? -200 : 100)));
    let protein = Math.round(Math.max(70, w * 1.6));
    let steps = goal < w ? 8500 : 8000;
    let sleep = 8;
    if (goal > w) calories += 250;
    return { calories, protein, steps, sleep, bmi: Math.round(bmi * 10) / 10 };
  },
  toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(this._toast);
    this._toast = setTimeout(() => t.classList.remove("show"), 1800);
  },
  nav(active) {
    const map = {
      home: "index.html",
      food: "food.html",
      activity: "activity.html",
      friend: "friend.html",
      progress: "progress.html",
    };
    const icons = {
      home: '<svg class="nav-svg" viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8"/><path d="M9.5 21v-6h5v6"/></svg>',
      food: '<svg class="nav-svg" viewBox="0 0 24 24"><path d="M5 3v8"/><path d="M3 3v5a2 2 0 0 0 4 0V3"/><path d="M5 10v11"/><path d="M15 3v18"/><path d="M15 3c4 2 4 7 0 9"/></svg>',
      activity:
        '<svg class="nav-svg" viewBox="0 0 24 24"><path d="M13 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="m12 7 3 3 3-1 2 2"/><path d="m12 7-2 5-4 1"/><path d="m10 12 4 3-2 6"/><path d="m14 15 5 2"/></svg>',
      friend:
        '<svg class="nav-svg" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5"/><path d="M14 15.5c3-.4 5.5 1.2 6 4.5"/></svg>',
      progress:
        '<svg class="nav-svg" viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 3-4 3 2 5-7"/></svg>',
    };
    const el = document.createElement("nav");
    el.className = "bottom-nav";
    el.innerHTML = Object.keys(map)
      .map(
        (k) =>
          `<a class="nav-item ${k === active ? "active" : ""}" href="${ map[k] }">${icons[k]}<span>${k[0].toUpperCase() + k.slice(1)}</span></a>`
      )
      .join("");
    document.body.appendChild(el);
  },
  header() {
    const h = document.createElement("header");
    h.className = "topbar";
    h.innerHTML = `<a class="brand" href="index.html"><div class="brand-icon">F</div><div><div class="brand-name">FitSync</div><div class="brand-tag">Track yourself. Improve together.</div></div></a>
      <div class="header-actions"><a class="icon-btn" href="profile.html" aria-label="Profile" title="Profile"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/></svg></a>
      <a class="icon-btn" href="settings.html" aria-label="Settings" title="Settings"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/></svg></a></div>`;
    document.body.prepend(h);
  },
};
document.addEventListener("DOMContentLoaded", () => {
  FS.header();
});