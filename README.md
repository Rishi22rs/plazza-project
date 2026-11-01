# Plazza

An Android medicine-shopping take-home app built with Expo, React Native, and TypeScript. Browse a local medicine catalog, search by name or salt, manage a persistent cart, and apply coupons with a live bill breakdown. The mobile UI follows the supplied Plazza app references.

## Run locally

### Prerequisites

- Node.js 22.13 or newer (Node 22 LTS recommended) and npm.
- Android Studio with the Android SDK, Platform Tools (`adb`), and an Android emulator. Use Android 13 or newer to exercise notification permission prompts.
- A compatible Java runtime for Android Gradle. The local build script uses Android Studio's bundled runtime on macOS; set `PLAZZA_JAVA_HOME` to select another installation.

```bash
git clone https://github.com/Rishi22rs/plazza-project.git
cd plazza-project
npm ci
```

Open the folder in your editor, start an emulator from Android Studio's Device Manager, then build and launch the native debug app:

```bash
npm run android
```

This generates the ignored `android/` project, builds the app, and starts the Metro development server. Keep Metro running while using the debug app. The initial native build can take several minutes and downloads Android build dependencies.

For later development sessions with the debug app already installed:

```bash
npm start
```

Press `a` in the Expo terminal to open Android. Expo Go is an optional route for compatible JavaScript/UI testing, but use the native Android build to review permissions and native behavior. See [Expo's development workflow](https://docs.expo.dev/get-started/start-developing/).

### Troubleshooting

- **Metro returns a stale bundle or Router transform error:** stop Metro and restart with `npx expo start --clear`. Run commands from this repository's root.
- **No emulator found:** launch one in Device Manager and check `adb devices`.
- **Installed debug app cannot reach Metro over USB/emulator:** run `adb reverse tcp:8081 tcp:8081`, then reload with Metro running.
- **Location is allowed but no position is returned:** enable device location services and set a simulated location in the emulator's Extended Controls. Permission and GPS availability are separate states.
- **Permission is blocked:** use the app's Settings action to grant access. The app refreshes permission state when it returns to the foreground.

## What to try

1. Launch the app and respond to the location and notification permission requests independently. Missing permissions expose recovery actions; granted permissions do not leave a status panel on Home.
2. Browse Home and tap the animated search entry. Search by medicine name or salt, such as `Dolo` or `paracetamol`. Search history keeps the five most recent intentional searches and survives restarts.
3. Add medicines, change quantities, and open the animated floating cart. Quantity limits come from each catalog entry; reducing a quantity to zero removes the item.
4. Apply or remove a coupon and change the cart to see eligibility and totals update. Only one coupon can be active at a time.
5. Complete the mock checkout. It clears the cart and consumes FIRST100 only when that coupon is used on the completed order.

## Coupons and billing

Money is calculated in integer paise to avoid floating-point rounding drift. The delivery fee is ₹40 for a nonempty medicine subtotal below ₹499 and zero at ₹499 or above. Delivery eligibility uses the subtotal before coupon deductions.

| Coupon | Rule |
| --- | --- |
| `FLAT50` | ₹50 off a medicine subtotal of at least ₹300 |
| `SAVE10` | 10% off the medicine subtotal, capped at ₹100 |
| `FREEDEL` | Waives the delivery fee |
| `FIRST100` | ₹100 off a medicine subtotal of at least ₹200; usable once per local app installation/data lifecycle |

The coupon registry defines validation and discount rules. Cart changes revalidate the selected coupon and remove it with an explanation if it becomes ineligible. The featured offer compares actual bill savings across eligible coupons. A zero discount is omitted from the bill UI.

## Code map

| Location | Responsibility |
| --- | --- |
| `package.json` → `expo-router/entry` | Application entry point |
| `src/app/_layout.tsx` | Fonts, root Stack, shared cart and permission providers |
| `src/app/(tabs)/` | Home and Cart tabs |
| `src/app/search.tsx` | Dedicated search screen |
| `src/catalog/catalog.json` | Local medicine data, prices, quantity limits, and dummy image URLs |
| `src/search/` | Normalized name/salt filtering, debounce, recent-search history |
| `src/cart/CartProvider.tsx` | Shared cart state and cart actions |
| `src/cart/cartLogic.ts` | Pure quantity and saved-cart validation logic |
| `src/cart/promotions.ts` | Coupon registry, eligibility, integer-paise billing, mock checkout |
| `src/permissions/` | OS permission requests, sequential startup prompts, foreground refresh, location recovery |
| `src/storage/usePersistentState.ts` | Validated, versioned AsyncStorage hydration and serialized writes |
| `src/components/` and `src/theme/` | Reusable mobile UI, accessibility labels, spacing, colors, and typography |
| `tests/` | Automated permission, search, cart, and promotion logic tests |

Navigation uses Expo Router's file-based routes: a root Stack contains the Home/Cart tab group and Search. React Context providers sit above navigation so changing screens preserves shared state. AsyncStorage persists cart/promotion state and recent searches; OS permission grants are read from the device rather than trusted from saved booleans.

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

Tests run with Node's built-in test runner and TypeScript stripping. They cover business logic; manual emulator/device review is still needed for visual layout, animations, permission dialogs, and TalkBack behavior.

## Build APKs

With Android SDK tools installed:

```bash
bash scripts/build_android_apks.sh
```

The script generates the Android project and builds both variants for `arm64-v8a` and `x86_64`:

- `output/apk/plazza-preview.apk`: standalone release-variant preview; includes the JavaScript bundle and runs without Metro or Expo Go.
- `output/apk/plazza-debug.apk`: development build; requires Metro.

Install either build on a connected device/emulator:

```bash
adb install -r output/apk/plazza-preview.apk
```

For the debug variant, install `plazza-debug.apk`, run `npm start`, and use `adb reverse tcp:8081 tcp:8081` if needed. Both variants use the same Android package (`com.rishi22rs.plazza`), so they replace each other rather than installing side by side. APKs are intentionally excluded from Git.

The local standalone preview is signed with the generated debug key. It is suitable for assignment review, but a Play Store production release requires a private release-signing setup. Optional EAS cloud build profiles are provided in `eas.json`; they require an Expo account and EAS project/credential setup.

## Scope

This is a local demo: checkout is simulated, product images are placeholders, and there is no backend, payment processing, server-enforced coupon usage, or notification delivery service. Clearing app data resets local cart/history and FIRST100 usage. Android is the primary review target; an iOS release and a complete device/accessibility QA matrix have not been validated. Reference screenshots and private development notes are excluded from the repository.
