import { ImageResponse } from "next/og";

/**
 * Open Graph image (1200×630). Rendered at build time per the Next.js
 * file-based convention — sits at the route root so it's the default OG
 * image for every page, unless a child route exports its own.
 *
 * Design follows the Apple-light brand:
 *  - Canvas: #F5F5F7
 *  - Ink:    #1D1D1F
 *  - Accent: editorial blue #3B82F6 used as a single chromatic moment
 *  - Type:   stacked headline ("Four resumes." / "One application.")
 *    with sub-line and a small score-badge motif lifted from the product
 *    so the share preview reads as the product, not a brochure.
 */

export const alt = "resume.ai — Four resumes. One application.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#F5F5F7",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Top row — wordmark + score-badge motif from the product */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#1D1D1F",
              display: "flex",
              alignItems: "center",
            }}
          >
            resume<span style={{ color: "#3B82F6" }}>.</span>ai
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "#16A34A",
              borderRadius: 999,
              color: "#fff",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            ATS 91
          </div>
        </div>

        {/* Headline — display type, two lines stacked Apple-style */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 124,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#1D1D1F",
              display: "flex",
            }}
          >
            Four resumes.
          </div>
          <div
            style={{
              fontSize: 124,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#86868B",
              display: "flex",
            }}
          >
            One application.
          </div>
        </div>

        {/* Bottom row — sub-line + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#6E6E73",
              lineHeight: 1.4,
              maxWidth: 720,
              display: "flex",
            }}
          >
            One job. Four angles. Thirty seconds — pick the one that lands.
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#86868B",
              fontWeight: 500,
              display: "flex",
            }}
          >
            resume.ai
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
