import React from "react";
import { staticFile } from "remotion";
import { inter } from "../tokens";

/**
 * The Android heads-up notification CashNest posts (the only part of the video
 * that is not the app's own rendering). Wording is the app's, from
 * SmsNotificationHelper.kt: "Payment detected, add it now?" and then
 * "Payment Saved" (the same notification is replaced when the save happens).
 */
const ink = "#112D41";

const Row: React.FC<{ title: string; body: string; action?: string }> = ({ title, body, action }) => (
  <div style={{ position: "absolute", inset: 0, padding: "10px 14px 12px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 18 }}>
      <img src={staticFile("ic_launcher_android.png")} width={14} height={14} style={{ borderRadius: 4 }} />
      <div style={inter(11.5, 500, 0.1, ink)}>CashNest</div>
      <div style={inter(11.5, 400, 0, "rgba(27,27,31,0.55)")}>· now</div>
    </div>
    <div style={{ display: "flex", marginTop: 5 }}>
      <div style={{ flex: 1, paddingRight: 8 }}>
        <div style={inter(14.5, 600, -0.1, "#1B1B1F")}>{title}</div>
        <div style={{ ...inter(13.5, 400, -0.1, "rgba(27,27,31,0.78)"), marginTop: 1 }}>{body}</div>
        {action && <div style={{ ...inter(13, 600, 0, ink), marginTop: 8 }}>{action}</div>}
      </div>
      <img src={staticFile("ic_launcher_android.png")} width={40} height={40} style={{ borderRadius: 10, alignSelf: "flex-start" }} />
    </div>
  </div>
);

/** [saved] 0 = "Payment detected", 1 = "Payment Saved". */
export const HeadsUp: React.FC<{ saved: number }> = ({ saved }) => (
  <div
    style={{
      position: "relative",
      margin: "0 8px",
      height: 108,
      borderRadius: 24,
      background: "#FFFFFF",
      boxShadow: "0 6px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}
  >
    <div style={{ opacity: 1 - saved }}>
      <Row title="Payment detected, add it now?" body="USD 6.85 at Starbucks" action="Dismiss" />
    </div>
    <div style={{ opacity: saved }}>
      <Row title="Payment Saved 👍" body="Payment of USD 6.85 at Starbucks got saved." />
    </div>
  </div>
);
