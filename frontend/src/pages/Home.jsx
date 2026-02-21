import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <div className="container">
        <h1>Назва застосунку</h1>
        <p>Платформа централізованого волонтерства</p>
        <Link to="/requests">
          <button className="btn btn-primary">Переглянути запити</button>
        </Link>
      </div>
    </section>
  );
}
