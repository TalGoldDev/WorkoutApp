import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { Home } from './pages/Home';
import { CreateWorkout } from './pages/CreateWorkout';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { History } from './pages/History';
import { Statistics } from './pages/Statistics';
import { Admin } from './pages/Admin';

function App() {
  return (
    <Router>
      <WorkoutProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-workout" element={<CreateWorkout />} />
          <Route path="/active-workout" element={<ActiveWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </WorkoutProvider>
    </Router>
  );
}

export default App;
