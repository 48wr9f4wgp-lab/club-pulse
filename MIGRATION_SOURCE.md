# Club Pulse migration source

- Source repository: `48wr9f4wgp-lab/motorsport-hub`
- Exact source commit: `9e869fdae85e9ee352234b925c733065eb7c24fd`
- Exported path: `scriptable/`
- Migration date: 2026-09-14

Before repinning runtime URLs, the migration workflow compares every launcher-pinned historical file with the file at the exact export snapshot. Any content mismatch fails the migration.

## Repaired malformed historical refs

The following launcher refs did not resolve as Git objects. Each replacement was accepted only after the latest real historical revision was byte-for-byte identical to the exported snapshot:

- `d3260884886fa38413313a5b243e5068` → `802f58288a56f371fc284deae880273f80ece97b` for `scriptable/club-pulse-theme-registry-patch.js`
