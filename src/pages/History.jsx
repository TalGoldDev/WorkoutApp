import { useState } from 'react';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';

export const History = () => {
  const { completedWorkouts } = useWorkoutContext();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Workout Card Header */}
                <button
                  onClick={() => toggleExpand(workout.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workout.workoutName}
                    </h3>
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
    </Layout>
  );
};
