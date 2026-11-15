import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#1E2229",
      borderTop: "none",
    }}>
      <div style={{ backgroundColor: "#1E2229" }}>
        <svg width="100%" height="28" style={{ display: "block" }}>
          <defs>
            <pattern id="tilet-t4" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" fill="none" />
              <g transform="translate(14,14)">
                <rect x="-11" y="-11" width="22" height="22"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22" />
                <rect x="-5" y="-5" width="10" height="10"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="28" fill="url(#tilet-t4)" />
        </svg>
      </div>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "64px 24px 40px",
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: 48,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#B33925"/>
              <text x="16" y="23" textAnchor="middle"
                fontFamily="Noto Sans Ethiopic, sans-serif"
                fontSize="18" fontWeight="700" fill="#E5A93C">ኢ</text>
            </svg>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              fontWeight: 600,
              color: "#F2EDE4",
            }}>EthioSignTranslate</span>
          </div>
          <p style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: "rgba(242,237,228,0.4)",
            maxWidth: 260,
          }}>
            Real-time Ethiopian Sign Language recognition. Open source, built in Ethiopia, designed for the Deaf community.
          </p>
        </div>

        {/* Product */}
        <div>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(242,237,228,0.25)",
            marginBottom: 16,
          }}>Product</p>
          {[
            { href: "/translate", label: "Translate" },
            { href: "/practice", label: "Practice" },
            { href: "/contribute", label: "Contribute" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: "block",
              fontSize: 14,
              color: "rgba(242,237,228,0.45)",
              textDecoration: "none",
              marginBottom: 10,
            }}>{label}</Link>
          ))}
        </div>

        {/* Project */}
        <div>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(242,237,228,0.25)",
            marginBottom: 16,
          }}>Project</p>
          {[
            { href: "/about", label: "About" },
            { href: "/docs", label: "Docs" },
            { href: "/research", label: "Research" },
            { href: "/about#contact", label: "Contact" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: "block",
              fontSize: 14,
              color: "rgba(242,237,228,0.45)",
              textDecoration: "none",
              marginBottom: 10,
            }}>{label}</Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(242,237,228,0.25)",
            marginBottom: 16,
          }}>Legal</p>
          {[
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/accessibility", label: "Accessibility" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: "block",
              fontSize: 14,
              color: "rgba(242,237,228,0.45)",
              textDecoration: "none",
              marginBottom: 10,
            }}>{label}</Link>
          ))}
          <a href="https://github.com/Estifanos-Abera/EthioSignTranslator" target="_blank" rel="noopener noreferrer" style={{
            display: "block",
            fontSize: 14,
            color: "rgba(242,237,228,0.45)",
            textDecoration: "none",
            marginBottom: 10,
          }}>GitHub</a>
        </div>
      </div>

      <div style={{
        height: 1,
        background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
        margin: "0",
      }} />

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 12, color: "rgba(242,237,228,0.25)" }}>
          Built in Ethiopia
        </span>
      </div>
    </footer>
  );
}
