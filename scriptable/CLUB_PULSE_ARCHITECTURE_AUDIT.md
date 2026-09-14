# Club Pulse Architecture Audit

Date: 2026-08-29
Scope: Manchester United widget completion gate before multi-club expansion

## Verdict

Manchester United is accepted as the current visual/functional baseline for Club Pulse.

Validated on real iPhone Small/Medium widgets:
- NEXT state
- LIVE state
- POST state
- Premier League
- Champions League
- FA Cup
- EFL Cup
- competition logos
- latest-form ordering/readability
- cached/offline fallback
- no-cache error fallback
- recovery to normal state

Latest layout note:
- The final Medium vertical-bounds correction was verified in Scriptable after the footer-overflow fix.
- Small had already passed the same functional/visual matrix before that correction, but the final post-correction Small regression screenshot has not yet been captured. Treat that as the first visual check when work resumes; do not call the final layout fully re-verified until that check passes.

The current Man U visual baseline should otherwise be frozen except for clear regressions.

## Current architecture

Runtime composition is currently layered in this order:

1. `club-pulse-core.js`
2. `club-pulse-ui-patch.js`
3. `club-pulse-competition-logo-patch.js`
4. club-specific theme patch (`club-pulse-manutd-theme-patch.js`)
5. top-layout patch (`club-pulse-top-layout-patch.js`)
6. LIVE context patch
7. resilience patch

`club-pulse.js` acts as the remote launcher and local-cache fallback layer.

## What is good

- Data acquisition, cache fallback and widget rendering are already separated enough to iterate safely.
- Club identity lives primarily in `CLUBS` config.
- Competition identity is centralized and logo fallback is independent of club theme.
- Small and Medium are treated as different layouts instead of merely scaling one renderer.
- QA covers NEXT/LIVE/POST and primary cup competitions.
- Offline-with-cache and no-cache states have explicit UI behavior.
- Launcher pins patch revisions, so a tested visual baseline can be frozen.

## Main architectural risk

### Patch-order dependency

Multiple files override the same globals such as:
- `buildHeaderMedium`
- `buildMatchMedium`
- `buildMatchSmall`
- `competitionPill`
- `loadData`
- `errorWidget`

This is acceptable for stabilizing one club, but it will become brittle when many clubs receive dedicated themes/layout exceptions.

A later patch can silently invalidate assumptions from an earlier patch. Static contract tests can still pass while native Scriptable geometry regresses. The recent footer overflow demonstrated this limitation.

## Diagnosis

### Current Man U product quality

Status: **PASS with one pending post-correction Small visual regression check**

The widget is coherent enough for daily use and as a reference implementation for other clubs. No further Man U design work should be done unless the pending Small check reveals an actual regression.

### Current multi-club architecture

Status: **CONDITIONAL PASS**

It is safe to add a small number of clubs experimentally, but not safe to scale by cloning one patch per club.

## Required architecture before broad expansion

Before expanding beyond a small initial set, move toward this structure:

### 1. Club registry

One declarative object per club containing only data/tokens:
- team/provider IDs
- names and abbreviations
- venue
- primary/secondary/accent colors
- crest scale
- optional text aliases
- theme preset key

Adding a club should normally not require editing renderer code.

### 2. Shared renderer

Keep one canonical renderer for each family/state:
- `renderSmallNext`
- `renderSmallLive`
- `renderSmallPost`
- `renderMediumNext`
- `renderMediumLive`
- `renderMediumPost`

Club themes should supply tokens, not replace these functions.

### 3. Theme registry

Replace dedicated club monkey patches with theme tokens such as:
- background gradient
- card gradient
- accent/gold color
- border opacity
- crest treatment
- form-chip treatment
- side-pill treatment

Only genuinely unique clubs should receive an explicit component exception.

### 4. Competition registry

Keep competition name/short name/logo/style mapping centralized and independent from club rendering.

### 5. Visual bounds QA

Contract tests remain useful, but are not proof of native layout correctness.

For every new club, real-device QA remains a hard gate for:
- Small NEXT/LIVE/POST
- Medium NEXT/LIVE/POST
- longest likely club/opponent names
- league and cup pills
- footer inside native bounds

## Rules for adding the next clubs

1. Do not copy `club-pulse-manutd-theme-patch.js` and rename it per club.
2. Prefer config/theme-token additions first.
3. Reuse the Man U information hierarchy and spacing baseline.
4. Change visual identity, not information architecture, unless the club requires it.
5. Any renderer exception must be justified and tested in Small + Medium.
6. Competition UI stays shared across clubs.
7. Existing Man U screenshots are the regression baseline.

## Known cleanup debt

Not blocking the current Man U release baseline, but should be removed during the multi-club refactor:
- legacy QA compatibility submenu in launcher
- versioned local patch filenames accumulated during iteration
- overlapping renderer definitions between UI/theme/top-layout patches
- string-based CI checks that do not validate native geometry

## Next phase

**Multi-club architecture refactor first, then club rollout.**

Recommended first rollout after refactor:
- Arsenal
- Barcelona

These already have core IDs/config and give good coverage of a second Premier League identity plus a different league/visual system.
