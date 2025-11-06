import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const CustomExerciseModal = ({
  isOpen,
  onClose,
  onSave,
  editingExercise = null,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [defaultSets, setDefaultSets] = useState(3);
  const [error, setError] = useState('');

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Calves', 'Core', 'Other'];

  // Common emoji suggestions for exercises
  const emojiSuggestions = ['💪', '🏋️', '🔥', '⚡', '🎯', '🦵', '🦾', '💥', '🏃', '🚴'];

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name || '');
      setEmoji(editingExercise.emoji || '💪');
      setMuscleGroup(editingExercise.muscleGroup || 'Chest');
      setDefaultSets(editingExercise.defaultSets || 3);
    } else {
      // Reset form when opening for new exercise
      setName('');
      setEmoji('💪');
      setMuscleGroup('Chest');
      setDefaultSets(3);
    }
    setError('');
  }, [editingExercise, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate inputs
    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }

    if (name.trim().length > 50) {
      setError('Exercise name must be 50 characters or less');
      return;
    }

    if (!emoji.trim()) {
      setError('Please select an emoji');
      return;
    }

    // Validate emoji is a single character/emoji
    if (emoji.length > 10) { // Allow for multi-byte emoji sequences
      setError('Please use a single emoji');
      return;
    }

    if (defaultSets < 1 || defaultSets > 5) {
      setError('Default sets must be between 1 and 5');
      return;
    }

    const exerciseData = {
      name: name.trim(),
      emoji: emoji.trim(),
      muscleGroup,
      defaultSets,
    };

    onSave(exerciseData);
    onClose();
  };

  const handleEmojiSelect = (selectedEmoji) => {
    setEmoji(selectedEmoji);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50 dark:bg-opacity-80"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {editingExercise ? 'Edit Exercise' : 'Create Custom Exercise'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
              {editingExercise ? 'Update your custom exercise' : 'Add a new exercise to your library'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="touch-target flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-xs sm:text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Exercise Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Hammer Curl"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              maxLength={50}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {name.length}/50 characters
            </p>
          </div>

          {/* Emoji Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Emoji *
            </label>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="text-2xl sm:text-4xl">{emoji}</span>
              </div>
              <input
                type="text"
                placeholder="Enter emoji"
                value={emoji}
                onChange={(e) => {
                  setEmoji(e.target.value);
                  setError('');
                }}
                maxLength={10}
                className="flex-1 px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xl sm:text-2xl text-center"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {emojiSuggestions.map((suggestedEmoji) => (
                <button
                  key={suggestedEmoji}
                  onClick={() => handleEmojiSelect(suggestedEmoji)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl rounded-lg border-2 transition-all ${
                    emoji === suggestedEmoji
                      ? 'border-primary dark:border-blue-500 bg-primary/10 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary dark:hover:border-blue-500'
                  }`}
                >
                  {suggestedEmoji}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Muscle Group *
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => {
                setMuscleGroup(e.target.value);
                setError('');
              }}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
            >
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Default Sets */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              Default Number of Sets *
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setDefaultSets(Math.max(1, defaultSets - 1))}
                disabled={defaultSets <= 1}
                className="touch-target w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 text-lg sm:text-xl font-bold text-gray-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{defaultSets}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">sets per workout</div>
              </div>
              <button
                onClick={() => setDefaultSets(Math.min(5, defaultSets + 1))}
                disabled={defaultSets >= 5}
                className="touch-target w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 text-lg sm:text-xl font-bold text-gray-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
              💡 You can customize sets, reps, and rest time for each workout template after adding this exercise.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-2 sm:gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-sm sm:text-base">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1 text-sm sm:text-base">
            {editingExercise ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};
