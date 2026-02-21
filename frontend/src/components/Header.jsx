import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="navbar">
      <div className="container">
        <div className="logo">Logo</div>
        <nav>
          <Link to="/">Головна</Link>
          <Link to="/requests">Запити</Link>
          <Link to="/profile">Профіль</Link>
          <Link to="/login">Увійти</Link>
        </nav>
      </div>
    </header>
  );
}
