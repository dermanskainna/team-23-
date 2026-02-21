import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CreateRequest() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    if (location.state && location.state.repeatedData) {
      const { title, description, location: reqLocation } = location.state.repeatedData;

      setFormData({
        title: title || '',
        description: description || '',
        location: reqLocation || ''
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

            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Опублікувати
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
