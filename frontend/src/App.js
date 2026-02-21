import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeHome from './components/EmployeeHome';
import HRHome from './components/HRHome';
import SubmitResignation from './components/SubmitResignation';
import MyResignations from './components/MyResignations';
import ExitInterview from './components/ExitInterview';
import AllResignations from './components/AllResignations';
import AllExitInterviews from './components/AllExitInterviews';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Home redirect component
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            
            {/* Employee routes */}
            <Route
              path="submit-resignation"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <SubmitResignation />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-resignations"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <MyResignations />
                </ProtectedRoute>
              }
            />
            <Route
              path="exit-interview"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <ExitInterview />
                </ProtectedRoute>
              }
            />
            
            {/* HR routes */}
            <Route
              path="resignations"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AllResignations />
                </ProtectedRoute>
              }
            />
            <Route
              path="exit-interviews"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AllExitInterviews />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Dashboard home component that shows different content based on role
const DashboardHome = () => {
  const { user } = useAuth();
  
  if (user?.role === 'HR') {
    return <HRHome />;
  }
  
  return <EmployeeHome />;
};

export default App;
