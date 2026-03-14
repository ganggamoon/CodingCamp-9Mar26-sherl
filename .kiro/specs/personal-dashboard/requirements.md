# Requirements Document

## Introduction

A personal dashboard web app that serves as a browser new tab page replacement. Built with plain HTML, CSS, and Vanilla JavaScript, it runs entirely client-side with no backend. The dashboard provides a greeting with time/date, a Pomodoro-style focus timer, a to-do list, and quick links to favorite websites. User data is persisted via the browser's Local Storage API. The app supports light/dark mode, a custom greeting name, and a configurable Pomodoro duration.

## Glossary

- **Dashboard**: The single-page web application rendered in the browser with no backend server.
- **Greeting_Widget**: The UI component that displays the current time, date, and a personalized greeting message.
- **Timer**: The Pomodoro-style countdown timer component with configurable duration.
- **Todo_List**: The UI component that manages the user's task list.
- **Task**: A single to-do item with a text label and a completion state.
- **Quick_Links**: The UI component that displays user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.
- **Pomodoro_Duration**: The configurable length of a single focus session in minutes.

---

## Requirements

### Requirement 1: Display Greeting with Time and Date

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an at-a-glance overview of the moment.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every second.
2. THE Greeting_Widget SHALL display the current full date (weekday, month, day, and year).
3. WHEN the current hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display "Good morning".
4. WHEN the current hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display "Good afternoon".
5. WHEN the current hour is between 18:00 and 21:59, THE Greeting_Widget SHALL display "Good evening".
6. WHEN the current hour is between 22:00 and 04:59, THE Greeting_Widget SHALL display "Good night".

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to personalize the greeting with my name, so that the dashboard feels tailored to me.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display an input field or prompt that allows the user to enter a custom name.
2. WHEN the user saves a custom name, THE Dashboard SHALL persist the name in Local_Storage.
3. WHEN a saved name exists in Local_Storage, THE Greeting_Widget SHALL append the name to the greeting message (e.g., "Good morning, [name]").
4. WHEN no name has been saved, THE Greeting_Widget SHALL display the greeting without a name suffix.
5. WHEN the user clears the saved name, THE Dashboard SHALL remove the name entry from Local_Storage and THE Greeting_Widget SHALL revert to the nameless greeting.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a countdown timer I can start, stop, and reset, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL display the remaining time in MM:SS format.
2. WHEN the user activates the start control, THE Timer SHALL begin counting down from the configured Pomodoro_Duration.
3. WHEN the user activates the stop control, THE Timer SHALL pause the countdown and retain the remaining time.
4. WHEN the user activates the reset control, THE Timer SHALL stop the countdown and restore the display to the full Pomodoro_Duration.
5. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and provide a visual or audible notification to the user.
6. WHILE the Timer is counting down, THE Dashboard SHALL disable the start control and enable the stop and reset controls.
7. WHILE the Timer is stopped or reset, THE Dashboard SHALL enable the start control and disable the stop control.

---

### Requirement 4: Configurable Pomodoro Duration

**User Story:** As a user, I want to change the focus session length, so that I can adapt the timer to my preferred work rhythm.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a control that allows the user to set the Pomodoro_Duration to any integer value between 1 and 120 minutes.
2. WHEN the user saves a new Pomodoro_Duration, THE Dashboard SHALL persist the value in Local_Storage.
3. WHEN a saved Pomodoro_Duration exists in Local_Storage, THE Timer SHALL initialize with that duration on page load.
4. WHEN no saved Pomodoro_Duration exists, THE Timer SHALL initialize with a default duration of 25 minutes.
5. IF the user enters a Pomodoro_Duration outside the range of 1 to 120 minutes, THEN THE Dashboard SHALL display a validation error and reject the value.
6. WHEN the Pomodoro_Duration is changed while the Timer is running, THE Timer SHALL apply the new duration only after the current session is reset or completed.

---

### Requirement 5: To-Do List

**User Story:** As a user, I want to manage a list of tasks, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. THE Todo_List SHALL display all saved Tasks loaded from Local_Storage on page load.
2. WHEN the user submits a new task label, THE Todo_List SHALL add the Task to the list and persist the updated list to Local_Storage.
3. WHEN the user activates the edit control on a Task, THE Todo_List SHALL allow the user to modify the task label inline and persist the change to Local_Storage on confirmation.
4. WHEN the user activates the complete control on a Task, THE Todo_List SHALL toggle the Task's completion state and persist the updated state to Local_Storage.
5. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the list and persist the updated list to Local_Storage.
6. IF the user submits a task label that is identical (case-insensitive) to an existing Task label, THEN THE Todo_List SHALL reject the submission and display a duplicate-task warning message.
7. THE Todo_List SHALL provide a sort control that, when activated, orders Tasks with incomplete items before completed items.
8. WHEN the task list is empty, THE Todo_List SHALL display an empty-state message to the user.

---

### Requirement 6: Quick Links

**User Story:** As a user, I want to save and access shortcut buttons to my favorite websites, so that I can navigate quickly without typing URLs.

#### Acceptance Criteria

1. THE Quick_Links SHALL display all saved Links loaded from Local_Storage on page load.
2. WHEN the user submits a new Link with a label and a valid URL, THE Quick_Links SHALL add the Link as a button and persist the updated list to Local_Storage.
3. WHEN the user activates a Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
4. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link and persist the updated list to Local_Storage.
5. IF the user submits a Link with a missing label or an invalid URL format, THEN THE Quick_Links SHALL display a validation error and reject the submission.
6. WHEN the links list is empty, THE Quick_Links SHALL display an empty-state message prompting the user to add a link.

---

### Requirement 7: Light / Dark Mode

**User Story:** As a user, I want to switch between a light and dark color scheme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control that switches the Theme between light and dark.
2. WHEN the user toggles the Theme, THE Dashboard SHALL apply the selected Theme immediately without a page reload.
3. WHEN the user toggles the Theme, THE Dashboard SHALL persist the selected Theme value in Local_Storage.
4. WHEN a saved Theme exists in Local_Storage, THE Dashboard SHALL apply that Theme on page load before rendering content, preventing a flash of the wrong theme.
5. WHEN no saved Theme exists in Local_Storage, THE Dashboard SHALL apply the Theme that matches the user's OS-level color scheme preference (`prefers-color-scheme`).

---

### Requirement 8: Data Persistence and Storage

**User Story:** As a user, I want my settings and data to be saved automatically, so that my dashboard state is restored every time I open it.

#### Acceptance Criteria

1. THE Dashboard SHALL use Local_Storage as the sole persistence mechanism for all user data.
2. THE Dashboard SHALL store Tasks, Links, Pomodoro_Duration, custom name, and Theme as separate keyed entries in Local_Storage.
3. IF Local_Storage is unavailable or throws an error during a read or write operation, THEN THE Dashboard SHALL continue to function in-session without persisting data and SHALL display a non-blocking warning to the user.
4. THE Dashboard SHALL NOT transmit any user data to an external server or third-party service.

---

### Requirement 9: Browser Compatibility and Performance

**User Story:** As a user, I want the dashboard to load fast and work reliably across modern browsers, so that I can use it as my daily new tab page.

#### Acceptance Criteria

1. THE Dashboard SHALL render and function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari.
2. THE Dashboard SHALL complete initial render within 1 second on a standard desktop machine with a warm browser cache.
3. THE Dashboard SHALL reflect UI interactions (button clicks, input submissions, timer ticks) within 100 milliseconds.
4. THE Dashboard SHALL be implemented using a single HTML file, a single CSS file inside a `css/` directory, and a single JavaScript file inside a `js/` directory.
5. THE Dashboard SHALL require no build tools, package managers, or backend server to run.
