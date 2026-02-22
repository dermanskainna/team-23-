import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CreateRequest() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'medium'
  });

  useEffect(() => {
    if (location.state && location.state.repeatedData) {
      const { title, description, location: reqLocation, urgency } = location.state.repeatedData;

      setFormData({
        title: title || '',
        description: description || '',
        location: reqLocation || '',
        urgency: urgency || 'medium'
      });
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) {
      alert("Будь ласка, заповніть Назву та Локацію!");
      return;
    }

    alert("Запит успішно опубліковано!");

    const saved = JSON.parse(localStorage.getItem("publishedRequests")) || [];
    const newRequest = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      location: formData.location,
      status: "active",
      urgency: formData.urgency,
      feedback: null
    };

    localStorage.setItem("publishedRequests", JSON.stringify([newRequest, ...saved]));
    navigate('/profile');
  };

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: 'auto' }}>
          <h2>Новий запит</h2>

          <form onSubmit={handleSubmit}>
            <input
              className="input"
              type="text"
              placeholder="Назва запиту (напр. Дрон Mavic 3)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <textarea
              className="input"
              placeholder="Детальний опис (кількість, специфікації)"
              style={{ height: '100px', resize: 'none' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>

            <input
              className="input"
              type="text"
              placeholder="Локація (напр. Бахмутський напрямок)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <label style={{ fontWeight: "600", marginTop: "15px", display: "block" }}>
              Рівень терміновості
            </label>

            <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
              Оберіть, наскільки терміново потрібна допомога для цього запиту.
            </p>

            <select
              className="input"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            >
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
              <option value="critical">Критичний</option>
            </select>

            <p style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
              {
              formData.urgency === "low" && "Не терміново, можна виконати пізніше"
              }
              {
              formData.urgency === "medium" && "Бажано виконати найближчими днями"
              }
              {
              formData.urgency === "high" && "Потрібно якнайшвидше"
              }
              {
              formData.urgency === "critical" && "Ситуація невідкладна"
              }
            </p>

            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Опублікувати
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
