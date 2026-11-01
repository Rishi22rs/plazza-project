# Plazza

React Native / Expo Android take-home project, written in TypeScript.

## Current progress

- Expo Router Home and Cart tabs
- Screenshot-inspired purple header and pink navigation
- Responsive layout, scrollable content and safe-area handling
- Controlled search input and reusable empty states
- Commented code and an interview walkthrough in [docs/PART_01_WALKTHROUGH.md](docs/PART_01_WALKTHROUGH.md)

This is the app foundation. Catalog search, permissions, cart state, billing, coupons, persistence and checkout are not implemented yet. The original catalog.json is still required. UI reference screenshots stay local and are excluded from Git because they contain personal address information.

## Run

Use Node.js 22.13 or later and an Android emulator or compatible Expo Go installation.

```sh
npm ci
npm run android
```

After changing the app entry point or installing navigation dependencies, restart Metro with a clean cache if it reports EXPO_ROUTER_APP_ROOT errors:

```sh
npx expo start --clear --android
```

## Verify

```sh
npm run typecheck
npm run lint
npx expo export --platform android
```

Bundle export verifies packaging, not a native APK build. Native permissions and device behavior require Android testing. Domain tests and a debug APK will be added as the remaining features are implemented.

## Structure

- `src/app`: route screens and tab layout
- `src/components`: reusable presentation components
- `src/theme`: shared design tokens
- `docs`: implementation and interview explanations
- `DESIGN.md`: visual reference requirements
