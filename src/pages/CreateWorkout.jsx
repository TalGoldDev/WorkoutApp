import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { ArrowLeft, Plus, X, GripVertical } from 'lucide-react';

export const CreateWorkout = () => {
  const navigate = useNavigate();
  const { exercises, addTemplate, startWorkout } = useWorkoutContext();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [error, setError] = useState('');

  const handleAddExercise = (exercise) => {
    if (selectedExercises.find((e) => e.exerciseId === exercise.id)) {
      return; // Already added
    }
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        emoji: exercise.emoji,
        sets: exercise.defaultSets,
        order: selectedExercises.length + 1,
      },
    ]);
    setShowExerciseList(false);
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter((e) => e.exerciseId !== exerciseId));
  };

  const handleUpdateSets = (exerciseId, newSets) => {
    setSelectedExercises(
      selectedExercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, sets: parseInt(newSets) } : e
      )
    );
  };

  const handleStartWorkout = () => {
    if (!workoutName.trim()) {
      setError('Please enter a workout name');
      return;
    }
    if (selectedExercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    const template = {
      name: workoutName,
      exercises: selectedExercises.map((ex, idx) => ({
        exerciseId: ex.exerciseId,
        order: idx + 1,
        sets: ex.sets,
      })),
    };

    const newTemplate = addTemplate(template);
    startWorkout(newTemplate);
    navigate('/active-workout');
  };

  const handleQuickStart = () => {
    if (selectedExercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    const template = {
      name: workoutName.trim() || 'Quick Workout',
      exercises: selectedExercises.map((ex, idx) => ({
        exerciseId: ex.exerciseId,
        order: idx + 1,
        sets: ex.sets,
      })),
    };

    startWorkout(template);
    navigate('/active-workout');
  };

  return (
    <Layout showNav={false}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="touch-target -ml-2 mr-2 text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Workout</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Workout Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workout Name
          </label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => {
              setWorkoutName(e.target.value);
              setError('');
            }}
            placeholder="e.g., Upper Body Day"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Selected Exercises */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Exercises</h2>
          {selectedExercises.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No exercises added yet
            </p>
          ) : (
            <div className="space-y-2">
              {selectedExercises.map((exercise) => (
                <div
                  key={exercise.exerciseId}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <GripVertical size={20} className="text-gray-400" />
                  <span className="text-2xl">{exercise.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{exercise.exerciseName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={exercise.sets}
                      onChange={(e) => handleUpdateSets(exercise.exerciseId, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} sets
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveExercise(exercise.exerciseId)}
                      className="touch-target text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Exercise Button */}
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowExerciseList(!showExerciseList)}
          className="mb-6"
        >
          <Plus size={20} className="inline mr-2" />
          Add Exercise
        </Button>

        {/* Exercise Selection List */}
        {showExerciseList && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Select Exercise</h3>
            <div className="space-y-2">
              {exercises.map((exercise) => {
                const isAdded = selectedExercises.find(
                  (e) => e.exerciseId === exercise.id
                );
                return (
                  <button
                    key={exercise.id}
                    onClick={() => handleAddExercise(exercise)}
                    disabled={isAdded}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                      isAdded
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{exercise.emoji}</span>
                    <span className="font-medium">{exercise.name}</span>
                    {isAdded && <span className="ml-auto text-sm">Added</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStartWorkout}
          >
            Save & Start Workout
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleQuickStart}
          >
            Start Without Saving
          </Button>
        </div>
      </div>
    </Layout>
  );
};
