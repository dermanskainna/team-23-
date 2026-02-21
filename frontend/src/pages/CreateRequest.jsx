import React from 'react';

export default function CreateRequest() {
  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: 'auto' }}>
          <h2>Новий запит</h2>
          <form>
            <input className="input" type="text" placeholder="Назва запиту" />
            <textarea className="input" placeholder="Опис" style={{ height: '100px' }}></textarea>
            <input className="input" type="text" placeholder="Локація" />
            <button className="btn btn-primary">Опублікувати</button>
          </form>
        </div>
      </div>
    </section>
  );
}
