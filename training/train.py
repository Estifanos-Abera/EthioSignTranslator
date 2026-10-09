"""
train.py — trains the GRU classifier on data/processed/X.npy, y.npy.

Architecture (locked spec):
    Input(30,252) -> Masking -> GRU(64, return_sequences=True) -> Dropout(0.3)
    -> GRU(32) -> Dropout(0.3) -> Dense(32, relu) -> Dense(15, softmax)

70/15/15 stratified split, pooled across all signers (not cross-signer).
Adam optimizer, categorical crossentropy, early stopping on val_loss.

Usage:
    python train.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split

from class_list import CLASS_LABELS

ROOT_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
MODEL_OUT_DIR = ROOT_DIR / "models" / "trained"

SEQ_LEN = 30
NUM_FEATURES = 252
NUM_CLASSES = len(CLASS_LABELS)

BATCH_SIZE = 32
MAX_EPOCHS = 100
EARLY_STOPPING_PATIENCE = 10
LEARNING_RATE = 0.001
VAL_FRACTION = 0.15
TEST_FRACTION = 0.15
RANDOM_SEED = 42


def load_data() -> tuple[np.ndarray, np.ndarray]:
    X = np.load(PROCESSED_DIR / "X.npy")
    y = np.load(PROCESSED_DIR / "y.npy")
    if X.shape[1:] != (SEQ_LEN, NUM_FEATURES):
        raise ValueError(f"Unexpected X shape {X.shape}, expected (N, {SEQ_LEN}, {NUM_FEATURES})")
    return X, y


def split_data(X: np.ndarray, y: np.ndarray):
    """70/15/15 stratified split, pooled across signers."""
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=VAL_FRACTION + TEST_FRACTION,
        stratify=y, random_state=RANDOM_SEED,
    )
    relative_test_frac = TEST_FRACTION / (VAL_FRACTION + TEST_FRACTION)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=relative_test_frac,
        stratify=y_temp, random_state=RANDOM_SEED,
    )
    return X_train, y_train, X_val, y_val, X_test, y_test


def build_model() -> tf.keras.Model:
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(SEQ_LEN, NUM_FEATURES)),
        tf.keras.layers.Masking(mask_value=0.0),
        tf.keras.layers.GRU(64, return_sequences=True),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.GRU(32),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dense(NUM_CLASSES, activation="softmax"),
    ])
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main() -> None:
    X, y = load_data()
    class_counts = np.bincount(y, minlength=NUM_CLASSES)
    print(f"Loaded {X.shape[0]} sequences across {NUM_CLASSES} classes.")
    print("Per-class counts:", dict(zip(CLASS_LABELS, class_counts.tolist())))

    missing = [CLASS_LABELS[i] for i, c in enumerate(class_counts) if c == 0]
    if missing:
        raise ValueError(f"No examples at all for classes: {missing}. Cannot train.")
    thin = [CLASS_LABELS[i] for i, c in enumerate(class_counts) if 0 < c < 3]
    if thin:
        print(f"WARNING: very few examples for {thin} -- stratified split may be unreliable.")

    X_train, y_train, X_val, y_val, X_test, y_test = split_data(X, y)
    print(f"Split: train={len(X_train)}  val={len(X_val)}  test={len(X_test)}")

    model = build_model()
    model.summary()

    MODEL_OUT_DIR.mkdir(parents=True, exist_ok=True)
    checkpoint_path = MODEL_OUT_DIR / "best_model.keras"

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=EARLY_STOPPING_PATIENCE, restore_best_weights=True,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path), monitor="val_loss", save_best_only=True,
        ),
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        batch_size=BATCH_SIZE,
        epochs=MAX_EPOCHS,
        callbacks=callbacks,
        verbose=2,
    )

    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest accuracy: {test_acc:.4f}  |  Test loss: {test_loss:.4f}")

    # Persist test split + history so evaluate.py can build the confusion matrix
    # and training curves without re-splitting (which would risk a different split).
    np.save(MODEL_OUT_DIR / "X_test.npy", X_test)
    np.save(MODEL_OUT_DIR / "y_test.npy", y_test)
    with open(MODEL_OUT_DIR / "training_history.json", "w", encoding="utf-8") as f:
        json.dump({k: [float(v) for v in vals] for k, vals in history.history.items()}, f, indent=2)
    with open(MODEL_OUT_DIR / "label_map.json", "w", encoding="utf-8") as f:
        json.dump({label: i for i, label in enumerate(CLASS_LABELS)}, f, indent=2, ensure_ascii=False)

    print(f"\nBest model saved to {checkpoint_path}")
    print(f"Test split + history saved to {MODEL_OUT_DIR} (for evaluate.py)")


if __name__ == "__main__":
    main()