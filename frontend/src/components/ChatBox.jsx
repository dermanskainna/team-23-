import React, { useEffect, useState } from "react";

export default function ChatBox({ conversationId, token, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`https://varta-7z8t.onrender.com/chat/${conversationId}/messages/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`https://varta-7z8t.onrender.com/chat/${conversationId}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ text: newMessage }),
      });
      if (!res.ok) throw new Error("Не вдалося відправити повідомлення");
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  useEffect(() => {
    if (expanded) fetchMessages();
  }, [expanded]);

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, width: 350 }}>
      <button
        style={{ marginBottom: 10, padding: "5px 10px", cursor: "pointer" }}
        onClick={() => setExpanded(prev => !prev)}
      >
        {expanded ? "Закрити чат" : "Відкрити чат"}
      </button>

      {expanded && (
        <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10, borderTop: "1px solid #ddd", paddingTop: 10 }}>
          {messages.length === 0 ? (
            <p style={{ fontSize: 12, color: "#999" }}>Немає повідомлень</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  marginBottom: 5,
                  textAlign: msg.author === user.username ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: msg.author === user.username ? "#4caf50" : "#f1f0f0",
                    color: msg.author === user.username ? "white" : "black",
                    padding: "5px 10px",
                    borderRadius: 12,
                    maxWidth: "80%",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: "#999" }}>{msg.author_name}</div>
              </div>
            ))
          )}
        </div>
      )}

      {expanded && (
        <div style={{ display: "flex", gap: 5 }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Написати повідомлення..."
            style={{ flex: 1, padding: 5, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <button
            onClick={sendMessage}
            style={{ padding: "5px 10px", borderRadius: 4, cursor: "pointer", background: "#4caf50", color: "white", border: "none" }}
          >
            Відправити
          </button>
        </div>
      )}
    </div>
  );
}
