# Requirements Document

## Overview

Browser-based productivity dashboard with greeting, focus timer, to-do list, and quick links. Client-side only using HTML, CSS, Vanilla JavaScript, and Local Storage.

## Requirements

### 1. Greeting Component
- Display current time (12-hour format) and date
- Update time every second
- Show time-based greeting: "Good Morning" (5AM-12PM), "Good Afternoon" (12PM-5PM), "Good Evening" (5PM-9PM), "Good Night" (9PM-5AM)

### 2. Focus Timer
- 25-minute countdown timer (MM:SS format)
- Start, stop, reset buttons
- Stop at 00:00 when complete

### 3. To-Do List
- Add, edit, delete tasks
- Mark tasks complete/incomplete
- Persist to Local Storage as JSON array
- Load from Local Storage on startup

### 4. Quick Links
- Display link buttons
- Add/remove custom links
- Open links in new tab
- Persist to Local Storage

### 5. Technical Constraints
- Single HTML file, single CSS file (css/), single JS file (js/)
- No frameworks, no backend
- Support Chrome, Firefox, Edge, Safari
- Load within 2 seconds, respond within 100ms
