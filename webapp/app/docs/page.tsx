"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DOCS, GROUP_ORDER } from "@/lib/docsContent";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsBlocks } from "@/components/docs/DocsBlocks";

const tiletDividerStyle = {
  height: 1,
  background:
    "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(212,196,176,0.4) 6px, rgba(212,196,176,0.4) 8px, transparent 8px, transparent 16px, rgba(179,57,37,0.2) 16px, rgba(179,57,37,0.2) 17px, transparent 17px, transparent 24px)",
  margin: "64px 0",
};

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");

  const matchingSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCS;
    return DOCS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const sectionEls = document.querySelectorAll<HTMLElement>("section[id]");
    if (!sectionEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [matchingSections]);

  return (
    <div
      style={{
        backgroundColor: "#F2EDE4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <DocsSidebar
        sections={DOCS}
        activeId={activeId}
        query={query}
        onQuery={setQuery}
      />

      <div
        style={{
          flex: 1,
          padding: "56px 64px 96px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 52,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#1E2229",
              marginBottom: 12,
            }}
          >
            Documentation
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 17,
              color: "#6B5E52",
              marginBottom: 32,
            }}
          >
            How EthioSignTranslate was built, including what broke and how it was fixed.
          </p>

          {matchingSections.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                color: "#6B5E52",
                marginTop: 24,
              }}
            >
              No matching sections.
            </p>
          ) : (
            <>
              {/* Overview */}
              <div>
                {GROUP_ORDER.map((group) => {
                  const groupSections = matchingSections.filter(
                    (s) => s.group === group
                  );
                  if (groupSections.length === 0) return null;

                  return (
                    <div key={group} style={{ marginBottom: 24 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: "#6B5E52",
                          margin: "24px 0 12px",
                        }}
                      >
                        {group}
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          columnGap: 40,
                        }}
                      >
                        {groupSections.map((s) => (
                          <a
                            key={s.id}
                            href={`#${s.id}`}
                            style={{
                              display: "block",
                              padding: "12px 0",
                              borderBottom:
                                "1px solid rgba(212,196,176,0.5)",
                              textDecoration: "none",
                            }}
                          >
                            <p
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#1E2229",
                                marginBottom: 4,
                              }}
                            >
                              {s.title}
                            </p>
                            <p
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: 14,
                                lineHeight: 1.5,
                                color: "#6B5E52",
                              }}
                            >
                              {s.summary}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tilet divider after overview */}
              <div style={tiletDividerStyle} />

              {/* Sections in order */}
              {matchingSections.map((section, idx) => (
                <React.Fragment key={section.id}>
                  <section
                    id={section.id}
                    style={{ scrollMarginTop: 88 }}
                  >
                    <h2
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 34,
                        fontWeight: 500,
                        letterSpacing: "-0.015em",
                        color: "#1E2229",
                        marginBottom: 20,
                      }}
                    >
                      {section.title}
                    </h2>
                    <DocsBlocks blocks={section.blocks} />
                  </section>
                  {idx < matchingSections.length - 1 && (
                    <div style={tiletDividerStyle} />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
