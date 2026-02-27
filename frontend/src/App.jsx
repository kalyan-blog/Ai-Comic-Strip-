/**
 * Main App Component with Routing
 * TEXPERIA 2026 - AI Comic Strip Challenge
 */

import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout (always loaded)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Pages (lazy loaded for code splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TeamRegistration = lazy(() => import('./pages/TeamRegistration'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-comic-dark">
    <div className="text-2xl font-bangers text-comic-cyan animate-pulse">Loading...</div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-comic-dark">
        <div className="text-4xl font-bangers text-comic-cyan animate-pulse">
          Loading...
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Splash always shows on page load (remove sessionStorage check for now)
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Student Routes */}
          <Route 
            path="/team-registration/:eventId" 
            element={
              <ProtectedRoute>
                <TeamRegistration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </Suspense>
      </main>
      <Footer />
    </div>
    </ErrorBoundary>
  );
}

export default App;
