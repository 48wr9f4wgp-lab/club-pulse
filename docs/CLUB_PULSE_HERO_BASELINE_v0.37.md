# Club Pulse Hero — VERIFIED BASELINE v0.37

Date: 2026-09-20
Runtime branch: `hero-prototype`
Baseline branch: `baseline/hero-v0.37`
Baseline runtime commit: `fc11a186f72245b11336800c8d5e7ebb8fe7fb39`

## Status

### VERIFIED_BASELINE
- Small UI
- Medium UI
- Large UI
- Shared visual language: black / navy / gold / white
- Dedicated Hero area (no text-over-face layout)
- Readability cards and borders
- Result states: win / draw / loss
- Zero-goal state
- No-assist state
- Hero player change
- Long player/opponent names
- No-next-fixture state
- Robust Scriptable loader v0.5: raw GitHub -> API fallback -> local cache

### WORKING_HEAD
- `hero-prototype`
- May continue beyond the baseline branch.
- Do not treat future edits as verified until device-tested.

### RECOVERY_STATE
If a later UI/runtime edit breaks the widget, compare or restore from:
- branch: `baseline/hero-v0.37`
- runtime commit: `fc11a186f72245b11336800c8d5e7ebb8fe7fb39`

## Widget responsibilities

### Small
Purpose: glanceable result + MVP.
- club
- result / score
- opponent/date
- Hero portrait
- MVP name/rating

### Medium
Purpose: compact match recap.
- club/result/score
- TOP3
- goals/assists
- Hero/MVP
- next fixture

### Large
Purpose: full match recap.
- club/result/score
- TOP3
- goals/assists
- Hero/MVP
- recent five
- next fixture

## QA scenarios available in Scriptable app preview
- normal
- loss
- draw
- zero goals
- no assists
- Hero change
- long names
- no next fixture

QA scenarios are app-preview-only and must not alter Home Screen live data.

## Known constraints / intentional behavior
- Long strings are truncated rather than allowed to collide with Hero or overflow.
- Small intentionally omits detailed TOP3/goals/assists to preserve readability.
- QA long-name scenario may intentionally pair a synthetic name with an existing photo; this is not a live-data defect.
- Scriptable preview and Home Screen rendering can differ slightly; Home Screen device validation remains authoritative.

## Next engineering phase
1. Freeze UI polish unless a reproducible defect appears.
2. Validate live refresh/state transition across real fixtures.
3. Validate cache/offline behavior and API failure recovery.
4. Verify data correctness around match rollover and next-fixture selection.
5. Only after those checks, decide whether to promote the baseline toward production integration.

## Release boundary
This baseline is a development/QA checkpoint only.
It is not App Store release approval and does not authorize publishing, submission, paid services, or destructive actions.
