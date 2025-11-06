import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { CustomExerciseModal } from '../components/shared/CustomExerciseModal';
import { Plus, Pencil, Trash2, Search, Dumbbell, Target } from 'lucide-react';

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

  if (customExercises.length === 0) {
    return (
      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <Dumbbell size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Exercises</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage your custom exercises</p>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-primary/10 to-success/10 dark:from-primary/20 dark:to-success/20 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Target size={64} className="text-primary dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Custom Exercises Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first custom exercise to personalize your workout library.
              You can add exercises that aren't in the default list.
            </p>
            <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
              <Plus size={20} className="inline mr-2" />
              Create Your First Exercise
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <Dumbbell size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Exercises</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {customExercises.length} custom exercise{customExercises.length !== 1 ? 's' : ''} created
          </p>
        </div>

        {/* Add New Exercise Button */}
        <div className="mb-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleOpenCreateModal}
          >
            <Plus size={20} className="inline mr-2" />
            Create New Exercise
          </Button>
        </div>

        {/* Search and Filter */}
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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

        {/* Exercise List */}
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Exercises Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-2xl">{exercise.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      <span>{exercise.muscleGroup}</span>
                      <span>•</span>
                      <span>{exercise.defaultSets} sets</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(exercise)}
                      className="touch-target p-2 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit exercise"
                    >
                      <Pencil size={20} />
                    </button>
                    {deleteConfirmId === exercise.id ? (
                      <>
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="touch-target px-3 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="touch-target px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(exercise.id)}
                        className="touch-target p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete exercise"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
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
