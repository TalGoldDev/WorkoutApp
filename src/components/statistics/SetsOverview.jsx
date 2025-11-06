import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { getWeeklySetsOverview, getExerciseWeekRange } from '../../services/localStorageService';

export const SetsOverview = ({ exerciseId }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Reset weekOffset when exercise changes
  useEffect(() => {
    setWeekOffset(0);
  }, [exerciseId]);

  // Get week range for this exercise
  const weekRange = useMemo(() => {
    if (!exerciseId) return { earliestWeekOffset: 0, latestWeekOffset: 0, hasData: false };
    return getExerciseWeekRange(exerciseId);
  }, [exerciseId]);

  // Get week data
  const weekData = useMemo(() => {
    if (!exerciseId) return null;
    return getWeeklySetsOverview(exerciseId, weekOffset);
  }, [exerciseId, weekOffset]);

  // Check if we can navigate to previous week (further back in time)
  const canNavigatePrevious = useMemo(() => {
    if (!exerciseId) return false;
    // Can go back if we haven't reached the earliest week with data
    return weekOffset > weekRange.earliestWeekOffset;
  }, [exerciseId, weekOffset, weekRange]);

  // Check if we can navigate to next week (forward in time, toward present)
  const canNavigateNext = useMemo(() => {
    if (!exerciseId) return false;
    // Can go forward if we're not at the current week (week 0)
    return weekOffset < 0;
  }, [exerciseId, weekOffset]);

  // Don't show if there's never been any data for this exercise
  if (!weekData) {
    return null;
  }

  // Don't show if there's no data for this exercise at all
  if (!weekRange.hasData) {
    return null;
  }

  // Format date range
  const dateRange = `${format(weekData.weekStart, 'd/M')} - ${format(weekData.weekEnd, 'd/M')}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-4">
        <BarChart3 size={20} />
        <h3 className="font-semibold">Sets Overview</h3>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={!canNavigatePrevious}
          className={`p-2 rounded-lg transition-colors ${
            canNavigatePrevious
              ? 'text-primary hover:bg-primary/10 dark:text-blue-400 dark:hover:bg-blue-400/10'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Previous week"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
          {dateRange}
        </span>

        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={!canNavigateNext}
          className={`p-2 rounded-lg transition-colors ${
            canNavigateNext
              ? 'text-primary hover:bg-primary/10 dark:text-blue-400 dark:hover:bg-blue-400/10'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Next week"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Sets Grid or Empty State */}
      {weekData.sets.length > 0 ? (
        <div className="flex flex-wrap gap-3 justify-center">
          {weekData.sets.map((set, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1"
            >
              {/* Set Number Badge */}
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-blue-400/10 flex items-center justify-center border-2 border-primary dark:border-blue-400">
                <span className="text-lg font-bold text-primary dark:text-blue-400">
                  {set.setNumber}
                </span>
              </div>

              {/* Reps Count */}
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {set.reps}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  reps
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No sets completed this week
          </p>
        </div>
      )}
    </div>
  );
};
