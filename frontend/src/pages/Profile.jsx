import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: 'example@email.com',
    role: 'military',
    fullName: '',
    phone: '',
    organization: ''
  });

  const [activeTab, setActiveTab] = useState('published');

  const [formData, setFormData] = useState({ fullName: '', phone: '', organization: '' });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      const fullUserData = {
        ...savedUser,
        fullName: savedUser.fullName || '',
        phone: savedUser.phone || '',
        organization: savedUser.organization || ''
      };
      setUser(fullUserData);
      setFormData(fullUserData);

      if (savedUser.role === 'volunteer') setActiveTab('accepted');
    }
  }, []);

  const [publishedRequests, setPublishedRequests] = useState([
    { id: '1001', title: "Медикаменти", description: "Бинти (50шт), знеболювальні (10 пачок)", location: "Бахмутський напрямок", status: "active" },
    { id: '1002', title: "Дрон Mavic 3", description: "Стандартна комплектація + 2 додаткові батареї", location: "Куп'янськ", status: "completed", feedback: null }
  ]);

  const acceptedRequests = [
    { id: '1003', title: "Тепловізор", description: "Pulsar Thermion", location: "Авдіївка", status: "in_progress" }
  ];

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRequest, setFeedbackRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

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

  const openFeedbackModal = (req) => {
    setFeedbackRequest(req);
    setIsFeedbackModalOpen(true);
  };

  const submitFeedback = () => {
    if (rating === 0) {
      alert("Будь ласка, поставте оцінку зірочками!");
      return;
    }
    setPublishedRequests(publishedRequests.map(req =>
      req.id === feedbackRequest.id ? { ...req, feedback: { rating, text: feedbackText } } : req
    ));
    setIsFeedbackModalOpen(false);
    setFeedbackRequest(null);
    setRating(0);
    setFeedbackText('');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Дані профілю успішно оновлено!");
  };

  return (
    <section className="section">
      <div className="container" style={{ position: 'relative' }}>

        <div className="card profile-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h2>{user.fullName ? user.fullName : "Мій профіль"}</h2>
            <p style={{ color: '#555', marginBottom: '10px' }}><strong>Email:</strong> {user.email}</p>
            {user.phone && <p style={{ color: '#555', marginBottom: '10px' }}><strong>Телефон:</strong> {user.phone}</p>}
            {user.organization && (
              <p style={{ color: '#555', marginBottom: '10px' }}>
                <strong>{user.role === 'military' ? 'Підрозділ:' : 'Організація:'}</strong> {user.organization}
              </p>
            )}

            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
              <strong>Статус:</strong>
              <span className={`status-badge ${user.role === 'military' ? 'military' : 'volunteer'}`}>
                {user.role === 'military' ? 'Військовий' : 'Волонтер'}
              </span>
            </p>
          </div>
          <button className="btn" style={{ background: '#e74c3c', color: 'white', padding: '8px 16px', fontWeight: 'bold' }} onClick={handleLogout}>
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

          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Налаштування
          </button>
        </div>

        {activeTab === 'published' && user.role === 'military' && (
          <div className="tab-content active">
            {publishedRequests.map((req) => (
              <div key={req.id} className="card request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>
                    <span style={{ color: '#888', marginRight: '8px', fontSize: '16px' }}>#{req.id}</span>
                    {req.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
                    {req.feedback && (
                      <span style={{ fontSize: '13px', color: '#f39c12', fontWeight: 'bold' }}>
                        {'★'.repeat(req.feedback.rating)}{'☆'.repeat(5 - req.feedback.rating)} Оцінено
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {req.status === 'completed' && !req.feedback && (
                    <button className="btn" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px', background: '#f39c12', color: 'white' }} onClick={() => openFeedbackModal(req)}>
                      Оцінити
                    </button>
                  )}
                  <button className="btn btn-primary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => handleRepeatOrder(req)}>
                    Повторити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'accepted' && user.role === 'volunteer' && (
          <div className="tab-content active">
            {acceptedRequests.map((req) => (
              <div key={req.id} className="card request-card" style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>
                  <span style={{ color: '#888', marginRight: '8px', fontSize: '16px' }}>#{req.id}</span>
                  {req.title}
                </h3>
                <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content active">
            <div className="card" style={{ maxWidth: '600px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2C3E50' }}>Редагування профілю</h3>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>ПІБ або Позивний</label>
                  <input
                    className="input" style={{ marginBottom: 0 }} type="text"
                    placeholder="Напр., Іван Петренко"
                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Номер телефону</label>
                  <input
                    className="input" style={{ marginBottom: 0 }} type="tel"
                    placeholder="+380..."
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>
                    {user.role === 'military' ? 'Підрозділ / Бригада' : 'Фонд / Волонтерська організація'}
                  </label>
                  <input
                    className="input" style={{ marginBottom: 0 }} type="text"
                    placeholder={user.role === 'military' ? "Напр., 3 ОШБр" : "Напр., БФ Повернись Живим"}
                    value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '200px' }}>
                  Зберегти зміни
                </button>
              </form>
            </div>
          </div>
        )}

        {isFeedbackModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '400px', background: 'white', padding: '30px' }}>
              <h3 style={{ marginTop: 0 }}>Оцінка виконання</h3>
              <p style={{ fontSize: '14px', color: '#555' }}>Замовлення: <strong>#{feedbackRequest?.id} {feedbackRequest?.title}</strong></p>

              <div style={{ display: 'flex', gap: '5px', fontSize: '30px', cursor: 'pointer', marginBottom: '15px', color: '#f39c12' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} onClick={() => setRating(star)}>{star <= rating ? '★' : '☆'}</span>
                ))}
              </div>

              <textarea className="input" style={{ height: '80px', width: '100%', resize: 'none' }} placeholder="Напишіть ваш відгук або скаргу..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button className="btn" style={{ background: '#ddd' }} onClick={() => setIsFeedbackModalOpen(false)}>Скасувати</button>
                <button className="btn btn-primary" onClick={submitFeedback}>Відправити</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
