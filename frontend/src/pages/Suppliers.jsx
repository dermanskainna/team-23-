import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const SUPPLIERS_URL = `${API_BASE}/api/suppliers/`;

export default function Suppliers() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    website: "",
    notes: "",
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
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(SUPPLIERS_URL, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET suppliers failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Помилка завантаження постачальників");
    } finally {
      setIsLoading(false);
    }
  };

  const createSupplier = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(SUPPLIERS_URL, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST supplier failed (${res.status}): ${text}`);
      }

      setForm({ name: "", phone: "", email: "", city: "", website: "", notes: "" });
      await fetchSuppliers();
    } catch (e) {
      setError(e?.message || "Помилка створення постачальника (тільки волонтер може додавати)");
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h2>База постачальників</h2>

        {error && (
          <div className="card" style={{ marginBottom: 16, borderLeft: "4px solid #d33" }}>
            <b>Помилка:</b> {error}
          </div>
        )}

        <button className="btn" onClick={fetchSuppliers} style={{ marginBottom: 16 }}>
          Оновити
        </button>

        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* List */}
          <div className="card">
            <h3>Список</h3>
            {isLoading ? (
              <p>Завантаження...</p>
            ) : suppliers.length === 0 ? (
              <p>Постачальників поки немає</p>
            ) : (
              suppliers.map((s) => (
                <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ fontWeight: 700 }}>
                    #{s.id} {s.name}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>
                    {s.city || "—"} • {s.phone || "—"} • {s.email || "—"}
                  </div>
                  {s.website && (
                    <div>
                      <a href={s.website} target="_blank" rel="noreferrer">
                        {s.website}
                      </a>
                    </div>
                  )}
                  {s.notes && <div style={{ marginTop: 6 }}>{s.notes}</div>}

                  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
                    Оферів: {s.offers?.length || 0}
                  </div>

                  {s.offers?.length > 0 && (
                    <ul style={{ marginTop: 6 }}>
                      {s.offers.map((o) => (
                        <li key={o.id}>
                          {o.item_name} — {o.price ?? "—"} {o.currency} ({o.category_display})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Create form */}
          <div className="card">
            <h3>Додати постачальника</h3>

            {role !== "volunteer" ? (
              <p style={{ opacity: 0.8 }}>
                Додавати постачальників може тільки <b>волонтер</b>.
              </p>
            ) : (
              <form onSubmit={createSupplier} style={{ display: "grid", gap: 10 }}>
                <input
                  className="input"
                  placeholder="Назва*"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Телефон"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Місто"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
                <textarea
                  className="input"
                  placeholder="Нотатки"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
                <button className="btn btn-primary" type="submit">
                  Створити
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
