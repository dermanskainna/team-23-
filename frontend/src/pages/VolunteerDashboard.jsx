import React, { useState } from 'react';

export default function VolunteerDashboard() {
  const [requests, setRequests] = useState([
    {
      id: '1004', title: 'Мавік 3T', militaryName: 'Олександр (3 ОШБр)', location: 'Покровськ', status: 'new', date: '21.02.2026', urgency: 'critical',
      comments: [{ id: 1, author: 'Олександр (3 ОШБр)', text: 'Хлопці, дуже чекаємо на пташку, стара була втрачена вчора.', time: '09:15' }]
    },
    {
      id: '1005', title: 'Турнікети CAT (20 шт)', militaryName: 'Іван (110 ОМБр)', location: 'Купʼянськ', status: 'in_progress', date: '20.02.2026', urgency: 'high',
      comments: []
    },
    {
      id: '1006', title: 'Тепловізор Pulsar', militaryName: 'Михайло (Азов)', location: 'Краматорськ', status: 'completed', date: '18.02.2026', urgency: 'medium',
      comments: []
    },
  ]);

  const [filter, setFilter] = useState('all');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeChatReqId, setActiveChatReqId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');

  const updateStatus = (id, newStatus) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  const handleOpenRejectModal = (id) => {
    setRequestToReject(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return;
    setRequests(requests.map(req => req.id === requestToReject ? { ...req, status: 'rejected', reason: rejectReason } : req));
    setIsRejectModalOpen(false);
    setRequestToReject(null);
    setRejectReason('');
  };

  const openChat = (id) => {
    setActiveChatReqId(id);
    setIsChatModalOpen(true);
  };

  const closeChat = () => {
    setIsChatModalOpen(false);
    setActiveChatReqId(null);
    setChatMessage('');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setRequests(requests.map(req => {
      if (req.id === activeChatReqId) {
        const newMessage = {
          id: Date.now(),
          author: 'Я (Волонтер)',
          text: chatMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Поточний час (напр. 14:30)
        };
        return { ...req, comments: [...req.comments, newMessage] };
      }
      return req;
    }));
    setChatMessage('');
  };

  const filteredRequests = requests.filter(req => filter === 'all' ? true : req.status === filter);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="status-badge" style={{ background: '#3498db' }}>Новий</span>;
      case 'in_progress': return <span className="status-badge" style={{ background: '#F4A261' }}>В роботі</span>;
      case 'completed': return <span className="status-badge" style={{ background: '#2ecc71' }}>Виконано</span>;
      case 'rejected': return <span className="status-badge" style={{ background: '#e74c3c' }}>Відхилено</span>;
      default: return null;
    }
  };

  const activeReq = requests.find(r => r.id === activeChatReqId);
  const getUrgencyLabel = (urgency) => {
    if (urgency === "low") return "Низька";
    if (urgency === "medium") return "Середня";
    if (urgency === "high") return "Висока";
    if (urgency === "critical") return "Критична";
    return "—";
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
            <div className="table-scroll">
              <div style={{ width: '100%', minWidth: '900px' }}>

                <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: '1' }}>Дата</div>
                  <div style={{ flex: '2' }}>Запит</div>
                  <div style={{ flex: '2' }}>Підрозділ / Локація</div>
                  <div style={{ flex: '1' }}>Статус</div>
                  <div style={{ flex: '1', textAlign: 'center' }}>Терміновість</div>
                  <div style={{ flex: '3', textAlign: 'right' }}>Дії</div>
                </div>

              {filteredRequests.map((req) => (
                <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid #eee'
                  }}
                >
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

                  <div style={{ flex: '1', textAlign: 'center' }}>
                    <span className={`urgency-badge ${req.urgency || 'medium'}`}>
                      {getUrgencyLabel(req.urgency || 'medium')}
                    </span>
                  </div>

                  <div style={{ flex: '3', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>

                    <button
                      className="btn"
                      style={{ background: '#f1c40f', color: '#333', padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => openChat(req.id)}
                    >
                      Чат {req.comments?.length > 0 && <span style={{ background: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{req.comments.length}</span>}
                    </button>

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
          </div>
        )}
      </div>

        {isRejectModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '400px', background: 'white', padding: '30px' }}>
              <h3 style={{ marginTop: 0, color: '#e74c3c' }}>Відхилення заявки</h3>
              <textarea className="input" style={{ height: '80px', width: '100%', resize: 'none' }} placeholder="Вкажіть причину..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button className="btn" style={{ background: '#ddd' }} onClick={() => setIsRejectModalOpen(false)}>Скасувати</button>
                <button className="btn" style={{ background: '#e74c3c', color: 'white' }} onClick={confirmReject}>Підтвердити</button>
              </div>
            </div>
          </div>
        )}

        {isChatModalOpen && activeReq && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '450px', background: '#f9f8f6', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px' }}>

              <div style={{ background: '#3A5A40', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Чат: {activeReq.title}</h3>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{activeReq.militaryName}</span>
                </div>
                <button onClick={closeChat} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ flex: '1', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#ffffff' }}>
                {activeReq.comments.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '50px' }}>Немає повідомлень. Почніть діалог першим!</p>
                ) : (
                  activeReq.comments.map(msg => {
                    const isMe = msg.author === 'Я (Волонтер)';
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{msg.author} • {msg.time}</span>
                        <div style={{
                          background: isMe ? '#eaf4f0' : '#f1f5f9',
                          color: '#334155',
                          padding: '10px 15px',
                          borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                          maxWidth: '85%',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={sendMessage} style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="input"
                  style={{ marginBottom: 0, flex: '1', borderRadius: '20px', padding: '10px 15px' }}
                  placeholder="Напишіть повідомлення..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '20px', padding: '0 20px' }}>Надіслати</button>
              </form>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
