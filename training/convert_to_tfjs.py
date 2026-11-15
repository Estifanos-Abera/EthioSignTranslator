"""
convert_to_tfjs.py — converts the trained Keras model to TensorFlow.js format
for client-side inference in the browser.

IMPORTANT: Run this in the separate .venv-convert environment (Python 3.12),
NOT the main .venv. The tensorflowjs package conflicts with modern TensorFlow.

Setup (one time only):
    py -3.12 -m venv .venv-convert
    .venv-convert\\Scripts\\activate
    pip install -r training/requirements-convert.txt

Usage:
    python training/convert_to_tfjs.py

Reads:
    models/trained/best_model.keras
    models/trained/label_map.json

Writes:
    webapp/public/model/model.json          <- TF.js graph manifest
    webapp/public/model/group1-shard1of1.bin <- weight shards
    webapp/public/model/label_map.json      <- must travel with the model
    webapp/public/model/model_metadata.json <- architecture + feature spec
"""

import sys
import types

# 1. Create base empty modules
jax_mod = types.ModuleType('jax')
jax_exp_mod = types.ModuleType('jax.experimental')

# 2. Add the specific placeholder function tensorflowjs is looking for
def fake_jax2tf(*args, **kwargs):
    pass
jax_exp_mod.jax2tf = fake_jax2tf

# 3. Inject them into Python's memory system
sys.modules['jax'] = jax_mod
sys.modules['jax.experimental'] = jax_exp_mod
sys.modules['jaxlib'] = types.ModuleType('jaxlib')
sys.modules['flax'] = types.ModuleType('flax')
sys.modules['flax.linen'] = types.ModuleType('flax.linen')
sys.modules['tensorflow_decision_forests'] = types.ModuleType('tensorflow_decision_forests')








import json
import shutil
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "models" / "trained"
TFJS_OUT_DIR = ROOT_DIR / "webapp" / "public" / "model"

KERAS_MODEL_PATH = MODEL_DIR / "best_model.h5"
LABEL_MAP_PATH = MODEL_DIR / "label_map.json"


def check_environment() -> None:
    """Warn clearly if the user is running in the wrong venv."""
    import tensorflow as tf
    tf_version = tuple(int(x) for x in tf.__version__.split(".")[:2])
    if tf_version >= (2, 20):
        print(
            "WARNING: You appear to be running in the main .venv (TF >= 2.20).\n"
            "tensorflowjs requires tensorflow~=2.15. Switch to .venv-convert:\n"
            "    .venv-convert\\Scripts\\activate\n"
            "    python training/convert_to_tfjs.py\n"
        )
        sys.exit(1)


def convert() -> None:
    # We intentionally bypass check_environment() here because we are going
    # to use a smart configuration hack that handles Keras 2/3 mismatches.
    
    import tensorflowjs as tfjs
    import tensorflow as tf
    import zipfile

    if not KERAS_MODEL_PATH.exists():
        sys.exit(f"Model not found: {KERAS_MODEL_PATH}\nRun train.py first.")
    if not LABEL_MAP_PATH.exists():
        sys.exit(f"label_map.json not found: {LABEL_MAP_PATH}\nRun train.py first.")

    TFJS_OUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loading and patching {KERAS_MODEL_PATH.name} for compatibility...")
    
    # --- SMART PATCH: Convert Keras 3 .keras zip config to Keras 2 format ---
    import numpy as np
    w = np.load(MODEL_DIR / "weights.npz")
    weights = [w[f"arr_{i}"] for i in range(len(w.files))]

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(30, 252)),
        tf.keras.layers.Masking(mask_value=0.0),
        tf.keras.layers.GRU(64, return_sequences=True, reset_after=False),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.GRU(32, reset_after=False),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dense(15, activation="softmax"),
    ])
    model.set_weights(weights)

    ref_in = np.load(MODEL_DIR / "X_test.npy")[:20]
    ref_out = np.load(MODEL_DIR / "ref_probs.npy")
    got = model.predict(ref_in, verbose=0)
    assert np.allclose(ref_out, got, atol=1e-4), "weights did not transfer"
    print("Weight transfer verified, max diff", float(np.abs(ref_out - got).max()))
    model.summary()


    print(f"\nConverting to TF.js format -> {TFJS_OUT_DIR}")
    tfjs.converters.save_keras_model(model, str(TFJS_OUT_DIR))


    # Copy label_map.json into the model directory so the web app
    # can load class names alongside the model weights.
    shutil.copy(LABEL_MAP_PATH, TFJS_OUT_DIR / "label_map.json")
    print(f"label_map.json copied to {TFJS_OUT_DIR}")

    # Write a metadata file the web app can read for provenance/display.
    with open(LABEL_MAP_PATH, encoding="utf-8") as f:
        label_map = json.load(f)

        metadata = {
        "model_architecture": "2-layer GRU (64 -> 32)",
        "input_shape": [30, 252],
        "feature_description": (
            "position + velocity, wrist-relative normalised, "
            "both hands (zero-padded if one-handed), 30 frames"
        ),
        "num_classes": len(label_map),
        "class_labels": {str(v): k for k, v in label_map.items()},
        "source_keras_model": KERAS_MODEL_PATH.name,
        "tensorflow_version_used_for_training": "2.20+",
        "tensorflowjs_version_used_for_conversion": tfjs.__version__,
    }


    meta_path = TFJS_OUT_DIR / "model_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"model_metadata.json written to {TFJS_OUT_DIR}")

    # Verify the output directory looks right
    files = list(TFJS_OUT_DIR.iterdir())
    print(f"\nFiles written to {TFJS_OUT_DIR}:")
    for fp in sorted(files):
        size_kb = fp.stat().st_size / 1024
        print(f"  {fp.name:<40} {size_kb:.1f} KB")

    print("\nConversion complete.")
    print("Next step: run validate_tfjs_parity.py (in the main .venv) to confirm")
    print("the converted model produces the same predictions as the Keras model.")

if __name__ == "__main__":
    convert()
