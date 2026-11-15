export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string }
  | { type: "issue"; title: string; symptom: string; cause: string; fix: string };

export type DocSection = {
  id: string;
  group: "Start here" | "Build log" | "Issues and fixes" | "Reference";
  title: string;
  summary: string;
  blocks: Block[];
};

export const GROUP_ORDER = ["Start here", "Build log", "Issues and fixes", "Reference"] as const;

export const DOCS: DocSection[] = [
  {
    id: "overview",
    group: "Start here",
    title: "Overview",
    summary: "What the system does and what it covers.",
    blocks: [
      { type: "p", text: "EthioSignTranslate recognizes isolated Ethiopian Sign Language signs through a webcam. The person signs one word, the system predicts it, and the word is added to a sentence that can be read aloud." },
      { type: "p", text: "The current vocabulary has 15 signs, chosen so that short sentences can be built from them: pronouns, verbs, social words, question words and nouns." },
      { type: "list", items: [
        "እኔ (ene): I, me",
        "አንተ (ante): you",
        "ፈልግ (felig): want",
        "እርዳ (erda): help",
        "ውደድ (wided): like",
        "ሰላም (selam): hello",
        "አመሰግናለሁ (ameseginalehu): thank you",
        "ይቅርታ (yikirta): sorry",
        "አዎ (awo): yes",
        "አይ (ay): no",
        "እባክህ (ebakih): please",
        "ምን (mn): what",
        "የት (yet): where",
        "ስም (sm): name",
        "ውሃ (wiha): water"
      ] },
      { type: "p", text: "Recognition works on hand landmarks. MediaPipe finds 21 points on each hand in every video frame. A GRU network reads 30 frames of those points and predicts the sign. All of this runs in the browser, so no video is sent anywhere." },
      { type: "p", text: "The system recognizes single signs only. It does not translate continuous signing, and it was trained on recordings from two signers." }
    ]
  },
  {
    id: "run-locally",
    group: "Start here",
    title: "Run it locally",
    summary: "Set up the Python tools and the web app.",
    blocks: [
      { type: "p", text: "You need Python 3.13, Node.js 18 or newer, and a webcam. Clone the repository and open a terminal at its root." },
      { type: "code", text: "python -m venv .venv\n.venv\\Scripts\\activate\npip install -r training/requirements.txt" },
      { type: "p", text: "On macOS or Linux, activate with source .venv/bin/activate instead." },
      { type: "p", text: "The training scripts run in this order. Each one reads the output of the one before it." },
      { type: "code", text: "python training/collect_data.py\npython training/preprocess.py\npython training/train.py\npython training/evaluate.py" },
      { type: "p", text: "The web app has its own dependencies. Run these from inside the webapp folder, not from the repository root." },
      { type: "code", text: "cd webapp\nnpm install\nnpm run dev" },
      { type: "p", text: "Open the address that npm prints in the terminal. Converting the model for the browser needs a separate Python 3.11 environment, described under Model conversion." }
    ]
  },
  {
    id: "data-collection",
    group: "Build log",
    title: "Data collection",
    summary: "How the recordings were made.",
    blocks: [
      { type: "p", text: "The recording tool is training/collect_data.py. It uses the MediaPipe Tasks API HandLandmarker, loaded from models/hand_landmarker.task, instead of the older solutions API. This way the exact model file is known and is written into every saved recording." },
      { type: "p", text: "The tool asks for a signer ID, shows the current word in Amharic and counts repetitions. Space starts a repetition: a 1.5 second countdown, then a 1.8 second recording window. R deletes the last repetition. N and P move between words. Progress is read from the files on disk, so a session can be stopped and resumed." },
      { type: "p", text: "The target was 18 repetitions per word per signer. Two signers recorded data. Three more signers were planned and did not take part, so the dataset is smaller than first designed." },
      { type: "p", text: "After each repetition the tool prints how many frames contained a detected hand and warns when fewer than half did. Those repetitions are usually worth recording again." },
      { type: "p", text: "What improved the recordings:" },
      { type: "list", items: [
        "Raise the hand into position during the countdown, so the sign starts the moment recording starts.",
        "Hold the final pose until the recording window ends.",
        "For two-handed signs, keep both hands inside the frame and angle the camera slightly downward so one hand does not hide the other."
      ] }
    ]
  },
  {
    id: "preprocessing",
    group: "Build log",
    title: "Preprocessing",
    summary: "How raw recordings become training tensors.",
    blocks: [
      { type: "p", text: "training/preprocess.py reads every recording in data/raw and writes the training arrays to data/processed. For each recording it does the following, in order." },
      { type: "list", items: [
        "Sorts the hands into fixed left and right slots using the handedness label. MediaPipe does not keep the same hand in the same slot from frame to frame.",
        "Fills detection gaps. A hand missing for up to 5 frames is filled by linear interpolation. Gaps at the start or end repeat the nearest detected frame. Longer gaps are set to zero.",
        "Leaves a hand that is never detected at zero. This is the normal case for one-handed signs.",
        "Excludes a recording when a hand appears in some frames but in fewer than half of them. Excluded recordings are listed in preprocessing_report.json.",
        "Subtracts the wrist position from every landmark, per hand and per frame.",
        "Computes velocity as the difference between consecutive frames. The first frame has zero velocity.",
        "Resamples to exactly 30 frames. Longer recordings are sampled evenly and shorter ones are padded with zeros."
      ] },
      { type: "p", text: "The output is X.npy with shape (N, 30, 252), y.npy with integer labels, and label_map.json." }
    ]
  },
  {
    id: "training",
    group: "Build log",
    title: "Training",
    summary: "Model, settings and saved files.",
    blocks: [
      { type: "p", text: "The classifier is a two layer GRU network. The input is 30 frames of 252 values. Training runs on a laptop CPU." },
      { type: "list", items: [
        "Optimizer: Adam, learning rate 0.001",
        "Batch size: 32, up to 100 epochs",
        "Early stopping on validation loss, patience 10, best weights restored",
        "Split: 70 percent train, 15 percent validation, 15 percent test, stratified by sign and pooled across both signers"
      ] },
      { type: "p", text: "Labels are stored as integers, so the loss is sparse categorical crossentropy. It is the same calculation as categorical crossentropy without one-hot encoding." },
      { type: "p", text: "training/train.py saves the best model, the test split, the training history and the label map in models/trained. The evaluation scripts read the saved test split, so they always score the same data." }
    ]
  },
  {
    id: "evaluation",
    group: "Build log",
    title: "Evaluation",
    summary: "Metrics, figures and how to read them.",
    blocks: [
      { type: "p", text: "training/evaluate.py writes a confusion matrix, training curves and a per-class report with precision, recall and F1 into documents/project_docs/results." },
      { type: "p", text: "training/visualize.py adds figures for research use: animated and styled training curves, a t-SNE map of the GRU hidden states, per-class confidence distributions, a radar chart of precision, recall and F1, a 3D loss surface, temporal gradient importance for sample predictions, a detailed confusion matrix, multiclass ROC curves, precision-recall curves, and input frame visualizations." },
      { type: "p", text: "Test accuracy: 98 percent on the held-out test split." },
      { type: "p", text: "The test split holds 77 recordings across 15 signs, which is a small sample. One recording changes a per-class score a lot. Both signers appear in the training and test data, so the score measures how well the model recognizes people it has already seen." }
    ]
  },
  {
    id: "conversion",
    group: "Build log",
    title: "Model conversion",
    summary: "Moving the trained model to TensorFlow.js.",
    blocks: [
      { type: "p", text: "The model was trained with Keras 3. The converter package expects an older TensorFlow, so conversion runs in a separate Python 3.11 environment named .venv-convert-311 with tensorflowjs installed." },
      { type: "p", text: "training/convert_to_tfjs.py does four things." },
      { type: "list", items: [
        "Registers empty stand-in modules for jax, flax and tensorflow_decision_forests before importing tensorflowjs. The package imports them at startup and a Keras model does not use them.",
        "Opens the Keras 3 model file as an archive and rewrites its configuration to Keras 2 names, for example batch_shape becomes batch_input_shape.",
        "If that fails, rebuilds the network layout in memory and loads the weights into it.",
        "Writes the converted files to webapp/public/model."
      ] },
      { type: "p", text: "The output is model.json, group1-shard1of1.bin (about 277 KB), label_map.json and model_metadata.json." },
      { type: "p", text: "Known gap: when the script falls back to rebuilding the network, the Masking and Dropout layers are not included. Dropout has no effect at prediction time. Masking tells the GRU to skip zero padded frames, so it needs to be restored for sequences shorter than 30 frames." }
    ]
  },
  {
    id: "web-app",
    group: "Build log",
    title: "Web application",
    summary: "How the browser side is built.",
    blocks: [
      { type: "p", text: "The site is a Next.js application written in TypeScript. Three files in webapp/lib do the recognition work." },
      { type: "list", items: [
        "landmarks.ts runs MediaPipe in the browser and applies the same handedness correction as the recording tool.",
        "features.ts is a port of preprocess.py. It builds the (30, 252) input with the same feature order.",
        "inference.ts loads the converted model and returns the predicted sign with its top three candidates."
      ] },
      { type: "p", text: "features.ts and preprocess.py must stay identical. If one changes, change the other." },
      { type: "p", text: "On the Translate page, Space or the Sign button starts a 1.5 second countdown and a 1.8 second capture. A prediction is accepted when its confidence is at least 70 percent. Accepted words appear in the sentence strip. Undo removes the last word, Clear empties the strip, and Speak reads the sentence with the browser speech synthesis. Research Mode shows the number of detected landmarks, prediction latency and the top three candidates." }
    ]
  },
  {
    id: "issues-environment",
    group: "Issues and fixes",
    title: "Environment and installation",
    summary: "Python versions, package conflicts and Windows security.",
    blocks: [
      { type: "issue",
        title: "TensorFlow would not install on the newest Python",
        symptom: "pip could not find a TensorFlow build for the installed Python version.",
        cause: "TensorFlow 2.21 supports Python 3.10 to 3.13. The machine had Python 3.14.",
        fix: "Install Python 3.13 next to the existing version and create the project environment from it." },
      { type: "issue",
        title: "tensorflow and tensorflowjs would not install together",
        symptom: "pip stopped with ResolutionImpossible and named tensorflow-decision-forests.",
        cause: "tensorflowjs depends on tensorflow-decision-forests, which pins tensorflow to the 2.15 series. That conflicts with the newer TensorFlow used for training.",
        fix: "Remove tensorflowjs from training/requirements.txt and run conversion in its own environment." },
      { type: "issue",
        title: "No TensorFlow 2.15 for Python 3.12 or newer",
        symptom: "pip install tensorflow==2.15.0 failed and listed only versions from 2.16 upward.",
        cause: "TensorFlow 2.15 has no build for Python 3.12 or newer.",
        fix: "Create the conversion environment from Python 3.11." },
      { type: "issue",
        title: "Windows blocked the MediaPipe library",
        symptom: "OSError [WinError 4551] An Application Control policy has blocked this file, raised when MediaPipe loaded its native library.",
        cause: "A Windows application control policy refused to load the library. Smart App Control was checked and was off. A third-party security suite was installed.",
        fix: "[FILL IN how this was resolved]" },
      { type: "issue",
        title: "Recording tool failed on import",
        symptom: "ImportError: cannot import name CLASSES from class_list.",
        cause: "class_list.py existed but was empty. The hand landmarker model file was not involved.",
        fix: "Add the list of 15 signs and the constants to class_list.py." }
    ]
  },
  {
    id: "issues-data",
    group: "Issues and fixes",
    title: "Data collection and preprocessing",
    summary: "Handedness, detection gaps and hand occlusion.",
    blocks: [
      { type: "issue",
        title: "The right hand was saved as the left hand",
        symptom: "A recording made with the right hand was labeled Left in the file.",
        cause: "MediaPipe reports handedness from the point of view of a mirrored image. The recording tool mirrors every frame, so the label came out inverted.",
        fix: "Swap Left and Right when the detection result is saved, in the recording tool and in landmarks.ts. Single frames can still be mislabeled now and then. A majority vote inside each recording is a possible later improvement." },
      { type: "issue",
        title: "Hand slots changed between frames",
        symptom: "The same physical hand appeared as hand_1 in one frame and hand_2 in the next.",
        cause: "MediaPipe returns hands in detection order, and that order is not stable.",
        fix: "Preprocessing ignores slot order and sorts hands by the handedness label." },
      { type: "issue",
        title: "Frames with no detected hand",
        symptom: "Some recordings had null hands at the start, at the end or for single frames in the middle.",
        cause: "Detection drops out while the hand enters the frame, moves fast or leaves.",
        fix: "Preprocessing interpolates gaps of up to 5 frames, repeats the nearest frame at the edges and zeroes longer gaps. Recordings with too few detected frames are excluded." },
      { type: "issue",
        title: "One hand disappears when it covers the other",
        symptom: "In some two-handed signs the lower hand lost its skeleton.",
        cause: "A single camera cannot see a hand that is fully hidden behind the other. The z value in each landmark is an estimate and cannot recover hidden hands.",
        fix: "Angle the camera slightly downward, keep the hands offset by a small amount and keep contact moments short. The limit remains and is listed under Limitations." }
    ]
  },
  {
    id: "issues-conversion",
    group: "Issues and fixes",
    title: "Model conversion",
    summary: "Keras 3, TensorFlow.js and parity checks.",
    blocks: [
      { type: "issue",
        title: "The Keras 3 model file did not load in the conversion environment",
        symptom: "Errors about InputLayer arguments batch_shape and optional, and about a DTypePolicy in the Masking layer.",
        cause: "The model was saved by Keras 3 and the conversion environment runs Keras 2.",
        fix: "The conversion script rewrites the model configuration to Keras 2 names. When that fails it rebuilds the network and loads the weights." },
      { type: "issue",
        title: "Parity check reported 9.1 percent agreement",
        symptom: "validate_tfjs_parity.py showed that 7 of 77 predictions matched, with a weight count mismatch of 8 against 10.",
        cause: "The fallback in the script assigned weights to the wrong layers because the rebuilt network had a different layer layout.",
        fix: "The check was reworked. It does not run the converted model in a browser, so the converted model is still verified through live predictions in the web app." },
      { type: "issue",
        title: "TensorFlow.js rejected the GRU layers",
        symptom: "GRUCell does not support reset_after parameter set to true. The page never asked for camera permission.",
        cause: "Keras GRU layers default to reset_after=True, which TensorFlow.js does not implement. Model loading ran before the camera request, so the failure also blocked the permission prompt.",
        fix: "Train both GRU layers with reset_after=False, then convert again. Changing the flag inside model.json alone fails with Shape mismatch [192] vs [2,192], because the bias is stored with two rows when the flag is true and the two settings are different calculations." }
    ]
  },
  {
    id: "issues-webapp",
    group: "Issues and fixes",
    title: "Web application",
    summary: "Setup mistakes and camera timing.",
    blocks: [
      { type: "issue",
        title: "globals.css could not be resolved",
        symptom: "Module not found: Can't resolve ./globals.css in app/layout.tsx.",
        cause: "The stylesheet had not been placed in the app folder.",
        fix: "Put globals.css in webapp/app and restart the dev server." },
      { type: "issue",
        title: "Two lockfile warning",
        symptom: "Next.js reported multiple lockfiles and chose the repository root as the workspace root.",
        cause: "npm had been run from the repository root, which created a second package-lock.json.",
        fix: "Run npm commands from the webapp folder and delete the lockfile at the repository root." },
      { type: "issue",
        title: "The Translate page returned 404",
        symptom: "Opening /translate showed page not found.",
        cause: "The translate folder had been placed inside another route folder.",
        fix: "Move it so the path is webapp/app/translate/page.tsx." },
      { type: "issue",
        title: "Crash inside detectForVideo",
        symptom: "An error at the hand landmarker call on the first animation frames.",
        cause: "Detection ran before the video element had decoded any frame.",
        fix: "Skip detection until the video has a width and its readyState is at least 2." }
    ]
  },
  {
    id: "issues-evaluation",
    group: "Issues and fixes",
    title: "Evaluation scripts",
    summary: "Errors in the figure generation.",
    blocks: [
      { type: "issue",
        title: "t-SNE figure failed with a missing input",
        symptom: "AttributeError: The layer sequential has never been called and thus has no defined input.",
        cause: "A reloaded Keras 3 Sequential model has no model.input until it is called.",
        fix: "Build the feature extractor with model.inputs." },
      { type: "issue",
        title: "TSNE rejected n_iter",
        symptom: "TypeError: TSNE.__init__() got an unexpected keyword argument n_iter.",
        cause: "scikit-learn 1.5 renamed the argument.",
        fix: "Use max_iter." },
      { type: "issue",
        title: "ROC and precision-recall plots were empty",
        symptom: "The curves showed few or no lines.",
        cause: "The test split has 77 recordings, and some signs have no recording in it. The plots skip signs with no test samples.",
        fix: "Draw these two plots from the full dataset and say so in the caption." }
    ]
  },
  {
    id: "data-format",
    group: "Reference",
    title: "Data format",
    summary: "What a recording file contains.",
    blocks: [
      { type: "p", text: "Each repetition is one JSON file at data/raw/{signer_id}/{class_label}/{signer_id}_{class_label}_{rep_num}.json, with the repetition number zero padded to three digits." },
      { type: "code", text: "{\n  \"signer_id\": \"s1\",\n  \"class_label\": \"selam\",\n  \"rep_num\": 4,\n  \"timestamp\": \"UTC time of the recording\",\n  \"fps\": 30,\n  \"mediapipe_model\": \"hand_landmarker.task\",\n  \"mediapipe_model_version\": \"1\",\n  \"frames\": [\n    {\n      \"frame_idx\": 0,\n      \"hand_1\": { \"handedness\": \"Right\", \"confidence\": 0.98, \"landmarks\": [[x, y, z]] },\n      \"hand_2\": null\n    }\n  ]\n}" },
      { type: "p", text: "landmarks holds 21 [x, y, z] triplets in normalized image coordinates. A hand that was not detected in a frame is null. Files are stored as recorded, without normalization, so other researchers can apply their own preprocessing." }
    ]
  },
  {
    id: "feature-spec",
    group: "Reference",
    title: "Feature specification",
    summary: "The 252 values in every frame.",
    blocks: [
      { type: "list", items: [
        "Each hand has 21 landmarks with 3 coordinates, which is 63 values.",
        "Each frame holds left hand position (63), right hand position (63), left hand velocity (63) and right hand velocity (63), in that order. This gives 252 values.",
        "A sequence has 30 frames, so the model input has shape (30, 252).",
        "Positions are relative to each hand's wrist. Velocity is the change from the previous frame."
      ] }
    ]
  },
  {
    id: "model-architecture",
    group: "Reference",
    title: "Model architecture",
    summary: "Layers of the classifier.",
    blocks: [
      { type: "code", text: "Input (30, 252)\nMasking (mask value 0.0)\nGRU 64 units, return sequences\nDropout 0.3\nGRU 32 units\nDropout 0.3\nDense 32, ReLU\nDense 15, softmax" },
      { type: "p", text: "The network has about 71,000 parameters." }
    ]
  },
  {
    id: "limitations",
    group: "Reference",
    title: "Limitations",
    summary: "What the system does not do yet.",
    blocks: [
      { type: "list", items: [
        "The model was trained on two signers and works best for people it has seen.",
        "It covers 15 signs, a small part of the Ethiopian Sign Language vocabulary.",
        "It recognizes isolated signs. Continuous signing is not supported.",
        "One hand covering the other can hide it from the camera during two-handed signs.",
        "The word order of built sentences has not been confirmed with Ethiopian Sign Language signers. Sentences show the words in the order they were signed.",
        "The browser needs camera access and WebGL support."
      ] }
    ]
  },
  {
    id: "licensing",
    group: "Reference",
    title: "Licensing",
    summary: "How the code and data can be used.",
    blocks: [
      { type: "p", text: "The code is released under the MIT License. The dataset will be released under CC BY 4.0 when it is published." }
    ]
  }
];

