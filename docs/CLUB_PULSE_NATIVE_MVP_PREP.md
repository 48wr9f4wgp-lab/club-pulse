# Club Pulse — Native MVP Preparation Phase

Date: 2026-09-21

## Phase transition

Prototype phase is considered complete enough to stop adding Scriptable features.

Frozen prototype baseline:
- Branch: `baseline/club-pulse-v0.54-six-club`
- Runtime: v0.54
- Loader: v0.6.1
- Clubs: Real Madrid, Barcelona, Manchester United, Bayern München, Manchester City, Paris Saint-Germain
- Primary validated form factor: Medium widget
- Existing Scriptable prototype remains the reference implementation for behavior and visual direction.

Active working branch:
- `phase/native-mvp-prep`

## Goal

Prepare Club Pulse to move from a Scriptable prototype to a native iPhone app + WidgetKit implementation without losing the validated experience.

This phase is preparation only. It does not authorize App Store submission, paid services, contracts, licensing purchases, or production release actions.

## Product core to preserve

1. Previous match result at a glance.
2. Rating TOP3.
3. Goals and assists.
4. Highest-rated player Hero.
5. Recent form when space allows.
6. Next fixture.
7. Club-specific visual identity without sacrificing readability.
8. Japanese-first display.
9. Explicit stale/update-wait state.
10. Multi-club configuration with isolated cache/state.

## Native MVP scope

### App
- Favorite club selection.
- Widget size/configuration guidance.
- Data refresh status.
- Basic cache/debug status for development builds.

### Widget
- Small: score + highest-rated player.
- Medium: current validated primary layout.
- Large: full recap + recent form + next match.
- Club-specific accents remain restrained.
- Result colors remain semantic and independent of club colors.

## Migration architecture

Suggested module boundaries:

- `ClubCatalog`
  - club id
  - display names
  - colors
  - aliases

- `MatchProvider`
  - previous fixture
  - next fixture
  - match detail
  - ratings
  - goal/assist events

- `ClubPulseNormalizer`
  - Japanese competition/team/player naming
  - fixture validation
  - goal-event validation
  - scorer aggregation
  - stale-state normalization

- `ClubPulseStore`
  - per-club cache
  - fetchedAt
  - last known good snapshot
  - stale/error metadata

- `WidgetSnapshot`
  - immutable widget-facing data contract

- `WidgetKit Extension`
  - Small / Medium / Large views
  - timeline policy
  - last-known-good fallback

## WidgetSnapshot draft

```
ClubSnapshot
  club
  fetchedAt
  stale
  previousMatch
    id
    date
    competition
    opponent
    homeAway
    scoreFor
    scoreAgainst
    result
  topRated[3]
    playerId
    displayName
    rating
    imageRef
  hero
    playerId
    displayName
    rating
    imageRef
  scorers[]
    playerId?
    displayName
    goals
  assists[]
    playerId?
    displayName
  recentForm[5]
  nextMatch?
    id
    date
    competition
    opponent
```

## Production blockers to resolve before native implementation is treated as production-ready

### 1. Data source
Current FotMob web JSON usage is prototype-only.
A production data source must have acceptable terms, reliability, required competitions, player ratings, events, fixtures, and update latency.

### 2. Rights
Club crests, player images, league marks, and player likeness usage need an explicit production-rights path.
Do not assume prototype image endpoints grant commercial rights.

### 3. Native build path
A verified path to Xcode/native iOS build and real-device testing is required before native implementation can be called device-validated.

### 4. Widget refresh behavior
Native timeline/refresh behavior must be tested on-device. The Scriptable refresh model is only a behavioral reference.

## First implementation milestone

A native development build is not the immediate target yet.

First milestone:
1. Freeze the data contract.
2. Select/approve a production-capable data-source direction.
3. Map the Scriptable logic to Swift modules.
4. Define favorite-club configuration flow.
5. Then start native implementation.

## Change policy

The frozen Scriptable baseline is no longer the main feature-development target.

Only fix the Scriptable version when:
- it exposes a data-integrity bug relevant to the native migration,
- it blocks comparison/reference,
- or a regression makes the prototype unusable.

New product features belong in the native MVP scope, not in the prototype.
