# Club Pulse migration source

- Source repository: `48wr9f4wgp-lab/motorsport-hub`
- Exact source commit: `9e869fdae85e9ee352234b925c733065eb7c24fd`
- Exported path: `scriptable/`
- Migration date: 2026-09-14

Before repinning runtime URLs, the migration workflow compares every launcher-pinned historical file with the file at the exact export snapshot. Any content mismatch fails the migration.

## Repaired malformed historical refs

The following launcher refs did not resolve as Git objects. Each replacement was accepted only after the latest real historical revision was byte-for-byte identical to the exported snapshot:

- `d3260884886fa38413313a5b243e5068` → `802f58288a56f371fc284deae880273f80ece97b` for `scriptable/club-pulse-theme-registry-patch.js`

- Imported immutable snapshot commit in this repository: `309658e07c56f1932b49c2d19e35d2940b8773f5`
- Launcher runtime URLs were repinned to that immutable snapshot after byte-for-byte parity verification.
- Pin/repository contract tests updated for the destination repository: club-pulse-form-system-contract.test.js, club-pulse-expanded-clubs.test.js, club-pulse-live-context-contract.test.js, club-pulse-contract.test.js, club-pulse-previous-result-contract.test.js, club-pulse-data-policy-contract.test.js, club-pulse-launcher-version.test.js, club-pulse-loader-efficiency.test.js, club-pulse-crest-cache-contract.test.js, club-pulse-medium-scale-unification-contract.test.js, club-pulse-small-ui-unification-contract.test.js
