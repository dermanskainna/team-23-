import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ email: 'example@email.com', role: 'military' });
  const [activeTab, setActiveTab] = useState('published');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
      if (savedUser.role === 'volunteer') setActiveTab('accepted');
    }
  }, []);

  const publishedRequests = [
    { title: "Медикаменти", status: "active" },
    { title: "Дрон", status: "completed" }
  ];
  const acceptedRequests = [
    { title: "Тепловізор", status: "in_progress" }
  ];

  const getStatusLabel = (status) => {
    if (status === "active") return "Активний";
    if (status === "in_progress") return "В процесі";
    if (status === "completed") return "Виконано";
  };

  return (
    <section className="section">
      <div className="container">
        <div className="card profile-card">
          <h2>Мій профіль</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Статус:</strong>
            <span className={`status-badge ${user.role}`}>
              {user.role === 'military' ? 'Військовий' : 'Волонтер'}
            </span>
          </p>
        </div>

        <div className="tabs">
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
            {publishedRequests.map((req, index) => (
              <div key={index} className="card request-card">
                <h3>{req.title}</h3>
                <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'accepted' && user.role === 'volunteer' && (
          <div className="tab-content active">
            {acceptedRequests.map((req, index) => (
              <div key={index} className="card request-card">
                <h3>{req.title}</h3>
                <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
