"use client";

import React, { useState } from "react";

const CONTACT_ENDPOINT = ""; // Paste the Formspree form URL here.

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [gotcha, setGotcha] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }
    if (!CONTACT_ENDPOINT) {
      setFeedbackMessage("The contact form is not set up yet.");
      return;
    }

    setSending(true);
    setFeedbackMessage("");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          organization,
          message,
          _gotcha: gotcha,
        }),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setOrganization("");
        setMessage("");
        setGotcha("");
        setFeedbackMessage("Message sent. Thank you.");
      } else {
        setFeedbackMessage("The message could not be sent. Please try again.");
      }
    } catch {
      setFeedbackMessage("The message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#B33925",
    marginBottom: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 48,
    backgroundColor: "#F2EDE4",
    border: "1px solid #D4C4B0",
    borderRadius: 8,
    padding: "0 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    color: "#1E2229",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 160,
    backgroundColor: "#F2EDE4",
    border: "1px solid #D4C4B0",
    borderRadius: 8,
    padding: "12px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    color: "#1E2229",
    boxSizing: "border-box",
    resize: "vertical",
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {/* Honeypot */}
      <input
        type="text"
        name="_gotcha"
        value={gotcha}
        onChange={(e) => setGotcha(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999 }}
      />

      {/* Name */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="contact-name" style={labelStyle}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={inputStyle}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="contact-email" style={labelStyle}>
          Email address
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </div>

      {/* Organization */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="contact-org" style={labelStyle}>
          Organization (optional)
        </label>
        <input
          id="contact-org"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Organization, university, or independent"
          style={inputStyle}
        />
      </div>

      {/* Message */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="contact-message" style={labelStyle}>
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          style={textareaStyle}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={sending}
        style={{
          width: "100%",
          height: 48,
          backgroundColor: "#E5A93C",
          color: "#1E2229",
          fontWeight: 600,
          fontSize: 15,
          fontFamily: "var(--font-sans)",
          border: "none",
          borderRadius: 8,
          cursor: sending ? "not-allowed" : "pointer",
        }}
      >
        {sending ? "Sending..." : "Send message"}
      </button>

      <p
        style={{
          fontSize: 13,
          color: "#6B5E52",
          marginTop: 8,
          marginBottom: 0,
          fontFamily: "var(--font-sans)",
        }}
      >
        Messages are sent by email to the project maintainer.
      </p>

      {/* Status feedback */}
      <div
        aria-live="polite"
        style={{
          fontSize: 14,
          color: "#1E2229",
          marginTop: 16,
          fontFamily: "var(--font-sans)",
        }}
      >
        {feedbackMessage}
      </div>

      <style>{`
        input::placeholder, textarea::placeholder {
          color: #6B5E52;
          opacity: 1;
        }
      `}</style>
    </form>
  );
}
