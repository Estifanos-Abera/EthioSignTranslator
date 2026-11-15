"use client";

import { useEffect, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function WhySection() {
  const reveal = useScrollReveal();
  const staggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = staggerRef.current;
    if (!container) return;
    const children = container.querySelectorAll<HTMLElement>(".stagger-child");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach(child => {
            child.style.opacity = "1";
            child.style.transform = "translateY(0)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={reveal as React.RefObject<HTMLElement>} style={{
      backgroundColor: "#F2EDE4",
      padding: "64px 24px 96px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "start",
        }}>
          {/* Left */}
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#B33925",
              marginBottom: 20,
            }}>
              Why EthioSignTranslate
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(36px, 4vw, 54px)",
              fontWeight: 500,
              lineHeight: 1.12,
              color: "#1E2229",
              letterSpacing: "-0.02em",
              marginBottom: 32,
            }}>
              Built for the{" "}
              <span className="amh-badge" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "0.9em" }}>Deaf</span>
              {" "}community,{" "}
              <br />by one person who saw the gap.
            </h2>
            <div className="tilet-divider" style={{ marginBottom: 32 }} />
            <p style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "#6B5E52",
              marginBottom: 20,
            }}>
              Ethiopian Sign Language is one of the most underserved languages
              in machine learning research. Datasets are small, access is
              restricted, and the tools that exist were not built with the
              Ethiopian Deaf community in mind.
            </p>
            <p style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "#6B5E52",
            }}>
              EthioSignTranslate is built by Estifanos, a single developer,
              as an open-source project designed to be extended, cited, and
              built upon. Every decision in the pipeline is documented.
              Every file is openly licensed.
            </p>
          </div>

          {/* Right — three honest statements, no cards inside cards */}
          <div ref={staggerRef} style={{ paddingTop: 8 }}>
            {[
              {
                label: "The problem",
                text: "Deaf and hard-of-hearing people across Ethiopia rely on EthSL to communicate. Most technology was not designed to understand them.",
                transition: "opacity 0.5s 0.1s cubic-bezier(0.4,0,0.2,1), transform 0.5s 0.1s cubic-bezier(0.4,0,0.2,1)",
              },
              {
                label: "How we approached it",
                text: "Landmark-based recognition using MediaPipe and a GRU neural network. No raw video is stored or transmitted. Everything runs locally in the browser.",
                transition: "opacity 0.5s 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.5s 0.25s cubic-bezier(0.4,0,0.2,1)",
              },
              {
                label: "The goal",
                text: "A working, reusable, citeable system that the research community and future developers can extend. Not a demo that disappears after a hackathon.",
                transition: "opacity 0.5s 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.5s 0.4s cubic-bezier(0.4,0,0.2,1)",
              },
            ].map(({ label, text, transition }, i) => (
              <div key={i} className="stagger-child" style={{
                opacity: 0,
                transform: "translateY(24px)",
                transition,
                paddingBottom: 32,
                marginBottom: 32,
                borderBottom: i < 2 ? "1px solid #D4C4B0" : "none",
              }}>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#B33925",
                  marginBottom: 10,
                }}>
                  {label}
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.65, color: "#1E2229" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
