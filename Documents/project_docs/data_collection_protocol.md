# EthSL Data Collection Protocol

## Core Numbers

| Item | Value |
|---|---|
| Classes | 15 |
| Signers | 5 (fixed IDs: s1–s5) |
| Reps per class per signer | 18 |
| Total reps per signer | 270 |
| Total dataset size | 1,350 sequences |

## Recording Setup

- **Camera**: standard laptop webcam, 720p or better
- **Background**: plain preferred, not strictly required (MediaPipe tracks hands, not background)
- **Distance**: arm's length from camera — both hands must stay fully visible even at full extension, especially for two-handed signs
- **Lighting**: front-lit; avoid strong backlight/window-behind-you (causes silhouette, degrades hand detection)
- **Sleeves**: avoid very loose or dark sleeves that blend with skin tone in low light

## What Gets Recorded Per Rep

- Both hand slots are always attempted, regardless of whether the sign is one-handed or two-handed
- For one-handed signs, the unused hand slot is simply empty/null — zero-padding happens later, during preprocessing, not during collection
- Each rep captures roughly **1.5–2 seconds** of frames (later truncated/uniformly sampled to exactly 30 frames during preprocessing)

## Recording Flow

1. **Start**: key press (e.g. spacebar) triggers a recording window, with a visual countdown cue so the signer knows exactly when to begin
2. **Record**: signer performs the sign once, naturally, within the window
3. **End**: auto-stops after the fixed time window (not manually ended)
4. **Redo**: instant discard/re-record key available for bad reps — mistimed starts, hand leaving frame, wrong sign, hesitation

## File Naming Convention

```
data/raw/{signer_id}/{class_label}/{signer_id}_{class_label}_{rep_num:03d}.json
```

Example: `data/raw/s3/wided/s3_wided_012.json`

- `signer_id`: one of `s1`, `s2`, `s3`, `s4`, `s5` — fixed for the whole project, assigned once
- `class_label`: must exactly match the transliteration in `class_list.md` / `class_list.py` — zero deviation, typos here silently create phantom extra classes
- `rep_num`: zero-padded 3 digits, `001`–`018`

## File Schema (per rep)

```json
{
  "signer_id": "s2",
  "class_label": "felig",
  "rep_num": 7,
  "timestamp": "2026-08-05T14:22:01Z",
  "fps": 30,
  "frames": [
    {
      "frame_idx": 0,
      "hand_1": { "handedness": "Right", "landmarks": [[x, y, z], "...21 points"] },
      "hand_2": { "handedness": "Left", "landmarks": null }
    }
  ]
}
```

Raw JSON is stored lossless and un-normalized. All math (wrist-normalization, velocity, padding) happens once, reproducibly, in `preprocess.py` — not baked into the raw files.

## Session Split (Recommended)

Split each signer's 18 reps/class across **2 sessions** (~9 reps/class each), ideally on different days/lighting/energy levels. This adds natural micro-variation within a signer's own data at zero extra cost — cheap insurance for a model that will need to handle that signer's real-world variation.

## QA Pass (Before Merging to `main`)

Run `validate_data.py` on every signer's completed folder before merging:
- File naming and class label exactness check (catches typos)
- Hand-detection rate check (flags reps where a hand was detected in less than ~50% of frames — likely a bad take)
- Flags suspiciously short files (<10 frames — likely a mistrigger)
- Flags issues for human review; does not auto-delete anything

## Data Collection Checklist — Per Signer, Per Session

**Before starting:**
- [ ] Camera positioned — both hands fully visible at full extension
- [ ] Lighting checked — no strong backlight
- [ ] `signer_id` confirmed and correct
- [ ] Class list reviewed — correct signs confirmed with the team beforehand

**During each rep:**
- [ ] Ready position before pressing start
- [ ] Sign performed clearly, at natural speed, within the window
- [ ] Redo immediately if: mistimed, hand left frame, wrong sign, hesitation/false start

**Per class (18 reps):**
- [ ] All 18 reps recorded
- [ ] Spot-check 2–3 reps aren't garbage (quick playback or landmark overlay if available)

**Per full session:**
- [ ] Tracking sheet updated
- [ ] Files pushed to the `data-collection` branch (or uploaded, for the remote signer)

**After all 5 signers are done, before merging to `main`:**
- [ ] Run `validate_data.py`
- [ ] Human review of any flagged files — decide keep / discard / redo

## Team Coordination

- **Shared tracking sheet**: classes as rows, signers as columns, rep counts in each cell — glance-able status for everyone
- **4 local signers**: run `collect_data.py` locally, push raw JSON folders to the `data-collection` branch
- **1 remote signer**: identical script and protocol, fully async — records locally, pushes or uploads whenever a session is done, no live sync required
- **Check-ins**: lightweight, every 1–2 days ("sheet updated?") — not a meeting
