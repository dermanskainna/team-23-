import React, { useState } from 'react';

export default function Warehouse() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Квадрокоптер DJI Mavic 3', category: 'Електроніка', quantity: 5 },
    { id: 2, name: 'Турнікет CAT 7', category: 'Медицина', quantity: 150 },
    { id: 3, name: 'Спальний мішок зимовий', category: 'Амуніція', quantity: 30 },
    { id: 4, name: 'Тепловізор Pulsar', category: 'Електроніка', quantity: 2 },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '' });
  const [activeCategory, setActiveCategory] = useState('Всі');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity || !newItem.category) return;

    const itemToAdd = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      quantity: Number(newItem.quantity)
    };

    setInventory([...inventory, itemToAdd]);
    setNewItem({ name: '', category: '', quantity: '' });
    setShowForm(false);
  };

  const categories = ['Всі', ...new Set(inventory.map(item => item.category))];
  const filteredInventory = activeCategory === 'Всі'
    ? inventory
    : inventory.filter(item => item.category === activeCategory);

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Склад та Інвентар</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Скасувати' : '+ Додати товар'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '30px', background: '#eaf4f0' }}>
            <h3>Нове надходження</h3>
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="input"
                style={{ marginBottom: 0, flex: '1' }}
                type="text"
                placeholder="Назва товару"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />

              <select
                className="input"
                style={{ marginBottom: 0, width: '200px' }}
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                <option value="" disabled>Оберіть категорію</option>
                <option value="Електроніка">Електроніка</option>
                <option value="Медицина">Медицина</option>
                <option value="Амуніція">Амуніція</option>
                <option value="Транспорт">Транспорт</option>
                <option value="Їжа та Вода">Їжа та Вода</option>
                <option value="Інше">Інше</option>
              </select>

              <input
                className="input"
                style={{ marginBottom: 0, width: '120px' }}
                type="number"
                placeholder="Кількість"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
              />

              <button className="btn btn-accent" type="submit">Зберегти</button>
            </form>
          </div>
        )}

        <div className="tabs" style={{ marginBottom: '20px' }}>
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
          {filteredInventory.length === 0 ? (
            <p>У цій категорії немає товарів.</p>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ flex: '2' }}>Назва</div>
                <div style={{ flex: '1' }}>Категорія</div>
                <div style={{ flex: '1', textAlign: 'center' }}>Залишок</div>
              </div>

              {filteredInventory.map((item) => (
                <div key={item.id} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ flex: '2' }}>{item.name}</div>
                  <div style={{ flex: '1' }}>
                    <span className="status-badge volunteer" style={{ background: '#78B27C' }}>{item.category}</span>
                  </div>
                  <div style={{ flex: '1', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity} шт.</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
