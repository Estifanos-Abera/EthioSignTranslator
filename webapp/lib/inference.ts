/**
 * inference.ts
 *
 * Loads the converted TF.js GRU model and runs predictions.
 * Singleton pattern — model is loaded once and reused across predictions.
 */

import * as tf from "@tensorflow/tfjs";
import { SEQ_LEN, NUM_FEATURES, buildFeatureTensor, RawFrame } from "./features(1)";

const MODEL_URL = "/model/model.json";
const LABEL_MAP_URL = "/model/label_map.json";
const METADATA_URL = "/model/model_metadata.json";

export interface PredictionResult {
  label: string;           // top predicted class label (transliteration)
  confidence: number;      // 0–1
  top3: Array<{ label: string; confidence: number }>;
  latencyMs: number;       // end-to-end inference time
}

let model: tf.LayersModel | null = null;
let labelMap: Record<string, string> | null = null; // index → label
let modelLoading = false;

export async function loadModel(): Promise<void> {
  if (model || modelLoading) return;
  modelLoading = true;
  try {
    // 1. Fetch files in parallel, but handle the model configuration object dynamically
    const [modelJsonRes, labelRes] = await Promise.all([
      fetch(MODEL_URL).then((r) => r.json()),
      fetch(LABEL_MAP_URL).then((r) => r.json()),
    ]);

    // 2. Traversal loop to fix the incompatible GRU parameter "reset_after" on the fly
    if (modelJsonRes.modelTopology?.model_config?.config?.layers) {
      modelJsonRes.modelTopology.model_config.config.layers.forEach((layer: any) => {
        if (layer.config?.reset_after) {
          layer.config.reset_after = false;
        }
        if (layer.config?.layer?.config?.reset_after) {
          layer.config.layer.config.reset_after = false;
        }
      });
    }

    // 3. Load the model topology safely into TensorFlow.js
    const loadedModel = await tf.loadLayersModel({
      load: async () => {
        // Resolve absolute weights path relative to model directory location
        const baseUrl = new URL(MODEL_URL, window.location.href).href;
        const weightsManifestPaths = modelJsonRes.weightsManifest[0].paths[0];
        const weightsUrl = new URL(weightsManifestPaths, baseUrl).href;
        
        const weightsBuf = await fetch(weightsUrl).then((res) => res.arrayBuffer());

        return {
          modelTopology: modelJsonRes.modelTopology,
          weightSpecs: modelJsonRes.weightsManifest[0].weights,
          weightData: weightsBuf,
        };
      },
    });

    model = loadedModel;
    
    // label_map.json is { label: index } — invert to { index: label }
    labelMap = Object.fromEntries(
      Object.entries(labelRes as Record<string, number>).map(([k, v]) => [String(v), k])
    );

    
    // Warm up — run one dummy prediction so first real call isn't slow
    const dummy = tf.zeros([1, SEQ_LEN, NUM_FEATURES]);
    model.predict(dummy);
    dummy.dispose();
  } catch (err) {
    console.error("Failed to safely initialize inference engine:", err);
  } finally {
    modelLoading = false;
  }
}

export function isModelLoaded(): boolean {
  return model !== null && labelMap !== null;
}

/**
 * Run inference on a captured sequence of frames.
 * Returns null if the model isn't loaded yet.
 */
export async function predict(frames: RawFrame[]): Promise<PredictionResult | null> {
  if (!model || !labelMap) return null;

  const t0 = performance.now();

  const flat = buildFeatureTensor(frames);
  const input = tf.tensor3d(flat, [1, SEQ_LEN, NUM_FEATURES]);

  const outputTensor = model.predict(input) as tf.Tensor;
  const probs = await outputTensor.data() as Float32Array;

  input.dispose();
  outputTensor.dispose();

  const latencyMs = Math.round(performance.now() - t0);

  // Build sorted results
  const indexed = Array.from(probs).map((p, i) => ({
    label: labelMap![String(i)] ?? String(i),
    confidence: p,
  }));
  indexed.sort((a, b) => b.confidence - a.confidence);

  return {
    label: indexed[0].label,
    confidence: indexed[0].confidence,
    top3: indexed.slice(0, 3),
    latencyMs,
  };
}

export async function loadModelMetadata(): Promise<Record<string, unknown>> {
  const res = await fetch(METADATA_URL);
  return res.json();
}
