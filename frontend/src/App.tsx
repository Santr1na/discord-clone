import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/MainLayout';
import Friends from './pages/Friends';
import Chat from './pages/Chat';
import Groups from './pages/Groups';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Friends />} />
                    <Route path="/chat/:friendId" element={<Chat />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/group/:groupId" element={<Chat />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
