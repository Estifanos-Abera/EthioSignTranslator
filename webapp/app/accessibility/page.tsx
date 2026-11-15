export const metadata = { title: "Accessibility — EthioSignTranslate" };

export default function AccessibilityPage() {
  return (
    <div style={{ backgroundColor: "#F2EDE4", minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 80px" }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#B33925", marginBottom: 16,
        }}>Accessibility</p>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(32px, 4vw, 50px)",
          fontWeight: 500, color: "#1E2229",
          letterSpacing: "-0.02em", marginBottom: 8,
        }}>Commitment to accessible design.</h1>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 12,
          color: "#6B5E52", marginBottom: 40,
        }}>Last updated: October 2026</p>

        <div className="tilet-divider" style={{ marginBottom: 48 }} />

        {[
          {
            title: "Our commitment",
            content: `EthioSignTranslate is built for the Deaf and hard-of-hearing community in Ethiopia. Accessibility is not a feature added after the fact. It is the reason the project exists.

We aim to meet WCAG 2.1 Level AA guidelines across the web application. Where we fall short, we want to know.`,
          },
          {
            title: "Current implementation",
            content: `The application uses semantic HTML throughout. All interactive elements are keyboard-navigable. Focus states are visible. Color contrast ratios meet or exceed WCAG AA standards for text on background.

The Amharic text displayed throughout the application uses Noto Sans Ethiopic, a font specifically designed for Ethiopic script with full Unicode coverage. This ensures correct rendering of Ge'ez characters across all platforms.

Text-to-speech output uses the browser's built-in Web Speech API. The spoken output is explicit and user-initiated, not automatic.`,
          },
          {
            title: "Known limitations",
            content: `The live translator requires a functioning webcam and a modern browser with WebGL support for TensorFlow.js. It cannot currently function via keyboard alone because it depends on real-time visual input.

Some complex animations (the hero skeleton preview) may cause discomfort for users with vestibular disorders. A reduced-motion version respecting the prefers-reduced-motion media query is planned.

Screen reader compatibility on the live translator page has not been fully tested. Landmark detection feedback is visual only at this time.`,
          },
          {
            title: "Planned improvements",
            content: `Respecting prefers-reduced-motion for all animations.

A text-only mode for the translator that reduces visual complexity.

Full screen reader testing and ARIA labeling on the live translator interface.

High-contrast mode support.`,
          },
          {
            title: "Reporting issues",
            content: `If you encounter an accessibility barrier on this application, please open an issue on the GitHub repository and label it accessibility. Describe the barrier, the assistive technology you were using, and the browser and operating system. We will respond and prioritize accordingly.`,
          },
        ].map(({ title, content }, i) => (
          <section key={i} style={{
            marginBottom: 48,
            paddingBottom: 48,
            borderBottom: i < 4 ? "1px solid #D4C4B0" : "none",
          }}>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26, fontWeight: 500,
              color: "#1E2229", letterSpacing: "-0.01em",
              marginBottom: 16,
            }}>{title}</h2>
            {content.split("\n\n").map((p, j) => (
              <p key={j} style={{
                fontSize: 15, lineHeight: 1.75,
                color: "#6B5E52", marginBottom: 12,
              }}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}