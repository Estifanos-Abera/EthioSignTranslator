"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { href: "/translate",  label: "Translate" },
  { href: "/practice",   label: "Practice" },
  { href: "/contribute", label: "Contribute" },
  { href: "/docs",       label: "Docs" },
  { href: "/about",      label: "About" },
  { href: "/research",   label: "Research" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(242,237,228,0.95)",
        borderBottom: "1px solid #D4C4B0",
        backdropFilter: "blur(10px)",
      }}
    >
      <nav
        style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 24px", height: 60,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          {/* Placeholder logo — Ethiopic letterform */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#B33925"/>
            <text
              x="16" y="23"
              textAnchor="middle"
              fontFamily="Noto Sans Ethiopic, sans-serif"
              fontSize="18"
              fontWeight="700"
              fill="#E5A93C"
            >ኢ</text>
          </svg>
          <span style={{
            fontFamily: "EB Garamond, serif",
            fontSize: 18,
            fontWeight: 600,
            color: "#1E2229",
            letterSpacing: "-0.01em",
          }}>
            EthioSignTranslate
          </span>
        </Link>

        {/* Desktop tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
          {TABS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: active ? "#B33925" : "#6B5E52",
                backgroundColor: active ? "rgba(179,57,37,0.07)" : "transparent",
                transition: "all 0.15s",
              }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="#1E2229" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="18" y1="4" x2="4" y2="18" stroke="#1E2229" strokeWidth="1.8" strokeLinecap="round"/>
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke="#1E2229" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="3" y1="13" x2="19" y2="13" stroke="#1E2229" strokeWidth="1.8" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          borderTop: "1px solid #D4C4B0",
          backgroundColor: "#F2EDE4",
          padding: "8px 24px 16px",
        }} className="md:hidden">
          {TABS.map(({ href, label }) => (
            <Link key={href} href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "10px 0",
                fontSize: 15, fontWeight: 500,
                textDecoration: "none",
                color: pathname.startsWith(href) ? "#B33925" : "#6B5E52",
                borderBottom: "1px solid rgba(212,196,176,0.4)",
              }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
