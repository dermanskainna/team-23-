import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Warehouse() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'other',
    quantity: 0
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.token || savedUser.role !== 'volunteer') {
      navigate('/login');
      return;
    }
    fetchInventory(savedUser.token);
  }, [navigate]);

  const fetchInventory = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/logistics/warehouse/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        setError('Не вдалося завантажити склад');
      }
    } catch (err) {
      console.error(err);
      setError('Помилка мережі при завантаженні складу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setIsAdding(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/logistics/warehouse/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${savedUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const addedItem = await response.json();
        setInventory([...inventory, addedItem]);
        setNewItem({ name: '', category: 'other', quantity: 0 });
      } else {
        const errorData = await response.json();
        alert("Django каже: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error(err);
      alert("Помилка мережі");
    } finally {
      setIsAdding(false);
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'medicine': return '#ef4444';
      case 'drones': return '#3b82f6';
      case 'ammunition': return '#10b981';
      case 'vehicles': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <section className="section" style={{ background: '#f9f8f6', minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <h2 style={{ marginBottom: "20px", color: "#2C3E50" }}>Склад ресурсів</h2>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          <div className="card" style={{ flex: '2', minWidth: '300px', padding: '20px' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Наявні ресурси</h3>

            {isLoading ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Завантаження складу...</p>
            ) : error ? (
              <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            ) : inventory.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Склад наразі порожній.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Назва</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Категорія</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Кількість</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#2C3E50' }}>{item.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: getCategoryColor(item.category) + '20',
                            color: getCategoryColor(item.category),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {item.category_display || item.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                          {item.quantity} шт.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card" style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#fff' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' }}>+ Додати партію</h3>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Назва товару</label>
                <input
                  type="text" className="input" placeholder="Напр. Турнікети СІЧ" required
                  value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Категорія</label>
                <select
                  className="input"
                  value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  style={{ marginBottom: 0 }}
                >
                  <option value="medicine">Медицина</option>
                  <option value="drones">Дрони та електроніка</option>
                  <option value="ammunition">Амуніція</option>
                  <option value="vehicles">Транспорт</option>
                  <option value="other">Інше</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Кількість (шт)</label>
                <input
                  type="number" className="input" min="1" required
                  value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  style={{ marginBottom: 0 }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isAdding} style={{ padding: '10px' }}>
                {isAdding ? 'Додавання...' : 'Зберегти на склад'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
