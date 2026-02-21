import React from 'react';

export default function Register() {
  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
          <h2>Реєстрація</h2>
          <form>
            <input className="input" type="text" placeholder="Ім'я користувача" />
            <input className="input" type="email" placeholder="Email" />
            <input className="input" type="password" placeholder="Пароль" />
            <select className="input">
              <option value="">Оберіть статус</option>
              <option value="military">Військовий</option>
              <option value="volunteer">Волонтер</option>
            </select>
            <button className="btn btn-primary" type="submit">Зареєструватися</button>
          </form>
        </div>
      </div>
    </section>
  );
}
