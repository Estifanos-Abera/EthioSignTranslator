"""
visualize.py — advanced research-grade visualizations for the trained EthSL model.

Reads from models/trained/:
    best_model.keras, X_test.npy, y_test.npy,
    training_history.json, label_map.json

Writes to documents/project_docs/results/figures/:
    training_curves_animated.gif   — animated accuracy + loss curves
    training_curves_styled.png     — publication-quality static training curves
    tsne_embeddings.png            — t-SNE of GRU hidden states, coloured by class
    confidence_violin.png          — per-class prediction confidence distributions
    radar_chart.png                — per-class precision / recall / F1 spider plot
    loss_surface_3d.png            — 3D loss landscape around trained weights
    temporal_attention.png         — per-frame importance for a sample prediction

Usage:
    pip install scikit-learn matplotlib seaborn imageio
    python visualize.py

Note: loss_surface_3d is computationally heavy (~2-5 min on CPU). It is run
last and can be skipped by passing --skip-loss-surface on the command line.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import imageio.v2 as imageio
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib import animation
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
import numpy as np
import seaborn as sns
import tensorflow as tf
from sklearn.manifold import TSNE
from sklearn.metrics import precision_recall_fscore_support
from sklearn.preprocessing import label_binarize

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "models" / "trained"
FIG_DIR = ROOT_DIR / "documents" / "project_docs" / "results" / "figures"

PALETTE = sns.color_palette("tab20", 15)


# ---------------------------------------------------------------------------
# Load
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# 1. Animated training curves (GIF)
# ---------------------------------------------------------------------------
def animated_training_curves(history: dict, out_path: Path) -> None:
    acc = history["accuracy"]
    val_acc = history["val_accuracy"]
    loss = history["loss"]
    val_loss = history["val_loss"]
    epochs = len(acc)

    frames = []
    tmp_paths = []
    for ep in range(1, epochs + 1):
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        fig.patch.set_facecolor("#0f0f0f")
        for ax in (ax1, ax2):
            ax.set_facecolor("#1a1a2e")
            ax.tick_params(colors="white")
            for spine in ax.spines.values():
                spine.set_edgecolor("#444")

        ax1.plot(range(1, ep + 1), acc[:ep], color="#00d4ff", lw=2, label="Train")
        ax1.plot(range(1, ep + 1), val_acc[:ep], color="#ff6b6b", lw=2, label="Val", linestyle="--")
        ax1.set_xlim(1, epochs)
        ax1.set_ylim(0, 1.05)
        ax1.set_title("Accuracy", color="white", fontsize=13, fontweight="bold")
        ax1.set_xlabel("Epoch", color="white")
        ax1.set_ylabel("Accuracy", color="white")
        ax1.legend(facecolor="#1a1a2e", labelcolor="white")
        ax1.grid(True, alpha=0.2, color="#444")

        ax2.plot(range(1, ep + 1), loss[:ep], color="#00d4ff", lw=2, label="Train")
        ax2.plot(range(1, ep + 1), val_loss[:ep], color="#ff6b6b", lw=2, label="Val", linestyle="--")
        ax2.set_xlim(1, epochs)
        ax2.set_ylim(0, max(loss) * 1.1)
        ax2.set_title("Loss", color="white", fontsize=13, fontweight="bold")
        ax2.set_xlabel("Epoch", color="white")
        ax2.set_ylabel("Loss", color="white")
        ax2.legend(facecolor="#1a1a2e", labelcolor="white")
        ax2.grid(True, alpha=0.2, color="#444")

        fig.suptitle(f"EthSL GRU Training  |  Epoch {ep}/{epochs}",
                     color="white", fontsize=14, fontweight="bold")
        plt.tight_layout()

        tmp = FIG_DIR / f"_frame_{ep:03d}.png"
        plt.savefig(tmp, dpi=80, facecolor=fig.get_facecolor())
        plt.close()
        tmp_paths.append(tmp)
        frames.append(imageio.imread(tmp))

    imageio.mimsave(out_path, frames, fps=6, loop=0)
    for p in tmp_paths:
        p.unlink()
    print(f"Animated training curves saved to {out_path}")


# ---------------------------------------------------------------------------
# 2. Publication-quality static training curves
# ---------------------------------------------------------------------------
def styled_training_curves(history: dict, out_path: Path) -> None:
    acc = history["accuracy"]
    val_acc = history["val_accuracy"]
    loss = history["loss"]
    val_loss = history["val_loss"]
    epochs = range(1, len(acc) + 1)
    best_ep = int(np.argmin(val_loss)) + 1

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    fig.patch.set_facecolor("#0f0f0f")
    for ax in (ax1, ax2):
        ax.set_facecolor("#1a1a2e")
        ax.tick_params(colors="white")
        for spine in ax.spines.values():
            spine.set_edgecolor("#333")

    for ax, train, val, ylabel in [
        (ax1, acc, val_acc, "Accuracy"),
        (ax2, loss, val_loss, "Loss"),
    ]:
        ax.plot(epochs, train, color="#00d4ff", lw=2.5, label="Train")
        ax.plot(epochs, val, color="#ff6b6b", lw=2.5, label="Validation", linestyle="--")
        ax.axvline(best_ep, color="#ffe066", lw=1.5, linestyle=":", alpha=0.8, label=f"Best epoch ({best_ep})")
        ax.fill_between(epochs, train, val, alpha=0.07, color="#ffffff")
        ax.set_xlabel("Epoch", color="white", fontsize=12)
        ax.set_ylabel(ylabel, color="white", fontsize=12)
        ax.set_title(ylabel, color="white", fontsize=14, fontweight="bold")
        ax.legend(facecolor="#1a1a2e", labelcolor="white", fontsize=10)
        ax.grid(True, alpha=0.15, color="#555")

    fig.suptitle("EthSL GRU — Training History", color="white", fontsize=16, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Styled training curves saved to {out_path}")


# ---------------------------------------------------------------------------
# 3. t-SNE of GRU hidden states
# ---------------------------------------------------------------------------
def tsne_embeddings(model: tf.keras.Model, X_test: np.ndarray,
                    y_test: np.ndarray, class_names: list[str], out_path: Path) -> None:
    # Extract the output of the last GRU layer (32-dim hidden state)
    extractor = tf.keras.Model(
    inputs=model.inputs,
    outputs=model.layers[-3].output,
)
    hidden = extractor.predict(X_test, verbose=0)

    print("  Running t-SNE (may take a minute)...")
    perplexity = min(30, len(X_test) - 1)
    tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, max_iter=1000)
    embedded = tsne.fit_transform(hidden)

    fig, ax = plt.subplots(figsize=(14, 11))
    fig.patch.set_facecolor("#0f0f0f")
    ax.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#333")

    for i, name in enumerate(class_names):
        mask = y_test == i
        if not mask.any():
            continue
        ax.scatter(
            embedded[mask, 0], embedded[mask, 1],
            color=PALETTE[i], label=name, alpha=0.85,
            s=80, edgecolors="white", linewidths=0.4,
        )
        centre = embedded[mask].mean(axis=0)
        ax.annotate(name, centre, color="white", fontsize=8,
                    ha="center", va="center",
                    bbox=dict(boxstyle="round,pad=0.2", fc="#0f0f0f", alpha=0.6))

    ax.set_title("t-SNE of GRU Hidden States (coloured by class)",
                 color="white", fontsize=14, fontweight="bold")
    ax.set_xlabel("t-SNE 1", color="white")
    ax.set_ylabel("t-SNE 2", color="white")
    ax.legend(facecolor="#1a1a2e", labelcolor="white", fontsize=8,
              loc="upper right", ncol=2)
    ax.grid(True, alpha=0.1, color="#555")
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"t-SNE embeddings saved to {out_path}")


# ---------------------------------------------------------------------------
# 4. Per-class confidence violin plot
# ---------------------------------------------------------------------------
def confidence_violin(model: tf.keras.Model, X_test: np.ndarray,
                      y_test: np.ndarray, class_names: list[str], out_path: Path) -> None:
    probs = model.predict(X_test, verbose=0)
    # For each sample, confidence = probability assigned to the TRUE class
    true_confidences = probs[np.arange(len(y_test)), y_test]

    data_per_class = [true_confidences[y_test == i] for i in range(len(class_names))]
    data_per_class = [d if len(d) > 0 else np.array([0.0]) for d in data_per_class]

    fig, ax = plt.subplots(figsize=(18, 7))
    fig.patch.set_facecolor("#0f0f0f")
    ax.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#333")

    parts = ax.violinplot(data_per_class, positions=range(len(class_names)),
                          showmeans=True, showmedians=True)
    for i, pc in enumerate(parts["bodies"]):
        pc.set_facecolor(PALETTE[i])
        pc.set_alpha(0.75)
    for part in ("cmeans", "cmedians", "cbars", "cmins", "cmaxes"):
        if part in parts:
            parts[part].set_edgecolor("white")
            parts[part].set_linewidth(1.2)

    ax.set_xticks(range(len(class_names)))
    ax.set_xticklabels(class_names, rotation=45, ha="right", color="white", fontsize=10)
    ax.set_ylabel("Confidence (prob assigned to true class)", color="white", fontsize=11)
    ax.set_title("Per-class Prediction Confidence Distribution",
                 color="white", fontsize=14, fontweight="bold")
    ax.set_ylim(0, 1.05)
    ax.axhline(0.5, color="#ffe066", lw=1, linestyle="--", alpha=0.6, label="0.5 threshold")
    ax.legend(facecolor="#1a1a2e", labelcolor="white")
    ax.grid(True, alpha=0.1, color="#555", axis="y")
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Confidence violin saved to {out_path}")


# ---------------------------------------------------------------------------
# 5. Radar / spider chart — per-class P / R / F1
# ---------------------------------------------------------------------------
def radar_chart(model: tf.keras.Model, X_test: np.ndarray,
                y_test: np.ndarray, class_names: list[str], out_path: Path) -> None:
    y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, labels=range(len(class_names)), zero_division=0
    )

    N = len(class_names)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(13, 13), subplot_kw={"polar": True})
    fig.patch.set_facecolor("#0f0f0f")
    ax.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    ax.spines["polar"].set_color("#444")
    ax.grid(color="#444", linewidth=0.5, alpha=0.5)

    for values, label, color in [
        (precision, "Precision", "#00d4ff"),
        (recall,    "Recall",    "#ff6b6b"),
        (f1,        "F1",        "#ffe066"),
    ]:
        vals = values.tolist() + values[:1].tolist()
        ax.plot(angles, vals, color=color, lw=2.5, label=label)
        ax.fill(angles, vals, color=color, alpha=0.1)

    ax.set_thetagrids(np.degrees(angles[:-1]), class_names, color="white", fontsize=10)
    ax.set_ylim(0, 1)
    ax.set_yticks([0.25, 0.5, 0.75, 1.0])
    ax.set_yticklabels(["0.25", "0.50", "0.75", "1.00"], color="#aaa", fontsize=8)
    ax.set_title("Per-class Precision / Recall / F1",
                 color="white", fontsize=15, fontweight="bold", pad=25)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.15),
              facecolor="#1a1a2e", labelcolor="white", fontsize=11)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Radar chart saved to {out_path}")


# ---------------------------------------------------------------------------
# 6. 3D loss surface around trained weights
# ---------------------------------------------------------------------------
def loss_surface_3d(model: tf.keras.Model, X_test: np.ndarray,
                    y_test: np.ndarray, out_path: Path,
                    n_points: int = 20, scale: float = 0.5) -> None:
    """
    Perturbs the trained weights along two random directions in weight space
    and evaluates the loss — visualises the local loss landscape around the
    trained solution (Li et al. 2018 style, simplified).
    n_points: grid resolution per axis. Higher = prettier but slower.
    scale: magnitude of perturbation in each direction.
    """
    print("  Computing 3D loss surface (this takes a few minutes on CPU)...")

    original_weights = [w.copy() for w in model.get_weights()]

    # Two random perturbation directions, filter-normalised
    def random_direction():
        d = [np.random.randn(*w.shape) for w in original_weights]
        for i, (di, wi) in enumerate(zip(d, original_weights)):
            norm_w = np.linalg.norm(wi)
            norm_d = np.linalg.norm(di)
            if norm_d > 0 and norm_w > 0:
                d[i] = di * (norm_w / norm_d)
        return d

    np.random.seed(42)
    dir1 = random_direction()
    dir2 = random_direction()

    alphas = np.linspace(-scale, scale, n_points)
    betas = np.linspace(-scale, scale, n_points)
    Z = np.zeros((n_points, n_points))

    for i, a in enumerate(alphas):
        for j, b in enumerate(betas):
            perturbed = [w + a * d1 + b * d2
                         for w, d1, d2 in zip(original_weights, dir1, dir2)]
            model.set_weights(perturbed)
            loss_val = model.evaluate(X_test, y_test, verbose=0)[0]
            Z[i, j] = loss_val
        print(f"    Loss surface: row {i + 1}/{n_points} done")

    model.set_weights(original_weights)

    A, B = np.meshgrid(alphas, betas)
    fig = plt.figure(figsize=(16, 12))
    fig.patch.set_facecolor("#0f0f0f")
    ax = fig.add_subplot(111, projection="3d")
    ax.set_facecolor("#0f0f0f")

    surf = ax.plot_surface(A, B, Z.T, cmap="plasma", edgecolor="none", alpha=0.9)
    ax.contour(A, B, Z.T, zdir="z", offset=Z.min(), cmap="plasma", alpha=0.4, levels=15)
    ax.scatter([0], [0], [Z[n_points // 2, n_points // 2]],
               color="white", s=120, zorder=5, label="Trained weights")

    ax.set_xlabel("Direction 1", color="white", fontsize=11)
    ax.set_ylabel("Direction 2", color="white", fontsize=11)
    ax.set_zlabel("Loss", color="white", fontsize=11)
    ax.set_title("Loss Landscape (3D) around Trained Weights",
                 color="white", fontsize=14, fontweight="bold", pad=20)
    ax.tick_params(colors="white")
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False
    ax.xaxis.pane.set_edgecolor("#333")
    ax.yaxis.pane.set_edgecolor("#333")
    ax.zaxis.pane.set_edgecolor("#333")
    ax.legend(facecolor="#1a1a2e", labelcolor="white")
    fig.colorbar(surf, ax=ax, shrink=0.5, aspect=10, pad=0.1, label="Loss")
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"3D loss surface saved to {out_path}")


# ---------------------------------------------------------------------------
# 7. Temporal attention — per-frame gradient importance
# ---------------------------------------------------------------------------
def temporal_attention(model: tf.keras.Model, X_test: np.ndarray,
                       y_test: np.ndarray, class_names: list[str],
                       out_path: Path, n_samples: int = 3) -> None:
    """
    Uses gradient magnitude w.r.t. the input to approximate which frames in a
    sequence the model 'attended to' most when making its prediction.
    One panel per sample shown.
    """
    indices = []
    for cls in range(min(n_samples, len(class_names))):
        candidates = np.where(y_test == cls)[0]
        if len(candidates) > 0:
            indices.append(candidates[0])

    fig, axes = plt.subplots(len(indices), 1, figsize=(16, 4 * len(indices)))
    if len(indices) == 1:
        axes = [axes]
    fig.patch.set_facecolor("#0f0f0f")

    for ax, idx in zip(axes, indices):
        x = tf.constant(X_test[idx:idx + 1], dtype=tf.float32)
        with tf.GradientTape() as tape:
            tape.watch(x)
            pred = model(x, training=False)
            pred_class = tf.argmax(pred, axis=1)[0]
            score = pred[0, pred_class]
        grads = tape.gradient(score, x)[0]  # (30, 252)
        importance = tf.reduce_mean(tf.abs(grads), axis=-1).numpy()  # (30,)
        importance = (importance - importance.min()) / (importance.max() - importance.min() + 1e-8)

        ax.set_facecolor("#1a1a2e")
        ax.tick_params(colors="white")
        for spine in ax.spines.values():
            spine.set_edgecolor("#333")

        ax.bar(range(30), importance, color=plt.cm.plasma(importance), width=0.9)
        ax.set_xlim(-0.5, 29.5)
        ax.set_ylim(0, 1.05)
        true_label = class_names[y_test[idx]]
        pred_label = class_names[int(pred_class)]
        correct = "✓" if true_label == pred_label else "✗"
        ax.set_title(
            f"True: {true_label}  |  Predicted: {pred_label}  {correct}",
            color="white", fontsize=12, fontweight="bold"
        )
        ax.set_xlabel("Frame index (0–29)", color="white")
        ax.set_ylabel("Gradient importance", color="white")
        ax.grid(True, alpha=0.15, color="#555", axis="y")

    fig.suptitle("Temporal Gradient Importance (which frames drove the prediction)",
                 color="white", fontsize=14, fontweight="bold", y=1.01)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Temporal attention saved to {out_path}")


def confusion_matrix_hq(model, X_test, y_test, class_names, out_path):
    from sklearn.metrics import confusion_matrix
    y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
    cm = confusion_matrix(y_test, y_pred)
    cm_counts = cm.copy()
    cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)

    fig, ax = plt.subplots(figsize=(16, 14))
    fig.patch.set_facecolor("#0f0f0f")
    ax.set_facecolor("#1a1a2e")

    sns.heatmap(
        cm_norm, ax=ax, cmap="magma", vmin=0, vmax=1,
        xticklabels=class_names, yticklabels=class_names,
        linewidths=0.5, linecolor="#333", square=True,
        cbar_kws={"shrink": 0.8, "label": "Normalised proportion"},
    )
    # Annotate each cell with both count and percentage
    for i in range(len(class_names)):
        for j in range(len(class_names)):
            count = cm_counts[i, j]
            pct = cm_norm[i, j]
            color = "white" if pct < 0.5 else "black"
            ax.text(j + 0.5, i + 0.5,
                    f"{count}\n{pct:.0%}",
                    ha="center", va="center",
                    fontsize=8, color=color, fontweight="bold")

    ax.set_xlabel("Predicted", color="white", fontsize=13, labelpad=12)
    ax.set_ylabel("True", color="white", fontsize=13, labelpad=12)
    ax.set_title("Confusion Matrix — EthSL GRU\n(cell: count / normalised %)",
                 color="white", fontsize=15, fontweight="bold", pad=20)
    ax.tick_params(colors="white", labelsize=10)
    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    ax.collections[0].colorbar.ax.tick_params(colors="white")
    ax.collections[0].colorbar.ax.yaxis.label.set_color("white")
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"HQ confusion matrix saved to {out_path}")



def multiclass_roc(model, X_test, y_test, class_names, out_path):
    from sklearn.metrics import roc_curve, auc
    from sklearn.preprocessing import label_binarize

    n_classes = len(class_names)
    y_bin = label_binarize(y_test, classes=range(n_classes))
    y_prob = model.predict(X_test, verbose=0)

    fig, ax = plt.subplots(figsize=(14, 11))
    fig.patch.set_facecolor("#0f0f0f")
    ax.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#333")

    for i, name in enumerate(class_names):
        if y_bin[:, i].sum() == 0:
            continue
        fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob[:, i])
        roc_auc = auc(fpr, tpr)
        ax.plot(fpr, tpr, color=PALETTE[i], lw=2,
                label=f"{name}  (AUC = {roc_auc:.2f})")

    ax.plot([0, 1], [0, 1], "w--", lw=1, alpha=0.4, label="Random classifier")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1.02)
    ax.set_xlabel("False Positive Rate", color="white", fontsize=12)
    ax.set_ylabel("True Positive Rate", color="white", fontsize=12)
    ax.set_title("Multiclass ROC Curves (one-vs-rest)",
                 color="white", fontsize=14, fontweight="bold")
    ax.legend(facecolor="#1a1a2e", labelcolor="white",
              fontsize=8, loc="lower right", ncol=2)
    ax.grid(True, alpha=0.1, color="#555")
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Multiclass ROC saved to {out_path}")


def precision_recall_curves(model, X_test, y_test, class_names, out_path):
    from sklearn.metrics import precision_recall_curve, average_precision_score
    from sklearn.preprocessing import label_binarize

    n_classes = len(class_names)
    y_bin = label_binarize(y_test, classes=range(n_classes))
    y_prob = model.predict(X_test, verbose=0)

    fig, ax = plt.subplots(figsize=(14, 11))
    fig.patch.set_facecolor("#0f0f0f")
    ax.set_facecolor("#1a1a2e")
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#333")

    for i, name in enumerate(class_names):
        if y_bin[:, i].sum() == 0:
            continue
        prec, rec, _ = precision_recall_curve(y_bin[:, i], y_prob[:, i])
        ap = average_precision_score(y_bin[:, i], y_prob[:, i])
        ax.plot(rec, prec, color=PALETTE[i], lw=2,
                label=f"{name}  (AP = {ap:.2f})")

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1.02)
    ax.set_xlabel("Recall", color="white", fontsize=12)
    ax.set_ylabel("Precision", color="white", fontsize=12)
    ax.set_title("Multiclass Precision-Recall Curves (one-vs-rest)",
                 color="white", fontsize=14, fontweight="bold")
    ax.legend(facecolor="#1a1a2e", labelcolor="white",
              fontsize=8, loc="lower left", ncol=2)
    ax.grid(True, alpha=0.1, color="#555")
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Precision-recall curves saved to {out_path}")



def input_frame_visualization(model, X_test, y_test,
                               class_names, out_path, n_samples=4):
    """
    Reconstructs the hand skeleton from raw normalized landmark coordinates
    and draws it on a blank canvas — shows exactly what the model sees as input.
    Uses the first n_samples test examples, one per row.
    """
    HAND_CONNECTIONS = [
        (0,1),(1,2),(2,3),(3,4),
        (0,5),(5,6),(6,7),(7,8),
        (0,9),(9,10),(10,11),(11,12),
        (0,13),(13,14),(14,15),(15,16),
        (0,17),(17,18),(18,19),(19,20),
        (5,9),(9,13),(13,17),
    ]

    y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
    indices = []
    for cls in range(min(n_samples, len(class_names))):
        candidates = np.where(y_test == cls)[0]
        if len(candidates) > 0:
            indices.append(candidates[0])

    fig, axes = plt.subplots(len(indices), 6, figsize=(20, 4 * len(indices)))
    if len(indices) == 1:
        axes = [axes]
    fig.patch.set_facecolor("#0f0f0f")

    for row, idx in enumerate(indices):
        # Pick 6 evenly spaced frames from the 30-frame sequence
        sample = X_test[idx]  # (30, 252)
        frame_indices = np.linspace(0, 29, 6, dtype=int)

        for col, fi in enumerate(frame_indices):
            ax = axes[row][col]
            ax.set_facecolor("#000000")
            ax.set_aspect("equal")
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis("off")

            # Extract right-hand position from feature vector
            # Feature order: [left_pos(63), right_pos(63), left_vel(63), right_vel(63)]
            right_pos = sample[fi, 63:126].reshape(21, 3)
            left_pos = sample[fi, 0:63].reshape(21, 3)

            for hand_pts, color in [(right_pos, "#00d4ff"), (left_pos, "#ff6b6b")]:
                # Skip if zero-padded (one-handed sign)
                if np.allclose(hand_pts, 0):
                    continue
                # Unnormalize: wrist was subtracted, so wrist is at 0,0
                # Rescale to visible range for display
                pts = hand_pts[:, :2].copy()
                pts -= pts.min(axis=0)
                rng = pts.max(axis=0)
                rng[rng == 0] = 1
                pts = pts / rng * 0.8 + 0.1

                for a, b in HAND_CONNECTIONS:
                    ax.plot([pts[a, 0], pts[b, 0]], [pts[a, 1], pts[b, 1]],
                            color=color, lw=1.5, alpha=0.8)
                ax.scatter(pts[:, 0], pts[:, 1],
                           c=color, s=20, zorder=5, alpha=0.9)

            if col == 0:
                true_l = class_names[y_test[idx]]
                pred_l = class_names[y_pred[idx]]
                correct = "✓" if true_l == pred_l else "✗"
                ax.set_title(f"True: {true_l}\nPred: {pred_l} {correct}",
                             color="white", fontsize=8, pad=4)
            else:
                ax.set_title(f"frame {fi}", color="#aaa", fontsize=7, pad=4)

    fig.suptitle(
        "Input Sequence Visualization — 6 evenly-spaced frames per sample\n"
        "Blue = right hand   Red = left hand   (wrist-relative, normalised)",
        color="white", fontsize=12, fontweight="bold", y=1.01
    )
    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"Input frame visualization saved to {out_path}")





# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-loss-surface", action="store_true",
                        help="Skip the 3D loss surface (slow on CPU)")
    args = parser.parse_args()

    FIG_DIR.mkdir(parents=True, exist_ok=True)
    print("Loading artifacts...")
    model, X_test, y_test, history, class_names = load_artifacts()
    print(f"Test set: {len(X_test)} samples  |  {len(class_names)} classes\n")

    print("1/7  Animated training curves...")
    animated_training_curves(history, FIG_DIR / "training_curves_animated.gif")

    print("2/7  Styled static training curves...")
    styled_training_curves(history, FIG_DIR / "training_curves_styled.png")

    print("3/7  t-SNE embeddings...")
    tsne_embeddings(model, X_test, y_test, class_names, FIG_DIR / "tsne_embeddings.png")

    print("4/7  Confidence violin plot...")
    confidence_violin(model, X_test, y_test, class_names, FIG_DIR / "confidence_violin.png")

    print("5/7  Radar chart...")
    radar_chart(model, X_test, y_test, class_names, FIG_DIR / "radar_chart.png")

    if args.skip_loss_surface:
        print("6/7  Skipping 3D loss surface (--skip-loss-surface passed).")
    else:
        print("6/7  3D loss surface (slow — pass --skip-loss-surface to skip)...")
        loss_surface_3d(model, X_test, y_test, FIG_DIR / "loss_surface_3d.png")

    print("7/7  Temporal attention...")
    temporal_attention(model, X_test, y_test, class_names, FIG_DIR / "temporal_attention.png")

    print(f"\nAll figures saved to {FIG_DIR}")

    print("8/10  HQ confusion matrix...")
    confusion_matrix_hq(model, X_test, y_test, class_names,
                        FIG_DIR / "confusion_matrix_hq.png")

    print("9/10  Multiclass ROC curves...")
    multiclass_roc(model, X_test, y_test, class_names,
                   FIG_DIR / "multiclass_roc.png")

    print("9b/10  Precision-recall curves...")
    precision_recall_curves(model, X_test, y_test, class_names,
                            FIG_DIR / "precision_recall_curves.png")

    print("10/10  Input frame visualization...")
    input_frame_visualization(model, X_test, y_test, class_names,
                              FIG_DIR / "input_frame_visualization.png")

if __name__ == "__main__":
    main()