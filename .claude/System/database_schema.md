# Database Schema

**Last Updated:** 2025-11-05

**Storage Type:** Browser localStorage (Client-side NoSQL key-value store)

**Data Format:** JSON

---

## Overview

WorkoutApp uses browser **localStorage** for all data persistence. There is no traditional database backend. All data is stored as JSON strings under 4 primary keys:

| Storage Key                      | Purpose                          | Data Structure    |
|----------------------------------|----------------------------------|-------------------|
| `workout_tracker_exercises`      | Available exercise library       | Array of objects  |
| `workout_tracker_templates`      | Workout templates                | Array of objects  |
| `workout_tracker_completed`      | Completed workout history        | Array of objects  |
| `workout_tracker_preferences`    | User preferences & app settings  | Object            |

---

## Storage Keys & Data Models

### 1. `workout_tracker_exercises`

**Purpose:** Stores all available exercises (seed data + user-created)

**Data Type:** `Array<Exercise>`

**Schema:**

```typescript
interface Exercise {
  id: string;              // UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
  name: string;            // Exercise name (1-50 characters, validated)
  emoji: string;           // Single emoji character (e.g., "🏋️", "💪")
  defaultSets: number;     // Default number of sets (1-5, integer)
  muscleGroup: string;     // Muscle group category (see enum below)
  isCustom: boolean;       // true = user-created, false = seed data
  createdAt: string;       // ISO 8601 timestamp (e.g., "2025-11-05T10:30:00.000Z")
}
```

**Constraints:**
- `id`: Required, unique, auto-generated via `generateId()` helper
- `name`: Required, 1-50 characters, validated via `validateExerciseName()`
- `emoji`: Required, single character
- `defaultSets`: Required, integer between 1-5 (inclusive)
- `muscleGroup`: Required, must be one of predefined values
- `isCustom`: Required, boolean
- `createdAt`: Required, ISO timestamp

**Muscle Group Enum:**
```javascript
const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Calves"
];
```

**Example Record:**

```json
{
  "id": "ex_001",
  "name": "Barbell Bench Press",
  "emoji": "🏋️",
  "defaultSets": 3,
  "muscleGroup": "Chest",
  "isCustom": false,
  "createdAt": "2025-11-05T10:00:00.000Z"
}
```

**Seed Data:** 27 pre-loaded exercises across 7 muscle groups

---

### 2. `workout_tracker_templates`

**Purpose:** Stores workout templates (pre-built PHAT programs + user-created)

**Data Type:** `Array<WorkoutTemplate>`

**Schema:**

```typescript
interface WorkoutTemplate {
  id: string;                    // UUID v4
  name: string;                  // Template name (e.g., "Upper Power Day")
  exercises: ExerciseReference[]; // Ordered list of exercises in workout
  isPrebuilt: boolean;           // true = PHAT program, false = user-created
  createdAt: string;             // ISO 8601 timestamp
}

interface ExerciseReference {
  exerciseId: string;  // References Exercise.id from workout_tracker_exercises
  order: number;       // Position in workout (0-indexed)
  sets: number;        // Number of sets for this exercise (1-5)
}
```

**Constraints:**
- `id`: Required, unique, auto-generated
- `name`: Required
- `exercises`: Required, array with at least 1 exercise
- `exercises[].exerciseId`: Must reference valid exercise ID
- `exercises[].order`: Sequential integers starting from 0
- `exercises[].sets`: Integer between 1-5
- `isPrebuilt`: Required, boolean
- `createdAt`: Required, ISO timestamp

**Example Record:**

```json
{
  "id": "template_phat_upper_power",
  "name": "PHAT - Upper Power",
  "exercises": [
    {
      "exerciseId": "ex_001",
      "order": 0,
      "sets": 3
    },
    {
      "exerciseId": "ex_005",
      "order": 1,
      "sets": 3
    }
  ],
  "isPrebuilt": true,
  "createdAt": "2025-11-05T10:00:00.000Z"
}
```

**Seed Data:** 4 pre-loaded PHAT workout templates

**Relationships:**
- `exercises[].exerciseId` → `workout_tracker_exercises[].id` (foreign key)

---

### 3. `workout_tracker_completed`

**Purpose:** Stores completed workout history with all tracking data

**Data Type:** `Array<CompletedWorkout>`

**Schema:**

```typescript
interface CompletedWorkout {
  id: string;                    // UUID v4
  workoutTemplateId: string | null;  // Reference to template (null if custom one-time workout)
  workoutName: string;           // Name of workout
  startTime: string;             // ISO 8601 timestamp when workout started
  endTime: string;               // ISO 8601 timestamp when workout finished
  duration: number;              // Duration in minutes (calculated)
  exercises: CompletedExercise[]; // Detailed exercise tracking data
}

interface CompletedExercise {
  exerciseId: string;            // References Exercise.id
  exerciseName: string;          // Denormalized for faster display
  emoji: string;                 // Denormalized for faster display
  workingWeight: number;         // Weight used for all sets (in user's preferred unit)
  sets: CompletedSet[];          // Per-set tracking data
}

interface CompletedSet {
  setNumber: number;             // Set number (1-indexed)
  weight: number;                // Weight used for this set (usually same as workingWeight)
  reps: number;                  // Target reps for this set
  maxReps: number;               // Maximum reps initially set
  completedReps: number;         // Actual reps completed
  completed: boolean;            // true when set is marked complete
}
```

**Constraints:**
- `id`: Required, unique, auto-generated
- `workoutTemplateId`: Optional (null for one-time custom workouts)
- `workoutName`: Required
- `startTime`: Required, ISO timestamp
- `endTime`: Required, ISO timestamp, must be after startTime
- `duration`: Required, positive integer (minutes)
- `exercises`: Required, non-empty array
- `exercises[].workingWeight`: Required, positive number
- `exercises[].sets`: Required, matches set count in template
- `sets[].setNumber`: Sequential integers starting from 1
- `sets[].weight`: Required, positive number (validated via `isPositiveNumber()`)
- `sets[].reps`: Required, positive integer
- `sets[].completed`: Required, boolean

**Example Record:**

```json
{
  "id": "completed_001",
  "workoutTemplateId": "template_phat_upper_power",
  "workoutName": "PHAT - Upper Power",
  "startTime": "2025-11-05T14:00:00.000Z",
  "endTime": "2025-11-05T15:30:00.000Z",
  "duration": 90,
  "exercises": [
    {
      "exerciseId": "ex_001",
      "exerciseName": "Barbell Bench Press",
      "emoji": "🏋️",
      "workingWeight": 185.0,
      "sets": [
        {
          "setNumber": 1,
          "weight": 185.0,
          "reps": 8,
          "maxReps": 8,
          "completedReps": 8,
          "completed": true
        },
        {
          "setNumber": 2,
          "weight": 185.0,
          "reps": 7,
          "maxReps": 8,
          "completedReps": 7,
          "completed": true
        },
        {
          "setNumber": 3,
          "weight": 185.0,
          "reps": 6,
          "maxReps": 8,
          "completedReps": 6,
          "completed": true
        }
      ]
    }
  ]
}
```

**Relationships:**
- `workoutTemplateId` → `workout_tracker_templates[].id` (optional foreign key)
- `exercises[].exerciseId` → `workout_tracker_exercises[].id` (foreign key)

**Indexing Strategy:**
- No native indexing (localStorage is key-value)
- Data is loaded into memory and sorted by date in React Context
- `getExerciseHistory()` function filters by `exerciseId` for statistics

---

### 4. `workout_tracker_preferences`

**Purpose:** Stores user preferences and app metadata

**Data Type:** `Object`

**Schema:**

```typescript
interface Preferences {
  weightUnit: "lbs" | "kg";  // User's preferred weight unit
  dataVersion: number;       // Schema version for migrations (currently 1)
}
```

**Constraints:**
- `weightUnit`: Required, must be "lbs" or "kg"
- `dataVersion`: Required, positive integer

**Example Record:**

```json
{
  "weightUnit": "lbs",
  "dataVersion": 1
}
```

**Usage:**
- `dataVersion` is checked on app load to determine if seed data needs updating
- `weightUnit` determines display formatting for all weights

---

## Data Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│    Exercise     │
│  (exercises)    │
│─────────────────│
│ id (PK)         │
│ name            │
│ emoji           │
│ defaultSets     │
│ muscleGroup     │
│ isCustom        │
│ createdAt       │
└────────┬────────┘
         │
         │ Referenced by
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ WorkoutTemplate  │         │ CompletedWorkout │
│   (templates)    │         │   (completed)    │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ name             │         │ workoutTemplateId│◄─┐
│ exercises[]      │         │ workoutName      │  │
│  ├─exerciseId(FK)│         │ startTime        │  │
│  ├─order         │         │ endTime          │  │
│  └─sets          │         │ duration         │  │
│ isPrebuilt       │         │ exercises[]      │  │
│ createdAt        │         │  ├─exerciseId(FK)│  │
└──────────────────┘         │  ├─exerciseName  │  │
         │                   │  ├─emoji         │  │
         │                   │  ├─workingWeight │  │
         │                   │  └─sets[]        │  │
         └───────────────────┼──────────────────┘  │
             References      │                     │
             (optional FK)   │                     │
                            │                     │
                            └─────────────────────┘
                                References
                                (optional FK)

┌─────────────────┐
│  Preferences    │
│ (preferences)   │
│─────────────────│
│ weightUnit      │
│ dataVersion     │
└─────────────────┘
```

### Relationship Details

**Exercise → WorkoutTemplate**
- Type: One-to-Many
- A single exercise can be used in multiple workout templates
- `WorkoutTemplate.exercises[].exerciseId` references `Exercise.id`
- No cascade delete (deleting exercise doesn't delete templates using it)

**WorkoutTemplate → CompletedWorkout**
- Type: One-to-Many (optional)
- A template can have many completed instances
- `CompletedWorkout.workoutTemplateId` references `WorkoutTemplate.id`
- Nullable: One-time custom workouts have `workoutTemplateId = null`

**Exercise → CompletedWorkout**
- Type: One-to-Many
- An exercise can appear in many completed workouts
- `CompletedWorkout.exercises[].exerciseId` references `Exercise.id`
- Denormalized fields (`exerciseName`, `emoji`) improve read performance

---

## Data Access Patterns

### Read Operations

**1. Load All Exercises**
```javascript
const exercises = localStorageService.getExercises();
// Returns: Exercise[]
```

**2. Load Workout Templates**
```javascript
const templates = localStorageService.getWorkoutTemplates();
// Returns: WorkoutTemplate[]
```

**3. Load Completed Workouts**
```javascript
const completed = localStorageService.getCompletedWorkouts();
// Returns: CompletedWorkout[]
```

**4. Get Exercise History (for statistics)**
```javascript
const history = localStorageService.getExerciseHistory(exerciseId);
// Returns: { date: string, maxWeight: number }[]
```

### Write Operations

**1. Add New Exercise**
```javascript
localStorageService.saveExercise(newExercise);
// Appends to exercises array
```

**2. Save Workout Template**
```javascript
localStorageService.saveWorkoutTemplate(template);
// Appends to templates array
```

**3. Save Completed Workout**
```javascript
localStorageService.saveCompletedWorkout(completedWorkout);
// Appends to completed array
```

**4. Update Preferences**
```javascript
localStorageService.savePreferences({ weightUnit: 'kg' });
// Overwrites entire preferences object
```

### Delete Operations

**1. Delete Exercise**
```javascript
localStorageService.deleteExercise(exerciseId);
// Filters out exercise from array
```

**2. Delete Workout Template**
```javascript
localStorageService.deleteWorkoutTemplate(templateId);
// Filters out template from array
```

**Note:** No delete function for completed workouts (history is immutable)

---

## Data Versioning & Migrations

### Current Version: 1

**Version Check Logic:**
```javascript
const preferences = getPreferences();
if (preferences.dataVersion !== CURRENT_DATA_VERSION) {
  seedDefaultExercises(); // Re-seed exercises
  savePreferences({ ...preferences, dataVersion: CURRENT_DATA_VERSION });
}
```

**Migration Strategy:**
- When seed data changes (new exercises/templates), increment `CURRENT_DATA_VERSION`
- On version mismatch, re-seed exercises and templates
- **Important:** Completed workouts are NEVER deleted during migrations
- Custom exercises created by users are preserved

**Seed Data Protection:**
- Custom exercises: `isCustom: true` → preserved during re-seeding
- Completed workouts: Always preserved (independent of versioning)
- Templates: Pre-built templates can be updated, custom ones preserved

---

## Seed Data

### Default Exercises (27 total)

**Chest (4 exercises):**
1. Barbell Bench Press
2. Incline Dumbbell Press
3. Cable Flyes
4. Push-ups

**Back (5 exercises):**
5. Deadlift
6. Bent Over Barbell Row
7. Pull-ups
8. Lat Pulldown
9. Seated Cable Row

**Shoulders (2 exercises):**
10. Overhead Press
11. Lateral Raises

**Arms (4 exercises):**
12. Barbell Curl
13. Hammer Curl
14. Tricep Dips
15. Skull Crushers

**Legs (6 exercises):**
16. Barbell Squat
17. Romanian Deadlift
18. Leg Press
19. Leg Curl
20. Leg Extension
21. Walking Lunges

**Calves (3 exercises):**
22. Standing Calf Raise
23. Seated Calf Raise
24. Calf Press

**Core (3 exercises):**
25. Plank
26. Russian Twists
27. Hanging Leg Raises

### Default Workout Templates (4 PHAT programs)

**1. PHAT - Upper Power**
- Bent Over Barbell Row (3 sets)
- Barbell Bench Press (3 sets)
- Overhead Press (3 sets)
- Pull-ups (3 sets)

**2. PHAT - Lower Power**
- Barbell Squat (3 sets)
- Romanian Deadlift (3 sets)
- Leg Press (3 sets)
- Standing Calf Raise (3 sets)

**3. PHAT - Upper Hypertrophy**
- Incline Dumbbell Press (4 sets)
- Cable Flyes (4 sets)
- Lateral Raises (4 sets)
- Barbell Curl (4 sets)
- Tricep Dips (4 sets)

**4. PHAT - Lower Hypertrophy**
- Leg Extension (4 sets)
- Leg Curl (4 sets)
- Walking Lunges (4 sets)
- Seated Calf Raise (4 sets)

---

## Storage Constraints

### localStorage Limits
- **Quota:** ~5-10MB per origin (browser-dependent)
- **Current Usage:** Estimated ~100KB for typical user data
- **Maximum Capacity:** Approximately:
  - ~10,000 exercises (unrealistic user scenario)
  - ~500 workout templates
  - ~1,000 completed workouts

### Data Size Estimation

**Average Sizes:**
- Exercise: ~150 bytes
- Workout Template: ~300 bytes (5 exercises)
- Completed Workout: ~1KB (average 8 exercises, 3 sets each)

**Typical User After 1 Year:**
- 50 exercises: 7.5 KB
- 10 templates: 3 KB
- 200 completed workouts: 200 KB
- **Total:** ~210 KB (well within limits)

---

## Data Integrity & Validation

### Validation Functions

**Exercise Validation:**
```javascript
validateExerciseName(name)  // 1-50 characters
validateSets(sets)          // 1-5 integer
```

**Weight Validation:**
```javascript
isPositiveNumber(weight)    // > 0, numeric
formatWeight(weight)        // Rounds to 2 decimals
```

**ID Generation:**
```javascript
generateId()  // UUID v4 via crypto.randomUUID()
```

### Data Integrity Rules

1. **No Orphaned References:** When displaying templates or completed workouts, missing exercises are handled gracefully (filter or show "Unknown Exercise")
2. **No Null Weights:** All weights must be positive numbers
3. **No Empty Workouts:** Completed workouts must have at least 1 exercise
4. **Timestamp Consistency:** `endTime` must be after `startTime`

---

## Backup & Restore

### Export Functionality (Admin Panel)

**Export Format:**
```json
{
  "exercises": [...],
  "workoutTemplates": [...],
  "completedWorkouts": [...],
  "preferences": {...},
  "exportDate": "2025-11-05T10:00:00.000Z",
  "version": "1.0"
}
```

**Export Trigger:**
```javascript
// In Admin.jsx
const exportData = () => {
  const data = {
    exercises: localStorageService.getExercises(),
    workoutTemplates: localStorageService.getWorkoutTemplates(),
    completedWorkouts: localStorageService.getCompletedWorkouts(),
    preferences: localStorageService.getPreferences(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-tracker-backup-${Date.now()}.json`;
  a.click();
};
```

### Import/Restore Functionality

**Import Validation:**
1. Validate JSON format
2. Check for required keys (exercises, workoutTemplates, completedWorkouts, preferences)
3. Validate data types for each field
4. Merge with existing data (no duplicates by ID)

**Restore Process:**
```javascript
const importData = (jsonFile) => {
  const data = JSON.parse(jsonFile);

  // Overwrite all localStorage keys
  localStorage.setItem('workout_tracker_exercises', JSON.stringify(data.exercises));
  localStorage.setItem('workout_tracker_templates', JSON.stringify(data.workoutTemplates));
  localStorage.setItem('workout_tracker_completed', JSON.stringify(data.completedWorkouts));
  localStorage.setItem('workout_tracker_preferences', JSON.stringify(data.preferences));

  // Reload context
  window.location.reload();
};
```

---

## Performance Considerations

### Read Performance
- localStorage reads are synchronous (blocking)
- Typical read time: <1ms for small datasets
- Data is loaded once into React Context on app mount
- Subsequent reads are from memory (instant)

### Write Performance
- localStorage writes are synchronous (blocking)
- Typical write time: 1-5ms
- JSON.stringify() is the bottleneck for large datasets
- Completed workouts grow linearly (no cleanup strategy)

### Optimization Strategies
1. **Denormalization:** Exercise names/emojis stored in completed workouts (avoids lookups)
2. **In-Memory Caching:** WorkoutContext holds all data in state (one load per session)
3. **Lazy Loading:** Could be implemented for very large histories (not currently needed)

---

## Future Schema Enhancements

### Potential Additions

**1. Workout Tags/Categories**
```typescript
interface WorkoutTemplate {
  // ... existing fields
  tags: string[];  // e.g., ["strength", "hypertrophy", "beginner"]
  category: string;  // e.g., "Push", "Pull", "Legs"
}
```

**2. Exercise Notes**
```typescript
interface Exercise {
  // ... existing fields
  instructions: string;  // How to perform exercise
  videoUrl: string;      // Tutorial link
}
```

**3. Personal Records**
```typescript
interface PersonalRecord {
  exerciseId: string;
  type: "1RM" | "volume" | "endurance";
  value: number;
  date: string;
}
```

**4. Workout Scheduling**
```typescript
interface Schedule {
  id: string;
  workoutTemplateId: string;
  dayOfWeek: number;  // 0-6 (Sunday-Saturday)
  enabled: boolean;
}
```

---

## Schema Change History

### Version 1 (2025-11-05)
- Initial schema
- 4 localStorage keys
- 27 seed exercises
- 4 PHAT templates
- Preferences with data versioning

---

This schema provides a complete foundation for workout tracking with room for future enhancements while maintaining simplicity and performance.
