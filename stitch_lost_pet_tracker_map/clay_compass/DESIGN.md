```markdown
# Design System Document: The Grounded Guardian

## 1. Overview & Creative North Star

### The Creative North Star: "The Grounded Guardian"
This design system is built upon the concept of the **Grounded Guardian**. In the high-stakes, emotional context of a lost pet app, our UI must act as a steady, architectural foundation. We are moving away from the "floaty," generic tech aesthetic in favor of **Organic Brutalism**. This means the interface should feel like it is constructed from stone, clay, and earth—solid, reliable, and unshakeable.

We break the "template" look through **Intentional Asymmetry** and **Editorial Spacing**. Instead of perfectly centered grids, we utilize wide margins and offset headers to create a sense of bespoke craftsmanship. The goal is to make the user feel held by a system that is as permanent as a landmark and as warm as a hearth.

---

## 2. Colors & Surface Philosophy

The palette is rooted in the tactile world: `primary` (#873415) represents the baked terracotta of the earth, while the `surface` and `secondary` tones represent weathered stone and silt.

### The "No-Line" Rule
To maintain the "Grounded Guardian" aesthetic, **1px solid borders are strictly prohibited for sectioning.** We do not draw boxes; we carve spaces. Boundaries must be defined solely through background color shifts. 
*   **Example:** A `surface-container-low` section sitting directly on a `surface` background provides all the definition needed.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked slabs of stone. Use the `surface-container` tiers to define importance:
*   **Base:** `surface` (#fcf9f5) for the main canvas.
*   **Structural Sections:** `surface-container-low` (#f6f3ef) for large background blocks.
*   **Interactive Elements:** `surface-container-lowest` (#ffffff) for cards to create a "lifted" appearance without heavy shadows.
*   **Functional Overlays:** `surface-container-highest` (#e5e2de) for recessed elements like input wells.

### Tonal Micro-Transitions
While the user prompt specifies solid colors, as designers, we achieve "soul" through microscopic tonal shifts. For main CTAs or Hero sections, you may use a subtle transition between `primary` (#873415) and `primary_container` (#a64b2a). This is not a "digital gradient" but a simulation of natural light hitting a matte clay surface.

---

## 3. Typography: Editorial Authority

We use a high-contrast typography scale to convey both urgency and empathy.

*   **The Display Pair:** We utilize **Manrope** for all Display and Headline levels. Its geometric yet warm curves provide a modern "architectural" feel. Use `display-lg` (3.5rem) with tight letter-spacing for emotional impact (e.g., a pet's name).
*   **The Utility Pair:** **Work Sans** is our workhorse for Body and Labels. Its high readability at small sizes ensures that critical information—like a last-seen location—is never missed.
*   **Hierarchy Tip:** Always pair a `headline-sm` in `on_surface` with a `label-md` in `on_surface_variant` to create a sophisticated, multi-layered information density that feels like a premium broadsheet.

---

## 4. Elevation & Depth

We eschew traditional shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f6f3ef) background. The delta in hex value creates a soft, natural lift that mimics paper on stone.
*   **Ambient Shadows:** If an element must float (e.g., a "Report Found Pet" FAB), use an extra-diffused shadow. 
    *   *Spec:* Offset: 0, 8px | Blur: 24px | Color: `on_surface` at 6% opacity. This mimics ambient light rather than a harsh artificial lamp.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., on a high-contrast photo), use `outline-variant` (#dcc1b8) at 20% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** For top navigation bars or floating action panels, use `surface` at 80% opacity with a `20px` backdrop blur. This allows the earthy colors of the content to bleed through, softening the interface.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (#873415) with `on_primary` text. Use `md` (0.75rem) corner radius. No shadows; the weight of the color provides the "clickability."
*   **Secondary:** `secondary_container` (#e6e3d6) background with `on_secondary_fixed_variant` (#48473e) text. These should feel like stone buttons.

### Cards & Lists
*   **The No-Divider Rule:** Explicitly forbid 1px dividers between list items. Instead, use 16px or 24px of vertical whitespace (`Spacing Scale`) or alternating subtle shifts between `surface-container-low` and `surface-container-high`.
*   **The "Guardian" Card:** Use `xl` (1.5rem) corner radius for pet profiles to make them feel friendly, but keep the internal content layout strictly aligned to a 4px grid for precision.

### Input Fields
*   **The "Well" Aesthetic:** Fields should be styled as recessed wells using `surface-container-highest` (#e5e2de) with a `sm` (0.25rem) corner radius. The label should live in `label-md` just above the well.

### Signature Component: The "Status Stone"
For a pet's status (e.g., "Safe," "Searching"), use a large, pill-shaped `Chip` using `full` (9999px) roundedness. Use `tertiary_container` (#007180) for "Safe" status to provide a calming, cool-toned contrast to the warm terracotta theme.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Padding:** Allow for more breathing room on the left side of headlines to create an editorial, high-end feel.
*   **Lean into the Terracotta:** Use `primary` for the most important actions. It is our "signal" color.
*   **Nesting:** Put white cards on off-white backgrounds. It creates depth without clutter.

### Don't:
*   **Don't use pure black:** Use `on_surface` (#1c1c19) for all text to keep the look organic.
*   **Don't use 1px lines:** If you feel the need for a line, try using an 8px color block or a background shift instead.
*   **Don't use standard "Blue" for links:** Use `tertiary` (#005763). It fits the "stone and water" palette of this design system.
*   **Don't overcrowd:** The "Grounded Guardian" needs room to breathe. If a screen feels busy, increase the spacing by one tier in the scale.