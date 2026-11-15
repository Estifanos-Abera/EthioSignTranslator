import { PracticeBrowser } from "@/components/practice/PracticeBrowser";

export const metadata = { title: "Practice — EthioSignTranslate" };

export default function PracticePage() {
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
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#B33925",
              marginBottom: 12,
            }}>Learning resources</p>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 500,
              color: "#1E2229",
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}>Practice the signs.</h1>
            <p style={{ fontSize: 16, color: "#6B5E52", maxWidth: 480 }}>
              Learn each of the 15 signs before using the translator.
              Select a word to see the hand shape and motion.
            </p>
          </div>
        </div>

        <PracticeBrowser />
      </div>
    </div>
  );
}
