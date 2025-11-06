import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { CustomExerciseModal } from '../components/shared/CustomExerciseModal';
import { ArrowLeft, Plus, Pencil, Trash2, Search } from 'lucide-react';

export const CustomExercises = () => {
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise, deleteExercise } = useWorkoutContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter only custom exercises
  const customExercises = useMemo(() => {
    return exercises.filter(ex => ex.isCustom === true);
  }, [exercises]);

  // Get muscle groups from custom exercises
  const muscleGroups = useMemo(() => {
    const groups = new Set(customExercises.map(ex => ex.muscleGroup));
    return ['All', ...Array.from(groups).sort()];
  }, [customExercises]);

  // Filter exercises based on search and muscle group
  const filteredExercises = useMemo(() => {
    let filtered = customExercises;

    // Filter by muscle group
    if (selectedMuscleGroup !== 'All') {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.muscleGroup?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [customExercises, selectedMuscleGroup, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingExercise(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exercise) => {
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const handleSaveExercise = (exerciseData) => {
    if (editingExercise) {
      // Update existing exercise
      updateExercise(editingExercise.id, exerciseData);
    } else {
      // Create new exercise
      const newExercise = {
        ...exerciseData,
        id: crypto.randomUUID(),
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      addExercise(newExercise);
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (exerciseId) => {
    deleteExercise(exerciseId);
    setDeleteConfirmId(null);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Custom Exercises
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage your custom exercises
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              New Exercise
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💪</span>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Total Custom Exercises
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {customExercises.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {customExercises.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Muscle Group Filter */}
            {muscleGroups.length > 1 && (
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedMuscleGroup(group)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        selectedMuscleGroup === group
                          ? 'bg-primary dark:bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exercise List */}
        {customExercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Custom Exercises Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first custom exercise to personalize your workout library.
              You can add exercises that aren't in the default list.
            </p>
            <Button variant="primary" onClick={handleOpenCreateModal} className="mx-auto">
              <Plus size={20} className="inline mr-2" />
              Create Your First Exercise
            </Button>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Exercises Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <span className="text-4xl">{exercise.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {exercise.muscleGroup}
                      </span>
                      <span>•</span>
                      <span>{exercise.defaultSets} sets</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(exercise)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      {deleteConfirmId === exercise.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="px-3 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(exercise.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Exercise Modal */}
      <CustomExerciseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExercise(null);
        }}
        onSave={handleSaveExercise}
        editingExercise={editingExercise}
      />
    </Layout>
  );
};
