import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "import.meta.env.VITE_API_URL";

export default function VerifyMilitary() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const me = getSavedUser();
  const role = me?.role;
  const token = me?.token;

  const loadPending = async () => {
    setError("");
    setLoading(true);

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/pending-military/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET pending-military failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Помилка завантаження списку");
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (id) => {
    setError("");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/verify-military/${id}/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST verify-military failed (${res.status}): ${text}`);
      }

      await loadPending();
    } catch (e) {
      setError(e?.message || "Помилка підтвердження");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "volunteer") {
      navigate("/dashboard");
      return;
    }
    loadPending();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h2>Підтвердження військових</h2>

        {error && (
          <div className="card" style={{ marginBottom: 16, borderLeft: "4px solid #d33" }}>
            <b>Помилка:</b> {error}
          </div>
        )}

        <button className="btn" onClick={loadPending} style={{ marginBottom: 16 }}>
          Оновити
        </button>

        <div className="card">
          {loading ? (
            <p>Завантаження...</p>
          ) : users.length === 0 ? (
            <p>Немає непідтверджених військових ✅</p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    #{u.id} {u.username}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {u.full_name || "—"} • {u.organization || "—"} • {u.email || "—"}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => verifyUser(u.id)}>
                  Підтвердити
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
