export const metadata = { title: "Privacy Policy — EthioSignTranslate" };

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#F2EDE4", minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 80px" }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#B33925", marginBottom: 16,
        }}>Privacy policy</p>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(32px, 4vw, 50px)",
          fontWeight: 500, color: "#1E2229",
          letterSpacing: "-0.02em", marginBottom: 8,
        }}>How this application handles your data.</h1>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 12,
          color: "#6B5E52", marginBottom: 40,
        }}>Last updated: November 2026</p>

        <div className="tilet-divider" style={{ marginBottom: 48 }} />

        {[
          {
            title: "What we do not collect",
            content: `EthioSignTranslate does not collect, store, or transmit any data from your webcam. Your video feed never leaves your device. Hand landmark coordinates are computed locally in your browser and used only for the current session. Nothing is sent to any server.

The translator collects no personal information. The only exception is the contact form described below, which sends what you type into it.`,
          },
          {
            title: "How the camera is used",
            content: `When you open the Translate page, the browser will request camera permission. This is required for the hand tracking pipeline to function. The camera feed is processed entirely inside your browser using MediaPipe's JavaScript library and TensorFlow.js.

You can deny or revoke camera permission at any time through your browser settings. The application will not function without camera access, but no data is ever captured or stored as a result of granting it.`,
          },
          {
            title: "Local storage",
            content: `EthioSignTranslate does not use cookies, local storage, or session storage to store personal information. The application is stateless between sessions. No information persists after you close the browser tab.`,
          },
          {
            title: "Third-party services",
            content: `The application loads fonts from Google Fonts (fonts.googleapis.com). This request is made by your browser when the page loads and is subject to Google's own privacy policy. No other third-party services are used.

The application is hosted on Vercel. Vercel may collect standard server access logs (IP address, browser type, request time) as part of normal hosting infrastructure. These logs are retained by Vercel according to their privacy policy and are not accessible to EthioSignTranslate.`,
          },
          {
            title: "Dataset contributions",
            content: `If you contribute sign recordings via the Contribute page, you are submitting hand landmark data (21 x,y,z coordinates per hand per frame) via a GitHub pull request. This data is anonymized: it is identified only by a sequential signer ID (s3, s4, etc.) with no name, face, or biometric information attached.

By submitting a contribution, you agree that the contributed landmark data will be published under CC BY 4.0 as part of the EthioSignTranslate dataset. You should not submit contributions on behalf of others without their explicit consent.`,
          },
          {
            title: "Contact form",
            content: `The contact form on the About page sends the name, email address, organization and message you type to Formspree, a form service, which delivers them by email to the project maintainer. This is the only place where the site sends personal information to a server. Do not enter anything you do not want sent. Formspree handles the data under its own privacy policy. The maintainer uses messages only to reply to them.`,
          },
          {
            title: "Contact",
            content: `If you have questions about this privacy policy, use the contact form on the About page or open an issue on the GitHub repository.`,
          },
        ].map(({ title, content }, i, arr) => (
          <section key={i} style={{
            marginBottom: 48,
            paddingBottom: 48,
            borderBottom: i < arr.length - 1 ? "1px solid #D4C4B0" : "none",
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