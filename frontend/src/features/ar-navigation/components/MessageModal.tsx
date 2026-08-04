import type { ReactNode } from "react";

interface MessageModalProps {
  icon?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode; // extra content, e.g. a scanner or a button
}

export function MessageModal({ icon, title, subtitle, children }: MessageModalProps) {
  return (
    <div className="msg-modal-backdrop">
      <div className="msg-modal-card">
        {icon && <div className="msg-modal-icon">{icon}</div>}
        <h2 className="msg-modal-title">{title}</h2>
        {subtitle && <p className="msg-modal-subtitle">{subtitle}</p>}
        {children && <div className="msg-modal-content">{children}</div>}
      </div>

      <style>{`
        .msg-modal-backdrop {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(ellipse at top, #1c1c1e 0%, #0a0a0b 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
        }
        .msg-modal-card {
          width: 100%;
          max-width: 360px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .msg-modal-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
        .msg-modal-title {
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .msg-modal-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }
        .msg-modal-content {
          margin-top: 20px;
        }
        .msg-modal-button {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: #fff;
          color: #111;
          font-size: 15px;
          font-weight: 600;
        }
        .msg-modal-button:active {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
