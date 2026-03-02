import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const REQUESTS_URL = `${API_BASE}/api/logistics/requests/`;
const UPDATE_STATUS_URL = (id) => `${API_BASE}/api/logistics/requests/${id}/status/`;
const REPORT_URL = `${API_BASE}/api/logistics/report/pdf/`;

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ===== helpers =====
  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const getToken = () => {
    const u = getSavedUser();
    return u?.token || "";
  };

  // ===== API =====
  const fetchRequests = async () => {
    const savedUser = getSavedUser();

    if (!savedUser || !savedUser.token || savedUser.role !== "volunteer") {
      navigate("/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(REQUESTS_URL, {
        method: "GET",
        headers: {
          Authorization: `Token ${savedUser.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`GET requests failed (${response.status}): ${text}`);
      }

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Помилка завантаження заявок");
    } finally {
      setIsLoading(false);
    }
  };

  const patchStatus = async (id, newStatus, reason = "") => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");

    try {
      const body =
        newStatus === "rejected"
          ? { status: newStatus, reject_reason: reason }
          : { status: newStatus };

      const response = await fetch(UPDATE_STATUS_URL(id), {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`PATCH status failed (${response.status}): ${text}`);
      }

      await fetchRequests();
    } catch (e) {
      setError(e?.message || "Помилка зміни статусу");
    }
  };

  const downloadMonthlyReport = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");

    try {
      const response = await fetch(REPORT_URL, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Report download failed (${response.status}): ${text}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "zvit_volontera.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "Помилка завантаження звіту");
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== UI helpers =====
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => (filter === "all" ? true : req.status === filter));
  }, [requests, filter]);

  const getStatusBadge = (status) => {
    const styleBase = {
      padding: "6px 12px",
      borderRadius: 8,
      color: "white",
      fontSize: 13,
      whiteSpace: "nowrap",
      display: "inline-block",
    };

    switch (status) {
      case "new":
        return <span style={{ ...styleBase, background: "#3498db" }}>Новий</span>;
      case "awaiting_purchase":
        return <span style={{ ...styleBase, background: "#a855f7" }}>Очікує закупівлі</span>;
      case "in_progress":
        return <span style={{ ...styleBase, background: "#F4A261", color: "white" }}>В роботі</span>;
      case "completed":
        return <span style={{ ...styleBase, background: "#2ecc71" }}>Виконано</span>;
      case "rejected":
        return <span style={{ ...styleBase, background: "#e74c3c" }}>Відхилено</span>;
      default:
        return <span style={{ ...styleBase, background: "#94a3b8" }}>{status || "—"}</span>;
    }
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency === "low") return "Низька";
    if (urgency === "medium") return "Середня";
    if (urgency === "high") return "Висока";
    if (urgency === "critical") return "Критична";
    return "—";
  };

  const openRejectModal = (id) => {
    setRequestToReject(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!requestToReject) return;
    if (!rejectReason.trim()) return;
    await patchStatus(requestToReject, "rejected", rejectReason.trim());
    setIsRejectModalOpen(false);
    setRequestToReject(null);
    setRejectReason("");
  };

  return (
    <section className="section">
      <div className="container" style={{ position: "relative" }}>
        <h2>Дашборд Волонтера</h2>
        <p>Управління запитами від підрозділів</p>

        <div className="tabs" style={{ marginBottom: 20, marginTop: 20 }}>

          <button className={`tab-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Всі</button>
          <button className={`tab-btn ${filter === "new" ? "active" : ""}`} onClick={() => setFilter("new")}>Нові</button>
          <button className={`tab-btn ${filter === "awaiting_purchase" ? "active" : ""}`} onClick={() => setFilter("awaiting_purchase")}>Очікує закупівлі</button>
          <button className={`tab-btn ${filter === "in_progress" ? "active" : ""}`} onClick={() => setFilter("in_progress")}>В роботі</button>
          <button className={`tab-btn ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Виконані</button>
          <button className={`tab-btn ${filter === "rejected" ? "active" : ""}`} onClick={() => setFilter("rejected")}>Відхилені</button>
          <button
            className="tab-btn"
            onClick={downloadMonthlyReport}
            style={{ backgroundColor: "#FFD700", marginLeft: "auto" }}
          >
            Завантажити звіт
          </button>
                </div>

        {error && (
          <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #d33" }}>
            <b>Помилка:</b> {error}
          </div>
        )}

        <div className="card">
          {isLoading ? (
            <p>Завантаження...</p>
          ) : filteredRequests.length === 0 ? (
            <p>Запитів у цій категорії не знайдено.</p>
          ) : (
            <div className="table-scroll">
              <div style={{ width: "100%", minWidth: 900 }}>
                <div style={{ display: "flex", fontWeight: "bold", borderBottom: "2px solid #ddd", paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>Дата</div>
                  <div style={{ flex: 2 }}>Запит</div>
                  <div style={{ flex: 2 }}>Автор / Локація</div>
                  <div style={{ flex: 1 }}>Статус</div>
                  <div style={{ flex: 1, textAlign: "center" }}>Терміновість</div>
                  <div style={{ flex: 3, textAlign: "right" }}>Дії</div>
                </div>

                {filteredRequests.map((req) => (
                  <div key={req.id} style={{ display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #eee" }}>
                    <div style={{ flex: 1, fontSize: 14, color: "#555" }}>{req.date || (req.created_at ? String(req.created_at).slice(0, 10) : "—")}</div>
                    <div style={{ flex: 2, fontWeight: 500 }}>
                      <span style={{ color: "#888", marginRight: 8, fontSize: 13 }}>#{req.id}</span>
                      {req.title}
                      {req.status === "rejected" && req.reject_reason && (
                        <div style={{ fontSize: 13, color: "#e74c3c", marginTop: 4 }}>
                          <strong>Причина:</strong> {req.reject_reason}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 2 }}>
                      {req.author?.username || req.author?.full_name || "—"}
                      <br />
                      <span style={{ fontSize: 12, color: "#888" }}>📍 {req.location || "—"}</span>
                    </div>
                    <div style={{ flex: 1 }}>{getStatusBadge(req.status)}</div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span className={`urgency-badge ${req.urgency || "medium"}`}>{getUrgencyLabel(req.urgency || "medium")}</span>
                    </div>
                    <div style={{ flex: 3, textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>

                      {req.attachment && (
                        <button
                          onClick={async () => {
                            try {
                              // Беремо токен із localStorage
                              const userData = JSON.parse(localStorage.getItem("user"));
                              const token = userData?.token;

                              if (!token) {
                                alert("Токен не знайдено. Увійдіть у систему.");
                                return;
                              }

                              // Робимо запит до бекенду
                              const response = await fetch(
                                `http://127.0.0.1:8000/api/logistics/requests/${req.id}/download/`,
                                {
                                  headers: {
                                    'Authorization': `Token ${token}`
                                  }
                                }
                              );

                              if (!response.ok) {
                                alert(`Помилка завантаження файлу: ${response.status}`);
                                return;
                              }

                              // Перетворюємо відповідь у blob
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);

                              // Витягуємо ім’я файлу
                              const filename = req.attachment?.name?.split("/").pop() || "file";

                              // Створюємо тимчасовий <a> для завантаження
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = filename;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);

                            } catch (error) {
                              console.error(error);
                              alert("Сталася помилка під час завантаження файлу");
                            }
                          }}
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            background: "#3498db",
                            color: "white",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontSize: 13,
                            marginRight: 8,
                            cursor: "pointer"
                          }}
                        >
                          Завантажити скан
                        </button>
                      )}
                      {(req.status === "new" || req.status === "awaiting_purchase") && (
                        <>
                          <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => patchStatus(req.id, "in_progress")}>Взяти в роботу</button>
                          <button className="btn" style={{ padding: "6px 12px", fontSize: 13, background: "#fee2e2", color: "#e74c3c", border: "none" }} onClick={() => openRejectModal(req.id)}>Відхилити</button>
                        </>
                      )}

                      {req.status === "in_progress" && (
                        <>
                          <button className="btn" style={{ background: "#2ecc71", color: "white", padding: "6px 12px", fontSize: 13 }} onClick={() => patchStatus(req.id, "completed")}>Завершити</button>
                          <button className="btn" style={{ background: "#e74c3c", color: "white", padding: "6px 12px", fontSize: 13 }} onClick={() => openRejectModal(req.id)}>Відхилити</button>
                        </>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reject modal */}
        {isRejectModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="card" style={{ width: 400, background: "white", padding: 30 }}>
              <h3 style={{ marginTop: 0, color: "#e74c3c" }}>Відхилення заявки</h3>
              <textarea
                className="input"
                style={{ height: 80, width: "100%", resize: "none" }}
                placeholder="Вкажіть причину..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 15, justifyContent: "flex-end" }}>
                <button className="btn" style={{ background: "#ddd" }} onClick={() => setIsRejectModalOpen(false)}>Скасувати</button>
                <button className="btn" style={{ background: "#e74c3c", color: "white" }} onClick={confirmReject}>Підтвердити</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
