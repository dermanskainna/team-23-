import React, { useState } from 'react';

export default function Tracking() {
  const [trackNumber, setTrackNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const fakeDatabase = [
    { id: '1001', title: 'Дрон Mavic 3', status: 'completed', date: '18.02.2026', location: 'Купʼянськ' },
    { id: '1002', title: 'Турнікети CAT (20 шт)', status: 'in_progress', date: '20.02.2026', location: 'Покровськ' },
    { id: '1003', title: 'Медикаменти (знеболювальні)', status: 'new', date: '21.02.2026', location: 'Бахмутський напрямок' },
    { id: '1004', title: 'Старлінк V2', status: 'delivering', date: '19.02.2026', location: 'Авдіївка' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!trackNumber) return;

    const foundOrder = fakeDatabase.find(item => item.id === trackNumber);

    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setError('Заявку з таким номером не знайдено. Перевірте правильність вводу.');
    }
  };

  const getStepStatus = (stepIndex, status) => {
    const statuses = ['new', 'in_progress', 'delivering', 'completed'];
    const currentStatusIndex = statuses.indexOf(status);
    return stepIndex <= currentStatusIndex ? 'active' : '';
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '600px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Трекінг заявки</h2>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>
          Введіть номер вашого запиту, щоб дізнатися його статус. <br/>
          <em>(Тестові номери: 1001, 1002, 1003, 1004)</em>
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input
            className="input"
            style={{ marginBottom: 0, flex: 1, fontSize: '18px', padding: '12px' }}
            type="text"
            placeholder="Номер заявки (напр. 1002)"
            value={trackNumber}
            onChange={(e) => setTrackNumber(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" style={{ padding: '0 25px' }}>Знайти</button>
        </form>

        {error && (
          <div className="card" style={{ background: '#ffebee', color: '#c0392b', border: '1px solid #ef9a9a' }}>
            {error}
          </div>
        )}

        {order && (
          <div className="card" style={{ padding: '30px' }}>
            <h3 style={{ marginTop: 0 }}>{order.title}</h3>
            <p style={{ color: '#555', marginBottom: '5px' }}><strong>Номер:</strong> #{order.id}</p>
            <p style={{ color: '#555', marginBottom: '5px' }}><strong>Локація:</strong> 📍 {order.location}</p>
            <p style={{ color: '#555', marginBottom: '25px' }}><strong>Дата створення:</strong> {order.date}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '40px' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', background: '#eee', zIndex: 1 }}></div>

              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '25%' }}>
                <div style={{
                  width: '34px', height: '34px', margin: '0 auto 10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white',
                  background: getStepStatus(0, order.status) ? '#2ecc71' : '#ccc'
                }}>1</div>
                <div style={{ fontSize: '12px', fontWeight: getStepStatus(0, order.status) ? 'bold' : 'normal', color: getStepStatus(0, order.status) ? '#333' : '#999' }}>Створено</div>
              </div>

              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '25%' }}>
                <div style={{
                  width: '34px', height: '34px', margin: '0 auto 10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white',
                  background: getStepStatus(1, order.status) ? '#F4A261' : '#ccc'
                }}>2</div>
                <div style={{ fontSize: '12px', fontWeight: getStepStatus(1, order.status) ? 'bold' : 'normal', color: getStepStatus(1, order.status) ? '#333' : '#999' }}>В роботі</div>
              </div>

              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '25%' }}>
                <div style={{
                  width: '34px', height: '34px', margin: '0 auto 10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white',
                  background: getStepStatus(2, order.status) ? '#3498db' : '#ccc'
                }}>3</div>
                <div style={{ fontSize: '12px', fontWeight: getStepStatus(2, order.status) ? 'bold' : 'normal', color: getStepStatus(2, order.status) ? '#333' : '#999' }}>В дорозі</div>
              </div>

              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '25%' }}>
                <div style={{
                  width: '34px', height: '34px', margin: '0 auto 10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white',
                  background: getStepStatus(3, order.status) ? '#27ae60' : '#ccc'
                }}>✓</div>
                <div style={{ fontSize: '12px', fontWeight: getStepStatus(3, order.status) ? 'bold' : 'normal', color: getStepStatus(3, order.status) ? '#333' : '#999' }}>Доставлено</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
