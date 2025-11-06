import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { ExercisePersonalizationModal } from '../components/shared/ExercisePersonalizationModal';
import { ExerciseSwitcherModal } from '../components/shared/ExerciseSwitcherModal';
import { Check, Minus, Plus, X, Settings2, RefreshCw } from 'lucide-react';
import { formatWeight } from '../utils/helpers';
import { getServiceWorkerRegistration } from '../utils/serviceWorkerRegistration';

export const ActiveWorkout = () => {
  const navigate = useNavigate();
  const {
    activeWorkout,
    updateActiveWorkout,
    completeWorkout,
    cancelWorkout,
    savePersonalization,
    getPersonalizedExercise,
    resetPersonalization,
    exercises,
    editMode,
  } = useWorkoutContext();
  const [currentExercises, setCurrentExercises] = useState([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showSavePersonalization, setShowSavePersonalization] = useState(false);
  const [personalizedChanges, setPersonalizedChanges] = useState([]);
  const [personalizationModal, setPersonalizationModal] = useState({
    isOpen: false,
    exerciseIndex: null,
    exercise: null,
  });
  const [switcherModal, setSwitcherModal] = useState({
    isOpen: false,
    exerciseIndex: null,
  });
  const [restTimer, setRestTimer] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [wakeLockEnabled, setWakeLockEnabled] = useState(false);
  const notificationsEnabledRef = useRef(false);
  const wakeLockRef = useRef(null);
  const swRegistrationRef = useRef(null);

  useEffect(() => {
    if (!activeWorkout) {
      navigate('/');
      return;
    }
    setCurrentExercises(activeWorkout.exercises);
  }, [activeWorkout, navigate]);

  // Check notification permission and get service worker on mount
  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      console.log('Initial notification permission:', currentPermission);
      setNotificationPermission(currentPermission);
      if (currentPermission === 'granted') {
        setNotificationsEnabled(true);
        notificationsEnabledRef.current = true;
      }
    }

    // Get service worker registration
    getServiceWorkerRegistration().then((registration) => {
      if (registration) {
        swRegistrationRef.current = registration;
        console.log('Service worker registration available');
      }
    });

    // Request wake lock when component mounts
    requestWakeLock();

    // Release wake lock when component unmounts
    return () => {
      releaseWakeLock();
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockEnabled(true);
        console.log('Wake Lock enabled - screen will stay on');

        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released');
          setWakeLockEnabled(false);
        });
      } catch (error) {
        console.error('Wake Lock error:', error);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockEnabled(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        notificationsEnabledRef.current = true;
        console.log('Notifications enabled');

        // Test notification using service worker if available
        try {
          if (swRegistrationRef.current) {
            await swRegistrationRef.current.showNotification('Notifications Enabled! 🔔', {
              body: 'You will be notified when rest is complete.',
              tag: 'test-notification',
              requireInteraction: false,
            });
          } else {
            // Fallback to regular notification
            new Notification('Notifications Enabled! 🔔', {
              body: 'You will be notified when rest is complete.',
            });
          }
        } catch (error) {
          console.error('Error showing test notification:', error);
        }
      }
    }
  };

  const toggleNotifications = async () => {
    console.log('Toggle clicked. Current state:', { notificationsEnabled, notificationPermission });

    // If permission not granted, request it
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
    } else {
      // Permission already granted, just toggle on/off
      const newValue = !notificationsEnabled;
      console.log('Toggling notifications to:', newValue);
      setNotificationsEnabled(newValue);
      notificationsEnabledRef.current = newValue;
    }
  };

  const startRestTimer = (seconds = 90) => {
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    setRestTimer(seconds);

    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);

          // Send notification if enabled
          console.log('Rest timer complete. Notification check:', {
            notificationsEnabledRef: notificationsEnabledRef.current,
            notificationInWindow: 'Notification' in window,
            permission: Notification.permission
          });

          if (notificationsEnabledRef.current && 'Notification' in window && Notification.permission === 'granted') {
            try {
              console.log('Sending rest complete notification...');

              // Use service worker notification if available (better for iOS Safari)
              if (swRegistrationRef.current) {
                swRegistrationRef.current.showNotification('Rest Complete! 💪', {
                  body: "Time to crush your next set! Let's go!",
                  tag: 'rest-complete',
                  requireInteraction: false,
                  vibrate: [200, 100, 200],
                });
              } else {
                // Fallback to regular notification
                new Notification('Rest Complete! 💪', {
                  body: "Time to crush your next set! Let's go!",
                  vibrate: [200, 100, 200],
                });
              }
            } catch (error) {
              console.error('Error showing notification:', error);
            }
          } else {
            console.log('Notification not sent - conditions not met');
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const handleExerciseWeightChange = (exerciseIdx, value) => {
    const newExercises = [...currentExercises];
    newExercises[exerciseIdx].workingWeight = formatWeight(parseFloat(value) || 0);
    // Weight is now captured per-set when button is clicked, not synced to all sets
    setCurrentExercises(newExercises);
    updateActiveWorkout({ exercises: newExercises });
  };

  const handleIncrementExerciseWeight = (exerciseIdx, amount) => {
    const currentWeight = currentExercises[exerciseIdx].workingWeight || 0;
    const newWeight = Math.max(0, currentWeight + amount);
    handleExerciseWeightChange(exerciseIdx, newWeight);
  };

  const handleSetClick = (exerciseIdx, setIdx) => {
    const newExercises = [...currentExercises];
    const set = newExercises[exerciseIdx].sets[setIdx];
    const exercise = newExercises[exerciseIdx];

    if (set.reps === 0 && !set.completed) {
      // First click: Mark as completed and capture current weight
      set.reps = set.maxReps;
      set.completed = true;
      set.completedReps = set.maxReps;
      set.weight = exercise.workingWeight; // Capture weight at this moment

      // Start rest timer with the exercise's personalized rest time
      startRestTimer(exercise.restTime || 90);
    } else if (set.reps > 0 && set.completed) {
      // Decrement reps (user didn't complete all reps)
      set.reps -= 1;
      set.completedReps = set.reps;
      // Keep completed = true, weight stays unchanged
    } else if (set.reps === 0 && set.completed) {
      // Reset the set
      set.reps = 0;
      set.completed = false;
      set.completedReps = 0;
      set.weight = 0; // Clear the captured weight
    }

    setCurrentExercises(newExercises);
    updateActiveWorkout({ exercises: newExercises });
  };

  const handleOpenSettings = (exerciseIdx) => {
    const exercise = currentExercises[exerciseIdx];
    setPersonalizationModal({
      isOpen: true,
      exerciseIndex: exerciseIdx,
      exercise: {
        id: exercise.exerciseId,
        name: exercise.exerciseName,
        emoji: exercise.emoji,
      },
    });
  };

  const handleSaveExerciseSettings = (config) => {
    if (personalizationModal.exerciseIndex === null) return;

    const exerciseIdx = personalizationModal.exerciseIndex;
    const newExercises = [...currentExercises];
    const exercise = newExercises[exerciseIdx];

    const oldSetsCount = exercise.sets.length;
    const newSetsCount = config.sets;
    const newMaxReps = config.maxReps; // Can be number or array
    const newRestTime = config.restTime || 90;

    // Update exercise rest time
    exercise.restTime = newRestTime;

    // Adjust sets array
    if (newSetsCount > oldSetsCount) {
      // Add new sets
      for (let i = oldSetsCount; i < newSetsCount; i++) {
        const maxReps = Array.isArray(newMaxReps) ? newMaxReps[i] : newMaxReps;
        exercise.sets.push({
          setNumber: i + 1,
          weight: 0,
          reps: 0,
          maxReps: maxReps,
          completedReps: 0,
          completed: false,
        });
      }
    } else if (newSetsCount < oldSetsCount) {
      // Remove sets from the end
      exercise.sets = exercise.sets.slice(0, newSetsCount);
    }

    // Update maxReps for all sets
    exercise.sets.forEach((set, idx) => {
      set.maxReps = Array.isArray(newMaxReps) ? newMaxReps[idx] : newMaxReps;
      set.setNumber = idx + 1; // Ensure numbering is correct
    });

    setCurrentExercises(newExercises);
    updateActiveWorkout({ exercises: newExercises });

    // Track this change for personalization prompt
    trackPersonalizationChange(exercise.exerciseId, config.sets, config.maxReps, newRestTime);
  };

  const handleResetExerciseSettings = () => {
    if (activeWorkout.workoutTemplateId && personalizationModal.exercise) {
      resetPersonalization(activeWorkout.workoutTemplateId, personalizationModal.exercise.id);
    }
  };

  const handleCloseSettings = () => {
    setPersonalizationModal({
      isOpen: false,
      exerciseIndex: null,
      exercise: null,
    });
  };

  const handleOpenSwitcher = (exerciseIdx) => {
    setSwitcherModal({
      isOpen: true,
      exerciseIndex: exerciseIdx,
    });
  };

  const handleSwitchExercise = (newExerciseId) => {
    if (switcherModal.exerciseIndex === null) return;

    const exerciseIdx = switcherModal.exerciseIndex;
    const newExercises = [...currentExercises];
    const oldExercise = newExercises[exerciseIdx];
    const newExercise = exercises.find((e) => e.id === newExerciseId);

    if (!newExercise) return;

    // Preserve workout progress but switch exercise details
    newExercises[exerciseIdx] = {
      ...oldExercise,
      exerciseId: newExercise.id,
      exerciseName: newExercise.name,
      emoji: newExercise.emoji,
      // Keep workingWeight, sets array (preserves completed sets)
    };

    setCurrentExercises(newExercises);
    updateActiveWorkout({ exercises: newExercises });

    // Close the modal
    setSwitcherModal({
      isOpen: false,
      exerciseIndex: null,
    });
  };

  const handleCloseSwitcher = () => {
    setSwitcherModal({
      isOpen: false,
      exerciseIndex: null,
    });
  };

  const trackPersonalizationChange = (exerciseId, sets, maxReps, restTime) => {
    setPersonalizedChanges((prev) => {
      const existing = prev.find((c) => c.exerciseId === exerciseId);
      if (existing) {
        return prev.map((c) =>
          c.exerciseId === exerciseId ? { ...c, sets, maxReps, restTime } : c
        );
      }
      return [...prev, { exerciseId, sets, maxReps, restTime }];
    });
  };

  const handleCompleteWorkout = () => {
    // If in edit mode, don't show personalization prompt - just save
    if (editMode) {
      completeWorkout();
      navigate('/history');
      return;
    }

    // Check if there are any personalized changes
    if (personalizedChanges.length > 0 && activeWorkout.workoutTemplateId) {
      setShowSavePersonalization(true);
    } else {
      completeWorkout();
      navigate('/history');
    }
  };

  const handleSaveAndComplete = () => {
    // Save all personalizations
    if (activeWorkout.workoutTemplateId) {
      personalizedChanges.forEach((change) => {
        savePersonalization(activeWorkout.workoutTemplateId, change.exerciseId, {
          sets: change.sets,
          maxReps: change.maxReps,
          restTime: change.restTime,
        });
      });
    }
    completeWorkout();
    navigate('/history');
  };

  const handleCompleteWithoutSaving = () => {
    completeWorkout();
    navigate('/history');
  };

  const handleCancelWorkout = () => {
    cancelWorkout();
    navigate('/');
  };

  if (!activeWorkout) {
    return null;
  }

  const totalSets = currentExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = currentExercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <Layout showNav={false}>
      <div className="min-h-screen bg-background dark:bg-gray-900">
        {/* Header */}
        <div className="bg-primary dark:bg-blue-600 text-white p-6 sticky top-0 z-10 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold">{activeWorkout.workoutName}</h1>
              {editMode && (
                <span className="text-xs bg-yellow-500/30 text-yellow-100 px-2 py-0.5 rounded mt-1 inline-block">
                  Editing workout
                </span>
              )}
            </div>
            <button
              onClick={() => setShowConfirmCancel(true)}
              className="touch-target text-white hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-sm opacity-90">
            {completedSets} / {totalSets} sets completed
          </div>
          <div className="mt-2 bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>

          {/* Rest Timer */}
          {restTimer !== null && restTimer > 0 && (
            <div className="text-center mt-3">
              <div className="inline-block bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-90">Rest: </span>
                <span className="text-lg font-bold">
                  {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* Wake Lock Status */}
          {wakeLockEnabled && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="text-xs bg-green-500/20 text-green-100 px-3 py-1 rounded-full">
                🔒 Screen locked on
              </div>
            </div>
          )}

          {/* Notification Toggle */}
          {'Notification' in window && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm opacity-90 hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={toggleNotifications}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span>Notify me when rest is done</span>
              </label>
            </div>
          )}
        </div>

        {/* Exercises */}
        <div className="p-4 space-y-6 pb-24">
          {currentExercises.map((exercise, exerciseIdx) => {
            // Check if all sets have been started (clicked at least once)
            const allSetsStarted = exercise.sets.every(set => set.reps > 0 || set.completed);

            return (
            <div key={exerciseIdx} className={`rounded-lg shadow-sm border-2 p-4 transition-all ${
              allSetsStarted
                ? 'bg-green-50 dark:bg-green-900/20 border-success dark:border-green-600'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              {/* Exercise Header with Weight */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{exercise.emoji}</span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                    {exercise.exerciseName}
                  </h2>
                  <div className="flex items-center gap-1">
                    {/* Switch Exercise Button */}
                    <button
                      onClick={() => handleOpenSwitcher(exerciseIdx)}
                      className="touch-target p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400"
                      title="Switch exercise"
                    >
                      <RefreshCw size={20} />
                    </button>
                    {/* Settings Icon */}
                    <button
                      onClick={() => handleOpenSettings(exerciseIdx)}
                      className="touch-target p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400"
                      title="Customize sets and reps"
                    >
                      <Settings2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Single Weight Input for Exercise */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIncrementExerciseWeight(exerciseIdx, -2.5)}
                    className="touch-target bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg p-2 text-gray-900 dark:text-white"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    value={exercise.workingWeight || ''}
                    onChange={(e) =>
                      handleExerciseWeightChange(exerciseIdx, e.target.value)
                    }
                    placeholder="0"
                    className="w-24 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">kg</span>
                  <button
                    onClick={() => handleIncrementExerciseWeight(exerciseIdx, 2.5)}
                    className="touch-target bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg p-2 text-gray-900 dark:text-white"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Set Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {exercise.sets.map((set, setIdx) => {
                  const isNotStarted = set.reps === 0 && !set.completed;
                  const isCompleted = set.completed;

                  return (
                    <button
                      key={setIdx}
                      onClick={() => handleSetClick(exerciseIdx, setIdx)}
                      className={`touch-target p-4 rounded-lg font-semibold transition-all ${
                        isCompleted
                          ? 'bg-success dark:bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isNotStarted && `Set ${set.setNumber}`}
                      {isCompleted && `✓ ${set.completedReps}`}
                    </button>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>

        {/* Complete Workout Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
          <div className="max-w-lg mx-auto">
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={handleCompleteWorkout}
            >
              {editMode ? 'Save Changes' : 'Finish Workout'}
            </Button>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showConfirmCancel && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {editMode ? 'Cancel Edit?' : 'Cancel Workout?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {editMode
                  ? 'Your changes will not be saved. Are you sure you want to cancel?'
                  : 'Your progress will not be saved. Are you sure you want to cancel?'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowConfirmCancel(false)}
                >
                  Keep Going
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleCancelWorkout}
                >
                  {editMode ? 'Cancel Edit' : 'Cancel Workout'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Save Personalization Modal */}
        {showSavePersonalization && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <div className="text-center mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                Save Your Changes?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                You modified {personalizedChanges.length} exercise{personalizedChanges.length > 1 ? 's' : ''}.
                Save these changes for next time?
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSaveAndComplete}
                >
                  Save & Finish
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleCompleteWithoutSaving}
                >
                  Finish Without Saving
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Personalization Modal */}
        {personalizationModal.isOpen && personalizationModal.exercise && (
          <ExercisePersonalizationModal
            isOpen={personalizationModal.isOpen}
            onClose={handleCloseSettings}
            exercise={personalizationModal.exercise}
            templateId={activeWorkout.workoutTemplateId || 'temp'}
            currentConfig={
              activeWorkout.workoutTemplateId
                ? getPersonalizedExercise(activeWorkout.workoutTemplateId, personalizationModal.exercise.id)
                : null
            }
            currentSetsInWorkout={
              personalizationModal.exerciseIndex !== null
                ? currentExercises[personalizationModal.exerciseIndex]?.sets
                : null
            }
            defaultConfig={{
              sets: exercises.find((e) => e.id === personalizationModal.exercise.id)?.defaultSets || 3,
              maxReps: 12,
              restTime: 90,
            }}
            onSave={handleSaveExerciseSettings}
            onReset={handleResetExerciseSettings}
          />
        )}

        {/* Exercise Switcher Modal */}
        {switcherModal.isOpen && (
          <ExerciseSwitcherModal
            isOpen={switcherModal.isOpen}
            onClose={handleCloseSwitcher}
            onSelectExercise={handleSwitchExercise}
            currentExerciseId={
              switcherModal.exerciseIndex !== null
                ? currentExercises[switcherModal.exerciseIndex]?.exerciseId
                : null
            }
            allExercises={exercises}
            exercisesInWorkout={currentExercises.map((ex) => ex.exerciseId)}
          />
        )}
      </div>
    </Layout>
  );
};
