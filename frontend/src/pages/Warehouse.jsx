import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";

const API_URL = 'import.meta.env.VITE_API_URL/api/logistics/warehouse/';

const CATEGORY_LABEL = {
  drones: 'Дрони та електроніка',
  medicine: 'Медицина',
  ammunition: 'Амуніція',
  vehicles: 'Транспорт',
  other: 'Інше',
};

function getToken() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

export default function Warehouse() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' або код категорії

  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '' });

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token || "";
    } catch {
      return "";
    }
  };

  const fetchWarehouse = async () => {
    setError('');
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Помилка сервера (${res.status}): ${text}`);
      }

      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Помилка завантаження складу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();

    const name = newItem.name.trim();
    const category = newItem.category;
    const qty = Number(newItem.quantity);

    if (!name || !category) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    setError('');
    const token = getToken();

    try {
      const token = getToken();

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          quantity: qty,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Не вдалося додати товар (${res.status}): ${text}`);
      }

      await fetchWarehouse();

      setNewItem({ name: '', category: '', quantity: '' });
      setShowForm(false);
    } catch (e) {
      setError(e?.message || 'Помилка додавання на склад');
    }
  };

  const categories = useMemo(
    () => ['Всі', ...new Set(inventory.map((item) => item.category_display || item.category))],
    [inventory]
  );

  const filteredInventory = useMemo(() => {
    return activeCategory === 'all'
      ? inventory
      : inventory.filter((item) => (item.category_display || item.category) === activeCategory);
  }, [activeCategory, inventory]);

  return (
    <section className="section">
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
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

            <form
              onSubmit={handleAddItem}
              style={{ display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}
            >
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
                required
              >
                <option value="" disabled>Оберіть категорію</option>
                <option value="drones">Дрони та електроніка</option>
                <option value="medicine">Медицина</option>
                <option value="ammunition">Амуніція</option>
                <option value="vehicles">Транспорт</option>
                <option value="other">Інше</option>
              </select>

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
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'Всі' : CATEGORY_LABEL[cat] || cat}
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
              <div
                style={{
                  display: 'flex',
                  fontWeight: 'bold',
                  borderBottom: '2px solid #ddd',
                  paddingBottom: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ flex: 2 }}>Назва</div>
                <div style={{ flex: 1 }}>Категорія</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Залишок</div>
              </div>

              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #eee' }}
                >
                  <div style={{ flex: 2 }}>{item.name}</div>
                  <div style={{ flex: 1 }}>
                    <span className="status-badge volunteer" style={{ background: '#78B27C' }}>
                      {item.category_display || item.category}
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
