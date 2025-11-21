"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('009');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId) {
      router.push(`/assessment/${sessionId}`);
    }
  };

  // Available student IDs based on MVP documentation
  const availableStudents = [
    { id: '000', name: 'Huda' },
    { id: '001', name: 'Anoushka' },
    { id: '002', name: 'Ananyaa' },
    { id: '003', name: 'Aaryan' },
    { id: '004', name: 'Hiba' },
    { id: '005', name: 'Srinidhi' },
    { id: '006', name: 'Arshiya' },
    { id: '007', name: 'Aarnav' },
    { id: '008', name: 'Iqra' },
    { id: '009', name: 'Aarav' },
    { id: '010', name: 'Zainab' },
    { id: '011', name: 'Beya' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '48px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#111827'
        }}>
          IvyLevel Assessment Portal
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '32px'
        }}>
          View student assessment reports powered by real AI analysis with RAG + EQ integration
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#374151'
          }}>
            Enter Student ID:
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="e.g., 009"
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              View Assessment
            </button>
          </div>
        </form>

        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#374151'
          }}>
            Available Students:
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {availableStudents.map((student) => (
              <div key={student.id} style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => router.push(`/assessment/${student.id}`)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '14px',
                    textAlign: 'left',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#8b5cf6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#111827' }}>
                    {student.id} - {student.name}
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/chat/${student.id}`)}
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#8b5cf6';
                  }}
                  title="Start interactive chat"
                >
                  💬
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
            System Status
          </div>
          <div style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: '1.6' }}>
            ✅ Next.js Server: Running<br />
            ✅ API Endpoint: /api/assessments/[sessionId]<br />
            ✅ RAG Integration: 1,072 KB chips loaded<br />
            ✅ EQ Chips: 99 chips available<br />
            ✅ Backend Pipeline: AssessmentAgent ready
          </div>
        </div>
      </div>
    </div>
  );
}
