"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { initLandmarker, isLandmarkerReady, detectFrame, drawSkeleton } from "@/lib/landmarks";
import { loadModel, isModelLoaded, predict, PredictionResult } from "@/lib/inference";
import { RawFrame } from "@/lib/features(1)";
import { CLASS_LIST } from "@/lib/classList";

const CONFIDENCE_THRESHOLD = 0.70;
const COUNTDOWN_SEC = 1.5;
const RECORD_SEC = 1.8;

type AppState = "loading" | "idle" | "countdown" | "recording" | "predicting";

interface SentenceWord {
  label: string;
  amharic: string;
  confidence: number;
}

export default function TranslatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const framesRef = useRef<RawFrame[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<AppState>("loading");
  const [loadingMsg, setLoadingMsg] = useState("Loading MediaPipe...");
  const [sentence, setSentence] = useState<SentenceWord[]>([]);
  const [lastResult, setLastResult] = useState<PredictionResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [researchMode, setResearchMode] = useState(false);
  const [nodesDetected, setNodesDetected] = useState(0);
  const [latency, setLatency] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [rejected, setRejected] = useState(false);

   // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!navigator.mediaDevices) {
        setLoadingMsg("Camera needs https. Open the deployed link.");
        return;
      }

      try {
        setLoadingMsg("Opening camera...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 960, height: 720, facingMode: "user" },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
      } catch (err) {
        console.error(err);
        setLoadingMsg("Could not start camera. Check permissions and reload.");
        return;
      }

      try {
        setLoadingMsg("Loading MediaPipe...");
        await initLandmarker();
        if (cancelled) return;
      } catch (err) {
        console.error(err);
        setLoadingMsg("MediaPipe failed to load.");
        return;
      }

      try {
        setLoadingMsg("Loading model...");
        await loadModel();
        if (cancelled) return;
      } catch (err) {
        console.error(err);
        setLoadingMsg("Model failed to load");
        return;
      }

      setState("idle");
    }

    init();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Live overlay loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraReady) return;
    const video = videoRef.current;
    const canvas = overlayRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      const W = video.videoWidth || 960;
      const H = video.videoHeight || 720;
      canvas.width = W;
      canvas.height = H;
      ctx.clearRect(0, 0, W, H);
      const frame = detectFrame(video, performance.now());
      setNodesDetected(
        (frame.hand_1 ? 21 : 0) + (frame.hand_2 ? 21 : 0)
      );
      drawSkeleton(ctx, frame, W, H, {
        nodeColor: "#E5A93C",
        lineColor: "rgba(229,169,60,0.5)",
        nodeRadius: 5,
        lineWidth: 2,
      });
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraReady]);

  // ── Recording flow ─────────────────────────────────────────────────────────
  const startSign = useCallback(() => {
    if (state !== "idle") return;
    framesRef.current = [];
    setRejected(false);
    setState("countdown");
    let c = Math.ceil(COUNTDOWN_SEC);
    setCountdown(c);

    const tick = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(tick);
        beginRecording();
      }
    }, 1000);
  }, [state]);

  function beginRecording() {
    setState("recording");
    const video = videoRef.current;
    if (!video) return;

    const t0 = performance.now();
    const captureLoop = () => {
      if (performance.now() - t0 >= RECORD_SEC * 1000) {
        finishRecording();
        return;
      }
      const frame = detectFrame(video, performance.now());
      framesRef.current.push(frame);
      requestAnimationFrame(captureLoop);
    };
    requestAnimationFrame(captureLoop);
  }

  async function finishRecording() {
    setState("predicting");
    const t0 = performance.now();
    const result = await predict(framesRef.current);
    setLatency(Math.round(performance.now() - t0));

    if (!result || result.confidence < CONFIDENCE_THRESHOLD) {
      setRejected(true);
      setLastResult(result);
      setState("idle");
      return;
    }

    setLastResult(result);
    setRejected(false);

    const classEntry = CLASS_LIST.find(c => c.label === result.label);
    setSentence(prev => [...prev, {
      label: result.label,
      amharic: classEntry?.amharic ?? result.label,
      confidence: result.confidence,
    }]);
    setState("idle");
  }

  function undoLast() {
    setSentence(prev => prev.slice(0, -1));
  }

  function clearSentence() {
    setSentence([]);
    setLastResult(null);
    setRejected(false);
  }

  function speakSentence() {
    if (!sentence.length) return;
    const text = sentence.map(w => w.label).join(" ");
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "am-ET";
    window.speechSynthesis.speak(utt);
  }

  // ── Keyboard support ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && state === "idle") {
        e.preventDefault();
        startSign();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, startSign]);

  // ── Status label ───────────────────────────────────────────────────────────
  const statusLabel = {
    loading:    loadingMsg,
    idle:       "Hold SPACE or press the button to sign",
    countdown:  `Get ready... ${countdown}`,
    recording:  "Signing...",
    predicting: "Recognising...",
  }[state];

  const statusColor = {
    loading:    "rgba(229,169,60,0.5)",
    idle:       "rgba(242,237,228,0.35)",
    countdown:  "#E5A93C",
    recording:  "#B33925",
    predicting: "#E5A93C",
  }[state];

  return (
    <div style={{
      animation: "pageEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
    }}>
      <div style={{ backgroundColor: "#1E2229", minHeight: "100vh", color: "#F2EDE4" }}>
      <div style={{ backgroundColor: "#1E2229" }}>
        <svg width="100%" height="28" style={{ display: "block" }}>
          <defs>
            <pattern id="tilet-t7" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" fill="none"/>
              <g transform="translate(14,14)">
                <rect x="-11" y="-11" width="22" height="22"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22"/>
                <rect x="-5" y="-5" width="10" height="10"
                  transform="rotate(45)"
                  fill="none" stroke="#E5A93C" strokeWidth="1" opacity="0.22"/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="28" fill="url(#tilet-t7)"/>
        </svg>
      </div>
      {/* ── Header ── */}
      <div style={{
        borderBottom: "1px solid rgba(229,169,60,0.1)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(229,169,60,0.4)", marginBottom: 4,
          }}>Live Translator</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#F2EDE4" }}>
            EthioSignTranslate
          </p>
        </div>
        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "rgba(242,237,228,0.35)",
        }}>
          <span>Research Mode</span>
          <span
            onClick={() => setResearchMode(r => !r)}
            style={{
              width: 36, height: 20, borderRadius: 10,
              backgroundColor: researchMode ? "#E5A93C" : "rgba(242,237,228,0.1)",
              position: "relative", cursor: "pointer",
              transition: "background 0.2s",
              display: "inline-block",
              border: "1px solid rgba(229,169,60,0.2)",
            }}
          >
            <span style={{
              position: "absolute", top: 2,
              left: researchMode ? 18 : 2,
              width: 14, height: 14, borderRadius: "50%",
              backgroundColor: researchMode ? "#100E0B" : "rgba(242,237,228,0.3)",
              transition: "left 0.2s",
            }} />
          </span>
        </label>
      </div>

      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "32px 24px",
        display: "grid",
        gridTemplateColumns: researchMode ? "1fr 320px" : "1fr",
        gap: 32,
      }}>
        {/* ── Main column ── */}
        <div>
          {/* Camera + overlay */}
          <div style={{
            position: "relative",
            backgroundColor: "#000",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(229,169,60,0.12)",
            aspectRatio: "4/3",
            maxHeight: 540,
          }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
                display: cameraReady ? "block" : "none",
                filter: "saturate(0.7) brightness(0.9)",
              }}
            />
            <canvas
              ref={overlayRef}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                pointerEvents: "none",
              }}
            />


            {/* Loading overlay */}
            {state === "loading" && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                backgroundColor: "#100E0B",
                gap: 16,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "2px solid rgba(229,169,60,0.2)",
                  borderTopColor: "#E5A93C",
                  animation: "spin 1s linear infinite",
                }} />
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  color: "rgba(229,169,60,0.5)",
                }}>{loadingMsg}</p>
              </div>
            )}

            {/* Recording pulse */}
            {state === "recording" && (
              <div style={{
                position: "absolute", top: 16, right: 16,
                display: "flex", alignItems: "center", gap: 8,
                backgroundColor: "rgba(179,57,37,0.9)",
                borderRadius: 6, padding: "6px 12px",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: "#F2EDE4",
                  animation: "pulse 0.8s ease-in-out infinite",
                }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "#F2EDE4", letterSpacing: "0.06em",
                }}>SIGNING</span>
              </div>
            )}

            {/* Countdown overlay */}
            {state === "countdown" && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}>
                <p style={{
                  fontFamily: "var(--font-serif)", fontSize: 120,
                  color: "#E5A93C", lineHeight: 1,
                }}>{countdown}</p>
              </div>
            )}

            {/* HUD bottom-left */}
            {cameraReady && (
              <div style={{
                position: "absolute", bottom: 12, left: 14,
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "rgba(229,169,60,0.45)",
                lineHeight: 1.8,
              }}>
                <div>NODES {nodesDetected}/{nodesDetected > 0 ? nodesDetected : "—"}</div>
                {researchMode && <div>LATENCY {latency}ms</div>}
              </div>
            )}
          </div>

          {/* Status bar */}
          <div style={{
            marginTop: 16, padding: "12px 20px",
            backgroundColor: "#1A1510",
            border: "1px solid rgba(229,169,60,0.08)",
            borderRadius: 10,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: statusColor, transition: "color 0.2s",
            }}>{statusLabel}</p>
            {rejected && (
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "rgba(179,57,37,0.8)",
              }}>
                Low confidence — try again
              </p>
            )}
          </div>

          {/* Sentence strip */}
          <div style={{
            marginTop: 16,
            backgroundColor: "#1A1510",
            border: "1px solid rgba(229,169,60,0.08)",
            borderRadius: 12,
            padding: "20px 20px 16px",
          }}>
            <div style={{
              minHeight: 64,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              marginBottom: 16,
            }}>
              {sentence.length === 0 ? (
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  color: "rgba(242,237,228,0.15)",
                }}>Signed words will appear here</p>
              ) : sentence.map((w, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-ethiopic)",
                  fontSize: 28, fontWeight: 600,
                  color: "#E5A93C",
                  backgroundColor: "rgba(229,169,60,0.08)",
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(229,169,60,0.15)",
                }}>{w.amharic}</span>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onPointerDown={startSign}
                disabled={state !== "idle"}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  backgroundColor: state === "idle" ? "#E5A93C" : "rgba(229,169,60,0.2)",
                  color: state === "idle" ? "#100E0B" : "rgba(229,169,60,0.4)",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: state === "idle" ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {state === "countdown" ? `Ready in ${countdown}...` :
                 state === "recording" ? "Signing..." :
                 state === "predicting" ? "Recognising..." :
                 "Sign (SPACE)"}
              </button>
              <button
                onClick={undoLast}
                disabled={sentence.length === 0}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  color: sentence.length ? "rgba(242,237,228,0.5)" : "rgba(242,237,228,0.15)",
                  border: "1px solid rgba(242,237,228,0.1)",
                  borderRadius: 8, cursor: sentence.length ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                }}
              >Undo</button>
              <button
                onClick={clearSentence}
                disabled={sentence.length === 0}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  color: sentence.length ? "rgba(242,237,228,0.5)" : "rgba(242,237,228,0.15)",
                  border: "1px solid rgba(242,237,228,0.1)",
                  borderRadius: 8, cursor: sentence.length ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                }}
              >Clear</button>
              <button
                onClick={speakSentence}
                disabled={sentence.length === 0}
                style={{
                  padding: "12px 20px",
                  backgroundColor: sentence.length ? "rgba(229,169,60,0.1)" : "transparent",
                  color: sentence.length ? "#E5A93C" : "rgba(242,237,228,0.15)",
                  border: "1px solid rgba(229,169,60,0.2)",
                  borderRadius: 8, cursor: sentence.length ? "pointer" : "not-allowed",
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                }}
              >Speak</button>
            </div>
          </div>
        </div>

        {/* ── Research Mode panel ── */}
        {researchMode && (
          <div style={{
            backgroundColor: "#1A1510",
            border: "1px solid rgba(229,169,60,0.12)",
            borderRadius: 12,
            padding: "20px",
            alignSelf: "start",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(229,169,60,0.45)", marginBottom: 20,
            }}>Research Mode</p>

            {/* Live stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
              marginBottom: 24,
            }}>
              {[
                { label: "NODES", value: `${nodesDetected}/42` },
                { label: "LATENCY", value: `${latency}ms` },
                { label: "THRESHOLD", value: `${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%` },
                { label: "FRAMES", value: `${framesRef.current.length}/30` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: 8, padding: "12px 14px",
                }}>
                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: "rgba(229,169,60,0.4)",
                    letterSpacing: "0.1em", marginBottom: 4,
                  }}>{label}</p>
                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: 18,
                    color: "#E5A93C", fontWeight: 600,
                  }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Top-3 predictions */}
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                color: "rgba(229,169,60,0.4)", letterSpacing: "0.1em",
                marginBottom: 12,
              }}>TOP 3 CANDIDATES</p>
              {lastResult ? lastResult.top3.map((item, i) => {
                const entry = CLASS_LIST.find(c => c.label === item.label);
                return (
                  <div key={i} style={{
                    marginBottom: 8,
                    padding: "10px 14px",
                    backgroundColor: i === 0 ? "rgba(229,169,60,0.08)" : "transparent",
                    border: `1px solid ${i === 0 ? "rgba(229,169,60,0.2)" : "rgba(242,237,228,0.05)"}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{
                        fontFamily: "var(--font-ethiopic)", fontSize: 18,
                        color: i === 0 ? "#E5A93C" : "rgba(242,237,228,0.4)",
                      }}>{entry?.amharic ?? item.label}</span>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 13,
                        color: i === 0 ? "#E5A93C" : "rgba(242,237,228,0.3)",
                      }}>{(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{
                      height: 3, borderRadius: 2,
                      backgroundColor: "rgba(242,237,228,0.08)",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${item.confidence * 100}%`,
                        backgroundColor: i === 0 ? "#E5A93C" : "rgba(242,237,228,0.2)",
                        transition: "width 0.3s",
                      }} />
                    </div>
                  </div>
                );
              }) : (
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "rgba(242,237,228,0.15)",
                }}>Sign something to see predictions</p>
              )}
            </div>

            {/* Model info */}
            <div style={{
              padding: "14px",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 8,
            }}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                color: "rgba(229,169,60,0.4)", letterSpacing: "0.1em",
                marginBottom: 10,
              }}>MODEL</p>
              {[
                ["Architecture", "2-layer GRU"],
                ["Input shape", "(30, 252)"],
                ["Classes", "15"],
                ["Runtime", "TensorFlow.js"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "rgba(242,237,228,0.3)",
                  }}>{k}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "rgba(242,237,228,0.6)",
                  }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
    </div>
  );
}