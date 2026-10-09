"""
preprocess.py — raw MediaPipe landmark JSON -> (N, 30, 252) training tensors.

FEATURE ORDER (fixed, must be mirrored exactly in webapp/lib/features.ts):
    [ left_hand_position(63), right_hand_position(63),
      left_hand_velocity(63), right_hand_velocity(63) ]  = 252 per frame

Per-rep pipeline:
  1. Remap hand_1/hand_2 -> {left, right} using `handedness`, not slot order.
     MediaPipe's hand_1/hand_2 assignment is not guaranteed stable across
     frames or samples; handedness is the actual semantic label.
  2. Null-frame handling, per hand, independently:
       - hand absent in 100% of frames -> valid one-handed sign, zero-filled.
       - short internal gaps (<= MAX_INTERP_GAP) -> linear interpolation
         between nearest valid frames (detection dropout, not signal).
       - boundary gaps -> edge-fill (hold nearest valid frame).
       - long internal gaps (> MAX_INTERP_GAP) -> zeroed, not trusted.
       - hand present in >0% but <MIN_DETECTION_RATIO of frames -> rep excluded.
  3. Wrist-relative normalization per hand per frame (landmark 0 subtracted).
  4. Frame-to-frame velocity (first frame velocity = 0).
  5. Sequence length fix: uniform-sample to SEQ_LEN if longer, zero-pad if
     shorter. Zero-padding pairs with a Keras Masking(mask_value=0.0) layer.

Usage:
    python preprocess.py
"""

import json
from pathlib import Path
from collections import defaultdict

import numpy as np

from class_list import CLASS_LABELS

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
OUT_DIR = Path(__file__).parent.parent / "data" / "processed"

SEQ_LEN = 30
NUM_LANDMARKS = 21
COORDS = 3
MIN_DETECTION_RATIO = 0.5   # mirrors the threshold validate_data.py warns on
MAX_INTERP_GAP = 5          # frames; longer gaps are treated as detection failure, not interpolated


def load_rep(filepath: Path) -> dict:
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def remap_hands(frames: list) -> tuple[np.ndarray, np.ndarray]:
    """
    frames -> (left, right), each (T, 21, 3), np.nan where undetected.
    NaN (not zero) so 'undetected' is distinguishable from a real zero landmark
    during interpolation.
    """
    T = len(frames)
    left = np.full((T, NUM_LANDMARKS, COORDS), np.nan, dtype=np.float32)
    right = np.full((T, NUM_LANDMARKS, COORDS), np.nan, dtype=np.float32)

    for t, frame in enumerate(frames):
        for slot_key in ("hand_1", "hand_2"):
            hand = frame.get(slot_key)
            if hand is None:
                continue
            arr = np.array(hand["landmarks"], dtype=np.float32)
            if hand["handedness"] == "Left":
                left[t] = arr
            elif hand["handedness"] == "Right":
                right[t] = arr
    return left, right


def interpolate_hand(hand_arr: np.ndarray) -> tuple[np.ndarray, float]:
    """
    hand_arr: (T, 21, 3), np.nan where undetected.
    Returns (filled, detection_ratio). detection_ratio == 0.0 is a valid,
    expected state for a one-handed sign, not a data-quality problem.
    """
    T = hand_arr.shape[0]
    valid = ~np.isnan(hand_arr[:, 0, 0])
    detection_ratio = float(valid.sum()) / T

    if not valid.any():
        return np.zeros_like(hand_arr), 0.0

    filled = hand_arr.copy()
    valid_idx = np.where(valid)[0]

    # edge-fill: hold nearest valid frame before first / after last detection
    filled[: valid_idx[0]] = hand_arr[valid_idx[0]]
    filled[valid_idx[-1] + 1:] = hand_arr[valid_idx[-1]]

    # interpolate internal gaps only (between first and last valid frame)
    gap_start = None
    for t in range(valid_idx[0], valid_idx[-1] + 1):
        if not valid[t]:
            if gap_start is None:
                gap_start = t
            continue
        if gap_start is not None:
            gap_len = t - gap_start
            if gap_len <= MAX_INTERP_GAP:
                prev_frame = filled[gap_start - 1]
                next_frame = filled[t]
                for i, g in enumerate(range(gap_start, t), start=1):
                    alpha = i / (gap_len + 1)
                    filled[g] = (1 - alpha) * prev_frame + alpha * next_frame
            else:
                filled[gap_start:t] = 0.0  # dropout too long to trust
            gap_start = None

    return filled, detection_ratio


def wrist_relative(hand_arr: np.ndarray) -> np.ndarray:
    return hand_arr - hand_arr[:, 0:1, :]


def velocity(hand_arr: np.ndarray) -> np.ndarray:
    v = np.zeros_like(hand_arr)
    v[1:] = hand_arr[1:] - hand_arr[:-1]
    return v


def resample_sequence(feat: np.ndarray, target_len: int = SEQ_LEN) -> np.ndarray:
    T = feat.shape[0]
    if T == target_len:
        return feat
    if T > target_len:
        idx = np.linspace(0, T - 1, target_len).round().astype(int)
        return feat[idx]
    pad = np.zeros((target_len - T, feat.shape[1]), dtype=feat.dtype)
    return np.concatenate([feat, pad], axis=0)


def process_rep(filepath: Path):
    """Returns (feature_array (30,252), None) or (None, exclusion_reason)."""
    rep = load_rep(filepath)
    frames = rep["frames"]
    if len(frames) < 3:
        return None, f"too few frames ({len(frames)})"

    left_raw, right_raw = remap_hands(frames)
    left_filled, left_ratio = interpolate_hand(left_raw)
    right_filled, right_ratio = interpolate_hand(right_raw)

    for ratio in (left_ratio, right_ratio):
        if 0.0 < ratio < MIN_DETECTION_RATIO:
            return None, f"low detection ratio ({ratio:.2f})"

    left_norm = wrist_relative(left_filled)
    right_norm = wrist_relative(right_filled)
    left_vel = velocity(left_norm)
    right_vel = velocity(right_norm)

    T = len(frames)
    feat = np.concatenate([
        left_norm.reshape(T, -1),
        right_norm.reshape(T, -1),
        left_vel.reshape(T, -1),
        right_vel.reshape(T, -1),
    ], axis=1)  # (T, 252) -- fixed order, see module docstring

    return resample_sequence(feat, SEQ_LEN).astype(np.float32), None


def main():
    label_map = {label: i for i, label in enumerate(CLASS_LABELS)}
    X, y = [], []
    excluded = []
    per_class_counts = defaultdict(int)

    for signer_dir in sorted(p for p in RAW_DIR.iterdir() if p.is_dir()):
        for class_dir in sorted(p for p in signer_dir.iterdir() if p.is_dir()):
            label = class_dir.name
            if label not in label_map:
                excluded.append(f"unknown class label '{label}' in {class_dir}")
                continue
            for rep_file in sorted(class_dir.glob("*.json")):
                feat, reason = process_rep(rep_file)
                if feat is None:
                    excluded.append(f"{signer_dir.name}/{label}/{rep_file.name}: {reason}")
                    continue
                X.append(feat)
                y.append(label_map[label])
                per_class_counts[label] += 1

    if not X:
        print("No valid reps found under data/raw/. Nothing to process.")
        return

    X = np.stack(X)
    y = np.array(y, dtype=np.int64)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    np.save(OUT_DIR / "X.npy", X)
    np.save(OUT_DIR / "y.npy", y)
    with open(OUT_DIR / "label_map.json", "w", encoding="utf-8") as f:
        json.dump(label_map, f, indent=2, ensure_ascii=False)

    report = {
        "total_sequences": int(X.shape[0]),
        "shape": list(X.shape),
        "per_class_counts": dict(per_class_counts),
        "excluded_count": len(excluded),
        "excluded_reps": excluded,
    }
    with open(OUT_DIR / "preprocessing_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"Processed {X.shape[0]} sequences -> X{list(X.shape)}, y{list(y.shape)}")
    print(f"Excluded {len(excluded)} reps (see data/processed/preprocessing_report.json)")


if __name__ == "__main__":
    main()