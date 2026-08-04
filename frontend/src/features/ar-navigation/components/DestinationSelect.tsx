import type { Waypoint } from "../types";

interface DestinationSelectProps {
  waypoints: Waypoint[];
  onSelect: (destinationId: string) => void;
}

export function DestinationSelect({ waypoints, onSelect }: DestinationSelectProps) {
  const options = waypoints.filter((w) => w.isDestinationOption);

  return (
    <div className="dest-select-backdrop">
      <div className="dest-select-card">
        <h2 className="dest-select-title">Where would you like to go?</h2>
        <div className="dest-select-list">
          {options.map((wp) => (
            <button key={wp.id} className="dest-select-item" onClick={() => onSelect(wp.id)}>
              {wp.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .dest-select-backdrop {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(ellipse at top, #1c1c1e 0%, #0a0a0b 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
        }
        .dest-select-card {
          width: 100%;
          max-width: 380px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .dest-select-title {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px;
          text-align: center;
        }
        .dest-select-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .dest-select-item {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #fff;
          text-align: left;
          font-size: 15px;
        }
        .dest-select-item:active {
          background: rgba(255,255,255,0.12);
        }
      `}</style>
    </div>
  );
}
