# Freaks: Landing Page Sandbox

This repo is a **sandbox for testing landing page builds** for Freaks of Nature. It is not the production site.

## What's in here

A snapshot of the live Shopify theme **"Contara / Live"**, exported on **Nov 11, 2026**. The files use Shopify's standard theme layout:

| Folder | What it holds |
|---|---|
| `layout/` | Page wrappers (`theme.liquid`) |
| `templates/` | Page templates (JSON). Add a new landing page template here, e.g. `templates/page.my-landing.json` |
| `sections/` | Reusable page sections (`ctr-*` sections are the Contara builds) |
| `snippets/` | Small partials included by sections |
| `blocks/` | Theme blocks |
| `assets/` | CSS, JS, fonts, images |
| `config/` | Theme settings and schema |
| `locales/` | Translations |

## Safety rules

- **Nothing in this repo touches the live store.** Pushing here doesn't change freaksofnature.com.
- **Never publish a theme connected to this repo** in Shopify. Use preview links only.
- The live theme keeps evolving. This snapshot will drift, so before porting a finished landing page back to production, compare against the current live theme.
- This repo is **public**. Don't commit API keys, passwords, or customer data.

## Previewing a build in Shopify

1. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
2. Pick this repo and the branch you're working on.
3. Shopify creates an **unpublished** theme that stays in sync with the branch. Use **Preview** to view it, or the theme editor to arrange sections.
4. To view a new landing page, create a page in **Online Store → Pages** and assign it your new template (only on the preview theme).

## Suggested workflow

1. Branch off `main` for each landing page idea (e.g. `lp/summer-sunstick`).
2. Build new sections as `sections/lp-*.liquid` with matching `assets/lp-*.css` so sandbox work is easy to tell apart from existing theme code.
3. Preview through the GitHub-connected unpublished theme.
4. When approved, hand the new section and template files to whoever manages the live theme to port over.

## Landing pages built here

### Mini Deo Set landing page (for cold Meta traffic)

A Bev-style, offer-led page for the Mini Deodorant Holiday Gift Set: offer up top, why the deodorant works, the four scents, real reviews, a short FAQ and one buy box.

**How to see it.** It is an alternate product template, so it opens on the product's own URL with `?view=mini-deo-lp` added:

```
/products/mini-deodorant-holiday-gift-set?view=mini-deo-lp
```

In the theme editor, pick **Products → mini-deo-lp** in the template menu at the top, then choose the Mini Deodorant Holiday Gift Set as the preview product.

**Do not assign this template to the product in Shopify admin.** A product's template is a store-wide setting, not a theme setting. The live theme doesn't have this template, so the live product page would change. Use the `?view=` link instead.

**Files**

| File | What it is |
|---|---|
| `templates/product.mini-deo-lp.json` | The page: section order and all copy, images and settings |
| `sections/lp-header.liquid` | Logo and one offer button. Hides the store menu, announcement bar and full footer on this page only |
| `sections/lp-hero.liquid` | Headline, product shot, round badge, benefits, price and button |
| `sections/lp-why.liquid` | Where odor comes from and the three ingredients that stop it |
| `sections/lp-scents.liquid` | Four scent cards in week order |
| `sections/lp-reviews.liquid` | Quoted customer reviews |
| `sections/lp-faq.liquid` | Short FAQ |
| `sections/lp-buy-box.liquid` | The one buy box: price, contents, quantity, Add to cart |
| `sections/lp-footer.liquid` | Slim footer and the buy bar that stays on screen on phones |
| `snippets/lp-*.liquid` | Logo, icons, stars, button and product line-up used by the sections |
| `assets/lp-mini-deo.css` | All styles. Every class starts with `lp-`, so nothing else in the theme is affected |

**How it plugs into the theme**

- Price, stock and Add to cart come from the product itself. Type `{price}` in a headline or button setting to show the live price.
- Add to cart is a standard `/cart/add` form. The theme's existing cart script picks it up and opens the side cart, so the usual add-to-cart tracking fires. No new apps or outside scripts.
- The header and footer are hidden with CSS, not removed, so pixels, the cart drawer and app scripts load exactly as on other pages.
- The "selling fast" line in the buy box follows the product page's rule: it shows only when tracked stock is at or below the threshold in the section settings.
- Star ratings are read live from the Everyday Endurance Deodorant's Junip reviews.

**Rules for edits**

- Claims: only say what the live product page says.
- Reviews: copy them from Junip word for word, signed with first name and last initial. Deodorant reviews only.
- Images: nothing that shows the crate.

**Check before ads point at it**

1. Every image on the page, on a phone: no crate anywhere.
2. Headline, price and button visible on a phone without scrolling.
3. Tap Add to cart: the set is in the cart at the right price and the side cart opens.
4. With Meta Pixel Helper on: page view and product view on load, add to cart on tap.
5. The holiday delivery line and FAQ answer still hold. Add the real shipping cutoff date when you have it.
