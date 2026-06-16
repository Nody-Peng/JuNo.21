import React from 'react';

export default function BeforeLogin() {
  return (
    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
      <h3 style={{ fontFamily: 'serif', color: 'var(--theme-elevation-800)', fontSize: '1.5rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
        歡迎來到編輯室
      </h3>
      <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.9rem', letterSpacing: '0.02em' }}>
        今天想分享什麼生活故事？
      </p>
    </div>
  );
}
