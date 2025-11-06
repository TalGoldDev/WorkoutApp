import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { Dumbbell, Plus, ListPlus, Pencil, Trash2 } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { workoutTemplates, startWorkout, getPersonalizationCount, deleteTemplate } = useWorkoutContext();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleStartWorkout = (template) => {
    startWorkout(template);
    navigate('/active-workout');
  };

  const handleEditTemplate = (template) => {
    navigate('/create-workout', { state: { editTemplate: template } });
  };

  const handleDeleteTemplate = (templateId) => {
    deleteTemplate(templateId);
    setDeleteConfirmId(null);
  };

  const prebuiltTemplates = workoutTemplates.filter((t) => t.isPrebuilt);
  const customTemplates = workoutTemplates.filter((t) => !t.isPrebuilt);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <Dumbbell size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your progress, achieve your goals</p>
        </div>

        {/* Quick Start */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/create-workout')}
            className="mb-3"
          >
            <Plus size={20} className="inline mr-2" />
            Create New Workout
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigate('/custom-exercises')}
          >
            <ListPlus size={20} className="inline mr-2" />
            Manage Custom Exercises
          </Button>
        </div>

        {/* Pre-built Programs */}
        {prebuiltTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pre-built Programs
            </h2>
            <div className="space-y-3">
              {prebuiltTemplates.map((template) => {
                const personalizationCount = getPersonalizationCount(template.id);

                return (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {personalizationCount > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <span>⭐</span>
                          <span>{personalizationCount}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.exercises.length} exercises
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleStartWorkout(template)}
                    >
                      Start Workout
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Workouts */}
        {customTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              My Workouts
            </h2>
            <div className="space-y-3">
              {customTemplates.map((template) => {
                const personalizationCount = getPersonalizationCount(template.id);

                return (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {personalizationCount > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <span>⭐</span>
                          <span>{personalizationCount}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.exercises.length} exercises
                    </p>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1 touch-target p-2 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
                        title="Edit workout"
                      >
                        <Pencil size={16} />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      {deleteConfirmId === template.id ? (
                        <>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="flex-1 touch-target p-2 text-white bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                          >
                            <span className="text-sm font-medium">Confirm</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 touch-target p-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <span className="text-sm font-medium">Cancel</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(template.id)}
                          className="flex-1 touch-target p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
                          title="Delete workout"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => handleStartWorkout(template)}
                    >
                      Start Workout
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
