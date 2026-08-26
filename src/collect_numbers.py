import cv2
import time
import os
import csv
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ===================== CONFIG =====================
GESTURE_LABEL = "0"   # CHANGE THIS (0–20)
RECORD_SECONDS = 3
FPS = 30
SAVE_DIR = f"../data/raw_landmarks/{GESTURE_LABEL}"
MODEL_PATH = "../models/hand_landmarker.task"

os.makedirs(SAVE_DIR, exist_ok=True)

# ===================== MEDIAPIPE SETUP =====================
BaseOptions = python.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
RunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=RunningMode.VIDEO,
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

# ===================== CAMERA =====================
cap = cv2.VideoCapture(0)
recording = False
frames_recorded = 0
max_frames = RECORD_SECONDS * FPS
timestamp = 0

print("Press 's' to start recording")
print("Press 'q' to quit")

# ===================== MAIN LOOP =====================
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=frame_rgb
    )

    result = landmarker.detect_for_video(mp_image, timestamp)
    timestamp += int(1000 / FPS)

    # Draw landmarks
    if result.hand_landmarks:
        for landmarks in result.hand_landmarks:
            for lm in landmarks:
                h, w, _ = frame.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)

    cv2.imshow("Recording", frame)

    key = cv2.waitKey(1) & 0xFF

    # START RECORDING
    if key == ord('s') and not recording:
        print("Recording started...")
        recording = True
        frames_recorded = 0
        csv_path = os.path.join(
            SAVE_DIR, f"{int(time.time())}.csv"
        )
        csv_file = open(csv_path, "w", newline="")
        csv_writer = csv.writer(csv_file)

    # RECORD DATA
    if recording and result.hand_landmarks:
        landmarks = result.hand_landmarks[0]
        row = []
        for lm in landmarks:
            row.extend([lm.x, lm.y, lm.z])
        csv_writer.writerow(row)

        frames_recorded += 1

        if frames_recorded >= max_frames:
            recording = False
            csv_file.close()
            print("Recording finished.")

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
