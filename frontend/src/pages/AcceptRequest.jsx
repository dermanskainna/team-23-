import React from 'react';

export default function AcceptRequest() {
  return (
    <section className="section">
      <div className="container">
        <h2>Доступні запити</h2>
        <div className="grid">
          <div className="card">
            <h3>Медикаменти</h3>
            <p>Потрібна гуманітарна допомога</p>
            <button className="btn btn-primary">Прийняти</button>
          </div>
          <div className="card">
            <h3>Тепловізор</h3>
            <p>Запит на технічне обладнання</p>
            <button className="btn btn-primary">Прийняти</button>
          </div>
        </div>
      </div>
    </section>
  );
}
