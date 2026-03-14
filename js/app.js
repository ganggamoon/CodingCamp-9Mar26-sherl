/**
 * Personal Dashboard — app.js
 * Plain Vanilla JavaScript, no frameworks, no build tools.
 * Module-pattern objects: Storage, Greeting, Timer, Todo, Links, Theme
 */

'use strict';

/* ============================================================
   Storage Utility
   Wraps localStorage with try/catch on every operation.
   Shows a single non-blocking banner once per session on error.
   ============================================================ */
const Storage = (() => {
  let _bannerShown = false;

  function _showBanner() {
    if (_bannerShown) return;
    _bannerShown = true;
    const el = document.getElementById('storage-banner');
    if (el) el.hidden = false;
  }

  return {
    get(key) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? null : JSON.parse(raw);
      } catch (e) {
        _showBanner();
        return null;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        _showBanner();
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        _showBanner();
        return false;
      }
    },

    isAvailable() {
      try {
        const testKey = '__pd_test__';
        localStorage.setItem(testKey, '1');
        localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    }
  };
})();

/* ============================================================
   Greeting Widget
   Displays time, date, contextual greeting, and name editing.
   ============================================================ */
const Greeting = (() => {
  let _name = '';
  let _intervalId = null;

  /** Returns zero-padded HH:MM string for a given Date */
  function formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  /** Returns full date string: "Wednesday, January 1, 2025" */
  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /** Returns greeting phrase based on hour (0–23) */
  function getGreeting(hour) {
    if (hour >= 5  && hour <= 11) return 'Good morning';
    if (hour >= 12 && hour <= 17) return 'Good afternoon';
    if (hour >= 18 && hour <= 21) return 'Good evening';
    return 'Good night';
  }

  function render() {
    const now = new Date();
    const timeEl    = document.getElementById('greeting-time');
    const dateEl    = document.getElementById('greeting-date');
    const msgEl     = document.getElementById('greeting-message');
    const nameInput = document.getElementById('greeting-name-input');

    if (timeEl) timeEl.textContent = formatTime(now);
    if (dateEl) dateEl.textContent = formatDate(now);
    if (msgEl) {
      const phrase = getGreeting(now.getHours());
      msgEl.textContent = _name ? `${phrase}, ${_name}!` : `${phrase}!`;
    }
    if (nameInput && nameInput !== document.activeElement) {
      nameInput.value = _name;
    }
  }

  function init() {
    _name = Storage.get('pd_name') || '';
    render();
    _intervalId = setInterval(render, 1000);

    const saveBtn  = document.getElementById('greeting-name-save');
    const clearBtn = document.getElementById('greeting-name-clear');
    const input    = document.getElementById('greeting-name-input');

    function saveName() {
      const val = (input ? input.value : '').trim();
      if (val) {
        _name = val;
        Storage.set('pd_name', _name);
      } else {
        _name = '';
        Storage.remove('pd_name');
      }
      render();
    }

    if (saveBtn)  saveBtn.addEventListener('click', saveName);
    if (clearBtn) clearBtn.addEventListener('click', () => {
      _name = '';
      Storage.remove('pd_name');
      if (input) input.value = '';
      render();
    });
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); saveName(); }
      });
    }
  }

  return { init, render, formatTime, formatDate, getGreeting };
})();

/* ============================================================
   Timer Widget
   Pomodoro-style countdown with states: idle | running | paused
   ============================================================ */
const Timer = (() => {
  let _state             = 'idle';   // 'idle' | 'running' | 'paused'
  let _configuredDuration = 25;      // minutes
  let _remainingSeconds  = 25 * 60;
  let _intervalId        = null;

  /** Returns zero-padded MM:SS string for totalSeconds in [0, 7200] */
  function formatSeconds(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function render() {
    const display   = document.getElementById('timer-display');
    const startBtn  = document.getElementById('timer-start');
    const stopBtn   = document.getElementById('timer-stop');
    const resetBtn  = document.getElementById('timer-reset');

    if (display) display.textContent = formatSeconds(_remainingSeconds);

    if (startBtn) startBtn.disabled = (_state === 'running');
    if (stopBtn)  stopBtn.disabled  = (_state !== 'running');
    if (resetBtn) resetBtn.disabled = false;
  }

  function _notify() {
    const banner = document.getElementById('timer-notification');
    if (!banner) return;
    banner.textContent = '🎉 Session complete! Take a break.';
    banner.hidden = false;
    setTimeout(() => { banner.hidden = true; }, 5000);
    // Also flash the document title briefly
    const origTitle = document.title;
    let flashes = 0;
    const flashInterval = setInterval(() => {
      document.title = flashes % 2 === 0 ? '✅ Done! — Dashboard' : origTitle;
      if (++flashes >= 6) { clearInterval(flashInterval); document.title = origTitle; }
    }, 600);
  }

  function start() {
    if (_state === 'running') return;
    _state = 'running';
    _intervalId = setInterval(() => {
      _remainingSeconds -= 1;
      render();
      if (_remainingSeconds <= 0) {
        clearInterval(_intervalId);
        _intervalId = null;
        _state = 'idle';
        _remainingSeconds = 0;
        render();
        _notify();
      }
    }, 1000);
    render();
  }

  function stop() {
    if (_state !== 'running') return;
    clearInterval(_intervalId);
    _intervalId = null;
    _state = 'paused';
    render();
  }

  function reset() {
    clearInterval(_intervalId);
    _intervalId = null;
    _state = 'idle';
    _remainingSeconds = _configuredDuration * 60;
    render();
  }

  function _applyDuration(minutes) {
    _configuredDuration = minutes;
    Storage.set('pd_pomodoro_duration', minutes);
    // Only apply remaining seconds when idle (i.e. after reset or session completion)
    // Per requirement 4.6: new duration takes effect only after reset or session completion
    if (_state === 'idle') {
      _remainingSeconds = minutes * 60;
      render();
    }
  }

  function init() {
    const saved = Storage.get('pd_pomodoro_duration');
    if (typeof saved === 'number' && saved >= 1 && saved <= 120) {
      _configuredDuration = saved;
    }
    _remainingSeconds = _configuredDuration * 60;

    const durationInput = document.getElementById('timer-duration-input');
    if (durationInput) durationInput.value = _configuredDuration;

    render();

    // Wire buttons
    const startBtn    = document.getElementById('timer-start');
    const stopBtn     = document.getElementById('timer-stop');
    const resetBtn    = document.getElementById('timer-reset');
    const durationSave = document.getElementById('timer-duration-save');
    const errorEl     = document.getElementById('timer-duration-error');

    if (startBtn)  startBtn.addEventListener('click', start);
    if (stopBtn)   stopBtn.addEventListener('click', stop);
    if (resetBtn)  resetBtn.addEventListener('click', reset);

    if (durationSave) {
      durationSave.addEventListener('click', () => {
        const val = parseInt(durationInput ? durationInput.value : '', 10);
        if (isNaN(val) || val < 1 || val > 120) {
          if (errorEl) errorEl.textContent = 'Duration must be between 1 and 120 minutes.';
          return;
        }
        if (errorEl) errorEl.textContent = '';
        _applyDuration(val);
      });
    }

    if (durationInput) {
      // Validate on change (requirement 4.5 / task 5.5: "validates 1–120 on change")
      durationInput.addEventListener('change', () => {
        const val = parseInt(durationInput.value, 10);
        if (isNaN(val) || val < 1 || val > 120) {
          if (errorEl) errorEl.textContent = 'Duration must be between 1 and 120 minutes.';
        } else {
          if (errorEl) errorEl.textContent = '';
        }
      });

      durationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (durationSave) durationSave.click();
        }
      });
    }
  }

  return {
    init, render, start, stop, reset, formatSeconds,
    getState: () => _state,
    getRemaining: () => _remainingSeconds,
    getDuration: () => _configuredDuration
  };
})();

/* ============================================================
   Todo Widget
   Task list with add, edit, toggle, delete, sort.
   ============================================================ */
const Todo = (() => {
  let _tasks = [];

  function createTask(label) {
    return {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).slice(2),
      label: label.trim(),
      completed: false
    };
  }

  function isDuplicate(tasks, label) {
    const norm = label.trim().toLowerCase();
    return tasks.some(t => t.label.toLowerCase() === norm);
  }

  function sortTasks(tasks) {
    // Stable sort: incomplete first, completed second
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }

  function _save() {
    Storage.set('pd_tasks', _tasks);
  }

  function render() {
    const listEl  = document.getElementById('todo-list');
    const emptyEl = document.getElementById('todo-empty');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (_tasks.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    _tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.completed ? ' completed' : ''}`;
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.label}" complete`);
      checkbox.addEventListener('change', () => toggle(task.id));

      const labelSpan = document.createElement('span');
      labelSpan.className = 'task-label';
      labelSpan.textContent = task.label;

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn--ghost btn--sm';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit "${task.label}"`);
      editBtn.addEventListener('click', () => _startEdit(task.id, li, labelSpan));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn--danger btn--sm';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Delete "${task.label}"`);
      delBtn.addEventListener('click', () => deleteTask(task.id));

      actions.append(editBtn, delBtn);
      li.append(checkbox, labelSpan, actions);
      listEl.appendChild(li);
    });
  }

  function _startEdit(id, li, labelSpan) {
    const task = _tasks.find(t => t.id === id);
    if (!task) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.label;

    function confirm() {
      const newLabel = input.value.trim();
      if (newLabel && newLabel !== task.label) {
        edit(id, newLabel);
      } else {
        render();
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); confirm(); }
      if (e.key === 'Escape') render();
    });
    input.addEventListener('blur', confirm);

    li.replaceChild(input, labelSpan);
    input.focus();
    input.select();
  }

  function add(label) {
    const trimmed = label.trim();
    const errorEl = document.getElementById('todo-error');
    if (!trimmed) return;
    if (isDuplicate(_tasks, trimmed)) {
      if (errorEl) errorEl.textContent = 'A task with that name already exists.';
      return;
    }
    if (errorEl) errorEl.textContent = '';
    _tasks.push(createTask(trimmed));
    _save();
    render();
  }

  function edit(id, newLabel) {
    const task = _tasks.find(t => t.id === id);
    if (!task) return;
    task.label = newLabel.trim();
    _save();
    render();
  }

  function toggle(id) {
    const task = _tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    _save();
    render();
  }

  function deleteTask(id) {
    _tasks = _tasks.filter(t => t.id !== id);
    _save();
    render();
  }

  function sort() {
    _tasks = sortTasks(_tasks);
    _save();
    render();
  }

  function init() {
    const saved = Storage.get('pd_tasks');
    _tasks = Array.isArray(saved) ? saved : [];
    render();

    const form    = document.getElementById('todo-form');
    const input   = document.getElementById('todo-input');
    const sortBtn = document.getElementById('todo-sort');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input) {
          add(input.value);
          input.value = '';
        }
      });
    }

    // Clear error as user types
    if (input) {
      input.addEventListener('input', () => {
        const errorEl = document.getElementById('todo-error');
        if (errorEl) errorEl.textContent = '';
      });
    }

    if (sortBtn) sortBtn.addEventListener('click', sort);
  }

  return { init, render, add, edit, toggle, delete: deleteTask, sort, createTask, isDuplicate, sortTasks };
})();

/* ============================================================
   Quick Links Widget
   Manage and display shortcut links.
   ============================================================ */
const Links = (() => {
  let _links = [];

  function createLink(label, url) {
    return {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).slice(2),
      label: label.trim(),
      url
    };
  }

  function isValidUrl(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  function _save() {
    Storage.set('pd_links', _links);
  }

  function render() {
    const container = document.getElementById('links-list');
    const emptyEl   = document.getElementById('links-empty');
    if (!container) return;

    container.innerHTML = '';

    if (_links.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    _links.forEach(link => {
      const pill = document.createElement('div');
      pill.className = 'link-item';

      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'link-anchor';
      a.textContent = link.label;

      const delBtn = document.createElement('button');
      delBtn.className = 'link-delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Delete link "${link.label}"`);
      delBtn.addEventListener('click', (e) => { e.preventDefault(); deleteLink(link.id); });

      pill.append(a, delBtn);
      container.appendChild(pill);
    });
  }

  function add(label, url) {
    const errorEl = document.getElementById('links-error');
    const trimLabel = label.trim();
    if (!trimLabel) {
      if (errorEl) errorEl.textContent = 'Label cannot be empty.';
      return;
    }
    if (!isValidUrl(url)) {
      if (errorEl) errorEl.textContent = 'Please enter a valid http:// or https:// URL.';
      return;
    }
    if (errorEl) errorEl.textContent = '';
    _links.push(createLink(trimLabel, url));
    _save();
    render();
  }

  function deleteLink(id) {
    _links = _links.filter(l => l.id !== id);
    _save();
    render();
  }

  function init() {
    const saved = Storage.get('pd_links');
    _links = Array.isArray(saved) ? saved : [];
    render();

    const form       = document.getElementById('links-form');
    const labelInput = document.getElementById('links-label-input');
    const urlInput   = document.getElementById('links-url-input');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (labelInput && urlInput) {
          add(labelInput.value, urlInput.value);
          labelInput.value = '';
          urlInput.value = '';
        }
      });
    }

    // Clear error as user types
    const clearLinksError = () => {
      const errorEl = document.getElementById('links-error');
      if (errorEl) errorEl.textContent = '';
    };
    if (labelInput) labelInput.addEventListener('input', clearLinksError);
    if (urlInput)   urlInput.addEventListener('input', clearLinksError);
  }

  return { init, render, add, delete: deleteLink, createLink, isValidUrl };
})();

/* ============================================================
   Theme Controller
   Applies and persists light/dark theme via data-theme on <html>.
   ============================================================ */
const Theme = (() => {
  function _apply(theme) {
    document.documentElement.dataset.theme = theme;
  }

  function init() {
    // Read saved theme; fall back to OS preference if none saved.
    // (The inline <script> in <head> already handles the before-paint case;
    //  this call ensures correctness if that script was skipped or failed.)
    const saved = Storage.get('pd_theme');
    if (saved === 'dark' || saved === 'light') {
      _apply(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      _apply(prefersDark ? 'dark' : 'light');
    }

    // Wire the toggle button.
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  function toggle() {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    _apply(next);
    Storage.set('pd_theme', next);
  }

  return { init, toggle };
})();

/* ============================================================
   Bootstrap — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Theme first — re-applies saved/OS theme after paint (belt-and-suspenders
  // alongside the inline <script> in <head> that handles the before-paint case)
  Theme.init();

  // Check storage availability (shows banner if unavailable)
  Storage.isAvailable();

  // Initialise remaining widgets in order
  Greeting.init();
  Timer.init();
  Todo.init();
  Links.init();
});
