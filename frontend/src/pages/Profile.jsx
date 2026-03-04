import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChatBox from '../components/ChatBox'

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

  const [openFeedbackFor, setOpenFeedbackFor] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [feedbackByRequest, setFeedbackByRequest] = useState({});
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: UA_PREFIX,
    organization: ''
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const getToken = () => {
    const me = JSON.parse(localStorage.getItem("user") || "null");
    return me?.token || "";
  };

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
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/logistics/requests/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(data);
        setError('');
      } else {
        setError('Не вдалося завантажити заявки');
        setRequests([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Помилка мережі при завантаженні заявок');
      setRequests([]);
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

  const loadFeedback = async (requestId) => {
    const token = getToken();
    const res = await fetch(`http://127.0.0.1:8000/api/logistics/requests/${requestId}/feedback/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  };

  const submitFeedback = async (requestId) => {
    setIsSubmittingFeedback(true);
    setFeedbackError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/logistics/requests/${requestId}/feedback/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      setFeedbackByRequest((prev) => ({ ...prev, [requestId]: data }));
      setFeedbackSuccess("Відгук успішно збережено!");

      setTimeout(() => {
        setOpenFeedbackFor(null);
        setFeedbackForm({ rating: 5, comment: "" });
      }, 1500);

    } catch (e) {
      setFeedbackError("Помилка збереження відгуку.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const openFeedbackModal = async (req) => {
    setFeedbackError("");
    setFeedbackSuccess("");
    setOpenFeedbackFor(req.id);
    setFeedbackForm({ rating: 5, comment: "" });

    if (!(req.id in feedbackByRequest)) {
      try {
        const data = await loadFeedback(req.id);
        setFeedbackByRequest((prev) => ({ ...prev, [req.id]: data }));
      } catch (e) {
        setFeedbackError("Не вдалося завантажити відгук");
      }
    }
  };

  const isFormValid = Object.keys(errors).length === 0;

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          organization: formData.organization,
        })
      });

      const updatedUser = {
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
        organization: formData.organization,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (response.ok) {
        alert("Зміни успішно збережено на сервері!");
      } else {
        alert("Дані збережено локально (ендпоінт на бекенді ще не налаштовано).");
      }
    } catch (err) {
      alert("Помилка мережі при збереженні.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Нові паролі не співпадають.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Пароль має містити мінімум 8 символів.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Пароль успішно змінено!');
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      } else {
        const errorMsg = data.old_password ? data.old_password[0] :
                       (data.new_password ? data.new_password[0] :
                       (data.error || 'Помилка зміни пароля.'));
        setPasswordError(errorMsg);
      }
    } catch (err) {
      setPasswordError('Помилка з\'єднання з сервером.');
    } finally {
      setIsChangingPassword(false);
    }
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

                          {req.status === "completed" && (
                            <button className="btn" style={{ padding: "4px 10px", fontSize: 12, background: "#f5b301", color: "white", border: "none" }} onClick={() => openFeedbackModal(req)}>
                              Відгук
                            </button>
                          )}

                          <span className={`urgency-badge ${req.urgency}`}>{getUrgencyLabel(req.urgency)}</span>
                        </div>
                        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>Локація: {req.location}</p>

                        {req.reject_reason && req.status === 'rejected' && (
                          <p style={{ margin: '10px 0 0 0', color: '#e74c3c', fontSize: '14px', fontWeight: 'bold' }}>
                            Причина: {req.reject_reason}
                          </p>
                        )}

                        {['accepted', 'in_progress', 'completed'].includes(req.status) ? (
                            req.conversation_id ? (
                              <div style={{ marginTop: '10px' }}>
                                <ChatBox conversationId={req.conversation_id} token={user.token} user={user} />
                              </div>
                            ) : (
                              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                Чат ще не створено для цієї заявки
                              </p>
                            )
                        ) : null}
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
              <h3 style={{ margin: '0 0 20px 0' }}>Заявки в роботі та завершені</h3>

              {isLoading ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Завантаження заявок...</p>
              ) : error ? (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
              ) : (
                (() => {
                  const filteredRequests = requests.filter(
                    req => req.volunteer_username === user.username &&
                          (req.status === 'in_progress' || req.status === 'completed')
                  );

                  if (filteredRequests.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px', color: '#888' }}>
                        Ви ще не взяли жодної заявки або вони завершені.
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {filteredRequests.map(req => (
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

                            {req.conversation_id ? (
                              <div style={{ marginTop: '10px' }}>
                                <ChatBox conversationId={req.conversation_id} token={user.token} user={user} />
                              </div>
                            ) : (
                              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                Чат ще не створено для цієї заявки
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
                  );
                })()
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>

              <div style={{ flex: '1', minWidth: '300px' }}>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Email</label>
                    <input type="text" className="input" value={user.email || ''} disabled style={{ background: '#f0f0f0', cursor: 'not-allowed', opacity: 0.8 }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Логін</label>
                    <input type="text" className="input" value={user.username || ''} disabled style={{ background: '#f0f0f0', cursor: 'not-allowed', opacity: 0.8 }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>ПІБ</label>
                    <input type="text" className="input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                    {errors.full_name && <p style={{ margin: '6px 0 0 0', color: '#e74c3c', fontSize: '12px' }}>{errors.full_name}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Телефон</label>
                    <input type="text" className="input" value={formData.phone} onChange={(e) => { const value = normalizeUaPhone(e.target.value); setFormData({ ...formData, phone: value }); }} />
                    {errors.phone && <p style={{ margin: '6px 0 0 0', color: '#e74c3c', fontSize: '12px' }}>{errors.phone}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                      {user.role === 'military' ? 'Підрозділ' : 'Волонтерський фонд'}
                    </label>
                    <input type="text" className="input" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
                  </div>

                  <button type="button" className="btn btn-primary" disabled={!isFormValid} onClick={handleSave} style={!isFormValid ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                    Зберегти зміни
                  </button>

                </form>
              </div>

              <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#2C3E50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Безпека акаунту
                  </h4>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                    Рекомендуємо регулярно змінювати пароль для надійного захисту ваших даних.
                  </p>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="btn"
                    style={{ width: '100%', background: 'transparent', border: '2px solid #3A5A40', color: '#3A5A40', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Змінити пароль
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {openFeedbackFor && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, background: "white", padding: 30, borderTop: "4px solid #f5b301" }}>
            <h3 style={{ marginTop: 0, color: "#2C3E50" }}>Відгук по заявці #{openFeedbackFor}</h3>

            {feedbackByRequest[openFeedbackFor] ? (
              <>
                <div style={{ marginTop: 15 }}>
                  <div style={{ fontSize: 24 }}>
                    {"⭐".repeat(feedbackByRequest[openFeedbackFor].rating)}
                    <span style={{ color: '#e2e8f0' }}>{"⭐".repeat(5 - feedbackByRequest[openFeedbackFor].rating)}</span>
                  </div>
                  <div style={{ marginTop: 15, background: '#f8fafc', padding: 15, borderRadius: 8, color: '#475569', fontStyle: 'italic' }}>
                    "{feedbackByRequest[openFeedbackFor].comment || "Без коментаря"}"
                  </div>
                </div>
                <button className="btn" style={{ marginTop: 20, width: "100%", background: '#e2e8f0' }} onClick={() => setOpenFeedbackFor(null)}>
                  Закрити
                </button>
              </>
            ) : (
              <>
                {feedbackError && <div style={{ color: "#e74c3c", marginTop: 8, fontSize: 13 }}>{feedbackError}</div>}
                {feedbackSuccess && <div style={{ color: "#2ecc71", marginTop: 8, fontSize: 13 }}>{feedbackSuccess}</div>}

                <div style={{ marginTop: 15, fontSize: 36, textAlign: 'center' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      style={{ cursor: "pointer", color: n <= feedbackForm.rating ? "#f5b301" : "#e2e8f0", transition: 'color 0.2s' }}
                      onClick={() => setFeedbackForm((prev) => ({ ...prev, rating: n }))}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  className="input"
                  rows={4}
                  placeholder="Напишіть коментар щодо доставки..."
                  style={{ marginTop: 15, width: '100%', resize: 'none' }}
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                />

                <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn" type="button" style={{ background: '#e2e8f0' }} onClick={() => setOpenFeedbackFor(null)}>Скасувати</button>
                  <button className="btn btn-primary" type="button" style={{ background: '#f5b301', border: 'none' }} disabled={isSubmittingFeedback} onClick={() => submitFeedback(openFeedbackFor)}>
                    {isSubmittingFeedback ? 'Надсилання...' : 'Надіслати'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 400, background: "white", padding: 30 }}>
            <h3 style={{ marginTop: 0, color: "#2C3E50" }}>Зміна пароля</h3>

            {passwordError && <div style={{ background: '#fee2e2', color: '#e74c3c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px' }}>{passwordError}</div>}
            {passwordSuccess && <div style={{ background: '#dcfce3', color: '#2ecc71', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px' }}>{passwordSuccess}</div>}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Старий пароль</label>
                <input type="password" required className="input" style={{ width: '100%', marginBottom: 0 }}
                  value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Новий пароль</label>
                <input type="password" required className="input" style={{ width: '100%', marginBottom: 0 }}
                  value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Підтвердіть новий пароль</label>
                <input type="password" required className="input" style={{ width: '100%', marginBottom: 0 }}
                  value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn" style={{ background: "#ddd", color: '#555' }} onClick={() => setIsPasswordModalOpen(false)}>Скасувати</button>
                <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Збереження...' : 'Підтвердити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
