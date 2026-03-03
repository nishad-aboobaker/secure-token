import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import { api, setAuthToken } from './lib/api';

// Check if a JWT is expired by decoding the payload
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'admin'
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('adminToken');
        setAuthToken(null);
        setIsAdmin(false);
      } else {
        setAuthToken(token);
        setIsAdmin(true);
        setView('admin');
      }
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('adminToken', token);
    setAuthToken(token);
    setIsAdmin(true);
    setView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthToken(null);
    setIsAdmin(false);
    setView('landing');
  };

  if (view === 'login') {
    return <LoginForm
      onSuccess={handleLoginSuccess}
      onBack={() => setView('landing')}
    />;
  }

  if (view === 'admin') {
    if (!isAdmin) {
      return <LoginForm onSuccess={handleLoginSuccess} onBack={() => setView('landing')} />;
    }
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <LandingPage
      onAdminClick={() => setView('login')}
    />
  );
}

export default App;

