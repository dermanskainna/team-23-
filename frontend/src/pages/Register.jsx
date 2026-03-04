import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'military',
    full_name: '',
    phone: '+380',
    organization: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://varta-7z8t.onrender.com/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const userDataToSave = { ...data.user, token: data.token };
        localStorage.setItem("user", JSON.stringify(userDataToSave));

        setShowVerification(true);
      } else {
        const errorMsg = Object.values(data).flat().join(' ');
        setError(errorMsg || 'Помилка реєстрації. Перевірте дані.');
      }
    } catch (err) {
      setError('Не вдалося з\'єднатися з сервером.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setIsVerifying(true);

    const savedUser = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await fetch('https://varta-7z8t.onrender.com/api/users/verify-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${savedUser.token}`
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (response.ok) {
        alert("Пошту успішно підтверджено! Ласкаво просимо.");

        savedUser.is_verified = true;
        localStorage.setItem("user", JSON.stringify(savedUser));

        if (savedUser.role === 'military') navigate('/create-request');
        else if (savedUser.role === 'volunteer') navigate('/dashboard');
        else navigate('/');
      } else {
        const data = await response.json();
        setVerifyError(data.error || 'Неправильний код. Спробуйте ще раз.');
      }
    } catch (err) {
      setVerifyError('Помилка з\'єднання з сервером.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f8f6', padding: '40px 0' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#2C3E50' }}>Реєстрація</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Створіть акаунт у системі ВАРТА</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>Роль у системі</label>
              <select name="role" className="input" value={formData.role} onChange={handleChange} required style={{ marginBottom: 0 }}>
                <option value="military">Військовий</option>
                <option value="volunteer">Волонтер</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>Логін</label>
              <input type="text" name="username" className="input" placeholder="john_doe" value={formData.username} onChange={handleChange} required style={{ marginBottom: 0 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>Електронна пошта (справжня)</label>
            <input type="email" name="email" className="input" placeholder="your@email.com" value={formData.email} onChange={handleChange} required style={{ marginBottom: 0 }} />
            <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0 0' }}>Ми відправимо код підтвердження на цю адресу.</p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>Пароль</label>
            <input type="password" name="password" className="input" placeholder="Мінімум 8 символів" value={formData.password} onChange={handleChange} required style={{ marginBottom: 0 }} />
          </div>

          <div style={{ borderTop: '1px solid #eee', margin: '10px 0' }}></div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>Повне ім'я (ПІБ)</label>
            <input type="text" name="full_name" className="input" placeholder="Іванов Іван Іванович" value={formData.full_name} onChange={handleChange} required style={{ marginBottom: 0 }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>Телефон</label>
              <input type="text" name="phone" className="input" placeholder="+380..." value={formData.phone} onChange={handleChange} required style={{ marginBottom: 0 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>
                {formData.role === 'military' ? 'Підрозділ (Бригада)' : 'Волонтерський фонд'}
              </label>
              <input type="text" name="organization" className="input" placeholder={formData.role === 'military' ? 'Напр: 3 ОШБр' : 'Напр: Повернись живим'} value={formData.organization} onChange={handleChange} style={{ marginBottom: 0 }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '15px', background: '#3A5A40', border: 'none' }} disabled={isLoading}>
              {isLoading ? 'Створення акаунту...' : 'Зареєструватися'}
            </button>

            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '4px 0' }}>або</div>

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button type="button" className="btn" style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid #3A5A40', color: '#3A5A40', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                У мене вже є акаунт
              </button>
            </Link>
          </div>
        </form>
      </div>

      {showVerification && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 400, background: "white", padding: 30, textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#eef2f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3A5A40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>

            <h3 style={{ marginTop: 0, color: "#2C3E50" }}>Перевірте вашу пошту</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Ми відправили 6-значний код на <b>{formData.email}</b>. Будь ласка, введіть його нижче для завершення реєстрації.
            </p>

            {verifyError && <div style={{ background: '#fee2e2', color: '#e74c3c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px' }}>{verifyError}</div>}

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="text"
                maxLength="6"
                placeholder="Введіть код..."
                className="input"
                style={{ width: '100%', marginBottom: 0, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
              />

              <button type="submit" className="btn btn-primary" style={{ background: '#3A5A40', border: 'none', padding: '12px' }} disabled={isVerifying || verificationCode.length !== 6}>
                {isVerifying ? 'Перевірка...' : 'Підтвердити пошту'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
