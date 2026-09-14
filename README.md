# Club Pulse

Club Pulse is the dedicated Scriptable football-club widget project extracted from the former mixed `motorsport-hub` repository.

The product implementation lives in `scriptable/`. The canonical launcher is `scriptable/club-pulse.js`.

## Migration provenance

This repository was migrated from `48wr9f4wgp-lab/motorsport-hub` using exact source snapshot `9e869fdae85e9ee352234b925c733065eb7c24fd` on 2026-09-14.

The migration verifies every runtime file pinned by the launcher against its historical immutable source before repinning the launcher to this repository. A malformed historical ref is repaired only when the latest real file revision reachable at the export snapshot is byte-for-byte identical to the exported file.

## Validation

`.github/workflows/club-pulse-contract.yml` runs all `scriptable/*.test.js` contract/regression checks.

## License

No software license is granted by this migration. Club Pulse licensing is intentionally independent from Motorsport Hub's MPL-2.0 decision.
