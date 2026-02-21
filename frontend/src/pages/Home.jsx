import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUserRole(savedUser.role);
    }
  }, []);

  let buttonLink = "/login";
  let buttonText = "Увійти в систему";

  if (userRole === 'military') {
    buttonLink = "/create-request";
    buttonText = "Створити запит";
  } else if (userRole === 'volunteer') {
    buttonLink = "/dashboard";
    buttonText = "Перейти до дашборду";
  }

  return (
    <section className="hero">
      <div className="container">
        <h1>Назва застосунку</h1>
        <p>Платформа централізованого волонтерства</p>

        <Link to={buttonLink}>
          <button className="btn btn-primary">{buttonText}</button>
        </Link>
      </div>
    </section>
  );
}
