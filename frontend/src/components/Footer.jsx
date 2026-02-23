import React from 'react';
import { Link } from 'react-router-dom';

// Компонент Logo для футера (трохи більший за розміром)
const FooterLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org">
      <path
        d="M12 2L4 6V12C4 17.5 7.5 21.5 12 23C16.5 21.5 20 17.5 20 12V6L12 2Z"
        stroke="white" strokeWidth="1.8" strokeLinejoin="round"
      />
      <path
        d="M8 13C8 13 9.5 15.5 12 15.5C14.5 15.5 16 13 16 13"
        stroke="white" strokeWidth="1.8" strokeLinecap="round"
      />
      <path
        d="M10 18.5L12 20.5L14 18.5"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
      <span style={{ color: 'white', fontWeight: '800', fontSize: '22px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Варта
      </span>
      <span style={{ color: '#F4A261', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
        VOLUNTEER HUB
      </span>
    </div>
  </div>
);

export default function Footer() {
  return (
    <footer style={{ background: '#3A5A40', color: '#fff', padding: '60px 0 30px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '40px' }}>

        <div style={{ flex: '1', minWidth: '280px' }}>
          {/* ВСТАВЛЕНО ЛОГОТИП ТУТ */}
          <FooterLogo />

          <p style={{ color: '#e0e0e0', fontSize: '14px', lineHeight: '1.6', maxWidth: '320px', margin: '0 0 25px 0' }}>
            Наша місія — забезпечити зручну взаємодію між волонтерами та військовими для наближення перемоги.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span title="Facebook" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>f</span>
            <span title="Twitter" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>t</span>
            <span title="LinkedIn" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>in</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', flex: '2', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: '140px' }}>
              <h4 style={{ color: '#F4A261', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>Про нас</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px', transition: '0.3s' }}>Як це працює</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px', transition: '0.3s' }}>Особливості</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px', transition: '0.3s' }}>Партнерство</Link></li>
              </ul>
            </div>

            <div style={{ minWidth: '140px' }}>
              <h4 style={{ color: '#F4A261', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>Спільнота</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px', transition: '0.3s' }}>Події та збори</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px', transition: '0.3s' }}>Блог</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px', transition: '0.3s' }}>Подкаст</Link></li>
              </ul>
            </div>

            <div style={{ minWidth: '140px' }}>
              <h4 style={{ color: '#F4A261', marginBottom: '25px', fontSize: '18px', fontWeight: '700' }}>Мережі</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li><span style={{ color: '#e0e0e0', cursor: 'pointer', fontSize: '14px' }}>Discord</span></li>
                <li><span style={{ color: '#e0e0e0', cursor: 'pointer', fontSize: '14px' }}>Instagram</span></li>
                <li><span style={{ color: '#e0e0e0', cursor: 'pointer', fontSize: '14px' }}>Telegram</span></li>
              </ul>
            </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '25px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', color: 'rgba(224, 224, 224, 0.7)', flexWrap: 'wrap', gap: '15px' }}>
        <p style={{ margin: 0, color: '#F4A261', fontWeight: '500' }}>©2026 DreamTeam. Всі права захищено.</p>
        <div style={{ display: 'flex', gap: '25px' }}>
          <span style={{ cursor: 'pointer', transition: '0.3s' }}>Політика конфіденційності</span>
          <span style={{ cursor: 'pointer', transition: '0.3s' }}>Умови використання</span>
        </div>
      </div>
    </footer>
  );
}
