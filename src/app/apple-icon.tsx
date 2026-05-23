import { ImageResponse } from "next/og";

/**
 * Apple touch icon (180×180). Same mark as the favicon, sized for the
 * iOS home-screen tile. Apple ignores border-radius and adds its own
 * mask — we render flat-edge, system handles the rounding.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#1D1D1F",
          color: "#F5F5F7",
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        r<span style={{ color: "#3B82F6" }}>.</span>
      </div>
    ),
    { ...size },
  );
}
