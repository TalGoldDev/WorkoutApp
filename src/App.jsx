import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { Home } from './pages/Home';
import { CreateWorkout } from './pages/CreateWorkout';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { History } from './pages/History';
import { Statistics } from './pages/Statistics';
import { Admin } from './pages/Admin';
import { CustomExercises } from './pages/CustomExercises';

function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Command (Mac) or Control (Windows/Linux) + Shift + A
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault(); // Prevent default browser behavior
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <WorkoutProvider>
          <KeyboardShortcuts />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-workout" element={<CreateWorkout />} />
            <Route path="/active-workout" element={<ActiveWorkout />} />
            <Route path="/history" element={<History />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/custom-exercises" element={<CustomExercises />} />
          </Routes>
        </WorkoutProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
