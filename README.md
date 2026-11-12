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

Three landing pages for the four-mini deodorant set, all for cold Meta traffic. Each is an alternate product template, so it opens on the product's own URL with `?view=` added.

| Page | Add to the product URL | The idea |
|---|---|---|
| Offer page | `?view=mini-deo-lp` | Bev-style. Leads with the offer: all four scents for one price. Uses holiday gift set wording |
| Variety pack | `?view=mini-deo-lp-pack` | Sold like a snack variety pack: price per mini, what's in the pack, a "Deodorant Facts" label, one pack or two |
| Find your scent | `?view=mini-deo-lp-sampler` | Sold like a discovery set: one large chapter per scent, one a week, find your favorite |

The variety pack and sampler pages have no gift or holiday wording.

**How to see one.** For example:

```
/products/mini-deodorant-holiday-gift-set?view=mini-deo-lp-pack
```

In the theme editor, pick **Products** in the template menu at the top, choose the template, then choose the mini set as the preview product.

**Do not assign these templates to the product in Shopify admin.** A product's template is a store-wide setting, not a theme setting. The live theme doesn't have these templates, so the live product page would change. Use the `?view=` link instead.

**The product's name.** The pages never print the product's name, but the cart, checkout and browser tab do. Until there is a listing that isn't called a holiday gift set, shoppers will see that name once they add to cart. The templates work on any product, so a new listing only needs the same `?view=` link.

### Files

Each page is one template file that holds the section order and all copy, images and settings:

- `templates/product.mini-deo-lp.json`
- `templates/product.mini-deo-lp-pack.json`
- `templates/product.mini-deo-lp-sampler.json`

Shared by all three pages:

| File | What it is |
|---|---|
| `sections/lp-header.liquid` | Logo and one offer button. Hides the store menu, announcement bar and full footer on that page only |
| `sections/lp-reviews.liquid` | Quoted customer reviews. Background and card style are settings |
| `sections/lp-faq.liquid` | Short FAQ |
| `sections/lp-buy-box.liquid` | The one buy box: price, contents, quantity, Add to cart. Quantity can be plus and minus buttons or a one-or-two picker |
| `sections/lp-footer.liquid` | Slim footer and the buy bar that stays on screen on phones |
| `sections/lp-why.liquid` | Where odor comes from and the three ingredients that stop it (offer page and sampler) |
| `snippets/lp-*.liquid` | Logo, icons, stars, button, chips and the product line-up |
| `assets/lp-mini-deo.css` | Shared styles. Every class starts with `lp-`, so nothing else in the theme is affected |

Only on one page:

| Page | Sections | Styles |
|---|---|---|
| Offer page | `lp-hero`, `lp-scents` | in `lp-mini-deo.css` |
| Variety pack | `lp-pack-hero`, `lp-pack-inside`, `lp-facts` | `assets/lp-pack.css` |
| Find your scent | `lp-sampler-hero`, `lp-sampler-scents` | `assets/lp-sampler.css` |

### How they plug into the theme

- Price, stock and Add to cart come from the product itself. Type `{price}` in a headline or button setting to show the live price. On the variety pack hero, `{unit_price}` shows the price divided by the number of items in the pack.
- Add to cart is a standard `/cart/add` form. The theme's existing cart script picks it up and opens the side cart, so the usual add-to-cart tracking fires. No new apps or outside scripts.
- The header and footer are hidden with CSS, not removed, so pixels, the cart drawer and app scripts load exactly as on other pages.
- The "selling fast" line in the buy box follows the product page's rule: it shows only when tracked stock is at or below the threshold in the section settings.
- Star ratings are read live from the Everyday Endurance Deodorant's Junip reviews.
- Product pictures on the variety pack and sampler pages are the single-stick cut-outs from the product page's "Meet the scents" section.

### Rules for edits

- Claims: only say what the live product page says.
- Reviews: copy them from Junip word for word, signed with first name and last initial. Deodorant reviews only.
- Images: nothing that shows the crate.
- Small text is never Sun Ray: it is too faint on Cloud and on Cobalt.

### Check before ads point at a page

1. Every image on the page, on a phone: no crate anywhere.
2. Headline, price and button visible on a phone without scrolling.
3. Tap Add to cart: the set is in the cart at the right price and quantity, and the side cart opens.
4. With Meta Pixel Helper on: page view and product view on load, add to cart on tap.
5. Offer page only: the holiday delivery line and FAQ answer still hold. Add the real shipping cutoff date when you have it.

### Pages these were modelled on

Found by search; the pages themselves could not be opened from the build environment.

- Offer page: the Bev landing page supplied as the example.
- Variety pack: protein bar and drink variety packs, such as David Protein's Variety Pack, Barebells' Variety Pack and LMNT's sample pack. Common pieces: one of each flavor, price per item, a path from one pack to more.
- Find your scent: mini deodorant and fragrance discovery sets, such as Salt & Stone's Mini Deodorant Discovery Set, Each & Every's Want It All Kit, Alleyoop's Mini Deo Discovery Set and Huron's Best Smellers Set. Common pieces: try every scent, then pick a favorite.
