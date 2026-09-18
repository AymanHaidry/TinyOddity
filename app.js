/* =========================================================
   TINYODDITY v2.0 — APPLICATION ENGINE
   Performance-First · Poetic · Production-Ready
   ========================================================= */

/* -------------------- STATE MANAGEMENT -------------------- */
const STORAGE_KEY = 'tinyoddity_v2';
const SCHEMA_VERSION = '2.0.0';

function getDefaultState() {
  return {
    schema: SCHEMA_VERSION,
    tasks: [],
    inventory: {},
    universe: [],
    profile: {
      name: 'Explorer',
      universeName: 'The Microverse',
      bio: 'Building a universe, one task at a time.',
      accent: '#65e9ff'
    },
    settings: {
      sound: false,
      glow: true,
      sync: true,
      lite: false,
      verified: false
    },
    handle: '',
    banner: null,
    pfp: null,
    stats: {
      tasksCompleted: 0,
      totalStudyTime: 0,
      discoveries: 0,
      lastLogin: Date.now()
    },
    discovered: [],
    taskTimers: {},
    taskStartTimes: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const data = JSON.parse(raw);
    if (data.schema !== SCHEMA_VERSION) return migrateState(data);
    return { ...getDefaultState(), ...data };
  } catch (e) {
    console.error('State load failed:', e);
    return getDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, schema: SCHEMA_VERSION }));
  } catch (e) {
    app.toast('Storage full — archive your universe!', 'warning');
  }
}

function migrateState(old) {
  const fresh = getDefaultState();
  if (old.tasks) fresh.tasks = old.tasks;
  if (old.inventory) fresh.inventory = old.inventory;
  if (old.universe) fresh.universe = old.universe;
  if (old.profile) fresh.profile = { ...fresh.profile, ...old.profile };
  if (old.settings) fresh.settings = { ...fresh.settings, ...old.settings };
  if (old.stats) fresh.stats = { ...fresh.stats, ...old.stats };
  if (old.discovered) fresh.discovered = old.discovered;
  // Ensure new fields exist
  if (!fresh.profile.handle) fresh.profile.handle = '';
  if (fresh.settings.lite === undefined) fresh.settings.lite = false;
  if (fresh.settings.verified === undefined) fresh.settings.verified = false;
  return fresh;
}

let state = loadState();

/* -------------------- UTILITIES -------------------- */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getRarityColor(rarity) {
  const r = ITEMS_DB.rarities.find(r => r.id === rarity);
  return r ? r.color : '#a7afc1';
}

function getCategory(id) {
  return ITEMS_DB.categories.find(c => c.id === id);
}

function getItem(id) {
  return ITEMS_DB.items.find(i => i.id === id);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getMinTime(difficulty) {
  return { easy: 60, medium: 300, hard: 600 }[difficulty] || 300;
}

function throttle(fn, wait) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn(...args); }
  };
}

/* -------------------- COSMIC SOUND ENGINE -------------------- */
const cosmicSounds = {
  ctx: null,
  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  },
  ensure() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  },
  playTone(freq, duration, type = 'sine', gain = 0.06) {
    this.ensure();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + duration);
  },
  discovery() {
    this.ensure();
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this.playTone(f, 0.35, 'sine', 0.08), i * 100));
    setTimeout(() => this.playTone(523, 1, 'triangle', 0.03), 450);
  },
  complete() {
    this.ensure();
    this.playTone(440, 0.12, 'sine', 0.04);
    setTimeout(() => this.playTone(554, 0.12, 'sine', 0.04), 80);
    setTimeout(() => this.playTone(659, 0.25, 'sine', 0.06), 160);
  },
  click() { this.playTone(1200, 0.04, 'sine', 0.02); }
};

/* -------------------- ROUTER -------------------- */
const router = {
  currentPage: 'home',
  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Page-specific renders
    if (page === 'home') app.refreshHome();
    if (page === 'study') app.refreshStudy();
    if (page === 'collection') collection.render();
    if (page === 'universe') universe.render();
    if (page === 'discover') discoverPage.render();
    if (page === 'profile') app.refreshProfile();
  }
};

/* -------------------- APP CORE -------------------- */
const app = {
  init() {
    this.setupGreeting();
    this.setupOfflineDetection();
    this.setupRipple();
    this.setupAmbient();
    this.refreshHome();
    this.refreshStudy();
    this.setupFooter();
    starfield.init();

    // Check auth — show onboarding if user hasn't set up profile
    this.checkAuth();

    // Hide preloader
    setTimeout(() => {
      const p = document.getElementById('preloader');
      if (p) p.classList.add('hidden');
    }, 1400);

    // Update greeting every minute
    setInterval(() => this.setupGreeting(), 60000);
  },

  /* ---- Auth / Onboarding ---- */
  checkAuth() {
    // If profile is still default (no name set), show auth modal
    if (!state.profile.name || state.profile.name === 'Explorer') {
      this.showAuthModal();
    }
  },

  showAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.add('active');
    // Default accent
    this._authAccent = '#65e9ff';
    this.updateAuthAccentPicker();
  },

  hideAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.remove('active');
  },

  setAuthAccent(color) {
    this._authAccent = color;
    this.updateAuthAccentPicker();
  },

  updateAuthAccentPicker() {
    document.querySelectorAll('.auth-accent-picker button').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.accent === this._authAccent);
    });
  },

  completeAuth(e) {
    e.preventDefault();
    const name = document.getElementById('auth-name').value.trim();
    const handle = document.getElementById('auth-handle').value.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    const universeName = document.getElementById('auth-universe').value.trim();
    const bio = document.getElementById('auth-bio').value.trim();

    if (!name || !handle || !universeName) {
      app.toast('Name, handle, and universe are required', 'warning');
      return;
    }

    state.profile.name = name;
    state.profile.handle = handle;
    state.profile.universeName = universeName;
    state.profile.bio = bio || 'Building a universe, one task at a time.';
    state.profile.accent = this._authAccent || '#65e9ff';
    saveState();

    this.hideAuthModal();
    this.refreshProfile();
    this.setupGreeting();
    this.toast('Welcome to the cosmos, ' + name, 'success');
  },

  setupGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    const el = document.getElementById('greeting');
    const sub = document.getElementById('greeting-sub');
    const whisper = document.getElementById('cosmic-whisper');

    if (el) el.textContent = `${greeting}, ${state.profile.name}`;

    const tasks = state.tasks.filter(t => !t.completed).length;
    if (sub) {
      if (tasks === 0) sub.textContent = randomPoem('empty.tasks') || 'All missions complete. The cosmos awaits.';
      else if (tasks === 1) sub.textContent = '1 mission remains. Complete it to discover something.';
      else sub.textContent = `${tasks} missions waiting. Your attention builds worlds.`;
    }
    if (whisper) whisper.textContent = randomPoem('greetings');
  },

  setupOfflineDetection() {
    const badge = document.getElementById('offlineBadge');
    const update = () => {
      if (!navigator.onLine) badge?.classList.add('visible');
      else badge?.classList.remove('visible');
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  },

  setupRipple() {
    const container = document.getElementById('rippleContainer');
    if (!container) return;
    const createRipple = (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple-wave';
      const size = 60 + Math.random() * 80;
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      const hue = 180 + Math.random() * 60;
      ripple.style.background = `radial-gradient(circle, hsla(${hue},90%,70%,.2) 0%, transparent 70%)`;
      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    };
    document.addEventListener('click', createRipple);
  },

  setupAmbient() {
    if (state.settings.sound) cosmicSounds.discovery();
  },

  setupFooter() {
    const track = document.getElementById('footerTrack');
    if (!track) return;
    const items = ITEMS_DB.items;
    const doubled = [...items, ...items, ...items, ...items];
    track.innerHTML = doubled.map(item => {
      const color = getRarityColor(item.rarity);
      return `<div class="footer-item" title="${escapeHtml(item.lore)}" onclick="app.openItemDetail('${item.id}')">
        <i class="bi ${item.icon}" style="color:${color};"></i>
        <span style="color:${color}60;">${escapeHtml(item.name)}</span>
      </div>`;
    }).join('');
  },

  /* ---- Tasks ---- */
  openAddTaskModal() {
    document.getElementById('modal-add-task')?.classList.add('active');
    document.getElementById('task-title')?.focus();
  },

  closeAddTaskModal() {
    document.getElementById('modal-add-task')?.classList.remove('active');
    document.getElementById('task-title').value = '';
    document.getElementById('task-subject').value = '';
    document.getElementById('task-time').value = '30';
    document.getElementById('task-due').value = '';
  },

  submitTask(e) {
    e.preventDefault();
    const task = {
      id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: document.getElementById('task-title').value.trim(),
      subject: document.getElementById('task-subject').value.trim() || 'General',
      difficulty: document.getElementById('task-difficulty').value,
      estimatedTime: parseInt(document.getElementById('task-time').value) || 30,
      dueDate: document.getElementById('task-due').value,
      category: document.getElementById('task-category').value,
      completed: false,
      createdAt: Date.now()
    };
    state.tasks.unshift(task);
    state.taskTimers[task.id] = getMinTime(task.difficulty);
    state.taskStartTimes[task.id] = Date.now();
    saveState();
    this.closeAddTaskModal();
    this.refreshStudy();
    this.refreshHome();
    this.toast(randomPoem('toast.taskCreated'), 'info');
  },

  toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      const elapsed = Math.floor((Date.now() - (state.taskStartTimes[taskId] || Date.now())) / 1000);
      const minTime = state.taskTimers[taskId] || getMinTime(task.difficulty);
      if (elapsed < minTime) {
        this.toast(randomPoem('task.minTime')(formatTime(minTime - elapsed)) || `Need ${formatTime(minTime - elapsed)} more focus`, 'warning');
        cosmicSounds.click();
        return;
      }
    }

    task.completed = !task.completed;

    if (task.completed) {
      cosmicSounds.complete();
      state.stats.tasksCompleted++;
      state.stats.totalStudyTime += task.estimatedTime || 30;
      saveState();
      this.refreshStudy();
      this.refreshHome();

      setTimeout(() => {
        const item = rewardEngine.roll(task.difficulty);
        if (item) {
          discovery.show(item);
          this.addToInventory(item);
          state.stats.discoveries++;
          state.discovered.unshift({ itemId: item.id, timestamp: Date.now() });
          saveState();
        }
      }, 350);
    } else {
      saveState();
      this.refreshStudy();
      this.refreshHome();
    }
  },

  deleteTask(taskId) {
    if (!confirm('Delete this mission?')) return;
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveState();
    this.refreshStudy();
    this.refreshHome();
    this.toast(randomPoem('toast.taskDeleted'), 'info');
  },

  clearCompleted() {
    const completed = state.tasks.filter(t => t.completed);
    if (completed.length === 0) return;
    if (!confirm(`Clear ${completed.length} completed missions?`)) return;
    state.tasks = state.tasks.filter(t => !t.completed);
    saveState();
    this.refreshStudy();
    this.toast(randomPoem('toast.taskDeleted'), 'info');
  },

  refreshStudy() {
    const list = document.getElementById('task-list');
    const stats = document.getElementById('task-stats');
    if (!list) return;

    const pending = state.tasks.filter(t => !t.completed);
    const completed = state.tasks.filter(t => t.completed);
    const all = [...pending, ...completed];

    if (stats) stats.textContent = `${state.tasks.length} missions · ${completed.length} completed`;

    if (all.length === 0) {
      list.innerHTML = `<div class="task-empty glass">${randomPoem('empty.tasks')}</div>`;
      return;
    }

    list.innerHTML = all.map(task => {
      const elapsed = Math.floor((Date.now() - (state.taskStartTimes[task.id] || Date.now())) / 1000);
      const minTime = state.taskTimers[task.id] || getMinTime(task.difficulty);
      const remaining = Math.max(0, minTime - elapsed);
      const timerHtml = !task.completed && remaining > 0
        ? `<span class="task-timer"><i class="bi bi-hourglass-split"></i> ${formatTime(remaining)}</span>`
        : '';
      return `<div class="task-item glass ${task.completed ? 'completed' : ''}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="event.stopPropagation(); app.toggleTask('${task.id}')">
          ${task.completed ? '<i class="bi bi-check-lg"></i>' : ''}
        </div>
        <div class="task-content" onclick="app.toggleTask('${task.id}')">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span><i class="bi bi-book"></i> ${escapeHtml(task.subject)}</span>
            <span><i class="bi bi-clock"></i> ${task.estimatedTime}m</span>
            ${task.dueDate ? `<span><i class="bi bi-calendar"></i> ${task.dueDate}</span>` : ''}
            ${timerHtml}
          </div>
        </div>
        <span class="task-difficulty diff-${task.difficulty}">${task.difficulty}</span>
        <div class="task-actions">
          <button class="btn-danger" onclick="event.stopPropagation(); app.deleteTask('${task.id}')"><i class="bi bi-trash3"></i></button>
        </div>
      </div>`;
    }).join('');
  },

  refreshHome() {
    const pending = state.tasks.filter(t => !t.completed).slice(0, 3);
    const preview = document.getElementById('home-tasks-preview');
    const taskCount = document.getElementById('home-task-count');

    if (taskCount) taskCount.textContent = pending.length;

    if (pending.length === 0) {
      if (preview) preview.innerHTML = `<div class="empty-poem">${randomPoem('empty.tasks')}</div>`;
    } else if (preview) {
      preview.innerHTML = pending.map(t => `
        <div class="task-preview-item" onclick="router.navigate('study')">
          <div class="task-checkbox" style="flex-shrink:0;"></div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(t.title)}</div>
            <div style="font-size:11px;color:var(--faint);font-family:var(--font-mono);">${escapeHtml(t.subject)} · ${t.estimatedTime}m</div>
          </div>
        </div>
      `).join('');
    }

    const totalItems = Object.values(state.inventory).reduce((a, b) => a + b, 0);
    const universeCount = document.getElementById('home-universe-count');
    const discoveryCount = document.getElementById('home-discovery-count');
    if (universeCount) universeCount.textContent = totalItems;
    if (discoveryCount) discoveryCount.textContent = state.stats.discoveries;

    const latest = state.discovered[0];
    const latestEl = document.getElementById('home-latest-discovery');
    if (latest && latestEl) {
      const item = getItem(latest.itemId);
      if (item) {
        const color = getRarityColor(item.rarity);
        latestEl.innerHTML = `
          <div style="font-size:44px;color:${color};"><i class="bi ${item.icon}"></i></div>
          <div>
            <div style="font-size:17px;font-weight:600;margin-bottom:4px;">${escapeHtml(item.name)}</div>
            <div style="font-size:12px;color:var(--faint);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em;">
              <span style="color:${color}">${item.rarity}</span> · ${item.category}
            </div>
          </div>
        `;
      }
    }
  },

  refreshProfile() {
    const nameEl = document.getElementById('profile-name');
    const uniEl = document.getElementById('profile-universe-name');
    const bioEl = document.getElementById('profile-bio');
    const avatarEl = document.getElementById('profile-avatar');
    const bannerEl = document.getElementById('profile-banner');

    // Lite mode body class
    document.body.classList.toggle('lite-mode', state.settings.lite);

    // Banner
    if (bannerEl) {
      if (state.profile.banner) {
        bannerEl.style.backgroundImage = `url(${state.profile.banner})`;
      } else {
        bannerEl.style.backgroundImage = '';
      }
    }

    // Avatar with PFP support
    if (avatarEl) {
      if (state.profile.pfp) {
        avatarEl.innerHTML = `<img src="${state.profile.pfp}" alt="PFP">`;
      } else {
        avatarEl.innerHTML = `<i class="bi bi-stars" style="color:${state.profile.accent || 'var(--cyan)'};"></i>`;
      }
      avatarEl.style.borderColor = (state.profile.accent || '#65e9ff') + '30';
    }

    // Name with verification badge
    if (nameEl) {
      const verifiedBadge = state.settings.verified ? `<span class="verified-badge visible"><i class="bi bi-patch-check-fill"></i></span>` : '';
      nameEl.innerHTML = `${escapeHtml(state.profile.name)}${verifiedBadge}`;
    }
    if (uniEl) uniEl.textContent = state.profile.universeName;
    if (bioEl) bioEl.textContent = state.profile.bio;

    // Form fields
    document.getElementById('pub-name').value = state.profile.name || '';
    document.getElementById('pub-universe').value = state.profile.universeName || '';
    document.getElementById('pub-bio').value = state.profile.bio || '';
    document.getElementById('pub-handle').value = state.profile.handle || '';

    // Handle status
    const handleStatus = document.getElementById('handle-status');
    if (handleStatus) {
      handleStatus.textContent = state.profile.handle ? `@${state.profile.handle} — your cosmic signature` : 'Unique across the multiverse';
    }

    // Verified preview
    const verifiedPreview = document.getElementById('profile-verified-preview');
    if (verifiedPreview) {
      verifiedPreview.classList.toggle('visible', state.settings.verified);
    }

    // Stats
    document.getElementById('stat-tasks').textContent = state.stats.tasksCompleted;
    document.getElementById('stat-items').textContent = Object.values(state.inventory).reduce((a, b) => a + b, 0);
    document.getElementById('stat-rare').textContent = Object.entries(state.inventory).filter(([id]) => {
      const item = getItem(id);
      return item && ['rare','epic','legendary','mythic','odd','unknown'].includes(item.rarity);
    }).reduce((a, [id, count]) => a + count, 0);
    document.getElementById('stat-time').textContent = Math.round(state.stats.totalStudyTime / 60) + 'h';

    // Toggles
    document.getElementById('setting-sound')?.classList.toggle('active', state.settings.sound);
    document.getElementById('setting-glow')?.classList.toggle('active', state.settings.glow);
    document.getElementById('setting-sync')?.classList.toggle('active', state.settings.sync);
    document.getElementById('setting-lite')?.classList.toggle('active', state.settings.lite);
    document.getElementById('setting-verified')?.classList.toggle('active', state.settings.verified);
  },

  toggleSetting(key) {
    state.settings[key] = !state.settings[key];
    saveState();
    this.refreshProfile();
    if (key === 'sound' && state.settings.sound) cosmicSounds.discovery();
    if (key === 'lite') {
      document.body.classList.toggle('lite-mode', state.settings.lite);
      this.toast(state.settings.lite ? 'Lite mode engaged — the cosmos quiets' : 'Full cosmic mode restored', 'info');
    }
  },

  setAccent(color) {
    state.profile.accent = color;
    saveState();
    this.refreshProfile();
    this.toast('Your cosmic signature glows anew', 'success');
  },

  savePublicProfile() {
    state.profile.name = document.getElementById('pub-name').value.trim() || state.profile.name;
    state.profile.universeName = document.getElementById('pub-universe').value.trim() || state.profile.universeName;
    state.profile.bio = document.getElementById('pub-bio').value.trim() || state.profile.bio;
    state.profile.handle = document.getElementById('pub-handle').value.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || state.profile.handle;

    saveState();
    this.refreshProfile();
    this.setupGreeting();
    this.toast('The multiverse now knows you better', 'success');
  },

  /* ---- Image Uploads ---- */
  handlePfpUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.toast('Image too large — max 2MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      state.profile.pfp = ev.target.result;
      saveState();
      this.refreshProfile();
      this.toast('Your cosmic portrait has been etched', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  },

  handleBannerUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      this.toast('Banner too large — max 3MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      state.profile.banner = ev.target.result;
      saveState();
      this.refreshProfile();
      this.toast('Your universe has a new horizon', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  },

  clearPfp() {
    state.profile.pfp = null;
    saveState();
    this.refreshProfile();
    this.toast('Portrait reset to stardust', 'info');
  },


  addToInventory(item) {
    state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
    saveState();
  },

  /* ---- Item Detail ---- */
  openItemDetail(itemId) {
    // Close user profile modal first so item detail sits on top
    this.closeUserProfile();
    const item = getItem(itemId);
    if (!item) return;
    const count = state.inventory[itemId] || 0;
    const rarityColor = getRarityColor(item.rarity);
    const cat = getCategory(item.category);

    let threeDHtml = '';
    if (item.has3D) {
      threeDHtml = `
        <div class="item-detail-3d" onclick="viewer3D.open('${item.id}')">
          <i class="bi bi-box" style="color:${rarityColor};"></i>
          <span>View 3D Artifact</span>
        </div>
      `;
    }

    document.getElementById('item-detail-content').innerHTML = `
      <div class="item-detail-header">
        <span class="item-detail-icon" style="color:${rarityColor};"><i class="bi ${item.icon}"></i></span>
        <div class="item-detail-name" style="color:${rarityColor}">${escapeHtml(item.name)}</div>
        <div class="item-detail-meta">
          <span style="color:${rarityColor}">${item.rarity}</span>
          <span><i class="bi bi-folder"></i> ${cat?.name || item.category}</span>
          <span><i class="bi bi-geo-alt"></i> ${item.origin}</span>
          <span><i class="bi bi-clock-history"></i> ${item.year}</span>
        </div>
      </div>
      <div class="item-detail-lore">"${escapeHtml(item.lore)}"</div>
      <div class="item-detail-desc">${escapeHtml(item.description)}</div>
      ${threeDHtml}
      <div style="text-align:center;font-size:11px;color:var(--faint);font-family:var(--font-mono);margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);">
        <span class="cosmic-whisper">${randomPoem('loreWhispers')}</span><br>
        Owned: ${count} · ID: ${item.id}
      </div>
    `;
    document.getElementById('modal-item-detail')?.classList.add('active');
  },

  closeItemDetail() {
    document.getElementById('modal-item-detail')?.classList.remove('active');
  },

  /* ---- User Profile ---- */
  openUserProfile(userId) {
    const u = USER_DB.getById(userId);
    if (!u) return;

    const featuredItems = u.featured.map(id => getItem(id)).filter(Boolean);
    const featuredHtml = featuredItems.length > 0
      ? `<div class="user-featured-items">
          <h3>Featured Artifacts</h3>
          <div class="featured-items-grid">
            ${featuredItems.map(item => {
              const color = getRarityColor(item.rarity);
              return `<div class="featured-item glass" onclick="event.stopPropagation(); app.openItemDetail('${item.id}')">
                <i class="bi ${item.icon}" style="color:${color};"></i>
                <span>${escapeHtml(item.name)}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`
      : '';

    // Verification badge
    const verifiedBadge = u.verified ? `<span class="verified-badge visible" style="opacity:1;transform:scale(1);margin-left:8px;font-size:20px;"><i class="bi bi-patch-check-fill"></i></span>` : '';

    document.getElementById('user-profile-content').innerHTML = `
      <div class="user-profile-header">
        <div class="user-profile-avatar glass" style="background: linear-gradient(135deg, ${u.accent}15, ${u.accent}08); border-color: ${u.accent}30;">
          <i class="bi ${u.avatar}" style="color:${u.accent};"></i>
        </div>
        <div class="user-profile-name">${escapeHtml(u.name)}${verifiedBadge}</div>
        <div class="user-profile-universe" style="color:${u.accent};">@${escapeHtml(u.handle)} · ${escapeHtml(u.universe)}</div>
        <div class="user-profile-bio">${escapeHtml(u.bio)}</div>
        <div class="user-profile-lore">"${escapeHtml(u.lore)}"</div>
      </div>
      <div class="user-profile-stats">
        <div class="stat-card glass">
          <div class="stat-value" style="color:${u.accent};">${u.items}</div>
          <div class="stat-label">Objects</div>
        </div>
        <div class="stat-card glass">
          <div class="stat-value" style="color:${u.accent};">${u.rarePlus}</div>
          <div class="stat-label">Rare+</div>
        </div>
        <div class="stat-card glass">
          <div class="stat-value" style="color:${u.accent};">${u.tasksDone}</div>
          <div class="stat-label">Missions</div>
        </div>
      </div>
      <div class="user-profile-collections">
        <h3>Collections</h3>
        <div class="collection-tags">
          ${u.collections.map(c => `<span class="collection-tag">${escapeHtml(c)}</span>`).join('')}
        </div>
      </div>
      ${featuredHtml}
      <div style="text-align:center;margin-top:24px;">
        <span class="cosmic-whisper">The cosmos recognizes a fellow traveler.</span>
      </div>
    `;
    document.getElementById('modal-user-profile')?.classList.add('active');
  },

  closeUserProfile() {
    document.getElementById('modal-user-profile')?.classList.remove('active');
  },

  /* ---- Data Management ---- */
  exportData() {
    const data = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tinyoddity-archive-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast(randomPoem('toast.dataExported'), 'success');
  },

  importData() {
    document.getElementById('import-file').click();
  },

  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (confirm(`Restore archive from ${new Date(data.exportedAt || Date.now()).toLocaleDateString()}?`)) {
          state = migrateState(data);
          saveState();
          this.refreshAll();
          this.toast(randomPoem('toast.dataImported'), 'success');
        }
      } catch (err) {
        this.toast('Invalid archive file', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  resetData() {
    if (!confirm('WARNING: This will erase ALL your data. This cannot be undone.')) return;
    if (!confirm('Really? All missions, discoveries, and universe progress will be lost forever.')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = getDefaultState();
    saveState();
    this.refreshAll();
    this.toast(randomPoem('toast.reset'), 'warning');
  },

  refreshAll() {
    this.refreshHome();
    this.refreshStudy();
    collection.render();
    universe.render();
    discoverPage.render();
    this.refreshProfile();
    this.setupGreeting();
  },

  /* ---- Toast ---- */
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'bi-check-circle', info: 'bi-info-circle', warning: 'bi-exclamation-triangle' };
    toast.innerHTML = `<i class="bi ${icons[type] || 'bi-circle'}"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3600);
  }
};

/* -------------------- COLLECTION -------------------- */
const collection = {
  currentFilter: 'all',

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector(`.filter-chip[data-filter="${filter}"]`)?.classList.add('active');
    this.render();
  },

  render() {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;

    const items = Object.entries(state.inventory)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const item = getItem(id);
        return item ? { ...item, count } : null;
      })
      .filter(Boolean)
      .filter(item => this.currentFilter === 'all' || item.category === this.currentFilter);

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="collection-empty">
          <div style="font-size:40px;margin-bottom:12px;opacity:.4;"><i class="bi bi-stars"></i></div>
          <div style="font-size:15px;font-weight:500;margin-bottom:6px;">No discoveries yet</div>
          <div style="font-size:13px;">${randomPoem('empty.collection')}</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => {
      const rarityColor = getRarityColor(item.rarity);
      const glowStyle = state.settings.glow ? `box-shadow: 0 0 20px ${rarityColor}15; border-color: ${rarityColor}25;` : '';
      return `
        <div class="collection-card glass" style="${glowStyle}" onclick="app.openItemDetail('${item.id}')">
          ${item.count > 1 ? `<div class="card-count">${item.count}</div>` : ''}
          <span class="card-icon" style="color:${rarityColor};"><i class="bi ${item.icon}"></i></span>
          <div class="card-name">${escapeHtml(item.name)}</div>
          <div class="card-rarity rarity-${item.rarity}" style="color:${rarityColor}">${item.rarity}</div>
          <div class="card-category">${item.category}</div>
        </div>
      `;
    }).join('');
  }
};

/* -------------------- UNIVERSE CANVAS -------------------- */
const universe = {
  canvas: null,
  ctx: null,
  items: [],
  draggedItem: null,
  dragOffset: { x: 0, y: 0 },
  animId: null,
  needsRedraw: true,
  selectedItemId: null,
  placementMode: false,

  init() {
    this.canvas = document.getElementById('universe-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', throttle(() => this.resize(), 200));
    // Watch for container becoming visible (page switch)
    const container = document.getElementById('universe-container');
    if (container && typeof ResizeObserver !== 'undefined') {
      this._resizeObs = new ResizeObserver(() => this.resize());
      this._resizeObs.observe(container);
    }

    // Mouse events
    this.canvas.addEventListener('mousedown', e => this.handleStart(e));
    this.canvas.addEventListener('mousemove', e => this.handleMove(e));
    this.canvas.addEventListener('mouseup', e => this.handleEnd(e));
    this.canvas.addEventListener('click', e => this.handleClick(e));
    this.canvas.addEventListener('dblclick', e => this.handleDblClick(e));
    this.canvas.addEventListener('contextmenu', e => { e.preventDefault(); this.cancelPlacement(); });

    // Touch events
    this.canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      this.handleStart(e.touches[0]);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      this.handleMove(e.touches[0]);
    }, { passive: false });
    this.canvas.addEventListener('touchend', e => this.handleEnd(e));

    this.loadFromState();
    this.renderTray();
    this.loop();
  },

  resize() {
    const container = document.getElementById('universe-container');
    if (!container || !this.canvas) return;
    const rect = container.getBoundingClientRect();
    // Only update if container has real dimensions
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.needsRedraw = true;
    }
  },

  loadFromState() {
    this.items = state.universe.map(u => {
      const item = getItem(u.itemId);
      return item ? { ...u, ...item, width: 48, height: 48 } : null;
    }).filter(Boolean);
    this.needsRedraw = true;
  },

  saveToState() {
    state.universe = this.items.map(i => ({
      itemId: i.id,
      x: i.x,
      y: i.y,
      scale: i.scale || 1
    }));
    saveState();
  },

  /* ---- NEW: Select from tray, click canvas to place ---- */
  selectTrayItem(itemId) {
    if (this.selectedItemId === itemId) {
      this.cancelPlacement();
      return;
    }
    const count = state.inventory[itemId] || 0;
    const placed = this.items.filter(i => i.id === itemId).length;
    if (placed >= count) {
      app.toast('You have placed all copies of this object', 'warning');
      return;
    }
    this.selectedItemId = itemId;
    this.placementMode = true;
    this.renderTray();
    this.updateHint();
    cosmicSounds.click();
  },

  cancelPlacement() {
    this.selectedItemId = null;
    this.placementMode = false;
    this.renderTray();
    this.updateHint();
  },

  placeAt(x, y) {
    if (!this.selectedItemId || !this.canvas) return;
    // Ensure canvas has real dimensions
    if (this.canvas.width < 10 || this.canvas.height < 10) {
      this.resize();
    }
    const item = getItem(this.selectedItemId);
    if (!item) return;
    const count = state.inventory[this.selectedItemId] || 0;
    const placed = this.items.filter(i => i.id === this.selectedItemId).length;
    if (placed >= count) {
      app.toast('No more copies available', 'warning');
      this.cancelPlacement();
      return;
    }
    const w = this.canvas.width || 400;
    const h = this.canvas.height || 400;
    const cx = Math.max(0, Math.min(w - 48, x - 24));
    const cy = Math.max(0, Math.min(h - 48, y - 24));
    this.items.push({ ...item, x: cx, y: cy, width: 48, height: 48, scale: 1 });
    this.saveToState();
    this.needsRedraw = true;
    this.renderTray();
    cosmicSounds.click();
    // If no more copies, auto-deselect
    if (placed + 1 >= count) {
      this.cancelPlacement();
    }
  },

  updateHint() {
    const hint = document.getElementById('universe-hint');
    if (!hint) return;
    if (this.placementMode && this.selectedItemId) {
      const item = getItem(this.selectedItemId);
      hint.innerHTML = `<i class="bi bi-crosshair"></i> Click anywhere to place <b>${escapeHtml(item?.name || '')}</b> · Right-click to cancel`;
      hint.style.color = 'var(--cyan)';
    } else {
      hint.innerHTML = `<i class="bi bi-info-circle"></i> Click tray items to select · Click canvas to place · Drag to move · Double-click to remove · Right-click to cancel`;
      hint.style.color = 'var(--faint)';
    }
  },

  handleStart(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (x >= item.x && x <= item.x + item.width &&
          y >= item.y && y <= item.y + item.height) {
        this.draggedItem = item;
        this.dragOffset = { x: x - item.x, y: y - item.y };
        return;
      }
    }
  },

  handleMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    // Track mouse for placement preview
    this.mousePos = { x, y };
    if (this.placementMode) this.needsRedraw = true;
    // Drag existing item
    if (this.draggedItem) {
      this.draggedItem.x = Math.max(0, Math.min(this.canvas.width - this.draggedItem.width, x - this.dragOffset.x));
      this.draggedItem.y = Math.max(0, Math.min(this.canvas.height - this.draggedItem.height, y - this.dragOffset.y));
      this.needsRedraw = true;
    }
  },

  handleEnd(e) {
    if (this.draggedItem) {
      this.saveToState();
      this.draggedItem = null;
    }
  },

  handleClick(e) {
    // If in placement mode and not dragging, place at click position
    if (this.placementMode && !this.draggedItem) {
      if (!this.canvas) return;
      // Ensure canvas is properly sized before placing
      if (this.canvas.width < 10 || this.canvas.height < 10) {
        this.resize();
      }
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX || e.pageX) - rect.left;
      const y = (e.clientY || e.pageY) - rect.top;
      // Don't place if clicking on an existing item (let drag handle that)
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        if (x >= item.x && x <= item.x + item.width &&
            y >= item.y && y <= item.y + item.height) {
          return; // Clicked on existing item, don't place
        }
      }
      this.placeAt(x, y);
    }
  },

  handleDblClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (x >= item.x && x <= item.x + item.width &&
          y >= item.y && y <= item.y + item.height) {
        this.items.splice(i, 1);
        this.saveToState();
        this.needsRedraw = true;
        this.renderTray();
        return;
      }
    }
  },

  clear() {
    if (!confirm('Clear all objects from your cosmos?')) return;
    this.items = [];
    this.saveToState();
    this.needsRedraw = true;
    this.renderTray();
    this.cancelPlacement();
  },

  loop() {
    if (this.needsRedraw && this.ctx) {
      this.draw();
      this.needsRedraw = false;
    }
    this.animId = requestAnimationFrame(() => this.loop());
  },

  draw() {
    if (!this.ctx || !this.canvas) return;
    if (this.canvas.width === 0 || this.canvas.height === 0) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw placement preview if in placement mode
    if (this.placementMode && this.mousePos) {
      const item = getItem(this.selectedItemId);
      if (item) {
        const color = getRarityColor(item.rarity);
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.mousePos.x, this.mousePos.y, 24, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        // Crosshair
        this.ctx.strokeStyle = color + '60';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.mousePos.x - 30, this.mousePos.y);
        this.ctx.lineTo(this.mousePos.x + 30, this.mousePos.y);
        this.ctx.moveTo(this.mousePos.x, this.mousePos.y - 30);
        this.ctx.lineTo(this.mousePos.x, this.mousePos.y + 30);
        this.ctx.stroke();
      }
    }

    // Draw faint connections
    this.ctx.strokeStyle = 'rgba(101,233,255,0.04)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.items.length; i++) {
      for (let j = i + 1; j < this.items.length; j++) {
        const dx = this.items[i].x - this.items[j].x;
        const dy = this.items[i].y - this.items[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.items[i].x + 24, this.items[i].y + 24);
          this.ctx.lineTo(this.items[j].x + 24, this.items[j].y + 24);
          this.ctx.stroke();
        }
      }
    }

    // Draw items
    this.items.forEach(item => {
      const cx = item.x + 24;
      const cy = item.y + 24;
      const color = getRarityColor(item.rarity);

      // Glow
      if (state.settings.glow) {
        const gradient = this.ctx.createRadialGradient(cx, cy, 8, cx, cy, 40);
        gradient.addColorStop(0, color + '18');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(item.x - 16, item.y - 16, 80, 80);
      }

      // Background circle
      this.ctx.fillStyle = 'rgba(13,16,27,0.7)';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = color + '40';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Icon (initial letter as text for performance)
      this.ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = color;
      this.ctx.fillText(item.name.charAt(0).toUpperCase(), cx, cy);

      // Label
      this.ctx.font = '9px var(--font-mono)';
      this.ctx.fillStyle = 'rgba(167,175,193,0.6)';
      const label = item.name.length > 10 ? item.name.slice(0, 8) + '..' : item.name;
      this.ctx.fillText(label, cx, cy + 36);
    });
  },

  render() {
    if (!this.canvas) this.init();
    this.resize(); // CRITICAL: canvas may have been sized to 0 when page was hidden
    this.loadFromState();
    this.renderTray();
    this.needsRedraw = true;
  },

  renderTray() {
    const tray = document.getElementById('universe-tray');
    if (!tray) return;

    const owned = Object.entries(state.inventory)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const item = getItem(id);
        return item ? { ...item, count, placed: this.items.filter(i => i.id === id).length } : null;
      })
      .filter(Boolean);

    if (owned.length === 0) {
      tray.innerHTML = `<div style="color:var(--faint);font-size:12px;font-family:var(--font-mono);padding:8px 0;">${randomPoem('empty.universe')}</div>`;
      return;
    }

    tray.innerHTML = owned.map(item => {
      const isSelected = this.selectedItemId === item.id;
      const remaining = item.count - item.placed;
      const color = getRarityColor(item.rarity);
      return `
        <div class="tray-item ${isSelected ? 'tray-selected' : ''} ${remaining === 0 ? 'tray-depleted' : ''}"
             onclick="universe.selectTrayItem('${item.id}')"
             title="${escapeHtml(item.name)} — ${remaining} remaining">
          <i class="bi ${item.icon}" style="color:${color};"></i>
          <span class="tray-count ${remaining === 0 ? 'tray-count-zero' : ''}">${remaining}</span>
          ${isSelected ? '<div class="tray-glow"></div>' : ''}
        </div>
      `;
    }).join('');
  }
};

/* -------------------- DISCOVER PAGE -------------------- */
const discoverPage = {
  render() {
    const grid = document.getElementById('discover-grid');
    if (!grid) return;

    const users = USER_DB.users;
    grid.innerHTML = users.map(u => `
      <div class="discover-card glass" onclick="app.openUserProfile('${u.id}')">
        <div class="discover-card-header">
          <div class="discover-card-avatar" style="background: linear-gradient(135deg, ${u.accent}15, ${u.accent}08); border-color: ${u.accent}25;">
            <i class="bi ${u.avatar}" style="color:${u.accent};"></i>
          </div>
          <div>
            <div class="discover-card-title">${escapeHtml(u.universe)}</div>
            <div class="discover-card-meta">@${escapeHtml(u.handle)} · ${u.items} objects</div>
          </div>
        </div>
        <div class="discover-card-desc">${escapeHtml(u.bio)}</div>
        <div class="discover-card-stats">
          <span class="discover-card-stat"><i class="bi bi-stars"></i> ${u.items}</span>
          <span class="discover-card-stat"><i class="bi bi-gem"></i> ${u.rarePlus}</span>
          <span class="discover-card-stat"><i class="bi bi-check-circle"></i> ${u.tasksDone}</span>
        </div>
      </div>
    `).join('');
  },

  handleSearch(query) {
    const grid = document.getElementById('discover-grid');
    if (!grid) return;

    if (!query.trim()) {
      this.render();
      return;
    }

    const q = query.toLowerCase();
    const users = USER_DB.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.universe.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );

    const items = ITEMS_DB.items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.lore.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q)
    );

    let html = '';

    if (users.length > 0) {
      html += `<div class="discover-section-title">Explorers</div>`;
      html += `<div class="discover-grid" style="margin-bottom:28px;">`;
      html += users.map(u => `
        <div class="discover-card glass" onclick="app.openUserProfile('${u.id}')">
          <div class="discover-card-header">
            <div class="discover-card-avatar" style="background: linear-gradient(135deg, ${u.accent}15, ${u.accent}08);">
              <i class="bi ${u.avatar}" style="color:${u.accent};"></i>
            </div>
            <div>
              <div class="discover-card-title">${escapeHtml(u.name)}</div>
              <div class="discover-card-meta">${escapeHtml(u.universe)}</div>
            </div>
          </div>
          <div class="discover-card-desc">${escapeHtml(u.bio)}</div>
        </div>
      `).join('');
      html += `</div>`;
    }

    if (items.length > 0) {
      html += `<div class="discover-section-title">Artifacts</div>`;
      html += `<div class="collection-grid" style="margin-bottom:28px;">`;
      html += items.map(item => {
        const color = getRarityColor(item.rarity);
        return `
          <div class="collection-card glass" onclick="app.openItemDetail('${item.id}')">
            <span class="card-icon" style="color:${color};"><i class="bi ${item.icon}"></i></span>
            <div class="card-name">${escapeHtml(item.name)}</div>
            <div class="card-rarity" style="color:${color}">${item.rarity}</div>
            <div class="card-category">${item.category}</div>
          </div>
        `;
      }).join('');
      html += `</div>`;
    }

    if (users.length === 0 && items.length === 0) {
      html = `<div class="collection-empty">
        <div style="font-size:40px;margin-bottom:12px;opacity:.4;"><i class="bi bi-search"></i></div>
        <div style="font-size:15px;">No echoes found in the void.</div>
      </div>`;
    }

    grid.innerHTML = html;
  }
};

/* -------------------- SEARCH SYSTEM -------------------- */
const search = {
  handleInput(query) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    if (!query.trim()) {
      dropdown.classList.remove('active');
      return;
    }

    const q = query.toLowerCase();
    const items = ITEMS_DB.items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.lore.toLowerCase().includes(q)
    ).slice(0, 5);

    const users = USER_DB.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q)
    ).slice(0, 3);

    if (items.length === 0 && users.length === 0) {
      dropdown.classList.remove('active');
      return;
    }

    let html = '';
    items.forEach(item => {
      const color = getRarityColor(item.rarity);
      html += `
        <div class="search-result" onclick="search.selectItem('${item.id}')">
          <div class="search-result-icon" style="background:${color}15;">
            <i class="bi ${item.icon}" style="color:${color};"></i>
          </div>
          <div class="search-result-info">
            <div class="search-result-name">${escapeHtml(item.name)}</div>
            <div class="search-result-meta">${item.rarity} · ${item.category}</div>
          </div>
        </div>
      `;
    });

    users.forEach(u => {
      html += `
        <div class="search-result" onclick="search.selectUser('${u.id}')">
          <div class="search-result-icon" style="background:${u.accent}15;">
            <i class="bi ${u.avatar}" style="color:${u.accent};"></i>
          </div>
          <div class="search-result-info">
            <div class="search-result-name">${escapeHtml(u.name)}</div>
            <div class="search-result-meta">@${u.handle} · ${u.universe}</div>
          </div>
        </div>
      `;
    });

    dropdown.innerHTML = html;
    dropdown.classList.add('active');
  },

  selectItem(id) {
    document.getElementById('searchDropdown')?.classList.remove('active');
    document.getElementById('globalSearchInput').value = '';
    app.openItemDetail(id);
  },

  selectUser(id) {
    document.getElementById('searchDropdown')?.classList.remove('active');
    document.getElementById('globalSearchInput').value = '';
    app.openUserProfile(id);
  }
};

/* Close search dropdown on outside click */
document.addEventListener('click', (e) => {
  const bar = document.getElementById('globalSearchBar');
  if (bar && !bar.contains(e.target)) {
    document.getElementById('searchDropdown')?.classList.remove('active');
  }
});

/* -------------------- REWARD ENGINE -------------------- */
const rewardEngine = {
  roll(difficulty = 'medium') {
    const table = RARITY_TABLES[difficulty] || RARITY_TABLES.medium;
    const roll = Math.random();
    let cumulative = 0;
    let selectedRarity = 'common';

    for (const [rarity, prob] of Object.entries(table)) {
      cumulative += prob;
      if (roll < cumulative) {
        selectedRarity = rarity;
        break;
      }
    }

    const candidates = ITEMS_DB.items.filter(i => i.rarity === selectedRarity);
    if (candidates.length === 0) {
      const common = ITEMS_DB.items.filter(i => i.rarity === 'common');
      return common[Math.floor(Math.random() * common.length)];
    }

    // Weight by ownership (less owned = higher chance)
    const weights = candidates.map(item => {
      const owned = state.inventory[item.id] || 0;
      return 1 / (1 + owned * 0.5);
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let weightRoll = Math.random() * totalWeight;

    for (let i = 0; i < candidates.length; i++) {
      weightRoll -= weights[i];
      if (weightRoll <= 0) return candidates[i];
    }

    return candidates[0];
  }
};

/* -------------------- DISCOVERY ANIMATION -------------------- */
const discovery = {
  currentItem: null,

  show(item) {
    this.currentItem = item;
    const overlay = document.getElementById('discovery-overlay');
    const rarityColor = getRarityColor(item.rarity);

    const iconEl = document.getElementById('discovery-icon');
    const nameEl = document.getElementById('discovery-name');
    const rarityEl = document.getElementById('discovery-rarity');
    const catEl = document.getElementById('discovery-category');
    const loreEl = document.getElementById('discovery-lore');
    const labelEl = document.getElementById('discovery-label');

    if (iconEl) iconEl.innerHTML = `<i class="bi ${item.icon}"></i>`;
    if (nameEl) {
      nameEl.textContent = item.name;
      nameEl.style.color = rarityColor;
    }
    if (rarityEl) {
      rarityEl.textContent = item.rarity;
      rarityEl.className = 'discovery-rarity rarity-' + item.rarity;
      rarityEl.style.color = rarityColor;
    }
    if (catEl) catEl.textContent = item.category;
    if (loreEl) loreEl.textContent = '"' + item.lore + '"';
    if (labelEl) labelEl.textContent = randomPoem('discovery.label');

    this.createParticles(rarityColor);
    overlay?.classList.add('active');

    if (state.settings.sound) cosmicSounds.discovery();
  },

  createParticles(color) {
    const container = document.getElementById('discovery-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = (42 + Math.random() * 16) + '%';
      p.style.top = (42 + Math.random() * 16) + '%';
      p.style.background = color;
      p.style.boxShadow = `0 0 8px ${color}`;
      p.style.width = (2 + Math.random() * 3) + 'px';
      p.style.height = p.style.width;
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 250;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      p.animate([
        { opacity: 0, transform: 'translate(0,0) scale(0)' },
        { opacity: 1, transform: 'translate(0,0) scale(1)', offset: 0.1 },
        { opacity: 0, transform: `translate(${tx}px, ${ty}px) scale(0)` }
      ], {
        duration: 1200 + Math.random() * 800,
        delay: Math.random() * 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
      container.appendChild(p);
    }
  },

  close() {
    document.getElementById('discovery-overlay')?.classList.remove('active');
    app.refreshHome();
    collection.render();
    universe.renderTray();
  }
};

/* -------------------- 3D VIEWER -------------------- */
const viewer3D = {
  open(itemId) {
    const item = getItem(itemId);
    if (!item) return;

    const titleEl = document.getElementById('viewer-title');
    const infoEl = document.getElementById('viewer-info');
    const placeholder = document.getElementById('viewer-placeholder');

    if (titleEl) titleEl.textContent = item.name;

    // Trigger nebula burst effects
    document.querySelectorAll('.nebula-burst').forEach(el => {
      el.classList.remove('active');
      void el.offsetWidth; // force reflow
      el.classList.add('active');
    });

    if (placeholder) {
      placeholder.innerHTML = `
        <i class="bi ${item.icon}" style="font-size:64px;color:${getRarityColor(item.rarity)};opacity:.6;"></i>
        <p style="margin-top:12px;">${escapeHtml(item.name)}</p>
        <span class="viewer-hint">3D Model: ${item.modelUrl || 'Not loaded'}</span>
      `;
    }

    if (infoEl) {
      infoEl.innerHTML = `
        <div class="item-detail-lore">"${escapeHtml(item.lore)}"</div>
        <div class="item-detail-desc">${escapeHtml(item.description)}</div>
      `;
    }

    document.getElementById('modal-3d-viewer')?.classList.add('active');
  },

  close() {
    document.getElementById('modal-3d-viewer')?.classList.remove('active');
    document.querySelectorAll('.nebula-burst').forEach(el => el.classList.remove('active'));
  }
};

/* -------------------- CANVAS STARFIELD -------------------- */
const starfield = {
  canvas: null,
  ctx: null,
  stars: [],
  width: 0,
  height: 0,
  initialized: false,

  init() {
    this.canvas = document.getElementById('starfield');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', throttle(() => this.resize(), 300));
    this.createStars();
    this.loop();
    this.initialized = true;
  },

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  createStars() {
    this.stars = [];
    const count = Math.min(200, Math.floor((this.width * this.height) / 8000));
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() < 0.9 ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: this.getStarColor()
      });
    }
  },

  getStarColor() {
    const colors = [
      '255,255,255',    // white
      '200,220,255',    // blue-white
      '255,240,200',    // warm
      '180,200,255',    // cool blue
      '255,220,180',    // gold
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const time = Date.now() * 0.001;

    this.stars.forEach(star => {
      const twinkle = Math.sin(time * star.twinkleSpeed * 50 + star.twinklePhase);
      const alpha = star.opacity * (0.5 + 0.5 * twinkle);

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${star.color}, ${alpha})`;
      this.ctx.fill();

      // Glow for larger stars
      if (star.size > 2) {
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${star.color}, ${alpha * 0.15})`;
        this.ctx.fill();
      }
    });

    requestAnimationFrame(() => this.loop());
  }
};

/* -------------------- KEYBOARD SHORTCUTS -------------------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (universe.placementMode) {
      universe.cancelPlacement();
      return;
    }
    app.closeAddTaskModal();
    app.closeItemDetail();
    app.closeUserProfile();
    viewer3D.close();
    discovery.close();
    document.getElementById('searchDropdown')?.classList.remove('active');
  }
  if (e.key === 'n' && e.ctrlKey) {
    e.preventDefault();
    app.openAddTaskModal();
  }
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    document.getElementById('globalSearchInput')?.focus();
  }
});

/* -------------------- INITIALIZATION -------------------- */
document.addEventListener('DOMContentLoaded', () => {
  app.init();
  universe.init();
  collection.render();
  discoverPage.render();

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        if (overlay.id === 'modal-3d-viewer') viewer3D.close();
      }
    });
  });
});
