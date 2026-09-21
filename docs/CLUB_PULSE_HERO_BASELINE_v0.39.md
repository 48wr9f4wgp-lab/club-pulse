# Club Pulse Hero — VERIFIED BASELINE v0.39

Date: 2026-09-21

## Canonical state

- WORKING_HEAD: `hero-prototype`
- VERIFIED_BASELINE (UI): `baseline/hero-v0.37`
- VERIFIED_BASELINE (UI + Data Integrity): `baseline/hero-v0.39-data-integrity`
- RECOVERY_STATE: `baseline/hero-v0.39-data-integrity`
- Verified runtime commit: `b6b0af6d42dc561455c708501b78595ea92f4df8`

## What v0.39 verifies

### UI / device validation
- Small verified on iPhone
- Medium verified on iPhone
- Large verified on iPhone
- Shared black / navy / gold / white visual language
- Dedicated Hero area with no text-over-face layout
- Long-name truncation without Hero collision
- Full-width information cards and next-match strip

### State / edge-case QA
- normal
- win
- loss
- draw
- zero goals
- no assists
- Hero player change
- long player/opponent names
- no next fixture
- stale / update-wait state

### Live-data behavior verified
- Real match rollover occurred automatically
- Previous match changed from Elche to Atlético Madrid
- Result changed to 1-2 loss
- Hero changed from Mbappé to Bellingham
- next fixture changed to Villarreal
- score/result/next-fixture/date aligned with external schedule checks
- stale badge renders without breaking layout

### Data-integrity hardening included
- `MVP` label replaced with `最高評価`
- stale cache shows `更新待ち`
- dynamic cache TTL
  - near match: 10 min
  - match-day proximity: 15 min
  - normal: 60 min
  - stale retry: 5 min
- last/next fixture revalidation
- cancelled/finished/live/past fixture guards
- invalid/cancelled/disallowed goal filtering
- safer club-side lineup selection
- robust Loader v0.5:
  - raw GitHub
  - GitHub API fallback
  - local cache fallback

## Known limitations

- Scriptable controls final Home Screen refresh timing; `refreshAfterDate` is a request, not an exact timer.
- Prototype data source is FotMob web JSON and is not production-licensed.
- Long names intentionally truncate instead of reducing readability.
- QA long-name scenarios may pair synthetic names with existing player photos.
- Multi-match long-term observation is still required before production promotion.

## Baseline policy

Do not modify `baseline/hero-v0.39-data-integrity`.

All future development continues on `hero-prototype`.

If WORKING_HEAD regresses:
1. Compare against `baseline/hero-v0.39-data-integrity`.
2. Restore runtime behavior from commit `b6b0af6d42dc561455c708501b78595ea92f4df8` if necessary.
3. Re-run device QA before declaring a new baseline.

## Release boundary

This is a development VERIFIED_BASELINE only.

It is not RELEASE_APPROVAL and does not authorize App Store submission,
publishing, paid services, contracts, or other external production actions.
