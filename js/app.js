//dark mode 
let basic = 100
let body = document.body

function darkMode() {
   if (basic != 1) {
                basic -= 1;
                body.classList.toggle("dark");
                plus++;
            } else {
                mode.style.display = "none";
                return
            }
}


// Feature: to-do-list-dashboard

const GreetingModule = {
  _getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 16) return 'Good Afternoon';
    if (hour >= 17 && hour <= 20) return 'Good Evening';
    return 'Good Night';
  },

  _formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  },

  _formatDate(date) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const weekday = weekdays[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${weekday}, ${month} ${day}, ${year}`;
  },

  _render() {
    const now = new Date();
    const greeting = this._getGreeting(now.getHours());
    const time = this._formatTime(now);
    const dateStr = this._formatDate(now);
    document.getElementById('greeting-text').textContent = greeting;
    document.getElementById('greeting-time').textContent = time;
    document.getElementById('greeting-date').textContent = dateStr;
  },

  init() {
    this._render();
    setInterval(() => this._render(), 1000);
  }
};

const TimerModule = {
  _intervalId: null,
  _remaining: 1500,
  _running: false,

  _formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  _render() {
    document.getElementById('timer-display').textContent = this._formatTime(this._remaining);
  },

  _tick() {
    if (this._remaining > 0) {
      this._remaining -= 1;
      this._render();
    }
    if (this._remaining === 0) {
      this.stop();
    }
  },

  start() {
    if (this._running) return;
    this._running = true;
    this._intervalId = setInterval(() => this._tick(), 1000);
  },

  stop() {
    this._running = false;
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  reset() {
    this.stop();
    this._remaining = 1500;
    this._render();
  },

  init() {
    this._render();
    document.getElementById('timer-start').addEventListener('click', () => this.start());
    document.getElementById('timer-stop').addEventListener('click', () => this.stop());
    document.getElementById('timer-reset').addEventListener('click', () => this.reset());
  }
};

const TodoModule = {
  _tasks: [],

  _load() {
    try {
      const raw = localStorage.getItem('tasks');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [];
    }
  },

  _save(tasks) {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      // silently ignore unavailable storage or quota exceeded
    }
  },

  _addTask(text) {
    if (!text || text.trim().length === 0) return;
    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    this._tasks.push(task);
    this._save(this._tasks);
  },

  _deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this._save(this._tasks);
  },

  _toggleTask(id) {
    const task = this._tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this._save(this._tasks);
    }
  },

  _editTask(id, newText) {
    if (!newText || newText.trim().length === 0) return;
    const task = this._tasks.find(t => t.id === id);
    if (task) {
      task.text = newText.trim();
      this._save(this._tasks);
    }
  },

  _render(tasks) {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');

      // Checkbox for toggle
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" complete`);
      checkbox.addEventListener('change', () => {
        this._toggleTask(task.id);
        this._render(this._tasks);
      });

      // Task text span (shown in view mode)
      const span = document.createElement('span');
      span.textContent = task.text;
      span.style.flex = '1';
      if (task.completed) {
        span.style.textDecoration = 'line-through';
        span.style.color = '#999';
      }

      // Inline edit input (hidden in view mode)
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;
      editInput.style.flex = '1';
      editInput.style.display = 'none';
      editInput.setAttribute('aria-label', `Edit task: ${task.text}`);

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
      editBtn.addEventListener('click', () => {
        span.style.display = 'none';
        editInput.style.display = '';
        editInput.focus();
        editBtn.style.display = 'none';
        saveBtn.style.display = '';
      });

      // Save button (shown in edit mode)
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.style.display = 'none';
      saveBtn.setAttribute('aria-label', `Save edit for "${task.text}"`);
      saveBtn.addEventListener('click', () => {
        const newText = editInput.value;
        this._editTask(task.id, newText);
        this._render(this._tasks);
      });

      // Allow saving with Enter key
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveBtn.click();
        if (e.key === 'Escape') this._render(this._tasks);
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete "${task.text}"`);
      deleteBtn.addEventListener('click', () => {
        this._deleteTask(task.id);
        this._render(this._tasks);
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editInput);
      li.appendChild(editBtn);
      li.appendChild(saveBtn);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  },

  init() {
    this._tasks = this._load();
    this._render(this._tasks);

    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value;
      this._addTask(text);
      this._render(this._tasks);
      input.value = '';
    });
  }
};

const QuickLinksModule = {
  _links: [],

  _load() {
    try {
      const raw = localStorage.getItem('quickLinks');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [];
    }
  },

  _save(links) {
    try {
      localStorage.setItem('quickLinks', JSON.stringify(links));
    } catch (e) {
      // silently ignore unavailable storage or quota exceeded
    }
  },

  _addLink(label, url) {
    try {
      new URL(url);
    } catch (e) {
      return; // invalid URL — silent no-op
    }
    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(),
      label,
      url
    };
    this._links.push(link);
    this._save(this._links);
    this._render(this._links);
  },

  _removeLink(id) {
    this._links = this._links.filter(l => l.id !== id);
    this._save(this._links);
    this._render(this._links);
  },

  _render(links) {
    const container = document.getElementById('quick-links-list');
    if (!container) return;
    container.innerHTML = '';
    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.label;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.setAttribute('aria-label', `Remove link "${link.label}"`);
      removeBtn.addEventListener('click', () => this._removeLink(link.id));

      const item = document.createElement('div');
      item.appendChild(a);
      item.appendChild(removeBtn);
      container.appendChild(item);
    });
  },

  init() {
    this._links = this._load();
    this._render(this._links);

    const form = document.getElementById('quick-links-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const labelInput = document.getElementById('quick-link-label');
        const urlInput = document.getElementById('quick-link-url');
        if (labelInput && urlInput) {
          this._addLink(labelInput.value.trim(), urlInput.value.trim());
          labelInput.value = '';
          urlInput.value = '';
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  GreetingModule.init();
  TimerModule.init();
  TodoModule.init();
  QuickLinksModule.init();
});


