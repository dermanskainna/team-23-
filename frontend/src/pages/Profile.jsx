import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState({ email: 'example@email.com', role: 'military' });
  const [activeTab, setActiveTab] = useState('published');

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
      if (savedUser.role === 'volunteer') setActiveTab('accepted');
    }
  }, []);

  const publishedRequests = [
    { id: 1, title: "Медикаменти", description: "Бинти (50шт), знеболювальні (10 пачок)", location: "Бахмутський напрямок", status: "active" },
    { id: 2, title: "Дрон Mavic 3", description: "Стандартна комплектація + 2 додаткові батареї", location: "Куп'янськ", status: "completed" }
  ];

  const acceptedRequests = [
    { id: 3, title: "Тепловізор", description: "Pulsar Thermion", location: "Авдіївка", status: "in_progress" }
  ];

  const getStatusLabel = (status) => {
    if (status === "active") return "Активний";
    if (status === "in_progress") return "В процесі";
    if (status === "completed") return "Виконано";
  };

  const handleRepeatOrder = (req) => {
    navigate('/create-request', { state: { repeatedData: req } });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <section className="section">
      <div className="container">

        <div className="card profile-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h2>Мій профіль</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong>Статус:</strong>
              <span className={`status-badge ${user.role === 'military' ? 'military' : 'volunteer'}`}>
                {user.role === 'military' ? 'Військовий' : 'Волонтер'}
              </span>
            </p>
          </div>

          <button
            className="btn"
            style={{ background: '#e74c3c', color: 'white', padding: '8px 16px', fontWeight: 'bold' }}
            onClick={handleLogout}
          >
        Вийти
          </button>
        </div>

        <div className="tabs" style={{ marginBottom: '20px' }}>
          {user.role === 'military' && (
            <button className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`} onClick={() => setActiveTab('published')}>
              Опубліковані ({publishedRequests.length})
            </button>
          )}
          {user.role === 'volunteer' && (
            <button className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`} onClick={() => setActiveTab('accepted')}>
              Прийняті ({acceptedRequests.length})
            </button>
          )}
        </div>

        {activeTab === 'published' && user.role === 'military' && (
          <div className="tab-content active">
            {publishedRequests.map((req) => (
              <div key={req.id} className="card request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{req.title}</h3>
                  <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => handleRepeatOrder(req)}
                >
                Повторити
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'accepted' && user.role === 'volunteer' && (
          <div className="tab-content active">
            {acceptedRequests.map((req) => (
              <div key={req.id} className="card request-card" style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{req.title}</h3>
                <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
