# Project Shape

## Stack
- Expo 55 + React Native 0.83 + `expo-router`.
- Main app code lives in `app/` and `src/`.
- `legacy-web-src/` and `legacy-web-public/` are reference-only migration artifacts.
- TypeScript is strict; prefer fixing types over weakening configuration.

## Package manager
- Use `npm` for installs and scripts.
- The repo currently has `package-lock.json`, so avoid introducing another lockfile.

## Core commands
- `npm install` — install dependencies.
- `npm run start` — start Expo dev server.
- `npm run start:dev` — start a dev-client server on port 8081.
- `npm run start:dev:localhost` — dev-client server bound to localhost.
- `npm run start:dev:lan` — dev-client server bound to LAN.
- `npm run android` — run the app on Android.
- `npm run ios` — run the app on iOS.
- `npm run web` — run the web target.
