"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const STEPS = [
  {
    number: "01",
    title: "Camera opens in your browser",
    body: "No app download. No sign-up. The translator runs entirely in your browser. Your camera feed never leaves your device.",
  },
  {
    number: "02",
    title: "MediaPipe extracts hand landmarks",
    body: "21 points per hand are tracked across 30 frames. Position and velocity are computed locally using the same pipeline used to train the model.",
  },
  {
    number: "03",
    title: "A GRU network classifies the sign",
    body: "A two-layer Gated Recurrent Unit model, trained on real EthSL recordings, runs client-side via TensorFlow.js and predicts the signed word.",
  },
  {
    number: "04",
    title: "The word appears, and can be spoken",
    body: "The predicted Amharic word is appended to the sentence strip. Press Speak and the browser reads the full sentence aloud.",
  },
];

export default function HowItWorks() {
  const reveal = useScrollReveal();

  return (
    <>
      <div style={{
        height: 1,
        background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
        margin: "0",
      }} />
      <section ref={reveal as React.RefObject<HTMLElement>} style={{
        backgroundColor: "#EDE6D9",
        padding: "96px 24px",
      }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#B33925",
            marginBottom: 16,
          }}>
            How it works
          </p>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 4vw, 50px)",
            fontWeight: 500,
            lineHeight: 1.12,
            color: "#1E2229",
            letterSpacing: "-0.02em",
            maxWidth: 560,
          }}>
            From hand to voice, nothing leaves the room.
          </h2>
        </div>

        <div className="tilet-divider" style={{ marginBottom: 64 }} />

        {/* Steps as a horizontal numbered flow */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 40,
        }}>
          {STEPS.map(({ number, title, body }, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < 3 && (
                <div style={{
                  position: "absolute",
                  top: 18,
                  right: -20,
                  width: 40,
                  height: 1,
                  backgroundColor: "#D4C4B0",
                }} />
              )}
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 28,
                fontWeight: 500,
                color: "#D4C4B0",
                marginBottom: 16,
                lineHeight: 1,
              }}>
                {number}
              </p>
              <p style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1E2229",
                marginBottom: 10,
                lineHeight: 1.3,
              }}>
                {title}
              </p>
              <p style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: "#6B5E52",
              }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
