# App Conventions

## TypeScript style
- Keep `strict: true` working; do not relax compiler settings casually.
- Prefer explicit exported types for props, API payloads, and shared state.
- Use type aliases (`type Foo =`) for object shapes and unions, matching the codebase.
- Use `as const` for design tokens and other fixed literal maps.
- Preserve narrow unions such as route names, request methods, and API status values.

## Imports
- Use the `@/src/...` path alias for internal imports.
- Keep import groups in a consistent order: internal aliases, external packages, then relative files if needed.
- Prefer named imports/exports over defaults unless the framework requires a default export.
- Import types with `import type` when the value is type-only.

## Naming
- Components use PascalCase (`ScreenShell`, `NoticeCard`).
- Hooks use `use*` names.
- Utility functions use camelCase (`buildQueryString`, `toApiError`).
- Constants use UPPER_SNAKE_CASE for keys and camelCase for exported token objects.
- File names generally match the exported component or feature name.

## React / React Native
- Prefer function components.
- Keep screen components thin; move reusable UI into `src/components/`.
- Use `StyleSheet.create` for component styles.
- Keep styles near the component; avoid ad hoc inline style objects unless simple.
- Prefer `PropsWithChildren` or explicit prop types where appropriate.

## Styling / UI
- Use shared tokens from `src/theme/tokens.ts` instead of hard-coded values when possible.
- Reuse layout, spacing, radii, and color tokens for consistency.
- Keep visual language aligned with the existing clean, light theme.
- Avoid introducing a new design system unless the change requires it.

## State / data flow
- Store shared auth state in `src/lib/auth/store.ts` patterns: centralized snapshot + subscribers.
- Prefer small, explicit state updates over hidden mutation.
- Keep async side effects in services rather than inside UI components.
- Use existing storage helpers in `src/lib/storage/kv.ts` for persisted values.

## API / error handling
- Use `requestApi` and related helpers for backend access.
- Preserve the API envelope handling pattern (`status`, `code`, `data`).
- Throw `ApiError` for backend and network failures.
- Catch broadly only when cleaning up or converting to a user-facing fallback.
- Use early returns for invalid states instead of deeply nested conditionals.

## Auth / retry behavior
- Preserve refresh/retry logic in API/auth flows.
- If a request fails with 401, follow the existing refresh path before clearing state.
- On irreversible auth failures, clear notifications and auth state together.
- Prefer `console.warn` for recoverable failures and `console.error` only when useful.

## Routing / navigation
- Routes live under `app/`; keep file names aligned with route paths.
- Use `expo-router` navigation primitives already in the repo.
- Keep redirect logic deterministic and centralized.
- When adding a new screen, update the relevant stack/tab layout explicitly.

## Strings / localization
- Existing UI strings are a mix of English identifiers and Korean user-facing copy.
- Preserve current wording unless the change requires a copy update.
- If adding user-facing text, match the existing tone and language used nearby.

## Comments
- Avoid comments for obvious code.
- Add comments only for non-obvious cleanup, platform quirks, or protocol details.
- Keep comments short and practical.

## Repo boundaries
- Do not edit `legacy-web-src/` unless you are intentionally comparing or porting behavior.
- Keep changes scoped to the requested feature or fix.
- Prefer small, verifiable changes over broad refactors.
- When touching auth, notifications, or API code, check the README for contract expectations.

## Environment notes
- The README documents `.env` usage and platform-specific base URL behavior.
- Development builds are important for native OAuth; Expo Go is not sufficient for the custom scheme flow.
- If you need to validate platform behavior, use the README’s Expo commands for the target device.
