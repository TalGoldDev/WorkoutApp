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

  // Load data on mount
  useEffect(() => {
    storage.seedDefaultExercises();
    setExercises(storage.getExercises());
    setWorkoutTemplates(storage.getWorkoutTemplates());
    setCompletedWorkouts(storage.getCompletedWorkouts());
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
    setWorkoutTemplates(storage.getWorkoutTemplates());
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
        return {
          exerciseId: ex.exerciseId,
          exerciseName: exercise?.name || 'Unknown',
          emoji: exercise?.emoji || '',
          workingWeight: 0, // Single weight for the entire exercise
          sets: Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            weight: 0, // Kept for backward compatibility with saved workouts
            reps: 0, // Current reps (decrements from maxReps)
            maxReps: 12, // Target reps for this set (default to 12)
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

    const completedWorkout = {
      ...activeWorkout,
      endTime: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration: Math.round(
        (new Date() - new Date(activeWorkout.startTime)) / 1000 / 60
      ),
    };

    storage.addCompletedWorkout(completedWorkout);
    setCompletedWorkouts(storage.getCompletedWorkouts());
    setActiveWorkout(null);
    return completedWorkout;
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const value = {
    exercises,
    workoutTemplates,
    completedWorkouts,
    activeWorkout,
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
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
