import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { Loader } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('landing'); // landing, auth, dashboard

  // Sync auth state with navigation page
  useEffect(() => {
    if (!loading) {
      if (user) {
        setPage('dashboard');
      } else if (page === 'dashboard') {
        setPage('landing');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{
        background: '#07090e',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '3px solid rgba(139, 92, 246, 0.1)',
          borderTopColor: 'var(--secondary)',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ 
          fontFamily: 'var(--font-header)', 
          fontSize: '1rem', 
          fontWeight: 700, 
          color: 'var(--text-secondary)',
          letterSpacing: '0.05em'
        }}>
          ⚡ SECURING WORKSPACE...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (page === 'landing') {
    return <Landing onStart={() => setPage('auth')} />;
  }

  if (page === 'auth') {
    return (
      <Auth 
        onAuthSuccess={() => setPage('dashboard')} 
        onBackToLanding={() => setPage('landing')} 
      />
    );
  }

  if (page === 'dashboard' && user) {
    return <Dashboard />;
  }

  return <Landing onStart={() => setPage('auth')} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
