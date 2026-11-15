export const metadata = { title: "Contribute — EthioSignTranslate" };

export default function ContributePage() {
  return (
    <div style={{
      animation: "pageEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
    }}>
      <div style={{ backgroundColor: "#F2EDE4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#EDE6D9",
        borderBottom: "1px solid #D4C4B0",
        padding: "48px 24px 40px",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#B33925", marginBottom: 12,
          }}>Contribute data</p>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 500, color: "#1E2229",
            letterSpacing: "-0.02em", marginBottom: 12,
          }}>Help the model learn more signs.</h1>
          <p style={{ fontSize: 16, color: "#6B5E52", maxWidth: 520 }}>
            The dataset currently covers 15 signs from 2 signers.
            The more people who contribute recordings, the more robust and generalizable the system becomes.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px" }}>

        {/* How to contribute */}
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: 32, fontWeight: 500,
          color: "#1E2229", letterSpacing: "-0.015em",
          marginBottom: 24,
        }}>How to contribute</h2>
        <div className="tilet-divider" style={{ marginBottom: 32 }} />

        {[
          {
            step: "01",
            title: "Clone the repository",
            body: "The full data collection pipeline lives in the repo. You need Python 3.13, a webcam, and about 30 minutes.",
            code: "git clone https://github.com/Estifanos-Abera/EthioSignTranslator\ncd EthioSignTranslator\npython -m venv .venv && .venv\\Scripts\\activate\npip install -r training/requirements.txt",
          },
          {
            step: "02",
            title: "Read the data collection protocol",
            body: "Before recording anything, read documents/project_docs/data_collection_protocol.md. It covers camera setup, lighting, distance, timing, and what makes a good rep.",
            code: null,
          },
          {
            step: "03",
            title: "Run the collection tool",
            body: "The script will assign you a signer ID and walk you through recording 18 reps of each sign. A countdown and live skeleton overlay confirm it is tracking your hand.",
            code: "python training/collect_data.py",
          },
          {
            step: "04",
            title: "Submit a pull request",
            body: "Push your data folder (data/raw/your-signer-id/) to a new branch and open a pull request. Include your session environment in the PR description: camera type, lighting conditions, room background.",
            code: null,
          },
        ].map(({ step, title, body, code }, i) => (
          <div key={i} style={{
            marginBottom: 40,
            paddingBottom: 40,
            borderBottom: i < 3 ? "1px solid #D4C4B0" : "none",
          }}>
            <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 22,
                color: "#D4C4B0",
                minWidth: 32,
              }}>{step}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 18, fontWeight: 600,
                  color: "#1E2229", marginBottom: 10,
                }}>{title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#6B5E52", marginBottom: code ? 16 : 0 }}>
                  {body}
                </p>
                {code && (
                  <div style={{
                    backgroundColor: "#1E2229",
                    borderRadius: 8,
                    padding: "16px 18px",
                    overflow: "auto",
                  }}>
                    <pre style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#E5A93C",
                      margin: 0,
                    }}>{code}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Future note */}
        <div style={{
          backgroundColor: "#EDE6D9",
          border: "1px solid #D4C4B0",
          borderRadius: 10,
          padding: "28px 28px",
        }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#B33925",
            marginBottom: 10,
          }}>Upcoming</p>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "#1E2229" }}>
            A browser-based recording tool is in development. It will allow anyone to contribute
            signs directly from this page without needing to clone the repository or install
            Python. Expected in a future release.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}