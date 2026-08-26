"""
collect_data.py
For EtSl data collection tool - Uses Mediapipe Tasks API(HandLandmarker), for the model-version tracebility in the Dataset.

Scope: this is hands only because it is v1. All 15 locked classes are hand-shaper/motion driven

Controld:
Space Bar - start recording 
r - redo
n - next class
p - previous class
q/ESC - quit(progress saved per-rep, resumable)

"""


# Importing the standard liberaries
from __future__ import annotations

import json
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

# Importing the dependancies
import cv2 # Webcam Capture
import mediapipe as mp # DETECTION
from mediapipe.tasks.python import BaseOptions 
from mediapipe.tasks.python import vision as mp_vision

from class_list import CLASSES, REPS_PER_CLASS, VALID_SIGNER_IDS # Pulls the locked 15 word list and constatnts from class_list.py



# Path setup
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = ROOT_DIR / "data" / "raw"
MODEL_PATH = ROOT_DIR / "models" / "hand_landmarker.task"
MODEL_VERSION = "1" # the hardcoded string into every saved rep

# Timing knobs from the data collection protocol we follow
RECORD_SECONDS = 1.8
COUNTDOWN_SECONDS = 1.5
TARGET_FPS = 30
FRAME_INTERVAL_MS = 33
MIN_DETECTION_RATIO_WARN = 0.5 # this warns if less than half the frames had a detected hand which is the threshold from the protocol document


# the webcam settings
CAM_INDEX = 0
FRAME_W, FRAME_H = 960, 720


# the 21-point hand skeleton's line-connection topology(meaning which landmark connects to which), it is pulled from MediaPipe's Tasks API
HAND_CONNECTIONS = [
    (c.start, c.end) for c in mp_vision.HandLandmarksConnections.HAND_CONNECTIONS
]

# the container holding which signer is recording, what class they are currently on, and the path to which the last file saved(so the redo(r) knows what to delete)
@dataclass
class SessionState:
    signer_id: str
    class_idx: int = 0
    last_saved_path: Path | None = None

# just hands out an ever-increasing millisecond counter so every call to detect() anywhere in the script (idle preview, countdown, actual recording) shares one consistent, always-increasing timeline.
class MonotonicClock:
    """Shared, strictly-increasing millisecond timestamp for detect_for_video."""

    def __init__(self) -> None:
        self._ms = 0

    def tick(self) -> int:
        self._ms += FRAME_INTERVAL_MS
        return self._ms


# Loadint the hand_landmarker.task from the disk
def build_landmarker() -> mp_vision.HandLandmarker:
    if not MODEL_PATH.exists():
        sys.exit(f"Model file not found: {MODEL_PATH}")
    options = mp_vision.HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(MODEL_PATH)),
        running_mode=mp_vision.RunningMode.VIDEO,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    return mp_vision.HandLandmarker.create_from_options(options)


# Blocks on user input until a real signer ID (s1 to s5) is entered 
def get_signer_id() -> str:
    while True:
        signer_id = input(f"Signer ID {VALID_SIGNER_IDS}: ").strip().lower()
        if signer_id in VALID_SIGNER_IDS:
            return signer_id
        print(f"Invalid. Choose one of {VALID_SIGNER_IDS}.")


# counting how many .json files already exists for a given signer+class by just counting
def existing_rep_count(signer_id: str, class_label: str) -> int:
    class_dir = DATA_RAW_DIR / signer_id / class_label
    return len(list(class_dir.glob("*.json"))) if class_dir.is_dir() else 0


# Converts an OpenCV BGR frames to the RGB format
def detect(landmarker: mp_vision.HandLandmarker, frame_bgr, timestamp_ms: int):
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    return landmarker.detect_for_video(mp_image, timestamp_ms)


# Takes MediaPipe's raw detection result and produces the hand_1/hand_2 structure that gets saved to JSON
def result_to_hand_slots(result) -> tuple[dict | None, dict | None]:
    """Raw, unordered detection output as (hand_1, hand_2). Downstream
    preprocessing remaps by `handedness`, not by slot position -- MediaPipe's
    slot order is not guaranteed stable across frames."""
    if not result.hand_landmarks:
        return None, None
    slots: list[dict] = []
    for landmarks, handedness in zip(result.hand_landmarks, result.handedness):
        slots.append({
            "handedness": handedness[0].category_name,
            "confidence": round(float(handedness[0].score), 4),
            "landmarks": [[lm.x, lm.y, lm.z] for lm in landmarks],
        })
    hand_1 = slots[0] if len(slots) > 0 else None
    hand_2 = slots[1] if len(slots) > 1 else None
    return hand_1, hand_2


# takes whatever hands were detected and draws a skeleton directly to the frame for an on screen display
def draw_overlay(frame, result):
    h, w = frame.shape[:2]
    for hand in result.hand_landmarks:
        pts = [(int(lm.x * w), int(lm.y * h)) for lm in hand]
        for a, b in HAND_CONNECTIONS:
            cv2.line(frame, pts[a], pts[b], (0, 220, 120), 2)
        for x, y in pts:
            cv2.circle(frame, (x, y), 3, (0, 255, 180), -1)
    return frame


# Draws status bar at the top
def draw_hud(frame, class_info, rep_num, total_reps, class_idx, total_classes,
             status_text, status_color):
    h, w = frame.shape[:2]
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 112), (0, 0, 0), -1)
    frame = cv2.addWeighted(overlay, 0.55, frame, 0.45, 0)

    gloss = f"{class_info['amharic']}  ({class_info['label']} - {class_info['gloss']})"
    hands_note = "TWO-HANDED SIGN" if class_info["two_handed"] else "one-handed sign"
    hands_color = (0, 200, 255) if class_info["two_handed"] else (180, 180, 180)

    cv2.putText(frame, gloss, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
    cv2.putText(frame, hands_note, (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.6, hands_color, 1)
    cv2.putText(frame, f"Class {class_idx + 1}/{total_classes}  |  Rep {rep_num}/{total_reps}",
                (20, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 220, 180), 1)
    cv2.putText(frame, status_text, (20, h - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)
    cv2.putText(frame, "SPACE=record  r=redo last  n=next class  p=prev class  q=quit",
                (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
    return frame

# Buils the final JSON record
def save_rep(signer_id: str, class_label: str, rep_num: int, frames: list[dict]) -> Path:
    class_dir = DATA_RAW_DIR / signer_id / class_label
    class_dir.mkdir(parents=True, exist_ok=True)
    filepath = class_dir / f"{signer_id}_{class_label}_{rep_num:03d}.json"
    record = {
        "signer_id": signer_id,
        "class_label": class_label,
        "rep_num": rep_num,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "fps": TARGET_FPS,
        "mediapipe_model": MODEL_PATH.name,
        "mediapipe_model_version": MODEL_VERSION,
        "frames": frames,
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(record, f)
    return filepath


# loops for Countdown_seconds 
def run_countdown(cap: cv2.VideoCapture, class_info, rep_num: int, class_idx: int) -> None:
    start = time.time()
    while time.time() - start < COUNTDOWN_SECONDS:
        ok, frame = cap.read()
        if not ok:
            return
        frame = cv2.flip(frame, 1)
        remaining = COUNTDOWN_SECONDS - (time.time() - start)
        disp = draw_hud(frame, class_info, rep_num, REPS_PER_CLASS, class_idx, len(CLASSES),
                         f"GET READY... {remaining:.1f}s", (0, 165, 255))
        cv2.imshow("EthSL Data Collection", disp)
        cv2.waitKey(1)

# reads each frame, runs detection, converts the reseult and finally shows the recording status 
def record_window(cap: cv2.VideoCapture, landmarker: mp_vision.HandLandmarker,
                   clock: MonotonicClock, class_info, rep_num: int, class_idx: int) -> list[dict]:
    frames: list[dict] = []
    start = time.time()
    frame_idx = 0
    while time.time() - start < RECORD_SECONDS:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.flip(frame, 1)
        result = detect(landmarker, frame, clock.tick())
        hand_1, hand_2 = result_to_hand_slots(result)
        frames.append({"frame_idx": frame_idx, "hand_1": hand_1, "hand_2": hand_2})
        frame_idx += 1

        disp = draw_overlay(frame.copy(), result)
        disp = draw_hud(disp, class_info, rep_num, REPS_PER_CLASS, class_idx, len(CLASSES),
                         "RECORDING...", (0, 0, 255))
        cv2.imshow("EthSL Data Collection", disp)
        cv2.waitKey(1)
    return frames


# this just ties everything above together 
def main() -> None:
    signer_id = get_signer_id()
    DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(CAM_INDEX)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_W)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_H)
    if not cap.isOpened():
        sys.exit("Could not open webcam.")

    landmarker = build_landmarker()
    clock = MonotonicClock()
    state = SessionState(signer_id=signer_id)

    try:
        while True:
            class_info = CLASSES[state.class_idx]
            class_label = class_info["label"]
            rep_num = existing_rep_count(signer_id, class_label) + 1
            done = rep_num > REPS_PER_CLASS

            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.flip(frame, 1)
            result = detect(landmarker, frame, clock.tick())

            status_text = (f"DONE: {REPS_PER_CLASS}/{REPS_PER_CLASS} reps complete" if done
                            else "Ready - press SPACE to record")
            status_color = (0, 255, 0) if done else (255, 255, 255)

            disp = draw_overlay(frame.copy(), result)
            disp = draw_hud(disp, class_info, min(rep_num, REPS_PER_CLASS), REPS_PER_CLASS,
                             state.class_idx, len(CLASSES), status_text, status_color)
            cv2.imshow("EthSL Data Collection", disp)

            key = cv2.waitKey(1) & 0xFF

            if key in (ord('q'), 27):
                break

            elif key == ord('n'):
                state.class_idx = (state.class_idx + 1) % len(CLASSES)

            elif key == ord('p'):
                state.class_idx = (state.class_idx - 1) % len(CLASSES)

            elif key == ord('r'):
                if state.last_saved_path and state.last_saved_path.exists():
                    state.last_saved_path.unlink()
                    print(f"Deleted {state.last_saved_path.name} - re-record when ready.")
                    state.last_saved_path = None
                else:
                    print("Nothing to redo.")

            elif key == ord(' ') and not done:
                run_countdown(cap, class_info, rep_num, state.class_idx)
                frames = record_window(cap, landmarker, clock, class_info, rep_num, state.class_idx)
                saved_path = save_rep(signer_id, class_label, rep_num, frames)
                state.last_saved_path = saved_path

                detected = sum(1 for f in frames if f["hand_1"] is not None)
                ratio = detected / len(frames) if frames else 0.0
                print(f"Saved {saved_path.name}  ({len(frames)} frames, "
                      f"{detected} with a detected hand, ratio={ratio:.2f})")
                if ratio < MIN_DETECTION_RATIO_WARN:
                    print("  WARNING: low hand-detection ratio. Consider pressing 'r' to redo.")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        landmarker.close()
        print("Session ended. Progress saved per-rep; resume any time by re-running this script.")


if __name__ == "__main__":
    main()