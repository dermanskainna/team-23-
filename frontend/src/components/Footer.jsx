import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#3A5A40', color: '#fff', padding: '50px 0 20px', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '30px', marginBottom: '40px' }}>

        <div style={{ flex: '1', minWidth: '250px' }}>
          <h2 style={{ color: '#F4A261', marginTop: 0, marginBottom: '20px' }}>Logo</h2>
          <p style={{ color: '#e0e0e0', fontSize: '14px', lineHeight: '1.6', maxWidth: '300px' }}>
            Наша місія — забезпечити зручну взаємодію між волонтерами та військовими для наближення перемоги.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <span style={{ width: '32px', height: '32px', background: 'white', color: '#3A5A40', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}>f</span>
            <span style={{ width: '32px', height: '32px', background: 'white', color: '#3A5A40', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}>t</span>
            <span style={{ width: '32px', height: '32px', background: 'white', color: '#3A5A40', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}>in</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', flex: '2', justifyContent: 'space-around' }}>

            <div style={{ minWidth: '120px' }}>
              <h4 style={{ color: '#F4A261', marginBottom: '20px', fontSize: '18px' }}>Про нас</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Як це працює</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Особливості</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Партнерство</Link></li>
              </ul>
            </div>

            <div style={{ minWidth: '120px' }}>
              <h4 style={{ color: '#F4A261', marginBottom: '20px', fontSize: '18px' }}>Спільнота</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Події та збори</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Блог</Link></li>
                <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none', fontSize: '14px' }}>Подкаст</Link></li>
              </ul>
            </div>

            <div style={{ minWidth: '120px' }}>
              <h4 style={{ color: '#F4A261', marginBottom: '20px', fontSize: '18px' }}>Мережі</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><span style={{ color: '#e0e0e0', cursor: 'pointer', fontSize: '14px' }}>Discord</span></li>
                <li><span style={{ color: '#e0e0e0', cursor: 'pointer', fontSize: '14px' }}>Instagram</span></li>
                <li><span style={{ color: '#e0e0e0', cursor: 'pointer', fontSize: '14px' }}>Telegram</span></li>
              </ul>
            </div>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '13px', color: '#e0e0e0', flexWrap: 'wrap', gap: '15px' }}>
        <p style={{ margin: 0, color: '#F4A261' }}>©2026 Team-23. Всі права захищено.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }}>Політика конфіденційності</span>
          <span style={{ cursor: 'pointer' }}>Умови використання</span>
        </div>
      </div>
    </footer>
  );
}
