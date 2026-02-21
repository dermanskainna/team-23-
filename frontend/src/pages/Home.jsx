import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [userRole, setUserRole] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const reviews = [
    { id: 1, name: "Олександр (3 ОШБр)", location: "Донецький напрямок", rating: "5.0", text: "Дуже вдячний за швидку доставку Мавіка. Платформа працює ідеально, зв'язалися за лічені хвилини. Це реально рятує життя." },
    { id: 2, name: "Михайло (110 ОМБр)", location: "Авдіївка", rating: "4.8", text: "Замовляли партію турнікетів та аптечок. Все приїхало вчасно. Круто, що можна відстежувати статус заявки онлайн." },
    { id: 3, name: "Іван (Позивний 'Сокіл')", location: "Запорізький напрямок", rating: "5.0", text: "Зручний інтерфейс навіть коли інтернет ледве тягне. Залишив запит на тепловізор, і вже за тиждень він був у нас." },
    { id: 4, name: "Олег (Азов)", location: "Краматорськ", rating: "5.0", text: "Ніколи ще логістика не була такою прозорою. Бачу кожен крок від створення заявки до відправки. Дякую команді!" },
    { id: 5, name: "Дмитро (47 ОМБр)", location: "Роботине", rating: "4.9", text: "Повторити замовлення в один клік — це геніально. Економить купу часу на передовій, коли кожна хвилина на рахунку." }
  ];

  const cardWidth = 320;
  const gap = 25;
  const slideStep = cardWidth + gap;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex >= reviews.length - 1 ? 0 : prevIndex + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev >= reviews.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev <= 0 ? reviews.length - 1 : prev - 1));

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Назва застосунку</h1>
          <p>Платформа централізованого волонтерства</p>
          <Link to={buttonLink}>
            <button className="btn btn-primary">{buttonText}</button>
          </Link>
        </div>
      </section>

      <section className="section" style={{ background: '#f9f8f6', padding: '60px 0 80px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <h2 style={{
            fontSize: '36px', fontWeight: '900', textTransform: 'uppercase',
            color: '#2C3E50', marginBottom: '50px', textAlign: 'center'
          }}>
            БАНЕРИ З ПОДІЯМИ
          </h2>

          <div style={{ display: 'flex', gap: '30px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>

            <div className="banner-card" style={{
              flex: '1', minWidth: '320px', height: '300px', background: '#ffffff',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ color: '#cbd5e1', textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p style={{ marginTop: '15px', fontSize: '15px', color: '#94a3b8', fontWeight: '500' }}>Місце для зображення</p>
              </div>
            </div>

            <div className="banner-card" style={{
              flex: '1', minWidth: '320px', height: '300px', background: '#ffffff',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ color: '#cbd5e1', textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p style={{ marginTop: '15px', fontSize: '15px', color: '#94a3b8', fontWeight: '500' }}>Місце для зображення</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#ffffff', padding: '80px 0', overflow: 'hidden' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '15px', fontSize: '32px' }}>
            Ми допомогли понад 1000 військовим
          </h2>
          <p style={{ textAlign: 'center', color: '#7f8c8d', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            Наша мета — зробити логістику прозорою та швидкою. Ось що кажуть захисники, які вже скористалися платформою.
          </p>

          <div style={{ position: 'relative', width: '100%', maxWidth: '1010px', margin: '0 auto', overflow: 'hidden', padding: '10px 0' }}>
            <div style={{
              display: 'flex', gap: `${gap}px`, transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${currentIndex * slideStep}px)`
            }}>
              {reviews.map(review => (
                <div key={review.id} style={{
                  flex: `0 0 ${cardWidth}px`, minWidth: `${cardWidth}px`, background: '#eef2f5',
                  borderRadius: '12px', padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '45px', height: '45px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '16px' }}>{review.name}</h4>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{review.location}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#334155', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {review.rating} <span style={{ color: '#f59e0b', fontSize: '18px' }}>★</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1010px', margin: '30px auto 0' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {reviews.map((_, index) => (
                <div key={index} onClick={() => setCurrentIndex(index)} style={{
                    width: currentIndex === index ? '30px' : '10px', height: '10px',
                    background: currentIndex === index ? '#334155' : '#cbd5e1', borderRadius: '5px',
                    cursor: 'pointer', transition: 'all 0.3s ease'
                  }}></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={prevSlide} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#334155' }}>←</button>
              <button onClick={nextSlide} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#334155' }}>→</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
