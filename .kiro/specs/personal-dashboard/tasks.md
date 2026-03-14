# Implementation Plan: Personal Dashboard

## Overview

Implement a single-page personal dashboard using plain HTML, CSS, and Vanilla JavaScript. No build tools, no frameworks, no backend. All state persisted via `localStorage`. The implementation proceeds in layers: scaffold → storage utility → theme → greeting → timer → to-do list → quick links → property tests.

## Tasks

- [x] 1. Project scaffold — create the three-file structure
  - Create `index.html` with semantic sections for each widget: greeting, timer, todo, quick-links, and a theme toggle button in the header
  - Add a `<script>` block in `<head>` (before any CSS link) that reads `localStorage` for `pd_theme` and sets `data-theme` on `<html>` synchronously to prevent flash
  - Create `css/style.css` with CSS custom properties for both light and dark themes using `:root` and `:root[data-theme="dark"]` selectors, plus base layout styles
  - Create `js/app.js` with a top-level `DOMContentLoaded` listener and empty module-pattern stubs for `Storage`, `Greeting`, `Timer`, `Todo`, `Links`, and `Theme`
  - _Requirements: 9.4, 9.5, 7.4_

- [ ] 2. Storage utility
  - [x] 2.1 Implement `Storage` object in `js/app.js` with `get(key)`, `set(key, value)`, `remove(key)`, and `isAvailable()` methods, each wrapped in try/catch
    - `get` returns parsed JSON value or `null` on error
    - `set` serialises to JSON and returns `true`/`false`
    - `remove` deletes the key and returns `true`/`false`
    - `isAvailable` attempts a test write/read/delete and returns boolean
    - Show a single non-blocking banner (once per session via a module-level flag) when any operation throws
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 2.2 Write property test for Storage round-trip (Property 4)
    - **Property 4: Name persistence round-trip**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 2.3 Write property test for Storage round-trip for widget data (Property 13)
    - **Property 13: Widget data persistence round-trip**
    - **Validates: Requirements 5.1, 6.1**

- [ ] 3. Theme controller
  - [x] 3.1 Implement `Theme` object with `init()` and `toggle()` methods
    - `init()`: read `pd_theme` from storage; if missing, read `window.matchMedia('(prefers-color-scheme: dark)')` to determine default; apply by setting `document.documentElement.dataset.theme`
    - `toggle()`: flip the current `data-theme` attribute value between `"light"` and `"dark"`, persist to storage via `Storage.set('pd_theme', ...)`
    - Wire the theme toggle button in the DOM to call `Theme.toggle()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.2 Write property test for theme toggle (Property 23)
    - **Property 23: Theme toggle applies and persists**
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 3.3 Write property test for OS preference fallback (Property 24)
    - **Property 24: OS preference is used when no theme is saved**
    - **Validates: Requirements 7.5**

- [ ] 4. Greeting widget
  - [x] 4.1 Implement time and date formatting functions
    - `formatTime(date)`: returns `HH:MM` string (zero-padded hours and minutes)
    - `formatDate(date)`: returns full date string with weekday, month name, numeric day, and four-digit year using `toLocaleDateString` or manual construction
    - `getGreeting(hour)`: returns the correct phrase for the given hour — "Good morning" (5–11), "Good afternoon" (12–17), "Good evening" (18–21), "Good night" (22–23, 0–4)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 4.2 Write property test for time format (Property 1)
    - **Property 1: Time format is always HH:MM**
    - **Validates: Requirements 1.1**

  - [ ]* 4.3 Write property test for date format (Property 2)
    - **Property 2: Date format contains all required parts**
    - **Validates: Requirements 1.2**

  - [ ]* 4.4 Write property test for greeting hour mapping (Property 3)
    - **Property 3: Greeting phrase maps correctly to hour**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [x] 4.5 Implement `Greeting` object with `init()` and `render()` methods
    - `init()`: read `pd_name` from storage, call `render()`, start `setInterval` every 1000 ms to update time display
    - `render()`: update time element, date element, and greeting text (append name if saved)
    - Provide an inline name-edit control (input + save button); on save: trim value, if non-empty persist via `Storage.set('pd_name', ...)` and re-render; if empty call `Storage.remove('pd_name')` and re-render without name
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.6 Write property test for name round-trip (Property 4 — covered in task 2.2; reference here for traceability)
    - **Property 4: Name persistence round-trip**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 4.7 Write property test for clear name (Property 5)
    - **Property 5: Clearing name removes it from storage**
    - **Validates: Requirements 2.5**

- [ ] 5. Focus timer
  - [x] 5.1 Implement timer state machine and formatting
    - `formatSeconds(totalSeconds)`: returns `MM:SS` string (zero-padded); input range [0, 7200]
    - Implement state machine with states `idle`, `running`, `paused` and transitions: `start` (idle/paused → running), `stop` (running → paused), `reset` (any → idle), auto-stop when countdown reaches 0
    - Store `timerState`, `remainingSeconds`, and `configuredDuration` as module-level variables
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property test for timer seconds format (Property 6)
    - **Property 6: Timer seconds format is always MM:SS**
    - **Validates: Requirements 3.1**

  - [ ]* 5.3 Write property test for stop preserves remaining time (Property 7)
    - **Property 7: Stop preserves remaining time**
    - **Validates: Requirements 3.3**

  - [ ]* 5.4 Write property test for reset restores full duration (Property 8)
    - **Property 8: Reset restores full duration**
    - **Validates: Requirements 3.4**

  - [x] 5.5 Implement `Timer` object with `init()`, `render()`, `start()`, `stop()`, `reset()`, and duration-change handling
    - `init()`: read `pd_pomodoro_duration` from storage (default 25), set `configuredDuration` and `remainingSeconds`, call `render()`
    - `start()`: transition to `running`, start `setInterval` (1000 ms), decrement `remainingSeconds` each tick, call `render()`, auto-stop and notify when reaching 0
    - `stop()`: clear interval, transition to `paused`, call `render()`
    - `reset()`: clear interval, transition to `idle`, restore `remainingSeconds = configuredDuration * 60`, call `render()`
    - `render()`: update display, enable/disable start/stop/reset buttons per state
    - Duration input: validate 1–120 on change; show inline error and reject if out of range; persist valid value via `Storage.set('pd_pomodoro_duration', ...)`; apply new duration only after reset or session completion
    - Visual notification on session completion (e.g. a banner or title flash)
    - _Requirements: 3.1–3.7, 4.1–4.6_

  - [ ]* 5.6 Write property test for timer control states (Property 9)
    - **Property 9: Timer control states match timer state**
    - **Validates: Requirements 3.6, 3.7**

  - [ ]* 5.7 Write property test for duration round-trip (Property 10)
    - **Property 10: Pomodoro duration persistence round-trip**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 5.8 Write property test for invalid duration rejection (Property 11)
    - **Property 11: Invalid duration is rejected**
    - **Validates: Requirements 4.5**

  - [ ]* 5.9 Write property test for running timer ignores duration change (Property 12)
    - **Property 12: Running timer ignores duration change**
    - **Validates: Requirements 4.6**

- [x] 6. Checkpoint — verify scaffold, storage, theme, greeting, and timer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. To-do list
  - [x] 7.1 Implement task data helpers
    - `createTask(label)`: returns `{ id: crypto.randomUUID(), label: label.trim(), completed: false }`
    - `isDuplicate(tasks, label)`: case-insensitive trim comparison against all existing task labels; returns boolean
    - `sortTasks(tasks)`: stable sort — incomplete tasks first, completed tasks second, preserving relative order within each group
    - _Requirements: 5.2, 5.6, 5.7_

  - [ ]* 7.2 Write property test for adding a task grows the list (Property 14)
    - **Property 14: Adding a task grows the list**
    - **Validates: Requirements 5.2**

  - [ ]* 7.3 Write property test for duplicate task labels rejected (Property 18)
    - **Property 18: Duplicate task labels are rejected**
    - **Validates: Requirements 5.6**

  - [ ]* 7.4 Write property test for sort places incomplete before completed (Property 19)
    - **Property 19: Sort places incomplete tasks before completed tasks**
    - **Validates: Requirements 5.7**

  - [x] 7.5 Implement `Todo` object with `init()`, `render()`, `add(label)`, `edit(id, newLabel)`, `toggle(id)`, `delete(id)`, and `sort()` methods
    - `init()`: read `pd_tasks` from storage (default `[]`), call `render()`
    - `render()`: clear and rebuild the task list DOM; show empty-state message when array is empty; each task item has edit, complete-toggle, and delete controls
    - `add(label)`: trim label, check duplicate via `isDuplicate`, show inline warning if duplicate, otherwise push new task, persist, re-render
    - `edit(id, newLabel)`: replace label `<span>` with `<input>` on edit activation; confirm on Enter or blur; update task in array, persist, re-render
    - `toggle(id)`: flip `completed` boolean, persist, re-render
    - `delete(id)`: remove task by id, persist, re-render
    - `sort()`: call `sortTasks`, persist sorted array, re-render
    - Persist via `Storage.set('pd_tasks', tasks)`
    - _Requirements: 5.1–5.8_

  - [ ]* 7.6 Write property test for editing a task updates label (Property 15)
    - **Property 15: Editing a task updates label in storage**
    - **Validates: Requirements 5.3**

  - [ ]* 7.7 Write property test for completion toggle is its own inverse (Property 16)
    - **Property 16: Completion toggle is its own inverse**
    - **Validates: Requirements 5.4**

  - [ ]* 7.8 Write property test for delete removes item (Property 17)
    - **Property 17: Deleting an item removes it from list and storage**
    - **Validates: Requirements 5.5**

- [ ] 8. Quick links
  - [x] 8.1 Implement link data helpers and URL validation
    - `createLink(label, url)`: returns `{ id: crypto.randomUUID(), label: label.trim(), url }`
    - `isValidUrl(str)`: uses `new URL(str)` inside try/catch; returns `true` only if protocol is `http:` or `https:`
    - _Requirements: 6.2, 6.5_

  - [ ]* 8.2 Write property test for adding a link grows the list (Property 20)
    - **Property 20: Adding a link grows the list**
    - **Validates: Requirements 6.2**

  - [ ]* 8.3 Write property test for invalid link input rejected (Property 22)
    - **Property 22: Invalid link input is rejected**
    - **Validates: Requirements 6.5**

  - [x] 8.4 Implement `Links` object with `init()`, `render()`, `add(label, url)`, and `delete(id)` methods
    - `init()`: read `pd_links` from storage (default `[]`), call `render()`
    - `render()`: clear and rebuild the links DOM; show empty-state message when array is empty; each link renders as `<a href="..." target="_blank" rel="noopener noreferrer">` with a delete control
    - `add(label, url)`: validate label non-empty and URL via `isValidUrl`; show inline error if invalid; otherwise push new link, persist, re-render
    - `delete(id)`: remove link by id, persist, re-render
    - Persist via `Storage.set('pd_links', links)`
    - _Requirements: 6.1–6.6_

  - [ ]* 8.5 Write property test for link anchor attributes (Property 21)
    - **Property 21: Link anchor has correct attributes**
    - **Validates: Requirements 6.3**

  - [ ]* 8.6 Write property test for delete removes link (Property 17 — links variant)
    - **Property 17: Deleting an item removes it from list and storage (links)**
    - **Validates: Requirements 6.4**

- [ ] 9. Wire everything together in `app.js`
  - [x] 9.1 Call all `init()` methods in the correct order inside `DOMContentLoaded`
    - Order: `Theme.init()` → `Storage` availability check → `Greeting.init()` → `Timer.init()` → `Todo.init()` → `Links.init()`
    - Ensure the inline `<script>` in `<head>` handles the theme-before-paint case independently of `DOMContentLoaded`
    - _Requirements: 7.4, 9.2, 9.3_

  - [x] 9.2 Verify all event listeners are wired: theme toggle button, name save/clear, timer start/stop/reset/duration-change, todo add/edit/toggle/delete/sort, links add/delete
    - _Requirements: 1.1, 2.1, 3.2–3.7, 4.1, 5.2–5.7, 6.2–6.5_

- [x] 10. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** loaded via CDN; place tests in `js/app.test.js` or a `tests/` directory
- Each property test file should include the comment tag `// Feature: personal-dashboard, Property N: <property text>` per the design's testing strategy
- Minimum 100 iterations per property test (fast-check default is sufficient)
- All 24 correctness properties from the design document are covered across tasks 2–8
