# Validation

## Build and verification commands
- `npm run typecheck` — TypeScript validation (`tsc --noEmit`).
- `npm run contract:check` — backend/API contract verification script.
- `npm run export:android` — Expo export for Android.
- `npm run export:ios` — Expo export for iOS.
- `npm run export:web` — Expo export for web.

## Current test status
- No lint script is currently configured in `package.json`.
- No unit/integration test runner is configured in `package.json`.
- There is therefore no single-test command in this repo right now.
- If a test runner is added later, document the exact "run one test" command here.

## Fastest useful checks
- For code changes, run `npm run typecheck` first.
- For auth/API changes, also run `npm run contract:check`.
- For routing or platform work, run the relevant Expo target (`android`, `ios`, or `web`).

## Narrow validation guidance
- Type-only changes: `npm run typecheck`
- API contract changes: `npm run contract:check`
- Platform smoke checks: `npm run export:web` or the relevant Expo target

## Before you finish
- Run the narrowest applicable validation command(s).
- If behavior changes are platform-specific, smoke test that platform.
- Keep the final diff free of unrelated formatting churn.
