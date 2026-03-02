import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationsBell from './NotificationsBell';

const Logo = () => (
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textDecoration: 'none' }}>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org">
      <path d="M12 2L4 6V12C4 17.5 7.5 21.5 12 23C16.5 21.5 20 17.5 20 12V6L12 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 13C8 13 9.5 15.5 12 15.5C14.5 15.5 16 13 16 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 18.5L12 20.5L14 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
      <span style={{ color: 'white', fontWeight: '800', fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase' }}>Варта</span>
      <span style={{ color: '#F4A261', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>VOLUNTEER HUB</span>
    </div>
  </Link>
);

export default function Header() {
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUserRole(savedUser ? savedUser.role : null);
  }, [location.pathname]);

  useEffect(() => {
    if (isLiteMode) document.body.classList.add('lite-mode');
    else document.body.classList.remove('lite-mode');
  }, [isLiteMode]);

  const handleNormalLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login');
  };

  const handleEmergencyExit = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('https://www.google.com');
  };

  useEffect(() => {
    let lastEscapeTime = 0;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const currentTime = new Date().getTime();
        if (currentTime - lastEscapeTime < 500) {
          handleEmergencyExit();
        }
        lastEscapeTime = currentTime;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="navbar" style={{
      background: '#3A5A40',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <Logo />

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Головна</Link>

          {!userRole && <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Увійти</Link>}

          {userRole && <Link to="/tracking" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Трекінг</Link>}

          {userRole === 'military' && (
            <>
              <Link to="/create-request" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Новий запит</Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Мої запити</Link>
            </>
          )}

          {userRole === 'volunteer' && (
            <>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Дашборд</Link>
              <Link to="/warehouse" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Склад</Link>
              <Link to="/suppliers" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Постачальники</Link>
              <Link to="/offers" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Офери</Link>
              <Link to="/verify-military" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Підтвердження</Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Профіль</Link>
            </>
          )}

          {userRole && <NotificationsBell />}

          <button
            onClick={() => setIsLiteMode(!isLiteMode)}
            style={{ background: isLiteMode ? '#F4A261' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold', fontSize: '13px', transition: '0.3s' }}
          >
            {isLiteMode ? "Зв'язок: Поганий" : "Зв'язок: Ок"}
          </button>

          {userRole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '5px' }}>
              <button
                onClick={handleNormalLogout}
                title="Звичайний вихід"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: '0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Вийти
              </button>

              <button
                onClick={handleEmergencyExit}
                title="Екстрене очищення (подвійний клік Esc)"
                style={{ background: '#e74c3c', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
