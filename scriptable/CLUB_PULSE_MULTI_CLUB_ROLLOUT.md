# Club Pulse Multi-Club Rollout

Date: 2026-08-29

## Current rollout

Baseline:
- Manchester United (`manutd`) — frozen reference implementation

New clubs:
- FC Barcelona (`barcelona`)
- Real Madrid CF (`realmadrid`)

## Architecture used for new clubs

New clubs are not implemented by copying the Manchester United theme patch.

Selection/data lives in:
- `club-pulse-club-registry-patch.js`

Shared visual identity lives in:
- `club-pulse-theme-registry-patch.js`

Shared competition identity remains in:
- `club-pulse-competition-logo-patch.js`

Barcelona and Real Madrid reuse the canonical Small/Medium match renderers. Theme registry changes tokens/components such as background, card gradient, accent, crest treatment, header and form treatment without cloning match renderers.

## Club parameters

Use the same Scriptable script and set Widget Parameter:

- Manchester United: `manutd`
- Barcelona: `barcelona`
- Real Madrid: `realmadrid`

Aliases are also supported, but canonical IDs above should be used for widgets.

## Barcelona identity

- Blaugrana base: deep navy + claret
- Gold accent
- LaLiga competition identity remains independent
- Home venue fallback: Camp Nou

## Real Madrid identity

- Midnight/navy base to preserve dark-widget readability
- White/ivory text identity
- Gold accent and crest ring
- LaLiga competition identity remains independent
- Home venue fallback: Santiago Bernabéu

## QA gate for each new club

Real-device verification is required before PASS:

1. Small NEXT
2. Medium NEXT
3. Small LIVE
4. Medium LIVE
5. Small POST
6. Medium POST
7. LaLiga competition logo/pill
8. Champions League competition logo/pill when applicable
9. Copa del Rey competition logo/pill when applicable
10. longest opponent-name fit
11. footer fully inside native widget bounds
12. offline cached display
13. recovery to normal state

Static CI is necessary but is not treated as native-layout proof.

## Scale rule

Do not create `club-pulse-<club>-theme-patch.js` for normal club additions.

The normal path is:
1. add club data to Club Registry
2. add or reuse tokens in Theme Registry
3. run contract CI
4. run real-device Small/Medium QA
5. freeze club baseline
