import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Project from '../screens/Project';
import StudyRoom from '../screens/StudyRoom';
import StudyRoomList from '../screens/StudyRoomList';
import Quiz from '../screens/Quiz';
import Interview from '../screens/Interview';
import SocketTest from '../screens/SocketTest';
import UserAuth from '../auth/userAuth';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Dashboard Home */}
        <Route path="/" element={<UserAuth><Home /></UserAuth>} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Study Rooms Module */}
        <Route path="/studyrooms" element={<UserAuth><StudyRoomList /></UserAuth>} />
        <Route path="/studyroom/:id" element={<UserAuth><StudyRoom /></UserAuth>} />

        {/* Quiz Module */}
        <Route path="/quiz" element={<UserAuth><Quiz /></UserAuth>} />

        {/* Interview Module */}
        <Route path="/interview" element={<UserAuth><Interview /></UserAuth>} />

        {/* Legacy Project routes (keep for backward compatibility) */}
        <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
        <Route path="/project/:id" element={<UserAuth><Project /></UserAuth>} />

        {/* Socket.IO Test route */}
        <Route path="/socket-test" element={<UserAuth><SocketTest /></UserAuth>} />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;