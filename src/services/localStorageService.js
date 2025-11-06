const STORAGE_KEYS = {
  EXERCISES: 'workout_tracker_exercises',
  WORKOUT_TEMPLATES: 'workout_tracker_templates',
  COMPLETED_WORKOUTS: 'workout_tracker_completed',
  PREFERENCES: 'workout_tracker_preferences',
  TEMPLATE_PERSONALIZATIONS: 'workout_tracker_template_personalizations',
  INDICATION_DISMISSALS: 'workout_tracker_indication_dismissals',
};

// Data version - increment this when seed data changes
const DATA_VERSION = 2;

/**
 * Get data from localStorage
 */
const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Set data in localStorage
 */
const setData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

// ============= EXERCISES =============

export const getExercises = () => {
  return getData(STORAGE_KEYS.EXERCISES) || [];
};

export const saveExercises = (exercises) => {
  return setData(STORAGE_KEYS.EXERCISES, exercises);
};

export const addExercise = (exercise) => {
  const exercises = getExercises();
  exercises.push(exercise);
  return saveExercises(exercises);
};

export const updateExercise = (id, updatedExercise) => {
  const exercises = getExercises();
  const index = exercises.findIndex((ex) => ex.id === id);
  if (index !== -1) {
    exercises[index] = { ...exercises[index], ...updatedExercise };
    return saveExercises(exercises);
  }
  return false;
};

export const deleteExercise = (id) => {
  const exercises = getExercises();
  const filtered = exercises.filter((ex) => ex.id !== id);
  return saveExercises(filtered);
};

export const getExerciseById = (id) => {
  const exercises = getExercises();
  return exercises.find((ex) => ex.id === id);
};

// ============= WORKOUT TEMPLATES =============

export const getWorkoutTemplates = () => {
  return getData(STORAGE_KEYS.WORKOUT_TEMPLATES) || [];
};

export const saveWorkoutTemplates = (templates) => {
  return setData(STORAGE_KEYS.WORKOUT_TEMPLATES, templates);
};

export const addWorkoutTemplate = (template) => {
  const templates = getWorkoutTemplates();
  templates.push(template);
  return saveWorkoutTemplates(templates);
};

export const updateWorkoutTemplate = (id, updatedTemplate) => {
  const templates = getWorkoutTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updatedTemplate };
    return saveWorkoutTemplates(templates);
  }
  return false;
};

export const deleteWorkoutTemplate = (id) => {
  const templates = getWorkoutTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  return saveWorkoutTemplates(filtered);
};

export const getWorkoutTemplateById = (id) => {
  const templates = getWorkoutTemplates();
  return templates.find((t) => t.id === id);
};

// ============= COMPLETED WORKOUTS =============

export const getCompletedWorkouts = () => {
  return getData(STORAGE_KEYS.COMPLETED_WORKOUTS) || [];
};

export const saveCompletedWorkouts = (workouts) => {
  return setData(STORAGE_KEYS.COMPLETED_WORKOUTS, workouts);
};

export const addCompletedWorkout = (workout) => {
  const workouts = getCompletedWorkouts();
  workouts.push(workout);
  // Sort by completedAt descending (most recent first)
  workouts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  return saveCompletedWorkouts(workouts);
};

export const getCompletedWorkoutById = (id) => {
  const workouts = getCompletedWorkouts();
  return workouts.find((w) => w.id === id);
};

/**
 * Get workout history for a specific exercise
 */
export const getExerciseHistory = (exerciseId) => {
  const workouts = getCompletedWorkouts();
  const history = [];

  workouts.forEach((workout) => {
    const exercise = workout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (exercise) {
      // Get max weight from this workout
      const maxWeight = Math.max(...exercise.sets.map((set) => set.weight));
      history.push({
        date: workout.completedAt,
        weight: maxWeight,
        workoutName: workout.workoutName,
      });
    }
  });

  // Sort by date ascending (oldest first)
  return history.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Update an existing completed workout
 */
export const updateCompletedWorkout = (id, updatedWorkout) => {
  const workouts = getCompletedWorkouts();
  const index = workouts.findIndex((w) => w.id === id);
  if (index !== -1) {
    workouts[index] = { ...workouts[index], ...updatedWorkout };
    // Re-sort by completedAt descending (most recent first)
    workouts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    return saveCompletedWorkouts(workouts);
  }
  return false;
};

/**
 * Delete a completed workout
 */
export const deleteCompletedWorkout = (id) => {
  const workouts = getCompletedWorkouts();
  const filtered = workouts.filter((w) => w.id !== id);
  return saveCompletedWorkouts(filtered);
};

/**
 * Check if a workout can be edited (within 2 days of completion)
 */
export const isWorkoutEditable = (completedAt) => {
  const now = new Date();
  const workoutDate = new Date(completedAt);
  const diffInMs = now - workoutDate;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours <= 48; // 2 days = 48 hours
};

/**
 * Get remaining hours until workout can no longer be edited
 */
export const getEditableHoursRemaining = (completedAt) => {
  const now = new Date();
  const workoutDate = new Date(completedAt);
  const diffInMs = now - workoutDate;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const remaining = 48 - diffInHours;
  return remaining > 0 ? Math.ceil(remaining) : 0;
};

// ============= PREFERENCES =============

export const getPreferences = () => {
  return getData(STORAGE_KEYS.PREFERENCES) || { weightUnit: 'kg', dataVersion: 0 };
};

export const savePreferences = (preferences) => {
  return setData(STORAGE_KEYS.PREFERENCES, preferences);
};

/**
 * Get current data version from preferences
 */
const getDataVersion = () => {
  const prefs = getPreferences();
  return prefs.dataVersion || 0;
};

/**
 * Update data version in preferences
 */
const setDataVersion = (version) => {
  const prefs = getPreferences();
  prefs.dataVersion = version;
  savePreferences(prefs);
};

// ============= TEMPLATE PERSONALIZATIONS =============

/**
 * Get all template personalizations
 * Structure: { [templateId]: { [exerciseId]: { sets, maxReps, restTime, lastModified } } }
 */
export const getTemplatePersonalizations = () => {
  return getData(STORAGE_KEYS.TEMPLATE_PERSONALIZATIONS) || {};
};

/**
 * Save all template personalizations
 */
export const saveTemplatePersonalizations = (personalizations) => {
  return setData(STORAGE_KEYS.TEMPLATE_PERSONALIZATIONS, personalizations);
};

/**
 * Get personalizations for a specific template
 */
export const getTemplatePersonalizationsById = (templateId) => {
  const allPersonalizations = getTemplatePersonalizations();
  return allPersonalizations[templateId] || {};
};

/**
 * Get personalization for a specific exercise in a template
 */
export const getExercisePersonalization = (templateId, exerciseId) => {
  const templatePersonalizations = getTemplatePersonalizationsById(templateId);
  return templatePersonalizations[exerciseId] || null;
};

/**
 * Save personalization for an exercise in a template
 */
export const saveExercisePersonalization = (templateId, exerciseId, config) => {
  const allPersonalizations = getTemplatePersonalizations();

  // Initialize template personalizations if not exists
  if (!allPersonalizations[templateId]) {
    allPersonalizations[templateId] = {};
  }

  // Save the personalization with timestamp
  allPersonalizations[templateId][exerciseId] = {
    sets: config.sets,
    maxReps: config.maxReps,
    restTime: config.restTime || 90,
    lastModified: new Date().toISOString(),
  };

  return saveTemplatePersonalizations(allPersonalizations);
};

/**
 * Delete personalization for a specific exercise in a template
 */
export const deleteExercisePersonalization = (templateId, exerciseId) => {
  const allPersonalizations = getTemplatePersonalizations();

  if (allPersonalizations[templateId]) {
    delete allPersonalizations[templateId][exerciseId];

    // Clean up empty template objects
    if (Object.keys(allPersonalizations[templateId]).length === 0) {
      delete allPersonalizations[templateId];
    }

    return saveTemplatePersonalizations(allPersonalizations);
  }

  return false;
};

/**
 * Delete all personalizations for a template
 */
export const deleteTemplatePersonalizations = (templateId) => {
  const allPersonalizations = getTemplatePersonalizations();
  delete allPersonalizations[templateId];
  return saveTemplatePersonalizations(allPersonalizations);
};

/**
 * Check if an exercise has personalization in a template
 */
export const hasExercisePersonalization = (templateId, exerciseId) => {
  const personalization = getExercisePersonalization(templateId, exerciseId);
  return personalization !== null;
};

/**
 * Get personalization count for a template
 */
export const getPersonalizationCount = (templateId) => {
  const templatePersonalizations = getTemplatePersonalizationsById(templateId);
  return Object.keys(templatePersonalizations).length;
};

// ============= INDICATION DISMISSALS =============

/**
 * Get all indication dismissals
 */
const getIndicationDismissals = () => {
  return getData(STORAGE_KEYS.INDICATION_DISMISSALS) || {};
};

/**
 * Save indication dismissals
 */
const saveIndicationDismissals = (dismissals) => {
  setData(STORAGE_KEYS.INDICATION_DISMISSALS, dismissals);
};

/**
 * Get dismissal info for a specific exercise and type
 * @param {string} exerciseId
 * @param {'increase' | 'decrease'} type
 * @returns {object | null} Dismissal info with { dismissedAt, lastWorkoutId } or null
 */
export const getIndicationDismissal = (exerciseId, type) => {
  const dismissals = getIndicationDismissals();
  return dismissals[exerciseId]?.[type] || null;
};

/**
 * Dismiss increase weight indication for an exercise
 * @param {string} exerciseId
 */
export const dismissIncreaseWeightIndication = (exerciseId) => {
  const dismissals = getIndicationDismissals();
  const workouts = getCompletedWorkouts();
  const latestWorkout = workouts.find((w) =>
    w.exercises.some((ex) => ex.exerciseId === exerciseId)
  );

  if (!dismissals[exerciseId]) {
    dismissals[exerciseId] = {};
  }

  dismissals[exerciseId].increase = {
    dismissedAt: Date.now(),
    lastWorkoutId: latestWorkout?.id || null,
  };

  saveIndicationDismissals(dismissals);
};

/**
 * Dismiss reduce weight indication for an exercise
 * @param {string} exerciseId
 */
export const dismissReduceWeightIndication = (exerciseId) => {
  const dismissals = getIndicationDismissals();
  const workouts = getCompletedWorkouts();
  const latestWorkout = workouts.find((w) =>
    w.exercises.some((ex) => ex.exerciseId === exerciseId)
  );

  if (!dismissals[exerciseId]) {
    dismissals[exerciseId] = {};
  }

  dismissals[exerciseId].decrease = {
    dismissedAt: Date.now(),
    lastWorkoutId: latestWorkout?.id || null,
  };

  saveIndicationDismissals(dismissals);
};

/**
 * Clear dismissal for a specific indication type
 * @param {string} exerciseId
 * @param {'increase' | 'decrease'} type
 */
export const clearIndicationDismissal = (exerciseId, type) => {
  const dismissals = getIndicationDismissals();
  if (dismissals[exerciseId]) {
    delete dismissals[exerciseId][type];
    if (Object.keys(dismissals[exerciseId]).length === 0) {
      delete dismissals[exerciseId];
    }
    saveIndicationDismissals(dismissals);
  }
};

/**
 * Process indication dismissals when a workout is completed
 * - Always dismiss reduce indication for all exercises
 * - Dismiss increase indication if user increased weight
 * @param {object} completedWorkout The workout that was just completed
 */
export const processWorkoutIndicationDismissals = (completedWorkout) => {
  if (!completedWorkout || !completedWorkout.exercises) return;

  const workouts = getCompletedWorkouts();

  completedWorkout.exercises.forEach((exercise) => {
    const exerciseId = exercise.exerciseId;

    // Get the weight used in this workout (from first set that has weight)
    const currentWeight = exercise.sets.find((set) => set.weight > 0)?.weight || 0;

    // Find the previous workout with this exercise
    const previousWorkout = workouts.find(
      (w) =>
        w.id !== completedWorkout.id &&
        w.exercises.some((ex) => ex.exerciseId === exerciseId)
    );

    let previousWeight = 0;
    if (previousWorkout) {
      const previousExercise = previousWorkout.exercises.find(
        (ex) => ex.exerciseId === exerciseId
      );
      previousWeight = previousExercise?.sets.find((set) => set.weight > 0)?.weight || 0;
    }

    // Always dismiss reduce indication on workout completion (per requirements)
    dismissReduceWeightIndication(exerciseId);

    // Dismiss increase indication if weight was increased
    if (currentWeight > 0 && previousWeight > 0 && currentWeight > previousWeight) {
      dismissIncreaseWeightIndication(exerciseId);
    }
  });
};

// ============= WEIGHT RECOMMENDATION SYSTEM =============

/**
 * Check if user should increase weight for an exercise
 * Returns true if the last 2 workouts had ALL sets completed with max reps
 * Respects dismissals - only shows indication if conditions are met AFTER user acted on previous indication
 */
export const shouldIncreaseWeight = (exerciseId) => {
  const workouts = getCompletedWorkouts();

  // Filter workouts that contain this exercise
  let workoutsWithExercise = workouts.filter((workout) => {
    return workout.exercises.some((ex) => ex.exerciseId === exerciseId);
  });

  // Check if indication was dismissed (user increased weight previously)
  const dismissal = getIndicationDismissal(exerciseId, 'increase');
  if (dismissal) {
    // Filter to only include workouts AFTER the dismissal
    workoutsWithExercise = workoutsWithExercise.filter((workout) => {
      const workoutTimestamp = new Date(workout.completedAt).getTime();
      return workoutTimestamp > dismissal.dismissedAt;
    });
  }

  // Need at least 2 workouts to check
  if (workoutsWithExercise.length < 2) {
    return false;
  }

  // Check the last 2 workouts (workouts are already sorted by date descending)
  const lastTwoWorkouts = workoutsWithExercise.slice(0, 2);

  // Both workouts must have ALL sets completed with max reps
  for (const workout of lastTwoWorkouts) {
    const exercise = workout.exercises.find((ex) => ex.exerciseId === exerciseId);

    if (!exercise || !exercise.sets || exercise.sets.length === 0) {
      return false;
    }

    // Check if ALL sets were completed with max reps
    const allSetsMaxReps = exercise.sets.every((set) => {
      return set.completed && set.completedReps === set.maxReps;
    });

    if (!allSetsMaxReps) {
      return false;
    }
  }

  // Conditions are met! Clear the dismissal so indication can show again
  if (dismissal) {
    clearIndicationDismissal(exerciseId, 'increase');
  }

  return true;
};

/**
 * Check if user should reduce weight for an exercise
 * Returns true if the last 3 workouts had at least one set that failed to complete max reps
 * Respects dismissals - only shows indication if conditions are met AFTER user acted on previous indication
 */
export const shouldReduceWeight = (exerciseId) => {
  const workouts = getCompletedWorkouts();

  // Filter workouts that contain this exercise
  let workoutsWithExercise = workouts.filter((workout) => {
    return workout.exercises.some((ex) => ex.exerciseId === exerciseId);
  });

  // Check if indication was dismissed (user reduced weight or completed workout)
  const dismissal = getIndicationDismissal(exerciseId, 'decrease');
  if (dismissal) {
    // Filter to only include workouts AFTER the dismissal
    workoutsWithExercise = workoutsWithExercise.filter((workout) => {
      const workoutTimestamp = new Date(workout.completedAt).getTime();
      return workoutTimestamp > dismissal.dismissedAt;
    });
  }

  // Need at least 3 workouts to check
  if (workoutsWithExercise.length < 3) {
    return false;
  }

  // Check the last 3 workouts (workouts are already sorted by date descending)
  const lastThreeWorkouts = workoutsWithExercise.slice(0, 3);

  // All 3 workouts must have at least one failed set
  for (const workout of lastThreeWorkouts) {
    const exercise = workout.exercises.find((ex) => ex.exerciseId === exerciseId);

    if (!exercise || !exercise.sets || exercise.sets.length === 0) {
      return false;
    }

    // Check if at least one set failed (not completed OR completed but less than max reps)
    const hasFailedSet = exercise.sets.some((set) => {
      return !set.completed || set.completedReps < set.maxReps;
    });

    if (!hasFailedSet) {
      // If any workout doesn't have a failed set, don't recommend reducing
      return false;
    }
  }

  // Conditions are met! Clear the dismissal so indication can show again
  if (dismissal) {
    clearIndicationDismissal(exerciseId, 'decrease');
  }

  return true;
};

/**
 * Get weight recommendation for an exercise
 * Returns 'increase', 'decrease', or null
 * Note: Increase takes precedence over decrease (mutually exclusive)
 */
export const getWeightRecommendation = (exerciseId) => {
  if (shouldIncreaseWeight(exerciseId)) {
    return 'increase';
  }

  if (shouldReduceWeight(exerciseId)) {
    return 'decrease';
  }

  return null;
};

/**
 * Get the last used weight for an exercise
 * Returns the weight from the most recent workout, or 0 if no history exists
 */
export const getLastUsedWeight = (exerciseId) => {
  const workouts = getCompletedWorkouts();

  // Find the most recent workout that contains this exercise
  for (const workout of workouts) {
    const exercise = workout.exercises.find((ex) => ex.exerciseId === exerciseId);

    if (exercise && exercise.sets && exercise.sets.length > 0) {
      // Get the weight from the first set (or could use max weight)
      // Using first set as it represents the working weight for that session
      const weight = exercise.sets[0].weight || 0;
      return weight;
    }
  }

  return 0; // No history found
};

// ============= SEED DATA =============

/**
 * Initialize the app with some default exercises if none exist
 */
export const seedDefaultExercises = () => {
  const currentVersion = getDataVersion();

  // If data version is outdated, clear and re-seed
  if (currentVersion < DATA_VERSION) {
    // Clear existing exercises and templates (but keep completed workouts)
    saveExercises([]);
    saveWorkoutTemplates([]);
    const defaultExercises = [
      // Chest
      { id: crypto.randomUUID(), name: 'Barbell Bench Press', emoji: '💪', defaultSets: 4, muscleGroup: 'Chest', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Incline Dumbbell Bench Press', emoji: '💪', defaultSets: 4, muscleGroup: 'Chest', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Incline Barbell Bench Press', emoji: '💪', defaultSets: 4, muscleGroup: 'Chest', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Flat Bench Dumbbell Flye', emoji: '🦅', defaultSets: 4, muscleGroup: 'Chest', isCustom: false, createdAt: new Date().toISOString() },

      // Back
      { id: crypto.randomUUID(), name: 'Bent Over Row', emoji: '🚣', defaultSets: 4, muscleGroup: 'Back', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Lat Pull Down', emoji: '⬇️', defaultSets: 4, muscleGroup: 'Back', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Seated Cable Row', emoji: '🚣', defaultSets: 4, muscleGroup: 'Back', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'One Arm Dumbbell Row', emoji: '💪', defaultSets: 4, muscleGroup: 'Back', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Deadlift', emoji: '🏋️', defaultSets: 4, muscleGroup: 'Back', isCustom: false, createdAt: new Date().toISOString() },

      // Shoulders
      { id: crypto.randomUUID(), name: 'Overhead Press', emoji: '🤸', defaultSets: 3, muscleGroup: 'Shoulders', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Dumbbell Lateral Raise', emoji: '🦅', defaultSets: 4, muscleGroup: 'Shoulders', isCustom: false, createdAt: new Date().toISOString() },

      // Arms
      { id: crypto.randomUUID(), name: 'Barbell Curl', emoji: '💪', defaultSets: 3, muscleGroup: 'Arms', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Seated Incline Dumbbell Curl', emoji: '💪', defaultSets: 4, muscleGroup: 'Arms', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Skullcrusher', emoji: '💀', defaultSets: 3, muscleGroup: 'Arms', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Cable Tricep Extension', emoji: '💪', defaultSets: 4, muscleGroup: 'Arms', isCustom: false, createdAt: new Date().toISOString() },

      // Legs
      { id: crypto.randomUUID(), name: 'Squat', emoji: '🦵', defaultSets: 4, muscleGroup: 'Legs', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Front Squat', emoji: '🦵', defaultSets: 4, muscleGroup: 'Legs', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Leg Press', emoji: '🦿', defaultSets: 4, muscleGroup: 'Legs', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Leg Curl', emoji: '🦵', defaultSets: 4, muscleGroup: 'Legs', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Leg Extension', emoji: '🦵', defaultSets: 4, muscleGroup: 'Legs', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Barbell Lunge', emoji: '🚶', defaultSets: 4, muscleGroup: 'Legs', isCustom: false, createdAt: new Date().toISOString() },

      // Calves
      { id: crypto.randomUUID(), name: 'Standing Calf Raise', emoji: '🦶', defaultSets: 4, muscleGroup: 'Calves', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Seated Calf Raise', emoji: '🦶', defaultSets: 4, muscleGroup: 'Calves', isCustom: false, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Calf Press', emoji: '🦶', defaultSets: 4, muscleGroup: 'Calves', isCustom: false, createdAt: new Date().toISOString() },
    ];

    saveExercises(defaultExercises);

    // Helper function to find exercise by name
    const findExercise = (name) => defaultExercises.find(ex => ex.name === name);

    // Create PHAT workout templates
    const phatWorkouts = [
      {
        id: crypto.randomUUID(),
        name: 'Day 1 - Upper Power',
        exercises: [
          { exerciseId: findExercise('Barbell Bench Press').id, order: 1, sets: 4 },
          { exerciseId: findExercise('Incline Dumbbell Bench Press').id, order: 2, sets: 4 },
          { exerciseId: findExercise('Bent Over Row').id, order: 3, sets: 4 },
          { exerciseId: findExercise('Lat Pull Down').id, order: 4, sets: 4 },
          { exerciseId: findExercise('Overhead Press').id, order: 5, sets: 3 },
          { exerciseId: findExercise('Barbell Curl').id, order: 6, sets: 3 },
          { exerciseId: findExercise('Skullcrusher').id, order: 7, sets: 3 },
        ],
        isPrebuilt: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Day 2 - Lower Power',
        exercises: [
          { exerciseId: findExercise('Squat').id, order: 1, sets: 4 },
          { exerciseId: findExercise('Deadlift').id, order: 2, sets: 4 },
          { exerciseId: findExercise('Leg Press').id, order: 3, sets: 5 },
          { exerciseId: findExercise('Leg Curl').id, order: 4, sets: 4 },
          { exerciseId: findExercise('Standing Calf Raise').id, order: 5, sets: 4 },
        ],
        isPrebuilt: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Day 4 - Upper Hypertrophy',
        exercises: [
          { exerciseId: findExercise('Incline Barbell Bench Press').id, order: 1, sets: 4 },
          { exerciseId: findExercise('Flat Bench Dumbbell Flye').id, order: 2, sets: 4 },
          { exerciseId: findExercise('Seated Cable Row').id, order: 3, sets: 4 },
          { exerciseId: findExercise('One Arm Dumbbell Row').id, order: 4, sets: 4 },
          { exerciseId: findExercise('Dumbbell Lateral Raise').id, order: 5, sets: 4 },
          { exerciseId: findExercise('Seated Incline Dumbbell Curl').id, order: 6, sets: 4 },
          { exerciseId: findExercise('Cable Tricep Extension').id, order: 7, sets: 4 },
        ],
        isPrebuilt: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Day 5 - Lower Hypertrophy',
        exercises: [
          { exerciseId: findExercise('Front Squat').id, order: 1, sets: 4 },
          { exerciseId: findExercise('Barbell Lunge').id, order: 2, sets: 4 },
          { exerciseId: findExercise('Leg Extension').id, order: 3, sets: 4 },
          { exerciseId: findExercise('Leg Curl').id, order: 4, sets: 4 },
          { exerciseId: findExercise('Seated Calf Raise').id, order: 5, sets: 4 },
          { exerciseId: findExercise('Calf Press').id, order: 6, sets: 4 },
        ],
        isPrebuilt: true,
        createdAt: new Date().toISOString(),
      },
    ];

    // Add all PHAT workout templates
    phatWorkouts.forEach(workout => addWorkoutTemplate(workout));

    // Update data version
    setDataVersion(DATA_VERSION);
  }
};
