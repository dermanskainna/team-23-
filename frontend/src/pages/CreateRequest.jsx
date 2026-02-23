import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CreateRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'low'
  });

  useEffect(() => {
    if (location.state && location.state.repeatedData) {
      const { title, description, location: reqLocation, urgency } = location.state.repeatedData;
      setFormData({
        title: title || '',
        description: description || '',
        location: reqLocation || '',
        urgency: urgency || 'low'
      });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.token) {
      setError("Помилка авторизації. Будь ласка, увійдіть в систему знову.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/logistics/requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${savedUser.token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Запит успішно опубліковано! ID: #${data.id}`);
        navigate('/profile');
      } else {
        console.error("Помилка бекенду:", data);
        setError("Не вдалося створити запит. Перевірте правильність даних.");
      }
    } catch (err) {
      console.error("Помилка мережі:", err);
      setError("Не вдалося з'єднатися з сервером.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section" style={{ background: '#f9f8f6', minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{ marginBottom: "20px", color: "#2C3E50", textAlign: "center" }}>
            Новий запит на допомогу
          </h2>

          {error && (
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                Коротка назва (що потрібно?)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Наприклад: Дрон Mavic 3T, Турнікети CAT"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                Детальний опис
              </label>
              <textarea
                className="input"
                placeholder="Опишіть деталі: кількість, специфікації, для яких задач..."
                rows="4"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ marginBottom: 0 }}
              ></textarea>
            </div>

            <div>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                Локація / Напрямок
              </label>
              <input
                type="text"
                className="input"
                placeholder="Наприклад: Бахмутський напрямок, Запоріжжя"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                Рівень терміновості
              </label>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                Оберіть, наскільки терміново потрібна допомога для цього запиту.
              </p>
              <select
                className="input"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                style={{ marginBottom: 0 }}
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Високий</option>
                <option value="critical">Критичний</option>
              </select>
            </div>

            <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '15px', fontSize: '16px' }} disabled={isLoading}>
              {isLoading ? 'Відправка...' : 'Опублікувати'}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
