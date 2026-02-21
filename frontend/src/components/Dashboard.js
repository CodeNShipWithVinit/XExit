import React from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isHR, isEmployee } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Resignation Management System</h1>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role badge badge-primary">{user?.role}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            
            {isEmployee() && (
              <>
                <Link to="/dashboard/submit-resignation" className="nav-link">
                  Submit Resignation
                </Link>
                <Link to="/dashboard/my-resignations" className="nav-link">
                  My Resignations
                </Link>
                <Link to="/dashboard/exit-interview" className="nav-link">
                  Exit Interview
                </Link>
              </>
            )}

            {isHR() && (
              <>
                <Link to="/dashboard/resignations" className="nav-link">
                  All Resignations
                </Link>
                <Link to="/dashboard/exit-interviews" className="nav-link">
                  Exit Interviews
                </Link>
              </>
            )}
          </nav>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
