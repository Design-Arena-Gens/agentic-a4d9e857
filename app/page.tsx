"use client";

import { useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: 'Hi! I am an AI Tool Agent. Ask me to calculate 12*(7-2), check the weather in Tokyo, or ask ?Who is Ada Lovelace??.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/agent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      const reply = data?.message || data?.error || 'No response';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Request failed. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">AI Tool Agent</h1>
        <p className="muted">Weather ? Wikipedia ? Calculator ? deployable on Vercel</p>
        <div className="chat">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>
          ))}
        </div>
        <div className="inputRow">
          <input
            className="input"
            placeholder="Ask me something?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <button className="button" onClick={onSend} disabled={loading}>Send</button>
        </div>
        <div className="footer">No keys needed. Uses Wikipedia and Open?Meteo APIs.</div>
      </div>
    </div>
  );
}
