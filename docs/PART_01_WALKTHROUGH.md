# Part 1: Navigation and responsive shell

## What is working

Home and Cart are real navigable routes. Home contains the screenshot-inspired purple location header and a controlled search input. Cart contains an empty state and navigation back to Home. There is no catalog filtering, permission request, or cart business state yet. Typing in the search field only updates local state.

## How startup works

`package.json` points `main` at `expo-router/entry`. Expo Router discovers `src/app`. It renders `_layout.tsx`, which configures the bottom tabs, then the selected route. `index.tsx` is Home (`/`); `cart.tsx` is Cart (`/cart`). The former `App.tsx` and `index.ts` were removed because they are no longer startup files.

The tabs maintain navigation state and selected-tab accessibility semantics. A homemade boolean such as `showCart` would require us to implement history, back behavior, and navigation accessibility ourselves. JavaScript tabs allow visual customization while using the established navigator. The repository's AGENTS.md also requires Expo Router.

## File responsibilities

- `src/app/_layout.tsx`: navigation configuration, tab icons/colors and bottom safe-area sizing.
- `src/app/index.tsx`: Home UI and temporary search-input state.
- `src/app/cart.tsx`: empty Cart UI and route actions.
- `src/components/MobileContent.tsx`: consistent horizontal padding and maximum readable width.
- `src/components/EmptyState.tsx`: reusable icon/title/description presentation.
- `src/theme/theme.ts`: shared colors, spacing and corner-radius values.

Keeping components outside `src/app` matters: Expo Router treats screen files inside that directory as routes. Domain calculations and persistence will also stay outside it.

## Understanding the important snippets

### Controlled input

`const [query, setQuery] = useState('')` creates state local to Home. `value={query}` renders the current value; `onChangeText={setQuery}` updates it after typing. React renders the screen again after an update. There is no direct mutation of a native input and no filtering yet. Input state is not application-wide state and does not need context.

### Navigation

`router.navigate('/')` goes to Home. It does not assume an earlier screen exists in history. This is useful if Cart is opened directly through a deep link. No manual NavigationContainer is added because Router manages it.

### Reusable presentation

EmptyState accepts typed props instead of deciding whether the cart is empty itself. The screen supplies the correct content. Its icon type is derived from Ionicons, so TypeScript rejects invalid icon names. `PropsWithChildren` lets MobileContent accept nested React elements without using `any`.

### Responsive layout

- `flex: 1` lets screens occupy available navigator space.
- `width: '100%'` adapts to the viewport. `maxWidth: 600` keeps content readable on wide mobile displays; it does not force small screens to be 600 points wide.
- Layout values use logical units, not the screenshot's physical pixels. Android density determines physical pixel conversion.
- ScrollView and `flexGrow: 1` accommodate short displays and enlarged text. A fixed-height content panel would risk clipping.
- Search and location text columns use `flex: 1` and `minWidth: 0` to share available row width.
- Safe-area insets come from the actual device. Home paints the top inset purple; Cart paints it white. The tab bar reserves bottom inset space for gesture navigation.
- Buttons have minimum heights, so longer text can grow them. We do not globally disable font scaling. Tab height also responds to fontScale.
- Input focus hides the bottom tabs while the keyboard is visible. Native keyboard behavior still needs Android verification.

## Visual scope and limitations

The screenshots guide the purple header, pink controls, gray cart background and rounded surfaces. This is a shell, not the completed screenshot: category content, product images, badges, savings panels and cart items come later. Icons use Ionicons and typography uses system fonts; neither has been established as the original app's exact asset. There is no fake address or serviceability status.

## Interview questions

**Why not put everything in one file?** Screens coordinate UI; reusable presentation and design tokens have separate responsibilities. We have not introduced a state library or unnecessary domain abstractions before needing them.

**Why ScrollView instead of FlatList?** This step has a small, fixed amount of content. Search results will need a FlatList so longer catalogs can render efficiently without mounting every row.

**What does TypeScript guarantee?** It checks prop shapes, route component code and icon names before runtime. It does not guarantee a correct visual layout or valid saved JSON; those need separate checks.

**Does responsive mean pixel-identical on every phone?** No: content adapts to logical screen size and accessibility settings. We compare the intended proportions at matching viewport sizes and check that smaller screens do not overflow.

**Why no global state yet?** Only the search input has state in this step. Shared cart state belongs in a later application layer when Home and Cart both consume it.

## Verification and next step

Run `npm run typecheck`, `npm run lint`, and an Android bundle export. Check both routes, back-to-Home controls, keyboard behavior, large font sizes, and small/large phone layouts. A web preview is useful for layout but does not verify native Android permissions, system bars or keyboard behavior.

Next, implement foreground location and notification permission lifecycle, update the delivery label with coordinates, and add the required Home debug banner.
