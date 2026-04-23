# Implementation Plan: To-Do List Dashboard

## Overview

Implement a single-page productivity dashboard in three files (`index.html`, `css/styles.css`, `js/app.js`) using vanilla HTML/CSS/JS. All four modules (Greeting, Timer, Todo, QuickLinks) are self-contained objects initialized on `DOMContentLoaded`. State is persisted via Local Storage.

## Tasks

- [x] 1. Scaffold project structure
  - Create `index.html` with semantic sections for each module: greeting, timer, todo, quick links
  - Create `css/styles.css` with base layout and module-level selectors
  - Create `js/app.js` with empty module stubs and a `DOMContentLoaded` listener that calls each module's `init()`
  - _Requirements: 5.1, 5.2_

- [ ] 2. Implement GreetingModule
  - [x] 2.1 Implement `_getGreeting(hour)`, `_formatTime(date)`, `_formatDate(date)`, `_render()`, and `init()` with a 1000ms `setInterval`
    - Greeting ranges: 5–11 → "Good Morning", 12–16 → "Good Afternoon", 17–20 → "Good Evening", 21–23 and 0–4 → "Good Night"
    - Time in 12-hour format with AM/PM; date as "Weekday, Month D, YYYY"
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 2.2 Write property test for greeting hour mapping (Property 1)
    - **Property 1: Greeting maps all hours correctly**
    - Use `fc.integer({min:0, max:23})` — assert output is one of 4 strings and matches correct range
    - **Validates: Requirements 1.3**

  - [ ]* 2.3 Write property test for time formatting (Property 2)
    - **Property 2: Time formatting produces valid output**
    - Use `fc.integer({min:0, max:1499})` for timer variant; assert output matches `/^\d{2}:\d{2}$/`
    - **Validates: Requirements 1.1, 2.1**

- [ ] 3. Implement TimerModule
  - [x] 3.1 Implement `start()`, `stop()`, `reset()`, `_tick()`, `_formatTime(seconds)`, `_render()`, and `init()`
    - `_remaining` starts at 1500; `_tick()` decrements and stops at 0; `start()` is a no-op if already running
    - Wire Start/Stop/Reset buttons in `init()`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.2 Write property test for timer reset (Property 3)
    - **Property 3: Timer reset always restores initial state**
    - For any `_remaining` and `_running` state, after `reset()`: `_remaining === 1500` and `_running === false`
    - **Validates: Requirements 2.2**

- [ ] 4. Checkpoint — Ensure greeting and timer render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement TodoModule
  - [x] 5.1 Implement `_load()` and `_save(tasks)` with try/catch for corrupt JSON and unavailable Local Storage
    - Key: `"tasks"`; fall back to `[]` on any error
    - _Requirements: 3.6, 3.7_

  - [ ]* 5.2 Write property test for task persistence round-trip (Property 9)
    - **Property 9: Task persistence is a round-trip**
    - `_save(tasks)` then `_load()` must deeply equal original array
    - **Validates: Requirements 3.6, 3.7**

  - [x] 5.3 Implement `_addTask(text)` with whitespace validation, `_deleteTask(id)`, `_toggleTask(id)`, and `_editTask(id, newText)`
    - Generate id via `crypto.randomUUID()` or `Date.now().toString()`; reject empty/whitespace-only text
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 5.4 Write property test for adding a valid task (Property 4)
    - **Property 4: Adding a valid task grows the list**
    - List length increases by 1; new task has correct text and `completed: false`
    - **Validates: Requirements 3.1**

  - [x] 5.5 Write property test for whitespace rejection (Property 5)
    - **Property 5: Whitespace-only task text is rejected**
    - Use `fc.stringOf(fc.constantFrom(' ','\t','\n'))` — list must remain unchanged
    - **Validates: Requirements 3.2**

  - [ ]* 5.6 Write property test for task deletion (Property 6)
    - **Property 6: Deleting a task removes it from the list**
    - No task with deleted id remains; all others unchanged
    - **Validates: Requirements 3.3**

  - [ ]* 5.7 Write property test for toggle round-trip (Property 7)
    - **Property 7: Toggling task completion is a round-trip**
    - Double-toggle restores original `completed` state
    - **Validates: Requirements 3.4**

  - [ ]* 5.8 Write property test for edit updates only target (Property 8)
    - **Property 8: Editing a task updates only the target**
    - Only the target task's text changes; all other tasks are identical
    - **Validates: Requirements 3.5**

  - [x] 5.9 Implement `_render(tasks)` and wire add/edit/delete/toggle UI in `init()`
    - Render task list with checkboxes, edit controls, and delete buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Checkpoint — Ensure todo CRUD and persistence work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement QuickLinksModule
  - [x] 7.1 Implement `_load()` and `_save(links)` with try/catch fallback
    - Key: `"quickLinks"`; fall back to `[]` on any error
    - _Requirements: 4.4_

  - [ ]* 7.2 Write property test for link persistence round-trip (Property 12)
    - **Property 12: Link persistence is a round-trip**
    - `_save(links)` then `_load()` must deeply equal original array
    - **Validates: Requirements 4.4**

  - [x] 7.3 Implement `_addLink(label, url)` with URL validation and `_removeLink(id)`
    - Validate URL via `new URL(url)` constructor; reject if it throws
    - _Requirements: 4.1, 4.2_

  - [ ]* 7.4 Write property test for adding a valid link (Property 10)
    - **Property 10: Adding a valid link grows the links list**
    - List length increases by 1; new link has correct label and url
    - **Validates: Requirements 4.1**

  - [ ]* 7.5 Write property test for removing a link (Property 11)
    - **Property 11: Removing a link removes it from the list**
    - No link with removed id remains; all others unchanged
    - **Validates: Requirements 4.2**

  - [x] 7.6 Implement `_render(links)` and wire add/remove UI in `init()`
    - Render link buttons that open in `target="_blank"`; include add/remove controls
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Final checkpoint — Ensure all modules integrate correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Per NFR-1, no test framework setup is required — property tests are additive
- All four modules are initialized at the bottom of `js/app.js` inside a single `DOMContentLoaded` listener
- Local Storage errors are always silent (try/catch fallback to in-memory state)
- Property tests use **fast-check** with a minimum of 100 iterations each
