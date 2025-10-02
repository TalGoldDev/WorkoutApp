import { useState, useMemo } from 'react';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { getExerciseHistory } from '../services/localStorageService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, Target, Calendar } from 'lucide-react';

export const Statistics = () => {
  const { exercises, completedWorkouts } = useWorkoutContext();
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  // Filter exercises that have been performed
  const performedExercises = useMemo(() => {
    const exerciseIds = new Set();
    completedWorkouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        exerciseIds.add(ex.exerciseId);
      });
    });
    return exercises.filter((ex) => exerciseIds.has(ex.id));
  }, [exercises, completedWorkouts]);

  // Get history data for selected exercise
  const historyData = useMemo(() => {
    if (!selectedExerciseId) return [];
    const history = getExerciseHistory(selectedExerciseId);
    return history.map((entry) => ({
      date: format(new Date(entry.date), 'MMM d'),
      weight: entry.weight,
      fullDate: entry.date,
    }));
  }, [selectedExerciseId]);

  // Calculate stats
  const stats = useMemo(() => {
    if (historyData.length === 0) return null;

    const weights = historyData.map((d) => d.weight);
    const currentMax = Math.max(...weights);
    const startingWeight = weights[0];
    const percentageIncrease = startingWeight > 0
      ? ((currentMax - startingWeight) / startingWeight) * 100
      : 0;

    return {
      totalWorkouts: historyData.length,
      currentMax,
      startingWeight,
      percentageIncrease: percentageIncrease.toFixed(1),
    };
  }, [historyData]);

  if (performedExercises.length === 0) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h1>
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No exercise data yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Complete workouts to see your progress
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h1>

        {/* Exercise Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Exercise
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Choose an exercise...</option>
            {performedExercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.emoji} {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats and Graph */}
        {selectedExerciseId && historyData.length > 0 && stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Target size={16} />
                  <span className="text-sm">Current Max</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.currentMax} kg
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-sm">Progress</span>
                </div>
                <p className="text-2xl font-bold text-success">
                  +{stats.percentageIncrease}%
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Workouts</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalWorkouts}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <span className="text-sm">Starting</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.startingWeight} kg
                </p>
              </div>
            </div>

            {/* Progress Graph */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Weight Progress Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedExerciseId && historyData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No data for this exercise yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
