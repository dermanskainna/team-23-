import React from 'react';
import { Link } from 'react-router-dom';

export default function Requests() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>Оберіть дію</h2>
        <p>Що ви хочете зробити?</p>

        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginTop: '40px' }}>
          <div className="card" style={{ width: '300px' }}>
            <h3>Створити запит</h3>
            <p>Додати новий запит на допомогу</p>
            <Link to="/create-request">
              <button className="btn btn-primary">Створити</button>
            </Link>
          </div>

          <div className="card" style={{ width: '300px' }}>
            <h3>Прийняти запит</h3>
            <p>Переглянути доступні запити</p>
            <Link to="/accept-request">
              <button className="btn btn-primary">Перейти</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
