# Club Pulse Runtime Notes

## Runtime
- Branch: `club-pulse-runtime`
- Runtime: `scriptable/club-pulse.js`
- iPhone Scriptable loader pulls the runtime from GitHub.
- Normal widget code should not be pasted manually after the loader is installed.

## Widget Parameters
Canonical club keys:
- `manutd`
- `arsenal`
- `barcelona`

Aliases supported by runtime:
- Manchester United: `mu`, `mun`, `manu`, `man-united`
- Arsenal: `ars`, `gunners`
- Barcelona: `barca`, `fcb`

Unknown keys safely fall back to `manutd`.

## Data Providers
### Base provider
`football-data.org v4`

Used for:
- fixtures
- finished results / recent form
- league standings
- rank / points
- club crests

Keychain key:
`clubpulse_football_data_token_v1`

### Optional live provider
`API-Football / API-Sports v3`

Prepared but inactive until a key exists in Scriptable Keychain.

Keychain key:
`clubpulse_api_football_token_v1`

When configured, Club Pulse only checks it around match time and overlays live score/minute data on top of the base provider. Team IDs are resolved from the provider search endpoint and cached locally, so new clubs do not require hard-coded API-Football IDs.

## Refresh Policy
- Normal: 15 minutes requested refresh
- Within roughly 2 hours of kickoff: 2 minutes requested refresh
- Live: 2 minutes requested refresh

Actual iOS WidgetKit refresh timing is controlled by iOS and can be later than the requested refresh date.

## Display States
- `NEXT`: upcoming fixture (`VS`)
- `LIVE`: live score and minute
- `POST`: recently finished result

## Current design rule
Small and Medium layouts share the same data model. Team blocks have equal fixed widths so crest and club-name centers stay aligned even when one club name is much longer than the other.

## Safety / release rule
Do not create an external API-Football account, start a paid plan, or add a paid provider without explicit user approval.
