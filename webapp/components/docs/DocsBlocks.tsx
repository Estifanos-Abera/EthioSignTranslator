"use client";

import React from "react";
import { Block } from "@/lib/docsContent";

function renderEthiopic(text: string): React.ReactNode {
  const parts = text.split(/([\u1200-\u137F]+)/g);
  return parts.map((part, index) =>
    /[\u1200-\u137F]/.test(part) ? (
      <span key={index} style={{ fontFamily: "var(--font-ethiopic)" }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function DocsBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p
              key={i}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                lineHeight: 1.75,
                color: "#3F362E",
                marginBottom: 16,
              }}
            >
              {renderEthiopic(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={i}
              style={{
                paddingLeft: 20,
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                lineHeight: 1.7,
                color: "#3F362E",
                marginBottom: 16,
              }}
            >
              {block.items.map((item, j) => (
                <li
                  key={j}
                  style={{
                    marginBottom: j < block.items.length - 1 ? 8 : 0,
                  }}
                >
                  {renderEthiopic(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={i}
              style={{
                backgroundColor: "#1E2229",
                color: "#E5A93C",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                lineHeight: 1.65,
                padding: "18px 20px",
                borderRadius: 8,
                overflowX: "auto",
                margin: "8px 0 20px",
              }}
            >
              {block.text}
            </pre>
          );
        }

        if (block.type === "issue") {
          const rows = [
            { label: "Symptom", text: block.symptom },
            { label: "Cause", text: block.cause },
            { label: "Fix", text: block.fix },
          ];

          return (
            <div key={i} style={{ marginBottom: 40 }}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1E2229",
                  marginBottom: 8,
                }}
              >
                {renderEthiopic(block.title)}
              </h3>
              {rows.map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    padding: "12px 0",
                    borderTop:
                      idx > 0 ? "1px solid rgba(212,196,176,0.5)" : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#B33925",
                      paddingTop: 2,
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "#3F362E",
                    }}
                  >
                    {renderEthiopic(row.text)}
                  </span>
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

