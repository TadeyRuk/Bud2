# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a UI prototype project for **Bud** — a lost pet tracker app. It contains four HTML screen mockups and a design system document, generated as a "Stitch" output (a tool that produces self-contained HTML screens from design specs).

## Structure

```
stitch_lost_pet_tracker_map/
  clay_compass/DESIGN.md          — Design system specification ("The Grounded Guardian")
  map_view_bud/code.html          — Main map screen showing sightings
  pet_details_bud/code.html       — Individual pet profile/detail screen
  community_board_bud/code.html   — Community feed of lost/found reports
  report_lost_pet_bud/code.html   — Form to report a missing pet
```

Each `code.html` is a fully self-contained screen with inline Tailwind config, Google Fonts, and Material Symbols. No build step — open directly in a browser.

## Design System: "The Grounded Guardian"

All screens implement the **Organic Brutalism** aesthetic defined in `clay_compass/DESIGN.md`. Key rules when editing or creating screens:

**Colors (Tailwind custom tokens — defined inline in each file's `tailwind.config`):**
- `primary`: `#873415` (terracotta) — main CTAs only
- `surface`: `#fcf9f5` — main canvas
- `surface-container-low`: `#f6f3ef` — section backgrounds
- `surface-container-lowest`: `#ffffff` — lifted cards
- `surface-container-highest`: `#e5e2de` — input wells
- `tertiary`: `#005763` — links (never blue)
- `tertiary-container`: `#007180` — "Safe" status chips
- `on-surface`: `#1c1c19` — all text (never pure black)

**Typography:**
- Headlines/Display: `Manrope` (bold, tight letter-spacing)
- Body/Labels: `Work Sans`

**Hard rules (violations break the design language):**
- No `1px solid` borders for sectioning — use background color shifts only
- No dividers between list items — use 16–24px vertical whitespace instead
- No standard blue links — use `tertiary` (#005763)
- No pure black — use `on-surface` (#1c1c19)
- Borders on photos/accessibility fallback only: use `outline-variant` at 20% opacity

**Elevation:** Tonal layering only. White cards (`surface-container-lowest`) on off-white backgrounds (`surface-container-low`) create depth. Floating elements (FAB): shadow `0 8px 24px` with `on-surface` at 6% opacity.

**Components:**
- Buttons: `primary` background, `md` corner radius (0.75rem), no shadows
- Cards: `xl` corner radius (1.5rem) for pet profiles
- Inputs: `surface-container-highest` background, `sm` radius (0.25rem), label above
- Status chips: full pill radius (9999px)
- Nav bars/floating panels: `surface` at 80% opacity + `20px` backdrop blur (glassmorphism)

## Working with the HTML Files

Each screen embeds its full Tailwind config as an inline `<script id="tailwind-config">`. When adding new color tokens or screens, copy this config block from an existing screen — all four screens share the same token set.

To preview: open any `code.html` directly in a browser (no server needed).
