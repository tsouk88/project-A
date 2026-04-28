'use client';

import { useState, useEffect } from 'react';

type Message = {
  role: 'user' | 'model';
  text: string;
};
type Stats = {
  revenue: {
    today: number;
    past: number;
    total: number;
  };
  counts: {
    cars: number;
    motorcycles: number;
    washes: number;
    simplewash: number;
    premiumwash: number;
  };
  weather: {
    currenttemp: number;
    tomorrowmin: number;
    tomorrowmax: number;
    wind: number;
  };
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [sessionId] = useState(() => Date.now().toString());


const sendMessage = () => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/AI/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageid: sessionId, message: input })
  })
  .then(res => res.json())
  .then(data => {
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input },
      { role: 'model', text: data.response }
    ]);
    setInput('');
  });
}

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/API/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Δεν μπόρεσα να συνδεθώ με τον backend');
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Φορτώνω...</p>;
  if (error)   return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1> ChiosWash Dashboard</h1>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ background: '#e0f0ff', color:'#003366', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>{stats?.counts.washes}</h2>
          <p>Συνολικά Πλυσίματα</p>
        </div>
        <div style={{ background: '#e0ffe0', color: '#005500', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>{stats?.revenue.total}€</h2>
          <p>Συνολικά Έσοδα</p>
        </div>
        <div style={{ background: '#fff3e0', color: '#7a3b00', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>{stats?.weather.currenttemp}°C</h2>
          <p>Τρέχουσα θερμοκρασία</p>
        </div>
        <div style={{ background: '#f8f5f0', color: '#7a3b00', padding: '1rem', borderRadius: '20px' }}>
          {messages.map((msg, i) => (
         <p key={i}>
        <strong>{msg.role === 'user' ? 'Εσύ' : 'AI'}:</strong> {msg.text}
         </p>
             ))}
          <input 
             value={input}
           onChange={(e) => setInput(e.target.value)}
         placeholder="Γράψε μήνυμα..." /> 
         <button onClick={sendMessage}>Send</button>     
        </div>
      </div>

  
      
    </main>
  );
}