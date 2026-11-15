/**
 * landmarks.ts
 *
 * Wraps MediaPipe Tasks Vision HandLandmarker for live webcam use.
 * Mirrors the Python collect_data.py pipeline:
 *   - VIDEO running mode with strictly increasing timestamps
 *   - Up to 2 hands
 *   - Handedness label INVERTED to correct for MediaPipe's mirrored perspective
 *     (empirically verified 2026-08-27: right hand shown → "Left" reported)
 *   - Returns RawFrame compatible with features.ts buildFeatureTensor()
 */



import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { RawFrame, HandFrame, LandmarkPoint } from "./features(1)";

const MEDIAPIPE_WASM_URL = "/mediapipe/wasm";
const HAND_LANDMARKER_MODEL_URL = "/mediapipe/hand_landmarker.task";

const FLIP_HANDEDNESS: Record<string, "Left" | "Right"> = {
  Left: "Right",
  Right: "Left",
};

let mirrorCanvas: HTMLCanvasElement | null = null;

let handLandmarker: HandLandmarker | null = null;
let lastTimestampMs = 0;

export async function initLandmarker(): Promise<void> {
  if (handLandmarker) return;
  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: HAND_LANDMARKER_MODEL_URL,
      delegate: "CPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export function isLandmarkerReady(): boolean {
  return handLandmarker !== null;
}

/**
 * Detect hands in a single video frame.
 * Timestamp must strictly increase — call this once per animation frame.
 */
export function detectFrame(
  videoElement: HTMLVideoElement,
  timestampMs: number
): RawFrame {
  if (!handLandmarker) return { hand_1: null, hand_2: null };

  const ts = Math.max(timestampMs, lastTimestampMs + 1);
  lastTimestampMs = ts;

  const w = videoElement.videoWidth;
  const h = videoElement.videoHeight;
  if (!w || !h || videoElement.readyState < 2) {
    return { hand_1: null, hand_2: null };
  }
  if (!mirrorCanvas) mirrorCanvas = document.createElement("canvas");
  if (mirrorCanvas.width !== w || mirrorCanvas.height !== h) {
    mirrorCanvas.width = w;
    mirrorCanvas.height = h;
  }
  const mctx = mirrorCanvas.getContext("2d")!;
  mctx.setTransform(-1, 0, 0, 1, w, 0);
  mctx.drawImage(videoElement, 0, 0, w, h);

  
  const result: HandLandmarkerResult = handLandmarker.detectForVideo(mirrorCanvas, ts);

  const slots: HandFrame[] = [];


  if (result.landmarks && result.handedness) {
    for (let i = 0; i < result.landmarks.length; i++) {
      const rawHandedness = result.handedness[i]?.[0]?.categoryName ?? "Right";
      const corrected = FLIP_HANDEDNESS[rawHandedness] ?? "Right";
      const confidence = result.handedness[i]?.[0]?.score ?? 0;

      const landmarks: LandmarkPoint[] = result.landmarks[i].map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }));

      slots.push({ handedness: corrected, landmarks });
      void confidence; // stored in JSON during collection; not needed at inference
    }
  }

  return {
    hand_1: slots[0] ?? null,
    hand_2: slots[1] ?? null,
  };
}


/**
 * Draw the hand skeleton overlay on a canvas.
 * Call this every animation frame alongside detectFrame().
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  result: RawFrame,
  width: number,
  height: number,
  options: {
    nodeColor?: string;
    lineColor?: string;
    nodeRadius?: number;
    lineWidth?: number;
  } = {}
): void {
  const {
    nodeColor = "#8FFFE0",
    lineColor = "rgba(143,255,224,0.6)",
    nodeRadius = 4,
    lineWidth = 2,
  } = options;

  const CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],
    [5,9],[9,13],[13,17],
  ];

  for (const slot of [result.hand_1, result.hand_2]) {
    if (!slot) continue;
    const pts = slot.landmarks.map((lm) => ({
      x: lm.x * width,
      y: lm.y * height,
    }));

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    }

    ctx.fillStyle = nodeColor;
    for (const pt of pts) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draw a static skeleton from normalized wrist-relative landmark arrays.
 * Used by the Practice/Guides skeleton viewer (playback from JSON data).
 */
export function drawStaticSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: number[][],  // (21, 3) — wrist-relative, normalized
  width: number,
  height: number,
  depthShading = true
): void {
  if (!landmarks || landmarks.length < 21) return;

  const CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],
    [5,9],[9,13],[13,17],
  ];

  // Rescale wrist-relative coords to canvas
  const xs = landmarks.map((l) => l[0]);
  const ys = landmarks.map((l) => l[1]);
  const zs = landmarks.map((l) => l[2]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const zMin = Math.min(...zs), zMax = Math.max(...zs);
  const pad = 0.1;

  const toCanvas = (x: number, y: number) => ({
    cx: ((x - xMin) / (xMax - xMin + 1e-6)) * (1 - 2 * pad) * width + pad * width,
    cy: ((y - yMin) / (yMax - yMin + 1e-6)) * (1 - 2 * pad) * height + pad * height,
  });

  const depthAlpha = (z: number) =>
    depthShading
      ? 0.3 + 0.7 * (1 - (z - zMin) / (zMax - zMin + 1e-6))
      : 1.0;

  for (const [a, b] of CONNECTIONS) {
    const pa = toCanvas(landmarks[a][0], landmarks[a][1]);
    const pb = toCanvas(landmarks[b][0], landmarks[b][1]);
    const alpha = (depthAlpha(landmarks[a][2]) + depthAlpha(landmarks[b][2])) / 2;
    ctx.strokeStyle = `rgba(143,255,224,${alpha * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pa.cx, pa.cy);
    ctx.lineTo(pb.cx, pb.cy);
    ctx.stroke();
  }

  for (let i = 0; i < 21; i++) {
    const { cx, cy } = toCanvas(landmarks[i][0], landmarks[i][1]);
    const alpha = depthAlpha(landmarks[i][2]);
    const radius = depthShading ? 3 + 3 * alpha : 4;
    ctx.fillStyle = `rgba(143,255,224,${alpha})`;
    ctx.shadowColor = `rgba(143,255,224,${alpha * 0.5})`;
    ctx.shadowBlur = depthShading ? 6 * alpha : 0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export function closeLandmarker(): void {
  handLandmarker?.close();
  handLandmarker = null;
}
