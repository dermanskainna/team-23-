import React, { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/logistics/warehouse/';

export default function Warehouse() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Всі');

  // quantity як рядок, щоб можна було стерти поле (і не “прилипав” 0)
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '' });

  // Якщо у вас auth через токен — дістань його звідси (підлаштуй під ваш проєкт)
  const token = localStorage.getItem('token');

  const fetchWarehouse = async () => {
    setError('');
    try {
      setLoading(true);

      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET warehouse failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Помилка завантаження складу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();

    const name = newItem.name.trim();
    const category = newItem.category;
    const qty = Number(newItem.quantity);

    if (!name || !category) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          category,
          quantity: qty,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST warehouse failed (${res.status}): ${text}`);
      }

      // Важливо: після POST робимо GET, щоб UI точно відобразив merge з бекенду
      await fetchWarehouse();

      setNewItem({ name: '', category: '', quantity: '' });
      setShowForm(false);
    } catch (e) {
      setError(e.message || 'Помилка додавання на склад');
    }
  };

  const categories = useMemo(
    () => ['Всі', ...new Set(inventory.map((item) => item.category))],
    [inventory]
  );

  const filteredInventory = useMemo(() => {
    return activeCategory === 'Всі'
      ? inventory
      : inventory.filter((item) => item.category === activeCategory);
  }, [activeCategory, inventory]);

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Склад ресурсів</h2>

          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Скасувати' : '+ Додати партію'}
          </button>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid #d33' }}>
            <b>Помилка:</b> {error}
          </div>
        )}

        {showForm && (
          <div className="card" style={{ marginBottom: 30, background: '#eaf4f0' }}>
            <h3>Нове надходження</h3>

            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="input"
                style={{ marginBottom: 0, flex: 1 }}
                type="text"
                placeholder="Назва товару"
                value={newItem.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
              />

              <select
                className="input"
                style={{ marginBottom: 0, width: 220 }}
                value={newItem.category}
                onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="" disabled>Оберіть категорію</option>
                <option value="Електроніка">Електроніка</option>
                <option value="Медицина">Медицина</option>
                <option value="Амуніція">Амуніція</option>
                <option value="Транспорт">Транспорт</option>
                <option value="Їжа та Вода">Їжа та Вода</option>
                <option value="Інше">Інше</option>
              </select>

              {/* quantity як текст з inputMode numeric — щоб не залипав 0 і можна було чистити */}
              <input
                className="input"
                style={{ marginBottom: 0, width: 160 }}
                type="text"
                inputMode="numeric"
                placeholder="Кількість"
                value={newItem.quantity}
                onChange={(e) => {
                  const raw = e.target.value;

                  if (raw === '') {
                    setNewItem((prev) => ({ ...prev, quantity: '' }));
                    return;
                  }

                  const digits = raw.replace(/[^\d]/g, '');
                  const noLeadingZeros = digits.replace(/^0+(?=\d)/, '');
                  setNewItem((prev) => ({ ...prev, quantity: noLeadingZeros }));
                }}
              />

              <button className="btn btn-accent" type="submit">
                Зберегти на склад
              </button>
            </form>
          </div>
        )}

        <div className="tabs" style={{ marginBottom: 20 }}>
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <p>Завантаження...</p>
          ) : filteredInventory.length === 0 ? (
            <p>У цій категорії немає товарів.</p>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #ddd', paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ flex: 2 }}>Назва</div>
                <div style={{ flex: 1 }}>Категорія</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Залишок</div>
              </div>

              {filteredInventory.map((item) => (
                <div key={item.id} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ flex: 2 }}>{item.name}</div>
                  <div style={{ flex: 1 }}>
                    <span className="status-badge volunteer" style={{ background: '#78B27C' }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                    {item.quantity} шт.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
