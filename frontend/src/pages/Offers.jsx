import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const OFFERS_URL = `${API_BASE}/api/offers/`;
const SUPPLIERS_URL = `${API_BASE}/api/suppliers/`;

const CATEGORY = [
  { value: "medicine", label: "Медицина" },
  { value: "drones", label: "Дрони та електроніка" },
  { value: "ammunition", label: "Амуніція" },
  { value: "vehicles", label: "Транспорт" },
  { value: "other", label: "Інше" },
];

export default function Offers() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("");

  const [form, setForm] = useState({
    supplier: "",
    category: "drones",
    item_name: "",
    sku: "",
    price: "",
    currency: "UAH",
    link: "",
    is_available: true,
  });

  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const savedUser = getSavedUser();
  const token = savedUser?.token || "";
  const role = savedUser?.role || "";

  const fetchSuppliers = async () => {
    const res = await fetch(SUPPLIERS_URL, {
      method: "GET",
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json();
    setSuppliers(Array.isArray(data) ? data : []);
  };

  const fetchOffers = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const url = categoryFilter ? `${OFFERS_URL}?category=${categoryFilter}` : OFFERS_URL;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET offers failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Помилка завантаження оферів");
    } finally {
      setIsLoading(false);
    }
  };

  const createOffer = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        supplier: Number(form.supplier),
        price: form.price === "" ? null : Number(form.price),
      };

      const res = await fetch(OFFERS_URL, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST offer failed (${res.status}): ${text}`);
      }

      setForm({
        supplier: "",
        category: "drones",
        item_name: "",
        sku: "",
        price: "",
        currency: "UAH",
        link: "",
        is_available: true,
      });

      await fetchOffers();
    } catch (e) {
      setError(e?.message || "Помилка створення офера (тільки волонтер може додавати)");
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchSuppliers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h2>Офери</h2>

        {error && (
          <div className="card" style={{ marginBottom: 16, borderLeft: "4px solid #d33" }}>
            <b>Помилка:</b> {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Усі категорії</option>
            {CATEGORY.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button className="btn" onClick={fetchOffers}>Застосувати</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* List */}
          <div className="card">
            <h3>Список</h3>
            {isLoading ? (
              <p>Завантаження...</p>
            ) : offers.length === 0 ? (
              <p>Оферів немає</p>
            ) : (
              offers.map((o) => (
                <div key={o.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ fontWeight: 700 }}>
                    #{o.id} {o.item_name}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>
                    {o.category_display} • {o.price ?? "—"} {o.currency} • {o.is_available ? "✅" : "❌"}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Supplier ID: {o.supplier}</div>
                  {o.link && (
                    <div>
                      <a href={o.link} target="_blank" rel="noreferrer">Посилання</a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Create form */}
          <div className="card">
            <h3>Додати офер</h3>

            {role !== "volunteer" ? (
              <p style={{ opacity: 0.8 }}>
                Додавати офери може тільки <b>волонтер</b>.
              </p>
            ) : (
              <form onSubmit={createOffer} style={{ display: "grid", gap: 10 }}>
                <select
                  className="input"
                  required
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                >
                  <option value="">Вибери постачальника*</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
                  ))}
                </select>

                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORY.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <input
                  className="input"
                  required
                  placeholder="Назва товару*"
                  value={form.item_name}
                  onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="SKU"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="Ціна (число)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="Валюта"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="Посилання"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  />
                  В наявності
                </label>

                <button className="btn btn-primary" type="submit">
                  Створити офер
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
