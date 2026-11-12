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
