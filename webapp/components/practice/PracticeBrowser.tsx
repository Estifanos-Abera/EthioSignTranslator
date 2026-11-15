"use client";

import { useState } from "react";
import { CLASS_LIST } from "@/lib/classList";

export function PracticeBrowser() {
  const [selected, setSelected] = useState("selam");

  const selectedIndex = CLASS_LIST.findIndex((item) => item.label === selected);
  const selectedItem = CLASS_LIST[selectedIndex >= 0 ? selectedIndex : 0];
  const signNumber = selectedIndex >= 0 ? selectedIndex + 1 : 1;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "48px 24px",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 40,
        alignItems: "start",
      }}
    >
      {/* Word list */}
      <div
        style={{
          position: "sticky",
          top: 80,
          backgroundColor: "#EDE6D9",
          border: "1px solid #D4C4B0",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #D4C4B0",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#B33925",
            }}
          >
            15 Signs
          </p>
        </div>
        {CLASS_LIST.map((item) => {
          const isSelected = item.label === selected;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelected(item.label)}
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid rgba(212,196,176,0.5)",
                backgroundColor: isSelected
                  ? "rgba(179,57,37,0.08)"
                  : "transparent",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-ethiopic)",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#1E2229",
                  minWidth: 40,
                }}
              >
                {item.amharic}
              </span>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1E2229",
                    margin: 0,
                  }}
                >
                  {item.gloss}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "#6B5E52",
                    margin: 0,
                  }}
                >
                  {item.label} · {item.twoHanded ? "2 hands" : "1 hand"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Skeleton viewer panel */}
      <div>
        <div
          style={{
            backgroundColor: "#100E0B",
            borderRadius: 12,
            border: "1px solid rgba(229,169,60,0.15)",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {/* Panel header */}
          <div
            style={{
              backgroundColor: "#141820",
              borderBottom: "1px solid rgba(229,169,60,0.1)",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(229,169,60,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              3D Mesh Vector View
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(229,169,60,0.4)",
              }}
            >
              Coming up
            </span>
          </div>

          {/* Panel body */}
          <div
            style={{
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-ethiopic)",
                  fontSize: 64,
                  color: "#E5A93C",
                  marginBottom: 8,
                }}
              >
                {selectedItem.amharic}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "#F2EDE4",
                  marginBottom: 8,
                }}
              >
                {selectedItem.label} · {selectedItem.gloss}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "rgba(242,237,228,0.35)",
                  margin: 0,
                }}
              >
                3D mesh vector view coming up
              </p>
            </div>
          </div>

          {/* Panel footer */}
          <div
            style={{
              backgroundColor: "#141820",
              borderTop: "1px solid rgba(229,169,60,0.1)",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(242,237,228,0.25)",
              }}
            >
              SIGN {signNumber}/15
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(242,237,228,0.25)",
              }}
            >
              {selectedItem.twoHanded ? "2 HANDS" : "1 HAND"}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.65, color: "#6B5E52" }}>
          The 3D mesh vector view will replay a recorded example of each sign, frame by frame. It is coming up.
        </p>
      </div>
    </div>
  );
}
