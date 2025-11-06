import { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '../services/localStorageService';

const WorkoutContext = createContext();

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutContext must be used within WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider = ({ children }) => {
  const [exercises, setExercises] = useState([]);
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [templatePersonalizations, setTemplatePersonalizations] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [originalWorkoutId, setOriginalWorkoutId] = useState(null);
  const [originalCompletedAt, setOriginalCompletedAt] = useState(null);

  // Load data on mount
  useEffect(() => {
    storage.seedDefaultExercises();
    setExercises(storage.getExercises());
    setWorkoutTemplates(storage.getWorkoutTemplates());
    setCompletedWorkouts(storage.getCompletedWorkouts());
    setTemplatePersonalizations(storage.getTemplatePersonalizations());
  }, []);

  // Exercise methods
  const addExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      id: crypto.randomUUID(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    storage.addExercise(newExercise);
    setExercises(storage.getExercises());
    return newExercise;
  };

  const updateExercise = (id, updates) => {
    storage.updateExercise(id, updates);
    setExercises(storage.getExercises());
  };

  const deleteExerciseById = (id) => {
    storage.deleteExercise(id);
    setExercises(storage.getExercises());
  };

  // Workout template methods
  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
      isPrebuilt: false,
      createdAt: new Date().toISOString(),
    };
    storage.addWorkoutTemplate(newTemplate);
    setWorkoutTemplates(storage.getWorkoutTemplates());
    return newTemplate;
  };

  const updateTemplate = (id, updates) => {
    storage.updateWorkoutTemplate(id, updates);
    setWorkoutTemplates(storage.getWorkoutTemplates());
  };

  const deleteTemplate = (id) => {
    storage.deleteWorkoutTemplate(id);
    storage.deleteTemplatePersonalizations(id); // Clean up personalizations
    setWorkoutTemplates(storage.getWorkoutTemplates());
    setTemplatePersonalizations(storage.getTemplatePersonalizations());
  };

  // Active workout methods
  const startWorkout = (template) => {
    const workout = {
      id: crypto.randomUUID(),
      workoutTemplateId: template?.id || null,
      workoutName: template?.name || 'Custom Workout',
      startTime: new Date().toISOString(),
      exercises: template.exercises.map((ex) => {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);

        // Check for personalization
        const personalization = storage.getExercisePersonalization(template.id, ex.exerciseId);
        const setsCount = personalization?.sets || ex.sets;
        const maxRepsConfig = personalization?.maxReps || 12;
        const restTime = personalization?.restTime || 90; // Default to 90 seconds

        // maxReps can be a number (applies to all sets) or an array (per-set values)
        const isPerSetReps = Array.isArray(maxRepsConfig);

        // Get last used weight for this exercise (sticky weights)
        const lastUsedWeight = storage.getLastUsedWeight(ex.exerciseId);

        return {
          exerciseId: ex.exerciseId,
          exerciseName: exercise?.name || 'Unknown',
          emoji: exercise?.emoji || '',
          workingWeight: lastUsedWeight, // Pre-fill with last used weight
          restTime: restTime, // Rest time between sets for this exercise
          sets: Array.from({ length: setsCount }, (_, i) => ({
            setNumber: i + 1,
            weight: 0, // Kept for backward compatibility with saved workouts
            reps: 0, // Current reps (decrements from maxReps)
            maxReps: isPerSetReps ? (maxRepsConfig[i] || 12) : maxRepsConfig, // Per-set or global maxReps
            completedReps: 0, // Actual reps completed
            completed: false,
          })),
        };
      }),
    };
    setActiveWorkout(workout);
    return workout;
  };

  const updateActiveWorkout = (updates) => {
    setActiveWorkout((prev) => ({ ...prev, ...updates }));
  };

  const completeWorkout = () => {
    if (!activeWorkout) return;

    if (editMode && originalWorkoutId) {
      // Update existing workout - preserve original completedAt
      const updatedWorkout = {
        ...activeWorkout,
        endTime: new Date().toISOString(),
        completedAt: originalCompletedAt, // Keep original completion date
        duration: Math.round(
          (new Date() - new Date(activeWorkout.startTime)) / 1000 / 60
        ),
      };

      storage.updateCompletedWorkout(originalWorkoutId, updatedWorkout);

      // Process indication dismissals
      storage.processWorkoutIndicationDismissals(updatedWorkout);

      setCompletedWorkouts(storage.getCompletedWorkouts());
      setActiveWorkout(null);
      setEditMode(false);
      setOriginalWorkoutId(null);
      setOriginalCompletedAt(null);
      return updatedWorkout;
    } else {
      // Create new workout
      const completedWorkout = {
        ...activeWorkout,
        endTime: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: Math.round(
          (new Date() - new Date(activeWorkout.startTime)) / 1000 / 60
        ),
      };

      storage.addCompletedWorkout(completedWorkout);

      // Process indication dismissals
      storage.processWorkoutIndicationDismissals(completedWorkout);

      setCompletedWorkouts(storage.getCompletedWorkouts());
      setActiveWorkout(null);
      return completedWorkout;
    }
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
    setEditMode(false);
    setOriginalWorkoutId(null);
    setOriginalCompletedAt(null);
  };

  // Load a completed workout for editing
  const loadWorkoutForEditing = (workoutId) => {
    const workout = storage.getCompletedWorkoutById(workoutId);
    if (!workout) return false;

    // Check if workout is still editable
    if (!storage.isWorkoutEditable(workout.completedAt)) {
      return false;
    }

    // Load the workout as active, preserving all its data
    setActiveWorkout({
      ...workout,
      // Remove completedAt and endTime as these will be set on save
      completedAt: undefined,
      endTime: undefined,
    });
    setEditMode(true);
    setOriginalWorkoutId(workoutId);
    setOriginalCompletedAt(workout.completedAt);
    return true;
  };

  // Delete a completed workout
  const deleteCompletedWorkoutById = (id) => {
    storage.deleteCompletedWorkout(id);
    setCompletedWorkouts(storage.getCompletedWorkouts());
  };

  // Personalization methods
  const getPersonalizedExercise = (templateId, exerciseId) => {
    return storage.getExercisePersonalization(templateId, exerciseId);
  };

  const savePersonalization = (templateId, exerciseId, config) => {
    storage.saveExercisePersonalization(templateId, exerciseId, config);
    setTemplatePersonalizations(storage.getTemplatePersonalizations());
  };

  const resetPersonalization = (templateId, exerciseId) => {
    storage.deleteExercisePersonalization(templateId, exerciseId);
    setTemplatePersonalizations(storage.getTemplatePersonalizations());
  };

  const hasPersonalization = (templateId, exerciseId) => {
    return storage.hasExercisePersonalization(templateId, exerciseId);
  };

  const getPersonalizationCount = (templateId) => {
    return storage.getPersonalizationCount(templateId);
  };

  const value = {
    exercises,
    workoutTemplates,
    completedWorkouts,
    activeWorkout,
    templatePersonalizations,
    editMode,
    addExercise,
    updateExercise,
    deleteExercise: deleteExerciseById,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    startWorkout,
    updateActiveWorkout,
    completeWorkout,
    cancelWorkout,
    loadWorkoutForEditing,
    deleteCompletedWorkout: deleteCompletedWorkoutById,
    getPersonalizedExercise,
    savePersonalization,
    resetPersonalization,
    hasPersonalization,
    getPersonalizationCount,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
