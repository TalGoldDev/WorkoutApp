import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { getWeeklySetsOverview } from '../../services/localStorageService';

export const SetsOverview = ({ exerciseId }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Reset weekOffset when exercise changes
  useEffect(() => {
    setWeekOffset(0);
  }, [exerciseId]);

  // Get week data
  const weekData = useMemo(() => {
    if (!exerciseId) return null;
    return getWeeklySetsOverview(exerciseId, weekOffset);
  }, [exerciseId, weekOffset]);

  // Check if we can navigate to previous week
  const canNavigatePrevious = useMemo(() => {
    if (!weekData) return false;
    // Can navigate if there are sets in previous week
    const prevWeekData = getWeeklySetsOverview(exerciseId, weekOffset - 1);
    return prevWeekData.sets.length > 0;
  }, [exerciseId, weekOffset, weekData]);

  // Check if we can navigate to next week
  const canNavigateNext = useMemo(() => {
    // Can't navigate to future weeks
    const now = new Date();
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - daysFromMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    return weekData && weekData.weekStart < currentWeekStart;
  }, [weekData]);

  // Don't show if there's never been any data for this exercise
  if (!weekData) {
    return null;
  }

  // Check if there's any data at all for this exercise (across all weeks)
  const hasAnyData = canNavigatePrevious || weekData.sets.length > 0 || canNavigateNext;

  if (!hasAnyData) {
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
