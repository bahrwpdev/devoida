import React from "react";
import { inter } from "../tokens";

/** iOS status bar (47 logical px high). Drawn over the app frames. */
export const StatusBar: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      height: 47,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "0 28px 6px",
      boxSizing: "border-box",
    }}
  >
    <div style={inter(15, 600, -0.2, color)}>9:41</div>
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <svg width="17" height="11" viewBox="0 0 17 11">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 4.5} y={8 - i * 2.6} width="3" height={3 + i * 2.6} rx="0.8" fill={color} />
        ))}
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12">
        <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke={color} opacity="0.4" />
        <rect x="2" y="2" width="18" height="8" rx="2" fill={color} />
        <rect x="22.5" y="4" width="1.8" height="4" rx="0.9" fill={color} opacity="0.4" />
      </svg>
    </div>
  </div>
);
