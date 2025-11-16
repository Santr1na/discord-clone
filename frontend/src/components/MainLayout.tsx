import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Discord Clone</h2>
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <div className="username">{user?.username}</div>
              <div className="user-status">{user?.status || 'offline'}</div>
            </div>
            <button onClick={handleLogout} className="logout-btn">Выход</button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => navigate('/')} className="nav-item">
            Друзья
          </button>
          <button onClick={() => navigate('/groups')} className="nav-item">
            Группы
          </button>
        </nav>
      </div>
      <div className="main-content">{children}</div>
    </div>
  );
};

export default MainLayout;

