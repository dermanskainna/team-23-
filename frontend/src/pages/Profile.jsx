import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UA_PREFIX = "+380";

const normalizeUaPhone = (input) => {
  let s = String(input ?? "").replace(/[^\d+]/g, "");
  const digits = s.replace(/\D/g, "");
  let rest = digits;

  if (rest.startsWith("380")) rest = rest.slice(3);
  rest = rest.slice(0, 9);

  return UA_PREFIX + rest;
};

const isUaPhoneComplete = (phone) => /^\+380\d{9}$/.test(phone);

const isFullNameCapitalized = (fullName) => {
  const trimmed = String(fullName ?? "").trim();
  if (!trimmed) return false;

  const parts = trimmed.split(/\s+/);
  return parts.every(p => {
    if (!p) return true;
    const first = p[0];
    return first === first.toUpperCase() && first !== first.toLowerCase();
  });
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: UA_PREFIX,
    organization: ''
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.token) {
      navigate('/login');
      return;
    }

    setUser(savedUser);

    setFormData({
      full_name: savedUser.full_name || '',
      phone: normalizeUaPhone(savedUser.phone || UA_PREFIX),
      organization: savedUser.organization || ''
    });

    if (savedUser.role === 'volunteer') {
      setActiveTab('accepted');
    }

    fetchRequests(savedUser.token);
  }, [navigate]);

  const fetchRequests = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/logistics/requests/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError('Не вдалося завантажити заявки');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Помилка мережі при завантаженні заявок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!user) return;
    try {
      await fetch('http://127.0.0.1:8000/api/users/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch(e) {
      console.error(e);
    }

    localStorage.removeItem("user");
    navigate('/login');
  };

  const getStatusLabel = (status) => {
    if (status === "new") return "Шукаємо волонтера";
    if (status === "in_progress") return "В роботі";
    if (status === "completed") return "Виконано";
    if (status === "rejected") return "Відхилено";
    if (status === "awaiting_purchase") return "Очікує закупівлі";
    return status;
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency === "low") return "Низька";
    if (urgency === "medium") return "Середня";
    if (urgency === "high") return "Висока";
    if (urgency === "critical") return "Критична";
    return "—";
  };

  const handleRepeatOrder = (req) => {
    navigate('/create-request', { state: { repeatedData: req } });
  };

  const errors = useMemo(() => {
    const e = {};
    if (!isFullNameCapitalized(formData.full_name)) {
      e.full_name = "ПІБ має починатися з великої літери (кожне слово).";
    }
    if (!isUaPhoneComplete(formData.phone)) {
      e.phone = "Телефон введено не повністю. Формат: +380XXXXXXXXX";
    }
    return e;
  }, [formData.full_name, formData.phone]);

  const isFormValid = Object.keys(errors).length === 0;

  const handleSave = () => {
    if (!isFormValid) return;

    const updatedUser = {
      ...user,
      full_name: formData.full_name,
      phone: formData.phone,
      organization: formData.organization,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert("Зміни збережено (локально).");
  };

  if (!user) return null;

  return (
    <section className="section" style={{ background: '#f9f8f6', minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <div className="card" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', background: '#3A5A40', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                {user.username?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#2C3E50' }}>{user.full_name || user.username}</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  {user.role === 'military' ? 'Військовий' : 'Волонтер'} {user.organization ? `| ${user.organization}` : ''}
                </p>
              </div>
            </div>

            <button onClick={handleLogout} className="btn" style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px' }}>
              Вийти
            </button>
          </div>

          <div className="profile-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            {user.role === 'military' ? (
              <button
                className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
                style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: activeTab === 'requests' ? 'bold' : 'normal', color: activeTab === 'requests' ? '#3A5A40' : '#888', cursor: 'pointer' }}
              >
                Мої запити
              </button>
            ) : (
              <button
                className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
                onClick={() => setActiveTab('accepted')}
                style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: activeTab === 'accepted' ? 'bold' : 'normal', color: activeTab === 'accepted' ? '#3A5A40' : '#888', cursor: 'pointer' }}
              >
                Взяті в роботу
              </button>
            )}

            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', color: activeTab === 'settings' ? '#3A5A40' : '#888', cursor: 'pointer' }}
            >
              Налаштування
            </button>
          </div>

          {activeTab === 'requests' && user.role === 'military' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Історія запитів</h3>
                <Link to="/create-request" className="btn btn-primary" style={{ padding: '8px 15px', textDecoration: 'none' }}>
                  + Новий запит
                </Link>
              </div>

              {isLoading ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Завантаження заявок...</p>
              ) : error ? (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px', color: '#888' }}>
                  Ви ще не створювали запитів.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {requests.map(req => (
                    <div key={req.id} className="card" style={{ padding: '20px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                          <span style={{ color: '#888', marginRight: '8px', fontSize: '16px' }}>#{req.id}</span>
                          {req.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span className={`request-status ${req.status}`}>{getStatusLabel(req.status)}</span>
                          <span className={`urgency-badge ${req.urgency}`}>{getUrgencyLabel(req.urgency)}</span>
                        </div>
                        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>Локація: {req.location}</p>

                        {req.reject_reason && req.status === 'rejected' && (
                          <p style={{ margin: '10px 0 0 0', color: '#e74c3c', fontSize: '14px', fontWeight: 'bold' }}>
                            Причина: {req.reject_reason}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn" style={{ padding: '8px 15px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }} onClick={() => handleRepeatOrder(req)}>
                          Повторити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'accepted' && user.role === 'volunteer' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0' }}>Заявки в роботі</h3>
              <p style={{ color: '#888' }}>Тут будуть заявки, які ви взяли в роботу на Дашборді.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ maxWidth: '400px' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Email</label>
                  <input
                    type="text"
                    className="input"
                    value={user.email || ''}
                    disabled
                    style={{ background: '#f0f0f0', cursor: 'not-allowed', opacity: 0.8 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Логін</label>
                  <input
                    type="text"
                    className="input"
                    value={user.username || ''}
                    disabled
                    style={{ background: '#f0f0f0', cursor: 'not-allowed', opacity: 0.8 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>ПІБ</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                  {errors.full_name && (
                    <p style={{ margin: '6px 0 0 0', color: '#e74c3c', fontSize: '12px' }}>
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Телефон</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = normalizeUaPhone(e.target.value);
                      setFormData({ ...formData, phone: value });
                    }}
                  />
                  {errors.phone && (
                    <p style={{ margin: '6px 0 0 0', color: '#e74c3c', fontSize: '12px' }}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                    {user.role === 'military' ? 'Підрозділ' : 'Волонтерський фонд'}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!isFormValid}
                  onClick={handleSave}
                  style={!isFormValid ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  Зберегти зміни
                </button>

              </form>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
