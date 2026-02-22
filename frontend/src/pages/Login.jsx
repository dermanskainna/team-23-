import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const response = await fetch('http://127.0.0.1:8000/api/users/login/', {
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

        alert("Успішний вхід! Токен отримано: " + data.token.substring(0, 10) + "...");

        if (data.user.role === 'military') {
          navigate('/create-request');
        } else if (data.user.role === 'volunteer') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.error || 'Неправильний логін або пароль');
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
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2C3E50' }}>Вхід у систему</h2>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Логін (Username)</label>
            <input
              type="text"
              name="username"
              className="input"
              placeholder="Введіть ваш логін"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ marginBottom: 0 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Пароль</label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ marginBottom: 0 }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }} disabled={isLoading}>
            {isLoading ? 'Завантаження...' : 'Увійти'}
          </button>
          <p><Link to="/register">Зареєструватися</Link></p>
        </form>

      </div>
    </section>
  );
}
