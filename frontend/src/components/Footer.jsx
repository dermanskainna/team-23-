import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FooterLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6V12C4 17.5 7.5 21.5 12 23C16.5 21.5 20 17.5 20 12V6L12 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 13C8 13 9.5 15.5 12 15.5C14.5 15.5 16 13 16 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 18.5L12 20.5L14 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
      <span style={{ color: 'white', fontWeight: '800', fontSize: '22px', letterSpacing: '1px', textTransform: 'uppercase' }}>Варта</span>
      <span style={{ color: '#F4A261', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>VOLUNTEER HUB</span>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', transition: 'all 0.3s ease'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', padding: '40px', borderRadius: '16px', maxWidth: '500px',
        width: '90%', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#333'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', border: 'none',
          background: '#f0f0f0', borderRadius: '50%', width: '30px', height: '30px',
          cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>×</button>
        <h3 style={{ marginBottom: '20px', color: '#3A5A40', fontSize: '24px' }}>{title}</h3>
        <div style={{ lineHeight: '1.7', fontSize: '15px', color: '#555' }}>{content}</div>
      </div>
    </div>
  );
};

export default function Footer() {
  const [modal, setModal] = useState({ isOpen: false, title: '', content: '' });

  const infoData = {
    how: {
      title: "Як це працює?",
      content: "Військові створюють запити на необхідне обладнання чи амуніцію. Волонтери бачать ці потреби у реальному часі та беруть їх у роботу. Платформа автоматизує звітність та допомагає відстежувати кожен етап доставки."
    },
    features: {
      title: "Особливості платформи",
      content: "Ми використовуємо систему верифікації через Дія або військові квитки для забезпечення безпеки. Також впроваджено інтелектуальний трекінг логістики та автоматичне формування черги пріоритетності запитів."
    },
    partnership: {
      title: "Партнерство",
      content: "Ми запрошуємо логістичні компанії, великі фонди та виробників амуніції до співпраці. Надаємо API для інтеграції та зручну панель аналітики для ефективного розподілу ресурсів."
    },
    privacy: {
      title: "Політика конфіденційності",
      content: "Наша платформа не передає дані третім особам. Усі запити обробляються виключно для благодійної допомоги військовим. Ми зберігаємо інформацію безпечно та використовуємо її лише для внутрішніх процесів. Всі дані захищені відповідно до сучасних стандартів безпеки."
    },
    terms: {
      title: "Умови використання",
      content: "Платформа надається виключно для благодійних цілей та взаємодії волонтерів і військових. Користувачі зобов'язуються дотримуватися правил безпеки та не розповсюджувати персональні дані. Використання сервісу означає прийняття цих умов."
    }
  };

  const openModal = (type) => {
    setModal({ isOpen: true, title: infoData[type].title, content: infoData[type].content });
  };

  const navItemStyle = { color: '#e0e0e0', cursor: 'pointer', fontSize: '14px', transition: '0.3s', border: 'none', background: 'none', textAlign: 'left', padding: 0 };

  return (
    <footer style={{ background: '#3A5A40', color: '#fff', padding: '60px 0 30px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '40px' }}>

        {/* Секція Лого та Місії */}
        <div style={{ flex: '1', minWidth: '280px' }}>
          <FooterLogo />
          <p style={{ color: '#e0e0e0', fontSize: '14px', lineHeight: '1.6', maxWidth: '320px', margin: '0 0 25px 0' }}>
            Наша місія — забезпечити зручну взаємодію між волонтерами та військовими для наближення перемоги.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            {[
              { name: 'Facebook', url: 'https://facebook.com' },
              { name: 'Twitter', url: 'https://twitter.com' },
              { name: 'LinkedIn', url: 'https://linkedin.com' }
            ].map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: '0.3s',
                  textDecoration: 'none',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px'
                }}
              >
                {social.name[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Секція Навігації */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', flex: '2', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: '140px' }}>
            <h4 style={{ color: '#F4A261', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>Про нас</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><button onClick={() => openModal('how')} style={navItemStyle}>Як це працює</button></li>
              <li><button onClick={() => openModal('features')} style={navItemStyle}>Особливості</button></li>
              <li><button onClick={() => openModal('partnership')} style={navItemStyle}>Партнерство</button></li>
            </ul>
          </div>

          <div style={{ minWidth: '140px' }}>
            <h4 style={{ color: '#F4A261', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>Спільнота</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Події та збори</Link></li>
              <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Блог</Link></li>
              <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Подкаст</Link></li>
            </ul>
          </div>

          <div style={{ minWidth: '140px' }}>
            <h4 style={{ color: '#F4A261', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>Мережі</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Discord</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Instagram</a></li>
              <li><a href="https://t.me" target="_blank" rel="noreferrer" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Telegram</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Нижня частина */}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '25px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', color: 'rgba(224, 224, 224, 0.7)', flexWrap: 'wrap', gap: '15px' }}>
        <p style={{ margin: 0, color: '#F4A261', fontWeight: '500' }}>©2026 DreamTeam. Всі права захищено.</p>
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          <button onClick={() => openModal('privacy')} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'rgba(224, 224, 224, 0.7)', fontSize: '13px', padding: 0 }}>Політика конфіденційності</button>
          <button onClick={() => openModal('terms')} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'rgba(224, 224, 224, 0.7)', fontSize: '13px', padding: 0 }}>Умови використання</button>
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} content={modal.content} />
    </footer>
  );
}
