import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUserRole(savedUser.role);
    } else {
      setUserRole(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLiteMode) {
      document.body.classList.add('lite-mode');
    } else {
      document.body.classList.remove('lite-mode');
    }
  }, [isLiteMode]);

  const handleEmergencyExit = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login');
  };

  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">Logo</div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/">Головна</Link>

          {!userRole && <Link to="/login">Увійти</Link>}

          {userRole && <Link to="/tracking">Трекінг</Link>}

          {userRole === 'military' && (
            <>
              <Link to="/create-request">Новий запит</Link>
              <Link to="/profile">Мої запити</Link>
            </>
          )}

          {userRole === 'volunteer' && (
            <>
              <Link to="/dashboard">Дашборд</Link>
              <Link to="/warehouse">Склад</Link>
              <Link to="/profile">Профіль</Link>
            </>
          )}

          <button
            onClick={() => setIsLiteMode(!isLiteMode)}
            style={{
              background: isLiteMode ? '#F4A261' : 'transparent',
              border: '1px solid white', color: 'white', padding: '6px 12px',
              borderRadius: '6px', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold'
            }}
            title="Оптимізація для поганого інтернету"
          >
            {isLiteMode ? 'Зв\'язок: Поганий' : 'Зв\'язок: Ок'}
          </button>

          {userRole && (
            <button
              onClick={handleEmergencyExit}
              style={{
                background: '#c0392b', border: 'none', color: 'white', padding: '6px 12px',
                borderRadius: '6px', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
              title="Екстрене знищення сесії та вихід"
            >
              🚨
            </button>
          )}

        </nav>
      </div>
    </header>
  );
}
