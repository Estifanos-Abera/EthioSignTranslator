"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function EngineeringCallout() {
  const reveal = useScrollReveal();

  return (
    <section ref={reveal as React.RefObject<HTMLElement>} style={{
      backgroundColor: "#F2EDE4",
      padding: "96px 24px",
      borderTop: "none",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        {/* Code block */}
        <div style={{
          backgroundColor: "#1E2229",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(212,196,176,0.12)",
        }}>
          <div style={{
            backgroundColor: "#141820",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(212,196,176,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#3D2020","#3D3220","#1A3D2A"].map((c, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: c }} />
              ))}
            </div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "rgba(242,237,228,0.25)",
              marginLeft: 4,
            }}>
              training/preprocess.py
            </span>
          </div>
          <div style={{ padding: "24px 20px" }}>
            {[
              { color: "#6B8CAE", text: "# wrist-relative normalisation" },
              { color: "#E5A93C", text: "def wrist_relative(hand):" },
              { color: "#F2EDE4", text: "    return hand - hand[:, 0:1, :]" },
              { color: "", text: "" },
              { color: "#6B8CAE", text: "# velocity features" },
              { color: "#E5A93C", text: "def velocity(hand):" },
              { color: "#F2EDE4", text: "    v = np.zeros_like(hand)" },
              { color: "#F2EDE4", text: "    v[1:] = hand[1:] - hand[:-1]" },
              { color: "#F2EDE4", text: "    return v" },
              { color: "", text: "" },
              { color: "#6B8CAE", text: "# input shape: (30, 252)" },
            ].map((line, i) => (
              <p key={i} style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                lineHeight: 1.7,
                color: line.color || "transparent",
                margin: 0,
              }}>
                {line.text || "\u00A0"}
              </p>
            ))}
          </div>
        </div>

        {/* Text */}
        <div>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#B33925",
            marginBottom: 20,
          }}>
            The engineering
          </p>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(30px, 3.5vw, 46px)",
            fontWeight: 500,
            lineHeight: 1.15,
            color: "#1E2229",
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}>
            Every decision is documented, with every tradeoff explained.
          </h2>
          <div className="tilet-divider" style={{ marginBottom: 24 }} />
          <p style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "#6B5E52",
            marginBottom: 16,
          }}>
            The build log covers everything: why GRU over LSTM, how the
            Keras-to-TF.js conversion was handled, why handedness labels
            are inverted, and what the confusion matrix revealed about which
            signs the model gets wrong.
          </p>
          <p style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "#6B5E52",
            marginBottom: 32,
          }}>
            The documentation follows the actual build, including the errors that came up and how each one was fixed.
          </p>
          <Link href="/docs" style={{
            display: "inline-block",
            fontWeight: 600,
            fontSize: 14,
            color: "#B33925",
            textDecoration: "none",
            borderBottom: "1px solid #B33925",
            paddingBottom: 2,
          }}>
            Read the build log
          </Link>
        </div>
      </div>
    </section>
  );
}
