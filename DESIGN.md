# Visual source of truth

The eight user-provided app screenshots in `design/references/` supersede the earlier Play Store promotional references. Match the supplied UI closely; do not invent a replacement design language.

## Screen references

- `pharmacy-home.jpeg`: Purple Pharmacy header, search, category tabs, trust strip, seasonal grid, and bottom navigation.
- `search.jpeg`: Pale-blue search header, two-column product grid, and floating pink View cart pill.
- `cart.jpeg`: White title bar, purple savings banner, gray page background, rounded white item/coupon cards, pink quantity stepper, and fixed bottom action sheet.
- `promotion-sheet.jpeg`: Purple promotional sheet, italic title, ticket-shaped offers, white action button, and close control.
- `diabetic-home.jpeg` and `diabetic-products.jpeg`: Category header, promotional hero, horizontal product cards, and Rx labels.
- `self-care.jpeg` and `ayurveda.jpeg`: Category-specific header colors and product sections.

## Matching requirements

Match layout, relative dimensions, spacing, typography size/weight, corner radii, borders, icon shapes, product image placement, and colors against the relevant screenshot. Images are 738 by 1600 reference pixels; use logical mobile dimensions and compare at the same viewport and scroll position. OS status/navigation bars belong to the device and must not be painted into app content.

The pharmacy header is deep purple. Bright pink marks primary actions, outlined ADD buttons, quantity controls, and selected navigation. Search fields are nearly white. Product imagery sits inside rounded bordered containers with a pale footer. Discount ribbons are purple; Rx badges are pink; best-offer labels are teal. Cart surfaces use a light gray background and large white cards.

Compare screenshots while implementing each screen. Exact font and product/illustration assets have not yet been supplied; verify them rather than claiming pixel-exact matching with substitutes. Current starter theme values remain provisional until calibrated to these screenshots.

## Assignment behavior

These images define visual design. Preserve the brief's catalog, Home/Cart tabs, local mock checkout, permissions, and coupon/billing rules. Screenshot addresses, prices, promotions, login, WhatsApp ordering, and extra categories do not replace the assignment requirements or authorize additional services.
