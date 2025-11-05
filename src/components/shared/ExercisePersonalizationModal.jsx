import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
}) => {
  const [sets, setSets] = useState(currentConfig?.sets || defaultConfig.sets || 3);
  const [maxReps, setMaxReps] = useState(currentConfig?.maxReps || defaultConfig.maxReps || 12);
  const [error, setError] = useState('');

  // Update local state when currentConfig changes
  useEffect(() => {
    setSets(currentConfig?.sets || defaultConfig.sets || 3);
    setMaxReps(currentConfig?.maxReps || defaultConfig.maxReps || 12);
  }, [currentConfig, defaultConfig]);

  if (!isOpen) return null;

  const isPersonalized = currentConfig !== null;

  const handleSave = () => {
    // Validate inputs
    if (sets < 1 || sets > 10) {
      setError('Sets must be between 1 and 10');
      return;
    }
    if (maxReps < 1 || maxReps > 50) {
      setError('Max reps must be between 1 and 50');
      return;
    }

    onSave({ sets, maxReps });
    onClose();
  };

  const handleReset = () => {
    setSets(defaultConfig.sets);
    setMaxReps(defaultConfig.maxReps || 12);
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
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

        {/* Body */}
        <div className="p-6 space-y-6">
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

          {/* Sets Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Sets
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (sets > 1) {
                    setSets(sets - 1);
                    setError('');
                  }
                }}
                className="touch-target w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 text-xl font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="10"
                value={sets}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setSets(value);
                  setError('');
                }}
                className="flex-1 text-center text-2xl font-bold px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (sets < 10) {
                    setSets(sets + 1);
                    setError('');
                  }
                }}
                className="touch-target w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 text-xl font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default: {defaultConfig.sets} sets
            </p>
          </div>

          {/* Max Reps Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Reps per Set
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (maxReps > 1) {
                    setMaxReps(maxReps - 1);
                    setError('');
                  }
                }}
                className="touch-target w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 text-xl font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={maxReps}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setMaxReps(value);
                  setError('');
                }}
                className="flex-1 text-center text-2xl font-bold px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (maxReps < 50) {
                    setMaxReps(maxReps + 1);
                    setError('');
                  }
                }}
                className="touch-target w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 text-xl font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default: {defaultConfig.maxReps || 12} reps
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 space-y-3">
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
