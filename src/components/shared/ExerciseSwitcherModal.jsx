import { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Button } from './Button';

export const ExerciseSwitcherModal = ({
  isOpen,
  onClose,
  onSelectExercise,
  currentExerciseId,
  allExercises,
  exercisesInWorkout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');

  if (!isOpen) return null;

  // Group exercises by muscle group
  const exercisesByGroup = useMemo(() => {
    const groups = {};
    allExercises.forEach((exercise) => {
      const group = exercise.muscleGroup || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(exercise);
    });
    return groups;
  }, [allExercises]);

  const muscleGroups = ['All', ...Object.keys(exercisesByGroup).sort()];

  // Filter exercises based on search and selected muscle group
  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    // Filter by muscle group
    if (selectedMuscleGroup !== 'All') {
      exercises = exercises.filter((ex) => ex.muscleGroup === selectedMuscleGroup);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.muscleGroup?.toLowerCase().includes(query)
      );
    }

    return exercises;
  }, [allExercises, selectedMuscleGroup, searchQuery]);

  const handleSelectExercise = (exerciseId) => {
    if (exerciseId === currentExerciseId) {
      // Don't switch to the same exercise
      return;
    }
    onSelectExercise(exerciseId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Switch Exercise</h2>
            <p className="text-sm text-gray-600">Choose a different exercise</p>
          </div>
          <button
            onClick={onClose}
            className="touch-target text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Muscle Group Tabs */}
        <div className="px-4 py-3 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscleGroup(group)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedMuscleGroup === group
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No exercises found</p>
              <p className="text-sm mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => {
                const isCurrentExercise = exercise.id === currentExerciseId;
                const isInWorkout = exercisesInWorkout.includes(exercise.id);

                return (
                  <button
                    key={exercise.id}
                    onClick={() => handleSelectExercise(exercise.id)}
                    disabled={isCurrentExercise}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isCurrentExercise
                        ? 'border-primary bg-primary/10 cursor-default'
                        : isInWorkout
                        ? 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-white'
                        : 'border-gray-200 bg-white hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{exercise.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {exercise.name}
                          </h3>
                          {isCurrentExercise && (
                            <span className="flex items-center gap-1 text-xs bg-primary text-white px-2 py-1 rounded-full">
                              <Check size={12} />
                              Current
                            </span>
                          )}
                          {isInWorkout && !isCurrentExercise && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                              In workout
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {exercise.muscleGroup} • {exercise.defaultSets} sets
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
