import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'military'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const userDataToSave = {
          ...data.user,
          token: data.token
        };
        localStorage.setItem("user", JSON.stringify(userDataToSave));

        alert("Успішна реєстрація! Токен отримано: " + data.token.substring(0, 10) + "...");

        if (data.user.role === 'military') {
          navigate('/create-request');
        } else if (data.user.role === 'volunteer') {
          navigate('/dashboard');
        }
      } else {
        const errorMessages = Object.values(data).flat().join(' ');
        setError(errorMessages || 'Помилка реєстрації. Перевірте дані.');
      }
    } catch (err) {
      console.error("Помилка мережі:", err);
      setError('Не вдалося з\'єднатися з сервером. Перевірте, чи запущений Django.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f8f6' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2C3E50' }}>Реєстрація</h2>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Логін (Username)</label>
            <input
              type="text" name="username" className="input"
              placeholder="Напр. ivan_zsu"
              value={formData.username} onChange={handleChange}
              required style={{ marginBottom: 0 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Email</label>
            <input
              type="email" name="email" className="input"
              placeholder="ivan@example.com"
              value={formData.email} onChange={handleChange}
              required style={{ marginBottom: 0 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Пароль</label>
            <input
              type="password" name="password" className="input"
              placeholder="Мінімум 8 символів"
              value={formData.password} onChange={handleChange}
              required style={{ marginBottom: 0 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Хто ви?</label>
            <select
              name="role" className="input"
              value={formData.role} onChange={handleChange}
              style={{ marginBottom: 0, cursor: 'pointer' }}
            >
              <option value="military">Військовий</option>
              <option value="volunteer">Волонтер</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }} disabled={isLoading}>
            {isLoading ? 'Створення акаунту...' : 'Зареєструватися'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555' }}>
          Вже маєте акаунт? <Link to="/login" style={{ color: '#3A5A40', fontWeight: 'bold', textDecoration: 'none' }}>Увійти</Link>
        </p>

      </div>
    </section>
  );
}
