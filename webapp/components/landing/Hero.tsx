"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

/* Hand skeleton drawn on a dark canvas — animated, glowing nodes */
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

// Static ሰላም hand shape (open palm, slightly spread fingers)
const HAND_PTS: [number, number, number][] = [
  [0, 0, 0],
  [-0.14, -0.22, 0.05], [-0.19, -0.42, 0.08], [-0.22, -0.57, 0.09], [-0.23, -0.68, 0.1],
  [-0.04, -0.52, 0.02], [-0.03, -0.72, 0.03], [-0.02, -0.85, 0.04], [-0.01, -0.95, 0.04],
  [0.05, -0.53, 0.01], [0.07, -0.76, 0.02], [0.08, -0.9, 0.02], [0.09, -1.0, 0.02],
  [0.13, -0.5, 0.01], [0.16, -0.70, 0.02], [0.17, -0.82, 0.02], [0.18, -0.91, 0.02],
  [0.21, -0.43, 0.02], [0.24, -0.59, 0.03], [0.26, -0.69, 0.03], [0.27, -0.77, 0.03],
];

function drawHand(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, scale: number,
  phase: number
) {
  const pts = HAND_PTS.map(([x, y, z]) => ({
    x: cx + x * scale + Math.sin(phase + x * 3) * 2,
    y: cy + y * scale + Math.cos(phase + y * 2) * 1.5,
    z,
  }));

  // Bones
  for (const [a, b] of CONNECTIONS) {
    const alpha = 0.25 + 0.35 * ((pts[a].z + pts[b].z) / 2 + 0.05);
    ctx.strokeStyle = `rgba(229,169,60,${alpha})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(pts[a].x, pts[a].y);
    ctx.lineTo(pts[b].x, pts[b].y);
    ctx.stroke();
  }

  // Nodes
  for (let i = 0; i < pts.length; i++) {
    const depth = 0.3 + 0.7 * (pts[i].z + 0.1);
    const r = i === 0 ? 5 : 3.2;
    ctx.shadowColor = "#E5A93C";
    ctx.shadowBlur = 10 * depth;
    ctx.fillStyle = `rgba(229,169,60,${depth})`;
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, r * depth, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    let start = 0;

    const frame = (t: number) => {
      if (!start) start = t;
      const elapsed = (t - start) / 1000;

      ctx.clearRect(0, 0, W, H);

      // Dark bg with subtle radial warmth
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.6, 0, W * 0.5, H * 0.6, W * 0.7);
      grad.addColorStop(0, "rgba(30,22,8,0.6)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = "#100E0B";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Faint Tilet-inspired background pattern
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = "#E5A93C";
      ctx.lineWidth = 0.8;
      for (let x = 0; x < W; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();

      // Skeleton hand — centered
      drawHand(ctx, W * 0.5, H * 0.58, H * 0.38, elapsed * 0.4);

      // Translation output at bottom
      const label = "ሰላም";
      const gloss = "Hello · selam";
      ctx.font = `bold 28px 'Noto Sans Ethiopic', sans-serif`;
      ctx.textAlign = "center";
      ctx.shadowColor = "#E5A93C";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#E5A93C";
      ctx.fillText(label, W / 2, H * 0.88);
      ctx.shadowBlur = 0;
      ctx.font = `12px 'JetBrains Mono', monospace`;
      ctx.fillStyle = "rgba(242,237,228,0.4)";
      ctx.fillText(gloss, W / 2, H * 0.93);

      // Tracking label
      ctx.textAlign = "left";
      ctx.font = `10px 'JetBrains Mono', monospace`;
      ctx.fillStyle = "rgba(229,169,60,0.45)";
      ctx.fillText("● TRACKING ACTIVE", 14, 18);
      ctx.fillStyle = "rgba(242,237,228,0.25)";
      ctx.fillText("NODES 21/21", 14, H - 24);
      ctx.fillText("CONF 0.97", 14, H - 10);

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section style={{
      backgroundColor: "#1E2229",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "80px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Tilet pattern in background — very faint */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent, transparent 23px,
          rgba(229,169,60,0.04) 23px, rgba(229,169,60,0.04) 24px
        )`,
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 64,
          alignItems: "center",
        }}>

          {/* LEFT — text */}
          <div>
            {/* Eyebrow — plain, no pill */}
            <p className="anim-fade-up" style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(229,169,60,0.6)",
              marginBottom: 28,
            }}>
              Ethiopian Sign Language Recognition
            </p>

            {/* Headline */}
            <h1 className="anim-fade-up anim-delay-1" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(52px, 7vw, 88px)",
              fontWeight: 500,
              lineHeight: 1.05,
              color: "#F2EDE4",
              marginBottom: 32,
              letterSpacing: "-0.02em",
            }}>
              Every Sign{" "}
              {/* Flip card — hovers to ተረድተን */}
              <span className="flip-card" title="Hover to translate">
                <span className="flip-card-inner">
                  <span className="flip-front" style={{ color: "#F2EDE4" }}>
                    <span style={{
                      borderBottom: "2px solid rgba(229,169,60,0.6)",
                      paddingBottom: "2px",
                    }}>
                      Understood
                    </span>
                  </span>
                  <span className="flip-back">
                    <span className="amh-badge" style={{ fontSize: "0.78em" }}>
                      ተረድተን
                    </span>
                  </span>
                </span>
              </span>
            </h1>

            {/* Sub */}
            <p className="anim-fade-up anim-delay-2" style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.65,
              color: "rgba(242,237,228,0.55)",
              maxWidth: 520,
              marginBottom: 48,
              fontWeight: 400,
            }}>
              No one in Ethiopia should be left out of a conversation because of how they communicate.
              EthioSignTranslate translates Ethiopian Sign Language into spoken and written words,
              in real time, entirely in your browser.
            </p>

            {/* CTAs */}
            <div className="anim-fade-up anim-delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href="/translate" style={{
                display: "inline-block",
                backgroundColor: "#E5A93C",
                color: "#100E0B",
                fontWeight: 600,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 8,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                transition: "background 0.15s",
              }}>
                Open Translator
              </Link>
              <Link href="/about" style={{
                display: "inline-block",
                color: "rgba(242,237,228,0.6)",
                fontWeight: 500,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 8,
                textDecoration: "none",
                border: "1px solid rgba(242,237,228,0.15)",
                transition: "border-color 0.15s",
              }}>
                Our mission
              </Link>
            </div>
          </div>

          {/* RIGHT — dark camera panel */}
          <div className="anim-fade-in anim-delay-2" style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(229,169,60,0.18)",
            boxShadow: "0 0 60px rgba(229,169,60,0.07), 0 32px 64px rgba(0,0,0,0.6)",
          }}>
            {/* Panel header */}
            <div style={{
              backgroundColor: "#1A1510",
              borderBottom: "1px solid rgba(229,169,60,0.12)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#3D2020", "#3D3220", "#1A3D2A"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
                ))}
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(229,169,60,0.35)",
                letterSpacing: "0.08em",
              }}>
                live preview
              </span>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={420}
              height={460}
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>

      {/* Tilet border at the top */}
      <svg
        width="100%"
        height="28"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "block",
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id="tilet-hero-top"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="14,0 28,14 14,28 0,14"
              fill="none"
              stroke="#E5A93C"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <polygon
              points="14,8.4 19.6,14 14,19.6 8.4,14"
              fill="none"
              stroke="#E5A93C"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="28" fill="url(#tilet-hero-top)" />
      </svg>

      {/* Tilet border on the left */}
      <svg
        width="28"
        height="calc(100% - 56px)"
        style={{
          position: "absolute",
          top: 28,
          bottom: 28,
          left: 0,
          width: 28,
          display: "block",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <defs>
          <pattern
            id="tilet-hero-left"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="14,0 28,14 14,28 0,14"
              fill="none"
              stroke="#E5A93C"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <polygon
              points="14,8.4 19.6,14 14,19.6 8.4,14"
              fill="none"
              stroke="#E5A93C"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="28" height="100%" fill="url(#tilet-hero-left)" />
      </svg>

      {/* Tilet border on the right */}
      <svg
        width="28"
        height="calc(100% - 56px)"
        style={{
          position: "absolute",
          top: 28,
          bottom: 28,
          right: 0,
          width: 28,
          display: "block",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <defs>
          <pattern
            id="tilet-hero-right"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="14,0 28,14 14,28 0,14"
              fill="none"
              stroke="#E5A93C"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <polygon
              points="14,8.4 19.6,14 14,19.6 8.4,14"
              fill="none"
              stroke="#E5A93C"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="28" height="100%" fill="url(#tilet-hero-right)" />
      </svg>

      {/* Tilet border at the bottom */}
      <svg
        width="100%"
        height="28"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          display: "block",
          backgroundColor: "#1E2229",
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id="tilet-t1"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <rect width="28" height="28" fill="none" />
            <g transform="translate(14,14)">
              <rect
                x="-11"
                y="-11"
                width="22"
                height="22"
                transform="rotate(45)"
                fill="none"
                stroke="#E5A93C"
                strokeWidth="1"
                opacity="0.22"
              />
              <rect
                x="-5"
                y="-5"
                width="10"
                height="10"
                transform="rotate(45)"
                fill="none"
                stroke="#E5A93C"
                strokeWidth="1"
                opacity="0.22"
              />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="28" fill="url(#tilet-t1)" />
      </svg>
    </section>
  );
}
