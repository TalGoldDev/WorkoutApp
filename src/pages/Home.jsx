import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../contexts/WorkoutContext';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';
import { Dumbbell, Plus } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { workoutTemplates, startWorkout } = useWorkoutContext();

  const handleStartWorkout = (template) => {
    startWorkout(template);
    navigate('/active-workout');
  };

  const prebuiltTemplates = workoutTemplates.filter((t) => t.isPrebuilt);
  const customTemplates = workoutTemplates.filter((t) => !t.isPrebuilt);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <Dumbbell size={48} className="mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Workout Tracker</h1>
          <p className="text-gray-600 mt-2">Track your progress, achieve your goals</p>
        </div>

        {/* Quick Start */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/create-workout')}
            className="mb-4"
          >
            <Plus size={20} className="inline mr-2" />
            Create New Workout
          </Button>
        </div>

        {/* Pre-built Programs */}
        {prebuiltTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pre-built Programs
            </h2>
            <div className="space-y-3">
              {prebuiltTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
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
              ))}
            </div>
          </div>
        )}

        {/* Custom Workouts */}
        {customTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Workouts
            </h2>
            <div className="space-y-3">
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.exercises.length} exercises
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => handleStartWorkout(template)}
                  >
                    Start Workout
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
