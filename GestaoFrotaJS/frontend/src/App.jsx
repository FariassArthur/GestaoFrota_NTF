import React, { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GenericModule from './components/GenericModule';
import { MODULES, getByKey } from './modules/config';
import { fetchList } from './api/client';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentKey, setCurrentKey] = useState('dashboard');
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) loadVehicles();
  }, [token]);

  const loadVehicles = async () => {
    try {
      const data = await fetchList('/api/veiculos', token);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    }
  };

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const handleLoginSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData || { username: 'admin' });
    setCurrentKey('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentKey('dashboard');
  };

  if (!token) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const currentModule = getByKey(currentKey);

  return (
    <div className="app-container">
      <Header
        user={user}
        token={token}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        currentModule={currentModule?.label}
      />
      <div className="app-main">
        <Sidebar currentKey={currentKey} onModuleSelect={setCurrentKey} />
        <main className="app-content">
          {currentKey === 'dashboard' ? (
            <Dashboard vehicles={vehicles} />
          ) : (
            <GenericModule
              moduleConfig={currentModule}
              token={token}
              vehicles={vehicles}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ vehicles }) {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Bem-vindo ao sistema de gestão de frota!</p>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{vehicles.length}</h3>
          <p>Veículos Registrados</p>
        </div>
      </div>
      <p style={{ fontSize: '14px', color: '#888', marginTop: '20px' }}>
        Selecione um módulo no menu lateral para começar a trabalhar.
      </p>
    </div>
  );
}
