import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const REQUESTS_URL = `${API_BASE}/api/logistics/requests/`;
const WAREHOUSE_URL = `${API_BASE}/api/logistics/warehouse/`;
const UPDATE_STATUS_URL = (id) => `${API_BASE}/api/logistics/requests/${id}/status/`;
const REPORT_URL = `${API_BASE}/api/logistics/report/pdf/`;

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [requestToAllocate, setRequestToAllocate] = useState(null);
  const [selectedWarehouseItemId, setSelectedWarehouseItemId] = useState("");
  const [allocateError, setAllocateError] = useState("");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentHistoryReqId, setCurrentHistoryReqId] = useState(null);

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

  const fetchData = async () => {
    const savedUser = getSavedUser();
    if (!savedUser || !savedUser.token || savedUser.role !== "volunteer") {
      navigate("/login");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const [reqRes, wareRes] = await Promise.all([
        fetch(REQUESTS_URL, { headers: { Authorization: `Token ${savedUser.token}` } }),
        fetch(WAREHOUSE_URL, { headers: { Authorization: `Token ${savedUser.token}` } })
      ]);

      if (!reqRes.ok || !wareRes.ok) throw new Error("Помилка завантаження даних");

      const reqData = await reqRes.json();
      const wareData = await wareRes.json();

      setRequests(Array.isArray(reqData) ? reqData : []);
      setWarehouseItems(Array.isArray(wareData) ? wareData : []);
    } catch (e) {
      setError(e?.message || "Помилка сервера");
    } finally {
      setIsLoading(false);
    }
  };

  const patchStatus = async (id, newStatus, reason = "", warehouseItemId = null) => {
    const token = getToken();
    const body = { status: newStatus };
    if (newStatus === "rejected") body.reject_reason = reason;
    if (newStatus === "in_progress" && warehouseItemId) body.warehouse_item_id = warehouseItemId;

    const response = await fetch(UPDATE_STATUS_URL(id), {
      method: "PATCH",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Помилка зміни статусу");
    }

    await fetchData();
  };

  const downloadMonthlyReport = async () => {
    const token = getToken();
    try {
      const response = await fetch(REPORT_URL, { headers: { Authorization: `Token ${token}` } });
      if (!response.ok) throw new Error("Report download failed");
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
      setError("Помилка завантаження звіту");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (filter === "all") return true;
      if (filter === "new") return req.status === "new" || req.status === "awaiting_purchase";
      return req.status === filter;
    });
  }, [requests, filter]);

  const getStatusBadge = (status) => {
    const styleBase = { padding: "6px 12px", borderRadius: 8, color: "white", fontSize: 13, display: "inline-block" };
    switch (status) {
      case "new":
      case "awaiting_purchase":
        return <span style={{ ...styleBase, background: "#3498db" }}>Новий</span>;
      case "in_progress": return <span style={{ ...styleBase, background: "#F4A261" }}>В роботі</span>;
      case "completed": return <span style={{ ...styleBase, background: "#2ecc71" }}>Виконано</span>;
      case "rejected": return <span style={{ ...styleBase, background: "#e74c3c" }}>Відхилено</span>;
      default: return <span style={{ ...styleBase, background: "#94a3b8" }}>{status || "—"}</span>;
    }
  };
  const openRejectModal = (id) => { setRequestToReject(id); setRejectReason(""); setIsRejectModalOpen(true); };
  const confirmReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await patchStatus(requestToReject, "rejected", rejectReason.trim());
      setIsRejectModalOpen(false); setRequestToReject(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const openAllocateModal = (req) => {
    setRequestToAllocate(req);
    setSelectedWarehouseItemId("");
    setAllocateError("");
    setIsAllocateModalOpen(true);
  };

  const confirmAllocate = async () => {
    if (!selectedWarehouseItemId) {
      setAllocateError("Будь ласка, оберіть товар зі списку.");
      return;
    }
    try {
      await patchStatus(requestToAllocate.id, "in_progress", "", selectedWarehouseItemId);
      setIsAllocateModalOpen(false);
      setRequestToAllocate(null);
    } catch (e) {
      setAllocateError(e.message);
    }
  };

  const openHistoryModal = async (reqId) => {
    setCurrentHistoryReqId(reqId);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setHistoryData([]);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/logistics/requests/${reqId}/history/`, {
        headers: { Authorization: `Token ${token}` }
      });
      if (!res.ok) throw new Error("Не вдалося завантажити історію");
      const data = await res.json();
      setHistoryData(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <section className="section">
      <div className="container" style={{ position: "relative" }}>
        <h2>Дашборд Волонтера</h2>
        <p>Управління запитами від підрозділів</p>

        <div className="tabs" style={{ marginBottom: 20, marginTop: 20 }}>
          <button className={`tab-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Всі</button>
          <button className={`tab-btn ${filter === "new" ? "active" : ""}`} onClick={() => setFilter("new")}>Нові</button>
          <button className={`tab-btn ${filter === "in_progress" ? "active" : ""}`} onClick={() => setFilter("in_progress")}>В роботі</button>
          <button className={`tab-btn ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Виконані</button>
          <button className={`tab-btn ${filter === "rejected" ? "active" : ""}`} onClick={() => setFilter("rejected")}>Відхилені</button>
          <button className="tab-btn" onClick={downloadMonthlyReport} style={{ backgroundColor: "#FFD700", marginLeft: "auto" }}>
            Завантажити звіт
          </button>
        </div>

        {error && <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #d33" }}><b>Помилка:</b> {error}</div>}

        <div className="card">
          {isLoading ? <p>Завантаження...</p> : filteredRequests.length === 0 ? <p>Запитів не знайдено.</p> : (
            <div className="table-scroll">
              <div style={{ width: "100%", minWidth: 1000 }}>
                <div style={{ display: "flex", fontWeight: "bold", borderBottom: "2px solid #ddd", paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>Дата</div>
                  <div style={{ flex: 2 }}>Запит</div>
                  <div style={{ flex: 0.8, textAlign: "center" }}>К-сть</div>
                  <div style={{ flex: 2 }}>Автор / Локація</div>
                  <div style={{ flex: 1 }}>Статус</div>
                  <div style={{ flex: 3.5, textAlign: "right" }}>Дії</div>
                </div>

                {filteredRequests.map((req) => (
                  <div key={req.id} style={{ display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #eee" }}>
                    <div style={{ flex: 1, fontSize: 14, color: "#555" }}>{req.date || (req.created_at ? String(req.created_at).slice(0, 10) : "—")}</div>
                    <div style={{ flex: 2, fontWeight: 500 }}>
                      <span style={{ color: "#888", marginRight: 8, fontSize: 13 }}>#{req.id}</span>
                      {req.title}
                      {req.status === "rejected" && req.reject_reason && (
                        <div style={{ fontSize: 13, color: "#e74c3c", marginTop: 4 }}><strong>Причина:</strong> {req.reject_reason}</div>
                      )}
                    </div>

                    <div style={{ flex: 0.8, textAlign: "center", fontWeight: "bold", color: "#2C3E50" }}>
                      {req.quantity || 1} шт.
                    </div>

                    <div style={{ flex: 2 }}>
                      {req.author_name && (
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>
                          {req.author_name}
                        </div>
                      )}
                      <span style={{ fontSize: 12, color: "#888" }}>📍 {req.location || "Не вказано"}</span>
                    </div>

                    <div style={{ flex: 1 }}>{getStatusBadge(req.status)}</div>

                    <div style={{ flex: 3.5, textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>

                      <button
                        className="btn"
                        style={{ padding: "6px 12px", fontSize: 13, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}
                        onClick={() => openHistoryModal(req.id)}
                      >
                        Історія
                      </button>

                      {req.attachment && (
                        <button
                          onClick={async () => {
                            try {
                              const userData = JSON.parse(localStorage.getItem("user"));
                              const token = userData?.token;
                              if (!token) return alert("Токен не знайдено. Увійдіть у систему.");
                              const response = await fetch(`http://127.0.0.1:8000/api/logistics/requests/${req.id}/download/`, { headers: { 'Authorization': `Token ${token}` } });
                              if (!response.ok) return alert(`Помилка завантаження файлу: ${response.status}`);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const filename = req.attachment?.name?.split("/").pop() || "file";
                              const a = document.createElement("a");
                              a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
                            } catch (error) {
                              alert("Сталася помилка під час завантаження файлу");
                            }
                          }}
                          className="btn"
                          style={{ display: "inline-block", padding: "6px 12px", background: "#3498db", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 13, marginRight: 8, cursor: "pointer" }}
                        >
                          Скан
                        </button>
                      )}

                      {(req.status === "new" || req.status === "awaiting_purchase") && (
                        <>
                          <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => openAllocateModal(req)}>Взяти в роботу</button>
                          <button className="btn" style={{ padding: "6px 12px", fontSize: 13, background: "#e74c3c", color: "white", border: "none" }} onClick={() => openRejectModal(req.id)}>Відхилити</button>
                        </>
                      )}

                      {req.status === "in_progress" && (
                        <>
                          <button className="btn" style={{ background: "#2ecc71", color: "white", padding: "6px 12px", fontSize: 13 }} onClick={() => patchStatus(req.id, "completed")}>Завершити</button>
                          <button className="btn" style={{ background: "#e74c3c", color: "white", padding: "6px 12px", fontSize: 13, border: "none" }} onClick={() => openRejectModal(req.id)}>Відхилити</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isHistoryModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="card" style={{ width: 500, background: "white", padding: 30, maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, color: "#2C3E50", borderBottom: "2px solid #eee", paddingBottom: 10 }}>Історія змін (Заявка #{currentHistoryReqId})</h3>

              {isLoadingHistory ? (
                <p style={{ textAlign: "center", color: "#888" }}>Завантаження історії...</p>
              ) : historyData.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", background: "#f8fafc", borderRadius: 8, color: "#64748b" }}>
                  Історія порожня. Статус цієї заявки ще не змінювався.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 15 }}>
                  {historyData.map(item => (
                    <div key={item.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #3498db" }}>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                        {new Date(item.created_at).toLocaleString('uk-UA')}
                      </div>
                      <div style={{ fontSize: 14, color: "#334155" }}>
                        Користувач <b>{item.changed_by_name}</b> змінив статус: <br/>
                        <span style={{ color: "#64748b" }}>{item.old_status_display || item.old_status}</span>
                        <span style={{ margin: "0 8px" }}>➡️</span>
                        <span style={{ fontWeight: "bold", color: "#2C3E50" }}>{item.new_status_display || item.new_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button className="btn" style={{ background: "#e2e8f0", color: "#475569" }} onClick={() => setIsHistoryModalOpen(false)}>Закрити</button>
              </div>
            </div>
          </div>
        )}

        {isAllocateModalOpen && requestToAllocate && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="card" style={{ width: 450, background: "white", padding: 30 }}>
              <h3 style={{ marginTop: 0, color: "#2C3E50" }}>Підтвердження видачі</h3>
              <p style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
                Запит <b>#{requestToAllocate.id}</b>: {requestToAllocate.title}<br/>
                Необхідна кількість: <b>{requestToAllocate.quantity} шт.</b>
              </p>

              {allocateError && <div style={{ color: "#e74c3c", fontSize: 13, marginBottom: 10 }}>{allocateError}</div>}

              <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 8 }}>Оберіть товар зі складу для списання:</label>
              <select
                className="input"
                value={selectedWarehouseItemId}
                onChange={(e) => setSelectedWarehouseItemId(e.target.value)}
                style={{ width: "100%", marginBottom: 20 }}
              >
                <option value="">-- Натисніть для вибору --</option>
                {warehouseItems.map(item => (
                  <option key={item.id} value={item.id} disabled={item.quantity < requestToAllocate.quantity}>
                    {item.name} (В наявності: {item.quantity} шт.) {item.quantity < requestToAllocate.quantity ? ' - Недостатньо' : ''}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn" style={{ background: "#ddd" }} onClick={() => setIsAllocateModalOpen(false)}>Скасувати</button>
                <button className="btn btn-primary" onClick={confirmAllocate}>Підтвердити списання</button>
              </div>
            </div>
          </div>
        )}

        {isRejectModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div className="card" style={{ width: 400, background: "white", padding: 30 }}>
              <h3 style={{ marginTop: 0, color: "#e74c3c" }}>Відхилення заявки</h3>
              <textarea className="input" style={{ height: 80, width: "100%", resize: "none" }} placeholder="Вкажіть причину..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
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
