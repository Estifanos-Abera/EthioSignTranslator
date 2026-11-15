"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ForCommunity() {
  const reveal = useScrollReveal();

  return (
    <section ref={reveal as React.RefObject<HTMLElement>} style={{
      backgroundColor: "#1E2229",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Tilet pattern dark */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent, transparent 22px,
          rgba(229,169,60,0.05) 22px, rgba(229,169,60,0.05) 23px
        )`,
      }} />

      {/* Top Tilet transition border on dark background */}
      <div style={{ backgroundColor: "#1E2229", position: "relative", zIndex: 1 }}>
        <svg width="100%" height="28" style={{ display: "block" }}>
          <defs>
            <pattern id="tilet-t2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" fill="none"/>
              <g transform="translate(14,14)">
                <rect x="-11" y="-11" width="22" height="22"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22"/>
                <rect x="-5" y="-5" width="10" height="10"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22"/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="28" fill="url(#tilet-t2)"/>
        </svg>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}>
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(229,169,60,0.5)",
              marginBottom: 20,
            }}>
              For the community
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 4vw, 50px)",
              fontWeight: 500,
              lineHeight: 1.12,
              color: "#F2EDE4",
              letterSpacing: "-0.02em",
              marginBottom: 28,
            }}>
              A tool that aims to work for the people who need it.
            </h2>
            <div className="tilet-divider-dark" style={{ marginBottom: 28 }} />
            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(242,237,228,0.55)",
              marginBottom: 16,
            }}>
              The Deaf and hard-of-hearing community in Ethiopia navigates a world
              where most technology was designed without them in mind.
              EthioSignTranslate is a step toward closing that gap.
            </p>
            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(242,237,228,0.55)",
            }}>
              It runs in any modern browser, requires no account, and will continue to grow as more people contribute signs.
            </p>
          </div>

          {/* Right — language sample */}
          <div style={{
            backgroundColor: "#141820",
            borderRadius: 12,
            border: "1px solid rgba(229,169,60,0.12)",
            padding: "40px 36px",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(229,169,60,0.4)",
              marginBottom: 28,
            }}>
              Sentence builder example
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{
                fontFamily: "var(--font-ethiopic)",
                fontSize: 28,
                fontWeight: 600,
                color: "#E5A93C",
                margin: 0,
              }}>
                ይቅርታ፣ እኔ ውሃ እፈልጋለሁ።
              </p>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "rgba(242,237,228,0.55)",
                margin: 0,
              }}>
                Yikrta, ene wiha efelgalehu.
              </p>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "rgba(242,237,228,0.5)",
                margin: 0,
              }}>
                Uses yikrta, ene, wiha, and felig.
              </p>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "rgba(242,237,228,0.35)",
                margin: 0,
              }}>
                The translator shows the signed words: <span style={{ fontFamily: "var(--font-ethiopic)" }}>ይቅርታ እኔ ውሃ ፈልግ</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tilet transition border on dark background */}
      <div style={{ backgroundColor: "#1E2229", position: "relative", zIndex: 1 }}>
        <svg width="100%" height="28" style={{ display: "block" }}>
          <defs>
            <pattern id="tilet-t3" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" fill="none"/>
              <g transform="translate(14,14)">
                <rect x="-11" y="-11" width="22" height="22"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22"/>
                <rect x="-5" y="-5" width="10" height="10"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22"/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="28" fill="url(#tilet-t3)"/>
        </svg>
      </div>
    </section>
  );
}
