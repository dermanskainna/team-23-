import React, { useEffect, useState, useRef } from 'react';

export default function ChatBox({ conversationId, token, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${conversationId}/`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    ws.current.onclose = () => console.log("WebSocket closed");

    return () => ws.current.close();
  }, [conversationId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    ws.current.send(JSON.stringify({ message: input }));
    setInput('');
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '6px', maxHeight: '400px', overflowY: 'auto' }}>
      <div style={{ marginBottom: '10px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: '6px' }}>
            <b>{m.sender}</b>: {m.message} <span style={{ fontSize: '10px', color: '#999' }}>{new Date(m.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={sendMessage}>Відправити</button>
      </div>
    </div>
  );
}
