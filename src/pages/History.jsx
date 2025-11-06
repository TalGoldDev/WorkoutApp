import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Clock, Edit2, Trash2, Trophy, Dumbbell } from 'lucide-react';
import * as storage from '../services/localStorageService';

export const History = () => {
  const { completedWorkouts, loadWorkoutForEditing, deleteCompletedWorkout } = useWorkoutContext();
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const navigate = useNavigate();

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEditWorkout = (workoutId) => {
    const success = loadWorkoutForEditing(workoutId);
    if (success) {
      navigate('/active-workout');
    } else {
      alert('This workout can no longer be edited (only workouts from the last 2 days can be edited)');
    }
  };

  const handleDeleteWorkout = (workoutId) => {
    setDeleteConfirmId(workoutId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteCompletedWorkout(deleteConfirmId);
      setDeleteConfirmId(null);
      setExpandedId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (completedWorkouts.length === 0) {
    return (
      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your achievements and progress</p>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-primary/10 to-success/10 dark:from-primary/20 dark:to-success/20 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Dumbbell size={64} className="text-primary dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No workouts yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete your first workout to start tracking your progress!
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
            >
              Start Your First Workout
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <Trophy size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {completedWorkouts.length} workout{completedWorkouts.length !== 1 ? 's' : ''} completed
          </p>
        </div>

        <div className="space-y-4">
          {completedWorkouts.map((workout) => {
            const isExpanded = expandedId === workout.id;
            const isEditable = storage.isWorkoutEditable(workout.completedAt);
            const hoursRemaining = storage.getEditableHoursRemaining(workout.completedAt);
            const totalSets = workout.exercises.reduce(
              (sum, ex) => sum + ex.sets.length,
              0
            );
            const completedSets = workout.exercises.reduce(
              (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
              0
            );

            return (
              <div
                key={workout.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 overflow-hidden transition-all ${
                  isEditable ? 'border-primary dark:border-blue-400 shadow-primary/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Workout Card Header */}
                <div className="relative">
                  <button
                    onClick={() => toggleExpand(workout.id)}
                    className="w-full p-5 text-left hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Dumbbell size={20} className="text-primary dark:text-blue-400" />
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {workout.workoutName}
                          </h3>
                        </div>
                        {isEditable && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 text-xs font-semibold rounded-full">
                            <Edit2 size={12} />
                            Editable for {hoursRemaining}h
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp size={24} className="text-primary dark:text-blue-400" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={16} className="text-primary dark:text-blue-400" />
                        <span>
                          {format(new Date(workout.completedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={16} className="text-primary dark:text-blue-400" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-primary dark:text-blue-400">{workout.exercises.length}</span>
                        <span>exercises</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-success dark:text-green-400">{completedSets}/{totalSets}</span>
                        <span>sets</span>
                      </div>
                    </div>
                  </button>

                  {/* Action Buttons */}
                  {isEditable && (
                    <div className="px-5 pb-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorkout(workout.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkout(workout.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t-2 border-primary/20 dark:border-primary/30 bg-gradient-to-br from-primary/5 to-success/5 dark:from-primary/10 dark:to-success/10">
                    <div className="p-5">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Dumbbell size={18} className="text-primary dark:text-blue-400" />
                        Exercises
                      </h4>
                      <div className="space-y-3">
                        {workout.exercises.map((exercise, idx) => {
                          const exerciseCompletedSets = exercise.sets.filter(s => s.completed).length;
                          const exerciseTotalSets = exercise.sets.length;
                          const allCompleted = exerciseCompletedSets === exerciseTotalSets;

                          return (
                            <div
                              key={idx}
                              className={`rounded-lg p-4 border-2 transition-all ${
                                allCompleted
                                  ? 'bg-success/10 dark:bg-success/20 border-success/30 dark:border-success/40'
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{exercise.emoji}</span>
                                <h5 className="font-semibold text-gray-900 dark:text-white flex-1">
                                  {exercise.exerciseName}
                                </h5>
                                {allCompleted && (
                                  <span className="text-success dark:text-green-400 font-bold text-sm">✓ Complete</span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {exercise.sets.map((set, setIdx) => (
                                  <div
                                    key={setIdx}
                                    className={`flex items-center gap-3 text-sm p-2 rounded ${
                                      set.completed ? 'bg-success/10 dark:bg-success/20' : 'bg-gray-50 dark:bg-gray-900'
                                    }`}
                                  >
                                    <span className="text-gray-600 dark:text-gray-400 font-medium w-14">
                                      Set {set.setNumber}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {set.weight} kg
                                    </span>
                                    {set.completed && (
                                      <span className="ml-auto text-success dark:text-green-400 font-bold">✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                  <Trash2 size={24} className="text-red-500 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Workout?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Are you sure you want to delete this workout? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={cancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
