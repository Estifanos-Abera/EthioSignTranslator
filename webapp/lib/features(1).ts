/**
 * features.ts
 *
 * Mirrors preprocess.py EXACTLY. Any change here must be reflected there
 * and vice versa — this is the train/inference parity critical path.
 *
 * Feature order (locked, matches preprocess.py):
 *   [ left_pos(63), right_pos(63), left_vel(63), right_vel(63) ] = 252 per frame
 *
 * Pipeline per rep:
 *   1. Remap hand slots → fixed {left, right} by handedness label
 *   2. Wrist-relative normalization (subtract landmark 0)
 *   3. Velocity = frame[t] - frame[t-1], first frame = zeros
 *   4. Concatenate: [left_pos, right_pos, left_vel, right_vel]
 *   5. Uniform-sample to SEQ_LEN if longer, zero-pad at end if shorter
 */

export const SEQ_LEN = 30;
export const NUM_LANDMARKS = 21;
export const COORDS = 3;
export const NUM_FEATURES = 252; // 4 * 21 * 3

/** Raw landmark point as returned by MediaPipe Tasks JS */
export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

/** One hand detected in one frame */
export interface HandFrame {
  handedness: "Left" | "Right";
  landmarks: LandmarkPoint[];
}

/** One captured frame — hand_1/hand_2 are unordered slots (mirrors JSON schema) */
export interface RawFrame {
  hand_1: HandFrame | null;
  hand_2: HandFrame | null;
}

// ---------------------------------------------------------------------------
// Step 1: remap slots → fixed left/right arrays, NaN where absent
// ---------------------------------------------------------------------------
function remapHands(frames: RawFrame[]): {
  left: Float32Array[];   // each (63,) — 21 * 3
  right: Float32Array[];
} {
  const T = frames.length;
  const empty = () => new Float32Array(NUM_LANDMARKS * COORDS).fill(NaN);

  const left: Float32Array[] = Array.from({ length: T }, empty);
  const right: Float32Array[] = Array.from({ length: T }, empty);

  for (let t = 0; t < T; t++) {
    const frame = frames[t];
    for (const slot of [frame.hand_1, frame.hand_2]) {
      if (!slot) continue;
      const arr = new Float32Array(NUM_LANDMARKS * COORDS);
      for (let i = 0; i < NUM_LANDMARKS; i++) {
        arr[i * 3 + 0] = slot.landmarks[i].x;
        arr[i * 3 + 1] = slot.landmarks[i].y;
        arr[i * 3 + 2] = slot.landmarks[i].z;
      }
      if (slot.handedness === "Left") left[t] = arr;
      else right[t] = arr;
    }
  }
  return { left, right };
}

// ---------------------------------------------------------------------------
// Step 2: interpolate gaps, edge-fill boundaries (mirrors preprocess.py)
// ---------------------------------------------------------------------------
const MAX_INTERP_GAP = 5;

function interpolateHand(hand: Float32Array[]): Float32Array[] {
  const T = hand.length;
  const validMask = hand.map((h) => !isNaN(h[0]));
  const validIdx = validMask.reduce<number[]>(
    (acc, v, i) => (v ? [...acc, i] : acc), []
  );

  if (validIdx.length === 0) {
    // Genuinely absent hand (one-handed sign) → zero-fill
    return hand.map(() => new Float32Array(NUM_LANDMARKS * COORDS).fill(0));
  }

  const filled = hand.map((h) => new Float32Array(h));

  // Edge-fill before first and after last valid frame
  const first = validIdx[0];
  const last = validIdx[validIdx.length - 1];
  for (let t = 0; t < first; t++) filled[t] = new Float32Array(filled[first]);
  for (let t = last + 1; t < T; t++) filled[t] = new Float32Array(filled[last]);

  // Interpolate internal gaps
  let gapStart: number | null = null;
  for (let t = first; t <= last; t++) {
    if (!validMask[t]) {
      if (gapStart === null) gapStart = t;
      continue;
    }
    if (gapStart !== null) {
      const gapLen = t - gapStart;
      if (gapLen <= MAX_INTERP_GAP) {
        const prev = filled[gapStart - 1];
        const next = filled[t];
        for (let g = gapStart; g < t; g++) {
          const alpha = (g - gapStart + 1) / (gapLen + 1);
          const interp = new Float32Array(NUM_LANDMARKS * COORDS);
          for (let k = 0; k < interp.length; k++) {
            interp[k] = (1 - alpha) * prev[k] + alpha * next[k];
          }
          filled[g] = interp;
        }
      } else {
        // Gap too long — zero out (detection dropout, not signal)
        for (let g = gapStart; g < t; g++) {
          filled[g] = new Float32Array(NUM_LANDMARKS * COORDS).fill(0);
        }
      }
      gapStart = null;
    }
  }

  // Replace any remaining NaN with 0
  return filled.map((h) => {
    const out = new Float32Array(h);
    for (let i = 0; i < out.length; i++) if (isNaN(out[i])) out[i] = 0;
    return out;
  });
}

// ---------------------------------------------------------------------------
// Step 3: wrist-relative normalization
// ---------------------------------------------------------------------------
function wristRelative(hand: Float32Array[]): Float32Array[] {
  return hand.map((h) => {
    const out = new Float32Array(h);
    const wx = h[0], wy = h[1], wz = h[2]; // landmark 0 = wrist
    for (let i = 0; i < NUM_LANDMARKS; i++) {
      out[i * 3 + 0] -= wx;
      out[i * 3 + 1] -= wy;
      out[i * 3 + 2] -= wz;
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// Step 4: velocity (frame-to-frame delta)
// ---------------------------------------------------------------------------
function velocity(hand: Float32Array[]): Float32Array[] {
  const T = hand.length;
  return hand.map((h, t) => {
    if (t === 0) return new Float32Array(NUM_LANDMARKS * COORDS).fill(0);
    const vel = new Float32Array(NUM_LANDMARKS * COORDS);
    for (let k = 0; k < vel.length; k++) vel[k] = h[k] - hand[t - 1][k];
    return vel;
  });
}

// ---------------------------------------------------------------------------
// Step 5: resample to SEQ_LEN
// ---------------------------------------------------------------------------
function resampleSequence(frames: Float32Array[][], targetLen: number): Float32Array[][] {
  const T = frames.length;
  if (T === targetLen) return frames;
  if (T > targetLen) {
    const indices = Array.from({ length: targetLen }, (_, i) =>
      Math.round((i / (targetLen - 1)) * (T - 1))
    );
    return indices.map((idx) => frames[idx]);
  }
  // Pad with zeros
  const zero = frames[0].map((f) => new Float32Array(f.length).fill(0));
  return [...frames, ...Array.from({ length: targetLen - T }, () => zero)];
}

// ---------------------------------------------------------------------------
// Public API: buildFeatureTensor
// ---------------------------------------------------------------------------
/**
 * Converts a sequence of raw MediaPipe frames into a (SEQ_LEN, 252) Float32Array
 * ready to feed directly into the TF.js model.
 *
 * @param frames  Raw frames from the webcam capture window
 * @returns       Float32Array of shape (SEQ_LEN * NUM_FEATURES,) = (30 * 252,)
 *                Reshape to [1, SEQ_LEN, NUM_FEATURES] for model.predict()
 */
export function buildFeatureTensor(frames: RawFrame[]): Float32Array {
  const { left, right } = remapHands(frames);

  const leftFilled  = interpolateHand(left);
  const rightFilled = interpolateHand(right);

  const leftNorm  = wristRelative(leftFilled);
  const rightNorm = wristRelative(rightFilled);

  const leftVel  = velocity(leftNorm);
  const rightVel = velocity(rightNorm);

  // Concatenate per frame: [left_pos(63), right_pos(63), left_vel(63), right_vel(63)]
  const perFrame: Float32Array[][] = leftNorm.map((lp, t) => [
    lp, rightNorm[t], leftVel[t], rightVel[t],
  ]);

  const resampled = resampleSequence(perFrame, SEQ_LEN);

  // Flatten to (SEQ_LEN * NUM_FEATURES,)
  const out = new Float32Array(SEQ_LEN * NUM_FEATURES);
  resampled.forEach((frameArrays, t) => {
    let offset = t * NUM_FEATURES;
    for (const arr of frameArrays) {
      out.set(arr, offset);
      offset += arr.length;
    }
  });

  return out;
}
