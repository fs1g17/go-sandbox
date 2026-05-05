export default function SessionLoading() {
  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bar-grow {
          0% { width: 0%; }
          40% { width: 65%; }
          70% { width: 80%; }
          90% { width: 92%; }
          100% { width: 92%; }
        }
        .loading-cursor {
          display: inline-block;
          width: 7px;
          height: 13px;
          background: #f59e0b;
          animation: blink 1s step-end infinite;
          vertical-align: middle;
          margin-left: 2px;
        }
        .loading-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          animation: bar-grow 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1e1e",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
          <div
            style={{
              width: "180px",
              height: "2px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <div className="loading-bar-fill" />
          </div>
          <span
            style={{
              fontSize: "0.7rem",
              color: "#555",
              letterSpacing: "0.12em",
              display: "flex",
              alignItems: "center",
            }}
          >
            loading session
            <span className="loading-cursor" />
          </span>
        </div>
      </div>
    </>
  );
}
