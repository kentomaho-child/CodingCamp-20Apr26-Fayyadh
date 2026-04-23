// Feature: to-do-list-dashboard

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Inline TodoModule for testing (extracted from app.js, no DOM dependency)
const makeTodoModule = () => ({
  _tasks: [],

  _addTask(text) {
    if (!text || text.trim().length === 0) return;
    const task = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    this._tasks.push(task);
  },

  _deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
  },

  _toggleTask(id) {
    const task = this._tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  },

  _editTask(id, newText) {
    if (!newText || newText.trim().length === 0) return;
    const task = this._tasks.find(t => t.id === id);
    if (task) task.text = newText.trim();
  }
});

// Inline persistence helpers for testing (no DOM/localStorage dependency)
const makeStorage = () => {
  const store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = val; },
    removeItem: (key) => { delete store[key]; }
  };
};

const makePersistenceModule = (storage) => ({
  _save(tasks) {
    try {
      storage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) { /* silent */ }
  },
  _load() {
    try {
      const raw = storage.getItem('tasks');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [];
    }
  }
});

// Arbitraries
const taskArb = fc.record({
  id: fc.uuid(),
  text: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0, max: 2_000_000_000_000 })
});

// Feature: to-do-list-dashboard, Property 4: Adding a valid task grows the list
describe('Property 4: Adding a valid task grows the list', () => {
  it('increases list length by 1 and task has correct text and completed:false', () => {
    // Validates: Requirements 3.1
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (text) => {
          const todo = makeTodoModule();
          const before = todo._tasks.length;
          todo._addTask(text);
          expect(todo._tasks.length).toBe(before + 1);
          const added = todo._tasks[todo._tasks.length - 1];
          expect(added.text).toBe(text.trim());
          expect(added.completed).toBe(false);
          expect(added.id).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: to-do-list-dashboard, Property 5: Whitespace-only task text is rejected
describe('Property 5: Whitespace-only task text is rejected', () => {
  it('leaves the task list unchanged for any whitespace-only string', () => {
    // Validates: Requirements 3.2
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(' ', '\t', '\n')).map(chars => chars.join('')),
        (whitespaceText) => {
          const todo = makeTodoModule();
          const before = todo._tasks.length;
          todo._addTask(whitespaceText);
          expect(todo._tasks.length).toBe(before);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: to-do-list-dashboard, Property 6: Deleting a task removes it from the list
describe('Property 6: Deleting a task removes it from the list', () => {
  it('removes only the target task and leaves all others unchanged', () => {
    // Validates: Requirements 3.3
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        (tasks) => {
          const todo = makeTodoModule();
          todo._tasks = tasks.map(t => ({ ...t }));
          const target = todo._tasks[0];
          const others = todo._tasks.slice(1).map(t => ({ ...t }));
          todo._deleteTask(target.id);
          expect(todo._tasks.find(t => t.id === target.id)).toBeUndefined();
          expect(todo._tasks.length).toBe(others.length);
          others.forEach((orig, i) => {
            expect(todo._tasks[i]).toEqual(orig);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: to-do-list-dashboard, Property 7: Toggling task completion is a round-trip
describe('Property 7: Toggling task completion is a round-trip', () => {
  it('double-toggle restores original completed state', () => {
    // Validates: Requirements 3.4
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        (tasks) => {
          const todo = makeTodoModule();
          todo._tasks = tasks.map(t => ({ ...t }));
          const target = todo._tasks[0];
          const original = target.completed;
          todo._toggleTask(target.id);
          todo._toggleTask(target.id);
          expect(todo._tasks.find(t => t.id === target.id).completed).toBe(original);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: to-do-list-dashboard, Property 8: Editing a task updates only the target
describe('Property 8: Editing a task updates only the target', () => {
  it('only the target task text changes; all other tasks are identical', () => {
    // Validates: Requirements 3.5
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (tasks, newText) => {
          const todo = makeTodoModule();
          todo._tasks = tasks.map(t => ({ ...t }));
          const target = todo._tasks[0];
          const others = todo._tasks.slice(1).map(t => ({ ...t }));
          todo._editTask(target.id, newText);
          const edited = todo._tasks.find(t => t.id === target.id);
          expect(edited.text).toBe(newText.trim());
          others.forEach((orig, i) => {
            expect(todo._tasks[i + 1]).toEqual(orig);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: to-do-list-dashboard, Property 9: Task persistence is a round-trip
describe('Property 9: Task persistence is a round-trip', () => {
  it('_save then _load returns deeply equal array', () => {
    // Validates: Requirements 3.6, 3.7
    fc.assert(
      fc.property(
        fc.array(taskArb),
        (tasks) => {
          const storage = makeStorage();
          const mod = makePersistenceModule(storage);
          mod._save(tasks);
          const loaded = mod._load();
          expect(loaded).toEqual(tasks);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Inline QuickLinksModule for testing (no DOM dependency)
const makeQuickLinksModule = () => ({
  _links: [],

  _addLink(label, url) {
    try {
      new URL(url);
    } catch (e) {
      return;
    }
    const link = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      label,
      url
    };
    this._links.push(link);
  },

  _removeLink(id) {
    this._links = this._links.filter(l => l.id !== id);
  }
});

const makeLinkPersistenceModule = (storage) => ({
  _save(links) {
    try {
      storage.setItem('quickLinks', JSON.stringify(links));
    } catch (e) { /* silent */ }
  },
  _load() {
    try {
      const raw = storage.getItem('quickLinks');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [];
    }
  }
});

const linkArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1 }),
  url: fc.constantFrom('https://example.com', 'http://foo.org', 'https://bar.io/path')
});

const validUrlArb = fc.oneof(
  fc.webUrl(),
  fc.constantFrom('https://example.com', 'http://foo.org', 'ftp://files.example.com')
);

// Feature: to-do-list-dashboard, Property 10: Adding a valid link grows the links list
describe('Property 10: Adding a valid link grows the links list', () => {
  it('increases list length by 1 and link has correct label and url', () => {
    // Validates: Requirements 4.1
    fc.assert(
      fc.property(
        fc.array(linkArb),
        fc.string({ minLength: 1 }),
        validUrlArb,
        (initialLinks, label, url) => {
          const mod = makeQuickLinksModule();
          mod._links = initialLinks.map(l => ({ ...l }));
          const before = mod._links.length;
          mod._addLink(label, url);
          expect(mod._links.length).toBe(before + 1);
          const added = mod._links[mod._links.length - 1];
          expect(added.label).toBe(label);
          expect(added.url).toBe(url);
          expect(added.id).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects invalid URLs (no-op)', () => {
    // Validates: Requirements 4.1
    const invalidUrls = ['not-a-url', '', 'foobar', '://missing-scheme', 'http://', 'just text'];
    invalidUrls.forEach(url => {
      const mod = makeQuickLinksModule();
      mod._addLink('label', url);
      expect(mod._links.length).toBe(0);
    });
  });
});

// Feature: to-do-list-dashboard, Property 11: Removing a link removes it from the list
describe('Property 11: Removing a link removes it from the list', () => {
  it('removes only the target link and leaves all others unchanged', () => {
    // Validates: Requirements 4.2
    fc.assert(
      fc.property(
        fc.array(linkArb, { minLength: 1 }),
        (links) => {
          const mod = makeQuickLinksModule();
          mod._links = links.map(l => ({ ...l }));
          const target = mod._links[0];
          const others = mod._links.slice(1).map(l => ({ ...l }));
          mod._removeLink(target.id);
          expect(mod._links.find(l => l.id === target.id)).toBeUndefined();
          expect(mod._links.length).toBe(others.length);
          others.forEach((orig, i) => {
            expect(mod._links[i]).toEqual(orig);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: to-do-list-dashboard, Property 12: Link persistence is a round-trip
describe('Property 12: Link persistence is a round-trip', () => {
  it('_save then _load returns deeply equal array', () => {
    // Validates: Requirements 4.4
    fc.assert(
      fc.property(
        fc.array(linkArb),
        (links) => {
          const storage = makeStorage();
          const mod = makeLinkPersistenceModule(storage);
          mod._save(links);
          const loaded = mod._load();
          expect(loaded).toEqual(links);
        }
      ),
      { numRuns: 100 }
    );
  });
});
