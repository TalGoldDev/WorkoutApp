# API Documentation

**Last Updated:** 2025-11-05

---

## Overview

WorkoutApp is a **client-side only application** with no traditional REST API or backend server. This document covers:

1. **Internal Service Layer APIs** (localStorageService.js)
2. **Context API** (WorkoutContext.jsx)
3. **Browser APIs** (Service Worker, Wake Lock, Notifications)
4. **Utility Functions** (helpers.js)

---

## 1. localStorage Service API

**File:** `src/services/localStorageService.js`

**Purpose:** Abstraction layer for all data persistence operations. Provides CRUD functions for exercises, workout templates, completed workouts, and user preferences.

### Storage Keys

```javascript
const STORAGE_KEYS = {
  EXERCISES: 'workout_tracker_exercises',
  TEMPLATES: 'workout_tracker_templates',
  COMPLETED: 'workout_tracker_completed',
  PREFERENCES: 'workout_tracker_preferences'
};
```

---

### Exercise Operations

#### `getExercises()`

**Description:** Retrieve all exercises from localStorage

**Parameters:** None

**Returns:** `Exercise[]`

**Example:**
```javascript
const exercises = localStorageService.getExercises();
// Returns: [{ id, name, emoji, defaultSets, muscleGroup, isCustom, createdAt }, ...]
```

**Error Handling:** Returns empty array `[]` if localStorage is empty or parse fails

---

#### `saveExercise(exercise)`

**Description:** Add a new exercise to the library

**Parameters:**
- `exercise` (Exercise): Exercise object to save

**Returns:** `void`

**Side Effects:**
- Appends exercise to existing array in localStorage
- Triggers React Context update

**Example:**
```javascript
const newExercise = {
  id: generateId(),
  name: "Bulgarian Split Squat",
  emoji: "🦵",
  defaultSets: 3,
  muscleGroup: "Legs",
  isCustom: true,
  createdAt: new Date().toISOString()
};

localStorageService.saveExercise(newExercise);
```

**Validation:** Caller must validate exercise data before calling (use `validateExerciseName()`, `validateSets()`)

---

#### `deleteExercise(exerciseId)`

**Description:** Remove an exercise from the library

**Parameters:**
- `exerciseId` (string): UUID of exercise to delete

**Returns:** `void`

**Side Effects:**
- Removes exercise from localStorage array
- **Warning:** Does not check for references in templates or completed workouts

**Example:**
```javascript
localStorageService.deleteExercise("ex_001");
```

---

#### `seedDefaultExercises()`

**Description:** Initialize or refresh seed data (27 exercises + 4 PHAT templates)

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Merges seed exercises with existing custom exercises
- Overwrites pre-built templates (updates in new versions)
- **Preserves:** User-created exercises (`isCustom: true`)
- **Preserves:** Completed workouts (never touched)

**When Called:**
- First app launch (no data exists)
- Data version mismatch (schema update)

**Example:**
```javascript
localStorageService.seedDefaultExercises();
```

---

### Workout Template Operations

#### `getWorkoutTemplates()`

**Description:** Retrieve all workout templates

**Parameters:** None

**Returns:** `WorkoutTemplate[]`

**Example:**
```javascript
const templates = localStorageService.getWorkoutTemplates();
// Returns: [{ id, name, exercises: [{ exerciseId, order, sets }], isPrebuilt, createdAt }, ...]
```

---

#### `saveWorkoutTemplate(template)`

**Description:** Save a new workout template

**Parameters:**
- `template` (WorkoutTemplate): Template object to save

**Returns:** `void`

**Example:**
```javascript
const customTemplate = {
  id: generateId(),
  name: "My Arm Day",
  exercises: [
    { exerciseId: "ex_012", order: 0, sets: 4 },
    { exerciseId: "ex_013", order: 1, sets: 4 },
    { exerciseId: "ex_014", order: 2, sets: 3 }
  ],
  isPrebuilt: false,
  createdAt: new Date().toISOString()
};

localStorageService.saveWorkoutTemplate(customTemplate);
```

---

#### `deleteWorkoutTemplate(templateId)`

**Description:** Remove a workout template

**Parameters:**
- `templateId` (string): UUID of template to delete

**Returns:** `void`

**Side Effects:**
- Removes template from localStorage
- Does not affect completed workouts that used this template

**Example:**
```javascript
localStorageService.deleteWorkoutTemplate("template_001");
```

---

### Completed Workout Operations

#### `getCompletedWorkouts()`

**Description:** Retrieve all completed workouts

**Parameters:** None

**Returns:** `CompletedWorkout[]` (sorted by startTime descending)

**Example:**
```javascript
const history = localStorageService.getCompletedWorkouts();
// Returns: [{ id, workoutTemplateId, workoutName, startTime, endTime, duration, exercises: [...] }, ...]
```

---

#### `saveCompletedWorkout(workout)`

**Description:** Save a completed workout to history

**Parameters:**
- `workout` (CompletedWorkout): Completed workout object

**Returns:** `void`

**Example:**
```javascript
const completedWorkout = {
  id: generateId(),
  workoutTemplateId: "template_phat_upper_power",
  workoutName: "PHAT - Upper Power",
  startTime: startTime.toISOString(),
  endTime: new Date().toISOString(),
  duration: calculateDuration(startTime, new Date()),
  exercises: [
    {
      exerciseId: "ex_001",
      exerciseName: "Barbell Bench Press",
      emoji: "🏋️",
      workingWeight: 185.0,
      sets: [
        { setNumber: 1, weight: 185.0, reps: 8, maxReps: 8, completedReps: 8, completed: true },
        // ... more sets
      ]
    },
    // ... more exercises
  ]
};

localStorageService.saveCompletedWorkout(completedWorkout);
```

---

#### `getExerciseHistory(exerciseId)`

**Description:** Get weight progression data for a specific exercise

**Parameters:**
- `exerciseId` (string): UUID of exercise to analyze

**Returns:** `{ date: string, maxWeight: number }[]`

**Behavior:**
- Filters completed workouts for ones containing the exercise
- Extracts max weight used per workout
- Sorts by date (oldest first)
- Used for statistics/progress charts

**Example:**
```javascript
const history = localStorageService.getExerciseHistory("ex_001");
// Returns: [
//   { date: "2025-10-01", maxWeight: 175 },
//   { date: "2025-10-08", maxWeight: 180 },
//   { date: "2025-10-15", maxWeight: 185 }
// ]
```

---

### Preferences Operations

#### `getPreferences()`

**Description:** Retrieve user preferences

**Parameters:** None

**Returns:** `Preferences` object

**Default Values:**
```javascript
{
  weightUnit: 'lbs',
  dataVersion: 1
}
```

**Example:**
```javascript
const prefs = localStorageService.getPreferences();
// Returns: { weightUnit: "lbs", dataVersion: 1 }
```

---

#### `savePreferences(preferences)`

**Description:** Update user preferences

**Parameters:**
- `preferences` (Preferences): Full preferences object

**Returns:** `void`

**Example:**
```javascript
localStorageService.savePreferences({ weightUnit: 'kg', dataVersion: 1 });
```

---

## 2. Workout Context API

**File:** `src/contexts/WorkoutContext.jsx`

**Purpose:** Global state management using React Context API. Provides workout data and methods to all components.

### Context Value Shape

```typescript
interface WorkoutContextValue {
  // State
  exercises: Exercise[];
  workoutTemplates: WorkoutTemplate[];
  activeWorkout: ActiveWorkout | null;
  completedWorkouts: CompletedWorkout[];
  preferences: Preferences;

  // Exercise Methods
  addExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;

  // Template Methods
  addWorkoutTemplate: (template: WorkoutTemplate) => void;
  deleteWorkoutTemplate: (id: string) => void;

  // Active Workout Methods
  startWorkout: (template: WorkoutTemplate) => void;
  updateActiveWorkout: (workout: ActiveWorkout) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;

  // Preferences Methods
  updatePreferences: (prefs: Preferences) => void;

  // Utility Methods
  getExerciseById: (id: string) => Exercise | undefined;
  getExerciseHistory: (exerciseId: string) => HistoryEntry[];
}
```

### Usage

**1. Consuming Context in Components**

```javascript
import { useWorkout } from '../contexts/WorkoutContext';

function MyComponent() {
  const {
    exercises,
    addExercise,
    startWorkout
  } = useWorkout();

  // Use state and methods...
}
```

---

### Context Methods

#### `addExercise(exercise)`

**Description:** Add a new exercise to the library

**Parameters:**
- `exercise` (Exercise): New exercise object

**Returns:** `void`

**Side Effects:**
- Updates `exercises` state
- Persists to localStorage
- Re-renders all consumers

---

#### `deleteExercise(id)`

**Description:** Delete an exercise

**Parameters:**
- `id` (string): Exercise ID

**Returns:** `void`

**Side Effects:**
- Updates `exercises` state
- Persists to localStorage

---

#### `addWorkoutTemplate(template)`

**Description:** Add a new workout template

**Parameters:**
- `template` (WorkoutTemplate): New template object

**Returns:** `void`

---

#### `deleteWorkoutTemplate(id)`

**Description:** Delete a workout template

**Parameters:**
- `id` (string): Template ID

**Returns:** `void`

---

#### `startWorkout(template)`

**Description:** Begin a new workout session from a template

**Parameters:**
- `template` (WorkoutTemplate): Template to start from

**Returns:** `void`

**Side Effects:**
- Sets `activeWorkout` state
- Navigates to `/active-workout`
- Initializes workout with:
  - Empty weight inputs
  - All sets uncompleted
  - Start time = now

**Example:**
```javascript
const template = workoutTemplates[0];
startWorkout(template);
// Navigates to active workout page
```

---

#### `updateActiveWorkout(workout)`

**Description:** Update the active workout state (used during tracking)

**Parameters:**
- `workout` (ActiveWorkout): Updated workout object

**Returns:** `void`

**Usage Scenarios:**
- User enters weight for an exercise
- User completes a set
- User adjusts reps

---

#### `finishWorkout()`

**Description:** Complete the current workout and save to history

**Parameters:** None

**Returns:** `void`

**Side Effects:**
- Saves `activeWorkout` to `completedWorkouts`
- Clears `activeWorkout` state
- Persists to localStorage
- Navigates to `/history`

**Validation:**
- Adds `endTime` timestamp
- Calculates `duration`

---

#### `cancelWorkout()`

**Description:** Abort the active workout without saving

**Parameters:** None

**Returns:** `void`

**Side Effects:**
- Clears `activeWorkout` state
- Navigates back to home

---

#### `updatePreferences(prefs)`

**Description:** Update user preferences

**Parameters:**
- `prefs` (Preferences): New preferences object

**Returns:** `void`

---

#### `getExerciseById(id)`

**Description:** Find an exercise by ID

**Parameters:**
- `id` (string): Exercise ID

**Returns:** `Exercise | undefined`

**Example:**
```javascript
const exercise = getExerciseById("ex_001");
if (exercise) {
  console.log(exercise.name); // "Barbell Bench Press"
}
```

---

#### `getExerciseHistory(exerciseId)`

**Description:** Get weight progression for an exercise

**Parameters:**
- `exerciseId` (string): Exercise ID

**Returns:** `{ date: string, maxWeight: number }[]`

**Example:**
```javascript
const history = getExerciseHistory("ex_001");
// Use for statistics chart
```

---

## 3. Browser API Integration

### Service Worker API

**File:** `public/service-worker.js`

**Purpose:** Enable PWA functionality (offline caching, notifications)

#### Cache Strategy

**Type:** Network-First

**Behavior:**
1. Attempt network request
2. If successful, update cache and return response
3. If failed, return cached version
4. If no cache, return error

**Cache Name:** `workout-tracker-v1`

**Cached Resources:**
- `/` (root)
- `/index.html`
- All assets in `/assets/` directory
- Manifest and icons

---

#### Service Worker Registration

**File:** `src/utils/serviceWorkerRegistration.js`

#### `registerServiceWorker()`

**Description:** Register the service worker (production only)

**Parameters:** None

**Returns:** `Promise<ServiceWorkerRegistration | undefined>`

**Example:**
```javascript
if (import.meta.env.PROD) {
  registerServiceWorker().then(reg => {
    console.log('Service Worker registered');
  });
}
```

---

#### `isServiceWorkerSupported()`

**Description:** Check if Service Worker API is available

**Parameters:** None

**Returns:** `boolean`

**Example:**
```javascript
if (isServiceWorkerSupported()) {
  // Show install prompt
}
```

---

#### `isPushNotificationSupported()`

**Description:** Check if Notification API is available

**Parameters:** None

**Returns:** `boolean`

**Example:**
```javascript
if (isPushNotificationSupported()) {
  // Request notification permission
}
```

---

### Wake Lock API

**Purpose:** Prevent screen from sleeping during workouts

**Usage in ActiveWorkout.jsx:**

```javascript
// Request wake lock
let wakeLock = null;
try {
  wakeLock = await navigator.wakeLock.request('screen');
  console.log('Wake Lock active');
} catch (err) {
  console.error('Wake Lock failed:', err);
}

// Release wake lock
if (wakeLock) {
  await wakeLock.release();
  wakeLock = null;
}
```

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Safari iOS: ❌ Not supported
- Firefox: ❌ Not supported

---

### Notifications API

**Purpose:** Alert user when rest timer completes

#### Request Permission

```javascript
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  // Can send notifications
}
```

#### Send Notification

```javascript
// Via Service Worker (recommended)
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({
    type: 'SHOW_NOTIFICATION',
    title: 'Rest Complete',
    body: 'Time to start your next set!',
    tag: 'rest-timer'
  });
}

// Direct notification (fallback)
new Notification('Rest Complete', {
  body: 'Time to start your next set!',
  icon: '/icon-192.png',
  badge: '/icon-192.png',
  tag: 'rest-timer',
  requireInteraction: false
});
```

**Notification Options Used:**
- `title` (string): Main notification text
- `body` (string): Detailed message
- `icon` (string): Large icon (192x192)
- `badge` (string): Small icon for status bar
- `tag` (string): Unique identifier (replaces previous notifications with same tag)
- `requireInteraction` (boolean): Auto-dismiss if false

---

## 4. Utility Functions API

**File:** `src/utils/helpers.js`

### ID Generation

#### `generateId()`

**Description:** Generate a unique UUID v4

**Parameters:** None

**Returns:** `string`

**Implementation:** Uses `crypto.randomUUID()`

**Example:**
```javascript
const id = generateId();
// Returns: "550e8400-e29b-41d4-a716-446655440000"
```

---

### Validation Functions

#### `validateExerciseName(name)`

**Description:** Validate exercise name length

**Parameters:**
- `name` (string): Exercise name to validate

**Returns:** `boolean`

**Rules:**
- Must be 1-50 characters
- No other constraints (allows special characters, emojis, etc.)

**Example:**
```javascript
validateExerciseName("Bench Press"); // true
validateExerciseName(""); // false
validateExerciseName("A".repeat(51)); // false
```

---

#### `validateSets(sets)`

**Description:** Validate set count

**Parameters:**
- `sets` (number): Number of sets

**Returns:** `boolean`

**Rules:**
- Must be integer between 1-5 (inclusive)

**Example:**
```javascript
validateSets(3); // true
validateSets(0); // false
validateSets(6); // false
validateSets(2.5); // false
```

---

#### `isPositiveNumber(value)`

**Description:** Check if value is a positive number

**Parameters:**
- `value` (any): Value to check

**Returns:** `boolean`

**Rules:**
- Must be numeric
- Must be > 0
- Excludes NaN, null, undefined

**Example:**
```javascript
isPositiveNumber(185); // true
isPositiveNumber(0); // false
isPositiveNumber(-5); // false
isPositiveNumber("185"); // true (coerced)
isPositiveNumber("abc"); // false
```

---

### Formatting Functions

#### `formatWeight(weight)`

**Description:** Format weight to 2 decimal places

**Parameters:**
- `weight` (number): Weight value

**Returns:** `number`

**Example:**
```javascript
formatWeight(185.6789); // 185.68
formatWeight(200); // 200.00
```

---

### Date/Time Functions

#### `calculateDuration(startTime, endTime)`

**Description:** Calculate workout duration in minutes

**Parameters:**
- `startTime` (Date): Start timestamp
- `endTime` (Date): End timestamp

**Returns:** `number` (minutes, rounded)

**Example:**
```javascript
const start = new Date('2025-11-05T14:00:00Z');
const end = new Date('2025-11-05T15:30:00Z');
const duration = calculateDuration(start, end);
// Returns: 90
```

---

## Error Handling

### localStorage Errors

**Scenario:** localStorage is full or disabled

**Handling:**
```javascript
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error('Storage failed:', error);
  // Fallback: in-memory storage only
  // User sees warning: "Data will not be saved"
}
```

---

### Service Worker Errors

**Scenario:** Service Worker registration fails

**Handling:**
- Silent failure (app still works without PWA features)
- Logged to console
- No user-facing error

---

### Wake Lock Errors

**Scenario:** Wake Lock not supported or permission denied

**Handling:**
- Try-catch wrapper
- Logged to console
- Workout continues without wake lock

---

### Notification Errors

**Scenario:** Notification permission denied

**Handling:**
- Check permission before sending
- Fall back to visual timer only
- Admin panel shows notification status

---

## Rate Limiting

**Not Applicable:** No external API calls, no rate limiting needed.

---

## Authentication

**Not Applicable:** No authentication system. All data is local to the browser.

---

## API Testing

### Testing localStorage Service

**Manual Tests (via Browser Console):**

```javascript
// Test exercise CRUD
const exercise = {
  id: 'test_001',
  name: 'Test Exercise',
  emoji: '🧪',
  defaultSets: 3,
  muscleGroup: 'Test',
  isCustom: true,
  createdAt: new Date().toISOString()
};

localStorageService.saveExercise(exercise);
const exercises = localStorageService.getExercises();
console.log(exercises); // Should include test_001

localStorageService.deleteExercise('test_001');
const updated = localStorageService.getExercises();
console.log(updated); // Should not include test_001
```

### Testing Browser APIs

**Notification Test (in Admin Panel):**

```javascript
// Admin.jsx provides test buttons
<Button onClick={testNotification}>
  Test Notification (Immediate)
</Button>

<Button onClick={testTimedNotification}>
  Test Notification (5s delay)
</Button>
```

**Wake Lock Test:**

```javascript
// In browser console (must be HTTPS or localhost)
const wakeLock = await navigator.wakeLock.request('screen');
console.log('Wake Lock:', wakeLock.type); // "screen"
await wakeLock.release();
```

---

## Service Worker Messaging

### Message Types

**1. SHOW_NOTIFICATION**

**Direction:** Main App → Service Worker

**Payload:**
```javascript
{
  type: 'SHOW_NOTIFICATION',
  title: string,
  body: string,
  tag: string
}
```

**Example:**
```javascript
navigator.serviceWorker.controller.postMessage({
  type: 'SHOW_NOTIFICATION',
  title: 'Rest Complete',
  body: 'Time for your next set!',
  tag: 'rest-timer'
});
```

---

## Developer Tools

### Inspecting localStorage

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Expand "Local Storage"
4. Click on domain
5. View all keys and values

**Manual Inspection:**
```javascript
// In console
console.log(localStorage.getItem('workout_tracker_exercises'));
console.log(localStorage.getItem('workout_tracker_completed'));
```

---

### Clearing All Data

**Reset App State:**
```javascript
localStorage.clear();
window.location.reload();
// App will re-seed default data
```

---

This completes the API documentation for all internal and external interfaces used by WorkoutApp.
