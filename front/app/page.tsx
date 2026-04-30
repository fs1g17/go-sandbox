"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function Home() {
  const router = useRouter();
  const [sessions, setSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchSessions() {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();
      setSessions(data.session_ids ?? []);
    } catch {
      setError("Failed to reach backend.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(id: string) {
    try {
      await fetch(`${API_BASE}/session`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: id }),
      });
      await fetchSessions();
    } catch {
      setError("Failed to delete session.");
    }
  }

  async function createSession() {
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/new-session`);
      const data = await res.json();
      router.push(`/session?session_id=${data.session_id}`);
    } catch {
      setError("Failed to create session.");
      setCreating(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .sessions-root {
          min-height: 100vh;
          background: #080808;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(251,191,36,0.04) 0%, transparent 50%),
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 100% 100%, 40px 40px, 40px 40px;
          font-family: 'JetBrains Mono', monospace;
          color: #e8e8e8;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sessions-inner {
          width: 100%;
          max-width: 680px;
        }

        .header {
          margin-bottom: 3rem;
        }

        .eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #f59e0b;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 1px;
          background: #f59e0b;
        }

        .heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f5f5f5;
          line-height: 1;
          margin: 0 0 0.5rem 0;
        }

        .subheading {
          font-size: 0.75rem;
          color: #555;
          letter-spacing: 0.05em;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .count-badge {
          font-size: 0.7rem;
          color: #555;
          letter-spacing: 0.1em;
        }

        .count-badge span {
          color: #f59e0b;
          font-weight: 500;
        }

        .new-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f59e0b;
          color: #0a0a0a;
          border: none;
          padding: 0.5rem 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }

        .new-btn:hover:not(:disabled) {
          background: #fbbf24;
          transform: translateY(-1px);
        }

        .new-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .new-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .new-btn .spinner {
          width: 10px;
          height: 10px;
          border: 1.5px solid rgba(0,0,0,0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .session-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .session-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-left: 2px solid transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          text-decoration: none;
          color: inherit;
          animation: rowIn 0.3s ease both;
        }

        @keyframes rowIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .session-row:hover {
          background: rgba(245,158,11,0.05);
          border-left-color: #f59e0b;
          transform: translateX(2px);
        }

        .session-index {
          font-size: 0.6rem;
          color: #333;
          width: 20px;
          text-align: right;
          flex-shrink: 0;
          user-select: none;
        }

        .session-id {
          font-size: 0.8rem;
          color: #aaa;
          letter-spacing: 0.03em;
          flex: 1;
        }

        .session-id .prefix {
          color: #f59e0b;
          opacity: 0.7;
        }

        .session-arrow {
          font-size: 0.7rem;
          color: #333;
          transition: color 0.15s, transform 0.15s;
        }

        .session-row:hover .session-arrow {
          color: #f59e0b;
          transform: translateX(3px);
        }

        .session-delete {
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: #555;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity 0.15s, color 0.15s, background 0.15s;
          flex-shrink: 0;
        }

        .session-row:hover .session-delete {
          opacity: 1;
        }

        .session-delete:hover {
          color: #f87171;
          background: rgba(239, 68, 68, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #333;
        }

        .empty-state .glyph {
          font-size: 2rem;
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .empty-state p {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: #444;
        }

        .error-state {
          padding: 1rem;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          font-size: 0.75rem;
          color: #f87171;
          letter-spacing: 0.05em;
        }

        .skeleton-row {
          height: 46px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          animation: pulse 1.2s ease-in-out infinite;
        }

        .skeleton-row:nth-child(2) { animation-delay: 0.1s; opacity: 0.7; }
        .skeleton-row:nth-child(3) { animation-delay: 0.2s; opacity: 0.5; }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .footer-line {
          margin-top: 3rem;
          font-size: 0.6rem;
          color: #2a2a2a;
          letter-spacing: 0.15em;
          text-align: center;
        }
      `}</style>

      <div className="sessions-root">
        <div className="sessions-inner">
          <header className="header">
            <div className="eyebrow">go sandbox</div>
            <h1 className="heading">Sessions</h1>
            <p className="subheading">select a session to open the editor</p>
          </header>

          <div className="toolbar">
            <div className="count-badge">
              {loading ? "loading..." : <><span>{sessions.length}</span> session{sessions.length !== 1 ? "s" : ""}</>}
            </div>
            <button className="new-btn" onClick={createSession} disabled={creating}>
              {creating ? <span className="spinner" /> : "+"} new session
            </button>
          </div>

          {error && <div className="error-state">! {error}</div>}

          {loading ? (
            <div className="session-list">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <div className="glyph">▭</div>
              <p>no sessions yet — create one to start</p>
            </div>
          ) : (
            <div className="session-list">
              {sessions.map((id, i) => (
                <div
                  key={id}
                  className="session-row"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="session-index">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className="session-id"
                    style={{ cursor: "pointer", flex: 1 }}
                    onClick={() => router.push(`/session?session_id=${id}`)}
                  >
                    <span className="prefix">{id.slice(0, 8)}</span>
                    {id.slice(8)}
                  </span>
                  <span
                    className="session-arrow"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/session?session_id=${id}`)}
                  >→</span>
                  <button
                    className="session-delete"
                    disabled={deletingId === id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(id);
                    }}
                    aria-label={`Delete session ${id}`}
                  >
                    {deletingId === id ? (
                      <span className="spinner" style={{ width: 8, height: 8, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.15)", borderTopColor: "#f87171" }} />
                    ) : (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 1.5l6 6M7.5 1.5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="footer-line">// go-sandbox · {new Date().getFullYear()}</div>
        </div>
      </div>

      <Dialog open={confirmDeleteId !== null} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete session</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete session{" "}
            <span className="font-mono text-foreground">{confirmDeleteId?.slice(0, 8)}…</span>?
            This will permanently remove all files.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deletingId === confirmDeleteId}
              onClick={() => {
                if (!confirmDeleteId) return;
                const id = confirmDeleteId;
                setConfirmDeleteId(null);
                setDeletingId(id);
                deleteSession(id).finally(() => setDeletingId(null));
              }}
            >
              {deletingId === confirmDeleteId ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
