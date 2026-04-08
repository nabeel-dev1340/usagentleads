import { ImageResponse } from "next/og"

export const alt = "USAgentLeads — Real Estate Agent Contact Database"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#1D4ED8",
          }}
        />

        {/* Icon + Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 64 64"
            fill="none"
          >
            <path
              d="M32 2C19.85 2 10 11.85 10 24c0 16.5 22 38 22 38s22-21.5 22-38C54 11.85 44.15 2 32 2z"
              fill="#1D4ED8"
            />
            <circle cx="32" cy="19" r="6" fill="white" />
            <path
              d="M24 33c0-4.42 3.58-8 8-8s8 3.58 8 8"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 700, letterSpacing: -1 }}>
            <span style={{ color: "#FFFFFF" }}>USAgent</span>
            <span style={{ color: "#60A5FA" }}>Leads</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#94A3B8",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 48,
          }}
        >
          Verified US Real Estate Agent Contacts
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Name, Email & Phone", "All 50 States", "CSV Download", "From $49"].map(
            (text) => (
              <div
                key={text}
                style={{
                  background: "rgba(29, 78, 216, 0.15)",
                  border: "1px solid rgba(29, 78, 216, 0.3)",
                  borderRadius: 100,
                  padding: "12px 28px",
                  fontSize: 18,
                  color: "#93C5FD",
                  fontWeight: 500,
                }}
              >
                {text}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#475569",
            fontWeight: 500,
          }}
        >
          usagentleads.com
        </div>
      </div>
    ),
    { ...size }
  )
}
