import cv2
import csv
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import time
import numpy as np


GESTURE_NAME = "0"   # lets remember to change this every time according to the folders
SAVE_DIR = f"data/raw_landmarks/{GESTURE_NAME}"
MODEL_PATH = "models/hand_landmarker.task"
NUM_FRAMES = 20


os.makedirs(SAVE_DIR, exist_ok=True)

BaseOptions = python.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

cap = cv2.VideoCapture(1)

sequence = []
frame_id = 0
timestamp_ms = 0
recording = False

print("Press 's' to start recording…")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

    result = landmarker.detect_for_video(mp_image, timestamp_ms)
    timestamp_ms += 33

    if recording and result.hand_landmarks:

        hand = result.hand_landmarks[0]
        wrist = hand[0]

        frame_landmarks = []

        for lm in hand:
            x = lm.x - wrist.x
            y = lm.y - wrist.y
            z = lm.z - wrist.z
            frame_landmarks.extend([x, y, z])

        sequence.append(frame_landmarks)   
        frame_id += 1

    cv2.imshow("Recording Landmarks", frame)

    key = cv2.waitKey(1)

    if key == ord('s') and not recording:
        print("Recording started...")
        recording = True
        sequence = []
        frame_id = 0
    if recording and frame_id >= NUM_FRAMES:
        break
    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

sequence = np.array(sequence)

filename = f"{GESTURE_NAME}_{int(time.time())}.npy"
filepath = os.path.join(SAVE_DIR, filename)

np.save(filepath, sequence)

print("Saved sample:", filepath)
print("Sample shape:", sequence.shape)