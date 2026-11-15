"use client";

import React from "react";
import { DocSection, GROUP_ORDER } from "@/lib/docsContent";

interface DocsSidebarProps {
  sections: DocSection[];
  activeId: string;
  query: string;
  onQuery: (query: string) => void;
}

export function DocsSidebar({
  sections,
  activeId,
  query,
  onQuery,
}: DocsSidebarProps) {
  const q = query.trim().toLowerCase();
  const matchingSections = q
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q)
      )
    : sections;

  return (
    <aside
      style={{
        width: 280,
        position: "sticky",
        top: 61,
        height: "calc(100vh - 61px)",
        overflowY: "auto",
        backgroundColor: "#EDE6D9",
        borderRight: "1px solid #D4C4B0",
        padding: "24px 16px",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search docs"
        style={{
          height: 38,
          width: "100%",
          backgroundColor: "#F2EDE4",
          border: "1px solid #D4C4B0",
          borderRadius: 8,
          padding: "0 12px",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          color: "#1E2229",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <nav>
        {GROUP_ORDER.map((group) => {
          const groupSections = matchingSections.filter(
            (s) => s.group === group
          );
          if (groupSections.length === 0) return null;

          return (
            <div key={group}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#6B5E52",
                  margin: "24px 0 8px 12px",
                }}
              >
                {group}
              </p>
              {groupSections.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: isActive ? "#B33925" : "#6B5E52",
                      backgroundColor: isActive
                        ? "rgba(179,57,37,0.08)"
                        : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    {s.title}
                  </a>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

