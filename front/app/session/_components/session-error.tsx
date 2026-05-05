export default function SessionError({ message }: { message: string }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .session-error-root {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 40px 40px;
          font-family: 'JetBrains Mono', monospace;
        }
        .session-error-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          animation: fadeUp 0.4s ease both;
        }
        .session-error-icon {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }
        .session-error-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          text-align: center;
        }
        .session-error-title {
          font-size: 0.8rem;
          font-weight: 500;
          color: #d4d4d4;
          letter-spacing: 0.02em;
        }
        .session-error-message {
          font-size: 0.65rem;
          color: #444;
          letter-spacing: 0.08em;
          max-width: 280px;
          line-height: 1.6;
        }
        .session-error-back {
          font-size: 0.65rem;
          color: #3a3a3a;
          letter-spacing: 0.12em;
          text-decoration: none;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: color 0.15s;
          border-bottom: 1px solid transparent;
          padding-bottom: 1px;
        }
        .session-error-back:hover {
          color: #f59e0b;
          border-bottom-color: rgba(245,158,11,0.3);
        }
        .session-error-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.06);
        }
      `}</style>
      <div className="session-error-root">
        <div className="session-error-card">
          <div className="session-error-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2.5v5M7 9.5v.5"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="session-error-body">
            <p className="session-error-title">session error</p>
            <p className="session-error-message">{message}</p>
          </div>

          <div className="session-error-divider" />

          <a href="/" className="session-error-back">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M6 2L3 5l3 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            back to sessions
          </a>
        </div>
      </div>
    </>
  );
}
