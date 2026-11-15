export const metadata = { title: "Research — EthioSignTranslate" };

export default function ResearchPage() {
  return (
    <div style={{
      animation: "pageEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
    }}>
      <div style={{
        backgroundColor: "#F2EDE4",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#B33925",
          marginBottom: 20,
        }}>Research portal</p>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 500,
          color: "#1E2229",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: 20,
        }}>Dataset and model access.</h1>
        <div className="tilet-divider" style={{ marginBottom: 28 }} />
        <p style={{
          fontSize: 16, lineHeight: 1.7,
          color: "#6B5E52", marginBottom: 12,
        }}>
          Once data collection and QA are complete, this page will host the full
          EthSL landmark dataset, trained model weights, evaluation results, and
          citation information for academic use.
        </p>
        <p style={{
          fontSize: 16, lineHeight: 1.7,
          color: "#6B5E52", marginBottom: 32,
        }}>
          The dataset will be versioned, documented with a full datasheet, and
          licensed under CC BY 4.0 with a citable DOI via Zenodo.
        </p>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: "#EDE6D9",
          border: "1px solid #D4C4B0",
          borderRadius: 8,
          padding: "14px 22px",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#6B5E52",
          }}>In progress. Expected after v1 deployment.</span>
        </div>
      </div>
    </div>
    </div>
  );
}