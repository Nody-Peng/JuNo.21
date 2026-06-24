"use client"
import { useState, useEffect } from 'react';

export default function SendNewsletter() {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    fetch('/api/send-newsletter')
      .then(r => r.json())
      .then(d => setSubscriberCount(d.count ?? 0))
      .catch(() => setSubscriberCount(0));
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      setStatus({ type: 'error', message: '請填寫主旨和內容' });
      return;
    }

    const confirmed = window.confirm(
      `確定要發送電子報給 ${subscriberCount} 位訂閱者嗎？\n\n主旨：${subject}`
    );
    if (!confirmed) return;

    setStatus({ type: 'loading', message: '發送中，請稍候...' });

    try {
      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlContent }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message });
        setSubject('');
        setHtmlContent('');
      } else {
        setStatus({ type: 'error', message: data.error || '發送失敗' });
      }
    } catch {
      setStatus({ type: 'error', message: '網路錯誤，請稍後再試' });
    }
  };

  return (
    <div style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3B2D2A', margin: 0 }}>
          📮 發送電子報
        </h1>
        <p style={{ color: '#8A7A77', marginTop: '0.5rem' }}>
          目前活躍訂閱者：
          <strong style={{ color: '#3B2D2A', fontSize: '1.2rem', marginLeft: '0.5rem' }}>
            {subscriberCount === null ? '載入中...' : `${subscriberCount} 人`}
          </strong>
        </p>
      </div>

      {/* Status Message */}
      {status.type && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: 8,
          marginBottom: '1.5rem',
          background: status.type === 'success' ? '#E8F3E8' : status.type === 'error' ? '#FEE2E2' : '#FEF9E7',
          color: status.type === 'success' ? '#2D6A4F' : status.type === 'error' ? '#991B1B' : '#78350F',
          borderLeft: `4px solid ${status.type === 'success' ? '#52B788' : status.type === 'error' ? '#EF4444' : '#F59E0B'}`,
        }}>
          {status.message}
        </div>
      )}

      {/* Subject */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, color: '#3B2D2A', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          郵件主旨 *
        </label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="例如：夏至原點六月號 — 跨越時差的夏天"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1.5px solid #D4CCC9',
            borderRadius: 8,
            fontSize: '1rem',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* HTML Content */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, color: '#3B2D2A', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          郵件內容（HTML）*
        </label>
        <p style={{ color: '#8A7A77', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          支援 HTML 標籤，例如 &lt;p&gt;、&lt;h2&gt;、&lt;strong&gt;、&lt;a href="..."&gt;、&lt;img src="..."&gt; 等
        </p>
        <textarea
          value={htmlContent}
          onChange={e => setHtmlContent(e.target.value)}
          placeholder={`<p>親愛的訂閱者，</p>\n<p>這個月我們想和你分享...</p>\n<p>— 夏至原點 Juno & Morgan</p>`}
          rows={16}
          style={{
            width: '100%',
            padding: '1rem',
            border: '1.5px solid #D4CCC9',
            borderRadius: 8,
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            lineHeight: 1.6,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Preview box */}
      {htmlContent && (
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, color: '#3B2D2A', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            📄 內容預覽
          </label>
          <div
            style={{
              padding: '1.5rem',
              border: '1.5px solid #D4CCC9',
              borderRadius: 8,
              background: '#FAFAF9',
              lineHeight: 1.8,
              color: '#3B2D2A',
              maxHeight: 300,
              overflowY: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={status.type === 'loading'}
        style={{
          width: '100%',
          padding: '1rem',
          background: status.type === 'loading' ? '#9CA3AF' : '#3B2D2A',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          cursor: status.type === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {status.type === 'loading' ? '⏳ 發送中...' : `📤 發送給 ${subscriberCount ?? '...'} 位訂閱者`}
      </button>

      <p style={{ marginTop: '1rem', color: '#8A7A77', fontSize: '0.8rem', textAlign: 'center' }}>
        每封信都會包含個人化的退訂連結，符合電子報發送規範。
      </p>
    </div>
  );
}
