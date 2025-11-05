# Common Mistakes & Troubleshooting

**Last Updated:** 2025-11-05

---

## Overview

This document captures common mistakes, bugs, and gotchas encountered during WorkoutApp development. Each entry includes the problem, why it happens, how to fix it, and how to prevent it.

**Purpose:** Prevent repeated mistakes and provide quick solutions to known issues.

---

## Table of Contents

1. [localStorage Issues](#localstorage-issues)
2. [PWA & Service Worker Issues](#pwa--service-worker-issues)
3. [React State Management](#react-state-management)
4. [Styling & Layout Issues](#styling--layout-issues)
5. [Data Validation Issues](#data-validation-issues)

---

## localStorage Issues

### 1. Data Not Persisting After Refresh

**Symptom:** Changes made in the app disappear after page reload.

**Why it happens:**
- localStorage writes may fail silently if quota is exceeded
- Private browsing mode blocks localStorage
- Code is reading from wrong storage key
- Not calling save methods after state updates

**How to fix:**
```javascript
// ❌ Wrong: Only updating state
setExercises([...exercises, newExercise]);

// ✅ Correct: Update state AND persist
const updated = [...exercises, newExercise];
setExercises(updated);
localStorageService.saveExercise(newExercise);
```

**How to prevent:**
- Always use service layer methods (localStorageService) for data operations
- Check browser console for localStorage errors
- Test in incognito mode to catch storage issues
- Verify data with DevTools → Application → Local Storage

---

### 2. Seed Data Overwriting User Data

**Symptom:** User-created exercises disappear after app update.

**Why it happens:**
- `seedDefaultExercises()` may replace entire exercises array
- Data version not incremented properly
- Not filtering custom exercises before re-seeding

**How to fix:**
```javascript
// ✅ Correct approach in seedDefaultExercises()
const existing = getExercises();
const customExercises = existing.filter(ex => ex.isCustom);
const seedExercises = [...DEFAULT_EXERCISES];
const merged = [...customExercises, ...seedExercises];
// Save merged array
```

**How to prevent:**
- Always preserve `isCustom: true` exercises during seeding
- Test seed data updates with existing user data
- Use data versioning to trigger migrations safely
- Document seed data changes in schema documentation

---

### 3. localStorage Quota Exceeded

**Symptom:** "QuotaExceededError" in console, data not saving.

**Why it happens:**
- localStorage has ~5-10MB limit
- Completed workouts grow unbounded over time
- Large objects being stringified inefficiently

**How to fix:**
```javascript
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Show user error message
    alert('Storage full. Please export and delete old workouts.');
    // Or implement automatic cleanup
  }
}
```

**How to prevent:**
- Monitor completed workouts count (warn at >500)
- Implement auto-archival of old workouts (>6 months)
- Provide export/cleanup tools in Admin panel
- Use denormalized data sparingly

---

## PWA & Service Worker Issues

### 4. Service Worker Not Updating

**Symptom:** App shows old version after deployment, hard refresh required.

**Why it happens:**
- Service Worker caches aggressively
- Browser doesn't detect new SW version
- Cache name not updated in new deployment

**How to fix:**
```javascript
// 1. Update cache version in service-worker.js
const CACHE_VERSION = 'workout-tracker-v2'; // Increment version

// 2. Clear old caches in activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      );
    })
  );
});

// 3. Force refresh after update
navigator.serviceWorker.register('/service-worker.js').then(reg => {
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'activated') {
        window.location.reload();
      }
    });
  });
});
```

**How to prevent:**
- Increment `CACHE_VERSION` with every deployment
- Test PWA updates in production-like environment
- Use `skipWaiting()` for immediate activation
- Add update notification to UI

---

### 5. Notifications Not Working on iOS

**Symptom:** Notifications don't show on iPhone/iPad.

**Why it happens:**
- iOS Safari PWAs have limited notification support
- Notifications API requires user gesture
- Service Worker notifications not fully supported on iOS

**How to fix:**
- Accept limitation (iOS PWA notifications are restricted)
- Fall back to visual indicators (on-screen alerts)
- Use Notification.permission to detect support

```javascript
// ✅ Graceful fallback
if (Notification.permission === 'granted') {
  // Send notification
  showNotification();
} else {
  // Use visual indicator instead
  showOnScreenAlert('Rest timer complete!');
}
```

**How to prevent:**
- Document iOS limitations in user-facing docs
- Test on actual iOS devices (not just Safari on Mac)
- Provide alternative feedback mechanisms
- Consider native app wrapper (Capacitor) if notifications critical

---

### 6. Wake Lock Not Releasing

**Symptom:** Screen stays on after workout ends, draining battery.

**Why it happens:**
- Wake Lock not released in cleanup
- Component unmounts without releasing lock
- Error in release logic

**How to fix:**
```javascript
// ✅ Correct pattern in ActiveWorkout.jsx
useEffect(() => {
  let wakeLock = null;

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.error('Wake Lock failed:', err);
    }
  };

  requestWakeLock();

  // Cleanup function
  return () => {
    if (wakeLock) {
      wakeLock.release()
        .then(() => {
          wakeLock = null;
        });
    }
  };
}, []);
```

**How to prevent:**
- Always use cleanup functions in useEffect
- Test navigation away from active workout
- Log wake lock status in console during development
- Add manual release button in Admin panel for debugging

---

## React State Management

### 7. Context Not Updating After Data Change

**Symptom:** UI doesn't reflect data changes, even after updating localStorage.

**Why it happens:**
- State update not triggering re-render
- Component not consuming context properly
- State mutation instead of creating new reference

**How to fix:**
```javascript
// ❌ Wrong: Mutating state
exercises.push(newExercise); // Doesn't trigger re-render
setExercises(exercises);

// ✅ Correct: Create new array
setExercises([...exercises, newExercise]);

// ✅ Also correct: Using filter for deletion
setExercises(exercises.filter(ex => ex.id !== deleteId));
```

**How to prevent:**
- Always create new objects/arrays for state updates
- Use immutable update patterns
- Enable React DevTools to inspect state changes
- Use `useMemo` for expensive computations

---

### 8. Infinite Re-render Loop

**Symptom:** Browser freezes, "Maximum update depth exceeded" error.

**Why it happens:**
- State update inside render (not in useEffect)
- useEffect missing dependencies
- Object/array in dependency array without memoization

**How to fix:**
```javascript
// ❌ Wrong: State update in render
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Infinite loop!
  return <div>{count}</div>;
}

// ✅ Correct: Update in effect or event handler
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(c => c + 1);
  }, []); // Runs once

  return <div>{count}</div>;
}
```

**How to prevent:**
- Never call setState directly in render
- Add ESLint rule: `react-hooks/exhaustive-deps`
- Use useCallback for function dependencies
- Use useMemo for object/array dependencies

---

## Styling & Layout Issues

### 9. Bottom Navigation Covered by Content

**Symptom:** Page content extends behind bottom navigation bar.

**Why it happens:**
- Fixed positioning without padding compensation
- Content container doesn't account for nav height

**How to fix:**
```javascript
// ✅ Add padding to content container
<div className="pb-20"> {/* 80px for nav bar */}
  {/* Page content */}
</div>

// Layout.jsx already handles this:
<div className="min-h-screen flex flex-col">
  <div className="flex-1 pb-20">
    {children}
  </div>
  <NavBar />
</div>
```

**How to prevent:**
- Always test scrolling on mobile viewport
- Use Layout component for all pages
- Test on actual mobile devices (not just browser DevTools)

---

### 10. Tailwind Classes Not Applying

**Symptom:** CSS classes in code don't affect styling.

**Why it happens:**
- Tailwind purge removed classes (not in content paths)
- Dynamic class names not detected by Tailwind
- CSS specificity issues

**How to fix:**
```javascript
// ❌ Wrong: Dynamic class names
const color = 'red';
<div className={`text-${color}-500`}> // Won't work!

// ✅ Correct: Full class names
const colorClass = color === 'red' ? 'text-red-500' : 'text-blue-500';
<div className={colorClass}>

// Or use safelist in tailwind.config.js
module.exports = {
  safelist: [
    'text-red-500',
    'text-blue-500',
  ]
}
```

**How to prevent:**
- Use complete class names (not string concatenation)
- Check `tailwind.config.js` content paths include all files
- Run `npm run build` and check output CSS
- Use browser DevTools to verify classes are present

---

## Data Validation Issues

### 11. Negative Weights Allowed

**Symptom:** User enters -100 lbs, data saves without error.

**Why it happens:**
- No validation on weight input
- `isPositiveNumber()` not called before saving

**How to fix:**
```javascript
// ✅ Validate before saving
const handleWeightChange = (value) => {
  const weight = parseFloat(value);

  if (!isPositiveNumber(weight)) {
    setError('Weight must be positive');
    return;
  }

  setWorkingWeight(weight);
};
```

**How to prevent:**
- Use input type="number" with min attribute
- Validate in onChange handlers
- Validate again in service layer (defense in depth)
- Add unit tests for validation functions

---

### 12. Duplicate Exercise IDs

**Symptom:** Multiple exercises with same ID, causing render key errors.

**Why it happens:**
- Not using `generateId()` for new exercises
- Copying exercise object without changing ID
- Race condition in ID generation (unlikely with crypto.randomUUID)

**How to fix:**
```javascript
// ✅ Always generate new ID
const newExercise = {
  ...existingExercise,
  id: generateId(), // Create unique ID
  name: `${existingExercise.name} (Copy)`,
  isCustom: true
};
```

**How to prevent:**
- Always call `generateId()` for new entities
- Never manually set IDs
- Use UUID v4 (crypto.randomUUID) for strong uniqueness
- Add ID uniqueness check in dev mode

---

## Performance Issues

### 13. Statistics Page Slow with Large History

**Symptom:** Statistics page takes 3+ seconds to load with 200+ workouts.

**Why it happens:**
- Recalculating exercise history on every render
- No memoization of chart data
- Loading all workouts instead of filtering early

**How to fix:**
```javascript
// ✅ Use useMemo for expensive calculations
const exerciseHistory = useMemo(() => {
  return getExerciseHistory(selectedExerciseId);
}, [selectedExerciseId, completedWorkouts]);

// ✅ Filter early in service layer
const getExerciseHistory = (exerciseId) => {
  return completedWorkouts
    .filter(workout =>
      workout.exercises.some(ex => ex.exerciseId === exerciseId)
    )
    .map(workout => ({
      date: workout.startTime,
      maxWeight: Math.max(...workout.exercises
        .filter(ex => ex.exerciseId === exerciseId)
        .flatMap(ex => ex.sets.map(s => s.weight))
      )
    }));
};
```

**How to prevent:**
- Use React DevTools Profiler to identify slow renders
- Memoize expensive computations
- Use `React.memo` for component optimization
- Consider virtualization for large lists (react-window)

---

## Common Anti-Patterns

### ❌ Don't: Access localStorage Directly

```javascript
// ❌ Bad
const data = JSON.parse(localStorage.getItem('workout_tracker_exercises'));

// ✅ Good
const data = localStorageService.getExercises();
```

**Why:** Service layer provides consistent interface, error handling, and validation.

---

### ❌ Don't: Hardcode Storage Keys

```javascript
// ❌ Bad
localStorage.setItem('exercises', JSON.stringify(exercises));

// ✅ Good
localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
```

**Why:** Centralized constants prevent typos and make refactoring easier.

---

### ❌ Don't: Forget Error Boundaries

```javascript
// ✅ Add error boundaries for PWA features
try {
  await navigator.wakeLock.request('screen');
} catch (err) {
  console.error('Wake Lock failed:', err);
  // Graceful degradation
}
```

**Why:** PWA APIs aren't supported everywhere. Always have fallbacks.

---

### ❌ Don't: Skip Data Validation

```javascript
// ❌ Bad
const weight = parseFloat(input.value);
updateWeight(weight); // Could be NaN, negative, etc.

// ✅ Good
const weight = parseFloat(input.value);
if (!isPositiveNumber(weight)) {
  showError('Invalid weight');
  return;
}
updateWeight(formatWeight(weight));
```

**Why:** User input is unpredictable. Always validate.

---

## Debugging Checklist

When encountering an issue:

- [ ] Check browser console for errors
- [ ] Inspect localStorage in DevTools (Application tab)
- [ ] Verify Service Worker status (Application → Service Workers)
- [ ] Check React DevTools for state/props
- [ ] Test in incognito mode (rules out extension conflicts)
- [ ] Test on mobile device (not just DevTools simulation)
- [ ] Check network tab for failed requests
- [ ] Review recent git commits for related changes
- [ ] Check if issue exists in production (not just local dev)

---

## Quick Fixes

### Clear All App Data
```javascript
// In browser console
localStorage.clear();
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
window.location.reload();
```

### Test Notification Permissions
```javascript
// In browser console
console.log('Permission:', Notification.permission);
Notification.requestPermission().then(p => console.log('New:', p));
```

### Inspect Wake Lock State
```javascript
// In browser console (during active workout)
navigator.wakeLock.request('screen')
  .then(lock => console.log('Wake Lock:', lock))
  .catch(err => console.error('Failed:', err));
```

### View All Workouts
```javascript
// In browser console
const workouts = JSON.parse(
  localStorage.getItem('workout_tracker_completed')
);
console.table(workouts);
```

---

## Getting Help

If you encounter an issue not covered here:

1. **Check Git History:** `git log --all --oneline --grep="keyword"`
2. **Search Issues:** Check GitHub issues for similar problems
3. **Add to This Doc:** Document the issue and solution for others
4. **Ask Team:** Reach out with context and debugging steps tried

---

## Contributing

Found a new mistake? Add it here:

1. Describe the symptom clearly
2. Explain why it happens
3. Provide fix with code example
4. Add prevention tips
5. Update "Last Updated" date
6. Commit with message: "docs: Add common mistake - [brief description]"

---

**Remember:** Mistakes are learning opportunities. Document them to help future developers (including future you!).
