import { ImageResponse } from "next/og";

/**
 * Favicon (32×32). The "r." monogram in the brand's editorial blue dot
 * pattern — the same mark used in the nav wordmark, just compressed.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1D1D1F",
          color: "#F5F5F7",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 6,
        }}
      >
        r<span style={{ color: "#3B82F6" }}>.</span>
      </div>
    ),
    { ...size },
  );
}
