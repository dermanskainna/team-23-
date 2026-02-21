import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('military');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("user", JSON.stringify({
        email: email || "test@user.com",
        role: role
    }));

    navigate("/profile");
  };

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
          <h2>Вхід</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              className="input" style={{ marginBottom: 0 }}
              type="email" placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input" style={{ marginBottom: 0 }}
              type="password" placeholder="Пароль"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />

            <select
              className="input" style={{ marginBottom: 0 }}
              value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="military">Військовий</option>
              <option value="volunteer">Волонтер</option>
            </select>

            <button className="btn btn-primary" type="submit">Увійти</button>
          </form>
        </div>
      </div>
    </section>
  );
}
