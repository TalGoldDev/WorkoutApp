import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Workout History</h1>
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No workouts completed yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Complete your first workout to see it here
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Workout History</h1>

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
                className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                  isEditable ? 'border-blue-300' : 'border-gray-200'
                }`}
              >
                {/* Workout Card Header */}
                <div className="relative">
                  {isEditable && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorkout(workout.id);
                        }}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                        title="Edit workout"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkout(workout.id);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                        title="Delete workout"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => toggleExpand(workout.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2 pr-20">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {workout.workoutName}
                        </h3>
                        {isEditable && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Editable for {hoursRemaining}h
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {format(new Date(workout.completedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{workout.duration} min</span>
                      </div>
                      <div>
                        <span className="font-medium">{workout.exercises.length}</span>{' '}
                        exercises
                      </div>
                      <div>
                        <span className="font-medium">{completedSets}/{totalSets}</span>{' '}
                        sets
                      </div>
                    </div>
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Exercises</h4>
                    <div className="space-y-4">
                      {workout.exercises.map((exercise, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{exercise.emoji}</span>
                            <h5 className="font-medium text-gray-900">
                              {exercise.exerciseName}
                            </h5>
                          </div>
                          <div className="space-y-1">
                            {exercise.sets.map((set, setIdx) => (
                              <div
                                key={setIdx}
                                className="flex items-center gap-3 text-sm"
                              >
                                <span className="text-gray-600 w-16">
                                  Set {set.setNumber}
                                </span>
                                <span className="font-medium">
                                  {set.weight} kg
                                </span>
                                {set.completed && (
                                  <span className="text-success text-xs">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Workout?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this workout? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
