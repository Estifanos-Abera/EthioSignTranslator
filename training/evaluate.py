"""
evaluate.py — generates all evaluation outputs from the trained model.

Reads:
    models/trained/best_model.keras
    models/trained/X_test.npy
    models/trained/y_test.npy
    models/trained/training_history.json
    models/trained/label_map.json

Writes to documents/project_docs/results/:
    confusion_matrix.png
    training_curves.png
    classification_report.md

Usage:
    python evaluate.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "models" / "trained"
RESULTS_DIR = ROOT_DIR / "documents" / "project_docs" / "results"


def load_artifacts():
    model = tf.keras.models.load_model(MODEL_DIR / "best_model.keras")
    X_test = np.load(MODEL_DIR / "X_test.npy")
    y_test = np.load(MODEL_DIR / "y_test.npy")
    with open(MODEL_DIR / "training_history.json", encoding="utf-8") as f:
        history = json.load(f)
    with open(MODEL_DIR / "label_map.json", encoding="utf-8") as f:
        label_map = json.load(f)
    idx_to_label = {v: k for k, v in label_map.items()}
    class_names = [idx_to_label[i] for i in range(len(idx_to_label))]
    return model, X_test, y_test, history, class_names


def plot_training_curves(history: dict, out_path: Path) -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(history["accuracy"], label="Train accuracy")
    ax1.plot(history["val_accuracy"], label="Val accuracy")
    ax1.set_title("Accuracy")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Accuracy")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot(history["loss"], label="Train loss")
    ax2.plot(history["val_loss"], label="Val loss")
    ax2.set_title("Loss")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Loss")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Training curves saved to {out_path}")


def plot_confusion_matrix(y_true, y_pred, class_names: list[str], out_path: Path) -> None:
    cm = confusion_matrix(y_true, y_pred)
    cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)

    fig, ax = plt.subplots(figsize=(14, 12))
    sns.heatmap(
        cm_norm, annot=True, fmt=".2f", cmap="Blues",
        xticklabels=class_names, yticklabels=class_names,
        ax=ax, vmin=0, vmax=1,
    )
    ax.set_xlabel("Predicted", fontsize=12)
    ax.set_ylabel("True", fontsize=12)
    ax.set_title("Confusion Matrix (normalised by true class)", fontsize=14)
    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Confusion matrix saved to {out_path}")


def write_classification_report(
    y_true, y_pred, class_names: list[str],
    test_acc: float, out_path: Path
) -> None:
    report = classification_report(y_true, y_pred, target_names=class_names)
    content = f"# Classification Report\n\n**Test accuracy: {test_acc:.4f}**\n\n```\n{report}\n```\n"
    out_path.write_text(content, encoding="utf-8")
    print(f"Classification report saved to {out_path}")


def main() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    print("Loading model and test data...")
    model, X_test, y_test, history, class_names = load_artifacts()

    print("Running predictions on test set...")
    y_pred_probs = model.predict(X_test, verbose=0)
    y_pred = np.argmax(y_pred_probs, axis=1)

    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest accuracy : {test_acc:.4f}")
    print(f"Test loss     : {test_loss:.4f}\n")

    plot_training_curves(history, RESULTS_DIR / "training_curves.png")
    plot_confusion_matrix(y_test, y_pred, class_names, RESULTS_DIR / "confusion_matrix.png")
    write_classification_report(
        y_test, y_pred, class_names, test_acc,
        RESULTS_DIR / "classification_report.md"
    )

    print("\nDone. Check documents/project_docs/results/ for all outputs.")
    print("\nQuick confusion summary (worst confused pairs):")
    cm = confusion_matrix(y_test, y_pred)
    for i in range(len(class_names)):
        for j in range(len(class_names)):
            if i != j and cm[i, j] > 0:
                print(f"  True '{class_names[i]}' predicted as '{class_names[j]}': {cm[i, j]} time(s)")


if __name__ == "__main__":
    main()