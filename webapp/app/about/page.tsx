import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = { title: "About — EthioSignTranslate" };

export default function AboutPage() {
  return (
    <div style={{
      animation: "pageEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
    }}>
      <div style={{ backgroundColor: "#F2EDE4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#1E2229",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top Tilet transition border on dark background */}
        <div style={{ backgroundColor: "#1E2229", position: "relative", zIndex: 1 }}>
          <svg width="100%" height="28" style={{ display: "block" }}>
            <defs>
              <pattern id="tilet-t5" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="28" fill="url(#tilet-t5)"/>
          </svg>
        </div>

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `repeating-linear-gradient(
            90deg, transparent, transparent 22px,
            rgba(229,169,60,0.04) 22px, rgba(229,169,60,0.04) 23px
          )`,
        }} />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 56px", position: "relative", zIndex: 1 }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(229,169,60,0.5)", marginBottom: 16,
          }}>About the project</p>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(36px, 5vw, 62px)",
            fontWeight: 500, color: "#F2EDE4",
            letterSpacing: "-0.02em", lineHeight: 1.08,
            marginBottom: 20,
          }}>
            A working foundation for Ethiopian Sign Language recognition.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(242,237,228,0.5)", maxWidth: 560 }}>
            EthioSignTranslate is an open-source Ethiopian Sign Language recognition system,
            built to be reused, extended, and built upon by the research community and
            developers across Ethiopia and beyond.
          </p>
        </div>

        {/* Bottom Tilet transition border on dark background */}
        <div style={{ backgroundColor: "#1E2229", position: "relative", zIndex: 1 }}>
          <svg width="100%" height="28" style={{ display: "block" }}>
            <defs>
              <pattern id="tilet-t6" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="28" fill="url(#tilet-t6)"/>
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Mission */}
        <section style={{ paddingBottom: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34, fontWeight: 500,
            color: "#1E2229", letterSpacing: "-0.015em",
            marginBottom: 20,
          }}>The mission</h2>
          <div className="tilet-divider" style={{ marginBottom: 28 }} />
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#6B5E52", marginBottom: 16 }}>
            Deaf and hard-of-hearing people across Ethiopia rely on Ethiopian Sign
            Language to communicate. EthSL is one of the most underserved languages in
            machine learning research. Existing datasets are small, hard to access, and
            often not openly licensed. The tools that do exist were not designed with the
            Ethiopian Deaf community as the primary user.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#6B5E52", marginBottom: 16 }}>
            This project does not claim to solve that. It is a working, documented, open
            system that makes one part of the problem easier to build on. Every file is
            openly licensed. Every decision is documented. Every result is reproducible.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#6B5E52" }}>
            The goal is not a finished product. It is a foundation.
          </p>
        </section>

        <div style={{
          height: 1,
          background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
          margin: "0",
        }} />

        {/* The builder */}
        <section style={{ paddingTop: 56, paddingBottom: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34, fontWeight: 500,
            color: "#1E2229", letterSpacing: "-0.015em",
            marginBottom: 20,
          }}>Who built this</h2>
          <div className="tilet-divider" style={{ marginBottom: 28 }} />
          <div style={{
            backgroundColor: "#1E2229",
            borderRadius: 12,
            padding: "32px 32px",
          }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontStyle: "italic",
              color: "#F2EDE4",
              lineHeight: 1.6,
              marginBottom: 20,
            }}>
              "This project started with no data and no one to record it. Two signers have contributed so far, and more recordings are needed. This is the first version, and there is much more to build."
            </p>
            <div className="tilet-divider-dark" style={{ marginBottom: 20 }} />
            <p style={{ fontSize: 15, color: "rgba(242,237,228,0.5)" }}>
              Estifanos, solo developer. Addis Ababa, Ethiopia. 2026.
            </p>
          </div>
        </section>

        <div style={{
          height: 1,
          background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
          margin: "0",
        }} />

        {/* Technical overview */}
        <section style={{ paddingTop: 56, paddingBottom: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34, fontWeight: 500,
            color: "#1E2229", letterSpacing: "-0.015em",
            marginBottom: 20,
          }}>Technical overview</h2>
          <div className="tilet-divider" style={{ marginBottom: 28 }} />
          {[
            {
              label: "Data collection",
              text: "Hand landmark sequences recorded using MediaPipe HandLandmarker (Tasks API) on a standard laptop webcam. 15 signs, 2 signers, 18 reps per class per signer. Raw data stored as per-rep JSON files, lossless and unnormalized.",
            },
            {
              label: "Feature engineering",
              text: "Wrist-relative normalization, frame-to-frame velocity features, uniform resampling to 30 frames. Final input shape: (30, 252). Features are identical at collection time and inference time, implemented independently in Python and TypeScript.",
            },
            {
              label: "Model",
              text: "Two-layer GRU (64 then 32 units), Masking layer, Dropout 0.3, Adam optimizer, categorical crossentropy, early stopping on validation loss. Trained on a CPU in under five minutes. Test accuracy is 98 percent on a small held-out set, and both signers also appear in the training data.",
            },
            {
              label: "Deployment",
              text: "Model converted to TensorFlow.js format. Runs entirely client-side in the browser. No backend, no server, no data transmission. Prediction latency is approximately 30ms on a modern laptop.",
            },
          ].map(({ label, text }, i) => (
            <div key={i} style={{
              marginBottom: 28,
              paddingBottom: 28,
              borderBottom: i < 3 ? "1px solid #D4C4B0" : "none",
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 24,
            }}>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#B33925",
                paddingTop: 3,
              }}>{label}</p>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#6B5E52" }}>{text}</p>
            </div>
          ))}
        </section>

        <div style={{
          height: 1,
          background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
          margin: "0",
        }} />

        {/* Limitations */}
        <section style={{ paddingTop: 56, paddingBottom: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34, fontWeight: 500,
            color: "#1E2229", letterSpacing: "-0.015em",
            marginBottom: 20,
          }}>Limitations</h2>
          <div className="tilet-divider" style={{ marginBottom: 28 }} />
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#6B5E52", marginBottom: 16 }}>
            The current system is signer-dependent, meaning it performs best for the
            people who contributed recordings to the training dataset. It covers 15 signs,
            not the full EthSL lexicon. It does not handle continuous sentence-level
            signing, only isolated signs recognized one at a time.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#6B5E52" }}>
            Hand occlusion (one hand covering the other) causes detection gaps during
            two-handed signs. Preprocessing interpolates short gaps but cannot recover
            information that was never captured.
          </p>
        </section>

        <div style={{
          height: 1,
          background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
          margin: "0",
        }} />

        {/* License */}
        <section style={{ paddingTop: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34, fontWeight: 500,
            color: "#1E2229", letterSpacing: "-0.015em",
            marginBottom: 20,
          }}>Licensing</h2>
          <div className="tilet-divider" style={{ marginBottom: 28 }} />
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            {[
              { type: "Code", license: "MIT License", note: "Use, modify, distribute freely. Attribution appreciated." },
              { type: "Dataset", license: "CC BY 4.0", note: "Use for any purpose with attribution. Cite the dataset when publishing." },
            ].map(({ type, license, note }) => (
              <div key={type} style={{
                backgroundColor: "#EDE6D9",
                border: "1px solid #D4C4B0",
                borderRadius: 10,
                padding: "24px 24px",
              }}>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#B33925",
                  marginBottom: 8,
                }}>{type}</p>
                <p style={{ fontSize: 17, fontWeight: 600, color: "#1E2229", marginBottom: 8 }}>{license}</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B5E52" }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{
          height: 1,
          background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
          margin: "0",
        }} />

        {/* Contact */}
        <section id="contact" style={{ paddingTop: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34,
            fontWeight: 500,
            color: "#1E2229",
            marginBottom: 24,
          }}>
            Send us a message
          </h2>
          <div style={{ maxWidth: 560 }}>
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  </div>
);
}