import React, { useState } from 'react';

export default function Tracking() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!trackingId.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`https://varta-7z8t.onrender.com/api/logistics/tracking/${trackingId}/`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Заявку з таким номером не знайдено. Перевірте правильність ID.');
      }
    } catch (err) {
      console.error("Помилка мережі:", err);
      setError('Не вдалося з\'єднатися з сервером. Перевірте, чи запущений Django.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status, display) => {
    switch(status) {
      case 'new': return <span style={{background: '#e0f2fe', color: '#0284c7', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'}}>{display}</span>;
      case 'in_progress': return <span style={{background: '#fef08a', color: '#a16207', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'}}>{display}</span>;
      case 'completed': return <span style={{background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'}}>{display}</span>;
      case 'rejected': return <span style={{background: '#fee2e2', color: '#e74c3c', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'}}>{display}</span>;
      case 'awaiting_purchase': return <span style={{background: '#f3e8ff', color: '#7e22ce', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'}}>{display}</span>;
      default: return <span style={{background: '#eee', color: '#333', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'}}>{display || status}</span>;
    }
  };

  return (
    <section className="section" style={{ background: '#f9f8f6', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>

      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#2C3E50', marginBottom: '10px', fontSize: '32px' }}>Відстежити запит</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>Введіть ID вашого запиту, щоб дізнатися його актуальний статус.</p>
      </div>

      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '30px' }}>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            className="input"
            placeholder="Наприклад: 1"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            required
            style={{ marginBottom: 0, flex: '1', fontSize: '18px', padding: '12px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ padding: '0 25px', fontSize: '16px' }}>
            {isLoading ? 'Пошук...' : 'Знайти'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#ef4444', padding: '15px', borderRadius: '8px', marginTop: '20px', maxWidth: '500px', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '30px', marginTop: '20px', borderTop: '4px solid #3A5A40' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '14px' }}>Номер запиту</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#2C3E50' }}>#{result.id}</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '14px' }}>Статус</p>
              {getStatusBadge(result.status, result.status_display)}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '14px' }}>Що потрібно</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{result.title}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '14px' }}>Терміновість</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#e74c3c' }}>
                {result.urgency === 'critical' ? 'Критична' : result.urgency === 'high' ? 'Висока' : result.urgency === 'medium' ? 'Середня' : 'Низька'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '14px' }}>Дата створення</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
                {new Date(result.created_at).toLocaleDateString('uk-UA')}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
