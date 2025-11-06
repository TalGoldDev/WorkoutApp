# Project Architecture

**Last Updated:** 2025-11-06

---

## Project Goal

WorkoutApp is a **Progressive Web App (PWA)** designed to help fitness enthusiasts track their workouts, monitor progress, and maintain workout history. The app provides:

- Pre-built workout templates (PHAT program)
- Custom workout creation
- Workout template personalization (sets, reps, rest times per exercise)
- Real-time workout tracking with customizable rest timers
- Exercise switching during active workouts
- Historical workout data and progress visualization
- Workout editing and deletion (within 48 hours of completion)
- Offline functionality through PWA capabilities
- Screen wake lock during active workouts
- Push notifications for rest timer completion

---

## Project Structure

```
/home/user/WorkoutApp/
├── public/                          # Static and PWA assets
│   ├── service-worker.js           # Service Worker for offline caching
│   ├── manifest.json               # PWA manifest configuration
│   ├── icon-192.png                # App icon (192x192)
│   └── icon-512.png                # App icon (512x512)
│
├── src/
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Router and context provider setup
│   ├── index.css                   # Tailwind imports + global styles
│   │
│   ├── pages/                      # Page components (6 routes)
│   │   ├── Home.jsx               # Landing page with workout templates
│   │   ├── CreateWorkout.jsx      # Workout builder interface
│   │   ├── ActiveWorkout.jsx      # Live workout tracking with timer
│   │   ├── History.jsx            # Completed workouts history view
│   │   ├── Statistics.jsx         # Progress charts and analytics
│   │   └── Admin.jsx              # Debug panel (backup/restore, notifications)
│   │
│   ├── components/
│   │   └── shared/
│   │       ├── Layout.jsx                        # Page wrapper with navigation
│   │       ├── NavBar.jsx                        # Bottom navigation bar (mobile-first)
│   │       ├── Button.jsx                        # Reusable button component
│   │       ├── ExercisePersonalizationModal.jsx  # Customize sets, reps, rest time
│   │       └── ExerciseSwitcherModal.jsx         # Switch exercises during workout
│   │
│   ├── contexts/
│   │   └── WorkoutContext.jsx     # Global state management via Context API
│   │
│   ├── services/
│   │   └── localStorageService.js # Data persistence layer (CRUD operations)
│   │
│   └── utils/
│       ├── serviceWorkerRegistration.js  # PWA registration utilities
│       └── helpers.js             # Utility functions (ID generation, validation)
│
├── Configuration Files
│   ├── vite.config.js             # Vite build configuration
│   ├── tailwind.config.js         # Tailwind CSS customization
│   ├── postcss.config.js          # PostCSS processing
│   ├── eslint.config.js           # ESLint rules
│   └── package.json               # Dependencies and scripts
│
└── index.html                      # HTML entry point with PWA meta tags
```

---

## Tech Stack

### Frontend
- **Framework:** React 19.1.1 (with latest features)
- **Routing:** React Router DOM 7.9.3 (client-side routing)
- **Build Tool:** Vite 7.1.7 (fast dev server, optimized builds)
- **Language:** JavaScript (ES2020+)

### Styling & UI
- **CSS Framework:** Tailwind CSS 3.4.18 (utility-first, mobile-first design)
- **Icon Library:** Lucide React 0.544.0 (modern icon components)
- **Design System:** Custom Tailwind theme with predefined colors
- **CSS Processing:** PostCSS 8.5.6 + Autoprefixer 10.4.21

### Data Visualization
- **Charting:** Recharts 3.2.1 (React-based charts for progress tracking)

### Utilities
- **Date Handling:** date-fns 4.1.0 (date formatting and manipulation)

### Data Persistence
- **Storage:** Browser localStorage API (no backend database)
- **Data Versioning:** Built-in versioning system for schema migrations

### PWA Features
- **Service Worker:** Custom service worker with network-first caching strategy
- **Wake Lock API:** Prevents screen from sleeping during workouts
- **Notifications API:** Rest timer alerts
- **Cache API:** Offline content caching

### Development Tools
- **Linting:** ESLint 9.36.0 (code quality enforcement)
- **Version Control:** Git + GitHub
- **Package Manager:** npm

---

## Integration Points

### External APIs & Services
- **No External APIs**: Fully client-side application
- **No Authentication Service**: No user accounts (single-device storage)
- **No Backend Server**: All data stored in browser localStorage

### Browser APIs Used
1. **localStorage** - Primary data persistence
2. **Service Worker API** - PWA offline functionality
3. **Wake Lock API** - Screen management during workouts
4. **Notifications API** - Rest timer notifications
5. **Cache API** - Asset and resource caching

### Internal Service Layer
- `localStorageService.js` - Abstracts all data operations
- `WorkoutContext.jsx` - Provides global state access
- `serviceWorkerRegistration.js` - Handles PWA registration

---

## Key Architectural Decisions

### 1. **No Backend / Serverless Architecture**
**Decision:** Use localStorage for all data persistence instead of a backend database.

**Rationale:**
- Simplifies deployment (static hosting)
- Zero infrastructure costs
- Instant data access (no network latency)
- Works offline by default
- Target audience: single-user, single-device usage

**Trade-offs:**
- No cross-device sync
- Data limited to ~5-10MB (localStorage quota)
- No cloud backup (manual export/import only)

---

### 2. **React Context API for State Management**
**Decision:** Use Context API instead of Redux, Zustand, or other state libraries.

**Rationale:**
- Built into React (no additional dependencies)
- Sufficient for app complexity (6 pages, simple data flow)
- Easy to understand and maintain
- Performance is adequate (no deeply nested re-renders)

**Trade-offs:**
- May need refactoring if app grows significantly
- Less sophisticated dev tools compared to Redux

---

### 3. **Progressive Web App (PWA) Approach**
**Decision:** Build as PWA instead of native mobile app.

**Rationale:**
- Single codebase for all platforms (iOS, Android, Desktop)
- No app store approval process
- Direct deployment updates
- Installable on home screen
- Access to native-like APIs (Wake Lock, Notifications)

**Trade-offs:**
- Limited iOS PWA support (some API restrictions)
- No access to deep native features (e.g., health tracking integration)

---

### 4. **Tailwind CSS Utility-First Styling**
**Decision:** Use Tailwind instead of component libraries (Material-UI, Chakra) or CSS-in-JS.

**Rationale:**
- Full design control without library constraints
- Smaller bundle size (purges unused styles)
- Faster development with utility classes
- Mobile-first responsive design built-in
- Consistent design system via `tailwind.config.js`

**Trade-offs:**
- More verbose JSX (many className props)
- Custom components needed for complex patterns

---

### 5. **Network-First Service Worker Caching**
**Decision:** Use network-first strategy (fetch from network, fallback to cache).

**Rationale:**
- Ensures users always get latest version
- Prevents stale content issues
- Still provides offline functionality
- Suitable for frequently updated web apps

**Trade-offs:**
- Slightly slower when offline (waits for network timeout)
- Alternative: Cache-first would be faster offline but risk stale data

---

### 6. **Seed Data with Versioning**
**Decision:** Initialize with 27 exercises and 4 PHAT workout templates.

**Rationale:**
- Provides immediate value to new users (no empty state)
- Demonstrates app capabilities
- PHAT program is popular and scientifically-backed
- Data versioning prevents seed data loss on updates

**Trade-offs:**
- Users must manually delete unwanted templates
- Increases initial app size slightly

---

### 7. **Single Weight Input Per Exercise**
**Decision:** User enters one weight value per exercise (applies to all sets).

**Rationale:**
- Simplifies UX during workout (minimal tapping)
- Most users lift same weight for all sets
- Speeds up workout tracking
- Can adjust per-set during tracking if needed

**Trade-offs:**
- Less flexible for drop sets or pyramid training
- May need future enhancement for advanced users

---

### 8. **Customizable Rest Timers per Exercise**
**Decision:** Allow users to customize rest time per exercise (10-600 seconds) with 90-second default.

**Rationale:**
- 90 seconds is optimal for hypertrophy training (default)
- Users can adjust for different training styles (powerlifting, endurance)
- Per-exercise customization allows mixed training approaches
- Personalizations are saved per template

**Implementation:**
- Default: 90 seconds (aligns with PHAT methodology)
- Range: 10-600 seconds (10 seconds to 10 minutes)
- Quick presets: 60s, 90s, 120s, 180s
- Stored in `TEMPLATE_PERSONALIZATIONS` localStorage key

---

### 9. **Mobile-First, Bottom Navigation**
**Decision:** Design for mobile with bottom navigation bar.

**Rationale:**
- Primary use case: gym environment with phone
- Bottom navigation is thumb-friendly (ergonomic)
- iOS-style pattern familiar to users
- Responsive design scales to desktop

**Trade-offs:**
- Desktop experience is less optimized
- Limited navigation space (5 tabs max)

---

### 10. **No User Authentication**
**Decision:** No login system, no user accounts.

**Rationale:**
- Reduces complexity (no auth backend needed)
- Faster onboarding (no signup friction)
- Privacy-focused (no personal data collected)
- Aligns with localStorage-only architecture

**Trade-offs:**
- No cross-device sync
- No data recovery if device is lost
- Can't share workouts with others

---

### 11. **Template Personalization System**
**Decision:** Allow per-exercise customization (sets, reps, rest time) that's template-specific.

**Rationale:**
- Users can adapt pre-built templates to their needs
- Different templates can have different configurations for the same exercise
- Preserves default templates while allowing customization
- Stored separately from templates (non-destructive)

**Implementation:**
- Separate localStorage key: `workout_tracker_template_personalizations`
- Hierarchical structure: `{ [templateId]: { [exerciseId]: { sets, maxReps, restTime } } }`
- Per-set rep customization (each set can have different rep targets)
- Visual indicators show which exercises are personalized

**Trade-offs:**
- Adds complexity to data model
- Increases storage usage (minimal impact)
- Need to merge personalization with template data at runtime

---

### 12. **48-Hour Workout Edit Window**
**Decision:** Allow editing/deleting completed workouts within 48 hours of completion.

**Rationale:**
- Users can fix mistakes (wrong weight, missed sets)
- Delete duplicate or test workouts
- Long enough for immediate corrections
- Short enough to preserve historical data integrity
- Balances flexibility with data immutability

**Implementation:**
- `isWorkoutEditable(completedAt)` checks if within 48-hour window
- `getEditableHoursRemaining(completedAt)` shows time left to edit
- Visual indicators in History page (blue border, "Editable for Xh" badge)
- Original completion date preserved when editing
- Confirmation modal for deletions

**Trade-offs:**
- More complex history UI (edit/delete buttons)
- Potential for data inconsistency if user edits historical workouts
- Need to handle edge cases (editing while another workout is active)

---

### 13. **Exercise Switching During Workouts**
**Decision:** Allow users to switch exercises mid-workout while preserving set progress.

**Rationale:**
- Gym equipment availability changes
- Users may want to substitute similar exercises
- Injuries or discomfort may require alternatives
- Enhances flexibility without abandoning workout

**Implementation:**
- Modal with search and muscle group filtering
- Shows which exercises are already in workout
- Preserves set structure when switching (same number of sets)
- Weight and completed sets carry forward when switching
- Visual indicators prevent duplicate exercises

**Trade-offs:**
- Adds UI complexity during workout
- May lead to inconsistent workout logs
- Can't switch to exercises already in workout
- Original exercise name not preserved in history

---

## Application Flow

### Typical User Journey

```
1. First Launch
   └─> Home page loads
   └─> Seed data initializes (27 exercises + 4 templates)
   └─> User sees PHAT workout templates

2. Start a Workout
   └─> User taps workout template
   └─> Routes to /active-workout
   └─> Wake Lock activates (screen stays on)
   └─> User enters working weight per exercise
   └─> User completes sets one by one
   └─> Rest timer starts after each set
   └─> Notification sent after 90 seconds

3. Finish Workout
   └─> User taps "Finish Workout"
   └─> Data saved to localStorage (completed_workouts)
   └─> Routes back to Home

4. View Progress
   └─> User navigates to Statistics
   └─> Selects exercise from dropdown
   └─> Views weight progression chart
   └─> Sees improvement percentage

5. Create Custom Workout
   └─> User navigates to Create Workout
   └─> Selects exercises from library
   └─> Configures sets per exercise
   └─> Saves as template or starts immediately

6. Personalize Workout Template
   └─> User taps "Customize" on a template (Home or Create page)
   └─> Opens ExercisePersonalizationModal
   └─> Adjusts sets (1-10)
   └─> Sets per-set rep targets (1-50 each)
   └─> Customizes rest time (10-600 seconds)
   └─> Saves personalization
   └─> Exercise shows personalization indicator (star badge)
   └─> Personalizations apply only to that specific template

7. Switch Exercise During Workout
   └─> User in active workout
   └─> Taps "Switch Exercise" button on an exercise
   └─> Opens ExerciseSwitcherModal
   └─> Searches or filters by muscle group
   └─> Selects alternative exercise
   └─> Exercise replaced, set structure preserved
   └─> Weight and progress carry forward

8. Edit Recent Workout
   └─> User navigates to History
   └─> Sees workouts completed within 48 hours (blue border)
   └─> Badge shows "Editable for Xh"
   └─> Taps "Edit" button
   └─> Workout loads back into ActiveWorkout page
   └─> Header shows "Editing workout" badge
   └─> User corrects weights, reps, or sets
   └─> Taps "Save Changes"
   └─> Workout updated in history
   └─> Original completion date preserved

9. Delete Recent Workout
   └─> User navigates to History
   └─> Taps "Delete" button on editable workout
   └─> Confirmation modal appears
   └─> User confirms deletion
   └─> Workout removed from history
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Components                   │
│  (Home, CreateWorkout, ActiveWorkout, History, etc.) │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ Consume/Update
                       ▼
┌─────────────────────────────────────────────────────┐
│              WorkoutContext (Context API)            │
│  • exercises: [...]                                 │
│  • workoutTemplates: [...]                          │
│  • activeWorkout: {...}                             │
│  • completedWorkouts: [...]                         │
│  • preferences: {...}                               │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ Read/Write
                       ▼
┌─────────────────────────────────────────────────────┐
│          localStorageService.js (Service Layer)      │
│  • getExercises() / saveExercise()                  │
│  • getWorkoutTemplates() / saveWorkoutTemplate()    │
│  • getCompletedWorkouts() / saveCompletedWorkout()  │
│  • getPreferences() / savePreferences()             │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ Browser API
                       ▼
┌─────────────────────────────────────────────────────┐
│               Browser localStorage                   │
│  • workout_tracker_exercises                        │
│  • workout_tracker_templates                        │
│  • workout_tracker_completed                        │
│  • workout_tracker_preferences                      │
└─────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App.jsx (Router + WorkoutProvider)
│
├── Layout.jsx
│   ├── {children} (Page content)
│   └── NavBar.jsx
│       ├── Home Link (/)
│       ├── History Link (/history)
│       ├── Statistics Link (/statistics)
│       └── Admin Link (/admin)
│
└── Routes
    ├── Home.jsx
    │   └── Button.jsx (multiple instances)
    │
    ├── CreateWorkout.jsx
    │   └── Button.jsx (multiple instances)
    │
    ├── ActiveWorkout.jsx
    │   └── Button.jsx (multiple instances)
    │
    ├── History.jsx
    │   └── Button.jsx (multiple instances)
    │
    ├── Statistics.jsx
    │   ├── Button.jsx
    │   └── Recharts Components (LineChart, Line, XAxis, etc.)
    │
    └── Admin.jsx
        └── Button.jsx (multiple instances)
```

### Shared Components

**Layout.jsx**
- Purpose: Consistent page wrapper for all routes
- Responsibilities: Renders page content + navigation bar
- Props: `children` (page content)

**NavBar.jsx**
- Purpose: Bottom navigation with route links
- Responsibilities: Highlights active route, provides navigation
- State: Uses `useLocation()` to track current route

**Button.jsx**
- Purpose: Reusable button with consistent styling
- Props: `children`, `onClick`, `variant`, `size`, `disabled`, `className`, `type`
- Variants: `primary`, `secondary`, `success`, `danger`, `ghost`
- Sizes: `sm`, `md`, `lg`

**ExercisePersonalizationModal.jsx**
- Purpose: Customize exercise parameters for a specific workout template
- Responsibilities: Allow users to modify sets, per-set reps, and rest time
- Props: `isOpen`, `onClose`, `exercise`, `templateId`, `currentConfig`, `defaultConfig`, `onSave`, `onReset`, `currentSetsInWorkout`
- Features:
  - Adjust number of sets (1-10)
  - Set different rep targets for each set (1-50 reps)
  - Quick set all reps to same value
  - Customize rest time (10-600 seconds) with preset buttons
  - Visual indicators for personalized exercises
  - Reset to default configuration

**ExerciseSwitcherModal.jsx**
- Purpose: Switch exercises during an active workout
- Responsibilities: Allow users to replace an exercise with another from the library
- Props: `isOpen`, `onClose`, `onSelectExercise`, `currentExerciseId`, `allExercises`, `exercisesInWorkout`
- Features:
  - Search exercises by name or muscle group
  - Filter by muscle group tabs
  - Visual indicators for current exercise and exercises already in workout
  - Prevents switching to the same exercise

---

## Performance Considerations

### Bundle Size Optimization
- Vite tree-shaking eliminates unused code
- Tailwind purges unused CSS classes
- Recharts is the heaviest dependency (~200KB)
- Total bundle size: ~300KB (gzipped)

### Caching Strategy
- Service Worker caches all static assets
- Network-first ensures fresh content
- localStorage access is synchronous (fast)

### Rendering Performance
- React 19 automatic optimizations
- No virtualization needed (lists are small)
- Minimal re-renders (Context optimized with useMemo)

---

## Security Considerations

### Data Privacy
- All data stored locally (no server transmission)
- No analytics or tracking
- No third-party scripts

### XSS Protection
- React auto-escapes user input
- No `dangerouslySetInnerHTML` usage
- Vite CSP-friendly build

---

## Deployment

### Build Process
```bash
npm run build  # Creates /dist folder with optimized bundle
```

### Hosting Options
- **Vercel** (recommended: zero-config deployment)
- **Netlify** (supports PWA out of box)
- **GitHub Pages** (requires SPA routing config)
- **Any static host** (Cloudflare Pages, AWS S3, etc.)

### Service Worker Registration
- Only registered in production builds
- Development uses unregistered mode for faster iteration

---

## Future Architecture Considerations

### If Adding Backend (Future)
- Consider: Firebase, Supabase, or Pocketbase for BaaS
- Would enable: cross-device sync, cloud backup, social features
- Migration path: Export localStorage → Import to cloud DB

### If Scaling Up
- Consider: React Query for server state management
- Consider: Zustand or Jotai for client state (lighter than Redux)
- Consider: Virtualization for large workout history lists

### If Adding Native Features
- Consider: React Native or Capacitor for native wrapper
- Would enable: HealthKit integration, biometric auth, offline maps

---

## Maintenance & Evolution

### Code Standards
- ESLint enforces code quality
- React hooks rules prevent common mistakes
- Vite HMR enables fast iteration

### Testing Strategy (Current)
- Manual testing in development
- No automated tests currently
- Future: Consider Vitest + React Testing Library

### Monitoring
- Admin panel provides debugging tools
- localStorage inspection available
- No error tracking service (future: Sentry?)

---

This architecture prioritizes **simplicity**, **offline-first functionality**, and **mobile-first UX** while maintaining flexibility for future enhancements.
