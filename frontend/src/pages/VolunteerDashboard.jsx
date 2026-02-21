import React, { useState } from 'react';

export default function VolunteerDashboard() {
  const [requests, setRequests] = useState([
    { id: '1004', title: 'Мавік 3T', militaryName: 'Олександр (3 ОШБр)', location: 'Покровськ', status: 'new', date: '21.02.2026' },
    { id: '1005', title: 'Турнікети CAT (20 шт)', militaryName: 'Іван (110 ОМБр)', location: 'Купʼянськ', status: 'in_progress', date: '20.02.2026' },
    { id: '1006', title: 'Тепловізор Pulsar', militaryName: 'Михайло (Азов)', location: 'Краматорськ', status: 'completed', date: '18.02.2026' },
  ]);

  const [filter, setFilter] = useState('all');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const updateStatus = (id, newStatus) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  const handleOpenRejectModal = (id) => {
    setRequestToReject(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return;

    setRequests(requests.map(req =>
      req.id === requestToReject ? { ...req, status: 'rejected', reason: rejectReason } : req
    ));

    setIsRejectModalOpen(false);
    setRequestToReject(null);
    setRejectReason('');
  };

  const filteredRequests = requests.filter(req =>
    filter === 'all' ? true : req.status === filter
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="status-badge" style={{ background: '#3498db' }}>Новий</span>;
      case 'in_progress': return <span className="status-badge" style={{ background: '#F4A261' }}>В роботі</span>;
      case 'completed': return <span className="status-badge" style={{ background: '#2ecc71' }}>Виконано</span>;
      case 'rejected': return <span className="status-badge" style={{ background: '#e74c3c' }}>Відхилено</span>;
      default: return null;
    }
  };

  return (
    <section className="section">
      <div className="container" style={{ position: 'relative' }}>
        <h2>Дашборд Волонтера</h2>
        <p>Управління запитами від підрозділів</p>

        <div className="tabs" style={{ marginBottom: '20px', marginTop: '20px' }}>
          <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Всі</button>
          <button className={`tab-btn ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>Нові</button>
          <button className={`tab-btn ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}>В роботі</button>
          <button className={`tab-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Виконані</button>
          <button className={`tab-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Відхилені</button>
        </div>

        <div className="card">
          {filteredRequests.length === 0 ? (
            <p>Запитів у цій категорії не знайдено.</p>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ flex: '1' }}>Дата</div>
                <div style={{ flex: '2' }}>Запит</div>
                <div style={{ flex: '2' }}>Підрозділ / Локація</div>
                <div style={{ flex: '1' }}>Статус</div>
                <div style={{ flex: '2', textAlign: 'right' }}>Дії</div>
              </div>

              {filteredRequests.map((req) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ flex: '1', fontSize: '14px', color: '#555' }}>{req.date}</div>
                  <div style={{ flex: '2', fontWeight: '500' }}>
                    <span style={{ color: '#888', marginRight: '8px', fontSize: '13px' }}>#{req.id}</span>
                    {req.title}
                    {req.status === 'rejected' && (
                      <div style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>
                        <strong>Причина:</strong> {req.reason}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: '2' }}>
                    {req.militaryName}<br/>
                    <span style={{fontSize: '12px', color: '#888'}}>📍 {req.location}</span>
                  </div>
                  <div style={{ flex: '1' }}>{getStatusBadge(req.status)}</div>

                  <div style={{ flex: '2', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    {req.status === 'new' && (
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => updateStatus(req.id, 'in_progress')}>Взяти в роботу</button>
                    )}
                    {req.status === 'in_progress' && (
                      <button className="btn" style={{ background: '#2ecc71', color: 'white', padding: '6px 12px', fontSize: '13px' }} onClick={() => updateStatus(req.id, 'completed')}>Завершити</button>
                    )}

                    {(req.status === 'new' || req.status === 'in_progress') && (
                      <button className="btn" style={{ background: '#e74c3c', color: 'white', padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOpenRejectModal(req.id)}>Відхилити</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isRejectModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: '400px', background: 'white', padding: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#e74c3c' }}>Відхилення заявки</h3>
              <p style={{ fontSize: '14px', color: '#555' }}>Будь ласка, вкажіть причину відхилення. Військовий побачить це повідомлення.</p>

              <textarea
                className="input"
                style={{ height: '80px', width: '100%', resize: 'none' }}
                placeholder="Наприклад: Немає в наявності на складі..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button className="btn" style={{ background: '#ddd' }} onClick={() => setIsRejectModalOpen(false)}>Скасувати</button>
                <button className="btn" style={{ background: '#e74c3c', color: 'white' }} onClick={confirmReject}>Підтвердити</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
