import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1D4ED8",
          borderRadius: 40,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Location pin shape */}
          <path
            d="M32 2C19.85 2 10 11.85 10 24c0 16.5 22 38 22 38s22-21.5 22-38C54 11.85 44.15 2 32 2z"
            fill="white"
          />
          {/* Person silhouette - head */}
          <circle cx="32" cy="19" r="6" fill="#1D4ED8" />
          {/* Person silhouette - body */}
          <path
            d="M24 33c0-4.42 3.58-8 8-8s8 3.58 8 8"
            stroke="#1D4ED8"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
