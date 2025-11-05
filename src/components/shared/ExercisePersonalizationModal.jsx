import { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { Button } from './Button';

export const ExercisePersonalizationModal = ({
  isOpen,
  onClose,
  exercise,
  templateId,
  currentConfig,
  defaultConfig,
  onSave,
  onReset,
  currentSetsInWorkout = null, // Optional: pass current sets from active workout
}) => {
  const [sets, setSets] = useState(currentConfig?.sets || defaultConfig.sets || 3);
  const [perSetReps, setPerSetReps] = useState([]);
  const [defaultReps, setDefaultReps] = useState(12);
  const [error, setError] = useState('');

  // Initialize per-set reps when modal opens or sets count changes
  useEffect(() => {
    const configSets = currentConfig?.sets || defaultConfig.sets || 3;
    const configMaxReps = currentConfig?.maxReps || defaultConfig.maxReps || 12;

    setSets(configSets);

    // Initialize per-set reps array
    let initialReps = [];
    if (Array.isArray(configMaxReps)) {
      // Already has per-set configuration
      initialReps = [...configMaxReps];
      setDefaultReps(configMaxReps[0] || 12);
    } else {
      // Single value - apply to all sets
      initialReps = Array(configSets).fill(configMaxReps);
      setDefaultReps(configMaxReps);
    }

    // If we have current sets from active workout, use those maxReps values
    if (currentSetsInWorkout && currentSetsInWorkout.length > 0) {
      initialReps = currentSetsInWorkout.map(set => set.maxReps);
      setDefaultReps(initialReps[0] || 12);
    }

    // Ensure we have the right number of elements
    while (initialReps.length < configSets) {
      initialReps.push(defaultReps);
    }
    initialReps = initialReps.slice(0, configSets);

    setPerSetReps(initialReps);
  }, [currentConfig, defaultConfig, sets, currentSetsInWorkout]);

  if (!isOpen) return null;

  const isPersonalized = currentConfig !== null;

  // Update all sets to the same value
  const handleSetAllReps = () => {
    const newReps = Array(sets).fill(defaultReps);
    setPerSetReps(newReps);
  };

  // Update individual set reps
  const handleSetRepsChange = (index, value) => {
    const numValue = parseInt(value) || 1;
    if (numValue < 1 || numValue > 50) return;

    const newReps = [...perSetReps];
    newReps[index] = numValue;
    setPerSetReps(newReps);
    setError('');
  };

  // Update sets count
  const handleSetsChange = (newSets) => {
    if (newSets < 1 || newSets > 10) return;

    setSets(newSets);

    // Adjust perSetReps array
    const newPerSetReps = [...perSetReps];
    if (newSets > perSetReps.length) {
      // Adding sets - fill with default reps
      while (newPerSetReps.length < newSets) {
        newPerSetReps.push(defaultReps);
      }
    } else if (newSets < perSetReps.length) {
      // Removing sets - trim array
      newPerSetReps.splice(newSets);
    }
    setPerSetReps(newPerSetReps);
    setError('');
  };

  const handleSave = () => {
    // Validate inputs
    if (sets < 1 || sets > 10) {
      setError('Sets must be between 1 and 10');
      return;
    }

    // Check if all reps are the same - if so, save as single value for efficiency
    const allSame = perSetReps.every(r => r === perSetReps[0]);
    const maxReps = allSame ? perSetReps[0] : perSetReps;

    onSave({ sets, maxReps });
    onClose();
  };

  const handleReset = () => {
    setSets(defaultConfig.sets);
    const resetReps = Array(defaultConfig.sets).fill(defaultConfig.maxReps || 12);
    setPerSetReps(resetReps);
    setDefaultReps(defaultConfig.maxReps || 12);
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{exercise.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customize Exercise</h2>
              <p className="text-sm text-gray-600">{exercise.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Personalization Status */}
          {isPersonalized && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span>This exercise has personalized settings</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Sets Control */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of Sets
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSetsChange(sets - 1)}
                disabled={sets <= 1}
                className="touch-target w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-white text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-bold text-gray-900">{sets}</div>
                <div className="text-xs text-gray-500 mt-1">Default: {defaultConfig.sets}</div>
              </div>
              <button
                onClick={() => handleSetsChange(sets + 1)}
                disabled={sets >= 10}
                className="touch-target w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-white text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Default Reps Quick Set */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Set All Reps
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={defaultReps}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setDefaultReps(value);
                }}
                className="flex-1 text-center text-xl font-bold px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleSetAllReps}
                className="touch-target px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium flex items-center gap-2"
                title="Apply to all sets"
              >
                <Copy size={18} />
                Apply to All
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Set a value and click "Apply to All" to use the same reps for all sets
            </p>
          </div>

          {/* Per-Set Reps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reps Per Set
            </label>
            <div className="space-y-2">
              {perSetReps.map((reps, index) => (
                <div key={index} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-600 w-16">
                    Set {index + 1}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => handleSetRepsChange(index, reps - 1)}
                      disabled={reps <= 1}
                      className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={reps}
                      onChange={(e) => handleSetRepsChange(index, e.target.value)}
                      className="w-20 text-center font-bold px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSetRepsChange(index, reps + 1)}
                      disabled={reps >= 50}
                      className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500">reps</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 space-y-3 bg-gray-50">
          {isPersonalized && (
            <Button
              variant="secondary"
              fullWidth
              onClick={handleReset}
            >
              Reset to Default
            </Button>
          )}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
