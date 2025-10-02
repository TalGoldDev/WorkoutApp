/**
 * Generate a unique ID (simple UUID v4 implementation)
 */
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Validate that a number is positive
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Format weight with max 2 decimal places
 */
export const formatWeight = (weight) => {
  return Math.round(weight * 100) / 100;
};

/**
 * Validate exercise name
 */
export const validateExerciseName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Exercise name is required';
  }
  if (name.length > 50) {
    return 'Exercise name must be 50 characters or less';
  }
  return null;
};

/**
 * Validate number of sets
 */
export const validateSets = (sets) => {
  const num = parseInt(sets);
  if (isNaN(num) || num < 1 || num > 5) {
    return 'Sets must be between 1 and 5';
  }
  return null;
};

/**
 * Calculate workout duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  const diff = new Date(endTime) - new Date(startTime);
  return Math.round(diff / 1000 / 60); // Convert to minutes
};
