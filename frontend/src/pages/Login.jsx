import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("user", JSON.stringify({
        email: email,
        role: "volunteer"
    }));

    window.location.href = "/profile";
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Вхід</h2>
            <form onSubmit={handleSubmit}>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="input"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Увійти</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
