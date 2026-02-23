import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeChatReqId, setActiveChatReqId] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.token || savedUser.role !== 'volunteer') {
      navigate('/login');
      return;
    }
    fetchRequests(savedUser.token);
  }, [navigate]);

  const fetchRequests = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/logistics/requests/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError('Не вдалося завантажити заявки');
      }
    } catch (err) {
      console.error(err);
      setError('Помилка мережі при завантаженні заявок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    let rejectReason = '';

    if (newStatus === 'rejected') {
      rejectReason = prompt("Вкажіть причину відхилення (наприклад: Немає на складі):");
      if (rejectReason === null) return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/logistics/requests/${reqId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${savedUser.token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reject_reason: rejectReason
        })
      });

      if (response.ok) {
        const updatedReq = await response.json();
        setRequests(requests.map(r => r.id === reqId ? updatedReq : r));

        if (activeChatReqId === reqId && (newStatus === 'completed' || newStatus === 'rejected')) {
          setActiveChatReqId(null);
        }
      } else {
        alert("Помилка при оновленні статусу на сервері.");
      }
    } catch (err) {
      console.error(err);
      alert("Помилка мережі.");
    }
  };

  const handleDownloadPDF = async (reqId) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/logistics/requests/${reqId}/pdf/`, {
        headers: {
          'Authorization': `Token ${savedUser.token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nakladna_${reqId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Помилка при генерації PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Помилка мережі при завантаженні PDF.");
    }
  };

  const handleDownloadReport = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/logistics/report/pdf/`, {
        headers: {
          'Authorization': `Token ${savedUser.token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zvit_za_misyats.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Помилка при генерації звіту.");
      }
    } catch (err) {
      console.error(err);
      alert("Помилка мережі при завантаженні звіту.");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="status-badge new" style={{background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>Новий</span>;
      case 'in_progress': return <span className="status-badge in-progress" style={{background: '#fef08a', color: '#a16207', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>В роботі</span>;
      case 'completed': return <span className="status-badge completed" style={{background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>Виконано</span>;
      case 'rejected': return <span className="status-badge rejected" style={{ background: '#fee2e2', color: '#e74c3c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Відхилено</span>;
      case 'awaiting_purchase': return <span className="status-badge awaiting" style={{background: '#f3e8ff', color: '#7e22ce', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>Очікує закупівлі</span>;
      default: return null;
    }
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency === "low") return "Низька";
    if (urgency === "medium") return "Середня";
    if (urgency === "high") return "Висока";
    if (urgency === "critical") return "Критична";
    return "—";
  };

  const activeReq = requests.find(r => r.id === activeChatReqId);

  return (
    <section className="section" style={{ background: '#f9f8f6', minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#2C3E50" }}>Дашборд Волонтера</h2>
          <button className="btn" style={{ background: '#3A5A40', color: 'white', padding: '10px 20px', border: 'none', fontSize: '15px' }} onClick={handleDownloadReport}>
            Завантажити звіт за місяць
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>

          <div className="card" style={{ flex: '1', padding: '20px' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Актуальні запити</h3>

            {isLoading ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Завантаження заявок з бази...</p>
            ) : error ? (
              <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            ) : requests.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Немає доступних запитів.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                {requests.map(req => (
                  <div key={req.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', background: activeChatReqId === req.id ? '#f0fdf4' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '16px', color: '#2C3E50' }}>#{req.id} {req.title}</strong>
                      {getStatusBadge(req.status)}
                    </div>

                    <div style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Від:</strong> {req.author_name} {req.author_organization ? `(${req.author_organization})` : ''}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Локація:</strong> {req.location}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Терміновість:</strong> <span className={`urgency-badge ${req.urgency}`}>{getUrgencyLabel(req.urgency)}</span></p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Опис:</strong> {req.description}</p>
                      {req.reject_reason && <p style={{ margin: '5px 0 0 0', color: '#e74c3c' }}><strong>Причина відхилення:</strong> {req.reject_reason}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      {req.status === 'new' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleStatusChange(req.id, 'in_progress')}>
                            Взяти в роботу
                          </button>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#fee2e2', color: '#e74c3c', border: 'none' }} onClick={() => handleStatusChange(req.id, 'rejected')}>
                            Відхилити
                          </button>
                        </>
                      )}
                      {req.status === 'in_progress' && (
                        <>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleDownloadPDF(req.id)}>
                            Накладна
                          </button>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#dcfce7', color: '#15803d', border: 'none' }} onClick={() => handleStatusChange(req.id, 'completed')}>
                            Завершити
                          </button>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#eee', color: '#333', border: 'none' }} onClick={() => setActiveChatReqId(req.id)}>
                            Відкрити чат
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeChatReqId && activeReq && (
            <div className="card" style={{ flex: '1', padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Чат по запиту #{activeReq.id}</h3>
                <button onClick={() => setActiveChatReqId(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
              </div>

              <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
                  Система коментарів буде підключена згодом. Ви можете спілкуватися з {activeReq.author_name} за вказаними в профілі контактами.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
