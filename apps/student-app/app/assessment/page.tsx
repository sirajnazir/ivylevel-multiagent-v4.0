"use client";

import React, { useState, useEffect } from "react";

type Message = {
  role: "student" | "agent";
  content: string;
};

export default function AssessmentPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  async function startSession() {
    setError(null);
    const res = await fetch(`${API_URL}/assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: "demo-student-id" })
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error || "Failed to start session");
      return;
    }
    setSessionId(json.data.sessionId);
  }

  async function sendMessage() {
    if (!sessionId || !input.trim()) return;
    setLoading(true);
    setError(null);

    const studentMsg: Message = { role: "student", content: input };
    setMessages((prev) => [...prev, studentMsg]);
    setInput("");

    const res = await fetch(`${API_URL}/assessment/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: studentMsg.content })
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error || "Message failed");
      return;
    }

    const agentMsg: Message = {
      role: "agent",
      content: json.data.agentMessage
    };

    setMessages((prev) => [...prev, agentMsg]);
  }

  async function completeSession() {
    if (!sessionId) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/assessment/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error || "Failed to complete assessment");
      return;
    }

    // Redirect to summary page with sessionId
    window.location.href = `/assessment/${sessionId}`;
  }

  useEffect(() => {
    // Auto-start for demo
    startSession();
  }, []);

  if (!sessionId) {
    return <div style={{ padding: '24px' }}>Initializing assessment session...</div>;
  }

  if (completed) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Assessment Complete</h1>
        <p style={{ marginTop: '8px' }}>
          Your assessment is complete. You can view your summary in the
          Assessment Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '768px',
      margin: '0 auto',
      padding: '24px'
    }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
        Assessment Session
      </h1>

      <div style={{
        flex: 1,
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        overflowY: 'auto',
        backgroundColor: 'white'
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: '12px',
              textAlign: m.role === "student" ? 'right' : 'left'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: m.role === "student" ? '#3b82f6' : '#f3f4f6',
                color: m.role === "student" ? 'white' : '#111827'
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: '14px', color: '#6b7280' }}>Thinking…</div>}
      </div>

      {error && <div style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>{error}</div>}

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <input
          style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void sendMessage();
            }
          }}
        />
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
          disabled={loading}
          onClick={() => void sendMessage()}
        >
          Send
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => void completeSession()}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
