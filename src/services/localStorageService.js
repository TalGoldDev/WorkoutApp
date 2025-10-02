const STORAGE_KEYS = {
  EXERCISES: 'workout_tracker_exercises',
  WORKOUT_TEMPLATES: 'workout_tracker_templates',
  COMPLETED_WORKOUTS: 'workout_tracker_completed',
  PREFERENCES: 'workout_tracker_preferences',
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
