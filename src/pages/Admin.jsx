import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { getExercises, getWorkoutTemplates, addCompletedWorkout } from '../services/localStorageService';

export const Admin = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [logs, setLogs] = useState([]);
  const [testTimerActive, setTestTimerActive] = useState(false);
  const [testTimerCount, setTestTimerCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      id: crypto.randomUUID(),
      timestamp,
      message,
      type
    }, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const requestPermission = async () => {
    addLog('Requesting notification permission...', 'info');
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        addLog(`Permission result: ${permission}`, permission === 'granted' ? 'success' : 'error');
      } catch (error) {
        addLog(`Error requesting permission: ${error.message}`, 'error');
      }
    } else {
      addLog('Notification API not available', 'error');
    }
  };

  const testNotificationImmediate = () => {
    addLog('Testing immediate notification...', 'info');

    if (!('Notification' in window)) {
      addLog('Notification API not supported', 'error');
      return;
    }

    if (Notification.permission !== 'granted') {
      addLog('Permission not granted. Current: ' + Notification.permission, 'error');
      return;
    }

    try {
      const notification = new Notification('Test Notification! 🔔', {
        body: 'This is a test notification from the admin panel.',
      });
      addLog('Notification created successfully', 'success');

      notification.onclick = () => {
        addLog('Notification clicked!', 'info');
      };

      notification.onerror = (error) => {
        addLog('Notification error: ' + JSON.stringify(error), 'error');
      };
    } catch (error) {
      addLog(`Error creating notification: ${error.message}`, 'error');
    }
  };

  const startTestTimer = () => {
    if (testTimerActive) {
      addLog('Timer already running', 'error');
      return;
    }

    addLog('Starting 5-second test timer...', 'info');
    setTestTimerActive(true);
    setTestTimerCount(5);

    timerRef.current = setInterval(() => {
      setTestTimerCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTestTimerActive(false);

          addLog('Timer complete! Sending notification...', 'info');

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notification = new Notification('Rest Complete! 💪', {
                body: "Time to crush your next set! Let's go!",
                vibrate: [200, 100, 200],
              });
              addLog('Timer notification sent successfully', 'success');

              notification.onerror = (error) => {
                addLog('Timer notification error: ' + JSON.stringify(error), 'error');
              };
            } catch (error) {
              addLog(`Error sending timer notification: ${error.message}`, 'error');
            }
          } else {
            addLog('Cannot send notification - permission not granted', 'error');
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all app data?')) {
      localStorage.clear();
      addLog('localStorage cleared - reload page to reset app', 'success');
    }
  };

  const viewLocalStorage = () => {
    const keys = Object.keys(localStorage);
    addLog(`localStorage has ${keys.length} keys`, 'info');
    keys.forEach(key => {
      if (key.startsWith('workout_tracker_')) {
        const data = localStorage.getItem(key);
        addLog(`${key}: ${data.length} characters`, 'info');
      }
    });
  };

  const downloadBackup = () => {
    try {
      addLog('Creating backup...', 'info');

      // Collect all workout tracker data
      const backup = {
        version: '1.1', // Bumped version for personalization support
        timestamp: new Date().toISOString(),
        data: {
          exercises: localStorage.getItem('workout_tracker_exercises'),
          templates: localStorage.getItem('workout_tracker_templates'),
          completedWorkouts: localStorage.getItem('workout_tracker_completed'),
          preferences: localStorage.getItem('workout_tracker_preferences'),
          personalizations: localStorage.getItem('workout_tracker_template_personalizations'),
        }
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Format filename with date
      const date = new Date().toISOString().split('T')[0];
      link.download = `workout-backup-${date}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addLog('Backup downloaded successfully', 'success');
    } catch (error) {
      addLog(`Error creating backup: ${error.message}`, 'error');
    }
  };

  const uploadBackup = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addLog(`Reading backup file: ${file.name}`, 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validate backup structure
        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file format');
        }

        addLog('Backup file validated', 'success');
        addLog('Restoring data...', 'info');

        // Restore all data
        if (backup.data.exercises) {
          localStorage.setItem('workout_tracker_exercises', backup.data.exercises);
        }
        if (backup.data.templates) {
          localStorage.setItem('workout_tracker_templates', backup.data.templates);
        }
        if (backup.data.completedWorkouts) {
          localStorage.setItem('workout_tracker_completed', backup.data.completedWorkouts);
        }
        if (backup.data.preferences) {
          localStorage.setItem('workout_tracker_preferences', backup.data.preferences);
        }
        if (backup.data.personalizations) {
          localStorage.setItem('workout_tracker_template_personalizations', backup.data.personalizations);
        }

        addLog('Data restored successfully!', 'success');
        addLog('Reloading page...', 'info');

        // Reload page after short delay to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        addLog(`Error restoring backup: ${error.message}`, 'error');
      }
    };

    reader.onerror = () => {
      addLog('Error reading backup file', 'error');
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const fill30DaysWorkoutHistory = () => {
    if (!window.confirm('This will add 30 days of workout history. Continue?')) {
      return;
    }

    try {
      addLog('Starting to fill 30 days of workout history...', 'info');

      const exercises = getExercises();
      const templates = getWorkoutTemplates();

      if (exercises.length === 0) {
        addLog('No exercises found. Please seed data first.', 'error');
        return;
      }

      // Use a template if available, otherwise create generic workouts
      const templateToUse = templates.length > 0 ? templates[0] : null;
      let workoutsAdded = 0;

      // Create workouts for the past 30 days
      for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
        const workoutDate = new Date();
        workoutDate.setDate(workoutDate.getDate() - daysAgo);

        // Set random time between 8 AM and 8 PM
        const randomHour = Math.floor(Math.random() * 12) + 8;
        const randomMinute = Math.floor(Math.random() * 60);
        workoutDate.setHours(randomHour, randomMinute, 0, 0);

        // Select 4-6 random exercises
        const numExercises = Math.floor(Math.random() * 3) + 4; // 4-6 exercises
        const selectedExercises = [];
        const availableExercises = [...exercises];

        for (let i = 0; i < numExercises && availableExercises.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableExercises.length);
          const exercise = availableExercises.splice(randomIndex, 1)[0];

          // Generate 3-5 sets for this exercise
          const numSets = Math.floor(Math.random() * 3) + 3; // 3-5 sets
          const sets = [];

          // Random weight between 20-100 kg, increasing slightly over time
          const baseWeight = 20 + Math.floor(Math.random() * 60) + Math.floor((29 - daysAgo) / 5);

          for (let setNum = 1; setNum <= numSets; setNum++) {
            const maxReps = Math.floor(Math.random() * 4) + 8; // 8-11 reps
            const completedReps = Math.max(
              maxReps - Math.floor(Math.random() * 3), // Sometimes fail 1-2 reps
              Math.floor(maxReps * 0.7) // At least 70% of max reps
            );

            sets.push({
              setNumber: setNum,
              weight: baseWeight,
              reps: maxReps,
              maxReps: maxReps,
              completedReps: completedReps,
              completed: true,
            });
          }

          selectedExercises.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            emoji: exercise.emoji,
            workingWeight: baseWeight,
            restTime: 90,
            sets: sets,
          });
        }

        // Calculate workout duration (10-20 minutes per exercise)
        const duration = numExercises * (10 + Math.floor(Math.random() * 10));

        const startTime = new Date(workoutDate);
        const endTime = new Date(workoutDate);
        endTime.setMinutes(endTime.getMinutes() + duration);

        // Create completed workout
        const completedWorkout = {
          id: crypto.randomUUID(),
          workoutTemplateId: templateToUse?.id || null,
          workoutName: templateToUse?.name || 'Generated Workout',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          completedAt: workoutDate.toISOString(),
          duration: duration,
          exercises: selectedExercises,
        };

        addCompletedWorkout(completedWorkout);
        workoutsAdded++;
      }

      addLog(`Successfully added ${workoutsAdded} workouts!`, 'success');
      addLog('Reloading page to refresh data...', 'info');

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      addLog(`Error filling workout history: ${error.message}`, 'error');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background dark:bg-gray-900 p-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">Admin / Debug Panel</h1>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">For testing and debugging only</p>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">System Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Notification API:</span>
                <span className={('Notification' in window) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {('Notification' in window) ? '✓ Supported' : '✗ Not Supported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Permission Status:</span>
                <span className={`font-semibold ${
                  notificationPermission === 'granted' ? 'text-green-600 dark:text-green-400' :
                  notificationPermission === 'denied' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {notificationPermission}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Browser:</span>
                <span className="text-gray-900 dark:text-white">{navigator.userAgent.split(' ').pop()}</span>
              </div>
            </div>
          </div>

          {/* Notification Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notification Tests</h2>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={requestPermission}
                disabled={notificationPermission === 'granted'}
              >
                {notificationPermission === 'granted' ? '✓ Permission Granted' : 'Request Notification Permission'}
              </Button>

              <Button
                variant="success"
                fullWidth
                onClick={testNotificationImmediate}
                disabled={notificationPermission !== 'granted'}
              >
                Test Notification (Immediate)
              </Button>

              <div className="border-t pt-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={startTestTimer}
                  disabled={testTimerActive || notificationPermission !== 'granted'}
                >
                  {testTimerActive ? `Timer: ${testTimerCount}s` : 'Start 5-Second Test Timer'}
                </Button>
                {testTimerActive && (
                  <div className="mt-2 text-center">
                    <div className="text-3xl font-bold text-primary dark:text-blue-400">{testTimerCount}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Notification will fire at 0</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Backup & Restore</h2>
            <div className="space-y-3">
              <Button
                variant="success"
                fullWidth
                onClick={downloadBackup}
              >
                📥 Download Backup
              </Button>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={uploadBackup}
                  style={{ display: 'none' }}
                  id="backup-upload"
                />
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => document.getElementById('backup-upload').click()}
                >
                  📤 Upload Backup
                </Button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  💾 Backup your workout data to keep it safe. You can restore it anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Management</h2>
            <div className="space-y-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={viewLocalStorage}
              >
                View localStorage Info
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={clearLocalStorage}
              >
                Clear All App Data
              </Button>
            </div>
          </div>

          {/* Cheat / Testing Tools */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cheat / Testing Tools</h2>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={fill30DaysWorkoutHistory}
              >
                🎲 Fill 30 Days of Workout History
              </Button>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ⚡ Creates 30 days of realistic workout data with random exercises, sets, and progressive weights.
                </p>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Logs</h2>
              <button
                onClick={clearLogs}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No logs yet. Run a test to see logs.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="text-xs font-mono border-l-2 border-gray-300 dark:border-gray-600 pl-2 py-1">
                    <span className="text-gray-400 dark:text-gray-500">[{log.timestamp}]</span>{' '}
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
