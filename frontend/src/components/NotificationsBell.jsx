import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (id, requestId) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => prev - 1);
    navigate(`/request/${requestId}`);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'white' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '30px', width: '300px', maxHeight: '400px', overflowY: 'auto', background: 'white', color: 'black', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '10px', fontSize: '14px' }}>Немає сповіщень</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} onClick={() => handleNotificationClick(n.id, n.requestId)} style={{ padding: '10px', borderBottom: '1px solid #eee', background: n.read ? 'white' : '#f0f8ff', cursor: 'pointer' }}>
                <div style={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
